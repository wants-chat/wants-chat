import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Clock, DollarSign, Plus, Minus, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Attendee {
  id: string;
  role: string;
  hourlyRate: number;
  count: number;
}

interface MeetingCostToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'count', header: 'Count', type: 'number' },
];

const DEFAULT_ATTENDEES: Attendee[] = [
  { id: '1', role: 'Manager', hourlyRate: 75, count: 1 },
  { id: '2', role: 'Developer', hourlyRate: 50, count: 3 },
  { id: '3', role: 'Designer', hourlyRate: 45, count: 1 },
];

export const MeetingCostTool: React.FC<MeetingCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: attendees,
    setData: setAttendees,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Attendee>('meeting-cost', DEFAULT_ATTENDEES, COLUMNS);

  const [duration, setDuration] = useState(60);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setDuration(params.amount);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setDuration(params.numbers[0]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addAttendee = () => {
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      role: '',
      hourlyRate: 40,
      count: 1,
    };
    addItem(newAttendee);
  };

  const removeAttendee = (id: string) => {
    if (attendees.length > 1) {
      deleteItem(id);
    }
  };

  const updateAttendeeField = (id: string, field: keyof Attendee, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const calculations = useMemo(() => {
    const totalAttendees = attendees.reduce((sum, a) => sum + a.count, 0);
    const hourlyTotal = attendees.reduce((sum, a) => sum + (a.hourlyRate * a.count), 0);
    const minuteRate = hourlyTotal / 60;
    const meetingCost = minuteRate * duration;
    const costPerPerson = totalAttendees > 0 ? meetingCost / totalAttendees : 0;

    return {
      totalAttendees,
      hourlyTotal,
      minuteRate,
      meetingCost,
      costPerPerson,
      costPerMinute: minuteRate,
    };
  }, [attendees, duration]);

  const handleCopy = () => {
    const text = `Meeting Cost Analysis
Duration: ${duration} minutes
Total Attendees: ${calculations.totalAttendees}
Hourly Rate Total: $${calculations.hourlyTotal.toFixed(2)}/hour
Total Meeting Cost: $${calculations.meetingCost.toFixed(2)}
Cost Per Person: $${calculations.costPerPerson.toFixed(2)}
Cost Per Minute: $${calculations.costPerMinute.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetDurations = [15, 30, 45, 60, 90, 120];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-rose-900/20' : 'bg-gradient-to-r from-white to-rose-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Users className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.meetingCost.meetingCostCalculator', 'Meeting Cost Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.meetingCost.calculateTheTrueCostOf', 'Calculate the true cost of meetings')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="meeting-cost" toolName="Meeting Cost" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'meeting-attendees' })}
              onExportExcel={() => exportExcel({ filename: 'meeting-attendees' })}
              onExportJSON={() => exportJSON({ filename: 'meeting-attendees' })}
              onExportPDF={() => exportPDF({ filename: 'meeting-attendees', title: 'Meeting Attendees' })}
              onPrint={() => print('Meeting Attendees')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.meetingCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Meeting Duration: {duration} minutes
            </label>
          </div>
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex flex-wrap gap-2">
            {presetDurations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  duration === d
                    ? 'bg-rose-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Attendees */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.meetingCost.attendees2', 'Attendees')}
            </label>
            <button
              onClick={addAttendee}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.meetingCost.addRole', 'Add Role')}
            </button>
          </div>

          <div className="space-y-2">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center gap-3`}
              >
                <input
                  type="text"
                  value={attendee.role}
                  onChange={(e) => updateAttendeeField(attendee.id, 'role', e.target.value)}
                  placeholder={t('tools.meetingCost.roleName', 'Role name')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <div className="flex items-center gap-1">
                  <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="number"
                    value={attendee.hourlyRate}
                    onChange={(e) => updateAttendeeField(attendee.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                    className={`w-20 px-2 py-2 rounded-lg border text-center ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/hr</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>×</span>
                  <input
                    type="number"
                    min="1"
                    value={attendee.count}
                    onChange={(e) => updateAttendeeField(attendee.id, 'count', parseInt(e.target.value) || 1)}
                    className={`w-14 px-2 py-2 rounded-lg border text-center ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={() => removeAttendee(attendee.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
              {t('tools.meetingCost.meetingCostAnalysis', 'Meeting Cost Analysis')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.meetingCost.copied', 'Copied!') : t('tools.meetingCost.copy', 'Copy')}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`text-sm ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>{t('tools.meetingCost.totalMeetingCost', 'Total Meeting Cost')}</div>
            <div className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.meetingCost.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.totalAttendees}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.meetingCost.attendees', 'Attendees')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.hourlyTotal.toFixed(0)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>$/hour</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.costPerMinute.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>$/minute</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.costPerPerson.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.meetingCost.perPerson', 'per person')}</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.meetingCost.tip', 'Tip:')}</strong> Use this to justify shorter meetings or async communication.
            Is this meeting worth ${calculations.meetingCost.toFixed(2)}?
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetingCostTool;
