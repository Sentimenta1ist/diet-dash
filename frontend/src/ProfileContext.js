// src/ProfileContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfiles,
  setSelectedProfile,
} from "./redux/slices/profilesDataSlice";
import authorizedAxios from "./utils/authorizedAxios";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { profiles, selectedProfile, profilesLoading } = useSelector(
    (state) => state.profilesData
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!profiles.length) {
      dispatch(fetchProfiles()).then(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [dispatch, profiles.length]);

  useEffect(() => {
    if (initialized && profiles.length > 0) {
      const storedProfileId = localStorage.getItem("selectedProfileId");
      const safeProfiles = Array.isArray(profiles) ? profiles : [];
      let profileToSelect = safeProfiles.find((p) => p.id === storedProfileId) || safeProfiles[0];

      if (selectedProfile?.id !== profileToSelect.id) {
        handleProfileSelect(profileToSelect);
      }
    } else if (initialized) {
      localStorage.setItem("selectedProfileId", "null");
    }
  }, [profiles, initialized, selectedProfile, dispatch]);


  const handleProfileSelect = (profile) => {
    dispatch(setSelectedProfile(profile));
    localStorage.setItem("selectedProfileId", profile.id);
  };

  const handleProfileSelectById = (id) => {
    const selectedProfile = profiles.find((profile) => profile.id === id);

    if (selectedProfile) {
      dispatch(setSelectedProfile(selectedProfile)); // Dispatch the found profile
      localStorage.setItem("selectedProfileId", id); // Save selected profile ID in localStorage
    } else {
      console.warn(`Profile with id ${id} not found.`);
    }
  };

  const addProfile = async (name) => {
    try {
      const response = await authorizedAxios.post(
        `/profile`,
        { name }
      );
      const newProfileId = response.data;
      localStorage.setItem("selectedProfileId", newProfileId);
      await dispatch(fetchProfiles()); // Refresh profiles after adding a new one
      return true;
    } catch (err) {
      console.error("Failed to add profile or update profiles.", err);
      return false;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        selectedProfile,
        handleProfileSelect,
        handleProfileSelectById,
        profiles,
        addProfile,
        profilesLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
