import { LegOrderRequest } from "./leg-order-request";

export interface PlaceStrategyOrderRequest {
    AccountId: string,
    Broker: string,
    Strategy: string,
    Symbol: string | undefined,
    Action: string,
    OrderType: string,
    Quantity: number,
    Validity: string,
    LimitPrice: number,
    Legs: LegOrderRequest[]
}