export interface ComputeLegState {
  Legs: [{
    LegId: number,
    IV: number
  }],
  StockPrice: number,
  Period: Date
}