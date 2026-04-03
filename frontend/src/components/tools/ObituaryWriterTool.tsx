'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
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
import {
  FileText,
  User,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Users,
  BookOpen,
  Camera,
  Plus,
  Trash2,
  Copy,
  Printer,
  Download,
  Edit,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Wand2,
  RotateCcw,
} from 'lucide-react';

// Types
interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  status: 'living' | 'deceased' | 'predeceased';
  location?: string;
}

interface Publication {
  id: string;
  name: string;
  publishDate: string;
  submitted: boolean;
  confirmed: boolean;
  cost: number;
}

interface Obituary {
  id: string;
  caseNumber: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  // Deceased Information
  deceased: {
    firstName: string;
    middleName: string;
    lastName: string;
    maidenName: string;
    nickname: string;
    dateOfBirth: string;
    dateOfDeath: string;
    age: string;
    birthplace: string;
    residence: string;
    placeOfDeath: string;
  };
  // Life Details
  education: string;
  occupation: string;
  militaryService: string;
  hobbies: string;
  achievements: string;
  memberships: string;
  religiousAffiliation: string;
  // Family
  familyMembers: FamilyMember[];
  // Service Information
  serviceInfo: string;
  donations: string;
  // Obituary Content
  obituaryText: string;
  photoCaption: string;
  // Publications
  publications: Publication[];
  // Meta
  wordCount: number;
  characterCount: number;
  approvedBy: string;
  approvalDate: string;
}

// Column configuration for export
const obituaryColumns: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'deceasedName', header: 'Deceased', type: 'string' },
  { key: 'dateOfDeath', header: 'Date of Death', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'wordCount', header: 'Words', type: 'number' },
  { key: 'publicationsCount', header: 'Publications', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  published: { label: 'Published', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
};

const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `OB-${year}-${random}`;
};

const createEmptyObituary = (): Obituary => ({
  id: crypto.randomUUID(),
  caseNumber: generateCaseNumber(),
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deceased: {
    firstName: '',
    middleName: '',
    lastName: '',
    maidenName: '',
    nickname: '',
    dateOfBirth: '',
    dateOfDeath: '',
    age: '',
    birthplace: '',
    residence: '',
    placeOfDeath: '',
  },
  education: '',
  occupation: '',
  militaryService: '',
  hobbies: '',
  achievements: '',
  memberships: '',
  religiousAffiliation: '',
  familyMembers: [],
  serviceInfo: '',
  donations: '',
  obituaryText: '',
  photoCaption: '',
  publications: [],
  wordCount: 0,
  characterCount: 0,
  approvedBy: '',
  approvalDate: '',
});

