export const SEVEN_LAWS = [
  {
    id: 1,
    title: 'Start Thy Purse to Fattening',
    short: 'Save 10%',
    description: 'For every ten coins thou placest within thy purse, take out for use but nine.',
    icon: 'PiggyBank',
    color: '#D4AF37',
    metric: 'savings_rate',
    target: 10,
  },
  {
    id: 2,
    title: 'Control Thy Expenditures',
    short: 'Budget Wisely',
    description: 'Budget thy expenses that thou mayest have coins to pay for thy necessities and enjoyments.',
    icon: 'Receipt',
    color: '#2d6a4f',
    metric: 'budget_adherence',
    target: 100,
  },
  {
    id: 3,
    title: 'Make Thy Gold Multiply',
    short: 'Invest',
    description: 'Put each coin to laboring that it may reproduce its kind.',
    icon: 'TrendingUp',
    color: '#457b9d',
    metric: 'investment_rate',
    target: 20,
  },
  {
    id: 4,
    title: 'Guard Thy Treasures from Loss',
    short: 'Protect',
    description: 'Guard thy treasure from loss by investing only where thy principal is safe.',
    icon: 'Shield',
    color: '#e63946',
    metric: 'emergency_fund',
    target: 100,
  },
  {
    id: 5,
    title: 'Make of Thy Dwelling a Profitable Investment',
    short: 'Own Assets',
    description: 'Own thy own home and make it a profitable investment.',
    icon: 'Home',
    color: '#f4a261',
    metric: 'asset_value',
    target: 100,
  },
  {
    id: 6,
    title: 'Ensure a Future Income',
    short: 'Plan Ahead',
    description: 'Provide in advance for the needs of thy growing age and the protection of thy family.',
    icon: 'Landmark',
    color: '#6c5ce7',
    metric: 'retirement_progress',
    target: 100,
  },
  {
    id: 7,
    title: 'Increase Thy Ability to Earn',
    short: 'Grow Skills',
    description: 'Cultivate thy own powers, study and become wiser, become more skillful.',
    icon: 'GraduationCap',
    color: '#00b4d8',
    metric: 'skill_investment',
    target: 100,
  },
];

export const WISDOM_QUOTES = [
  "Wealth, like a tree, grows from a tiny seed.",
  "A part of all you earn is yours to keep.",
  "Gold cometh gladly and in increasing quantity to any man who will put by not less than one-tenth of his earnings.",
  "Advice is one thing that is freely given away, but watch that you take only what is worth having.",
  "The hungrier one becomes, the clearer one's mind works.",
  "Where the determination is, the way can be found.",
  "Our acts can be no wiser than our thoughts.",
  "Better a little caution than a great regret.",
  "Wealth grows wherever men exert energy.",
  "Opportunity is a haughty goddess who wastes no time with those who are unprepared.",
  "Money is the medium by which earthly success is measured.",
  "The soul of a free man looks at life as a series of problems to be solved and solves them.",
  "Preceding accomplishment must be desire. Thy desires must be strong and definite.",
  "Good luck can be enticed by accepting opportunity.",
  "Men of action are favored by the goddess of good luck.",
];

export const EXPENSE_CATEGORIES = [
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#457b9d' },
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#f4a261' },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#2d6a4f' },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', color: '#e9c46a' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#e63946' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Music', color: '#6c5ce7' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#00b4d8' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#D4AF37' },
  { id: 'personal', name: 'Personal Care', icon: 'Sparkles', color: '#ff6b6b' },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', color: '#343a40' },
  { id: 'savings', name: 'Savings', icon: 'PiggyBank', color: '#2d6a4f' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6c757d' },
];

export const INVESTMENT_TYPES = [
  { id: 'stocks', name: 'Stocks', color: '#457b9d' },
  { id: 'bonds', name: 'Bonds', color: '#2d6a4f' },
  { id: 'real_estate', name: 'Real Estate', color: '#f4a261' },
  { id: 'crypto', name: 'Cryptocurrency', color: '#6c5ce7' },
  { id: 'mutual_funds', name: 'Mutual Funds', color: '#D4AF37' },
  { id: 'etf', name: 'ETFs', color: '#00b4d8' },
  { id: 'retirement', name: 'Retirement Fund', color: '#e63946' },
  { id: 'business', name: 'Business', color: '#343a40' },
  { id: 'other', name: 'Other', color: '#6c757d' },
];

export function getRandomWisdom() {
  return WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
}

export function getContextualWisdom(data) {
  const { totalIncome, totalSavings, totalExpenses, totalInvestments } = data;
  if (totalIncome === 0) return "The journey of wealth begins with a single coin. Start tracking your income today.";
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  if (savingsRate < 10) return "Remember the first law: save at least one-tenth of all you earn. Your purse grows lean.";
  if (savingsRate >= 10 && totalInvestments === 0) return "Well done saving! Now make thy gold multiply - consider investing your savings wisely.";
  if (totalExpenses > totalIncome * 0.7) return "Control thy expenditures! Your spending exceeds 70% of your income.";
  if (savingsRate >= 20) return "Excellent discipline! You save like the wealthiest merchants of Babylon.";
  return getRandomWisdom();
}
