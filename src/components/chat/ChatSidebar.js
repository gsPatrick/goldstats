'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatSidebar.module.css';

const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

export default function ChatSidebar({ matchId, matchData, isCollapsed: externalIsCollapsed, onToggleCollapse }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    // Use external state if provided, otherwise use internal state
    const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
    const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
    const [initialLoaded, setInitialLoaded] = useState(false);
    const messagesEndRef = useRef(null);

    const handleToggleCollapse = () => {
        if (onToggleCollapse) {
            onToggleCollapse();
        } else {
            setInternalIsCollapsed(!internalIsCollapsed);
        }
    };

    const homeName = matchData?.header?.home_team?.name || 'Time Casa';
    const awayName = matchData?.header?.away_team?.name || 'Time Fora';
    const league = matchData?.header?.league?.name || 'Liga';
    const matchDate = matchData?.header?.date || 'Em breve';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-load analysis from web on mount
    useEffect(() => {
        if (!initialLoaded && !isCollapsed) {
            loadInitialAnalysis();
        }
    }, [isCollapsed]);

    const loadInitialAnalysis = async () => {
        setInitialLoaded(true);
        setLoading(true);

        // Show loading message
        setMessages([{
            role: 'assistant',
            content: `🔍 Buscando informações atualizadas sobre **${homeName} vs ${awayName}**...`
        }]);

        try {
            const matchInfo = {
                home_team: homeName,
                away_team: awayName,
                league: league,
                date: matchDate
            };

            const response = await fetch(`${API_BASE}/chat/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Faça uma análise completa da partida ${homeName} vs ${awayName} pela ${league}. Busque na internet informações sobre:
1. Últimos resultados e forma de cada time
2. Confronto direto (H2H)
3. Lesões e desfalques importantes
4. Probabilidades e odds
5. Sugestões de apostas (Over/Under, BTTS, vencedor)

Seja objetivo e forneça dados atualizados.`,
                    history: [],
                    matchInfo
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages([{
                    role: 'assistant',
                    content: `🤖 **Análise IA - ${homeName} vs ${awayName}**\n\n${data.data.message}\n\n---\n💬 Pergunte qualquer coisa sobre a partida!`
                }]);
            } else {
                setMessages([{
                    role: 'assistant',
                    content: `Olá! 👋 Sou seu assistente para **${homeName} vs ${awayName}**.\n\nPosso buscar informações na internet sobre:\n• Estatísticas e forma recente\n• Lesões e desfalques\n• Odds e probabilidades\n• Sugestões de apostas\n\nO que você gostaria de saber?`
                }]);
            }
        } catch (error) {
            console.error('Initial analysis error:', error);
            setMessages([{
                role: 'assistant',
                content: `Olá! 👋 Sou seu assistente para **${homeName} vs ${awayName}**.\n\nPergunte qualquer coisa sobre a partida e buscarei informações atualizadas na internet!`
            }]);
        }

        setLoading(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const matchInfo = {
                home_team: homeName,
                away_team: awayName,
                league: league,
                date: matchDate
            };

            const response = await fetch(`${API_BASE}/chat/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10),
                    matchInfo
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.data.message
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message || 'Desculpe, ocorreu um erro. Tente novamente.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Erro de conexão. Verifique sua internet e tente novamente.'
            }]);
        }

        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick suggestion buttons
    const suggestions = [
        'Over 2.5 gols?',
        'Escanteios',
        'BTTS?',
        'Handicap',
        'Quem vai ganhar?'
    ];

    // Format message with markdown-like styling
    const formatMessage = (content) => {
        return content.split('\n').map((line, i) => {
            // Bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Bullet points
            if (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./)) {
                return <p key={i} className={styles.bulletPoint} dangerouslySetInnerHTML={{ __html: line }} />;
            }
            return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
        });
    };

    return (
        <div className={`${styles.chatSidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.chatHeader} onClick={handleToggleCollapse}>
                <div className={styles.headerContent}>
                    <span className={styles.chatIcon}>🤖</span>
                    <span className={styles.headerTitle}>Assistente IA</span>
                    <span className={styles.badge}>Web Search</span>
                </div>
                <button className={styles.collapseBtn}>
                    {isCollapsed ? '◀' : '▶'}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    <div className={styles.messagesContainer}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                            >
                                <div className={styles.messageContent}>
                                    {formatMessage(msg.content)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                <div className={styles.typingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length <= 2 && !loading && (
                        <div className={styles.suggestions}>
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    className={styles.suggestionBtn}
                                    onClick={() => {
                                        setInput(s);
                                        setTimeout(() => sendMessage(), 100);
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.inputArea}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Faça uma pergunta sobre a partida..."
                            className={styles.chatInput}
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            className={styles.sendBtn}
                            disabled={loading || !input.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
