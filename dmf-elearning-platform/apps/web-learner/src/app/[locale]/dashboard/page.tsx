'use client';

import Link from 'next/link';
import { useHubData } from '@/hooks/useApiQueries';
import {
  BookOpen,
  Brain,
  Flame,
  Headphones,
  Loader2,
  Mic,
  PenTool,
  RefreshCw,
} from 'lucide-react';

const skillIcons = {
  vocabulary: Brain,
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenTool,
} as const;

const skillLinks = {
  vocabulary: '/learn/german',
  reading: '/learn/reading',
  listening: '/learn/listening',
  speaking: '/learn/speaking',
  writing: '/learn/writing',
} as const;

export default function DashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useHubData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">Dashboard unavailable</h1>
          <p className="text-sm text-slate-600 mb-4">
            Could not load hub data from learning-service.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const completionCards = [
    { label: 'Words Learned', value: data.summary.totalWordsLearned },
    { label: 'Words In Review', value: data.summary.wordsInReview },
    { label: 'Reading Done', value: data.summary.readingCompleted },
    { label: 'Listening Done', value: data.summary.listeningCompleted },
    { label: 'Speaking Done', value: data.summary.speakingCompleted },
    { label: 'Writing Done', value: data.summary.writingCompleted },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Progress Dashboard</h1>
            <p className="text-slate-600 mt-1">Real-time data from `/api/hub/:userId`</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-slate-100"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white border p-4">
            <p className="text-xs text-slate-500">Overall Level</p>
            <p className="text-2xl font-bold text-slate-900">{data.overallLevel}</p>
          </div>
          <div className="rounded-xl bg-white border p-4">
            <p className="text-xs text-slate-500">Total XP</p>
            <p className="text-2xl font-bold text-slate-900">{data.totalXP}</p>
          </div>
          <div className="rounded-xl bg-white border p-4">
            <p className="text-xs text-slate-500">Current Streak</p>
            <p className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {data.summary.currentStreak}
            </p>
          </div>
          <div className="rounded-xl bg-white border p-4">
            <p className="text-xs text-slate-500">Longest Streak</p>
            <p className="text-2xl font-bold text-slate-900">{data.longestStreak}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {completionCards.map((item) => (
            <div key={item.label} className="rounded-xl bg-white border p-4">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white border p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Skill Progress</h2>
          <div className="space-y-4">
            {data.skillProgress.map((skill) => {
              const Icon = skillIcons[skill.skill as keyof typeof skillIcons] ?? Brain;
              return (
                <Link
                  key={skill.skill}
                  href={skillLinks[skill.skill as keyof typeof skillLinks] || data.recommendedActivity.link}
                  className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium capitalize">{skill.skill}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{skill.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${Math.max(0, Math.min(skill.progress, 100))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {skill.itemsLearned}/{skill.itemsTotal} items
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
