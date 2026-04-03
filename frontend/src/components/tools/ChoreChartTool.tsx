import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Check, Star, Plus, Trash2, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ChoreChartToolProps {
  uiConfig?: UIConfig;
}

interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

interface Chore {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  pointValue: number;
  assignedTo: string;
}

interface CompletionRecord {
  id: string; // Required for useToolData compatibility
  choreId: string;
  memberId: string;
  day: number;
  completed: boolean;
}

interface ChoreChartData {
  familyMembers: FamilyMember[];
  chores: Chore[];
  completions: CompletionRecord[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRESET_CHORES = [
  'Make bed',
  'Do dishes',
  'Take out trash',
  'Clean room',
  'Feed pet',
  'Set table',
];

const AVATAR_COLORS = [
  { color: '#EF4444', name: 'Red' },
  { color: '#F97316', name: 'Orange' },
  { color: '#EAB308', name: 'Yellow' },
  { color: '#22C55E', name: 'Green' },
  { color: '#3B82F6', name: 'Blue' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EC4899', name: 'Pink' },
  { color: '#14B8A6', name: 'Teal' },
];

const REWARD_THRESHOLD = 50;

const EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'choreName', header: 'Chore', type: 'string' },
  { key: 'assignedTo', header: 'Assigned To', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'pointValue', header: 'Points', type: 'number' },
  { key: 'completedDays', header: 'Days Completed', type: 'string' },
  { key: 'earnedPoints', header: 'Earned Points', type: 'number' },
];

const DEFAULT_CHORE_DATA: ChoreChartData = {
  familyMembers: [],
  chores: [],
  completions: [],
};

export const ChoreChartTool: React.FC<ChoreChartToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Initialize with prefill data if available
  const initialData: ChoreChartData = useMemo(() => {
    if (uiConfig?.prefillData) {
      const prefillData = uiConfig.prefillData as ToolPrefillData;
      return {
        familyMembers: (Array.isArray(prefillData.familyMembers) ? prefillData.familyMembers : []) as FamilyMember[],
        chores: (Array.isArray(prefillData.chores) ? prefillData.chores : []) as Chore[],
        completions: [],
      };
    }
    return DEFAULT_CHORE_DATA;
  }, [uiConfig?.prefillData]);

  // Use tool data hook for backend sync
  const {
    data: toolData,
    addItem: addCompletion,
    updateItem: updateCompletion,
    deleteItem: deleteCompletion,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CompletionRecord>('chore-chart', initialData.completions || [], EXPORT_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Local state for family members, chores, and form inputs
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialData.familyMembers || []);
  const [chores, setChores] = useState<Chore[]>(initialData.chores || []);
  const [completions, setCompletions] = useState<CompletionRecord[]>(toolData);

  // Sync tool data to local completions state
  useEffect(() => {
    setCompletions(toolData);
  }, [toolData]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.familyMembers) setFamilyMembers(params.familyMembers);
      if (params.chores) setChores(params.chores);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddChore, setShowAddChore] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(AVATAR_COLORS[0].color);

  const [newChoreName, setNewChoreName] = useState('');
  const [newChoreFrequency, setNewChoreFrequency] = useState<'daily' | 'weekly'>('daily');
  const [newChorePoints, setNewChorePoints] = useState(5);
  const [newChoreAssignee, setNewChoreAssignee] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addFamilyMember = () => {
    if (!newMemberName.trim()) return;

    const newMember: FamilyMember = {
      id: generateId(),
      name: newMemberName.trim(),
      color: newMemberColor,
      avatar: newMemberName.trim().charAt(0).toUpperCase(),
    };

    setFamilyMembers([...familyMembers, newMember]);
    setNewMemberName('');
    setNewMemberColor(AVATAR_COLORS[0].color);
    setShowAddMember(false);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
    setChores(chores.filter((c) => c.assignedTo !== id));
    // Delete related completion records via hook
    completions
      .filter((c) => c.memberId === id)
      .forEach((record) => deleteCompletion(record.id));
  };

