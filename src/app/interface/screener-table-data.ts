export interface GetScreenerDataRequest {
    SelectBy: string,
    DefaultUniverse?: string,
    TimeToExpiry?: number,
    BreakevenDistance?: number,
    Strategy: string,
    OtmDistance?: number,
    Sort: string,
    Order: string,
    Offset: number,
    Limit: number,
}