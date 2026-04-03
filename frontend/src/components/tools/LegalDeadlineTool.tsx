import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertTriangle, Plus, Trash2, Bell, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface LegalDeadlineToolProps {
  uiConfig?: UIConfig;
}

type DeadlineType =
  | 'filing'
  | 'response'
  | 'discovery'
  | 'motion'
  | 'appeal'
  | 'statute_limitations'
  | 'trial'
  | 'mediation'
  | 'deposition'
  | 'custom';

type JurisdictionType = 'federal' | 'state' | 'local';

interface Deadline {
  id: string;
  name: string;
  type: DeadlineType;
  jurisdiction: JurisdictionType;
  baseDate: string;
  daysToAdd: number;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  calculatedDate: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'missed';
}

const DEADLINE_TYPES: { value: DeadlineType; label: string; defaultDays: number }[] = [
  { value: 'filing', label: 'Filing Deadline', defaultDays: 30 },
  { value: 'response', label: 'Response/Answer', defaultDays: 21 },
  { value: 'discovery', label: 'Discovery Deadline', defaultDays: 30 },
  { value: 'motion', label: 'Motion Deadline', defaultDays: 14 },
  { value: 'appeal', label: 'Appeal Deadline', defaultDays: 30 },
  { value: 'statute_limitations', label: 'Statute of Limitations', defaultDays: 365 },
  { value: 'trial', label: 'Trial Date', defaultDays: 180 },
  { value: 'mediation', label: 'Mediation', defaultDays: 60 },
  { value: 'deposition', label: 'Deposition', defaultDays: 21 },
  { value: 'custom', label: 'Custom Deadline', defaultDays: 30 },
];

const FEDERAL_HOLIDAYS_2024_2025 = [
  '2024-01-01', '2024-01-15', '2024-02-19', '2024-05-27', '2024-06-19',
  '2024-07-04', '2024-09-02', '2024-10-14', '2024-11-11', '2024-11-28',
  '2024-12-25', '2025-01-01', '2025-01-20', '2025-02-17', '2025-05-26',
  '2025-06-19', '2025-07-04', '2025-09-01', '2025-10-13', '2025-11-11',
  '2025-11-27', '2025-12-25', '2026-01-01', '2026-01-19', '2026-02-16',
];

const COMMON_RULES: { jurisdiction: string; type: string; days: number; description: string }[] = [
  { jurisdiction: 'Federal', type: 'Answer to Complaint', days: 21, description: 'FRCP Rule 12(a)(1)(A)(i)' },
  { jurisdiction: 'Federal', type: 'Motion to Dismiss', days: 21, description: 'FRCP Rule 12(a)(1)(A)(i)' },
  { jurisdiction: 'Federal', type: 'Response to Motion', days: 14, description: 'Local rules vary' },
  { jurisdiction: 'Federal', type: 'Appeal (Civil)', days: 30, description: 'FRAP Rule 4(a)(1)(A)' },
  { jurisdiction: 'Federal', type: 'Appeal (Criminal)', days: 14, description: 'FRAP Rule 4(b)(1)(A)' },
  { jurisdiction: 'State (CA)', type: 'Answer to Complaint', days: 30, description: 'CCP Section 412.20' },
  { jurisdiction: 'State (NY)', type: 'Answer to Complaint', days: 20, description: 'CPLR Section 3012' },
  { jurisdiction: 'State (TX)', type: 'Answer to Complaint', days: 20, description: 'TRCP Rule 99' },
];

