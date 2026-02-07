# Tech Detective Report: Audio Comprehension Technology

**Date:** February 6, 2026  
**Analyst:** Tech Detective  
**Focus:** Technical Implementation of Listening/Audio Features

---

## Executive Summary

This report analyzes the technical infrastructure required to build robust listening comprehension features for language learning platforms. Modern audio learning systems rely on three core technology pillars: **speech recognition**, **audio processing**, and **pronunciation feedback**.

The landscape has matured significantly with browser-native APIs (Web Speech API, Web Audio API) now capable of handling most use cases, while cloud services (Google Cloud Speech-to-Text, Azure Speech) provide superior accuracy for production applications. Open-source alternatives like Whisper (OpenAI) offer offline capabilities and cost efficiency for resource-constrained projects.

For DMF's listening module, the recommended approach is a **hybrid architecture**: Web Audio API for playback/visualization, Web Speech API for basic speech recognition with fallback to cloud services for advanced features, and a custom phoneme analysis system for pronunciation feedback. This balances cost, performance, and user experience.

---

## Technology Stack Analysis

### Speech Recognition

#### 1. Web Speech API (Browser-Native)

**Overview:**
- Built into Chrome, Edge, Safari (limited)
- Client-side speech-to-text processing
- Free, no API costs

**Capabilities:**
- Real-time speech recognition
- Multiple language support (50+ languages)
- Continuous and interim results
- Language confidence scores

**Limitations:**
- Requires internet connection (uses Google's servers)
- Browser compatibility varies (Chrome best)
- Limited customization of language models
- No offline mode
- Privacy concerns (data sent to cloud)

**Code Example:**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = true;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  const confidence = event.results[0][0].confidence;
  // Compare to expected answer
};

recognition.start();
```

**Best For:**
- Quick prototyping
- Budget-conscious projects
- Basic dictation exercises
- Non-production environments

---

#### 2. Google Cloud Speech-to-Text

**Overview:**
- Industry-leading accuracy (~95% for clear speech)
- Supports 125+ languages and variants
- Advanced features (word-level timestamps, profanity filtering)

**Capabilities:**
- Streaming recognition (real-time)
- Batch processing (audio files)
- Enhanced models for phone calls, videos
- Automatic punctuation and capitalization
- Speaker diarization (identify different speakers)
- Word-level confidence scores
- Custom vocabulary and phrase hints

**Pricing (2026):**
- Standard: $0.006 per 15 seconds (~$1.44/hour)
- Enhanced: $0.009 per 15 seconds (~$2.16/hour)
- First 60 minutes/month free

**Integration:**
```javascript
// Node.js backend
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const audio = { content: audioBuffer };
const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
  enableWordTimeOffsets: true,
  enableAutomaticPunctuation: true
};

const [response] = await client.recognize({ audio, config });
const transcription = response.results
  .map(result => result.alternatives[0].transcript)
  .join('\n');
```

**Best For:**
- Production applications
- High accuracy requirements
- Multi-language support
- Advanced features (timestamps, speaker separation)

---

#### 3. Azure Speech Services (Microsoft)

**Overview:**
- Comparable accuracy to Google (~94%)
- Strong neural TTS (text-to-speech) integration
- Custom speech models available

**Capabilities:**
- Real-time speech-to-text
- Pronunciation assessment (ideal for language learning!)
- Custom vocabulary
- Intent recognition integration
- Neural TTS with SSML support
- Speaker recognition

**Unique for Language Learning:**
- **Pronunciation Assessment**: Scores accuracy, fluency, completeness, prosody
- Returns phoneme-level feedback
- Mispronunciation detection

**Pricing:**
- Standard: $1 per hour
- Neural voices: $16 per 1M characters
- First 5 audio hours free/month

**Pronunciation Assessment Example:**
```javascript
const sdk = require('microsoft-cognitiveservices-speech-sdk');

const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
  referenceText,
  sdk.PronunciationAssessmentGradingSystem.HundredMark,
  sdk.PronunciationAssessmentGranularity.Phoneme
);

