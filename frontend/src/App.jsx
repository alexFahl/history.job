import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import AuthPage from "./pages/AuthPage";
import ProfileSelector from "./pages/ProfileSelector";
import Dashboard from "./pages/Dashboard";
import ApplicationDetail from "./pages/ApplicationDetail";

/**
 * ProtectedRoute
 * Blocks unauthenticated users and redirects to /auth if no token is found
 */
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/auth" replace />;
};

/**
 *
 *   /                  => redirect based on auth state
 *   /auth              => Login / Register (public)
 *   /profiles          => Profile selector hub (protected)
 *   /dashboard         => Job application dashboard (protected)
 *   /applications/:id  => Full application detail (protected)
 */
function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/profiles" : "/auth"} replace />}
      />

      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/profiles"
        element={
          <ProtectedRoute>
            <ProfileSelector />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute>
            <ApplicationDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
