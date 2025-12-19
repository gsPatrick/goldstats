import styles from './match.module.css';

export default function MatchHeader({ header }) {
    if (!header) return null;

    const dateObj = new Date(header.date);
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const timeFormatted = dateObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const getStatusText = (status) => {
        const statusMap = {
            'FT': 'ENCERRADO',
            'NS': 'NÃO INICIADO',
            'LIVE': 'AO VIVO',
            'HT': 'INTERVALO',
            '1H': '1º TEMPO',
            '2H': '2º TEMPO'
        };
        return statusMap[status] || status;
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className={styles.breadcrumb}>
                <span>⚽ FUTEBOL</span>
                <span className={styles.separator}>›</span>
                <span>🇧🇷 BRASIL</span>
                <span className={styles.separator}>›</span>
                <span className={styles.leagueName}>{header.league?.name || 'Liga'}</span>
            </div>

            {/* Main Header */}
            <div className={styles.matchHeader}>
                {/* Home Team */}
                <div className={styles.teamSide}>
                    <div className={styles.teamLogo}>
                        <img src={header.home_team?.logo} alt={header.home_team?.name} />
                    </div>
                    <h2 className={styles.teamName}>{header.home_team?.name}</h2>
                </div>

                {/* Center - Score */}
                <div className={styles.matchCenter}>
                    <div className={styles.matchDateTime}>
                        {dateFormatted} {timeFormatted}
                    </div>
                    <div className={styles.scoreContainer}>
                        <span className={styles.score}>{header.home_team?.score ?? '-'}</span>
                        <span className={styles.scoreSeparator}>-</span>
                        <span className={styles.score}>{header.away_team?.score ?? '-'}</span>
                    </div>
                    <div className={styles.matchStatus}>
                        {getStatusText(header.status)}
                    </div>
                </div>

                {/* Away Team */}
                <div className={styles.teamSide}>
                    <div className={styles.teamLogo}>
                        <img src={header.away_team?.logo} alt={header.away_team?.name} />
                    </div>
                    <h2 className={styles.teamName}>{header.away_team?.name}</h2>
                </div>
            </div>
        </>
    );
}
