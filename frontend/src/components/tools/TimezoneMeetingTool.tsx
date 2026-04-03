import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Clock, Plus, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface Participant {
  id: string;
  name: string;
  timezone: string;
}

interface TimezoneMeetingToolProps {
  uiConfig?: UIConfig;
}

const timezones = [
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)', offset: -5 },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: 5.5 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 10 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 12 },
];

// Column configuration for participant data persistence
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Participant', type: 'string' },
  { key: 'timezone', header: 'Timezone', type: 'string' },
];

// Column configuration for export (includes calculated fields)
const EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Participant', type: 'string' },
  { key: 'timezoneLabel', header: 'Timezone', type: 'string' },
  { key: 'localTime', header: 'Local Time', type: 'string' },
  { key: 'dayOffsetLabel', header: 'Day Offset', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Default participants for new users
const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'New York Office', timezone: 'America/New_York' },
  { id: '2', name: 'London Team', timezone: 'Europe/London' },
  { id: '3', name: 'Tokyo Branch', timezone: 'Asia/Tokyo' },
];

export const TimezoneMeetingTool: React.FC<TimezoneMeetingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: participants,
    addItem,
    updateItem,
    deleteItem,
    importCSV,
    importJSON,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Participant>('timezone-meeting', DEFAULT_PARTICIPANTS, COLUMNS);

  const [meetingTime, setMeetingTime] = useState('14:00');
  const [baseTimezone, setBaseTimezone] = useState('America/New_York');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text) {
        // Try to parse time from text (e.g., "3pm", "15:00")
        const timeMatch = params.text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const ampm = timeMatch[3]?.toLowerCase();

          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;

          setMeetingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.meetingTime) setMeetingTime(params.meetingTime);
      if (params.baseTimezone) setBaseTimezone(params.baseTimezone);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: '',
      timezone: 'Europe/London',
    };
    addItem(newParticipant);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const removeParticipant = (id: string) => {
    deleteItem(id);
  };

  const updateParticipantField = (id: string, field: keyof Participant, value: string) => {
    updateItem(id, { [field]: value });
  };

  const convertedTimes = useMemo(() => {
    const [hours, minutes] = meetingTime.split(':').map(Number);
    const baseOffset = timezones.find(tz => tz.value === baseTimezone)?.offset || 0;

    return participants.map(participant => {
      const targetOffset = timezones.find(tz => tz.value === participant.timezone)?.offset || 0;
      const diffHours = targetOffset - baseOffset;

      let newHours = hours + diffHours;
      let dayOffset = 0;

      if (newHours >= 24) {
        newHours -= 24;
        dayOffset = 1;
      } else if (newHours < 0) {
        newHours += 24;
        dayOffset = -1;
      }

      const isWorkingHours = newHours >= 9 && newHours < 18;
      const isSleepingHours = newHours < 7 || newHours >= 22;

      return {
        ...participant,
        localTime: `${String(Math.floor(newHours)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        dayOffset,
        isWorkingHours,
        isSleepingHours,
      };
    });
  }, [participants, meetingTime, baseTimezone]);

  // Prepare data for export
  const exportData = useMemo(() => {
    return convertedTimes.map((p) => {
      const status = p.isSleepingHours ? 'Sleep time' : p.isWorkingHours ? 'Work hours' : 'Off hours';
      const dayOffsetLabel = p.dayOffset !== 0 ? (p.dayOffset > 0 ? '+1 day' : '-1 day') : 'Same day';
      const timezoneLabel = timezones.find(tz => tz.value === p.timezone)?.label || p.timezone;

      return {
        name: p.name || 'Participant',
        timezoneLabel,
        localTime: p.localTime,
        dayOffsetLabel,
        status,
      };
    });
  }, [convertedTimes]);

  // Export handlers
  const handleExportCSV = () => {
    const baseTimezoneLabel = timezones.find(tz => tz.value === baseTimezone)?.label || baseTimezone;
    exportToCSV(exportData, EXPORT_COLUMNS, {
      filename: `timezone_meeting_${meetingTime.replace(':', '')}_${baseTimezoneLabel.replace(/[^a-zA-Z0-9]/g, '_')}`
    });
  };

  const handleExportExcel = () => {
    const baseTimezoneLabel = timezones.find(tz => tz.value === baseTimezone)?.label || baseTimezone;
    exportToExcel(exportData, EXPORT_COLUMNS, {
      filename: `timezone_meeting_${meetingTime.replace(':', '')}_${baseTimezoneLabel.replace(/[^a-zA-Z0-9]/g, '_')}`
    });
  };

  const handleExportJSON = () => {
    const baseTimezoneLabel = timezones.find(tz => tz.value === baseTimezone)?.label || baseTimezone;
    exportToJSON(exportData, {
      filename: `timezone_meeting_${meetingTime.replace(':', '')}_${baseTimezoneLabel.replace(/[^a-zA-Z0-9]/g, '_')}`
    });
  };

  const handleExportPDF = async () => {
    const baseTimezoneLabel = timezones.find(tz => tz.value === baseTimezone)?.label || baseTimezone;
    await exportToPDF(exportData, EXPORT_COLUMNS, {
      filename: `timezone_meeting_${meetingTime.replace(':', '')}_${baseTimezoneLabel.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: 'Timezone Meeting Times',
      subtitle: `Meeting at ${meetingTime} (${baseTimezoneLabel})`,
    });
  };

  const handlePrint = () => {
    const baseTimezoneLabel = timezones.find(tz => tz.value === baseTimezone)?.label || baseTimezone;
    printData(exportData, EXPORT_COLUMNS, {
      title: `Timezone Meeting Times - ${meetingTime} (${baseTimezoneLabel})`
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, EXPORT_COLUMNS);
  };

  const handleCopy = () => {
    const text = `Meeting Time: ${meetingTime} (${timezones.find(tz => tz.value === baseTimezone)?.label})\n\n` +
      convertedTimes.map(p =>
        `${p.name || 'Participant'}: ${p.localTime} (${timezones.find(tz => tz.value === p.timezone)?.label})${p.dayOffset !== 0 ? ` (${p.dayOffset > 0 ? '+1' : '-1'} day)` : ''}`
      ).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTimeStatus = (isWorking: boolean, isSleeping: boolean) => {
    if (isSleeping) return { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Sleep time' };
    if (isWorking) return { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Work hours' };
    return { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Off hours' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.timezoneMeeting.timezoneMeetingPlanner', 'Timezone Meeting Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.timezoneMeeting.findTheBestMeetingTime', 'Find the best meeting time across timezones')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="timezone-meeting" toolName="Timezone Meeting" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={convertedTimes.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Meeting Time Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" /> Meeting Time
            </label>
            <input
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-xl ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Globe className="w-4 h-4 inline mr-1" /> Base Timezone
            </label>
            <select
              value={baseTimezone}
              onChange={(e) => setBaseTimezone(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.timezoneMeeting.participants', 'Participants')}
          </label>

          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipantField(participant.id, 'name', e.target.value)}
                  placeholder={t('tools.timezoneMeeting.nameLocation', 'Name/Location')}
                  className={`col-span-4 px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <select
                  value={participant.timezone}
                  onChange={(e) => updateParticipantField(participant.id, 'timezone', e.target.value)}
                  className={`col-span-6 px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeParticipant(participant.id)}
                  className={`col-span-2 p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addParticipant}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'border-gray-700 hover:border-gray-600 text-gray-400' : 'border-gray-300 hover:border-gray-400 text-gray-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.timezoneMeeting.addParticipant', 'Add Participant')}
          </button>
        </div>

        {/* Results */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {t('tools.timezoneMeeting.meetingTimes', 'Meeting Times')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.timezoneMeeting.copied', 'Copied!') : t('tools.timezoneMeeting.copyAll', 'Copy All')}
            </button>
          </div>

          <div className="space-y-3">
            {convertedTimes.map((p) => {
              const status = getTimeStatus(p.isWorkingHours, p.isSleepingHours);
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {p.name || 'Participant'}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {timezones.find(tz => tz.value === p.timezone)?.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {p.localTime}
                      {p.dayOffset !== 0 && (
                        <span className="text-sm ml-1 text-gray-500">
                          ({p.dayOffset > 0 ? '+1' : '-1'} day)
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.timezoneMeeting.workHours96', 'Work hours (9-6)')}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.timezoneMeeting.offHours', 'Off hours')}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.timezoneMeeting.sleepTime', 'Sleep time')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneMeetingTool;
