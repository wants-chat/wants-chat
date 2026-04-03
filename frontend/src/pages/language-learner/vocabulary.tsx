import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Filter, Volume2, Star, Clock, Target, RotateCcw, Plus, Eye, EyeOff, Shuffle, TrendingUp, Award, Play, Check, X, Brain, Gamepad2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../../components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import VocabularyFlashcard from '../../components/language-learner/vocabulary/VocabularyFlashcard';
import StudySessionManager from '../../components/language-learner/vocabulary/StudySessionManager';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { useConfirmation } from '../../hooks/useConfirmation';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

// Import our new API hooks
import {
  useVocabulary as useVocabularyAPI,
  useCreateVocabulary,
  useUpdateVocabulary,
  useDeleteVocabulary,
  useCompleteVocabulary,
  useVocabularyCategories,
  VocabularyWord as APIVocabularyWord,
  VocabularyQueryParams
} from '../../hooks/language-learner';

interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  definition: string;
  pronunciation: string;
  audioUrl: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examples: VocabularyExample[];
  mastery: number; // 0-100
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed: Date;
  nextReview: Date;
  dateAdded: Date;
  source: 'lesson' | 'story' | 'manual';
  isFavorite: boolean;
  isCompleted: boolean;
  tags: string[];
}

interface VocabularyExample {
  sentence: string;
  translation: string;
  audioUrl: string;
}

