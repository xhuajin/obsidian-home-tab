import type { TFile } from 'obsidian';
import type { Checkpoint, ActivityHistory } from "src/types";
import { getTimestamp } from "./getTimestamp";
import type { HomeTabSettings } from 'src/settings';

export const updateActivityAll = (activitySettings: HomeTabSettings, vaultFiles: TFile[]): void => {
    if (activitySettings.firstRun) {
        activitySettings.firstRun = false
        activitySettings.activityHistory = [{ date: getTimestamp(), value: 0 }]
        activitySettings.checkpointList = { date: getTimestamp(), size: getVaultSize(vaultFiles) }
        return
    }
    updateActivity(vaultFiles, activitySettings)
}

export const updateActivity = (vaultFiles: TFile[], activitySettings: HomeTabSettings): void => {
    let timestampNow = getTimestamp()
    let newSize = getVaultSize(vaultFiles)
    let checkpoint = activitySettings.checkpointList
    let activity = 0
    if (!checkpoint) {
        activitySettings.checkpointList = { date: timestampNow, size: newSize }
        activitySettings.activityHistory.push({ date: timestampNow, value: 0 })
    }

    if (timestampNow == checkpoint.date) {
        activity = Math.abs(newSize - checkpoint.size)
        activity = activity + getActivityAtDate(activitySettings.activityHistory, timestampNow)
        updateActivityAtDate(activitySettings.activityHistory, timestampNow, activity)
        activitySettings.checkpointList = { date: timestampNow, size: newSize }
    } else {
        activitySettings.checkpointList = { date: timestampNow, size: newSize }
        activitySettings.activityHistory.push({ date: timestampNow, value: 0 })
    }
}

export const getVaultSize = (vaultFiles: TFile[]): number => {
    let projectSize = 0;
    let reg = new RegExp(`^.*\.md$`)
    for (let file in vaultFiles) {
        if (vaultFiles[file].path.match(reg)) {
            projectSize += vaultFiles[file].stat.size;
        }
    }
    return projectSize;
}

export const getActivityAtDate = (activityHistoryList: ActivityHistory[], timestamp: string): number => {
    for (let index = 0; index < activityHistoryList.length; index++) {
        if (activityHistoryList[index].date == timestamp) {
            return activityHistoryList[index].value
        }
    }
    return 0
}

export const updateActivityAtDate = (activityHistoryList: ActivityHistory[], timestamp: string, value: number): boolean => {
    for (let i = activityHistoryList.length - 1; i >= 0; i--) {
        if (activityHistoryList[i].date == timestamp) {
            activityHistoryList[i].value = value
            return true
        }
    }
    return true
}
