import { io } from 'socket.io-client';

const API_URL = 'http://127.0.0.1:3333';
let socket;

export const initSocket = () => {
    if (!socket) {
        socket = io(`${API_URL}/goldstats`, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to GoldStats namespace');
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const subscribeToMatch = (matchId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit('match:subscribe', matchId);
    } else {
        s.once('connect', () => {
            s.emit('match:subscribe', matchId);
        });
    }
};

export const unsubscribeFromMatch = (matchId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit('match:unsubscribe', matchId);
    }
};
