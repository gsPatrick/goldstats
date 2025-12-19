'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatSidebar.module.css';

const API_BASE = 'https://10stats-api-10stats.ebl0ff.easypanel.host/api';

export default function ChatSidebar({ matchId, matchData }) {
    // Get initial analysis from matchData if available
    const existingAnalysis = matchData?.ai?.analysis || null;

    const getInitialMessage = () => {
        const homeName = matchData?.header?.home_team?.name || 'Time Casa';
        const awayName = matchData?.header?.away_team?.name || 'Time Fora';

        if (existingAnalysis && existingAnalysis !== 'Análise não disponível.') {
            return `🤖 **Análise IA - ${homeName} vs ${awayName}**

${existingAnalysis}

---
💬 Posso ajudar com mais detalhes! Pergunte sobre:
• Probabilidades de gols (Over/Under)
• Escanteios
• Ambas marcam (BTTS)
• Handicap
• Qualquer outra dúvida`;
        }

        return `Olá! 👋 Sou seu assistente de análise para ${homeName} vs ${awayName}.

Posso ajudar com:
• Análise de estatísticas
• Comparação histórica
• Probabilidades de apostas
• Sugestões de mercados

O que você gostaria de saber?`;
    };

    const [messages, setMessages] = useState([
        { role: 'assistant', content: getInitialMessage() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // Pass match info for web search context
            const matchInfo = {
                home_team: matchData?.header?.home_team?.name || 'Time Casa',
                away_team: matchData?.header?.away_team?.name || 'Time Fora',
                league: matchData?.header?.league?.name || 'Liga',
                date: matchData?.header?.date || 'Em breve'
            };

            const response = await fetch(`${API_BASE}/chat/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10), // Last 10 messages for context
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
        'Me dê uma análise completa',
        'Over 2.5?',
        'Escanteios',
        'BTTS?',
        'Quem vai ganhar?'
    ];

    // Format message with markdown-like styling
    const formatMessage = (content) => {
        return content.split('\n').map((line, i) => {
            // Bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Bullet points
            if (line.startsWith('•') || line.startsWith('-')) {
                return <p key={i} className={styles.bulletPoint} dangerouslySetInnerHTML={{ __html: line }} />;
            }
            return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
        });
    };

    return (
        <div className={`${styles.chatSidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.chatHeader} onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className={styles.headerContent}>
                    <span className={styles.chatIcon}>🤖</span>
                    <span className={styles.headerTitle}>Assistente IA</span>
                    {existingAnalysis && <span className={styles.badge}>Análise</span>}
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

                    {messages.length <= 2 && (
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
