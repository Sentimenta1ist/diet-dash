import React, { useState, useEffect, useRef } from "react";
import styles from "./AddProductModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import SimpleTimeInput from "react-simple-time-input";
import SearchDropdown from "../SearchDropdown/SearchDropdown"; // Adjust path as needed

const AddProductModal = ({ handleAddProduct, onClose }) => {
    const { t } = useTranslation();
    const [time, setTime] = useState("12:00");
    const [grams, setGrams] = useState("100");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setIsDropdownOpen(false); // Close dropdown on selection
    };

    const handleMenuToggle = (isOpen) => {
        setIsDropdownOpen(isOpen);
    };

    const handleSubmit = () => {
        if (selectedProduct && grams && time) {
            handleAddProduct(selectedProduct, time, Number(grams));
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2>{t("diet.addProduct.title")}</h2>
                <div className={styles.formGroup}>
                    <label>{t("diet.columns.time")}</label>
                    <SimpleTimeInput
                        value={time}
                        clockMode={24}
                        onValueChange={(newValue) => setTime(newValue)}
                        className={styles.timeInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>{t("diet.columns.grams")}</label>
                    <input
                        type="number"
                        min="0"
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className={styles.gramsInput}
                        placeholder={t("diet.addProduct.gramsPlaceholder")}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>{t("diet.columns.product")}</label>
                    <SearchDropdown
                        onProductAdd={handleProductSelect}
                        grams={grams}
                        onGramsChange={(value) => setGrams(value)}
                        hideInputs={true}
                        time="10:00" // Dummy value for GramsInput
                        setTime={() => {}} // Dummy function for GramsInput
                        onMenuToggle={handleMenuToggle}
                    />
                    {selectedProduct && !isDropdownOpen && (
                        <div className={styles.selectedProduct}>
                            {t("diet.addProduct.selected")}: {selectedProduct.name}
                        </div>
                    )}
                </div>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedProduct || !grams || !time}
                        className={styles.addButton}
                    >
                        {t("diet.addProduct.add")}
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        {t("diet.addProduct.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;