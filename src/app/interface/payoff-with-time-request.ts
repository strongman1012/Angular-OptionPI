import { AnalysisEntry } from "./analysis-entry";

export interface PayoffWithTimeRequest {
    AnalysisEntry: AnalysisEntry,
    SelectedDays: number[],
    SelectedIVol: number[]
}