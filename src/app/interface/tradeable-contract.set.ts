export interface TradeableContractSet
{
    Legs: TradeableContract[]
}

export interface TradeableContract
{
    Symbol: string,
    Action: string,
    LimitPrice: number,
    StrikePrice: number,
    Rights: string,
    Direction: string,    
    Quantity: number,    
    Expiry: string,
    FairValue: number,
    OrderType: string
}