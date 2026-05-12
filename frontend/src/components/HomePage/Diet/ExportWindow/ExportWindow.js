import React, { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import styles from "./ExportWindow.module.css";
import { formatDate, getNextDay } from "../../../../utils/dateUtils";
import "./datepickerStyles.scss";
import { useTranslation } from "react-i18next";
import { enGB, uk as ukLocale } from "date-fns/locale";

const ExportWindow = ({ selectedProfile, t, buttonType, onExport }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === "en" ? enGB : ukLocale;
  const [showModal, setShowModal] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });

  const handleExportClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmExport = () => {
    const exportDateStart = formatDate(selectionRange.startDate);
    const exportDateEnd = formatDate(
      selectionRange.endDate || getNextDay(selectionRange.startDate)
    );

    if (onExport) {
      onExport(selectedProfile.id, exportDateStart, exportDateEnd);
    }

    handleCloseModal();
  };

  // Close modal on pressing Esc key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <button className={styles["export-ration-button"]} onClick={handleExportClick}>
        {t(`diet.dietPlan.${buttonType}`)}
      </button>

      {showModal && (
        <div className={styles["modal"]}>
          <div className={styles["modal-content"]}>
            <h2>{t("diet.dietPlan.selectDateRange")}</h2>

            <div className={styles["date-picker-container"]}>
              <DateRangePicker
                ranges={[selectionRange]}
                onChange={(item) => setSelectionRange(item.selection)}
                className={styles["custom-date-picker"]}
                rangeColors={["#548054"]}
                locale={locale}
              />
            </div>

            <div className={styles["modal-actions"]}>
              <button
                className={styles["export-button"]}
                onClick={handleConfirmExport}
                disabled={!selectionRange.startDate || !selectionRange.endDate}
              >
                {t("diet.dietPlan.export")}
              </button>
              <button className={styles["cancel-button"]} onClick={handleCloseModal}>
                {t("diet.dietPlan.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportWindow;
