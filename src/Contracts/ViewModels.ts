import * as DataModels from "./DataModels";
import * as monaco from "monaco-editor";
import DocumentClientUtilityBase from "../Common/DocumentClientUtilityBase";
import Q from "q";
import { AccessibleVerticalList } from "../Explorer/Tree/AccessibleVerticalList";
import { CassandraTableKey, CassandraTableKeys } from "../Explorer/Tables/TableDataClient";
import { CommandButtonComponentProps } from "../Explorer/Controls/CommandButton/CommandButtonComponent";
import { ConsoleData } from "../Explorer/Menus/NotificationConsole/NotificationConsoleComponent";
import { GitHubClient } from "../GitHub/GitHubClient";
import { JunoClient, IGalleryItem } from "../Juno/JunoClient";
import { NotebookContentItem } from "../Explorer/Notebook/NotebookContentItem";
import { QueryMetrics } from "@azure/cosmos";
import { UploadDetails } from "../workers/upload/definitions";
import Explorer from "../Explorer/Explorer";
import UserDefinedFunction from "../Explorer/Tree/UserDefinedFunction";
import StoredProcedure from "../Explorer/Tree/StoredProcedure";
import ConflictsTab from "../Explorer/Tabs/ConflictsTab";
import Trigger from "../Explorer/Tree/Trigger";

export interface ExplorerOptions {
  documentClientUtility: DocumentClientUtilityBase;
  notificationsClient: NotificationsClient;
  isEmulator: boolean;
}

export interface Capability extends DataModels.Capability {}

export interface ConfigurationOverrides extends DataModels.ConfigurationOverrides {}

export interface NavbarButtonConfig extends CommandButtonComponentProps {}

export interface DatabaseAccount extends DataModels.DatabaseAccount {}

export interface KernelConnectionMetadata {
  name: string;
  configurationEndpoints: DataModels.NotebookConfigurationEndpoints;
  notebookConnectionInfo: DataModels.NotebookWorkspaceConnectionInfo;
}

export interface TokenProvider {
  getAuthHeader(): Promise<Headers>;
}

export interface QueryResultsMetadata {
  hasMoreResults: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
  itemCount: number;
}

export interface QueryResults extends QueryResultsMetadata {
  documents: any[];
  activityId: string;
  requestCharge: number;
  roundTrips?: number;
  headers?: any;
  queryMetrics?: QueryMetrics;
}

export interface Button {
  visible: ko.Computed<boolean>;
  enabled: ko.Computed<boolean>;
  isSelected?: ko.Computed<boolean>;
}

export interface NotificationConsole {
  filteredConsoleData: ko.ObservableArray<ConsoleData>;
  isConsoleExpanded: ko.Observable<boolean>;

  expandConsole(source: any, evt: MouseEvent): void;
  collapseConsole(source: any, evt: MouseEvent): void;
}

export interface WaitsForTemplate {
  isTemplateReady: ko.Observable<boolean>;
}

export interface AdHocAccessData {
  readWriteUrl: string;
  readUrl: string;
}

export interface TreeNode {
  nodeKind: string;
  rid: string;
  id: ko.Observable<string>;
  database?: Database;
  collection?: Collection;

  onNewQueryClick?(source: any, event: MouseEvent): void;
  onNewStoredProcedureClick?(source: Collection, event: MouseEvent): void;
  onNewUserDefinedFunctionClick?(source: Collection, event: MouseEvent): void;
  onNewTriggerClick?(source: Collection, event: MouseEvent): void;
}

export interface Database extends TreeNode {
  container: Explorer;
  self: string;
  id: ko.Observable<string>;
  collections: ko.ObservableArray<Collection>;
  offer: ko.Observable<DataModels.Offer>;
  isDatabaseExpanded: ko.Observable<boolean>;
  isDatabaseShared: ko.Computed<boolean>;

  selectedSubnodeKind: ko.Observable<CollectionTabKind>;

  selectDatabase(): void;
  expandDatabase(): void;
  collapseDatabase(): void;

  loadCollections(): Q.Promise<void>;
  findCollectionWithId(collectionRid: string): Collection;
  openAddCollection(database: Database, event: MouseEvent): void;
  onDeleteDatabaseContextMenuClick(source: Database, event: MouseEvent | KeyboardEvent): void;
  readSettings(): void;
  onSettingsClick: () => void;
}