recognizer.recognizeOnceAsync(result => {
  const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);
  console.log('Accuracy:', pronunciationResult.accuracyScore);
  console.log('Fluency:', pronunciationResult.fluencyScore);
  console.log('Completeness:', pronunciationResult.completenessScore);
  
  // Phoneme-level details
  result.properties.words.forEach(word => {
    console.log(`${word.word}: ${word.accuracyScore}`);
  });
});
```

**Best For:**
- Pronunciation-focused apps
- Microsoft Azure ecosystem
- Need for detailed phoneme feedback

---

#### 4. Whisper (OpenAI) - Open Source

**Overview:**
- State-of-the-art open-source model
- Multilingual (99 languages)
- Runs locally (offline capable)

**Capabilities:**
- Extremely high accuracy (rivals paid services)
- Automatic language detection
- Translation to English
- Multiple model sizes (tiny → large)
- No usage costs (self-hosted)

**Model Sizes:**

| Model | Parameters | Speed | Accuracy | Use Case |
|-------|-----------|-------|----------|----------|
| Tiny | 39M | ~32x realtime | Good | Mobile apps |
| Base | 74M | ~16x realtime | Better | Quick processing |
| Small | 244M | ~6x realtime | Strong | Balanced |
| Medium | 769M | ~2x realtime | Very Strong | High accuracy |
| Large | 1550M | ~1x realtime | Best | Production |

**Implementation:**
```python
# Python backend
import whisper

model = whisper.load_model("base")
result = model.transcribe("audio.mp3", language="en")

print(result["text"])
print(result["segments"])  # Word-level timestamps
```

**Best For:**
- Privacy-sensitive applications
- Offline functionality
- Cost-sensitive projects
- Full control over models

---

### Audio Processing

#### 1. Web Audio API

**Overview:**
- Browser-native audio processing
- Real-time manipulation and analysis
- Zero external dependencies

**Core Capabilities:**

**A. Playback Control:**
```javascript
const audioContext = new AudioContext();
const source = audioContext.createBufferSource();

// Load audio
fetch('audio.mp3')
  .then(res => res.arrayBuffer())
  .then(buffer => audioContext.decodeAudioData(buffer))
  .then(audioBuffer => {
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    // Speed control (without pitch change requires additional processing)
    source.playbackRate.value = 0.75; // 75% speed
    
    source.start(0);
  });
```

**B. Waveform Visualization:**
```javascript
const analyser = audioContext.createAnalyser();
source.connect(analyser);
analyser.connect(audioContext.destination);

const dataArray = new Uint8Array(analyser.frequencyBinCount);

function draw() {
  analyser.getByteTimeDomainData(dataArray);
  
  // Draw waveform on canvas
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;
    // ... canvas drawing code
  }
  
  requestAnimationFrame(draw);
}
```

**C. Audio Effects:**
```javascript
// Equalization
const filter = audioContext.createBiquadFilter();
filter.type = 'lowshelf';
filter.frequency.value = 1000;
filter.gain.value = 25;

// Compression (normalize volume)
const compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -50;
compressor.knee.value = 40;

// Chain: source → filter → compressor → destination
source.connect(filter);
filter.connect(compressor);
compressor.connect(audioContext.destination);
```

**Best For:**
- Custom audio players
- Real-time audio visualization
- Client-side audio processing
- Interactive audio experiences

---

#### 2. Howler.js (Library)

**Overview:**
- High-level audio library built on Web Audio API
- Cross-browser compatibility layer
- Simpler API than raw Web Audio

**Key Features:**
```javascript
const sound = new Howl({
  src: ['audio.mp3'],
  html5: true, // Stream instead of download
  rate: 0.75, // Playback speed
  onend: function() {
    console.log('Finished!');
  }
});

sound.play();
sound.pause();
sound.seek(10); // Jump to 10 seconds
sound.rate(1.5); // Change speed
```

**Advantages:**
- Sprite support (multiple sounds in one file)
- Automatic caching
- Fade in/out
- 3D spatial audio
- Mobile-optimized

**Best For:**
- Standard audio playback needs
- Quick implementation
- Cross-browser consistency

---

#### 3. WaveSurfer.js (Visualization)

**Overview:**
- Advanced waveform visualization
- Interactive audio timeline
- Region selection and markers

**Implementation:**
```javascript
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'violet',
  progressColor: 'purple',
  backend: 'WebAudio',
  height: 128,
  normalize: true,
  responsive: true
});

wavesurfer.load('audio.mp3');

// Interactive features
wavesurfer.addRegion({
  start: 5,
  end: 10,
  color: 'rgba(0, 123, 255, 0.1)',
  drag: false,
  resize: false
});

