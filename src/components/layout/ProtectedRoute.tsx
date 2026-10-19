import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoader } from "@/components/ui/Loading";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