export interface CollectionBase extends TreeNode {
  container: Explorer;
  databaseId: string;
  self: string;
  rawDataModel: DataModels.Collection;
  partitionKey: DataModels.PartitionKey;
  partitionKeyProperty: string;
  partitionKeyPropertyHeader: string;
  id: ko.Observable<string>;
  selectedSubnodeKind: ko.Observable<CollectionTabKind>;
  children: ko.ObservableArray<TreeNode>;
  isCollectionExpanded: ko.Observable<boolean>;

  onDocumentDBDocumentsClick(): void;
  onNewQueryClick(source: any, event: MouseEvent, queryText?: string): void;
  expandCollection(): Q.Promise<any>;
  collapseCollection(): void;
  getDatabase(): Database;
}

export interface Collection extends CollectionBase {
  defaultTtl: ko.Observable<number>;
  analyticalStorageTtl: ko.Observable<number>;
  indexingPolicy: ko.Observable<DataModels.IndexingPolicy>;
  uniqueKeyPolicy: DataModels.UniqueKeyPolicy;
  quotaInfo: ko.Observable<DataModels.CollectionQuotaInfo>;
  offer: ko.Observable<DataModels.Offer>;
  conflictResolutionPolicy: ko.Observable<DataModels.ConflictResolutionPolicy>;
  changeFeedPolicy: ko.Observable<DataModels.ChangeFeedPolicy>;
  geospatialConfig: ko.Observable<DataModels.GeospatialConfig>;
  documentIds: ko.ObservableArray<DocumentId>;

  cassandraKeys: CassandraTableKeys;
  cassandraSchema: CassandraTableKey[];

  onConflictsClick(): void;
  onTableEntitiesClick(): void;
  onGraphDocumentsClick(): void;
  onMongoDBDocumentsClick(): void;
  openTab(): void;

  onSettingsClick: () => void;
  readSettings(): Q.Promise<void>;
  onDeleteCollectionContextMenuClick(source: Collection, event: MouseEvent): void;

  onNewGraphClick(): void;
  onNewMongoQueryClick(source: any, event: MouseEvent, queryText?: string): void;
  onNewMongoShellClick(): void;
  onNewStoredProcedureClick(source: Collection, event: MouseEvent): void;
  onNewUserDefinedFunctionClick(source: Collection, event: MouseEvent): void;
  onNewTriggerClick(source: Collection, event: MouseEvent): void;
  storedProcedures: ko.Computed<StoredProcedure[]>;
  userDefinedFunctions: ko.Computed<UserDefinedFunction[]>;
  triggers: ko.Computed<Trigger[]>;

  isStoredProceduresExpanded: ko.Observable<boolean>;
  isTriggersExpanded: ko.Observable<boolean>;
  isUserDefinedFunctionsExpanded: ko.Observable<boolean>;

  expandStoredProcedures(): void;
  expandUserDefinedFunctions(): void;
  expandTriggers(): void;

  collapseStoredProcedures(): void;
  collapseUserDefinedFunctions(): void;
  collapseTriggers(): void;

  loadUserDefinedFunctions(): Q.Promise<any>;
  loadStoredProcedures(): Q.Promise<any>;
  loadTriggers(): Q.Promise<any>;

  createStoredProcedureNode(data: DataModels.StoredProcedure): StoredProcedure;
  createUserDefinedFunctionNode(data: DataModels.UserDefinedFunction): UserDefinedFunction;
  createTriggerNode(data: DataModels.Trigger): Trigger;
  findStoredProcedureWithId(sprocRid: string): StoredProcedure;
  findTriggerWithId(triggerRid: string): Trigger;
  findUserDefinedFunctionWithId(udfRid: string): UserDefinedFunction;

  onDragOver(source: Collection, event: { originalEvent: DragEvent }): void;
  onDrop(source: Collection, event: { originalEvent: DragEvent }): void;
  uploadFiles(fileList: FileList): Q.Promise<UploadDetails>;

  getLabel(): string;
}

export interface DocumentId {
  container: DocumentsTab;
  rid: string;
  self: string;
  ts: string;
  partitionKeyValue: any;
  partitionKeyProperty: string;
  partitionKey: DataModels.PartitionKey;
  stringPartitionKeyValue: string;
  id: ko.Observable<string>;

  isDirty: ko.Observable<boolean>;
  click(): void;
  getPartitionKeyValueAsString(): string;
  loadDocument(): Q.Promise<any>;
  partitionKeyHeader(): Object;
}

