import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Hash, Calendar, Sparkles, Copy, Check, RefreshCw, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface LuckyNumbers {
  primary: number;
  secondary: number[];
  powerNumber: number;
  destinyNumber: number;
  personalYear: number;
}

interface NumerologyInfo {
  number: number;
  meaning: string;
  traits: string[];
}

const numerologyMeanings: NumerologyInfo[] = [
  { number: 1, meaning: 'Leadership & Independence', traits: ['Pioneer', 'Ambitious', 'Self-starter'] },
  { number: 2, meaning: 'Harmony & Partnership', traits: ['Diplomatic', 'Cooperative', 'Sensitive'] },
  { number: 3, meaning: 'Creativity & Expression', traits: ['Artistic', 'Optimistic', 'Communicative'] },
  { number: 4, meaning: 'Stability & Foundation', traits: ['Practical', 'Organized', 'Dedicated'] },
  { number: 5, meaning: 'Freedom & Adventure', traits: ['Dynamic', 'Versatile', 'Curious'] },
  { number: 6, meaning: 'Love & Responsibility', traits: ['Nurturing', 'Caring', 'Balanced'] },
  { number: 7, meaning: 'Wisdom & Spirituality', traits: ['Analytical', 'Intuitive', 'Thoughtful'] },
  { number: 8, meaning: 'Power & Abundance', traits: ['Ambitious', 'Authoritative', 'Successful'] },
  { number: 9, meaning: 'Compassion & Completion', traits: ['Humanitarian', 'Generous', 'Wise'] },
];

interface LuckyNumberToolProps {
  uiConfig?: UIConfig;
}

export const LuckyNumberTool: React.FC<LuckyNumberToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [birthDate, setBirthDate] = useState('');
  const [luckyNumbers, setLuckyNumbers] = useState<LuckyNumbers | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const calculateLuckyNumbers = useCallback(() => {
    if (!birthDate) return;

    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    // Primary lucky number (Life Path Number)
    const lifePath = reduceToSingleDigit(
      String(day).split('').reduce((s, d) => s + parseInt(d), 0) +
      String(month).split('').reduce((s, d) => s + parseInt(d), 0) +
      String(year).split('').reduce((s, d) => s + parseInt(d), 0)
    );

    // Destiny number (from day of birth)
    const destinyNumber = reduceToSingleDigit(day);

    // Personal year number
    const personalYear = reduceToSingleDigit(
      String(day).split('').reduce((s, d) => s + parseInt(d), 0) +
      String(month).split('').reduce((s, d) => s + parseInt(d), 0) +
      String(currentYear).split('').reduce((s, d) => s + parseInt(d), 0)
    );

    // Power number (combination of life path and destiny)
    const powerNumber = reduceToSingleDigit(lifePath + destinyNumber);

    // Secondary lucky numbers (derived from various calculations)
    const secondary: number[] = [];
    secondary.push((lifePath * 3) % 49 + 1);
    secondary.push((destinyNumber * 7) % 49 + 1);
    secondary.push((day + month) % 49 + 1);
    secondary.push((year % 100 + lifePath) % 49 + 1);
    secondary.push((personalYear * 5 + destinyNumber) % 49 + 1);

    // Remove duplicates and sort
    const uniqueSecondary = [...new Set(secondary)].sort((a, b) => a - b).slice(0, 5);

    setLuckyNumbers({
      primary: lifePath,
      secondary: uniqueSecondary,
      powerNumber,
      destinyNumber,
      personalYear,
    });
  }, [birthDate]);

  const copyNumbers = useCallback(async () => {
    if (!luckyNumbers) return;

    const text = `Lucky Numbers based on birthdate:\n` +
      `Life Path Number: ${luckyNumbers.primary}\n` +
      `Destiny Number: ${luckyNumbers.destinyNumber}\n` +
      `Power Number: ${luckyNumbers.powerNumber}\n` +
      `Personal Year: ${luckyNumbers.personalYear}\n` +
      `Lottery Numbers: ${luckyNumbers.secondary.join(', ')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [luckyNumbers]);

  const getNumerologyInfo = (num: number): NumerologyInfo => {
    const singleDigit = num > 9 ? reduceToSingleDigit(num) : num;
    return numerologyMeanings.find(n => n.number === singleDigit) || numerologyMeanings[0];
  };

  const reset = () => {
    setBirthDate('');
    setLuckyNumbers(null);
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <Hash size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.luckyNumber.luckyNumberGenerator', 'Lucky Number Generator')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.luckyNumber.discoverYourPersonalLuckyNumbers', 'Discover your personal lucky numbers through numerology')}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className={`p-6 rounded-xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
            <label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.luckyNumber.enterYourBirthDate', 'Enter Your Birth Date')}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
            />
            <button
              onClick={calculateLuckyNumbers}
              disabled={!birthDate}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                birthDate
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles size={20} />
              {t('tools.luckyNumber.generateNumbers', 'Generate Numbers')}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {luckyNumbers && (
          <div className="space-y-4">
            {/* Primary Numbers */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.luckyNumber.yourNumerologyNumbers', 'Your Numerology Numbers')}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title={t('tools.luckyNumber.toggleMeanings', 'Toggle meanings')}
                  >
                    <Info size={18} />
                  </button>
                  <button
                    onClick={copyNumbers}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title={t('tools.luckyNumber.copyNumbers', 'Copy numbers')}
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Life Path Number */}
                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-teal-900/30 border border-teal-700' : 'bg-teal-50 border border-teal-200'}`}>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-teal-300' : 'text-teal-600'}`}>
                    {luckyNumbers.primary}
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                    {t('tools.luckyNumber.lifePath', 'Life Path')}
                  </div>
                  {showInfo && (
                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getNumerologyInfo(luckyNumbers.primary).meaning}
                    </div>
                  )}
                </div>

                {/* Destiny Number */}
                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                    {luckyNumbers.destinyNumber}
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                    {t('tools.luckyNumber.destiny', 'Destiny')}
                  </div>
                  {showInfo && (
                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getNumerologyInfo(luckyNumbers.destinyNumber).meaning}
                    </div>
                  )}
                </div>

                {/* Power Number */}
                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                    {luckyNumbers.powerNumber}
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    {t('tools.luckyNumber.power', 'Power')}
                  </div>
                  {showInfo && (
                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getNumerologyInfo(luckyNumbers.powerNumber).meaning}
                    </div>
                  )}
                </div>

                {/* Personal Year */}
                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                    {luckyNumbers.personalYear}
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    {t('tools.luckyNumber.personalYear', 'Personal Year')}
                  </div>
                  {showInfo && (
                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getNumerologyInfo(luckyNumbers.personalYear).meaning}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lottery Numbers */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.luckyNumber.yourLuckyLotteryNumbers', 'Your Lucky Lottery Numbers')}
              </h2>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {luckyNumbers.secondary.map((num, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 flex items-center justify-center rounded-full text-xl font-bold ${
                      isDark
                        ? 'bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg'
                        : 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.luckyNumber.theseNumbersAreDerivedFrom', 'These numbers are derived from your birth date numerology')}
              </p>
            </div>

            {/* Life Path Meaning */}
            {showInfo && (
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  Life Path {luckyNumbers.primary}: {getNumerologyInfo(luckyNumbers.primary).meaning}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getNumerologyInfo(luckyNumbers.primary).traits.map((trait, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={reset}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw size={18} />
              {t('tools.luckyNumber.tryAnotherDate', 'Try Another Date')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!luckyNumbers && (
          <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Hash size={64} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.luckyNumber.enterYourBirthDate2', 'Enter your birth date')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {t('tools.luckyNumber.toDiscoverYourPersonalizedLucky', 'to discover your personalized lucky numbers')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyNumberTool;
