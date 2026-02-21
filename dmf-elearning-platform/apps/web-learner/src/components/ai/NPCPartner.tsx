'use client';

/**
 * NPCPartner — AI NPC Conversation Roleplay UI
 * Scenario-based language practice with corrections
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNPCConversation } from '@/hooks/useCloudAI';

interface NPCPartnerProps {
    userId: string;
    className?: string;
}

const SCENARIOS = [
    { id: 'restaurant', icon: '🍽️', label: 'Im Restaurant', desc: 'Bestellen und bezahlen' },
    { id: 'interview', icon: '💼', label: 'Bewerbungsgespräch', desc: 'Vorstellungsgespräch' },
    { id: 'shopping', icon: '🛒', label: 'Im Supermarkt', desc: 'Einkaufen und fragen' },
    { id: 'doctor', icon: '🏥', label: 'Beim Arzt', desc: 'Symptome beschreiben' },
    { id: 'travel', icon: '🚂', label: 'Am Bahnhof', desc: 'Tickets und Fahrplan' },
    { id: 'neighbor', icon: '🏠', label: 'Neue Nachbarn', desc: 'Sich vorstellen' },
];

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2'];

export default function NPCPartner({ userId, className = '' }: NPCPartnerProps) {
    const { session, loading, error, startConversation, sendMessage, endConversation } = useNPCConversation(userId);
    const [input, setInput] = useState('');
    const [cefrLevel, setCefrLevel] = useState('A2');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.turns]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    // ─── Scenario Selector ───
    if (!session) {
        return (
            <div className={`npc-partner npc-partner--idle ${className}`}>
                <div className="npc-partner__header">
                    <span className="npc-partner__icon">🤖</span>
                    <h3>Gesprächspartner</h3>
                    <p>Luyện hội thoại với AI trong các tình huống thực tế</p>
                </div>

                <div className="npc-partner__level-picker">
                    <span>Trình độ:</span>
                    {CEFR_LEVELS.map(level => (
                        <button
                            key={level}
                            className={`npc-partner__level-btn ${cefrLevel === level ? 'npc-partner__level-btn--active' : ''}`}
                            onClick={() => setCefrLevel(level)}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <div className="npc-partner__scenarios">
                    {SCENARIOS.map(s => (
                        <button
                            key={s.id}
                            className="npc-partner__scenario-card"
                            onClick={() => startConversation(s.id, cefrLevel)}
                            disabled={loading}
                        >
                            <span className="npc-partner__scenario-icon">{s.icon}</span>
                            <div>
                                <strong>{s.label}</strong>
                                <span className="npc-partner__scenario-desc">{s.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
                {error && <p className="npc-partner__error">{error}</p>}
            </div>
        );
    }

    // ─── Active Conversation ───
    return (
        <div className={`npc-partner npc-partner--active ${className}`}>
            <div className="npc-partner__header npc-partner__header--active">
                <span className="npc-partner__icon">🤖</span>
                <div className="npc-partner__session-info">
                    <strong>{SCENARIOS.find(s => s.id === session.scenarioId)?.label || session.scenarioId}</strong>
                    <span className="npc-partner__cefr-badge">{cefrLevel}</span>
                </div>
                <button className="npc-partner__end-btn" onClick={endConversation}>
                    Beenden
                </button>
            </div>

            <div className="npc-partner__messages">
                {session.turns.map((turn, i) => (
                    <div key={i} className={`npc-partner__msg npc-partner__msg--${turn.role}`}>
                        <span className="npc-partner__msg-avatar">
                            {turn.role === 'npc' ? '🤖' : '👤'}
                        </span>
                        <div className="npc-partner__msg-content">
                            <p>{turn.text}</p>
                            {turn.corrections && turn.corrections.length > 0 && (
                                <div className="npc-partner__corrections">
                                    <span className="npc-partner__corrections-label">💡 Korrekturen:</span>
                                    {turn.corrections.map((c, j) => (
                                        <span key={j} className="npc-partner__correction">{c}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="npc-partner__msg npc-partner__msg--npc">
                        <span className="npc-partner__msg-avatar">🤖</span>
                        <div className="npc-partner__msg-content npc-partner__typing">
                            <span>NPC đang suy nghĩ...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {session.status === 'completed' && session.feedback ? (
                <div className="npc-partner__feedback">
                    <h4>📊 Kết quả</h4>
                    <div className="npc-partner__feedback-scores">
                        <div className="npc-partner__score">
                            <span>Chính xác</span>
                            <strong>{Math.round(session.feedback.accuracy * 100)}%</strong>
                        </div>
                        <div className="npc-partner__score">
                            <span>Trôi chảy</span>
                            <strong>{Math.round(session.feedback.fluency * 100)}%</strong>
                        </div>
                    </div>
                    {session.feedback.tips.length > 0 && (
                        <ul className="npc-partner__tips">
                            {session.feedback.tips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div className="npc-partner__input-area">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Schreiben Sie auf Deutsch..."
                        disabled={loading}
                        className="npc-partner__input"
                    />
                    <button onClick={handleSend} disabled={loading || !input.trim()} className="npc-partner__send-btn">
                        Senden
                    </button>
                </div>
            )}
        </div>
    );
}
