import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Clock, Users, Copy, Plus, X, Calendar, Sun, Moon, Check, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Participant {
  id: string;
  name: string;
  timezone: string;
}

interface TimezoneInfo {
  label: string;
  value: string;
  offset: string;
  offsetMinutes: number;
}

interface MeetingSlot {
  hour: number;
  score: number;
  participants: {
    name: string;
    localTime: string;
    isWorkingHour: boolean;
  }[];
}

const TIMEZONES: TimezoneInfo[] = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC', offset: '+0:00', offsetMinutes: 0 },
  { label: 'EST (Eastern Standard Time)', value: 'America/New_York', offset: '-5:00', offsetMinutes: -300 },
  { label: 'CST (Central Standard Time)', value: 'America/Chicago', offset: '-6:00', offsetMinutes: -360 },
  { label: 'MST (Mountain Standard Time)', value: 'America/Denver', offset: '-7:00', offsetMinutes: -420 },
  { label: 'PST (Pacific Standard Time)', value: 'America/Los_Angeles', offset: '-8:00', offsetMinutes: -480 },
  { label: 'AKST (Alaska Standard Time)', value: 'America/Anchorage', offset: '-9:00', offsetMinutes: -540 },
  { label: 'HST (Hawaii Standard Time)', value: 'Pacific/Honolulu', offset: '-10:00', offsetMinutes: -600 },
  { label: 'GMT (Greenwich Mean Time)', value: 'Europe/London', offset: '+0:00', offsetMinutes: 0 },
  { label: 'CET (Central European Time)', value: 'Europe/Paris', offset: '+1:00', offsetMinutes: 60 },
  { label: 'EET (Eastern European Time)', value: 'Europe/Helsinki', offset: '+2:00', offsetMinutes: 120 },
  { label: 'MSK (Moscow Standard Time)', value: 'Europe/Moscow', offset: '+3:00', offsetMinutes: 180 },
  { label: 'GST (Gulf Standard Time)', value: 'Asia/Dubai', offset: '+4:00', offsetMinutes: 240 },
  { label: 'IST (India Standard Time)', value: 'Asia/Kolkata', offset: '+5:30', offsetMinutes: 330 },
  { label: 'BST (Bangladesh Standard Time)', value: 'Asia/Dhaka', offset: '+6:00', offsetMinutes: 360 },
  { label: 'ICT (Indochina Time)', value: 'Asia/Bangkok', offset: '+7:00', offsetMinutes: 420 },
  { label: 'CST (China Standard Time)', value: 'Asia/Shanghai', offset: '+8:00', offsetMinutes: 480 },
  { label: 'SGT (Singapore Time)', value: 'Asia/Singapore', offset: '+8:00', offsetMinutes: 480 },
  { label: 'JST (Japan Standard Time)', value: 'Asia/Tokyo', offset: '+9:00', offsetMinutes: 540 },
  { label: 'KST (Korea Standard Time)', value: 'Asia/Seoul', offset: '+9:00', offsetMinutes: 540 },
  { label: 'AEST (Australian Eastern Time)', value: 'Australia/Sydney', offset: '+10:00', offsetMinutes: 600 },
  { label: 'NZST (New Zealand Standard Time)', value: 'Pacific/Auckland', offset: '+12:00', offsetMinutes: 720 },
];

const DURATION_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

// Column definitions for participant data (used for persistence and exports)
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Participant Name', type: 'string' },
  { key: 'timezone', header: 'Timezone', type: 'string' },
];

// Extended column definitions for export (includes derived fields)
const PARTICIPANT_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Participant Name', type: 'string' },
  { key: 'timezone', header: 'Timezone', type: 'string' },
  { key: 'timezoneLabel', header: 'Timezone Label', type: 'string' },
  { key: 'offset', header: 'UTC Offset', type: 'string' },
  { key: 'currentLocalTime', header: 'Current Local Time', type: 'string' },
];

