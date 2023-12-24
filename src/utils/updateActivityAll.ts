import type { TFile } from 'obsidian';
import type { ActivitySettings, Checkpoint, InitializedProject, ActivityHistory } from "src/types";
import { getTimestamp } from "./getTimestamp";
import type HomeTab from 'src/main';
import type { HomeTabSettings } from 'src/settings';

export const updateActivityAll = (plugin: HomeTab, activitySettings: HomeTabSettings, vaultFiles: TFile[]): void => {
  if(plugin.settings.firstRun){
    removeProject('/', plugin.settings)
    addProject('/', plugin.settings, plugin.app.vault.getMarkdownFiles())
    plugin.settings.firstRun = false
    plugin.saveSettings();
  }
  // Loop over all tracked projects
  for (let project in activitySettings.trackedProjects) {
    updateActivity(activitySettings.trackedProjects[project], vaultFiles, activitySettings)
  }
}

export const updateActivity = (projectPath: string, vaultFiles: TFile[], activitySettings: HomeTabSettings): void => {
  let timestampNow = getTimestamp()
  let newSize = getProjectSize(projectPath, vaultFiles)
  let checkpoint = getProjectCheckpoint(projectPath, activitySettings.checkpointList)
  let activity = 0
  if (checkpoint) activity = Math.abs(newSize - checkpoint.size)

  if (checkpoint && timestampNow == checkpoint.date) {
      updateProjectCheckpoint(projectPath, activitySettings.checkpointList, timestampNow, newSize)
      activity = activity + getActivityAtDate(projectPath, activitySettings.activityHistory, timestampNow)
      updateActivityAtDate(projectPath, activitySettings.activityHistory, timestampNow, activity)
  }

  updateProjectCheckpoint(projectPath, activitySettings.checkpointList, timestampNow, newSize)
  updateActivityAtDate(projectPath, activitySettings.activityHistory, timestampNow, activity)
}

/**
 * Stop tracking specified project
 */

export const removeProject = (projectPath: string, activitySettings: HomeTabSettings): ActivitySettings => {
  activitySettings.trackedProjects.remove(projectPath)
  activitySettings.initialized.remove(getInitializationStatus(projectPath, activitySettings.initialized))
  activitySettings.checkpointList.remove(getProjectCheckpoint(projectPath, activitySettings.checkpointList))
  activitySettings.activityHistory.remove(getProjectActivityHistory(projectPath, activitySettings.activityHistory))
  return activitySettings
}

/**
* Start tracking specified project
*/

export const addProject = (projectPath: string, activitySettings: HomeTabSettings, vaultFiles: TFile[]): HomeTabSettings => {
  let timestampNow = getTimestamp();
  activitySettings.trackedProjects.push(projectPath)
  activitySettings.initialized.push({ path: projectPath, initialized: true })
  activitySettings.checkpointList.push({ path: projectPath, date: timestampNow, size: getProjectSize(projectPath, vaultFiles) })
  activitySettings.activityHistory.push({ path: projectPath, size: [{ date: timestampNow, value: 0 }] })
  return activitySettings
}

/**
 * Return initialization status for specified project
 */

export const getInitializationStatus = (projectPath: string, initializationList: InitializedProject[]): InitializedProject => {
  for (let index = 0; index < initializationList.length; index++) {
      if (projectPath == initializationList[index].path) {
          return initializationList[index]
      }
  }
  return null
}

/**
 * Return checkpoint size & date for specified project
 */

export const getProjectCheckpoint = (projectPath: string, checkpointList: Checkpoint[]): Checkpoint => {
  for (let index = 0; index < checkpointList.length; index++) {
      if (projectPath == checkpointList[index].path) {
          return checkpointList[index]
      }
  }
  return null
}

/**
 * Return Activity History for specified project
 */

export const getProjectActivityHistory = (projectPath: string, activityHistoryList: ActivityHistory[]): ActivityHistory => {
  for (let index = 0; index < activityHistoryList.length; index++) {
      if (projectPath == activityHistoryList[index].path) {
          return activityHistoryList[index]
      }
  }
  return null
}

/**
 * Calculate size of MD files in the specified directory
 * @param projectPath - path to project e.g. 'Test Project/First Sub Project'
 * @param vaultFiles - list of all TFiles of Obsidian vault
 */

export const getProjectSize = (projectPath: string, vaultFiles: TFile[]): number => {
  let projectSize = 0;
  let reg = new RegExp(`^${projectPath}\/.*\.md$`)

  if (projectPath === '/') {
      reg = new RegExp(`^.*\.md$`)
  }
  for (let file in vaultFiles) {
      if (vaultFiles[file].path.match(reg)) {
          projectSize += vaultFiles[file].stat.size;
      }
  }
  return projectSize;
}

/**
 * Update checkpoint size & date for specified project
 */

export const updateProjectCheckpoint = (projectPath: string, checkpointList: Checkpoint[], valueDate: string, valueSize: number): void => {
  for (let index = 0; index < checkpointList.length; index++) {
      if (projectPath == checkpointList[index].path) {
          checkpointList[index] = { path: projectPath, date: valueDate, size: valueSize }
      }
  }
}

/**
 * Return size for specified day 
 */

export const getActivityAtDate = (projectPath: string, activityHistoryList: ActivityHistory[], timestamp: string): number => {
  for (let index = 0; index < activityHistoryList.length; index++) {
      if (projectPath == activityHistoryList[index].path) {
          for (let i = 0; i < activityHistoryList[index].size.length; i++) {
              if (activityHistoryList[index].size[i].date == timestamp) {
                  return activityHistoryList[index].size[i].value
              }
          }
      }
  }
  return 0
}

/**
 * Update timestamp for specified day 
 */

export const updateActivityAtDate = (projectPath: string, activityHistoryList: ActivityHistory[], timestamp: string, value: number): boolean => {
  for (let index = 0; index < activityHistoryList.length; index++) {
      if (projectPath == activityHistoryList[index].path) {
          for (let i = activityHistoryList[index].size.length - 1; i >= 0; i--) {
              if (activityHistoryList[index].size[i].date == timestamp) {
                  activityHistoryList[index].size[i].value = value
                  return true
              }
          }

          activityHistoryList[index].size.push({ date: timestamp, value: value })
          return true
      }
  }
  return false
}
