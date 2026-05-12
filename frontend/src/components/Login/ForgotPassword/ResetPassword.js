import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import defaultAxios from "../../../utils/defaultAxios";
import styles from "./ResetPassword.module.css"; // Import your CSS module
import sideImageStyles from ".././LoginSideImage/LoginSideImage.module.css";
import loginStyles from "../Login.module.css";
import { Link } from "react-router-dom";
import LanguageSelector from "../../LanguageSelector/LanguageSelector"; // Import LanguageSelector

const ResetPassword = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [successMessage, setSuccessMessage] = useState(""); // State for success messages

  const handleEmailChange = (event) => {
    const emailValue = event.target.value;
    setEmail(emailValue);
    setErrorMessage("");
    setEmailError("");
    validateEmail(emailValue);
  };

  const validateEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError(t("login.emailRequired")); // Set error for empty email
    } else if (!emailRegex.test(email)) {
      setEmailError(t("login.invalidEmail")); // Set error for invalid email
    } else {
      setEmailError(""); // Clear error if email is valid
    }
  };

  const isFormValid = email && !emailError;

  // Function to handle the submit action
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    try {
      const response = await defaultAxios.post(
        `/auth/send-forgot-email?email=${email}`
      );

      // Check if the response indicates success (for example, "Ok")
      if (response.data === "Ok") {
        setSuccessMessage(t("login.checkLinkInMailbox")); // Update success message
        setEmail(""); // Clear the email input field
        setEmailError(""); // Clear any existing email error
        setErrorMessage(""); // Clear any existing error message
      } else {
        setErrorMessage(t("login.forgotEmailError")); // Set error message if not "Ok"
      }
    } catch (error) {
      setErrorMessage(error.response.data.message); // Set error message for request failure
    }
  };

  return (
    <div className={`${loginStyles.Login}`}>
      <div className={`${sideImageStyles["left-side"]}`}>
        <div className={`${sideImageStyles["centered-container"]}`}>
          <div
            className={`${sideImageStyles.text} ${sideImageStyles["centered-text"]}`}
          >
            {t("login.loginMotto")
              .split(" ")
              .map((word, index) => (
                <span
                  key={index}
                  className={index === 2 ? sideImageStyles.highlight : ""}
                >
                  {word}{" "}
                </span>
              ))}
          </div>
        </div>
      </div>
      <div className={`${loginStyles["right-side"]}`}>
        <div className={`${loginStyles.languageSelector}`}>
          {" "}
          <LanguageSelector />
        </div>
        {successMessage ? (
          <div className={`${styles["success-message"]}`}>
            {successMessage}
            <div>
              <Link to="/login">{t("login.goToLogin")}</Link>
            </div>
          </div>
        ) : (
          <div className={`${styles["reset-password-form"]}`}>
            <div className={`${styles.header}`}>
              {t("login.passwordRecovery")}
            </div>
            <form
              className={`${styles["inside-form"]}`}
              onSubmit={handleSubmit}
            >
              <div
                className={`${loginStyles["form-group"]} ${loginStyles["left-align"]}`}
              >
                <label
                  htmlFor="email"
                  className={`${loginStyles["input-label"]}  ${loginStyles["text"]}`}
                >
                  {t("login.email")}
                </label>
                <div className={loginStyles["input-container"]}>
                  <input
                    className={`${loginStyles["email-input"]} ${loginStyles["text"]
                      } ${email ? loginStyles["not-empty"] : ""}`}
                    type="email"
                    id="email"
                    name="email"
                    placeholder={t("login.email")}
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                  />
                </div>
              </div>
              {errorMessage && (
                <div className={`${loginStyles["error-message"]}`}>
                  {errorMessage}
                </div>
              )}
              <button
                className={`${styles["continue-button"]} ${!isFormValid ? "opacity-50" : ""
                  }`}
                type="button"
                disabled={!isFormValid}
                onClick={handleSubmit} // Call handleSubmit on button click
              >
                {t("login.continue")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
