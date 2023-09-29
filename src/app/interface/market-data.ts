export interface MarketData {
    BidPrice: number;
    AskPrice: number;
    BidSize: number;
    AskSize: number;
    BidTime: string;
    AskTime: string;
    MidPrice: number;
    LastTradedPrice: number;
    LastTradedTime: string;
    LastTradedSize: number;
    CumulativeVolume: number;
    Open: number;
    High: number;
    Low: number;
    PrevClose: number;
    Timestamp: string;
    ProductId: number;
    Symbol: string;
    TradeVenue: string;
    AssetClass: string;
  }