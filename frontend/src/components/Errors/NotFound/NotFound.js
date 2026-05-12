// src/components/NotFound/NotFound.js
import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css"; // Optional CSS module
import { useTranslation } from 'react-i18next';

function NotFound() {
  const { t } = useTranslation(); // Hook to get translation function

  return (
    <div className={styles.container}>
      <h1>{t(`notFound.heading`)}</h1>
      <p>{t(`notFound.message`)}</p>
      <Link to="/home">{t(`notFound.goHome`)}</Link>
    </div>
  );
}

export default NotFound;
