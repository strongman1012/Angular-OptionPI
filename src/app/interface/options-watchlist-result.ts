import { WatchListData } from "./watchList-result";

export interface GetWatchListDataResult {
    Data: WatchListData[],
    TotalData: number,
    TotalDataFiltered: number,
  }
