/*
Step 1 — domain/money.ts

This is the foundation. It needs:

A Cents type. A branded type like number & { __brand: 'Cents' } stops you from accidentally passing a plain dollar number where cents are expected.
parseToCents(input: string): Cents | null. Strip $ and commas, and return null for blank or invalid input. Work from the string (split on ., pad the decimals to 2 digits) rather than using parseFloat(x) * 100, which can be off by a cent on some values.
formatCents(c: Cents): string. Use Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).
*/

export type Cents = number & { __brand: 'Cents'};

export function parseToCents(input: string): Cents | null {
  // Strip $ and commas
  const cleanedInput = input.replace(/[$,]/g, '').trim();

  // Return null for blank or invalid input
  if (cleanedInput === '' || !/^\d*(\.\d{0,2})?$/.test(cleanedInput)) {
    return null;
  }

  // Split on decimal point
  const [dollars, cents] = cleanedInput.split('.');

  // Pad the cents to 2 digits
  const paddedCents = (cents || '00').padEnd(2, '0').slice(0, 2);

  // Convert to Cents
  const totalCents = parseInt(dollars || '0', 10) * 100 + parseInt(paddedCents, 10);

  return totalCents as Cents;
}

export function formatCents(c: Cents): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c / 100);

}