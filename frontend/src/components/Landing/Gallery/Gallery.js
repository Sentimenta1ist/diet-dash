import React, { useState } from "react";
import styles from "./Gallery.module.css";
import arrowLeft from '../../../images/left-arrow.svg';
import arrowRight from '../../../images/right-arrow.svg';

const images = [
    { src: "/landing-gallery/1.png", alt: "Image 1" },
    { src: "/landing-gallery/2.png", alt: "Image 2" },
    { src: "/landing-gallery/3.png", alt: "Image 3" },
    { src: "/landing-gallery/4.png", alt: "Image 4" }
];

const Gallery = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    return (
        <div className={styles.galleryWrapper}>
            <div className={styles.gallery}>
                <button className={`${styles.navButton} ${styles.navButtonLeft}`} onClick={goToPrevious}>
                    <img src={arrowLeft} alt="Previous" />
                </button>
                <div className={styles.imageSlider}>
                    <div
                        className={styles.imageWrapper}
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {images.map((image, index) => (
                            <div key={index} className={styles.imageContainer}>
                                <img src={image.src} alt={image.alt} className={styles.galleryImage} />
                            </div>
                        ))}
                    </div>
                </div>
                <button className={`${styles.navButton} ${styles.navButtonRight}`} onClick={goToNext}>
                    <img src={arrowRight} alt="Next" />
                </button>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={styles.progressIndicator}
                    style={{ left: `${(currentIndex / (images.length)) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default Gallery;