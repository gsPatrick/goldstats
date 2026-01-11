import styles from '../../../components/match/match.module.css';
import MatchPageClient from './MatchPageClient';

// PRODUCTION URL
const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

async function getMatchData(id) {
    const opts = { cache: 'no-store' };

    try {
        console.log(`[page.js] Fetching match ${id} from ${API_BASE}`);

        // Fetch from multiple endpoints to get complete data
        const [headerRes, statsRes, nextRes, lastRes, aiRes] = await Promise.all([
            fetch(`${API_BASE}/goldstats/match/${id}`, opts),
            fetch(`${API_BASE}/matches/${id}/stats`, opts),
            fetch(`${API_BASE}/goldstats/match/${id}/next-matches`, opts),
            fetch(`${API_BASE}/goldstats/match/${id}/last-matches`, opts),
            fetch(`${API_BASE}/goldstats/match/${id}/analysis`, opts)
        ]);

        console.log(`[page.js] Header response status: ${headerRes.status}`);

        // Parse responses
        const headerData = await headerRes.json();
        console.log(`[page.js] Header data:`, JSON.stringify(headerData).slice(0, 200));

        const statsData = statsRes.ok ? await statsRes.json() : {};
        const nextData = nextRes.ok ? await nextRes.json() : { data: { home: [], away: [] } };
        const lastData = lastRes.ok ? await lastRes.json() : { data: { home: [], away: [] } };
        const aiData = aiRes.ok ? await aiRes.json() : { data: { analysis: '' } };

        // Extract data from goldstats header (most reliable source for teams)
        // API returns { data: { matchInfo: { ... } } }
        const rootData = headerData.data || headerData;
        const headerInfo = rootData.matchInfo || rootData;

        // Build header object from goldstats endpoint
        const header = {
            home_team: headerInfo.home_team || {},
            away_team: headerInfo.away_team || {},
            league: headerInfo.league || {},
            date: headerInfo.date || headerInfo.timestamp || headerInfo.starting_at,
            status: headerInfo.status,
            venue: headerInfo.venue || 'TBD',
            minute: headerInfo.minute
        };

        // Events from stats endpoint (for SUMÁRIO)
        const events = statsData.events || [];

        // Statistics from stats endpoint (for ESTATÍSTICAS)
        const detailedStats = statsData.analysis?.detailedStats || {};
        const statistics = {
            fulltime: detailedStats.fulltime || {},
            ht: detailedStats.ht || {},
            st: detailedStats.st || {},
            home: {
                ball_possession: detailedStats.fulltime?.possession?.home || 0,
                shots_total: detailedStats.fulltime?.shots?.total?.home || 0,
                shots_on_target: detailedStats.fulltime?.shots?.onTarget?.home || 0,
                corners: detailedStats.fulltime?.attacks?.corners?.home || 0,
                yellow_cards: detailedStats.fulltime?.others?.yellowCards?.home || 0,
                red_cards: detailedStats.fulltime?.others?.redCards?.home || 0,
                passes_total: detailedStats.fulltime?.others?.passes?.home || 0,
                dangerous_attacks: detailedStats.fulltime?.attacks?.dangerous?.home || 0
            },
            away: {
                ball_possession: detailedStats.fulltime?.possession?.away || 0,
                shots_total: detailedStats.fulltime?.shots?.total?.away || 0,
                shots_on_target: detailedStats.fulltime?.shots?.onTarget?.away || 0,
                corners: detailedStats.fulltime?.attacks?.corners?.away || 0,
                yellow_cards: detailedStats.fulltime?.others?.yellowCards?.away || 0,
                red_cards: detailedStats.fulltime?.others?.redCards?.away || 0,
                passes_total: detailedStats.fulltime?.others?.passes?.away || 0,
                dangerous_attacks: detailedStats.fulltime?.attacks?.dangerous?.away || 0
            }
        };

        // Lineups from stats endpoint (for FORMAÇÕES)
        const lineups = statsData.lineups || {
            home: { formation: null, starters: [], subs: [] },
            away: { formation: null, starters: [], subs: [] }
        };

        // Standings from stats endpoint (for CLASSIFICAÇÃO)
        // API returns Portuguese keys (pos, v, e, d, etc), component expects English
        // Check root level first (where it was found in debug), then analysis
        const rawStandings = statsData.standings || statsData.analysis?.standings || [];
        const standings = rawStandings.map(s => ({
            ...s,
            position: s.position || s.pos,
            team_id: s.team_id || s.id, // Ensure ID is consistent
            points: s.points || s.p,
            won: s.won || s.v,
            draw: s.draw || s.e,
            lost: s.lost || s.d,
            goals_for: s.goals_for || s.gf,
            goals_against: s.goals_against || s.ga,
            form: s.form || s.win_form || '?????' // Fallback for form
        }));

        console.log(`[page.js] Standings found: ${standings.length}`);
        if (standings.length > 0) {
            console.log(`[page.js] Sample standing:`, JSON.stringify(standings[0]));
        }

        // For future matches, fetch squad as predicted lineup
        const isFuture = header.status === 'NS' || !header.status;
        const hasNoStarters = !lineups.home?.starters?.length && !lineups.away?.starters?.length;

        if (isFuture && hasNoStarters && header.home_team?.id && header.away_team?.id) {
            try {
                const [homeSquadRes, awaySquadRes] = await Promise.all([
                    fetch(`${API_BASE}/teams/${header.home_team.id}/squad`, opts),
                    fetch(`${API_BASE}/teams/${header.away_team.id}/squad`, opts)
                ]);

                const homeSquad = homeSquadRes.ok ? await homeSquadRes.json() : [];
                const awaySquad = awaySquadRes.ok ? await awaySquadRes.json() : [];

                if (Array.isArray(homeSquad) && homeSquad.length > 0) {
                    lineups.home = {
                        formation: '4-3-3',
                        starters: homeSquad.slice(0, 11).map((p, idx) => ({
                            id: p.id,
                            name: p.name,
                            number: p.jersey_number || (idx + 1),
                            pos: idx === 0 ? 'G' : idx <= 4 ? 'D' : idx <= 7 ? 'M' : 'F',
                            image: p.image
                        })),
                        subs: homeSquad.slice(11, 18).map(p => ({
                            id: p.id,
                            name: p.name,
                            number: p.jersey_number,
                            image: p.image
                        }))
                    };
                }

                if (Array.isArray(awaySquad) && awaySquad.length > 0) {
                    lineups.away = {
                        formation: '4-4-2',
                        starters: awaySquad.slice(0, 11).map((p, idx) => ({
                            id: p.id,
                            name: p.name,
                            number: p.jersey_number || (idx + 1),
                            pos: idx === 0 ? 'G' : idx <= 4 ? 'D' : idx <= 8 ? 'M' : 'F',
                            image: p.image
                        })),
                        subs: awaySquad.slice(11, 18).map(p => ({
                            id: p.id,
                            name: p.name,
                            number: p.jersey_number,
                            image: p.image
                        }))
                    };
                }
            } catch (e) {
                console.error('Squad fetch error:', e);
            }
        }

        // Get league details for topPlayers (always needed for Artilheiros tab)
        // Also use standings from league if not available from match stats
        let finalStandings = standings;
        let topPlayers = { scorers: [], assists: [], ratings: [] };

        if (header.league?.id) {
            try {
                const standingsRes = await fetch(
                    `${API_BASE}/leagues/${header.league.id}/details`,
                    opts
                );
                if (standingsRes.ok) {
                    const standingsData = await standingsRes.json();
                    // Always get topPlayers from league details
                    topPlayers = standingsData.data?.topPlayers || { scorers: [], assists: [], ratings: [] };
                    // Only use league standings if match stats didn't provide them
                    if (finalStandings.length === 0) {
                        finalStandings = standingsData.data?.standings || standingsData.standings || [];
                    }
                }
            } catch (e) {
                console.error("League details fetch error:", e);
            }
        }

        // Next and last matches (for PRÓXIMOS JOGOS and FORMA RECENTE)
        const next = nextData.data || { home: [], away: [] };
        const last = lastData.data || { home: [], away: [] };

        // AI analysis
        const ai = aiData.data || { analysis: '' };

        return {
            header,
            events,
            statistics,
            lineups,
            standings: finalStandings,
            topPlayers,
            next,
            last,
            h2h: last,
            ai,
            // Add team data with squad stats for PlayerStatsTab
            homeTeam: statsData.homeTeam || {},
            awayTeam: statsData.awayTeam || {}
        };
    } catch (e) {
        console.error("Match Fetch Error:", e);
        return null;
    }
}

export default async function MatchPage({ params }) {
    const { id } = await params;
    const matchData = await getMatchData(id);

    if (!matchData || !matchData.header || !matchData.header.home_team?.id) {
        return (
            <div className={styles.noData}>
                <h2>Erro ao carregar partida</h2>
                <p>Verifique se a API está disponível.</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>ID: {id}</p>
            </div>
        );
    }

    return <MatchPageClient matchId={id} matchData={matchData} />;
}
