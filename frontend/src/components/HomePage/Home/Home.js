import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { useAuth } from "../../../AuthContext";
import LogoutModal from "../../ui/LogoutModal/LogoutModal";
import ProfileList from "../ProfileList/ProfileList";
import { useProfile } from "../../../ProfileContext"; // Import the ProfileContext
import AddProfile from "../AddProfile/AddProfile";

const Home = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { profiles, profilesLoading } = useProfile();

    // State to manage whether the modal is open
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Handle logout button click, shows the confirmation modal
    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    // Confirm logout, close the modal, and perform the logout
    const handleLogoutConfirm = () => {
        logout(); // Perform the logout
        setIsLogoutModalOpen(false); // Close the modal
    };

    // Cancel logout, just close the modal
    const handleLogoutCancel = () => {
        setIsLogoutModalOpen(false); // Close the modal
    };

    const handleAllProfilesClick = () => {
        navigate("/profile-list");
    };

    const handleClientStatisticsClick = () => {
        // navigate("/client-statistics");
    };

    const handleNutritionFormulasClick = () => {
        // navigate("/nutrition-formulas");
    };

    const handleAllProductsClick = () => {
        navigate("/product-list");
    };

    const handleSettingsClick = () => {
        // navigate("/settings");
    };

    if (profilesLoading) {
        return <div></div>; // Replace with a proper loading spinner if needed
    }

    return (
        <div className={styles.container}>
            <div className={styles["content-wrapper"]}>
                <div className={styles.form}>
                    <div className={styles.buttons}>
                        <button
                            className={styles.button}
                            onClick={handleAllProductsClick}
                        >
                            {t("home.allProducts")}
                        </button>
                        <button
                            className={styles.button}
                            onClick={handleAllProfilesClick}
                        >
                            {t("home.allProfiles")}
                        </button>
                        <button
                            className={styles.button}
                            onClick={handleClientStatisticsClick}
                        >
                            {t("home.clientStatistics")}
                        </button>
                        <button
                            className={styles.button}
                            onClick={handleNutritionFormulasClick}
                        >
                            {t("home.nutritionFormulas")}
                        </button>
                        <button
                            className={styles.button}
                            onClick={handleSettingsClick}
                        >
                            {t("home.settings")}
                        </button>
                        <button
                            className={styles["button"]}
                            onClick={handleLogoutClick} // Show the confirmation modal on logout button click
                        >
                            {t("exit")}
                        </button>
                    </div>
                    <div className={`${styles['mobile-extra-buttons']}`}>
                        <div className={styles.languageSelectorWrapper}>
                            <LanguageSelector />
                        </div>
                    </div>
                </div>

                {/* Check if there are no profiles */}
                {profiles.length === 0 ? (
                    <div className={styles['no-profile-container']}>
                        <p>{t("profileList.noProfilesMessage")}</p>
                        <AddProfile
                            isMarginSet={false} />
                    </div>
                ) : (
                    <div className={styles["profile-list-container"]}>
                        <h2>{t("profileList.yourProfiles")}</h2>
                        <ProfileList isMobileVersion={true} />
                    </div>
                )}
            </div>

            {/* Display the logout confirmation modal when it's open */}
            {isLogoutModalOpen && (
                <LogoutModal
                    onConfirm={handleLogoutConfirm}
                    onCancel={handleLogoutCancel}
                />
            )}
        </div>
    );
};

export default Home;
