import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  Briefcase,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  UserPlus,
  AlertCircle,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  FileText,
  Contact,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData } from '../../hooks/useToolData';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department_id?: string;
  department_name?: string;
  position: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  employee_count?: number;
}

interface EmployeeDatabaseToolProps {
  uiConfig?: UIConfig;
}

const employeeStatuses = [
  { value: 'active', label: 'Active', color: 'green', icon: UserCheck },
  { value: 'on_leave', label: 'On Leave', color: 'yellow', icon: Clock },
  { value: 'terminated', label: 'Terminated', color: 'red', icon: UserX },
];

// Column configuration for export
const employeeColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'department_name', header: 'Department', type: 'string' },
  { key: 'hire_date', header: 'Hire Date', type: 'date' },
  { key: 'salary', header: 'Salary', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'emergency_contact_name', header: 'Emergency Contact', type: 'string' },
  { key: 'emergency_contact_phone', header: 'Emergency Phone', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const EmployeeDatabaseTool: React.FC<EmployeeDatabaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for employees
  const {
    data: employees,
    addItem: addEmployee,
    updateItem: updateEmployee,
    deleteItem: deleteEmployee,
    isLoading: isLoadingEmployees,
    isSaving,
    isSynced,
    syncError,
    lastSaved,
  } = useToolData<Employee>('employee-database', [], employeeColumns);

  // Main state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(isLoadingEmployees);
  const [error, setError] = useState<string | null>(syncError);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Employee form state
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: 0,
    status: 'active' as Employee['status'],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    notes: '',
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
  });

  // Sync loading and error states from hook
  useEffect(() => {
    setLoading(isLoadingEmployees);
  }, [isLoadingEmployees]);

  useEffect(() => {
    if (syncError) {
      setError(syncError);
    }
  }, [syncError]);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData || uiConfig?.params) {
      const prefill = uiConfig.prefillData || uiConfig.params;
      if (prefill) {
        setEmployeeForm(prev => ({
          ...prev,
          name: prefill.name || prev.name,
          email: prefill.email || prev.email,
          phone: prefill.phone || prev.phone,
          position: prefill.position || prefill.title || prev.position,
          salary: prefill.salary || prefill.amount || prev.salary,
        }));
        if (prefill.name || prefill.email) {
          setShowEmployeeModal(true);
        }
      }
    }
  }, [uiConfig]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await api.get('/business/departments');
      setDepartments(response.items || response.data || response || []);
    } catch (err: any) {
      console.error('Failed to fetch departments:', err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Stats computed from employees
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const onLeave = employees.filter(e => e.status === 'on_leave').length;
    const terminated = employees.filter(e => e.status === 'terminated').length;

    const byDepartment: Record<string, number> = {};
    employees.forEach(e => {
      const deptName = e.department_name || 'Unassigned';
      byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;
    });

    return { total, active, onLeave, terminated, byDepartment };
  }, [employees]);

  // Employee modal handlers
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      name: '',
      email: '',
      phone: '',
      department_id: '',
      position: '',
      hire_date: new Date().toISOString().split('T')[0],
      salary: 0,
      status: 'active',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      notes: '',
    });
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      department_id: employee.department_id || '',
      position: employee.position,
      hire_date: employee.hire_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      salary: employee.salary || 0,
      status: employee.status,
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_phone: employee.emergency_contact_phone || '',
      emergency_contact_relationship: employee.emergency_contact_relationship || '',
      notes: employee.notes || '',
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.name.trim() || !employeeForm.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      setError(null);

      const payload = {
        ...employeeForm,
        salary: Number(employeeForm.salary) || 0,
        id: editingEmployee?.id || `emp_${Date.now()}`,
        created_at: editingEmployee?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingEmployee) {
        updateEmployee(editingEmployee.id, payload);
      } else {
        addEmployee(payload as Employee);
      }

      setShowEmployeeModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      deleteEmployee(id);
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
    }
  };

  // Department handlers
  const handleAddDepartment = () => {
    setDepartmentForm({ name: '', description: '' });
    setShowDepartmentModal(true);
  };

  const handleSaveDepartment = async () => {
    if (!departmentForm.name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setSavingDepartment(true);
      setError(null);
      await api.post('/business/departments', departmentForm);
      setShowDepartmentModal(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to save department');
    } finally {
      setSavingDepartment(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = employeeStatuses.find(s => s.value === status);
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[statusObj?.color || 'green'];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-white to-blue-50 border-gray-100'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.employeeDatabase.employeeDatabase', 'Employee Database')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.employeeDatabase.manageYourEmployeesAndDepartments', 'Manage your employees and departments')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'employees' && (
              <>
                <WidgetEmbedButton toolSlug="employee-database" toolName="Employee Database" />
                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
              </>
            )}
            {activeTab === 'employees' && employees.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportToCSV(employees, employeeColumns, { filename: 'employees' })}
                onExportExcel={() => exportToExcel(employees, employeeColumns, { filename: 'employees' })}
                onExportJSON={() => exportToJSON(employees, { filename: 'employees' })}
                onExportPDF={() => exportToPDF(employees, employeeColumns, { filename: 'employees', title: 'Employee Database', subtitle: `Total: ${employees.length} employees` })}
                onPrint={() => printData(employees, employeeColumns, { title: 'Employee Database' })}
                onCopyToClipboard={() => copyUtil(employees, employeeColumns)}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
            {activeTab === 'employees' ? (
              <button
                onClick={handleAddEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                {t('tools.employeeDatabase.addEmployee', 'Add Employee')}
              </button>
            ) : (
              <button
                onClick={handleAddDepartment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.employeeDatabase.addDepartment', 'Add Department')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'employees'
              ? `border-b-2 border-blue-500 text-blue-500`
              : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Employees ({stats.total})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'departments'
              ? `border-b-2 border-blue-500 text-blue-500`
              : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Building className="w-4 h-4" />
            Departments ({departments.length})
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-4 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.totalEmployees', 'Total Employees')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.active', 'Active')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-2xl font-bold text-yellow-500">{stats.onLeave}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.onLeave', 'On Leave')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-2xl font-bold text-blue-500">{departments.length}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.departments', 'Departments')}</p>
        </div>
      </div>

      {activeTab === 'employees' && (
        <>
          {/* Search & Filters */}
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.employeeDatabase.searchEmployeesByNameEmail', 'Search employees by name, email, or position...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="flex gap-3">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">{t('tools.employeeDatabase.allDepartments', 'All Departments')}</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">{t('tools.employeeDatabase.allStatuses', 'All Statuses')}</option>
                  {employeeStatuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Employee List */}
          <div className="px-4 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : employees.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('tools.employeeDatabase.noEmployeesFound', 'No employees found')}</p>
                <button onClick={handleAddEmployee} className="mt-2 text-blue-500 hover:underline">
                  {t('tools.employeeDatabase.addYourFirstEmployee', 'Add your first employee')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => setSelectedEmployee(selectedEmployee?.id === employee.id ? null : employee)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedEmployee?.id === employee.id
                        ? `${isDark ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-300'}`
                        : `${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {employee.name}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                            {employeeStatuses.find(s => s.value === employee.status)?.label}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {employee.position}
                          </span>
                          {employee.department_name && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" /> {employee.department_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {employee.email}
                          </span>
                          {employee.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {employee.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatCurrency(employee.salary)}/yr
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditEmployee(employee); }}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(employee.id); }}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Employee Details */}
                    {selectedEmployee?.id === employee.id && (
                      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.hireDate', 'Hire Date')}</p>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {formatDate(employee.hire_date)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.salary', 'Salary')}</p>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <DollarSign className="w-3 h-3 inline mr-1" />
                              {formatCurrency(employee.salary)}/year
                            </p>
                          </div>
                          {employee.emergency_contact_name && (
                            <div className="col-span-2">
                              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.emergencyContact', 'Emergency Contact')}</p>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Contact className="w-3 h-3 inline mr-1" />
                                {employee.emergency_contact_name}
                                {employee.emergency_contact_relationship && ` (${employee.emergency_contact_relationship})`}
                                {employee.emergency_contact_phone && ` - ${employee.emergency_contact_phone}`}
                              </p>
                            </div>
                          )}
                          {employee.notes && (
                            <div className="col-span-2 md:col-span-4">
                              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.employeeDatabase.notes', 'Notes')}</p>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <FileText className="w-3 h-3 inline mr-1" />
                                {employee.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'departments' && (
        <div className="p-4">
          {departments.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('tools.employeeDatabase.noDepartmentsFound', 'No departments found')}</p>
              <button onClick={handleAddDepartment} className="mt-2 text-blue-500 hover:underline">
                {t('tools.employeeDatabase.addYourFirstDepartment', 'Add your first department')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const employeeCount = employees.filter(e => e.department_id === dept.id).length;
                return (
                  <div
                    key={dept.id}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {dept.name}
                        </h4>
                        {dept.description && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {dept.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm">
                        <Users className="w-3 h-3" />
                        {employeeCount}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b sticky top-0 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingEmployee ? t('tools.employeeDatabase.editEmployee', 'Edit Employee') : t('tools.employeeDatabase.addEmployee2', 'Add Employee')}
              </h3>
              <button onClick={() => setShowEmployeeModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.employeeDatabase.basicInformation', 'Basic Information')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.fullName', 'Full Name *')}
                    </label>
                    <input
                      type="text"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder={t('tools.employeeDatabase.johnDoe', 'John Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder={t('tools.employeeDatabase.johnCompanyCom', 'john@company.com')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={employeeForm.phone}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.status', 'Status')}
                    </label>
                    <select
                      value={employeeForm.status}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as Employee['status'] })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      {employeeStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.employeeDatabase.jobInformation', 'Job Information')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.department', 'Department')}
                    </label>
                    <select
                      value={employeeForm.department_id}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, department_id: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      <option value="">{t('tools.employeeDatabase.selectDepartment', 'Select Department')}</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.position', 'Position *')}
                    </label>
                    <input
                      type="text"
                      value={employeeForm.position}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder={t('tools.employeeDatabase.softwareEngineer', 'Software Engineer')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.hireDate2', 'Hire Date')}
                    </label>
                    <input
                      type="date"
                      value={employeeForm.hire_date}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, hire_date: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.annualSalary', 'Annual Salary ($)')}
                    </label>
                    <input
                      type="number"
                      value={employeeForm.salary || ''}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="75000"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.employeeDatabase.emergencyContact2', 'Emergency Contact')}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.contactName', 'Contact Name')}
                    </label>
                    <input
                      type="text"
                      value={employeeForm.emergency_contact_name}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, emergency_contact_name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder={t('tools.employeeDatabase.janeDoe', 'Jane Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.contactPhone', 'Contact Phone')}
                    </label>
                    <input
                      type="tel"
                      value={employeeForm.emergency_contact_phone}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, emergency_contact_phone: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.employeeDatabase.relationship', 'Relationship')}
                    </label>
                    <input
                      type="text"
                      value={employeeForm.emergency_contact_relationship}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, emergency_contact_relationship: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder={t('tools.employeeDatabase.spouse', 'Spouse')}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.employeeDatabase.notesDocumentNotes', 'Notes / Document Notes')}
                </label>
                <textarea
                  value={employeeForm.notes}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.employeeDatabase.additionalNotesCertificationsDocumentReferences', 'Additional notes, certifications, document references...')}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t sticky bottom-0 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.employeeDatabase.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveEmployee}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? t('tools.employeeDatabase.saving', 'Saving...') : t('tools.employeeDatabase.saveEmployee', 'Save Employee')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.employeeDatabase.addDepartment2', 'Add Department')}
              </h3>
              <button onClick={() => setShowDepartmentModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.employeeDatabase.departmentName', 'Department Name *')}
                </label>
                <input
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.employeeDatabase.engineering', 'Engineering')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.employeeDatabase.description', 'Description')}
                </label>
                <textarea
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.employeeDatabase.departmentDescription', 'Department description...')}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowDepartmentModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.employeeDatabase.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveDepartment}
                disabled={savingDepartment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {savingDepartment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingDepartment ? t('tools.employeeDatabase.saving2', 'Saving...') : t('tools.employeeDatabase.saveDepartment', 'Save Department')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default EmployeeDatabaseTool;
