'use client';

import { useState, useEffect } from 'react';
import styles from './league.module.css';

const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

export default function LeagueTabs({ leagueId, leagueData }) {
    const [activeTab, setActiveTab] = useState('resumo');
    const [selectedRound, setSelectedRound] = useState(leagueData.currentRoundId);
    const [roundFixtures, setRoundFixtures] = useState(leagueData.currentRoundFixtures || []);
    const [loadingFixtures, setLoadingFixtures] = useState(false);

    const tabs = [
        { id: 'resumo', label: 'RESUMO' },
        { id: 'resultados', label: 'RESULTADOS' },
        { id: 'classificacao', label: 'CLASSIFICAÇÃO' }
    ];

    // Fetch fixtures when round changes
    useEffect(() => {
        if (activeTab === 'resultados' && selectedRound && selectedRound !== leagueData.currentRoundId) {
            fetchRoundFixtures(selectedRound);
        } else if (selectedRound === leagueData.currentRoundId) {
            setRoundFixtures(leagueData.currentRoundFixtures || []);
        }
    }, [selectedRound, activeTab]);

    const fetchRoundFixtures = async (roundId) => {
        setLoadingFixtures(true);
        try {
            const res = await fetch(`${API_BASE}/leagues/${leagueId}/rounds/${roundId}/fixtures`);
            if (res.ok) {
                const data = await res.json();
                setRoundFixtures(data.data || []);
            }
        } catch (e) {
            console.error('Error fetching round fixtures:', e);
        }
        setLoadingFixtures(false);
    };

    // Get round name from round ID
    const getRoundName = (roundId) => {
        const round = leagueData.rounds.find(r => r.id === roundId);
        return round ? `RODADA ${round.name}` : 'RODADA';
    };

    // Render fixture row
    const renderFixture = (fixture) => {
        const home = fixture.participants?.find(p => p.meta?.location === 'home');
        const away = fixture.participants?.find(p => p.meta?.location === 'away');
        const date = new Date(fixture.starting_at);
        const isFinished = fixture.state_id === 5 || fixture.state?.state === 'FT';
        const isLive = [2, 3, 4, 6, 7].includes(fixture.state_id);

        // Extract scores - try multiple formats
        let homeScore = '-';
        let awayScore = '-';

        if (fixture.scores && Array.isArray(fixture.scores)) {
            // Sportmonks v3 format: array of score objects
            const ftScore = fixture.scores.find(s => s.description === 'CURRENT' || s.description === 'FT');
            if (ftScore) {
                // Find home and away from score object
                const homeScoreObj = fixture.scores.find(s =>
                    (s.description === 'CURRENT' || s.description === 'FT') &&
                    s.score?.participant === 'home'
                );
                const awayScoreObj = fixture.scores.find(s =>
                    (s.description === 'CURRENT' || s.description === 'FT') &&
                    s.score?.participant === 'away'
                );
                homeScore = homeScoreObj?.score?.goals ?? '-';
                awayScore = awayScoreObj?.score?.goals ?? '-';
            }
        }

        // Fallback: Check result_info for draws
        if (homeScore === '-' && fixture.result_info) {
            if (fixture.result_info.includes('draw') || fixture.result_info.includes('empat')) {
                // It's a draw, extract from name
                const match = fixture.name?.match(/(\d+)-(\d+)/);
                if (match) {
                    homeScore = match[1];
                    awayScore = match[2];
                } else {
                    homeScore = '0';
                    awayScore = '0';
                }
            }
        }

        return (
            <a
                key={fixture.id}
                href={`/match/${fixture.id}`}
                className={styles.fixtureRow}
            >
                <div className={styles.fixtureDate}>
                    <span>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                    <span>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={styles.fixtureTeams}>
                    <div className={styles.fixtureTeam}>
                        <img src={home?.image_path} alt="" className={styles.teamLogo} />
                        <span className={home?.meta?.winner ? styles.winner : ''}>{home?.name}</span>
                    </div>
                    <div className={styles.fixtureTeam}>
                        <img src={away?.image_path} alt="" className={styles.teamLogo} />
                        <span className={away?.meta?.winner ? styles.winner : ''}>{away?.name}</span>
                    </div>
                </div>
                <div className={styles.fixtureScore}>
                    {isFinished || isLive ? (
                        <>
                            <span className={home?.meta?.winner ? styles.winnerScore : ''}>{homeScore}</span>
                            <span className={away?.meta?.winner ? styles.winnerScore : ''}>{awayScore}</span>
                        </>
                    ) : (
                        <span className={styles.futureMatch}>-</span>
                    )}
                </div>
            </a>
        );
    };

    return (
        <div className={styles.leagueTabsWrapper}>
            {/* Main Tabs */}
            <div className={styles.tabBar}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {/* RESUMO Tab */}
                {activeTab === 'resumo' && (
                    <div className={styles.resumoContent}>
                        <div className={styles.sectionHeader}>
                            <img src={leagueData.leagueInfo.country_flag} alt="" />
                            <span>{leagueData.leagueInfo.country?.toUpperCase()}: {leagueData.leagueInfo.name}</span>
                            <a href="#classificacao" className={styles.link}>Classificação</a>
                        </div>

                        <div className={styles.roundHeader}>
                            {getRoundName(selectedRound)}
                        </div>

                        <div className={styles.fixturesList}>
                            {leagueData.currentRoundFixtures?.slice(0, 10).map(renderFixture)}
                            {leagueData.currentRoundFixtures?.length === 0 && (
                                <p className={styles.noData}>Nenhuma partida encontrada</p>
                            )}
                        </div>
                    </div>
                )}

                {/* RESULTADOS Tab */}
                {activeTab === 'resultados' && (
                    <div className={styles.resultadosContent}>
                        <div className={styles.sectionHeader}>
                            <img src={leagueData.leagueInfo.country_flag} alt="" />
                            <span>{leagueData.leagueInfo.country?.toUpperCase()}: {leagueData.leagueInfo.name}</span>
                        </div>

                        {/* Round Selector */}
                        <div className={styles.roundSelector}>
                            <button
                                className={styles.roundArrow}
                                onClick={() => {
                                    const idx = leagueData.rounds.findIndex(r => r.id === selectedRound);
                                    if (idx > 0) setSelectedRound(leagueData.rounds[idx - 1].id);
                                }}
                            >
                                ◀
                            </button>
                            <select
                                value={selectedRound || ''}
                                onChange={(e) => setSelectedRound(parseInt(e.target.value))}
                                className={styles.roundSelect}
                            >
                                {leagueData.rounds.map(round => (
                                    <option key={round.id} value={round.id}>
                                        Rodada {round.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                className={styles.roundArrow}
                                onClick={() => {
                                    const idx = leagueData.rounds.findIndex(r => r.id === selectedRound);
                                    if (idx < leagueData.rounds.length - 1) setSelectedRound(leagueData.rounds[idx + 1].id);
                                }}
                            >
                                ▶
                            </button>
                        </div>

                        <div className={styles.roundHeader}>
                            {getRoundName(selectedRound)}
                        </div>

                        <div className={styles.fixturesList}>
                            {loadingFixtures ? (
                                <p className={styles.loading}>Carregando...</p>
                            ) : (
                                roundFixtures.map(renderFixture)
                            )}
                            {!loadingFixtures && roundFixtures.length === 0 && (
                                <p className={styles.noData}>Nenhuma partida encontrada</p>
                            )}
                        </div>
                    </div>
                )}

                {/* CLASSIFICAÇÃO Tab */}
                {activeTab === 'classificacao' && (
                    <div className={styles.classificacaoContent}>
                        <table className={styles.standingsTable}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Time</th>
                                    <th>P</th>
                                    <th>J</th>
                                    <th>V</th>
                                    <th>E</th>
                                    <th>D</th>
                                    <th>GP</th>
                                    <th>GC</th>
                                    <th>SG</th>
                                    <th>Forma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leagueData.standings.map((team, idx) => (
                                    <tr
                                        key={team.team_id}
                                        className={
                                            team.status?.includes('Champions') ? styles.zoneChampions :
                                                team.status?.includes('Europa') ? styles.zoneEuropa :
                                                    team.status?.includes('Relegation') ? styles.zoneRelegation : ''
                                        }
                                    >
                                        <td className={styles.positionCell}>
                                            <span className={styles.positionNumber}>{team.position}</span>
                                        </td>
                                        <td className={styles.teamCell}>
                                            <img src={team.team_logo} alt="" className={styles.teamLogoSmall} />
                                            <span>{team.team_name}</span>
                                        </td>
                                        <td className={styles.pointsCell}><strong>{team.points}</strong></td>
                                        <td>{team.stats?.p || 0}</td>
                                        <td>{team.won}</td>
                                        <td>{team.draw}</td>
                                        <td>{team.lost}</td>
                                        <td>{team.goals_for}</td>
                                        <td>{team.goals_against}</td>
                                        <td>{team.goals_for - team.goals_against}</td>
                                        <td className={styles.formCell}>
                                            {(team.form || '').split('').map((r, i) => (
                                                <span
                                                    key={i}
                                                    className={`${styles.formDot} ${r === 'W' ? styles.win :
                                                        r === 'L' ? styles.loss : styles.draw
                                                        }`}
                                                >
                                                    {r}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
