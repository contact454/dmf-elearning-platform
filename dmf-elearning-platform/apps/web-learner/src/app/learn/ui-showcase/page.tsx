'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Zap, Trophy, Bell, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import {
  Skeleton,
  SkeletonCard,
  SkeletonFlashcard,
  SkeletonList,
  SkeletonStats,
  LoadingButton,
  useToast,
  ProgressBar,
  CircularProgress,
  StepProgress,
  RippleButton,
  XPGain,
  StreakFlame,
  AchievementUnlock,
  PulseIndicator,
  CountUp,
} from '@/components/ui';

export default function UIShowcasePage() {
  const toast = useToast();
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showXP, setShowXP] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(65);

  const handleButtonClick = async () => {
    setButtonState('loading');
    await new Promise((r) => setTimeout(r, 2000));
    setButtonState('success');
    toast.success('Action completed!', 'Your changes have been saved.');
    setTimeout(() => setButtonState('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/learn/hub"
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">UI Component Showcase</h1>
              <p className="text-sm text-slate-500">Micro-interactions & Loading States</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-12">
          {/* Section: Skeleton Loaders */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                <Sparkles size={20} />
              </span>
              Skeleton Loaders
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Card Skeleton</h3>
                <SkeletonCard />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Flashcard Skeleton</h3>
                <SkeletonFlashcard />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">List Skeleton</h3>
                <SkeletonList count={3} />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Stats Skeleton</h3>
                <SkeletonStats />
              </div>
            </div>
          </section>

          {/* Section: Buttons */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-600">
                <Zap size={20} />
              </span>
              Interactive Buttons
            </h2>
            <div className="flex flex-wrap gap-4">
              <LoadingButton
                state={buttonState}
                onClick={handleButtonClick}
                loadingText="Saving..."
              >
                Save Changes
              </LoadingButton>

              <LoadingButton variant="secondary" size="lg">
                Secondary Button
              </LoadingButton>

              <LoadingButton variant="danger" size="sm">
                Delete
              </LoadingButton>

              <RippleButton>Ripple Effect</RippleButton>
            </div>
          </section>

          {/* Section: Progress */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <Trophy size={20} />
              </span>
              Progress Indicators
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Linear Progress</h3>
                  <ProgressBar value={progress} showLabel label="Course Progress" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Gradient Progress</h3>
                  <ProgressBar value={75} variant="gradient" size="lg" showLabel />
                </div>
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Striped Progress</h3>
                  <ProgressBar value={45} variant="striped" size="md" />
                </div>
                <button
                  onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 10))}
                  className="text-sm text-indigo-600 hover:underline cursor-pointer"
                >
                  Increase Progress +10%
                </button>
              </div>

              <div className="space-y-6">
                <h3 className="font-medium text-slate-700 mb-3">Circular Progress</h3>
                <div className="flex items-center gap-6">
                  <CircularProgress value={75} variant="default" />
                  <CircularProgress value={90} variant="gradient" size={100} />
                  <CircularProgress value={45} size={60} strokeWidth={6} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium text-slate-700 mb-4">Step Progress</h3>
              <StepProgress
                currentStep={currentStep}
                totalSteps={5}
                labels={['Start', 'Learn', 'Practice', 'Quiz', 'Complete']}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            </div>
          </section>

          {/* Section: Toast Notifications */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
                <Bell size={20} />
              </span>
              Toast Notifications
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toast.success('Success!', 'Your progress has been saved.')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                Success Toast
              </button>
              <button
                onClick={() => toast.error('Error!', 'Something went wrong. Please try again.')}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                Error Toast
              </button>
              <button
                onClick={() => toast.warning('Warning!', 'You have unsaved changes.')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                Warning Toast
              </button>
              <button
                onClick={() => toast.info('Info', 'New vocabulary added to your deck.')}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              >
                Info Toast
              </button>
            </div>
          </section>

          {/* Section: Gamification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <Zap size={20} />
              </span>
              Gamification Elements
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Streak Flames</h3>
                <div className="flex items-center gap-4">
                  <StreakFlame streak={3} size="sm" />
                  <StreakFlame streak={14} size="md" />
                  <StreakFlame streak={45} size="lg" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">XP Gain Animation</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowXP(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium cursor-pointer"
                  >
                    Earn XP
                  </button>
                  <XPGain amount={25} show={showXP} onComplete={() => setShowXP(false)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Pulse Indicators</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <PulseIndicator color="green" />
                    <span className="text-sm text-slate-600">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PulseIndicator color="amber" />
                    <span className="text-sm text-slate-600">Learning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PulseIndicator color="red" active={false} />
                    <span className="text-sm text-slate-600">Offline</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium text-slate-700 mb-4">Achievement Unlock</h3>
              <button
                onClick={() => setShowAchievement(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-medium cursor-pointer"
              >
                Trigger Achievement
              </button>
              <AchievementUnlock
                show={showAchievement}
                title="First Steps!"
                description="Complete your first lesson"
                onComplete={() => setShowAchievement(false)}
              />
            </div>
          </section>

          {/* Section: Count Up */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Animated Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  <CountUp end={1250} suffix=" XP" />
                </div>
                <p className="text-sm text-slate-500 mt-1">Total XP</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  <CountUp end={456} />
                </div>
                <p className="text-sm text-slate-500 mt-1">Words Learned</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600">
                  <CountUp end={28} suffix=" days" />
                </div>
                <p className="text-sm text-slate-500 mt-1">Current Streak</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg text-center">
                <div className="text-3xl font-bold text-amber-600">
                  <CountUp end={95} suffix="%" />
                </div>
                <p className="text-sm text-slate-500 mt-1">Accuracy</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
