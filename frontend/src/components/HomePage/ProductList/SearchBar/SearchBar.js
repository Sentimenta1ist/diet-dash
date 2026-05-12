import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styles from "./SearchBar.module.css";
import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchProducts } from "../../../../redux/slices/productSlice";
import { debounce } from "lodash";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced function to update searchTerm and fetch products
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 500),
    [setSearchTerm]
  );

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const newTerm = e.target.value;
    setLocalSearchTerm(newTerm);
    debouncedSearch(newTerm); // Trigger debounced search
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(localSearchTerm); // Immediate fetch on submit (desktop)
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
        <button className={`${styles.search__button}`} disabled={false}>
          {t("search")}
        </button>
      </form>
    </header>
  );
};

export default SearchBar;