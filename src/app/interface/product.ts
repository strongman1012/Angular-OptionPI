export interface Product {
    ProductId: number,
    Symbol: string,
    ProductIconURL: string,
    ProductName: string,
    Currency: string,
    Sector: {
        SectorId: number,
        SectorName: string
    },
    Industry: {
        IndustryId: number,
        IndustryName: string
    }
}