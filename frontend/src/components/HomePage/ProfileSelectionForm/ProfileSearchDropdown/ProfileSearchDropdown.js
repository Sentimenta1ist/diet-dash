import React, { useState, useEffect, useRef } from "react";
import styles from "./ProfileSearchDropdown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useProfile } from "../../../../ProfileContext";
import { useTranslation } from "react-i18next";

const ProfileSearchDropdown = ({
  onDropdownVisibilityChange,
  searchResults,
  setSearchResults,
  onAddNewProfile,
}) => {
  const { profiles, selectedProfile, handleProfileSelect } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  useEffect(() => {
    setSearchResults(profiles);
  }, [profiles, selectedProfile]);

  useEffect(() => {
    if (selectedProfile) {
      setSearchTerm(selectedProfile.name);
    } else {
      setSearchTerm("");
    }
  }, [selectedProfile]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false); // Close the dropdown
        onDropdownVisibilityChange(false); // Notify parent of visibility change
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible, onDropdownVisibilityChange]);

  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);

    if (inputValue.trim() === "") {
      setSearchResults(profiles);
      setDropdownVisible(false);
    } else {
      const resultsArray = profiles.filter((profile) =>
        profile.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSearchResults(resultsArray);
      setDropdownVisible(resultsArray.length > 0);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDropdownVisible(false);
    onDropdownVisibilityChange(false); // Notify parent
  };

  const handleProfileSelectDropdown = (profile) => {
    handleProfileSelect(profile);
    setDropdownVisible(false);
    setSearchResults(profiles);
    onDropdownVisibilityChange(false); // Notify parent
  };

  const handleDropdownButtonClick = () => {
    setDropdownVisible(!dropdownVisible);
    onDropdownVisibilityChange(!dropdownVisible); // Notify parent
  };

  const handleAddNewProfile = () => {
    setSearchResults(profiles);
    onAddNewProfile(); // Trigger the function to open a profile creation form or page
    setDropdownVisible(false); // Close the dropdown
    onDropdownVisibilityChange(false); // Notify parent
  };

  return (
    <div className={`${styles.searchDropdown}`} ref={dropdownRef}>
      <form className={`${styles.searchForm}`} onSubmit={handleSearchSubmit}>
        <div
          className={`${styles.searchInputContainer} ${dropdownVisible ? styles.searchInputOpen : styles.searchInputClosed
            }`}
        >
          <input
            type="text"
            placeholder={t("profileSearchDropdown.searchPlaceholder")}
            value={searchTerm || ""}
            onChange={handleSearchChange}
            className={`${styles.searchInput}`}
          />
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={handleDropdownButtonClick}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
      </form>
      {dropdownVisible && (
        <div className={styles.dropdownMenuWrapper}>
          <ul className={styles.dropdownMenu}>
            <li
              className={styles.dropdownItem}
              onClick={handleAddNewProfile}
            >
              <div className={styles.dropdownItemContent}>
                <span className={styles.dropdownItemLabel}>
                  {t("profileSearchDropdown.addNewProfile")}
                </span>
              </div>
            </li>
            {searchResults.map((profile) => (
              <li
                key={profile.id}
                className={styles.dropdownItem}
                onClick={() => handleProfileSelectDropdown(profile)}
              >
                <div className={styles.dropdownItemContent}>
                  <span className={styles.dropdownItemLabel}>
                    {profile.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileSearchDropdown;