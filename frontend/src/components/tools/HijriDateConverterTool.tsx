import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRightLeft, Moon, Info, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthArabic: string;
  dayName: string;
  dayArabic: string;
}

interface HijriDateConverterToolProps {
  uiConfig?: UIConfig;
}

const HIJRI_MONTHS = [
  { name: 'Muharram', arabic: '\u0645\u062D\u0631\u0645' },
  { name: 'Safar', arabic: '\u0635\u0641\u0631' },
  { name: 'Rabi al-Awwal', arabic: '\u0631\u0628\u064A\u0639 \u0627\u0644\u0623\u0648\u0644' },
  { name: 'Rabi al-Thani', arabic: '\u0631\u0628\u064A\u0639 \u0627\u0644\u062B\u0627\u0646\u064A' },
  { name: 'Jumada al-Awwal', arabic: '\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u0623\u0648\u0644\u0649' },
  { name: 'Jumada al-Thani', arabic: '\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u062B\u0627\u0646\u064A\u0629' },
  { name: 'Rajab', arabic: '\u0631\u062C\u0628' },
  { name: "Sha'ban", arabic: '\u0634\u0639\u0628\u0627\u0646' },
  { name: 'Ramadan', arabic: '\u0631\u0645\u0636\u0627\u0646' },
  { name: 'Shawwal', arabic: '\u0634\u0648\u0627\u0644' },
  { name: "Dhu al-Qi'dah", arabic: '\u0630\u0648 \u0627\u0644\u0642\u0639\u062F\u0629' },
  { name: 'Dhu al-Hijjah', arabic: '\u0630\u0648 \u0627\u0644\u062D\u062C\u0629' },
];

const WEEKDAYS = [
  { name: 'Sunday', arabic: '\u0627\u0644\u0623\u062D\u062F' },
  { name: 'Monday', arabic: '\u0627\u0644\u0625\u062B\u0646\u064A\u0646' },
  { name: 'Tuesday', arabic: '\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621' },
  { name: 'Wednesday', arabic: '\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621' },
  { name: 'Thursday', arabic: '\u0627\u0644\u062E\u0645\u064A\u0633' },
  { name: 'Friday', arabic: '\u0627\u0644\u062C\u0645\u0639\u0629' },
  { name: 'Saturday', arabic: '\u0627\u0644\u0633\u0628\u062A' },
];

