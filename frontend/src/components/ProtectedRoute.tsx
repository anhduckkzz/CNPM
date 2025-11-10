import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/portal';

interface Props {
  allow?: Role[];
  redirect?: string;
}

const ProtectedRoute = ({ allow, redirect = '/' }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-lg font-semibold text-primary">
        Loading experience...
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to={redirect} replace />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to={`/portal/${role}/home`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
