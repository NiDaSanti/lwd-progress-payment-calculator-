/*
Then write split.test.ts before split.ts, the same way you did for money.
*/

//Tests for Split.ts
// i need to import the types from split.ts and the Cents type from money.ts

import { describe, test, expect } from 'vitest';
import type { Cents } from './money';
import { calculateRemainingSplit, type SubLine} from './split';

// lets get real test data here
// lets go in order of the test cases in the table, starting with the $7,000 / $2,300 → $4,700 / 67.14% case
describe('calculateRemainingSplit', () => {
  test.each([
    // [name, totalCents, subLineAmountCents, expectedRemainingCents, expectedRemainingPercentage]
    ['7000 / 2300 -> 4700 / 67.14%', 700000, 230000, 470000, 67.14],
    ['total is 0 -> 0 / 0%', 0, 50000, 0, 0],
    ['subline exceeds total -> 0 / 0%', 700000, 900000, 0, 0],

    // high-value scenarios (millions)
    ['$5,000,000 / $1,250,000 -> $3,750,000 / 75.00%', 500000000, 125000000, 375000000, 75.0],
    ['$12,345,678.90 / $2,345,678.90 -> $10,000,000.00 / 81.00%', 1234567890, 234567890, 1000000000, 81.0],
    ['$6,750,000 / $ 14,250.75 -> $6,735,749.25 / 99.79%', 675000000, 1425075, 673574925, 99.79],
  ])(
    'calculateRemainingSplit: %s',
    (_name, totalRaw, subLineRaw, expectedRemainingRaw, expectedPct) => {
      const subLine: SubLine = {
        id: 'case-1',
        subName: 'Sub',
        costCodeId: 'cc-1',
        amountCents: subLineRaw as Cents
      };

      const result = calculateRemainingSplit(totalRaw as Cents, subLine);

      expect(result.remainingCents).toBe(expectedRemainingRaw as Cents);
      expect(result.remainingPercentage).toBeCloseTo(expectedPct, 2);
    }
  );
});


