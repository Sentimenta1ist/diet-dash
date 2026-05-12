import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import styles from "./Diet.module.css";
import NutritionProgress from "../../../models/NutritionProgress";
import SearchDropdown from "./SearchDropdown/SearchDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Datepicker.css";
import ProgressBar from "./ProgressBar/ProgressBar";
import { colors } from '../../../values/colors';
import { useProfile } from "../../../ProfileContext";
import { useDispatch, useSelector } from "react-redux";
import useFetchUser from "../../../hooks/useFetchUser";
import { useTranslation } from "react-i18next";
import ExportWindow from "./ExportWindow/ExportWindow";
import { validateDigitsInput } from "../../../utils/inputUtils";
import DietPlanTable from "./DietPlanTable/DietPlanTable";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // For arrows
import { addDays, subDays, parseISO } from "date-fns";
import {
  fetchRation,
  deleteDietItem,
  addProduct,
  updateDietItem,
} from "../../../redux/slices/rationSlice";
import debounce from "lodash/debounce";
import {
  initializeDietItems,
  calculateNutritionProgress,
} from "../../../utils/dietItemUtils";
import { formatDate } from "../../../utils/dateUtils";
import { duplicateRation } from "../../../redux/actions/rationActions";
import DateModal from "./DuplicateDateModal/DateModal";
import { createSelector } from "reselect";
import authorizedAxios from "../../../utils/authorizedAxios";
import ProfileSelectionForm from "../ProfileSelectionForm/ProfileSelectionForm";
import DietPlanMobileTable from "./DietPlanMobileTable/DietPlanMobileTable";
import AddProductModal from "./AddProductMobileModal/AddProductModal";
import { setDate } from '../../../redux/slices/rationSlice';


const initialNutritionProgressArray = [
  new NutritionProgress("Calories", 0, 100, "calories"),
  new NutritionProgress("Carbs", 0, 100, "carbs"),
  new NutritionProgress("Protein", 0, 100, "protein"),
  new NutritionProgress("Fat", 0, 100, "fat"),
];
const selectDietItems = (state) => state.ration.dietItems;

const initializeDietItemsSelector = createSelector(
  [selectDietItems],
  (dietItems) => initializeDietItems(dietItems)
);

