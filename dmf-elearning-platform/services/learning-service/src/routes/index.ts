import express from 'express';
import resourceRoutes from './resources';
import vocabularyRoutes from './vocabulary';
import readingRoutes from './reading';
import listeningRoutes from './listening';
import speakingRoutes from './speaking';
import writingRoutes from './writing';
import hubRoutes from './hub';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Learning Service is running',
    timestamp: new Date().toISOString()
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

export default router;
