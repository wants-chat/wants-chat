import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Egg, Calendar, Church, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface EasterDates {
  westernEaster: Date;
  orthodoxEaster: Date;
  ashWednesday: Date;
  palmSunday: Date;
  maundyThursday: Date;
  goodFriday: Date;
  holySaturday: Date;
  ascensionDay: Date;
  pentecost: Date;
  corpusChristi: Date;
}

interface EasterDateCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function EasterDateCalculatorTool({ uiConfig }: EasterDateCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [easterDates, setEasterDates] = useState<EasterDates | null>(null);
  const [showAllHolidays, setShowAllHolidays] = useState(false);
  const [calendarType, setCalendarType] = useState<'western' | 'orthodox'>('western');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { year?: number };
      if (params.year) {
        setYear(params.year);
      }
    }
  }, [uiConfig?.params]);

  // Calculate Western Easter using the Anonymous Gregorian algorithm
  const calculateWesternEaster = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
  };

  // Calculate Orthodox Easter using the Julian calendar algorithm
  const calculateOrthodoxEaster = (year: number): Date => {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;

    // Convert from Julian to Gregorian calendar
    // Add the difference (13 days for 1900-2099)
    const julianDate = new Date(year, month - 1, day);
    julianDate.setDate(julianDate.getDate() + 13);

    return julianDate;
  };

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const calculateAllDates = () => {
    const westernEaster = calculateWesternEaster(year);
    const orthodoxEaster = calculateOrthodoxEaster(year);

    const baseEaster = calendarType === 'western' ? westernEaster : orthodoxEaster;

    setEasterDates({
      westernEaster,
      orthodoxEaster,
      ashWednesday: addDays(baseEaster, -46),
      palmSunday: addDays(baseEaster, -7),
      maundyThursday: addDays(baseEaster, -3),
      goodFriday: addDays(baseEaster, -2),
      holySaturday: addDays(baseEaster, -1),
      ascensionDay: addDays(baseEaster, 39),
      pentecost: addDays(baseEaster, 49),
      corpusChristi: addDays(baseEaster, 60),
    });
  };

  useEffect(() => {
    calculateAllDates();
  }, [year, calendarType]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const holidays = easterDates ? [
    { name: 'Ash Wednesday', date: easterDates.ashWednesday, description: 'Start of Lent (40 days before Easter)' },
    { name: 'Palm Sunday', date: easterDates.palmSunday, description: 'Jesus\' triumphal entry into Jerusalem' },
    { name: 'Maundy Thursday', date: easterDates.maundyThursday, description: 'The Last Supper' },
    { name: 'Good Friday', date: easterDates.goodFriday, description: 'Crucifixion of Jesus' },
    { name: 'Holy Saturday', date: easterDates.holySaturday, description: 'Jesus in the tomb' },
    { name: 'Easter Sunday', date: calendarType === 'western' ? easterDates.westernEaster : easterDates.orthodoxEaster, description: 'Resurrection of Jesus' },
    { name: 'Ascension Day', date: easterDates.ascensionDay, description: '40 days after Easter' },
    { name: 'Pentecost', date: easterDates.pentecost, description: '50 days after Easter' },
    { name: 'Corpus Christi', date: easterDates.corpusChristi, description: '60 days after Easter (Catholic)' },
  ] : [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Egg className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.easterDateCalculator.easterDateCalculator', 'Easter Date Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.easterDateCalculator.findEasterAndRelatedChristian', 'Find Easter and related Christian holidays')}
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.easterDateCalculator.year', 'Year')}
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.easterDateCalculator.calendarType', 'Calendar Type')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCalendarType('western')}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    calendarType === 'western'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Church className="w-5 h-5" />
                    <span>{t('tools.easterDateCalculator.western', 'Western')}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-75">{t('tools.easterDateCalculator.catholicProtestant', 'Catholic, Protestant')}</p>
                </button>
                <button
                  onClick={() => setCalendarType('orthodox')}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    calendarType === 'orthodox'
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Church className="w-5 h-5" />
                    <span>{t('tools.easterDateCalculator.orthodox', 'Orthodox')}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-75">{t('tools.easterDateCalculator.easternOrthodox', 'Eastern Orthodox')}</p>
                </button>
              </div>
            </div>
          </div>

          {/* Easter Date Display */}
          {easterDates && (
            <div className="space-y-4">
              {/* Main Easter Card */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.easterDateCalculator.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Egg className="w-6 h-6 text-[#0D9488]" />
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Easter Sunday {year}
                  </h2>
                </div>
                <div className="text-3xl font-bold text-[#0D9488] mb-2">
                  {formatDate(calendarType === 'western' ? easterDates.westernEaster : easterDates.orthodoxEaster)}
                </div>
                {year >= currentYear && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {(() => {
                      const days = getDaysUntil(calendarType === 'western' ? easterDates.westernEaster : easterDates.orthodoxEaster);
                      if (days === 0) return "Today is Easter!";
                      if (days < 0) return `${Math.abs(days)} days ago`;
                      return `${days} days from now`;
                    })()}
                  </div>
                )}
              </div>

              {/* Compare Dates */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.easterDateCalculator.compareEasterDates', 'Compare Easter Dates')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${
                    calendarType === 'western' ? 'ring-2 ring-[#0D9488]' : ''
                  } ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.easterDateCalculator.westernEaster', 'Western Easter')}
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatShortDate(easterDates.westernEaster)}, {year}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    calendarType === 'orthodox' ? 'ring-2 ring-[#0D9488]' : ''
                  } ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.easterDateCalculator.orthodoxEaster', 'Orthodox Easter')}
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatShortDate(easterDates.orthodoxEaster)}, {year}
                    </div>
                  </div>
                </div>
                {easterDates.westernEaster.getTime() === easterDates.orthodoxEaster.getTime() ? (
                  <p className={`mt-3 text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Both Easters fall on the same date in {year}!
                  </p>
                ) : (
                  <p className={`mt-3 text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.abs(Math.round((easterDates.orthodoxEaster.getTime() - easterDates.westernEaster.getTime()) / (1000 * 60 * 60 * 24)))} days apart
                  </p>
                )}
              </div>

              {/* Related Holidays */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setShowAllHolidays(!showAllHolidays)}
                  className={`w-full flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  <h3 className="font-semibold">{t('tools.easterDateCalculator.relatedHolyDays', 'Related Holy Days')}</h3>
                  {showAllHolidays ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {showAllHolidays && (
                  <div className="mt-4 space-y-3">
                    {holidays.map((holiday, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg flex items-start gap-3 ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          holiday.name === 'Easter Sunday' ? 'bg-[#0D9488] text-white' :
                          theme === 'dark' ? 'bg-gray-500' : 'bg-gray-100'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {holiday.name}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {holiday.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[#0D9488] font-medium">
                                {formatShortDate(holiday.date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Year View */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Easter Dates ({calendarType === 'western' ? t('tools.easterDateCalculator.western2', 'Western') : t('tools.easterDateCalculator.orthodox2', 'Orthodox')})
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[year - 1, year, year + 1, year + 2, year + 3, year + 4].map((y) => {
                    const easter = calendarType === 'western'
                      ? calculateWesternEaster(y)
                      : calculateOrthodoxEaster(y);
                    return (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          y === year
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-white text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-bold">{y}</div>
                        <div className="text-xs">{formatShortDate(easter)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.easterDateCalculator.aboutEasterDateCalculation', 'About Easter Date Calculation')}
                </h3>
                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{t('tools.easterDateCalculator.easterIsCelebratedOnThe', 'Easter is celebrated on the first Sunday after the first full moon following the spring equinox.')}</p>
                  <p>{t('tools.easterDateCalculator.westernChurchesUseTheGregorian', 'Western churches use the Gregorian calendar, while Orthodox churches use the Julian calendar.')}</p>
                  <p>{t('tools.easterDateCalculator.theDatesCanDifferBy', 'The dates can differ by one to five weeks between the two traditions.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
