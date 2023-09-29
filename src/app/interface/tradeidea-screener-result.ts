import { TradeIdeaResult } from "./tradeidea-result";

export interface TradeIdeaScreenerResult {
    Data: TradeIdeaResult[],
    TotalData: number;
    TotalDataFiltered: number;
  }