import React, { useState, useEffect } from "react";
import styles from "./AddProductModal.module.css";
import { useDispatch } from "react-redux";
import { addProduct } from "../../../../redux/slices/productSlice";
import { useTranslation } from "react-i18next";

const AddProductModal = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState({
    name: "",
    calories: "",
    proteins: "",
    fats: "",
    carbs: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      product.name &&
      product.calories &&
      product.proteins &&
      product.fats &&
      product.carbs
    ) {
      try {
        await dispatch(addProduct(product));
        onClose();
      } catch (error) {
        alert("Failed to add product: " + error.message);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2>{t("productList.addYourProduct")}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles["form-group"]}>
            <label>{t("productList.name")}</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles["form-group"]}>
            <label>{t("productList.calories")}</label>
            <input
              type="number"
              name="calories"
              value={product.calories}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles["form-group"]}>
            <label>{t("productList.protein")}</label>
            <input
              type="number"
              name="proteins"
              value={product.proteins}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles["form-group"]}>
            <label>{t("productList.fat")}</label>
            <input
              type="number"
              name="fats"
              value={product.fats}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles["form-group"]}>
            <label>{t("productList.carbs")}</label>
            <input
              type="number"
              name="carbs"
              value={product.carbs}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles["modal-actions"]}>
            <button type="submit">{t("productList.addProduct")}</button>
            <button type="button" onClick={onClose}>
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
