import styles from './match.module.css';

export default function EventTimeline({ events, homeTeam, awayTeam }) {
    if (!events || events.length === 0) {
        return <div className={styles.noData}>Nenhum evento disponível</div>;
    }

    const getEventIcon = (type) => {
        const icons = {
            'goal': '⚽',
            'owngoal': '⚽',
            'penalty': '(P)',
            'yellowcard': '🟨',
            'redcard': '🟥',
            'yellowred': '🟨🟥',
            'substitution': '🔄',
            'var': '📺'
        };
        return icons[type?.toLowerCase()] || '•';
    };

    // Group events by period
    const firstHalf = events.filter(e => e.minute <= 45);
    const secondHalf = events.filter(e => e.minute > 45);

    const renderEvent = (event) => {
        const isHome = event.team_id === homeTeam?.id;

        return (
            <div
                key={event.id || `${event.minute}-${event.type}`}
                className={`${styles.eventRow} ${isHome ? styles.homeEvent : styles.awayEvent}`}
            >
                {isHome ? (
                    <>
                        <div className={styles.eventHomeContent}>
                            <span className={styles.playerName}>{event.player_name}</span>
                            {event.related_player && <span className={styles.relatedPlayer}>{event.related_player}</span>}
                        </div>
                        <div className={styles.eventIcon}>{getEventIcon(event.type)}</div>
                        <div className={styles.eventMinute}>{event.minute}'</div>
                        <div className={styles.eventAwayContent}></div>
                    </>
                ) : (
                    <>
                        <div className={styles.eventHomeContent}></div>
                        <div className={styles.eventMinute}>{event.minute}'</div>
                        <div className={styles.eventIcon}>{getEventIcon(event.type)}</div>
                        <div className={styles.eventAwayContent}>
                            <span className={styles.playerName}>{event.player_name}</span>
                            {event.related_player && <span className={styles.relatedPlayer}>{event.related_player}</span>}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={styles.eventTimeline}>
            {/* First Half */}
            <div className={styles.periodHeader}>
                <span>1º TEMPO</span>
                <span className={styles.periodScore}>0 - 0</span>
            </div>
            <div className={styles.eventsList}>
                {firstHalf.map(renderEvent)}
            </div>

            {/* Second Half */}
            <div className={styles.periodHeader}>
                <span>2º TEMPO</span>
                <span className={styles.periodScore}>
                    {homeTeam?.score} - {awayTeam?.score}
                </span>
            </div>
            <div className={styles.eventsList}>
                {secondHalf.map(renderEvent)}
            </div>
        </div>
    );
}
