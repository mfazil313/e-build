import styles from '../styles/ConstructionBackground.module.css'

export default function ConstructionBackground() {
    return (
        <div className={styles.bgContainer}>
            {/* Bricks */}
            <div className={`${styles.icon} ${styles.icon1}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M2 4h20M2 8h20M2 12h20M2 16h20M6 4v4M14 4v4M10 8v4M18 8v4M6 12v4M14 12v4M10 16v4M18 16v4" /></svg>
            </div>
            {/* Pipes */}
            <div className={`${styles.icon} ${styles.icon2}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v4H4zM4 16h16v4H4zM8 8v8M16 8v8" /></svg>
            </div>
            {/* Tiles Grid */}
            <div className={`${styles.icon} ${styles.icon3}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>
            </div>
            {/* Hard Hat */}
            <div className={`${styles.icon} ${styles.icon4}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16h16" /><path d="M12 2v4" /><path d="M5.5 16A6.5 6.5 0 0 1 12 9.5a6.5 6.5 0 0 1 6.5 6.5" /></svg>
            </div>
            {/* Cement Bag */}
            <div className={`${styles.icon} ${styles.icon5}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6c0-1.5 2-2 7-2s7 .5 7 2v13c0 1.5-2 2-7 2s-7-.5-7-2V6z" /><path d="M5 6c0 1.5 2 2 7 2s7-.5 7-2" /><path d="M9 14h6" /><path d="M9 10h6" /></svg>
            </div>
            {/* Trowel */}
            <div className={`${styles.icon} ${styles.icon6}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" /><path d="M12 12V3" /><path d="M10 4h4" /></svg>
            </div>
        </div>
    )
}
