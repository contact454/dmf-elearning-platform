'use client';

/**
 * TutorChat — Socratic Tutor Conversation UI
 * Guided questioning interface that never gives answers directly
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSocraticTutor } from '@/hooks/useCloudAI';

interface TutorChatProps {
    userId: string;
    className?: string;
}

const QUICK_TOPICS = [
    { label: '📝 Grammatik', topic: 'German grammar', stuck: 'Akkusativ vs Dativ' },
    { label: '📖 Lesen', topic: 'Reading comprehension', stuck: 'Understanding long sentences' },
    { label: '🗣️ Sprechen', topic: 'Speaking practice', stuck: 'Pronunciation of umlauts' },
    { label: '✍️ Schreiben', topic: 'Writing', stuck: 'Essay structure in German' },
];

export default function TutorChat({ userId, className = '' }: TutorChatProps) {
    const { session, loading, error, startSession, sendMessage, resolveSession } = useSocraticTutor(userId);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [session?.messages, scrollToBottom]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ─── No Active Session ───
    if (!session) {
        return (
            <div className={`tutor-chat tutor-chat--idle ${className}`}>
                <div className="tutor-chat__header">
                    <span className="tutor-chat__icon">🎓</span>
                    <h3>Socratic Tutor</h3>
                    <p className="tutor-chat__subtitle">Tôi sẽ dẫn dắt bạn qua câu hỏi — không bao giờ đưa đáp án trực tiếp</p>
                </div>
                <div className="tutor-chat__topics">
                    <p className="tutor-chat__topics-label">Bạn đang gặp khó ở đâu?</p>
                    {QUICK_TOPICS.map((t, i) => (
                        <button
                            key={i}
                            className="tutor-chat__topic-btn"
                            onClick={() => startSession(t.topic, t.stuck)}
                            disabled={loading}
                        >
                            {t.label}
                            <span className="tutor-chat__topic-hint">{t.stuck}</span>
                        </button>
                    ))}
                </div>
                {error && <p className="tutor-chat__error">{error}</p>}
            </div>
        );
    }

    // ─── Active Session ───
    return (
        <div className={`tutor-chat tutor-chat--active ${className}`}>
            <div className="tutor-chat__header tutor-chat__header--active">
                <div className="tutor-chat__session-info">
                    <span className="tutor-chat__icon">🎓</span>
                    <div>
                        <h3>{session.topic}</h3>
                        <span className="tutor-chat__scaffold">Scaffold Level: {'⭐'.repeat(session.scaffoldLevel)}</span>
                    </div>
                </div>
                <button className="tutor-chat__resolve-btn" onClick={resolveSession}>
                    ✓ Đã hiểu
                </button>
            </div>

            <div className="tutor-chat__messages">
                {session.messages.map((msg, i) => (
                    <div key={i} className={`tutor-chat__msg tutor-chat__msg--${msg.role}`}>
                        <span className="tutor-chat__msg-avatar">
                            {msg.role === 'tutor' ? '🎓' : '👤'}
                        </span>
                        <div className="tutor-chat__msg-bubble">
                            <p>{msg.text}</p>
                            <time className="tutor-chat__msg-time">
                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </time>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="tutor-chat__msg tutor-chat__msg--tutor">
                        <span className="tutor-chat__msg-avatar">🎓</span>
                        <div className="tutor-chat__msg-bubble tutor-chat__msg-bubble--typing">
                            <span className="tutor-chat__typing-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="tutor-chat__input-area">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Trả lời hoặc hỏi thêm..."
                    rows={1}
                    disabled={loading}
                    className="tutor-chat__input"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="tutor-chat__send-btn"
                >
                    ↑
                </button>
            </div>
        </div>
    );
}
