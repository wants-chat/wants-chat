'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HeartPulse,
  FileText,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Copy,
  Printer,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  Droplets,
  Shield,
  Sun,
  Ban,
  Calendar,
  Star,
  Layers,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface AftercareInstructionToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type InstructionType = 'tattoo' | 'piercing' | 'touch_up' | 'cover_up' | 'removal';
type HealingPhase = 'initial' | 'peeling' | 'settling' | 'healed';

interface AftercareInstruction {
  id: string;
  title: string;
  type: InstructionType;
  description: string;
  isDefault: boolean;
  healingTimeline: string;
  phases: AftercarePhase[];
  dosList: string[];
  dontsList: string[];
  products: RecommendedProduct[];
  warningsSigns: string[];
  contactInfo: string;
  additionalNotes: string;
  usageCount: number;
  lastSentTo: string;
  createdAt: string;
  updatedAt: string;
}

interface AftercarePhase {
  id: string;
  name: string;
  phase: HealingPhase;
  duration: string;
  startDay: number;
  endDay: number;
  instructions: string[];
}

interface RecommendedProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface ClientAftercare {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  instructionId: string;
  instructionTitle: string;
  procedureDate: string;
  procedureType: InstructionType;
  bodyPlacement: string;
  artistName: string;
  sentAt: string;
  viewedAt: string | null;
  followUpDate: string;
  followUpCompleted: boolean;
  notes: string;
  createdAt: string;
}

// Constants
const INSTRUCTION_TYPES: { id: InstructionType; label: string; icon: React.ReactNode }[] = [
  { id: 'tattoo', label: 'Tattoo', icon: <HeartPulse className="w-4 h-4" /> },
  { id: 'piercing', label: 'Piercing', icon: <Star className="w-4 h-4" /> },
  { id: 'touch_up', label: 'Touch Up', icon: <Edit className="w-4 h-4" /> },
  { id: 'cover_up', label: 'Cover Up', icon: <Layers className="w-4 h-4" /> },
  { id: 'removal', label: 'Removal', icon: <Ban className="w-4 h-4" /> },
];

