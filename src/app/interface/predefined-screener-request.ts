import { Prediction } from 'src/app/interface/prediction';

export interface PredefinedScreenerRequest {
    search: string,
    sort: string,
    order: string,
    offset: number,
    limit: number,
    strategy?: string,
    prediction?: Prediction
}