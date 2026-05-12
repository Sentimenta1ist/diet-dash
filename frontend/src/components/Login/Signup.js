import React, { useState } from "react";
import { useAuth } from "../../AuthContext"; // Import the useAuth hook
import signupStyles from "./Login.module.css";
import sideImageStyles from "./LoginSideImage/LoginSideImage.module.css";
import styles from "./Signup.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import LanguageSelector from "../LanguageSelector/LanguageSelector"; // Import LanguageSelector

function Signup() {
  const { signup } = useAuth(); // Import signup from AuthContext
  const { t } = useTranslation(); // Initialize translation hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSignupComplete, setIsSignupComplete] = useState(false); // New state

  const handleEmailChange = (event) => {
    setSignupError("");
    setEmail(event.target.value);
    validateEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setSignupError("");
    setPassword(event.target.value);
    validatePassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setSignupError("");
    setConfirmPassword(event.target.value);
    validateConfirmPassword(event.target.value);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email !== "" && !emailRegex.test(email)) {
      setEmailError(t("signup.emailError"));
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      setPasswordError(t("signup.passwordError"));
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(t("signup.passwordMismatchError"));
    } else {
      setPasswordError("");
      setConfirmPasswordError("");
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t("signup.confirmPasswordError"));
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(t("signup.passwordMismatchError"));
    } else {
      setPasswordError("");
      setConfirmPasswordError("");
    }
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    !signupError;

  const handleSignup = async () => {
    validateEmail(email); // Ensure email is valid
    validateConfirmPassword(confirmPassword); // Ensure passwords match

    if (confirmPasswordError || emailError) return; // Stop if errors exist

    try {
      await signup("FirstName", "LastName", email, password);
      setIsSignupComplete(true); // Set to true after successful signup
    } catch (error) {
      if (error.response && error.response.data) {
        // Assuming the API returns an error message in the response data
        setSignupError(error.response.data.message || t("signup.apiError")); // Display API error
      } else {
        setSignupError(t("signup.apiError")); // Default error message if no specific message is available
      }
    }
  };

  return (
    <div className={`${signupStyles.Login}`}>
      <div className={`${sideImageStyles["left-side"]}`}>
        <div className={`${sideImageStyles["centered-container"]}`}>
          <div
            className={`${sideImageStyles.text} ${sideImageStyles["centered-text"]}`}
          >
            {t("signup.startJourney")}{" "}
            <span className={`${sideImageStyles.highlight}`}>
              {t("signup.betterHealth")}
            </span>
          </div>
        </div>
      </div>
      <div className={`${signupStyles["right-side"]}`}>
        <div className={`${signupStyles.languageSelector}`}>
          {" "}
          <LanguageSelector />
        </div>
        <div className={`${signupStyles["login-form"]}`}>
          <h2>{t("signup.title")}</h2>
          {isSignupComplete ? (
            <div className={`${signupStyles["confirmation-message-form"]}`}>
              <div className={`${signupStyles["confirmation-message"]}`}>
                {t("signup.confirmationMessage")}
              </div>
              <div className={signupStyles["login-link"]}>
                <Link to="/login">{t("signup.loginPageLink")}</Link>
              </div>
            </div>
          ) : (
            <form className={`${signupStyles["inside-form"]}`}>
              <div className={`${signupStyles["form-group-warpper"]}`}>
                <div
                  className={`${signupStyles["form-group"]} ${
                    signupStyles["left-align"]
                  } ${emailError ? styles["error-border"] : ""}`}
                >
                  <div className={`${signupStyles["input-with-button"]}`}>
                    <div className={`${signupStyles["login-input"]}`}>
                      <label
                        htmlFor="email"
                        className={`${signupStyles["input-label"]} ${signupStyles["text"]}`}
                      >
                        {t("signup.emailLabel")}
                      </label>
                      <div className={signupStyles["input-container"]}>
                        <input
                          className={`${signupStyles["email-input"]} ${signupStyles["text"]} `}
                          type="email"
                          id="email"
                          name="email"
                          placeholder={t("signup.emailLabel")}
                          value={email}
                          onChange={handleEmailChange}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${signupStyles["form-group-warpper"]}`}>
                <div className={`${signupStyles["form-group"]}`}>
                  <div className={`${signupStyles["input-with-button"]}`}>
                    <div className={`${signupStyles["login-input"]}`}>
                      <label
                        htmlFor="password"
                        className={` ${signupStyles["input-label"]} ${signupStyles["text"]}`}
                      >
                        {t("signup.passwordLabel")}
                      </label>
                      <input
                        className={`${signupStyles["email-input"]}  ${signupStyles["text"]}`}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder={t("signup.passwordLabel")}
                        value={password}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="ms-auto">
                      <button
                        type="button"
                        onClick={handleShowPassword}
                        className={signupStyles["show-password-button"]}
                      >
                        <i
                          className={`bi ${
                            showPassword
                              ? `${signupStyles["bi-eye-slash"]} bi-eye-slash`
                              : `${signupStyles["bi-eye"]} bi-eye`
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${signupStyles["form-group-warpper"]}`}>
                <div className={`${signupStyles["form-group"]}`}>
                  <div className={`${signupStyles["input-with-button"]}`}>
                    <div className={`${signupStyles["login-input"]}`}>
                      <label
                        htmlFor="confirm-password"
                        className={` ${signupStyles["input-label"]} ${signupStyles["text"]}`}
                      >
                        {t("signup.confirmPasswordLabel")}
                      </label>
                      <input
                        className={`${signupStyles["email-input"]}  ${signupStyles["text"]}`}
                        type={showPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirm-password"
                        placeholder={t("signup.confirmPasswordLabel")}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
                {confirmPasswordError && (
                  <div className={`${signupStyles["error-message"]}`}>
                    {confirmPasswordError}
                  </div>
                )}
                {signupError && (
                  <div className={`${signupStyles["error-message"]}`}>
                    {signupError}
                  </div>
                )}
              </div>

              <button
                className={`${signupStyles["continue-button"]} ${
                  !isFormValid ? "opacity-50" : ""
                }`}
                type="button"
                onClick={handleSignup}
                disabled={!isFormValid}
              >
                {t("signup.continueButton")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
