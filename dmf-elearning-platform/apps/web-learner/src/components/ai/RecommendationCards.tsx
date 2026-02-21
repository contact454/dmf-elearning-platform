'use client';

/**
 * RecommendationCards — AI-Powered Personalized Content Suggestions
 * Shows CoT reasoning for each recommendation
 */

import React from 'react';
import { useRecommendations } from '@/hooks/useCloudAI';

interface RecommendationCardsProps {
    userId: string;
    className?: string;
}

const TYPE_ICONS: Record<string, string> = {
    vocabulary: '📝',
    reading: '📖',
    listening: '🎧',
    writing: '✍️',
    speaking: '🗣️',
    grammar: '📐',
    default: '📚',
};

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: '#4ade80',
    medium: '#fbbf24',
    hard: '#f87171',
};

export default function RecommendationCards({ userId, className = '' }: RecommendationCardsProps) {
    const { recommendations, reasoning, loading, refresh } = useRecommendations(userId);

    if (loading) {
        return (
            <div className={`rec-cards rec-cards--loading ${className}`}>
                <div className="rec-cards__header">
                    <span>🎯</span>
                    <h3>Đề xuất cho bạn</h3>
                </div>
                <div className="rec-cards__skeleton">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rec-cards__skeleton-card" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`rec-cards ${className}`}>
            <div className="rec-cards__header">
                <div>
                    <span>🎯</span>
                    <h3>Đề xuất cho bạn</h3>
                </div>
                <button onClick={() => refresh()} className="rec-cards__refresh-btn">
                    🔄 Làm mới
                </button>
            </div>

            {reasoning && (
                <p className="rec-cards__reasoning">
                    <span className="rec-cards__reasoning-icon">🤖</span>
                    {reasoning}
                </p>
            )}

            <div className="rec-cards__grid">
                {recommendations.map((rec) => (
                    <div key={rec.id} className="rec-cards__card">
                        <div className="rec-cards__card-top">
                            <span className="rec-cards__type-icon">
                                {TYPE_ICONS[rec.type] || TYPE_ICONS.default}
                            </span>
                            <span
                                className="rec-cards__difficulty"
                                style={{ backgroundColor: DIFFICULTY_COLORS[rec.difficulty] || '#94a3b8' }}
                            >
                                {rec.difficulty}
                            </span>
                        </div>
                        <h4 className="rec-cards__title">{rec.title}</h4>
                        <p className="rec-cards__reason">{rec.reason}</p>
                        <div className="rec-cards__card-footer">
                            <span className="rec-cards__score">
                                {Math.round(rec.score * 100)}% match
                            </span>
                            <button className="rec-cards__start-btn">Bắt đầu →</button>
                        </div>
                    </div>
                ))}
            </div>

            {recommendations.length === 0 && (
                <div className="rec-cards__empty">
                    <span>📭</span>
                    <p>Chưa có đề xuất. Học thêm để AI hiểu bạn hơn!</p>
                </div>
            )}
        </div>
    );
}
