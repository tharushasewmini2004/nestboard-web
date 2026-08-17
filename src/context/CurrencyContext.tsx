import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { formatCurrency, formatPriceDual, type Currency } from '@/lib/currency';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
}

const STORAGE_KEY = 'nestboard_currency';

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'USD' ? 'USD' : 'LKR';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  const toggleCurrency = () => setCurrency(currency === 'LKR' ? 'USD' : 'LKR');

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

/** Format stored LKR amount in the user's selected currency */
export function useFormatPrice() {
  const { currency } = useCurrency();
  return useCallback(
    (amountLkr: number) => ({
      primary: formatCurrency(amountLkr, currency),
      dual: formatPriceDual(amountLkr, currency),
    }),
    [currency],
  );
}
