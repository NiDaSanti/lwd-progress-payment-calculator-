// Tests for money.ts
import { parseToCents  } from './money';
import { describe, test, expect } from 'vitest';

describe('parseToCents', () => {
  test.each([
    ['2,300', 230000],
    ['.99', 99],
    ['1e3', null],
    ['0x10', null],
    ['-5.50', null],
    ['2300.999', null],
    ['  $2,300.50 ', 230050],
    ['0', 0],
    ['007', 700],
  ])('parseToCents(%s) -> %s', (input, expected) => {
    expect(parseToCents(input)).toBe(expected);
  })
});
