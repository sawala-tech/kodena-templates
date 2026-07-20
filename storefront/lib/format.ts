// Format an integer minor-unit-free IDR amount, e.g. 100000 → "Rp 100.000".
// Sawala money fields are whole-rupiah integers.
export function formatMoney(amount: number, currency = 'IDR'): string {
  if (currency === 'IDR') return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`
  return `${currency} ${new Intl.NumberFormat('en-US').format(amount)}`
}
