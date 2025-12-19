import styles from '../styles/home.module.css';
import Link from 'next/link';

async function getData() {
  try {
    const res = await fetch('https://10stats-api-10stats.ebl0ff.easypanel.host/api/goldstats/home', {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (e) {
    console.error("API Error:", e);
    return { success: false, data: [] };
  }
}

export default async function Home() {
  const { data: leagues } = await getData();

  if (!leagues || leagues.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Carregando jogos...</h2>
      </div>
    );
  }

  return (
    <div className={styles.homeContent}>
      {leagues.map((league) => (
        <div key={league.league_id} id={`league-${league.league_id}`} className={styles.leagueBlock}>
          <div className={styles.leagueHeader}>
            <img src={league.league_logo} alt={league.league_name} />
            <h2>{league.league_name}</h2>
          </div>

          <div className={styles.matchList}>
            {league.matches.map((match) => (
              <Link href={`/match/${match.id}`} key={match.id} style={{ textDecoration: 'none' }}>
                <div className={styles.matchCard}>
                  {/* Col 1: Time */}
                  <div className={styles.timeStatus}>
                    {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Col 2: Status */}
                  <div className={`${styles.statusCol} ${['LIVE', 'HT', 'ET', 'PEN_LIVE'].includes(match.status) ? styles.live : ''}`}>
                    {match.status === 'NS' ? '-' : match.status}
                  </div>

                  {/* Col 3: Teams */}
                  <div className={styles.teams}>
                    <div className={styles.team}>
                      <div className={styles.teamName}>
                        <img src={match.home_team.logo} alt="" />
                        <span>{match.home_team.name}</span>
                      </div>
                    </div>
                    <div className={styles.team}>
                      <div className={styles.teamName}>
                        <img src={match.away_team.logo} alt="" />
                        <span>{match.away_team.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Scores */}
                  <div className={styles.scoreCol}>
                    <span>{match.home_team.score}</span>
                    <span>{match.away_team.score}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
