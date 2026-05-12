import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SearchDropdown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { useProfile } from "../../../../ProfileContext";
import {
  fetchSearchProducts,
  resetSearch,
} from "../../../../redux/slices/productSearchSlice";
import GramsInput from './GramsInput/GramsInput';
import { FiUser } from "react-icons/fi";


// Custom debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

const SearchDropdown = ({ onProductAdd, grams, onGramsChange, hideInputs = false, onMenuToggle }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { searchResults, hasMore, loading } = useSelector(
    (state) => state.productSearch
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [time, setTime] = useState("10:00");
  const [searchPageSize] = useState(50);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { selectedProfile } = useProfile();
  const searchDropdownRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useDebounce((inputValue) => {
    if (inputValue.trim() === "") {
      dispatch(resetSearch());
    } else {
      dispatch(resetSearch());
      dispatch(
        fetchSearchProducts({
          searchTerm: inputValue,
          page: 0,
          size: searchPageSize,
        })
      );
    }
  }, 500);

  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setIsMenuOpen(true);
    debouncedSearch(inputValue);
  };

  const handleSearchFocus = () => {
    if (searchTerm.trim() !== "" && searchResults.length > 0) {
      setIsMenuOpen(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleProductSelect = (product) => {
    onProductAdd(product, time, grams);
    setIsMenuOpen(false);
  };

  const fetchMoreResults = () => {
    if (hasMore && searchTerm.trim()) {
      dispatch(
        fetchSearchProducts({
          searchTerm,
          page: Math.ceil(searchResults.length / searchPageSize),
          size: searchPageSize,
        })
      );
    }
  };

  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle(isMenuOpen);
    }
  }, [isMenuOpen, onMenuToggle]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      setSearchTerm("");
      dispatch(resetSearch());
    };
  }, [dispatch, selectedProfile]);

  return (
    <div className={`${styles.searchDropdown}`} ref={searchDropdownRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className={`${styles.searchInputContainer}`}>
          <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.icon} />
          <div className={`${styles["search-input-wrapper"]}`}>
            <input
              type="text"
              placeholder={t("productSearchDropdown.searchPlaceholder")}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className={styles.searchInput}
            />
          </div>
          {!hideInputs && (
            <GramsInput
              grams={grams}
              onGramsChange={onGramsChange}
              time={time}
              setTime={setTime}
            />
          )}
        </div>
      </form>
      {isMenuOpen && searchResults.length > 0 && (
        <InfiniteScroll
          dataLength={searchResults.length}
          next={fetchMoreResults}
          hasMore={hasMore}
          loader={loading && <p>Loading...</p>}
          endMessage={<div></div>}
          height={300}
          scrollThreshold={0.99}
          className={`${styles["diet-items-scrollable-container"]}`}
        >
          <ul className={styles.dropdownMenu}>
            {searchResults.map((product) => (
              <li
                key={product.id}
                className={styles.dropdownItem}
                onClick={() => handleProductSelect(product)}
              >
                <div className={styles.dropdownItemContent}>
                  <div className={styles.dropdownItemInfo} title={product.name}>
                    <div
                      className={`${styles.dropdownItemLabel} text-truncate`}
                    >
                      {product.name}
                    </div>
                    <div className={`${styles.dropdownItemText}`}>
                      <span className={styles.kcal}>
                        {t("productSearchDropdown.kcal")}: {product.calories}
                      </span>{" "}
                      <span className={styles.protein}>
                        {t("productSearchDropdown.protein")}: {product.protein}
                      </span>{" "}
                      <span className={styles.fat}>
                        {t("productSearchDropdown.fat")}: {product.fat}
                      </span>{" "}
                      <span className={styles.carbs}>
                        {t("productSearchDropdown.carbs")}: {product.carbs}
                      </span>
                    </div>
                  </div>
                  {product.created && (
                    <span className={styles['created-product']}>
                      <FiUser size={28} style={{ marginRight: 4 }} />
                    </span>
                  )}
                  {!hideInputs && (
                    <div className={styles.dropdownButtons}>
                      <button className={`${styles.customButton}`}>
                        <FontAwesomeIcon
                          icon={faPlus}
                          className={styles.icon}
                          size="lg"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.hackyOffPageElement}></div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default SearchDropdown;