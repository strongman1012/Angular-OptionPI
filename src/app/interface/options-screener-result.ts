import { ScreenedStockResult } from "./screened-stock-result";
import { ScreenerDataResult } from "./screener-result";

export interface ScreenerResult {
    Data: ScreenedStockResult[],
    TotalData: number,
    TotalDataFiltered: number,
  }

export interface GetScreenerDataResult {
  Data: ScreenerDataResult[],
  TotalData: number,
  TotalDataFiltered: number,
}