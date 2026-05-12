import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ForgotPassword.module.css";
import sideImageStyles from ".././LoginSideImage/LoginSideImage.module.css";
import loginStyles from "../Login.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import NotFound from "../../Errors/NotFound/NotFound";
import { Link } from "react-router-dom";
import defaultAxios from "../../../utils/defaultAxios"; // Import your axios instance
import LanguageSelector from "../../LanguageSelector/LanguageSelector"; // Import LanguageSelector

const ForgotPassword = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [resetError, setResetError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isResetComplete, setIsResetComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validatePassword = (password) => {
    if (!password.trim()) {
      setPasswordError(t("login.passwordError"));
    } else {
      setPasswordError("");
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t("login.confirmPasswordError"));
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(t("login.passwordMismatchError"));
    } else {
      setConfirmPasswordError("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    validatePassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    validateConfirmPassword(event.target.value);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid =
    password && confirmPassword && !passwordError && !confirmPasswordError;

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    if (isFormValid) {
      try {
        const response = await defaultAxios.post(
          `/auth/update-password?token=${token}`,
          password,
          {
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        // Check if the response indicates success (for example, "Ok" or other success status)
        if (response.data === "Ok") {
          setIsResetComplete(true); // Set reset complete to true on success
        } else {
          setResetError(t("login.passwordResetError")); // Handle error if the response isn't success
        }
      } catch (error) {
        console.error("Password reset failed:", error);
        setResetError(t("login.passwordResetError")); // Handle error in catch block
      }
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  if (!token) return <NotFound />;

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
        {isResetComplete ? (
          // Show success message when reset is complete
          <div className={`${styles["success-message-form"]}`}>
            <div className={`${styles["confirmation-message"]}`}>
              {t("login.passwordResetSuccess")}
            </div>
            <div className={styles["login-link"]}>
              <Link to="/login">{t("login.goToLogin")}</Link>
            </div>
          </div>
        ) : resetError ? (
          // Show error message if there is a reset error
          <div className={`${styles["error-message-form"]}`}>
            <div className={`${styles["error-message"]}`}>{resetError}</div>
            <div className={styles["login-link"]}>
              <Link to="/login">{t("login.goToLogin")}</Link>
            </div>
          </div>
        ) : (
          <div className={`${styles["forgot-password-form"]}`}>
            <div className={`${styles.header}`}>{t("login.enterNewPassword")}</div>
            <form
              className={`${styles["inside-form"]}`}
              onSubmit={handleSubmit}
            >
              <div className={`${loginStyles["form-group-warpper"]}`}>
                <div className={`${loginStyles["form-group"]}`}>
                  <div className={`${loginStyles["input-with-button"]}`}>
                    <div className={`${loginStyles["login-input"]}`}>
                      <label
                        htmlFor="password"
                        className={`${loginStyles["input-label"]} ${loginStyles["text"]}`}
                      >
                        {t("login.password")}
                      </label>
                      <input
                        className={`${loginStyles["email-input"]} ${
                          loginStyles["text"]
                        } ${password ? loginStyles["not-empty"] : ""}`}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder={t("login.password")}
                        value={password}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="ms-auto">
                      <button
                        type="button"
                        onClick={handleShowPassword}
                        className={loginStyles["show-password-button"]}
                      >
                        <i
                          className={`bi ${
                            showPassword
                              ? `${loginStyles["bi-eye-slash"]} bi-eye-slash`
                              : `${loginStyles["bi-eye"]} bi-eye`
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${loginStyles["form-group-warpper"]}`}>
                <div className={`${loginStyles["form-group"]}`}>
                  <div className={`${loginStyles["input-with-button"]}`}>
                    <div className={`${loginStyles["login-input"]}`}>
                      <label
                        htmlFor="confirm-password"
                        className={`${loginStyles["input-label"]} ${loginStyles["text"]}`}
                      >
                        {t("login.password")}
                      </label>
                      <input
                        className={`${loginStyles["email-input"]} ${
                          loginStyles["text"]
                        } ${confirmPassword ? loginStyles["not-empty"] : ""}`}
                        type={showPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirm-password"
                        placeholder={t("login.password")}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* {passwordError && (
                <div className={loginStyles["error-message"]}>
                  {passwordError}
                </div>
              )}
              {confirmPasswordError && (
                <div className={loginStyles["error-message"]}>
                  {confirmPasswordError}
                </div>
              )} */}

              <button
                className={`${styles["continue-button"]} ${
                  !isFormValid ? "opacity-50" : ""
                }`}
                type="submit"
                disabled={!isFormValid}
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

export default ForgotPassword;
