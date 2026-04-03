import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, History, RotateCcw, Sparkles, Copy, Check, Shuffle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface LotterySet {
  id: string;
  numbers: number[];
  bonusNumber?: number;
  lotteryType: string;
  timestamp: string;
}

interface LotteryType {
  name: string;
  mainNumbers: number;
  maxNumber: number;
  bonusNumbers?: number;
  bonusMax?: number;
  bonusName?: string;
}

const LOTTERY_TYPES: Record<string, LotteryType> = {
  'powerball': {
    name: 'Powerball (US)',
    mainNumbers: 5,
    maxNumber: 69,
    bonusNumbers: 1,
    bonusMax: 26,
    bonusName: 'Powerball',
  },
  'megamillions': {
    name: 'Mega Millions (US)',
    mainNumbers: 5,
    maxNumber: 70,
    bonusNumbers: 1,
    bonusMax: 25,
    bonusName: 'Mega Ball',
  },
  'euromillions': {
    name: 'EuroMillions',
    mainNumbers: 5,
    maxNumber: 50,
    bonusNumbers: 2,
    bonusMax: 12,
    bonusName: 'Lucky Stars',
  },
  'lotto': {
    name: 'Classic 6/49',
    mainNumbers: 6,
    maxNumber: 49,
  },
  'pick3': {
    name: 'Pick 3',
    mainNumbers: 3,
    maxNumber: 9,
  },
  'pick4': {
    name: 'Pick 4',
    mainNumbers: 4,
    maxNumber: 9,
  },
  'custom': {
    name: 'Custom',
    mainNumbers: 6,
    maxNumber: 49,
  },
};

interface LotteryPickerToolProps {
  uiConfig?: UIConfig;
}

