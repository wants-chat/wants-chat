import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Clock, AlertTriangle, Utensils, Bell, Plus, Trash2, Check, Info, Sun, Moon, Coffee, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'bedtime';
type Frequency = 'daily' | 'weekly' | 'as-needed';

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  timeOfDay: TimeOfDay;
  withFood: boolean;
  notes: string;
  taken: boolean;
}

interface SupplementInfo {
  name: string;
  bestTime: TimeOfDay;
  withFood: boolean;
  foodPairing: string;
  interactions: string[];
  benefits: string;
}

const supplementDatabase: Record<string, SupplementInfo> = {
  'vitamin-d': {
    name: 'Vitamin D',
    bestTime: 'morning',
    withFood: true,
    foodPairing: 'Take with fatty foods (avocado, eggs, nuts) for better absorption',
    interactions: ['Avoid taking with calcium at high doses', 'May interact with statins'],
    benefits: 'Bone health, immune function, mood regulation',
  },
  'vitamin-c': {
    name: 'Vitamin C',
    bestTime: 'morning',
    withFood: false,
    foodPairing: 'Can be taken on empty stomach. Pair with iron-rich foods for iron absorption',
    interactions: ['High doses may interfere with blood thinners', 'Avoid with antacids'],
    benefits: 'Immune support, antioxidant, collagen production',
  },
  'vitamin-b12': {
    name: 'Vitamin B12',
    bestTime: 'morning',
    withFood: false,
    foodPairing: 'Best absorbed on empty stomach. Avoid coffee within 1 hour',
    interactions: ['Metformin may reduce absorption', 'Avoid with vitamin C supplements'],
    benefits: 'Energy, nerve function, red blood cell formation',
  },
  'iron': {
    name: 'Iron',
    bestTime: 'morning',
    withFood: false,
    foodPairing: 'Take with vitamin C for better absorption. Avoid dairy, coffee, tea',
    interactions: ['Separate from calcium by 2 hours', 'Avoid with antacids', 'May reduce thyroid medication absorption'],
    benefits: 'Oxygen transport, energy, cognitive function',
  },
  'magnesium': {
    name: 'Magnesium',
    bestTime: 'evening',
    withFood: true,
    foodPairing: 'Take with dinner. Avoid high-fiber meals which may reduce absorption',
    interactions: ['Separate from zinc by 2 hours', 'May interact with antibiotics', 'Avoid with blood pressure meds without consulting doctor'],
    benefits: 'Muscle relaxation, sleep quality, stress reduction',
  },
  'omega-3': {
    name: 'Omega-3 / Fish Oil',
    bestTime: 'morning',
    withFood: true,
    foodPairing: 'Take with largest meal of the day containing fat',
    interactions: ['May enhance blood thinner effects', 'Consult doctor if on blood pressure medication'],
    benefits: 'Heart health, brain function, inflammation reduction',
  },
  'zinc': {
    name: 'Zinc',
    bestTime: 'evening',
    withFood: true,
    foodPairing: 'Take with protein-rich foods. Avoid with high-fiber and phytate-rich foods',
    interactions: ['Separate from iron and copper by 2 hours', 'May interfere with antibiotics'],
    benefits: 'Immune function, wound healing, taste/smell',
  },
  'calcium': {
    name: 'Calcium',
    bestTime: 'evening',
    withFood: true,
    foodPairing: 'Take with vitamin D. Split doses throughout day for better absorption',
    interactions: ['Separate from iron by 2 hours', 'May reduce thyroid medication absorption', 'Avoid with certain antibiotics'],
    benefits: 'Bone health, muscle function, nerve signaling',
  },
  'probiotics': {
    name: 'Probiotics',
    bestTime: 'morning',
    withFood: false,
    foodPairing: 'Take 30 minutes before breakfast on empty stomach',
    interactions: ['Avoid with antibiotics - separate by 2-3 hours', 'Heat-sensitive - store properly'],
    benefits: 'Gut health, digestion, immune support',
  },
  'melatonin': {
    name: 'Melatonin',
    bestTime: 'bedtime',
    withFood: false,
    foodPairing: 'Take 30-60 minutes before bed. Avoid heavy meals close to bedtime',
    interactions: ['May enhance sedative effects', 'Avoid with blood thinners', 'May interact with diabetes medications'],
    benefits: 'Sleep regulation, circadian rhythm, antioxidant',
  },
  'multivitamin': {
    name: 'Multivitamin',
    bestTime: 'morning',
    withFood: true,
    foodPairing: 'Take with breakfast for best absorption of fat-soluble vitamins',
    interactions: ['May interact with blood thinners', 'Avoid doubling up on individual vitamins'],
    benefits: 'General nutritional support, filling dietary gaps',
  },
  'vitamin-k': {
    name: 'Vitamin K',
    bestTime: 'morning',
    withFood: true,
    foodPairing: 'Take with fatty foods. Often paired with vitamin D',
    interactions: ['Critical: Interacts with blood thinners (warfarin)', 'Consult doctor before taking'],
    benefits: 'Blood clotting, bone metabolism, heart health',
  },
};

