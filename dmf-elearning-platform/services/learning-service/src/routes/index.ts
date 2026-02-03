import express from 'express';
import resourceRoutes from './resources';
import vocabularyRoutes from './vocabulary';
import readingRoutes from './reading';
import listeningRoutes from './listening';

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

export default router;
