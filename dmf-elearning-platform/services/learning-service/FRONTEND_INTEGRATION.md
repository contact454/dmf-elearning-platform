# Frontend Integration Guide - Audio Service

## Quick Start

The audio service is **ready to use**! Here's how to integrate it into the frontend.

## 1. Basic Usage (Simplest)

```typescript
// In any React component
async function playWordAudio(wordId: string, word: string) {
  try {
    const res = await fetch(`/api/audio/${wordId}`);
    const { data } = await res.json();
    
    if (data.audioUrl) {
      // Play backend audio
      const audio = new Audio(data.audioUrl);
      await audio.play();
    } else {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8; // Slower for learning
      speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
}
```

## 2. React Hook (Recommended)

Create `hooks/useAudio.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

interface AudioData {
  wordId: string;
  word: string;
  audioUrl: string | null;
  cached: boolean;
  fallbackRequired: boolean;
}

export function useAudio(wordId: string, word: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Fetch audio URL from backend
  const { data, isLoading, error } = useQuery<{ success: boolean; data: AudioData }>({
    queryKey: ['audio', wordId],
    queryFn: async () => {
      const res = await fetch(`/api/audio/${wordId}`);
      if (!res.ok) throw new Error('Failed to fetch audio');
      return res.json();
    },
    staleTime: Infinity, // Audio URLs never change
    retry: 1,
  });

  // Play with browser Web Speech API
  const playWithWebSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'de-DE';
    utterance.rate = 0.8; // Slower for learning
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  }, [word]);

  // Play audio (backend or fallback)
  const play = useCallback(() => {
    const audioUrl = data?.data?.audioUrl;
    
    if (audioUrl) {
      // Use backend audio (high quality)
      const audio = new Audio(audioUrl);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error('Audio playback failed, using fallback');
        setIsPlaying(false);
        playWithWebSpeech(); // Fallback on error
      };
      audio.play().catch(() => playWithWebSpeech());
    } else {
      // Use Web Speech API fallback
      playWithWebSpeech();
    }
  }, [data, playWithWebSpeech]);

  return {
    play,
    isPlaying,
    isLoading,
    hasBackendAudio: !!data?.data?.audioUrl,
    error,
  };
}
```

## 3. Component Integration

### Flashcard Component

```typescript
import { useAudio } from '@/hooks/useAudio';

interface FlashcardProps {
  word: {
    id: string;
    word: string;
    translation: string;
  };
}

export function Flashcard({ word }: FlashcardProps) {
  const { play, isPlaying, isLoading } = useAudio(word.id, word.word);

  return (
    <div className="flashcard">
      <h2>{word.word}</h2>
      <p>{word.translation}</p>
      
      <button
        onClick={play}
        disabled={isPlaying || isLoading}
        className="audio-button"
      >
        {isPlaying ? '🔊 Playing...' : '🔊 Play Audio'}
      </button>
    </div>
  );
}
```

### Vocabulary List Item

```typescript
export function VocabularyItem({ word }: { word: VocabWord }) {
  const { play, isPlaying } = useAudio(word.id, word.word);

  return (
    <li className="vocab-item">
      <span className="word">{word.word}</span>
      <span className="translation">{word.meaning_vi}</span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          play();
        }}
        className="icon-button"
        title="Pronunciation"
      >
        {isPlaying ? '⏸️' : '🔊'}
      </button>
    </li>
  );
}
```

### Auto-play on Card Flip

```typescript
export function ReviewSession({ words }: { words: VocabWord[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentWord = words[currentIndex];
  const { play } = useAudio(currentWord.id, currentWord.word);

  // Auto-play when card appears
  useEffect(() => {
    const timer = setTimeout(() => play(), 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [currentIndex, play]);

  return (
    <div className="review-session">
      <Flashcard word={currentWord} />
      {/* ... review buttons ... */}
    </div>
  );
}
```

## 4. Styling Examples

```css
/* Audio button - minimal */
.audio-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.audio-button:hover {
  transform: scale(1.1);
}

.audio-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Audio button - with background */
.audio-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.audio-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.audio-btn:active {
  transform: translateY(0);
}
```

