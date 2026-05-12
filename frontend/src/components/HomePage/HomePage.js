import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./HomePage.module.css";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

const HomePage = ({ children }) => {
  return (
    <div className={styles['home-layout']}>
      <Header />
      {children || <Outlet />}
      <Footer />
    </div>
  );
};

export default HomePage;