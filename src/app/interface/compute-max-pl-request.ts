import { CalculatePLStock } from "./calculate-pl-stock";
import { ComputeLegPl } from "./compute-leg-pl";

export interface ComputeMaxPlRequest {
    Strategy: string,
    Symbol: string | undefined,
    Stock: CalculatePLStock,
    Options: ComputeLegPl[]
}