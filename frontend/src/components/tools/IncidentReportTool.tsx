'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  Trash2,
  Save,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Camera,
  Paperclip,
  Eye,
  Shield,
  Sparkles,
  X,
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

interface IncidentReportToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type IncidentType = 'theft' | 'trespass' | 'vandalism' | 'assault' | 'fire' | 'medical' | 'suspicious' | 'other';
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated';

interface Witness {
  name: string;
  contact: string;
  statement: string;
}

interface IncidentReport {
  id: string;
  reportNumber: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  reportedBy: string;
  assignedTo: string;
  witnesses: Witness[];
  actionsTaken: string;
  followUpRequired: boolean;
  followUpDate: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Column definitions for exports
const INCIDENT_COLUMNS: ColumnConfig[] = [
  { key: 'reportNumber', header: 'Report #' },
  { key: 'type', header: 'Type' },
  { key: 'severity', header: 'Severity' },
  { key: 'status', header: 'Status' },
  { key: 'title', header: 'Title' },
  { key: 'location', header: 'Location' },
  { key: 'dateTime', header: 'Date/Time' },
  { key: 'reportedBy', header: 'Reported By' },
  { key: 'assignedTo', header: 'Assigned To' },
];

// Helper function to generate unique IDs
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateReportNumber = () => `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'theft', label: 'Theft' },
  { value: 'trespass', label: 'Trespassing' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'assault', label: 'Assault' },
  { value: 'fire', label: 'Fire' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'suspicious', label: 'Suspicious Activity' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_LEVELS: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

const STATUS_OPTIONS: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Open', color: 'bg-blue-500' },
  { value: 'investigating', label: 'Investigating', color: 'bg-purple-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500' },
  { value: 'escalated', label: 'Escalated', color: 'bg-red-500' },
];

export function IncidentReportTool({ uiConfig }: IncidentReportToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData hook for backend sync
  const {
    data: incidents,
    addItem: addIncidentToBackend,
    updateItem: updateIncidentBackend,
    deleteItem: deleteIncidentBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<IncidentReport>('incident-reports', [], INCIDENT_COLUMNS);

  // Local UI State
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<IncidentReport | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // New incident form state
  const [newIncident, setNewIncident] = useState<Partial<IncidentReport>>({
    type: 'suspicious',
    severity: 'medium',
    status: 'open',
    title: '',
    description: '',
    location: '',
    dateTime: new Date().toISOString().slice(0, 16),
    reportedBy: '',
    assignedTo: '',
    witnesses: [],
    actionsTaken: '',
    followUpRequired: false,
    followUpDate: '',
    attachments: [],
  });

  // Witness form state
  const [showWitnessForm, setShowWitnessForm] = useState(false);
  const [newWitness, setNewWitness] = useState<Witness>({ name: '', contact: '', statement: '' });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.incidentType || params.title || params.description) {
        setNewIncident({
          ...newIncident,
          type: (params.incidentType as IncidentType) || 'suspicious',
          title: params.title || '',
          description: params.description || '',
          location: params.location || '',
          reportedBy: params.reportedBy || params.name || '',
        });
        setShowForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add incident
  const addIncident = () => {
    if (!newIncident.title || !newIncident.description) {
      setValidationMessage('Please fill in required fields (Title, Description)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const incident: IncidentReport = {
      id: generateId(),
      reportNumber: generateReportNumber(),
      type: newIncident.type as IncidentType || 'suspicious',
      severity: newIncident.severity as IncidentSeverity || 'medium',
      status: newIncident.status as IncidentStatus || 'open',
      title: newIncident.title || '',
      description: newIncident.description || '',
      location: newIncident.location || '',
      dateTime: newIncident.dateTime || new Date().toISOString(),
      reportedBy: newIncident.reportedBy || '',
      assignedTo: newIncident.assignedTo || '',
      witnesses: newIncident.witnesses || [],
      actionsTaken: newIncident.actionsTaken || '',
      followUpRequired: newIncident.followUpRequired || false,
      followUpDate: newIncident.followUpDate || '',
      attachments: newIncident.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingIncident) {
      updateIncidentBackend(editingIncident.id, {
        ...incident,
        id: editingIncident.id,
        reportNumber: editingIncident.reportNumber,
        createdAt: editingIncident.createdAt,
      });
    } else {
      addIncidentToBackend(incident);
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingIncident(null);
    setNewIncident({
      type: 'suspicious',
      severity: 'medium',
      status: 'open',
      title: '',
      description: '',
      location: '',
      dateTime: new Date().toISOString().slice(0, 16),
      reportedBy: '',
      assignedTo: '',
      witnesses: [],
      actionsTaken: '',
      followUpRequired: false,
      followUpDate: '',
      attachments: [],
    });
  };

  // Edit incident
  const editIncident = (incident: IncidentReport) => {
    setEditingIncident(incident);
    setNewIncident({
      ...incident,
      dateTime: incident.dateTime.slice(0, 16),
    });
    setShowForm(true);
  };

  // Delete incident
  const deleteIncident = async (incidentId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this incident report?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteIncidentBackend(incidentId);
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(null);
      }
    }
  };

  // Update incident status
  const updateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    updateIncidentBackend(incidentId, { status, updatedAt: new Date().toISOString() });
  };

  // Add witness
  const addWitness = () => {
    if (!newWitness.name) return;
    setNewIncident({
      ...newIncident,
      witnesses: [...(newIncident.witnesses || []), newWitness],
    });
    setNewWitness({ name: '', contact: '', statement: '' });
    setShowWitnessForm(false);
  };

  // Remove witness
  const removeWitness = (index: number) => {
    const witnesses = [...(newIncident.witnesses || [])];
    witnesses.splice(index, 1);
    setNewIncident({ ...newIncident, witnesses });
  };

  // Get filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        searchTerm === '' ||
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || incident.type === filterType;
      const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
      const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
      return matchesSearch && matchesType && matchesStatus && matchesSeverity;
    });
  }, [incidents, searchTerm, filterType, filterStatus, filterSeverity]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: incidents.length,
      open: incidents.filter((i) => i.status === 'open').length,
      investigating: incidents.filter((i) => i.status === 'investigating').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      critical: incidents.filter((i) => i.severity === 'critical').length,
    };
  }, [incidents]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.incidentReport.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.incidentReport.incidentReportTool', 'Incident Report Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.incidentReport.documentAndTrackSecurityIncidents', 'Document and track security incidents')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="incident-report" toolName="Incident Report" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredIncidents, INCIDENT_COLUMNS, 'incident-reports')}
                onExportExcel={() => exportToExcel(filteredIncidents, INCIDENT_COLUMNS, 'incident-reports')}
                onExportJSON={() => exportToJSON(filteredIncidents, 'incident-reports')}
                onExportPDF={() => exportToPDF(filteredIncidents, INCIDENT_COLUMNS, 'Incident Reports')}
                onCopy={() => copyUtil(filteredIncidents, INCIDENT_COLUMNS)}
                onPrint={() => printData(filteredIncidents, INCIDENT_COLUMNS, 'Incident Reports')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Reports', value: stats.total, color: 'bg-blue-500' },
              { label: 'Open', value: stats.open, color: 'bg-yellow-500' },
              { label: 'Investigating', value: stats.investigating, color: 'bg-purple-500' },
              { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
              { label: 'Critical', value: stats.critical, color: 'bg-red-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}
              >
                <div className={`w-2 h-2 rounded-full ${stat.color} mb-1`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow mb-6`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.incidentReport.searchIncidents', 'Search incidents...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.incidentReport.allTypes', 'All Types')}</option>
              {INCIDENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.incidentReport.allStatus', 'All Status')}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.incidentReport.allSeverity', 'All Severity')}</option>
              {SEVERITY_LEVELS.map((severity) => (
                <option key={severity.value} value={severity.value}>
                  {severity.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.incidentReport.newReport', 'New Report')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Incidents List */}
          <div className="lg:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
              {filteredIncidents.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.incidentReport.noIncidentReportsFound', 'No incident reports found')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedIncident?.id === incident.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {incident.reportNumber}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                SEVERITY_LEVELS.find((s) => s.value === incident.severity)?.color
                              } text-white`}
                            >
                              {incident.severity}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                STATUS_OPTIONS.find((s) => s.value === incident.status)?.color
                              } text-white`}
                            >
                              {incident.status}
                            </span>
                          </div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {incident.title}
                          </div>
                          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {incident.location || 'No location specified'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(incident.dateTime).toLocaleDateString()}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(incident.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Incident Details */}
          <div className="lg:col-span-1">
            {selectedIncident ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 sticky top-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.incidentReport.incidentDetails', 'Incident Details')}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editIncident(selectedIncident)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteIncident(selectedIncident.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.incidentReport.reportNumber', 'Report Number')}
                    </label>
                    <div className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedIncident.reportNumber}
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.incidentReport.title', 'Title')}
                    </label>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedIncident.title}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.incidentReport.type', 'Type')}
                      </label>
                      <div className={`capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedIncident.type}
                      </div>
                    </div>
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.incidentReport.status', 'Status')}
                      </label>
                      <select
                        value={selectedIncident.status}
                        onChange={(e) => updateIncidentStatus(selectedIncident.id, e.target.value as IncidentStatus)}
                        className={`w-full text-sm px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.incidentReport.description', 'Description')}
                    </label>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedIncident.description}
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.incidentReport.location', 'Location')}
                    </label>
                    <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedIncident.location || 'Not specified'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.incidentReport.reportedBy', 'Reported By')}
                      </label>
                      <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedIncident.reportedBy || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.incidentReport.assignedTo', 'Assigned To')}
                      </label>
                      <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedIncident.assignedTo || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  {selectedIncident.witnesses.length > 0 && (
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Witnesses ({selectedIncident.witnesses.length})
                      </label>
                      <div className="mt-1 space-y-2">
                        {selectedIncident.witnesses.map((witness, idx) => (
                          <div
                            key={idx}
                            className={`text-sm p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                          >
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {witness.name}
                            </div>
                            {witness.contact && (
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {witness.contact}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedIncident.actionsTaken && (
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.incidentReport.actionsTaken', 'Actions Taken')}
                      </label>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedIncident.actionsTaken}
                      </div>
                    </div>
                  )}

                  {selectedIncident.followUpRequired && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('tools.incidentReport.followUpRequired', 'Follow-up Required')}</span>
                      </div>
                      {selectedIncident.followUpDate && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          Due: {new Date(selectedIncident.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 text-center`}>
                <Eye className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.incidentReport.selectAnIncidentToView', 'Select an incident to view details')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Incident Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl my-8`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingIncident ? t('tools.incidentReport.editIncidentReport', 'Edit Incident Report') : t('tools.incidentReport.newIncidentReport', 'New Incident Report')}
                </h3>
                <button onClick={resetForm}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.incidentType', 'Incident Type *')}
                    </label>
                    <select
                      value={newIncident.type}
                      onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value as IncidentType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {INCIDENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.severity', 'Severity *')}
                    </label>
                    <select
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as IncidentSeverity })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {SEVERITY_LEVELS.map((severity) => (
                        <option key={severity.value} value={severity.value}>
                          {severity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.incidentReport.title2', 'Title *')}
                  </label>
                  <input
                    type="text"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder={t('tools.incidentReport.briefTitleOfTheIncident', 'Brief title of the incident')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.incidentReport.description2', 'Description *')}
                  </label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder={t('tools.incidentReport.detailedDescriptionOfTheIncident', 'Detailed description of the incident')}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.location2', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={newIncident.location}
                      onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                      placeholder={t('tools.incidentReport.whereDidTheIncidentOccur', 'Where did the incident occur?')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.dateTime', 'Date & Time *')}
                    </label>
                    <input
                      type="datetime-local"
                      value={newIncident.dateTime}
                      onChange={(e) => setNewIncident({ ...newIncident, dateTime: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.reportedBy2', 'Reported By')}
                    </label>
                    <input
                      type="text"
                      value={newIncident.reportedBy}
                      onChange={(e) => setNewIncident({ ...newIncident, reportedBy: e.target.value })}
                      placeholder={t('tools.incidentReport.nameOfReporter', 'Name of reporter')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.assignedTo2', 'Assigned To')}
                    </label>
                    <input
                      type="text"
                      value={newIncident.assignedTo}
                      onChange={(e) => setNewIncident({ ...newIncident, assignedTo: e.target.value })}
                      placeholder={t('tools.incidentReport.nameOfAssignee', 'Name of assignee')}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Witnesses Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Witnesses ({newIncident.witnesses?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowWitnessForm(true)}
                      className="text-sm text-[#0D9488] hover:underline"
                    >
                      {t('tools.incidentReport.addWitness', '+ Add Witness')}
                    </button>
                  </div>
                  {(newIncident.witnesses || []).map((witness, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 mb-2 rounded ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {witness.name}
                        </div>
                        {witness.contact && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {witness.contact}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWitness(idx)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.incidentReport.actionsTaken2', 'Actions Taken')}
                  </label>
                  <textarea
                    value={newIncident.actionsTaken}
                    onChange={(e) => setNewIncident({ ...newIncident, actionsTaken: e.target.value })}
                    placeholder={t('tools.incidentReport.whatActionsHaveBeenTaken', 'What actions have been taken so far?')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIncident.followUpRequired}
                      onChange={(e) => setNewIncident({ ...newIncident, followUpRequired: e.target.checked })}
                      className="w-4 h-4 text-[#0D9488] rounded"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.incidentReport.followUpRequired2', 'Follow-up Required')}
                    </span>
                  </label>
                  {newIncident.followUpRequired && (
                    <input
                      type="date"
                      value={newIncident.followUpDate}
                      onChange={(e) => setNewIncident({ ...newIncident, followUpDate: e.target.value })}
                      className={`px-3 py-1 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.incidentReport.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addIncident}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {editingIncident ? t('tools.incidentReport.updateReport', 'Update Report') : t('tools.incidentReport.submitReport', 'Submit Report')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Witness Modal */}
        {showWitnessForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.incidentReport.addWitness2', 'Add Witness')}
                </h3>
                <button onClick={() => setShowWitnessForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.incidentReport.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newWitness.name}
                    onChange={(e) => setNewWitness({ ...newWitness, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.incidentReport.contact', 'Contact')}
                  </label>
                  <input
                    type="text"
                    value={newWitness.contact}
                    onChange={(e) => setNewWitness({ ...newWitness, contact: e.target.value })}
                    placeholder={t('tools.incidentReport.phoneOrEmail', 'Phone or email')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.incidentReport.statement', 'Statement')}
                  </label>
                  <textarea
                    value={newWitness.statement}
                    onChange={(e) => setNewWitness({ ...newWitness, statement: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowWitnessForm(false)}
                  className={`flex-1 py-2 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.incidentReport.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addWitness}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C]"
                >
                  {t('tools.incidentReport.addWitness3', 'Add Witness')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default IncidentReportTool;
