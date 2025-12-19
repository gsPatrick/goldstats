import MatchHeader from '../../../components/match/MatchHeader';
import MainTabs from '../../../components/match/MainTabs';
import styles from '../../../components/match/match.module.css';

const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

async function getMatchData(id) {
    const opts = { cache: 'no-store' };

    try {
        // Use goldstats dedicated endpoints which return normalized data
        const [headerRes, nextRes, lastRes, aiRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/goldstats/match/${id}`, opts),
            fetch(`${API_BASE}/goldstats/match/${id}/next-matches`, opts),
            fetch(`${API_BASE}/goldstats/match/${id}/last-matches`, opts),
            fetch(`${API_BASE}/goldstats/match/${id}/analysis`, opts),
            fetch(`${API_BASE}/matches/${id}/stats`, opts)
        ]);

        const headerData = await headerRes.json();
        const nextData = await nextRes.json();
        const lastData = await lastRes.json();
        const aiData = await aiRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : {};

        const header = headerData.data || headerData;

        // Get league standings and topPlayers
        let standings = [];
        let topPlayers = { scorers: [], assists: [], ratings: [] };
        if (header.league?.id) {
            try {
                const standingsRes = await fetch(
                    `${API_BASE}/leagues/${header.league.id}/details`,
                    opts
                );
                if (standingsRes.ok) {
                    const standingsData = await standingsRes.json();
                    standings = standingsData.data?.standings || standingsData.standings || [];
                    topPlayers = standingsData.data?.topPlayers || { scorers: [], assists: [], ratings: [] };
                }
            } catch (e) {
                console.error("Standings fetch error:", e);
            }
        }

        // Get lineups - from API for finished matches, from squad for future matches
        let lineups = statsData.lineups || {
            home: { formation: null, starters: [], subs: [] },
            away: { formation: null, starters: [], subs: [] }
        };

        const isFuture = header.status === 'NS' || !header.status;
        const hasNoStarters = !lineups.home?.starters?.length && !lineups.away?.starters?.length;

        // For future matches, fetch squad as predicted lineup
        if (isFuture && hasNoStarters && header.home_team?.id && header.away_team?.id) {
            try {
                const [homeSquadRes, awaySquadRes] = await Promise.all([
                    fetch(`${API_BASE}/teams/${header.home_team.id}/squad`, opts),
                    fetch(`${API_BASE}/teams/${header.away_team.id}/squad`, opts)
                ]);

                const homeSquad = homeSquadRes.ok ? await homeSquadRes.json() : [];
                const awaySquad = awaySquadRes.ok ? await awaySquadRes.json() : [];

                // Take first 11 as starters and rest as subs
                if (Array.isArray(homeSquad) && homeSquad.length > 0) {
                    lineups = {
                        home: {
                            formation: '4-3-3',
                            starters: homeSquad.slice(0, 11).map((p, idx) => ({
                                id: p.id,
                                name: p.name,
                                number: p.jersey_number || (idx + 1),
                                pos: idx === 0 ? 'G' : idx <= 4 ? 'D' : idx <= 7 ? 'M' : 'F',
                                image: p.image,
                                rating: null
                            })),
                            subs: homeSquad.slice(11, 18).map(p => ({
                                id: p.id,
                                name: p.name,
                                number: p.jersey_number,
                                image: p.image
                            }))
                        },
                        away: {
                            formation: '4-4-2',
                            starters: (awaySquad || []).slice(0, 11).map((p, idx) => ({
                                id: p.id,
                                name: p.name,
                                number: p.jersey_number || (idx + 1),
                                pos: idx === 0 ? 'G' : idx <= 4 ? 'D' : idx <= 8 ? 'M' : 'F',
                                image: p.image,
                                rating: null
                            })),
                            subs: (awaySquad || []).slice(11, 18).map(p => ({
                                id: p.id,
                                name: p.name,
                                number: p.jersey_number,
                                image: p.image
                            }))
                        }
                    };
                }
            } catch (e) {
                console.error('Squad fetch error:', e);
            }
        }

        return {
            header: {
                home_team: header.home_team,
                away_team: header.away_team,
                league: header.league,
                date: header.date || header.timestamp,
                status: header.status,
                venue: header.venue || 'TBD',
                minute: header.minute
            },
            next: nextData.data || { home: [], away: [] },
            last: lastData.data || { home: [], away: [] },
            ai: aiData.data || { analysis: 'Análise não disponível.' },
            events: statsData.events || statsData.timeline || [],
            statistics: {
                ...(statsData.analysis?.detailedStats || {}),
                xG: statsData.xG || { home: 0, away: 0 },
                home: {
                    ball_possession: statsData.analysis?.detailedStats?.fulltime?.possession?.home || 0,
                    shots_total: statsData.analysis?.detailedStats?.fulltime?.shots?.total?.home || 0,
                    shots_on_target: statsData.analysis?.detailedStats?.fulltime?.shots?.onTarget?.home || 0,
                    corners: statsData.analysis?.detailedStats?.fulltime?.attacks?.corners?.home || 0,
                    yellow_cards: statsData.analysis?.detailedStats?.fulltime?.others?.yellowCards?.home || 0,
                    red_cards: statsData.analysis?.detailedStats?.fulltime?.others?.redCards?.home || 0,
                    passes_total: statsData.analysis?.detailedStats?.fulltime?.others?.passes?.home || 0,
                    dangerous_attacks: statsData.analysis?.detailedStats?.fulltime?.attacks?.dangerous?.home || 0
                },
                away: {
                    ball_possession: statsData.analysis?.detailedStats?.fulltime?.possession?.away || 0,
                    shots_total: statsData.analysis?.detailedStats?.fulltime?.shots?.total?.away || 0,
                    shots_on_target: statsData.analysis?.detailedStats?.fulltime?.shots?.onTarget?.away || 0,
                    corners: statsData.analysis?.detailedStats?.fulltime?.attacks?.corners?.away || 0,
                    yellow_cards: statsData.analysis?.detailedStats?.fulltime?.others?.yellowCards?.away || 0,
                    red_cards: statsData.analysis?.detailedStats?.fulltime?.others?.redCards?.away || 0,
                    passes_total: statsData.analysis?.detailedStats?.fulltime?.others?.passes?.away || 0,
                    dangerous_attacks: statsData.analysis?.detailedStats?.fulltime?.attacks?.dangerous?.away || 0
                }
            },
            lineups: lineups,
            standings: standings,
            topPlayers: topPlayers,
            h2h: {
                home: lastData.data?.home || [],
                away: lastData.data?.away || []
            }
        };
    } catch (e) {
        console.error("Match Fetch Error:", e);
        return null;
    }
}

import ChatSidebar from '../../../components/chat/ChatSidebar';

export default async function MatchPage({ params }) {
    const { id } = await params;
    const matchData = await getMatchData(id);

    if (!matchData || !matchData.header || !matchData.header.home_team) {
        return (
            <div className={styles.noData}>
                <h2>Erro ao carregar partida</h2>
                <p>Verifique se a API está disponível.</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>ID: {id}</p>
            </div>
        );
    }

    return (
        <div className={styles.matchPageLayout}>
            <div className={styles.matchContent}>
                <MatchHeader header={matchData.header} />
                <MainTabs matchData={matchData} />
            </div>
            <ChatSidebar matchId={id} matchData={matchData} />
        </div>
    );
}
