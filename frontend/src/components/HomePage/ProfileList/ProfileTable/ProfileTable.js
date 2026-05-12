import React, { useState, useEffect, useRef } from "react";
import styles from "./ProfileTable.module.css";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { deleteProfile } from "../../../../redux/slices/profileListSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import CustomConfirmModal from "../../../ui/CustomConfirmModal/CustomConfirmModal";

const ProfileTable = ({ profiles, lastProfileRef, profileDeleteionCallback, isMobileVersion = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [expandedProfile, setExpandedProfile] = useState(null);

  // Ref to detect clicks outside the expanded info
  const expandedInfoRef = useRef(null);

  const handleDeleteProfile = (profileId) => {
    setProfileToDelete(profileId);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      dispatch(deleteProfile(profileToDelete));
      profileDeleteionCallback(profileToDelete); // Callback to update the parent component
    }
    setIsModalOpen(false);
    setProfileToDelete(null);
  };
  
  const cancelDelete = () => {
    setIsModalOpen(false);
    setProfileToDelete(null);
  };

  const toggleProfileInfo = (profileId) => {
    setExpandedProfile(expandedProfile === profileId ? null : profileId);
  };

  // Close expanded info when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedInfoRef.current && !expandedInfoRef.current.contains(event.target)) {
        setExpandedProfile(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.profileTable} ${isMobileVersion ? styles.mobileVersion : ''}`}>
      <div className={styles.headerRow}>
        <div className={styles.headerCol}>{t("profileList.name")}</div>
        <div className={styles.headerCol}>{t("profileList.age")}</div>
        <div className={styles.headerCol}>{t("profileList.gender")}</div>
        {!isMobileVersion && (
          <>
            <div className={styles.headerCol}>{t("profileList.height")}</div>
            <div className={styles.headerCol}>{t("profileList.weight")}</div>
            <div className={styles.headerCol}>{t("profileList.calories")}</div>
          </>
        )}
        <div className={styles.headerCol}>{/* Actions */}</div>
      </div>

      {profiles.map((profile, index) => (
        <div
          key={profile.id}
          className={styles.tableRowWrapper}
          ref={index === profiles.length - 1 ? lastProfileRef : null}
        >
          <div className={styles.tableRow}>
            <a
              href={`/profile/${profile.id}`}
              className={styles.profileName}
              title={profile.name}
            >
              {profile.name}
            </a>
            <div className={styles.tableCol}>{profile.age}</div>
            <div className={styles.tableCol}>{profile.gender || "-"}</div>
            {!isMobileVersion && (
              <>
                <div className={styles.tableCol}>{profile.height}</div>
                <div className={styles.tableCol}>{profile.weight}</div>
                <div className={styles.tableCol}>{profile.selectedCalorieLimit}</div>
              </>
            )}
            <div className={styles.actionsCol}>
              <button
                className={styles.infoButton}
                onClick={() => toggleProfileInfo(profile.id)}
                title={t("profileList.info")}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteProfile(profile.id)}
                title={t("profileList.delete")}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          <div
            className={`${styles.expandedInfo} ${expandedProfile === profile.id ? styles.active : ""
              }`}
            ref={expandedInfoRef}
          >
            <div className={styles.expandedHeaderRow}>
              <div className={styles.expandedHeaderCol}>{t("profileList.height")}</div>
              <div className={styles.expandedHeaderCol}>{t("profileList.weight")}</div>
              <div className={styles.expandedHeaderCol}>{t("profileList.calories")}</div>
            </div>
            <div className={styles.expandedDataRow}>
              <div className={styles.expandedDataCol}>{profile.height}</div>
              <div className={styles.expandedDataCol}>{profile.weight}</div>
              <div className={styles.expandedDataCol}>{profile.selectedCalorieLimit}</div>
            </div>
          </div>
        </div>
      ))}

      <CustomConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message={t("profileList.confirmDelete")}
      />
    </div>
  );
};

export default ProfileTable;
