import { Container, Button } from "react-bootstrap";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "../../configuration/i18n";
import styles from "./LandingPage.module.css";
import Gallery from "./Gallery/Gallery";
import BenefitsTable from "./BenefitsTable/BenefitsTable";
import StartGuide from "./StartGuide/StartGuide";
import { Link } from "react-router-dom";

export default function LandingPage() {
    const { t } = useTranslation();
    const startGuideRef = useRef(null); // Create a ref for StartGuide
    const currentLanguage = getCurrentLanguage(); // Get current language

    const scrollToStartGuide = () => {
        startGuideRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to StartGuide
    };

    return (
        <div className={`min-vh-100 d-flex flex-column ${styles['landing-page']}`}>
            {/* Language Picker */}
            <div className={styles['language-picker']}>
                <button
                    className={`${styles['language-button']} ${currentLanguage === 'en' ? styles.active : ''}`}
                    onClick={() => changeLanguage('en')}
                >
                    EN
                </button>
                <button
                    className={`${styles['language-button']} ${currentLanguage === 'uk' ? styles.active : ''}`}
                    onClick={() => changeLanguage('uk')}
                >
                    UK
                </button>
                <button
                    className={`${styles['language-button']} ${currentLanguage === 'ru' ? styles.active : ''}`}
                    onClick={() => changeLanguage('ru')}
                >
                    RU
                </button>
            </div>

            <section className={`${styles.hero} py-5 text-center position-relative`}>
                {/* Content Box */}
                <div className={`${styles['hero-info']} text-center rounded`}>
                    <div className={styles['hero-info-header']}>
                        {t("landingPage.heroHeader")}
                        <span className={styles['highlight-text']}>
                            {t("landingPage.heroHeaderHighlight")}
                        </span>
                    </div>
                    <div className={styles['hero-info-text']}>
                        {t("landingPage.heroText")}
                    </div>
                    <div className="d-flex justify-content-start gap-3">
                        <button
                            className={`${styles['hero-button-guide']} ${styles.button}`}
                            onClick={scrollToStartGuide}
                        >
                            {t("landingPage.heroButtonGuide")}
                        </button>
                        <Link to="/login" className={`${styles['hero-button-platform']} ${styles.button}`}>
                            {t("landingPage.heroButtonPlatform")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className={`${styles.help} text-center mb-5`}>
                <Container className={`${styles.container}`}>
                    <div className={styles['help-header']}>
                        {t("landingPage.helpHeader")}
                        <span className={styles['highlight-text']}>
                            {t("landingPage.helpHeaderHighlight")}
                        </span>
                        {t("landingPage.helpHeaderSecond")}
                    </div>
                    <div className={styles['help-text']}>
                        {t("landingPage.helpText")}
                    </div>
                </Container>
            </section>

            <Gallery />

            <BenefitsTable />

            <StartGuide ref={startGuideRef} />

            {/* Footer */}
            <footer className={`${styles.footer} text-center`}>
                <Container className={styles.container}>
                    <h2 className="fw-bold m-0">{t("landingPage.footerHeader")}</h2>
                    <div className={styles.contactInfo}>
                        <p className="m-0">{t("landingPage.footerAddress")}</p>
                        <p className={`m-0`}>
                            <svg width="24" height="24" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_4029_2429)">
                                    <path d="M23.954 5.54199L15.536 13.96C14.5974 14.8962 13.3257 15.422 12 15.422C10.6743 15.422 9.40263 14.8962 8.464 13.96L0.046 5.54199C0.032 5.69999 0 5.84299 0 5.99999V18C0.00158786 19.3256 0.528882 20.5964 1.46622 21.5338C2.40356 22.4711 3.67441 22.9984 5 23H19C20.3256 22.9984 21.5964 22.4711 22.5338 21.5338C23.4711 20.5964 23.9984 19.3256 24 18V5.99999C24 5.84299 23.968 5.69999 23.954 5.54199Z" fill="#548054" />
                                    <path d="M14.122 12.546L23.256 3.411C22.8135 2.67732 22.1895 2.07004 21.444 1.64773C20.6985 1.22542 19.8568 1.00234 19 1H5.00002C4.14324 1.00234 3.30152 1.22542 2.55605 1.64773C1.81057 2.07004 1.1865 2.67732 0.744019 3.411L9.87802 12.546C10.4416 13.1073 11.2046 13.4225 12 13.4225C12.7954 13.4225 13.5584 13.1073 14.122 12.546Z" fill="#548054" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_4029_2429">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            {t("landingPage.footerEmail")}
                        </p>
                    </div>
                    <p className={`m-0 ${styles['muted-footer-text']}`}>{t("landingPage.footerText")}</p>
                </Container>
            </footer>
        </div>
    );
}