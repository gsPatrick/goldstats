'use client';

import styles from './match.module.css';

export default function Formations({ lineups, homeTeam, awayTeam }) {
    if (!lineups || (!lineups.home?.starters?.length && !lineups.away?.starters?.length)) {
        // Check alternative structure
        if (!lineups?.home?.players?.length && !lineups?.away?.players?.length) {
            return <div className={styles.noData}>Formações não disponíveis</div>;
        }
    }

    // Get players array (handle both API structures)
    const homePlayers = lineups.home?.starters || lineups.home?.players || [];
    const awayPlayers = lineups.away?.starters || lineups.away?.players || [];
    const homeSubs = lineups.home?.subs || lineups.home?.substitutes || [];
    const awaySubs = lineups.away?.subs || lineups.away?.substitutes || [];

    // Get team avg rating
    const getAvgRating = (players) => {
        const rated = players.filter(p => p.rating);
        if (rated.length === 0) return null;
        const avg = rated.reduce((sum, p) => sum + parseFloat(p.rating), 0) / rated.length;
        return avg.toFixed(1);
    };

    // Rating color based on value
    const getRatingClass = (rating) => {
        if (!rating) return '';
        const r = parseFloat(rating);
        if (r >= 7.5) return styles.ratingHigh;
        if (r >= 6.5) return styles.ratingMid;
        if (r < 6) return styles.ratingLow;
        return '';
    };

    const renderPlayer = (player, isHome) => {
        const rating = player.rating ? parseFloat(player.rating).toFixed(1) : null;
        const name = player.name?.split(' ').pop() || 'N/A';
        const number = player.number || player.jersey_number || '';
        const image = player.image;

        return (
            <div key={player.id || player.name} className={styles.formationPlayer}>
                {/* Player photo */}
                <div className={styles.playerPhotoWrapper}>
                    {image && !image.includes('placeholder') ? (
                        <img src={image} alt="" className={styles.playerPhoto} />
                    ) : (
                        <div className={`${styles.playerPhotoPlaceholder} ${isHome ? styles.homeColors : styles.awayColors}`}>
                            {number}
                        </div>
                    )}
                    {rating && (
                        <span className={`${styles.playerRatingBadge} ${getRatingClass(rating)}`}>
                            {rating}
                        </span>
                    )}
                </div>
                <span className={styles.playerNameFormation}>{number} {name}</span>
            </div>
        );
    };

    // Parse formation (e.g., "4-3-3" -> [4, 3, 3])
    const parseFormation = (formation) => {
        if (!formation) return [4, 4, 2];
        return formation.split('-').map(n => parseInt(n) || 0);
    };

    // Get grid-based positions for players
    const getPlayersByLine = (players, formation) => {
        const lines = parseFormation(formation);
        const result = [];
        let idx = 0;

        // GK first
        if (players[idx]) {
            result.push([players[idx]]);
            idx++;
        }

        // Then each line
        for (const count of lines) {
            const line = [];
            for (let i = 0; i < count && idx < players.length; i++) {
                if (players[idx]) line.push(players[idx]);
                idx++;
            }
            if (line.length > 0) result.push(line);
        }

        return result;
    };

    const homeLines = getPlayersByLine(homePlayers, lineups.home?.formation);
    const awayLines = getPlayersByLine(awayPlayers, lineups.away?.formation);

    return (
        <div className={styles.formationsContainer}>
            {/* Formation Headers with avg rating */}
            <div className={styles.formationHeader}>
                <div className={styles.formationSide}>
                    <span className={styles.formationLabel}>{lineups.home?.formation || '4-3-3'}</span>
                    {getAvgRating(homePlayers) && (
                        <span className={`${styles.avgRating} ${getRatingClass(getAvgRating(homePlayers))}`}>
                            Ø {getAvgRating(homePlayers)}
                        </span>
                    )}
                </div>
                <span className={styles.formationTitle}>FORMAÇÕES</span>
                <div className={styles.formationSide}>
                    {getAvgRating(awayPlayers) && (
                        <span className={`${styles.avgRating} ${getRatingClass(getAvgRating(awayPlayers))}`}>
                            Ø {getAvgRating(awayPlayers)}
                        </span>
                    )}
                    <span className={styles.formationLabel}>{lineups.away?.formation || '4-4-2'}</span>
                </div>
            </div>

            {/* Soccer Field - Side by side */}
            <div className={styles.fieldContainer}>
                {/* Home Half */}
                <div className={styles.fieldHalfVertical}>
                    {homeLines.map((line, lineIdx) => (
                        <div key={lineIdx} className={styles.formationLine}>
                            {line.map(p => renderPlayer(p, true))}
                        </div>
                    ))}
                </div>

                {/* Center line */}
                <div className={styles.fieldCenterLine}></div>

                {/* Away Half */}
                <div className={styles.fieldHalfVertical}>
                    {[...awayLines].reverse().map((line, lineIdx) => (
                        <div key={lineIdx} className={styles.formationLine}>
                            {line.map(p => renderPlayer(p, false))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Substitutes */}
            {(homeSubs.length > 0 || awaySubs.length > 0) && (
                <div className={styles.substitutesSection}>
                    <h4>JOGADORES SUBSTITUÍDOS</h4>
                    <div className={styles.substitutesList}>
                        <div className={styles.teamSubs}>
                            {homeSubs.slice(0, 6).map(sub => (
                                <div key={sub.id || sub.name} className={styles.subPlayer}>
                                    <div className={styles.subPhotoWrapper}>
                                        {sub.image && !sub.image.includes('placeholder') ? (
                                            <img src={sub.image} alt="" className={styles.subPhoto} />
                                        ) : (
                                            <div className={`${styles.subPhotoPlaceholder} ${styles.homeColors}`}>
                                                {sub.number || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.subInfo}>
                                        <span className={styles.subName}>{sub.name}</span>
                                        {sub.events?.[0]?.related_player_name && (
                                            <span className={styles.subDetails}>
                                                ↔ {sub.events[0].related_player_name} {sub.events[0].minute}'
                                            </span>
                                        )}
                                    </div>
                                    {sub.rating && (
                                        <span className={`${styles.subRating} ${getRatingClass(sub.rating)}`}>
                                            {parseFloat(sub.rating).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className={styles.teamSubs}>
                            {awaySubs.slice(0, 6).map(sub => (
                                <div key={sub.id || sub.name} className={styles.subPlayer}>
                                    {sub.rating && (
                                        <span className={`${styles.subRating} ${getRatingClass(sub.rating)}`}>
                                            {parseFloat(sub.rating).toFixed(1)}
                                        </span>
                                    )}
                                    <div className={styles.subPhotoWrapper}>
                                        {sub.image && !sub.image.includes('placeholder') ? (
                                            <img src={sub.image} alt="" className={styles.subPhoto} />
                                        ) : (
                                            <div className={`${styles.subPhotoPlaceholder} ${styles.awayColors}`}>
                                                {sub.number || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.subInfo}>
                                        <span className={styles.subName}>{sub.name}</span>
                                        {sub.events?.[0]?.related_player_name && (
                                            <span className={styles.subDetails}>
                                                {sub.events[0].minute}' {sub.events[0].related_player_name} ↔
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
