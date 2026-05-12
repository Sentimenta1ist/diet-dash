import React from "react";
import styles from "./ProductTable.module.css";
import { useTranslation } from "react-i18next";

const ProductTable = ({ products }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`${styles["product-list-table"]} table-bordered table-responsive`}
    >
      <div className={`${styles["thead-row"]} row`}>
        <div className={`${styles["table-col"]} col`}>
          {t("productList.name")}
        </div>
        <div className={`${styles["table-col"]} col`}>
          {t("productList.calories")}
        </div>
        <div className={`${styles["table-col"]} col`}>
          {t("productList.protein")}
        </div>
        <div className={`${styles["table-col"]} col`}>
          {t("productList.fat")}
        </div>
        <div className={`${styles["table-col"]} col`}>
          {t("productList.carbs")}
        </div>
      </div>
      {products.map((product) => (
        <div
          key={product.id}
          className={`row align-items-center`}
        >
          <div
            className={`${styles["table-col"]} col text-truncate`}
            title={product.name}
          >
            {product.name}
          </div>
          <div className={`${styles["table-col"]} col`}>{product.calories}</div>
          <div className={`${styles["table-col"]} col`}>{product.protein}</div>
          <div className={`${styles["table-col"]} col`}>{product.fat}</div>
          <div className={`${styles["table-col"]} col`}>{product.carbs}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductTable;
