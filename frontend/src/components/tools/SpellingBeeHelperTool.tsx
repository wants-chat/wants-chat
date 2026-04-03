import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Volume2, Trophy, Target, Check, X, RotateCcw, Info, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SpellingBeeHelperToolProps {
  uiConfig?: UIConfig;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

interface WordData {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  difficulty: DifficultyLevel;
  commonMisspelling?: string;
}

interface ProgressData {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}

export const SpellingBeeHelperTool: React.FC<SpellingBeeHelperToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.difficulty) setDifficulty(data.difficulty as DifficultyLevel);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState<ProgressData>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
  });

  const wordDatabase: Record<DifficultyLevel, WordData[]> = {
    easy: [
      { word: 'receive', pronunciation: 'ri-SEEV', definition: 'To get or be given something', example: 'I will receive a gift tomorrow.', difficulty: 'easy', commonMisspelling: 'recieve' },
      { word: 'believe', pronunciation: 'bi-LEEV', definition: 'To accept something as true', example: 'I believe in hard work.', difficulty: 'easy', commonMisspelling: 'beleive' },
      { word: 'separate', pronunciation: 'SEP-uh-rayt', definition: 'To divide or keep apart', example: 'Please separate the colors from whites.', difficulty: 'easy', commonMisspelling: 'seperate' },
      { word: 'friend', pronunciation: 'frend', definition: 'A person you like and enjoy spending time with', example: 'She is my best friend.', difficulty: 'easy', commonMisspelling: 'freind' },
      { word: 'because', pronunciation: 'bi-KAWZ', definition: 'For the reason that', example: 'I stayed home because it was raining.', difficulty: 'easy', commonMisspelling: 'becuase' },
    ],
    medium: [
      { word: 'necessary', pronunciation: 'NES-uh-ser-ee', definition: 'Required or essential', example: 'Water is necessary for survival.', difficulty: 'medium', commonMisspelling: 'neccessary' },
      { word: 'accommodate', pronunciation: 'uh-KOM-uh-dayt', definition: 'To provide space or lodging', example: 'The hotel can accommodate 200 guests.', difficulty: 'medium', commonMisspelling: 'accomodate' },
      { word: 'occurrence', pronunciation: 'uh-KUR-uhns', definition: 'An event or incident', example: 'This is a rare occurrence.', difficulty: 'medium', commonMisspelling: 'occurence' },
      { word: 'definitely', pronunciation: 'DEF-uh-nit-lee', definition: 'Without doubt; certainly', example: 'I will definitely attend the meeting.', difficulty: 'medium', commonMisspelling: 'definately' },
      { word: 'embarrass', pronunciation: 'em-BARE-uhs', definition: 'To cause someone to feel awkward', example: 'Please do not embarrass me in public.', difficulty: 'medium', commonMisspelling: 'embarass' },
    ],
    hard: [
      { word: 'conscientious', pronunciation: 'kon-shee-EN-shuhs', definition: 'Wishing to do what is right', example: 'She is a conscientious worker.', difficulty: 'hard', commonMisspelling: 'consciencious' },
      { word: 'accommodate', pronunciation: 'uh-KOM-uh-dayt', definition: 'To fit in with wishes or needs', example: 'We will accommodate your request.', difficulty: 'hard', commonMisspelling: 'acommodate' },
      { word: 'maintenance', pronunciation: 'MAYN-tuh-nuhns', definition: 'The process of keeping something in good condition', example: 'Regular maintenance is important.', difficulty: 'hard', commonMisspelling: 'maintainance' },
      { word: 'perseverance', pronunciation: 'pur-suh-VEER-uhns', definition: 'Persistence in doing something despite difficulty', example: 'Success requires perseverance.', difficulty: 'hard', commonMisspelling: 'perserverance' },
      { word: 'mischievous', pronunciation: 'MIS-chuh-vuhs', definition: 'Causing or showing a fondness for causing trouble', example: 'The mischievous cat knocked over the vase.', difficulty: 'hard', commonMisspelling: 'mischievious' },
    ],
    expert: [
      { word: 'onomatopoeia', pronunciation: 'on-uh-mat-uh-PEE-uh', definition: 'Formation of a word from a sound', example: 'Buzz is an example of onomatopoeia.', difficulty: 'expert' },
      { word: 'pneumonia', pronunciation: 'noo-MOH-nyuh', definition: 'A lung infection causing inflammation', example: 'He was hospitalized with pneumonia.', difficulty: 'expert', commonMisspelling: 'pnemonia' },
      { word: 'pseudonym', pronunciation: 'SOO-duh-nim', definition: 'A fictitious name, especially for an author', example: 'Mark Twain was a pseudonym.', difficulty: 'expert', commonMisspelling: 'psuedonym' },
      { word: 'sacrilegious', pronunciation: 'sak-ruh-LIJ-uhs', definition: 'Violating something sacred', example: 'Some considered the act sacrilegious.', difficulty: 'expert', commonMisspelling: 'sacreligious' },
      { word: 'acquiesce', pronunciation: 'ak-wee-ES', definition: 'To accept something reluctantly', example: 'She had to acquiesce to their demands.', difficulty: 'expert', commonMisspelling: 'aquiesce' },
    ],
  };

  const difficultyConfig = {
    easy: { name: 'Easy', color: 'green', description: 'Common everyday words' },
    medium: { name: 'Medium', color: 'yellow', description: 'Frequently misspelled words' },
    hard: { name: 'Hard', color: 'orange', description: 'Challenging vocabulary' },
    expert: { name: 'Expert', color: 'red', description: 'Advanced and rare words' },
  };

  const currentWords = wordDatabase[difficulty];
  const currentWord = currentWords[currentWordIndex];

  const accuracyPercentage = useMemo(() => {
    const total = progress.correct + progress.incorrect;
    if (total === 0) return 0;
    return Math.round((progress.correct / total) * 100);
  }, [progress.correct, progress.incorrect]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = () => {
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);

    if (isCorrect) {
      const newStreak = progress.streak + 1;
      setProgress({
        ...progress,
        correct: progress.correct + 1,
        streak: newStreak,
        bestStreak: Math.max(newStreak, progress.bestStreak),
      });
    } else {
      setProgress({
        ...progress,
        incorrect: progress.incorrect + 1,
        streak: 0,
      });
    }
  };

  const handleNextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % currentWords.length);
    setUserInput('');
    setShowAnswer(false);
    setFeedback(null);
    setShowHint(false);
  };

  const handleReset = () => {
    setProgress({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
    setCurrentWordIndex(0);
    setUserInput('');
    setShowAnswer(false);
    setFeedback(null);
    setShowHint(false);
  };

  const getHint = () => {
    const word = currentWord.word;
    const hintLength = Math.ceil(word.length / 3);
    return word.slice(0, hintLength) + '_'.repeat(word.length - hintLength);
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    const colors = {
      easy: 'text-green-500',
      medium: 'text-yellow-500',
      hard: 'text-orange-500',
      expert: 'text-red-500',
    };
    return colors[level];
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><BookOpen className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.spellingBeeHelper.spellingBeeHelper', 'Spelling Bee Helper')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.spellingBeeHelper.practiceSpellingWithAudioAnd', 'Practice spelling with audio and definitions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Tracker */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-xl font-bold text-green-500">{progress.correct}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.spellingBeeHelper.correct', 'Correct')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <X className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-xl font-bold text-red-500">{progress.incorrect}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.spellingBeeHelper.incorrect', 'Incorrect')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-500">{accuracyPercentage}%</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.spellingBeeHelper.accuracy', 'Accuracy')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-xl font-bold text-yellow-500">{progress.bestStreak}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.spellingBeeHelper.bestStreak', 'Best Streak')}</div>
          </div>
        </div>

        {/* Current Streak */}
        {progress.streak > 0 && (
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Current Streak: {progress.streak}
              </span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        )}

        {/* Difficulty Selection */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(difficultyConfig) as DifficultyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
                setCurrentWordIndex(0);
                setUserInput('');
                setShowAnswer(false);
                setFeedback(null);
                setShowHint(false);
              }}
              className={`py-2 px-3 rounded-lg text-sm ${difficulty === level ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {difficultyConfig[level].name}
            </button>
          ))}
        </div>

        {/* Difficulty Description */}
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <span className={getDifficultyColor(difficulty)}>{difficultyConfig[difficulty].description}</span>
        </div>

        {/* Word Card */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          {/* Pronunciation Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleSpeak}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
              <span>{t('tools.spellingBeeHelper.listenToWord', 'Listen to Word')}</span>
            </button>
          </div>

          {/* Pronunciation Guide */}
          <div className="text-center mb-4">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.spellingBeeHelper.pronunciation', 'Pronunciation:')}</span>
            <span className={`font-mono ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{currentWord.pronunciation}</span>
          </div>

          {/* Definition */}
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.spellingBeeHelper.definition', 'Definition:')}</h4>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{currentWord.definition}</p>
          </div>

          {/* Example Sentence */}
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.spellingBeeHelper.example', 'Example:')}</h4>
            <p className={`italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{currentWord.example}"</p>
          </div>

          {/* Hint */}
          {showHint && !showAnswer && (
            <div className={`p-3 rounded-lg mb-4 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <span className={`font-mono text-lg ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{getHint()}</span>
            </div>
          )}

          {/* Common Misspelling Warning */}
          {currentWord.commonMisspelling && !showAnswer && (
            <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                  Often misspelled as: <span className="line-through">{currentWord.commonMisspelling}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.spellingBeeHelper.spellTheWord', 'Spell the word:')}
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !showAnswer && handleSubmit()}
              disabled={showAnswer}
              placeholder={t('tools.spellingBeeHelper.typeYourAnswer', 'Type your answer...')}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'} ${feedback === 'correct' ? 'border-green-500' : feedback === 'incorrect' ? 'border-red-500' : ''}`}
            />
          </div>

          {/* Feedback */}
          {showAnswer && (
            <div className={`p-4 rounded-lg text-center ${feedback === 'correct' ? (isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
              {feedback === 'correct' ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>{t('tools.spellingBeeHelper.correctWellDone', 'Correct! Well done!')}</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <X className="w-5 h-5 text-red-500" />
                    <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>{t('tools.spellingBeeHelper.notQuiteRight', 'Not quite right')}</span>
                  </div>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    The correct spelling is: <span className="font-bold text-purple-500">{currentWord.word}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!showAnswer ? (
              <>
                <button
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  className={`flex-1 py-3 rounded-lg ${showHint ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.spellingBeeHelper.showHint', 'Show Hint')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className={`flex-1 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 ${!userInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('tools.spellingBeeHelper.checkSpelling', 'Check Spelling')}
                </button>
              </>
            ) : (
              <button
                onClick={handleNextWord}
                className="flex-1 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
              >
                {t('tools.spellingBeeHelper.nextWord', 'Next Word')}
              </button>
            )}
          </div>
        </div>

        {/* Word Progress */}
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Word {currentWordIndex + 1} of {currentWords.length} ({difficultyConfig[difficulty].name} level)
          </span>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <RotateCcw className="w-4 h-4" />
          {t('tools.spellingBeeHelper.resetProgress', 'Reset Progress')}
        </button>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.spellingBeeHelper.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Listen to the pronunciation before spelling</li>
                <li>- Pay attention to commonly misspelled patterns</li>
                <li>- Use the example sentence for context</li>
                <li>- Build your streak for extra motivation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellingBeeHelperTool;
