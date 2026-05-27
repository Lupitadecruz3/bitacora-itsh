import { useState } from 'react';
import AuthContext from './authContextBase';




export default function AuthProvider({ children }) {

  const [token, setToken] = useState(
    localStorage.getItem('token')
  );

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

}