export interface ConflictId {
  container: ConflictsTab;
  rid: string;
  self: string;
  ts: string;
  partitionKeyValue: any;
  partitionKeyProperty: string;
  partitionKey: DataModels.PartitionKey;
  stringPartitionKeyValue: string;
  id: ko.Observable<string>;
  operationType: string;
  resourceId: string;
  resourceType: string;

  isDirty: ko.Observable<boolean>;
  click(): void;
  buildDocumentIdFromConflict(partitionKeyValue: any): DocumentId;
  getPartitionKeyValueAsString(): string;
  loadConflict(): Q.Promise<any>;
}

/**
 * Options used to initialize pane
 */
export interface PaneOptions {
  id: string;
  documentClientUtility: DocumentClientUtilityBase;
  visible: ko.Observable<boolean>;
  container?: Explorer;
}

export interface ContextualPane {
  documentClientUtility: DocumentClientUtilityBase;
  formErrors: ko.Observable<string>;
  formErrorsDetails: ko.Observable<string>;
  id: string;
  title: ko.Observable<string>;
  visible: ko.Observable<boolean>;
  firstFieldHasFocus: ko.Observable<boolean>;
  isExecuting: ko.Observable<boolean>;

  submit: () => void;
  cancel: () => void;
  open: () => void;
  close: () => void;
  resetData: () => void;
  showErrorDetails: () => void;
  onCloseKeyPress(source: any, event: KeyboardEvent): void;
  onPaneKeyDown(source: any, event: KeyboardEvent): boolean;
}

export interface GitHubReposPaneOptions extends PaneOptions {
  gitHubClient: GitHubClient;
  junoClient: JunoClient;
}

export interface PublishNotebookPaneOptions extends PaneOptions {
  junoClient: JunoClient;
}

export interface PublishNotebookPaneOpenOptions {
  name: string;
  author: string;
  content: string;
}

export interface AddCollectionPaneOptions extends PaneOptions {
  isPreferredApiTable: ko.Computed<boolean>;
  databaseId?: string;
  databaseSelfLink?: string;
}

export interface UploadFilePaneOpenOptions {
  paneTitle: string;
  selectFileInputLabel: string;
  errorMessage: string; // Could not upload notebook
  inProgressMessage: string; // Uploading notebook
  successMessage: string; // Successfully uploaded notebook
  onSubmit: (file: File) => Promise<any>;
  extensions?: string; // input accept field. E.g: .ipynb
  submitButtonLabel?: string;
}

export interface StringInputPaneOpenOptions {
  paneTitle: string;
  inputLabel: string;
  errorMessage: string;
  inProgressMessage: string;
  successMessage: string;
  onSubmit: (input: string) => Promise<any>;
  submitButtonLabel: string;
  defaultInput?: string;
}

/**
 * Graph configuration
 */
export enum NeighborType {
  SOURCES_ONLY,
  TARGETS_ONLY,
  BOTH
}

/**
 * Set of observable related to graph configuration by user
 */
export interface GraphConfigUiData {
  showNeighborType: ko.Observable<NeighborType>;
  nodeProperties: ko.ObservableArray<string>;
  nodePropertiesWithNone: ko.ObservableArray<string>;
  nodeCaptionChoice: ko.Observable<string>;
  nodeColorKeyChoice: ko.Observable<string>;
  nodeIconChoice: ko.Observable<string>;
  nodeIconSet: ko.Observable<string>;
}

/**
 * User input for creating new vertex
 */
export interface NewVertexData {
  label: string;
  properties: InputProperty[];
}

export type GremlinPropertyValueType = string | boolean | number | null | undefined;
export type InputPropertyValueTypeString = "string" | "number" | "boolean" | "null";
export interface InputPropertyValue {
  value: GremlinPropertyValueType;
  type: InputPropertyValueTypeString;
}
/**
 * Property input by user
 */
export interface InputProperty {
  key: string;
  values: InputPropertyValue[];
}

export interface Editable<T> extends ko.Observable<T> {
  setBaseline(baseline: T): void;

  editableIsDirty: ko.Computed<boolean>;
  editableIsValid: ko.Observable<boolean>;
  getEditableCurrentValue?: ko.Computed<T>;
  getEditableOriginalValue?: ko.Computed<T>;
  edits?: ko.ObservableArray<T>;
  validations?: ko.ObservableArray<(value: T) => boolean>;
}

