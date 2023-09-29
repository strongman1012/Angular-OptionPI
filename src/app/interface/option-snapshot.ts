export interface OptionSnapshot {
    StrikePrice: number;
    Call: {
        isSelected: boolean;
        Ticker: string;
        AskVolume: number;
        Ask: number;
        BidVolume: number;
        Bid: number;
        Last: number;
        PctChange: number;
        BreakEvenPct: number;
        OtmProbabilityPct: number;
        DailyVol: number;
        IVol: number;
        Delta: number;
        Gamma: number;
        Vega: number;
        Theta: number;
    };
    Put: {
        isSelected: boolean;
        Ticker: string;
        AskVolume: number;
        Ask: number;
        BidVolume: number;
        Bid: number;
        Last: number;
        PctChange: number;
        BreakEvenPct: number;
        OtmProbabilityPct: number;
        DailyVol: number;
        IVol: number;
        Delta: number;
        Gamma: number;
        Vega: number;
        Theta: number;
    };
  }