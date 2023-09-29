export interface ActivePositionLegEntry {
    assetType: string;
    broker: string;
    currency: string;
    dealSize: number;
    direction: string;
    openingPrice: number;
    product: string;
    tradeVenue: string;
    unrealizedPNL: number;
    unrealizedPNLPct: number;
    right: string;
    expiry: number;
    strike: number;
    multiplier: number;
    entryTime: number;
    groupId: number;
    legId: number;
}