  const addChore = () => {
    if (!newChoreName.trim() || !newChoreAssignee) return;

    const newChore: Chore = {
      id: generateId(),
      name: newChoreName.trim(),
      frequency: newChoreFrequency,
      pointValue: newChorePoints,
      assignedTo: newChoreAssignee,
    };

    setChores([...chores, newChore]);
    setNewChoreName('');
    setNewChoreFrequency('daily');
    setNewChorePoints(5);
    setNewChoreAssignee('');
    setShowAddChore(false);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const removeChore = (id: string) => {
    setChores(chores.filter((c) => c.id !== id));
    // Delete related completion records via hook
    completions
      .filter((c) => c.choreId === id)
      .forEach((record) => deleteCompletion(record.id));
  };

  const toggleCompletion = (choreId: string, memberId: string, day: number) => {
    const existingRecord = completions.find(
      (c) => c.choreId === choreId && c.memberId === memberId && c.day === day
    );

    if (existingRecord) {
      // Update existing completion record via hook
      updateCompletion(existingRecord.id, { completed: !existingRecord.completed });
    } else {
      // Add new completion record via hook
      const newRecord: CompletionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        choreId,
        memberId,
        day,
        completed: true,
      };
      addCompletion(newRecord);
    }
  };

  const isCompleted = (choreId: string, memberId: string, day: number): boolean => {
    const record = completions.find(
      (c) => c.choreId === choreId && c.memberId === memberId && c.day === day
    );
    return record?.completed || false;
  };

  const calculatePoints = (memberId: string): number => {
    return completions
      .filter((c) => c.memberId === memberId && c.completed)
      .reduce((total, completion) => {
        const chore = chores.find((ch) => ch.id === completion.choreId);
        return total + (chore?.pointValue || 0);
      }, 0);
  };

  const getMemberChores = (memberId: string): Chore[] => {
    return chores.filter((c) => c.assignedTo === memberId);
  };

  const getMemberById = (id: string): FamilyMember | undefined => {
    return familyMembers.find((m) => m.id === id);
  };

