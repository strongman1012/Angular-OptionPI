import { HistoricalPositionLeg } from 'src/app/interface/historical-position-leg';

export interface HistoricalPositionResult {
  Data: [
    {
      isCollapsed: boolean,
      PortfolioId: number,
      PortfolioName: string,
      Strategy: string,
      Direction: string,
      Underlying: string,
      AggregatedRealizedPL: number,
      AggregatedNetPL: number,
      MaxEntryTime: number,
      MaxExitTime: number,
      Leg1: HistoricalPositionLeg,
      Leg2: HistoricalPositionLeg,
      Leg3: HistoricalPositionLeg,
      Leg4: HistoricalPositionLeg
    }
  ],
  TotalData: number,
  TotalDataFiltered: number
}