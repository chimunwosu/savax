import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email,
          avatar: (firebaseUser.displayName || firebaseUser.email || 'S').charAt(0).toUpperCase(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function register({ name, email, password }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      setUser({
        id: cred.user.uid,
        name,
        email: cred.user.email,
        avatar: name.charAt(0).toUpperCase(),
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: getAuthErrorMessage(err.code) };
    }
  }

  async function login({ email, password }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: getAuthErrorMessage(err.code) };
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  async function updateUserProfile(updates) {
    try {
      if (updates.name) {
        await updateProfile(auth.currentUser, { displayName: updates.name });
      }
      setUser(prev => ({
        ...prev,
        name: updates.name || prev.name,
        avatar: updates.name ? updates.name.charAt(0).toUpperCase() : prev.avatar,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, error: getAuthErrorMessage(err.code) };
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      return { success: false, error: getAuthErrorMessage(err.code) };
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile: updateUserProfile,
      changePassword,
      resetPassword,
    }}>
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
