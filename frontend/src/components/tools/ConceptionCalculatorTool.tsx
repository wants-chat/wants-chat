import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Calendar, Heart, Sparkles, Info, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ConceptionCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMethod = 'dueDate' | 'birthDate' | 'ultrasound';

interface ConceptionResult {
  conceptionDate: Date;
  conceptionWindowStart: Date;
  conceptionWindowEnd: Date;
  lmpDate: Date;
  gestationalAgeAtBirth: number;
}

export const ConceptionCalculatorTool: React.FC<ConceptionCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [method, setMethod] = useState<CalculationMethod>('dueDate');
  const [dueDate, setDueDate] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ultrasoundDate, setUltrasoundDate] = useState('');
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState('8');
  const [ultrasoundDays, setUltrasoundDays] = useState('0');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const dateMatch = params.content.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          setDueDate(dateMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo((): ConceptionResult | null => {
    let estimatedDueDate: Date | null = null;

    switch (method) {
      case 'dueDate':
        if (!dueDate) return null;
        estimatedDueDate = new Date(dueDate);
        break;
      case 'birthDate':
        if (!birthDate) return null;
        // Assume full-term pregnancy (40 weeks)
        estimatedDueDate = new Date(birthDate);
        break;
      case 'ultrasound':
        if (!ultrasoundDate) return null;
        const usDate = new Date(ultrasoundDate);
        const weeksAtScan = parseInt(ultrasoundWeeks) || 0;
        const daysAtScan = parseInt(ultrasoundDays) || 0;
        const totalDaysAtScan = weeksAtScan * 7 + daysAtScan;
        estimatedDueDate = new Date(usDate);
        estimatedDueDate.setDate(usDate.getDate() + (280 - totalDaysAtScan));
        break;
    }

    if (!estimatedDueDate) return null;

    // Conception typically occurs around day 14 of the menstrual cycle
    // Due date is 280 days (40 weeks) from LMP
    // Conception is 266 days (38 weeks) before due date

    const conceptionDate = new Date(estimatedDueDate);
    conceptionDate.setDate(estimatedDueDate.getDate() - 266);

    // Conception window: typically 5 days before to 1 day after ovulation
    const conceptionWindowStart = new Date(conceptionDate);
    conceptionWindowStart.setDate(conceptionDate.getDate() - 5);

    const conceptionWindowEnd = new Date(conceptionDate);
    conceptionWindowEnd.setDate(conceptionDate.getDate() + 1);

    // LMP is 14 days before conception (280 - 266 = 14)
    const lmpDate = new Date(estimatedDueDate);
    lmpDate.setDate(estimatedDueDate.getDate() - 280);

    // Calculate gestational age at birth (for birth date method)
    let gestationalAgeAtBirth = 280;
    if (method === 'birthDate' && birthDate) {
      const birth = new Date(birthDate);
      gestationalAgeAtBirth = Math.round((birth.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      conceptionDate,
      conceptionWindowStart,
      conceptionWindowEnd,
      lmpDate,
      gestationalAgeAtBirth,
    };
  }, [method, dueDate, birthDate, ultrasoundDate, ultrasoundWeeks, ultrasoundDays]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getZodiacSign = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', symbol: '♈' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', symbol: '♉' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', symbol: '♊' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', symbol: '♋' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', symbol: '♌' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', symbol: '♍' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', symbol: '♎' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', symbol: '♏' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: 'Sagittarius', symbol: '♐' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: 'Capricorn', symbol: '♑' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', symbol: '♒' };
    return { sign: 'Pisces', symbol: '♓' };
  };

  const getDateInput = () => {
    switch (method) {
      case 'dueDate':
        return (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.conceptionCalculator.dueDateOrEstimatedDue', 'Due Date or Estimated Due Date')}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        );
      case 'birthDate':
        return (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.conceptionCalculator.babySBirthDate', 'Baby\'s Birth Date')}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        );
      case 'ultrasound':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.conceptionCalculator.ultrasoundDate', 'Ultrasound Date')}
              </label>
              <input
                type="date"
                value={ultrasoundDate}
                onChange={(e) => setUltrasoundDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.conceptionCalculator.gestationalAgeWeeks', 'Gestational Age - Weeks')}
                </label>
                <input
                  type="number"
                  value={ultrasoundWeeks}
                  onChange={(e) => setUltrasoundWeeks(e.target.value)}
                  min="0"
                  max="42"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.conceptionCalculator.days', 'Days')}
                </label>
                <input
                  type="number"
                  value={ultrasoundDays}
                  onChange={(e) => setUltrasoundDays(e.target.value)}
                  min="0"
                  max="6"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Heart className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.conceptionCalculator.conceptionDateCalculator', 'Conception Date Calculator')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.conceptionCalculator.calculateWhenConceptionLikelyOccurred', 'Calculate when conception likely occurred')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {t('tools.conceptionCalculator.dateLoadedFromYourConversation', 'Date loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Calculation Method */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.conceptionCalculator.calculateFrom', 'Calculate From')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dueDate', name: 'Due Date' },
                  { id: 'birthDate', name: 'Birth Date' },
                  { id: 'ultrasound', name: 'Ultrasound' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as CalculationMethod)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      method === m.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Input */}
            {getDateInput()}

            {/* Results */}
            {result && (
              <>
                {/* Conception Date */}
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.conceptionCalculator.estimatedConceptionDate', 'Estimated Conception Date')}
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488] my-2">
                    {formatDate(result.conceptionDate)}
                  </div>
                  <div className={`flex items-center justify-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-2xl">{getZodiacSign(result.conceptionDate).symbol}</span>
                    <span>Conceived under {getZodiacSign(result.conceptionDate).sign}</span>
                  </div>
                </div>

                {/* Conception Window */}
                <div className={`p-4 rounded-lg border-l-4 border-pink-500 ${isDark ? 'bg-gray-700' : 'bg-pink-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.conceptionCalculator.possibleConceptionWindow', 'Possible Conception Window')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-pink-600`}>
                      {formatDateShort(result.conceptionWindowStart)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-pink-400" />
                    <span className={`font-bold text-pink-600`}>
                      {formatDateShort(result.conceptionWindowEnd)}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {t('tools.conceptionCalculator.spermCanSurviveUpTo', 'Sperm can survive up to 5 days, so conception could have occurred within this range')}
                  </div>
                </div>

                {/* Key Dates */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('tools.conceptionCalculator.keyDates', 'Key Dates')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {t('tools.conceptionCalculator.lastMenstrualPeriodLmp', 'Last Menstrual Period (LMP)')}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDateShort(result.lmpDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {t('tools.conceptionCalculator.ovulationConception', 'Ovulation/Conception')}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDateShort(result.conceptionDate)}
                      </span>
                    </div>
                    {method === 'birthDate' && (
                      <div className="flex justify-between items-center">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {t('tools.conceptionCalculator.gestationalAgeAtBirth', 'Gestational Age at Birth')}
                        </span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {Math.floor(result.gestationalAgeAtBirth / 7)} weeks, {result.gestationalAgeAtBirth % 7} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Visual */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Baby className="w-4 h-4 inline mr-2" />
                    {t('tools.conceptionCalculator.pregnancyTimeline', 'Pregnancy Timeline')}
                  </h4>
                  <div className="relative">
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0D9488] to-pink-500 w-full" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="text-center">
                        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.conceptionCalculator.lmp', 'LMP')}</div>
                        <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conceptionCalculator.week0', 'Week 0')}</div>
                      </div>
                      <div className="text-center">
                        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.conceptionCalculator.conception', 'Conception')}</div>
                        <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conceptionCalculator.week2', 'Week 2')}</div>
                      </div>
                      <div className="text-center">
                        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.conceptionCalculator.birth', 'Birth')}</div>
                        <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.conceptionCalculator.week40', 'Week 40')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Conception typically occurs about 2 weeks after the first day of your last menstrual period. This calculator provides an estimate; actual conception date may vary by a few days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptionCalculatorTool;
