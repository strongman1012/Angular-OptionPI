import { AnalysisEntry } from "./analysis-entry";

export interface PayoffProbabilityChartRequest {
    AnalysisEntry: AnalysisEntry,
    IVolAtExpiry: number,
    PriceAtExpiry: number,
    TimeToExpiry: number
}