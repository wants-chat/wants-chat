import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Calendar, Gift, Clock, Star, Sparkles, Cake, PartyPopper, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AnniversaryCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface AnniversaryMilestone {
  years: number;
  traditional: string;
  modern: string;
  gemstone: string;
  flower: string;
}

const milestones: AnniversaryMilestone[] = [
  { years: 1, traditional: 'Paper', modern: 'Clocks', gemstone: 'Gold', flower: 'Carnation' },
  { years: 2, traditional: 'Cotton', modern: 'China', gemstone: 'Garnet', flower: 'Lily of the Valley' },
  { years: 3, traditional: 'Leather', modern: 'Crystal/Glass', gemstone: 'Pearl', flower: 'Sunflower' },
  { years: 4, traditional: 'Fruit/Flowers', modern: 'Appliances', gemstone: 'Blue Topaz', flower: 'Geranium' },
  { years: 5, traditional: 'Wood', modern: 'Silverware', gemstone: 'Sapphire', flower: 'Daisy' },
  { years: 6, traditional: 'Candy/Iron', modern: 'Wood', gemstone: 'Amethyst', flower: 'Calla Lily' },
  { years: 7, traditional: 'Wool/Copper', modern: 'Desk Sets', gemstone: 'Onyx', flower: 'Freesia' },
  { years: 8, traditional: 'Pottery/Bronze', modern: 'Linen/Lace', gemstone: 'Tourmaline', flower: 'Clematis' },
  { years: 9, traditional: 'Pottery/Willow', modern: 'Leather', gemstone: 'Lapis Lazuli', flower: 'Poppy' },
  { years: 10, traditional: 'Tin/Aluminum', modern: 'Diamond Jewelry', gemstone: 'Diamond', flower: 'Daffodil' },
  { years: 15, traditional: 'Crystal', modern: 'Watches', gemstone: 'Ruby', flower: 'Rose' },
  { years: 20, traditional: 'China', modern: 'Platinum', gemstone: 'Emerald', flower: 'Aster' },
  { years: 25, traditional: 'Silver', modern: 'Silver', gemstone: 'Tsavorite', flower: 'Iris' },
  { years: 30, traditional: 'Pearl', modern: 'Diamond', gemstone: 'Pearl', flower: 'Sweet Pea' },
  { years: 35, traditional: 'Coral', modern: 'Jade', gemstone: 'Emerald', flower: 'Coral' },
  { years: 40, traditional: 'Ruby', modern: 'Ruby', gemstone: 'Ruby', flower: 'Nasturtium' },
  { years: 45, traditional: 'Sapphire', modern: 'Sapphire', gemstone: 'Sapphire', flower: 'Blue Iris' },
  { years: 50, traditional: 'Gold', modern: 'Gold', gemstone: 'Gold', flower: 'Yellow Rose' },
  { years: 55, traditional: 'Emerald', modern: 'Emerald', gemstone: 'Alexandrite', flower: 'Calla Lily' },
  { years: 60, traditional: 'Diamond', modern: 'Diamond', gemstone: 'Diamond', flower: 'Aster' },
  { years: 75, traditional: 'Diamond/Gold', modern: 'Diamond/Gold', gemstone: 'Diamond', flower: 'White Rose' },
];

