'use client';
import { useState, useMemo } from 'react';
import styles from './match.module.css';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaTrophy, FaStar, FaUsers } from 'react-icons/fa';

// Color scale for ratings
const getRatingColor = (value) => {
    if (!value || value === '-' || value === 0) return 'neutral';
    const num = parseFloat(value);
    if (num >= 8.0) return 'excellent';
    if (num >= 7.0) return 'good';
    if (num >= 6.5) return 'average';
    if (num >= 6.0) return 'low';
    return 'poor';
};

// Stat categories matching the screenshot
const STAT_CATEGORIES = [
    { id: 'destaques', label: 'DESTAQUES' },
    { id: 'finalizacoes', label: 'FINALIZAÇÕES' },
    { id: 'ataque', label: 'ATAQUE' },
    { id: 'passes', label: 'PASSES' },
    { id: 'defesa', label: 'DEFESA' },
    { id: 'goleiro', label: 'GOLEIRO' },
    { id: 'gerais', label: 'GERAIS' }
];

// Column definitions for each category
const CATEGORY_COLUMNS = {
    destaques: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'shots', label: 'Fin.', width: 45 },
        { key: 'goals', label: 'Gols', width: 45 },
        { key: 'assists', label: 'Assist.', width: 50 },
        { key: 'keyPasses', label: 'P.Chave', width: 55 },
        { key: 'tackles', label: 'Desr.', width: 50 },
        { key: 'appearances', label: 'Jogos', width: 50 }
    ],
    finalizacoes: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'shots', label: 'Total', width: 50 },
        { key: 'goals', label: 'Gols', width: 45 },
        { key: 'appearances', label: 'Jogos', width: 50 }
    ],
    ataque: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'goals', label: 'Gols', width: 45 },
        { key: 'assists', label: 'Assist.', width: 50 },
        { key: 'keyPasses', label: 'P. Chave', width: 60 },
        { key: 'appearances', label: 'Jogos', width: 50 }
    ],
    passes: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'passes', label: 'Total', width: 50 },
        { key: 'keyPasses', label: 'P. Chave', width: 60 },
        { key: 'appearances', label: 'Jogos', width: 50 }
    ],
    defesa: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'tackles', label: 'Desarmes', width: 65 },
        { key: 'interceptions', label: 'Interc.', width: 55 },
        { key: 'cleanSheets', label: 'SG', width: 45 },
        { key: 'appearances', label: 'Jogos', width: 50 }
    ],
    goleiro: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'saves', label: 'Defesas', width: 60 },
        { key: 'cleanSheets', label: 'SG', width: 45 },
        { key: 'appearances', label: 'Jogos', width: 50 }
    ],
    gerais: [
        { key: 'rating', label: 'Nota', width: 50 },
        { key: 'appearances', label: 'Jogos', width: 50 },
        { key: 'minutes', label: 'Min.', width: 55 },
        { key: 'yellowCards', label: 'Amarelos', width: 65 },
        { key: 'redCards', label: 'Vermelhos', width: 70 }
    ]
};

// Position filter options
const POSITION_FILTERS = {
    all: 'Todos',
    goalkeeper: 'Goleiros',
    defender: 'Defensores',
    midfielder: 'Meias',
    attacker: 'Atacantes'
};

