'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../styles/home.module.css';
import Link from 'next/link';
import DateNavigation from '../components/DateNavigation';

// PRODUCTION URL
const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

// Live match statuses
const LIVE_STATUSES = ['LIVE', 'HT', '1H', '2H', 'ET', 'PEN_LIVE', 'BREAK'];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasLiveMatches, setHasLiveMatches] = useState(false);
  const intervalRef = useRef(null);

  // Check if any match is live
  const checkForLiveMatches = useCallback((leaguesData) => {
    for (const league of leaguesData) {
      for (const match of league.matches || []) {
        if (LIVE_STATUSES.includes(match.status)) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const fetchData = useCallback(async (date, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const url = date
        ? `${API_BASE}/goldstats/home?date=${date}`
        : `${API_BASE}/goldstats/home`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const leaguesData = data.data || [];
      setLeagues(leaguesData);
      setHasLiveMatches(checkForLiveMatches(leaguesData));
      setLastUpdated(new Date());
    } catch (e) {
      console.error("API Error:", e);
      setLeagues([]);
    }
    if (showLoading) setLoading(false);
  }, [checkForLiveMatches]);

  // Initial load and date change
  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up polling
    intervalRef.current = setInterval(() => {
      console.log('[Home] Auto-refreshing match data...');
      fetchData(selectedDate, false); // Don't show loading spinner
    }, 60000); // 60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDate, fetchData]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
        <h2>Carregando jogos...</h2>
      </div>
    );
  }

  return (
    <div className={styles.homeWrapper}>
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Live matches indicator */}
      {hasLiveMatches && (
        <div style={{
          background: 'linear-gradient(90deg, #dc3545, #c82333)',
          color: '#fff',
          padding: '0.5rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: '#fff',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite'
          }}></span>
          🔴 JOGOS AO VIVO - Atualizando automaticamente a cada 60s
        </div>
      )}

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div style={{
          background: '#f8f9fa',
          padding: '0.25rem 1rem',
          fontSize: '0.7rem',
          color: '#666',
          textAlign: 'right',
          borderBottom: '1px solid #eee'
        }}>
          Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
        </div>
      )}

      <div className={styles.homeContent}>
        {leagues.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            <p>Nenhum jogo encontrado para esta data.</p>
          </div>
        ) : (
          leagues.map((league) => (
            <div key={league.league_id} id={`league-${league.league_id}`} className={styles.leagueBlock}>
              <div className={styles.leagueHeader}>
                <img src={league.league_logo} alt={league.league_name} />
                <h2>{league.league_name}</h2>
              </div>

              <div className={styles.matchList}>
                {league.matches.map((match) => (
                  <Link href={`/match/${match.id}`} key={match.id} style={{ textDecoration: 'none' }}>
                    <div className={`${styles.matchCard} ${['FT', 'AET', 'FT_PEN'].includes(match.status) ? styles.matchFinished :
                      ['LIVE', 'HT', '1H', '2H', 'ET', 'PEN_LIVE'].includes(match.status) ? styles.matchLive :
                        styles.matchUpcoming
                      }`}>
                      {/* Col 1: Time */}
                      <div className={styles.timeStatus}>
                        {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {/* Col 2: Status Badge */}
                      <div className={styles.statusCol}>
                        {['LIVE', 'HT', '1H', '2H', 'ET', 'PEN_LIVE'].includes(match.status) ? (
                          <span className={styles.statusLive}>
                            <span className={styles.liveIndicator}></span>
                            {match.status === 'HT' ? 'INT' : 'AO VIVO'}
                          </span>
                        ) : ['FT', 'AET', 'FT_PEN'].includes(match.status) ? (
                          <span className={styles.statusFinished}>ENCERRADO</span>
                        ) : (
                          <span className={styles.statusUpcoming}>A JOGAR</span>
                        )}
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
                      <div className={`${styles.scoreCol} ${['LIVE', 'HT', '1H', '2H', 'ET', 'PEN_LIVE'].includes(match.status) ? styles.scoreLive :
                        ['FT', 'AET', 'FT_PEN'].includes(match.status) ? styles.scoreFinished :
                          ''
                        }`}>
                        <span>{match.status === 'NS' ? '-' : match.home_team.score}</span>
                        <span>{match.status === 'NS' ? '-' : match.away_team.score}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
