import { ActivePositionLegEntry } from "./active-position-leg-entry";

export interface ActivePositionGroupEntry {
    isCollapsed: boolean;
    groupId: number;
    strategy: string;
    legs: Record<number, ActivePositionLegEntry>;
    product: string;
    hasFilledLeg: boolean;
    aggregatedUPL: number
  }