import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Play, Pause, RotateCcw, Trophy, Clock, Target, CheckCircle2, XCircle, Zap, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MathFactsPracticeToolProps {
  uiConfig?: UIConfig;
}

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

interface Stats {
  totalAnswered: number;
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  averageTime: number;
  totalTime: number;
}

const operationSymbols: Record<Operation, string> = {
  add: '+',
  subtract: '-',
  multiply: '\u00d7',
  divide: '\u00f7',
};

const operationNames: Record<Operation, string> = {
  add: 'Addition',
  subtract: 'Subtraction',
  multiply: 'Multiplication',
  divide: 'Division',
};

const difficultyConfig: Record<Difficulty, { label: string; maxNum: number; description: string }> = {
  easy: { label: 'Easy', maxNum: 10, description: 'Numbers 1-10' },
  medium: { label: 'Medium', maxNum: 12, description: 'Numbers 1-12' },
  hard: { label: 'Hard', maxNum: 20, description: 'Numbers 1-20' },
};

export const MathFactsPracticeTool: React.FC<MathFactsPracticeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [operation, setOperation] = useState<Operation>('add');

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.operation) setOperation(data.operation as Operation);
      if (data.difficulty) setDifficulty(data.difficulty as Difficulty);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60); // seconds
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [problemStartTime, setProblemStartTime] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({
    totalAnswered: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    averageTime: 0,
    totalTime: 0,
  });

  const generateProblem = useCallback((): Problem => {
    const maxNum = difficultyConfig[difficulty].maxNum;
    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;
    let answer: number;

    switch (operation) {
      case 'add':
        answer = num1 + num2;
        break;
      case 'subtract':
        // Ensure positive result
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case 'multiply':
        answer = num1 * num2;
        break;
      case 'divide':
        // Ensure clean division
        answer = num1;
        num1 = num1 * num2;
        break;
      default:
        answer = num1 + num2;
    }

    return { num1, num2, operation, answer };
  }, [operation, difficulty]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setStats({
      totalAnswered: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      averageTime: 0,
      totalTime: 0,
    });
    setTimeRemaining(timeLimit);
    setFeedback(null);
    setUserAnswer('');
    const problem = generateProblem();
    setCurrentProblem(problem);
    setProblemStartTime(Date.now());
  }, [generateProblem, timeLimit]);

  const pauseGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setCurrentProblem(null);
    setUserAnswer('');
    setFeedback(null);
    setStats({
      totalAnswered: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      averageTime: 0,
      totalTime: 0,
    });
    setTimeRemaining(timeLimit);
  }, [timeLimit]);

  const checkAnswer = useCallback(() => {
    if (!currentProblem || userAnswer === '') return;

    const answerTime = (Date.now() - problemStartTime) / 1000;
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setStats((prev) => {
      const newTotalTime = prev.totalTime + answerTime;
      const newTotalAnswered = prev.totalAnswered + 1;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        totalAnswered: newTotalAnswered,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalTime: newTotalTime,
        averageTime: newTotalTime / newTotalAnswered,
      };
    });

    // Move to next problem after feedback
    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      const problem = generateProblem();
      setCurrentProblem(problem);
      setProblemStartTime(Date.now());
    }, 500);
  }, [currentProblem, userAnswer, problemStartTime, generateProblem]);

  // Timer effect
  useEffect(() => {
    if (!isPlaying || !timedMode) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timedMode]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isPlaying && userAnswer !== '') {
        checkAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, userAnswer, checkAnswer]);

  const accuracy = useMemo(() => {
    if (stats.totalAnswered === 0) return 0;
    return Math.round((stats.correct / stats.totalAnswered) * 100);
  }, [stats.correct, stats.totalAnswered]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Calculator className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mathFactsPractice.mathFactsPractice', 'Math Facts Practice')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mathFactsPractice.masterYourMathFactsWith', 'Master your math facts with timed drills')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Operation Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.mathFactsPractice.operation', 'Operation')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(operationSymbols) as Operation[]).map((op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                disabled={isPlaying}
                className={`py-3 px-3 rounded-lg text-center transition-colors ${
                  operation === op
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-xl font-bold">{operationSymbols[op]}</div>
                <div className="text-xs mt-1">{operationNames[op]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.mathFactsPractice.difficulty', 'Difficulty')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                disabled={isPlaying}
                className={`py-2 px-3 rounded-lg text-center transition-colors ${
                  difficulty === diff
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">{difficultyConfig[diff].label}</div>
                <div className="text-xs opacity-75">{difficultyConfig[diff].description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timed Mode Toggle */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mathFactsPractice.timedMode', 'Timed Mode')}</span>
            </div>
            <button
              onClick={() => setTimedMode(!timedMode)}
              disabled={isPlaying}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                timedMode ? 'bg-purple-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  timedMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {timedMode && (
            <div className="mt-3 flex gap-2">
              {[30, 60, 120, 180].map((secs) => (
                <button
                  key={secs}
                  onClick={() => {
                    setTimeLimit(secs);
                    setTimeRemaining(secs);
                  }}
                  disabled={isPlaying}
                  className={`flex-1 py-1 px-2 rounded text-sm ${
                    timeLimit === secs
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {formatTime(secs)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Play className="w-5 h-5" />
              {stats.totalAnswered > 0 ? t('tools.mathFactsPractice.playAgain', 'Play Again') : t('tools.mathFactsPractice.startPractice', 'Start Practice')}
            </button>
          ) : (
            <button
              onClick={pauseGame}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Pause className="w-5 h-5" />
              {t('tools.mathFactsPractice.pause', 'Pause')}
            </button>
          )}
          <button
            onClick={resetGame}
            className={`px-4 py-3 rounded-lg transition-colors ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Display (when timed mode is active and playing) */}
        {timedMode && isPlaying && (
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-4xl font-bold ${timeRemaining <= 10 ? 'text-red-500' : 'text-purple-500'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mathFactsPractice.timeRemaining', 'Time Remaining')}</div>
          </div>
        )}

        {/* Problem Display */}
        {currentProblem && isPlaying && (
          <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${
            feedback === 'correct' ? 'ring-2 ring-green-500' : feedback === 'incorrect' ? 'ring-2 ring-red-500' : ''
          }`}>
            <div className={`text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentProblem.num1} {operationSymbols[currentProblem.operation]} {currentProblem.num2} = ?
            </div>
            <div className="flex items-center justify-center gap-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t('tools.mathFactsPractice.yourAnswer', 'Your answer')}
                autoFocus
                className={`w-32 px-4 py-3 text-2xl text-center rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              <button
                onClick={checkAnswer}
                disabled={userAnswer === ''}
                className={`px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${
                  userAnswer === '' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {t('tools.mathFactsPractice.check', 'Check')}
              </button>
            </div>
            {feedback && (
              <div className={`mt-4 flex items-center justify-center gap-2 text-lg ${
                feedback === 'correct' ? 'text-green-500' : 'text-red-500'
              }`}>
                {feedback === 'correct' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    {t('tools.mathFactsPractice.correct2', 'Correct!')}
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    The answer was {currentProblem.answer}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Game Over Screen (when timed mode ends) */}
        {timedMode && timeRemaining === 0 && !isPlaying && stats.totalAnswered > 0 && (
          <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mathFactsPractice.timeSUp', 'Time\'s Up!')}</h4>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You answered {stats.correct} out of {stats.totalAnswered} correctly!
            </p>
          </div>
        )}

        {/* Stats Display */}
        {stats.totalAnswered > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mathFactsPractice.progressStats', 'Progress Stats')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mathFactsPractice.accuracy', 'Accuracy')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{accuracy}%</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {stats.correct}/{stats.totalAnswered} correct
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mathFactsPractice.streak', 'Streak')}</span>
                </div>
                <div className="text-3xl font-bold text-yellow-500">{stats.streak}</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Best: {stats.bestStreak}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mathFactsPractice.correct', 'Correct')}</span>
                </div>
                <div className="text-3xl font-bold text-green-500">{stats.correct}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mathFactsPractice.avgTime', 'Avg Time')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{stats.averageTime.toFixed(1)}s</div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {!isPlaying && stats.totalAnswered === 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.mathFactsPractice.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>* Practice regularly for best results</li>
                <li>* Start with easier problems and work up</li>
                <li>* Use timed mode to build speed</li>
                <li>* Try to beat your best streak!</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathFactsPracticeTool;
