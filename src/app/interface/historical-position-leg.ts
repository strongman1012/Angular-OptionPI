export interface HistoricalPositionLeg
{
    Symbol: string,
    Currency: string,
    Position: string,
    Quantity: number,
    Entry: number,
    Exit: number,
    RealizedPL: number,
    RealizedPLPct: number,
    NetPL: number,
    NetPLPct: number,
    ContractType: number,
    Expiry: string,
    StrikePrice: number,
    Multiplier: number,
    EntryTime: number,
    ExitTime: number,
  }