// Obituary template generator
const generateObituaryTemplate = (obit: Obituary): string => {
  const { deceased, familyMembers, education, occupation, militaryService, hobbies, achievements, memberships, religiousAffiliation, serviceInfo, donations } = obit;

  const fullName = [deceased.firstName, deceased.middleName, deceased.lastName].filter(Boolean).join(' ');
  const living = familyMembers.filter(f => f.status === 'living');
  const predeceased = familyMembers.filter(f => f.status === 'predeceased');

  let template = '';

  // Opening
  if (fullName && deceased.dateOfDeath) {
    const deathDate = new Date(deceased.dateOfDeath).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    template += `${fullName}`;
    if (deceased.nickname) template += ` "${deceased.nickname}"`;
    if (deceased.maidenName) template += ` (nee ${deceased.maidenName})`;
    template += `, ${deceased.age ? deceased.age + ', ' : ''}passed away peacefully on ${deathDate}`;
    if (deceased.placeOfDeath) template += ` in ${deceased.placeOfDeath}`;
    template += '.\n\n';
  }

  // Birth and early life
  if (deceased.dateOfBirth || deceased.birthplace) {
    template += `${deceased.firstName} was born`;
    if (deceased.dateOfBirth) {
      const birthDate = new Date(deceased.dateOfBirth).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      });
      template += ` on ${birthDate}`;
    }
    if (deceased.birthplace) template += ` in ${deceased.birthplace}`;
    template += '.\n\n';
  }

  // Education
  if (education) {
    template += `${deceased.firstName} ${education}\n\n`;
  }

  // Career
  if (occupation) {
    template += `Professionally, ${deceased.firstName.toLowerCase() === 'she' ? 'she' : 'he'} ${occupation}\n\n`;
  }

  // Military
  if (militaryService) {
    template += `${deceased.firstName} proudly served ${militaryService}\n\n`;
  }

  // Memberships and affiliations
  if (memberships || religiousAffiliation) {
    template += `${deceased.firstName} was an active member of `;
    const affiliations = [religiousAffiliation, memberships].filter(Boolean);
    template += affiliations.join(' and ') + '.\n\n';
  }

  // Hobbies and interests
  if (hobbies) {
    template += `${deceased.firstName} enjoyed ${hobbies}\n\n`;
  }

  // Achievements
  if (achievements) {
    template += `Notable achievements include ${achievements}\n\n`;
  }

  // Survivors
  if (living.length > 0) {
    template += `${deceased.firstName} is survived by `;
    const survivors = living.map(f => `${f.relationship} ${f.name}${f.location ? ` of ${f.location}` : ''}`);
    template += survivors.join('; ') + '.\n\n';
  }

  // Predeceased
  if (predeceased.length > 0) {
    template += `${deceased.firstName} was preceded in death by `;
    const predeceasedList = predeceased.map(f => `${f.relationship} ${f.name}`);
    template += predeceasedList.join('; ') + '.\n\n';
  }

  // Service information
  if (serviceInfo) {
    template += `${serviceInfo}\n\n`;
  }

  // Memorial contributions
  if (donations) {
    template += `In lieu of flowers, memorial contributions may be made to ${donations}\n`;
  }

  return template.trim();
};

interface ObituaryWriterToolProps {
  uiConfig?: UIConfig;
}

