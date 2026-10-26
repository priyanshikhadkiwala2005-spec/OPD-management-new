import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try to load saved user from sessionStorage so page refresh keeps login
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('opd_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function login(userData) {
    // userData = { role: 'doctor'|'patient', ...fields }
    setUser(userData);
    sessionStorage.setItem('opd_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem('opd_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
