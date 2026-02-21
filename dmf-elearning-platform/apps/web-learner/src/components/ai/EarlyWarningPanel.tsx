'use client';

/**
 * EarlyWarningPanel — At-Risk Student Alert Dashboard
 * Shows students at risk of dropping out with intervention suggestions
 */

import React from 'react';
import { useEarlyWarnings } from '@/hooks/useCloudAI';

interface EarlyWarningPanelProps {
    className?: string;
}

const SEVERITY_CONFIG = {
    critical: { color: '#ef4444', bg: '#fef2f2', icon: '🔴', label: 'Nghiêm trọng' },
    high: { color: '#f97316', bg: '#fff7ed', icon: '🟠', label: 'Cao' },
    medium: { color: '#eab308', bg: '#fefce8', icon: '🟡', label: 'Trung bình' },
    low: { color: '#22c55e', bg: '#f0fdf4', icon: '🟢', label: 'Thấp' },
};

export default function EarlyWarningPanel({ className = '' }: EarlyWarningPanelProps) {
    const { alerts, loading, fetchAlerts } = useEarlyWarnings();

    return (
        <div className={`warning-panel ${className}`}>
            <div className="warning-panel__header">
                <div>
                    <span>⚠️</span>
                    <h3>Cảnh báo sớm</h3>
                    <span className="warning-panel__count">{alerts.length} alerts</span>
                </div>
                <button onClick={fetchAlerts} disabled={loading} className="warning-panel__refresh">
                    {loading ? '⏳' : '🔄'}
                </button>
            </div>

            <div className="warning-panel__list">
                {alerts.map((alert, i) => {
                    const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
                    return (
                        <div
                            key={i}
                            className="warning-panel__alert"
                            style={{ borderLeftColor: config.color, backgroundColor: config.bg }}
                        >
                            <div className="warning-panel__alert-header">
                                <span className="warning-panel__severity">
                                    {config.icon} {config.label}
                                </span>
                                <time className="warning-panel__time">
                                    {new Date(alert.detectedAt).toLocaleDateString('vi-VN')}
                                </time>
                            </div>
                            <p className="warning-panel__message">{alert.message}</p>
                            <div className="warning-panel__action">
                                <span className="warning-panel__action-label">💡 Đề xuất:</span>
                                <p>{alert.suggestedAction}</p>
                            </div>
                            <div className="warning-panel__alert-footer">
                                <span className="warning-panel__user-id">User: {alert.userId.slice(0, 8)}...</span>
                                <button className="warning-panel__resolve-btn">✓ Xử lý</button>
                            </div>
                        </div>
                    );
                })}

                {!loading && alerts.length === 0 && (
                    <div className="warning-panel__empty">
                        <span>🎉</span>
                        <p>Không có cảnh báo — tất cả học viên ổn!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
