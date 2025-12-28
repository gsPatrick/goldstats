'use client';

import { useState } from 'react';
import styles from './match.module.css';

export default function StandingsTable({ standings, topPlayers, homeTeamId, awayTeamId }) {
    const [activeTab, setActiveTab] = useState('classificacao');
    const [filter, setFilter] = useState('total'); // total, home, away
    const [scorerTab, setScorerTab] = useState('gols'); // gols, assistencias

    if (!standings || standings.length === 0) {
        return <div className={styles.noData}>Classificação não disponível</div>;
    }

    const getFormBadge = (result) => {
        const classes = {
            'W': styles.formWin,
            'D': styles.formDraw,
            'L': styles.formLoss
        };
        return classes[result] || styles.formDraw;
    };

    const getZoneClass = (position, total, status) => {
        if (status) {
            if (status.includes('Champions')) return styles.zoneChampions;
            if (status.includes('Europa')) return styles.zoneEuropa;
            if (status.includes('Relegation')) return styles.zoneRelegation;
        }
        if (position <= 4) return styles.zoneChampions;
        if (position === 5 || position === 6) return styles.zoneEuropa;
        if (position > total - 3) return styles.zoneRelegation;
        return '';
    };

    const getTeamData = (team) => {
        if (filter === 'home' && team.home) {
            return {
                played: team.home.played,
                won: team.home.won,
                draw: team.home.draw,
                lost: team.home.lost,
                goals_for: team.home.goals_for,
                goals_against: team.home.goals_against,
                points: team.home.points
            };
        }
        if (filter === 'away' && team.away) {
            return {
                played: team.away.played,
                won: team.away.won,
                draw: team.away.draw,
                lost: team.away.lost,
                goals_for: team.away.goals_for,
                goals_against: team.away.goals_against,
                points: team.away.points
            };
        }
        return {
            played: team.stats?.p || (team.won + team.draw + team.lost) || 0,
            won: team.won || team.stats?.w || 0,
            draw: team.draw || team.stats?.d || 0,
            lost: team.lost || team.stats?.l || 0,
            goals_for: team.goals_for || 0,
            goals_against: team.goals_against || 0,
            points: team.points || 0
        };
    };

    const getSortedStandings = () => {
        if (filter === 'total') return standings;
        return [...standings].sort((a, b) => {
            const dataA = getTeamData(a);
            const dataB = getTeamData(b);
            return dataB.points - dataA.points;
        });
    };

    const sortedStandings = getSortedStandings();

    return (
        <div className={styles.standingsWrapper}>
            {/* Sub-tabs */}
            <div className={styles.standingsTabBar}>
                <button
                    className={`${styles.standingsTab} ${activeTab === 'classificacao' ? styles.active : ''}`}
                    onClick={() => setActiveTab('classificacao')}
                >
                    CLASSIFICAÇÃO
                </button>
                <button
                    className={`${styles.standingsTab} ${activeTab === 'forma' ? styles.active : ''}`}
                    onClick={() => setActiveTab('forma')}
                >
                    FORMA
                </button>
                <button
                    className={`${styles.standingsTab} ${activeTab === 'overunder' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overunder')}
                >
                    ACIMA/ABAIXO
                </button>
                <button
                    className={`${styles.standingsTab} ${activeTab === 'artilheiros' ? styles.active : ''}`}
                    onClick={() => setActiveTab('artilheiros')}
                >
                    ARTILHEIROS
                </button>
            </div>

            {/* Filter - only show for non-artilheiros tabs */}
            {activeTab !== 'artilheiros' && (
                <div className={styles.standingsFilter}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'total' ? styles.active : ''}`}
                        onClick={() => setFilter('total')}
                    >
                        TOTAL
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'home' ? styles.active : ''}`}
                        onClick={() => setFilter('home')}
                    >
                        CASA
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'away' ? styles.active : ''}`}
                        onClick={() => setFilter('away')}
                    >
                        FORA
                    </button>
                </div>
            )}

            {/* CLASSIFICAÇÃO Tab */}
            {activeTab === 'classificacao' && (
                <div className={styles.standingsTableWrapper}>
                    <table className={styles.standingsTable}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>EQUIPE</th>
                                <th>J</th>
                                <th>V</th>
                                <th>E</th>
                                <th>D</th>
                                <th>G</th>
                                <th>SG</th>
                                <th>P</th>
                                <th>FORMA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStandings.map((team, idx) => {
                                const data = getTeamData(team);
                                const isHighlighted = team.team_id === homeTeamId || team.team_id === awayTeamId;
                                const position = filter === 'total' ? team.position : idx + 1;
                                const zoneClass = getZoneClass(position, standings.length, team.status);
                                const gd = data.goals_for - data.goals_against;

                                return (
                                    <tr
                                        key={team.team_id || idx}
                                        className={`${isHighlighted ? styles.highlightedRow : ''}`}
                                    >
                                        <td className={styles.positionCell}>
                                            <span
                                                className={`${styles.positionIndicator} ${zoneClass}`}
                                            ></span>
                                            <span className={styles.positionNumber}>{position}</span>
                                        </td>
                                        <td className={styles.teamCell}>
                                            <img src={team.team_logo} alt="" className={styles.teamLogoSmall} />
                                            <span>{team.team_name}</span>
                                        </td>
                                        <td>{data.played}</td>
                                        <td>{data.won}</td>
                                        <td>{data.draw}</td>
                                        <td>{data.lost}</td>
                                        <td>{data.goals_for}:{data.goals_against}</td>
                                        <td className={gd > 0 ? styles.positive : gd < 0 ? styles.negative : ''}>
                                            {gd > 0 ? '+' : ''}{gd}
                                        </td>
                                        <td><strong>{data.points}</strong></td>
                                        <td className={styles.formCell}>
                                            {team.form?.split('').slice(-5).map((f, i) => (
                                                <span key={i} className={`${styles.formBadge} ${getFormBadge(f)}`}>
                                                    {f}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className={styles.standingsLegend}>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendColor} ${styles.zoneChampions}`}></span>
                            <span>Champions League</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendColor} ${styles.zoneEuropa}`}></span>
                            <span>Europa League</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendColor} ${styles.zoneRelegation}`}></span>
                            <span>Rebaixamento</span>
                        </div>
                    </div>
                </div>
            )}

            {/* FORMA Tab */}
            {activeTab === 'forma' && (
                <div className={styles.standingsTableWrapper}>
                    <table className={styles.standingsTable}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>EQUIPE</th>
                                <th>ÚLTIMOS 5</th>
                                <th>V</th>
                                <th>E</th>
                                <th>D</th>
                                <th>GM</th>
                                <th>GS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStandings.map((team, idx) => {
                                const form = team.form || '';
                                const formArr = form.split('').slice(-5);
                                const wins = formArr.filter(f => f === 'W').length;
                                const draws = formArr.filter(f => f === 'D').length;
                                const losses = formArr.filter(f => f === 'L').length;
                                const isHighlighted = team.team_id === homeTeamId || team.team_id === awayTeamId;

                                return (
                                    <tr key={team.team_id || idx} className={isHighlighted ? styles.highlightedRow : ''}>
                                        <td>{idx + 1}.</td>
                                        <td className={styles.teamCell}>
                                            <img src={team.team_logo} alt="" className={styles.teamLogoSmall} />
                                            <span>{team.team_name}</span>
                                        </td>
                                        <td className={styles.formCell}>
                                            {formArr.map((f, i) => (
                                                <span key={i} className={`${styles.formBadge} ${getFormBadge(f)}`}>
                                                    {f}
                                                </span>
                                            ))}
                                        </td>
                                        <td>{wins}</td>
                                        <td>{draws}</td>
                                        <td>{losses}</td>
                                        <td>{team.goals_for || 0}</td>
                                        <td>{team.goals_against || 0}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ACIMA/ABAIXO Tab */}
            {activeTab === 'overunder' && (
                <div className={styles.standingsTableWrapper}>
                    <table className={styles.standingsTable}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>EQUIPE</th>
                                <th>J</th>
                                <th>+2.5</th>
                                <th>-2.5</th>
                                <th>%</th>
                                <th>MÉD. G</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStandings.map((team, idx) => {
                                const data = getTeamData(team);
                                const totalGoals = data.goals_for + data.goals_against;
                                const avgGoals = data.played > 0 ? (totalGoals / data.played).toFixed(1) : '0.0';
                                const over25Pct = Math.min(100, Math.round((parseFloat(avgGoals) / 3) * 100));
                                const isHighlighted = team.team_id === homeTeamId || team.team_id === awayTeamId;

                                return (
                                    <tr key={team.team_id || idx} className={isHighlighted ? styles.highlightedRow : ''}>
                                        <td>{idx + 1}.</td>
                                        <td className={styles.teamCell}>
                                            <img src={team.team_logo} alt="" className={styles.teamLogoSmall} />
                                            <span>{team.team_name}</span>
                                        </td>
                                        <td>{data.played}</td>
                                        <td>{Math.round(data.played * over25Pct / 100)}</td>
                                        <td>{data.played - Math.round(data.played * over25Pct / 100)}</td>
                                        <td className={over25Pct > 50 ? styles.positive : styles.negative}>
                                            {over25Pct}%
                                        </td>
                                        <td>{avgGoals}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ARTILHEIROS Tab */}
            {activeTab === 'artilheiros' && (
                <div className={styles.scorersSection}>
                    {/* Scorer tabs */}
                    <div className={styles.standingsFilter}>
                        <button
                            className={`${styles.filterBtn} ${scorerTab === 'gols' ? styles.active : ''}`}
                            onClick={() => setScorerTab('gols')}
                        >
                            ⚽ GOLS
                        </button>
                        <button
                            className={`${styles.filterBtn} ${scorerTab === 'assistencias' ? styles.active : ''}`}
                            onClick={() => setScorerTab('assistencias')}
                        >
                            🎯 ASSISTÊNCIAS
                        </button>
                    </div>

                    {/* Goals */}
                    {scorerTab === 'gols' && (
                        <div className={styles.standingsTableWrapper}>
                            {topPlayers?.scorers?.length > 0 ? (
                                <table className={styles.standingsTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>JOGADOR</th>
                                            <th>EQUIPE</th>
                                            <th>GOLS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topPlayers.scorers.map((player, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}.</td>
                                                <td><strong>{player.player_name}</strong></td>
                                                <td className={styles.teamCell}>
                                                    <img src={player.team_logo} alt="" className={styles.teamLogoSmall} />
                                                    <span>{player.team_name}</span>
                                                </td>
                                                <td><strong>{player.goals}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.noData}>Dados de artilheiros não disponíveis</div>
                            )}
                        </div>
                    )}

                    {/* Assists */}
                    {scorerTab === 'assistencias' && (
                        <div className={styles.standingsTableWrapper}>
                            {topPlayers?.assists?.length > 0 ? (
                                <table className={styles.standingsTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>JOGADOR</th>
                                            <th>EQUIPE</th>
                                            <th>ASSIST.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topPlayers.assists.map((player, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}.</td>
                                                <td><strong>{player.player_name}</strong></td>
                                                <td className={styles.teamCell}>
                                                    <img src={player.team_logo} alt="" className={styles.teamLogoSmall} />
                                                    <span>{player.team_name}</span>
                                                </td>
                                                <td><strong>{player.assists}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.noData}>Dados de assistências não disponíveis</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