export default function PlayerStatsTab({ homeTeam, awayTeam }) {
    const [selectedTeam, setSelectedTeam] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState('destaques');
    const [positionFilter, setPositionFilter] = useState('all');
    const [searchPlayer, setSearchPlayer] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [sortDir, setSortDir] = useState('desc');

    // Get squad data from team
    const currentSquad = useMemo(() => {
        const team = selectedTeam === 'home' ? homeTeam : awayTeam;
        return team?.squad || {};
    }, [selectedTeam, homeTeam, awayTeam]);

    const currentTeamName = selectedTeam === 'home' ? homeTeam?.name : awayTeam?.name;
    const currentTeamLogo = selectedTeam === 'home' ? (homeTeam?.logo || homeTeam?.image_path) : (awayTeam?.logo || awayTeam?.image_path);

    // Filter by position
    const filterByPosition = (players) => {
        if (!players || positionFilter === 'all') return players || [];

        const positionMap = {
            goalkeeper: ['Goalkeeper', 'Goleiro', 'GK'],
            defender: ['Defender', 'Defensor', 'Centre-Back', 'Left-Back', 'Right-Back', 'CB', 'LB', 'RB', 'Zagueiro', 'Lateral'],
            midfielder: ['Midfielder', 'Meio-Campo', 'Central Midfield', 'Defensive Midfield', 'Attacking Midfield', 'CM', 'DM', 'AM', 'Volante', 'Meia'],
            attacker: ['Attacker', 'Atacante', 'Forward', 'Striker', 'Winger', 'ST', 'LW', 'RW', 'CF', 'Ponta']
        };

        const matchPositions = positionMap[positionFilter] || [];
        return players.filter(p => {
            const pos = (p.position || '').toLowerCase();
            return matchPositions.some(mp => pos.includes(mp.toLowerCase()));
        });
    };

    // Filter and sort players
    const processedPlayers = useMemo(() => {
        let players = currentSquad?.players || [];

        // Position filter
        players = filterByPosition(players);

        // Search filter
        if (searchPlayer.trim()) {
            const search = searchPlayer.toLowerCase();
            players = players.filter(p =>
                p.name?.toLowerCase().includes(search)
            );
        }

        // Sort
        return [...players].sort((a, b) => {
            let aVal = a[sortBy] ?? 0;
            let bVal = b[sortBy] ?? 0;

            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;

            return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });
    }, [currentSquad, positionFilter, searchPlayer, sortBy, sortDir]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
    };

    const formatStatValue = (value, key) => {
        if (value === null || value === undefined || value === '') return '-';
        if (key === 'rating' && value > 0) return value.toFixed(1);
        if (value === 0) return '-';
        return value;
    };

    const columns = CATEGORY_COLUMNS[selectedCategory] || CATEGORY_COLUMNS.destaques;

    // Check if any data exists
    const hasData = (homeTeam?.squad?.hasData || homeTeam?.squad?.players?.length > 0) ||
        (awayTeam?.squad?.hasData || awayTeam?.squad?.players?.length > 0);

    if (!hasData) {
        return (
            <div className={styles.noData}>
                <FaUsers style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                <p>Dados do elenco não disponíveis para esta partida.</p>
            </div>
        );
    }

    return (
        <div className={styles.playerStatsContainer}>
            {/* Team Toggle */}
            <div className={styles.playerStatsTeamSelector}>
                <button
                    className={`${styles.teamBtn} ${selectedTeam === 'home' ? styles.active : ''}`}
                    onClick={() => setSelectedTeam('home')}
                >
                    {homeTeam?.logo && <img src={homeTeam.logo || homeTeam.image_path} alt="" className={styles.teamBtnLogo} />}
                    <span>{homeTeam?.name || 'Casa'}</span>
                </button>
                <button
                    className={`${styles.teamBtn} ${selectedTeam === 'away' ? styles.active : ''}`}
                    onClick={() => setSelectedTeam('away')}
                >
                    {awayTeam?.logo && <img src={awayTeam.logo || awayTeam.image_path} alt="" className={styles.teamBtnLogo} />}
                    <span>{awayTeam?.name || 'Visitante'}</span>
                </button>
            </div>

            {/* Check if current team has data */}
            {(!currentSquad || !currentSquad.hasData || !currentSquad.players?.length) ? (
                <div className={styles.noData}>
                    <FaUsers style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Dados do elenco não disponíveis para {currentTeamName}</p>
                </div>
            ) : (
                <>
                    {/* Position Filters */}
                    <div className={styles.positionFilters}>
                        {Object.entries(POSITION_FILTERS).map(([key, label]) => (
                            <button
                                key={key}
                                className={`${styles.positionBtn} ${positionFilter === key ? styles.active : ''}`}
                                onClick={() => setPositionFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Category Tabs */}
                    <div className={styles.statCategoryTabs}>
                        {STAT_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.statCategoryTab} ${selectedCategory === cat.id ? styles.active : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Column Headers */}
                    <div className={styles.playerStatsHeader}>
                        <div className={styles.headerPlayerCol}>
                            <FaSearch className={styles.headerSearchIcon} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchPlayer}
                                onChange={(e) => setSearchPlayer(e.target.value)}
                                className={styles.headerSearchInput}
                            />
                        </div>
                        {columns.map(col => (
                            <div
                                key={col.key}
                                className={`${styles.headerStatCol} ${sortBy === col.key ? styles.sorted : ''}`}
                                style={{ width: col.width }}
                                onClick={() => handleSort(col.key)}
                            >
                                {col.label}
                                {sortBy === col.key && (
                                    sortDir === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Player Rows */}
                    <div className={styles.playerStatsList}>
                        {processedPlayers.map((player, idx) => (
                            <div
                                key={player.id || idx}
                                className={`${styles.playerStatsRow} ${idx === 0 && sortBy === 'rating' && player.rating > 0 ? styles.topRow : ''}`}
                            >
                                <div className={styles.playerInfoCol}>
                                    {idx < 3 && sortBy === 'rating' && player.rating > 0 ? (
                                        <FaTrophy className={`${styles.medalIcon} ${styles[`medal${idx + 1}`]}`} />
                                    ) : null}
                                    {player.photo ? (
                                        <img
                                            src={player.photo}
                                            alt=""
                                            className={styles.playerRowImg}
                                            onError={(e) => e.target.src = '/placeholder-player.png'}
                                        />
                                    ) : (
                                        <div className={styles.playerRowPlaceholder}>
                                            {player.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className={styles.playerRowMeta}>
                                        <span className={styles.playerRowName}>
                                            {player.jerseyNumber && <span style={{ color: '#999', marginRight: '4px' }}>#{player.jerseyNumber}</span>}
                                            {player.name}
                                        </span>
                                        <span className={styles.playerRowPos}>
                                            {player.position || 'JOG'}
                                        </span>
                                    </div>
                                </div>
                                {columns.map(col => (
                                    <div
                                        key={col.key}
                                        className={styles.playerStatCol}
                                        style={{ width: col.width }}
                                    >
                                        {col.key === 'rating' && player.rating > 0 ? (
                                            <span className={`${styles.ratingBadge} ${styles[getRatingColor(player.rating)]}`}>
                                                {player.rating.toFixed(1)}
                                            </span>
                                        ) : col.key === 'goals' && player.goals > 0 ? (
                                            <span style={{ color: '#4caf50', fontWeight: 600 }}>{player.goals}</span>
                                        ) : col.key === 'assists' && player.assists > 0 ? (
                                            <span style={{ color: '#2196f3', fontWeight: 600 }}>{player.assists}</span>
                                        ) : col.key === 'yellowCards' && player.yellowCards > 0 ? (
                                            <span style={{ color: '#ffc107', fontWeight: 600 }}>{player.yellowCards}</span>
                                        ) : col.key === 'redCards' && player.redCards > 0 ? (
                                            <span style={{ color: '#f44336', fontWeight: 600 }}>{player.redCards}</span>
                                        ) : (
                                            formatStatValue(player[col.key], col.key)
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {processedPlayers.length === 0 && (
                        <div className={styles.noData}>
                            <p>Nenhum jogador encontrado.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
