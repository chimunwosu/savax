import { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';

const AppContext = createContext();
const STORAGE_KEY = 'savax_data';

const defaultState = {
  incomes: [],
  expenses: [],
  investments: [],
  goals: [],
  debts: [],
  assets: [],
  settings: {
    savingsRate: 10,
    investmentRate: 20,
    livingRate: 70,
    currency: 'USD',
    name: '',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, { ...action.payload, id: generateId() }] };
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, { ...action.payload, id: generateId() }] };
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, { ...action.payload, id: generateId() }] };
    case 'DELETE_INVESTMENT':
      return { ...state, investments: state.investments.filter(i => i.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, { ...action.payload, id: generateId() }] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'UPDATE_INVESTMENT':
      return { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, { ...action.payload, id: generateId() }] };
    case 'UPDATE_DEBT':
      return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'DELETE_DEBT':
      return { ...state, debts: state.debts.filter(d => d.id !== action.payload) };
    case 'ADD_ASSET':
      return { ...state, assets: [...state.assets, { ...action.payload, id: generateId() }] };
    case 'DELETE_ASSET':
      return { ...state, assets: state.assets.filter(a => a.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'IMPORT_DATA':
      return { ...defaultState, ...action.payload, settings: { ...defaultState.settings, ...action.payload?.settings } };
    case 'LOAD_DATA':
      return { ...defaultState, ...action.payload, settings: { ...defaultState.settings, ...action.payload?.settings } };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) dispatch({ type: 'LOAD_DATA', payload: JSON.parse(data) });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