export const LotteryPickerTool: React.FC<LotteryPickerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [lotteryType, setLotteryType] = useState('powerball');
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<LotterySet[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [setsToGenerate, setSetsToGenerate] = useState(1);

  // Custom lottery settings
  const [customMainCount, setCustomMainCount] = useState(6);
  const [customMaxNumber, setCustomMaxNumber] = useState(49);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        lotteryType?: string;
        setsToGenerate?: number;
      };
      if (params.lotteryType && LOTTERY_TYPES[params.lotteryType]) {
        setLotteryType(params.lotteryType);
      }
      if (params.setsToGenerate) setSetsToGenerate(params.setsToGenerate);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const getConfig = useCallback(() => {
    const config = LOTTERY_TYPES[lotteryType];
    if (lotteryType === 'custom') {
      return {
        ...config,
        mainNumbers: customMainCount,
        maxNumber: customMaxNumber,
      };
    }
    return config;
  }, [lotteryType, customMainCount, customMaxNumber]);

  const generateNumbers = useCallback((count: number, max: number, allowDuplicates = false): number[] => {
    if (allowDuplicates) {
      return Array(count).fill(0).map(() => Math.floor(Math.random() * (max)) + 1);
    }

    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * max) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  }, []);

  const generateLottery = useCallback(() => {
    const config = getConfig();
    setIsGenerating(true);

    // Animate number generation
    let animCount = 0;
    const maxAnim = 15;
    const interval = setInterval(() => {
      const allowDuplicates = lotteryType === 'pick3' || lotteryType === 'pick4';
      setCurrentNumbers(generateNumbers(config.mainNumbers, config.maxNumber, allowDuplicates));
      if (config.bonusNumbers && config.bonusMax) {
        setBonusNumbers(generateNumbers(config.bonusNumbers, config.bonusMax));
      }
      animCount++;

      if (animCount >= maxAnim) {
        clearInterval(interval);
        setIsGenerating(false);

        // Final numbers
        const finalNumbers = generateNumbers(config.mainNumbers, config.maxNumber, allowDuplicates);
        setCurrentNumbers(finalNumbers);

        let finalBonus: number[] = [];
        if (config.bonusNumbers && config.bonusMax) {
          finalBonus = generateNumbers(config.bonusNumbers, config.bonusMax);
          setBonusNumbers(finalBonus);
        }

        // Add to history
        const result: LotterySet = {
          id: Date.now().toString(),
          numbers: finalNumbers,
          bonusNumber: finalBonus[0],
          lotteryType: config.name,
          timestamp: new Date().toISOString(),
        };
        setHistory(prev => [result, ...prev].slice(0, 30));
      }
    }, 60);
  }, [getConfig, generateNumbers, lotteryType]);

  const generateMultipleSets = useCallback(() => {
    const config = getConfig();
    const allowDuplicates = lotteryType === 'pick3' || lotteryType === 'pick4';
    const sets: LotterySet[] = [];

    for (let i = 0; i < setsToGenerate; i++) {
      const numbers = generateNumbers(config.mainNumbers, config.maxNumber, allowDuplicates);
      let bonus: number[] = [];
      if (config.bonusNumbers && config.bonusMax) {
        bonus = generateNumbers(config.bonusNumbers, config.bonusMax);
      }

      sets.push({
        id: `${Date.now()}-${i}`,
        numbers,
        bonusNumber: bonus[0],
        lotteryType: config.name,
        timestamp: new Date().toISOString(),
      });
    }

    setHistory(prev => [...sets, ...prev].slice(0, 50));
    if (sets.length > 0) {
      setCurrentNumbers(sets[0].numbers);
      if (sets[0].bonusNumber) {
        setBonusNumbers([sets[0].bonusNumber]);
      }
    }
  }, [getConfig, generateNumbers, lotteryType, setsToGenerate]);

  const copyNumbers = useCallback(() => {
    const config = getConfig();
    let text = currentNumbers.join(' - ');
    if (config.bonusNumbers && bonusNumbers.length > 0) {
      text += ` | ${config.bonusName}: ${bonusNumbers.join(', ')}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentNumbers, bonusNumbers, getConfig]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const config = getConfig();

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Ticket className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lotteryPicker.lotteryNumberPicker', 'Lottery Number Picker')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lotteryPicker.generateRandomLotteryNumbersFor', 'Generate random lottery numbers for any game')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.lotteryPicker.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Lottery Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lotteryPicker.lotteryGame', 'Lottery Game')}
          </label>
          <select
            value={lotteryType}
            onChange={(e) => {
              setLotteryType(e.target.value);
              setCurrentNumbers([]);
              setBonusNumbers([]);
            }}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            {Object.entries(LOTTERY_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </div>

        {/* Custom Settings */}
        {lotteryType === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.lotteryPicker.numbersToPick', 'Numbers to Pick')}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={customMainCount}
                onChange={(e) => setCustomMainCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.lotteryPicker.maximumNumber', 'Maximum Number')}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={customMaxNumber}
                onChange={(e) => setCustomMaxNumber(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>
        )}

        {/* Generated Numbers Display */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
          <div className="text-center mb-4">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.name}: Pick {config.mainNumbers} from 1-{config.maxNumber}
            </span>
          </div>

          {/* Main Numbers */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {currentNumbers.length > 0 ? (
              currentNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all ${
                    isGenerating ? 'animate-bounce' : ''
                  } ${
                    isDark
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white'
                      : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {num}
                </div>
              ))
            ) : (
              Array(config.mainNumbers).fill(0).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                    isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  ?
                </div>
              ))
            )}
          </div>

          {/* Bonus Numbers */}
          {config.bonusNumbers && (
            <div className="flex flex-wrap justify-center gap-3">
              <span className={`self-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {config.bonusName}:
              </span>
              {bonusNumbers.length > 0 ? (
                bonusNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
                      isGenerating ? 'animate-bounce' : ''
                    } ${
                      isDark
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    }`}
                  >
                    {num}
                  </div>
                ))
              ) : (
                Array(config.bonusNumbers).fill(0).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    ?
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateLottery}
            disabled={isGenerating}
            className={`flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-500/30 ${
              isGenerating ? 'animate-pulse cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? t('tools.lotteryPicker.generating', 'Generating...') : t('tools.lotteryPicker.generateNumbers', 'Generate Numbers')}
          </button>
          {currentNumbers.length > 0 && (
            <button
              onClick={copyNumbers}
              className={`px-4 py-4 rounded-xl transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Multiple Sets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lotteryPicker.generateMultipleSets', 'Generate Multiple Sets')}
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              max="20"
              value={setsToGenerate}
              onChange={(e) => setSetsToGenerate(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <button
              onClick={generateMultipleSets}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Generate {setsToGenerate} Sets
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Generated Sets ({history.length})
                </h4>
              </div>
              <button
                onClick={clearHistory}
                className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <RotateCcw className="w-3 h-3" />
                {t('tools.lotteryPicker.clear', 'Clear')}
              </button>
            </div>
            <div className={`max-h-48 overflow-y-auto space-y-2 ${isDark ? 'scrollbar-dark' : ''}`}>
              {history.map((set) => (
                <div
                  key={set.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {set.numbers.map((num, idx) => (
                      <span
                        key={idx}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isDark
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                    {set.bonusNumber && (
                      <>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>+</span>
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isDark
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {set.bonusNumber}
                        </span>
                      </>
                    )}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(set.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.lotteryPicker.disclaimer', 'Disclaimer:')}</strong> These numbers are randomly generated for entertainment purposes only. This tool does not increase your chances of winning any lottery. Please gamble responsibly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LotteryPickerTool;
