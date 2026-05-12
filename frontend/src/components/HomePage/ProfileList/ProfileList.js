import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProfiles } from "../../../redux/slices/profileListSlice";
import ProfileTable from "./ProfileTable/ProfileTable";
import SearchBar from "./SearchBar/SearchBar";
import styles from "./ProfileList.module.css";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const ProfileList = ({ isMobileVersion = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profiles, loading, error, totalPages } = useSelector(
    (state) => state.profileList
  );

  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;
  const observer = useRef();
  const lastProfileRef = useRef(null);
  const hasMore = useRef(true);

  // Fetch profiles when page or searchTerm changes
  useEffect(() => {
    dispatch(fetchProfiles({ page, size, term: searchTerm }));
  }, [page, searchTerm, dispatch]);

  // Reset page and results when searchTerm changes
  useEffect(() => {
    setPage(0);
    setSearchResults([]);
    hasMore.current = true;
  }, [searchTerm]);

  // Update searchResults based on fetched profiles
  useEffect(() => {
    if (profiles.length === 0 && page > 0) {
      hasMore.current = false;
    }

    if (page === 0) {
      setSearchResults(profiles);
    } else {
      setSearchResults((prev) => {
        const newProfiles = profiles.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        );
        return [...prev, ...newProfiles];
      });
    }
  }, [profiles, page]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (loading || !hasMore.current || !lastProfileRef.current) return;

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
    observer.current.observe(lastProfileRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, totalPages, searchResults]);

  const lastProfileElementRef = useCallback((node) => {
    lastProfileRef.current = node;
  }, []);

  const handleAddProfile = () => {
    navigate("/add-profile");
  };

  const handleDeleteProfile = (profileId) => {
    setSearchResults((prev) =>
      (prev || []).filter((profile) => profile.id !== profileId)
    );
  }

  return (
    <div className={`${styles["profile-list-container"]} ${isMobileVersion ? styles["cnt-no-bg"] : ''}`}>
      <div className={styles["profile-search-row"]}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSearchResults={setSearchResults}
          profiles={profiles}
          isMobileVersion={isMobileVersion}
        />
        {!isMobileVersion && (
          <button
            className={styles["add-profile-btn-wrapper"]}
            onClick={handleAddProfile}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className={styles["add-profile-btn"]}
              size="3x"
            />
          </button>
        )}
      </div>

      <ProfileTable
        profiles={searchResults || []}
        lastProfileRef={lastProfileElementRef}
        profileDeleteionCallback={handleDeleteProfile}
        isMobileVersion={isMobileVersion}
      />
    </div>
  );
};

export default ProfileList;