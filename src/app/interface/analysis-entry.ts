export interface AnalysisEntry {
    Type: string,
    ContractType: number,
    Symbol: string,
    CurrentInterestRate: number,
    ExpectedInterestRate: number,
    CurrentStockReturn: number,
    ExpectedStockReturn: number,
    CurrentIVol: number,
    ExpectedIVol: number,
    CurrentDivYield: number,
    ExpectedDivYield: number,
    Expiry: string
}