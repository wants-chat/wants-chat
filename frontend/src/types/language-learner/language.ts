import type { Exercise } from './exercise';

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string; // ISO 639-1
  flag: string;
  rtl: boolean;
  difficulty: LanguageDifficulty;
  availableFrom: string[]; // languages this can be learned from
  skillTree: SkillTree;
  phoneticSystem: PhoneticSystem;
  grammarRules: GrammarRule[];
}

export interface SkillTree {
  levels: SkillLevel[];
  totalSkills: number;
  totalLessons: number;
  estimatedHours: number;
}

export interface SkillLevel {
  id: string;
  level: number;
  title: string;
  description: string;
  cefr: CEFRLevel;
  skills: Skill[];
  unlockCriteria: UnlockCriteria;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: SkillCategory;
  lessons: Lesson[];
  prerequisites: string[];
  difficulty: SkillDifficulty;
  estimatedTime: number; // minutes
  vocabulary: VocabularyWord[];
  grammarFocus: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  exercises: Exercise[];
  objectives: LearningObjective[];
  difficulty: number; // 1-5
  estimatedTime: number; // minutes
  xpReward: number;
  vocabulary: VocabularyWord[];
  audioFiles: AudioFile[];
  completed: boolean;
  accuracy: number;
  attempts: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  ipa: string; // International Phonetic Alphabet
  partOfSpeech: PartOfSpeech;
  gender?: Gender;
  difficulty: number;
  frequency: number; // how common the word is
  examples: Example[];
  audioUrl?: string;
  imageUrl?: string;
  conjugations?: Conjugation[];
  synonyms: string[];
  antonyms: string[];
  tags: string[];
}

export interface Example {
  sentence: string;
  translation: string;
  audioUrl?: string;
  context: string;
}

export interface Conjugation {
  form: string;
  tense: string;
  person: string;
  number: GrammaticalNumber;
}

export interface PhoneticSystem {
  vowels: Phoneme[];
  consonants: Phoneme[];
  diphthongs: Phoneme[];
  specialSounds: Phoneme[];
  stressPatterns: StressPattern[];
}

export interface Phoneme {
  symbol: string;
  ipa: string;
  description: string;
  examples: PhonemeExample[];
  audioUrl: string;
  articulationPlace?: string;
  articulationManner?: string;
  voicing?: boolean;
}

export interface PhonemeExample {
  word: string;
  translation: string;
  audioUrl: string;
  position: SoundPosition;
}

export interface StressPattern {
  pattern: string;
  description: string;
  examples: string[];
  audioUrl: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  category: GrammarCategory;
  level: CEFRLevel;
  examples: GrammarExample[];
  exercises: string[]; // exercise IDs
  difficulty: number;
}

export interface GrammarExample {
  correct: string;
  incorrect?: string;
  explanation: string;
  translation: string;
}

export interface UnlockCriteria {
  skillsRequired: string[];
  xpRequired: number;
  accuracyRequired: number;
  lessonsRequired: number;
}

export interface LearningObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  completed: boolean;
}

export interface AudioFile {
  id: string;
  url: string;
  speaker: Speaker;
  speed: AudioSpeed;
  transcript: string;
}

export interface Speaker {
  id: string;
  name: string;
  gender: Gender;
  accent: string;
  nativeLanguage: string;
}

export type LanguageDifficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillCategory = 
  | 'basics' 
  | 'grammar' 
  | 'vocabulary' 
  | 'conversation' 
  | 'culture' 
  | 'business' 
  | 'travel';

export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LessonType = 
  | 'introduction' 
  | 'practice' 
  | 'review' 
  | 'test' 
  | 'conversation' 
  | 'story' 
  | 'grammar';

export type PartOfSpeech = 
  | 'noun' 
  | 'verb' 
  | 'adjective' 
  | 'adverb' 
  | 'preposition' 
  | 'conjunction' 
  | 'interjection' 
  | 'pronoun' 
  | 'determiner';

export type Gender = 'masculine' | 'feminine' | 'neuter';

export type GrammaticalNumber = 'singular' | 'plural';

export type SoundPosition = 'initial' | 'medial' | 'final';

export type GrammarCategory = 
  | 'verb-conjugation' 
  | 'noun-declension' 
  | 'sentence-structure' 
  | 'questions' 
  | 'negation' 
  | 'articles' 
  | 'prepositions';

export type ObjectiveType = 
  | 'vocabulary' 
  | 'grammar' 
  | 'pronunciation' 
  | 'comprehension';

export type AudioSpeed = 'slow' | 'normal' | 'fast';