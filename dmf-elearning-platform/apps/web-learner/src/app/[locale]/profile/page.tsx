'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Bell,
  Settings,
  LogOut,
  Camera,
  Save,
  X,
  BookOpen,
  Volume2,
  Moon,
  Sun,
  Globe,
  Shield,
  Smartphone,
  AlertCircle,
  Check,
  Trophy,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type Tab = 'account' | 'preferences' | 'notifications' | 'security';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
}

interface PreferencesData {
  targetLevel: string;
  dailyGoal: number;
  studyReminder: string;
  soundEffects: boolean;
  darkMode: boolean;
  language: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  dailyReminder: boolean;
  weeklyProgress: boolean;
  achievements: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function ProfilePage() {
  const { user, supabaseUser, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    targetLevel: user?.level || 'A1',
    dailyGoal: 30,
    studyReminder: '19:00',
    soundEffects: true,
    darkMode: false,
    language: 'vi',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    dailyReminder: true,
    weeklyProgress: true,
    achievements: true,
  });

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name: profileForm.name });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const tabs = [
    { id: 'account' as Tab, name: 'Account Settings', icon: User },
    { id: 'preferences' as Tab, name: 'Learning Preferences', icon: BookOpen },
    { id: 'notifications' as Tab, name: 'Notifications', icon: Bell },
    { id: 'security' as Tab, name: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-outfit">
                  Profile Settings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <Link
              href="/learn/hub"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium cursor-pointer"
            >
              Back to Learning
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg z-50"
            >
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Profile updated successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 shadow-lg"
            >
              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border-2 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-600 transition cursor-pointer"
                  aria-label="Change avatar"
                >
                  <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 font-outfit">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-inter">
                  {user.email}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  Level {user.level}
                </span>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium font-inter">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/profile/achievements"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:shadow-lg transition cursor-pointer group"
                >
                  <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold font-inter">My Achievements</span>
                  <Sparkles className="w-4 h-4 ml-auto opacity-70" />
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium font-inter">Sign Out</span>
              </button>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 shadow-lg"
            >
              {/* Account Settings */}
              {activeTab === 'account' && (
                <AccountSettings
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isSaving={isSaving}
                  handleSaveProfile={handleSaveProfile}
                />
              )}

              {/* Learning Preferences */}
              {activeTab === 'preferences' && (
                <LearningPreferences
                  preferences={preferences}
                  setPreferences={setPreferences}
                />
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <NotificationSettings
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              )}

              {/* Security */}
              {activeTab === 'security' && <SecuritySettings />}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Tab Components
// ═══════════════════════════════════════════════════════════════

function AccountSettings({
  profileForm,
  setProfileForm,
  isEditing,
  setIsEditing,
  isSaving,
  handleSaveProfile,
}: {
  profileForm: ProfileFormData;
  setProfileForm: (data: ProfileFormData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSaving: boolean;
  handleSaveProfile: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">
          Account Information
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={profileForm.name}
            onChange={(e) =>
              setProfileForm({ ...profileForm, name: e.target.value })
            }
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={profileForm.email}
            disabled
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-inter">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter"
          >
            Bio (Optional)
          </label>
          <textarea
            id="bio"
            rows={4}
            value={profileForm.bio}
            onChange={(e) =>
              setProfileForm({ ...profileForm, bio: e.target.value })
            }
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition resize-none"
            placeholder="Tell us about yourself and your German learning goals..."
          />
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LearningPreferences({
  preferences,
  setPreferences,
}: {
  preferences: PreferencesData;
  setPreferences: (data: PreferencesData) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 font-outfit">
        Learning Preferences
      </h3>

      <div className="space-y-6">
        {/* Target Level */}
        <div>
          <label
            htmlFor="targetLevel"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter"
          >
            Target CEFR Level
          </label>
          <select
            id="targetLevel"
            value={preferences.targetLevel}
            onChange={(e) =>
              setPreferences({ ...preferences, targetLevel: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficiency</option>
          </select>
        </div>

        {/* Daily Goal */}
        <div>
          <label
            htmlFor="dailyGoal"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter"
          >
            Daily Goal (minutes)
          </label>
          <input
            id="dailyGoal"
            type="number"
            min="5"
            max="180"
            step="5"
            value={preferences.dailyGoal}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                dailyGoal: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Study Reminder */}
        <div>
          <label
            htmlFor="studyReminder"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter"
          >
            Daily Study Reminder
          </label>
          <input
            id="studyReminder"
            type="time"
            value={preferences.studyReminder}
            onChange={(e) =>
              setPreferences({ ...preferences, studyReminder: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Toggle Settings */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ToggleSetting
            icon={<Volume2 className="w-5 h-5" />}
            label="Sound Effects"
            description="Play sounds for correct answers and achievements"
            checked={preferences.soundEffects}
            onChange={(checked) =>
              setPreferences({ ...preferences, soundEffects: checked })
            }
          />
          <ToggleSetting
            icon={<Moon className="w-5 h-5" />}
            label="Dark Mode"
            description="Use dark theme for better night reading"
            checked={preferences.darkMode}
            onChange={(checked) =>
              setPreferences({ ...preferences, darkMode: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({
  notifications,
  setNotifications,
}: {
  notifications: NotificationSettings;
  setNotifications: (data: NotificationSettings) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 font-outfit">
        Notification Preferences
      </h3>

      <div className="space-y-4">
        <ToggleSetting
          icon={<Mail className="w-5 h-5" />}
          label="Email Notifications"
          description="Receive updates and tips via email"
          checked={notifications.email}
          onChange={(checked) =>
            setNotifications({ ...notifications, email: checked })
          }
        />
        <ToggleSetting
          icon={<Smartphone className="w-5 h-5" />}
          label="Push Notifications"
          description="Get real-time alerts on your device"
          checked={notifications.push}
          onChange={(checked) =>
            setNotifications({ ...notifications, push: checked })
          }
        />
        <ToggleSetting
          icon={<Bell className="w-5 h-5" />}
          label="Daily Reminder"
          description="Remind me to practice every day"
          checked={notifications.dailyReminder}
          onChange={(checked) =>
            setNotifications({ ...notifications, dailyReminder: checked })
          }
        />
        <ToggleSetting
          icon={<BookOpen className="w-5 h-5" />}
          label="Weekly Progress Report"
          description="Summary of your learning progress"
          checked={notifications.weeklyProgress}
          onChange={(checked) =>
            setNotifications({ ...notifications, weeklyProgress: checked })
          }
        />
        <ToggleSetting
          icon={<AlertCircle className="w-5 h-5" />}
          label="Achievement Unlocked"
          description="Celebrate when you earn badges"
          checked={notifications.achievements}
          onChange={(checked) =>
            setNotifications({ ...notifications, achievements: checked })
          }
        />
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 font-outfit">
        Security Settings
      </h3>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 font-inter">
                Change Password
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-inter">
                Update your password to keep your account secure
              </p>
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 font-inter">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-inter">
                Add an extra layer of security to your account
              </p>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-300 mb-1 font-inter">
                Delete Account
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3 font-inter">
                Permanently delete your account and all associated data
              </p>
              <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition cursor-pointer">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════

function ToggleSetting({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
      <div className="text-gray-600 dark:text-gray-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 font-inter">
          {label}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
          checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
