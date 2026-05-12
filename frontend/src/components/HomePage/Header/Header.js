import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "../../../assets/icons/diet-dash.svg";
import avatar from "../../../images/avatar-default.png";
import ProfileSelectionForm from "../ProfileSelectionForm/ProfileSelectionForm";
import { BsDoorOpen } from "react-icons/bs";
import { useProfile } from "../../../ProfileContext";
import { useAuth } from "../../../AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import PremiumModal from "../../ui/PremiumModal/PremiumModal";
import planService from "../../../services/planService";
import DropdownMenu from "./DropdownMenu/DropdownMenu";
import LogoutModal from "../../ui/LogoutModal/LogoutModal"; // Import the LogoutModal

const Header = () => {
  const { t } = useTranslation();
  const { profiles } = useProfile();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown visibility
  const [searchResults, setSearchResults] = useState(profiles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Manage Logout Modal
  const [userPlan, setUserPlan] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Refs to track the avatar container and dropdown menu
  const avatarContainerRef = useRef(null);
  const dropdownMenuRef = useRef(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const plan = await planService.getUserPlan();
        setUserPlan(plan);
      } catch (error) {
        console.error("Failed to fetch user plan", error);
        setUserPlan("Premium");
      }
    };

    fetchPlan();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarContainerRef.current &&
        !avatarContainerRef.current.contains(event.target) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setDropdownOpen(false); // Close the dropdown if click is outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Listen for clicks

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener
    };
  }, []);

  const getCurrentPage = () => {
    const path = location.pathname;
    if (/^\/profile(\/[a-f0-9\-]+)?$/.test(path)) {
      return "profile";
    }
    switch (path) {
      case "/diet":
        return "diet";
      case "/profile":
        return "profile";
      default:
        return "home";
    }
  };

  const currentPage = getCurrentPage();

  const handleDropdownVisibility = () => {
    setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility
  };

  const handleClick = (page) => {
    navigate(`/${page.toLowerCase()}`);
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false); // Close the modal after logout
    setDropdownOpen(false); // Close the dropdown when logging out
  };

  const handlePremiumClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogoutModalClose = () => {
    setIsLogoutModalOpen(false); // Close the logout modal
  };

  const handleLogoutModalToggle = (isOpen) => {
    setIsLogoutModalOpen(isOpen);
  };


  return (
    <header className={styles.header}>
      <div className={`${styles["left-group"]}`}>
        <div className={styles["header-buttons-group-one"]}>
          <button
            className={`${styles.button} ${currentPage === "home" ? styles["button-active"] : ""}`}
            onClick={() => handleClick("home")}
          >
            <img src={logo} alt="Logo" height={27} />
            {t(`Diet Dash`)}
          </button>
          <button
            className={`${styles.button} ${currentPage === "diet" ? styles["button-active"] : ""}`}
            onClick={() => handleClick("diet")}
          >
            {t(`header.diet`)}
          </button>
          <button
            className={`${styles.button} ${currentPage === "profile" ? styles["button-active"] : ""}`}
            onClick={() => handleClick("profile")}
          >
            {t(`header.profile`)}
          </button>
          <ProfileSelectionForm />
        </div>
      </div>

      <div className={`${styles["right-group"]}`}>
        <div className={styles["header-buttons-last"]}>
          <LanguageSelector />
          <button className={`${styles['button-premium']}`} onClick={handlePremiumClick}>
            {userPlan ? userPlan : ""}
          </button>

          {/* Avatar image that will toggle the dropdown menu */}
          <div
            className={styles["avatar-container"]}
            onClick={handleDropdownVisibility}
            ref={avatarContainerRef}
          >
            <img src={avatar} alt="Avatar" className={styles["avatar"]} />
            {/* Dropdown menu with animation */}
            <div ref={dropdownMenuRef}>
              {dropdownOpen && <DropdownMenu
                isLogoutModalOpen={isLogoutModalOpen}
                setIsLogoutModalOpen={handleLogoutModalToggle} // Pass function to toggle modal visibility
              />
              }
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <PremiumModal isOpen={true} onClose={handleCloseModal} />}
      {isLogoutModalOpen && (
        <LogoutModal onConfirm={handleLogout} onCancel={handleLogoutModalClose} />
      )}
    </header>
  );
};

export default Header;
