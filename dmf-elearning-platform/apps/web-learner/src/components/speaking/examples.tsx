// Speaking Module - Usage Examples
// Copy these examples to your pages/components

import { useState } from 'react';
import {
  AudioRecorder,
  PromptDisplay,
  FeedbackPanel,
  PromptSelector,
  SubmissionHistory,
  ProgressDashboard,
  MobileLayout,
} from '@/components/speaking';
import type { SpeakingPrompt, SpeakingSubmission, SpeakingFeedback } from '@/types/speaking';

// =============================================================================
// EXAMPLE 1: Speaking Practice Page
// =============================================================================

export function SpeakingPracticeExample() {
  const [prompt, setPrompt] = useState<SpeakingPrompt>({
    id: 'prompt-1',
    question: 'Describe your favorite place to visit and explain why you like it.',
    cefrLevel: 'B1',
    topic: 'Travel',
    preparationTimeSeconds: 60,
    speakingTimeSeconds: 120,
    evaluationCriteria: [
      'Clear pronunciation',
      'Natural fluency',
      'Appropriate vocabulary',
      'Grammatical accuracy',
    ],
    tips: [
      'Speak at a natural pace',
      'Use descriptive adjectives',
      'Organize your thoughts before speaking',
    ],
    createdAt: '2026-02-07T00:00:00Z',
  });

  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    console.log('Recording complete:', blob.size, 'bytes', duration, 'seconds');
    
    // Simulate upload and analysis
    // In real app: upload blob to API, poll for results
    setTimeout(() => {
      setFeedback({
        scores: {
          overall: 85,
          pronunciation: 82,
          fluency: 88,
          vocabulary: 84,
          grammar: 86,
        },
        strengths: [
          'Excellent fluency and natural speaking pace',
          'Good use of descriptive vocabulary',
          'Clear organization of ideas',
        ],
        weaknesses: [
          'Pronunciation of "th" sounds needs improvement',
          'Occasional incorrect verb tense usage',
        ],
        suggestions: [
          'Practice dental fricatives (th, v, f)',
          'Review past perfect tense',
          'Record yourself daily for self-assessment',
        ],
        pronunciationDetails: [
          {
            word: 'thought',
            expectedIPA: 'θɔːt',
            actualIPA: 'tɔːt',
            accuracyScore: 65,
            feedback: 'The "th" sound should be a dental fricative, not "t". Place your tongue between your teeth.',
            position: { start: 12.5, end: 13.2 },
          },
          {
            word: 'beautiful',
            expectedIPA: 'ˈbjuːtɪfʊl',
            actualIPA: 'ˈbjuːtəfəl',
            accuracyScore: 88,
            feedback: 'Good pronunciation! Minor improvement: stress the first syllable more.',
            position: { start: 25.3, end: 26.1 },
          },
        ],
        transcription: 'I thought that my favorite place is a beautiful beach...',
        durationSeconds: duration,
      });
    }, 2000);
  };

  return (
    <MobileLayout
      feedbackPanel={
        feedback ? (
          <FeedbackPanel feedback={feedback} />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Complete your recording to see feedback
          </div>
        )
      }
      showFeedbackPanel={!!feedback}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Speaking Practice
        </h1>

        <PromptDisplay
          prompt={prompt}
          onPreparationComplete={() => {
            console.log('Preparation time is up! You can start recording now.');
          }}
          showPreparationTimer={true}
        />

        <AudioRecorder
          maxDurationSeconds={prompt.speakingTimeSeconds}
          onRecordingComplete={handleRecordingComplete}
        />
      </div>
    </MobileLayout>
  );
}

// =============================================================================
// EXAMPLE 2: Prompts Library Page
// =============================================================================

