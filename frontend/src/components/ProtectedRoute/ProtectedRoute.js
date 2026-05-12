import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div></div>; // You can replace this with a loading spinner
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
