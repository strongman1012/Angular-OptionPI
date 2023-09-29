import { AnalysisEntry } from "./analysis-entry";

export interface PayoffWithIVolRequest {
    AnalysisEntry: AnalysisEntry,
    SelectedDays: number[],
    SelectedIVol: number[]
}