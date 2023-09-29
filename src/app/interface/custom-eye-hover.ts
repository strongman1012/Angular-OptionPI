export interface WatchList{
    Strategy: string;
    Symbol: string;
    Name:string;
    OptionContracts:string;
    Bid:number;
    Ask:number;
    Last:number;
    Price:number;
}

export interface AiSignalResult {
    Name: string;
    OptionContracts: string;
    Strategy: string;
    Timestamp: number;
    Underlying: string;
}
  
export type CustomEyeHoverInput = AiSignalResult | WatchList