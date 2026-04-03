'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Plus,
  Trash2,
  Save,
  Calendar,
  Clock,
  Users,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  Wind,
  Thermometer,
  FileText,
  Building2,
  Truck,
  HardHat,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Edit2,
  X,
  Camera,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface DailyFieldReportToolProps {
  uiConfig?: UIConfig;
}

// Types
interface CrewMember {
  id: string;
  name: string;
  role: string;
  hoursWorked: number;
  overtime: number;
}

interface Equipment {
  id: string;
  name: string;
  hoursUsed: number;
  status: 'operational' | 'down' | 'maintenance';
  notes: string;
}

interface WorkPerformed {
  id: string;
  description: string;
  location: string;
  percentComplete: number;
  notes: string;
}

interface Delay {
  id: string;
  type: 'weather' | 'material' | 'labor' | 'inspection' | 'owner' | 'other';
  description: string;
  duration: number;
  impact: string;
}

interface Visitor {
  id: string;
  name: string;
  company: string;
  purpose: string;
  timeIn: string;
  timeOut: string;
}

interface DailyFieldReport {
  id: string;
  projectName: string;
  projectNumber: string;
  reportDate: string;
  reportNumber: number;
  preparedBy: string;
  superintendent: string;
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
    tempHigh: number;
    tempLow: number;
    precipitation: string;
  };
  workHours: {
    start: string;
    end: string;
    totalHours: number;
  };
  crewMembers: CrewMember[];
  totalManHours: number;
  equipment: Equipment[];
  workPerformed: WorkPerformed[];
  delays: Delay[];
  visitors: Visitor[];
  safetyIncidents: string;
  materialsDelivered: string;
  inspections: string;
  photos: string[];
  notes: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}

// Constants
const WEATHER_CONDITIONS = [
  { value: 'sunny', label: 'Sunny', icon: Sun },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud },
  { value: 'rainy', label: 'Rainy', icon: CloudRain },
  { value: 'snowy', label: 'Snowy', icon: CloudSnow },
  { value: 'windy', label: 'Windy', icon: Wind },
];

const DELAY_TYPES = [
  { value: 'weather', label: 'Weather' },
  { value: 'material', label: 'Material Shortage' },
  { value: 'labor', label: 'Labor Shortage' },
  { value: 'inspection', label: 'Pending Inspection' },
  { value: 'owner', label: 'Owner Decision' },
  { value: 'other', label: 'Other' },
];

const CREW_ROLES = [
  'Superintendent',
  'Foreman',
  'Journeyman',
  'Apprentice',
  'Laborer',
  'Operator',
  'Driver',
  'Safety Officer',
  'Other',
];

const STATUS_CONFIG = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
};

