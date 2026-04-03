'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  Square,
  CheckSquare,
  Search,
  Filter,
  Copy,
  Download,
  Printer,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Home,
  Building,
  Star,
  Clock,
  RotateCcw,
  Layers,
  Tag,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CleaningChecklistToolProps {
  uiConfig?: UIConfig;
}

// Types
interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'move-in' | 'move-out' | 'deep-clean' | 'post-construction' | 'custom';
  items: ChecklistItem[];
  estimatedTime: number;
  createdAt: string;
  isDefault: boolean;
}

interface ChecklistItem {
  id: string;
  task: string;
  room: string;
  priority: 'must' | 'should' | 'nice';
  estimatedMinutes: number;
  notes: string;
}

interface ActiveChecklist {
  id: string;
  templateId: string;
  templateName: string;
  clientName: string;
  propertyAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  items: ActiveChecklistItem[];
  status: 'in-progress' | 'completed' | 'paused';
  notes: string;
}

interface ActiveChecklistItem {
  id: string;
  task: string;
  room: string;
  completed: boolean;
  completedAt?: string;
  skipped: boolean;
  notes: string;
}

// Column configurations for export
const TEMPLATE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Template Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'itemCount', header: 'Items', type: 'number' },
  { key: 'estimatedTime', header: 'Est. Time (min)', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const CHECKLIST_COLUMNS: ColumnConfig[] = [
  { key: 'templateName', header: 'Template', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'completedItems', header: 'Completed', type: 'number' },
  { key: 'totalItems', header: 'Total Items', type: 'number' },
];

// Default room categories
const ROOMS = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom',
  'Bathroom',
  'Master Bathroom',
  'Dining Room',
  'Office',
  'Hallway',
  'Entryway',
  'Laundry Room',
  'Garage',
  'Basement',
  'Attic',
  'Patio/Deck',
  'General',
];

const CATEGORIES = [
  { value: 'residential', label: 'Residential Standard' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'move-in', label: 'Move-In Clean' },
  { value: 'move-out', label: 'Move-Out Clean' },
  { value: 'deep-clean', label: 'Deep Clean' },
  { value: 'post-construction', label: 'Post-Construction' },
  { value: 'custom', label: 'Custom' },
];

