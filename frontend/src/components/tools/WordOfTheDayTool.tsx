import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Volume2, Lightbulb, Trophy, ChevronLeft, ChevronRight, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface WordData {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
  etymology: string;
  difficulty: DifficultyLevel;
  synonyms: string[];
  antonyms: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface WordOfTheDayToolProps {
  uiConfig?: UIConfig;
}

export const WordOfTheDayTool: React.FC<WordOfTheDayToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.wordIndex !== undefined) {
        setCurrentWordIndex(Number(data.wordIndex));
      }
      if (data.quizMode !== undefined) {
        setIsQuizMode(Boolean(data.quizMode));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const words: WordData[] = [
    {
      word: 'Ephemeral',
      pronunciation: '/ɪˈfem(ə)rəl/',
      partOfSpeech: 'adjective',
      definition: 'Lasting for a very short time; transitory or fleeting.',
      examples: [
        'The ephemeral beauty of cherry blossoms reminds us to appreciate the present moment.',
        'Social media trends are often ephemeral, lasting only a few days before fading away.',
        'The morning dew on the grass was ephemeral, disappearing as the sun rose higher.',
      ],
      etymology: 'From Greek ephēmeros, meaning "lasting only a day," from epi- (on) + hēmera (day). First used in English in the 16th century.',
      difficulty: 'intermediate',
      synonyms: ['fleeting', 'transient', 'momentary', 'brief', 'short-lived'],
      antonyms: ['permanent', 'enduring', 'eternal', 'lasting'],
    },
    {
      word: 'Serendipity',
      pronunciation: '/ˌserənˈdipədē/',
      partOfSpeech: 'noun',
      definition: 'The occurrence of events by chance in a happy or beneficial way; a fortunate accident.',
      examples: [
        'It was pure serendipity that I met my best friend at a random coffee shop.',
        'The discovery of penicillin was a case of serendipity in scientific research.',
        'Through serendipity, she found her dream job while visiting a friend.',
      ],
      etymology: 'Coined by Horace Walpole in 1754, based on the Persian fairy tale "The Three Princes of Serendip," whose heroes made discoveries by accident.',
      difficulty: 'intermediate',
      synonyms: ['luck', 'fortune', 'chance', 'providence', 'destiny'],
      antonyms: ['misfortune', 'bad luck', 'design', 'intention'],
    },
    {
      word: 'Ubiquitous',
      pronunciation: '/yo͞oˈbikwədəs/',
      partOfSpeech: 'adjective',
      definition: 'Present, appearing, or found everywhere; omnipresent.',
      examples: [
        'Smartphones have become ubiquitous in modern society.',
        'Coffee shops are now ubiquitous in urban areas.',
        'The ubiquitous presence of social media affects how we communicate.',
      ],
      etymology: 'From Latin ubique meaning "everywhere," from ubi (where) + -que (and, also). Entered English in the early 19th century.',
      difficulty: 'advanced',
      synonyms: ['omnipresent', 'universal', 'pervasive', 'widespread', 'prevalent'],
      antonyms: ['rare', 'scarce', 'uncommon', 'limited'],
    },
    {
      word: 'Mellifluous',
      pronunciation: '/məˈliflo͞oəs/',
      partOfSpeech: 'adjective',
      definition: 'Sweet-sounding; pleasant to hear, especially of a voice or words.',
      examples: [
        'Her mellifluous voice captivated the entire audience.',
        'The mellifluous tones of the violin filled the concert hall.',
        'He spoke in a mellifluous manner that made everyone want to listen.',
      ],
      etymology: 'From Latin mellifluus, from mel (honey) + fluere (to flow). Literally means "flowing with honey."',
      difficulty: 'advanced',
      synonyms: ['melodious', 'dulcet', 'harmonious', 'euphonious', 'lyrical'],
      antonyms: ['harsh', 'discordant', 'grating', 'cacophonous'],
    },
    {
      word: 'Quintessential',
      pronunciation: '/ˌkwintəˈsen(t)SHəl/',
      partOfSpeech: 'adjective',
      definition: 'Representing the most perfect or typical example of a quality or class.',
      examples: [
        'She is the quintessential entrepreneur, always innovating and taking risks.',
        'Paris is often considered the quintessential romantic city.',
        'His novel captures the quintessential American experience.',
      ],
      etymology: 'From medieval Latin quinta essentia (fifth essence), referring to a fifth element beyond earth, water, fire, and air.',
      difficulty: 'intermediate',
      synonyms: ['archetypal', 'classic', 'ideal', 'exemplary', 'definitive'],
      antonyms: ['atypical', 'unusual', 'uncharacteristic'],
    },
    {
      word: 'Sycophant',
      pronunciation: '/ˈsikəfant/',
      partOfSpeech: 'noun',
      definition: 'A person who acts obsequiously toward someone important to gain advantage; a flatterer.',
      examples: [
        'The CEO surrounded himself with sycophants who never challenged his decisions.',
        'She refused to be a sycophant, preferring to speak her mind.',
        'The politician\'s sycophants praised every speech, regardless of its quality.',
      ],
      etymology: 'From Greek sykophantēs, originally meaning "informer" or "false accuser." The modern meaning evolved in the 16th century.',
      difficulty: 'advanced',
      synonyms: ['flatterer', 'toady', 'yes-man', 'bootlicker', 'fawner'],
      antonyms: ['critic', 'detractor', 'opponent'],
    },
    {
      word: 'Laconic',
      pronunciation: '/ləˈkänik/',
      partOfSpeech: 'adjective',
      definition: 'Using very few words; brief and concise in speech or expression.',
      examples: [
        'His laconic response of "yes" ended the hour-long debate.',
        'The laconic telegram read simply: "Arrived safely. Love."',
        'She appreciated his laconic style after dealing with verbose colleagues all day.',
      ],
      etymology: 'From Greek Lakōnikos, referring to the Spartans of Laconia, who were known for their brief, pithy speech.',
      difficulty: 'advanced',
      synonyms: ['terse', 'concise', 'succinct', 'brief', 'pithy'],
      antonyms: ['verbose', 'wordy', 'loquacious', 'garrulous'],
    },
  ];

  const currentWord = words[currentWordIndex];

  const difficultyColors: Record<DifficultyLevel, { bg: string; text: string; darkBg: string }> = {
    beginner: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30' },
    intermediate: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30' },
    advanced: { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'bg-purple-900/30' },
    expert: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30' },
  };

  const quizQuestion = useMemo((): QuizQuestion => {
    const wrongAnswers = words
      .filter((_, i) => i !== currentWordIndex)
      .map((w) => w.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [...wrongAnswers, currentWord.definition].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(currentWord.definition);

    return {
      question: `What is the meaning of "${currentWord.word}"?`,
      options,
      correctIndex,
    };
  }, [currentWordIndex, currentWord.definition, currentWord.word, words]);

  const handlePrevWord = () => {
    setCurrentWordIndex((prev) => (prev === 0 ? words.length - 1 : prev - 1));
    resetQuiz();
  };

  const handleNextWord = () => {
    setCurrentWordIndex((prev) => (prev === words.length - 1 ? 0 : prev + 1));
    resetQuiz();
  };

  const handleRandomWord = () => {
    let newIndex = Math.floor(Math.random() * words.length);
    while (newIndex === currentWordIndex && words.length > 1) {
      newIndex = Math.floor(Math.random() * words.length);
    }
    setCurrentWordIndex(newIndex);
    resetQuiz();
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    setQuestionsAnswered((prev) => prev + 1);
    if (index === quizQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const difficultyStyle = difficultyColors[currentWord.difficulty];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wordOfTheDay.wordOfTheDay', 'Word of the Day')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wordOfTheDay.expandYourVocabularyDaily', 'Expand your vocabulary daily')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuizMode(!isQuizMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isQuizMode
                  ? 'bg-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-1" />
              {t('tools.wordOfTheDay.quizMode', 'Quiz Mode')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Word Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevWord}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Word {currentWordIndex + 1} of {words.length}
            </span>
            <button
              onClick={handleRandomWord}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              title={t('tools.wordOfTheDay.randomWord', 'Random word')}
            >
              <RefreshCw className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <button
            onClick={handleNextWord}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Main Word Display */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border text-center`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentWord.word}</h2>
            <button
              onClick={speakWord}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-colors`}
              title={t('tools.wordOfTheDay.listenToPronunciation', 'Listen to pronunciation')}
            >
              <Volume2 className="w-5 h-5 text-indigo-500" />
            </button>
          </div>
          <p className={`text-lg ${isDark ? 'text-indigo-300' : 'text-indigo-600'} mb-2`}>{currentWord.pronunciation}</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}>
              {currentWord.partOfSpeech}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${isDark ? difficultyStyle.darkBg : difficultyStyle.bg} ${difficultyStyle.text}`}>
              {currentWord.difficulty}
            </span>
          </div>
        </div>

        {!isQuizMode ? (
          <>
            {/* Definition */}
            <div className="space-y-2">
              <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                {t('tools.wordOfTheDay.definition', 'Definition')}
              </h4>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{currentWord.definition}</p>
            </div>

            {/* Example Sentences */}
            <div className="space-y-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wordOfTheDay.exampleSentences', 'Example Sentences')}</h4>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentWord.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span className="italic">{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wordOfTheDay.synonyms', 'Synonyms')}</h4>
                <div className="flex flex-wrap gap-1">
                  {currentWord.synonyms.map((syn, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wordOfTheDay.antonyms', 'Antonyms')}</h4>
                <div className="flex flex-wrap gap-1">
                  {currentWord.antonyms.map((ant, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Etymology */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wordOfTheDay.etymology', 'Etymology')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentWord.etymology}</p>
            </div>
          </>
        ) : (
          /* Quiz Mode */
          <div className="space-y-4">
            {/* Score Display */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-between`}>
              <div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wordOfTheDay.yourScore', 'Your Score')}</span>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {score} / {questionsAnswered}
                </div>
              </div>
              {questionsAnswered > 0 && (
                <div className={`text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="text-sm">{t('tools.wordOfTheDay.accuracy', 'Accuracy')}</span>
                  <div className="text-lg font-semibold text-indigo-500">
                    {Math.round((score / questionsAnswered) * 100)}%
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Question */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{quizQuestion.question}</h4>
              <div className="space-y-2">
                {quizQuestion.options.map((option, index) => {
                  let buttonStyle = isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50';

                  if (showResult) {
                    if (index === quizQuestion.correctIndex) {
                      buttonStyle = 'bg-green-500 text-white';
                    } else if (index === selectedAnswer && index !== quizQuestion.correctIndex) {
                      buttonStyle = 'bg-red-500 text-white';
                    }
                  } else if (selectedAnswer === index) {
                    buttonStyle = 'bg-indigo-500 text-white';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-3 rounded-lg text-left text-sm transition-colors flex items-center justify-between ${buttonStyle} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span>{option}</span>
                      {showResult && index === quizQuestion.correctIndex && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      {showResult && index === selectedAnswer && index !== quizQuestion.correctIndex && (
                        <XCircle className="w-5 h-5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Question Button */}
            {showResult && (
              <button
                onClick={handleNextWord}
                className="w-full py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              >
                {t('tools.wordOfTheDay.nextWord', 'Next Word')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordOfTheDayTool;
