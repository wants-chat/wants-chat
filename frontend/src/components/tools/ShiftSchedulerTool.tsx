'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

// ============ INTERFACES ============
interface ShiftSchedulerToolProps {
  uiConfig?: UIConfig;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
  department: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  availability?: string;
  createdAt: string;
}

type ActiveTab = 'shifts' | 'employees' | 'schedule' | 'analytics';

// Column configurations for exports
const SHIFT_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'employeeName', header: 'Employee', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const EMPLOYEE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calculateShiftDuration = (startTime: string, endTime: string) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let start = startHour * 60 + startMin;
  let end = endHour * 60 + endMin;

  if (end < start) end += 24 * 60;

  const minutes = end - start;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

// ============ MAIN COMPONENT ============
export const ShiftSchedulerTool = ({
  uiConfig }: ShiftSchedulerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<ActiveTab>('shifts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize useToolData hook for shifts
  const {
    data: shifts,
    addItem: addShift,
    updateItem: updateShift,
    deleteItem: deleteShift,
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
    isLoading,
  } = useToolData<Shift>('shift-scheduler', [], SHIFT_COLUMNS);

  // Initialize useToolData hook for employees
  const {
    data: employees,
    addItem: addEmployee,
    updateItem: updateEmployee,
    deleteItem: deleteEmployee,
  } = useToolData<Employee>('shift-scheduler-employees', [], EMPLOYEE_COLUMNS);

  // Form states
  const [formData, setFormData] = useState<Partial<Shift>>({
    startTime: '09:00',
    endTime: '17:00',
    status: 'scheduled',
  });

  const [employeeFormData, setEmployeeFormData] = useState<Partial<Employee>>({
    department: 'General',
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text) {
        setSearchTerm(params.text);
      }
    }
  }, [uiConfig?.params]);

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchesSearch = shift.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shift.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shift.date.includes(searchTerm);
      const matchesFilter = !filterDepartment || shift.department === filterDepartment;
      return matchesSearch && matchesFilter;
    });
  }, [shifts, searchTerm, filterDepartment]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set([...shifts, ...employees].map(item =>
      'department' in item ? item.department : item.position
    ));
    return Array.from(depts).sort();
  }, [shifts, employees]);

  // Analytics data
  const analytics = useMemo(() => {
    return {
      totalShifts: shifts.length,
      scheduledShifts: shifts.filter(s => s.status === 'scheduled').length,
      completedShifts: shifts.filter(s => s.status === 'completed').length,
      totalEmployees: employees.length,
      avgShiftDuration: shifts.length > 0
        ? Math.round(shifts.reduce((acc, s) => {
            const [sh, sm] = s.startTime.split(':').map(Number);
            const [eh, em] = s.endTime.split(':').map(Number);
            let start = sh * 60 + sm;
            let end = eh * 60 + em;
            if (end < start) end += 24 * 60;
            return acc + (end - start);
          }, 0) / shifts.length)
        : 0,
    };
  }, [shifts, employees]);

  // ============ SHIFT HANDLERS ============
  const handleAddShift = useCallback(() => {
    if (!formData.employeeId || !formData.date) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newShift: Shift = {
      id: generateId(),
      employeeId: formData.employeeId,
      employeeName: formData.employeeName || '',
      date: formData.date,
      startTime: formData.startTime || '09:00',
      endTime: formData.endTime || '17:00',
      position: formData.position || '',
      department: formData.department || '',
      status: formData.status || 'scheduled',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    addShift(newShift);
    setFormData({ startTime: '09:00', endTime: '17:00', status: 'scheduled' });
    setShowForm(false);
  }, [formData, addShift]);

  const handleUpdateShift = useCallback(() => {
    if (!editingId) return;

    updateShift(editingId, {
      ...formData,
      createdAt: new Date().toISOString(),
    });

    setEditingId(null);
    setFormData({ startTime: '09:00', endTime: '17:00', status: 'scheduled' });
  }, [editingId, formData, updateShift]);

  const handleDeleteShift = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Shift',
      message: 'Are you sure you want to delete this shift?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteShift(id);
    }
  }, [confirm, deleteShift]);

  const handleEditShift = (shift: Shift) => {
    setFormData(shift);
    setEditingId(shift.id);
  };

  // ============ EMPLOYEE HANDLERS ============
  const handleAddEmployee = useCallback(() => {
    if (!employeeFormData.name || !employeeFormData.email) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newEmployee: Employee = {
      id: generateId(),
      name: employeeFormData.name,
      email: employeeFormData.email,
      phone: employeeFormData.phone || '',
      position: employeeFormData.position || '',
      department: employeeFormData.department || 'General',
      createdAt: new Date().toISOString(),
    };

    addEmployee(newEmployee);
    setEmployeeFormData({ department: 'General' });
  }, [employeeFormData, addEmployee]);

  const handleDeleteEmployee = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Employee',
      message: 'Are you sure? This will also remove all shifts for this employee.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteEmployee(id);
      // Optionally remove shifts for this employee
      shifts.forEach(shift => {
        if (shift.employeeId === id) deleteShift(shift.id);
      });
    }
  }, [confirm, deleteEmployee, deleteShift, shifts]);

  // ============ EXPORT HANDLERS ============
  const handleExportCSV = useCallback(() => {
    const result = exportCSV({ filename: 'shifts-schedule' });
    if (!result.success) {
      setValidationMessage(result.error || 'Export failed');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  }, [exportCSV]);

  const handleExportExcel = useCallback(() => {
    const result = exportExcel({ filename: 'shifts-schedule' });
    if (!result.success) {
      setValidationMessage(result.error || 'Export failed');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  }, [exportExcel]);

  const handleExportJSON = useCallback(() => {
    const result = exportJSON({ filename: 'shifts-schedule' });
    if (!result.success) {
      setValidationMessage(result.error || 'Export failed');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  }, [exportJSON]);

  const handleExportPDF = useCallback(async () => {
    const result = await exportPDF({
      filename: 'shifts-schedule',
      title: 'Shift Schedule Report',
    });
    if (!result.success) {
      setValidationMessage(result.error || 'Export failed');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  }, [exportPDF]);

  const handlePrint = useCallback(() => {
    print('Shift Schedule');
  }, [print]);

  const handleCopyToClipboard = useCallback(async () => {
    const success = await copyToClipboard('csv');
    if (success) {
      setValidationMessage('Data copied to clipboard');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  }, [copyToClipboard]);

  const handleImportCSV = useCallback(async (file: File) => {
    await importCSV(file);
    setValidationMessage('CSV imported successfully');
    setTimeout(() => setValidationMessage(null), 3000);
  }, [importCSV]);

  const handleImportJSON = useCallback(async (file: File) => {
    await importJSON(file);
    setValidationMessage('JSON imported successfully');
    setTimeout(() => setValidationMessage(null), 3000);
  }, [importJSON]);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textClass}`}>{t('tools.shiftScheduler.shiftScheduler', 'Shift Scheduler')}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.shiftScheduler.manageEmployeeShiftsAndSchedules', 'Manage employee shifts and schedules')}
              </p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="shift-scheduler" toolName="Shift Scheduler" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
            showLabel={true}
          />
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b ${borderClass}`}>
          {(['shifts', 'employees', 'schedule', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#0D9488] text-[#0D9488]'
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        {(activeTab === 'shifts' || activeTab === 'employees') && (
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={activeTab === 'shifts' ? t('tools.shiftScheduler.searchShifts', 'Search shifts...') : t('tools.shiftScheduler.searchEmployees', 'Search employees...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            {activeTab === 'shifts' && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.shiftScheduler.allDepartments', 'All Departments')}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              onImportCSV={handleImportCSV}
              onImportJSON={handleImportJSON}
              theme={theme}
              showImport={true}
            />
          </div>
        )}

        {/* SHIFTS TAB */}
        {activeTab === 'shifts' && (
          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('tools.shiftScheduler.addShift', 'Add Shift')}
            </button>

            {/* Shift Form */}
            {showForm && (
              <div className={`p-6 rounded-lg border ${borderClass} ${bgClass} mb-6 space-y-4`}>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.employeeId || ''}
                    onChange={(e) => {
                      const emp = employees.find(e => e.id === e.target.value);
                      setFormData({
                        ...formData,
                        employeeId: e.target.value,
                        employeeName: emp?.name || '',
                        position: emp?.position || '',
                        department: emp?.department || '',
                      });
                    }}
                    className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.shiftScheduler.selectEmployee', 'Select Employee')}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />

                  <input
                    type="time"
                    value={formData.startTime || '09:00'}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />

                  <input
                    type="time"
                    value={formData.endTime || '17:00'}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />

                  <select
                    value={formData.status || 'scheduled'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="scheduled">{t('tools.shiftScheduler.scheduled', 'Scheduled')}</option>
                    <option value="confirmed">{t('tools.shiftScheduler.confirmed', 'Confirmed')}</option>
                    <option value="completed">{t('tools.shiftScheduler.completed', 'Completed')}</option>
                    <option value="cancelled">{t('tools.shiftScheduler.cancelled', 'Cancelled')}</option>
                  </select>

                  <input
                    type="text"
                    placeholder={t('tools.shiftScheduler.notes', 'Notes')}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={editingId ? handleUpdateShift : handleAddShift}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" />
                    {editingId ? t('tools.shiftScheduler.update', 'Update') : t('tools.shiftScheduler.add', 'Add')}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ startTime: '09:00', endTime: '17:00', status: 'scheduled' });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    {t('tools.shiftScheduler.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Shifts List */}
            <div className="space-y-3">
              {filteredShifts.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.shiftScheduler.noShiftsFound', 'No shifts found')}</p>
                </div>
              ) : (
                filteredShifts.map(shift => (
                  <div key={shift.id} className={`p-4 rounded-lg border ${borderClass} ${hoverBgClass}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${textClass}`}>{shift.employeeName}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            shift.status === 'completed' ? 'bg-green-100 text-green-800' :
                            shift.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            shift.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {shift.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.date', 'Date')}</p>
                            <p className={textClass}>{formatDate(shift.date)}</p>
                          </div>
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.time', 'Time')}</p>
                            <p className={textClass}>{shift.startTime} - {shift.endTime} ({calculateShiftDuration(shift.startTime, shift.endTime)})</p>
                          </div>
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.position', 'Position')}</p>
                            <p className={textClass}>{shift.position}</p>
                          </div>
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.department', 'Department')}</p>
                            <p className={textClass}>{shift.department}</p>
                          </div>
                        </div>
                        {shift.notes && (
                          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Notes: {shift.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditShift(shift)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          } text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* EMPLOYEES TAB */}
        {activeTab === 'employees' && (
          <div>
            <button
              onClick={() => setEmployeeFormData({ department: 'General' })}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('tools.shiftScheduler.addEmployee', 'Add Employee')}
            </button>

            {/* Employee Form */}
            <div className={`p-6 rounded-lg border ${borderClass} ${bgClass} mb-6 space-y-4`}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('tools.shiftScheduler.fullName', 'Full Name')}
                  value={employeeFormData.name || ''}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />

                <input
                  type="email"
                  placeholder={t('tools.shiftScheduler.email2', 'Email')}
                  value={employeeFormData.email || ''}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />

                <input
                  type="tel"
                  placeholder={t('tools.shiftScheduler.phone2', 'Phone')}
                  value={employeeFormData.phone || ''}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />

                <input
                  type="text"
                  placeholder={t('tools.shiftScheduler.position3', 'Position')}
                  value={employeeFormData.position || ''}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, position: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />

                <select
                  value={employeeFormData.department || ''}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: e.target.value })}
                  className={`px-4 py-2 rounded-lg border ${borderClass} ${bgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.shiftScheduler.selectDepartment', 'Select Department')}</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  <option value="General">{t('tools.shiftScheduler.general', 'General')}</option>
                </select>
              </div>

              <button
                onClick={handleAddEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                {t('tools.shiftScheduler.addEmployee2', 'Add Employee')}
              </button>
            </div>

            {/* Employees List */}
            <div className="space-y-3">
              {filteredEmployees.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.shiftScheduler.noEmployeesFound', 'No employees found')}</p>
                </div>
              ) : (
                filteredEmployees.map(emp => (
                  <div key={emp.id} className={`p-4 rounded-lg border ${borderClass} ${hoverBgClass}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${textClass} mb-2`}>{emp.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.email', 'Email')}</p>
                            <p className={textClass}>{emp.email}</p>
                          </div>
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.phone', 'Phone')}</p>
                            <p className={textClass}>{emp.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.position2', 'Position')}</p>
                            <p className={textClass}>{emp.position}</p>
                          </div>
                          <div>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.department2', 'Department')}</p>
                            <p className={textClass}>{emp.department}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        } text-red-500`}
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

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className={`p-6 rounded-lg border ${borderClass} ${bgClass}`}>
            <h2 className={`text-lg font-semibold ${textClass} mb-4`}>{t('tools.shiftScheduler.shiftSchedule', 'Shift Schedule')}</h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const date = new Date(new Date().getFullYear(), new Date().getMonth(), i - new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() + 1);
                const dateStr = date.toISOString().split('T')[0];
                const dayShifts = shifts.filter(s => s.date === dateStr);

                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border min-h-20 ${
                      date.getMonth() === new Date().getMonth()
                        ? borderClass
                        : isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {date.getDate()}
                    </p>
                    <div className="text-xs space-y-1 mt-1">
                      {dayShifts.slice(0, 2).map(shift => (
                        <div key={shift.id} className="bg-[#0D9488] text-white p-1 rounded text-xs truncate">
                          {shift.employeeName}
                        </div>
                      ))}
                      {dayShifts.length > 2 && (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          +{dayShifts.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-6 rounded-lg border ${borderClass} ${bgClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.totalShifts', 'Total Shifts')}</p>
                  <p className={`text-3xl font-bold ${textClass}`}>{analytics.totalShifts}</p>
                </div>
                <Calendar className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${borderClass} ${bgClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.scheduled2', 'Scheduled')}</p>
                  <p className={`text-3xl font-bold ${textClass}`}>{analytics.scheduledShifts}</p>
                </div>
                <Clock className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${borderClass} ${bgClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.completed2', 'Completed')}</p>
                  <p className={`text-3xl font-bold ${textClass}`}>{analytics.completedShifts}</p>
                </div>
                <Check className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${borderClass} ${bgClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shiftScheduler.totalEmployees', 'Total Employees')}</p>
                  <p className={`text-3xl font-bold ${textClass}`}>{analytics.totalEmployees}</p>
                </div>
                <Users className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ShiftSchedulerTool;
