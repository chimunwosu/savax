export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', locale: 'en-NG' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', locale: 'en-AU' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', locale: 'en-IN' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭', locale: 'en-GH' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', locale: 'en-KE' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', locale: 'en-ZA' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', locale: 'zh-CN' },
];

export function getCurrencyInfo(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[1]; // default USD
}

const RATE_CACHE_KEY = 'savax_exchange_rates';
const RATE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function fetchExchangeRates(baseCurrency = 'USD') {
  try {
    const cached = localStorage.getItem(RATE_CACHE_KEY);
    if (cached) {
      const { rates, base, timestamp } = JSON.parse(cached);
      if (base === baseCurrency && Date.now() - timestamp < RATE_CACHE_TTL) {
        return rates;
      }
    }

    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    if (!res.ok) throw new Error('Failed to fetch rates');
    const data = await res.json();

    localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({
      rates: data.rates,
      base: baseCurrency,
      timestamp: Date.now(),
    }));

    return data.rates;
  } catch (e) {
    console.warn('Exchange rate fetch failed, using fallback rates:', e);
    return getFallbackRates(baseCurrency);
  }
}

function getFallbackRates(base) {
  // Approximate fallback rates relative to USD
  const usdRates = {
    USD: 1, NGN: 1550, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53,
    JPY: 149.5, INR: 83.5, GHS: 15.5, KES: 153, ZAR: 18.2, CNY: 7.24,
  };

  if (base === 'USD') return usdRates;

  const baseToUsd = 1 / (usdRates[base] || 1);
  const rates = {};
  for (const [code, rate] of Object.entries(usdRates)) {
    rates[code] = rate * baseToUsd;
  }
  rates[base] = 1;
  return rates;
}
