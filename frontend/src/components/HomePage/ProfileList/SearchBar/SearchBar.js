import styles from "./SearchBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchProfiles } from "../../../../redux/slices/profileListSlice";
import { debounce } from "lodash";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  setSearchResults,
  profiles,
  isMobileVersion = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced function to update searchTerm
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 500),
    [setSearchTerm]
  );

  // Sync localSearchTerm with searchTerm from parent
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const newTerm = e.target.value.trim();
    setLocalSearchTerm(newTerm);
    debouncedSearch(newTerm); // Trigger debounced search
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(localSearchTerm); // Immediate update on submit
    dispatch(fetchProfiles({ page: 0, size: 15, term: localSearchTerm }));
  };

  return (
    <header className={`${styles.search__header}`}>
      <form className={styles.search} onSubmit={handleFormSubmit}>
        <div className={styles.search__icon}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
        <input
          className={styles.search__input}
          type="text"
          id="search"
          placeholder={t("search")}
          value={localSearchTerm}
          onChange={handleSearchChange}
        />
        {!isMobileVersion && (
          <button className={`${styles.search__button}`} disabled={false}>
            {t("search")}
          </button>
        )}
      </form>
    </header>
  );
};

export default SearchBar;