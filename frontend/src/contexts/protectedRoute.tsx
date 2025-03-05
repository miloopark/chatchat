import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authProvider";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = "/login" 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You could replace this with a loading spinner component
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
