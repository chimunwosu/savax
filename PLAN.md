# Savax: Firebase Backend + Multi-Currency Support

## Feature 1: Firebase Backend & Database

Replace localStorage with Firebase Auth + Firestore for real accounts, persistent data, and cross-device sync.

### Steps:

1. **Install Firebase SDK**
   - `npm install firebase` in `web/`

2. **Create Firebase config** (`web/src/config/firebase.js`)
   - Firebase app initialization with config
   - Export `auth`, `db` (Firestore), and `app`
   - User will need to create a Firebase project and paste their config

3. **Rewrite AuthContext** (`web/src/context/AuthContext.jsx`)
   - Replace localStorage auth with Firebase Auth (createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail)
   - Use `onAuthStateChanged` listener for persistent sessions
   - Remove the custom hash/localStorage approach
   - Keep the same API surface (login, register, logout, resetPassword) so no component changes needed

4. **Rewrite AppContext** (`web/src/context/AppContext.jsx`)
   - Replace localStorage with Firestore
   - Store data under `users/{uid}/` collection structure:
     - `users/{uid}/profile` — settings doc
     - `users/{uid}/incomes` — subcollection
     - `users/{uid}/expenses` — subcollection
     - `users/{uid}/investments` — subcollection
     - `users/{uid}/goals` — subcollection
     - `users/{uid}/debts` — subcollection
     - `users/{uid}/assets` — subcollection
   - Keep the reducer pattern but sync dispatches to Firestore
   - Load initial data from Firestore on auth
   - Add loading states while data syncs

5. **Update Header** — no changes needed (same useAuth API)

6. **Update Settings export/import** — keep working but now exports from Firestore data

## Feature 2: Multi-Currency Support

Add currency selection with symbols, formatting, and live exchange rates.

### Steps:

7. **Create currency config** (`web/src/config/currencies.js`)
   - Define supported currencies with symbols, names, locale info:
     - NGN (₦), USD ($), EUR (€), GBP (£), CAD (C$), AUD (A$), JPY (¥), INR (₹)
   - Free exchange rate API for conversions (exchangerate-api.com or similar free tier)

8. **Update `formatCurrency` in helpers.js**
   - Accept currency parameter from settings
   - Use `Intl.NumberFormat` with the correct currency code and locale

9. **Create CurrencyContext** (`web/src/context/CurrencyContext.jsx`)
   - Fetch exchange rates on load (cached for 1 hour)
   - Provide `convert(amount, fromCurrency, toCurrency)` function
   - Provide `formatAmount(amount)` that uses user's selected currency

10. **Update all components** to use currency from settings
    - Dashboard, Income, Expenses, Investments, Goals, DebtPayoff, Calculator, NetWorth, Reports, Advisor
    - Pass `state.settings.currency` to `formatCurrency()` calls

11. **Update Settings page**
    - Show currency with flag/symbol in dropdown
    - Show currency preview

## Files to create:
- `web/src/config/firebase.js`
- `web/src/config/currencies.js`
- `web/src/context/CurrencyContext.jsx`

## Files to modify:
- `web/package.json` (add firebase)
- `web/src/context/AuthContext.jsx` (Firebase Auth)
- `web/src/context/AppContext.jsx` (Firestore)
- `web/src/utils/helpers.js` (formatCurrency update)
- `web/src/App.jsx` (add CurrencyProvider)
- `web/src/components/settings/Settings.jsx` (enhanced currency picker)
- All component files (pass currency to formatCurrency)
