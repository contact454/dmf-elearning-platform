import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Listening Module exercises...');

  // Create 10 sample listening exercises
  const exercises = await prisma.listeningExercise.createMany({
    data: [
      {
        title: 'A1 Dictation Exercise 1',
        description: 'Listen and type what you hear',
        audioUrl: 'listening/A1/exercise-1.mp3',
        audioDuration: 25,
        exerciseType: 'dictation',
        cefrLevel: 'A1',
        topic: 'greetings',
        tags: ['A1', 'dictation', 'greetings'],
        transcript: 'Hello, my name is John.',
        questionData: {},
        correctAnswer: { text: 'Hello, my name is John.' },
        status: 'PUBLISHED',
      },
      {
        title: 'A1 Multiple Choice Exercise 1',
        description: 'Listen and choose the correct answer',
        audioUrl: 'listening/A1/exercise-2.mp3',
        audioDuration: 30,
        exerciseType: 'multiple_choice',
        cefrLevel: 'A1',
        topic: 'family',
        tags: ['A1', 'multiple_choice', 'family'],
        transcript: 'I have two brothers and one sister.',
        questionData: { question: 'How many siblings does the speaker have?' },
        correctAnswer: { option: 'A' },
        options: ['Three', 'Two', 'Four', 'One'],
        status: 'PUBLISHED',
      },
      {
        title: 'A2 Dictation Exercise 1',
        description: 'Listen and type what you hear',
        audioUrl: 'listening/A2/exercise-1.mp3',
        audioDuration: 35,
        exerciseType: 'dictation',
        cefrLevel: 'A2',
        topic: 'daily_routine',
        tags: ['A2', 'dictation', 'daily_routine'],
        transcript: 'I wake up at seven and go to work at eight.',
        questionData: {},
        correctAnswer: { text: 'I wake up at seven and go to work at eight.' },
        status: 'PUBLISHED',
      },
      {
        title: 'B1 Fill Blank Exercise 1',
        description: 'Listen and fill in the missing words',
        audioUrl: 'listening/B1/exercise-1.mp3',
        audioDuration: 40,
        exerciseType: 'fill_blank',
        cefrLevel: 'B1',
        topic: 'travel',
        tags: ['B1', 'fill_blank', 'travel'],
        transcript: 'I traveled to Paris last [blank1] and visited the [blank2] Tower.',
        questionData: { blanks: ['summer', 'Eiffel'] },
        correctAnswer: { blank1: 'summer', blank2: 'Eiffel' },
        status: 'PUBLISHED',
      },
      {
        title: 'B1 Audio Image Exercise 1',
        description: 'Listen and match to the correct image',
        audioUrl: 'listening/B1/exercise-2.mp3',
        audioDuration: 30,
        exerciseType: 'audio_image',
        cefrLevel: 'B1',
        topic: 'colors',
        tags: ['B1', 'audio_image', 'colors'],
        transcript: 'The car is blue.',
        questionData: {},
        correctAnswer: { imageId: 'blue-car' },
        options: ['blue-car', 'red-car', 'green-car', 'yellow-car'],
        status: 'PUBLISHED',
      },
      {
        title: 'B2 Dictation Exercise 1',
        description: 'Advanced dictation exercise',
        audioUrl: 'listening/B2/exercise-1.mp3',
        audioDuration: 50,
        exerciseType: 'dictation',
        cefrLevel: 'B2',
        topic: 'business',
        tags: ['B2', 'dictation', 'business'],
        transcript: 'The quarterly report shows significant growth in our European markets.',
        questionData: {},
        correctAnswer: { text: 'The quarterly report shows significant growth in our European markets.' },
        status: 'PUBLISHED',
      },
      {
        title: 'C1 Multiple Choice Exercise 1',
        description: 'Complex listening comprehension',
        audioUrl: 'listening/C1/exercise-1.mp3',
        audioDuration: 60,
        exerciseType: 'multiple_choice',
        cefrLevel: 'C1',
        topic: 'politics',
        tags: ['C1', 'multiple_choice', 'politics'],
        transcript: 'The new legislation addresses climate change through carbon taxation.',
        questionData: { question: 'What is the main topic?' },
        correctAnswer: { option: 'A' },
        options: ['Climate legislation', 'Economic policy', 'Social reform', 'Trade agreements'],
        status: 'PUBLISHED',
      },
      {
        title: 'C2 Dictation Exercise 1',
        description: 'Expert level dictation',
        audioUrl: 'listening/C2/exercise-1.mp3',
        audioDuration: 70,
        exerciseType: 'dictation',
        cefrLevel: 'C2',
        topic: 'science',
        tags: ['C2', 'dictation', 'science'],
        transcript: 'The quantum entanglement phenomenon challenges our understanding of locality and causality.',
        questionData: {},
        correctAnswer: { text: 'The quantum entanglement phenomenon challenges our understanding of locality and causality.' },
        status: 'PUBLISHED',
      },
      {
        title: 'A1 Audio Image Exercise 1',
        description: 'Simple image matching',
        audioUrl: 'listening/A1/exercise-3.mp3',
        audioDuration: 20,
        exerciseType: 'audio_image',
        cefrLevel: 'A1',
        topic: 'animals',
        tags: ['A1', 'audio_image', 'animals'],
        transcript: 'This is a cat.',
        questionData: {},
        correctAnswer: { imageId: 'cat' },
        options: ['cat', 'dog', 'bird', 'fish'],
        status: 'PUBLISHED',
      },
      {
        title: 'A2 Fill Blank Exercise 1',
        description: 'Fill in the missing words',
        audioUrl: 'listening/A2/exercise-2.mp3',
        audioDuration: 30,
        exerciseType: 'fill_blank',
        cefrLevel: 'A2',
        topic: 'hobbies',
        tags: ['A2', 'fill_blank', 'hobbies'],
        transcript: 'I like to play [blank1] and read [blank2].',
        questionData: { blanks: ['tennis', 'books'] },
        correctAnswer: { blank1: 'tennis', blank2: 'books' },
        status: 'PUBLISHED',
      },
    ],
  });

  console.log(`✅ Created ${exercises.count} listening exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
