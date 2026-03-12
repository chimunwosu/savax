export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthRange(months = 6) {
  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

export function calcCompoundInterest(principal, rate, years, monthly = 0) {
  let total = principal;
  const monthlyRate = rate / 100 / 12;
  for (let m = 0; m < years * 12; m++) {
    total = total * (1 + monthlyRate) + monthly;
  }
  return total;
}

export function calcDebtPayoff(balance, rate, payment) {
  if (payment <= 0 || rate < 0) return { months: Infinity, totalPaid: Infinity };
  const monthlyRate = rate / 100 / 12;
  let remaining = balance;
  let months = 0;
  let totalPaid = 0;
  while (remaining > 0.01 && months < 600) {
    const interest = remaining * monthlyRate;
    const principal = Math.min(payment - interest, remaining);
    if (principal <= 0) return { months: Infinity, totalPaid: Infinity };
    remaining -= principal;
    totalPaid += payment;
    months++;
  }
  return { months, totalPaid };
}

export function groupByMonth(items, dateField = 'date') {
  const groups = {};
  items.forEach(item => {
    const month = item[dateField]?.substring(0, 7);
    if (month) {
      if (!groups[month]) groups[month] = [];
      groups[month].push(item);
    }
  });
  return groups;
}

export function sumByField(items, field = 'amount') {
  return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}