wavesurfer.on('region-click', (region) => {
  region.play(); // Play selected section
});
```

**Plugins:**
- Timeline (show time markers)
- Regions (highlight sections)
- Minimap (overview + detail view)
- Spectrogram (frequency visualization)

**Best For:**
- Interactive audio transcription
- Word-level highlighting
- Audio editing interfaces
- Detailed audio exploration

---

### Pronunciation Feedback

#### 1. Phoneme Analysis Approaches

**A. Edit Distance (Levenshtein)**
- Compare expected transcript to spoken transcript
- Calculate character-level difference
- Simple but effective for basic feedback

```javascript
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

const expected = "hello world";
const spoken = "helo world";
const distance = levenshteinDistance(expected, spoken);
const accuracy = 1 - (distance / expected.length);
// accuracy = 0.91 (91%)
```

**B. Azure Pronunciation Assessment** (recommended)
- Production-ready phoneme analysis
- Returns scores for:
  - **Accuracy**: Phoneme correctness
  - **Fluency**: Naturalness of speech
  - **Completeness**: How much was spoken
  - **Prosody**: Intonation and rhythm

**C. Custom Phoneme Matching**
- Use IPA (International Phonetic Alphabet) mappings
- Compare expected vs. actual phonemes
- Highlight specific pronunciation errors

```javascript
// Simplified example
const phoneticMap = {
  'th': /[tθð]/,
  'r': /[ɹɻ]/,
  'v': /[vw]/ // Common confusion for some learners
};

function analyzePronunciation(expected, spoken, language) {
  const errors = [];
  
  // Convert to phonemes (would use actual phonetic library)
  const expectedPhonemes = textToPhonemes(expected, language);
  const spokenPhonemes = textToPhonemes(spoken, language);
  
  // Compare phoneme by phoneme
  for (let i = 0; i < expectedPhonemes.length; i++) {
    if (expectedPhonemes[i] !== spokenPhonemes[i]) {
      errors.push({
        position: i,
        expected: expectedPhonemes[i],
        spoken: spokenPhonemes[i],
        suggestion: getPhonemeHelp(expectedPhonemes[i])
      });
    }
  }
  
  return errors;
}
```

---

#### 2. Scoring Algorithms

**Simple Percentage Match:**
```javascript
function scoreTranscript(expected, spoken) {
  const expectedWords = expected.toLowerCase().split(' ');
  const spokenWords = spoken.toLowerCase().split(' ');
  
  const correct = expectedWords.filter((word, i) => 
    word === spokenWords[i]
  ).length;
  
  return (correct / expectedWords.length) * 100;
}
```

**Weighted Scoring:**
```javascript
function advancedScore(expected, spoken, confidence) {
  const transcriptMatch = scoreTranscript(expected, spoken);
  const confidenceScore = confidence * 100;
  
  // Weight: 70% accuracy, 30% confidence
  return (transcriptMatch * 0.7) + (confidenceScore * 0.3);
}
```

**Azure-style Multi-dimensional:**
```javascript
function comprehensiveScore(result) {
  return {
    overall: (
      result.accuracy * 0.4 +
      result.fluency * 0.3 +
      result.completeness * 0.2 +
      result.prosody * 0.1
    ),
    breakdown: {
      accuracy: result.accuracy,
      fluency: result.fluency,
      completeness: result.completeness,
      prosody: result.prosody
    },
    grade: getGrade(result.overall),
    feedback: generateFeedback(result)
  };
}
```

---

### Integration Patterns

#### 1. Frontend Architecture (React)

```typescript
// Audio player hook
function useAudioPlayer(audioUrl: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const audioRef = useRef(new Howl({
    src: [audioUrl],
    html5: true,
    onload: () => setDuration(audioRef.current.duration()),
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    onend: () => setIsPlaying(false)
  }));
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(audioRef.current.seek());
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  const controls = {
    play: () => audioRef.current.play(),
    pause: () => audioRef.current.pause(),
    seek: (time: number) => audioRef.current.seek(time),
    setSpeed: (rate: number) => {
      setPlaybackRate(rate);
      audioRef.current.rate(rate);
    }
  };
  
  return { isPlaying, currentTime, duration, playbackRate, controls };
}
```

```tsx
// Speech recognition hook
function useSpeechRecognition(expectedText: string, language: string) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(null);
  
  const recognition = useRef(null);
  
  useEffect(() => {
    recognition.current = new webkitSpeechRecognition();
    recognition.current.lang = language;
    recognition.current.continuous = false;
    recognition.current.interimResults = true;
    
    recognition.current.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      const transcript = current[0].transcript;
      
      setTranscript(transcript);
      
      if (current.isFinal) {
        const confidence = current[0].confidence;
        const calculatedScore = advancedScore(expectedText, transcript, confidence);
        setScore(calculatedScore);
        setIsListening(false);
      }
    };
    
    recognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    return () => recognition.current?.stop();
  }, [expectedText, language]);
  
  const startListening = () => {
    setTranscript('');
    setScore(null);
    setIsListening(true);
    recognition.current.start();
  };
  
  const stopListening = () => {
    recognition.current.stop();
    setIsListening(false);
  };
  
  return { transcript, isListening, score, startListening, stopListening };
}
```

---

#### 2. Backend API Architecture

**Audio Storage:**
```javascript
// Express.js + AWS S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

