import * as ko from "knockout";
import * as sinon from "sinon";
import Q from "q";
import { Action, ActionModifiers } from "../../Shared/Telemetry/TelemetryConstants";
import * as DataModels from "../../Contracts/DataModels";
import * as ViewModels from "../../Contracts/ViewModels";
import DeleteDatabaseConfirmationPane from "./DeleteDatabaseConfirmationPane";
import DeleteFeedback from "../../Common/DeleteFeedback";
import DocumentClientUtilityBase from "../../Common/DocumentClientUtilityBase";
import Explorer from "../Explorer";
import TelemetryProcessor from "../../Shared/Telemetry/TelemetryProcessor";
import { TreeNode } from "../../Contracts/ViewModels";
import { TabsManager } from "../Tabs/TabsManager";

describe("Delete Database Confirmation Pane", () => {
  describe("Explorer.isLastDatabase() and Explorer.isLastNonEmptyDatabase()", () => {
    let explorer: Explorer;

    beforeEach(() => {
      explorer = new Explorer({ documentClientUtility: null, notificationsClient: null, isEmulator: false });
    });

    it("should be true if only 1 database", () => {
      let database = {} as ViewModels.Database;
      explorer.databases = ko.observableArray<ViewModels.Database>([database]);
      expect(explorer.isLastDatabase()).toBe(true);
    });

    it("should be false if only 2 databases", () => {
      let database = {} as ViewModels.Database;
      let database2 = {} as ViewModels.Database;
      explorer.databases = ko.observableArray<ViewModels.Database>([database, database2]);
      expect(explorer.isLastDatabase()).toBe(false);
    });

    it("should be false if not last empty database", () => {
      let database = {} as ViewModels.Database;
      explorer.databases = ko.observableArray<ViewModels.Database>([database]);
      expect(explorer.isLastNonEmptyDatabase()).toBe(false);
    });

    it("should be true if last non empty database", () => {
      let database = {} as ViewModels.Database;
      database.collections = ko.observableArray<ViewModels.Collection>([{} as ViewModels.Collection]);
      explorer.databases = ko.observableArray<ViewModels.Database>([database]);
      expect(explorer.isLastNonEmptyDatabase()).toBe(true);
    });
  });

  describe("shouldRecordFeedback()", () => {
    it("should return true if last non empty database or is last database that has shared throughput, else false", () => {
      let fakeDocumentClientUtility = {} as DocumentClientUtilityBase;
      let fakeExplorer = {} as Explorer;
      fakeExplorer.isNotificationConsoleExpanded = ko.observable<boolean>(false);

      let pane = new DeleteDatabaseConfirmationPane({
        documentClientUtility: fakeDocumentClientUtility as any,
        id: "deletedatabaseconfirmationpane",
        visible: ko.observable<boolean>(false),
        container: fakeExplorer as any
      });

      fakeExplorer.isLastNonEmptyDatabase = () => true;
      pane.container = fakeExplorer as any;
      expect(pane.shouldRecordFeedback()).toBe(true);

      fakeExplorer.isLastDatabase = () => true;
      fakeExplorer.isSelectedDatabaseShared = () => true;
      pane.container = fakeExplorer as any;
      expect(pane.shouldRecordFeedback()).toBe(true);

      fakeExplorer.isLastNonEmptyDatabase = () => false;
      fakeExplorer.isLastDatabase = () => true;
      fakeExplorer.isSelectedDatabaseShared = () => false;
      pane.container = fakeExplorer as any;
      expect(pane.shouldRecordFeedback()).toBe(false);
    });
  });

  describe("submit()", () => {
    let telemetryProcessorSpy: sinon.SinonSpy;

    beforeEach(() => {
      telemetryProcessorSpy = sinon.spy(TelemetryProcessor, "trace");
    });

    afterEach(() => {
      telemetryProcessorSpy.restore();
    });

    it("on submit() it should log feedback if last non empty database or is last database that has shared throughput", () => {
      let selectedDatabaseId = "testDB";
      let fakeDocumentClientUtility = {} as DocumentClientUtilityBase;
      fakeDocumentClientUtility.deleteDatabase = () => Q.resolve(null);
      let fakeExplorer = {} as Explorer;
      fakeExplorer.findSelectedDatabase = () => {
        return {
          id: ko.observable<string>(selectedDatabaseId),
          rid: "test",
          collections: ko.observableArray<ViewModels.Collection>()
        } as ViewModels.Database;
      };
      fakeExplorer.refreshAllDatabases = () => Q.resolve();
      fakeExplorer.isNotificationConsoleExpanded = ko.observable<boolean>(false);
      fakeExplorer.selectedDatabaseId = ko.computed<string>(() => selectedDatabaseId);
      fakeExplorer.isSelectedDatabaseShared = () => false;
      const SubscriptionId = "testId";
      const AccountName = "testAccount";
      fakeExplorer.databaseAccount = ko.observable<ViewModels.DatabaseAccount>({
        id: SubscriptionId,
        name: AccountName
      } as ViewModels.DatabaseAccount);
      fakeExplorer.defaultExperience = ko.observable<string>("DocumentDB");
      fakeExplorer.isPreferredApiCassandra = ko.computed(() => {
        return false;
      });
      fakeExplorer.documentClientUtility = fakeDocumentClientUtility;
      fakeExplorer.selectedNode = ko.observable<TreeNode>();
      fakeExplorer.tabsManager = new TabsManager();
      fakeExplorer.isLastNonEmptyDatabase = () => true;

      let pane = new DeleteDatabaseConfirmationPane({
        documentClientUtility: fakeDocumentClientUtility as any,
        id: "deletedatabaseconfirmationpane",
        visible: ko.observable<boolean>(false),
        container: fakeExplorer as any
      });
      pane.databaseIdConfirmation = ko.observable<string>(selectedDatabaseId);
      const Feedback = "my feedback";
      pane.databaseDeleteFeedback(Feedback);

      return pane.submit().then(() => {
        expect(telemetryProcessorSpy.called).toBe(true);
        let deleteFeedback = new DeleteFeedback(SubscriptionId, AccountName, DataModels.ApiKind.SQL, Feedback);
        expect(
          telemetryProcessorSpy.calledWith(
            Action.DeleteDatabase,
            ActionModifiers.Mark,
            JSON.stringify(deleteFeedback, Object.getOwnPropertyNames(deleteFeedback))
          )
        ).toBe(true);
      });
    });
  });
});
