import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ label, value, goal, color }) => {
    value = parseFloat(Number(value).toFixed(1));
    goal = parseFloat(Number(goal).toFixed(1));
    const radius = 30; // Smaller radius for the circle
    const strokeWidth = 4;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;

    const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
    const backgroundOpacity = 0.2;
    const gapSize = progress > 0 ? 12 : 0; // Size of the gap between the two arcs

    const progressLength = circumference * progress;
    const remainingLength = circumference - progressLength;

    // Apply the gap in between progress and remaining arc
    const progressDasharray = `${progressLength} ${circumference}`;
    const remainingDasharray = `${remainingLength - gapSize} ${circumference}`;

    return (
        <div className={styles.progressBar}>
            <div className={styles.progressLabel}>{label}</div>
            <div className={styles.circleWrapper}>
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className={styles.progressCircle}
                    style={{ transform: 'rotate(-90deg)' }} // Start from top
                >
                    {/* Progress Arc */}
                    <circle
                        stroke={progress > 0 ? color : "transparent"} // Hide when zero
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        strokeDasharray={progressDasharray}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }} // Add stroke transition too
                    />

                    {/* Remaining Arc */}
                    {progress < 1 && (
                        <circle
                            stroke={color}
                            strokeOpacity={backgroundOpacity}
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            strokeDasharray={remainingDasharray}
                            strokeDashoffset={-(progressLength + gapSize / 2)} // Offset to create the gap
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    )}
                </svg>

                <div className={styles.progressInfo}>
                    <div className={styles.progressValue}>{value}</div>
                    <div
                        className={styles.progressDivider}
                        style={{
                            borderColor: color,
                            opacity: backgroundOpacity,
                        }}
                    />
                    <div className={styles.progressGoal}>{goal}</div>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
