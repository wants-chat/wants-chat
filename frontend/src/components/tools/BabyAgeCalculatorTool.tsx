import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Calendar, Clock, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BabyAgeCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface AgeBreakdown {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  ageInWeeks: string;
  ageInMonths: string;
  nextMilestone: {
    name: string;
    date: Date;
    daysUntil: number;
  } | null;
}

const milestones = [
  { months: 0.25, name: '1 Week Old' },
  { months: 0.5, name: '2 Weeks Old' },
  { months: 1, name: '1 Month Old' },
  { months: 2, name: '2 Months Old' },
  { months: 3, name: '3 Months Old' },
  { months: 4, name: '4 Months Old' },
  { months: 5, name: '5 Months Old' },
  { months: 6, name: '6 Months Old' },
  { months: 9, name: '9 Months Old' },
  { months: 12, name: '1 Year Old' },
  { months: 18, name: '18 Months Old' },
  { months: 24, name: '2 Years Old' },
  { months: 36, name: '3 Years Old' },
];

export const BabyAgeCalculatorTool: React.FC<BabyAgeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [birthDate, setBirthDate] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const dateMatch = params.content.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          setBirthDate(dateMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const ageBreakdown = useMemo((): AgeBreakdown | null => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birth.setHours(0, 0, 0, 0);

    if (birth > today) return null;

    const diffTime = today.getTime() - birth.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    // Calculate age in years, months, weeks, days
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    // Calculate age descriptions
    let ageInWeeks = '';
    let ageInMonths = '';

    if (totalDays < 7) {
      ageInWeeks = `${totalDays} day${totalDays !== 1 ? 's' : ''} old`;
    } else if (totalWeeks < 12) {
      const extraDays = totalDays % 7;
      ageInWeeks = `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}${extraDays > 0 ? ` and ${extraDays} day${extraDays !== 1 ? 's' : ''}` : ''} old`;
    } else {
      ageInWeeks = `${totalWeeks} weeks old`;
    }

    if (totalMonths < 1) {
      ageInMonths = ageInWeeks;
    } else if (totalMonths < 24) {
      ageInMonths = `${totalMonths} month${totalMonths !== 1 ? 's' : ''} old`;
    } else {
      ageInMonths = `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months !== 1 ? 's' : ''}` : ''} old`;
    }

    // Find next milestone
    let nextMilestone: AgeBreakdown['nextMilestone'] = null;
    const currentAgeMonths = totalDays / 30.44; // Average days per month

    for (const milestone of milestones) {
      if (milestone.months > currentAgeMonths) {
        const milestoneDate = new Date(birth);
        if (milestone.months < 1) {
          milestoneDate.setDate(birth.getDate() + Math.round(milestone.months * 30.44));
        } else {
          milestoneDate.setMonth(birth.getMonth() + milestone.months);
        }
        const daysUntil = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0) {
          nextMilestone = {
            name: milestone.name,
            date: milestoneDate,
            daysUntil,
          };
          break;
        }
      }
    }

    return {
      years,
      months,
      weeks,
      days: remainingDays,
      totalDays,
      totalWeeks,
      totalMonths,
      ageInWeeks,
      ageInMonths,
      nextMilestone,
    };
  }, [birthDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Baby className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.babyAgeCalculator.babyAgeCalculator', 'Baby Age Calculator')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.babyAgeCalculator.calculateYourBabySAge', 'Calculate your baby\'s age in weeks and months')}
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
                  {t('tools.babyAgeCalculator.dateLoadedFromYourConversation', 'Date loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Birth Date Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyAgeCalculator.babySBirthDate', 'Baby\'s Birth Date')}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={getMaxDate()}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Results */}
            {ageBreakdown && (
              <>
                {/* Primary Age Display */}
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.babyAgeCalculator.yourBabyIs', 'Your baby is')}
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488] my-2">
                    {ageBreakdown.ageInMonths}
                  </div>
                  {ageBreakdown.totalWeeks >= 12 && (
                    <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      ({ageBreakdown.totalWeeks} weeks)
                    </div>
                  )}
                </div>

                {/* Age Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {ageBreakdown.years}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.babyAgeCalculator.years', 'Years')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {ageBreakdown.months}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.babyAgeCalculator.months', 'Months')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {ageBreakdown.weeks}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.babyAgeCalculator.weeks', 'Weeks')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {ageBreakdown.days}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.babyAgeCalculator.days', 'Days')}
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Clock className="w-4 h-4 inline mr-2" />
                    {t('tools.babyAgeCalculator.totalTime', 'Total Time')}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-xl font-bold text-[#0D9488]`}>
                        {ageBreakdown.totalDays.toLocaleString()}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.babyAgeCalculator.totalDays', 'Total Days')}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xl font-bold text-[#0D9488]`}>
                        {ageBreakdown.totalWeeks.toLocaleString()}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.babyAgeCalculator.totalWeeks', 'Total Weeks')}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xl font-bold text-[#0D9488]`}>
                        {ageBreakdown.totalMonths}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.babyAgeCalculator.totalMonths', 'Total Months')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Milestone */}
                {ageBreakdown.nextMilestone && (
                  <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-700' : 'bg-teal-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#0D9488]" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.babyAgeCalculator.nextMilestone', 'Next Milestone')}
                      </span>
                    </div>
                    <div className={`text-lg font-bold text-[#0D9488]`}>
                      {ageBreakdown.nextMilestone.name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(ageBreakdown.nextMilestone.date)} ({ageBreakdown.nextMilestone.daysUntil} days away)
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.babyAgeCalculator.forNewbornsAndInfantsAge', 'For newborns and infants, age is typically counted in weeks until about 3 months, then in months until age 2, after which years are used. This helps track developmental milestones more precisely.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyAgeCalculatorTool;
