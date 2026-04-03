export interface StoryParagraph {
  id: string;
  text: string;
  translation?: string;
  audioUrl: string;
  vocabulary: VocabularyWord[];
}

export interface VocabularyWord {
  word: string;
  translation: string;
  definition: string;
  audioUrl: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Story {
  id: string;
  user_id?: string;
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  wordsCount: number;
  difficulty: number; // 1-5
  category: 'fiction' | 'non_fiction' | 'news' | 'daily_life' | 'culture' | 'history' | 'science' | 'business' | 'travel' | 'education';
  isCompleted: boolean;
  isUnlocked: boolean;
  completionRate: number;
  rating: number;
  thumbnail: string;
  preview: string;
  vocabulary: string[];
  content: StoryParagraph[];
}
