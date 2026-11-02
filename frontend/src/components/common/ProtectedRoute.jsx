import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * Route guard ensuring only authenticated faculty administrators can access faculty views.
 *
 * Strict Design Invariants:
 * - If loading: displays institutional spinner and message while verifying session.
 * - If not authenticated: redirects to `/faculty/login` with preserved `state: { from: location }`.
 * - If authenticated: renders `<Outlet />` for child routes.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 animate-spin text-institute-gold mx-auto mb-3" />
        <p className="text-xs font-semibold text-institute-navy tracking-wide">
          Verifying faculty session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/faculty/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
