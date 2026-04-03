'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Camera,
  Calendar,
  MapPin,
  Clock,
  User,
  Users,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Sun,
  Cloud,
  CloudRain,
  Palette,
  FileText,
  DollarSign,
  Image,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Shirt,
} from 'lucide-react';

// Types
interface ShotListItem {
  id: string;
  description: string;
  notes: string;
  completed: boolean;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'props' | 'other';
  checked: boolean;
}

interface TimelineEvent {
  id: string;
  time: string;
  activity: string;
  duration: string;
  notes: string;
}

interface ModelInfo {
  id: string;
  name: string;
  contact: string;
  notes: string;
}

interface MoodBoardItem {
  id: string;
  title: string;
  description: string;
  referenceUrl: string;
}

interface DeliverableItem {
  id: string;
  name: string;
  dueDate: string;
  completed: boolean;
}

interface PhotoShootData {
  // Shoot Details
  clientName: string;
  shootDate: string;
  shootTime: string;
  location: string;
  shootType: 'portrait' | 'wedding' | 'event' | 'product' | 'fashion' | 'other';

  // Shot List
  shotList: ShotListItem[];

  // Equipment
  equipment: EquipmentItem[];

  // Location Scouting
  locationNotes: string;
  parkingInfo: string;
  accessNotes: string;

  // Timeline
  timeline: TimelineEvent[];

  // Weather
  weatherPlan: string;
  indoorBackup: string;
  weatherNotes: string;

  // Models/Subjects
  models: ModelInfo[];

  // Styling
  wardrobeNotes: string;
  makeupNotes: string;
  propsNotes: string;

  // Mood Board
  moodBoard: MoodBoardItem[];

  // Contract
  contractStatus: 'pending' | 'sent' | 'signed' | 'na';
  contractNotes: string;

  // Payment
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  balancePaid: boolean;
  paymentNotes: string;

  // Deliverables
  deliverables: DeliverableItem[];
}

// Wrapper type for useToolData (requires id field)
interface PhotoShootDataWithId extends PhotoShootData {
  id: string;
}

// Column configuration for export
const photoShootColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'shootDate', header: 'Shoot Date', type: 'date' },
  { key: 'shootTime', header: 'Shoot Time', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'shootType', header: 'Shoot Type', type: 'string' },
  { key: 'contractStatus', header: 'Contract Status', type: 'string' },
  { key: 'totalAmount', header: 'Total Amount', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit Amount', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
  { key: 'balancePaid', header: 'Balance Paid', type: 'boolean' },
];

const defaultData: PhotoShootData = {
  clientName: '',
  shootDate: '',
  shootTime: '',
  location: '',
  shootType: 'portrait',
  shotList: [],
  equipment: [],
  locationNotes: '',
  parkingInfo: '',
  accessNotes: '',
  timeline: [],
  weatherPlan: '',
  indoorBackup: '',
  weatherNotes: '',
  models: [],
  wardrobeNotes: '',
  makeupNotes: '',
  propsNotes: '',
  moodBoard: [],
  contractStatus: 'pending',
  contractNotes: '',
  totalAmount: 0,
  depositAmount: 0,
  depositPaid: false,
  balancePaid: false,
  paymentNotes: '',
  deliverables: [],
};

const shootTypes = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'event', label: 'Event' },
  { value: 'product', label: 'Product' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'other', label: 'Other' },
];

const equipmentCategories = [
  { value: 'camera', label: 'Camera Bodies' },
  { value: 'lens', label: 'Lenses' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'props', label: 'Props' },
  { value: 'other', label: 'Other' },
];

const contractStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'signed', label: 'Signed' },
  { value: 'na', label: 'N/A' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

interface PhotoShootPlannerToolProps {
  uiConfig?: UIConfig;
}

// Default data with ID for useToolData
const defaultDataWithId: PhotoShootDataWithId = {
  id: 'photoshoot-plan-1',
  ...defaultData,
};

export const PhotoShootPlannerTool = ({
  uiConfig }: PhotoShootPlannerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for backend persistence
  const {
    data: toolDataArray,
    addItem,
    updateItem,
    resetToDefault,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<PhotoShootDataWithId>(
    'photoshoot-planner',
    [defaultDataWithId],
    photoShootColumns,
    { autoSave: true }
  );

  // Get the current data (first item in array, or default)
  const data: PhotoShootData = toolDataArray[0] || defaultData;

  // Helper to update data through the hook
  const setData = (updater: React.SetStateAction<PhotoShootData>) => {
    const newData = typeof updater === 'function' ? updater(data) : updater;
    const dataWithId: PhotoShootDataWithId = {
      id: 'photoshoot-plan-1',
      ...newData,
    };
    if (toolDataArray.length === 0) {
      addItem(dataWithId);
    } else {
      updateItem('photoshoot-plan-1', dataWithId);
    }
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    shotList: true,
    equipment: true,
    location: false,
    timeline: false,
    weather: false,
    models: false,
    styling: false,
    moodBoard: false,
    contract: false,
    payment: false,
    deliverables: false,
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName) {
        setData(prev => ({ ...prev, clientName: params.clientName as string }));
        hasChanges = true;
      }
      if (params.date) {
        setData(prev => ({ ...prev, shootDate: params.date as string }));
        hasChanges = true;
      }
      if (params.location) {
        setData(prev => ({ ...prev, location: params.location as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateData = <K extends keyof PhotoShootData>(key: K, value: PhotoShootData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Shot List helpers
  const addShotListItem = () => {
    const newItem: ShotListItem = {
      id: generateId(),
      description: '',
      notes: '',
      completed: false,
    };
    updateData('shotList', [...data.shotList, newItem]);
  };

  const updateShotListItem = (id: string, updates: Partial<ShotListItem>) => {
    updateData(
      'shotList',
      data.shotList.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeShotListItem = (id: string) => {
    updateData('shotList', data.shotList.filter(item => item.id !== id));
  };

  // Equipment helpers
  const addEquipmentItem = () => {
    const newItem: EquipmentItem = {
      id: generateId(),
      name: '',
      category: 'camera',
      checked: false,
    };
    updateData('equipment', [...data.equipment, newItem]);
  };

  const updateEquipmentItem = (id: string, updates: Partial<EquipmentItem>) => {
    updateData(
      'equipment',
      data.equipment.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeEquipmentItem = (id: string) => {
    updateData('equipment', data.equipment.filter(item => item.id !== id));
  };

  // Timeline helpers
  const addTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: generateId(),
      time: '',
      activity: '',
      duration: '',
      notes: '',
    };
    updateData('timeline', [...data.timeline, newEvent]);
  };

  const updateTimelineEvent = (id: string, updates: Partial<TimelineEvent>) => {
    updateData(
      'timeline',
      data.timeline.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeTimelineEvent = (id: string) => {
    updateData('timeline', data.timeline.filter(item => item.id !== id));
  };

  // Models helpers
  const addModel = () => {
    const newModel: ModelInfo = {
      id: generateId(),
      name: '',
      contact: '',
      notes: '',
    };
    updateData('models', [...data.models, newModel]);
  };

  const updateModel = (id: string, updates: Partial<ModelInfo>) => {
    updateData(
      'models',
      data.models.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeModel = (id: string) => {
    updateData('models', data.models.filter(item => item.id !== id));
  };

  // Mood Board helpers
  const addMoodBoardItem = () => {
    const newItem: MoodBoardItem = {
      id: generateId(),
      title: '',
      description: '',
      referenceUrl: '',
    };
    updateData('moodBoard', [...data.moodBoard, newItem]);
  };

  const updateMoodBoardItem = (id: string, updates: Partial<MoodBoardItem>) => {
    updateData(
      'moodBoard',
      data.moodBoard.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeMoodBoardItem = (id: string) => {
    updateData('moodBoard', data.moodBoard.filter(item => item.id !== id));
  };

  // Deliverables helpers
  const addDeliverable = () => {
    const newItem: DeliverableItem = {
      id: generateId(),
      name: '',
      dueDate: '',
      completed: false,
    };
    updateData('deliverables', [...data.deliverables, newItem]);
  };

  const updateDeliverable = (id: string, updates: Partial<DeliverableItem>) => {
    updateData(
      'deliverables',
      data.deliverables.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeDeliverable = (id: string) => {
    updateData('deliverables', data.deliverables.filter(item => item.id !== id));
  };

  // Statistics
  const stats = useMemo(() => {
    const shotListComplete = data.shotList.filter(s => s.completed).length;
    const shotListTotal = data.shotList.length;
    const equipmentPacked = data.equipment.filter(e => e.checked).length;
    const equipmentTotal = data.equipment.length;
    const deliverablesComplete = data.deliverables.filter(d => d.completed).length;
    const deliverablesTotal = data.deliverables.length;
    const balanceRemaining = data.totalAmount - (data.depositPaid ? data.depositAmount : 0) - (data.balancePaid ? (data.totalAmount - data.depositAmount) : 0);

    return {
      shotListComplete,
      shotListTotal,
      equipmentPacked,
      equipmentTotal,
      deliverablesComplete,
      deliverablesTotal,
      balanceRemaining,
    };
  }, [data]);

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to reset all data? This cannot be undone.',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      resetToDefault([defaultDataWithId]);
    }
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    section
  }: {
    title: string;
    icon: React.ElementType;
    section: string
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#0D9488]" />
        </div>
        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      ) : (
        <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      )}
    </button>
  );

  const inputClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const textareaClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none`;

  const selectClasses = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClasses = `block text-sm font-medium mb-2 ${
    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
  }`;

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Camera className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.photoShootPlanner.photoShootPlanner', 'Photo Shoot Planner')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.photoShootPlanner.planAndOrganizeYourPhotography', 'Plan and organize your photography sessions')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="photo-shoot-planner" toolName="Photo Shoot Planner" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'photoshoot-plan' })}
            onExportExcel={() => exportExcel({ filename: 'photoshoot-plan' })}
            onExportJSON={() => exportJSON({ filename: 'photoshoot-plan' })}
            onExportPDF={() => exportPDF({ filename: 'photoshoot-plan', title: 'Photo Shoot Plan' })}
            onPrint={() => print('Photo Shoot Plan')}
            onCopyToClipboard={() => copyToClipboard()}
            theme={theme}
            showImport={false}
          />
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            {t('tools.photoShootPlanner.resetAll', 'Reset All')}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.photoShootPlanner.shots', 'Shots')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.shotListComplete}/{stats.shotListTotal}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.photoShootPlanner.equipment', 'Equipment')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.equipmentPacked}/{stats.equipmentTotal}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.photoShootPlanner.deliverables', 'Deliverables')}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.deliverablesComplete}/{stats.deliverablesTotal}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.photoShootPlanner.balanceDue', 'Balance Due')}</p>
          <p className={`text-lg font-bold text-[#0D9488]`}>
            ${stats.balanceRemaining.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Shoot Details Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.shootDetails', 'Shoot Details')} icon={Calendar} section="details" />
          {expandedSections.details && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.clientName', 'Client Name')}</label>
                  <input
                    type="text"
                    value={data.clientName}
                    onChange={(e) => updateData('clientName', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.enterClientName', 'Enter client name')}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.shootType', 'Shoot Type')}</label>
                  <select
                    value={data.shootType}
                    onChange={(e) => updateData('shootType', e.target.value as PhotoShootData['shootType'])}
                    className={selectClasses}
                  >
                    {shootTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.date', 'Date')}</label>
                  <input
                    type="date"
                    value={data.shootDate}
                    onChange={(e) => updateData('shootDate', e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.time', 'Time')}</label>
                  <input
                    type="time"
                    value={data.shootTime}
                    onChange={(e) => updateData('shootTime', e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>{t('tools.photoShootPlanner.location', 'Location')}</label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => updateData('location', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.enterShootLocation', 'Enter shoot location')}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shot List Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.shotList', 'Shot List')} icon={Image} section="shotList" />
          {expandedSections.shotList && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-3">
                {data.shotList.map((shot) => (
                  <div
                    key={shot.id}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => updateShotListItem(shot.id, { completed: !shot.completed })}
                        className="mt-1"
                      >
                        {shot.completed ? (
                          <CheckSquare className="w-5 h-5 text-[#0D9488]" />
                        ) : (
                          <Square className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={shot.description}
                          onChange={(e) => updateShotListItem(shot.id, { description: e.target.value })}
                          placeholder={t('tools.photoShootPlanner.shotDescription', 'Shot description')}
                          className={`${inputClasses} ${shot.completed ? 'line-through opacity-60' : ''}`}
                        />
                        <input
                          type="text"
                          value={shot.notes}
                          onChange={(e) => updateShotListItem(shot.id, { notes: e.target.value })}
                          placeholder={t('tools.photoShootPlanner.additionalNotes', 'Additional notes')}
                          className={`${inputClasses} text-sm`}
                        />
                      </div>
                      <button
                        onClick={() => removeShotListItem(shot.id)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addShotListItem}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.photoShootPlanner.addShot', 'Add Shot')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Equipment Checklist Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.equipmentChecklist', 'Equipment Checklist')} icon={Package} section="equipment" />
          {expandedSections.equipment && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {equipmentCategories.map((category) => {
                const categoryItems = data.equipment.filter(e => e.category === category.value);
                return (
                  <div key={category.value} className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {category.label}
                    </h4>
                    <div className="space-y-2">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => updateEquipmentItem(item.id, { checked: !item.checked })}
                          >
                            {item.checked ? (
                              <CheckSquare className="w-5 h-5 text-[#0D9488]" />
                            ) : (
                              <Square className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateEquipmentItem(item.id, { name: e.target.value })}
                            placeholder={t('tools.photoShootPlanner.equipmentName', 'Equipment name')}
                            className={`flex-1 ${inputClasses} ${item.checked ? 'line-through opacity-60' : ''}`}
                          />
                          <select
                            value={item.category}
                            onChange={(e) => updateEquipmentItem(item.id, { category: e.target.value as EquipmentItem['category'] })}
                            className={`w-32 ${selectClasses} text-sm`}
                          >
                            {equipmentCategories.map((cat) => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeEquipmentItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={addEquipmentItem}
                className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.photoShootPlanner.addEquipment', 'Add Equipment')}
              </button>
            </div>
          )}
        </div>

        {/* Location Scouting Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.locationScoutingNotes', 'Location Scouting Notes')} icon={MapPin} section="location" />
          {expandedSections.location && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.locationNotes', 'Location Notes')}</label>
                  <textarea
                    value={data.locationNotes}
                    onChange={(e) => updateData('locationNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.generalObservationsAboutTheLocation', 'General observations about the location, best spots, lighting conditions...')}
                    rows={3}
                    className={textareaClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.parkingInformation', 'Parking Information')}</label>
                  <input
                    type="text"
                    value={data.parkingInfo}
                    onChange={(e) => updateData('parkingInfo', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.whereToParkPermitsNeeded', 'Where to park, permits needed, etc.')}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.accessNotes', 'Access Notes')}</label>
                  <textarea
                    value={data.accessNotes}
                    onChange={(e) => updateData('accessNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.entryRequirementsKeysContactsPermissions', 'Entry requirements, keys, contacts, permissions...')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.dayTimelineSchedule', 'Day Timeline/Schedule')} icon={Clock} section="timeline" />
          {expandedSections.timeline && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-3">
                {data.timeline.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="time"
                        value={event.time}
                        onChange={(e) => updateTimelineEvent(event.id, { time: e.target.value })}
                        className={inputClasses}
                      />
                      <input
                        type="text"
                        value={event.activity}
                        onChange={(e) => updateTimelineEvent(event.id, { activity: e.target.value })}
                        placeholder={t('tools.photoShootPlanner.activity', 'Activity')}
                        className={`md:col-span-2 ${inputClasses}`}
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={event.duration}
                          onChange={(e) => updateTimelineEvent(event.id, { duration: e.target.value })}
                          placeholder={t('tools.photoShootPlanner.duration', 'Duration')}
                          className={inputClasses}
                        />
                        <button
                          onClick={() => removeTimelineEvent(event.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={event.notes}
                      onChange={(e) => updateTimelineEvent(event.id, { notes: e.target.value })}
                      placeholder={t('tools.photoShootPlanner.notes', 'Notes')}
                      className={`mt-2 ${inputClasses} text-sm`}
                    />
                  </div>
                ))}
                <button
                  onClick={addTimelineEvent}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.photoShootPlanner.addEvent', 'Add Event')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Weather Contingency Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.weatherContingencyPlans', 'Weather Contingency Plans')} icon={Cloud} section="weather" />
          {expandedSections.weather && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.primaryWeatherPlan', 'Primary Weather Plan')}</label>
                  <textarea
                    value={data.weatherPlan}
                    onChange={(e) => updateData('weatherPlan', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.planForIdealWeatherConditions', 'Plan for ideal weather conditions...')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.indoorBackupLocation', 'Indoor Backup Location')}</label>
                  <input
                    type="text"
                    value={data.indoorBackup}
                    onChange={(e) => updateData('indoorBackup', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.backupIndoorLocationIfNeeded', 'Backup indoor location if needed')}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.weatherNotes', 'Weather Notes')}</label>
                  <textarea
                    value={data.weatherNotes}
                    onChange={(e) => updateData('weatherNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.rainPlansWindConsiderationsGolden', 'Rain plans, wind considerations, golden hour timing...')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Models/Subjects Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.modelsSubjectsInformation', 'Models/Subjects Information')} icon={Users} section="models" />
          {expandedSections.models && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-3">
                {data.models.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={model.name}
                        onChange={(e) => updateModel(model.id, { name: e.target.value })}
                        placeholder={t('tools.photoShootPlanner.name', 'Name')}
                        className={inputClasses}
                      />
                      <input
                        type="text"
                        value={model.contact}
                        onChange={(e) => updateModel(model.id, { contact: e.target.value })}
                        placeholder={t('tools.photoShootPlanner.contactInfo', 'Contact info')}
                        className={inputClasses}
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={model.notes}
                          onChange={(e) => updateModel(model.id, { notes: e.target.value })}
                          placeholder={t('tools.photoShootPlanner.notes2', 'Notes')}
                          className={inputClasses}
                        />
                        <button
                          onClick={() => removeModel(model.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addModel}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.photoShootPlanner.addModelSubject', 'Add Model/Subject')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Styling/Wardrobe Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.stylingWardrobe', 'Styling & Wardrobe')} icon={Shirt} section="styling" />
          {expandedSections.styling && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.wardrobeNotes', 'Wardrobe Notes')}</label>
                  <textarea
                    value={data.wardrobeNotes}
                    onChange={(e) => updateData('wardrobeNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.outfitDetailsColorPaletteStyle', 'Outfit details, color palette, style direction...')}
                    rows={3}
                    className={textareaClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.makeupHairNotes', 'Makeup & Hair Notes')}</label>
                  <textarea
                    value={data.makeupNotes}
                    onChange={(e) => updateData('makeupNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.makeupStyleHairStylingEtc', 'Makeup style, hair styling, etc.')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.propsNotes', 'Props Notes')}</label>
                  <textarea
                    value={data.propsNotes}
                    onChange={(e) => updateData('propsNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.propsToBringDecorationsAccessories', 'Props to bring, decorations, accessories...')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mood Board Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.moodBoardInspiration', 'Mood Board & Inspiration')} icon={Lightbulb} section="moodBoard" />
          {expandedSections.moodBoard && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-3">
                {data.moodBoard.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateMoodBoardItem(item.id, { title: e.target.value })}
                          placeholder={t('tools.photoShootPlanner.inspirationTitle', 'Inspiration title')}
                          className={inputClasses}
                        />
                        <button
                          onClick={() => removeMoodBoardItem(item.id)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateMoodBoardItem(item.id, { description: e.target.value })}
                        placeholder={t('tools.photoShootPlanner.description', 'Description')}
                        className={inputClasses}
                      />
                      <input
                        type="url"
                        value={item.referenceUrl}
                        onChange={(e) => updateMoodBoardItem(item.id, { referenceUrl: e.target.value })}
                        placeholder={t('tools.photoShootPlanner.referenceUrlPinterestInstagramEtc', 'Reference URL (Pinterest, Instagram, etc.)')}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addMoodBoardItem}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.photoShootPlanner.addInspiration', 'Add Inspiration')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contract Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.contractAgreement', 'Contract & Agreement')} icon={FileText} section="contract" />
          {expandedSections.contract && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.contractStatus', 'Contract Status')}</label>
                  <select
                    value={data.contractStatus}
                    onChange={(e) => updateData('contractStatus', e.target.value as PhotoShootData['contractStatus'])}
                    className={selectClasses}
                  >
                    {contractStatuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div className={`p-3 rounded-lg ${
                  data.contractStatus === 'signed'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : data.contractStatus === 'pending'
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {data.contractStatus === 'signed' ? (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className={`w-5 h-5 ${
                        data.contractStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'
                      }`} />
                    )}
                    <span className={`text-sm font-medium ${
                      data.contractStatus === 'signed'
                        ? 'text-green-500'
                        : data.contractStatus === 'pending'
                        ? 'text-yellow-500'
                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {data.contractStatus === 'signed' && 'Contract is signed and complete'}
                      {data.contractStatus === 'pending' && 'Contract is pending signature'}
                      {data.contractStatus === 'sent' && 'Contract has been sent to client'}
                      {data.contractStatus === 'na' && 'No contract required for this shoot'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.contractNotes', 'Contract Notes')}</label>
                  <textarea
                    value={data.contractNotes}
                    onChange={(e) => updateData('contractNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.specialTermsModelReleaseInfo', 'Special terms, model release info, usage rights...')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Tracking Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.depositPaymentTracking', 'Deposit & Payment Tracking')} icon={DollarSign} section="payment" />
          {expandedSections.payment && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>{t('tools.photoShootPlanner.totalAmount', 'Total Amount ($)')}</label>
                    <input
                      type="number"
                      value={data.totalAmount || ''}
                      onChange={(e) => updateData('totalAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('tools.photoShootPlanner.depositAmount', 'Deposit Amount ($)')}</label>
                    <input
                      type="number"
                      value={data.depositAmount || ''}
                      onChange={(e) => updateData('depositAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className={`flex items-center gap-2 cursor-pointer ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={data.depositPaid}
                      onChange={(e) => updateData('depositPaid', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    <span className="text-sm">{t('tools.photoShootPlanner.depositPaid', 'Deposit Paid')}</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={data.balancePaid}
                      onChange={(e) => updateData('balancePaid', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    <span className="text-sm">{t('tools.photoShootPlanner.balancePaid', 'Balance Paid')}</span>
                  </label>
                </div>
                <div className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.photoShootPlanner.total', 'Total:')}</span>
                      <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${data.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.photoShootPlanner.paid', 'Paid:')}</span>
                      <span className="ml-2 font-medium text-green-500">
                        ${((data.depositPaid ? data.depositAmount : 0) + (data.balancePaid ? (data.totalAmount - data.depositAmount) : 0)).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.photoShootPlanner.remaining', 'Remaining:')}</span>
                      <span className="ml-2 font-medium text-[#0D9488]">
                        ${stats.balanceRemaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>{t('tools.photoShootPlanner.paymentNotes', 'Payment Notes')}</label>
                  <textarea
                    value={data.paymentNotes}
                    onChange={(e) => updateData('paymentNotes', e.target.value)}
                    placeholder={t('tools.photoShootPlanner.paymentMethodDueDatesInvoice', 'Payment method, due dates, invoice number...')}
                    rows={2}
                    className={textareaClasses}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deliverables Section */}
        <div>
          <SectionHeader title={t('tools.photoShootPlanner.postShootDeliverables', 'Post-Shoot Deliverables')} icon={CheckSquare} section="deliverables" />
          {expandedSections.deliverables && (
            <div className={`mt-4 p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-3">
                {data.deliverables.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateDeliverable(item.id, { completed: !item.completed })}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-5 h-5 text-[#0D9488]" />
                        ) : (
                          <Square className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateDeliverable(item.id, { name: e.target.value })}
                        placeholder={t('tools.photoShootPlanner.deliverableName', 'Deliverable name')}
                        className={`flex-1 ${inputClasses} ${item.completed ? 'line-through opacity-60' : ''}`}
                      />
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateDeliverable(item.id, { dueDate: e.target.value })}
                        className={`w-40 ${inputClasses}`}
                      />
                      <button
                        onClick={() => removeDeliverable(item.id)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addDeliverable}
                  className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.photoShootPlanner.addDeliverable', 'Add Deliverable')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.photoShootPlanner.aboutPhotoShootPlanner', 'About Photo Shoot Planner')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.photoShootPlanner.aComprehensivePhotographyShootPlanning', 'A comprehensive photography shoot planning tool to help you organize every aspect of your photo sessions. Track shot lists, equipment, timelines, client information, contracts, payments, and deliverables all in one place. All data is automatically saved to your browser.')}
          </p>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default PhotoShootPlannerTool;
