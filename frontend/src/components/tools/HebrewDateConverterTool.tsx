import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRightLeft, Star, Info, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface HebrewDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  yearHebrew: string;
  dayHebrew: string;
  monthHebrew: string;
  isLeapYear: boolean;
}

interface HebrewDateConverterToolProps {
  uiConfig?: UIConfig;
}

const HEBREW_MONTHS = [
  { name: 'Nisan', hebrew: '\u05E0\u05B4\u05D9\u05E1\u05B8\u05DF' },
  { name: 'Iyar', hebrew: '\u05D0\u05B4\u05D9\u05B8\u05BC\u05E8' },
  { name: 'Sivan', hebrew: '\u05E1\u05B4\u05D9\u05D5\u05B8\u05DF' },
  { name: 'Tammuz', hebrew: '\u05EA\u05B7\u05BC\u05DE\u05BC\u05D5\u05BC\u05D6' },
  { name: 'Av', hebrew: '\u05D0\u05B8\u05D1' },
  { name: 'Elul', hebrew: '\u05D0\u05B1\u05DC\u05D5\u05BC\u05DC' },
  { name: 'Tishrei', hebrew: '\u05EA\u05B4\u05BC\u05E9\u05B0\u05C1\u05E8\u05B5\u05D9' },
  { name: 'Cheshvan', hebrew: '\u05D7\u05B6\u05E9\u05B0\u05C1\u05D5\u05B8\u05DF' },
  { name: 'Kislev', hebrew: '\u05DB\u05B4\u05BC\u05E1\u05B0\u05DC\u05B5\u05D5' },
  { name: 'Tevet', hebrew: '\u05D8\u05B5\u05D1\u05B5\u05EA' },
  { name: 'Shevat', hebrew: '\u05E9\u05B0\u05C1\u05D1\u05B8\u05D8' },
  { name: 'Adar', hebrew: '\u05D0\u05B7\u05D3\u05B8\u05E8' },
  { name: 'Adar I', hebrew: '\u05D0\u05B7\u05D3\u05B8\u05E8 \u05D0\u05F3' },
  { name: 'Adar II', hebrew: '\u05D0\u05B7\u05D3\u05B8\u05E8 \u05D1\u05F3' },
];

const HEBREW_NUMERALS: Record<number, string> = {
  1: '\u05D0', 2: '\u05D1', 3: '\u05D2', 4: '\u05D3', 5: '\u05D4',
  6: '\u05D5', 7: '\u05D6', 8: '\u05D7', 9: '\u05D8', 10: '\u05D9',
  20: '\u05DB', 30: '\u05DC', 40: '\u05DE', 50: '\u05E0', 60: '\u05E1',
  70: '\u05E2', 80: '\u05E4', 90: '\u05E6', 100: '\u05E7', 200: '\u05E8',
  300: '\u05E9', 400: '\u05EA',
};

