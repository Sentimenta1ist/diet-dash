import React, { createContext, useContext, useState, useEffect } from "react";
import defaultAxios from "./utils/defaultAxios"; // Use this for auth-specific calls
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, resetProfileState } from "./redux/slices/profileSlice";
import { fetchProfiles, resetProfilesState } from "./redux/slices/profilesDataSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      try {
        // You may add an API call here to verify token validity if needed
        setIsAuthenticated(true);
        dispatch(fetchProfiles());
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  const signup = async (firstName, lastName, email, password) => {
    try {
      await defaultAxios.post(`/auth/register`, {
        firstName,
        lastName,
        login: email,
        password,
      });
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await defaultAxios.post(`/auth/login`, {
        login: email,
        password,
      });
      const token = response.data.token;
      const userRole = response.data.userRole;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", userRole);
      setIsAuthenticated(true);
      dispatch(fetchProfiles());
      navigate("/home");
      return null;
    } catch (error) {
      console.error("Error logging in:", error);
      return error.response?.data?.message || "An unexpected error occurred.";
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    dispatch(resetProfileState());
    dispatch(resetProfilesState());
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
