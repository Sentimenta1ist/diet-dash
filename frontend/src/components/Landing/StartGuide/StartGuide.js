import React, { useState, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import styles from './StartGuide.module.css';

// Use forwardRef to pass the ref to a DOM element
const StartGuide = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        number: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(""); // Message text
    const [messageType, setMessageType] = useState(""); // New state for message type

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");
        setMessageType(""); // Reset message type

        const API_URL = process.env.REACT_APP_API_URL;
        const requestBody = {
            name: formData.name,
            email: formData.email,
            number: formData.number || ""
        };

        try {
            const response = await fetch(`${API_URL}/auth/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setMessage(t("startGuide.successMessage"));
                setMessageType("success"); // Set success type
                setFormData({ name: "", email: "", number: "" });
            } else {
                setMessage(t("startGuide.errorMessage"));
                setMessageType("error"); // Set error type
            }
        } catch (error) {
            setMessage(t("startGuide.networkErrorMessage"));
            setMessageType("error"); // Set error type for network errors
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section ref={ref} className={`${styles.startGuideWrapper} mb-4`}>
            <div className={styles.startGuide}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>{t("startGuide.title")}</h2>
                    <p className={styles.subtitle}>{t("startGuide.subtitle")}</p>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>{t("startGuide.emailLabel")}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t("startGuide.emailPlaceholder")}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>{t("startGuide.nameLabel")}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t("startGuide.namePlaceholder")}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="number" className={styles.label}>{t("startGuide.phoneLabel")}</label>
                            <input
                                type="tel"
                                id="number"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                placeholder={t("startGuide.phonePlaceholder")}
                                className={styles.input}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                            {isSubmitting ? t("startGuide.submitting") : t("startGuide.submitButton")}
                        </button>
                        <p className={styles.footerText}>{t("startGuide.footerText")}</p>
                        <p
                            className={`${styles.message} ${messageType === "error" ? styles['error-message'] :
                                messageType === "success" ? styles['success-message'] : ''
                                }`}
                        >
                            {message}
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
});

export default StartGuide;