  // Prepare export data
  const exportData = useMemo(() => {
    return chores.map((chore) => {
      const member = getMemberById(chore.assignedTo);
      const daysCompleted: string[] = [];
      let earnedPoints = 0;

      DAYS_OF_WEEK.forEach((day, dayIndex) => {
        // Skip non-first days for weekly chores
        if (chore.frequency === 'weekly' && dayIndex !== 0) return;

        if (isCompleted(chore.id, chore.assignedTo, dayIndex)) {
          daysCompleted.push(day);
          earnedPoints += chore.pointValue;
        }
      });

      return {
        choreName: chore.name,
        assignedTo: member?.name || 'Unassigned',
        frequency: chore.frequency.charAt(0).toUpperCase() + chore.frequency.slice(1),
        pointValue: chore.pointValue,
        completedDays: daysCompleted.length > 0 ? daysCompleted.join(', ') : 'None',
        earnedPoints,
      };
    });
  }, [chores, familyMembers, completions]);

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isDark ? 'bg-purple-600' : 'bg-purple-500'
              }`}
            >
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('tools.choreChart.familyChoreChart', 'Family Chore Chart')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.choreChart.trackChoresAndEarnRewards', 'Track chores and earn rewards together')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="chore-chart" toolName="Chore Chart" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">Reward at {REWARD_THRESHOLD} points!</span>
            </div>
            {exportData.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportToCSV(exportData, EXPORT_COLUMNS, { filename: 'chore-chart' })}
                onExportExcel={() => exportToExcel(exportData, EXPORT_COLUMNS, { filename: 'chore-chart' })}
                onExportJSON={() => exportToJSON(exportData, { filename: 'chore-chart' })}
                onExportPDF={async () => {
                  await exportToPDF(exportData, EXPORT_COLUMNS, {
                    filename: 'chore-chart',
                    title: 'Family Chore Chart',
                  });
                }}
                onPrint={() => printData(exportData, EXPORT_COLUMNS, { title: 'Family Chore Chart' })}
                onCopyToClipboard={() => copyUtil(exportData, EXPORT_COLUMNS, 'tab')}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
          </div>
        </div>

        {/* Family Members Section */}
        <div
          className={`rounded-xl p-6 mb-6 ${
            isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className={isDark ? 'text-purple-400' : 'text-purple-600'} />
              <h2 className="text-lg font-semibold">{t('tools.choreChart.familyMembers', 'Family Members')}</h2>
            </div>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.choreChart.addMember', 'Add Member')}
            </button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.choreChart.name', 'Name')}
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={t('tools.choreChart.enterName', 'Enter name')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.choreChart.color', 'Color')}
                  </label>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setNewMemberColor(c.color)}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          newMemberColor === c.color ? 'ring-2 ring-offset-2 scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: c.color,
                          ringColor: c.color,
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={addFamilyMember}
                  disabled={!newMemberName.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    newMemberName.trim()
                      ? isDark
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                      : isDark
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('tools.choreChart.add', 'Add')}
                </button>
              </div>
            </div>
          )}

          {/* Family Members List */}
          {familyMembers.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.choreChart.noFamilyMembersAddedYet', 'No family members added yet. Add your first member to get started!')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => {
                const points = calculatePoints(member.id);
                const progress = Math.min((points / REWARD_THRESHOLD) * 100, 100);
                const earnedReward = points >= REWARD_THRESHOLD;

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <div className="flex items-center gap-1 text-sm">
                            <Star
                              className={`w-4 h-4 ${
                                earnedReward ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                              }`}
                            />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {points} points
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFamilyMember(member.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-red-600/20 text-red-400'
                            : 'hover:bg-red-100 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div
                        className={`h-3 rounded-full overflow-hidden ${
                          isDark ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            earnedReward
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {earnedReward && (
                        <span className="absolute -top-1 right-0 text-xs font-medium text-yellow-500">
                          {t('tools.choreChart.rewardEarned', 'Reward Earned!')}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {earnedReward
                        ? 'Congratulations!'
                        : `${REWARD_THRESHOLD - points} points until reward`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chores Section */}
        <div
          className={`rounded-xl p-6 mb-6 ${
            isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className={isDark ? 'text-green-400' : 'text-green-600'} />
              <h2 className="text-lg font-semibold">{t('tools.choreChart.chores', 'Chores')}</h2>
            </div>
            <button
              onClick={() => setShowAddChore(!showAddChore)}
              disabled={familyMembers.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                familyMembers.length > 0
                  ? isDark
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                  : isDark
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.choreChart.addChore', 'Add Chore')}
            </button>
          </div>

          {/* Add Chore Form */}
          {showAddChore && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.choreChart.choreName', 'Chore Name')}
                  </label>
                  <input
                    type="text"
                    value={newChoreName}
                    onChange={(e) => setNewChoreName(e.target.value)}
                    placeholder={t('tools.choreChart.enterChoreName', 'Enter chore name')}
                    list="preset-chores"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <datalist id="preset-chores">
                    {PRESET_CHORES.map((chore) => (
                      <option key={chore} value={chore} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.choreChart.frequency', 'Frequency')}
                  </label>
                  <select
                    value={newChoreFrequency}
                    onChange={(e) =>
                      setNewChoreFrequency(e.target.value as 'daily' | 'weekly')
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="daily">{t('tools.choreChart.daily', 'Daily')}</option>
                    <option value="weekly">{t('tools.choreChart.weekly', 'Weekly')}</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.choreChart.points', 'Points')}
                  </label>
                  <input
                    type="number"
                    value={newChorePoints}
                    onChange={(e) => setNewChorePoints(parseInt(e.target.value) || 0)}
                    min={1}
                    max={20}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('tools.choreChart.assignTo', 'Assign To')}
                  </label>
                  <select
                    value={newChoreAssignee}
                    onChange={(e) => setNewChoreAssignee(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.choreChart.selectMember', 'Select member')}</option>
                    {familyMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addChore}
                  disabled={!newChoreName.trim() || !newChoreAssignee}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    newChoreName.trim() && newChoreAssignee
                      ? isDark
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                      : isDark
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('tools.choreChart.addChore2', 'Add Chore')}
                </button>
              </div>

              {/* Preset Chores Quick Add */}
              <div className="mt-4">
                <p
                  className={`text-sm mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('tools.choreChart.quickAddPresetChores', 'Quick add preset chores:')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CHORES.map((chore) => (
                    <button
                      key={chore}
                      onClick={() => setNewChoreName(chore)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {chore}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {familyMembers.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.choreChart.addFamilyMembersFirstTo', 'Add family members first to create chores.')}
            </p>
          ) : chores.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.choreChart.noChoresAddedYetAdd', 'No chores added yet. Add chores to start tracking!')}
            </p>
          ) : null}
        </div>

        {/* Weekly View Grid */}
        {chores.length > 0 && (
          <div
            className={`rounded-xl p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h2 className="text-lg font-semibold">{t('tools.choreChart.weeklyChoreChart', 'Weekly Chore Chart')}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th
                      className={`text-left p-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.choreChart.chore', 'Chore')}
                    </th>
                    <th
                      className={`text-left p-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.choreChart.assigned', 'Assigned')}
                    </th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th
                        key={day}
                        className={`text-center p-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </th>
                    ))}
                    <th
                      className={`text-center p-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('tools.choreChart.points2', 'Points')}
                    </th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {chores.map((chore) => {
                    const member = getMemberById(chore.assignedTo);
                    if (!member) return null;

                    return (
                      <tr
                        key={chore.id}
                        className={`border-t ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{chore.name}</p>
                            <p
                              className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {chore.frequency} - {chore.pointValue} pts
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.avatar}
                            </div>
                            <span className="text-sm">{member.name}</span>
                          </div>
                        </td>
                        {DAYS_OF_WEEK.map((_, dayIndex) => {
                          const completed = isCompleted(
                            chore.id,
                            member.id,
                            dayIndex
                          );
                          const isWeeklyAndNotFirstDay =
                            chore.frequency === 'weekly' && dayIndex !== 0;

                          return (
                            <td key={dayIndex} className="p-3 text-center">
                              {isWeeklyAndNotFirstDay ? (
                                <span
                                  className={isDark ? 'text-gray-600' : 'text-gray-300'}
                                >
                                  -
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    toggleCompletion(chore.id, member.id, dayIndex)
                                  }
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    completed
                                      ? 'bg-green-500 text-white'
                                      : isDark
                                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                                  }`}
                                >
                                  {completed && <Check className="w-5 h-5" />}
                                </button>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center">
                          <span
                            className={`font-medium ${
                              isDark ? 'text-yellow-400' : 'text-yellow-600'
                            }`}
                          >
                            {chore.pointValue}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => removeChore(chore.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-red-600/20 text-red-400'
                                : 'hover:bg-red-100 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {familyMembers.length > 0 && chores.length > 0 && (
          <div
            className={`rounded-xl p-6 mt-6 ${
              isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className={isDark ? 'text-yellow-400' : 'text-yellow-500'} />
              <h2 className="text-lg font-semibold">{t('tools.choreChart.weeklySummary', 'Weekly Summary')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => {
                const memberChores = getMemberChores(member.id);
                const points = calculatePoints(member.id);
                const totalPossiblePoints = memberChores.reduce((total, chore) => {
                  const multiplier = chore.frequency === 'daily' ? 7 : 1;
                  return total + chore.pointValue * multiplier;
                }, 0);
                const completionRate =
                  totalPossiblePoints > 0
                    ? Math.round((points / totalPossiblePoints) * 100)
                    : 0;

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p
                          className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {memberChores.length} chore{memberChores.length !== 1 ? 's' : ''}{' '}
                          assigned
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {t('tools.choreChart.pointsEarned', 'Points Earned')}
                        </span>
                        <span className="font-medium">
                          {points} / {totalPossiblePoints}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {t('tools.choreChart.completionRate', 'Completion Rate')}
                        </span>
                        <span
                          className={`font-medium ${
                            completionRate >= 80
                              ? 'text-green-500'
                              : completionRate >= 50
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                        >
                          {completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoreChartTool;