export default function LegalDeadlineTool({ uiConfig }: LegalDeadlineToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [currentDeadline, setCurrentDeadline] = useState<Partial<Deadline>>({
    type: 'response',
    jurisdiction: 'federal',
    daysToAdd: 21,
    excludeWeekends: false,
    excludeHolidays: false,
    priority: 'medium',
    status: 'pending',
    notes: '',
  });
  const [showRulesReference, setShowRulesReference] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isHoliday = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return FEDERAL_HOLIDAYS_2024_2025.includes(dateStr);
  };

  const calculateDeadlineDate = (
    baseDate: string,
    daysToAdd: number,
    excludeWeekends: boolean,
    excludeHolidays: boolean
  ): string => {
    if (!baseDate) return '';

    let date = new Date(baseDate);
    let daysAdded = 0;

    while (daysAdded < daysToAdd) {
      date.setDate(date.getDate() + 1);

      if (excludeWeekends && isWeekend(date)) continue;
      if (excludeHolidays && isHoliday(date)) continue;

      daysAdded++;
    }

    // If final date falls on weekend/holiday, move to next business day
    while ((excludeWeekends && isWeekend(date)) || (excludeHolidays && isHoliday(date))) {
      date.setDate(date.getDate() + 1);
    }

    return date.toISOString().split('T')[0];
  };

  const handleTypeChange = (type: DeadlineType) => {
    const defaultDays = DEADLINE_TYPES.find(t => t.value === type)?.defaultDays || 30;
    setCurrentDeadline(prev => ({
      ...prev,
      type,
      daysToAdd: defaultDays,
    }));
  };

  const addDeadline = () => {
    if (!currentDeadline.name || !currentDeadline.baseDate) {
      setValidationMessage('Please enter a deadline name and base date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const calculatedDate = calculateDeadlineDate(
      currentDeadline.baseDate!,
      currentDeadline.daysToAdd!,
      currentDeadline.excludeWeekends!,
      currentDeadline.excludeHolidays!
    );

    const newDeadline: Deadline = {
      id: Date.now().toString(),
      name: currentDeadline.name!,
      type: currentDeadline.type as DeadlineType,
      jurisdiction: currentDeadline.jurisdiction as JurisdictionType,
      baseDate: currentDeadline.baseDate!,
      daysToAdd: currentDeadline.daysToAdd!,
      excludeWeekends: currentDeadline.excludeWeekends!,
      excludeHolidays: currentDeadline.excludeHolidays!,
      calculatedDate,
      notes: currentDeadline.notes || '',
      priority: currentDeadline.priority as 'high' | 'medium' | 'low',
      status: 'pending',
    };

    setDeadlines(prev => [...prev, newDeadline].sort((a, b) =>
      new Date(a.calculatedDate).getTime() - new Date(b.calculatedDate).getTime()
    ));

    // Reset form
    setCurrentDeadline({
      type: 'response',
      jurisdiction: 'federal',
      daysToAdd: 21,
      excludeWeekends: false,
      excludeHolidays: false,
      priority: 'medium',
      status: 'pending',
      notes: '',
      name: '',
      baseDate: '',
    });
  };

  const removeDeadline = (id: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  const updateDeadlineStatus = (id: string, status: Deadline['status']) => {
    setDeadlines(prev =>
      prev.map(d => (d.id === id ? { ...d, status } : d))
    );
  };

  const getDaysUntil = (dateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysUntil: number, status: Deadline['status']): string => {
    if (status === 'completed') return 'text-green-500';
    if (status === 'missed') return 'text-red-500';
    if (daysUntil < 0) return 'text-red-500';
    if (daysUntil <= 3) return 'text-red-500';
    if (daysUntil <= 7) return 'text-orange-500';
    if (daysUntil <= 14) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPriorityColor = (priority: Deadline['priority']): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
  };

  const exportDeadlines = () => {
    const exportData = {
      caseName,
      caseNumber,
      exportDate: new Date().toISOString(),
      deadlines: deadlines.map(d => ({
        ...d,
        baseDate: new Date(d.baseDate).toLocaleDateString(),
        calculatedDate: new Date(d.calculatedDate).toLocaleDateString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal_deadlines_${caseNumber || 'case'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewDate = currentDeadline.baseDate
    ? calculateDeadlineDate(
        currentDeadline.baseDate,
        currentDeadline.daysToAdd || 0,
        currentDeadline.excludeWeekends || false,
        currentDeadline.excludeHolidays || false
      )
    : '';

  return (
    <>
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-5xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('tools.legalDeadline.legalDeadlineCalculator', 'Legal Deadline Calculator')}</h1>
                <p className="text-teal-100 text-sm mt-1">{t('tools.legalDeadline.calculateAndTrackCourtDeadlines', 'Calculate and track court deadlines with precision')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Case Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.legalDeadline.caseName', 'Case Name')}
                </label>
                <input
                  type="text"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  placeholder={t('tools.legalDeadline.smithVJones', 'Smith v. Jones')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.legalDeadline.caseNumber', 'Case Number')}
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder={t('tools.legalDeadline.2024Cv12345', '2024-CV-12345')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                />
              </div>
            </div>

            {/* Add Deadline Form */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.legalDeadline.addNewDeadline', 'Add New Deadline')}</h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.legalDeadline.deadlineName', 'Deadline Name *')}
                  </label>
                  <input
                    type="text"
                    value={currentDeadline.name || ''}
                    onChange={(e) => setCurrentDeadline(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('tools.legalDeadline.eGAnswerToComplaint', 'e.g., Answer to Complaint')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.legalDeadline.deadlineType2', 'Deadline Type')}
                  </label>
                  <select
                    value={currentDeadline.type}
                    onChange={(e) => handleTypeChange(e.target.value as DeadlineType)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    {DEADLINE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.legalDeadline.jurisdiction2', 'Jurisdiction')}
                  </label>
                  <select
                    value={currentDeadline.jurisdiction}
                    onChange={(e) => setCurrentDeadline(prev => ({ ...prev, jurisdiction: e.target.value as JurisdictionType }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="federal">{t('tools.legalDeadline.federal', 'Federal')}</option>
                    <option value="state">{t('tools.legalDeadline.state', 'State')}</option>
                    <option value="local">{t('tools.legalDeadline.local', 'Local')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.legalDeadline.baseDateTriggerDate', 'Base Date (Trigger Date) *')}
                  </label>
                  <input
                    type="date"
                    value={currentDeadline.baseDate || ''}
                    onChange={(e) => setCurrentDeadline(prev => ({ ...prev, baseDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.legalDeadline.daysToAdd', 'Days to Add')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentDeadline.daysToAdd}
                    onChange={(e) => setCurrentDeadline(prev => ({ ...prev, daysToAdd: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.legalDeadline.priority', 'Priority')}
                  </label>
                  <select
                    value={currentDeadline.priority}
                    onChange={(e) => setCurrentDeadline(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="high">{t('tools.legalDeadline.high', 'High')}</option>
                    <option value="medium">{t('tools.legalDeadline.medium', 'Medium')}</option>
                    <option value="low">{t('tools.legalDeadline.low', 'Low')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentDeadline.excludeWeekends}
                      onChange={(e) => setCurrentDeadline(prev => ({ ...prev, excludeWeekends: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalDeadline.excludeWeekends', 'Exclude Weekends')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentDeadline.excludeHolidays}
                      onChange={(e) => setCurrentDeadline(prev => ({ ...prev, excludeHolidays: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalDeadline.excludeFederalHolidays', 'Exclude Federal Holidays')}</span>
                  </label>
                </div>

                {previewDate && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-teal-900/30' : 'bg-teal-50'} border border-teal-200 dark:border-teal-700`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                        Calculated Deadline: {new Date(previewDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.legalDeadline.notes', 'Notes')}
                </label>
                <textarea
                  value={currentDeadline.notes || ''}
                  onChange={(e) => setCurrentDeadline(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('tools.legalDeadline.additionalNotesOrReminders', 'Additional notes or reminders...')}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={addDeadline}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.legalDeadline.addDeadline', 'Add Deadline')}
                </button>
                <button
                  onClick={() => setShowRulesReference(!showRulesReference)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {showRulesReference ? t('tools.legalDeadline.hide', 'Hide') : t('tools.legalDeadline.show', 'Show')} Rules Reference
                </button>
              </div>
            </div>

            {/* Rules Reference */}
            {showRulesReference && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.legalDeadline.commonDeadlineRulesReference', 'Common Deadline Rules Reference')}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        <th className="text-left py-2 px-3">{t('tools.legalDeadline.jurisdiction', 'Jurisdiction')}</th>
                        <th className="text-left py-2 px-3">{t('tools.legalDeadline.deadlineType', 'Deadline Type')}</th>
                        <th className="text-left py-2 px-3">{t('tools.legalDeadline.days', 'Days')}</th>
                        <th className="text-left py-2 px-3">{t('tools.legalDeadline.rule', 'Rule')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMMON_RULES.map((rule, index) => (
                        <tr
                          key={index}
                          className={`border-t ${isDark ? 'border-gray-600' : 'border-blue-200'}`}
                        >
                          <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rule.jurisdiction}</td>
                          <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rule.type}</td>
                          <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rule.days}</td>
                          <td className={`py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{rule.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deadlines List */}
            {deadlines.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Upcoming Deadlines ({deadlines.filter(d => d.status === 'pending').length} pending)
                  </h3>
                  <button
                    onClick={exportDeadlines}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t('tools.legalDeadline.export', 'Export')}
                  </button>
                </div>

                <div className="space-y-3">
                  {deadlines.map((deadline) => {
                    const daysUntil = getDaysUntil(deadline.calculatedDate);
                    const urgencyColor = getUrgencyColor(daysUntil, deadline.status);

                    return (
                      <div
                        key={deadline.id}
                        className={`p-4 rounded-lg border ${
                          deadline.status === 'completed'
                            ? isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                            : deadline.status === 'missed'
                            ? isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                            : isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {deadline.name}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(deadline.priority)}`}>
                                {deadline.priority}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                {deadline.jurisdiction}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.legalDeadline.baseDate', 'Base Date:')}</span>
                                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                                  {new Date(deadline.baseDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.legalDeadline.deadline', 'Deadline:')}</span>
                                <span className={`font-medium ${urgencyColor}`}>
                                  {new Date(deadline.calculatedDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className={`w-4 h-4 ${urgencyColor}`} />
                                <span className={urgencyColor}>
                                  {deadline.status === 'completed'
                                    ? 'Completed'
                                    : deadline.status === 'missed'
                                    ? 'Missed'
                                    : daysUntil < 0
                                    ? `${Math.abs(daysUntil)} days overdue`
                                    : daysUntil === 0
                                    ? 'Due Today!'
                                    : `${daysUntil} days remaining`}
                                </span>
                              </div>
                            </div>

                            {deadline.notes && (
                              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {deadline.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {deadline.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateDeadlineStatus(deadline.id, 'completed')}
                                  className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title={t('tools.legalDeadline.markAsCompleted', 'Mark as Completed')}
                                >
                                  <Bell className="w-4 h-4" />
                                </button>
                                {daysUntil < 0 && (
                                  <button
                                    onClick={() => updateDeadlineStatus(deadline.id, 'missed')}
                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title={t('tools.legalDeadline.markAsMissed', 'Mark as Missed')}
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => removeDeadline(deadline.id)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title={t('tools.legalDeadline.remove', 'Remove')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {deadlines.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.legalDeadline.noDeadlinesAddedYetAdd', 'No deadlines added yet. Add your first deadline above.')}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>{t('tools.legalDeadline.disclaimer', 'Disclaimer:')}</strong> This tool is for reference purposes only. Always verify deadline calculations
                against applicable court rules and local practices. Consult with a licensed attorney for legal advice.
                Federal holidays may vary, and state/local holidays are not included in calculations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
}
