import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

// Holds the signed-in Firebase user. `loading` stays true until Firebase reports the
// first state, so protected routes never redirect a user whose session is still being restored.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signup: authService.signup,
      login: authService.login,
      loginWithGoogle: authService.loginWithGoogle,
      logout: authService.logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
