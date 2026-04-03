import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface LoveResult {
  percentage: number;
  message: string;
  emoji: string;
  color: string;
}

interface LoveCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const LoveCalculatorTool: React.FC<LoveCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState<LoveResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || '';

      // Try to extract two names from content
      if (textContent) {
        const namePatterns = [
          /(\w+)\s+and\s+(\w+)/i,
          /(\w+)\s*&\s*(\w+)/i,
          /(\w+)\s*,\s*(\w+)/i,
        ];

        for (const pattern of namePatterns) {
          const match = textContent.match(pattern);
          if (match) {
            setName1(match[1]);
            setName2(match[2]);
            setIsPrefilled(true);
            break;
          }
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateLove = () => {
    if (!name1.trim() || !name2.trim()) {
      return;
    }

    setIsCalculating(true);

    // Fun algorithm: combine names, sum character codes, apply modulo
    const combined = (name1 + name2).toLowerCase().replace(/\s/g, '');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }

    // Use the hash to generate a consistent percentage for the same name pair
    const percentage = Math.abs(hash % 101);

    // Determine result message based on percentage
    let message: string;
    let emoji: string;
    let color: string;

    if (percentage >= 90) {
      message = "Perfect match! You two are soulmates!";
      emoji = "fire";
      color = "#ef4444";
    } else if (percentage >= 75) {
      message = "Excellent compatibility! Love is in the air!";
      emoji = "hearts";
      color = "#f97316";
    } else if (percentage >= 60) {
      message = "Good match! There's definitely a spark here.";
      emoji = "sparkles";
      color = "#eab308";
    } else if (percentage >= 45) {
      message = "Moderate compatibility. Worth exploring!";
      emoji = "star";
      color = "#22c55e";
    } else if (percentage >= 30) {
      message = "Some challenges ahead, but love conquers all!";
      emoji = "heart";
      color = "#3b82f6";
    } else {
      message = "Opposites attract! Maybe there's hidden chemistry.";
      emoji = "question";
      color = "#8b5cf6";
    }

    setTimeout(() => {
      setResult({
        percentage,
        message,
        emoji,
        color,
      });
      setIsCalculating(false);
    }, 1500);
  };

  const reset = () => {
    setName1('');
    setName2('');
    setResult(null);
  };

  const getHeartFillPercentage = (percentage: number) => {
    return percentage;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.loveCalculator.loveCalculator', 'Love Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.loveCalculator.calculateYourLoveCompatibility', 'Calculate your love compatibility')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.loveCalculator.namesLoadedFromYourConversation', 'Names loaded from your conversation')}</span>
          </div>
        )}

        {/* Name Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.loveCalculator.yourName', 'Your Name')}
            </label>
            <input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder={t('tools.loveCalculator.enterYourName', 'Enter your name')}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            />
          </div>

          <div className="flex justify-center">
            <Heart className={`w-8 h-8 ${isDark ? 'text-pink-400' : 'text-pink-500'} animate-pulse`} />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.loveCalculator.partnerSName', 'Partner\'s Name')}
            </label>
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder={t('tools.loveCalculator.enterPartnerSName', 'Enter partner\'s name')}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={calculateLove}
            disabled={!name1.trim() || !name2.trim() || isCalculating}
            className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {t('tools.loveCalculator.calculating', 'Calculating...')}
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                {t('tools.loveCalculator.calculateLove', 'Calculate Love')}
              </>
            )}
          </button>
          <button
            onClick={reset}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('tools.loveCalculator.reset', 'Reset')}
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div className="space-y-4">
            <div
              className={`p-6 rounded-lg text-center ${
                isDark ? 'bg-gray-800' : 'bg-pink-50'
              }`}
              style={{ borderLeft: `4px solid ${result.color}` }}
            >
              {/* Heart Animation */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <clipPath id="heartClip">
                      <path d="M50,88 C20,65 5,45 5,30 C5,15 15,5 30,5 C40,5 50,15 50,25 C50,15 60,5 70,5 C85,5 95,15 95,30 C95,45 80,65 50,88 Z" />
                    </clipPath>
                  </defs>
                  <path
                    d="M50,88 C20,65 5,45 5,30 C5,15 15,5 30,5 C40,5 50,15 50,25 C50,15 60,5 70,5 C85,5 95,15 95,30 C95,45 80,65 50,88 Z"
                    fill={isDark ? '#374151' : '#fce7f3'}
                    stroke={result.color}
                    strokeWidth="2"
                  />
                  <rect
                    x="0"
                    y={100 - getHeartFillPercentage(result.percentage)}
                    width="100"
                    height={getHeartFillPercentage(result.percentage)}
                    fill={result.color}
                    clipPath="url(#heartClip)"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {result.percentage}%
                  </span>
                </div>
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {name1} & {name2}
              </h3>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.message}
              </p>
            </div>

            {/* Compatibility Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.loveCalculator.compatibilityFactors', 'Compatibility Factors')}
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Emotional Connection', value: Math.min(100, result.percentage + 10) },
                  { label: 'Communication', value: Math.max(0, result.percentage - 5) },
                  { label: 'Trust & Loyalty', value: Math.min(100, result.percentage + 5) },
                  { label: 'Shared Interests', value: result.percentage },
                ].map((factor) => (
                  <div key={factor.label}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {factor.label}
                      </span>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {factor.value}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${factor.value}%`,
                          backgroundColor: result.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center`}>
            {t('tools.loveCalculator.thisIsJustForFun', 'This is just for fun! Real relationships are built on communication, trust, and mutual respect.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoveCalculatorTool;
