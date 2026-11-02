import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function GuestRoute() {
  const { username, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (username) return <Navigate to="/conversations" replace />;

  return <Outlet />;
}
