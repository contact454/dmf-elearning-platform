import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { analysisLimiter } from '../middleware/rateLimiter';
import { SpeechAnalysisService } from '../services/speechAnalysisService';
import { SubmissionService } from '../services/submissionService';
import { AuthRequest } from '../types';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const speechAnalysisService = new SpeechAnalysisService();
const submissionService = new SubmissionService();

// Configure multer for audio uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads/audio';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10')) * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const transcriptSchema = z.object({
  audioUrl: z.string().url().optional(),
});

const analyzeSpeechSchema = z.object({
  submissionId: z.string().uuid(),
});

// POST /api/analyze/transcript - Get transcript from audio
router.post('/transcript', analysisLimiter, upload.single('audio'), async (req: AuthRequest, res) => {
  try {
    let audioPath: string;
    let cleanup = false;

    // Handle uploaded file or URL
    if (req.file) {
      audioPath = req.file.path;
      cleanup = true;
    } else if (req.body.audioUrl) {
      // For now, require file upload. URL support can be added later.
      return res.status(400).json({ error: 'Please upload an audio file' });
    } else {
      return res.status(400).json({ error: 'Audio file or URL required' });
    }

    const result = await speechAnalysisService.transcribeAudio(audioPath);

    // Cleanup temporary file
    if (cleanup && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/analyze/speech - Analyze submission and provide feedback
router.post('/speech', analysisLimiter, async (req: AuthRequest, res) => {
  try {
    const validation = analyzeSpeechSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { submissionId } = validation.data;
    const userId = req.userId!;

    // Get submission (with ownership check)
    const submission = await submissionService.getSubmission(submissionId, userId);

    if (submission.status === 'analyzed') {
      return res.status(400).json({ error: 'Submission already analyzed' });
    }

    // Update status to analyzing
    await submissionService.updateSubmissionAnalysis(submissionId, {
      transcriptText: '',
      overallScore: 0,
      pronunciationScore: 0,
      fluencyScore: 0,
      vocabularyScore: 0,
      grammarScore: 0,
      aiFeedback: {},
    });

    // For file-based audio, we need the actual file
    // In production, this would fetch from cloud storage (S3, etc.)
    // For now, assume audioUrl is a local path or we need to download it
    
    // Simplified: require that audio was already transcribed
    if (!submission.transcriptText) {
      return res.status(400).json({ 
        error: 'Please transcribe the audio first using /api/analyze/transcript' 
      });
    }

    // Analyze the transcript
    const analysis = await speechAnalysisService.analyzeSpeech(
      submission.transcriptText,
      submission.prompt.questionText,
      submission.prompt.cefrLevel
    );

    // Get pronunciation feedback
    const pronunciationFeedback = await speechAnalysisService.analyzePronunciation(
      submission.transcriptText,
      submission.prompt.cefrLevel
    );

    // Update submission with results
    const updatedSubmission = await submissionService.updateSubmissionAnalysis(
      submissionId,
      {
        ...analysis,
        pronunciationFeedback,
      }
    );

    return res.json(updatedSubmission);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
