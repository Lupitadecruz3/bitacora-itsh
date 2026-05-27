import React, { createContext, useState, useMemo, useCallback, useContext } from 'react';

// Definimos el contexto aquí mismo para evitar errores de importación desde otros archivos
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Cargamos el token inicial desde localStorage (si existe)
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null);

  const login = useCallback((newToken) => {
    // Ahora aceptamos el token real generado por el servidor
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
  }, []);

  // Proveemos los valores del contexto de forma estable
  const value = useMemo(() => ({
    token,
    login,
    logout,
    isAdmin: !!token,
    userRole: token ? 'admin' : 'public'
  }), [token, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder al auth fácilmente
export const useAuth = () => useContext(AuthContext);
