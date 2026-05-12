import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { useProfile } from "../../ProfileContext";

const RedirectIfLoggedIn = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { loading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !loading) {
      setIsChecking(false);

      if (isAuthenticated) {
        if (location.pathname === "/login" || location.pathname === "/signup") {
          navigate("/home", { replace: true });
        }
      }
    }
  }, [isAuthenticated, isAuthLoading, loading, navigate, location.pathname]);

  if (isChecking) {
    return null; // Show nothing until authentication is checked
  }

  return children;
};

export default RedirectIfLoggedIn;