## 5. Advanced Features

### Pronunciation Practice Mode

```typescript
export function PronunciationPractice({ word }: { word: VocabWord }) {
  const { play, isPlaying } = useAudio(word.id, word.word);
  const [playCount, setPlayCount] = useState(0);

  const handlePlay = () => {
    play();
    setPlayCount(prev => prev + 1);
  };

  return (
    <div className="pronunciation-practice">
      <h3>Listen and Repeat</h3>
      <p className="word">{word.word}</p>
      
      <button onClick={handlePlay} disabled={isPlaying}>
        🔊 Listen ({playCount}/3)
      </button>
      
      <p className="hint">
        Try to pronounce it yourself, then play again to check!
      </p>
    </div>
  );
}
```

### Slow Speed Playback

```typescript
// For Web Speech API fallback, adjust speed
const playSlowly = useCallback(() => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'de-DE';
  utterance.rate = 0.5; // Very slow
  speechSynthesis.speak(utterance);
}, [word]);
```

## 6. Error Handling

```typescript
export function AudioButton({ wordId, word }: { wordId: string; word: string }) {
  const { play, isPlaying, error } = useAudio(wordId, word);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      <button onClick={play} disabled={isPlaying}>
        {isPlaying ? '⏸️' : '🔊'}
      </button>
      
      {showError && (
        <div className="error-toast">
          Audio unavailable, using fallback
        </div>
      )}
    </>
  );
}
```

## 7. Batch Prefetch (Optional)

For better UX, prefetch audio for upcoming words:

```typescript
export function ReviewQueue({ words }: { words: VocabWord[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Prefetch next 3 words
  useQuery({
    queryKey: ['audio-prefetch', currentIndex],
    queryFn: async () => {
      const nextWords = words.slice(currentIndex + 1, currentIndex + 4);
      await Promise.all(
        nextWords.map(w => fetch(`/api/audio/${w.id}`))
      );
      return true;
    },
    staleTime: Infinity,
  });

  // ... render current word ...
}
```

## 8. Testing

```typescript
// In your component tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

test('plays audio when button clicked', async () => {
  const queryClient = new QueryClient();
  
  render(
    <QueryClientProvider client={queryClient}>
      <Flashcard word={{ id: '1', word: 'Hallo', translation: 'Hello' }} />
    </QueryClientProvider>
  );

  const audioBtn = screen.getByText(/Play Audio/i);
  fireEvent.click(audioBtn);

  await waitFor(() => {
    expect(screen.getByText(/Playing/i)).toBeInTheDocument();
  });
});
```

## 9. Performance Tips

- ✅ **Cache aggressively** - Audio URLs never change
- ✅ **Lazy load** - Only fetch when needed
- ✅ **Prefetch sparingly** - Only next 2-3 words
- ✅ **Use memo** - Memoize play callbacks
- ✅ **Cleanup** - Stop audio on unmount

```typescript
useEffect(() => {
  return () => {
    // Cleanup audio on unmount
    speechSynthesis.cancel();
  };
}, []);
```

## 10. API Reference

### GET /api/audio/:wordId

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "wordId": "clw123abc",
    "word": "Hallo",
    "audioUrl": "data:audio/mp3;base64,...",
    "cached": true,
    "fallbackRequired": false
  }
}
```

**Response (Fallback Required):**
```json
{
  "success": true,
  "data": {
    "wordId": "clw123abc",
    "word": "Hallo",
    "audioUrl": null,
    "cached": false,
    "fallbackRequired": true
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "WORD_NOT_FOUND",
    "message": "Word not found"
  }
}
```

---

## ✅ Checklist for Frontend Dev

- [ ] Create `hooks/useAudio.ts`
- [ ] Add audio button to flashcard component
- [ ] Add audio button to vocabulary list
- [ ] Implement auto-play on review
- [ ] Style audio buttons
- [ ] Test with and without API key
- [ ] Test fallback behavior
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test on mobile devices

---

## 🚀 Ready to Go!

The backend is **fully functional** with comprehensive fallback support. Start with the basic implementation and enhance gradually!

**Questions?** Check `AUDIO_SERVICE.md` for full documentation.
