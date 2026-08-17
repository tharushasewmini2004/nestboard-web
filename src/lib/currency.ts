export type Currency = 'LKR' | 'USD';

/** LKR per 1 USD — update for live rates in production */
export const LKR_PER_USD = 300;

const lkrFormatter = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function lkrToUsd(amountLkr: number) {
  return Math.round(amountLkr / LKR_PER_USD);
}

export function formatCurrency(amountLkr: number, currency: Currency = 'LKR') {
  if (currency === 'USD') return usdFormatter.format(lkrToUsd(amountLkr));
  return `Rs. ${lkrFormatter.format(amountLkr)}`;
}

/** Primary + secondary price line, e.g. "Rs. 45,000 · $150" */
export function formatPriceDual(amountLkr: number, primary: Currency = 'LKR') {
  const secondary = primary === 'LKR' ? 'USD' : 'LKR';
  return `${formatCurrency(amountLkr, primary)} · ${formatCurrency(amountLkr, secondary)}`;
}
