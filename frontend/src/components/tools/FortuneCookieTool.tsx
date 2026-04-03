import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Sparkles, RefreshCw, Copy, Check, Heart, History } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Fortune {
  id: string;
  message: string;
  luckyNumbers: number[];
  category: 'wisdom' | 'love' | 'career' | 'health' | 'adventure';
  timestamp: Date;
}

const fortuneMessages: { message: string; category: Fortune['category'] }[] = [
  { message: "A journey of a thousand miles begins with a single step.", category: 'wisdom' },
  { message: "Your hard work will soon pay off in unexpected ways.", category: 'career' },
  { message: "Love is closer than you think. Keep your heart open.", category: 'love' },
  { message: "Good health and vitality are on your horizon.", category: 'health' },
  { message: "Adventure awaits you just around the corner.", category: 'adventure' },
  { message: "The best time to plant a tree was 20 years ago. The second best time is now.", category: 'wisdom' },
  { message: "Success is not final, failure is not fatal. It is the courage to continue that counts.", category: 'career' },
  { message: "Someone is thinking of you right now with great affection.", category: 'love' },
  { message: "Your positive energy will attract wonderful opportunities.", category: 'career' },
  { message: "Trust your intuition. It knows the way.", category: 'wisdom' },
  { message: "A surprise gift will bring you joy this week.", category: 'love' },
  { message: "Your creativity will lead to a breakthrough.", category: 'career' },
  { message: "Balance in all things brings harmony to your life.", category: 'health' },
  { message: "New experiences will broaden your perspective.", category: 'adventure' },
  { message: "Kindness you show others will return to you tenfold.", category: 'wisdom' },
  { message: "An old friend will bring unexpected news.", category: 'love' },
  { message: "Your determination will overcome any obstacle.", category: 'career' },
  { message: "Rest and relaxation are essential for your well-being.", category: 'health' },
  { message: "A chance encounter will change your path.", category: 'adventure' },
  { message: "The universe is aligning in your favor.", category: 'wisdom' },
  { message: "Your smile brightens someone's day more than you know.", category: 'love' },
  { message: "Financial abundance is flowing toward you.", category: 'career' },
  { message: "Listen to your body. It speaks the truth.", category: 'health' },
  { message: "Say yes to that invitation. Magic awaits.", category: 'adventure' },
  { message: "Patience today will bring rewards tomorrow.", category: 'wisdom' },
  { message: "A romantic opportunity presents itself. Be bold.", category: 'love' },
  { message: "Your unique talents will be recognized soon.", category: 'career' },
  { message: "Inner peace is your greatest treasure.", category: 'health' },
  { message: "The road less traveled holds your destiny.", category: 'adventure' },
  { message: "Wisdom comes to those who are willing to wait.", category: 'wisdom' },
];

interface FortuneCookieToolProps {
  uiConfig?: UIConfig;
}

