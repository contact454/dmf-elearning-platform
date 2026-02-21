import express from 'express';
import resourceRoutes from './resources';
import vocabularyRoutes from './vocabulary';
import readingRoutes from './reading';
import listeningRoutes from './listening';
import speakingRoutes from './speaking';
import writingRoutes from './writing';
import hubRoutes from './hub';
import audioRoutes from './audioRoutes';
import reviewRoutes from './review';
import userRoutes from './user';
import analyticsListeningRoutes from './analytics-listening';
import profileRoutes from './profile';
import gamificationRoutes from './gamificationRoutes';
import educationRoutes from './educationRoutes';
import teacherRoutes from './teacherRoutes';
import adminRoutes from './adminRoutes';
import mentorRoutes from './mentorRoutes';
import onboardingRoutes from './onboardingRoutes';
import grammarRoutes from './grammarRoutes';
import socialRoutes from './socialRoutes';
import analyticsRoutes from './analyticsRoutes';
import notificationRoutes from './notificationRoutes';
import assessmentRoutes from './assessmentRoutes';
import adaptiveRoutes from './adaptiveRoutes';
import recommendRoutes from './recommendRoutes';
import agentRoutes from './agentRoutes';
import { routeProtectionMatrix } from './routeProtectionMatrix';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Learning Service is running',
    timestamp: new Date().toISOString()
  });
});

router.get('/route-protection', (req, res) => {
  res.status(200).json({
    success: true,
    data: routeProtectionMatrix,
  });
});

// Mount resource routes (file-based)
router.use('/resources', resourceRoutes);

// Mount vocabulary routes (database-backed)
router.use('/vocabulary', vocabularyRoutes);

// Mount reading routes (Smart Library)
router.use('/reading', readingRoutes);

// Mount listening routes (Listening Lab)
router.use('/listening', listeningRoutes);

// Mount speaking routes (Speaking Studio)
router.use('/speaking', speakingRoutes);

// Mount writing routes (Writing Workshop)
router.use('/writing', writingRoutes);

// Mount hub routes (Learning Hub)
router.use('/hub', hubRoutes);

// Mount audio routes (TTS/Audio generation)
router.use('/audio', audioRoutes);

// Mount review routes (SRS Review System)
router.use('/review', reviewRoutes);

// Mount user routes (User data & streaks)
router.use('/user', userRoutes);

// Mount profile routes (authenticated profile CRUD)
router.use('/profile', profileRoutes);

// Mount analytics routes (Analytics & Statistics)
router.use('/analytics/listening', analyticsListeningRoutes);

// Mount gamification routes (XP, Achievements, Leaderboard)
router.use('/gamification', gamificationRoutes);

// Mount education routes (CEFR, Readiness, Rubric)
router.use('/education', educationRoutes);

// Mount AI routes (AI grading)
router.use('/ai', educationRoutes);

// Mount RBAC-protected role routes (M6)
router.use('/teacher', teacherRoutes);
router.use('/admin', adminRoutes);
router.use('/mentor', mentorRoutes);

// Mount onboarding routes (Placement test, Learning path)
router.use('/onboarding', onboardingRoutes);

// Mount grammar routes (Interactive exercises, TTS)
router.use('/grammar', grammarRoutes);

// Mount social routes (Study groups, Speech recognition)
router.use('/social', socialRoutes);

// Mount analytics routes (Dashboard, tracking, export)
router.use('/analytics', analyticsRoutes);

// Mount notification routes (Push, nudges, preferences)
router.use('/notifications', notificationRoutes);

// Mount assessment routes (Prosody analysis, NPC conversations)
router.use('/assessment', assessmentRoutes);

// Mount adaptive routes (xAPI, CP-SIPP scheduling, student profiles)
router.use('/adaptive', adaptiveRoutes);

// Mount recommendation routes (Embeddings, similarity, personalized)
router.use('/recommend', recommendRoutes);

// Mount agent routes (Socratic Tutor, Early Warning, Admin Concierge)
router.use('/agents', agentRoutes);

export default router;
