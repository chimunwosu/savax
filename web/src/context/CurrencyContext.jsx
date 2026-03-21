import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { fetchExchangeRates, getCurrencyInfo } from '../config/currencies';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const { state } = useApp();
  const [rates, setRates] = useState(null);
  const currency = state.settings.currency || 'USD';
  const currencyInfo = getCurrencyInfo(currency);

  useEffect(() => {
    fetchExchangeRates('USD').then(setRates);
  }, []);

  const convert = useCallback((amount, from = 'USD', to = currency) => {
    if (!rates || from === to) return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return (amount / fromRate) * toRate;
  }, [rates, currency]);

  const formatAmount = useCallback((amount) => {
    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currencyInfo.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currencyInfo.symbol}${Number(amount).toLocaleString()}`;
    }
  }, [currencyInfo]);

  return (
    <CurrencyContext.Provider value={{ currency, currencyInfo, rates, convert, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
