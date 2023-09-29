export interface ActiveOrderLegEntry {
    assetType: string;
    broker: string;
    currency: string;
    dealSize: number;
    direction: string;
    filled: number;
    id: string;
    limitPrice: number;
    openingPrice: number;
    orderId: number;
    orderStatus: string;
    orderTime: number;
    product: string;
    reason: string;
    remaining: number;
    stopPrice: number;
    tradeTime: number;
    tradeVenue: string;
    type: string;
    validity: string;
    right: string;
    expiry: number;
    strike: number;
    multiplier: number;
}