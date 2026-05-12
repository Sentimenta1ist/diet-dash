import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddProfile.module.css";
import { useProfile } from "../../../ProfileContext";
import { useTranslation } from 'react-i18next'; // Import useTranslation from react-i18next

const AddProfile = ({ isMarginSet = true }) => {
  const [name, setName] = useState("");
  const { addProfile } = useProfile();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Destructure t from useTranslation

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim()) {
      const addProfileResult = await addProfile(name); // Ensure profile is added
      if (addProfileResult === true) {
        setName(""); // Clear input field
        navigate("/profile"); // Navigate to Profile page after profile creation
      }
    }
  };

  return (
    <div className={`${styles.container} ${isMarginSet ? styles['dsktop-margin'] : ""}`}>
      <form onSubmit={handleSubmit} className={styles.createProfileForm}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('addProfile.namePlaceholder')} // Use translation for placeholder
          required
        />
        <div>
          <button className={styles.createProfileButton} type="submit">
            {t('addProfile.createProfileButton')} {/* Use translation for button text */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProfile;
