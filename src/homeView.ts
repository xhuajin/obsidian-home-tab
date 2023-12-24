import { FileView, MarkdownRenderChild, View, WorkspaceLeaf } from "obsidian";
import type HomeTab from "./main";
import type { ActivityHistory } from "./types";
import Homepage from './ui/homepage.svelte'
import HomeTabSearchBar from "./homeTabSearchbar";
import HomeTabHeatMap from "./homeTabHeatMap";

export const VIEW_TYPE = "home-tab-view";

export class EmbeddedHomeTab extends MarkdownRenderChild{
    searchBar: HomeTabSearchBar
    homepage: Homepage
    plugin: HomeTab
    view: View
    recentFiles: boolean | undefined
    bookmarkedFiles: boolean | undefined
    searchbarOnly: boolean | undefined

    constructor(containerEl: HTMLElement, view: View, plugin: HomeTab, codeBlockContent: string){
        super(containerEl)
        this.view = view
        this.plugin = plugin

        this.parseCodeBlockContent(codeBlockContent)
        this.searchBar = new HomeTabSearchBar(plugin, view)
    }

    onload(): void{
        this.homepage = new Homepage({
            target: this.containerEl,
            props: {
                plugin: this.plugin,
                view: this.view,
                HomeTabSearchBar: this.searchBar,
                embeddedView: this
            }
        })

        this.searchBar.load()
    }

    onunload(): void {
        this.plugin.activeEmbeddedHomeTabViews.splice(this.plugin.activeEmbeddedHomeTabViews.findIndex(item => item.view == this.view),1)
        this.searchBar.fileSuggester.close()
        this.homepage.$destroy()
    }

    private parseCodeBlockContent(codeBlockContent: string){
        codeBlockContent.split('\n')
        .map((line: string) => line.trim())
        .forEach((line: string) => {
            switch (true) {
                case line === '':
                    break
                case line === 'only search bar':
                    this.searchbarOnly = true
                    break
                case line === 'show recent files':
                    this.recentFiles = true
                    break
                case line === 'show bookmarked files':
                    this.bookmarkedFiles = true
                    break
            }
        });
    }
}

export class HomeTabView extends FileView{
    plugin: HomeTab
    homepage: Homepage
    searchBar: HomeTabSearchBar
    containerEl: HTMLElement
    heatmap: HomeTabHeatMap

    constructor(leaf: WorkspaceLeaf, plugin: HomeTab) {
        super(leaf);
        this.leaf = leaf
        this.plugin = plugin
        this.navigation = true
        this.allowNoFile = true
        this.icon = 'search'

        this.searchBar = new HomeTabSearchBar(this.plugin, this)

        // Get activity history for specified project
        let settings = this.plugin.settings
        let activity = getProjectActivityHistory("/", settings.activityHistory)?.size
        let currentYear = new Date().getFullYear().toString();
        // if no activity history available add placeholder
        if (!activity) {
          activity = [{ date: `${currentYear}-01-01`, value: 0 }]
        }
        this.heatmap = new HomeTabHeatMap(new Date().getFullYear().toString(), activity)
    }

    getViewType() {
        return VIEW_TYPE;
    }
    
    getDisplayText(): string {
        return 'Home tab'
    }

    async onOpen(): Promise<void> {
        this.homepage = new Homepage({
            target: this.contentEl,
            props:{
                plugin: this.plugin,
                view: this,
                HomeTabSearchBar: this.searchBar,
                homeTabHeapMap: this.heatmap
            }
        });
        this.searchBar.load()
        this.searchBar.focusSearchbar()


        // // Get activity history for specified project
        // let settings = this.plugin.settings
        // let activity = getProjectActivityHistory("/", settings.activityHistory)?.size
        // let currentYear = new Date().getFullYear().toString();
        // // if no activity history available add placeholder
        // if (!activity) {
        //   activity = [{ date: `${currentYear}-01-01`, value: 0 }]
        // }

        // this.heatmap = new HeapMap({
        //     target: this.contentEl,
        //     props: {
        //       year: new Date().getFullYear().toString(),
        //       data: activity,
        //       colors: [settings.activityColor1, settings.activityColor2, settings.activityColor3, settings.activityColor4],
        //       textColor: settings.textColor,
        //       emptyColor: settings.emptyColor,
        //       cellRadius: settings.cellRadius,
        //       type: settings.type
        //     }
        // })

        // this.fileSuggester = new HomeTabFileSuggester(this.app, this.plugin, this,
            // get(this.searchBarEl), get(this.suggestionContainerEl))
    }

    async onClose(): Promise<void>{
        this.searchBar.fileSuggester.close()
        this.homepage.$destroy();
        // this.heatmap.$destroy();
    }
} 

export const getProjectActivityHistory = (projectPath: string, activityHistoryList: ActivityHistory[]): ActivityHistory | null => {
  for (let index = 0; index < activityHistoryList.length; index++) {
      if (projectPath == activityHistoryList[index].path) {
          return activityHistoryList[index]
      }
  }
  return null
}
