export interface PayoffTableEntry {
    TimeToExpiry: number;
    ExpectedPayoff: number;
    WinningChance: number;
    IsSelected: boolean | undefined;
  }