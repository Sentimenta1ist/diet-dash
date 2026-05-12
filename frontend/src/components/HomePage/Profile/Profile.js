import React, { useState, useEffect, useRef } from "react";
import { useProfile } from "../../../ProfileContext";
import styles from "./Profile.module.css";
import DietProfile from "../../../models/DietProfile";
import { useParams } from "react-router-dom";
import Select from "react-select";
import { useSelector, useDispatch } from "react-redux";
import { debounce } from "lodash";
import isEqual from "lodash/isEqual";
import {
  setUser,
  fetchActivities,
  setSelectedActivity,
  updateProfile,
  updateField,
} from "../../../redux/slices/profileSlice";
import useFetchUser from "../../../hooks/useFetchUser";
import { useTranslation } from "react-i18next";
import { validateDigitsInput } from "../../../utils/inputUtils";

const Profile = () => {
  const { t } = useTranslation();
  const { selectedProfile, handleProfileSelectById } = useProfile();
  const dispatch = useDispatch();
  const { user, activities } = useSelector((state) => state.profile);
  const { profileId } = useParams();
  const [initialProfileId] = useState(profileId);
  const [initialUser, setInitialUser] = useState(new DietProfile());
  const [initialized, setInitialized] = useState(false);

  const debounceTime = 1000;
  const [isDirty, setIsDirty] = useState(false); // Track if there are unsaved changes
  const pendingUpdatesRef = useRef(new Map());

  const activeBorderColor = "rgb(72, 147, 56)"; // Define your primary color variable

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "100%",
      padding: "0 4px",
    }),
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#ffffff",
      borderColor: activeBorderColor, // Use the color directly for editing state
      borderRadius: "12px",
      boxShadow: "0 0 0 0.5px" + activeBorderColor + "inset", // Shadow when editing
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      transition: "border-color 0.2s, box-shadow 0.2s",
      "&:hover": {
        borderColor: activeBorderColor,
        boxShadow: state.isFocused
          ? "0 0 0 0.5px" + activeBorderColor + "inset"
          : "none",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#e0f7e0"
        : state.isFocused
          ? "#f1f1f1"
          : "#ffffff",
      color: state.isSelected ? "#495057" : "#495057",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      "&:active": {
        backgroundColor: "#c8e6c9",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#495057",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6c757d",
    }),
    input: (provided) => ({
      ...provided,
      color: "#495057",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const genderSelectStyles = {
    container: (provided) => ({
      ...provided,
      padding: "0 0 0 2px ",
    }),
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#ffffff",
      border: "none",
      borderRadius: "12px",
      boxShadow: "none",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      transition: "border-color 0.2s, box-shadow 0.2s",
      padding: "0", // Ensure padding is removed
      "&:hover": {
        borderColor: "none",
        boxShadow: "none",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#e0f7e0"
        : state.isFocused
          ? "#f1f1f1"
          : "#ffffff",
      color: state.isSelected ? "#495057" : "#495057",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      "&:active": {
        backgroundColor: "#c8e6c9",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#495057",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6c757d",
    }),
    input: (provided) => ({
      ...provided,
      color: "#495057",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  // Fetch user data and activities
  const { loading } = useFetchUser(setInitialUser, setInitialized);

  useEffect(() => {
    if (initialProfileId) {
      handleProfileSelectById(initialProfileId);
    }
    dispatch(fetchActivities());
  }, [initialProfileId, dispatch, t]);

  // Sync activity selection when user.activity or activities change
  useEffect(() => {
    if (user.activity && activities.length > 0) {
      const selectedOption = activities.find(
        (activity) => activity.id === user.activity.id
      );
      if (selectedOption && !isEqual(selectedOption, user.activity)) {
        dispatch(
          setSelectedActivity({
            value: selectedOption.id,
            label: selectedOption.description,
            multiplier: selectedOption.multiplier,
          })
        );
      }
    }
  }, [user.activity, activities, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    const isPcf = ["dailyProteinLimit", "dailyFatLimit", "dailyCarbsLimit"].includes(name);

    if (isPcf) {
      const numericValue = value.match(/(\d+)%?/);
      updatedValue = numericValue ? Number(numericValue[1]) : "";
    } else {
      updatedValue = ["name", "gender"].includes(name) ? value : validateDigitsInput(value);
    }

    const field = isPcf ? `daily${name.replace(/daily|Limit/g, "")}Percentage` : name;
    dispatch(updateField({ field, value: updatedValue }));

    pendingUpdatesRef.current.set(name, updatedValue);
    setIsDirty(true); // Mark the form as having unsaved changes
  };

  // Debounced Save: Runs only when input stops for a while
  useEffect(() => {
    if (!isDirty || pendingUpdatesRef.current.size === 0) return;

    const handler = setTimeout(async () => {
      try {
        dispatch(updateProfile({ selectedProfileId: selectedProfile.id, updatedProfile: { ...user } }));
        pendingUpdatesRef.current.clear();
        setIsDirty(false); // Reset dirty state after successful save
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [isDirty, dispatch, selectedProfile, user]);

  const handleActivityChange = (selectedOption) => {
    dispatch(setSelectedActivity(selectedOption));

    const updatedActivity = {
      id: selectedOption.value,
      description: selectedOption.label,
      multiplier: selectedOption.multiplier,
    };
    pendingUpdatesRef.current.set("activity", updatedActivity.id);
    setIsDirty(true); // Mark as having unsaved changes
  };


  useEffect(() => {
    if (user.activity) {
      const selectedOption = activities.find(
        (activity) => activity.id === user.activity.id
      );
      if (!selectedOption) {
        return;
      }
      dispatch(
        setSelectedActivity({
          value: selectedOption.id,
          label: selectedOption.description,
          multiplier: selectedOption.multiplier,
        })
      );
    }
  }, [dispatch]);

  const renderInputField = (field, labelKey, unitKey) => (
    <div
      className={`${styles["info-field"]} align-items-center ${styles.editable}`}
      key={field}
    >
      <div className="">
        <label htmlFor={field} className={`${styles["info-field-label"]}`}>
          {t(labelKey)} {unitKey ? `(${t(unitKey)})` : ""}
        </label>
        <input
          className={`${styles["info-field-input"]}`}
          id={field}
          name={field}
          value={user[field] || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderGenderDropdown = (field) => {
    const genderOptions = [
      { value: "Male", label: t("profile.male") },

      { value: "Female", label: t("profile.female") },
      { value: "Other", label: t("profile.other") },
    ];

    return (
      <div
        className={`${styles["gender-select-warpper"]} ${styles.editable}`}
        key={field}
      >
        <div>
          <label htmlFor={field} className={`${styles["gender-select-label"]}`}>
            {t("profile.gender")}
          </label>
          <Select
            inputId={field}
            options={genderOptions}
            value={
              genderOptions.find((option) => option.value === user.gender) ||
              null
            }
            onChange={(option) =>
              handleChange({ target: { name: field, value: option.value } })
            }
            styles={genderSelectStyles}
            placeholder={t("profile.selectGender")}
          />
        </div>
      </div>
    );
  };

  const renderDropdown = () => (
    <Select
      options={activities.map((activity) => ({
        value: activity.id,
        label: activity.description,
        multiplier: activity.multiplier,
      }))}
      value={
        user.activity
          ? {
            value: user.activity.id,
            label: user.activity.description,
            multiplier: user.activity.multiplier,
          }
          : null
      }
      onChange={handleActivityChange}
      styles={customStyles}
      placeholder={t("profile.selectActivity")} // Use translation key for placeholder
      classNamePrefix="select" // Ensure CSS module styles are applied
    />
  );

  const renderSelectedField = (field, labelKey, unitKey, editable) => {
    const isPcf =
      labelKey === "Carbs" || labelKey === "Protein" || labelKey === "Fat";
    return (
      <div className={`${styles["card-col"]} col`} key={field}>
        <div
          className={`${styles.card} card h-100 radius-16 shadow-none mb-0 ${editable ? styles.editable : ""
            }`}
        >
          <div className={`${styles["card-body"]} card-body text-black`}>
            <div className={`${styles["card-text"]}`}>
              <label className={styles["card-label"]} htmlFor={field}>
                {isPcf
                  ? t(`profile.${labelKey.toLowerCase()}`)
                  : t(`profile.${labelKey}`)}
              </label>

              <div className={`${styles["input-container"]}`}>
                <div className={`${isPcf ? styles["input-wrapper"] : ""}`}>
                  <input
                    id={field}
                    name={field}
                    value={
                      user[field] === null
                        ? ""
                        : isPcf
                          ? `${user[`daily${labelKey}Percentage`]}`
                          : `${user[field]}${editable ? "" : " " + t(`profile.${unitKey}`)
                          }`
                    }
                    readOnly={!editable}
                    className={`${styles["card-input"]} ${isPcf ? styles["pcf-input"] : ""
                      }`}
                    onChange={handleChange}
                  />
                </div>
                <span>
                  {isPcf ? `(${user[field]} ${t(`profile.${unitKey}`)})` : ""}
                </span>
              </div>
            </div>
            <div className="ms-auto fs-2"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    user !== undefined &&
    user.name !== undefined &&
    user.age !== undefined && (
      <div className={`${styles.container} container`}>
        <div className={`row w-100 gx-0 ${styles['main-row']}`}>
          <div
            className={`${styles["left-side"]} col-12 col-md-12 col-lg-12 col-xl-5 col-xxl-5`}>
            {/* Client info table */}
            <div className={`${styles["client-info"]}`}>
              <div className={`${styles["header-1"]} ${styles["header-text"]}`}>
                {t(`profile.clientInfo`)}
              </div>
              <div className={`${styles["info-box"]}`}>
                <div className={`${styles["info-top-box"]} ${styles.editable}`}>
                  <div className="">
                    <img
                      src="https://i.imgur.com/OMcdAnC.png"
                      className={`${styles["rounded-circle"]}`}
                      alt="Profile Avatar"
                    />
                  </div>
                  <div className={styles["info-field-container"]}>
                    <div className="">
                      <label
                        htmlFor="name"
                        className={`${styles["info-field-label"]}`}
                      >
                        {t("profile.fullName")}
                      </label>
                      <input
                        className={`${styles["info-field-input"]}`}
                        id="name"
                        name="name"
                        value={user.name || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="">
                      <label
                        htmlFor="age"
                        className={`${styles["info-field-label"]}`}
                      >
                        {t("profile.age")}
                      </label>
                      <input
                        className={`${styles["info-field-input"]}`}
                        id="age"
                        name="age"
                        value={user.age || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                {renderGenderDropdown("gender")}
                {renderInputField("weight", "profile.weight", "profile.kg")}
                {renderInputField("height", "profile.height", "profile.cm")}
                {renderInputField("waist", "profile.waist", "profile.cm")}
                {renderInputField("hips", "profile.hips", "profile.cm")}
                {renderInputField(
                  "goalWeight",
                  "profile.aimWeight",
                  "profile.kg"
                )}
              </div>
            </div>
          </div>
          <div
            className={`${styles["right-side"]} col-12 col-md-12 col-lg-12 col-xl-7 col-xxl-7`}
          >
            {/* Selected limit table */}
            <div className={styles["dietary-info"]}>
              <div className={`${styles["dietary-data"]} row`}>
                <div
                  className={`${styles["header-1"]} ${styles["header-text"]}`}
                >
                  {t(`profile.dietaryData`)}
                </div>
                <div
                  className={`${styles["card-container"]} row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-xl-1 row-cols-xxl-1`}
                >
                  {renderDropdown()} {/* Render the dropdown */}
                  {renderSelectedField(
                    "bodyMassIndex",
                    "bodyMassIndex",
                    "",
                    false
                  )}
                  {renderSelectedField(
                    "idealBodyWeight",
                    "idealBodyWeight",
                    "kg",
                    false
                  )}
                  {renderSelectedField(
                    "dailyCalorieNorm",
                    "dailyCalorieNorm",
                    "kcal",
                    false
                  )}
                  {renderSelectedField(
                    "selectedCalorieLimit",
                    "selectedCalorieLimit",
                    "kcal",
                    true
                  )}
                </div>
                <div>
                  <div
                    className={`${styles["card-narrow-container"]} row row-cols-3 row-cols-sm-3 row-cols-md-3 row-cols-xl-3 row-cols-xxl-3`}
                  >
                    {renderSelectedField(
                      "dailyProteinLimit",
                      "Protein",
                      "g",
                      true
                    )}
                    {renderSelectedField("dailyFatLimit", "Fat", "g", true)}
                    {renderSelectedField("dailyCarbsLimit", "Carbs", "g", true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Profile;
