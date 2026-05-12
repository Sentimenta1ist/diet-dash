import { useParams, useSearchParams } from "react-router-dom";
import { Fragment, useEffect, useState, useRef } from "react";
import styles from "./PublicDietPlan.module.css";
import { useTranslation } from "react-i18next";
import defaultAxios from "../../utils/defaultAxios";
import { getCurrentLanguage } from "../../configuration/i18n";

function PublicDietPlan() {
  const { profileId } = useParams();
  const [searchParams] = useSearchParams();
  const [dietData, setDietData] = useState(null);
  const itemsToLoad = 3; // Load 3 items at a time
  const [visibleItems, setVisibleItems] = useState(itemsToLoad); // Start with 3 items
  const { t } = useTranslation();
  const loaderRef = useRef(null); // Ref for the loading trigger element

  // Fetch initial data
  useEffect(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate || !profileId) return;

    const lang = getCurrentLanguage();

    defaultAxios
      .get("/ration/public", {
        params: {
          startDate,
          endDate,
          profileId,
          lang,
        },
      })
      .then((response) => setDietData(response.data))
      .catch((error) => console.error("Error fetching diet plan:", error));
  }, [searchParams]);

  // Infinite scroll logic using Intersection Observer
  useEffect(() => {
    if (!dietData || visibleItems >= dietData.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Load more items when the loader is visible
          setVisibleItems((prev) => Math.min(prev + itemsToLoad, dietData.length));
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the loader is visible
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [dietData, visibleItems]);

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/public/${profileId}?${searchParams.toString()}`;
    const shareData = {
      title: t("diet.dietPlan.yourRation"),
      text: "Check out my diet plan!",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share. Link copied to clipboard instead!");
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  if (!dietData) return <p>Loading...</p>;

  // Slice the dietData to show only visible items
  const visibleDietData = dietData.slice(0, visibleItems);

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("diet.dietPlan.yourRation")}</h1>
          <button className={styles.shareButton} onClick={handleShare}>
            Share
          </button>
        </div>

        <table className={styles.table}>
          <tbody>
            {visibleDietData.map((mealDay) => (
              <Fragment key={mealDay.date}>
                <tr>
                  <td colSpan={3} className={styles.dateCell}>
                    {mealDay.date}
                  </td>
                </tr>
                {mealDay.meals.map((meal, index) => (
                  <tr key={index}>
                    <td>{meal.time}</td>
                    <td>{meal.productName}</td>
                    <td>{meal.grams}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* Loader element to trigger more data */}
        {visibleItems < dietData.length && (
          <div ref={loaderRef} className={styles.loader}>
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicDietPlan;