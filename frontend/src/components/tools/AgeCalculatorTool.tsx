import React, { useState, useEffect } from 'react';
import { Calendar, Cake, Sparkles, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthdayDays: number;
  nextBirthdayDate: string;
}

interface AgeCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function AgeCalculatorTool({ uiConfig }: AgeCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // For age calculator, we could prefill from a date mentioned in conversation
      if (params.content) {
        // Try to extract a date from the content
        const dateMatch = params.content.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          setBirthDate(dateMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateAge = () => {
    if (!birthDate) {
      setValidationMessage('Please select a birth date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();

    if (birth > today) {
      setValidationMessage('Birth date cannot be in the future');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate age
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days
    const timeDiff = today.getTime() - birth.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate next birthday
    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

    if (nextBirthday < today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }

    const nextBirthdayDiff = nextBirthday.getTime() - today.getTime();
    const nextBirthdayDays = Math.ceil(nextBirthdayDiff / (1000 * 60 * 60 * 24));

    const nextBirthdayDateStr = nextBirthday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setResult({
      years,
      months,
      days,
      totalDays,
      nextBirthdayDays,
      nextBirthdayDate: nextBirthdayDateStr
    });
  };

  const reset = () => {
    setBirthDate('');
    setResult(null);
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.ageCalculator.ageCalculator', 'Age Calculator')}
            </h1>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.ageCalculator.dateLoadedFromYourConversation', 'Date loaded from your conversation')}</span>
            </div>
          )}

          {/* Validation Message */}
          {validationMessage && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">{validationMessage}</span>
            </div>
          )}

          {/* Date Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.ageCalculator.birthDate', 'Birth Date')}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={getMaxDate()}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateAge}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              {t('tools.ageCalculator.calculateAge', 'Calculate Age')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.ageCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Main Age Display */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.ageCalculator.bg0d948815', 'bg-[#0D9488]15')
              }`}>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-[#0D9488] mb-2">
                    {result.years}
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.ageCalculator.yearsOld', 'Years Old')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="text-2xl font-bold text-[#0D9488]">{result.months}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.ageCalculator.months', 'Months')}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="text-2xl font-bold text-[#0D9488]">{result.days}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.ageCalculator.days', 'Days')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.ageCalculator.detailedInformation', 'Detailed Information')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.exactAge', 'Exact Age:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.years} years, {result.months} months, {result.days} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.totalDaysLived', 'Total Days Lived:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.totalDays.toLocaleString()} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.totalMonths', 'Total Months:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(result.years * 12 + result.months).toLocaleString()} months
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.totalWeeks', 'Total Weeks:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {Math.floor(result.totalDays / 7).toLocaleString()} weeks
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.totalHours', 'Total Hours:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(result.totalDays * 24).toLocaleString()} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.totalMinutes', 'Total Minutes:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(result.totalDays * 24 * 60).toLocaleString()} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Birthday Countdown */}
              <div className={`p-6 rounded-lg border-l-4 border-pink-500 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-pink-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Cake className="w-6 h-6 text-pink-500" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.ageCalculator.nextBirthdayCountdown', 'Next Birthday Countdown')}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.daysUntilBirthday', 'Days Until Birthday:')}
                    </span>
                    <span className="text-2xl font-bold text-pink-500">
                      {result.nextBirthdayDays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.ageCalculator.nextBirthday', 'Next Birthday:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.nextBirthdayDate}
                    </span>
                  </div>
                  {result.nextBirthdayDays === 0 && (
                    <div className="text-center mt-3 text-pink-500 font-bold text-lg">
                      {t('tools.ageCalculator.happyBirthday', 'Happy Birthday!')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              This calculator computes your exact age based on your birth date and the current date.
              It also shows various time units and counts down to your next birthday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
