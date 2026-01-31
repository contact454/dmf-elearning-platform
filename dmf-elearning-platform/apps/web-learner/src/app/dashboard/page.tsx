
import Link from 'next/link';
import { SimulateButton } from './SimulateButton';

// Force dynamic rendering since we are fetching from an internal API that might change
export const dynamic = 'force-dynamic';

interface SkillBreakdown {
    listening: number;
    reading: number;
    speaking: number;
    writing: number;
}

interface MasteryData {
    userId: string;
    overallScore: number;
    skillBreakdown: SkillBreakdown;
    lastCalculatedAt: string;
}

interface GamificationData {
    userId: string;
    currentXP: number;
    currentLevel: number;
    nextLevelXP: number;
    xpForNextLevel: number;
    streak: number;
}

interface DashboardData {
    mastery: MasteryData;
    gamification: GamificationData;
}

type FetchResult =
    | { status: 'success'; data: DashboardData }
    | { status: 'not_found' }
    | { status: 'error'; message: string };

async function getData(userId: string): Promise<FetchResult> {
    // Fetch both APIs in parallel using Promise.allSettled for graceful degradation
    const [masteryResult, gamificationResult] = await Promise.allSettled([
        fetch(`http://127.0.0.1:3005/api/read/mastery/${userId}`, { cache: 'no-store' })
            .then(res => res.ok ? res.json() : null),
        fetch(`http://127.0.0.1:3006/api/gamification/stats/${userId}`, { cache: 'no-store' })
            .then(res => res.ok ? res.json() : null),
    ]);

    // Extract data with fallbacks
    const masteryData: MasteryData = masteryResult.status === 'fulfilled' && masteryResult.value
        ? masteryResult.value
        : {
            userId,
            overallScore: 0,
            skillBreakdown: { listening: 0, reading: 0, speaking: 0, writing: 0 },
            lastCalculatedAt: new Date().toISOString(),
        };

    const gamificationData: GamificationData = gamificationResult.status === 'fulfilled' && gamificationResult.value
        ? gamificationResult.value
        : {
            userId,
            currentXP: 0,
            currentLevel: 1,
            nextLevelXP: 100,
            xpForNextLevel: 100,
            streak: 0,
        };

    // Log warnings for failed services
    if (masteryResult.status === 'rejected') {
        console.warn('⚠️ Service 3005 (Mastery) chưa chạy, đang dùng Mock Data.');
    }
    if (gamificationResult.status === 'rejected') {
        console.warn('⚠️ Service 3006 (Gamification) chưa chạy, đang dùng Mock Data.');
    }

    return {
        status: 'success',
        data: {
            mastery: masteryData,
            gamification: gamificationData,
        }
    };
}

export default async function DashboardPage() {
    const DEMO_USER_ID = 'user-m3-demo';
    const result = await getData(DEMO_USER_ID);

    // Check if using mock data (all skills are 0 and level is 1)
    const isUsingMockData = result.status === 'success' &&
        result.data.mastery.overallScore === 0 &&
        Object.values(result.data.mastery.skillBreakdown).every(score => score === 0) &&
        result.data.gamification.currentLevel === 1 &&
        result.data.gamification.currentXP === 0;

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Learner Dashboard</h1>
                        <p className="text-slate-500">Welcome back, {DEMO_USER_ID}!</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <SimulateButton userId={DEMO_USER_ID} />
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            M3-lite Preview
                        </div>
                    </div>
                </header>

                {/* Mock Data Warning Badge */}
                {isUsingMockData && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">Mock Data Mode</p>
                            <p className="text-xs text-amber-600 mt-1">
                                Service 3005 chưa chạy. Đang hiển thị dữ liệu mẫu. Chạy: <code className="bg-amber-100 px-1 rounded">pnpm dev:motivation-progress</code>
                            </p>
                        </div>
                    </div>
                )}

                {result.status === 'error' ? (
                    <div className="bg-red-50 p-12 rounded-2xl shadow-sm border border-red-100 text-center">
                        <div className="flex justify-center mb-4">
                            {/* Simple Icon */}
                            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-red-800 mb-2">⚠️ Backend Disconnected</h2>
                        <p className="text-red-600 mb-6">Could not connect to the Progress Service at port 3005.</p>
                        <div className="text-sm text-slate-700 bg-white p-4 rounded border border-red-200 inline-block text-left">
                            <strong>Troubleshooting:</strong><br />
                            1. Ensure backend service is running.<br />
                            2. Run command: <code className="bg-slate-100 px-1 rounded">pnpm --filter @dmf/motivation-progress-service dev</code>
                        </div>
                    </div>
                ) : result.status === 'not_found' ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No Mastery Data Found</h2>
                        <p className="text-slate-500 mb-6">User has not completed any lessons yet.</p>
                        <div className="p-4 bg-orange-50 text-orange-700 rounded-lg inline-block text-sm">
                            <strong>Debug Tip:</strong> Click the "Simulate Lesson" button above to generate mock data.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Gamification Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Level Card */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm font-medium">Current Level</p>
                                        <p className="text-4xl font-bold mt-1">Lv {result.data.gamification.currentLevel}</p>
                                    </div>
                                    <div className="text-5xl">⭐</div>
                                </div>
                            </div>

                            {/* XP Progress Card */}
                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white">
                                <p className="text-amber-200 text-sm font-medium mb-2">Experience Points</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold">{result.data.gamification.currentXP}</p>
                                    <p className="text-amber-200 text-sm">/ {result.data.gamification.nextLevelXP} XP</p>
                                </div>
                                <div className="mt-3 bg-amber-700/30 rounded-full h-2">
                                    <div
                                        className="bg-white h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, (result.data.gamification.currentXP / result.data.gamification.nextLevelXP) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-amber-200 text-xs mt-2">{result.data.gamification.xpForNextLevel} XP to next level</p>
                            </div>

                            {/* Streak Card */}
                            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-200 text-sm font-medium">Day Streak</p>
                                        <p className="text-4xl font-bold mt-1">{result.data.gamification.streak} 🔥</p>
                                    </div>
                                    <div className="text-4xl">📅</div>
                                </div>
                            </div>
                        </div>

                        {/* Mastery Data Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Overall Score Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                                <h2 className="text-lg font-medium text-slate-600 mb-4 w-full">Overall Mastery</h2>
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full border-[12px] border-blue-100 flex items-center justify-center">
                                        <span className="text-5xl font-bold text-blue-600">{result.data.mastery.overallScore}%</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-slate-400">Last updated: {new Date(result.data.mastery.lastCalculatedAt).toLocaleDateString()}</p>
                            </div>

                            {/* Skill Breakdown Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-lg font-medium text-slate-600 mb-6">Skill Breakdown</h2>
                                <div className="space-y-4">
                                    {Object.entries(result.data.mastery.skillBreakdown).map(([skill, score]) => (
                                        <div key={skill}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-700 capitalize">{skill}</span>
                                                <span className="text-sm font-medium text-slate-900">{score}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
