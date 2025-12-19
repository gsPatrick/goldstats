import Link from 'next/link';
import styles from './Sidebar.module.css';

async function getLeagues() {
    try {
        // Fetching same endpoint to get active leagues. 
        // In a real app we might want a lightweight /leagues/active endpoint.
        const res = await fetch('https://10stats-api-10stats.ebl0ff.easypanel.host/api/goldstats/home', { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        return [];
    }
}

export default async function Sidebar() {
    const leagues = await getLeagues();

    return (
        <aside className={styles.sidebar}>
            <h3 className={styles.title}>Ligas Principais</h3>
            <div className={styles.list}>
                {leagues.map(l => (
                    <Link href={`/league/${l.league_id}`} key={l.league_id} className={styles.leagueItem}>
                        <img src={l.league_logo} alt="" />
                        <span className={styles.leagueName}>{l.league_name}</span>
                    </Link>
                ))}
                {leagues.length === 0 && <p style={{ fontSize: '0.8rem', color: '#999' }}>Nenhuma liga ativa hoje.</p>}
            </div>
        </aside>
    );
}