export interface QueryError {
  message: string;
  start: string;
  end: string;
  code: string;
  severity: string;
}

export interface DocumentRequestContainer {
  self: string;
  rid?: string;
  resourceName?: string;
}

export interface NotificationsClient {
  fetchNotifications(): Q.Promise<DataModels.Notification[]>;
  setExtensionEndpoint(extensionEndpoint: string): void;
}

export interface QueriesClient {
  setupQueriesCollection(): Promise<DataModels.Collection>;
  saveQuery(query: DataModels.Query): Promise<void>;
  getQueries(): Promise<DataModels.Query[]>;
  deleteQuery(query: DataModels.Query): Promise<void>;
  getResourceId(): string;
}

export interface DocumentClientOption {
  endpoint?: string;
  masterKey?: string;
  requestTimeoutMs?: number;
}

// Tab options
export interface TabOptions {
  tabKind: CollectionTabKind;
  title: string;
  tabPath: string;
  documentClientUtility: DocumentClientUtilityBase;
  selfLink: string;
  isActive: ko.Observable<boolean>;
  hashLocation: string;
  onUpdateTabsButtons: (buttons: NavbarButtonConfig[]) => void;
  isTabsContentExpanded?: ko.Observable<boolean>;
  onLoadStartKey?: number;

  // TODO Remove the flag and use a context to handle this
  // TODO: 145357 Remove dependency on collection/database and add abstraction
  collection?: CollectionBase;
  database?: Database;
  rid?: string;
  node?: TreeNode;
  theme?: string;
}

export interface SparkMasterTabOptions extends TabOptions {
  clusterConnectionInfo: DataModels.SparkClusterConnectionInfo;
  container: Explorer;
}

export interface GraphTabOptions extends TabOptions {
  account: DatabaseAccount;
  masterKey: string;
  collectionId: string;
  databaseId: string;
  collectionPartitionKeyProperty: string;
}

export interface NotebookTabOptions extends TabOptions {
  account: DatabaseAccount;
  masterKey: string;
  container: Explorer;
  notebookContentItem: NotebookContentItem;
}

export interface TerminalTabOptions extends TabOptions {
  account: DatabaseAccount;
  container: Explorer;
  kind: TerminalKind;
}

export interface GalleryTabOptions extends TabOptions {
  account: DatabaseAccount;
  container: Explorer;
  junoClient: JunoClient;
  notebookUrl?: string;
  galleryItem?: IGalleryItem;
  isFavorite?: boolean;
}

export interface NotebookViewerTabOptions extends TabOptions {
  account: DatabaseAccount;
  container: Explorer;
  notebookUrl: string;
}

export interface DocumentsTabOptions extends TabOptions {
  partitionKey: DataModels.PartitionKey;
  documentIds: ko.ObservableArray<DocumentId>;
  container?: Explorer;
  isPreferredApiMongoDB?: boolean;
  resourceTokenPartitionKey?: string;
}

export interface ConflictsTabOptions extends TabOptions {
  partitionKey: DataModels.PartitionKey;
  conflictIds: ko.ObservableArray<ConflictId>;
  container?: Explorer;
}

export interface QueryTabOptions extends TabOptions {
  partitionKey?: DataModels.PartitionKey;
  queryText?: string;
  resourceTokenPartitionKey?: string;
}

export interface ScriptTabOption extends TabOptions {
  resource: any;
  isNew: boolean;
  collectionSelfLink?: string;
  partitionKey?: DataModels.PartitionKey;
}

// Tabs
export interface Tab {
  documentClientUtility: DocumentClientUtilityBase;
  node: TreeNode; // Can be null
  collection: CollectionBase;
  rid: string;

  tabKind: CollectionTabKind;
  tabId: string;
  isActive: ko.Observable<boolean>;
  isMouseOver: ko.Observable<boolean>;
  tabPath: ko.Observable<string>;
  tabTitle: ko.Observable<string>;
  hashLocation: ko.Observable<string>;
  closeTabButton: Button;
  onCloseTabButtonClick(): void;
  onTabClick(): Q.Promise<any>;
  onKeyPressActivate(source: any, event: KeyboardEvent): void;
  onKeyPressClose(source: any, event: KeyboardEvent): void;
  onActivate(): Q.Promise<any>;
  refresh(): void;
  closeButtonTabIndex: ko.Computed<number>;
  isExecutionError: ko.Observable<boolean>;
  isExecuting: ko.Observable<boolean>;
}

