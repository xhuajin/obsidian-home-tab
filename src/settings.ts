import { App, Setting, PluginSettingTab, normalizePath, Platform, TextComponent } from 'obsidian'
import type HomeTab from './main'
import iconSuggester from './suggester/iconSuggester'
import { lucideIcons, type LucideIcon } from './utils/lucideIcons'
import ImageFileSuggester from './suggester/imageSuggester'
import cssUnitValidator from './utils/cssUnitValidator'
import isLink from './utils/isLink'
import fontSuggester from './suggester/fontSuggester'
import type { recentFileStore } from './recentFiles'
import type { bookmarkedFileStore } from './bookmarkedFiles'
import { checkFont } from './utils/fontValidator'
import type { Checkpoint, ActivityHistory } from './types'
import { getTimestamp } from './utils/getTimestamp'

type ColorChoices = 'default' | 'accentColor' | 'custom'
type LogoChoiches = 'default' | 'imagePath' | 'imageLink' | 'lucideIcon' | 'none'
type FontChoiches = 'interfaceFont' | 'textFont' | 'monospaceFont' | 'custom'

interface ObjectKeys {
    [key: string]: any
}

interface logoStore extends ObjectKeys {
    lucideIcon: LucideIcon | ''
    imagePath: string
    imageLink: string
}

export interface HomeTabSettings extends ObjectKeys {
    logoType: LogoChoiches
    logo: logoStore
    logoScale: number
    iconColor?: string
    iconColorType: ColorChoices
    wordmark: string
    customFont: FontChoiches
    font?: string
    fontSize: string
    fontColor?: string
    fontColorType: ColorChoices
    fontWeight: number
    maxResults: number
    showbookmarkedFiles: boolean
    showRecentFiles: boolean
    maxRecentFiles: number
    storeRecentFile: boolean
    showPath: boolean
    selectionHighlight: ColorChoices
    showShortcuts: boolean
    markdownOnly: boolean
    unresolvedLinks: boolean
    recentFilesStore: recentFileStore[]
    bookmarkedFileStore: bookmarkedFileStore[]
    searchDelay: number
    replaceNewTabs: boolean
    newTabOnStart: boolean
    closePreviousSessionTabs: boolean
    omnisearch: boolean
    showOmnisearchExcerpt: boolean
    firstRun: boolean
    updateInterval: number
    checkpointList: Checkpoint
    activityHistory: ActivityHistory[]
    heatmapColorType: string,
    activityColor1: string,
    activityColor2: string,
    activityColor3: string,
    activityColor4: string,
    emptyColor: string,
    cellRadius: number,
    type: string,
    year: string,
}

export const DEFAULT_SETTINGS: HomeTabSettings = {
    logoType: 'default',
    logo: {
        lucideIcon: '',
        imagePath: '',
        imageLink: '',
    },
    logoScale: 1.2,
    iconColorType: 'default',
    wordmark: 'Obsidian',
    customFont: 'interfaceFont',
    fontSize: '4em',
    fontColorType: 'default',
    fontWeight: 600,
    maxResults: 5,
    showbookmarkedFiles: app.internalPlugins.getPluginById('bookmarks') ? true : false,
    showRecentFiles: false,
    maxRecentFiles: 5,
    storeRecentFile: true,
    showPath: true,
    selectionHighlight: 'default',
    showShortcuts: true,
    markdownOnly: false,
    unresolvedLinks: false,
    recentFilesStore: [],
    bookmarkedFileStore: [],
    searchDelay: 0,
    replaceNewTabs: true,
    newTabOnStart: false,
    closePreviousSessionTabs: false,
    omnisearch: false,
    showOmnisearchExcerpt: true,
    firstRun: true,
    updateInterval: 20000,
    checkpointList: { date: getTimestamp(), size: 0 },
    activityHistory: [{ date: getTimestamp(), value: 0 }],
    heatmapColorType: "default",
    activityColor1: '#c6e48b',
    activityColor2: '#7bc96f',
    activityColor3: '#239a3b',
    activityColor4: '#196127',
    textColor: '#000000',
    emptyColor: '#ecedf0',
    cellRadius: 1,
    year: new Date().getFullYear().toString(),
    type: 'yearly',
}

