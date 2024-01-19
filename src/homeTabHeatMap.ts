import type { ActivityHistory } from "./types";
import type { HomeTabSettings } from './settings'


export default class HomeTabHeatMap {
  private year: string;
  private data: ActivityHistory[];
  private cellRadius: number;
  private colors: string[];
  private type: string;

  constructor(settings: HomeTabSettings) {
    this.year = settings.year;
    this.data = settings.activityHistory;
    this.cellRadius = settings.cellRadius;
    this.colors = [settings.activityColor1, settings.activityColor2, settings.activityColor3, settings.activityColor4];
    this.type = settings.type;
  }
}