import { ContractLeg } from "./contract-leg";

export interface CalculateAmountRequest {
    Amount: number,
    Leg1: ContractLeg,
    Leg2: ContractLeg,
    Leg3: ContractLeg,
    Leg4: ContractLeg
}