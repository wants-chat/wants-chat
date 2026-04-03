import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Plus, Minus, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  businessDays: number;
}

type CalculationMode = 'difference' | 'addSubtract';

interface DateDiffCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DateDiffCalculatorTool = ({ uiConfig }: DateDiffCalculatorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [mode, setMode] = useState<CalculationMode>('difference');

  // Date Difference inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [diffResult, setDiffResult] = useState<DateDiffResult | null>(null);

  // Add/Subtract inputs
  const [baseDate, setBaseDate] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [daysToAddSubtract, setDaysToAddSubtract] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        // Try to parse date from content
        const parsedDate = new Date(params.content);
        if (!isNaN(parsedDate.getTime())) {
          setStartDate(parsedDate.toISOString().split('T')[0]);
          setIsPrefilled(true);
        }
      } else if (params.amount) {
        // Set days to add/subtract
        setDaysToAddSubtract(params.amount.toString());
        setMode('addSubtract');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateDateDifference = () => {
    if (!startDate || !endDate) {
      setValidationMessage('Please select both start and end dates');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setValidationMessage('Start date must be before end date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate total days
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Calculate years, months, and days
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate business days (excluding weekends)
    let businessDays = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDiffResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      businessDays,
    });
  };

  const calculateAddSubtract = () => {
    if (!baseDate || !daysToAddSubtract) {
      setValidationMessage('Please select a date and enter number of days');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const days = parseInt(daysToAddSubtract);
    if (isNaN(days) || days < 0) {
      setValidationMessage('Please enter a valid positive number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const base = new Date(baseDate);
    const result = new Date(base);

    if (operation === 'add') {
      result.setDate(result.getDate() + days);
    } else {
      result.setDate(result.getDate() - days);
    }

    setResultDate(result.toISOString().split('T')[0]);
  };

  const resetDifference = () => {
    setStartDate('');
    setEndDate('');
    setDiffResult(null);
  };

  const resetAddSubtract = () => {
    setBaseDate('');
    setDaysToAddSubtract('');
    setResultDate('');
  };

  const setToday = (field: 'start' | 'end' | 'base') => {
    const today = new Date().toISOString().split('T')[0];
    if (field === 'start') setStartDate(today);
    else if (field === 'end') setEndDate(today);
    else setBaseDate(today);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.dateDiffCalculator.dateCalculator', 'Date Calculator')}
            </h1>
          </div>

          {/* Mode Tabs */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('difference')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  mode === 'difference'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.dateDiffCalculator.dateDifference', 'Date Difference')}
              </button>
              <button
                onClick={() => setMode('addSubtract')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  mode === 'addSubtract'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.dateDiffCalculator.addSubtractDays', 'Add/Subtract Days')}
              </button>
            </div>
          </div>

          {/* Date Difference Mode */}
          {mode === 'difference' && (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dateDiffCalculator.startDate', 'Start Date')}
                    </label>
                    <button
                      onClick={() => setToday('start')}
                      className={`text-xs px-2 py-1 rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.dateDiffCalculator.today', 'Today')}
                    </button>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  {startDate && (
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(startDate)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dateDiffCalculator.endDate', 'End Date')}
                    </label>
                    <button
                      onClick={() => setToday('end')}
                      className={`text-xs px-2 py-1 rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.dateDiffCalculator.today2', 'Today')}
                    </button>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  {endDate && (
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(endDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={calculateDateDifference}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  {t('tools.dateDiffCalculator.calculateDifference', 'Calculate Difference')}
                </button>
                <button
                  onClick={resetDifference}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.dateDiffCalculator.reset', 'Reset')}
                </button>
              </div>

              {/* Result Display */}
              {diffResult && (
                <div className="space-y-4">
                  <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.dateDiffCalculator.bg0d948810', 'bg-[#0D9488]/10')
                  }`}>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-[#0D9488] mb-2">
                        {diffResult.years > 0 && `${diffResult.years} ${diffResult.years === 1 ? t('tools.dateDiffCalculator.year', 'Year') : t('tools.dateDiffCalculator.years', 'Years')} `}
                        {diffResult.months > 0 && `${diffResult.months} ${diffResult.months === 1 ? t('tools.dateDiffCalculator.month', 'Month') : t('tools.dateDiffCalculator.months', 'Months')} `}
                        {diffResult.days} {diffResult.days === 1 ? t('tools.dateDiffCalculator.day', 'Day') : t('tools.dateDiffCalculator.days', 'Days')}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total: {diffResult.totalDays.toLocaleString()} days
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          {t('tools.dateDiffCalculator.weeks', 'Weeks')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {diffResult.totalWeeks.toLocaleString()}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          {t('tools.dateDiffCalculator.businessDays', 'Business Days')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {diffResult.businessDays.toLocaleString()}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          {t('tools.dateDiffCalculator.hours', 'Hours')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {diffResult.totalHours.toLocaleString()}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          {t('tools.dateDiffCalculator.minutes', 'Minutes')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {diffResult.totalMinutes.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {t('tools.dateDiffCalculator.detailedBreakdown', 'Detailed Breakdown:')}
                    </div>
                    <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div>• {diffResult.totalDays.toLocaleString()} total days</div>
                      <div>• {diffResult.totalWeeks.toLocaleString()} weeks and {diffResult.totalDays % 7} days</div>
                      <div>• {diffResult.businessDays.toLocaleString()} business days (excluding weekends)</div>
                      <div>• {diffResult.totalHours.toLocaleString()} hours</div>
                      <div>• {diffResult.totalMinutes.toLocaleString()} minutes</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Add/Subtract Mode */}
          {mode === 'addSubtract' && (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dateDiffCalculator.baseDate', 'Base Date')}
                    </label>
                    <button
                      onClick={() => setToday('base')}
                      className={`text-xs px-2 py-1 rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.dateDiffCalculator.today3', 'Today')}
                    </button>
                  </div>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  {baseDate && (
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(baseDate)}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dateDiffCalculator.operation', 'Operation')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOperation('add')}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        operation === 'add'
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      {t('tools.dateDiffCalculator.addDays', 'Add Days')}
                    </button>
                    <button
                      onClick={() => setOperation('subtract')}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        operation === 'subtract'
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Minus className="w-5 h-5" />
                      {t('tools.dateDiffCalculator.subtractDays', 'Subtract Days')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dateDiffCalculator.numberOfDays', 'Number of Days')}
                  </label>
                  <input
                    type="number"
                    value={daysToAddSubtract}
                    onChange={(e) => setDaysToAddSubtract(e.target.value)}
                    placeholder={t('tools.dateDiffCalculator.enterNumberOfDays', 'Enter number of days')}
                    min="0"
                    step="1"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {/* Quick Days */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.dateDiffCalculator.quickDays', 'Quick Days')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[7, 14, 30, 60, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => setDaysToAddSubtract(days.toString())}
                        className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                          daysToAddSubtract === days.toString()
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={calculateAddSubtract}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {operation === 'add' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  Calculate
                </button>
                <button
                  onClick={resetAddSubtract}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.dateDiffCalculator.reset2', 'Reset')}
                </button>
              </div>

              {/* Result Date Display */}
              {resultDate && (
                <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                  theme === 'dark' ? 'bg-gray-700' : t('tools.dateDiffCalculator.bg0d9488102', 'bg-[#0D9488]/10')
                }`}>
                  <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.dateDiffCalculator.resultDate', 'Result Date')}
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488] mb-2">
                    {formatDate(resultDate)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {baseDate && (
                      <>
                        {operation === 'add' ? t('tools.dateDiffCalculator.adding', 'Adding') : t('tools.dateDiffCalculator.subtracting', 'Subtracting')} {daysToAddSubtract} days{' '}
                        {operation === 'add' ? 'to' : 'from'} {formatDate(baseDate)}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.dateDiffCalculator.aboutDateCalculations', 'About Date Calculations')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                {t('tools.dateDiffCalculator.businessDaysExcludeWeekendsSaturday', '• Business days exclude weekends (Saturday and Sunday)')}
              </p>
              <p>
                {t('tools.dateDiffCalculator.allCalculationsUseCalendarDays', '• All calculations use calendar days unless specified otherwise')}
              </p>
              <p>
                {t('tools.dateDiffCalculator.leapYearsAreAutomaticallyAccounted', '• Leap years are automatically accounted for in the calculations')}
              </p>
            </div>
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm p-4 rounded-lg shadow-lg ${
              theme === 'dark'
                ? 'bg-red-900/20 border border-red-600 text-red-300'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              {validationMessage}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};
