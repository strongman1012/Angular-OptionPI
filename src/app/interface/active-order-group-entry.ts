import { ActiveOrderLegEntry } from 'src/app/interface/active-order-leg-entry';

export interface ActiveOrderGroupEntry {
    isCollapsed: boolean;
    groupId: number;
    strategy: string;
    intention: string;
    legs: Record<number, ActiveOrderLegEntry>;
    product: string;    
}