// Default checklist templates
const DEFAULT_TEMPLATES: Omit<ChecklistTemplate, 'id' | 'createdAt'>[] = [
  {
    name: 'Standard Residential Clean',
    description: 'Regular cleaning for residential homes',
    category: 'residential',
    estimatedTime: 120,
    isDefault: true,
    items: [
      { id: '1', task: 'Dust all surfaces', room: 'General', priority: 'must', estimatedMinutes: 10, notes: '' },
      { id: '2', task: 'Vacuum all floors', room: 'General', priority: 'must', estimatedMinutes: 15, notes: '' },
      { id: '3', task: 'Mop hard floors', room: 'General', priority: 'must', estimatedMinutes: 15, notes: '' },
      { id: '4', task: 'Clean countertops', room: 'Kitchen', priority: 'must', estimatedMinutes: 10, notes: '' },
      { id: '5', task: 'Clean stovetop', room: 'Kitchen', priority: 'must', estimatedMinutes: 10, notes: '' },
      { id: '6', task: 'Clean microwave inside', room: 'Kitchen', priority: 'should', estimatedMinutes: 5, notes: '' },
      { id: '7', task: 'Wipe cabinet fronts', room: 'Kitchen', priority: 'should', estimatedMinutes: 10, notes: '' },
      { id: '8', task: 'Clean sink and fixtures', room: 'Kitchen', priority: 'must', estimatedMinutes: 5, notes: '' },
      { id: '9', task: 'Sanitize toilets', room: 'Bathroom', priority: 'must', estimatedMinutes: 10, notes: '' },
      { id: '10', task: 'Clean showers/tubs', room: 'Bathroom', priority: 'must', estimatedMinutes: 15, notes: '' },
      { id: '11', task: 'Clean bathroom sinks', room: 'Bathroom', priority: 'must', estimatedMinutes: 5, notes: '' },
      { id: '12', task: 'Clean mirrors', room: 'Bathroom', priority: 'must', estimatedMinutes: 5, notes: '' },
      { id: '13', task: 'Make beds', room: 'Bedroom', priority: 'should', estimatedMinutes: 5, notes: '' },
      { id: '14', task: 'Empty trash bins', room: 'General', priority: 'must', estimatedMinutes: 5, notes: '' },
    ],
  },
  {
    name: 'Deep Clean Package',
    description: 'Thorough cleaning including hard-to-reach areas',
    category: 'deep-clean',
    estimatedTime: 240,
    isDefault: true,
    items: [
      { id: '1', task: 'All standard cleaning tasks', room: 'General', priority: 'must', estimatedMinutes: 120, notes: '' },
      { id: '2', task: 'Clean inside oven', room: 'Kitchen', priority: 'must', estimatedMinutes: 20, notes: '' },
      { id: '3', task: 'Clean inside refrigerator', room: 'Kitchen', priority: 'must', estimatedMinutes: 20, notes: '' },
      { id: '4', task: 'Clean inside cabinets', room: 'Kitchen', priority: 'should', estimatedMinutes: 30, notes: '' },
      { id: '5', task: 'Clean baseboards', room: 'General', priority: 'must', estimatedMinutes: 20, notes: '' },
      { id: '6', task: 'Clean ceiling fans', room: 'General', priority: 'must', estimatedMinutes: 15, notes: '' },
      { id: '7', task: 'Clean window sills', room: 'General', priority: 'should', estimatedMinutes: 15, notes: '' },
      { id: '8', task: 'Clean light fixtures', room: 'General', priority: 'should', estimatedMinutes: 15, notes: '' },
      { id: '9', task: 'Clean behind appliances', room: 'Kitchen', priority: 'should', estimatedMinutes: 20, notes: '' },
      { id: '10', task: 'Scrub tile grout', room: 'Bathroom', priority: 'should', estimatedMinutes: 30, notes: '' },
    ],
  },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getCategoryColor = (category: ChecklistTemplate['category'], theme: string) => {
  const colors: Record<ChecklistTemplate['category'], string> = {
    residential: theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
    commercial: theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
    'move-in': theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    'move-out': theme === 'dark' ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
    'deep-clean': theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    'post-construction': theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    custom: theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
  };
  return colors[category];
};

const getPriorityColor = (priority: ChecklistItem['priority'], theme: string) => {
  const colors: Record<ChecklistItem['priority'], string> = {
    must: theme === 'dark' ? 'text-red-400' : 'text-red-600',
    should: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
    nice: theme === 'dark' ? 'text-green-400' : 'text-green-600',
  };
  return colors[priority];
};

// Main Component
export const CleaningChecklistTool: React.FC<CleaningChecklistToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: templates,
    addItem: addTemplateToBackend,
    updateItem: updateTemplateBackend,
    deleteItem: deleteTemplateBackend,
    isSynced: templatesSynced,
    isSaving: templatesSaving,
    lastSaved: templatesLastSaved,
    syncError: templatesSyncError,
    forceSync: forceTemplatesSync,
  } = useToolData<ChecklistTemplate>('cleaning-checklist-templates', [], TEMPLATE_COLUMNS);

  const {
    data: activeChecklists,
    addItem: addActiveChecklistToBackend,
    updateItem: updateActiveChecklistBackend,
    deleteItem: deleteActiveChecklistBackend,
  } = useToolData<ActiveChecklist>('cleaning-checklist-active', [], CHECKLIST_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'templates' | 'active' | 'history'>('templates');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showStartChecklistModal, setShowStartChecklistModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [activeChecklistView, setActiveChecklistView] = useState<ActiveChecklist | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [newTemplate, setNewTemplate] = useState<Partial<ChecklistTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    items: [],
    estimatedTime: 60,
    isDefault: false,
  });

  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    task: '',
    room: 'General',
    priority: 'must',
    estimatedMinutes: 5,
    notes: '',
  });

  const [startChecklistData, setStartChecklistData] = useState({
    templateId: '',
    clientName: '',
    propertyAddress: '',
  });

  // Initialize default templates if empty
  useEffect(() => {
    if (templates.length === 0) {
      DEFAULT_TEMPLATES.forEach((template) => {
        const newTemplate: ChecklistTemplate = {
          ...template,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        addTemplateToBackend(newTemplate);
      });
    }
  }, []);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.template || params.checklist) {
        setNewTemplate({
          ...newTemplate,
          name: params.template || params.checklist || '',
        });
        setShowTemplateForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchTerm === '' ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, filterCategory]);

  // Active checklists in progress
  const inProgressChecklists = useMemo(() => {
    return activeChecklists.filter((c) => c.status === 'in-progress' || c.status === 'paused');
  }, [activeChecklists]);

  // Completed checklists
  const completedChecklists = useMemo(() => {
    return activeChecklists.filter((c) => c.status === 'completed');
  }, [activeChecklists]);

  // Add template
  const addTemplate = () => {
    if (!newTemplate.name) {
      setValidationMessage('Please enter a template name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const template: ChecklistTemplate = {
      id: generateId(),
      name: newTemplate.name || '',
      description: newTemplate.description || '',
      category: newTemplate.category || 'custom',
      items: newTemplate.items || [],
      estimatedTime: newTemplate.items?.reduce((sum, item) => sum + item.estimatedMinutes, 0) || 0,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };

    addTemplateToBackend(template);
    setShowTemplateForm(false);
    resetTemplateForm();
  };

  // Add item to template being edited
  const addItemToTemplate = () => {
    if (!newItem.task) return;

    const item: ChecklistItem = {
      id: generateId(),
      task: newItem.task || '',
      room: newItem.room || 'General',
      priority: newItem.priority || 'must',
      estimatedMinutes: newItem.estimatedMinutes || 5,
      notes: newItem.notes || '',
    };

    setNewTemplate({
      ...newTemplate,
      items: [...(newTemplate.items || []), item],
    });

    setNewItem({
      task: '',
      room: newItem.room,
      priority: 'must',
      estimatedMinutes: 5,
      notes: '',
    });
  };

  // Remove item from template
  const removeItemFromTemplate = (itemId: string) => {
    setNewTemplate({
      ...newTemplate,
      items: newTemplate.items?.filter((item) => item.id !== itemId) || [],
    });
  };

  // Start a new checklist from template
  const startChecklist = () => {
    if (!startChecklistData.templateId) {
      setValidationMessage('Please select a template');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const template = templates.find((t) => t.id === startChecklistData.templateId);
    if (!template) return;

    const checklist: ActiveChecklist = {
      id: generateId(),
      templateId: template.id,
      templateName: template.name,
      clientName: startChecklistData.clientName,
      propertyAddress: startChecklistData.propertyAddress,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      endTime: '',
      items: template.items.map((item) => ({
        id: generateId(),
        task: item.task,
        room: item.room,
        completed: false,
        skipped: false,
        notes: '',
      })),
      status: 'in-progress',
      notes: '',
    };

    addActiveChecklistToBackend(checklist);
    setActiveChecklistView(checklist);
    setShowStartChecklistModal(false);
    setStartChecklistData({ templateId: '', clientName: '', propertyAddress: '' });
    setActiveTab('active');
  };

  // Toggle item completion
  const toggleItemCompletion = (checklistId: string, itemId: string) => {
    const checklist = activeChecklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
        : item
    );

    updateActiveChecklistBackend(checklistId, { items: updatedItems });

    if (activeChecklistView?.id === checklistId) {
      setActiveChecklistView({ ...activeChecklistView, items: updatedItems });
    }
  };

  // Complete checklist
  const completeChecklist = (checklistId: string) => {
    updateActiveChecklistBackend(checklistId, {
      status: 'completed',
      endTime: new Date().toISOString(),
    });
    setActiveChecklistView(null);
  };

  // Duplicate template
  const duplicateTemplate = (template: ChecklistTemplate) => {
    const newTemplate: ChecklistTemplate = {
      ...template,
      id: generateId(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };
    addTemplateToBackend(newTemplate);
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template?.isDefault) {
      setValidationMessage('Cannot delete default templates');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Template',
      message: 'Are you sure you want to delete this template?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteTemplateBackend(templateId);
    }
  };

  // Reset form
  const resetTemplateForm = () => {
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      items: [],
      estimatedTime: 60,
      isDefault: false,
    });
  };

  // Export template items
  const prepareExportData = () => {
    return templates.map((template) => ({
      ...template,
      itemCount: template.items.length,
    }));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cleaningChecklist.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cleaningChecklist.cleaningChecklist', 'Cleaning Checklist')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.cleaningChecklist.createTemplatesAndTrackCleaning', 'Create templates and track cleaning tasks')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="cleaning-checklist" toolName="Cleaning Checklist" />

              <SyncStatus
                isSynced={templatesSynced}
                isSaving={templatesSaving}
                lastSaved={templatesLastSaved}
                syncError={templatesSyncError}
                onForceSync={forceTemplatesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(prepareExportData(), TEMPLATE_COLUMNS, { filename: 'cleaning-checklists' })}
                onExportExcel={() => exportToExcel(prepareExportData(), TEMPLATE_COLUMNS, { filename: 'cleaning-checklists' })}
                onExportJSON={() => exportToJSON(prepareExportData(), { filename: 'cleaning-checklists' })}
                onExportPDF={async () => {
                  await exportToPDF(prepareExportData(), TEMPLATE_COLUMNS, {
                    filename: 'cleaning-checklists',
                    title: 'Cleaning Checklist Templates',
                    subtitle: `${templates.length} templates`,
                  });
                }}
                onPrint={() => printData(prepareExportData(), TEMPLATE_COLUMNS, { title: 'Cleaning Checklists' })}
                onCopyToClipboard={async () => await copyUtil(prepareExportData(), TEMPLATE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
              { id: 'active', label: `Active (${inProgressChecklists.length})`, icon: <Clock className="w-4 h-4" /> },
              { id: 'history', label: 'History', icon: <RotateCcw className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.cleaningChecklist.searchTemplates', 'Search templates...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-9 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.cleaningChecklist.allCategories', 'All Categories')}</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStartChecklistModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    {t('tools.cleaningChecklist.startChecklist', 'Start Checklist')}
                  </button>
                  <button
                    onClick={() => setShowTemplateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.cleaningChecklist.newTemplate', 'New Template')}
                  </button>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-8">
                  <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningChecklist.noTemplatesFoundCreateYour', 'No templates found. Create your first template to get started.')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {template.name}
                            </h3>
                            {template.isDefault && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category, theme)}`}>
                            {CATEGORIES.find((c) => c.value === template.category)?.label}
                          </span>
                        </div>
                        {!template.isDefault && (
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {template.description && (
                        <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {template.description}
                        </p>
                      )}

                      <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-4 h-4" />
                          {template.items.length} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(template.estimatedTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                        <button
                          onClick={() => {
                            setStartChecklistData({ ...startChecklistData, templateId: template.id });
                            setShowStartChecklistModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0D9488] text-white text-sm rounded-lg hover:bg-[#0D9488]/90"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          {t('tools.cleaningChecklist.use', 'Use')}
                        </button>
                        <button
                          onClick={() => duplicateTemplate(template)}
                          className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          title={t('tools.cleaningChecklist.duplicate', 'Duplicate')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Tab */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {activeChecklistView ? (
              // Active Checklist View
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {activeChecklistView.templateName}
                    </CardTitle>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activeChecklistView.clientName && `${activeChecklistView.clientName} - `}
                      {activeChecklistView.propertyAddress || 'No address specified'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activeChecklistView.items.filter((i) => i.completed).length} / {activeChecklistView.items.length} completed
                    </span>
                    <button
                      onClick={() => setActiveChecklistView(null)}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className={`h-2 rounded-full mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
                      style={{
                        width: `${(activeChecklistView.items.filter((i) => i.completed).length / activeChecklistView.items.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Tasks by room */}
                  {ROOMS.filter((room) => activeChecklistView.items.some((i) => i.room === room)).map((room) => (
                    <div key={room} className="mb-4">
                      <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {room}
                      </h4>
                      <div className="space-y-2">
                        {activeChecklistView.items
                          .filter((item) => item.room === room)
                          .map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleItemCompletion(activeChecklistView.id, item.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                item.completed
                                  ? theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                                  : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              {item.completed ? (
                                <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Square className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                              )}
                              <span className={`flex-1 ${item.completed ? 'line-through opacity-60' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.task}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}

                  {/* Complete button */}
                  <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700">
                    <button
                      onClick={() => completeChecklist(activeChecklistView.id)}
                      disabled={activeChecklistView.items.some((i) => !i.completed && !i.skipped)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                        activeChecklistView.items.every((i) => i.completed || i.skipped)
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {t('tools.cleaningChecklist.completeChecklist', 'Complete Checklist')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // List of active checklists
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('tools.cleaningChecklist.activeChecklists', 'Active Checklists')}
                  </CardTitle>
                  <button
                    onClick={() => setShowStartChecklistModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.cleaningChecklist.startNew', 'Start New')}
                  </button>
                </CardHeader>
                <CardContent>
                  {inProgressChecklists.length === 0 ? (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.cleaningChecklist.noActiveChecklistsStartOne', 'No active checklists. Start one from a template.')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {inProgressChecklists.map((checklist) => {
                        const completed = checklist.items.filter((i) => i.completed).length;
                        const total = checklist.items.length;
                        const progress = (completed / total) * 100;
                        return (
                          <div
                            key={checklist.id}
                            onClick={() => setActiveChecklistView(checklist)}
                            className={`p-4 rounded-lg cursor-pointer border ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {checklist.templateName}
                                </h3>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {checklist.clientName || checklist.propertyAddress || 'No details'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {completed}/{total}
                                </span>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(checklist.date)}
                                </p>
                              </div>
                            </div>
                            <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div
                                className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.cleaningChecklist.completedChecklists', 'Completed Checklists')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedChecklists.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.cleaningChecklist.noCompletedChecklistsYet', 'No completed checklists yet.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {completedChecklists.slice().reverse().map((checklist) => (
                    <div
                      key={checklist.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {checklist.templateName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {checklist.clientName || checklist.propertyAddress || 'No details'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                          }`}>
                            {t('tools.cleaningChecklist.completed', 'Completed')}
                          </span>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(checklist.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Template Form Modal */}
        {showTemplateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cleaningChecklist.createChecklistTemplate', 'Create Checklist Template')}
                </h2>
                <button onClick={() => { setShowTemplateForm(false); resetTemplateForm(); }} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningChecklist.templateName', 'Template Name *')}
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cleaningChecklist.category', 'Category')}
                    </label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as ChecklistTemplate['category'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningChecklist.description', 'Description')}
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {/* Add Task Section */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.cleaningChecklist.addTasks', 'Add Tasks')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder={t('tools.cleaningChecklist.taskDescription', 'Task description')}
                      value={newItem.task}
                      onChange={(e) => setNewItem({ ...newItem, task: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                    <div className="flex gap-2">
                      <select
                        value={newItem.room}
                        onChange={(e) => setNewItem({ ...newItem, room: e.target.value })}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        {ROOMS.map((room) => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                      <button
                        onClick={addItemToTemplate}
                        className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task List */}
                {newTemplate.items && newTemplate.items.length > 0 && (
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Tasks ({newTemplate.items.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {newTemplate.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {item.task}
                            </span>
                            <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ({item.room})
                            </span>
                          </div>
                          <button
                            onClick={() => removeItemFromTemplate(item.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => { setShowTemplateForm(false); resetTemplateForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.cleaningChecklist.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addTemplate}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.cleaningChecklist.createTemplate', 'Create Template')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Checklist Modal */}
        {showStartChecklistModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cleaningChecklist.startChecklist2', 'Start Checklist')}
                </h2>
                <button onClick={() => setShowStartChecklistModal(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningChecklist.template', 'Template *')}
                  </label>
                  <select
                    value={startChecklistData.templateId}
                    onChange={(e) => setStartChecklistData({ ...startChecklistData, templateId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.cleaningChecklist.selectATemplate', 'Select a template')}</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.items.length} tasks)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningChecklist.clientName', 'Client Name')}
                  </label>
                  <input
                    type="text"
                    value={startChecklistData.clientName}
                    onChange={(e) => setStartChecklistData({ ...startChecklistData, clientName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cleaningChecklist.propertyAddress', 'Property Address')}
                  </label>
                  <input
                    type="text"
                    value={startChecklistData.propertyAddress}
                    onChange={(e) => setStartChecklistData({ ...startChecklistData, propertyAddress: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowStartChecklistModal(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.cleaningChecklist.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={startChecklist}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.cleaningChecklist.startChecklist3', 'Start Checklist')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.cleaningChecklist.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Create reusable cleaning checklists for different types of properties and services.
              Start a checklist for each job and track task completion in real-time.
            </p>
            <p>
              {t('tools.cleaningChecklist.allTemplatesAndCompletedChecklists', 'All templates and completed checklists are synced to your account.')}
            </p>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CleaningChecklistTool;
