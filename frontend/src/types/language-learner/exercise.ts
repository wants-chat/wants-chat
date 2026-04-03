export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  instruction: string;
  options?: ExerciseOption[];
  correctAnswer: string | string[];
  explanation?: string;
  hints: string[];
  difficulty: number; // 1-5
  timeLimit?: number; // seconds
  points: number;
  tags: string[];
  metadata: ExerciseMetadata;
}

export interface ExerciseOption {
  id: string;
  text: string;
  image?: string;
  audio?: string;
  correct: boolean;
}

export interface ExerciseMetadata {
  vocabularyFocus: string[];
  grammarFocus: string[];
  skillsFocus: string[];
  audioRequired: boolean;
  imageRequired: boolean;
  speechRecognition: boolean;
  estimatedTime: number; // seconds
}

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string | string[];
  correct: boolean;
  timeSpent: number; // seconds
  attempts: number;
  hintsUsed: number;
  score: number; // 0-100
  timestamp: Date;
}

export interface MultipleChoiceExercise extends Exercise {
  type: 'multiple-choice';
  options: ExerciseOption[];
  correctAnswer: string;
}

export interface TranslationExercise extends Exercise {
  type: 'translation';
  sourceLanguage: string;
  targetLanguage: string;
  alternativeAnswers: string[];
  wordBank?: string[];
}

export interface ListeningExercise extends Exercise {
  type: 'listening';
  audioUrl: string;
  speaker: string;
  transcript: string;
  speed: 'slow' | 'normal' | 'fast';
  allowReplay: boolean;
  maxReplays?: number;
}

export interface SpeakingExercise extends Exercise {
  type: 'speaking';
  targetPhrase: string;
  phoneticTranscription: string;
  allowSkip: boolean;
  pronunciationThreshold: number; // 0-100
}

export interface MatchingExercise extends Exercise {
  type: 'matching';
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  correctPairs: MatchingPair[];
}

export interface MatchingItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  url?: string;
}

export interface MatchingPair {
  leftId: string;
  rightId: string;
}

export interface FillBlankExercise extends Exercise {
  type: 'fill-blank';
  sentence: string;
  blanks: BlankSpace[];
  wordBank?: string[];
  caseSensitive: boolean;
}

export interface BlankSpace {
  id: string;
  position: number;
  correctAnswers: string[];
  placeholder?: string;
}

export interface SentenceBuildingExercise extends Exercise {
  type: 'sentence-building';
  wordTiles: WordTile[];
  correctOrder: string[];
  alternativeOrders?: string[][];
}

export interface WordTile {
  id: string;
  word: string;
  position?: number;
  locked?: boolean;
}

export interface PictureDescriptionExercise extends Exercise {
  type: 'picture-description';
  imageUrl: string;
  requiredWords: string[];
  suggestedStructure: string;
  minWords: number;
  maxWords: number;
}

export interface DialogueExercise extends Exercise {
  type: 'dialogue';
  conversation: DialogueLine[];
  missingLines: number[];
  context: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  audioUrl?: string;
  missing?: boolean;
}

export interface GrammarExercise extends Exercise {
  type: 'grammar';
  rule: string;
  ruleExplanation: string;
  examples: GrammarExample[];
  practiceType: GrammarPracticeType;
}

export interface GrammarExample {
  sentence: string;
  highlight: string;
  explanation: string;
}

export interface ExerciseSession {
  id: string;
  lessonId: string;
  exercises: Exercise[];
  results: ExerciseResult[];
  startedAt: Date;
  completedAt?: Date;
  score: number;
  accuracy: number;
  xpEarned: number;
  heartsLost: number;
  status: SessionStatus;
}

export interface ExerciseFeedback {
  correct: boolean;
  message: string;
  explanation?: string;
  correctAnswer?: string;
  pronunciation?: PronunciationFeedback;
  suggestions: string[];
  encouragement: string;
}

export interface PronunciationFeedback {
  score: number; // 0-100
  feedback: string;
  improvements: PronunciationImprovement[];
  audioUrl?: string; // reference pronunciation
}

export interface PronunciationImprovement {
  phoneme: string;
  issue: string;
  suggestion: string;
  examples: string[];
}

export type ExerciseType = 
  | 'multiple-choice'
  | 'translation'
  | 'listening'
  | 'speaking'
  | 'matching'
  | 'fill-blank'
  | 'sentence-building'
  | 'picture-description'
  | 'dialogue'
  | 'grammar';

export type GrammarPracticeType = 
  | 'conjugation'
  | 'declension'
  | 'word-order'
  | 'article-selection'
  | 'preposition-choice';

export type SessionStatus = 
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'abandoned';