export const AnniversaryCalculatorTool: React.FC<AnniversaryCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [anniversaryDate, setAnniversaryDate] = useState<string>('');
  const [coupleName1, setCoupleName1] = useState<string>('');
  const [coupleName2, setCoupleName2] = useState<string>('');

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.date) {
        setAnniversaryDate(params.date.toString());
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.date) setAnniversaryDate(params.formData.date.toString());
        if (params.formData.name1) setCoupleName1(params.formData.name1.toString());
        if (params.formData.name2) setCoupleName2(params.formData.name2.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    if (!anniversaryDate) return null;

    const wedding = new Date(anniversaryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate years, months, days together
    let years = today.getFullYear() - wedding.getFullYear();
    let months = today.getMonth() - wedding.getMonth();
    let days = today.getDate() - wedding.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total days together
    const totalDays = Math.floor((today.getTime() - wedding.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    // Next anniversary
    let nextAnniversary = new Date(today.getFullYear(), wedding.getMonth(), wedding.getDate());
    if (nextAnniversary <= today) {
      nextAnniversary = new Date(today.getFullYear() + 1, wedding.getMonth(), wedding.getDate());
    }
    const daysUntilNext = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const nextAnniversaryYears = nextAnniversary.getFullYear() - wedding.getFullYear();

    // Check if today is anniversary
    const isToday = today.getMonth() === wedding.getMonth() && today.getDate() === wedding.getDate();

    // Current and next milestone
    const currentMilestone = milestones.filter((m) => m.years <= years).pop();
    const nextMilestone = milestones.find((m) => m.years > years);
    const yearsToNextMilestone = nextMilestone ? nextMilestone.years - years : null;

    // Day of week married
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weddingDayOfWeek = daysOfWeek[wedding.getDay()];

    // Seasons
    const month = wedding.getMonth();
    let season = '';
    if (month >= 2 && month <= 4) season = 'Spring';
    else if (month >= 5 && month <= 7) season = 'Summer';
    else if (month >= 8 && month <= 10) season = 'Fall';
    else season = 'Winter';

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      nextAnniversary,
      daysUntilNext,
      nextAnniversaryYears,
      isToday,
      currentMilestone,
      nextMilestone,
      yearsToNextMilestone,
      weddingDayOfWeek,
      season,
      weddingDate: wedding,
    };
  }, [anniversaryDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Heart className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.anniversaryCalculator.anniversaryCalculator', 'Anniversary Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.anniversaryCalculator.calculateYourAnniversaryMilestonesAnd', 'Calculate your anniversary milestones and gift ideas')}</p>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.anniversaryCalculator.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" /> Wedding Date
            </label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.anniversaryCalculator.partner1NameOptional', 'Partner 1 Name (Optional)')}
            </label>
            <input
              type="text"
              value={coupleName1}
              onChange={(e) => setCoupleName1(e.target.value)}
              placeholder={t('tools.anniversaryCalculator.eGJohn', 'e.g., John')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.anniversaryCalculator.partner2NameOptional', 'Partner 2 Name (Optional)')}
            </label>
            <input
              type="text"
              value={coupleName2}
              onChange={(e) => setCoupleName2(e.target.value)}
              placeholder={t('tools.anniversaryCalculator.eGJane', 'e.g., Jane')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
        </div>

        {calculations && (
          <>
            {/* Today's Anniversary Alert */}
            {calculations.isToday && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${isDark ? 'bg-pink-900/20 border border-pink-500/30' : 'bg-pink-50 border border-pink-200'}`}>
                <PartyPopper className="w-8 h-8 text-pink-500" />
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
                    Happy {calculations.years}{calculations.years === 1 ? 'st' : calculations.years === 2 ? 'nd' : calculations.years === 3 ? 'rd' : 'th'} Anniversary!
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                    {coupleName1 && coupleName2 ? `${coupleName1} & ${coupleName2}, celebrating` : 'Celebrating'} {calculations.years} wonderful year{calculations.years !== 1 ? 's' : ''} together!
                  </p>
                </div>
              </div>
            )}

            {/* Time Together Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
                <div className="text-3xl font-bold text-teal-500">{calculations.years}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.anniversaryCalculator.years', 'Years')}</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <div className="text-3xl font-bold text-blue-500">{calculations.totalMonths}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.anniversaryCalculator.totalMonths', 'Total Months')}</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                <div className="text-3xl font-bold text-purple-500">{calculations.totalWeeks.toLocaleString()}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.anniversaryCalculator.totalWeeks', 'Total Weeks')}</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
                <div className="text-3xl font-bold text-pink-500">{calculations.totalDays.toLocaleString()}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.anniversaryCalculator.totalDays', 'Total Days')}</div>
              </div>
            </div>

            {/* Detailed Time */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Clock className="w-4 h-4 text-teal-500" />
                {t('tools.anniversaryCalculator.timeTogether', 'Time Together')}
              </h4>
              <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-bold text-teal-500">{calculations.years}</span> years,{' '}
                <span className="font-bold text-teal-500">{calculations.months}</span> months, and{' '}
                <span className="font-bold text-teal-500">{calculations.days}</span> days
              </div>
              <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                That's {calculations.totalHours.toLocaleString()} hours of love!
              </div>
            </div>

            {/* Next Anniversary */}
            {!calculations.isToday && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Cake className="w-4 h-4 text-teal-500" />
                  {t('tools.anniversaryCalculator.nextAnniversary', 'Next Anniversary')}
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(calculations.nextAnniversary)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {calculations.nextAnniversaryYears}{calculations.nextAnniversaryYears === 1 ? 'st' : calculations.nextAnniversaryYears === 2 ? 'nd' : calculations.nextAnniversaryYears === 3 ? 'rd' : 'th'} Anniversary
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                    <span className="text-2xl font-bold text-teal-500">{calculations.daysUntilNext}</span>
                    <span className={`text-sm ml-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{t('tools.anniversaryCalculator.daysToGo', 'days to go')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Anniversary Gift Ideas */}
            {calculations.currentMilestone && (
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-teal-500/30' : 'bg-teal-50 border-teal-200'}`}>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Gift className="w-4 h-4 text-teal-500" />
                  {calculations.years === calculations.currentMilestone.years ? 'This Year\'s' : `${calculations.currentMilestone.years}th Anniversary`} Gift Ideas
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.anniversaryCalculator.traditional', 'Traditional')}</div>
                    <div className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{calculations.currentMilestone.traditional}</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.anniversaryCalculator.modern', 'Modern')}</div>
                    <div className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{calculations.currentMilestone.modern}</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.anniversaryCalculator.gemstone', 'Gemstone')}</div>
                    <div className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{calculations.currentMilestone.gemstone}</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.anniversaryCalculator.flower', 'Flower')}</div>
                    <div className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{calculations.currentMilestone.flower}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Milestone */}
            {calculations.nextMilestone && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Star className="w-4 h-4 text-teal-500" />
                  Next Major Milestone: {calculations.nextMilestone.years}th Anniversary
                </h4>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculations.yearsToNextMilestone} year{calculations.yearsToNextMilestone !== 1 ? 's' : ''} until your{' '}
                  <span className="font-medium text-teal-500">{calculations.nextMilestone.traditional}</span> anniversary!
                </div>
              </div>
            )}

            {/* Wedding Details */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Info className="w-4 h-4 text-teal-500" />
                {t('tools.anniversaryCalculator.weddingDetails', 'Wedding Details')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.anniversaryCalculator.dayOfWeek', 'Day of Week:')}</span>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.weddingDayOfWeek}</div>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.anniversaryCalculator.season', 'Season:')}</span>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.season}</div>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.anniversaryCalculator.date', 'Date:')}</span>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.weddingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Reference */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-teal-50/50'}`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.anniversaryCalculator.anniversaryMilestonesReference', 'Anniversary Milestones Reference')}</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
                {milestones.slice(0, 10).map((m) => (
                  <div
                    key={m.years}
                    className={`p-2 rounded ${
                      calculations.years >= m.years
                        ? isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-700'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-600'
                    }`}
                  >
                    <span className="font-bold">{m.years}yr:</span> {m.traditional}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!calculations && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.anniversaryCalculator.enterYourWeddingDateTo', 'Enter your wedding date to calculate your anniversary milestones.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnniversaryCalculatorTool;