const timeIcons: Record<TimeOfDay, React.ReactNode> = {
  morning: <Sun className="w-4 h-4" />,
  afternoon: <Coffee className="w-4 h-4" />,
  evening: <Sun className="w-4 h-4 rotate-180" />,
  bedtime: <Moon className="w-4 h-4" />,
};

// Column configuration for export and sync
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Supplement Name', type: 'string' },
  { key: 'dosage', header: 'Dosage', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'timeOfDay', header: 'Time of Day', type: 'string' },
  { key: 'withFood', header: 'With Food', type: 'boolean' },
  { key: 'taken', header: 'Taken Today', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface VitaminTrackerToolProps {
  uiConfig?: UIConfig;
}

export const VitaminTrackerTool: React.FC<VitaminTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: supplements,
    setData: setSupplements,
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
  } = useToolData<Supplement>('vitamin-tracker', [], COLUMNS);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        selectedSupplement?: string;
      };
      // Prefill could set the selected supplement in the guide section
      // For this tool, prefill is limited since it's more of a tracking tool
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const [selectedSupplement, setSelectedSupplement] = useState<string>('vitamin-d');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupplement, setNewSupplement] = useState({
    name: '',
    dosage: '',
    frequency: 'daily' as Frequency,
    timeOfDay: 'morning' as TimeOfDay,
    withFood: true,
    notes: '',
  });

  const [reminderTime, setReminderTime] = useState({
    morning: '08:00',
    afternoon: '12:00',
    evening: '18:00',
    bedtime: '22:00',
  });

  const selectedInfo = supplementDatabase[selectedSupplement];

  const dailyProgress = useMemo(() => {
    const dailySupplements = supplements.filter(s => s.frequency === 'daily');
    const taken = dailySupplements.filter(s => s.taken).length;
    return {
      total: dailySupplements.length,
      taken,
      percentage: dailySupplements.length > 0 ? Math.round((taken / dailySupplements.length) * 100) : 0,
    };
  }, [supplements]);

  const groupedSupplements = useMemo(() => {
    const groups: Record<TimeOfDay, Supplement[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      bedtime: [],
    };
    supplements.forEach(s => {
      groups[s.timeOfDay].push(s);
    });
    return groups;
  }, [supplements]);

  const handleAddSupplement = () => {
    if (!newSupplement.name || !newSupplement.dosage) return;
    const supplement: Supplement = {
      id: Date.now().toString(),
      ...newSupplement,
      taken: false,
    };
    addItem(supplement);
    setNewSupplement({
      name: '',
      dosage: '',
      frequency: 'daily',
      timeOfDay: 'morning',
      withFood: true,
      notes: '',
    });
    setShowAddForm(false);
  };

  const handleRemoveSupplement = (id: string) => {
    deleteItem(id);
  };

  const handleToggleTaken = (id: string) => {
    const supplement = supplements.find(s => s.id === id);
    if (supplement) {
      updateItem(id, { taken: !supplement.taken });
    }
  };

  const handleResetDaily = () => {
    supplements.forEach(s => {
      updateItem(s.id, { taken: false });
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><Pill className="w-5 h-5 text-green-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.vitaminSupplementTracker', 'Vitamin & Supplement Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vitaminTracker.trackIntakeSetRemindersAnd', 'Track intake, set reminders, and optimize timing')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="vitamin-tracker" toolName="Vitamin Tracker" />

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
              onExportCSV={() => exportCSV({ filename: 'vitamin-supplements' })}
              onExportExcel={() => exportExcel({ filename: 'vitamin-supplements' })}
              onExportJSON={() => exportJSON({ filename: 'vitamin-supplements' })}
              onExportPDF={() => exportPDF({
                filename: 'vitamin-supplements',
                title: 'Vitamin & Supplement Tracker',
                subtitle: `Generated on ${new Date().toLocaleDateString()}`
              })}
              onPrint={() => print('Vitamin & Supplement Tracker')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={supplements.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Daily Progress */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.todaySProgress', 'Today\'s Progress')}</h4>
            <button
              onClick={handleResetDaily}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('tools.vitaminTracker.reset', 'Reset')}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-3 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${dailyProgress.percentage}%` }}
                />
              </div>
            </div>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {dailyProgress.taken}/{dailyProgress.total}
            </span>
          </div>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {dailyProgress.percentage === 100 ? 'All supplements taken today!' : `${dailyProgress.percentage}% complete`}
          </p>
        </div>

        {/* Supplement Schedule by Time */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.yourSupplements', 'Your Supplements')}</h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-green-500 hover:text-green-600 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('tools.vitaminTracker.add', 'Add')}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder={t('tools.vitaminTracker.supplementName', 'Supplement name')}
                  value={newSupplement.name}
                  onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.vitaminTracker.dosageEG500mg', 'Dosage (e.g., 500mg)')}
                  value={newSupplement.dosage}
                  onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={newSupplement.timeOfDay}
                  onChange={(e) => setNewSupplement({ ...newSupplement, timeOfDay: e.target.value as TimeOfDay })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="morning">{t('tools.vitaminTracker.morning', 'Morning')}</option>
                  <option value="afternoon">{t('tools.vitaminTracker.afternoon', 'Afternoon')}</option>
                  <option value="evening">{t('tools.vitaminTracker.evening', 'Evening')}</option>
                  <option value="bedtime">{t('tools.vitaminTracker.bedtime', 'Bedtime')}</option>
                </select>
                <select
                  value={newSupplement.frequency}
                  onChange={(e) => setNewSupplement({ ...newSupplement, frequency: e.target.value as Frequency })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="daily">{t('tools.vitaminTracker.daily', 'Daily')}</option>
                  <option value="weekly">{t('tools.vitaminTracker.weekly', 'Weekly')}</option>
                  <option value="as-needed">{t('tools.vitaminTracker.asNeeded', 'As Needed')}</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSupplement.withFood}
                    onChange={(e) => setNewSupplement({ ...newSupplement, withFood: e.target.checked })}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vitaminTracker.takeWithFood', 'Take with food')}</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSupplement}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  {t('tools.vitaminTracker.addSupplement', 'Add Supplement')}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {t('tools.vitaminTracker.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Grouped by Time */}
          {(['morning', 'afternoon', 'evening', 'bedtime'] as TimeOfDay[]).map((time) => (
            groupedSupplements[time].length > 0 && (
              <div key={time} className="space-y-2">
                <div className="flex items-center gap-2">
                  {timeIcons[time]}
                  <span className={`text-sm font-medium capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {time} ({reminderTime[time]})
                  </span>
                </div>
                {groupedSupplements[time].map((supplement) => (
                  <div
                    key={supplement.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      supplement.taken
                        ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTaken(supplement.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          supplement.taken
                            ? 'bg-green-500 border-green-500 text-white'
                            : isDark ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        {supplement.taken && <Check className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={`font-medium ${supplement.taken ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {supplement.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {supplement.dosage} {supplement.withFood && '- with food'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSupplement(supplement.id)}
                      className={`p-1 rounded hover:bg-red-500/10 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ))}

          {supplements.length === 0 && (
            <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.vitaminTracker.noSupplementsAddedYetClick', 'No supplements added yet. Click "Add" to get started.')}
            </p>
          )}
        </div>

        {/* Reminder Setup */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.dailyReminderTimes', 'Daily Reminder Times')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['morning', 'afternoon', 'evening', 'bedtime'] as TimeOfDay[]).map((time) => (
              <div key={time} className="flex items-center gap-2">
                {timeIcons[time]}
                <span className={`text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{time}</span>
                <input
                  type="time"
                  value={reminderTime[time]}
                  onChange={(e) => setReminderTime({ ...reminderTime, [time]: e.target.value })}
                  className={`flex-1 px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Supplement Information */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.supplementGuide', 'Supplement Guide')}</h4>
          <select
            value={selectedSupplement}
            onChange={(e) => setSelectedSupplement(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {Object.entries(supplementDatabase).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>

          {selectedInfo && (
            <div className="space-y-3">
              {/* Best Time */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.bestTimeToTake', 'Best Time to Take')}</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium capitalize">{selectedInfo.bestTime}</span>
                  {selectedInfo.withFood ? ' - with food' : ' - on empty stomach'}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedInfo.benefits}
                </p>
              </div>

              {/* Food Pairing */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.foodPairing', 'Food Pairing')}</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedInfo.foodPairing}
                </p>
              </div>

              {/* Interaction Warnings */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vitaminTracker.interactionWarnings', 'Interaction Warnings')}</span>
                </div>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedInfo.interactions.map((interaction, idx) => (
                    <li key={idx}>- {interaction}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.vitaminTracker.generalTips', 'General Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Consistency is key - take supplements at the same time daily</li>
                <li>- Space iron and calcium at least 2 hours apart</li>
                <li>- Fat-soluble vitamins (A, D, E, K) need fat for absorption</li>
                <li>- Consult a healthcare provider before starting new supplements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitaminTrackerTool;
