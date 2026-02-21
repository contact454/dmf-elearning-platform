'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ───

interface SkillData {
    name: string;
    nameVi: string;
    score: number;
    level: string;
    icon: string;
    color: string;
}

interface CEFRData {
    currentLevel: string;
    nextLevel: string | null;
    progressPercent: number;
    weakestSkill: string;
    strongestSkill: string;
    skills: SkillData[];
    totalXP: number;
    currentStreak: number;
}

// ─── Mock data (connects to real API in production) ───

function useCEFRData(): { data: CEFRData | null; loading: boolean } {
    const [data, setData] = useState<CEFRData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In production, fetch from /api/education/cefr/assess
        const mockData: CEFRData = {
            currentLevel: 'A2',
            nextLevel: 'B1',
            progressPercent: 64,
            weakestSkill: 'writing',
            strongestSkill: 'vocabulary',
            skills: [
                { name: 'Wortschatz', nameVi: 'Từ vựng', score: 72, level: 'B1', icon: '📚', color: '#6366f1' },
                { name: 'Lesen', nameVi: 'Đọc', score: 58, level: 'A2', icon: '📖', color: '#8b5cf6' },
                { name: 'Hören', nameVi: 'Nghe', score: 45, level: 'A2', icon: '🎧', color: '#a855f7' },
                { name: 'Sprechen', nameVi: 'Nói', score: 38, level: 'A2', icon: '🎤', color: '#d946ef' },
                { name: 'Schreiben', nameVi: 'Viết', score: 32, level: 'A1', icon: '✍️', color: '#ec4899' },
            ],
            totalXP: 2450,
            currentStreak: 12,
        };
        setTimeout(() => { setData(mockData); setLoading(false); }, 500);
    }, []);

    return { data, loading };
}

// ─── Radar Chart (pure SVG) ───

function SkillRadar({ skills }: { skills: SkillData[] }) {
    const size = 280;
    const center = size / 2;
    const maxRadius = 110;
    const levels = [20, 40, 60, 80, 100];
    const n = skills.length;

    const getPoint = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
        const r = (value / 100) * maxRadius;
        return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };

    const polygonPoints = skills.map((s, i) => {
        const p = getPoint(i, s.score);
        return `${p.x},${p.y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
            {/* Grid rings */}
            {levels.map(level => (
                <polygon
                    key={level}
                    points={Array.from({ length: n }, (_, i) => {
                        const p = getPoint(i, level);
                        return `${p.x},${p.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-gray-200 dark:text-gray-700"
                />
            ))}

            {/* Axes */}
            {skills.map((_, i) => {
                const p = getPoint(i, 100);
                return (
                    <line key={i} x1={center} y1={center} x2={p.x} y2={p.y}
                        stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
                );
            })}

            {/* Data polygon */}
            <polygon
                points={polygonPoints}
                fill="url(#radarGradient)"
                fillOpacity="0.3"
                stroke="url(#radarStroke)"
                strokeWidth="2"
            />

            {/* Dots + Labels */}
            {skills.map((s, i) => {
                const p = getPoint(i, s.score);
                const label = getPoint(i, 115);
                return (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill={s.color} />
                        <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle"
                            className="text-[10px] font-medium fill-gray-600 dark:fill-gray-300">
                            {s.icon} {s.score}
                        </text>
                    </g>
                );
            })}

            <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── Main Page ───

export default function CEFRDashboardPage() {
    const { data, loading } = useCEFRData();

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-outfit font-bold text-gray-800 dark:text-gray-100">
                            CEFR Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Dein Sprachniveau auf einen Blick
                        </p>
                    </div>
                    <Link href="/learn" className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                        ← Zurück
                    </Link>
                </div>

                {/* Level Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium mb-1">Aktuelles Niveau</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl font-outfit font-extrabold">{data.currentLevel}</span>
                                {data.nextLevel && (
                                    <span className="text-white/60 text-lg">→ {data.nextLevel}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{data.totalXP.toLocaleString()}</p>
                                    <p className="text-white/70 text-xs">XP</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">🔥 {data.currentStreak}</p>
                                    <p className="text-white/70 text-xs">Streak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Progress bar */}
                    {data.nextLevel && (
                        <div className="relative mt-4">
                            <div className="flex justify-between text-sm text-white/70 mb-1">
                                <span>{data.currentLevel}</span>
                                <span>{data.progressPercent}%</span>
                                <span>{data.nextLevel}</span>
                            </div>
                            <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-white/80 transition-all duration-1000 ease-out"
                                    style={{ width: `${data.progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Radar + Skills grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Radar */}
                    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-outfit font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                            Fähigkeiten-Radar
                        </h2>
                        <SkillRadar skills={data.skills} />
                    </div>

                    {/* Skill cards */}
                    <div className="space-y-3">
                        {data.skills.map(skill => (
                            <div key={skill.name}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
                                <span className="text-2xl w-10 text-center">{skill.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <span className="font-medium text-gray-800 dark:text-gray-100">{skill.name}</span>
                                            <span className="text-xs text-gray-400 ml-2">{skill.nameVi}</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: `${skill.color}20`, color: skill.color }}>
                                            {skill.level}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${skill.score}%`, backgroundColor: skill.color }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{skill.score}/100</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-2xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-outfit font-bold text-gray-800 dark:text-gray-100 mb-4">
                        💡 Empfehlungen
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                            <span className="text-xl mt-0.5">🎯</span>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Schwächste Fähigkeit</p>
                                <p className="text-red-600 dark:text-red-400 font-bold capitalize">{data.weakestSkill}</p>
                                <p className="text-xs text-gray-500 mt-1">Üben Sie diese Fähigkeit täglich</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                            <span className="text-xl mt-0.5">⭐</span>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Stärkste Fähigkeit</p>
                                <p className="text-green-600 dark:text-green-400 font-bold capitalize">{data.strongestSkill}</p>
                                <p className="text-xs text-gray-500 mt-1">Weiter so! Fast auf dem nächsten Niveau</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