const Diet = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const dietItems = useSelector(initializeDietItemsSelector);
  // const [displayTimes, setDisplayTimes] = useState([]);
  const { t, i18n } = useTranslation();
  const { selectedProfile } = useProfile();
  const user = useSelector((state) => state.profile.user); // Access user data from Redux
  const [nutritionProgressArray, setNutritionProgressArray] = useState(
    initialNutritionProgressArray
  );
  const startDateStr = useSelector((state) => state.ration.date); // "YYYY-MM-DD"
  const startDateDate = useMemo(() => parseISO(startDateStr), [startDateStr]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [grams, setGrams] = useState(100); // Default grams
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);


  // Use a ref to store pending updates, keyed by mealId
  const pendingUpdatesRef = useRef(new Map());
  const debounceTimeForCell = 1000;

  const handleGramsChange = (e) => {
    const inputValue = e.target.value;
    const validatedValue = validateDigitsInput(inputValue);
    setGrams(validatedValue);
  };

  const handleDelete = (id) => {
    dispatch(deleteDietItem(id));
  };

  const setStartDate = (newDate) => {
    dispatch(setDate(formatDate(newDate)));
  }



  // Optimistic update for Redux store
  const updateDietItemLocally = (mealId, updatedData) => {
    dispatch({
      type: "ration/updateDietItemLocally",
      payload: { mealId, updatedData },
    });
  };

  // Debounced function to sync all pending updates with the server
  const syncPendingUpdatesWithServer = useCallback(
    debounce(() => {
      const updates = pendingUpdatesRef.current;
      updates.forEach((updatedData, mealId) => {
        dispatch(
          updateDietItem({
            mealId,
            updatedData,
            profileId: selectedProfile.id,
            startDate: startDateStr,
          })
        ).unwrap().catch((error) => {
          console.error(`Failed to sync meal ${mealId}:`, error);
          // Optionally revert the update here if needed
        });
      });
      // Clear pending updates after syncing
      pendingUpdatesRef.current.clear();
    }, debounceTimeForCell),
    [dispatch, selectedProfile, startDateStr] // Dependencies
  );

  const handleTimeChange = (item, value) => {
    const updatedItem = { ...item };
    const [newHours, newMinutes] = value.split(":").map(Number);

    if (newHours >= 0 && newHours < 24 && newMinutes >= 0 && newMinutes < 60) {
      const newTime = new Date(updatedItem.time || startDateStr);
      newTime.setHours(newHours);
      newTime.setMinutes(newMinutes);
      updatedItem.time = newTime;
    } else {
      console.error("Invalid time value");
      updatedItem.time = null;
    }

    const updatedData = {
      grams: updatedItem.grams,
      productId: updatedItem.product.id,
      time: updatedItem.time ? updatedItem.time.toTimeString().slice(0, 5) : "00:00",
    };

    // Update Redux immediately (optimistic update)
    updateDietItemLocally(updatedItem.id, updatedData);

    // Store the latest update in the pending updates map
    pendingUpdatesRef.current.set(updatedItem.id, updatedData);

    // Trigger the debounced sync
    syncPendingUpdatesWithServer();
  };

  const handleChange = (index, updatedItem, name, value) => {
    updatedItem[name] = value;

    const updatedData = {
      grams: updatedItem.grams,
      productId: updatedItem.product.id,
      time: updatedItem.time ? updatedItem.time.toTimeString().slice(0, 5) : "00:00",
    };

    // Update Redux immediately (optimistic update)
    updateDietItemLocally(updatedItem.id, updatedData);

    // Store the latest update in the pending updates map
    pendingUpdatesRef.current.set(updatedItem.id, updatedData);

    // Trigger the debounced sync
    syncPendingUpdatesWithServer();
  };

  const handleProductAdd = async (product, time, gramsFromModal) => {
    if (!time) {
      time = "00:00";
    }
    const data = {
      time,
      grams: gramsFromModal !== undefined ? Number(gramsFromModal) : grams, // Use modal's grams if provided
      productId: product.id,
      date: startDateStr,
    };

    if (!selectedProfile) {
      return;
    }

    try {
      await dispatch(
        addProduct({
          profileId: selectedProfile.id,
          data,
        })
      );
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const onUserFetchComplete = useCallback(() => {
    setLoading(false);
  }, []); // Empty dependency array since setLoading is stable

  useFetchUser(onUserFetchComplete);

  const handleDuplicateRation = (targetDates) => {
    // Format the startDate to keep the local date
    const sourceDate = formatDate(startDateStr);

    // Map over targetDates to format each date
    const targetDatesStr = targetDates.map((date) => formatDate(date));

    // Pass the profile ID, sourceDate, and formatted target dates to dispatch
    dispatch(duplicateRation(selectedProfile.id, sourceDate, targetDatesStr));
  };

  useEffect(() => {
    const summedValues = {
      Calories: 0,
      Carbs: 0,
      Protein: 0,
      Fat: 0,
    };

    dietItems.forEach((item) => {
      summedValues.Calories += Number(item.product.calories);
      summedValues.Carbs += Number(item.product.carbs);
      summedValues.Protein += Number(item.product.protein);
      summedValues.Fat += Number(item.product.fat);
    });

    const nutritionProgressItems = calculateNutritionProgress(
      summedValues,
      user,
      t
    );

    // Only update state if there is a change
    if (
      JSON.stringify(nutritionProgressArray) !==
      JSON.stringify(nutritionProgressItems)
    ) {
      setNutritionProgressArray(nutritionProgressItems);
    }
  }, [dietItems, user, t, nutritionProgressArray]);

  useEffect(() => {
    if (selectedProfile) {
      dispatch(fetchRation({ profileId: selectedProfile.id, startDate: startDateStr }));
    }
  }, [startDateStr, selectedProfile, dispatch, t]);

  if (loading) return <div></div>;
  if (!selectedProfile) return <div></div>;
  return (
    <div className={`${styles["diet-page"]}`}>
      <div className={`${styles.container} container`}>
        <div
          className={`row row-cols-2 row-cols-sm-2 row-cols-md-2 row-cols-xl-2 row-cols-xxl-2 w-100 gx-0 ${styles["diet-container"]}`}
        >
          <div
            className={`col-5 col-xs-5 col-sm-5 col-md-5 col-lg-5 col-xl-5 col-xxl-5 ${styles["left-side"]} `}
          >
            <div className={styles["progress-bars-table"]}>
              <div className={`row`}>
                {nutritionProgressArray.map((item) => (
                  <div className={`col`} key={item.name}>
                    <div className={`${styles["progress-bar-box"]}`}>
                      <div className={`${styles["progress-title"]}`}>
                        {item.name}
                      </div>
                      <div className={`progress ${styles.progress}`}>
                        <div
                          className={`progress-bar ${styles[`progress-bar-${item.idName.toLowerCase()}`]
                            }`}
                          role="progressbar"
                          style={{
                            width: `${(item.current / item.total) * 100}%`,
                          }}
                          aria-valuenow={item.current}
                          aria-valuemin="0"
                          aria-valuemax={item.total}
                        ></div>
                      </div>
                      <div className={`${styles["progress-number"]}`}>
                        {`${parseFloat(item.current.toFixed(2))}/${item.total}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles["meal-search-table"]}>
              <div className={`row m-0`}>
                <SearchDropdown
                  onProductAdd={handleProductAdd}
                  grams={grams}
                  onGramsChange={handleGramsChange}
                />
              </div>
            </div>
          </div>
          <div
            className={`col-7 col-xs-7 col-sm-7 col-md-7 col-lg-7 col-xl-7 col-xxl-7 ${styles["right-side"]} `}
          >
            <div className={styles["diet-plan"]}>
              <div className={styles["diet-plan-header"]}>
                <div className={styles["diet-plan-header-text"]}>
                  {t(`diet.dietPlan.header`)}
                </div>
                <div className={`${styles["date-navigation"]} `}>
                  {/* Left Arrow Button */}
                  <button
                    className={styles["arrow-button"]}
                    onClick={() => setStartDate(subDays(startDateDate, 1))}
                  >
                    <FaArrowLeft />
                  </button>

                  {/* DatePicker */}
                  <DatePicker
                    className={styles.datepicker}
                    showIcon
                    selected={startDateDate}
                    onChange={(date) => {
                      setStartDate(date);
                    }}
                    dateFormat="dd/MM/yy"
                    locale={i18n.language}
                  />

                  {/* Right Arrow Button */}
                  <button
                    className={styles["arrow-button"]}
                    onClick={() => setStartDate(addDays(startDateDate, 1))}
                  >
                    <FaArrowRight />
                  </button>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className={`${styles["duplicate-button"]}`}
                >
                  {t("diet.dietPlan.duplicate")}
                </button>
                <DateModal
                  isOpen={isModalOpen}
                  onClose={() => setModalOpen(false)}
                  onConfirm={handleDuplicateRation}
                  sourceDate={startDateDate}
                />
              </div>
              <DietPlanTable
                dietItems={dietItems}
                handleTimeChange={handleTimeChange}
                handleChange={handleChange}
                handleDelete={handleDelete}
              />
              <div className={`${styles["export-row"]}`}>
                <ExportWindow
                  selectedProfile={selectedProfile}
                  t={t}
                  buttonType="fileExport"
                  onExport={async (profileId, startDate, endDate) => {
                    try {
                      const response = await authorizedAxios.get(
                        `/ration/export?profileId=${profileId}&startDate=${startDate}&endDate=${endDate}`,
                        {
                          responseType: "blob",
                        }
                      );

                      const blob = new Blob([response.data], {
                        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      });

                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download = `ration_${selectedProfile.name}.docx`;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (error) {
                      console.error("Error downloading the file:", error);
                    }
                  }}
                />
                <ExportWindow
                  selectedProfile={selectedProfile}
                  t={t}
                  buttonType="linkExport"
                  onExport={(profileId, startDate, endDate) => {
                    // Open the link in a new tab with query parameters
                    const url = `/public/${profileId}?startDate=${startDate}&endDate=${endDate}`;
                    window.open(url, "_blank");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles['mobile-container']}`}>
        <div className="row gx-0 justify-content-center align-items-center w-100">
          <div className="col-2">
            <img
              src={require("../../../images/avatar-default.png")}
              alt="Profile"
              className={`${styles['mobile-image']}`}
            />
          </div>
          <div className="col-10">
            <ProfileSelectionForm
              selectedProfile={selectedProfile}
              setSelectedProfile={() => { }}
              t={t}
            />
          </div>
        </div>
        <div className={styles['progress-bar-box-mobile']}>
          <div className="row gx-0 justify-content-center align-items-center w-100">
            <div className="col">
              <ProgressBar
                label={t("diet.progressBars.calories")}
                value={nutritionProgressArray[0].current}
                goal={nutritionProgressArray[0].total}
                color={colors.kcalCol}></ProgressBar>
            </div>
            <div className="col">
              <ProgressBar
                label={t("diet.progressBars.protein")}
                value={nutritionProgressArray[1].current}
                goal={nutritionProgressArray[1].total}
                color={colors.proteinCol}></ProgressBar>
            </div>
            <div className="col">
              <ProgressBar
                label={t("diet.progressBars.fat")}
                value={nutritionProgressArray[2].current}
                goal={nutritionProgressArray[2].total}
                color={colors.fatCol}></ProgressBar>
            </div>
            <div className="col">
              <ProgressBar
                label={t("diet.progressBars.carbs")}
                value={nutritionProgressArray[3].current}
                goal={nutritionProgressArray[3].total}
                color={colors.carbsCol}></ProgressBar>
            </div>
          </div>
        </div>
        <div className="row gx-0 justify-content-center align-items-center w-100">
          <div className={`${styles["date-navigation"]} col-8`}>

            <button
              className={styles["arrow-button"]}
              onClick={() => setStartDate(subDays(startDateDate, 1))}
            >
              <FaArrowLeft />
            </button>
            <DatePicker
              className={`${styles.datepicker} datepicker-mobile-diet`}
              selected={startDateDate}
              onChange={(date) => {
                setStartDate(date);
              }}
              dateFormat="dd/MM/yy"
              locale={i18n.language}
            />
            {/* Right Arrow Button */}
            <button
              className={styles["arrow-button"]}
              onClick={() => setStartDate(addDays(startDateDate, 1))}
            >
              <FaArrowRight />
            </button>
          </div>
          <img
            src={require("../../../assets/icons/copy-diet-plan.svg").default}
            alt="Copy"
            className={`${styles["svg-icon"]} col-2`}
            onClick={() => setModalOpen(true)}
            height={40}
          />
          <DateModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={handleDuplicateRation}
            sourceDate={startDateDate}
          />
          <img
            src={require("../../../assets/icons/export-diet-plan.svg").default}
            alt="Copy"
            className={`${styles["svg-icon"]} col-2`}
            onClick={() => setShowExportPopup(prev => !prev)}
            height={40}
          />
          {showExportPopup && (
            <div className={styles["export-modal-overlay"]} onClick={() => setShowExportPopup(false)}>
              <div
                className={styles["export-modal-content"]}
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
              >
                <ExportWindow
                  selectedProfile={selectedProfile}
                  t={t}
                  buttonType="fileExport"
                  onExport={async (profileId, startDate, endDate) => {
                    try {
                      const response = await authorizedAxios.get(
                        `/ration/export?profileId=${profileId}&startDate=${startDate}&endDate=${endDate}`,
                        { responseType: "blob" }
                      );

                      const blob = new Blob([response.data], {
                        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      });

                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download = `ration_${selectedProfile.name}.docx`;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (error) {
                      console.error("Error downloading the file:", error);
                    }
                  }}
                />
                <ExportWindow
                  selectedProfile={selectedProfile}
                  t={t}
                  buttonType="linkExport"
                  onExport={(profileId, startDate, endDate) => {
                    const url = `/public/${profileId}?startDate=${startDate}&endDate=${endDate}`;
                    window.open(url, "_blank");
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <DietPlanMobileTable
          dietItems={dietItems}
          handleDelete={handleDelete}
          handleTimeChange={handleTimeChange}
          handleChange={handleChange}
        />
        <button
          className={`${styles["add-product-button"]}`}
          onClick={() => setIsAddProductModalOpen(true)}
        >
          {t("diet.buttons.addProduct")}
        </button>
        {isAddProductModalOpen && (
          <AddProductModal
            handleAddProduct={handleProductAdd}
            onClose={() => setIsAddProductModalOpen(false)} />
        )}
      </div>
    </div >
  );
};

export default Diet;