app.post('/api/audio/upload', upload.single('audio'), async (req, res) => {
  const params = {
    Bucket: 'dmf-audio-exercises',
    Key: `${req.body.exerciseId}/${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  
  res.json({ url: result.Location });
});
```

**Speech Recognition Endpoint:**
```javascript
app.post('/api/speech/analyze', async (req, res) => {
  const { audioBuffer, expectedText, language } = req.body;
  
  // Use Google Cloud Speech-to-Text
  const [response] = await speechClient.recognize({
    audio: { content: audioBuffer },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: language,
      enableWordTimeOffsets: true
    }
  });
  
  const transcript = response.results[0]?.alternatives[0]?.transcript || '';
  const confidence = response.results[0]?.alternatives[0]?.confidence || 0;
  
  const analysis = {
    transcript,
    confidence,
    score: advancedScore(expectedText, transcript, confidence),
    wordDetails: response.results[0]?.alternatives[0]?.words || []
  };
  
  res.json(analysis);
});
```

---

#### 3. Caching Strategies

**Audio File Caching:**
```javascript
// Service Worker for offline audio
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/audio/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response; // Serve from cache
        }
        
        return fetch(event.request).then((response) => {
          // Cache for future use
          const responseClone = response.clone();
          caches.open('audio-cache-v1').then((cache) => {
            cache.put(event.request, responseClone);
          });
          
          return response;
        });
      })
    );
  }
});
```

**Speech Recognition Results:**
```javascript
// Cache recognition results to avoid re-processing
const cache = new Map();

async function getCachedRecognition(audioHash) {
  if (cache.has(audioHash)) {
    return cache.get(audioHash);
  }
  
  const result = await performSpeechRecognition();
  cache.set(audioHash, result);
  
  return result;
}
```

---

#### 4. Offline Capabilities

**Strategy:**
- Download audio files for lessons during install/onboarding
- Use IndexedDB for audio blob storage
- Fallback recognition: Web Speech API (requires internet) → inform user

```javascript
// IndexedDB audio storage
const dbPromise = idb.openDB('audio-store', 1, {
  upgrade(db) {
    db.createObjectStore('audio-files');
  }
});

async function cacheAudioLesson(lessonId, audioBlob) {
  const db = await dbPromise;
  await db.put('audio-files', audioBlob, lessonId);
}

async function getAudioLesson(lessonId) {
  const db = await dbPromise;
  return await db.get('audio-files', lessonId);
}
```

---

## Best Practices

### Performance Optimization

1. **Lazy load audio**: Don't load all exercise audio upfront
2. **Use audio sprites**: Combine multiple short audio files into one
3. **Compress audio**: MP3 at 96kbps sufficient for speech
4. **Streaming**: Use HTML5 audio streaming for longer content
5. **Web Workers**: Offload audio processing to background thread

```javascript
// Audio sprite example
const sprite = new Howl({
  src: ['exercises.mp3'],
  sprite: {
    exercise1: [0, 3000],      // 0-3 seconds
    exercise2: [3000, 2500],   // 3-5.5 seconds
    exercise3: [5500, 4000]    // 5.5-9.5 seconds
  }
});

sprite.play('exercise1');
```

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Audio API | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Web Speech API | ✅ Full | ❌ No | ⚠️ Limited | ✅ Full |
| Audio Worklets | ✅ Yes | ✅ Yes | ✅ Yes (15+) | ✅ Yes |
| MediaRecorder | ✅ Yes | ✅ Yes | ✅ Yes (14+) | ✅ Yes |

**Fallback Strategy:**
- Primary: Web Speech API (Chrome, Edge)
- Fallback: Backend speech recognition (all browsers)
- User notification if mic permissions denied

### Mobile Considerations

1. **Touch-optimized controls**: Larger buttons (min 48x48px)
2. **Reduced audio quality**: Lower bitrate for mobile data
3. **Battery awareness**: Limit background audio processing
4. **iOS audio unlock**: Require user interaction to play audio

```javascript
// iOS audio unlock
document.addEventListener('touchstart', function() {
  const context = new AudioContext();
  const buffer = context.createBuffer(1, 1, 22050);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}, { once: true });
```

### Accessibility

1. **Keyboard controls**: Space = play/pause, arrows = seek
2. **Screen reader support**: ARIA labels for all controls
3. **Visual feedback**: Waveform visualization for hearing-impaired
4. **Transcript availability**: Always provide text alternative
5. **Focus indicators**: Clear visual focus on interactive elements

```jsx
<button
  onClick={togglePlay}
  aria-label={isPlaying ? "Pause audio" : "Play audio"}
  aria-pressed={isPlaying}
>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>
```

---

## Technical Recommendations

### For DMF Listening Module

#### 1. **Core Audio Stack**
- **Playback**: Howler.js (simplicity + reliability)
- **Visualization**: WaveSurfer.js (waveform + interactive transcripts)
- **Speech Recognition**: 
  - Free tier: Web Speech API
  - Production: Google Cloud Speech-to-Text with Whisper fallback
- **Pronunciation**: Azure Pronunciation Assessment for detailed feedback

#### 2. **Architecture**
```
Frontend (React):
├── Howler.js for audio playback
├── WaveSurfer.js for waveform
├── Web Speech API for quick recognition
└── Custom hooks for state management

Backend (Node.js/Express):
├── Google Cloud Speech-to-Text API
├── Whisper (self-hosted for cost-sensitive features)
├── Audio file storage (AWS S3/Cloudflare R2)
└── Caching layer (Redis for recognition results)

Database (Supabase):
├── Exercise audio metadata
├── User pronunciation attempts (for review)
├── Performance analytics
└── Offline sync queue
```

#### 3. **Progressive Enhancement**
- **Basic**: Audio playback + manual transcript
- **Enhanced**: Speech recognition + automatic scoring
- **Advanced**: Phoneme-level feedback + personalized recommendations

#### 4. **Cost Optimization**
- Use Web Speech API for practice modes (free)
- Reserve cloud services for graded exercises
- Batch process recordings for efficiency
- Cache recognition results aggressively
- Implement usage quotas per user tier

#### 5. **Quality Assurance**
- Audio normalization (consistent volume across exercises)
- Noise cancellation for user recordings
- Acoustic echo cancellation for better recognition
- Multiple native speaker recordings per exercise
- A/B test different recognition confidence thresholds

#### 6. **Security & Privacy**
- User audio recordings: encrypted at rest
- GDPR compliance: delete recordings on request
- No permanent storage of speech data (unless user opts in)
- Transparent data usage policy

#### 7. **Timeline Estimate**

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1: Audio Infrastructure** | Howler.js integration, audio player UI, basic playback controls | 16 hours |
| **Phase 2: Visualization** | WaveSurfer.js, waveform display, interactive transcript | 12 hours |
| **Phase 3: Speech Recognition** | Web Speech API integration, basic dictation exercises | 20 hours |
| **Phase 4: Scoring System** | Algorithm development, feedback UI, progress tracking | 16 hours |
| **Phase 5: Advanced Features** | Cloud speech API, pronunciation feedback, analytics | 24 hours |
| **Phase 6: Mobile Optimization** | Responsive design, offline mode, performance tuning | 16 hours |
| **Phase 7: Testing & Refinement** | Cross-browser testing, accessibility audit, bug fixes | 12 hours |
| **Total** | | **116 hours (~3 weeks)** |

---

**Next Steps:** Await UX Analyst report to finalize interface design and Strategy Synthesizer to consolidate all findings into actionable development plan.
