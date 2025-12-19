import styles from './league.module.css';

export default function LeagueHeader({ leagueInfo }) {
    return (
        <div className={styles.leagueHeader}>
            <div className={styles.breadcrumb}>
                <span>⚽ FUTEBOL</span>
                <span className={styles.separator}>›</span>
                <img
                    src={leagueInfo.country_flag}
                    alt=""
                    className={styles.countryFlag}
                />
                <span>{leagueInfo.country?.toUpperCase() || 'PAÍS'}</span>
            </div>

            <div className={styles.leagueInfo}>
                <img
                    src={leagueInfo.logo}
                    alt={leagueInfo.name}
                    className={styles.leagueLogo}
                />
                <div className={styles.leagueDetails}>
                    <h1>{leagueInfo.name}</h1>
                    <span className={styles.seasonName}>{leagueInfo.season_name}</span>
                </div>
            </div>
        </div>
    );
}
