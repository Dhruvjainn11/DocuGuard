// src/components/layout/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ProtectedRoute = () => {
  // 1. Reach into our global state to grab the user's status
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  // 2. The Waiting Room
  // When the app first loads, React is incredibly fast. It might try to render the Dashboard 
  // BEFORE our Axios request has finished asking the backend if the cookie is valid.
  // We show a loading state so we don't accidentally kick a valid user to the login screen.
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Checking vault access...</p>
      </div>
    );
  }

  // 3. The Kick
  // If the backend said "no cookie" or "invalid token", we teleport them to login.
  // The "replace" attribute ensures they can't just hit the browser's "Back" button to sneak back in.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 4. The VIP Access
  // <Outlet /> is a special React Router component. It essentially means:
  // "Render whatever child component the user was actually trying to visit."
  return <Outlet />;
};

export default ProtectedRoute;