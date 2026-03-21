import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { isFirebaseConfigured, db } from '../config/firebase';
import { useAuth } from './AuthContext';
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
    case 'SET_STATE':
      return { ...defaultState, ...action.payload, settings: { ...defaultState.settings, ...action.payload?.settings } };

    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) };

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_INVESTMENT':
      return { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INVESTMENT':
      return { ...state, investments: state.investments.filter(i => i.id !== action.payload) };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_DEBT':
      return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'DELETE_DEBT':
      return { ...state, debts: state.debts.filter(d => d.id !== action.payload) };

    case 'ADD_ASSET':
      return { ...state, assets: [...state.assets, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_ASSET':
      return { ...state, assets: state.assets.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ASSET':
      return { ...state, assets: state.assets.filter(a => a.id !== action.payload) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'IMPORT_DATA':
      return { ...defaultState, ...action.payload };

    default:
      return state;
  }
}

// ── Local Storage helpers ──
function loadLocalState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings } };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return defaultState;
}

function saveLocalState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// ── Firestore helpers ──
const COLLECTIONS = ['incomes', 'expenses', 'investments', 'goals', 'debts', 'assets'];

async function loadFirestoreData(uid) {
  const { collection, doc, getDocs, getDoc } = await import('firebase/firestore');
  const data = { ...defaultState };

  const settingsDoc = await getDoc(doc(db, 'users', uid, 'profile', 'settings'));
  if (settingsDoc.exists()) {
    data.settings = { ...defaultState.settings, ...settingsDoc.data() };
  }

  const results = await Promise.all(
    COLLECTIONS.map(async (name) => {
      const snapshot = await getDocs(collection(db, 'users', uid, name));
      return { name, docs: snapshot.docs.map(d => ({ ...d.data(), id: d.id })) };
    })
  );
  results.forEach(({ name, docs }) => { data[name] = docs; });
  return data;
}

async function syncToFirestore(uid, action, newState) {
  const { doc, setDoc, deleteDoc, writeBatch } = await import('firebase/firestore');
  const { type, payload } = action;

  try {
    if (type === 'UPDATE_SETTINGS') {
      await setDoc(doc(db, 'users', uid, 'profile', 'settings'), newState.settings);
      return;
    }
    if (type === 'IMPORT_DATA') {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid, 'profile', 'settings'), newState.settings);
      for (const col of COLLECTIONS) {
        for (const item of newState[col]) {
          batch.set(doc(db, 'users', uid, col, item.id), item);
        }
      }
      await batch.commit();
      return;
    }
    if (type === 'SET_STATE') return;

    const parts = type.split('_');
    const op = parts[0];
    const entityMap = {
      INCOME: 'incomes', EXPENSE: 'expenses', INVESTMENT: 'investments',
      GOAL: 'goals', DEBT: 'debts', ASSET: 'assets',
    };
    const colName = entityMap[parts.slice(1).join('_')];
    if (!colName) return;

    if (op === 'ADD' || op === 'UPDATE') {
      const item = op === 'ADD'
        ? newState[colName][newState[colName].length - 1]
        : payload;
      if (item) await setDoc(doc(db, 'users', uid, colName, item.id), item);
    } else if (op === 'DELETE') {
      await deleteDoc(doc(db, 'users', uid, colName, payload));
    }
  } catch (err) {
    console.error('Firestore sync error:', err);
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [state, baseDispatch] = useReducer(reducer, defaultState, () =>
    isFirebaseConfigured ? defaultState : loadLocalState()
  );
  const [dataLoading, setDataLoading] = useState(isFirebaseConfigured);

  // Load data from Firestore when user logs in (Firebase mode only)
  useEffect(() => {
    if (!isFirebaseConfigured || !user?.id) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    loadFirestoreData(user.id)
      .then(data => baseDispatch({ type: 'SET_STATE', payload: data }))
      .catch(err => console.error('Failed to load user data:', err))
      .finally(() => setDataLoading(false));
  }, [user?.id]);

  // Save to localStorage in local mode
  useEffect(() => {
    if (!isFirebaseConfigured) {
      saveLocalState(state);
    }
  }, [state]);

  const dispatch = useCallback((action) => {
    baseDispatch(action);

    if (isFirebaseConfigured && user?.id && action.type !== 'SET_STATE') {
      const newState = reducer(state, action);
      syncToFirestore(user.id, action, newState);
    }
  }, [user?.id, state]);

  return (
    <AppContext.Provider value={{ state, dispatch, dataLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
