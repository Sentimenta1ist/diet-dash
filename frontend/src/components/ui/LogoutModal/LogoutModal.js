import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./LogoutModal.module.css";

const LogoutModal = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>{t("logoutModal.areYouSure")}</h3>
        <div className={styles.modalButtons}>
          <button className={styles.buttonConfirm} onClick={onConfirm}>
            {t("logoutModal.confirm")}
          </button>
          <button className={styles.button} onClick={onCancel}>
            {t("logoutModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
