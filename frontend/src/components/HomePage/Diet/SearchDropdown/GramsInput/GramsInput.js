import React from "react";
import styles from "./GramsInput.module.css";

const GramsInput = ({ grams, onGramsChange, time, setTime }) => {
    return (
        <div className={styles["search-pickers"]}>
            <div className={styles["grams-picker"]}>
                <input
                    type="text"
                    name="grams"
                    value={grams}
                    onChange={onGramsChange}
                    className={styles["grams-input"]}
                // Removed size attribute; we'll handle width with CSS
                />
                <span>g</span>
            </div>
            <div className={styles["time-picker"]}>
                <input
                    type="time"
                    name="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-control shadow-none"
                />
            </div>
        </div>
    );
};

export default GramsInput;