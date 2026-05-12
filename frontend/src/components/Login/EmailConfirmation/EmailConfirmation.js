import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAxios from "../../../utils/defaultAxios"; // Import your axios instance
import styles from "./EmailConfirmation.module.css"; // Import your CSS module
import { useTranslation } from 'react-i18next';


const EmailConfirmation = () => {
    const { t } = useTranslation(); // Hook to get translation function
    const [status, setStatus] = useState("loading");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");
        if (token) {
            defaultAxios
                .post("/auth/confirm", null, {
                    params: { token }
                })
                .then((response) => {
                    setStatus("success");
                    setTimeout(() => navigate("/login"), 5000); // Redirect after a short delay
                })
                .catch((error) => {
                    setStatus("error");
                });
        } else {
            setStatus("error");
        }
    }, [location.search, navigate]);

    return (
        <div className={styles.container}>
            <h1>{t('emailConfirmation.title')}</h1>
            {status === 'loading' && <p>{t('emailConfirmation.loading')}</p>}
            {status === 'success' && <p>{t('emailConfirmation.successMessage')}</p>}
            {status === 'error' && <p>{t('emailConfirmation.errorMessage')}</p>}
            {status !== 'loading' && (
                <a href="/login" className={styles.link}>
                    {t('emailConfirmation.loginPageLink')}
                </a>
            )}
        </div>
    );
};


export default EmailConfirmation;
