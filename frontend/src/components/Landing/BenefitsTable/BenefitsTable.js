import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card } from "react-bootstrap";
import calorieIcon from '../../../assets/icons/landing/calorie.svg';
import profileIcon from '../../../assets/icons/landing/profile.svg';
import crmIcon from '../../../assets/icons/landing/crm.svg';
import recipeIcon from '../../../assets/icons/landing/recipe.svg';
import reportIcon from '../../../assets/icons/landing/reports.svg';
import mealIcon from '../../../assets/icons/landing/meals.svg';
import styles from './BenefitsTable.module.css';

const BenefitsTable = () => {
    const { t } = useTranslation();

    const items = [
        {
            icon: calorieIcon,
            title: t("benefitsTable.calorieCalculatorTitle"),
            description: t("benefitsTable.calorieCalculatorDescription")
        },
        {
            icon: profileIcon,
            title: t("benefitsTable.creatingProfilesTitle"),
            description: t("benefitsTable.creatingProfilesDescription")
        },
        {
            icon: crmIcon,
            title: t("benefitsTable.crmTitle"),
            description: t("benefitsTable.crmDescription")
        },
        {
            icon: recipeIcon,
            title: t("benefitsTable.recipeDatabaseTitle"),
            description: t("benefitsTable.recipeDatabaseDescription")
        },
        {
            icon: mealIcon,
            title: t("benefitsTable.personalizedMealPlansTitle"),
            description: t("benefitsTable.personalizedMealPlansDescription")
        },
        {
            icon: reportIcon,
            title: t("benefitsTable.reportsAnalyticsTitle"),
            description: t("benefitsTable.reportsAnalyticsDescription")
        }
    ];

    return (
        <section className={`py-5 text-center ${styles.section}`}>
            <Container>
                <h2 className={`${styles.sectionTitle} mb-5`}>{t("benefitsTable.sectionTitle")}</h2>
                <Row className="g-4">
                    {items.map((item, index) => (
                        <Col key={index} xs={12} md={6}>
                            <Card className={`${styles.card} h-100 text-dark`}>
                                <Card.Body className={`${styles.cardBody} p-3`}>
                                    <Row className="align-items-start">
                                        {/* Icon Column */}
                                        <Col xs={2} className="text-center">
                                            <img
                                                src={item.icon}
                                                alt={`${item.title} icon`}
                                                className={styles.icon}
                                            />
                                        </Col>
                                        {/* Content Column */}
                                        <Col xs={10}>
                                            <Card.Title as="h5" className={`${styles.cardTitle} mb-2 text-start`}>
                                                {item.title}
                                            </Card.Title>
                                            <Card.Text className={`${styles.cardText} text-start`}>
                                                {item.description}
                                            </Card.Text>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default BenefitsTable;