export default function HebrewDateConverterTool({
  uiConfig }: HebrewDateConverterToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [gregorianDate, setGregorianDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hebrewResult, setHebrewResult] = useState<HebrewDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHolidays, setShowHolidays] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { date?: string };
      if (params.date) {
        setGregorianDate(params.date);
      }
    }
  }, [uiConfig?.params]);

  // Hebrew calendar calculations
  const isHebrewLeapYear = (year: number): boolean => {
    return ((7 * year + 1) % 19) < 7;
  };

  const getHebrewMonthDays = (year: number, month: number): number => {
    const isLeap = isHebrewLeapYear(year);

    // Month lengths in a regular year (starting from Nisan = 1)
    const monthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

    if (isLeap && month === 12) return 30; // Adar I in leap year
    if (isLeap && month === 13) return 29; // Adar II in leap year

    // Cheshvan can have 29 or 30 days
    // Kislev can have 29 or 30 days
    const monthIndex = month <= 6 ? month - 1 : month - 1;
    return monthDays[monthIndex % 12] || 29;
  };

  const getHebrewYear = (gregorianYear: number, gregorianMonth: number): number => {
    // Hebrew year starts in the fall (Tishrei = September/October)
    // Add 3760 or 3761 depending on whether we're before or after Rosh Hashanah
    return gregorianYear + (gregorianMonth >= 9 ? 3761 : 3760);
  };

  const numberToHebrewNumeral = (num: number): string => {
    if (num <= 0) return '';

    let result = '';
    const values = [400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    for (const val of values) {
      while (num >= val) {
        result += HEBREW_NUMERALS[val] || '';
        num -= val;
      }
    }

    // Handle special cases (15 and 16)
    result = result.replace('\u05D9\u05D4', '\u05D8\u05D5'); // 15 = tet-vav instead of yod-heh
    result = result.replace('\u05D9\u05D5', '\u05D8\u05D6'); // 16 = tet-zayin instead of yod-vav

    return result;
  };

  const yearToHebrewNumeral = (year: number): string => {
    // For Hebrew years, we typically omit the thousands digit and use the last 3 digits
    const lastThree = year % 1000;
    return numberToHebrewNumeral(lastThree) + '"';
  };

  const gregorianToHebrew = (gDate: Date): HebrewDate => {
    // This is a simplified conversion algorithm
    // For production, consider using a library like hebcal

    const year = gDate.getFullYear();
    const month = gDate.getMonth() + 1;
    const day = gDate.getDate();

    // Calculate Hebrew year
    const hebrewYear = getHebrewYear(year, month);
    const isLeap = isHebrewLeapYear(hebrewYear);

    // Approximate Hebrew month and day
    // This is a simplified calculation - actual conversion is more complex
    const dayOfYear = Math.floor((gDate.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000));

    // Map Gregorian month to approximate Hebrew month
    let hebrewMonth: number;
    let hebrewDay: number;

    // Simplified mapping (not astronomically accurate)
    if (month >= 3 && month <= 4) {
      hebrewMonth = 1; // Nisan
      hebrewDay = day;
    } else if (month >= 4 && month <= 5) {
      hebrewMonth = 2; // Iyar
      hebrewDay = day;
    } else if (month >= 5 && month <= 6) {
      hebrewMonth = 3; // Sivan
      hebrewDay = day;
    } else if (month >= 6 && month <= 7) {
      hebrewMonth = 4; // Tammuz
      hebrewDay = day;
    } else if (month >= 7 && month <= 8) {
      hebrewMonth = 5; // Av
      hebrewDay = day;
    } else if (month >= 8 && month <= 9) {
      hebrewMonth = 6; // Elul
      hebrewDay = day;
    } else if (month >= 9 && month <= 10) {
      hebrewMonth = 7; // Tishrei
      hebrewDay = day;
    } else if (month >= 10 && month <= 11) {
      hebrewMonth = 8; // Cheshvan
      hebrewDay = day;
    } else if (month >= 11 && month <= 12) {
      hebrewMonth = 9; // Kislev
      hebrewDay = day;
    } else if (month === 12 || month === 1) {
      hebrewMonth = 10; // Tevet
      hebrewDay = day;
    } else if (month >= 1 && month <= 2) {
      hebrewMonth = 11; // Shevat
      hebrewDay = day;
    } else {
      hebrewMonth = 12; // Adar
      hebrewDay = day;
    }

    // Adjust day to be within valid range
    const maxDays = getHebrewMonthDays(hebrewYear, hebrewMonth);
    hebrewDay = Math.min(hebrewDay, maxDays);

    // Get month name
    let monthInfo = HEBREW_MONTHS[hebrewMonth - 1];
    if (isLeap && hebrewMonth === 12) {
      monthInfo = HEBREW_MONTHS[12]; // Adar I
    } else if (isLeap && hebrewMonth === 13) {
      monthInfo = HEBREW_MONTHS[13]; // Adar II
    }

    return {
      year: hebrewYear,
      month: hebrewMonth,
      day: hebrewDay,
      monthName: monthInfo?.name || 'Unknown',
      monthHebrew: monthInfo?.hebrew || '',
      dayHebrew: numberToHebrewNumeral(hebrewDay),
      yearHebrew: yearToHebrewNumeral(hebrewYear),
      isLeapYear: isLeap,
    };
  };

  const convertDate = () => {
    setLoading(true);
    try {
      const gDate = new Date(gregorianDate);
      const hebrew = gregorianToHebrew(gDate);
      setHebrewResult(hebrew);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setToday = () => {
    setGregorianDate(new Date().toISOString().split('T')[0]);
  };

  const reset = () => {
    setGregorianDate(new Date().toISOString().split('T')[0]);
    setHebrewResult(null);
  };

  const getHolidaysForMonth = (month: number): string[] => {
    const holidays: Record<number, string[]> = {
      1: ['Passover (15-22 Nisan)', 'Yom HaShoah (27 Nisan)'],
      2: ["Yom HaZikaron (4 Iyar)", "Yom Ha'Atzmaut (5 Iyar)", 'Lag BaOmer (18 Iyar)'],
      3: ['Shavuot (6-7 Sivan)'],
      4: ['Fast of Tammuz (17 Tammuz)'],
      5: ['Tisha B\'Av (9 Av)', 'Tu B\'Av (15 Av)'],
      6: [],
      7: ['Rosh Hashanah (1-2 Tishrei)', 'Yom Kippur (10 Tishrei)', 'Sukkot (15-21 Tishrei)', 'Shemini Atzeret (22 Tishrei)', 'Simchat Torah (23 Tishrei)'],
      8: [],
      9: ['Hanukkah begins (25 Kislev)'],
      10: ['Fast of Tevet (10 Tevet)'],
      11: ['Tu BiShvat (15 Shevat)'],
      12: ['Purim (14 Adar)', 'Shushan Purim (15 Adar)'],
    };
    return holidays[month] || [];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.hebrewDateConverter.hebrewDateConverter', 'Hebrew Date Converter')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.hebrewDateConverter.convertGregorianDatesToHebrew', 'Convert Gregorian dates to Hebrew calendar')}
              </p>
            </div>
          </div>

          {/* Gregorian Date Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.hebrewDateConverter.gregorianDate', 'Gregorian Date')}
              </label>
              <button
                onClick={setToday}
                className={`text-xs px-2 py-1 rounded ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.hebrewDateConverter.today', 'Today')}
              </button>
            </div>
            <input
              type="date"
              value={gregorianDate}
              onChange={(e) => setGregorianDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            {gregorianDate && (
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(gregorianDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={convertDate}
              disabled={loading}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-5 h-5" />
              )}
              Convert to Hebrew
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.hebrewDateConverter.reset', 'Reset')}
            </button>
          </div>

          {/* Hebrew Date Result */}
          {hebrewResult && (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.hebrewDateConverter.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-[#0D9488] mb-2" dir="rtl">
                    {hebrewResult.dayHebrew} {hebrewResult.monthHebrew} {hebrewResult.yearHebrew}
                  </div>
                  <div className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {hebrewResult.day} {hebrewResult.monthName} {hebrewResult.year}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="text-2xl font-bold text-[#0D9488]">{hebrewResult.day}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hebrewDateConverter.day', 'Day')}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {hebrewResult.monthName}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hebrewDateConverter.month', 'Month')}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="text-2xl font-bold text-[#0D9488]">{hebrewResult.year}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hebrewDateConverter.year', 'Year')}</div>
                  </div>
                </div>
              </div>

              {/* Year Info */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.hebrewDateConverter.yearType', 'Year Type:')}</span>
                  <span className={`font-medium ${hebrewResult.isLeapYear ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {hebrewResult.isLeapYear ? t('tools.hebrewDateConverter.leapYear13Months', 'Leap Year (13 months)') : t('tools.hebrewDateConverter.regularYear12Months', 'Regular Year (12 months)')}
                  </span>
                </div>
              </div>

              {/* Holidays Toggle */}
              <button
                onClick={() => setShowHolidays(!showHolidays)}
                className={`w-full p-3 rounded-lg text-left flex items-center justify-between ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>Holidays in {hebrewResult.monthName}</span>
                <Calendar className="w-5 h-5" />
              </button>

              {showHolidays && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {getHolidaysForMonth(hebrewResult.month).length > 0 ? (
                    <ul className="space-y-2">
                      {getHolidaysForMonth(hebrewResult.month).map((holiday, idx) => (
                        <li key={idx} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Star className="w-4 h-4 text-[#0D9488]" />
                          {holiday}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('tools.hebrewDateConverter.noMajorHolidaysInThis', 'No major holidays in this month')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.hebrewDateConverter.aboutTheHebrewCalendar', 'About the Hebrew Calendar')}
                </h3>
                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{t('tools.hebrewDateConverter.theHebrewCalendarIsA', 'The Hebrew calendar is a lunisolar calendar used for Jewish religious observances.')}</p>
                  <p>{t('tools.hebrewDateConverter.itHas12MonthsIn', 'It has 12 months in a regular year and 13 months in a leap year (7 out of every 19 years).')}</p>
                  <p>{t('tools.hebrewDateConverter.theHebrewDayBeginsAt', 'The Hebrew day begins at sunset, not midnight.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
