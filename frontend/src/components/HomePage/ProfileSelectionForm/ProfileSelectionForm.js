import React, { useState } from "react";
import styles from "./ProfileSelectionForm.module.css";
import ProfileSearchDropdown from "./ProfileSearchDropdown/ProfileSearchDropdown";
import { useProfile } from "../../../ProfileContext";
import { useNavigate } from "react-router-dom";

const ProfileSelectionForm = () => {
  const { profiles } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(profiles);
  const navigate = useNavigate();

  const handleDropdownVisibility = (isOpen) => {
    setDropdownOpen(isOpen);
  };

  const handleAddNewProfile = () => {
    navigate("/add-profile");
  };

  return (
    <div
      className={`${styles["profile-selection-form"]} ${
        dropdownOpen && searchResults && searchResults.length > 0
          ? styles["open"]
          : styles["closed"]
      }`}
    >
      <ProfileSearchDropdown
        onDropdownVisibilityChange={handleDropdownVisibility}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        onAddNewProfile={handleAddNewProfile}
      />
    </div>
  );
};

export default ProfileSelectionForm;
