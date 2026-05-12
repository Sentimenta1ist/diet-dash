import React, { useState, useEffect, useRef } from "react";
import styles from "./DietPlanMobileTable.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import SimpleTimeInput from "react-simple-time-input";

const DietPlanMobileTable = ({ dietItems, handleDelete, handleTimeChange, handleChange }) => {
    const { t } = useTranslation();
    const [expandedItem, setExpandedItem] = useState(null);
    const expandedInfoRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (expandedInfoRef.current && !expandedInfoRef.current.contains(event.target)) {
                setExpandedItem(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const formatNumber = (num) => {
        const value = Number(num);
        return Number.isInteger(value) ? value : value.toFixed(1);
    };

    // Format time to ensure 24-hour format (HH:mm)
    const formatTime = (time) => {
        if (time instanceof Date) {
            return `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
        }
        return "00:00";
    };

    return (
        <div className={styles.dietTable}>
            <div className={styles.headerRow}>
                <div className={styles.headerCol}>{t("diet.columns.time")}</div>
                <div className={styles.headerCol}>{t("diet.columns.product")}</div>
                <div className={styles.headerCol}>{t("diet.columns.grams")}</div>
                <div className={styles.headerCol}>{/* Actions */}</div>
            </div>

            {dietItems.map((item, index) => (
                <div key={item.id} className={styles.tableRowWrapper}>
                    <div className={styles.tableRow}>
                        <div className={styles.tableCol}>
                            <SimpleTimeInput
                                value={formatTime(item.time)}
                                clockMode={24}
                                onValueChange={(newValue) => handleTimeChange(item, newValue)}
                                className={styles.timeInput}
                            />
                        </div>
                        <div className={styles.tableCol} title={item.product.name}>
                            {item.product.name}
                        </div>
                        <div className={styles.tableCol}>
                            <input
                                type="number"
                                min="0"
                                value={item.grams}
                                onChange={(e) => handleChange(index, { ...dietItems[index] }, "grams", e.target.value)}
                                className={styles.gramsInput}
                            />
                        </div>
                        <div className={styles.actionsCol}>
                            <button
                                className={styles.infoButton}
                                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                title={t("diet.info")}
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(item.id)}
                                title={t("diet.delete")}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    </div>
                    <div
                        className={`${styles.expandedInfo} ${expandedItem === item.id ? styles.active : ""}`}
                        ref={expandedItem === item.id ? expandedInfoRef : null}
                    >
                        <div className={styles.expandedHeaderRow}>
                            <div className={styles.expandedHeaderCol}>{t("diet.columns.calories")}</div>
                            <div className={styles.expandedHeaderCol}>{t("diet.columns.protein")}</div>
                            <div className={styles.expandedHeaderCol}>{t("diet.columns.fat")}</div>
                            <div className={styles.expandedHeaderCol}>{t("diet.columns.carbs")}</div>
                        </div>
                        <div className={styles.expandedDataRow}>
                            <div className={styles.expandedDataCol}>{formatNumber(item.product.calories)}</div>
                            <div className={styles.expandedDataCol}>{formatNumber(item.product.protein)}</div>
                            <div className={styles.expandedDataCol}>{formatNumber(item.product.fat)}</div>
                            <div className={styles.expandedDataCol}>{formatNumber(item.product.carbs)}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DietPlanMobileTable;