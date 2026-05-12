import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./DietPlanTable.module.css";
import { useTranslation } from "react-i18next";

const DietPlanTable = ({
  dietItems,
  handleTimeChange,
  handleChange,
  handleDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`table-responsive ${styles["tbl-container"]}`}>
      <table className={`table table-bordered ${styles["diet-plan-table"]}`}>
        <thead>
          <tr>
            <th
              className={`${styles["time-col"]} ${styles["active-input"]}`}
              scope="col"
            >
              {t("diet.columns.time")}
            </th>
            <th className={`${styles["name-col"]}`} scope="col">
              {t("diet.columns.product")}
            </th>
            <th
              className={`${styles["grams-col"]} ${styles["active-input"]}`}
              scope="col"
            >
              {t("diet.columns.grams")}
            </th>
            <th className={`${styles["mid-col"]}`} scope="col">
              {t("diet.columns.calories")}
            </th>
            <th className={`${styles["pfc-col"]}`} scope="col">
              {t("diet.columns.protein")}
            </th>
            <th className={`${styles["pfc-col"]}`} scope="col">
              {t("diet.columns.fat")}
            </th>
            <th className={`${styles["pfc-col"]}`} scope="col">
              {t("diet.columns.carbs")}
            </th>
            <th
              className={`${styles["buttons-col"]} ${styles["th-buttons"]}`}
              scope="col"
            >
              {t("")}
            </th>
          </tr>
        </thead>
        <tbody>
          {dietItems.map((item, index) => {
            // Helper function to format numbers
            const formatNumber = (num) => {
              const value = Number(num);
              return Number.isInteger(value) ? value : value.toFixed(1);
            };

            return (
              <tr key={item.id}>
                <td>
                  <div className={`${styles["time-select"]}`}>
                    <select
                      name="hours"
                      value={item.time instanceof Date ? item.time.getHours() : 0}
                      onChange={(e) => {
                        const newHours = e.target.value;
                        const newTimeValue = `${newHours}:${item.time.getMinutes() || "00"
                          }`;
                        handleTimeChange(item, newTimeValue);
                      }}
                      className={`form-control hours-dropdown ${styles["form-control"]}`}
                    >
                      {[...Array(24)].map((_, hour) => (
                        <option key={hour} value={hour}>
                          {String(hour).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      name="minutes"
                      value={
                        item.time instanceof Date
                          ? [0, 15, 30, 45][Math.floor(item.time.getMinutes() / 15)]
                          : 0
                      }
                      onChange={(e) => {
                        const newMinutes = e.target.value;
                        const newTimeValue = `${item.time.getHours().toString().padStart(2, "0") || "00"
                          }:${String(newMinutes).padStart(2, "0")}`;
                        handleTimeChange(item, newTimeValue);
                      }}
                      className={`form-control minutes-dropdown ${styles["form-control"]}`}
                    >
                      {[0, 15, 30, 45].map((minute) => (
                        <option key={minute} value={minute}>
                          {String(minute).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className={``} title={item.product.name}>
                  {item.product.name}
                </td>
                <td className={``}>
                  <input
                    type="number"
                    name="grams"
                    min="0"
                    value={item.grams}
                    onChange={(e) =>
                      handleChange(
                        index,
                        { ...dietItems[index] },
                        "grams",
                        e.target.value
                      )
                    }
                    className={`form-control ${styles["form-control"]}`}
                  />
                </td>
                <td>{formatNumber(item.product.calories)}</td>
                <td>{formatNumber(item.product.protein)}</td>
                <td>{formatNumber(item.product.fat)}</td>
                <td>{formatNumber(item.product.carbs)}</td>
                <td>
                  <button
                    className={`${styles["delete-button"]}`}
                    onClick={() => handleDelete(item.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DietPlanTable;
