import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import LandingPage from "./components/Landing/LandingPage";
import PublicDietPlan from "./components/PublicDietPlan/PublicDietPlan";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";
import EmailConfirmation from "./components/Login/EmailConfirmation/EmailConfirmation";
import ForgotPassword from "./components/Login/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/Login/ForgotPassword/ResetPassword";
import NotFound from "./components/Errors/NotFound/NotFound";

import HomePage from "./components/HomePage/HomePage";
import Home from "./components/HomePage/Home/Home";
import AddProfile from "./components/HomePage/AddProfile/AddProfile";
import Profile from "./components/HomePage/Profile/Profile";
import Diet from "./components/HomePage/Diet/Diet";
import ProductList from "./components/HomePage/ProductList/ProductList";
import ProfileList from "./components/HomePage/ProfileList/ProfileList";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import RedirectIfLoggedIn from "./components/Redirects/RedirectIfLoggedIn";
import RedirectIfNoProfiles from "./components/Redirects/RedirectIfNoProfiles";

import PremiumRequiredModal from "./components/ui/PremiumRequiredModal/PremiumRequiredModal";
import PremiumModal from "./components/ui/PremiumModal/PremiumModal";
import { registerPremiumModalCallback } from "./utils/authorizedAxios";

import AppProvidersLayout from "./AppProvidersLayout";

function App() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPremiumUpgradeModal, setShowPremiumUpgradeModal] = useState(false);

  useEffect(() => {
    registerPremiumModalCallback((value) => setShowPremiumModal(value));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PUBLIC ROUTES (no providers) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/public/:profileId" element={<PublicDietPlan />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm" element={<EmailConfirmation />} />
        {/* ✅ ROUTES THAT NEED Auth/Profile providers */}
        <Route element={<AppProvidersLayout />}>
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <Login />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfLoggedIn>
                <Signup />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route
              path="/profile/:profileId?"
              element={
                <RedirectIfNoProfiles>
                  <Profile />
                </RedirectIfNoProfiles>
              }
            />
            <Route
              path="/diet"
              element={
                <RedirectIfNoProfiles>
                  <Diet />
                </RedirectIfNoProfiles>
              }
            />
            <Route path="/product-list" element={<ProductList />} />
            <Route
              path="/profile-list"
              element={
                <RedirectIfNoProfiles>
                  <ProfileList />
                </RedirectIfNoProfiles>
              }
            />
            <Route path="/add-profile" element={<AddProfile />} />
          </Route>

          {/* Modals can live here because they depend on providers/auth state */}
          <Route
            path="*"
            element={
              <>
                <NotFound />

                {showPremiumModal && (
                  <PremiumRequiredModal
                    isOpen={showPremiumModal}
                    onClose={() => setShowPremiumModal(false)}
                    onUpgrade={() => {
                      setShowPremiumUpgradeModal(true);
                      setShowPremiumModal(false);
                    }}
                  />
                )}

                {showPremiumUpgradeModal && (
                  <PremiumModal
                    isOpen={showPremiumUpgradeModal}
                    onClose={() => setShowPremiumUpgradeModal(false)}
                  />
                )}
              </>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;