export class HomeTabSettingTab extends PluginSettingTab {
    plugin: HomeTab

    constructor(app: App, plugin: HomeTab) {
        super(app, plugin)
        this.plugin = plugin
    }

    display(): void {
        const { containerEl } = this
        containerEl.empty()

        containerEl.createEl('h3', { text: 'Home tab settings' });

        containerEl.createEl('h2', { text: 'General settings' });
        new Setting(containerEl)
            .setName('Replace new tabs with Home tab')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.replaceNewTabs)
                .onChange(value => { this.plugin.settings.replaceNewTabs = value; this.plugin.saveSettings() }))

        new Setting(containerEl)
            .setName('Open new Home tab on Obsidian start')
            .setDesc('If a Home tab is already open it\'ll focus it instead of opening a new one.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.newTabOnStart)
                .onChange(value => { this.plugin.settings.newTabOnStart = value; this.plugin.saveSettings(); this.display() }))

        if (this.plugin.settings.newTabOnStart) {
            new Setting(containerEl)
                .setName('Close previous session tabs on start')
                .setDesc('Enable this to close all the tabs and leave only one Home tab on Obsidian opening.')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.closePreviousSessionTabs)
                    .onChange(value => { this.plugin.settings.closePreviousSessionTabs = value; this.plugin.saveSettings() }))
        }

        containerEl.createEl('h2', { text: 'Search settings' });
        if (this.plugin.app.plugins.getPlugin('omnisearch')) {
            new Setting(containerEl)
                .setName('Use Omnisearch')
                .setDesc('Set Omnisearch as the default search engine.')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.omnisearch)
                    .onChange(value => { this.plugin.settings.omnisearch = value; this.plugin.saveSettings(); this.display(); this.plugin.refreshOpenViews() }))
        }
        if (!this.plugin.settings.omnisearch) {
            new Setting(containerEl)
                .setName('Search only markdown files')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.markdownOnly)
                    .onChange(value => { this.plugin.settings.markdownOnly = value; this.plugin.saveSettings(); this.plugin.refreshOpenViews() }))

            new Setting(containerEl)
                .setName('Show uncreated files')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.unresolvedLinks)
                    .onChange(value => { this.plugin.settings.unresolvedLinks = value; this.plugin.saveSettings(); this.plugin.refreshOpenViews() }))

            new Setting(containerEl)
                .setName('Show file path')
                .setDesc('Displays file path at the right of the filename.')
                .addToggle((toggle) => toggle
                    .setValue(this.plugin.settings.showPath)
                    .onChange((value) => { this.plugin.settings.showPath = value; this.plugin.saveSettings() }))
        }

        new Setting(containerEl)
            .setName('Show shorcuts')
            .setDesc('Displays shortcuts under the search results.')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.showShortcuts)
                .onChange((value) => {
                    this.plugin.settings.showShortcuts = value
                    this.plugin.refreshOpenViews()
                    this.plugin.saveSettings()
                }
                ))

        new Setting(containerEl)
            .setName('Search results')
            .setDesc('Set how many results display.')
            .addSlider((slider) => slider
                .setLimits(1, 25, 1)
                .setValue(this.plugin.settings.maxResults)
                .setDynamicTooltip()
                .onChange((value) => { this.plugin.settings.maxResults = value; this.plugin.saveSettings() }))
            .then((settingEl) => this.addResetButton(settingEl, 'maxResults'))

        new Setting(containerEl)
            .setName('Search delay')
            .setDesc('The value is in milliseconds.')
            .addSlider((slider) => slider
                .setLimits(0, 500, 10)
                .setValue(this.plugin.settings.searchDelay)
                .setDynamicTooltip()
                .onChange((value) => { this.plugin.settings.searchDelay = value; this.plugin.saveSettings(); this.plugin.refreshOpenViews() }))
            .then((settingEl) => this.addResetButton(settingEl, 'searchDelay'))

        if (this.plugin.app.plugins.getPlugin('omnisearch')) {
            new Setting(containerEl)
                .setName('Show excerpt (Omnisearch)')
                .setDesc('Shows the contextual part of the note that matches the search.')
                .addToggle((toggle) => toggle
                    .setValue(this.plugin.settings.showOmnisearchExcerpt)
                    .onChange((value) => {
                        this.plugin.settings.showOmnisearchExcerpt = value
                        this.plugin.saveSettings()
                    }
                    ))
        }

        containerEl.createEl('h2', { text: 'Files display' });

        if (app.internalPlugins.getPluginById('bookmarks')) {
            new Setting(containerEl)
                .setName('Show bookmarked files')
                .setDesc('Shows bookmarked files under the search bar.')
                .addToggle((toggle) => toggle
                    .setValue(this.plugin.settings.showbookmarkedFiles)
                    .onChange((value) => {
                        this.plugin.settings.showbookmarkedFiles = value; this.plugin.saveSettings(); this.plugin.refreshOpenViews()
                        // if(value && !this.plugin.bookmarkedFileManager){
                        //     this.plugin.bookmarkedFileManager = new bookmarkedFileManager(this.app, this.plugin, bookmarkedFiles)
                        // }
                        // value ? this.plugin.bookmarkedFileManager.load() : this.plugin.bookmarkedFileManager.unload() // Detach bookmarkedFileManager instance
                    }))
        }

        new Setting(containerEl)
            .setName('Show recent files')
            .setDesc('Displays recent files under the search bar.')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.showRecentFiles)
                .onChange((value) => {
                    this.plugin.settings.showRecentFiles = value; this.plugin.saveSettings(); this.display(); this.plugin.refreshOpenViews()
                    // if(value && !this.plugin.recentFileManager){
                    //     this.plugin.recentFileManager = new RecentFileManager(this.app, this.plugin)
                    // }
                    // value ? this.plugin.recentFileManager.load() : this.plugin.recentFileManager.unload() // Detach recentFileManager instance
                }))

        if (this.plugin.settings.showRecentFiles) {
            new Setting(containerEl)
                .setName('Store last recent files')
                .setDesc('Remembers the recent files of the previous session.')
                .addToggle((toggle) => toggle
                    .setValue(this.plugin.settings.storeRecentFile)
                    .onChange((value) => { this.plugin.settings.storeRecentFile = value; this.plugin.saveSettings() }))

            new Setting(containerEl)
                .setName('Recent files')
                .setDesc('Set how many recent files display.')
                .addSlider((slider) => slider
                    .setValue(this.plugin.settings.maxRecentFiles)
                    .setLimits(1, 25, 1)
                    .setDynamicTooltip()
                    .onChange((value) => { this.plugin.recentFileManager.onNewMaxListLenght(value); this.plugin.settings.maxRecentFiles = value; this.plugin.saveSettings() }))
                .then((settingEl) => this.addResetButton(settingEl, 'maxRecentFiles'))
        }

        containerEl.createEl('h2', { text: 'Appearance' });

        const logoTypeSetting = new Setting(containerEl)
            .setName('Logo')
            .setDesc('Remove or set a custom logo. Accepts local files, links to images or lucide icon ids.')

        logoTypeSetting.descEl.parentElement?.addClass('ultra-compressed')

        let invalidInputIcon: HTMLElement
        logoTypeSetting
            .addExtraButton((button) => {
                button
                    .setIcon('alert-circle')
                    .setTooltip('The path/link/icon is not valid.')
                invalidInputIcon = button.extraSettingsEl
                invalidInputIcon.toggleVisibility(false)
                invalidInputIcon.addClass('mod-warning')
            })

        if (this.plugin.settings.logoType === 'imagePath' || this.plugin.settings.logoType === 'imageLink' || this.plugin.settings.logoType === 'lucideIcon') {
            logoTypeSetting
                .addSearch((text) => {
                    if (this.plugin.settings.logoType === 'imagePath') {
                        new ImageFileSuggester(this.app, text.inputEl, {
                            isScrollable: true,
                            style: `max-height: 200px`
                        })
                    }
                    else if (this.plugin.settings.logoType === 'lucideIcon') {
                        new iconSuggester(this.app, text.inputEl, {
                            isScrollable: true,
                            style: `max-height: 200px`
                        },
                            true)
                    }
                    text
                        // .setPlaceholder(this.plugin.settings.logo[this.plugin.settings.logoType] != '' ? this.plugin.settings.logo[this.plugin.settings.logoType] : 'Type anything ... ')
                        .setPlaceholder('Type anything ... ')
                        .setValue(this.plugin.settings.logo[this.plugin.settings.logoType] != '' ? this.plugin.settings.logo[this.plugin.settings.logoType] : '')
                        .onChange(async (value) => {
                            if (value === '' || value == '/') {
                                invalidInputIcon.toggleVisibility(false)
                                return
                            }
                            if (this.plugin.settings.logoType === 'imagePath') {
                                const normalizedPath = normalizePath(value)
                                if (await app.vault.adapter.exists(normalizedPath)) {
                                    invalidInputIcon.toggleVisibility(false)
                                    this.plugin.settings.logo['imagePath'] = normalizedPath
                                    this.plugin.saveSettings()
                                }
                                else {
                                    invalidInputIcon.toggleVisibility(true)
                                }
                            }
                            else if (this.plugin.settings.logoType === 'imageLink') {
                                if (isLink(value)) {
                                    invalidInputIcon.toggleVisibility(false)
                                    this.plugin.settings.logo['imageLink'] = value
                                    this.plugin.saveSettings()
                                }
                                else {
                                    invalidInputIcon.toggleVisibility(true)
                                }
                            }
                            else if (this.plugin.settings.logoType === 'lucideIcon') {
                                if (lucideIcons.includes(value as LucideIcon)) {
                                    this.plugin.settings.logo['lucideIcon'] = value as LucideIcon
                                    this.plugin.saveSettings()
                                    invalidInputIcon.toggleVisibility(false)
                                }
                                else {
                                    invalidInputIcon.toggleVisibility(true)
                                }
                            }
                        })
                        .inputEl.parentElement?.addClass('wide-input-container')
                })
        }

        logoTypeSetting
            .addDropdown((dropdown) => dropdown
                .addOption('default', 'Obsidian logo')
                .addOption('imagePath', 'Local image')
                .addOption('imageLink', 'Link')
                .addOption('lucideIcon', 'Lucide icon')
                .addOption('none', 'Empty')
                .setValue(this.plugin.settings.logoType)
                .onChange((value: LogoChoiches) => { this.plugin.settings.logoType = value; this.plugin.saveSettings(); this.display() }))
            .then((settingEl) => this.addResetButton(settingEl, 'logoType'))

        if (this.plugin.settings.logoType === 'lucideIcon') {
            const iconColorSetting = new Setting(containerEl)
                .setName('Logo icon color')
                .setDesc('Set the icon color')

            if (this.plugin.settings.iconColorType === 'custom') {
                iconColorSetting.addColorPicker((colorPicker) => colorPicker
                    .setValue(this.plugin.settings.iconColor ? this.plugin.settings.iconColor : '#000000')
                    .onChange((value) => { this.plugin.settings.iconColor = value; this.plugin.saveSettings() }))
            }

            iconColorSetting
                .addDropdown((dropdown) => dropdown
                    .addOption('default', 'Theme default')
                    .addOption('accentColor', 'Accent color')
                    .addOption('custom', 'Custom')
                    .setValue(this.plugin.settings.iconColorType)
                    .onChange((value: ColorChoices) => { this.plugin.settings.iconColorType = value; this.plugin.saveSettings(); this.display() }))
                .then((settingEl) => this.addResetButton(settingEl, 'iconColorType'))
        }

        new Setting(containerEl)
            .setName('Logo scale')
            .setDesc('Set the logo dimensions relative to the title font size.')
            .addSlider((slider) => slider
                .setDynamicTooltip()
                .setLimits(0.3, 3, 0.1)
                .setValue(this.plugin.settings.logoScale)
                .onChange((value) => {
                    this.plugin.settings.logoScale = value
                    this.plugin.saveSettings()
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'logoScale'))

        new Setting(containerEl)
            .setName('Title')
            // .setDesc('Set a custom title')
            .addText((text) => text
                .setValue(this.plugin.settings.wordmark)
                .onChange((value) => {
                    this.plugin.settings.wordmark = value
                    this.plugin.saveSettings()
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'wordmark'))


        const titleFontSettings = new Setting(containerEl)
            .setName('Title font')
            .setDesc('Interface font, text font, and monospace font options match the fonts set in the Appearance setting tab.')
        // .setDesc(createFragment(f => {
        //     f.appendText('Interface font, text font, and monospace font options');
        //     f.createEl('br')
        //     f.appendText('match the fonts set in the Appearance setting tab.')
        //   }))

        titleFontSettings.descEl.parentElement?.addClass('compressed')

        if (this.plugin.settings.customFont === 'custom') {
            let invalidFontIcon: HTMLElement
            titleFontSettings
                .addExtraButton((button) => {
                    button
                        .setIcon('alert-circle')
                        .setTooltip('The font is not valid.')
                    invalidFontIcon = button.extraSettingsEl
                    invalidFontIcon.toggleVisibility(false)
                    invalidFontIcon.addClass('mod-warning')
                })

            titleFontSettings.addSearch((text) => {
                text.setValue(this.plugin.settings.font ? this.plugin.settings.font.replace(/"/g, '') : '')
                text.setPlaceholder('Type anything ... ')
                const suggester: fontSuggester | undefined = Platform.isMobile || Platform.isMacOS ? undefined : new fontSuggester(this.app, text.inputEl, {
                    isScrollable: true,
                    style: `max-height: 200px;
                    width: fit-content;
                    min-width: 200px;`},
                    true)

                text.onChange(async (value) => {
                    value = value.indexOf(' ') >= 0 ? `"${value}"` : value //Restore "" if font name contains whitespaces
                    if ((suggester && (await suggester.getInstalledFonts()).includes(value)) || checkFont(value)) {
                        this.plugin.settings.font = value
                        this.plugin.saveSettings()
                        invalidFontIcon.toggleVisibility(false)
                    }
                    else {
                        invalidFontIcon.toggleVisibility(true)
                    }
                })
                    .inputEl.parentElement?.addClass('wide-input-container')
            })
        }

        titleFontSettings
            .addDropdown(dropdown => dropdown
                .addOption('interfaceFont', 'Interface font')
                .addOption('textFont', 'Text font')
                .addOption('monospaceFont', 'Monospace font')
                .addOption('custom', 'Custom font')
                .setValue(this.plugin.settings.customFont)
                .onChange((value: FontChoiches) => {
                    this.plugin.settings.customFont = value
                    this.plugin.saveSettings()
                    this.display()
                })
            )
        this.addResetButton(titleFontSettings, 'customFont')

        let invalidFontSizeIcon: HTMLElement
        new Setting(containerEl)
            .setName('Title font size')
            .setDesc('Accepts any CSS font-size value.')
            .addExtraButton((button) => {
                button
                    .setIcon('alert-circle')
                    .setTooltip('The CSS unit is not valid.')
                invalidFontSizeIcon = button.extraSettingsEl
                invalidFontSizeIcon.addClass('mod-warning')
                invalidFontSizeIcon.toggleVisibility(false)
            })
            .addText((text) => text
                .setValue(this.plugin.settings.fontSize)
                .onChange((value) => {
                    if (cssUnitValidator(value)) {
                        this.plugin.settings.fontSize = value
                        this.plugin.saveSettings()
                        invalidFontSizeIcon.toggleVisibility(false)
                    }
                    else {
                        invalidFontSizeIcon.toggleVisibility(true)
                    }
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'fontSize'))

        new Setting(containerEl)
            .setName('Title font weight')
            // .setDesc('Set title font weight')
            .addSlider((slider) => slider
                .setLimits(100, 900, 100)
                .setDynamicTooltip()
                .setValue(this.plugin.settings.fontWeight)
                .onChange((value) => {
                    this.plugin.settings.fontWeight = value
                    this.plugin.saveSettings()
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'fontWeight'))

        const titleColorSetting = new Setting(containerEl)
            .setName('Title color')

        if (this.plugin.settings.fontColorType === 'custom') {
            titleColorSetting.addColorPicker((colorPicker) => colorPicker
                .setValue(this.plugin.settings.fontColor ? this.plugin.settings.fontColor : '#000000')
                .onChange((value) => { this.plugin.settings.fontColor = value; this.plugin.saveSettings() }))
        }

        titleColorSetting
            .addDropdown((dropdown) => dropdown
                .addOption('default', 'Theme default')
                .addOption('accentColor', 'Accent color')
                .addOption('custom', 'Custom')
                .setValue(this.plugin.settings.fontColorType)
                .onChange((value: ColorChoices) => {
                    this.plugin.settings.fontColorType = value;
                    this.plugin.saveSettings(); this.display()
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'fontColorType'))

        new Setting(containerEl)
            .setName('Selection highlight')
            .setDesc('Set the color of the selected item.')
            .addDropdown((dropdown) => dropdown
                .addOption('default', 'Theme default')
                .addOption('accentColor', 'Accent color')
                .setValue(this.plugin.settings.selectionHighlight)
                .onChange((value: ColorChoices) => { this.plugin.settings.selectionHighlight = value; this.plugin.saveSettings(); this.plugin.refreshOpenViews() }))
            .then((settingEl) => this.addResetButton(settingEl, 'selectionHighlight'))

        containerEl.createEl('h2', { text: 'Heatmap settings' });

        new Setting(containerEl)
            .setName('Year:')
            .setDesc('Year of data that you want to display.')
            .addText(text => text
                .setPlaceholder("" + this.plugin.settings.year)
                .onChange(async (value) => {
                    // check if valid interval number
                    let year = parseInt(value, 10);
                    if (!isNaN(year)) {
                        return
                    }
                    this.plugin.settings.updateInterval = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Update Interval:')
            .setDesc('Time between each update in milliseconds. Default is 20000.')
            .addText(text => text
                .setPlaceholder("" + this.plugin.settings.updateInterval)
                .onChange(async (value) => {
                    // check if valid interval number
                    let newInterval = parseInt(value, 10);
                    if (!isNaN(newInterval)) {
                        return
                    }
                    this.plugin.settings.updateInterval = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Heatmap Type:')
            .setDesc('Show by Year or Month.')
            .addDropdown(dropDown =>
                dropDown
                    .addOption('yearly', 'Yearly')
                    .addOption('monthly', 'Monthly')
                    .setValue(this.plugin.settings.type || 'yearly')
                    .onChange((value: string) => {
                        this.plugin.settings.type = value;
                        this.plugin.saveSettings();
                    }))
            .then((settingEl) => this.addResetButton(settingEl, 'type'))


        const HeatMapColorSetting = new Setting(containerEl)
            .setName('Heatmap Color')
            .addDropdown((dropdown) => dropdown
                .addOption('default', 'Default')
                .addOption('blue', 'Blue')
                .addOption('pink', 'Pink')
                .addOption('custom', 'Custom')
                .setValue(this.plugin.settings.heatmapColorType)
                .onChange((value: ColorChoices) => {
                    this.plugin.settings.heatmapColorType = value;
                    this.plugin.saveSettings(); this.display()
                }))
            .then((settingEl) => this.addResetButton(settingEl, 'heatmapColorType'))




        const HeatMapColor1Picker = new Setting(containerEl)
            .setName('Activity 1 Color:')
            .setDesc('Color for lowest activity. Placeholder shows current color.(Default: 204 211, 223)')
            .addColorPicker(colorPicker =>
                colorPicker
                    .setValue(this.plugin.settings.activityColor1)
                    .onChange(async (value) => {
                        this.plugin.settings.activityColor1 = value;
                        this.plugin.saveSettings();
                    })
            )
            .then((settingEl) => this.addResetButton(settingEl, 'activityColor1'))

        const HeatMapColor2Picker = new Setting(containerEl)
            .setName('Activity 2 Color:')
            .setDesc('Color for low activity. Placeholder shows current color.(Default: 172, 189, 210)')
            .addColorPicker(colorPicker =>
                colorPicker
                    .setValue(this.plugin.settings.activityColor2)
                    .onChange(async (value) => {
                        this.plugin.settings.activityColor2 = value;
                        this.plugin.saveSettings();
                    })
            )
            .then((settingEl) => this.addResetButton(settingEl, 'activityColor2'))



        const HeatMapColor3Picker = new Setting(containerEl)
            .setName('Activity 3 Color:')
            .setDesc('Color for medium activity. Placeholder shows current color.(Default: 141, 166, 198)')
            .addColorPicker(colorPicker =>
                colorPicker
                    .setValue(this.plugin.settings.activityColor3)
                    .onChange(async (value) => {
                        this.plugin.settings.activityColor3 = value;
                        this.plugin.saveSettings();
                    })
            )
            .then((settingEl) => this.addResetButton(settingEl, 'activityColor3'))

        const HeatMapColor4Picker = new Setting(containerEl)
            .setName('Activity 4 Color:')
            .setDesc('Color for highest activity. Placeholder shows current color.(Default: 109, 144, 185)')
            .addColorPicker(colorPicker =>
                colorPicker
                    .setValue(this.plugin.settings.activityColor4)
                    .onChange(async (value) => {
                        this.plugin.settings.activityColor4 = value;
                        this.plugin.saveSettings();
                    })
            )
            .then((settingEl) => this.addResetButton(settingEl, 'activityColor4'))

        const HeatMapEmptyColorPicker = new Setting(containerEl)
            .setName('Empty color:')
            .setDesc('Empty color. Placeholder shows current color.(Default: 236, 237, 240)')
            .addColorPicker(colorPicker =>
                colorPicker
                    .setValue(this.plugin.settings.emptyColor)
                    .onChange(async (value) => {
                        this.plugin.settings.emptyColor = value;
                        this.plugin.saveSettings();
                    })
            )
            .then((settingEl) => this.addResetButton(settingEl, 'emptyColor'));

        if (this.plugin.settings.heatmapColorType !== 'custom') {
            HeatMapColor1Picker.settingEl.style.display = 'none';
            HeatMapColor2Picker.settingEl.style.display = 'none';
            HeatMapColor3Picker.settingEl.style.display = 'none';
            HeatMapColor4Picker.settingEl.style.display = 'none';
            HeatMapEmptyColorPicker.settingEl.style.display = 'none';
        }

        if (this.plugin.settings.heatmapColorType === 'default') {
            this.plugin.settings.activityColor1 = '#c6e48b'
            this.plugin.settings.activityColor2 = '#7bc96f'
            this.plugin.settings.activityColor3 = '#239a3b'
            this.plugin.settings.activityColor4 = '#196127'
            this.plugin.settings.emptyColor = '#ecedf0'
            this.plugin.saveSettings();
        } else if (this.plugin.settings.heatmapColorType === 'pink') {
            this.plugin.settings.activityColor1 = '#e0b1cb'
            this.plugin.settings.activityColor2 = '#be95c4'
            this.plugin.settings.activityColor3 = '#9f86c0'
            this.plugin.settings.activityColor4 = '#5e548e'
            this.plugin.settings.emptyColor = '#ecedf0'
            this.plugin.saveSettings();
        } else if (this.plugin.settings.heatmapColorType === 'blue') {
            this.plugin.settings.activityColor1 = '#6E93B9'
            this.plugin.settings.activityColor2 = '#ACBDD2'
            this.plugin.settings.activityColor3 = '#8DA6C6'
            this.plugin.settings.activityColor4 = '#6D90B9'
            this.plugin.settings.emptyColor = '#ecedf0'
            this.plugin.saveSettings();
        }

        new Setting(containerEl)
            .setName('Cell Radius:')
            .setDesc('Cell Radius. integer, default is 1 (display as square), the higher the more round.')
            .addText((text: TextComponent) => {
                text.inputEl.type = 'number';
                text.setPlaceholder("1");
                text.setValue(this.plugin.settings.cellRadius.toString());
                text.onChange(async (value) => {
                    this.plugin.settings.cellRadius = Math.abs(parseInt(value));
                    await this.plugin.saveSettings();
                })
            })
            .then((settingEl) => this.addResetButton(settingEl, 'cellRadius'))
    }

    addResetButton(settingElement: Setting, settingKey: string, refreshView: boolean = true) {
        settingElement
            .addExtraButton((button) => button
                .setIcon('reset')
                .setTooltip('Reset to default')
                .onClick(() => {
                    this.plugin.settings[settingKey] = DEFAULT_SETTINGS[settingKey]
                    this.plugin.saveSettings()
                    if (refreshView) { this.display() }
                }))
    }
}