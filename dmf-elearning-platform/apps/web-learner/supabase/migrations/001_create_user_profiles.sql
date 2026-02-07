-- ═══════════════════════════════════════════════════════════════
-- DMF E-Learning Platform - User Profiles & Settings Migration
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- User Profiles Table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,

  -- Learning Settings
  current_level TEXT NOT NULL DEFAULT 'A1' CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  target_level TEXT CHECK (target_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  daily_goal_minutes INTEGER DEFAULT 30 CHECK (daily_goal_minutes >= 5 AND daily_goal_minutes <= 180),
  study_reminder_time TIME,

  -- Preferences
  sound_effects BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  preferred_language TEXT DEFAULT 'vi' CHECK (preferred_language IN ('vi', 'en')),

  -- Notification Settings
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  daily_reminder BOOLEAN DEFAULT TRUE,
  weekly_progress BOOLEAN DEFAULT TRUE,
  achievement_notifications BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_level ON public.user_profiles(current_level);

-- ═══════════════════════════════════════════════════════════════
-- User Progress Table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity Tracking
  activity_type TEXT NOT NULL CHECK (activity_type IN ('reading', 'listening', 'writing', 'speaking', 'vocabulary')),
  skill_level TEXT NOT NULL CHECK (skill_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Progress Metrics
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  items_completed INTEGER DEFAULT 0,

  -- Content Reference
  content_id TEXT,
  content_title TEXT,

  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_activity_type ON public.user_progress(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON public.user_progress(completed_at);

-- ═══════════════════════════════════════════════════════════════
-- User Achievements Table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Achievement Details
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,

  -- Metadata
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique ON public.user_achievements(user_id, achievement_id);

-- ═══════════════════════════════════════════════════════════════
-- Vocabulary Lists Table (User's Saved Words)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Vocabulary Data
  german_word TEXT NOT NULL,
  vietnamese_translation TEXT NOT NULL,
  english_translation TEXT,
  word_type TEXT,
  skill_level TEXT CHECK (skill_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Learning Status
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for vocabulary
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_user_id ON public.user_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_skill_level ON public.user_vocabulary(skill_level);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_mastery ON public.user_vocabulary(mastery_level);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Progress Policies
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Achievements Policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Vocabulary Policies
CREATE POLICY "Users can view own vocabulary"
  ON public.user_vocabulary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary"
  ON public.user_vocabulary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary"
  ON public.user_vocabulary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary"
  ON public.user_vocabulary FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Functions & Triggers
-- ═══════════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocabulary_updated_at
  BEFORE UPDATE ON public.user_vocabulary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, current_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'level', 'A1')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- Sample Data for Testing (Optional)
-- ═══════════════════════════════════════════════════════════════

-- Insert sample achievements
INSERT INTO public.user_achievements (id, user_id, achievement_id, achievement_name, achievement_description, achievement_icon)
SELECT
  uuid_generate_v4(),
  id,
  'first_login',
  'Welcome!',
  'Logged in for the first time',
  '👋'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements
  WHERE achievement_id = 'first_login' AND user_id = auth.users.id
);
