import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { username, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!username) return <Navigate to="/login" replace />;

  return <Outlet />;
}