export const ObituaryWriterTool: React.FC<ObituaryWriterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedObituaryId, setSelectedObituaryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'family' | 'content' | 'publish'>('info');
  const [showPreview, setShowPreview] = useState(false);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);

  // Initialize useToolData hook for backend persistence
  const {
    data: obituaries,
    updateItem,
    addItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Obituary>(
    'obituary-writer',
    [],
    obituaryColumns,
    { autoSave: true }
  );

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName || params.lastName || params.name) {
        const newObituary = createEmptyObituary();
        if (params.name) {
          const nameParts = params.name.split(' ');
          newObituary.deceased.firstName = nameParts[0] || '';
          newObituary.deceased.lastName = nameParts.slice(1).join(' ') || '';
        } else {
          newObituary.deceased.firstName = params.firstName || '';
          newObituary.deceased.lastName = params.lastName || '';
        }
        if (params.dateOfDeath) newObituary.deceased.dateOfDeath = params.dateOfDeath;
        addItem(newObituary);
        setSelectedObituaryId(newObituary.id);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const selectedObituary = obituaries.find(o => o.id === selectedObituaryId);

  // Obituary operations
  const handleCreateObituary = () => {
    const newObituary = createEmptyObituary();
    addItem(newObituary);
    setSelectedObituaryId(newObituary.id);
  };

  const handleUpdateObituary = (updates: Partial<Obituary>) => {
    if (!selectedObituary) return;

    // Calculate word/character counts if obituary text changed
    let additionalUpdates: Partial<Obituary> = {};
    if (updates.obituaryText !== undefined) {
      const text = updates.obituaryText;
      additionalUpdates = {
        wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
        characterCount: text.length,
      };
    }

    updateItem(selectedObituary.id, {
      ...selectedObituary,
      ...updates,
      ...additionalUpdates,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteObituary = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this obituary?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedObituaryId === id) setSelectedObituaryId(null);
    }
  };

  // Family member operations
  const handleAddFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    if (!selectedObituary) return;
    const newMember: FamilyMember = { ...member, id: crypto.randomUUID() };
    handleUpdateObituary({ familyMembers: [...selectedObituary.familyMembers, newMember] });
    setShowFamilyForm(false);
  };

  const handleDeleteFamilyMember = (memberId: string) => {
    if (!selectedObituary) return;
    handleUpdateObituary({
      familyMembers: selectedObituary.familyMembers.filter(m => m.id !== memberId),
    });
  };

  // Publication operations
  const handleAddPublication = (pub: Omit<Publication, 'id'>) => {
    if (!selectedObituary) return;
    const newPub: Publication = { ...pub, id: crypto.randomUUID() };
    handleUpdateObituary({ publications: [...selectedObituary.publications, newPub] });
    setShowPublicationForm(false);
  };

  const handleUpdatePublication = (pubId: string, updates: Partial<Publication>) => {
    if (!selectedObituary) return;
    handleUpdateObituary({
      publications: selectedObituary.publications.map(p =>
        p.id === pubId ? { ...p, ...updates } : p
      ),
    });
  };

  const handleDeletePublication = (pubId: string) => {
    if (!selectedObituary) return;
    handleUpdateObituary({
      publications: selectedObituary.publications.filter(p => p.id !== pubId),
    });
  };

  // Generate obituary from template
  const handleGenerateObituary = () => {
    if (!selectedObituary) return;
    const template = generateObituaryTemplate(selectedObituary);
    handleUpdateObituary({ obituaryText: template });
  };

  // Copy obituary to clipboard
  const handleCopyObituary = () => {
    if (!selectedObituary?.obituaryText) return;
    navigator.clipboard.writeText(selectedObituary.obituaryText);
  };

  // Export data
  const getExportData = () => {
    return obituaries.map(o => ({
      caseNumber: o.caseNumber,
      deceasedName: `${o.deceased.firstName} ${o.deceased.lastName}`.trim(),
      dateOfDeath: o.deceased.dateOfDeath,
      status: statusConfig[o.status].label,
      wordCount: o.wordCount,
      publicationsCount: o.publications.length,
      createdAt: o.createdAt,
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-amber-500" />
              Obituary Writer
              {isPrefilled && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-filled
                </span>
              )}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.obituaryWriter.createAndManageObituariesFor', 'Create and manage obituaries for publication')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="obituary-writer" toolName="Obituary Writer" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              data={getExportData()}
              columns={obituaryColumns}
              filename="obituaries"
              onExportCSV={() => exportToCSV(getExportData(), obituaryColumns, 'obituaries')}
              onExportExcel={() => exportToExcel(getExportData(), obituaryColumns, 'obituaries')}
              onExportJSON={() => exportToJSON(getExportData(), 'obituaries')}
              onExportPDF={() => exportToPDF(getExportData(), obituaryColumns, 'obituaries', 'Obituaries')}
              onCopy={() => copyUtil(getExportData(), obituaryColumns)}
              onPrint={() => printData(getExportData(), obituaryColumns, 'Obituaries')}
            />
            <button
              onClick={handleCreateObituary}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.obituaryWriter.newObituary', 'New Obituary')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Obituaries List */}
          <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Obituaries ({obituaries.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {obituaries.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.obituaryWriter.noObituaries', 'No obituaries')}</p>
                  <button onClick={handleCreateObituary} className="mt-2 text-amber-600 hover:underline text-sm">
                    {t('tools.obituaryWriter.createYourFirstObituary', 'Create your first obituary')}
                  </button>
                </div>
              ) : (
                obituaries.map((obit) => (
                  <div
                    key={obit.id}
                    onClick={() => setSelectedObituaryId(obit.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedObituaryId === obit.id
                        ? theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {obit.deceased.firstName} {obit.deceased.lastName || 'Unnamed'}
                        </p>
                        <p className="text-xs text-gray-500">{obit.caseNumber}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[obit.status].color}`}>
                        {statusConfig[obit.status].label}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {obit.wordCount} words
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Obituary Editor */}
          <div className={`lg:col-span-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {selectedObituary ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {selectedObituary.deceased.firstName} {selectedObituary.deceased.lastName || 'New Obituary'}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedObituary.caseNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedObituary.status}
                      onChange={(e) => handleUpdateObituary({ status: e.target.value as Obituary['status'] })}
                      className={`text-sm px-3 py-1.5 rounded border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteObituary(selectedObituary.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    {(['info', 'family', 'content', 'publish'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab === 'info' ? 'Information' : tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {activeTab === 'info' && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.firstName', 'First Name')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.firstName}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, firstName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.middleName', 'Middle Name')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.middleName}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, middleName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.lastName', 'Last Name')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.lastName}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, lastName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.maidenName', 'Maiden Name')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.maidenName}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, maidenName: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.nickname', 'Nickname')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.nickname}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, nickname: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.age', 'Age')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.age}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, age: e.target.value }
                              })}
                              placeholder="e.g., 78"
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dates and Places */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Dates & Places
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.dateOfBirth', 'Date of Birth')}</label>
                            <input
                              type="date"
                              value={selectedObituary.deceased.dateOfBirth}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, dateOfBirth: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.dateOfDeath', 'Date of Death')}</label>
                            <input
                              type="date"
                              value={selectedObituary.deceased.dateOfDeath}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, dateOfDeath: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.birthplace', 'Birthplace')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.birthplace}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, birthplace: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.residence', 'Residence')}</label>
                            <input
                              type="text"
                              value={selectedObituary.deceased.residence}
                              onChange={(e) => handleUpdateObituary({
                                deceased: { ...selectedObituary.deceased, residence: e.target.value }
                              })}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Life Details */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Life Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.education', 'Education')}</label>
                            <textarea
                              value={selectedObituary.education}
                              onChange={(e) => handleUpdateObituary({ education: e.target.value })}
                              placeholder={t('tools.obituaryWriter.eGGraduatedFromXyz', 'e.g., graduated from XYZ University in 1965')}
                              className={`w-full px-3 py-2 rounded-lg border resize-none ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.occupationCareer', 'Occupation/Career')}</label>
                            <textarea
                              value={selectedObituary.occupation}
                              onChange={(e) => handleUpdateObituary({ occupation: e.target.value })}
                              placeholder={t('tools.obituaryWriter.eGWorkedAsAn', 'e.g., worked as an engineer for 35 years')}
                              className={`w-full px-3 py-2 rounded-lg border resize-none ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.militaryService', 'Military Service')}</label>
                            <textarea
                              value={selectedObituary.militaryService}
                              onChange={(e) => handleUpdateObituary({ militaryService: e.target.value })}
                              placeholder={t('tools.obituaryWriter.eGInTheU', 'e.g., in the U.S. Army during the Vietnam War')}
                              className={`w-full px-3 py-2 rounded-lg border resize-none ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('tools.obituaryWriter.hobbiesInterests', 'Hobbies & Interests')}</label>
                            <textarea
                              value={selectedObituary.hobbies}
                              onChange={(e) => handleUpdateObituary({ hobbies: e.target.value })}
                              placeholder={t('tools.obituaryWriter.eGGardeningFishingAnd', 'e.g., gardening, fishing, and spending time with grandchildren')}
                              className={`w-full px-3 py-2 rounded-lg border resize-none ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'family' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Family Members ({selectedObituary.familyMembers.length})</h3>
                        <button
                          onClick={() => setShowFamilyForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                          <Plus className="w-4 h-4" /> Add Family Member
                        </button>
                      </div>

                      {showFamilyForm && (
                        <FamilyMemberForm
                          onSubmit={handleAddFamilyMember}
                          onCancel={() => setShowFamilyForm(false)}
                          theme={theme}
                        />
                      )}

                      <div className="space-y-2">
                        {selectedObituary.familyMembers.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.obituaryWriter.noFamilyMembersAdded', 'No family members added')}</p>
                        ) : (
                          <>
                            {/* Living */}
                            {selectedObituary.familyMembers.filter(f => f.status === 'living').length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('tools.obituaryWriter.survivedBy', 'Survived By')}</h4>
                                {selectedObituary.familyMembers.filter(f => f.status === 'living').map((member) => (
                                  <div
                                    key={member.id}
                                    className={`p-3 rounded-lg mb-2 flex justify-between items-center ${
                                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}
                                  >
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {member.relationship}{member.location ? ` - ${member.location}` : ''}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteFamilyMember(member.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Predeceased */}
                            {selectedObituary.familyMembers.filter(f => f.status === 'predeceased').length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('tools.obituaryWriter.precededInDeathBy', 'Preceded in Death By')}</h4>
                                {selectedObituary.familyMembers.filter(f => f.status === 'predeceased').map((member) => (
                                  <div
                                    key={member.id}
                                    className={`p-3 rounded-lg mb-2 flex justify-between items-center ${
                                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}
                                  >
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-sm text-gray-500">{member.relationship}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteFamilyMember(member.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{t('tools.obituaryWriter.obituaryText', 'Obituary Text')}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleGenerateObituary}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Wand2 className="w-4 h-4" /> Generate
                          </button>
                          <button
                            onClick={handleCopyObituary}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                          <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showPreview ? t('tools.obituaryWriter.edit', 'Edit') : t('tools.obituaryWriter.preview', 'Preview')}
                          </button>
                        </div>
                      </div>

                      {showPreview ? (
                        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{selectedObituary.obituaryText || 'No obituary text yet.'}</p>
                        </div>
                      ) : (
                        <textarea
                          value={selectedObituary.obituaryText}
                          onChange={(e) => handleUpdateObituary({ obituaryText: e.target.value })}
                          placeholder={t('tools.obituaryWriter.writeOrGenerateTheObituary', 'Write or generate the obituary text...')}
                          className={`w-full px-4 py-3 rounded-lg border resize-none ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          rows={15}
                        />
                      )}

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{selectedObituary.wordCount} words</span>
                        <span>{selectedObituary.characterCount} characters</span>
                      </div>

                      {/* Service Info */}
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.obituaryWriter.serviceInformation', 'Service Information')}</label>
                        <textarea
                          value={selectedObituary.serviceInfo}
                          onChange={(e) => handleUpdateObituary({ serviceInfo: e.target.value })}
                          placeholder={t('tools.obituaryWriter.detailsAboutViewingFuneralService', 'Details about viewing, funeral service, burial...')}
                          className={`w-full px-3 py-2 rounded-lg border resize-none ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          rows={3}
                        />
                      </div>

                      {/* Donations */}
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.obituaryWriter.memorialContributions', 'Memorial Contributions')}</label>
                        <textarea
                          value={selectedObituary.donations}
                          onChange={(e) => handleUpdateObituary({ donations: e.target.value })}
                          placeholder={t('tools.obituaryWriter.organizationNameAddress', 'Organization name, address...')}
                          className={`w-full px-3 py-2 rounded-lg border resize-none ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'publish' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Publications ({selectedObituary.publications.length})</h3>
                        <button
                          onClick={() => setShowPublicationForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                          <Plus className="w-4 h-4" /> Add Publication
                        </button>
                      </div>

                      {showPublicationForm && (
                        <PublicationForm
                          onSubmit={handleAddPublication}
                          onCancel={() => setShowPublicationForm(false)}
                          theme={theme}
                        />
                      )}

                      <div className="space-y-2">
                        {selectedObituary.publications.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">{t('tools.obituaryWriter.noPublicationsScheduled', 'No publications scheduled')}</p>
                        ) : (
                          selectedObituary.publications.map((pub) => (
                            <div
                              key={pub.id}
                              className={`p-4 rounded-lg border flex justify-between items-center ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div>
                                <p className="font-medium">{pub.name}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(pub.publishDate)}
                                  {pub.cost > 0 && ` - $${pub.cost}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {pub.confirmed ? (
                                  <span className="text-green-600 flex items-center gap-1 text-sm">
                                    <Check className="w-4 h-4" /> Confirmed
                                  </span>
                                ) : pub.submitted ? (
                                  <span className="text-yellow-600 text-sm">{t('tools.obituaryWriter.submitted', 'Submitted')}</span>
                                ) : (
                                  <button
                                    onClick={() => handleUpdatePublication(pub.id, { submitted: true })}
                                    className="text-sm text-amber-600 hover:underline"
                                  >
                                    {t('tools.obituaryWriter.markSubmitted', 'Mark Submitted')}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeletePublication(pub.id)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('tools.obituaryWriter.selectAnObituaryToEdit', 'Select an obituary to edit')}</p>
                <p className="text-sm mt-1">{t('tools.obituaryWriter.orCreateANewOne', 'or create a new one to get started')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

// Family Member Form
const FamilyMemberForm: React.FC<{
  onSubmit: (member: Omit<FamilyMember, 'id'>) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const [member, setMember] = useState({
    name: '',
    relationship: '',
    status: 'living' as FamilyMember['status'],
    location: '',
  });

  return (
    <div className={`p-4 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.name', 'Name')}</label>
          <input
            type="text"
            value={member.name}
            onChange={(e) => setMember({ ...member, name: e.target.value })}
            placeholder={t('tools.obituaryWriter.fullName', 'Full name')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.relationship', 'Relationship')}</label>
          <input
            type="text"
            value={member.relationship}
            onChange={(e) => setMember({ ...member, relationship: e.target.value })}
            placeholder={t('tools.obituaryWriter.eGWifeSonDaughter', 'e.g., wife, son, daughter')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.status', 'Status')}</label>
          <select
            value={member.status}
            onChange={(e) => setMember({ ...member, status: e.target.value as FamilyMember['status'] })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value="living">{t('tools.obituaryWriter.livingSurvivedBy', 'Living (Survived By)')}</option>
            <option value="predeceased">{t('tools.obituaryWriter.predeceased', 'Predeceased')}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.locationOptional', 'Location (Optional)')}</label>
          <input
            type="text"
            value={member.location}
            onChange={(e) => setMember({ ...member, location: e.target.value })}
            placeholder={t('tools.obituaryWriter.cityState', 'City, State')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500">{t('tools.obituaryWriter.cancel', 'Cancel')}</button>
        <button
          onClick={() => member.name && member.relationship && onSubmit(member)}
          className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          {t('tools.obituaryWriter.addMember', 'Add Member')}
        </button>
      </div>
    </div>
  );
};

// Publication Form
const PublicationForm: React.FC<{
  onSubmit: (pub: Omit<Publication, 'id'>) => void;
  onCancel: () => void;
  theme: string;
}> = ({ onSubmit, onCancel, theme }) => {
  const [pub, setPub] = useState({
    name: '',
    publishDate: '',
    submitted: false,
    confirmed: false,
    cost: 0,
  });

  return (
    <div className={`p-4 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.publicationName', 'Publication Name')}</label>
          <input
            type="text"
            value={pub.name}
            onChange={(e) => setPub({ ...pub, name: e.target.value })}
            placeholder={t('tools.obituaryWriter.eGLocalNewspaperLegacy', 'e.g., Local Newspaper, Legacy.com')}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.publishDate', 'Publish Date')}</label>
          <input
            type="date"
            value={pub.publishDate}
            onChange={(e) => setPub({ ...pub, publishDate: e.target.value })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">{t('tools.obituaryWriter.cost', 'Cost')}</label>
          <input
            type="number"
            value={pub.cost}
            onChange={(e) => setPub({ ...pub, cost: parseFloat(e.target.value) || 0 })}
            className={`w-full mt-1 px-3 py-2 rounded border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500">{t('tools.obituaryWriter.cancel2', 'Cancel')}</button>
        <button
          onClick={() => pub.name && onSubmit(pub)}
          className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          {t('tools.obituaryWriter.addPublication', 'Add Publication')}
        </button>
      </div>
    </div>
  );
};

export default ObituaryWriterTool;