export function PromptsLibraryExample() {
  const [selectedPromptId, setSelectedPromptId] = useState<string | undefined>();

  const samplePrompts: SpeakingPrompt[] = [
    {
      id: 'p1',
      question: 'Describe your favorite hobby and why you enjoy it.',
      cefrLevel: 'A2',
      topic: 'Hobbies',
      preparationTimeSeconds: 30,
      speakingTimeSeconds: 90,
      evaluationCriteria: ['Clear speech', 'Simple vocabulary', 'Basic grammar'],
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'p2',
      question: 'Discuss the advantages and disadvantages of remote work.',
      cefrLevel: 'B2',
      topic: 'Work',
      preparationTimeSeconds: 60,
      speakingTimeSeconds: 150,
      evaluationCriteria: ['Argument structure', 'Advanced vocabulary', 'Complex sentences'],
      createdAt: '2026-02-02T00:00:00Z',
    },
    {
      id: 'p3',
      question: 'What are the main environmental challenges facing your country?',
      cefrLevel: 'C1',
      topic: 'Environment',
      preparationTimeSeconds: 90,
      speakingTimeSeconds: 180,
      evaluationCriteria: ['Sophisticated vocabulary', 'Complex grammar', 'Critical thinking'],
      createdAt: '2026-02-03T00:00:00Z',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Speaking Prompts Library
      </h1>

      <PromptSelector
        prompts={samplePrompts}
        onSelectPrompt={(prompt) => {
          setSelectedPromptId(prompt.id);
          console.log('Selected prompt:', prompt);
          // Navigate to practice page
          // router.push(`/speaking/practice?promptId=${prompt.id}`);
        }}
        selectedPromptId={selectedPromptId}
      />
    </div>
  );
}

// =============================================================================
// EXAMPLE 3: Submission History Page
// =============================================================================

export function SubmissionHistoryExample() {
  const sampleSubmissions: SpeakingSubmission[] = [
    {
      id: 'sub1',
      userId: 'user123',
      promptId: 'p1',
      audioUrl: 'https://example.com/audio/sub1.webm',
      durationSeconds: 85,
      status: 'completed',
      createdAt: '2026-02-05T10:00:00Z',
      updatedAt: '2026-02-05T10:01:00Z',
      prompt: {
        id: 'p1',
        question: 'Describe your favorite hobby.',
        cefrLevel: 'B1',
        topic: 'Hobbies',
        preparationTimeSeconds: 30,
        speakingTimeSeconds: 90,
        evaluationCriteria: [],
        createdAt: '2026-02-01T00:00:00Z',
      },
      feedback: {
        scores: {
          overall: 78,
          pronunciation: 75,
          fluency: 82,
          vocabulary: 77,
          grammar: 79,
        },
        strengths: ['Good fluency'],
        weaknesses: ['Pronunciation issues'],
        suggestions: ['Practice more'],
        pronunciationDetails: [],
        durationSeconds: 85,
      },
    },
    {
      id: 'sub2',
      userId: 'user123',
      promptId: 'p2',
      audioUrl: 'https://example.com/audio/sub2.webm',
      durationSeconds: 145,
      status: 'completed',
      createdAt: '2026-02-06T14:30:00Z',
      updatedAt: '2026-02-06T14:31:00Z',
      prompt: {
        id: 'p2',
        question: 'Discuss remote work advantages.',
        cefrLevel: 'B2',
        topic: 'Work',
        preparationTimeSeconds: 60,
        speakingTimeSeconds: 150,
        evaluationCriteria: [],
        createdAt: '2026-02-02T00:00:00Z',
      },
      feedback: {
        scores: {
          overall: 85,
          pronunciation: 82,
          fluency: 88,
          vocabulary: 84,
          grammar: 86,
        },
        strengths: ['Excellent arguments', 'Natural pace'],
        weaknesses: ['Minor pronunciation errors'],
        suggestions: ['Keep practicing!'],
        pronunciationDetails: [],
        durationSeconds: 145,
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <SubmissionHistory
        submissions={sampleSubmissions}
        onPlayRecording={(url) => {
          const audio = new Audio(url);
          audio.play();
        }}
        onViewFeedback={(submission) => {
          console.log('View feedback for:', submission);
          // Open modal or navigate to detail page
        }}
        onDelete={async (id) => {
          console.log('Delete submission:', id);
          // Call API to delete
        }}
      />
    </div>
  );
}

// =============================================================================
// EXAMPLE 4: Progress Dashboard Page
// =============================================================================

export function ProgressDashboardExample() {
  const sampleStats = {
    totalSubmissions: 45,
    averageOverallScore: 78,
    averagePronunciation: 75,
    averageFluency: 82,
    averageVocabulary: 77,
    averageGrammar: 79,
    mostCommonIssues: [
      'Pronunciation of "th" sounds',
      'Incorrect use of past perfect tense',
      'Overuse of filler words ("um", "uh")',
      'Weak word stress patterns',
    ],
    cefrDistribution: {
      A1: 5,
      A2: 12,
      B1: 18,
      B2: 8,
      C1: 2,
      C2: 0,
    },
    scoreHistory: [
      { date: '2026-01-28', overall: 72 },
      { date: '2026-01-30', overall: 74 },
      { date: '2026-02-01', overall: 75 },
      { date: '2026-02-03', overall: 77 },
      { date: '2026-02-05', overall: 78 },
      { date: '2026-02-06', overall: 80 },
      { date: '2026-02-07', overall: 78 },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ProgressDashboard stats={sampleStats} />
    </div>
  );
}

// =============================================================================
// EXAMPLE 5: Custom Audio Recorder Hook Usage
// =============================================================================

export function CustomRecorderExample() {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  } = useAudioRecorder(120); // 2 minutes max

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Custom Recorder</h2>
      
      <div className="space-y-4">
        <div>Status: {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Idle'}</div>
        <div>Duration: {duration}s</div>
        
        <div className="flex gap-2">
          <button onClick={startRecording} disabled={isRecording}>
            Start
          </button>
          <button onClick={pauseRecording} disabled={!isRecording || isPaused}>
            Pause
          </button>
          <button onClick={resumeRecording} disabled={!isPaused}>
            Resume
          </button>
          <button onClick={stopRecording} disabled={!isRecording}>
            Stop
          </button>
          <button onClick={reset}>Reset</button>
        </div>

        {error && <div className="text-red-500">{error}</div>}
        
        {audioUrl && (
          <audio src={audioUrl} controls className="w-full" />
        )}
      </div>
    </div>
  );
}

// Import the hook
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
