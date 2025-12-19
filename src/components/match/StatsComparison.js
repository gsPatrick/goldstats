'use client';

import { useState } from 'react';
import styles from './match.module.css';

export default function StatsComparison({ statistics, homeTeam, awayTeam }) {
    const [period, setPeriod] = useState('fulltime'); // fulltime, ht (1º tempo), st (2º tempo)

    if (!statistics || Object.keys(statistics).length === 0) {
        return <div className={styles.noData}>Estatísticas não disponíveis</div>;
    }

    // Get stats for selected period
    const periodStats = statistics[period] || statistics.fulltime || statistics;

    // Define stats to show (in order) - matching Flashscore screenshot
    const statsConfig = [
        { key: 'xg', label: 'Gols esperados (xG)', hasXg: true },
        { key: 'possession', label: 'Posse de bola', suffix: '%' },
        { key: 'shots_total', label: 'Total de finalizações' },
        { key: 'shots_on_target', label: 'Finalizações no alvo' },
        { key: 'big_chances', label: 'Chances claras' },
        { key: 'corners', label: 'Escanteios' },
        { key: 'passes', label: 'Passes' },
        { key: 'yellow_cards', label: 'Cartões amarelos' },
        { key: 'red_cards', label: 'Cartões vermelhos' }
    ];

    // Map API data to stat keys
    const getStatValue = (stat, side) => {
        const data = periodStats;
        switch (stat.key) {
            case 'xg':
                return statistics.xG?.[side] || 0;
            case 'possession':
                return data.possession?.[side] || data[side]?.ball_possession || 0;
            case 'shots_total':
                return data.shots?.total?.[side] || data[side]?.shots_total || 0;
            case 'shots_on_target':
                return data.shots?.onTarget?.[side] || data[side]?.shots_on_target || 0;
            case 'big_chances':
                return data.attacks?.dangerous?.[side] || data[side]?.dangerous_attacks || 0;
            case 'corners':
                return data.attacks?.corners?.[side] || data[side]?.corners || 0;
            case 'passes':
                return data.others?.passes?.[side] || data[side]?.passes_total || 0;
            case 'yellow_cards':
                return data.others?.yellowCards?.[side] || data[side]?.yellow_cards || 0;
            case 'red_cards':
                return data.others?.redCards?.[side] || data[side]?.red_cards || 0;
            default:
                return 0;
        }
    };

    const renderStatBar = (stat) => {
        const homeVal = getStatValue(stat, 'home');
        const awayVal = getStatValue(stat, 'away');
        const total = homeVal + awayVal || 1;
        const homePercent = (homeVal / total) * 100;
        const awayPercent = (awayVal / total) * 100;

        // Determine which side is "winning"
        const homeIsHigher = homeVal > awayVal;
        const awayIsHigher = awayVal > homeVal;

        return (
            <div key={stat.key} className={styles.statRow}>
                <div className={`${styles.statValue} ${homeIsHigher ? styles.statWinner : ''}`}>
                    {stat.hasXg ? homeVal.toFixed(2) :
                        stat.suffix ? `${homeVal}${stat.suffix}` : homeVal}
                </div>
                <div className={styles.statBarContainer}>
                    <div className={styles.statLabel}>
                        {stat.label}
                        {stat.hasXg && <span className={styles.infoIcon}>ⓘ</span>}
                    </div>
                    <div className={styles.statBars}>
                        <div
                            className={`${styles.statBarHome} ${homeIsHigher ? styles.statBarWinner : ''}`}
                            style={{ width: `${homePercent}%` }}
                        ></div>
                        <div
                            className={`${styles.statBarAway} ${awayIsHigher ? styles.statBarWinner : ''}`}
                            style={{ width: `${awayPercent}%` }}
                        ></div>
                    </div>
                </div>
                <div className={`${styles.statValue} ${awayIsHigher ? styles.statWinner : ''}`}>
                    {stat.hasXg ? awayVal.toFixed(2) :
                        stat.suffix ? `${awayVal}${stat.suffix}` : awayVal}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.statsComparison}>
            {/* Period Tabs */}
            <div className={styles.periodTabs}>
                <button
                    className={`${styles.periodTab} ${period === 'fulltime' ? styles.active : ''}`}
                    onClick={() => setPeriod('fulltime')}
                >
                    JOGO
                </button>
                <button
                    className={`${styles.periodTab} ${period === 'ht' ? styles.active : ''}`}
                    onClick={() => setPeriod('ht')}
                >
                    1º TEMPO
                </button>
                <button
                    className={`${styles.periodTab} ${period === 'st' ? styles.active : ''}`}
                    onClick={() => setPeriod('st')}
                >
                    2º TEMPO
                </button>
            </div>

            <div className={styles.statsHeader}>
                <span>DESTAQUES</span>
            </div>
            <div className={styles.statsList}>
                {statsConfig.map(renderStatBar)}
            </div>
        </div>
    );
}