export interface DocumentsTab extends Tab {
  /* Documents Grid  */
  selectDocument(documentId: DocumentId): Q.Promise<any>;
  selectedDocumentId: ko.Observable<DocumentId>;
  selectedDocumentContent: Editable<any>;
  onDocumentIdClick(documentId: DocumentId): Q.Promise<any>;
  dataContentsGridScrollHeight: ko.Observable<string>;
  accessibleDocumentList: AccessibleVerticalList;
  documentContentsGridId: string;

  partitionKey: DataModels.PartitionKey;
  idHeader: string;
  partitionKeyPropertyHeader: string;
  partitionKeyProperty: string;
  documentIds: ko.ObservableArray<DocumentId>;

  /* Documents Filter */
  filterContent: ko.Observable<string>;
  appliedFilter: ko.Observable<string>;
  lastFilterContents: ko.ObservableArray<string>;
  isFilterExpanded: ko.Observable<boolean>;
  applyFilterButton: Button;
  onShowFilterClick(): Q.Promise<any>;
  onHideFilterClick(): Q.Promise<any>;
  onApplyFilterClick(): Q.Promise<any>;

  /* Document Editor */
  isEditorDirty: ko.Computed<boolean>;
  editorState: ko.Observable<DocumentExplorerState>;
  onValidDocumentEdit(content: any): Q.Promise<any>;
  onInvalidDocumentEdit(content: any): Q.Promise<any>;

  onNewDocumentClick(): Q.Promise<any>;
  onSaveNewDocumentClick(): Q.Promise<any>;
  onRevertNewDocumentClick(): Q.Promise<any>;
  onSaveExisitingDocumentClick(): Q.Promise<any>;
  onRevertExisitingDocumentClick(): Q.Promise<any>;
  onDeleteExisitingDocumentClick(): Q.Promise<any>;

  /* Errors */
  displayedError: ko.Observable<string>;

  initDocumentEditor(documentId: DocumentId, content: any): Q.Promise<any>;
  loadNextPage(): Q.Promise<any>;
}

export interface WaitsForTemplate {
  isTemplateReady: ko.Observable<boolean>;
}

export interface QueryTab extends Tab {
  queryEditorId: string;
  isQueryMetricsEnabled: ko.Computed<boolean>;
  activityId: ko.Observable<string>;

  /* Command Bar */
  executeQueryButton: Button;
  fetchNextPageButton: Button;
  saveQueryButton: Button;
  onExecuteQueryClick(): Q.Promise<any>;
  onFetchNextPageClick(): Q.Promise<any>;

  /*Query Editor*/
  initialEditorContent: ko.Observable<string>;
  sqlQueryEditorContent: ko.Observable<string>;
  sqlStatementToExecute: ko.Observable<string>;

  /* Results */
  allResultsMetadata: ko.ObservableArray<QueryResultsMetadata>;

  /* Errors */
  errors: ko.ObservableArray<QueryError>;

  /* Status  */
  statusMessge: ko.Observable<string>;
  statusIcon: ko.Observable<string>;
}

export interface ScriptTab extends Tab {
  id: Editable<string>;
  editorId: string;

  saveButton: Button;
  updateButton: Button;
  discardButton: Button;
  deleteButton: Button;

  editorState: ko.Observable<ScriptEditorState>;
  editorContent: ko.Observable<string>;
  editor: ko.Observable<monaco.editor.IStandaloneCodeEditor>;

  errors: ko.ObservableArray<QueryError>;
  statusMessge: ko.Observable<string>;
  statusIcon: ko.Observable<string>;

  formFields: ko.ObservableArray<Editable<any>>;
  formIsValid: ko.Computed<boolean>;
  formIsDirty: ko.Computed<boolean>;

  isNew: ko.Observable<boolean>;
  resource: ko.Observable<DataModels.Resource>;

  setBaselines(): void;
}

export interface StoredProcedureTab extends ScriptTab {
  onExecuteSprocsResult(result: any, logsData: any): void;
  onExecuteSprocsError(error: string): void;
}

export interface UserDefinedFunctionTab extends ScriptTab {}

export interface TriggerTab extends ScriptTab {
  triggerType: Editable<string>;
  triggerOperation: Editable<string>;
}

export interface GraphTab extends Tab {}
export interface EditorPosition {
  line: number;
  column: number;
}

