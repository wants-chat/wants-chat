import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Calendar, Droplets, Clock, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type LensType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface LensConfig {
  name: string;
  replacementDays: number;
  description: string;
  careTips: string[];
  solutionReminder: boolean;
}

interface ContactLensReminderToolProps {
  uiConfig?: UIConfig;
}

export const ContactLensReminderTool: React.FC<ContactLensReminderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [lensType, setLensType] = useState<LensType>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showCareTips, setShowCareTips] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Lens type can be prefilled from text content
      if (params.texts && params.texts.length > 0) {
        const lensTypeText = params.texts[0].toLowerCase();
        if (['daily', 'weekly', 'biweekly', 'monthly'].includes(lensTypeText)) {
          setLensType(lensTypeText as LensType);
          setIsPrefilled(true);
        }
      }
      // Date can be prefilled
      if (params.dates && params.dates.length > 0) {
        setStartDate(params.dates[0]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const lensTypes: Record<LensType, LensConfig> = {
    daily: {
      name: 'Daily Disposable',
      replacementDays: 1,
      description: 'Single-use lenses discarded each night',
      careTips: [
        'Never reuse daily lenses',
        'Wash hands before handling',
        'Discard lens if it falls out',
        'Use a new lens each morning',
      ],
      solutionReminder: false,
    },
    weekly: {
      name: 'Weekly',
      replacementDays: 7,
      description: 'Replace every 7 days with proper care',
      careTips: [
        'Clean lenses every night',
        'Use fresh solution daily',
        'Never use tap water',
        'Replace case every 3 months',
      ],
      solutionReminder: true,
    },
    biweekly: {
      name: 'Bi-Weekly',
      replacementDays: 14,
      description: 'Replace every 14 days with proper care',
      careTips: [
        'Clean and disinfect nightly',
        'Rub lenses gently when cleaning',
        'Store in fresh solution always',
        'Check for tears or deposits',
      ],
      solutionReminder: true,
    },
    monthly: {
      name: 'Monthly',
      replacementDays: 30,
      description: 'Replace every 30 days with proper care',
      careTips: [
        'Deep clean weekly with protein remover',
        'Never sleep in lenses unless approved',
        'Replace solution in case daily',
        'Visit eye doctor annually',
      ],
      solutionReminder: true,
    },
  };

  const config = lensTypes[lensType];

  const calculations = useMemo(() => {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const dueDate = new Date(start);
    dueDate.setDate(dueDate.getDate() + config.replacementDays);

    const daysUsed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const percentageUsed = Math.min(100, Math.max(0, (daysUsed / config.replacementDays) * 100));

    const isOverdue = daysRemaining < 0;
    const isDueSoon = daysRemaining >= 0 && daysRemaining <= 2;

    // Solution reminder: typically replace every 3 months
    const solutionDueDate = new Date(start);
    solutionDueDate.setMonth(solutionDueDate.getMonth() + 3);
    const solutionDaysRemaining = Math.floor((solutionDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      startDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysUsed: Math.max(0, daysUsed),
      daysRemaining,
      percentageUsed,
      isOverdue,
      isDueSoon,
      solutionDueDate: solutionDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      solutionDaysRemaining,
    };
  }, [startDate, config.replacementDays]);

  const handleStartNewPair = () => {
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  const getStatusColor = () => {
    if (calculations.isOverdue) return 'text-red-500';
    if (calculations.isDueSoon) return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusBg = () => {
    if (calculations.isOverdue) return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
    if (calculations.isDueSoon) return isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200';
    return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Eye className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contactLensReminder.contactLensReminder', 'Contact Lens Reminder')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.contactLensReminder.trackReplacementScheduleAndCare', 'Track replacement schedule and care')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lens Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(lensTypes) as LensType[]).map((type) => (
            <button
              key={type}
              onClick={() => setLensType(type)}
              className={`py-2 px-3 rounded-lg text-sm ${lensType === type ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {lensTypes[type].name}
            </button>
          ))}
        </div>

        {/* Lens Type Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-cyan-500 font-bold">{config.replacementDays} day{config.replacementDays > 1 ? 's' : ''}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.description}
          </p>
        </div>

        {/* Start Date Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('tools.contactLensReminder.lensStartDate', 'Lens Start Date')}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Status Display */}
        <div className={`p-4 rounded-lg border ${getStatusBg()}`}>
          <div className="flex items-center gap-2 mb-3">
            {calculations.isOverdue ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : calculations.isDueSoon ? (
              <Clock className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <span className={`font-medium ${getStatusColor()}`}>
              {calculations.isOverdue ? 'Replacement Overdue!' : calculations.isDueSoon ? t('tools.contactLensReminder.replaceSoon', 'Replace Soon') : t('tools.contactLensReminder.onTrack', 'On Track')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-3`}>
            <div
              className={`h-full rounded-full transition-all ${
                calculations.isOverdue ? 'bg-red-500' : calculations.isDueSoon ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, calculations.percentageUsed)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.contactLensReminder.started', 'Started:')}</span> {calculations.startDate}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.contactLensReminder.replaceBy', 'Replace by:')}</span> {calculations.dueDate}
            </div>
          </div>
        </div>

        {/* Days Counter */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contactLensReminder.daysUsed', 'Days Used')}</span>
            </div>
            <div className="text-3xl font-bold text-cyan-500">{calculations.daysUsed}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              of {config.replacementDays} days
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contactLensReminder.daysLeft', 'Days Left')}</span>
            </div>
            <div className={`text-3xl font-bold ${getStatusColor()}`}>
              {calculations.isOverdue ? Math.abs(calculations.daysRemaining) : calculations.daysRemaining}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.isOverdue ? t('tools.contactLensReminder.daysOverdue', 'days overdue') : t('tools.contactLensReminder.daysRemaining', 'days remaining')}
            </div>
          </div>
        </div>

        {/* Start New Pair Button */}
        <button
          onClick={handleStartNewPair}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
        >
          {t('tools.contactLensReminder.startNewPairToday', 'Start New Pair Today')}
        </button>

        {/* Solution Reminder (for non-daily lenses) */}
        {config.solutionReminder && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.contactLensReminder.solutionReminder', 'Solution Reminder')}</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Replace your lens solution bottle by <span className="font-medium">{calculations.solutionDueDate}</span>
              <br />
              <span className="text-xs">(3 months from start - {calculations.solutionDaysRemaining} days remaining)</span>
            </p>
          </div>
        )}

        {/* Care Tips Toggle */}
        <button
          onClick={() => setShowCareTips(!showCareTips)}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Care Tips for {config.name}
          </span>
          <span>{showCareTips ? '-' : '+'}</span>
        </button>

        {/* Care Tips */}
        {showCareTips && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>{t('tools.contactLensReminder.careTips', 'Care Tips:')}</strong>
                <ul className="mt-1 space-y-1">
                  {config.careTips.map((tip, index) => (
                    <li key={index}>- {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* General Reminders */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.contactLensReminder.importantReminders', 'Important Reminders:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Never wear lenses past their replacement date</li>
                <li>- Remove lenses if you experience discomfort</li>
                <li>- See your eye doctor if you notice vision changes</li>
                <li>- Replace lens case every 3 months</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactLensReminderTool;
