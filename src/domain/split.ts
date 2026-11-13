/*  
Next is split.ts, using the same approach: write the test table first 
(the $7,000 / $2,300 → $4,700 / 67.14% case and the others), 
then write the code until they pass.
Since split.ts depends on types.ts, create types.ts first with:

CostCode: id, code, label
SubLine: id, subName, costCodeId, amountCents: Cents
*/

import type { Cents } from "./money";

export type CostCode = {
  id: string;
  code: string;
  label: string;
}

export type SubLine = {
  id: string;
  subName: string;
  costCodeId: string;
  amountCents: Cents
}

// A result type with the two outputs:
// A function signature that takes totalCents and subLine.

export type SplitResult = {
  remainingCents: Cents;
  remainingPercentage: number;
}

export function calculateRemainingSplit(totalCents: Cents, subLine: SubLine): SplitResult {
  //for now return a placeholder object so TypeScript doesn't complain
  const remainingRaw = totalCents - subLine.amountCents;;
  const remainingCents = Math.max(0, remainingRaw) as Cents;
  if(totalCents === 0) {
    return {
      remainingCents: 0 as Cents,
      remainingPercentage: 0
    }
  }
  const remainingPercentageRaw = (remainingCents / totalCents) * 100;
  const remainingPercentage = Math.round(remainingPercentageRaw * 100) / 100; // round to 2 decimal places
  
  return {
    remainingCents,
    remainingPercentage
  }
}