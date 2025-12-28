'use client';

import { useState } from 'react';
import styles from './EventTimeline.module.css';

export default function EventTimeline({ events, homeTeam, awayTeam }) {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Todos' },
        { id: 'goals', label: 'Gols' },
        { id: 'corners', label: 'Cantos' },
        { id: 'cards', label: 'Cartões' },
    ];

    // Helper to format player name
    const getPlayerName = (event) => {
        return event.player_name || event.player?.common_name || event.player?.name || "Desconhecido";
    };

    // Map API types to internal types
    const getEventType = (event) => {
        const typeName = event.type?.name || event.type || "";
        const t = String(typeName).toLowerCase();

        if (t.includes('goal') && !t.includes('missed') && !t.includes('saved')) return 'goal';
        if (t.includes('yellowcard') || t.includes('yellow card')) return 'yellowcard';
        if (t.includes('redcard') || t.includes('red card')) return 'redcard';
        if (t.includes('corner')) return 'corner';
        if (t.includes('substitution')) return 'sub';
        return 'unknown';
    };

    const getFilteredEvents = () => {
        if (!events || events.length === 0) return [];

        let filtered = events.map(e => ({
            id: e.id,
            minute: e.minute,
            type: getEventType(e),
            team: e.participant_id == homeTeam?.id ? 'home' : 'away',
            player: getPlayerName(e),
            result: e.result || "",
            participant_id: e.participant_id
        }));

        // Filter based on active tab
        if (activeFilter === 'goals') {
            filtered = filtered.filter(e => e.type === 'goal');
        } else if (activeFilter === 'corners') {
            filtered = filtered.filter(e => e.type === 'corner');
        } else if (activeFilter === 'cards') {
            filtered = filtered.filter(e => e.type === 'yellowcard' || e.type === 'redcard');
        }

        // Sort by minute descending (latest first)
        return filtered.sort((a, b) => b.minute - a.minute);
    };

    const eventsToRender = getFilteredEvents();

    const getIcon = (type) => {
        switch (type) {
            case 'goal': return '⚽';
            case 'corner': return '🚩';
            case 'yellowcard': return '🟨';
            case 'redcard': return '🟥';
            case 'sub': return '🔄';
            default: return '•';
        }
    };

    return (
        <div className={styles.container}>
            {/* Filters */}
            <div className={styles.filtersWrapper}>
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.active : ''}`}
                        onClick={() => setActiveFilter(filter.id)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Match Status Header */}
            <div className={styles.matchStatusHeader}>
                <div className={styles.teamSide}>
                    {homeTeam?.logo && <img src={homeTeam.logo} alt="" className={styles.logo} />}
                    <span className={styles.teamName}>{homeTeam?.name || 'Casa'}</span>
                </div>

                <div className={styles.scoreCenter}>
                    <span className={styles.statusLabel}>Placar</span>
                    <span className={styles.finalScore}>
                        {homeTeam?.score || 0} - {awayTeam?.score || 0}
                    </span>
                </div>

                <div className={styles.teamSideRight}>
                    <span className={styles.teamName}>{awayTeam?.name || 'Fora'}</span>
                    {awayTeam?.logo && <img src={awayTeam.logo} alt="" className={styles.logo} />}
                </div>
            </div>

            {/* Timeline List */}
            <div className={styles.timelineList}>
                {eventsToRender.map((event, idx) => {
                    const isHome = event.participant_id == homeTeam?.id;
                    const isAway = event.participant_id == awayTeam?.id;
                    const isNeutral = !isHome && !isAway;

                    return (
                        <div key={event.id || idx} className={styles.eventRow}>
                            {/* Home Side */}
                            <div className={`${styles.side} ${styles.homeSide}`}>
                                {isHome && (
                                    <>
                                        <span className={styles.minute}>{event.minute}'</span>
                                        <span className={`${styles.icon} ${styles.iconHome}`}>
                                            {getIcon(event.type)}
                                        </span>
                                        <span className={styles.player}>{event.player}</span>
                                    </>
                                )}
                            </div>

                            {/* Center/Neutral Event */}
                            {isNeutral && (
                                <div className={styles.neutralSide}>
                                    <span className={styles.minute}>{event.minute}'</span>
                                    {getIcon(event.type)}
                                    <span>Evento</span>
                                </div>
                            )}

                            {/* Away Side */}
                            <div className={`${styles.side} ${styles.awaySide}`}>
                                {isAway && (
                                    <>
                                        <span className={styles.player}>{event.player}</span>
                                        <span className={`${styles.icon} ${styles.iconAway}`}>
                                            {getIcon(event.type)}
                                        </span>
                                        <span className={styles.minute}>{event.minute}'</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {eventsToRender.length === 0 && (
                    <div className={styles.emptyState}>
                        Nenhum evento encontrado para este filtro.
                    </div>
                )}
            </div>
        </div>
    );
}
