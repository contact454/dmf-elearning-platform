'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  PenTool,
  Clock,
  Send,
  Save,
  Lightbulb,
  CheckCircle2,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Trophy,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  getWritingById,
  getWritingDraft,
  saveWritingDraft,
  submitWriting,
  getWritingSubmissions,
  WritingWithProgress,
  WritingSubmission,
  WritingCorrection,
  WritingSuggestion,
  GermanApiError,
} from '@/services/german-api';
import { LexicalEditor, GrammarError } from '@/components/writing/LexicalEditor';
import { FeedbackPanel } from '@/components/writing/FeedbackPanel';
import { useAutoSave } from '@/hooks/useAutoSave';

const TEMP_USER_ID = 'demo-user-001';

export default function WritingEditorPage() {
  const params = useParams();
  const id = params.id as string;

  // State
  const [prompt, setPrompt] = useState<WritingWithProgress | null>(null);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submissions, setSubmissions] = useState<WritingSubmission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<WritingSubmission | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Mock grammar errors (will be replaced with API call)
  const [grammarErrors] = useState<GrammarError[]>([
    {
      id: '1',
      type: 'grammar',
      offset: 10,
      length: 5,
      message: 'Consider using "gehe" instead of "gehte" (incorrect conjugation)',
      suggestions: ['gehe', 'ging'],
    },
  ]);

  // Writing timer
  const { getElapsedSeconds } = useWritingTimer();

  // Load prompt and draft
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [promptData, draftData, submissionsData] = await Promise.all([
          getWritingById(id, TEMP_USER_ID),
          getWritingDraft(id, TEMP_USER_ID),
          getWritingSubmissions(id, TEMP_USER_ID),
        ]);
        setPrompt(promptData);
        setSubmissions(submissionsData);

        // Load draft content
        if (draftData.content) {
          setContent(draftData.content);
        }
      } catch (err) {
        if (err instanceof GermanApiError) {
          setError(err.message);
        } else {
          setError('Failed to load writing prompt');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Auto-save handler
  const handleSave = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      setSaving(true);
      await saveWritingDraft(id, TEMP_USER_ID, text);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSaving(false);
    }
  }, [id]);

  // Auto-save hook
  const { saveNow } = useAutoSave({
    content,
    essayId: id,
    onSave: handleSave,
    delay: 10000, // 10 seconds
    enabled: !submitting && !currentSubmission,
  });

  // Handle editor changes
  const handleEditorChange = useCallback((text: string, words: number) => {
    setContent(text);
    setWordCount(words);
  }, []);

  // Handle error actions
  const handleApplyError = useCallback((errorId: string, suggestion: string) => {
    console.log('Apply suggestion:', errorId, suggestion);
    // TODO: Implement text replacement
  }, []);

  const handleIgnoreError = useCallback((errorId: string) => {
    console.log('Ignore error:', errorId);
    // TODO: Implement error dismissal
  }, []);

  // Submit writing
  const handleSubmit = async () => {
    if (!content.trim() || !prompt) return;

    // Check minimum words
    if (prompt.minWords > 0 && wordCount < prompt.minWords) {
      alert(`Please write at least ${prompt.minWords} words. Current: ${wordCount} words.`);
      return;
    }

    try {
      setSubmitting(true);
      const timeSpent = getElapsedSeconds();

      const submission = await submitWriting(id, TEMP_USER_ID, {
        content,
        timeSpent,
      });

      setCurrentSubmission(submission);
      setSubmissions(prev => [submission, ...prev]);

      // Clear draft after successful submission
      setContent('');
      setLastSaved(null);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit writing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading writing prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Prompt not found'}</p>
          <Link
            href="/learn/writing"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Writing Workshop
          </Link>
        </div>
      </div>
    );
  }

  const stats = {
    wordCount,
    errorCount: grammarErrors.length,
    writingTime: getElapsedSeconds(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/learn/writing" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-amber-500" />
                  {prompt.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {prompt.level}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>{getCategoryLabel(prompt.category)}</span>
                </div>
              </div>
            </div>

            {/* Save Status */}
            <div className="hidden md:flex items-center gap-4">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              {lastSaved && !saving && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Saved {formatTime(lastSaved)}
                </span>
              )}
              <button
                onClick={() => saveNow()}
                disabled={!content.trim() || saving}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Prompt & Instructions */}
          <div className="lg:col-span-3 space-y-6">
            <PromptInfo prompt={prompt} content={content} />
            
            {showHints && prompt.hints.length > 0 && (
              <HintsSection hints={prompt.hints} onClose={() => setShowHints(false)} />
            )}
            
            {showSample && prompt.sampleResponse && (
              <SampleSection
                sample={prompt.sampleResponse}
                sampleVi={prompt.sampleResponseVi}
                onClose={() => setShowSample(false)}
              />
            )}
          </div>

          {/* Middle Column - Editor */}
          <div className="lg:col-span-6">
            {currentSubmission ? (
              <SubmissionFeedback
                submission={currentSubmission}
                onTryAgain={() => {
                  setCurrentSubmission(null);
                  setContent('');
                }}
                onRevise={() => {
                  setContent(currentSubmission.content);
                  setCurrentSubmission(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <LexicalEditor
                  initialContent={content}
                  onChange={handleEditorChange}
                  errors={grammarErrors}
                  disabled={submitting}
                  placeholder="Start writing your essay in German..."
                />

                {/* Submit Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className={wordCount < (prompt.minWords || 0) ? 'text-red-500 font-medium' : ''}>
                      {wordCount} words
                    </span>
                    {prompt.minWords > 0 && ` / ${prompt.minWords} minimum`}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting || (prompt.minWords > 0 && wordCount < prompt.minWords)}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Feedback Panel (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FeedbackPanel
                errors={grammarErrors}
                stats={stats}
                onApply={handleApplyError}
                onIgnore={handleIgnoreError}
                className="max-h-[calc(100vh-8rem)] rounded-xl"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Feedback Drawer - TODO: Implement MobileFeedbackDrawer component */}
      {/* <MobileFeedbackDrawer
        isOpen={isMobileDrawerOpen}
        onToggle={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      >
        <FeedbackPanel
          errors={grammarErrors}
          stats={stats}
          onApply={handleApplyError}
          onIgnore={handleIgnoreError}
        />
      </MobileFeedbackDrawer> */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function PromptInfo({ prompt, content }: { prompt: WritingWithProgress; content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <h2 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Writing Task
        </h2>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-gray-800 font-medium">{prompt.promptText}</p>
        {prompt.promptTextVi && (
          <p className="text-gray-500 text-sm italic">{prompt.promptTextVi}</p>
        )}

        {/* Requirements */}
        <div className="space-y-2 text-sm">
          {prompt.minWords > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4 text-blue-500" />
              <span>Minimum: <strong>{prompt.minWords} words</strong></span>
            </div>
          )}
          {prompt.estimatedTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>~{Math.round(prompt.estimatedTime / 60)} minutes</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        {prompt.instructions && (
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-700">{prompt.instructions}</p>
          </div>
        )}

        {/* Keywords */}
        {prompt.keywords.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Include these words:</h4>
            <div className="flex flex-wrap gap-2">
              {prompt.keywords.map((keyword) => {
                const isUsed = content.toLowerCase().includes(keyword.toLowerCase());
                return (
                  <span
                    key={keyword}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isUsed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isUsed && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {keyword}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HintsSection({ hints, onClose }: { hints: string[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-yellow-800 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Hints
        </h3>
        <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-2">
        {hints.map((hint, i) => (
          <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
            <span className="text-yellow-500">•</span>
            {hint}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function SampleSection({
  sample,
  sampleVi,
  onClose,
}: {
  sample: string;
  sampleVi?: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-green-50 rounded-xl p-4 border border-green-200"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-green-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Sample Answer
        </h3>
        <button onClick={onClose} className="text-green-600 hover:text-green-800">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <p className="text-green-800 whitespace-pre-wrap mb-2">{sample}</p>
      {sampleVi && <p className="text-green-600 text-sm italic">{sampleVi}</p>}
    </motion.div>
  );
}

function SubmissionFeedback({
  submission,
  onTryAgain,
  onRevise,
}: {
  submission: WritingSubmission;
  onTryAgain: () => void;
  onRevise: () => void;
}) {
  // Using existing feedback component from original file
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Submitted Successfully!
        </h2>
        <p className="text-gray-600">
          Your writing has been submitted for review. Check back later for feedback.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={onRevise}
            className="px-6 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50"
          >
            Revise This
          </button>
          <button
            onClick={onTryAgain}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Write New Response
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    free_writing: 'Free Writing',
    fill_blank: 'Fill in the Blank',
    sentence_construction: 'Sentence Building',
    correction: 'Error Correction',
    essay: 'Essay',
  };
  return labels[category] || category;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
