import { AnalysisEntry } from "./analysis-entry";

export interface PayoffProbabilityRequest {
    AnalysisEntry: AnalysisEntry,
    IVolAtExpiry: number,
    PriceAtExpiry: number
}