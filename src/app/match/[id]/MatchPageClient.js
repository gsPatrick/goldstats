'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../../../components/match/match.module.css';
import MatchHeader from '../../../components/match/MatchHeader';
import MainTabs from '../../../components/match/MainTabs';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import { initSocket, subscribeToMatch, unsubscribeFromMatch } from '../../../lib/socket';

// API base for client-side fetching
const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

// Match statuses that indicate a live game
const LIVE_STATUSES = ['LIVE', 'HT', '1H', '2H', 'ET', 'PEN_LIVE', 'BREAK'];

// Transform API response to match frontend data format
function transformStatsData(statsData, prevMatchData) {
    if (!statsData) return prevMatchData;

    const headerInfo = statsData.matchInfo || {};
    const detailedStats = statsData.analysis?.detailedStats || {};

    // Build header (same as page.js) if matchInfo is present
    const header = headerInfo.id ? {
        id: headerInfo.id,
        date: headerInfo.starting_at,
        home_team: {
            id: headerInfo.home_team?.id,
            name: headerInfo.home_team?.name,
            short_name: headerInfo.home_team?.short_code,
            logo: headerInfo.home_team?.logo || headerInfo.home_team?.image_path,
            score: headerInfo.score?.home
        },
        away_team: {
            id: headerInfo.away_team?.id,
            name: headerInfo.away_team?.name,
            short_name: headerInfo.away_team?.short_code,
            logo: headerInfo.away_team?.logo || headerInfo.away_team?.image_path,
            score: headerInfo.score?.away
        },
        league: {
            id: headerInfo.league?.id,
            name: headerInfo.league?.name,
            logo: headerInfo.league?.logo || headerInfo.league?.image_path,
            country: headerInfo.league?.country?.name
        },
        status: headerInfo.status,
        venue: headerInfo.venue || 'TBD',
        minute: headerInfo.minute
    } : prevMatchData.header;

    // Build statistics (same as page.js)
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

    return {
        ...prevMatchData,
        header: header,
        events: statsData.events || prevMatchData.events,
        statistics: statistics,
        lineups: statsData.lineups || prevMatchData.lineups,
        homeTeam: statsData.homeTeam || prevMatchData.homeTeam,
        awayTeam: statsData.awayTeam || prevMatchData.awayTeam
    };
}

export default function MatchPageClient({ matchId, matchData: initialMatchData }) {
    const [matchData, setMatchData] = useState(initialMatchData);
    const [isChatCollapsed, setIsChatCollapsed] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // activeStatus helps us show "Live" UI correctly
    const activeStatus = matchData?.header?.status;
    const isLive = LIVE_STATUSES.includes(activeStatus);

    // WebSocket subscription for live updates
    useEffect(() => {
        // Initialize socket connection
        const socket = initSocket();

        function onConnect() {
            console.log('[MatchPageClient] Connected to socket');
            setIsConnected(true);
            subscribeToMatch(matchId);
        }

        function onDisconnect() {
            console.log('[MatchPageClient] Disconnected from socket');
            setIsConnected(false);
        }

        function onMatchUpdate({ data, timestamp }) {
            console.log(`[MatchPageClient] ⚡ Received match update via socket at ${timestamp}`);
            console.log('Update data keys:', Object.keys(data));

            setMatchData(prev => {
                const transformed = transformStatsData(data, prev);
                // Log status change if any
                if (transformed.header?.status !== prev.header?.status) {
                    console.log(`[MatchStatus] Changed from ${prev.header?.status} to ${transformed.header?.status}`);
                }
                return transformed;
            });
            setLastUpdate(new Date(timestamp));
        }

        // Check current connection state
        if (socket.connected) {
            onConnect();
        } else {
            // Wait for connection
            socket.on('connect', onConnect);
        }

        socket.on('disconnect', onDisconnect);
        socket.on('match:update', onMatchUpdate);

        return () => {
            // Cleanup: unsubscribe and remove listeners
            unsubscribeFromMatch(matchId);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('match:update', onMatchUpdate);
        };
    }, [matchId]);

    return (
        <div className={styles.matchPageLayout}>
            <div
                className={styles.matchContent}
                style={{ marginRight: isChatCollapsed ? '60px' : '380px' }}
            >
                {/* Live indicator */}
                {isLive ? (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                background: '#fff',
                                borderRadius: '50%',
                                animation: 'pulse 1.5s infinite',
                                boxShadow: '0 0 0 2px rgba(255,255,255,0.2)'
                            }}></span>
                            <span>AO VIVO</span>
                        </div>
                        <span style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 400 }}>
                            {isConnected ? '• Conectado' : '• Reconectando...'}
                        </span>
                    </div>
                ) : null}

                <MatchHeader header={matchData.header} />
                <MainTabs matchData={matchData} />
            </div>
            <ChatSidebar
                matchId={matchId}
                matchData={matchData}
                isCollapsed={isChatCollapsed}
                onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
            />

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
