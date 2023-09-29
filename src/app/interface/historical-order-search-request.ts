export interface HistoricalOrderSearchRequest {
    accountId: string,
    search: string,
    sort: string,
    order: string,
    offset: number,
    limit: number
}