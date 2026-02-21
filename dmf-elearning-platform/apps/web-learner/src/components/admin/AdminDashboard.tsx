'use client';

/**
 * AdminDashboard — Real-time Analytics Dashboard
 * Shows DAU, retention, engagement, learning metrics, and gamification stats
 */

import React from 'react';
import { useAnalytics } from '@/hooks/useCloudAI';

interface AdminDashboardProps {
    className?: string;
}

function MetricCard({ label, value, icon, trend }: { label: string; value: string | number; icon: string; trend?: string }) {
    return (
        <div className="admin-dash__metric">
            <span className="admin-dash__metric-icon">{icon}</span>
            <div>
                <span className="admin-dash__metric-value">{value}</span>
                <span className="admin-dash__metric-label">{label}</span>
                {trend && <span className="admin-dash__metric-trend">{trend}</span>}
            </div>
        </div>
    );
}

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
    const { dashboard, loading, refresh } = useAnalytics();

    if (loading || !dashboard) {
        return (
            <div className={`admin-dash admin-dash--loading ${className}`}>
                <div className="admin-dash__header">
                    <h2>📊 Dashboard</h2>
                </div>
                <div className="admin-dash__skeleton">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="admin-dash__skeleton-card" />
                    ))}
                </div>
            </div>
        );
    }

    const { overview, engagement, learning, gamification, topContent } = dashboard;

    return (
        <div className={`admin-dash ${className}`}>
            <div className="admin-dash__header">
                <h2>📊 DMF Learning Dashboard</h2>
                <button onClick={refresh} className="admin-dash__refresh">🔄 Refresh</button>
            </div>

            {/* ─── Overview Metrics ─── */}
            <section className="admin-dash__section">
                <h3>📈 Tổng quan</h3>
                <div className="admin-dash__metrics-grid">
                    <MetricCard icon="👥" label="Tổng Users" value={overview.totalUsers.toLocaleString()} />
                    <MetricCard icon="🟢" label="Active Hôm nay" value={overview.activeToday} />
                    <MetricCard icon="📅" label="Active Tuần này" value={overview.activeThisWeek} />
                    <MetricCard icon="🔁" label="Retention 7d" value={`${overview.retentionRate7d}%`} />
                    <MetricCard icon="⏱️" label="Avg Session" value={`${overview.avgSessionMinutes} phút`} />
                </div>
            </section>

            {/* ─── Learning Metrics ─── */}
            <section className="admin-dash__section">
                <h3>📚 Học tập</h3>
                <div className="admin-dash__metrics-grid">
                    <MetricCard icon="🎯" label="Avg Accuracy" value={`${Math.round(learning.avgAccuracy * 100)}%`} />
                    <MetricCard icon="📝" label="Vocab Mastered" value={learning.vocabMastered.toLocaleString()} />
                    <MetricCard icon="📊" label="Reviews/Ngày" value={engagement.avgReviewsPerDay} />
                </div>

                {/* CEFR Distribution */}
                {Object.keys(learning.cefrDistribution).length > 0 && (
                    <div className="admin-dash__cefr">
                        <h4>CEFR Distribution</h4>
                        <div className="admin-dash__cefr-bars">
                            {Object.entries(learning.cefrDistribution).map(([level, count]) => (
                                <div key={level} className="admin-dash__cefr-bar">
                                    <span className="admin-dash__cefr-label">{level}</span>
                                    <div className="admin-dash__cefr-fill" style={{ width: `${Math.min(100, (count as number) * 10)}%` }} />
                                    <span className="admin-dash__cefr-count">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* ─── Gamification Metrics ─── */}
            <section className="admin-dash__section">
                <h3>🏆 Gamification</h3>
                <div className="admin-dash__metrics-grid">
                    <MetricCard icon="⭐" label="Total XP" value={gamification.totalXPAwarded.toLocaleString()} />
                    <MetricCard icon="🏅" label="Avg XP/User" value={Math.round(gamification.avgXPPerUser)} />
                    <MetricCard icon="🏆" label="Achievements" value={gamification.achievementsUnlocked} />
                    <MetricCard icon="🔥" label="Active Streaks" value={gamification.activeStreaks} />
                </div>
            </section>

            {/* ─── Peak Hours ─── */}
            <section className="admin-dash__section">
                <h3>🕐 Giờ cao điểm</h3>
                <div className="admin-dash__peak-hours">
                    {engagement.peakHours
                        .filter(h => h.sessions > 0)
                        .sort((a, b) => b.sessions - a.sessions)
                        .slice(0, 6)
                        .map(h => (
                            <div key={h.hour} className="admin-dash__peak-hour">
                                <span className="admin-dash__peak-time">{String(h.hour).padStart(2, '0')}:00</span>
                                <span className="admin-dash__peak-count">{h.sessions} sessions</span>
                            </div>
                        ))}
                    {engagement.peakHours.every(h => h.sessions === 0) && (
                        <p className="admin-dash__no-data">Chưa có dữ liệu sessions</p>
                    )}
                </div>
            </section>

            {/* ─── Top Content ─── */}
            {topContent.length > 0 && (
                <section className="admin-dash__section">
                    <h3>🔝 Top Content</h3>
                    <div className="admin-dash__top-content">
                        {topContent.slice(0, 5).map((content, i) => (
                            <div key={content.id} className="admin-dash__content-row">
                                <span className="admin-dash__content-rank">#{i + 1}</span>
                                <span className="admin-dash__content-title">{content.title}</span>
                                <span className="admin-dash__content-views">{content.views} views</span>
                                <span className="admin-dash__content-rate">{Math.round(content.completionRate * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
