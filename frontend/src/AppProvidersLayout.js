import React from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ProfileProvider } from "./ProfileContext";

export default function AppProvidersLayout({ children }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        {children ?? <Outlet />}
      </ProfileProvider>
    </AuthProvider>
  );
}