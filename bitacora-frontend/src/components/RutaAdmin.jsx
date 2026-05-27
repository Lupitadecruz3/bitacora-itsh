import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function RutaAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" />;
}
