export interface LegOrderRequest {
    Action: string,
    OrderType: string,
    Quantity: number,
    Rights: string,
    Expiry: string,
    StrikePrice: number
    LimitPrice: number,
    FairValue: number
}