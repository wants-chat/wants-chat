import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Users, Trophy, Clock, Plus, Trash2, Check, X, Lightbulb, MapPin, Edit2, Save, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ScavengerItem {
  id: string;
  name: string;
  clue: string;
  points: number;
  found: boolean;
  foundBy?: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

// Combined data structure for syncing
interface ScavengerHuntData {
  id: string;
  huntName: string;
  timeLimit: number;
  hasTimeLimit: boolean;
  difficulty: HuntDifficulty;
  items: ScavengerItem[];
  teams: Team[];
  updatedAt: string;
}

type HuntDifficulty = 'easy' | 'medium' | 'hard';

const CLUE_TEMPLATES: Record<HuntDifficulty, string[]> = {
  easy: [
    'Look where the light shines brightest',
    'Near something that makes a sound',
    'Close to where you rest your feet',
    'By the window, take a peek',
    'Where books are kept in rows',
  ],
  medium: [
    'Seek the place where time stands still on the wall',
    'Behind the guardian of cleanliness, I wait',
    'Where reflections tell no lies, look nearby',
    'Beneath the place where stories unfold',
    'In the realm of cold, I hide from the heat',
  ],
  hard: [
    'The keeper of secrets, bound in leather, guards me well',
    'Where silence is golden and pages whisper tales of old',
    'In the chamber where flames once danced but now memories reside',
    'Seek the throne of comfort, where weary souls find peace',
    'Where the mechanical heart of the home hums its eternal song',
  ],
};

const TEAM_COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
];

// Column configurations for export
const ITEMS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'clue', header: 'Clue', type: 'string' },
  { key: 'points', header: 'Points', type: 'number' },
  { key: 'found', header: 'Found', type: 'boolean' },
  { key: 'foundBy', header: 'Found By', type: 'string' },
];

const TEAMS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Team Name', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
];

