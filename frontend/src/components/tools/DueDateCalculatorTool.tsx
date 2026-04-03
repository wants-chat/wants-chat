import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Calendar, Heart, Clock, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CalculationMethod = 'lmp' | 'conception' | 'ivf' | 'ultrasound';

interface DueDateCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DueDateCalculatorTool: React.FC<DueDateCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [method, setMethod] = useState<CalculationMethod>('lmp');
  const [lmpDate, setLmpDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');
  const [ivfDate, setIvfDate] = useState('');
  const [ivfType, setIvfType] = useState<'3day' | '5day'>('5day');
  const [ultrasoundDate, setUltrasoundDate] = useState('');
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState('8');
  const [ultrasoundDays, setUltrasoundDays] = useState('0');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        // Try to parse date from content and set as LMP date
        const parsedDate = new Date(params.content);
        if (!isNaN(parsedDate.getTime())) {
          setLmpDate(parsedDate.toISOString().split('T')[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    let dueDate: Date | null = null;
    let conceptionDay: Date | null = null;

    switch (method) {
      case 'lmp':
        if (lmpDate) {
          const lmp = new Date(lmpDate);
          dueDate = new Date(lmp);
          dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
          conceptionDay = new Date(lmp);
          conceptionDay.setDate(conceptionDay.getDate() + 14);
        }
        break;
      case 'conception':
        if (conceptionDate) {
          const conception = new Date(conceptionDate);
          dueDate = new Date(conception);
          dueDate.setDate(dueDate.getDate() + 266); // 38 weeks from conception
          conceptionDay = conception;
        }
        break;
      case 'ivf':
        if (ivfDate) {
          const ivf = new Date(ivfDate);
          dueDate = new Date(ivf);
          const daysToAdd = ivfType === '5day' ? 261 : 263;
          dueDate.setDate(dueDate.getDate() + daysToAdd);
          conceptionDay = new Date(ivf);
          conceptionDay.setDate(conceptionDay.getDate() - (ivfType === '5day' ? 5 : 3));
        }
        break;
      case 'ultrasound':
        if (ultrasoundDate) {
          const ultrasound = new Date(ultrasoundDate);
          const weeksAtScan = parseInt(ultrasoundWeeks) || 0;
          const daysAtScan = parseInt(ultrasoundDays) || 0;
          const totalDaysAtScan = weeksAtScan * 7 + daysAtScan;
          dueDate = new Date(ultrasound);
          dueDate.setDate(dueDate.getDate() + (280 - totalDaysAtScan));
          conceptionDay = new Date(dueDate);
          conceptionDay.setDate(conceptionDay.getDate() - 266);
        }
        break;
    }

    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const gestationalAge = 280 - daysUntilDue;
    const weeksPregnant = Math.floor(gestationalAge / 7);
    const daysPregnant = gestationalAge % 7;

    // Key milestones
    const firstTrimesterEnd = new Date(dueDate);
    firstTrimesterEnd.setDate(firstTrimesterEnd.getDate() - 182); // Week 13

    const secondTrimesterEnd = new Date(dueDate);
    secondTrimesterEnd.setDate(secondTrimesterEnd.getDate() - 91); // Week 27

    const viabilityDate = new Date(dueDate);
    viabilityDate.setDate(viabilityDate.getDate() - 112); // Week 24

    const fullTermStart = new Date(dueDate);
    fullTermStart.setDate(fullTermStart.getDate() - 21); // Week 37

    // Current trimester
    let trimester = 1;
    if (gestationalAge >= 91) trimester = 2;
    if (gestationalAge >= 182) trimester = 3;

    return {
      dueDate,
      conceptionDay,
      daysUntilDue,
      weeksPregnant,
      daysPregnant,
      gestationalAge,
      trimester,
      milestones: {
        firstTrimesterEnd,
        secondTrimesterEnd,
        viabilityDate,
        fullTermStart,
      },
    };
  }, [method, lmpDate, conceptionDate, ivfDate, ivfType, ultrasoundDate, ultrasoundWeeks, ultrasoundDays]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDateInput = () => {
    switch (method) {
      case 'lmp':
        return (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.dueDateCalculator.firstDayOfLastMenstrual', 'First Day of Last Menstrual Period')}
            </label>
            <input
              type="date"
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        );
      case 'conception':
        return (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.dueDateCalculator.conceptionDate', 'Conception Date')}
            </label>
            <input
              type="date"
              value={conceptionDate}
              onChange={(e) => setConceptionDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        );
      case 'ivf':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.dueDateCalculator.ivfTransferDate', 'IVF Transfer Date')}
              </label>
              <input
                type="date"
                value={ivfDate}
                onChange={(e) => setIvfDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIvfType('3day')}
                className={`flex-1 py-2 rounded-lg ${ivfType === '3day' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.dueDateCalculator.3DayEmbryo', '3-Day Embryo')}
              </button>
              <button
                onClick={() => setIvfType('5day')}
                className={`flex-1 py-2 rounded-lg ${ivfType === '5day' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.dueDateCalculator.5DayBlastocyst', '5-Day Blastocyst')}
              </button>
            </div>
          </div>
        );
      case 'ultrasound':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.dueDateCalculator.ultrasoundDate', 'Ultrasound Date')}
              </label>
              <input
                type="date"
                value={ultrasoundDate}
                onChange={(e) => setUltrasoundDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dueDateCalculator.weeks', 'Weeks')}</label>
                <input
                  type="number"
                  value={ultrasoundWeeks}
                  onChange={(e) => setUltrasoundWeeks(e.target.value)}
                  min="0"
                  max="42"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dueDateCalculator.days', 'Days')}</label>
                <input
                  type="number"
                  value={ultrasoundDays}
                  onChange={(e) => setUltrasoundDays(e.target.value)}
                  min="0"
                  max="6"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><Baby className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dueDateCalculator.dueDateCalculator', 'Due Date Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dueDateCalculator.estimateYourPregnancyDueDate', 'Estimate your pregnancy due date')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Calculation Method */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.dueDateCalculator.calculationMethod', 'Calculation Method')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'lmp', name: 'Last Period' },
              { id: 'conception', name: 'Conception' },
              { id: 'ivf', name: 'IVF Transfer' },
              { id: 'ultrasound', name: 'Ultrasound' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id as CalculationMethod)}
                className={`py-2 rounded-lg text-sm ${method === m.id ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date Input */}
        {getDateInput()}

        {/* Results */}
        {calculations && (
          <>
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dueDateCalculator.estimatedDueDate', 'Estimated Due Date')}</div>
              <div className="text-3xl font-bold text-pink-500 my-2">
                {formatDate(calculations.dueDate)}
              </div>
              {calculations.daysUntilDue > 0 ? (
                <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {calculations.daysUntilDue} days to go
                </div>
              ) : (
                <div className="text-lg text-pink-500">{t('tools.dueDateCalculator.babyIsDue', 'Baby is due!')}</div>
              )}
            </div>

            {/* Current Progress */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Clock className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.weeksPregnant}w {calculations.daysPregnant}d
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>pregnant</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Heart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Trimester {calculations.trimester}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dueDateCalculator.of3', 'of 3')}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex justify-between text-sm mb-2">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dueDateCalculator.progress', 'Progress')}</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {Math.min(100, Math.round((calculations.gestationalAge / 280) * 100))}%
                </span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
                  style={{ width: `${Math.min(100, (calculations.gestationalAge / 280) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.dueDateCalculator.week0', 'Week 0')}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.dueDateCalculator.week40', 'Week 40')}</span>
              </div>
            </div>

            {/* Key Dates */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('tools.dueDateCalculator.keyMilestones', 'Key Milestones')}
              </h4>
              <div className="space-y-2 text-sm">
                {calculations.conceptionDay && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dueDateCalculator.conception', 'Conception')}</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.conceptionDay.toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dueDateCalculator.endOf1stTrimester', 'End of 1st Trimester')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.milestones.firstTrimesterEnd.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dueDateCalculator.endOf2ndTrimester', 'End of 2nd Trimester')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.milestones.secondTrimesterEnd.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dueDateCalculator.fullTerm37Weeks', 'Full Term (37 weeks)')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{calculations.milestones.fullTermStart.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.dueDateCalculator.thisIsAnEstimateOnly', 'This is an estimate only. Only about 5% of babies are born on their due date. Most arrive within 2 weeks before or after. Consult your healthcare provider for accurate dating.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DueDateCalculatorTool;
