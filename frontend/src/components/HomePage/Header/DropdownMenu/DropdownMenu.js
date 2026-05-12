import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import styles from "./DropdownMenu.module.css";

const DropdownMenu = ({ isLogoutModalOpen, setIsLogoutModalOpen }) => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // Initialize translation function

    const handleNavigation = (page) => {
        navigate(`/${page.toLowerCase()}`); // Navigate to the specified page
    };

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true); // Trigger the logout modal
    };

    return (
        <div className={`${styles["dropdown-menu"]} ${styles.show}`}>
            <button
                className={styles["dropdown-button"]}
                onClick={() => handleNavigation("account")}
            >
                {t("header.dropdownMenu.account")} {/* Translated text for Account */}
            </button>
            <button
                className={styles["dropdown-button"]}
                onClick={() => handleNavigation("support")}
            >
                {t("header.dropdownMenu.support")} {/* Translated text for Support */}
            </button>
            <button
                className={styles["dropdown-button"]}
                onClick={() => handleNavigation("settings")}
            >
                {t("header.dropdownMenu.settings")} {/* Translated text for Settings */}
            </button>
            <button
                className={`${styles["dropdown-button"]} ${styles["logout-button"]}`}
                onClick={handleLogoutClick}
            >
                {t("header.dropdownMenu.logout")} {/* Translated text for Logout */}
            </button>
        </div>
    );
};

export default DropdownMenu;