export interface MongoShellTab extends Tab {}

export enum DocumentExplorerState {
  noDocumentSelected,
  newDocumentValid,
  newDocumentInvalid,
  exisitingDocumentNoEdits,
  exisitingDocumentDirtyValid,
  exisitingDocumentDirtyInvalid
}

export enum IndexingPolicyEditorState {
  noCollectionSelected,
  noEdits,
  dirtyValid,
  dirtyInvalid
}

export enum ScriptEditorState {
  newInvalid,
  newValid,
  exisitingNoEdits,
  exisitingDirtyValid,
  exisitingDirtyInvalid
}

export enum CollectionTabKind {
  Documents = 0,
  Settings = 1,
  StoredProcedures = 2,
  UserDefinedFunctions = 3,
  Triggers = 4,
  Query = 5,
  Graph = 6,
  QueryTables = 9,
  MongoShell = 10,
  DatabaseSettings = 11,
  Conflicts = 12,
  Notebook = 13 /* Deprecated */,
  Terminal = 14,
  NotebookV2 = 15,
  SparkMasterTab = 16,
  Gallery = 17,
  NotebookViewer = 18
}

export enum TerminalKind {
  Default = 0,
  Mongo = 1,
  Cassandra = 2
}

export interface DataExplorerInputsFrame {
  databaseAccount: any;
  subscriptionId: string;
  resourceGroup: string;
  masterKey: string;
  hasWriteAccess: boolean;
  authorizationToken: string;
  features: any;
  csmEndpoint: string;
  dnsSuffix: string;
  serverId: string;
  extensionEndpoint: string;
  subscriptionType: SubscriptionType;
  quotaId: string;
  addCollectionDefaultFlight: string;
  isTryCosmosDBSubscription: boolean;
  loadDatabaseAccountTimestamp?: number;
  sharedThroughputMinimum?: number;
  sharedThroughputMaximum?: number;
  sharedThroughputDefault?: number;
  dataExplorerVersion?: string;
  isAuthWithresourceToken?: boolean;
  defaultCollectionThroughput?: CollectionCreationDefaults;
}

export interface CollectionCreationDefaults {
  storage: string;
  throughput: ThroughputDefaults;
}

export interface ThroughputDefaults {
  fixed: number;
  unlimited:
    | number
    | {
        collectionThreshold: number;
        lessThanOrEqualToThreshold: number;
        greatThanThreshold: number;
      };
  unlimitedmax: number;
  unlimitedmin: number;
  shared: number;
}

export enum SubscriptionType {
  Benefits,
  EA,
  Free,
  Internal,
  PAYG
}

export class MonacoEditorSettings {
  public readonly language: string;
  public readonly readOnly: boolean;

  constructor(supportedLanguage: string, isReadOnly: boolean) {
    this.language = supportedLanguage;
    this.readOnly = isReadOnly;
  }
}

export interface AuthorizationTokenHeaderMetadata {
  header: string;
  token: string;
}

export interface TelemetryActions {
  sendEvent(name: string, telemetryProperties?: { [propertyName: string]: string }): Q.Promise<any>;
  sendError(errorInfo: DataModels.ITelemetryError): Q.Promise<any>;
  sendMetric(
    name: string,
    metricNumber: number,
    telemetryProperties?: { [propertyName: string]: string }
  ): Q.Promise<any>;
}

export interface ConfigurationOverrides {
  EnableBsonSchema: string;
}

export interface CosmosDbApi {
  isSystemDatabasePredicate: (database: Database) => boolean;
}

export interface DropdownOption<T> {
  text: string;
  value: T;
  disable?: boolean;
}

export interface INotebookContainerClient {
  resetWorkspace: () => Promise<void>;
}

export interface INotebookContentClient {
  updateItemChildren: (item: NotebookContentItem) => Promise<void>;
  createNewNotebookFile: (parent: NotebookContentItem) => Promise<NotebookContentItem>;
  deleteContentItem: (item: NotebookContentItem) => Promise<void>;
  uploadFileAsync: (name: string, content: string, parent: NotebookContentItem) => Promise<NotebookContentItem>;
  renameNotebook: (item: NotebookContentItem, targetName: string) => Promise<NotebookContentItem>;
  createDirectory: (parent: NotebookContentItem, newDirectoryName: string) => Promise<NotebookContentItem>;
  readFileContent: (filePath: string) => Promise<string>;
}
