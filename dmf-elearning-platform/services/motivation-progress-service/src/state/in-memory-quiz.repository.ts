/**
 * In-Memory Quiz Repository
 */

export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  question: string;
  options: QuizOption[];
  correctAnswerId: string;
  explanation: string;
  xpReward: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  xpGained: number;
  attemptedAt: Date;
}

export interface QuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findByCourseId(courseId: string): Promise<Quiz[]>;
  saveAttempt(attempt: QuizAttempt): Promise<QuizAttempt>;
  getUserAttempts(userId: string): Promise<QuizAttempt[]>;
}

class InMemoryQuizRepository implements QuizRepository {
  private quizzes = new Map<string, Quiz>();
  private attempts = new Map<string, QuizAttempt>();

  constructor() {
    // Seed with 5 Next.js quizzes
    this.seedQuizzes();
  }

  private seedQuizzes() {
    const quizzes: Quiz[] = [
      {
        id: 'quiz-1',
        courseId: 'course-nextjs-basic',
        question: 'What is the purpose of the `app` directory in Next.js 13+?',
        options: [
          { id: 'a', text: 'To store static assets' },
          { id: 'b', text: 'To define routes using the App Router' },
          { id: 'c', text: 'To configure webpack' },
          { id: 'd', text: 'To store environment variables' },
        ],
        correctAnswerId: 'b',
        explanation: 'The `app` directory is used to define routes using the new App Router in Next.js 13+, which supports React Server Components.',
        xpReward: 20,
      },
      {
        id: 'quiz-2',
        courseId: 'course-nextjs-basic',
        question: 'Which function is used to fetch data at build time in Next.js?',
        options: [
          { id: 'a', text: 'getServerSideProps' },
          { id: 'b', text: 'getStaticProps' },
          { id: 'c', text: 'useEffect' },
          { id: 'd', text: 'fetch()' },
        ],
        correctAnswerId: 'b',
        explanation: 'getStaticProps is used to fetch data at build time for Static Site Generation (SSG).',
        xpReward: 20,
      },
      {
        id: 'quiz-3',
        courseId: 'course-nextjs-basic',
        question: 'What is the default port for Next.js development server?',
        options: [
          { id: 'a', text: '8080' },
          { id: 'b', text: '5000' },
          { id: 'c', text: '3000' },
          { id: 'd', text: '4200' },
        ],
        correctAnswerId: 'c',
        explanation: 'By default, Next.js development server runs on port 3000.',
        xpReward: 20,
      },
      {
        id: 'quiz-4',
        courseId: 'course-nextjs-basic',
        question: 'Which component is used to navigate between pages in Next.js?',
        options: [
          { id: 'a', text: '<a>' },
          { id: 'b', text: '<Link>' },
          { id: 'c', text: '<Router>' },
          { id: 'd', text: '<Navigate>' },
        ],
        correctAnswerId: 'b',
        explanation: 'The <Link> component from next/link is used for client-side navigation between pages.',
        xpReward: 20,
      },
      {
        id: 'quiz-5',
        courseId: 'course-nextjs-basic',
        question: 'What does ISR stand for in Next.js?',
        options: [
          { id: 'a', text: 'Incremental Static Rendering' },
          { id: 'b', text: 'Incremental Static Regeneration' },
          { id: 'c', text: 'Internal Server Rendering' },
          { id: 'd', text: 'Instant Server Response' },
        ],
        correctAnswerId: 'b',
        explanation: 'ISR stands for Incremental Static Regeneration, which allows you to update static pages after build time.',
        xpReward: 20,
      },
    ];

    quizzes.forEach(quiz => this.quizzes.set(quiz.id, quiz));
  }

  async findById(id: string): Promise<Quiz | null> {
    return this.quizzes.get(id) || null;
  }

  async findByCourseId(courseId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(q => q.courseId === courseId);
  }

  async saveAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    return Array.from(this.attempts.values()).filter(a => a.userId === userId);
  }
}

export function createInMemoryQuizRepository(): QuizRepository {
  return new InMemoryQuizRepository();
}
