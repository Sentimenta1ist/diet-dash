import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const RedirectIfNoProfiles = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const profiles = useSelector((state) => state.profilesData.profiles);
  const profilesLoading = useSelector((state) => state.profilesData.profilesLoading);

  useEffect(() => {
    if (!profilesLoading && (!profiles || profiles.length === 0)) {
      if (["/profile", "/diet"].includes(pathname)) {
        navigate("/add-profile");
      }
    }
  }, [profilesLoading, profiles?.length, pathname, navigate]);

  return profiles?.length > 0 ? children : null;
};

export default RedirectIfNoProfiles;