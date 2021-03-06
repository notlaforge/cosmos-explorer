import * as ko from "knockout";
import * as ViewModels from "../../Contracts/ViewModels";
import TabsManagerTemplate from "./TabsManager.html";
import Explorer from "../Explorer";

export class TabsManager {
  public openedTabs: ko.ObservableArray<ViewModels.Tab>;
  public activeTab: ko.Observable<ViewModels.Tab>;

  constructor() {
    this.openedTabs = ko.observableArray<ViewModels.Tab>([]);
    this.activeTab = ko.observable<ViewModels.Tab>();
  }

  public activateNewTab(tab: ViewModels.Tab): void {
    this.openedTabs.push(tab);
    this.activateTab(tab);
  }

  public activateTab(tab: ViewModels.Tab): void {
    this.activeTab() && this.activeTab().isActive(false);
    tab.isActive(true);
    this.activeTab(tab);
  }

  public getTabs(
    tabKind: ViewModels.CollectionTabKind,
    comparator?: (tab: ViewModels.Tab) => boolean
  ): ViewModels.Tab[] {
    return this.openedTabs().filter((openedTab: ViewModels.Tab) => {
      return openedTab.tabKind === tabKind && (!comparator || comparator(openedTab));
    });
  }

  public refreshActiveTab(comparator: (tab: ViewModels.Tab) => boolean): void {
    // ensures that the tab selects/highlights the right node based on resource tree expand/collapse state
    this.openedTabs().forEach((tab: ViewModels.Tab) => {
      if (comparator(tab) && tab.isActive()) {
        tab.onActivate();
      }
    });
  }

  public removeTabById(tabId: string): void {
    this.openedTabs.remove((tab: ViewModels.Tab) => tab.tabId === tabId);
  }

  public removeTabByComparator(comparator: (tab: ViewModels.Tab) => boolean): void {
    this.openedTabs.remove((tab: ViewModels.Tab) => comparator(tab));
  }

  public closeTabsByComparator(comparator: (tab: ViewModels.Tab) => boolean): void {
    this.activeTab() && this.activeTab().isActive(false);
    this.activeTab(undefined);
    this.openedTabs().forEach((tab: ViewModels.Tab) => {
      if (comparator(tab)) {
        tab.onCloseTabButtonClick();
      }
    });
  }

  public closeTabs(): void {
    this.openedTabs([]);
  }

  public closeTab(tabId: string, explorer: Explorer): void {
    const tabIndex: number = this.openedTabs().findIndex((tab: ViewModels.Tab) => tab.tabId === tabId);
    if (tabIndex !== -1) {
      const tabToActive: ViewModels.Tab = this.openedTabs()[tabIndex + 1] || this.openedTabs()[tabIndex - 1];
      this.openedTabs()[tabIndex].isActive(false);
      this.removeTabById(tabId);
      if (tabToActive) {
        tabToActive.isActive(true);
        this.activeTab(tabToActive);
      } else {
        explorer.selectedNode(undefined);
        explorer.onUpdateTabsButtons([]);
        this.activeTab(undefined);
      }
    }
  }

  public isTabActive(tabKind: ViewModels.CollectionTabKind): boolean {
    return this.activeTab() && this.activeTab().tabKind === tabKind;
  }
}

function TabsManagerWrapperViewModel(params: { data: TabsManager }) {
  return params.data;
}

export function TabsManagerKOComponent(): unknown {
  return {
    viewModel: TabsManagerWrapperViewModel,
    template: TabsManagerTemplate
  };
}
