import { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = 'savax_auth';
const USERS_STORAGE_KEY = 'savax_users';

// ── Local helpers (fallback when Firebase is not configured) ──
function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || []; } catch { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); }
function getStoredAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)); } catch { return null; }
}
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      let unsubscribe = () => {};
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            setUser({
              id: fbUser.uid,
              name: fbUser.displayName || '',
              email: fbUser.email,
              avatar: (fbUser.displayName || fbUser.email || 'S').charAt(0).toUpperCase(),
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      });
      return () => unsubscribe();
    } else {
      // Local fallback
      const stored = getStoredAuth();
      if (stored) {
        const users = getStoredUsers();
        const found = users.find(u => u.id === stored.id);
        if (found) setUser({ id: found.id, name: found.name, email: found.email, avatar: found.avatar });
        else localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setLoading(false);
    }
  }, []);

  async function register({ name, email, password }) {
    if (isFirebaseConfigured) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        setUser({ id: cred.user.uid, name, email: cred.user.email, avatar: name.charAt(0).toUpperCase() });
        return { success: true };
      } catch (err) {
        return { success: false, error: getAuthErrorMessage(err.code) };
      }
    } else {
      const users = getStoredUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name, email: email.toLowerCase(), password: hashPassword(password),
        avatar: name.charAt(0).toUpperCase(), createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      const session = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true };
    }
  }

  async function login({ email, password }) {
    if (isFirebaseConfigured) {
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (err) {
        return { success: false, error: getAuthErrorMessage(err.code) };
      }
    } else {
      const users = getStoredUsers();
      const found = users.find(u => u.email === email.toLowerCase());
      if (!found) return { success: false, error: 'No account found with this email.' };
      if (found.password !== hashPassword(password)) return { success: false, error: 'Incorrect password. Please try again.' };
      const session = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true };
    }
  }

  async function logout() {
    if (isFirebaseConfigured) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  async function updateUserProfile(updates) {
    if (isFirebaseConfigured) {
      try {
        const { updateProfile } = await import('firebase/auth');
        if (updates.name) await updateProfile(auth.currentUser, { displayName: updates.name });
        setUser(prev => ({ ...prev, name: updates.name || prev.name, avatar: updates.name ? updates.name.charAt(0).toUpperCase() : prev.avatar }));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      const users = getStoredUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) return { success: false, error: 'User not found.' };
      users[idx] = { ...users[idx], ...updates, avatar: updates.name ? updates.name.charAt(0).toUpperCase() : users[idx].avatar };
      saveUsers(users);
      const session = { id: users[idx].id, name: users[idx].name, email: users[idx].email, avatar: users[idx].avatar };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true };
    }
  }

  async function changePassword(currentPassword, newPassword) {
    if (isFirebaseConfigured) {
      try {
        const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        return { success: true };
      } catch (err) {
        return { success: false, error: getAuthErrorMessage(err.code) };
      }
    } else {
      const users = getStoredUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) return { success: false, error: 'User not found.' };
      if (users[idx].password !== hashPassword(currentPassword)) return { success: false, error: 'Current password is incorrect.' };
      users[idx].password = hashPassword(newPassword);
      saveUsers(users);
      return { success: true };
    }
  }

  async function resetPassword(email) {
    if (isFirebaseConfigured) {
      try {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (err) {
        return { success: false, error: getAuthErrorMessage(err.code) };
      }
    } else {
      const users = getStoredUsers();
      const found = users.find(u => u.email === email.toLowerCase());
      if (!found) return { success: false, error: 'No account found with this email.' };
      // In local mode, just show success (can't actually email)
      return { success: true };
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile: updateUserProfile, changePassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    default: return 'An error occurred. Please try again.';
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