const HEALING_PHASES: { id: HealingPhase; label: string; color: string }[] = [
  { id: 'initial', label: 'Initial Healing', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'peeling', label: 'Peeling Phase', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 'settling', label: 'Settling Phase', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'healed', label: 'Fully Healed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
];

const DEFAULT_TATTOO_PHASES: AftercarePhase[] = [
  {
    id: 'phase-1',
    name: 'Initial Care',
    phase: 'initial',
    duration: 'Days 1-3',
    startDay: 1,
    endDay: 3,
    instructions: [
      'Leave bandage on for 2-4 hours after getting tattooed',
      'Wash gently with lukewarm water and fragrance-free soap',
      'Pat dry with clean paper towel - do not rub',
      'Apply thin layer of recommended aftercare product',
      'Wash and moisturize 2-3 times daily',
    ],
  },
  {
    id: 'phase-2',
    name: 'Peeling Phase',
    phase: 'peeling',
    duration: 'Days 4-14',
    startDay: 4,
    endDay: 14,
    instructions: [
      'Continue washing and moisturizing 2-3 times daily',
      'DO NOT pick or scratch at peeling skin',
      'Flaking is normal - let it fall off naturally',
      'Keep the area moisturized to reduce itching',
      'Avoid submerging in water (pools, baths, ocean)',
    ],
  },
  {
    id: 'phase-3',
    name: 'Settling Phase',
    phase: 'settling',
    duration: 'Days 15-30',
    startDay: 15,
    endDay: 30,
    instructions: [
      'Continue moisturizing 1-2 times daily',
      'Tattoo may appear cloudy or dull - this is normal',
      'Avoid direct sunlight and tanning',
      'Colors will settle and become vibrant again',
      'If any concerns, contact your artist',
    ],
  },
  {
    id: 'phase-4',
    name: 'Fully Healed',
    phase: 'healed',
    duration: 'After 30 days',
    startDay: 31,
    endDay: 60,
    instructions: [
      'Tattoo should be fully healed',
      'Apply sunscreen (SPF 30+) when exposed to sun',
      'Keep the skin moisturized for longevity',
      'Schedule touch-up if needed (usually after 4-6 weeks)',
      'Enjoy your new tattoo!',
    ],
  },
];

const DEFAULT_DOS = [
  'Wash hands before touching your tattoo',
  'Use fragrance-free, gentle soap',
  'Apply thin layers of aftercare product',
  'Wear loose, clean clothing over the area',
  'Stay hydrated and get enough rest',
  'Keep the area clean and dry',
];

const DEFAULT_DONTS = [
  "Don't submerge in water (pools, baths, hot tubs, ocean)",
  "Don't expose to direct sunlight or tanning beds",
  "Don't pick, scratch, or peel flaking skin",
  "Don't apply too much moisturizer",
  "Don't wear tight clothing over the tattoo",
  "Don't let pets sleep on or lick the tattoo",
  "Don't exercise heavily for the first few days",
];

const DEFAULT_WARNINGS = [
  'Excessive redness or swelling after 48 hours',
  'Pus or discharge (clear lymph fluid is normal)',
  'Fever or chills',
  'Red streaking around the tattoo',
  'Extreme pain that increases over time',
  'Allergic reaction (hives, difficulty breathing)',
];

// Column configuration for exports
const INSTRUCTION_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'healingTimeline', header: 'Healing Time', type: 'string' },
  { key: 'usageCount', header: 'Times Used', type: 'number' },
  { key: 'isDefault', header: 'Default', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'instructionTitle', header: 'Instruction Set', type: 'string' },
  { key: 'procedureType', header: 'Procedure', type: 'string' },
  { key: 'procedureDate', header: 'Procedure Date', type: 'date' },
  { key: 'artistName', header: 'Artist', type: 'string' },
  { key: 'sentAt', header: 'Sent At', type: 'date' },
  { key: 'followUpDate', header: 'Follow-up', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const AftercareInstructionTool: React.FC<AftercareInstructionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: instructions,
    addItem: addInstructionToBackend,
    updateItem: updateInstructionBackend,
    deleteItem: deleteInstructionBackend,
    isSynced: instructionsSynced,
    isSaving: instructionsSaving,
    lastSaved: instructionsLastSaved,
    syncError: instructionsSyncError,
    forceSync: forceInstructionsSync,
  } = useToolData<AftercareInstruction>('aftercare-instructions', [], INSTRUCTION_COLUMNS);

  const {
    data: clientAftercares,
    addItem: addClientAftercareToBackend,
    updateItem: updateClientAftercareBackend,
    deleteItem: deleteClientAftercareBackend,
  } = useToolData<ClientAftercare>('client-aftercares', [], CLIENT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'templates' | 'sent' | 'create'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<AftercareInstruction | null>(null);
  const [viewingInstruction, setViewingInstruction] = useState<AftercareInstruction | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedInstructionForSend, setSelectedInstructionForSend] = useState<AftercareInstruction | null>(null);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        setNewInstruction({
          title: params.title || '',
          type: params.type || 'tattoo',
          description: params.description || '',
          isDefault: params.isDefault || false,
          healingTimeline: params.healingTimeline || '4-6 weeks',
          phases: params.phases || DEFAULT_TATTOO_PHASES,
          dosList: params.dosList || DEFAULT_DOS,
          dontsList: params.dontsList || DEFAULT_DONTS,
          products: params.products || [],
          warningsSigns: params.warningsSigns || DEFAULT_WARNINGS,
          contactInfo: params.contactInfo || '',
          additionalNotes: params.additionalNotes || '',
          usageCount: params.usageCount || 0,
          lastSentTo: params.lastSentTo || '',
        });
        setShowForm(true);
        setIsEditFromGallery(true);
      } else if (params.title || params.type) {
        // Regular prefill from AI
        setNewInstruction(prev => ({
          ...prev,
          title: params.title || '',
          type: params.type || 'tattoo',
          description: params.description || '',
        }));
        setShowForm(true);
      }
    }
  }, [uiConfig?.params]);

  // New instruction form state
  const [newInstruction, setNewInstruction] = useState<Partial<AftercareInstruction>>({
    title: '',
    type: 'tattoo',
    description: '',
    isDefault: false,
    healingTimeline: '4-6 weeks',
    phases: DEFAULT_TATTOO_PHASES,
    dosList: DEFAULT_DOS,
    dontsList: DEFAULT_DONTS,
    products: [],
    warningsSigns: DEFAULT_WARNINGS,
    contactInfo: '',
    additionalNotes: '',
    usageCount: 0,
    lastSentTo: '',
  });

  // Send form state
  const [sendForm, setSendForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    procedureDate: new Date().toISOString().split('T')[0],
    bodyPlacement: '',
    artistName: '',
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  // Filtered instructions
  const filteredInstructions = useMemo(() => {
    return instructions.filter(inst => {
      const matchesSearch =
        inst.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || inst.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [instructions, searchTerm, filterType]);

  // Stats
  const stats = useMemo(() => {
    const totalTemplates = instructions.length;
    const totalSent = clientAftercares.length;
    const pendingFollowups = clientAftercares.filter(
      c => !c.followUpCompleted && new Date(c.followUpDate) <= new Date()
    ).length;

    return { totalTemplates, totalSent, pendingFollowups };
  }, [instructions, clientAftercares]);

  // Save instruction
  const handleSaveInstruction = async () => {
    if (!newInstruction.title) return;

    const now = new Date().toISOString();

    if (editingInstruction) {
      const updated: AftercareInstruction = {
        ...editingInstruction,
        ...newInstruction as AftercareInstruction,
        updatedAt: now,
      };
      await updateInstructionBackend(updated);
      setEditingInstruction(null);
    } else {
      const instruction: AftercareInstruction = {
        id: generateId(),
        ...newInstruction as AftercareInstruction,
        createdAt: now,
        updatedAt: now,
      };
      await addInstructionToBackend(instruction);
    }

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'aftercare-instruction',
        title: newInstruction.title,
        type: newInstruction.type,
        description: newInstruction.description,
        isDefault: newInstruction.isDefault,
        healingTimeline: newInstruction.healingTimeline,
        phases: newInstruction.phases,
        dosList: newInstruction.dosList,
        dontsList: newInstruction.dontsList,
        products: newInstruction.products,
        warningsSigns: newInstruction.warningsSigns,
        contactInfo: newInstruction.contactInfo,
        additionalNotes: newInstruction.additionalNotes,
      });
    }

    setShowForm(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setNewInstruction({
      title: '',
      type: 'tattoo',
      description: '',
      isDefault: false,
      healingTimeline: '4-6 weeks',
      phases: DEFAULT_TATTOO_PHASES,
      dosList: DEFAULT_DOS,
      dontsList: DEFAULT_DONTS,
      products: [],
      warningsSigns: DEFAULT_WARNINGS,
      contactInfo: '',
      additionalNotes: '',
      usageCount: 0,
      lastSentTo: '',
    });
  };

  // Edit instruction
  const handleEditInstruction = (instruction: AftercareInstruction) => {
    setEditingInstruction(instruction);
    setNewInstruction(instruction);
    setShowForm(true);
  };

  // Delete instruction
  const handleDeleteInstruction = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Aftercare Instructions',
      message: 'Are you sure you want to delete this aftercare instruction set? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteInstructionBackend(id);
    }
  };

  // Handle send instruction
  const handleOpenSendModal = (instruction: AftercareInstruction) => {
    setSelectedInstructionForSend(instruction);
    setShowSendModal(true);
  };

  const handleSendInstruction = async () => {
    if (!selectedInstructionForSend || !sendForm.clientName || !sendForm.clientEmail) return;

    const now = new Date().toISOString();

    const clientAftercare: ClientAftercare = {
      id: generateId(),
      clientId: generateId(),
      clientName: sendForm.clientName,
      clientEmail: sendForm.clientEmail,
      clientPhone: sendForm.clientPhone,
      instructionId: selectedInstructionForSend.id,
      instructionTitle: selectedInstructionForSend.title,
      procedureDate: sendForm.procedureDate,
      procedureType: selectedInstructionForSend.type,
      bodyPlacement: sendForm.bodyPlacement,
      artistName: sendForm.artistName,
      sentAt: now,
      viewedAt: null,
      followUpDate: sendForm.followUpDate,
      followUpCompleted: false,
      notes: sendForm.notes,
      createdAt: now,
    };

    await addClientAftercareToBackend(clientAftercare);

    // Update usage count
    const updatedInstruction = {
      ...selectedInstructionForSend,
      usageCount: selectedInstructionForSend.usageCount + 1,
      lastSentTo: sendForm.clientName,
      updatedAt: now,
    };
    await updateInstructionBackend(updatedInstruction);

    setShowSendModal(false);
    setSendForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      procedureDate: new Date().toISOString().split('T')[0],
      bodyPlacement: '',
      artistName: '',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setSelectedInstructionForSend(null);
  };

  // Duplicate instruction
  const handleDuplicateInstruction = async (instruction: AftercareInstruction) => {
    const now = new Date().toISOString();
    const duplicated: AftercareInstruction = {
      ...instruction,
      id: generateId(),
      title: `${instruction.title} (Copy)`,
      isDefault: false,
      usageCount: 0,
      lastSentTo: '',
      createdAt: now,
      updatedAt: now,
    };
    await addInstructionToBackend(duplicated);
  };

  // Add/Remove list items
  const addListItem = (field: 'dosList' | 'dontsList' | 'warningsSigns') => {
    const newItem = prompt(`Add new ${field === 'dosList' ? 'do' : field === 'dontsList' ? "don't" : 'warning sign'}:`);
    if (newItem) {
      setNewInstruction(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), newItem],
      }));
    }
  };

  const removeListItem = (field: 'dosList' | 'dontsList' | 'warningsSigns', index: number) => {
    setNewInstruction(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = activeTab === 'templates'
      ? filteredInstructions.map(inst => ({ ...inst, isDefault: inst.isDefault ? 'Yes' : 'No' }))
      : clientAftercares;

    const columns = activeTab === 'templates' ? INSTRUCTION_COLUMNS : CLIENT_COLUMNS;
    const filename = activeTab === 'templates' ? 'aftercare-instructions' : 'sent-aftercare';

    switch (format) {
      case 'csv':
        exportToCSV(exportData, columns, filename);
        break;
      case 'excel':
        exportToExcel(exportData, columns, filename);
        break;
      case 'json':
        exportToJSON(exportData, filename);
        break;
      case 'pdf':
        exportToPDF(exportData, columns, activeTab === 'templates' ? 'Aftercare Instructions' : 'Sent Aftercare Records');
        break;
    }
  };

  const getTypeLabel = (type: InstructionType) => {
    return INSTRUCTION_TYPES.find(t => t.id === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-green-600" />
              {t('tools.aftercareInstruction.aftercareInstructions', 'Aftercare Instructions')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.aftercareInstruction.createAndManageAftercareInstructions', 'Create and manage aftercare instructions for clients')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="aftercare-instruction" toolName="Aftercare Instruction" />

            <SyncStatus
              isSynced={instructionsSynced}
              isSaving={instructionsSaving}
              lastSaved={instructionsLastSaved}
              syncError={instructionsSyncError}
              onForceSync={forceInstructionsSync}
            />
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => { setShowForm(true); setEditingInstruction(null); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.aftercareInstruction.createTemplate', 'Create Template')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.aftercareInstruction.instructionTemplates', 'Instruction Templates')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTemplates}</p>
                </div>
                <FileText className="w-8 h-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.aftercareInstruction.sentToClients', 'Sent to Clients')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSent}</p>
                </div>
                <Send className="w-8 h-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.aftercareInstruction.pendingFollowUps', 'Pending Follow-ups')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingFollowups}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t('tools.aftercareInstruction.templates', 'Templates')}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t('tools.aftercareInstruction.sentHistory', 'Sent History')}
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.aftercareInstruction.searchTemplates', 'Search templates...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">{t('tools.aftercareInstruction.allTypes', 'All Types')}</option>
                    {INSTRUCTION_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructions.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  {t('tools.aftercareInstruction.noInstructionTemplatesFoundCreate', 'No instruction templates found. Create your first template!')}
                </div>
              ) : (
                filteredInstructions.map(instruction => (
                  <Card key={instruction.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            instruction.type === 'tattoo' ? 'bg-purple-100 dark:bg-purple-900/30' :
                            instruction.type === 'piercing' ? 'bg-pink-100 dark:bg-pink-900/30' :
                            'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <HeartPulse className={`w-5 h-5 ${
                              instruction.type === 'tattoo' ? 'text-purple-600' :
                              instruction.type === 'piercing' ? 'text-pink-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{instruction.title}</CardTitle>
                            <p className="text-sm text-gray-500 capitalize">{getTypeLabel(instruction.type)}</p>
                          </div>
                        </div>
                        {instruction.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                            {t('tools.aftercareInstruction.default', 'Default')}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {instruction.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {instruction.healingTimeline}
                        </span>
                        <span className="flex items-center gap-1">
                          <Send className="w-4 h-4" />
                          Used {instruction.usageCount}x
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setViewingInstruction(instruction)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() => handleOpenSendModal(instruction)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50"
                        >
                          <Send className="w-4 h-4" /> Send
                        </button>
                        <button
                          onClick={() => handleEditInstruction(instruction)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateInstruction(instruction)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstruction(instruction.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Sent History Tab */}
        {activeTab === 'sent' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.aftercareInstruction.client', 'Client')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.aftercareInstruction.template', 'Template')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.aftercareInstruction.procedure', 'Procedure')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.aftercareInstruction.sent', 'Sent')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.aftercareInstruction.followUp', 'Follow-up')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.aftercareInstruction.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {clientAftercares.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('tools.aftercareInstruction.noAftercareInstructionsSentYet', 'No aftercare instructions sent yet.')}
                        </td>
                      </tr>
                    ) : (
                      clientAftercares.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{record.clientName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{record.clientEmail}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-900 dark:text-white">{record.instructionTitle}</td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-gray-900 dark:text-white capitalize">{record.procedureType}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{record.bodyPlacement}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-900 dark:text-white">{formatDate(record.sentAt)}</td>
                          <td className="px-4 py-4 text-gray-900 dark:text-white">{formatDate(record.followUpDate)}</td>
                          <td className="px-4 py-4">
                            {record.followUpCompleted ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" /> Complete
                              </span>
                            ) : new Date(record.followUpDate) <= new Date() ? (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <AlertTriangle className="w-4 h-4" /> Due
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Template Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingInstruction ? t('tools.aftercareInstruction.editTemplate', 'Edit Template') : t('tools.aftercareInstruction.createAftercareTemplate', 'Create Aftercare Template')}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.title', 'Title *')}</label>
                    <input
                      type="text"
                      value={newInstruction.title || ''}
                      onChange={(e) => setNewInstruction({ ...newInstruction, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.aftercareInstruction.eGStandardTattooAftercare', 'e.g., Standard Tattoo Aftercare')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.type', 'Type')}</label>
                    <select
                      value={newInstruction.type || 'tattoo'}
                      onChange={(e) => setNewInstruction({ ...newInstruction, type: e.target.value as InstructionType })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {INSTRUCTION_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.healingTimeline', 'Healing Timeline')}</label>
                    <input
                      type="text"
                      value={newInstruction.healingTimeline || ''}
                      onChange={(e) => setNewInstruction({ ...newInstruction, healingTimeline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.aftercareInstruction.eG46Weeks', 'e.g., 4-6 weeks')}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newInstruction.isDefault || false}
                        onChange={(e) => setNewInstruction({ ...newInstruction, isDefault: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.aftercareInstruction.setAsDefaultTemplate', 'Set as default template')}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.description', 'Description')}</label>
                  <textarea
                    value={newInstruction.description || ''}
                    onChange={(e) => setNewInstruction({ ...newInstruction, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.aftercareInstruction.briefDescriptionOfThisAftercare', 'Brief description of this aftercare template...')}
                  />
                </div>

                {/* Do's List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Do's
                    </label>
                    <button
                      type="button"
                      onClick={() => addListItem('dosList')}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      {t('tools.aftercareInstruction.add', '+ Add')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newInstruction.dosList?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeListItem('dosList', idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Don'ts List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-600" /> Don'ts
                    </label>
                    <button
                      type="button"
                      onClick={() => addListItem('dontsList')}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('tools.aftercareInstruction.add2', '+ Add')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newInstruction.dontsList?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeListItem('dontsList', idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning Signs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" /> Warning Signs
                    </label>
                    <button
                      type="button"
                      onClick={() => addListItem('warningsSigns')}
                      className="text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      {t('tools.aftercareInstruction.add3', '+ Add')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newInstruction.warningsSigns?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeListItem('warningsSigns', idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.contactInfo', 'Contact Info')}</label>
                  <textarea
                    value={newInstruction.contactInfo || ''}
                    onChange={(e) => setNewInstruction({ ...newInstruction, contactInfo: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.aftercareInstruction.studioContactInformationForQuestions', 'Studio contact information for questions...')}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => { setShowForm(false); setEditingInstruction(null); resetForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('tools.aftercareInstruction.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveInstruction}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingInstruction ? t('tools.aftercareInstruction.updateTemplate', 'Update Template') : t('tools.aftercareInstruction.createTemplate2', 'Create Template')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Template Modal */}
        {viewingInstruction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{viewingInstruction.title}</h2>
                  <p className="text-sm text-gray-500 capitalize mt-1">{getTypeLabel(viewingInstruction.type)} - {viewingInstruction.healingTimeline}</p>
                </div>
                <button onClick={() => setViewingInstruction(null)} className="text-gray-500 hover:text-gray-700">
                  <Ban className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {viewingInstruction.description && (
                  <p className="text-gray-600 dark:text-gray-400">{viewingInstruction.description}</p>
                )}

                {/* Phases */}
                {viewingInstruction.phases.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('tools.aftercareInstruction.healingPhases', 'Healing Phases')}</h3>
                    <div className="space-y-4">
                      {viewingInstruction.phases.map(phase => (
                        <div key={phase.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              HEALING_PHASES.find(p => p.id === phase.phase)?.color
                            }`}>
                              {phase.duration}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">{phase.name}</span>
                          </div>
                          <ul className="space-y-1">
                            {phase.instructions.map((inst, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {inst}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Do's */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Do's
                  </h3>
                  <ul className="space-y-1">
                    {viewingInstruction.dosList.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-600" /> Don'ts
                  </h3>
                  <ul className="space-y-1">
                    {viewingInstruction.dontsList.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning Signs */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> When to Contact Us
                  </h3>
                  <ul className="space-y-1">
                    {viewingInstruction.warningsSigns.map((item, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                        <span>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setViewingInstruction(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('tools.aftercareInstruction.close', 'Close')}
                </button>
                <button
                  onClick={() => { handleOpenSendModal(viewingInstruction); setViewingInstruction(null); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send to Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Modal */}
        {showSendModal && selectedInstructionForSend && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tools.aftercareInstruction.sendAftercareInstructions', 'Send Aftercare Instructions')}</h2>
                <p className="text-sm text-gray-500 mt-1">Sending: {selectedInstructionForSend.title}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.clientName', 'Client Name *')}</label>
                    <input
                      type="text"
                      value={sendForm.clientName}
                      onChange={(e) => setSendForm({ ...sendForm, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.email', 'Email *')}</label>
                    <input
                      type="email"
                      value={sendForm.clientEmail}
                      onChange={(e) => setSendForm({ ...sendForm, clientEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.procedureDate', 'Procedure Date')}</label>
                    <input
                      type="date"
                      value={sendForm.procedureDate}
                      onChange={(e) => setSendForm({ ...sendForm, procedureDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.followUpDate', 'Follow-up Date')}</label>
                    <input
                      type="date"
                      value={sendForm.followUpDate}
                      onChange={(e) => setSendForm({ ...sendForm, followUpDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.bodyPlacement', 'Body Placement')}</label>
                    <input
                      type="text"
                      value={sendForm.bodyPlacement}
                      onChange={(e) => setSendForm({ ...sendForm, bodyPlacement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.aftercareInstruction.eGLeftForearm', 'e.g., Left forearm')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.artistName', 'Artist Name')}</label>
                    <input
                      type="text"
                      value={sendForm.artistName}
                      onChange={(e) => setSendForm({ ...sendForm, artistName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.aftercareInstruction.notes', 'Notes')}</label>
                  <textarea
                    value={sendForm.notes}
                    onChange={(e) => setSendForm({ ...sendForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.aftercareInstruction.anyAdditionalNotes', 'Any additional notes...')}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => { setShowSendModal(false); setSelectedInstructionForSend(null); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('tools.aftercareInstruction.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSendInstruction}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Instructions
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default AftercareInstructionTool;
