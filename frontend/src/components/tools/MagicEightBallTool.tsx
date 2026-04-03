import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleDot, History, RotateCcw, Sparkles, MessageCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PredictionResult {
  id: string;
  question: string;
  answer: string;
  type: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}

const MAGIC_8_BALL_RESPONSES = {
  positive: [
    'It is certain',
    'It is decidedly so',
    'Without a doubt',
    'Yes definitely',
    'You may rely on it',
    'As I see it, yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',
  ],
  neutral: [
    'Reply hazy, try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
  ],
  negative: [
    'Don\'t count on it',
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful',
  ],
};

interface MagicEightBallToolProps {
  uiConfig?: UIConfig;
}

export const MagicEightBallTool: React.FC<MagicEightBallToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<{ text: string; type: 'positive' | 'neutral' | 'negative' } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        question?: string;
      };
      if (params.question || params.text) {
        setQuestion(params.question || params.text || '');
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const getRandomResponse = useCallback(() => {
    const rand = Math.random();
    let type: 'positive' | 'neutral' | 'negative';
    let responses: string[];

    if (rand < 0.5) {
      type = 'positive';
      responses = MAGIC_8_BALL_RESPONSES.positive;
    } else if (rand < 0.75) {
      type = 'neutral';
      responses = MAGIC_8_BALL_RESPONSES.neutral;
    } else {
      type = 'negative';
      responses = MAGIC_8_BALL_RESPONSES.negative;
    }

    const answer = responses[Math.floor(Math.random() * responses.length)];
    return { text: answer, type };
  }, []);

  const shakeBall = useCallback(() => {
    if (!question.trim()) return;

    setIsShaking(true);
    setShowAnswer(false);
    setCurrentAnswer(null);

    // Shake animation
    setTimeout(() => {
      const response = getRandomResponse();
      setCurrentAnswer(response);
      setIsShaking(false);

      // Delay showing the answer for dramatic effect
      setTimeout(() => {
        setShowAnswer(true);

        // Add to history
        const result: PredictionResult = {
          id: Date.now().toString(),
          question: question.trim(),
          answer: response.text,
          type: response.type,
          timestamp: new Date().toISOString(),
        };
        setHistory(prev => [result, ...prev].slice(0, 20));
      }, 300);
    }, 1500);
  }, [question, getRandomResponse]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getAnswerColor = (type: 'positive' | 'neutral' | 'negative') => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'neutral':
        return 'text-yellow-400';
      case 'negative':
        return 'text-red-400';
    }
  };

  const getAnswerBgColor = (type: 'positive' | 'neutral' | 'negative') => {
    switch (type) {
      case 'positive':
        return isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200';
      case 'neutral':
        return isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      case 'negative':
        return isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/30' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <CircleDot className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.magicEightBall.title')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.magicEightBall.description')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.magicEightBall.questionLoaded')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Question Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.magicEightBall.yourQuestion')}
          </label>
          <div className="relative">
            <MessageCircle className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('tools.magicEightBall.placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && shakeBall()}
              className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </div>

        {/* Magic 8 Ball Display */}
        <div className="flex justify-center py-8">
          <div
            className={`relative w-56 h-56 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl ${
              isShaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''
            }`}
            style={{
              boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Inner circle (window) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center shadow-inner">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-800 to-indigo-900 flex items-center justify-center ${
                showAnswer ? 'opacity-100' : 'opacity-70'
              } transition-opacity duration-500`}>
                {/* Triangle with answer */}
                <div className="relative w-20 h-20">
                  {/* Triangle background */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                      points="50,10 90,85 10,85"
                      fill={showAnswer && currentAnswer ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                  </svg>
                  {/* Answer text */}
                  {showAnswer && currentAnswer ? (
                    <div className={`absolute inset-0 flex items-center justify-center text-center px-2 ${getAnswerColor(currentAnswer.type)}`}>
                      <span className="text-xs font-bold leading-tight drop-shadow-lg">
                        {currentAnswer.text}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/30 text-2xl font-bold">8</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Highlight reflection */}
            <div className="absolute top-4 left-8 w-16 h-8 bg-white/10 rounded-full blur-md transform -rotate-45" />
          </div>
        </div>

        {/* Shake Button */}
        <button
          onClick={shakeBall}
          disabled={isShaking || !question.trim()}
          className={`w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-purple-500/30 ${
            isShaking ? 'animate-pulse cursor-not-allowed' : ''
          } ${!question.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isShaking ? t('tools.magicEightBall.revealing') : t('tools.magicEightBall.shakeButton')}
        </button>

        {/* Current Answer Display */}
        {showAnswer && currentAnswer && (
          <div className={`p-6 rounded-xl border text-center ${getAnswerBgColor(currentAnswer.type)}`}>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.magicEightBall.ballSays')}
            </p>
            <p className={`text-2xl font-bold ${getAnswerColor(currentAnswer.type)}`}>
              "{currentAnswer.text}"
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.magicEightBall.previousQuestions')}
                </h4>
              </div>
              <button
                onClick={clearHistory}
                className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <RotateCcw className="w-3 h-3" />
                {t('tools.magicEightBall.clear')}
              </button>
            </div>
            <div className={`max-h-48 overflow-y-auto space-y-2 ${isDark ? 'scrollbar-dark' : ''}`}>
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Q: {item.question}
                  </p>
                  <p className={`font-medium ${getAnswerColor(item.type)}`}>
                    A: {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.magicEightBall.tip')}:</strong> {t('tools.magicEightBall.tipText')}
          </p>
        </div>
      </div>

      {/* Custom shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
};

export default MagicEightBallTool;
