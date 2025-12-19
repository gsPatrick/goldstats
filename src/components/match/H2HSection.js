'use client';

import { useState } from 'react';
import styles from './match.module.css';

export default function H2HSection({ h2h, homeTeam, awayTeam }) {
    const [filter, setFilter] = useState('total'); // total, home, away

    const getResultBadge = (match, teamId) => {
        const isHome = match.home_team?.id === teamId;
        const teamScore = parseInt(isHome ? match.home_team?.score : match.away_team?.score) || 0;
        const oppScore = parseInt(isHome ? match.away_team?.score : match.home_team?.score) || 0;

        if (teamScore > oppScore) return { text: 'V', class: styles.win };
        if (teamScore < oppScore) return { text: 'D', class: styles.loss };
        return { text: 'E', class: styles.draw };
    };

    // Filter matches based on home/away selection
    const filterMatches = (matches, teamId) => {
        if (!matches) return [];
        if (filter === 'total') return matches;
        if (filter === 'home') {
            return matches.filter(m => m.home_team?.id === teamId);
        }
        if (filter === 'away') {
            return matches.filter(m => m.away_team?.id === teamId);
        }
        return matches;
    };

    const renderMatchList = (matches, team, title) => {
        const filteredMatches = filterMatches(matches, team?.id);

        return (
            <div className={styles.h2hTeamSection}>
                <h4 className={styles.h2hTitle}>
                    <img src={team?.logo} alt="" className={styles.h2hTeamLogo} />
                    ÚLTIMOS JOGOS: {title}
                    {filter !== 'total' && <span className={styles.filterBadge}>({filter.toUpperCase()})</span>}
                </h4>
                <div className={styles.h2hMatchList}>
                    {filteredMatches?.slice(0, 5).map(match => {
                        const result = getResultBadge(match, team?.id);
                        return (
                            <div key={match.id} className={styles.h2hMatchRow}>
                                <span className={styles.h2hDate}>
                                    {new Date(match.date).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit'
                                    })}
                                </span>
                                <span className={styles.h2hLeague}>
                                    {match.league?.short_code || match.league?.name?.substring(0, 3).toUpperCase() || 'LIG'}
                                </span>

                                {/* Home Team */}
                                <div className={styles.h2hTeamRow}>
                                    <img
                                        src={match.home_team?.logo}
                                        alt=""
                                        className={styles.h2hMatchLogo}
                                    />
                                    <span className={match.home_team?.id === team?.id ? styles.bold : ''}>
                                        {match.home_team?.short_name || match.home_team?.name}
                                    </span>
                                    <span className={styles.h2hScore}>{match.home_team?.score}</span>
                                </div>

                                {/* Away Team */}
                                <div className={styles.h2hTeamRow}>
                                    <img
                                        src={match.away_team?.logo}
                                        alt=""
                                        className={styles.h2hMatchLogo}
                                    />
                                    <span className={match.away_team?.id === team?.id ? styles.bold : ''}>
                                        {match.away_team?.short_name || match.away_team?.name}
                                    </span>
                                    <span className={styles.h2hScore}>{match.away_team?.score}</span>
                                </div>

                                <span className={`${styles.resultBadge} ${result.class}`}>
                                    {result.text}
                                </span>
                            </div>
                        );
                    })}
                    {(!filteredMatches || filteredMatches.length === 0) && (
                        <p className={styles.noData}>Sem jogos {filter !== 'total' ? `(${filter})` : ''}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.h2hContainer}>
            {/* Filter Tab Bar */}
            <div className={styles.h2hTabBar}>
                <button
                    className={`${styles.h2hTab} ${filter === 'total' ? styles.active : ''}`}
                    onClick={() => setFilter('total')}
                >
                    TOTAL
                </button>
                <button
                    className={`${styles.h2hTab} ${filter === 'home' ? styles.active : ''}`}
                    onClick={() => setFilter('home')}
                >
                    CASA
                </button>
                <button
                    className={`${styles.h2hTab} ${filter === 'away' ? styles.active : ''}`}
                    onClick={() => setFilter('away')}
                >
                    FORA
                </button>
            </div>

            {/* Home Team History */}
            {renderMatchList(h2h?.home, homeTeam, homeTeam?.name?.toUpperCase())}

            {/* Away Team History */}
            {renderMatchList(h2h?.away, awayTeam, awayTeam?.name?.toUpperCase())}
        </div>
    );
}