const MEETING_SLOT_COLUMNS: ColumnConfig[] = [
  { key: 'utcTime', header: 'UTC Time', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'totalParticipants', header: 'Total Participants', type: 'number' },
  { key: 'allInWorkingHours', header: 'All in Working Hours', type: 'boolean' },
  { key: 'participantTimes', header: 'Participant Times', type: 'string' },
];

interface TimezoneMeetingPlannerToolProps {
  uiConfig?: UIConfig;
}

export const TimezoneMeetingPlannerTool: React.FC<TimezoneMeetingPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: participants,
    setData: setParticipants,
    addItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyToClipboardUtil,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Participant>('timezone-meeting-planner', [], COLUMNS);

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantTimezone, setNewParticipantTimezone] = useState('America/New_York');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [meetingDuration, setMeetingDuration] = useState(60);
  const [copied, setCopied] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.dates && params.dates.length > 0) {
        setMeetingDate(params.dates[0]);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.meetingDate) setMeetingDate(params.formData.meetingDate);
        if (params.formData.duration) setMeetingDuration(Number(params.formData.duration));
        setIsPrefilled(true);
      }
      if (params.items && params.items.length > 0) {
        // Items could be participant names/timezones
        const newParticipants = params.items.map((item, idx) => ({
          id: Date.now().toString() + idx,
          name: typeof item === 'string' ? item : item.name || `Participant ${idx + 1}`,
          timezone: typeof item === 'object' && item.timezone ? item.timezone : 'America/New_York',
        }));
        setParticipants(newParticipants);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Add participant
  const addParticipant = () => {
    if (!newParticipantName.trim()) return;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      timezone: newParticipantTimezone,
    };
    addItem(newParticipant);
    setNewParticipantName('');
  };

  // Remove participant
  const removeParticipant = (id: string) => {
    deleteItem(id);
  };

  // Get timezone offset display
  const getTimezoneOffset = (timezone: string): string => {
    const tz = TIMEZONES.find((t) => t.value === timezone);
    return tz ? `UTC${tz.offset}` : '';
  };

  // Get time in a specific timezone
  const getTimeInTimezone = (date: Date, timezone: string, hour?: number): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    if (hour !== undefined) {
      // Create a date with the specified hour in UTC
      const baseDate = new Date(meetingDate);
      baseDate.setUTCHours(hour, 0, 0, 0);
      return baseDate.toLocaleTimeString('en-US', options);
    }

    return date.toLocaleTimeString('en-US', options);
  };

  // Get hour in timezone from UTC hour
  const getHourInTimezone = (utcHour: number, timezone: string): number => {
    const baseDate = new Date(meetingDate);
    baseDate.setUTCHours(utcHour, 0, 0, 0);
    const localTime = baseDate.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    });
    return parseInt(localTime);
  };

  // Check if hour is within working hours (9am - 6pm)
  const isWorkingHour = (hour: number): boolean => {
    return hour >= 9 && hour < 18;
  };

  // Check if it's nighttime (before 7am or after 10pm)
  const isNighttime = (hour: number): boolean => {
    return hour < 7 || hour >= 22;
  };

  // Calculate best meeting times
  const meetingSlots = useMemo((): MeetingSlot[] => {
    if (participants.length === 0) return [];

    const slots: MeetingSlot[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const participantTimes = participants.map((p) => {
        const localHour = getHourInTimezone(hour, p.timezone);
        const baseDate = new Date(meetingDate);
        baseDate.setUTCHours(hour, 0, 0, 0);
        const localTime = getTimeInTimezone(baseDate, p.timezone, hour);

        return {
          name: p.name,
          localTime,
          localHour,
          isWorkingHour: isWorkingHour(localHour),
        };
      });

      // Score: count of participants in working hours
      const score = participantTimes.filter((p) => p.isWorkingHour).length;

      slots.push({
        hour,
        score,
        participants: participantTimes.map((p) => ({
          name: p.name,
          localTime: p.localTime,
          isWorkingHour: p.isWorkingHour,
        })),
      });
    }

    return slots;
  }, [participants, meetingDate]);

  // Get best meeting times (all participants in working hours)
  const bestSlots = useMemo(() => {
    return meetingSlots
      .filter((slot) => slot.score === participants.length && participants.length > 0)
      .slice(0, 5);
  }, [meetingSlots, participants.length]);

  // Prepare participant data for export
  const exportParticipantData = useMemo(() => {
    return participants.map((p) => {
      const tz = TIMEZONES.find((t) => t.value === p.timezone);
      return {
        name: p.name,
        timezone: p.timezone,
        timezoneLabel: tz?.label || p.timezone,
        offset: tz ? `UTC${tz.offset}` : '',
        currentLocalTime: getTimeInTimezone(currentTime, p.timezone),
      };
    });
  }, [participants, currentTime]);

  // Prepare meeting slots data for export
  const exportMeetingSlotsData = useMemo(() => {
    return meetingSlots.map((slot) => ({
      utcTime: `${slot.hour.toString().padStart(2, '0')}:00 UTC`,
      score: slot.score,
      totalParticipants: participants.length,
      allInWorkingHours: slot.score === participants.length,
      participantTimes: slot.participants.map((p) => `${p.name}: ${p.localTime}`).join('; '),
    }));
  }, [meetingSlots, participants.length]);

  // Export handlers using the hook's export functions
  const handleExportCSV = () => {
    if (participants.length > 0) {
      exportCSV({ filename: 'timezone_participants' });
    }
  };

  const handleExportExcel = () => {
    if (participants.length > 0) {
      exportExcel({ filename: 'timezone_participants' });
    }
  };

  const handleExportJSON = () => {
    if (participants.length > 0) {
      exportJSON({ filename: 'timezone_meeting_planner' });
    }
  };

  const handleExportPDF = async () => {
    if (participants.length > 0) {
      await exportPDF({
        filename: 'timezone_meeting_planner',
        title: 'Timezone Meeting Planner',
        subtitle: `Meeting Date: ${new Date(meetingDate).toLocaleDateString()} | ${participants.length} Participants`,
        orientation: 'landscape',
      });
    }
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (participants.length === 0) return false;
    return copyToClipboardUtil('tab');
  };

  const handlePrint = () => {
    if (participants.length > 0) {
      print(`Timezone Meeting Planner - ${new Date(meetingDate).toLocaleDateString()}`);
    }
  };

  const handleImportCSV = async (file: File) => {
    await importCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    await importJSON(file);
  };

  // Format meeting details for clipboard
  const formatMeetingDetails = (): string => {
    if (selectedHour === null || participants.length === 0) return '';

    const slot = meetingSlots.find((s) => s.hour === selectedHour);
    if (!slot) return '';

    const utcTime = `${selectedHour.toString().padStart(2, '0')}:00 UTC`;
    const lines = [
      `Meeting Time: ${utcTime}`,
      `Date: ${new Date(meetingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Duration: ${DURATION_OPTIONS.find((d) => d.value === meetingDuration)?.label || `${meetingDuration} minutes`}`,
      '',
      'Participant Times:',
      ...slot.participants.map(
        (p) => `- ${p.name}: ${p.localTime} local time${p.isWorkingHour ? '' : ' (outside working hours)'}`
      ),
    ];

    return lines.join('\n');
  };

  // Copy meeting details to clipboard
  const copyToClipboard = async () => {
    const details = formatMeetingDetails();
    if (!details) return;

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  // Get cell color based on working hours
  const getCellColor = (isWorking: boolean, isNight: boolean) => {
    if (isNight) {
      return isDark ? 'bg-gray-700' : 'bg-gray-300';
    }
    if (isWorking) {
      return isDark ? 'bg-green-900/50' : 'bg-green-100';
    }
    return isDark ? 'bg-orange-900/30' : 'bg-orange-100';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-6xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.timezoneMeetingPlanner.timezoneMeetingPlanner', 'Timezone Meeting Planner')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.timezoneMeetingPlanner.findTheBestMeetingTime', 'Find the best meeting time across multiple timezones')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="timezone-meeting-planner" toolName="Timezone Meeting Planner" />

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
            onImportCSV={handleImportCSV}
            onImportJSON={handleImportJSON}
            disabled={participants.length === 0}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      <div className="space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.timezoneMeetingPlanner.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Add Participant Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Users className="w-5 h-5" />
            {t('tools.timezoneMeetingPlanner.addParticipants', 'Add Participants')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
              placeholder={t('tools.timezoneMeetingPlanner.participantName', 'Participant name')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <select
              value={newParticipantTimezone}
              onChange={(e) => setNewParticipantTimezone(e.target.value)}
              className={`sm:w-72 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <button
              onClick={addParticipant}
              disabled={!newParticipantName.trim()}
              className="px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('tools.timezoneMeetingPlanner.add', 'Add')}
            </button>
          </div>
        </div>

        {/* Participants List */}
        {participants.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Participants ({participants.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((participant) => {
                const localTime = getTimeInTimezone(currentTime, participant.timezone);
                const localHour = parseInt(localTime.split(':')[0]);
                const isDayTime = localHour >= 6 && localHour < 20;

                return (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg relative ${
                      isDark ? 'bg-gray-600' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className={`absolute top-2 right-2 p-1 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-gray-500 text-gray-400 hover:text-red-400'
                          : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {participant.name}
                        </span>
                        {isDayTime ? (
                          <Sun className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Moon className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {TIMEZONES.find((t) => t.value === participant.timezone)?.label.split(' ')[0] || participant.timezone}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {getTimezoneOffset(participant.timezone)}
                      </div>
                      <div className={`text-lg font-mono font-bold mt-2 ${isDark ? t('tools.timezoneMeetingPlanner.text0d9488', 'text-[#0D9488]') : t('tools.timezoneMeetingPlanner.text0d94882', 'text-[#0D9488]')}`}>
                        {localTime}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Comparison Grid */}
        {participants.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Clock className="w-5 h-5" />
                {t('tools.timezoneMeetingPlanner.24HourTimeComparison', '24-Hour Time Comparison')}
              </h3>
              <div className="flex items-center gap-2">
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.timezoneMeetingPlanner.meetingDate', 'Meeting Date:')}
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.timezoneMeetingPlanner.workingHours9am6pm', 'Working Hours (9am-6pm)')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'}`}></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.timezoneMeetingPlanner.offHours', 'Off Hours')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.timezoneMeetingPlanner.nightBefore7amAfter10pm', 'Night (before 7am / after 10pm)')}</span>
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className={`text-left p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.timezoneMeetingPlanner.utcHour', 'UTC Hour')}
                    </th>
                    {participants.map((p) => (
                      <th key={p.id} className={`text-center p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {p.name}
                      </th>
                    ))}
                    <th className={`text-center p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.timezoneMeetingPlanner.score', 'Score')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meetingSlots.map((slot) => {
                    const isSelected = selectedHour === slot.hour;
                    const isPerfect = slot.score === participants.length;

                    return (
                      <tr
                        key={slot.hour}
                        onClick={() => setSelectedHour(slot.hour)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'ring-2 ring-[#0D9488] ring-inset'
                            : ''
                        } ${
                          isDark ? 'hover:bg-gray-600/50' : 'hover:bg-gray-100'
                        }`}
                      >
                        <td className={`p-2 font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {slot.hour.toString().padStart(2, '0')}:00
                        </td>
                        {slot.participants.map((p, idx) => {
                          const localHour = parseInt(p.localTime.split(':')[0]);
                          const night = isNighttime(localHour);

                          return (
                            <td
                              key={idx}
                              className={`p-2 text-center font-mono text-sm ${getCellColor(p.isWorkingHour, night)} ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {p.localTime}
                                {night ? (
                                  <Moon className="w-3 h-3 text-blue-400" />
                                ) : localHour >= 6 && localHour < 12 ? (
                                  <Sun className="w-3 h-3 text-yellow-500" />
                                ) : null}
                              </div>
                            </td>
                          );
                        })}
                        <td className={`p-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              isPerfect
                                ? 'bg-green-500 text-white'
                                : slot.score > 0
                                ? isDark
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-yellow-200 text-yellow-800'
                                : isDark
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isPerfect && <Check className="w-3 h-3" />}
                            {slot.score}/{participants.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Best Meeting Times */}
        {bestSlots.length > 0 && (
          <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-700' : t('tools.timezoneMeetingPlanner.bg0d948810', 'bg-[#0D9488]/10')}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Sparkles className="w-5 h-5 text-[#0D9488]" />
              {t('tools.timezoneMeetingPlanner.bestMeetingTimesAllIn', 'Best Meeting Times (All in Working Hours)')}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bestSlots.map((slot) => (
                <button
                  key={slot.hour}
                  onClick={() => setSelectedHour(slot.hour)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    selectedHour === slot.hour
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="font-mono text-lg font-bold mb-2">
                    {slot.hour.toString().padStart(2, '0')}:00 UTC
                  </div>
                  <div className="space-y-1">
                    {slot.participants.map((p, idx) => (
                      <div key={idx} className={`text-sm ${selectedHour === slot.hour ? 'text-white/80' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {p.name}: {p.localTime}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Scheduler */}
        {participants.length > 0 && selectedHour !== null && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-5 h-5" />
              {t('tools.timezoneMeetingPlanner.meetingDetails', 'Meeting Details')}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.timezoneMeetingPlanner.selectedTimeUtc', 'Selected Time (UTC)')}
                </label>
                <div className={`px-4 py-3 rounded-lg font-mono text-xl font-bold ${
                  isDark ? t('tools.timezoneMeetingPlanner.bgGray600Text0d9488', 'bg-gray-600 text-[#0D9488]') : t('tools.timezoneMeetingPlanner.bgWhiteBorderBorderGray', 'bg-white border border-gray-200 text-[#0D9488]')
                }`}>
                  {selectedHour.toString().padStart(2, '0')}:00 UTC
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.timezoneMeetingPlanner.meetingDuration', 'Meeting Duration')}
                </label>
                <select
                  value={meetingDuration}
                  onChange={(e) => setMeetingDuration(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Converted Times */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.timezoneMeetingPlanner.timeForEachParticipant', 'Time for Each Participant')}
              </label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {meetingSlots
                  .find((s) => s.hour === selectedHour)
                  ?.participants.map((p, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        p.isWorkingHour
                          ? isDark
                            ? 'bg-green-900/30 border border-green-700'
                            : 'bg-green-50 border border-green-200'
                          : isDark
                          ? 'bg-orange-900/30 border border-orange-700'
                          : 'bg-orange-50 border border-orange-200'
                      }`}
                    >
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {p.name}
                      </div>
                      <div className={`font-mono text-lg ${p.isWorkingHour ? 'text-green-500' : 'text-orange-500'}`}>
                        {p.localTime}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {p.isWorkingHour ? t('tools.timezoneMeetingPlanner.withinWorkingHours', 'Within working hours') : t('tools.timezoneMeetingPlanner.outsideWorkingHours', 'Outside working hours')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-green-500 text-white' : t('tools.timezoneMeetingPlanner.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  {t('tools.timezoneMeetingPlanner.copiedToClipboard', 'Copied to Clipboard!')}
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  {t('tools.timezoneMeetingPlanner.copyMeetingDetails', 'Copy Meeting Details')}
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {participants.length === 0 && (
          <div
            className={`text-center py-16 rounded-lg border-2 border-dashed ${
              isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.timezoneMeetingPlanner.noParticipantsAdded', 'No Participants Added')}
            </h3>
            <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.timezoneMeetingPlanner.addParticipantsWithTheirTimezones', 'Add participants with their timezones to find the best meeting times that work for everyone.')}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.timezoneMeetingPlanner.howToUse', 'How to Use')}
          </h3>
          <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>1. Add participants with their names and timezones</p>
            <p>2. View the 24-hour time comparison grid to see local times</p>
            <p>3. Green cells indicate working hours (9am-6pm), making it easier to find overlap</p>
            <p>4. Click on a time slot to select it for your meeting</p>
            <p>5. Use the "Best Meeting Times" section for quick suggestions</p>
            <p>6. Copy the meeting details to share with participants</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneMeetingPlannerTool;
