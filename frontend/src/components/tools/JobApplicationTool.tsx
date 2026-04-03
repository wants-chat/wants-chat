'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Info, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type ApplicationStatus = 'applied' | 'interview' | 'offered' | 'rejected' | 'accepted';

interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  salary?: number;
  notes: string;
  followUpDate?: string;
}

const statusColors: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
  applied: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Applied' },
  interview: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Interview Scheduled' },
  offered: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Offer Received' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
  accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Accepted' },
};

const statusOptions: ApplicationStatus[] = ['applied', 'interview', 'offered', 'rejected', 'accepted'];

const APPLICATION_COLUMNS: ColumnConfig[] = [
  { key: 'companyName', header: 'Company', type: 'string' },
  { key: 'jobTitle', header: 'Job Title', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'appliedDate', header: 'Applied Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'salary', header: 'Salary', type: 'currency' },
];

interface JobApplicationToolProps {
  uiConfig?: UIConfig;
}

export const JobApplicationTool: React.FC<JobApplicationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize with useToolData hook
  const {
    data: applications,
    addItem: addApplication,
    updateItem: updateApplication,
    deleteItem: deleteApplication,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<JobApplication>('job-applications', [
    {
      id: '1',
      companyName: 'Tech Corp',
      jobTitle: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      appliedDate: '2024-11-15',
      status: 'interview',
      salary: 150000,
      notes: 'Great company, innovative tech stack',
      followUpDate: '2024-12-01',
    },
    {
      id: '2',
      companyName: 'StartupXYZ',
      jobTitle: 'Full Stack Engineer',
      location: 'Remote',
      appliedDate: '2024-11-10',
      status: 'applied',
      salary: 120000,
      notes: 'Early stage startup',
    },
  ], APPLICATION_COLUMNS);

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'stats'>('overview');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [newApplication, setNewApplication] = useState({
    companyName: '',
    jobTitle: '',
    location: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'applied' as ApplicationStatus,
    salary: '',
    notes: '',
    followUpDate: '',
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.companyName) {
        setNewApplication(prev => ({ ...prev, companyName: params.companyName as string }));
        setIsPrefilled(true);
      }
      if (params.jobTitle) {
        setNewApplication(prev => ({ ...prev, jobTitle: params.jobTitle as string }));
        setIsPrefilled(true);
      }
      if (params.activeTab) {
        setActiveTab(params.activeTab as 'overview' | 'applications' | 'stats');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const byStatus = {
      applied: applications.filter(a => a.status === 'applied').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offered: applications.filter(a => a.status === 'offered').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
    };
    const averageSalary = applications.length > 0
      ? applications.reduce((sum, app) => sum + (app.salary || 0), 0) / applications.filter(a => a.salary).length
      : 0;
    const pendingFollowups = applications.filter(a => a.followUpDate && new Date(a.followUpDate) <= new Date()).length;

    return { total, byStatus, averageSalary, pendingFollowups };
  }, [applications]);

  const handleAddApplication = () => {
    if (!newApplication.companyName.trim() || !newApplication.jobTitle.trim()) return;

    const application: JobApplication = {
      id: Date.now().toString(),
      companyName: newApplication.companyName,
      jobTitle: newApplication.jobTitle,
      location: newApplication.location,
      appliedDate: newApplication.appliedDate,
      status: newApplication.status,
      salary: newApplication.salary ? parseFloat(newApplication.salary) : undefined,
      notes: newApplication.notes,
      followUpDate: newApplication.followUpDate || undefined,
    };

    addApplication(application);
    setNewApplication({
      companyName: '',
      jobTitle: '',
      location: '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      salary: '',
      notes: '',
      followUpDate: '',
    });
    setShowAddApplication(false);
  };

  const handleDeleteApplication = (id: string) => {
    deleteApplication(id);
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    updateApplication(id, { status: newStatus });
  };

  const handleExportCSV = () => {
    exportCSV({ filename: 'job-applications' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'job-applications' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'job-applications' });
  };

  const handleExportPDF = async () => {
    await exportPDF({ filename: 'job-applications' });
  };

  const handlePrint = () => {
    print('Job Applications');
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return copyToClipboard('csv');
  };

  const handleImportCSV = async (file: File) => {
    await importCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    await importJSON(file);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Briefcase className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jobApplication.jobApplicationTracker', 'Job Application Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.jobApplication.trackAndManageJobApplications', 'Track and manage job applications')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="job-application" toolName="Job Application" />

            <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'applications', label: 'Applications', icon: Briefcase },
            { id: 'stats', label: 'Statistics', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-500 text-white' : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobApplication.totalApplications', 'Total Applications')}</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobApplication.pendingFollowUps', 'Pending Follow-ups')}</div>
                <div className={`text-3xl font-bold ${stats.pendingFollowups > 0 ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingFollowups}</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jobApplication.statusBreakdown', 'Status Breakdown')}</h4>
              {statusOptions.map((status) => {
                const count = stats.byStatus[status];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${statusColors[status].text}`}>
                        {statusColors[status].label} ({count})
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{percentage.toFixed(0)}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full ${statusColors[status].bg}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Average Salary */}
            {stats.averageSalary > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jobApplication.averageSalary', 'Average Salary')}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${stats.averageSalary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            )}

            {/* Add Application Button */}
            <button
              onClick={() => {
                setActiveTab('applications');
                setShowAddApplication(true);
              }}
              className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
              {t('tools.jobApplication.addApplication', 'Add Application')}
            </button>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Add Application Button */}
            <button
              onClick={() => setShowAddApplication(true)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
              {t('tools.jobApplication.addApplication2', 'Add Application')}
            </button>

            {/* Add Application Form */}
            {showAddApplication && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jobApplication.addNewApplication', 'Add New Application')}</h4>
                <input
                  type="text"
                  value={newApplication.companyName}
                  onChange={(e) => setNewApplication({ ...newApplication, companyName: e.target.value })}
                  placeholder={t('tools.jobApplication.companyName', 'Company name')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  value={newApplication.jobTitle}
                  onChange={(e) => setNewApplication({ ...newApplication, jobTitle: e.target.value })}
                  placeholder={t('tools.jobApplication.jobTitle', 'Job title')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  value={newApplication.location}
                  onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                  placeholder={t('tools.jobApplication.location', 'Location')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="date"
                  value={newApplication.appliedDate}
                  onChange={(e) => setNewApplication({ ...newApplication, appliedDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={newApplication.status}
                  onChange={(e) => setNewApplication({ ...newApplication, status: e.target.value as ApplicationStatus })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{statusColors[status].label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newApplication.salary}
                  onChange={(e) => setNewApplication({ ...newApplication, salary: e.target.value })}
                  placeholder={t('tools.jobApplication.salaryOptional', 'Salary (optional)')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="date"
                  value={newApplication.followUpDate}
                  onChange={(e) => setNewApplication({ ...newApplication, followUpDate: e.target.value })}
                  placeholder={t('tools.jobApplication.followUpDateOptional', 'Follow-up date (optional)')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <textarea
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                  placeholder={t('tools.jobApplication.notesOptional', 'Notes (optional)')}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddApplication}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.jobApplication.addApplication3', 'Add Application')}
                  </button>
                  <button
                    onClick={() => setShowAddApplication(false)}
                    className={`py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.jobApplication.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Applications List */}
            {applications.length === 0 ? (
              <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Briefcase className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.jobApplication.noApplicationsYet', 'No applications yet')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.jobApplication.addYourFirstApplicationTo', 'Add your first application to get started')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...applications].reverse().map((application) => (
                  <div
                    key={application.id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {application.jobTitle}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {application.companyName}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteApplication(application.id)}
                        className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* Application Details */}
                    <div className={`text-sm space-y-1 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {application.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {application.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                      {application.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          ${application.salary.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Status Selector */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobApplication.status', 'Status:')}</span>
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(application.id, status)}
                          className={`py-1 px-3 rounded-lg text-xs font-medium transition ${application.status === status ? `${statusColors[status].bg} ${statusColors[status].text}` : isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        >
                          {statusColors[status].label}
                        </button>
                      ))}
                    </div>

                    {/* Notes */}
                    {application.notes && (
                      <p className={`text-sm mt-2 p-2 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {application.notes}
                      </p>
                    )}

                    {/* Follow-up Alert */}
                    {application.followUpDate && new Date(application.followUpDate) <= new Date() && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600">Follow-up due: {new Date(application.followUpDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Export Actions */}
            {applications.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {applications.length} application{applications.length !== 1 ? 's' : ''}
                </span>
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  onImportCSV={handleImportCSV}
                  onImportJSON={handleImportJSON}
                  showImport={true}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Detailed Stats */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jobApplication.applicationStatistics', 'Application Statistics')}</h4>
              <div className="space-y-3">
                {statusOptions.map((status) => {
                  const count = stats.byStatus[status];
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={status} className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${statusColors[status].text}`}>
                          {statusColors[status].label}
                        </span>
                        <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {count}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded-full ${statusColors[status].bg}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Success Rate */}
            {stats.total > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobApplication.interviewRate', 'Interview Rate')}</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {((stats.byStatus.interview / stats.total) * 100).toFixed(1)}%
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stats.byStatus.interview} of {stats.total} applications
                </p>
              </div>
            )}

            {/* Offer Rate */}
            {stats.total > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobApplication.offerRate', 'Offer Rate')}</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {(((stats.byStatus.offered + stats.byStatus.accepted) / stats.total) * 100).toFixed(1)}%
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stats.byStatus.offered + stats.byStatus.accepted} of {stats.total} applications
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.jobApplication.jobSearchTips', 'Job Search Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.jobApplication.customizeCoverLettersForEach', 'Customize cover letters for each application')}</li>
                <li>{t('tools.jobApplication.followUpWithin2Weeks', 'Follow up within 2 weeks if you haven\'t heard back')}</li>
                <li>{t('tools.jobApplication.keepTrackOfInterviewDates', 'Keep track of interview dates and contacts')}</li>
                <li>{t('tools.jobApplication.practiceCommonInterviewQuestions', 'Practice common interview questions')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationTool;
