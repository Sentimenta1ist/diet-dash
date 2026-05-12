import React, { useState } from "react";
import { useAuth } from "../../AuthContext"; // Import the useAuth hook
import loginStyles from "./Login.module.css";
import sideImageStyles from "./LoginSideImage/LoginSideImage.module.css";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { useTranslation } from "react-i18next"; // Import useTranslation from react-i18next
import LanguageSelector from "../LanguageSelector/LanguageSelector"; // Import LanguageSelector
import { useMediaQuery } from "react-responsive"; // Import for responsive handling

function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const isMobile = useMediaQuery({ maxWidth: 768 }); // Mobile detection

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setLoginError("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setLoginError("");
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError(t("login.fillAllFields"));
      return;
    }

    const errorMessage = await login(email, password);
    if (errorMessage) {
      setLoginError(errorMessage);
    }
  };

  const isFormValid = email && password;

  return (
    <div className={loginStyles.Login}>
      {!isMobile && (
        <div className={sideImageStyles["left-side"]}>
          <div className={sideImageStyles["centered-container"]}>
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
      )}
      <div className={loginStyles["right-side"]}>
        <div className={loginStyles.languageSelector}>
          <LanguageSelector />
        </div>
        <div className={loginStyles["login-form"]}>
          <h2>{t("login.signIn")}</h2>
          <form className={loginStyles["inside-form"]}>
            <div className={`${loginStyles["form-group"]}`}>
              <div className={`${loginStyles["input-with-button"]}`}>
                <div className={`${loginStyles["login-input"]}`}>
                  <label
                    htmlFor="email"
                    className={`${loginStyles["input-label"]} ${loginStyles["text"]}`}
                  >
                    {t("login.email")}
                  </label>
                  <div className={loginStyles["input-container"]}>
                    <input
                      className={`${loginStyles["email-input"]} ${
                        loginStyles["text"]
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
              </div>
            </div>
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
                    autoComplete="current-password"
                  />
                </div>
                <div className="ms-auto">
                  <button
                    type="button"
                    onClick={handleShowPassword}
                    className={`${loginStyles["show-password-button"]}`}
                  >
                    <i
                      className={`${loginStyles['bi-eye']} ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
            <div className={loginStyles["forgot-password"]}>
              <Link
                to="/reset-password"
                className={loginStyles["no-underline-link"]}
              >
                {t("login.forgotPassword")}
              </Link>
            </div>
            {loginError && (
              <div className={loginStyles["error-message"]}>{loginError}</div>
            )}
            <button
              className={`${loginStyles["continue-button"]} ${
                !isFormValid ? "opacity-50" : ""
              }`}
              type="button"
              onClick={handleLogin}
              disabled={!isFormValid}
            >
              {t("login.continue")}
            </button>
            <div className={loginStyles["signup"]}>
                <Link to="/signup" className={loginStyles["no-underline-link"]}>
                  {t("login.newUserSignUp")}
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
