import { CalculatePLStock } from "./calculate-pl-stock";
import { ComputeLegState } from "./compute-leg-state";

export interface CalculatePLRequest {
    Direction: string,
    Quantity: number,
    Stock: CalculatePLStock,
    CurrentState: ComputeLegState,
    NextState: ComputeLegState
}