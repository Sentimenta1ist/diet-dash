import React, { useEffect } from "react";
import styles from "./PremiumModal.module.css";
import { useTranslation, Trans } from "react-i18next";

const PremiumModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFreeMonthClick = () => {
    window.open("https://buy.stripe.com/dR6146aWtdjugKs145");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
        <h2 className={styles.modalTitle}>{t("premiumModal.title")}</h2>
        <p className={styles.modalText}>{t("premiumModal.whyUpgrade")}</p>
        <ul className={styles.modalList}>
          <li>
            <Trans i18nKey="premiumModal.createProfiles" />
          </li>
          <li>
            <Trans i18nKey="premiumModal.designMeals" />
          </li>
          <li>
            <Trans i18nKey="premiumModal.prioritySupport" />
          </li>
          <li>
            <Trans i18nKey="premiumModal.accessAI" />
          </li>
          <li>
            <Trans i18nKey="premiumModal.detailedReports" />
          </li>
          <li>
            <Trans i18nKey="premiumModal.firstMonthFree" />
          </li>
        </ul>
        <button
          className={styles.freeMonthButton}
          onClick={handleFreeMonthClick}
        >
          {t("premiumModal.freeMonth")}
        </button>
      </div>
    </div>
  );
};

export default PremiumModal;