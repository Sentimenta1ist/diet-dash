import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../redux/slices/productSlice";
import ProductTable from "./ProductTable/ProductTable";
import SearchBar from "./SearchBar/SearchBar";
import styles from "./ProductList.module.css";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AddProductModal from "./AddProductModal/AddProductModal";
import { debounce } from "lodash";

const ProductList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { products, loading, error, totalPages } = useSelector(
    (state) => state.products
  );

  const [searchResults, setSearchResults] = useState([]);
  const criticalWidth = 800;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const size = 12;
  const observer = useRef();
  const lastProductRef = useRef(null);
  const hasMore = useRef(true);

  // Fetch products when page, searchTerm, or selectedFilter changes
  useEffect(() => {
    // Trigger fetch only after resetting page on search term change
    dispatch(fetchProducts({ page, size, term: searchTerm, filter: selectedFilter }));
  }, [page, searchTerm, selectedFilter, dispatch, t]);

  // Reset page and results when searchTerm changes
  useEffect(() => {
    setPage(0);
    setSearchResults([]); // Clear results immediately
  }, [searchTerm]);

  // Update searchResults based on fetched products
  useEffect(() => {
    if (products.length === 0 && page > 0) {
      hasMore.current = false;
    }

    // Check if it's desktop or mobile behavior
    const isMobile = window.innerWidth <= criticalWidth;
    if (isMobile) {
      // Mobile: Infinite scroll (append results)
      if (page === 0) {
        setSearchResults(products); // Replace results on page 0
      } else {
        setSearchResults((prev) => {
          const newProducts = products.filter(
            (p) => !prev.some((existing) => existing.id === p.id)
          );
          return [...prev, ...newProducts]; // Append for subsequent pages
        });
      }
    } else {
      // Desktop: Replace results on every page change
      setSearchResults(products);
    }
  }, [products, page, criticalWidth]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (loading || !hasMore.current || !lastProductRef.current) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages - 1 && !loading) {
          observer.current.disconnect();
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.current.observe(lastProductRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, totalPages, searchResults]);

  const lastProductElementRef = useCallback((node) => {
    lastProductRef.current = node;
  }, []);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setPage(0);
    setSearchTerm("");
    setSearchResults([]);
    hasMore.current = true;
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleAddProduct = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    dispatch(fetchProducts({ page: 0, size, term: "", filter: selectedFilter }));
    setModalVisible(false);
    setSearchResults([]);
    setPage(0);
    hasMore.current = true;
  };

  return (
    <div className={styles.productListContainer}>
      <h1 className={styles.mobileHeader}>{t("productList.allProducts")}</h1>
      <div className={styles.filterRow}>
        <button
          className={selectedFilter === "all" ? styles.active : ""}
          onClick={() => handleFilterChange("all")}
        >
          {t("productList.filters.all")}
        </button>
        <button
          className={selectedFilter === "personal" ? styles.active : ""}
          onClick={() => handleFilterChange("personal")}
        >
          {t("productList.filters.personal")}
        </button>
        <button
          className={styles.addProductBtnWrapper}
          onClick={handleAddProduct}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className={styles.addProductBtn}
            size="lg"
          />
        </button>
      </div>

      <div className={styles.mobileSearchTable}>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className={styles.mobileResults}>
          {searchResults.map((product, index) => (
            <div
              key={product.id}
              ref={index === searchResults.length - 1 ? lastProductElementRef : null}
              className={styles.mobileResultItem}
            >
              <div className={styles.mobileResultName}>{product.name}</div>
              <div className={styles.mobileResultDetails}>
                <span className={styles.calories}>
                  {t("productList.calories")}: {product.calories}
                </span>{" "}
                |{" "}
                <span className={styles.protein}>
                  {t("productList.protein")}: {product.protein}
                </span>{" "}
                |{" "}
                <span className={styles.carbs}>
                  {t("productList.carbs")}: {product.carbs}
                </span>{" "}
                |{" "}
                <span className={styles.fat}>
                  {t("productList.fat")}: {product.fat}
                </span>
              </div>
              <hr className={styles.mobileResultDivider} />
            </div>
          ))}
          {/* {loading && <div className={styles.loading}>{t("productList.loading")}</div>} */}
          {/* {!hasMore.current && searchResults.length > 0 && (
            <div className={styles.noMore}>{t("productList.noMore")}</div>
          )} */}
        </div>
      </div>

      <div className={styles.desktopLayout}>
        <div className={styles.productSearchRow}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className={styles.addProductBtnWrapper}
            onClick={handleAddProduct}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className={styles.addProductBtn}
              size="3x"
            />
          </button>
        </div>
        <ProductTable products={searchResults || []} />
        <div className={styles.paginationControls}>
          <button disabled={page === 0} onClick={handlePrevPage}>
            {t("pagination.previous")}
          </button>
          <span>
            {t("pagination.page")}{" "}
            {page + 1 > totalPages ? totalPages : page + 1} {t("pagination.of")}{" "}
            {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={handleNextPage}>
            {t("pagination.next")}
          </button>
        </div>
      </div>
      <AddProductModal isVisible={isModalVisible} onClose={closeModal} />
    </div>
  );
};

export default ProductList;