export default function HijriDateConverterTool({ uiConfig }: HijriDateConverterToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [conversionDirection, setConversionDirection] = useState<'toHijri' | 'toGregorian'>('toHijri');
  const [gregorianDate, setGregorianDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hijriYear, setHijriYear] = useState<string>('');
  const [hijriMonth, setHijriMonth] = useState<string>('1');
  const [hijriDay, setHijriDay] = useState<string>('1');
  const [result, setResult] = useState<HijriDate | { gregorian: string; dayName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { date?: string };
      if (params.date) {
        setGregorianDate(params.date);
      }
    }
  }, [uiConfig?.params]);

  // Gregorian to Hijri conversion using the Umm al-Qura algorithm
  const gregorianToHijri = (gDate: Date): HijriDate => {
    // Julian day calculation
    const y = gDate.getFullYear();
    const m = gDate.getMonth() + 1;
    const d = gDate.getDate();

    let jd: number;
    if (m <= 2) {
      jd = Math.floor(365.25 * (y - 1)) + Math.floor(30.6001 * (m + 12 + 1)) + d + 1720995;
    } else {
      jd = Math.floor(365.25 * y) + Math.floor(30.6001 * (m + 1)) + d + 1720995;
    }

    // Gregorian correction
    const a = Math.floor(y / 100);
    jd = jd + 2 - a + Math.floor(a / 4);

    // Convert to Hijri
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    let remainder = l - 10631 * n + 354;
    const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
              Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
    remainder = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
                Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

    const hijriMonth = Math.floor((24 * remainder) / 709);
    const hijriDay = remainder - Math.floor((709 * hijriMonth) / 24);
    const hijriYear = 30 * n + j - 30;

    const dayOfWeek = gDate.getDay();
    const monthInfo = HIJRI_MONTHS[hijriMonth - 1];
    const weekdayInfo = WEEKDAYS[dayOfWeek];

    return {
      year: hijriYear,
      month: hijriMonth,
      day: hijriDay,
      monthName: monthInfo?.name || 'Unknown',
      monthArabic: monthInfo?.arabic || '',
      dayName: weekdayInfo?.name || 'Unknown',
      dayArabic: weekdayInfo?.arabic || '',
    };
  };

  // Hijri to Gregorian conversion
  const hijriToGregorian = (hYear: number, hMonth: number, hDay: number): { gregorian: string; dayName: string } => {
    // Convert Hijri to Julian day
    const n = hDay + Math.ceil(29.5001 * (hMonth - 1) + 0.99) + Math.floor((3 + 11 * hYear) / 30) +
              354 * hYear + 30 - 385;
    const jd = n + 1948440;

    // Convert Julian day to Gregorian
    const z = jd;
    const a = Math.floor((z - 1867216.25) / 36524.25);
    const aa = z + 1 + a - Math.floor(a / 4);
    const b = aa + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);

    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;

    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    return {
      gregorian: date.toISOString().split('T')[0],
      dayName: WEEKDAYS[dayOfWeek]?.name || 'Unknown',
    };
  };

  const convert = () => {
    setLoading(true);
    try {
      if (conversionDirection === 'toHijri') {
        const gDate = new Date(gregorianDate);
        const hijri = gregorianToHijri(gDate);
        setResult(hijri);
      } else {
        const hYear = parseInt(hijriYear);
        const hMonth = parseInt(hijriMonth);
        const hDay = parseInt(hijriDay);

        if (isNaN(hYear) || isNaN(hMonth) || isNaN(hDay)) {
          setValidationMessage('Please enter valid Hijri date values');
          setTimeout(() => setValidationMessage(null), 3000);
          setLoading(false);
          return;
        }

        const gregorian = hijriToGregorian(hYear, hMonth, hDay);
        setResult(gregorian);
      }
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
    setHijriYear('');
    setHijriMonth('1');
    setHijriDay('1');
    setResult(null);
  };

  const getIslamicEvents = (month: number): string[] => {
    const events: Record<number, string[]> = {
      1: ['Islamic New Year (1 Muharram)', 'Day of Ashura (10 Muharram)'],
      3: ['Mawlid al-Nabi / Prophet\'s Birthday (12 Rabi al-Awwal)'],
      7: ['Isra and Mi\'raj (27 Rajab)'],
      8: ['Shab-e-Barat (15 Sha\'ban)'],
      9: ['Ramadan begins', 'Laylat al-Qadr (27 Ramadan)'],
      10: ['Eid al-Fitr (1 Shawwal)'],
      12: ['Day of Arafah (9 Dhu al-Hijjah)', 'Eid al-Adha (10 Dhu al-Hijjah)'],
    };
    return events[month] || [];
  };

  const isHijriResult = (r: any): r is HijriDate => {
    return 'monthName' in r && 'monthArabic' in r;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.hijriDateConverter.hijriDateConverter', 'Hijri Date Converter')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.hijriDateConverter.convertBetweenGregorianAndIslamic', 'Convert between Gregorian and Islamic Hijri calendar')}
              </p>
            </div>
          </div>

          {/* Conversion Direction Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setConversionDirection('toHijri')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  conversionDirection === 'toHijri'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.hijriDateConverter.gregorianToHijri', 'Gregorian to Hijri')}
              </button>
              <button
                onClick={() => setConversionDirection('toGregorian')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  conversionDirection === 'toGregorian'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.hijriDateConverter.hijriToGregorian', 'Hijri to Gregorian')}
              </button>
            </div>
          </div>

          {/* Gregorian to Hijri Input */}
          {conversionDirection === 'toHijri' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.hijriDateConverter.gregorianDate', 'Gregorian Date')}
                </label>
                <button
                  onClick={setToday}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.hijriDateConverter.today', 'Today')}
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
            </div>
          )}

          {/* Hijri to Gregorian Input */}
          {conversionDirection === 'toGregorian' && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hijriDateConverter.day2', 'Day')}
                  </label>
                  <input
                    type="number"
                    value={hijriDay}
                    onChange={(e) => setHijriDay(e.target.value)}
                    min="1"
                    max="30"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hijriDateConverter.month2', 'Month')}
                  </label>
                  <select
                    value={hijriMonth}
                    onChange={(e) => setHijriMonth(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {HIJRI_MONTHS.map((month, idx) => (
                      <option key={idx} value={idx + 1}>
                        {month.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hijriDateConverter.year', 'Year')}
                  </label>
                  <input
                    type="number"
                    value={hijriYear}
                    onChange={(e) => setHijriYear(e.target.value)}
                    placeholder="e.g., 1446"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={convert}
              disabled={loading}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-5 h-5" />
              )}
              Convert
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.hijriDateConverter.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.hijriDateConverter.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                {isHijriResult(result) ? (
                  // Hijri Result
                  <>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-[#0D9488] mb-2" dir="rtl">
                        {result.day} {result.monthArabic} {result.year}
                      </div>
                      <div className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {result.day} {result.monthName} {result.year} AH
                      </div>
                      <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.dayName} / {result.dayArabic}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className="text-2xl font-bold text-[#0D9488]">{result.day}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hijriDateConverter.day', 'Day')}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {result.monthName}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hijriDateConverter.month', 'Month')}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className="text-2xl font-bold text-[#0D9488]">{result.year}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hijriDateConverter.yearAh', 'Year AH')}</div>
                      </div>
                    </div>

                    {/* Islamic Events */}
                    {getIslamicEvents(result.month).length > 0 && (
                      <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Important Events in {result.monthName}
                        </h4>
                        <ul className="space-y-1">
                          {getIslamicEvents(result.month).map((event, idx) => (
                            <li key={idx} className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Moon className="w-4 h-4 text-[#0D9488]" />
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  // Gregorian Result
                  <div className="text-center">
                    <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.hijriDateConverter.gregorianDate2', 'Gregorian Date')}
                    </div>
                    <div className="text-3xl font-bold text-[#0D9488] mb-2">
                      {new Date(result.gregorian).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.dayName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.hijriDateConverter.aboutTheHijriCalendar', 'About the Hijri Calendar')}
                </h3>
                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{t('tools.hijriDateConverter.theHijriCalendarIsA', 'The Hijri calendar is a lunar calendar with 12 months of 29 or 30 days.')}</p>
                  <p>{t('tools.hijriDateConverter.itBeganIn622Ce', 'It began in 622 CE when Prophet Muhammad migrated from Mecca to Medina.')}</p>
                  <p>{t('tools.hijriDateConverter.theIslamicDayBeginsAt', 'The Islamic day begins at sunset, not midnight.')}</p>
                  <p>{t('tools.hijriDateConverter.noteActualMoonSightingMay', 'Note: Actual moon sighting may vary the dates by 1-2 days.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-500 text-red-300'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              {validationMessage}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
}
