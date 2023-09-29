import { HistoricalOrderLeg } from 'src/app/interface/historical-order-leg';

export interface HistoricalOrderResult {
    Data: [
      {
        isCollapsed: boolean,
        PortfolioId: number,
        PortfolioName: string,
        Strategy: string,
        Direction: string,
        Intention: string,
        Underlying: string,
        MaxOrderTime: number,
        Leg1:HistoricalOrderLeg,
        Leg2:HistoricalOrderLeg,
        Leg3:HistoricalOrderLeg,
        Leg4:HistoricalOrderLeg
      }
    ],
    TotalData: number,
    TotalDataFiltered: number
  }