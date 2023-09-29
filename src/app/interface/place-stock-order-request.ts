export interface PlaceStockOrderRequest {
    AccountId: string,
    Broker: string,
    Symbol: string | undefined,
    Action: string,
    OrderType: string,
    Quantity: number,
    Validity: string,
    LimitPrice: number
}