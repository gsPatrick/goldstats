import LeagueHeader from '../../../components/league/LeagueHeader';
import LeagueTabs from '../../../components/league/LeagueTabs';
import styles from '../../../components/league/league.module.css';

const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

async function getLeagueData(id) {
    const opts = { cache: 'no-store' };

    try {
        // Fetch league details (includes standings, rounds, topPlayers)
        const res = await fetch(`${API_BASE}/leagues/${id}/details`, opts);
        if (!res.ok) {
            console.error('League fetch failed:', res.status);
            return null;
        }

        const data = await res.json();
        const d = data.data || data;

        // Fetch current round fixtures
        let currentRoundFixtures = [];
        if (d.currentRoundId) {
            try {
                const fixturesRes = await fetch(
                    `${API_BASE}/leagues/${id}/rounds/${d.currentRoundId}/fixtures`,
                    opts
                );
                if (fixturesRes.ok) {
                    const fixturesData = await fixturesRes.json();
                    currentRoundFixtures = fixturesData.data || [];
                }
            } catch (e) {
                console.error('Fixtures fetch error:', e);
            }
        }

        return {
            leagueInfo: d.leagueInfo || { id, name: 'Liga', logo: '' },
            standings: d.standings || [],
            rounds: d.rounds || [],
            currentRoundId: d.currentRoundId || null,
            currentRoundFixtures: currentRoundFixtures,
            topPlayers: d.topPlayers || { scorers: [], assists: [], ratings: [] }
        };
    } catch (e) {
        console.error('League Fetch Error:', e);
        return null;
    }
}

export default async function LeaguePage({ params }) {
    const { id } = await params;
    const leagueData = await getLeagueData(id);

    if (!leagueData) {
        return (
            <div className={styles.noData}>
                <h2>Erro ao carregar liga</h2>
                <p>Verifique se a API está disponível.</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>ID: {id}</p>
            </div>
        );
    }

    return (
        <div>
            <LeagueHeader leagueInfo={leagueData.leagueInfo} />
            <LeagueTabs
                leagueId={id}
                leagueData={leagueData}
            />
        </div>
    );
}
