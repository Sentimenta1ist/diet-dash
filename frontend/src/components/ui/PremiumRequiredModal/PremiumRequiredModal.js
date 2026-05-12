import React, { useEffect } from "react";
import styles from "./PremiumRequiredModal.module.css";
import { useTranslation } from "react-i18next";

const PremiumRequiredModal = ({ isOpen, onClose, onUpgrade }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        } else {
            document.removeEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{t("premiumRequired.title")}</h2>
                <p>{t("premiumRequired.message")}</p>
                <div className={styles.buttonGroup}>
                    <button className={styles.continueBtn} onClick={onUpgrade}>
                        {t("premiumRequired.upgrade")}
                    </button>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        {t("cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumRequiredModal;