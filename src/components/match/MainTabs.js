'use client';

import { useState } from 'react';
import styles from './match.module.css';
import EventTimeline from './EventTimeline';
import StatsComparison from './StatsComparison';
import Formations from './Formations';
import H2HSection from './H2HSection';
import StandingsTable from './StandingsTable';

export default function MainTabs({ matchData }) {
    const [mainTab, setMainTab] = useState('jogo');
    const [subTab, setSubTab] = useState('sumario');
    const [hideCups, setHideCups] = useState(true);

    // Determine match status
    const isFinished = ['FT', 'AET', 'PEN'].includes(matchData.header?.status);
    const isLive = ['LIVE', 'HT', '1H', '2H', 'ET', 'BT'].includes(matchData.header?.status);
    const isFuture = matchData.header?.status === 'NS' || !matchData.header?.status;

    const mainTabs = [
        { id: 'jogo', label: 'JOGO' },
        { id: 'h2h', label: 'H2H' },
        { id: 'classificacoes', label: 'CLASSIFICAÇÕES' }
    ];

    // Sub-tabs - always show these 6 tabs, first 3 for match (may be empty for future), last 3 for pre-match analysis
    const subTabs = [
        { id: 'sumario', label: 'SUMÁRIO' },
        { id: 'estatisticas', label: 'ESTATÍSTICAS' },
        { id: 'formacoes', label: 'FORMAÇÕES' },
        { id: 'proximosjogos', label: 'PRÓXIMOS JOGOS' },
        { id: 'ultimosjogos', label: 'FORMA RECENTE' },
        { id: 'analise', label: 'ANÁLISE IA' }
    ];

    const handleMainTabChange = (tabId) => {
        setMainTab(tabId);
        if (tabId === 'jogo') {
            setSubTab('sumario');
        }
    };

    const isCupMatch = (match) => {
        const cupKeywords = ['copa', 'cup', 'taça', 'libertadores', 'sudamericana', 'champions', 'europa league', 'conference'];
        const leagueName = (match.league?.name || '').toLowerCase();
        return cupKeywords.some(kw => leagueName.includes(kw));
    };

    const filterMatches = (matches) => {
        if (!matches) return [];
        if (!hideCups) return matches;
        return matches.filter(m => !isCupMatch(m));
    };

    const getResultBadge = (match, teamId) => {
        const isHome = match.home_team?.id === teamId;
        const teamScore = parseInt(isHome ? match.home_team?.score : match.away_team?.score) || 0;
        const oppScore = parseInt(isHome ? match.away_team?.score : match.home_team?.score) || 0;

        if (teamScore > oppScore) return { text: 'V', class: styles.win };
        if (teamScore < oppScore) return { text: 'D', class: styles.loss };
        return { text: 'E', class: styles.draw };
    };

    // Empty state message for future matches
    const EmptyMatchState = ({ title, icon }) => (
        <div className={styles.emptyMatchState}>
            <span className={styles.emptyIcon}>{icon}</span>
            <h3>{title}</h3>
            <p>A partida ainda não começou</p>
        </div>
    );

    return (
        <div className={styles.tabsWrapper}>
            {/* Main Tabs */}
            <div className={styles.mainTabsBar}>
                {mainTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.mainTabBtn} ${mainTab === tab.id ? styles.active : ''}`}
                        onClick={() => handleMainTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Sub Tabs (only for JOGO) */}
            {mainTab === 'jogo' && (
                <div className={styles.subTabsBar}>
                    {subTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.subTabBtn} ${subTab === tab.id ? styles.active : ''}`}
                            onClick={() => setSubTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Content */}
            <div className={styles.tabContentArea}>
                {/* === SUMÁRIO === */}
                {mainTab === 'jogo' && subTab === 'sumario' && (
                    <>
                        {isFuture ? (
                            <EmptyMatchState title="Eventos do Jogo" icon="📋" />
                        ) : (
                            <EventTimeline
                                events={matchData.events}
                                homeTeam={matchData.header?.home_team}
                                awayTeam={matchData.header?.away_team}
                            />
                        )}
                    </>
                )}

                {/* === ESTATÍSTICAS === */}
                {mainTab === 'jogo' && subTab === 'estatisticas' && (
                    <>
                        {isFuture ? (
                            <EmptyMatchState title="Estatísticas do Jogo" icon="📊" />
                        ) : (
                            <StatsComparison
                                statistics={matchData.statistics}
                                homeTeam={matchData.header?.home_team}
                                awayTeam={matchData.header?.away_team}
                            />
                        )}
                    </>
                )}

                {/* === FORMAÇÕES === */}
                {mainTab === 'jogo' && subTab === 'formacoes' && (
                    <>
                        {isFuture ? (
                            <div className={styles.futureFormations}>
                                <div className={styles.futureFormationsHeader}>
                                    <h3>⚽ Prováveis 11</h3>
                                    <p className={styles.futureNote}>Escalação provável baseada nos últimos jogos</p>
                                </div>
                                <Formations
                                    lineups={matchData.lineups}
                                    homeTeam={matchData.header?.home_team}
                                    awayTeam={matchData.header?.away_team}
                                    isPredicted={true}
                                />
                            </div>
                        ) : (
                            <Formations
                                lineups={matchData.lineups}
                                homeTeam={matchData.header?.home_team}
                                awayTeam={matchData.header?.away_team}
                            />
                        )}
                    </>
                )}

                {/* === PRÓXIMOS JOGOS === */}
                {mainTab === 'jogo' && subTab === 'proximosjogos' && (
                    <>
                        <div className={styles.filterBar}>
                            <label className={styles.filterToggle}>
                                <input
                                    type="checkbox"
                                    checked={hideCups}
                                    onChange={(e) => setHideCups(e.target.checked)}
                                />
                                <span>Ocultar Copas</span>
                            </label>
                        </div>
                        <div className={styles.futureMatchesList}>
                            <div className={styles.teamSection}>
                                <h4>
                                    <img src={matchData.header?.home_team?.logo} alt="" className={styles.sectionLogo} />
                                    Próximos Jogos - {matchData.header?.home_team?.name}
                                </h4>
                                {filterMatches(matchData.next?.home)?.slice(0, 5).map(m => (
                                    <div key={m.id} className={styles.miniCard}>
                                        <span className={styles.date}>
                                            {new Date(m.date).toLocaleDateString('pt-BR')}
                                        </span>
                                        <img src={m.home_team?.logo} alt="" className={styles.miniCardLogo} />
                                        <span className={styles.matchInfo}>
                                            {m.home_team?.short_name || m.home_team?.name} vs {m.away_team?.short_name || m.away_team?.name}
                                        </span>
                                        <img src={m.away_team?.logo} alt="" className={styles.miniCardLogo} />
                                        <span className={styles.league}>{m.league?.name}</span>
                                    </div>
                                ))}
                                {filterMatches(matchData.next?.home)?.length === 0 && (
                                    <p className={styles.noData}>Sem jogos futuros</p>
                                )}
                            </div>
                            <div className={styles.teamSection}>
                                <h4>
                                    <img src={matchData.header?.away_team?.logo} alt="" className={styles.sectionLogo} />
                                    Próximos Jogos - {matchData.header?.away_team?.name}
                                </h4>
                                {filterMatches(matchData.next?.away)?.slice(0, 5).map(m => (
                                    <div key={m.id} className={styles.miniCard}>
                                        <span className={styles.date}>
                                            {new Date(m.date).toLocaleDateString('pt-BR')}
                                        </span>
                                        <img src={m.home_team?.logo} alt="" className={styles.miniCardLogo} />
                                        <span className={styles.matchInfo}>
                                            {m.home_team?.short_name || m.home_team?.name} vs {m.away_team?.short_name || m.away_team?.name}
                                        </span>
                                        <img src={m.away_team?.logo} alt="" className={styles.miniCardLogo} />
                                        <span className={styles.league}>{m.league?.name}</span>
                                    </div>
                                ))}
                                {filterMatches(matchData.next?.away)?.length === 0 && (
                                    <p className={styles.noData}>Sem jogos futuros</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* === FORMA RECENTE === */}
                {mainTab === 'jogo' && subTab === 'ultimosjogos' && (
                    <>
                        <div className={styles.filterBar}>
                            <label className={styles.filterToggle}>
                                <input
                                    type="checkbox"
                                    checked={hideCups}
                                    onChange={(e) => setHideCups(e.target.checked)}
                                />
                                <span>Ocultar Copas</span>
                            </label>
                        </div>
                        <div className={styles.futureMatchesList}>
                            <div className={styles.teamSection}>
                                <h4>
                                    <img src={matchData.header?.home_team?.logo} alt="" className={styles.sectionLogo} />
                                    Forma Recente - {matchData.header?.home_team?.name}
                                </h4>
                                {filterMatches(matchData.last?.home)?.slice(0, 5).map(m => {
                                    const result = getResultBadge(m, matchData.header?.home_team?.id);
                                    return (
                                        <div key={m.id} className={styles.miniCard}>
                                            <span className={styles.date}>
                                                {new Date(m.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <img src={m.home_team?.logo} alt="" className={styles.miniCardLogo} />
                                            <div className={styles.matchInfo}>
                                                {m.home_team?.short_name || m.home_team?.name}
                                                <strong className={styles.scoreInline}>{m.home_team?.score} - {m.away_team?.score}</strong>
                                                {m.away_team?.short_name || m.away_team?.name}
                                            </div>
                                            <img src={m.away_team?.logo} alt="" className={styles.miniCardLogo} />
                                            <span className={`${styles.resultBadge} ${result.class}`}>{result.text}</span>
                                        </div>
                                    );
                                })}
                                {filterMatches(matchData.last?.home)?.length === 0 && (
                                    <p className={styles.noData}>Sem jogos recentes</p>
                                )}
                            </div>
                            <div className={styles.teamSection}>
                                <h4>
                                    <img src={matchData.header?.away_team?.logo} alt="" className={styles.sectionLogo} />
                                    Forma Recente - {matchData.header?.away_team?.name}
                                </h4>
                                {filterMatches(matchData.last?.away)?.slice(0, 5).map(m => {
                                    const result = getResultBadge(m, matchData.header?.away_team?.id);
                                    return (
                                        <div key={m.id} className={styles.miniCard}>
                                            <span className={styles.date}>
                                                {new Date(m.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <img src={m.home_team?.logo} alt="" className={styles.miniCardLogo} />
                                            <div className={styles.matchInfo}>
                                                {m.home_team?.short_name || m.home_team?.name}
                                                <strong className={styles.scoreInline}>{m.home_team?.score} - {m.away_team?.score}</strong>
                                                {m.away_team?.short_name || m.away_team?.name}
                                            </div>
                                            <img src={m.away_team?.logo} alt="" className={styles.miniCardLogo} />
                                            <span className={`${styles.resultBadge} ${result.class}`}>{result.text}</span>
                                        </div>
                                    );
                                })}
                                {filterMatches(matchData.last?.away)?.length === 0 && (
                                    <p className={styles.noData}>Sem jogos recentes</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* === ANÁLISE IA === */}
                {mainTab === 'jogo' && subTab === 'analise' && (
                    <div className={styles.aiAnalysisBox}>
                        <h3>🤖 Análise GoldStats</h3>
                        <p>{matchData.ai?.analysis || 'Gerando análise...'}</p>
                    </div>
                )}

                {/* H2H Tab */}
                {mainTab === 'h2h' && (
                    <H2HSection
                        h2h={matchData.h2h}
                        homeTeam={matchData.header?.home_team}
                        awayTeam={matchData.header?.away_team}
                    />
                )}

                {/* CLASSIFICAÇÕES Tab */}
                {mainTab === 'classificacoes' && (
                    <StandingsTable
                        standings={matchData.standings}
                        topPlayers={matchData.topPlayers}
                        homeTeamId={matchData.header?.home_team?.id}
                        awayTeamId={matchData.header?.away_team?.id}
                    />
                )}
            </div>
        </div>
    );
}
