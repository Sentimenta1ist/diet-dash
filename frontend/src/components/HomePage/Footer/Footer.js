import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Footer.module.css"; // We'll create this CSS module
import { useTranslation } from "react-i18next";
import { FaHome, FaUser, FaUtensils } from "react-icons/fa"; // Using icons for buttons

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (/^\/profile(\/[a-f0-9\-]+)?$/.test(path)) return "profile";
    switch (path) {
      case "/diet":
        return "diet";
      default:
        return "home";
    }
  };

  const currentPage = getCurrentPage();

  const handleClick = (page) => {
    navigate(`/${page.toLowerCase()}`);
  };

  return (
    <footer className={styles.footer}>
      <button
        className={`${styles.button} ${currentPage === "home" ? styles["button-active"] : ""
          }`}
        onClick={() => handleClick("home")}
      >
        <FaHome size={24} />
        <span>{t("header.home")}</span>
      </button>
      <button
        className={`${styles.button} ${currentPage === "diet" ? styles["button-active"] : ""
          }`}
        onClick={() => handleClick("diet")}
      >
        <FaUtensils size={24} />
        <span>{t("header.diet")}</span>
      </button>
      <button
        className={`${styles.button} ${currentPage === "profile" ? styles["button-active"] : ""
          }`}
        onClick={() => handleClick("profile")}
      >
        <FaUser size={24} />
        <span>{t("header.profile")}</span>
      </button>
    </footer >
  );
};

export default Footer;