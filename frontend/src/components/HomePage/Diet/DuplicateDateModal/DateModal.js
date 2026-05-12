import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./DateModal.module.css";
import { useTranslation } from "react-i18next";
import "../Datepicker.css";

const DateModal = ({ isOpen, onClose, onConfirm, sourceDate }) => {
  const { t, i18n } = useTranslation();
  const [targetDates, setTargetDates] = useState([]);

  const handleDateChange = (date) => {
    const dateExists = targetDates.some((d) => d.getTime() === date.getTime());

    if (dateExists) {
      setTargetDates(targetDates.filter((d) => d.getTime() !== date.getTime()));
    } else {
      setTargetDates([...targetDates, date]);
    }
  };

  const handleConfirm = () => {
    onConfirm(targetDates); // Pass selected dates back to the parent
    onClose(); // Close the modal after confirming
  };

  const handleCancel = () => {
    onClose(); // Close the modal without saving the dates
  };

  // Reset selected dates when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTargetDates([]); // Clear selected dates when modal is closed
    }
  }, [isOpen]);

  // Close modal on pressing Esc key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose(); // Close the modal if Esc is pressed
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>{t("diet.dietPlan.selectTargetDate")}</h2>
        <div>
          <DatePicker
            key={targetDates.length}
            selected={sourceDate} // Keeps the picker in "unselected" mode
            onChange={handleDateChange}
            showIcon
            className={styles.datepicker}
            dateFormat="dd/MM/yy"
            locale={i18n.language}
            highlightDates={targetDates} // Highlight selected dates
            inline // Displays the date picker inline for better UX in a modal
          />
        </div>
        <div className={styles.buttons}>
          <button onClick={handleConfirm}>{t("confirm")}</button>
          <button onClick={handleCancel}>{t("cancel")}</button>
        </div>
      </div>
    </div>
  );
};

export default DateModal;
