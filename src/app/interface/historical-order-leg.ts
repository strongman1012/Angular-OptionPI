export interface HistoricalOrderLeg
{
    Symbol: string,
    Currency: string,
    Action: string,
    Quantity: number,
    LimitPrice: number,
    StopPrice: number,
    Status: string,
    Type: string,
    ContractType: string,
    Expiry: string,
    StrikePrice: number,
    Multiplier: number,
    OrderTime: number,
    Intention: string
}