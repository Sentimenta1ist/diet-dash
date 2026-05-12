import React, { useState, useEffect, useRef } from "react";
import styles from "./LanguageSelector.module.css";
import i18n, { changeLanguage } from "../../configuration/i18n";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsOpen(false); // Close dropdown after selection
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Close the dropdown if click is outside
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener on unmount or when isOpen changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Run effect when isOpen changes

  // Map language codes to display text
  const languageLabels = {
    en: "EN",
    uk: "UK",
    ru: "RU",
  };

  // Available languages excluding the current one
  const availableLanguages = Object.keys(languageLabels).filter(
    (lang) => lang !== i18n.language
  );

  return (
    <div className={styles.languageSelector} ref={dropdownRef}>
      <button
        className={`${styles.languageButton} ${
          isOpen ? styles.active : ""
        }`} // Apply languageButton and active when open
        onClick={toggleDropdown}
      >
        {languageLabels[i18n.language] || "EN"} {/* Display current language */}
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              className={styles.languageButton} // No active class needed since current language is excluded
              onClick={() => handleLanguageChange(lang)}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;