interface StudySession {
  id: string;
  type: 'flashcards' | 'matching' | 'spelling' | 'listening';
  words: VocabularyWord[];
  startTime: Date;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useSelectedLesson();
  const confirmation = useConfirmation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedMastery, setSelectedMastery] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showTranslations, setShowTranslations] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<'spanish' | 'english'>('spanish');
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'flashcards' | 'matching' | 'spelling' | 'listening' | null>(null);
  const [page, setPage] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null);

  // API Query Parameters
  const queryParams: VocabularyQueryParams = useMemo(() => {
    const params: VocabularyQueryParams = {
      page,
      limit: 10,
      language_code: 'es', // Spanish learning
    };

    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedDifficulty !== 'all') {
      params.difficulty = selectedDifficulty; // 'easy', 'medium', 'hard'
    }
    if (searchTerm.trim()) params.search = searchTerm.trim();

    return params;
  }, [selectedCategory, selectedDifficulty, page, searchTerm]);

  // API Hooks
  const {
    data: vocabularyResponse,
    isLoading: isLoadingVocabulary,
    error: vocabularyError,
    refetch
  } = useVocabularyAPI(queryParams);

  const { data: categoriesData } = useVocabularyCategories('es');

  // Mutation hooks
  const createVocabularyMutation = useCreateVocabulary();
  const updateVocabularyMutation = useUpdateVocabulary();
  const deleteVocabularyMutation = useDeleteVocabulary();
  const completeVocabularyMutation = useCompleteVocabulary();

  // Convert API data to component interface format
  const vocabulary: VocabularyWord[] = useMemo(() => {
    if (!vocabularyResponse?.data) return [];
    
    return vocabularyResponse.data.map((apiWord: APIVocabularyWord): VocabularyWord => {
      // Ensure difficulty is one of the allowed values
      const difficulty = (apiWord.difficulty === 'easy' || apiWord.difficulty === 'medium' || apiWord.difficulty === 'hard')
        ? apiWord.difficulty
        : 'medium';

      // Transform examples to match VocabularyExample interface
      const examples = apiWord.examples
        ? apiWord.examples.map(ex => ({
            sentence: ex.sentence,
            translation: ex.translation,
            audioUrl: ''
          }))
        : apiWord.example_sentence
          ? [{
              sentence: apiWord.example_sentence,
              translation: apiWord.example_translation || '',
              audioUrl: ''
            }]
          : [];

      return {
        id: apiWord.id,
        word: apiWord.word,
        translation: apiWord.translation,
        definition: apiWord.definition || '',
        pronunciation: apiWord.pronunciation || apiWord.phonetic || '',
        audioUrl: apiWord.audio_url || '',
        partOfSpeech: apiWord.part_of_speech || (apiWord.word_type as any) || 'noun',
        difficulty,
        category: apiWord.category || 'General',
        examples,
        mastery: apiWord.mastery || (apiWord.learned ? 100 : (apiWord.times_reviewed * 10)),
        timesReviewed: apiWord.times_reviewed,
        timesCorrect: Math.floor(apiWord.times_reviewed * 0.8), // Estimate
        timesIncorrect: Math.floor(apiWord.times_reviewed * 0.2), // Estimate
        lastReviewed: apiWord.last_reviewed ? new Date(apiWord.last_reviewed) : new Date(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        dateAdded: new Date(apiWord.created_at),
        source: 'lesson' as const,
        isFavorite: apiWord.tags?.includes('favorite') || false,
        isCompleted: apiWord.is_completed || false,
        tags: apiWord.tags || []
      };
    });
  }, [vocabularyResponse?.data]);

  // Use API data
  const currentVocabulary = vocabulary;
  const categories = categoriesData?.categories || [];

  // Use API response
  const actualResponse = vocabularyResponse || { total: 0, page: 1, limit: 10, total_pages: 0, completed_count: 0 };
  const totalWords = actualResponse.total || 0;
  const completedWords = actualResponse.completed_count || 0;
  const remainingWords = totalWords - completedWords;
  const completionPercentage = totalWords > 0 ? Math.round((completedWords / totalWords) * 100) : 0;

  // API handles search, category, and difficulty filtering
  // Only need to filter by mastery on the frontend
  const filteredWords = currentVocabulary.filter(word => {
    const matchesMastery = selectedMastery === 'all' ||
                          (selectedMastery === 'mastered' && word.mastery >= 80) ||
                          (selectedMastery === 'learning' && word.mastery >= 40 && word.mastery < 80) ||
                          (selectedMastery === 'weak' && word.mastery < 40);

    return matchesMastery;
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.word.localeCompare(b.word);
      case 'mastery-low':
        return a.mastery - b.mastery;
      case 'mastery-high':
        return b.mastery - a.mastery;
      case 'recent':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case 'difficulty':
        const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default:
        return 0;
    }
  });

  // API already returns paginated data
  const paginatedWords = sortedWords;

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-emerald-400';
    if (mastery >= 60) return 'text-yellow-400';
    if (mastery >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMasteryBgColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (mastery >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (mastery >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const handlePlayAudio = async (text: string) => {
    if (isPlaying) return;

    setIsPlaying(true);

    // Use browser's built-in speech synthesis (no CORS issues)
    const cleanText = text.trim();
    useSpeechSynthesis(cleanText);
  };

  const useSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'spanish' ? 'es-ES' : 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
      };
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          const preferredVoice = availableVoices.find(voice => 
            voice.lang.startsWith(currentLanguage === 'spanish' ? 'es' : 'en')
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          window.speechSynthesis.speak(utterance);
        };
      } else {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(currentLanguage === 'spanish' ? 'es' : 'en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const toggleWordSelection = (wordId: string) => {
    const word = currentVocabulary.find(w => w.id === wordId);
    const isSelected = selectedWords.includes(wordId);

    setSelectedWords(prev =>
      isSelected
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );

    // Show toast feedback
    if (word) {
      if (isSelected) {
        toast.info('Word deselected', {
          description: `"${word.word}" removed from practice selection.`,
          duration: 1500,
        });
      } else {
        toast.success('Word selected', {
          description: `"${word.word}" added to practice selection.`,
          duration: 1500,
        });
      }
    }
  };

  const handleDeleteWord = async (word: VocabularyWord) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Vocabulary Word',
      message: `Are you sure you want to delete "${word.word}" (${word.translation})? This action cannot be undone and will remove all progress associated with this word.`,
      confirmText: 'Delete Word',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setDeletingWordId(word.id);
      await deleteVocabularyMutation.mutateAsync(word.id);
      await refetch();
      toast.success('Vocabulary word deleted', {
        description: `"${word.word}" has been permanently removed from your vocabulary.`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to delete vocabulary word:', error);
      toast.error('Failed to delete word', {
        description: 'There was an error deleting the vocabulary word. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeletingWordId(null);
    }
  };

  const startPracticeMode = (mode: 'flashcards' | 'matching' | 'spelling' | 'listening') => {
    const wordsToStudy = selectedWords.length > 0
      ? currentVocabulary.filter(w => selectedWords.includes(w.id))
      : currentVocabulary.filter(w => !w.isCompleted).length > 0
        ? currentVocabulary.filter(w => !w.isCompleted)
        : currentVocabulary.slice(0, 10); // Limit to 10 words for practice

    // Show practice start notification
    toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} practice started!`, {
      description: `You're practicing with ${wordsToStudy.length} vocabulary words. Good luck!`,
      duration: 3000,
    });

    if (mode === 'flashcards') {
      setCurrentCard(0);
      setShowAnswer(false);
      setPracticeMode('flashcards');
    } else {
      // Generate practice questions
      const questions = generatePracticeQuestions(wordsToStudy, mode);
      setPracticeQuestions(questions);
      setCurrentQuestion(0);
      setPracticeScore({ correct: 0, total: 0 });
      setPracticeMode(mode);
      setShowFeedback(false);
      setSelectedAnswer('');
      setUserAnswer('');
    }
  };

  const generatePracticeQuestions = (words: VocabularyWord[], mode: string) => {
    return words.map(word => {
      switch (mode) {
        case 'matching':
          const otherWords = words.filter(w => w.id !== word.id).slice(0, 3);
          const allOptions = [word.translation, ...otherWords.map(w => w.translation)]
            .sort(() => Math.random() - 0.5);
          return {
            id: word.id,
            question: word.word,
            options: allOptions,
            correctAnswer: word.translation,
            word: word
          };
        case 'spelling':
          return {
            id: word.id,
            question: `How do you spell: "${word.translation}"?`,
            correctAnswer: word.word,
            word: word
          };
        case 'listening':
          const listeningOptions = [word.word, ...words.filter(w => w.id !== word.id).slice(0, 3).map(w => w.word)]
            .sort(() => Math.random() - 0.5);
          return {
            id: word.id,
            question: 'Listen and select the word you hear:',
            options: listeningOptions,
            correctAnswer: word.word,
            audioText: word.word,
            word: word
          };
        default:
          return null;
      }
    }).filter(Boolean);
  };



  const formatLastReviewed = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Detect current language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('currentLanguagelearning');
    if (savedLanguage === 'english') {
      setCurrentLanguage('english');
    } else {
      setCurrentLanguage('spanish');
    }
  }, []);

  // Reset page to 1 when search term, category, or difficulty changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <BookOpen className="h-6 w-6 text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {currentLanguage === 'spanish' ? 'Spanish' : 'English'} Vocabulary
          </h1>
          <p className="text-white/60">
            Master your {currentLanguage === 'spanish' ? 'Spanish' : 'English'} word collection
          </p>
        </div>
      </div>

      <div>
        {practiceMode && practiceMode !== 'flashcards' ? (
          /* Practice Mode Interface */
          <StudySessionManager
            mode={practiceMode as 'matching' | 'spelling' | 'listening'}
            words={selectedWords.length > 0
              ? currentVocabulary.filter(w => selectedWords.includes(w.id))
              : currentVocabulary.filter(w => !w.isCompleted).length > 0
                ? currentVocabulary.filter(w => !w.isCompleted)
                : currentVocabulary.slice(0, 10)}
            onExit={() => setPracticeMode(null)}
            onPlayAudio={handlePlayAudio}
            isPlaying={isPlaying}
          />
        ) : practiceMode === 'flashcards' ? (
          <div className="space-y-6">
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPracticeMode(null)}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Vocabulary
                  </Button>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 capitalize">
                    Flashcards
                  </Badge>
                </div>
              </div>
            </GlassCard>

            <VocabularyFlashcard
              words={selectedWords.length > 0
                ? currentVocabulary.filter(w => selectedWords.includes(w.id))
                : currentVocabulary.filter(w => !w.isCompleted).length > 0
                  ? currentVocabulary.filter(w => !w.isCompleted)
                  : currentVocabulary.slice(0, 10)}
              onPlayAudio={handlePlayAudio}
              onShuffle={() => {
                const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
                setCurrentCard(0);
              }}
              onReset={() => setCurrentCard(0)}
            />
          </div>
        ) : (
          <div className="space-y-8 overflow-visible">
            {/* Professional Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlassCard className="text-center" hover={false} glow>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {totalWords}
                </div>
                <div className="text-sm font-medium text-white/60">
                  Total Words
                </div>
              </GlassCard>

              <GlassCard className="text-center" hover={false} glow>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 w-fit mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {completedWords}
                </div>
                <div className="text-sm font-medium text-white/60">
                  Completed Words
                </div>
              </GlassCard>

              <GlassCard className="text-center" hover={false} glow>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 w-fit mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {remainingWords}
                </div>
                <div className="text-sm font-medium text-white/60">
                  Remaining Words
                </div>
              </GlassCard>

              <GlassCard className="text-center" hover={false} glow>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {completionPercentage}%
                </div>
                <div className="text-sm font-medium text-white/60">
                  Completed Percentage
                </div>
              </GlassCard>
            </div>

            {/* Filter & Search Section */}
            <GlassCard hover={false}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Filter & Search</h2>
                  <Badge className="bg-white/10 text-white border-white/20 font-medium">
                    {filteredWords.length} words found
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Search</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <Input
                        type="text"
                        placeholder="Search by word or translation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 w-full rounded-xl border-2 border-white/20 bg-white/10 pl-12 pr-4 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/80">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-12 w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 text-white"
                      >
                        <option value="all">📚 All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/80">Difficulty Level</label>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="h-12 w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 text-white"
                      >
                        <option value="all">🎯 All Levels</option>
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </GlassCard>

            {/* Loading State */}
            {isLoadingVocabulary && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <GlassCard key={i} className="animate-pulse" hover={false}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-8 bg-white/20 rounded-xl w-32"></div>
                        <div className="h-6 bg-white/20 rounded-xl w-20"></div>
                      </div>
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Error State */}
            {vocabularyError && (
              <GlassCard className="text-center bg-red-500/10 border-red-500/30" hover={false}>
                <div className="p-4 rounded-2xl bg-red-500/20 w-fit mx-auto mb-4">
                  <X className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Error Loading Vocabulary
                </h3>
                <p className="text-white/60 mb-4">
                  {vocabularyError.message || 'Failed to load vocabulary words'}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </GlassCard>
            )}

            {/* Professional Word List */}
            {!isLoadingVocabulary && !vocabularyError && (
              <div className="space-y-4">
                {paginatedWords.map((word) => (
                <GlassCard key={word.id} hover={false}>
                    {/* Header: Word in Target Language (Spanish) */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-4xl font-bold text-white">{word.word}</h2>
                        <span className="text-lg text-white/60">{word.pronunciation}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayAudio(word.word)}
                          className="h-10 w-10 rounded-xl hover:bg-[#47bdff]/10 hover:text-[#47bdff]"
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getDifficultyColor(word.difficulty)} px-3 py-1 text-sm font-semibold`}>
                          {word.difficulty}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                          {word.partOfSpeech}
                        </Badge>
                      </div>
                    </div>

                    {/* Meaning in Source Language (English) */}
                    <div className="mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <p className="text-sm font-semibold text-blue-400 mb-2">Meaning</p>
                      <p className="text-xl font-semibold text-white">{word.translation}</p>
                    </div>

                    {/* Description in Source Language (English) */}
                    <div className="mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <p className="text-sm font-semibold text-purple-400 mb-2">Description</p>
                      <p className="text-base text-white/80">{word.definition}</p>
                    </div>

                    {/* Example in Target Language (Spanish) with Translation */}
                    {word.examples.length > 0 && (
                      <div className="mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <p className="text-sm font-semibold text-green-400 mb-2">Example</p>
                        <p className="text-lg font-medium text-white mb-2">{word.examples[0].sentence}</p>
                        <p className="text-base text-white/60 italic">→ {word.examples[0].translation}</p>
                      </div>
                    )}

                    {/* Synonyms & Antonyms in Target Language (Spanish) */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <p className="text-sm font-semibold text-amber-400 mb-2">Synonyms</p>
                        <p className="text-base text-white/80">sorprendente, notable</p>
                      </div>
                      <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <p className="text-sm font-semibold text-red-400 mb-2">Antonyms</p>
                        <p className="text-base text-white/80">decepcionante, común</p>
                      </div>
                    </div>

                    {/* Footer: Complete Button or Completed Badge */}
                    <div className="flex justify-end pt-6 border-t border-white/20">
                      {word.isCompleted ? (
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-xl border-2 border-green-400/50 backdrop-blur-sm">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-400">Completed</p>
                            <p className="text-xs text-white/60">You've mastered this word!</p>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                          disabled={completeVocabularyMutation.isPending}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await completeVocabularyMutation.mutateAsync({
                                id: word.id,
                                isCompleted: true
                              });
                              toast.success('Word marked as complete!', {
                                description: `Great job! "${word.word}" has been marked as learned.`,
                                duration: 3000,
                              });
                            } catch (error) {
                              toast.error('Failed to mark word as complete', {
                                description: 'Please try again later.',
                                duration: 3000,
                              });
                            }
                          }}
                        >
                          {completeVocabularyMutation.isPending ? (
                            <>
                              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Marking...
                            </>
                          ) : (
                            <>
                              <Check className="h-5 w-5 mr-2" />
                              Mark as Complete
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                </GlassCard>
              ))}

                {paginatedWords.length === 0 && (
                  <GlassCard className="text-center py-8" hover={false}>
                    <div className="p-6 rounded-3xl bg-white/10 w-fit mx-auto mb-6">
                      <Search className="h-16 w-16 text-white/40" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      No Words Found
                    </h3>
                    <p className="text-lg text-white/60 max-w-md mx-auto">
                      {vocabulary.length === 0 && !isLoadingVocabulary
                        ? 'No vocabulary words yet. Start learning through lessons and stories!'
                        : 'Try adjusting your search criteria or learn new words through lessons and stories.'}
                    </p>
                  </GlassCard>
                )}
                
                {/* Pagination */}
                {!isLoadingVocabulary && !vocabularyError && (() => {
                  const response = actualResponse;
                  const totalPages = Math.ceil(response.total / 10);

                  if (totalPages <= 1) {
                    return null;
                  }

                  const renderPaginationItems = () => {
                    const items = [];
                    const current = page;

                    // Show first page
                    if (totalPages > 0) {
                      items.push(
                        <PaginationItem key={1}>
                          <PaginationLink
                            onClick={() => setPage(1)}
                            isActive={current === 1}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipsis if needed
                    if (current > 3) {
                      items.push(<PaginationEllipsis key="ellipsis-start" />);
                    }

                    // Show pages around current
                    const start = Math.max(2, current - 1);
                    const end = Math.min(totalPages - 1, current + 1);

                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        items.push(
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setPage(i)}
                              isActive={current === i}
                              className="cursor-pointer"
                            >
                              {i}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    }

                    // Show ellipsis if needed
                    if (current < totalPages - 2) {
                      items.push(<PaginationEllipsis key="ellipsis-end" />);
                    }

                    // Show last page
                    if (totalPages > 1) {
                      items.push(
                        <PaginationItem key={totalPages}>
                          <PaginationLink
                            onClick={() => setPage(totalPages)}
                            isActive={current === totalPages}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    return items;
                  };

                  return (
                    <>
                      <div className="flex justify-center items-center mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>

                            {renderPaginationItems()}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>

                      {/* Results Summary */}
                      <div className="text-center mt-6 text-sm text-white/60">
                        Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, response.total)} of {response.total} words
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default VocabularyPage;