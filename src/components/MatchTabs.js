'use client';

import { useState } from 'react';
import styles from '../styles/match.module.css';

export default function MatchTabs({ next, last, standings, homeTeamId, awayTeamId }) {
    const [activeTab, setActiveTab] = useState('proximos');

    const tabs = [
        { id: 'proximos', label: 'Próximos Jogos' },
        { id: 'ultimos', label: 'Últimos Jogos' },
        { id: 'classificacao', label: 'Classificação' }
    ];

    return (
        <div className={styles.tabsContainer}>
            {/* Tab Headers */}
            <div className={styles.tabHeaders}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'proximos' && (
                    <div className={styles.matchesList}>
                        <h4>Próximos Jogos (Todas Competições)</h4>
                        {next?.home?.slice(0, 5).map(m => (
                            <div key={m.id} className={styles.miniCard}>
                                <span className={styles.date}>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                                <span className={styles.matchInfo}>{m.home_team?.short_name} vs {m.away_team?.short_name}</span>
                                <span className={styles.league}>{m.league?.name}</span>
                            </div>
                        ))}
                        {next?.away?.slice(0, 5).map(m => (
                            <div key={m.id} className={styles.miniCard}>
                                <span className={styles.date}>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                                <span className={styles.matchInfo}>{m.home_team?.short_name} vs {m.away_team?.short_name}</span>
                                <span className={styles.league}>{m.league?.name}</span>
                            </div>
                        ))}
                        {(!next?.home?.length && !next?.away?.length) && <p className={styles.noData}>Sem jogos futuros</p>}
                    </div>
                )}

                {activeTab === 'ultimos' && (
                    <div className={styles.matchesList}>
                        <div className={styles.teamSection}>
                            <h4>Mandante - Últimos 5 (Esta Liga)</h4>
                            {last?.home?.slice(0, 5).map(m => (
                                <div key={m.id} className={styles.miniCard}>
                                    <span className={styles.date}>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                                    <div className={styles.matchInfo}>
                                        {m.home_team?.short_name} <strong>{m.home_team?.score}-{m.away_team?.score}</strong> {m.away_team?.short_name}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.teamSection}>
                            <h4>Visitante - Últimos 5 (Esta Liga)</h4>
                            {last?.away?.slice(0, 5).map(m => (
                                <div key={m.id} className={styles.miniCard}>
                                    <span className={styles.date}>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                                    <div className={styles.matchInfo}>
                                        {m.home_team?.short_name} <strong>{m.home_team?.score}-{m.away_team?.score}</strong> {m.away_team?.short_name}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {(!last?.home?.length && !last?.away?.length) && <p className={styles.noData}>Sem jogos anteriores</p>}
                    </div>
                )}

                {activeTab === 'classificacao' && (
                    <div className={styles.standingsTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Equipe</th>
                                    <th>J</th>
                                    <th>V</th>
                                    <th>E</th>
                                    <th>D</th>
                                    <th>SG</th>
                                    <th>P</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings?.map((team, idx) => (
                                    <tr
                                        key={team.team_id || idx}
                                        className={
                                            team.team_id === homeTeamId || team.team_id === awayTeamId
                                                ? styles.highlighted
                                                : ''
                                        }
                                    >
                                        <td>{team.position || idx + 1}</td>
                                        <td className={styles.teamCell}>
                                            <img src={team.team?.image_path} alt="" />
                                            <span>{team.team?.short_code || team.team?.name}</span>
                                        </td>
                                        <td>{team.games_played}</td>
                                        <td>{team.won}</td>
                                        <td>{team.draw}</td>
                                        <td>{team.lost}</td>
                                        <td>{team.goal_difference}</td>
                                        <td><strong>{team.points}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!standings?.length && <p className={styles.noData}>Classificação não disponível</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
