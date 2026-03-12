const formatter = new Intl.NumberFormat('sw-TZ', {
  style: 'currency',
  currency: 'TZS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatTZS(amount: number): string {
  return formatter.format(amount);
}