// Columns for the combined data structure (for useToolData)
const HUNT_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'huntName', header: 'Hunt Name', type: 'string' },
  { key: 'difficulty', header: 'Difficulty', type: 'string' },
  { key: 'hasTimeLimit', header: 'Has Time Limit', type: 'boolean' },
  { key: 'timeLimit', header: 'Time Limit', type: 'number' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

interface ScavengerHuntToolProps {
  uiConfig?: UIConfig;
}

export const ScavengerHuntTool: React.FC<ScavengerHuntToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Default hunt data
  const defaultHuntData: ScavengerHuntData = {
    id: 'default-hunt',
    huntName: 'My Scavenger Hunt',
    timeLimit: 30,
    hasTimeLimit: false,
    difficulty: 'medium',
    items: [],
    teams: [],
    updatedAt: new Date().toISOString(),
  };

  // Use the useToolData hook for backend persistence
  const {
    data: huntDataArray,
    setData: setHuntDataArray,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
  } = useToolData<ScavengerHuntData>('scavenger-hunt', [defaultHuntData], HUNT_DATA_COLUMNS);

  // Extract the current hunt data (we only use the first item)
  const huntData = huntDataArray[0] || defaultHuntData;

  // Derived state from hunt data
  const huntName = huntData.huntName;
  const timeLimit = huntData.timeLimit;
  const hasTimeLimit = huntData.hasTimeLimit;
  const difficulty = huntData.difficulty;
  const items = huntData.items;
  const teams = huntData.teams;

  // Update hunt data helper
  const updateHuntData = useCallback((updates: Partial<ScavengerHuntData>) => {
    setHuntDataArray(prev => {
      const current = prev[0] || defaultHuntData;
      return [{
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      }];
    });
  }, [setHuntDataArray]);

  // Setters for individual fields
  const setHuntName = useCallback((name: string) => updateHuntData({ huntName: name }), [updateHuntData]);
  const setTimeLimit = useCallback((limit: number) => updateHuntData({ timeLimit: limit }), [updateHuntData]);
  const setHasTimeLimit = useCallback((has: boolean) => updateHuntData({ hasTimeLimit: has }), [updateHuntData]);
  const setDifficulty = useCallback((diff: HuntDifficulty) => updateHuntData({ difficulty: diff }), [updateHuntData]);
  const setItems = useCallback((newItems: ScavengerItem[] | ((prev: ScavengerItem[]) => ScavengerItem[])) => {
    setHuntDataArray(prev => {
      const current = prev[0] || defaultHuntData;
      const updatedItems = typeof newItems === 'function' ? newItems(current.items) : newItems;
      return [{
        ...current,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      }];
    });
  }, [setHuntDataArray]);
  const setTeams = useCallback((newTeams: Team[] | ((prev: Team[]) => Team[])) => {
    setHuntDataArray(prev => {
      const current = prev[0] || defaultHuntData;
      const updatedTeams = typeof newTeams === 'function' ? newTeams(current.teams) : newTeams;
      return [{
        ...current,
        teams: updatedTeams,
        updatedAt: new Date().toISOString(),
      }];
    });
  }, [setHuntDataArray]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled && !isLoading) {
      const data = uiConfig.prefillData;
      const updates: Partial<ScavengerHuntData> = {};
      if (data.huntName) {
        updates.huntName = data.huntName as string;
      }
      if (data.timeLimit) {
        updates.timeLimit = Number(data.timeLimit);
        updates.hasTimeLimit = true;
      }
      if (data.difficulty && ['easy', 'medium', 'hard'].includes(data.difficulty as string)) {
        updates.difficulty = data.difficulty as HuntDifficulty;
      }
      if (Object.keys(updates).length > 0) {
        updateHuntData(updates);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled, isLoading, updateHuntData]);

  // Form state (not synced)
  const [newItemName, setNewItemName] = useState('');
  const [newItemPoints, setNewItemPoints] = useState(10);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamColor, setSelectedTeamColor] = useState(TEAM_COLORS[0].value);

  // Timer state
  const [isHuntActive, setIsHuntActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'items' | 'teams' | 'hunt'>('items');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingClue, setEditingClue] = useState('');

  // Generate a random clue based on difficulty
  const generateClue = (): string => {
    const templates = CLUE_TEMPLATES[difficulty];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  // Add new item
  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ScavengerItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      clue: generateClue(),
      points: newItemPoints,
      found: false,
    };
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemPoints(10);
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Toggle item found status
  const toggleItemFound = (itemId: string, teamId?: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const wasFound = item.found;
          if (!wasFound && teamId) {
            // Update team score when finding an item
            setTeams(
              teams.map((team) =>
                team.id === teamId ? { ...team, score: team.score + item.points } : team
              )
            );
          } else if (wasFound && item.foundBy) {
            // Subtract points if un-finding
            setTeams(
              teams.map((team) =>
                team.id === item.foundBy ? { ...team, score: team.score - item.points } : team
              )
            );
          }
          return { ...item, found: !wasFound, foundBy: wasFound ? undefined : teamId };
        }
        return item;
      })
    );
  };

  // Update item clue
  const updateClue = (itemId: string, newClue: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, clue: newClue } : item)));
    setEditingItemId(null);
    setEditingClue('');
  };

  // Regenerate clue for an item
  const regenerateClue = (itemId: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, clue: generateClue() } : item)));
  };

  // Add new team
  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      color: selectedTeamColor,
      score: 0,
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    // Auto-select next available color
    const usedColors = teams.map((t) => t.color);
    const nextColor = TEAM_COLORS.find((c) => !usedColors.includes(c.value));
    if (nextColor) setSelectedTeamColor(nextColor.value);
  };

  // Remove team
  const removeTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id));
    // Reset items found by this team
    setItems(
      items.map((item) => (item.foundBy === id ? { ...item, found: false, foundBy: undefined } : item))
    );
  };

  // Start/Stop hunt timer
  const toggleHunt = () => {
    if (isHuntActive) {
      // Stop the hunt
      if (timerInterval) clearInterval(timerInterval);
      setTimerInterval(null);
      setIsHuntActive(false);
    } else {
      // Start the hunt
      setIsHuntActive(true);
      if (hasTimeLimit) {
        setTimeRemaining(timeLimit * 60);
        const interval = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsHuntActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimerInterval(interval);
      }
    }
  };

  // Reset hunt
  const resetHunt = () => {
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
    setIsHuntActive(false);
    setTimeRemaining(0);
    setItems(items.map((item) => ({ ...item, found: false, foundBy: undefined })));
    setTeams(teams.map((team) => ({ ...team, score: 0 })));
  };

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = items.length;
    const foundItems = items.filter((item) => item.found).length;
    const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
    const earnedPoints = items.filter((item) => item.found).reduce((sum, item) => sum + item.points, 0);
    const progress = totalItems > 0 ? (foundItems / totalItems) * 100 : 0;
    return { totalItems, foundItems, totalPoints, earnedPoints, progress };
  }, [items]);

  // Get winning team
  const winningTeam = useMemo(() => {
    if (teams.length === 0) return null;
    return teams.reduce((prev, current) => (prev.score > current.score ? prev : current));
  }, [teams]);

  // Prepare export data with team names resolved
  const exportData = useMemo(() => {
    return items.map((item) => ({
      ...item,
      foundBy: item.foundBy ? teams.find((t) => t.id === item.foundBy)?.name || item.foundBy : '',
    }));
  }, [items, teams]);

  // Export handlers using hook functions
  const handleExportCSV = () => {
    hookExportCSV({ filename: `scavenger-hunt-${huntName.replace(/\s+/g, '-').toLowerCase()}` });
  };

  const handleExportExcel = () => {
    hookExportExcel({ filename: `scavenger-hunt-${huntName.replace(/\s+/g, '-').toLowerCase()}` });
  };

  const handleExportJSON = () => {
    hookExportJSON({ filename: `scavenger-hunt-${huntName.replace(/\s+/g, '-').toLowerCase()}` });
  };

  const handleExportPDF = async () => {
    await hookExportPDF({
      filename: `scavenger-hunt-${huntName.replace(/\s+/g, '-').toLowerCase()}`,
      title: huntName,
      subtitle: `Scavenger Hunt - ${items.length} items, ${teams.length} teams`,
    });
  };

  const handlePrint = () => {
    hookPrint(huntName);
  };

  const handleCopyToClipboard = async () => {
    return await hookCopyToClipboard('tab');
  };

  const handleImportJSON = async (file: File) => {
    await hookImportJSON(file);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}
    >
      <div
        className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Search className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.scavengerHunt.scavengerHuntCreator', 'Scavenger Hunt Creator')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.scavengerHunt.buildTrackAndManageScavenger', 'Build, track, and manage scavenger hunts')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="scavenger-hunt" toolName="Scavenger Hunt" />

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
              onImportJSON={handleImportJSON}
              disabled={items.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Hunt Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.scavengerHunt.huntName', 'Hunt Name')}
          </label>
          <input
            type="text"
            value={huntName}
            onChange={(e) => setHuntName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder={t('tools.scavengerHunt.enterHuntName', 'Enter hunt name...')}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${activeTab === 'items' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <MapPin className="w-4 h-4" />
            {t('tools.scavengerHunt.items', 'Items')}
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${activeTab === 'teams' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Users className="w-4 h-4" />
            {t('tools.scavengerHunt.teams', 'Teams')}
          </button>
          <button
            onClick={() => setActiveTab('hunt')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 ${activeTab === 'hunt' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Trophy className="w-4 h-4" />
            {t('tools.scavengerHunt.hunt', 'Hunt')}
          </button>
        </div>

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Difficulty Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.scavengerHunt.clueDifficulty', 'Clue Difficulty')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as HuntDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-lg text-sm capitalize ${difficulty === d ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Item */}
            <div
              className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}
            >
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.scavengerHunt.addNewItem', 'Add New Item')}
              </h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t('tools.scavengerHunt.itemNameEGGolden', 'Item name (e.g., Golden Key)')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <input
                  type="number"
                  value={newItemPoints}
                  onChange={(e) => setNewItemPoints(parseInt(e.target.value) || 0)}
                  placeholder={t('tools.scavengerHunt.points', 'Points')}
                  className={`w-20 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={addItem}
                  className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.scavengerHunt.aClueWillBeAuto', 'A clue will be auto-generated based on difficulty level')}
              </p>
            </div>

            {/* Items List */}
            {items.length === 0 ? (
              <div
                className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
              >
                <MapPin className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.scavengerHunt.noItemsYetAddYour', 'No items yet. Add your first scavenger hunt item above!')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${item.found ? (isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-200') : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-medium ${item.found ? 'line-through text-emerald-500' : isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {item.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {item.points} pts
                          </span>
                          {item.found && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                              {t('tools.scavengerHunt.found', 'Found!')}
                            </span>
                          )}
                        </div>
                        {editingItemId === item.id ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={editingClue}
                              onChange={(e) => setEditingClue(e.target.value)}
                              className={`flex-1 px-3 py-1 text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <button
                              onClick={() => updateClue(item.id, editingClue)}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className={`p-1 rounded ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Lightbulb className={`w-3 h-3 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                            <p className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              "{item.clue}"
                            </p>
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditingClue(item.clue);
                              }}
                              className={`p-1 rounded ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => regenerateClue(item.id)}
                              className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {t('tools.scavengerHunt.newClue', 'New Clue')}
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={`p-2 rounded-lg ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {/* Add New Team */}
            <div
              className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}
            >
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.scavengerHunt.addNewTeam', 'Add New Team')}
              </h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder={t('tools.scavengerHunt.teamName', 'Team name')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                />
                <button
                  onClick={addTeam}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedTeamColor(color.value)}
                    className={`w-8 h-8 rounded-full ${color.value} ${selectedTeamColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Teams List */}
            {teams.length === 0 ? (
              <div
                className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
              >
                <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.scavengerHunt.noTeamsYetAddTeams', 'No teams yet. Add teams to track scores!')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${team.color}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {team.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeTeam(team.id)}
                        className={`p-1 rounded ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {team.score}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hunt Tab */}
        {activeTab === 'hunt' && (
          <div className="space-y-4">
            {/* Time Limit Settings */}
            <div
              className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.scavengerHunt.timeLimit', 'Time Limit')}
                  </span>
                </div>
                <button
                  onClick={() => setHasTimeLimit(!hasTimeLimit)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${hasTimeLimit ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hasTimeLimit ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
              {hasTimeLimit && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                    min="1"
                    max="180"
                    className={`w-20 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    disabled={isHuntActive}
                  />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>minutes</span>
                </div>
              )}
            </div>

            {/* Timer Display */}
            {hasTimeLimit && isHuntActive && (
              <div
                className={`p-6 rounded-lg text-center ${timeRemaining <= 60 ? 'bg-red-500/20 border-red-500' : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}
              >
                <div
                  className={`text-4xl font-bold ${timeRemaining <= 60 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.scavengerHunt.timeRemaining', 'Time Remaining')}
                </p>
              </div>
            )}

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.scavengerHunt.itemsFound', 'Items Found')}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.foundItems}/{stats.totalItems}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.scavengerHunt.pointsEarned', 'Points Earned')}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.earnedPoints}/{stats.totalPoints}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.scavengerHunt.huntProgress', 'Hunt Progress')}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.progress.toFixed(0)}%
                </span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>

            {/* Hunt Controls */}
            <div className="flex gap-3">
              <button
                onClick={toggleHunt}
                disabled={items.length === 0}
                className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${isHuntActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
              >
                {isHuntActive ? (
                  <>
                    <X className="w-5 h-5" />
                    {t('tools.scavengerHunt.endHunt', 'End Hunt')}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {t('tools.scavengerHunt.startHunt', 'Start Hunt')}
                  </>
                )}
              </button>
              <button
                onClick={resetHunt}
                className={`px-4 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.scavengerHunt.reset', 'Reset')}
              </button>
            </div>

            {/* Checklist */}
            {isHuntActive && items.length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.scavengerHunt.checklist', 'Checklist')}
                </h4>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${item.found ? (isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-200') : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          teams.length > 0 ? undefined : toggleItemFound(item.id)
                        }
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.found ? 'bg-emerald-500 border-emerald-500 text-white' : isDark ? 'border-gray-600' : 'border-gray-300'}`}
                      >
                        {item.found && <Check className="w-4 h-4" />}
                      </button>
                      <span
                        className={`${item.found ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {item.name}
                      </span>
                      <span
                        className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        ({item.points} pts)
                      </span>
                    </div>
                    {teams.length > 0 && !item.found && (
                      <div className="flex gap-1">
                        {teams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => toggleItemFound(item.id, team.id)}
                            className={`w-6 h-6 rounded-full ${team.color} hover:ring-2 ring-offset-1 ring-gray-400`}
                            title={`Found by ${team.name}`}
                          />
                        ))}
                      </div>
                    )}
                    {item.found && item.foundBy && (
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-4 h-4 rounded-full ${teams.find((t) => t.id === item.foundBy)?.color || 'bg-gray-400'}`}
                        />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {teams.find((t) => t.id === item.foundBy)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Leaderboard */}
            {teams.length > 0 && (
              <div
                className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.scavengerHunt.leaderboard', 'Leaderboard')}
                  </h4>
                </div>
                <div className="space-y-2">
                  {[...teams]
                    .sort((a, b) => b.score - a.score)
                    .map((team, index) => (
                      <div
                        key={team.id}
                        className={`flex items-center justify-between p-2 rounded ${index === 0 && team.score > 0 ? (isDark ? 'bg-yellow-500/20' : 'bg-yellow-100') : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 && team.score > 0 ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                          >
                            {index + 1}
                          </span>
                          <div className={`w-3 h-3 rounded-full ${team.color}`} />
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {team.name}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {team.score} pts
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Winner Announcement */}
            {!isHuntActive && stats.progress === 100 && winningTeam && winningTeam.score > 0 && (
              <div
                className={`p-6 rounded-lg text-center ${isDark ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-700' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} border`}
              >
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Winner: {winningTeam.name}!
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Final Score: {winningTeam.score} points
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScavengerHuntTool;