// Column configuration
const REPORT_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'reportDate', header: 'Date', type: 'date' },
  { key: 'reportNumber', header: 'Report #', type: 'number' },
  { key: 'totalManHours', header: 'Man Hours', type: 'number' },
  { key: 'crewCount', header: 'Crew Size', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const DailyFieldReportTool: React.FC<DailyFieldReportToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: reports,
    addItem: addReport,
    updateItem: updateReport,
    deleteItem: deleteReport,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<DailyFieldReport>('daily-field-reports', [], REPORT_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<DailyFieldReport | null>(null);

  // New Report State
  const getNextReportNumber = () => {
    const maxNum = reports.reduce((max, r) => Math.max(max, r.reportNumber), 0);
    return maxNum + 1;
  };

  const [newReport, setNewReport] = useState<Partial<DailyFieldReport>>({
    projectName: '',
    projectNumber: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportNumber: 1,
    preparedBy: '',
    superintendent: '',
    weather: {
      condition: 'sunny',
      tempHigh: 75,
      tempLow: 55,
      precipitation: 'None',
    },
    workHours: {
      start: '07:00',
      end: '16:00',
      totalHours: 9,
    },
    crewMembers: [],
    totalManHours: 0,
    equipment: [],
    workPerformed: [],
    delays: [],
    visitors: [],
    safetyIncidents: 'None reported',
    materialsDelivered: '',
    inspections: '',
    photos: [],
    notes: '',
    status: 'draft',
  });

  // Calculate totals
  const calculateManHours = (crew: CrewMember[]): number => {
    return crew.reduce((sum, member) => sum + member.hoursWorked + member.overtime, 0);
  };

  // Add crew member
  const addCrewMember = (report: Partial<DailyFieldReport>, setReport: Function) => {
    const newMember: CrewMember = {
      id: generateId(),
      name: '',
      role: 'Laborer',
      hoursWorked: 8,
      overtime: 0,
    };
    const updatedCrew = [...(report.crewMembers || []), newMember];
    setReport({ ...report, crewMembers: updatedCrew, totalManHours: calculateManHours(updatedCrew) });
  };

  // Update crew member
  const updateCrewMember = (report: Partial<DailyFieldReport>, setReport: Function, id: string, field: keyof CrewMember, value: any) => {
    const updatedCrew = (report.crewMembers || []).map(member =>
      member.id === id ? { ...member, [field]: value } : member
    );
    setReport({ ...report, crewMembers: updatedCrew, totalManHours: calculateManHours(updatedCrew) });
  };

  // Remove crew member
  const removeCrewMember = (report: Partial<DailyFieldReport>, setReport: Function, id: string) => {
    const updatedCrew = (report.crewMembers || []).filter(m => m.id !== id);
    setReport({ ...report, crewMembers: updatedCrew, totalManHours: calculateManHours(updatedCrew) });
  };

  // Add work performed
  const addWorkPerformed = (report: Partial<DailyFieldReport>, setReport: Function) => {
    const newWork: WorkPerformed = {
      id: generateId(),
      description: '',
      location: '',
      percentComplete: 0,
      notes: '',
    };
    setReport({ ...report, workPerformed: [...(report.workPerformed || []), newWork] });
  };

  // Add delay
  const addDelay = (report: Partial<DailyFieldReport>, setReport: Function) => {
    const newDelay: Delay = {
      id: generateId(),
      type: 'weather',
      description: '',
      duration: 0,
      impact: '',
    };
    setReport({ ...report, delays: [...(report.delays || []), newDelay] });
  };

  // Save report
  const handleSave = () => {
    const report: DailyFieldReport = {
      id: generateId(),
      projectName: newReport.projectName || '',
      projectNumber: newReport.projectNumber || '',
      reportDate: newReport.reportDate || new Date().toISOString().split('T')[0],
      reportNumber: getNextReportNumber(),
      preparedBy: newReport.preparedBy || '',
      superintendent: newReport.superintendent || '',
      weather: newReport.weather || { condition: 'sunny', tempHigh: 75, tempLow: 55, precipitation: 'None' },
      workHours: newReport.workHours || { start: '07:00', end: '16:00', totalHours: 9 },
      crewMembers: newReport.crewMembers || [],
      totalManHours: newReport.totalManHours || 0,
      equipment: newReport.equipment || [],
      workPerformed: newReport.workPerformed || [],
      delays: newReport.delays || [],
      visitors: newReport.visitors || [],
      safetyIncidents: newReport.safetyIncidents || 'None reported',
      materialsDelivered: newReport.materialsDelivered || '',
      inspections: newReport.inspections || '',
      photos: newReport.photos || [],
      notes: newReport.notes || '',
      status: newReport.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addReport(report);
    setNewReport({
      projectName: '',
      projectNumber: '',
      reportDate: new Date().toISOString().split('T')[0],
      reportNumber: getNextReportNumber() + 1,
      preparedBy: '',
      superintendent: '',
      weather: { condition: 'sunny', tempHigh: 75, tempLow: 55, precipitation: 'None' },
      workHours: { start: '07:00', end: '16:00', totalHours: 9 },
      crewMembers: [],
      equipment: [],
      workPerformed: [],
      delays: [],
      visitors: [],
      status: 'draft',
    });
    setActiveTab('list');
  };

  // Update report
  const handleUpdate = () => {
    if (!editingReport) return;
    updateReport(editingReport.id, {
      ...editingReport,
      updatedAt: new Date().toISOString(),
    });
    setEditingReport(null);
    setActiveTab('list');
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch =
        report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.preparedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayReports = reports.filter(r => r.reportDate === today);
    return {
      totalReports: reports.length,
      todayReports: todayReports.length,
      totalManHours: reports.reduce((sum, r) => sum + r.totalManHours, 0),
      pendingApproval: reports.filter(r => r.status === 'submitted').length,
    };
  }, [reports]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv': exportCSV({ filename: 'daily-field-reports' }); break;
      case 'excel': exportExcel({ filename: 'daily-field-reports' }); break;
      case 'json': exportJSON({ filename: 'daily-field-reports' }); break;
      case 'pdf': await exportPDF({ filename: 'daily-field-reports', title: 'Daily Field Reports' }); break;
    }
  };

  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    const weather = WEATHER_CONDITIONS.find(w => w.value === condition);
    const Icon = weather?.icon || Sun;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <ClipboardList className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.dailyFieldReport.dailyFieldReport', 'Daily Field Report')}</h1>
            <p className="text-gray-500">{t('tools.dailyFieldReport.documentDailyConstructionProgress', 'Document daily construction progress')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="daily-field-report" toolName="Daily Field Report" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onSync={forceSync}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.totalReports', 'Total Reports')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.todaySReports', 'Today\'s Reports')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.todayReports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.totalManHours', 'Total Man Hours')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalManHours.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.pendingApproval', 'Pending Approval')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'list' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.dailyFieldReport.allReports', 'All Reports')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('tools.dailyFieldReport.newReport', 'New Report')}
        </button>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.dailyFieldReport.searchReports', 'Search reports...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">{t('tools.dailyFieldReport.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <ClipboardList className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.projectName}</h3>
                        <p className="text-sm text-gray-500">Report #{report.reportNumber} - {formatDate(report.reportDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getWeatherIcon(report.weather.condition)}
                        <span className="text-sm">{report.weather.tempHigh}F</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{report.totalManHours} hrs</p>
                        <p className="text-sm text-gray-500">{report.crewMembers.length} crew</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[report.status].color}`}>
                        {STATUS_CONFIG[report.status].label}
                      </span>
                      {expandedId === report.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === report.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.preparedBy', 'Prepared By')}</p>
                        <p className="font-medium">{report.preparedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.workHours', 'Work Hours')}</p>
                        <p className="font-medium">{report.workHours.start} - {report.workHours.end}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.weather', 'Weather')}</p>
                        <p className="font-medium capitalize">{report.weather.condition} ({report.weather.tempLow}F - {report.weather.tempHigh}F)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.dailyFieldReport.delays', 'Delays')}</p>
                        <p className="font-medium">{report.delays.length} recorded</p>
                      </div>
                    </div>

                    {report.workPerformed.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">{t('tools.dailyFieldReport.workPerformed', 'Work Performed')}</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {report.workPerformed.map(work => (
                            <li key={work.id}>{work.description} ({work.percentComplete}% complete)</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingReport(report);
                          setActiveTab('edit');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.dailyFieldReport.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => updateReport(report.id, { status: 'submitted' })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.dailyFieldReport.submit', 'Submit')}
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.dailyFieldReport.noReportsFound', 'No reports found')}</h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t('tools.dailyFieldReport.createReport', 'Create Report')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit View */}
      {(activeTab === 'create' || activeTab === 'edit') && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'create' ? t('tools.dailyFieldReport.newDailyFieldReport', 'New Daily Field Report') : t('tools.dailyFieldReport.editReport', 'Edit Report')}
            </h2>
            <button
              onClick={() => { setActiveTab('list'); setEditingReport(null); }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingReport?.projectName : newReport.projectName}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingReport({ ...editingReport!, projectName: e.target.value })
                    : setNewReport({ ...newReport, projectName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.reportDate', 'Report Date')}</label>
              <input
                type="date"
                value={activeTab === 'edit' ? editingReport?.reportDate : newReport.reportDate}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingReport({ ...editingReport!, reportDate: e.target.value })
                    : setNewReport({ ...newReport, reportDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.preparedBy2', 'Prepared By')}</label>
              <input
                type="text"
                value={activeTab === 'edit' ? editingReport?.preparedBy : newReport.preparedBy}
                onChange={e =>
                  activeTab === 'edit'
                    ? setEditingReport({ ...editingReport!, preparedBy: e.target.value })
                    : setNewReport({ ...newReport, preparedBy: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Weather */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-blue-600" />
              {t('tools.dailyFieldReport.weatherConditions', 'Weather Conditions')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.condition', 'Condition')}</label>
                <select
                  value={activeTab === 'edit' ? editingReport?.weather.condition : newReport.weather?.condition}
                  onChange={e => {
                    const weather = { ...(activeTab === 'edit' ? editingReport?.weather : newReport.weather)!, condition: e.target.value as any };
                    activeTab === 'edit'
                      ? setEditingReport({ ...editingReport!, weather })
                      : setNewReport({ ...newReport, weather });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {WEATHER_CONDITIONS.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.highTempF', 'High Temp (F)')}</label>
                <input
                  type="number"
                  value={activeTab === 'edit' ? editingReport?.weather.tempHigh : newReport.weather?.tempHigh}
                  onChange={e => {
                    const weather = { ...(activeTab === 'edit' ? editingReport?.weather : newReport.weather)!, tempHigh: parseInt(e.target.value) || 0 };
                    activeTab === 'edit'
                      ? setEditingReport({ ...editingReport!, weather })
                      : setNewReport({ ...newReport, weather });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.lowTempF', 'Low Temp (F)')}</label>
                <input
                  type="number"
                  value={activeTab === 'edit' ? editingReport?.weather.tempLow : newReport.weather?.tempLow}
                  onChange={e => {
                    const weather = { ...(activeTab === 'edit' ? editingReport?.weather : newReport.weather)!, tempLow: parseInt(e.target.value) || 0 };
                    activeTab === 'edit'
                      ? setEditingReport({ ...editingReport!, weather })
                      : setNewReport({ ...newReport, weather });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.precipitation', 'Precipitation')}</label>
                <input
                  type="text"
                  value={activeTab === 'edit' ? editingReport?.weather.precipitation : newReport.weather?.precipitation}
                  onChange={e => {
                    const weather = { ...(activeTab === 'edit' ? editingReport?.weather : newReport.weather)!, precipitation: e.target.value };
                    activeTab === 'edit'
                      ? setEditingReport({ ...editingReport!, weather })
                      : setNewReport({ ...newReport, weather });
                  }}
                  placeholder={t('tools.dailyFieldReport.eGNoneLightRain', 'e.g., None, Light rain')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Crew */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                {t('tools.dailyFieldReport.crewMembers', 'Crew Members')}
              </h3>
              <button
                onClick={() => addCrewMember(activeTab === 'edit' ? editingReport! : newReport, activeTab === 'edit' ? setEditingReport : setNewReport)}
                className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('tools.dailyFieldReport.addCrew', 'Add Crew')}
              </button>
            </div>
            <div className="space-y-2">
              {(activeTab === 'edit' ? editingReport?.crewMembers : newReport.crewMembers || [])?.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateCrewMember(
                      activeTab === 'edit' ? editingReport! : newReport,
                      activeTab === 'edit' ? setEditingReport : setNewReport,
                      member.id, 'name', e.target.value
                    )}
                    placeholder={t('tools.dailyFieldReport.name', 'Name')}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={member.role}
                    onChange={e => updateCrewMember(
                      activeTab === 'edit' ? editingReport! : newReport,
                      activeTab === 'edit' ? setEditingReport : setNewReport,
                      member.id, 'role', e.target.value
                    )}
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    {CREW_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={member.hoursWorked}
                    onChange={e => updateCrewMember(
                      activeTab === 'edit' ? editingReport! : newReport,
                      activeTab === 'edit' ? setEditingReport : setNewReport,
                      member.id, 'hoursWorked', parseFloat(e.target.value) || 0
                    )}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm text-right"
                  />
                  <span className="text-sm text-gray-500">hrs</span>
                  <button
                    onClick={() => removeCrewMember(
                      activeTab === 'edit' ? editingReport! : newReport,
                      activeTab === 'edit' ? setEditingReport : setNewReport,
                      member.id
                    )}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm text-gray-600">
              Total Man Hours: <span className="font-bold text-gray-900">
                {activeTab === 'edit' ? editingReport?.totalManHours : newReport.totalManHours || 0}
              </span>
            </div>
          </div>

          {/* Work Performed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-teal-600" />
                {t('tools.dailyFieldReport.workPerformed2', 'Work Performed')}
              </h3>
              <button
                onClick={() => addWorkPerformed(activeTab === 'edit' ? editingReport! : newReport, activeTab === 'edit' ? setEditingReport : setNewReport)}
                className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('tools.dailyFieldReport.addWork', 'Add Work')}
              </button>
            </div>
            <div className="space-y-2">
              {(activeTab === 'edit' ? editingReport?.workPerformed : newReport.workPerformed || [])?.map(work => (
                <div key={work.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={work.description}
                    onChange={e => {
                      const updated = (activeTab === 'edit' ? editingReport?.workPerformed : newReport.workPerformed || [])?.map(w =>
                        w.id === work.id ? { ...w, description: e.target.value } : w
                      );
                      activeTab === 'edit'
                        ? setEditingReport({ ...editingReport!, workPerformed: updated })
                        : setNewReport({ ...newReport, workPerformed: updated });
                    }}
                    placeholder={t('tools.dailyFieldReport.description', 'Description')}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={work.percentComplete}
                    onChange={e => {
                      const updated = (activeTab === 'edit' ? editingReport?.workPerformed : newReport.workPerformed || [])?.map(w =>
                        w.id === work.id ? { ...w, percentComplete: parseInt(e.target.value) || 0 } : w
                      );
                      activeTab === 'edit'
                        ? setEditingReport({ ...editingReport!, workPerformed: updated })
                        : setNewReport({ ...newReport, workPerformed: updated });
                    }}
                    min="0"
                    max="100"
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm text-right"
                  />
                  <span className="text-sm text-gray-500">%</span>
                  <button
                    onClick={() => {
                      const updated = (activeTab === 'edit' ? editingReport?.workPerformed : newReport.workPerformed || [])?.filter(w => w.id !== work.id);
                      activeTab === 'edit'
                        ? setEditingReport({ ...editingReport!, workPerformed: updated })
                        : setNewReport({ ...newReport, workPerformed: updated });
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dailyFieldReport.notes', 'Notes')}</label>
            <textarea
              value={activeTab === 'edit' ? editingReport?.notes : newReport.notes}
              onChange={e =>
                activeTab === 'edit'
                  ? setEditingReport({ ...editingReport!, notes: e.target.value })
                  : setNewReport({ ...newReport, notes: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('tools.dailyFieldReport.additionalNotesObservationsOrConcerns', 'Additional notes, observations, or concerns...')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setActiveTab('list'); setEditingReport(null); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t('tools.dailyFieldReport.cancel', 'Cancel')}
            </button>
            <button
              onClick={activeTab === 'edit' ? handleUpdate : handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Save className="w-4 h-4" />
              {activeTab === 'edit' ? t('tools.dailyFieldReport.update', 'Update') : t('tools.dailyFieldReport.save', 'Save')} Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyFieldReportTool;
