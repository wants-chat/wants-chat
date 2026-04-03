import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Calendar, Clock, Sparkles, Info, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface OvulationCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface OvulationResult {
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  peakFertilityDays: Date[];
  nextPeriodDate: Date;
  cyclePhases: {
    menstrual: { start: Date; end: Date };
    follicular: { start: Date; end: Date };
    ovulation: { start: Date; end: Date };
    luteal: { start: Date; end: Date };
  };
}

export const OvulationCalculatorTool: React.FC<OvulationCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const dateMatch = params.content.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          setLastPeriodDate(dateMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo((): OvulationResult | null => {
    if (!lastPeriodDate) return null;

    const lmp = new Date(lastPeriodDate);
    const cycle = parseInt(cycleLength) || 28;
    const period = parseInt(periodLength) || 5;

    // Ovulation typically occurs 14 days before the next period
    const lutealPhase = 14;
    const ovulationDay = cycle - lutealPhase;

    const ovulationDate = new Date(lmp);
    ovulationDate.setDate(lmp.getDate() + ovulationDay);

    // Fertile window: 5 days before ovulation + ovulation day + 1 day after
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(ovulationDate.getDate() - 5);

    const fertileWindowEnd = new Date(ovulationDate);
    fertileWindowEnd.setDate(ovulationDate.getDate() + 1);

    // Peak fertility: 2 days before ovulation + ovulation day
    const peakFertilityDays = [
      new Date(ovulationDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      new Date(ovulationDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      ovulationDate,
    ];

    // Next period date
    const nextPeriodDate = new Date(lmp);
    nextPeriodDate.setDate(lmp.getDate() + cycle);

    // Cycle phases
    const menstrualEnd = new Date(lmp);
    menstrualEnd.setDate(lmp.getDate() + period - 1);

    const follicularStart = new Date(menstrualEnd);
    follicularStart.setDate(menstrualEnd.getDate() + 1);

    const follicularEnd = new Date(ovulationDate);
    follicularEnd.setDate(ovulationDate.getDate() - 1);

    const ovulationEnd = new Date(ovulationDate);
    ovulationEnd.setDate(ovulationDate.getDate() + 1);

    const lutealStart = new Date(ovulationEnd);
    lutealStart.setDate(ovulationEnd.getDate() + 1);

    const lutealEnd = new Date(nextPeriodDate);
    lutealEnd.setDate(nextPeriodDate.getDate() - 1);

    return {
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      peakFertilityDays,
      nextPeriodDate,
      cyclePhases: {
        menstrual: { start: lmp, end: menstrualEnd },
        follicular: { start: follicularStart, end: follicularEnd },
        ovulation: { start: ovulationDate, end: ovulationEnd },
        luteal: { start: lutealStart, end: lutealEnd },
      },
    };
  }, [lastPeriodDate, cycleLength, periodLength]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
                  {t('tools.ovulationCalculator.ovulationCalculator', 'Ovulation Calculator')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.ovulationCalculator.calculateYourFertileWindowAnd', 'Calculate your fertile window and ovulation date')}
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
                  {t('tools.ovulationCalculator.dateLoadedFromYourConversation', 'Date loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.ovulationCalculator.firstDayOfLastPeriod', 'First Day of Last Period')}
                </label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.ovulationCalculator.cycleLengthDays', 'Cycle Length (days)')}
                  </label>
                  <select
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {Array.from({ length: 21 }, (_, i) => i + 20).map((days) => (
                      <option key={days} value={days}>
                        {days} days {days === 28 ? '(average)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.ovulationCalculator.periodLengthDays', 'Period Length (days)')}
                  </label>
                  <select
                    value={periodLength}
                    onChange={(e) => setPeriodLength(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 2).map((days) => (
                      <option key={days} value={days}>
                        {days} days
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            {result && (
              <>
                {/* Ovulation Date */}
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.ovulationCalculator.estimatedOvulationDate', 'Estimated Ovulation Date')}
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488] my-2">
                    {formatDateFull(result.ovulationDate)}
                  </div>
                  {getDaysUntil(result.ovulationDate) >= 0 && (
                    <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {getDaysUntil(result.ovulationDate) === 0
                        ? 'Today!'
                        : `${getDaysUntil(result.ovulationDate)} days from now`}
                    </div>
                  )}
                </div>

                {/* Fertile Window */}
                <div className={`p-4 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.ovulationCalculator.fertileWindow', 'Fertile Window')}
                    </span>
                  </div>
                  <div className={`text-lg font-bold text-green-600`}>
                    {formatDate(result.fertileWindowStart)} - {formatDate(result.fertileWindowEnd)}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {t('tools.ovulationCalculator.7DaysWhenConceptionIs', '7 days when conception is most likely')}
                  </div>
                </div>

                {/* Peak Fertility Days */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Heart className="w-4 h-4 inline mr-2 text-red-500" />
                    {t('tools.ovulationCalculator.peakFertilityDaysHighestChance', 'Peak Fertility Days (Highest Chance)')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.peakFertilityDays.map((day, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isDark
                            ? 'bg-red-900/30 text-red-300 border border-red-700'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {formatDate(day)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cycle Phases */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('tools.ovulationCalculator.cyclePhases', 'Cycle Phases')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.ovulationCalculator.menstrual', 'Menstrual')}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(result.cyclePhases.menstrual.start)} - {formatDate(result.cyclePhases.menstrual.end)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.ovulationCalculator.follicular', 'Follicular')}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(result.cyclePhases.follicular.start)} - {formatDate(result.cyclePhases.follicular.end)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.ovulationCalculator.ovulation', 'Ovulation')}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(result.cyclePhases.ovulation.start)} - {formatDate(result.cyclePhases.ovulation.end)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.ovulationCalculator.luteal', 'Luteal')}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(result.cyclePhases.luteal.start)} - {formatDate(result.cyclePhases.luteal.end)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Period */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#0D9488]" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.ovulationCalculator.nextPeriodExpected', 'Next Period Expected')}
                    </span>
                  </div>
                  <div className={`text-lg font-bold text-[#0D9488]`}>
                    {formatDateFull(result.nextPeriodDate)}
                  </div>
                  {getDaysUntil(result.nextPeriodDate) >= 0 && (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getDaysUntil(result.nextPeriodDate)} days from now
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.ovulationCalculator.thisCalculatorProvidesEstimatesBased', 'This calculator provides estimates based on average cycle patterns. Actual ovulation can vary. For accurate tracking, consider using ovulation predictor kits or consulting with a healthcare provider.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvulationCalculatorTool;
