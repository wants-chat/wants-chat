import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, AlertTriangle, Check, Calendar, Info, Search, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TireAgeCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const TireAgeCalculatorTool: React.FC<TireAgeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dotCode, setDotCode] = useState('2521');
  const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear().toString());
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.dotCode) {
        setDotCode(params.dotCode);
        setIsPrefilled(true);
      }
      if (params.purchaseYear !== undefined) {
        setPurchaseYear(String(params.purchaseYear));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.dotCode) {
        const dotMatch = textContent.match(/\b(\d{4})\b/);
        if (dotMatch) {
          setDotCode(dotMatch[1]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const code = dotCode.replace(/\s/g, '');
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentWeek = Math.ceil((today.getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    let week = 0;
    let year = 0;
    let isValid = false;
    let manufactureDate: Date | null = null;

    if (code.length === 4 && /^\d{4}$/.test(code)) {
      week = parseInt(code.substring(0, 2));
      const yearDigits = parseInt(code.substring(2, 4));

      // Determine century (tires older than 2000 are rare but possible)
      if (yearDigits >= 0 && yearDigits <= (currentYear % 100)) {
        year = 2000 + yearDigits;
      } else {
        year = 1900 + yearDigits;
      }

      if (week >= 1 && week <= 52 && year >= 1990 && year <= currentYear) {
        isValid = true;
        // Calculate approximate manufacture date
        manufactureDate = new Date(year, 0, 1);
        manufactureDate.setDate(manufactureDate.getDate() + (week - 1) * 7);
      }
    }

    // Calculate age
    let ageYears = 0;
    let ageMonths = 0;
    let ageWeeks = 0;
    let totalWeeks = 0;

    if (manufactureDate) {
      const diffTime = today.getTime() - manufactureDate.getTime();
      totalWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
      ageYears = Math.floor(totalWeeks / 52);
      ageMonths = Math.floor((totalWeeks % 52) / 4.33);
      ageWeeks = Math.floor(totalWeeks % 4.33);
    }

    // Determine status
    let status: 'good' | 'fair' | 'warning' | 'danger' = 'good';
    let recommendation = '';
    let remainingLife = 0;

    if (isValid) {
      const maxAge = 10; // Maximum recommended tire age in years
      remainingLife = Math.max(0, maxAge - ageYears);

      if (ageYears >= 10) {
        status = 'danger';
        recommendation = 'Replace immediately. Tires over 10 years old should never be used.';
      } else if (ageYears >= 6) {
        status = 'warning';
        recommendation = 'Consider replacement soon. Have tires inspected annually.';
      } else if (ageYears >= 4) {
        status = 'fair';
        recommendation = 'Monitor tread wear and condition. Still within safe use period.';
      } else {
        status = 'good';
        recommendation = 'Tire is in good age condition. Continue regular inspections.';
      }
    }

    return {
      isValid,
      week,
      year,
      manufactureDate,
      ageYears,
      ageMonths,
      ageWeeks,
      totalWeeks,
      status,
      recommendation,
      remainingLife,
    };
  }, [dotCode]);

  const statusColors = {
    good: { bg: 'bg-green-500', text: 'text-green-500', bgLight: isDark ? 'bg-green-900/20' : 'bg-green-50' },
    fair: { bg: 'bg-yellow-500', text: 'text-yellow-500', bgLight: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50' },
    warning: { bg: 'bg-orange-500', text: 'text-orange-500', bgLight: isDark ? 'bg-orange-900/20' : 'bg-orange-50' },
    danger: { bg: 'bg-red-500', text: 'text-red-500', bgLight: isDark ? 'bg-red-900/20' : 'bg-red-50' },
  };

  const exampleCodes = ['0122', '2521', '3019', '4515', '1210'];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-slate-900/40' : 'bg-gradient-to-r from-white to-slate-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-500/10 rounded-lg"><Circle className="w-5 h-5 text-slate-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tireAgeCalculator.tireAgeCalculator', 'Tire Age Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tireAgeCalculator.checkYourTireSManufacturing', 'Check your tire\'s manufacturing date')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tireAgeCalculator.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
          </div>
        )}

        {/* DOT Code Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Search className="w-4 h-4 inline mr-1" />
            {t('tools.tireAgeCalculator.dotDateCodeLast4', 'DOT Date Code (last 4 digits)')}
          </label>
          <input
            type="text"
            value={dotCode}
            onChange={(e) => setDotCode(e.target.value.slice(0, 4))}
            maxLength={4}
            placeholder="e.g., 2521"
            className={`w-full px-4 py-3 rounded-lg border text-2xl text-center tracking-widest font-mono ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.tireAgeCalculator.lookForDotCodeOn', 'Look for DOT code on tire sidewall. Enter the last 4 digits (WWYY format).')}
          </div>
        </div>

        {/* Example Codes */}
        <div className="flex gap-2 flex-wrap">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tireAgeCalculator.examples', 'Examples:')}</span>
          {exampleCodes.map(code => (
            <button
              key={code}
              onClick={() => setDotCode(code)}
              className={`px-3 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Visual DOT Decoder */}
        {dotCode.length === 4 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-center gap-1 text-4xl font-mono mb-3">
              <span className="bg-blue-500/20 px-3 py-2 rounded text-blue-500">{dotCode.substring(0, 2)}</span>
              <span className="bg-purple-500/20 px-3 py-2 rounded text-purple-500">{dotCode.substring(2, 4)}</span>
            </div>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-blue-500 font-medium">{t('tools.tireAgeCalculator.week', 'Week')}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {calculations.isValid ? `Week ${calculations.week}` : 'Invalid'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-purple-500 font-medium">{t('tools.tireAgeCalculator.year', 'Year')}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {calculations.isValid ? calculations.year : 'Invalid'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {calculations.isValid ? (
          <>
            {/* Age Display */}
            <div className={`p-6 rounded-xl text-center ${statusColors[calculations.status].bgLight} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {calculations.status === 'danger' || calculations.status === 'warning' ? (
                <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${statusColors[calculations.status].text}`} />
              ) : (
                <Check className={`w-8 h-8 mx-auto mb-2 ${statusColors[calculations.status].text}`} />
              )}
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tireAgeCalculator.tireAge', 'Tire Age')}</div>
              <div className={`text-4xl font-bold my-2 ${statusColors[calculations.status].text}`}>
                {calculations.ageYears} years {calculations.ageMonths} months
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Manufactured: {calculations.manufactureDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-lg ${statusColors[calculations.status].bgLight}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${statusColors[calculations.status].bg}`}>
                  {calculations.status === 'good' ? '✓' :
                   calculations.status === 'fair' ? '!' :
                   calculations.status === 'warning' ? '⚠' : '✕'}
                </div>
                <div>
                  <div className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.status === 'good' ? 'Good Condition' :
                     calculations.status === 'fair' ? 'Fair Condition' :
                     calculations.status === 'warning' ? t('tools.tireAgeCalculator.needsAttention', 'Needs Attention') : t('tools.tireAgeCalculator.replaceNow', 'Replace Now')}
                  </div>
                  <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {calculations.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tireAgeCalculator.totalWeeks', 'Total Weeks')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.totalWeeks}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tireAgeCalculator.maxAgeLimit', 'Max Age Limit')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.tireAgeCalculator.10Years', '10 years')}
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tireAgeCalculator.remaining', 'Remaining')}</div>
                <div className={`text-2xl font-bold ${calculations.remainingLife <= 2 ? 'text-red-500' : calculations.remainingLife <= 4 ? 'text-orange-500' : 'text-green-500'}`}>
                  {calculations.remainingLife} years
                </div>
              </div>
            </div>

            {/* Age Timeline */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tireAgeCalculator.ageProgress', 'Age Progress')}</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.ageYears}/10 years</span>
              </div>
              <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full transition-all ${statusColors[calculations.status].bg}`}
                  style={{ width: `${Math.min(100, (calculations.ageYears / 10) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-500">{t('tools.tireAgeCalculator.new', 'New')}</span>
                <span className="text-yellow-500">4 yrs</span>
                <span className="text-orange-500">6 yrs</span>
                <span className="text-red-500">10 yrs</span>
              </div>
            </div>
          </>
        ) : (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tireAgeCalculator.invalidDotCode', 'Invalid DOT Code')}</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.tireAgeCalculator.pleaseEnterAValid4', 'Please enter a valid 4-digit DOT date code (WWYY format)')}
            </div>
          </div>
        )}

        {/* How to Find */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.tireAgeCalculator.howToFindTheDot', 'How to find the DOT code:')}</strong>
              <ol className="mt-1 space-y-1 list-decimal list-inside">
                <li>{t('tools.tireAgeCalculator.lookOnTheTireSidewall', 'Look on the tire sidewall for "DOT" followed by numbers')}</li>
                <li>{t('tools.tireAgeCalculator.theLast4DigitsShow', 'The last 4 digits show manufacture date (WWYY)')}</li>
                <li>Example: 2521 = Week 25 of 2021</li>
                <li>{t('tools.tireAgeCalculator.theCodeMayOnlyAppear', 'The code may only appear on one side of the tire')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireAgeCalculatorTool;