export const FortuneCookieTool: React.FC<FortuneCookieToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [history, setHistory] = useState<Fortune[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const generateLuckyNumbers = useCallback((): number[] => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  }, []);

  const openCookie = useCallback(() => {
    setIsOpening(true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fortuneMessages.length);
      const fortuneData = fortuneMessages[randomIndex];

      const newFortune: Fortune = {
        id: Date.now().toString(),
        message: fortuneData.message,
        luckyNumbers: generateLuckyNumbers(),
        category: fortuneData.category,
        timestamp: new Date(),
      };

      setCurrentFortune(newFortune);
      setHistory(prev => [newFortune, ...prev].slice(0, 10));
      setIsOpening(false);
    }, 1500);
  }, [generateLuckyNumbers]);

  const copyFortune = useCallback(async () => {
    if (!currentFortune) return;

    const text = `${currentFortune.message}\n\nLucky Numbers: ${currentFortune.luckyNumbers.join(', ')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [currentFortune]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  }, []);

  const getCategoryColor = (category: Fortune['category']) => {
    const colors = {
      wisdom: isDark ? 'text-purple-400 bg-purple-900/30 border-purple-700' : 'text-purple-600 bg-purple-50 border-purple-200',
      love: isDark ? 'text-pink-400 bg-pink-900/30 border-pink-700' : 'text-pink-600 bg-pink-50 border-pink-200',
      career: isDark ? 'text-teal-400 bg-teal-900/30 border-teal-700' : 'text-teal-600 bg-teal-50 border-teal-200',
      health: isDark ? 'text-green-400 bg-green-900/30 border-green-700' : 'text-green-600 bg-green-50 border-green-200',
      adventure: isDark ? 'text-orange-400 bg-orange-900/30 border-orange-700' : 'text-orange-600 bg-orange-50 border-orange-200',
    };
    return colors[category];
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <Cookie size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fortuneCookie.fortuneCookie', 'Fortune Cookie')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.fortuneCookie.crackOpenACookieTo', 'Crack open a cookie to reveal your fortune')}
            </p>
          </div>
        </div>

        {/* Cookie Container */}
        <div className={`p-8 rounded-2xl border mb-6 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {!currentFortune && !isOpening ? (
            <div className="py-8">
              <div className="text-8xl mb-6 animate-bounce">🥠</div>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.fortuneCookie.clickTheButtonToOpen', 'Click the button to open your fortune cookie!')}
              </p>
              <button
                onClick={openCookie}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <Cookie size={24} />
                {t('tools.fortuneCookie.openFortuneCookie', 'Open Fortune Cookie')}
              </button>
            </div>
          ) : isOpening ? (
            <div className="py-12">
              <div className="text-8xl mb-6 animate-spin">🥠</div>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.fortuneCookie.crackingOpenYourCookie', 'Cracking open your cookie...')}
              </p>
              <div className="flex justify-center mt-4">
                <Sparkles className="text-teal-500 animate-pulse" size={32} />
              </div>
            </div>
          ) : currentFortune ? (
            <div className="py-6">
              <div className="text-6xl mb-6">📜</div>

              {/* Category Badge */}
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(currentFortune.category)}`}>
                  {currentFortune.category.charAt(0).toUpperCase() + currentFortune.category.slice(1)}
                </span>
              </div>

              {/* Fortune Message */}
              <blockquote className={`text-xl md:text-2xl font-medium italic mb-6 px-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                "{currentFortune.message}"
              </blockquote>

              {/* Lucky Numbers */}
              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.fortuneCookie.luckyNumbers', 'Lucky Numbers')}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {currentFortune.luckyNumbers.map((num, idx) => (
                    <span
                      key={idx}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                        isDark ? 'bg-teal-900/50 text-teal-300 border border-teal-700' : 'bg-teal-100 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={openCookie}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-teal-900/50 text-teal-300 hover:bg-teal-900' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                  }`}
                >
                  <RefreshCw size={18} />
                  {t('tools.fortuneCookie.newFortune', 'New Fortune')}
                </button>
                <button
                  onClick={copyFortune}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  {copied ? t('tools.fortuneCookie.copied', 'Copied!') : t('tools.fortuneCookie.copy', 'Copy')}
                </button>
                <button
                  onClick={() => toggleFavorite(currentFortune.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    favorites.has(currentFortune.id)
                      ? isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-700'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Heart size={18} fill={favorites.has(currentFortune.id) ? t('tools.fortuneCookie.currentcolor', 'currentColor') : 'none'} />
                  {favorites.has(currentFortune.id) ? t('tools.fortuneCookie.saved', 'Saved') : t('tools.fortuneCookie.save', 'Save')}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* History Toggle */}
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl mb-4 transition-colors ${
              isDark ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History size={18} />
            {showHistory ? t('tools.fortuneCookie.hide', 'Hide') : t('tools.fortuneCookie.show', 'Show')} Fortune History ({history.length})
          </button>
        )}

        {/* History Section */}
        {showHistory && history.length > 0 && (
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fortuneCookie.recentFortunes', 'Recent Fortunes')}
            </h2>
            <div className="space-y-3">
              {history.map((fortune) => (
                <div
                  key={fortune.id}
                  className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm italic flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      "{fortune.message}"
                    </p>
                    <button
                      onClick={() => toggleFavorite(fortune.id)}
                      className={favorites.has(fortune.id) ? 'text-pink-500' : isDark ? 'text-gray-500' : 'text-gray-400'}
                    >
                      <Heart size={16} fill={favorites.has(fortune.id) ? t('tools.fortuneCookie.currentcolor2', 'currentColor') : 'none'} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(fortune.category)}`}>
                      {fortune.category}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {fortune.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FortuneCookieTool;
