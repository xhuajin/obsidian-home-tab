import type { ActivityHistory, DayActivity } from "./types";


export default class HomeTabHeatMap {
  private year: string;
  private data: DayActivity[];

  constructor(year: string, data: DayActivity[]) {
    this.year = year;
    this.data = data;
  }
}