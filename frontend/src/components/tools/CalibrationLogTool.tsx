import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Gauge,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Edit,
  Trash2,
  FileText,
  Wrench,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';

interface CalibrationRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  serialNumber: string;
  location: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  calibrationType: 'scheduled' | 'post-repair' | 'initial' | 'verification';
  standard: string;
  standardCertificate: string;
  technician: string;
  result: 'pass' | 'fail' | 'adjusted' | 'out-of-tolerance';
  beforeReading: number;
  afterReading: number;
  tolerance: number;
  unit: string;
  deviation: number;
  adjustmentsMade: string;
  certificate: string;
  notes: string;
  createdAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'equipmentId', header: 'Equipment ID', width: 15 },
  { key: 'equipmentName', header: 'Equipment Name', width: 20 },
  { key: 'serialNumber', header: 'Serial Number', width: 15 },
  { key: 'calibrationDate', header: 'Calibration Date', width: 12 },
  { key: 'nextCalibrationDate', header: 'Next Due', width: 12 },
  { key: 'calibrationType', header: 'Type', width: 12 },
  { key: 'technician', header: 'Technician', width: 15 },
  { key: 'result', header: 'Result', width: 12 },
  { key: 'beforeReading', header: 'Before Reading', width: 12 },
  { key: 'afterReading', header: 'After Reading', width: 12 },
  { key: 'tolerance', header: 'Tolerance', width: 10 },
  { key: 'deviation', header: 'Deviation', width: 10 },
  { key: 'certificate', header: 'Certificate', width: 15 },
];

const generateSampleData = (): CalibrationRecord[] => [
  {
    id: 'CAL-001',
    equipmentId: 'EQ-MIC-001',
    equipmentName: 'Digital Micrometer',
    equipmentType: 'Measuring Instrument',
    serialNumber: 'MIT-2024-0012',
    location: 'Quality Lab',
    calibrationDate: '2024-01-15',
    nextCalibrationDate: '2025-01-15',
    calibrationType: 'scheduled',
    standard: 'Gauge Block Set Grade 1',
    standardCertificate: 'NIST-2023-4521',
    technician: 'John Smith',
    result: 'pass',
    beforeReading: 25.001,
    afterReading: 25.000,
    tolerance: 0.002,
    unit: 'mm',
    deviation: 0.001,
    adjustmentsMade: 'None required',
    certificate: 'CAL-CERT-2024-001',
    notes: 'Annual calibration completed successfully',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'CAL-002',
    equipmentId: 'EQ-PRE-003',
    equipmentName: 'Pressure Gauge',
    equipmentType: 'Process Instrument',
    serialNumber: 'PRE-2023-0089',
    location: 'Production Floor A',
    calibrationDate: '2024-01-10',
    nextCalibrationDate: '2024-07-10',
    calibrationType: 'scheduled',
    standard: 'Dead Weight Tester',
    standardCertificate: 'NIST-2023-7892',
    technician: 'Maria Garcia',
    result: 'adjusted',
    beforeReading: 102.5,
    afterReading: 100.0,
    tolerance: 1.0,
    unit: 'PSI',
    deviation: 2.5,
    adjustmentsMade: 'Zero point adjusted, span recalibrated',
    certificate: 'CAL-CERT-2024-002',
    notes: 'Required adjustment due to drift',
    createdAt: '2024-01-10T14:30:00Z',
  },
  {
    id: 'CAL-003',
    equipmentId: 'EQ-TMP-007',
    equipmentName: 'RTD Temperature Sensor',
    equipmentType: 'Temperature Instrument',
    serialNumber: 'RTD-2022-0156',
    location: 'Heat Treatment',
    calibrationDate: '2024-01-08',
    nextCalibrationDate: '2024-04-08',
    calibrationType: 'post-repair',
    standard: 'Temperature Bath',
    standardCertificate: 'NIST-2023-3345',
    technician: 'Robert Chen',
    result: 'pass',
    beforeReading: 150.2,
    afterReading: 150.0,
    tolerance: 0.5,
    unit: '°C',
    deviation: 0.2,
    adjustmentsMade: 'Replaced sensor element',
    certificate: 'CAL-CERT-2024-003',
    notes: 'Post-repair calibration after sensor replacement',
    createdAt: '2024-01-08T09:15:00Z',
  },
];

const CalibrationLogTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: calibrations,
    setData: setCalibrations,
    isLoading: loading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
  } = useToolData<CalibrationRecord>('calibration-log', generateSampleData(), columns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCalibration, setEditingCalibration] = useState<CalibrationRecord | null>(null);
  const [formData, setFormData] = useState<Partial<CalibrationRecord>>({});

  const filteredCalibrations = calibrations.filter((cal) => {
    const matchesSearch =
      cal.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cal.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cal.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cal.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResult = filterResult === 'all' || cal.result === filterResult;
    const matchesType = filterType === 'all' || cal.calibrationType === filterType;
    return matchesSearch && matchesResult && matchesType;
  });

  // Calculate stats
  const totalCalibrations = calibrations.length;
  const passCount = calibrations.filter((c) => c.result === 'pass').length;
  const overdueCount = calibrations.filter(
    (c) => new Date(c.nextCalibrationDate) < new Date()
  ).length;
  const dueSoonCount = calibrations.filter((c) => {
    const dueDate = new Date(c.nextCalibrationDate);
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return dueDate > today && dueDate <= thirtyDays;
  }).length;

  const handleSave = () => {
    if (editingCalibration) {
      updateItem(editingCalibration.id, formData);
    } else {
      const newCalibration: CalibrationRecord = {
        id: `CAL-${String(calibrations.length + 1).padStart(3, '0')}`,
        equipmentId: formData.equipmentId || '',
        equipmentName: formData.equipmentName || '',
        equipmentType: formData.equipmentType || '',
        serialNumber: formData.serialNumber || '',
        location: formData.location || '',
        calibrationDate: formData.calibrationDate || new Date().toISOString().split('T')[0],
        nextCalibrationDate: formData.nextCalibrationDate || '',
        calibrationType: formData.calibrationType || 'scheduled',
        standard: formData.standard || '',
        standardCertificate: formData.standardCertificate || '',
        technician: formData.technician || '',
        result: formData.result || 'pass',
        beforeReading: formData.beforeReading || 0,
        afterReading: formData.afterReading || 0,
        tolerance: formData.tolerance || 0,
        unit: formData.unit || '',
        deviation: formData.deviation || 0,
        adjustmentsMade: formData.adjustmentsMade || '',
        certificate: formData.certificate || '',
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
      };
      addItem(newCalibration);
    }
    setShowModal(false);
    setEditingCalibration(null);
    setFormData({});
  };

  const handleEdit = (calibration: CalibrationRecord) => {
    setEditingCalibration(calibration);
    setFormData(calibration);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Calibration Record',
      message: 'Are you sure you want to delete this calibration record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getResultBadge = (result: CalibrationRecord['result']) => {
    const styles = {
      pass: isDark
        ? 'bg-green-900/50 text-green-300 border-green-700'
        : 'bg-green-100 text-green-800 border-green-300',
      fail: isDark
        ? 'bg-red-900/50 text-red-300 border-red-700'
        : 'bg-red-100 text-red-800 border-red-300',
      adjusted: isDark
        ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
        : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'out-of-tolerance': isDark
        ? 'bg-orange-900/50 text-orange-300 border-orange-700'
        : 'bg-orange-100 text-orange-800 border-orange-300',
    };
    const labels = {
      pass: 'Pass',
      fail: 'Fail',
      adjusted: 'Adjusted',
      'out-of-tolerance': 'Out of Tolerance',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[result]}`}>
        {labels[result]}
      </span>
    );
  };

  const getTypeBadge = (type: CalibrationRecord['calibrationType']) => {
    const styles = {
      scheduled: isDark
        ? 'bg-blue-900/50 text-blue-300'
        : 'bg-blue-100 text-blue-800',
      'post-repair': isDark
        ? 'bg-purple-900/50 text-purple-300'
        : 'bg-purple-100 text-purple-800',
      initial: isDark
        ? 'bg-green-900/50 text-green-300'
        : 'bg-green-100 text-green-800',
      verification: isDark
        ? 'bg-gray-700 text-gray-300'
        : 'bg-gray-100 text-gray-800',
    };
    const labels = {
      scheduled: 'Scheduled',
      'post-repair': 'Post-Repair',
      initial: 'Initial',
      verification: 'Verification',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const getDueStatus = (nextDate: string) => {
    const dueDate = new Date(nextDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <AlertTriangle className="w-3 h-3" /> Overdue
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
          <Clock className="w-3 h-3" /> Due in {diffDays} days
        </span>
      );
    }
    return (
      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
        <CheckCircle className="w-3 h-3" /> Current
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
            <Gauge className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.calibrationLog.calibrationLog', 'Calibration Log')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.calibrationLog.equipmentCalibrationTrackingAndManagement', 'Equipment calibration tracking and management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="calibration-log" toolName="Calibration Log" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            data={calibrations}
            columns={columns}
            filename="calibration-log"
          />
          <button
            onClick={() => {
              setEditingCalibration(null);
              setFormData({});
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
            {t('tools.calibrationLog.newCalibration', 'New Calibration')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.calibrationLog.totalCalibrations', 'Total Calibrations')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalCalibrations}
              </p>
            </div>
            <FileText className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.calibrationLog.passRate', 'Pass Rate')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {totalCalibrations > 0 ? ((passCount / totalCalibrations) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <Target className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.calibrationLog.overdue', 'Overdue')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {overdueCount}
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.calibrationLog.dueSoon', 'Due Soon')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {dueSoonCount}
              </p>
            </div>
            <Clock className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.calibrationLog.searchEquipmentIdSerialNumber', 'Search equipment, ID, serial number, technician...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.calibrationLog.allResults', 'All Results')}</option>
              <option value="pass">{t('tools.calibrationLog.pass', 'Pass')}</option>
              <option value="fail">{t('tools.calibrationLog.fail', 'Fail')}</option>
              <option value="adjusted">{t('tools.calibrationLog.adjusted', 'Adjusted')}</option>
              <option value="out-of-tolerance">{t('tools.calibrationLog.outOfTolerance', 'Out of Tolerance')}</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.calibrationLog.allTypes', 'All Types')}</option>
              <option value="scheduled">{t('tools.calibrationLog.scheduled', 'Scheduled')}</option>
              <option value="post-repair">{t('tools.calibrationLog.postRepair', 'Post-Repair')}</option>
              <option value="initial">Initial</option>
              <option value="verification">{t('tools.calibrationLog.verification', 'Verification')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calibration Table */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.equipment', 'Equipment')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.location', 'Location')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.calibration', 'Calibration')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.type', 'Type')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.readings', 'Readings')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.result', 'Result')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.status', 'Status')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  {t('tools.calibrationLog.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredCalibrations.map((cal) => (
                <tr key={cal.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {cal.equipmentName}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {cal.equipmentId} | SN: {cal.serialNumber}
                      </p>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {cal.location}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(cal.calibrationDate).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Next: {new Date(cal.nextCalibrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getTypeBadge(cal.calibrationType)}</td>
                  <td className="px-4 py-4">
                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>Before: {cal.beforeReading} {cal.unit}</p>
                      <p>After: {cal.afterReading} {cal.unit}</p>
                      <p className={`${Math.abs(cal.deviation) > cal.tolerance ? (isDark ? 'text-red-400' : 'text-red-600') : ''}`}>
                        Dev: {cal.deviation} (Tol: ±{cal.tolerance})
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getResultBadge(cal.result)}</td>
                  <td className="px-4 py-4">{getDueStatus(cal.nextCalibrationDate)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cal)}
                        className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'text-gray-600'}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cal.id)}
                        className={`p-1 rounded hover:bg-red-100 ${isDark ? 'hover:bg-red-900/50 text-red-400' : 'text-red-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCalibrations.length === 0 && (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Gauge className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.calibrationLog.noCalibrationRecordsFound', 'No calibration records found')}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingCalibration ? t('tools.calibrationLog.editCalibrationRecord', 'Edit Calibration Record') : t('tools.calibrationLog.newCalibrationRecord', 'New Calibration Record')}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCalibration(null);
                  setFormData({});
                }}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.equipmentId', 'Equipment ID *')}
                  </label>
                  <input
                    type="text"
                    value={formData.equipmentId || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.equipmentName', 'Equipment Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.serialNumber', 'Serial Number *')}
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.location2', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.calibrationDate', 'Calibration Date *')}
                  </label>
                  <input
                    type="date"
                    value={formData.calibrationDate || ''}
                    onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.nextCalibrationDate', 'Next Calibration Date *')}
                  </label>
                  <input
                    type="date"
                    value={formData.nextCalibrationDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextCalibrationDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.calibrationType', 'Calibration Type *')}
                  </label>
                  <select
                    value={formData.calibrationType || 'scheduled'}
                    onChange={(e) => setFormData({ ...formData, calibrationType: e.target.value as CalibrationRecord['calibrationType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="scheduled">{t('tools.calibrationLog.scheduled2', 'Scheduled')}</option>
                    <option value="post-repair">{t('tools.calibrationLog.postRepair2', 'Post-Repair')}</option>
                    <option value="initial">Initial</option>
                    <option value="verification">{t('tools.calibrationLog.verification2', 'Verification')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.result2', 'Result *')}
                  </label>
                  <select
                    value={formData.result || 'pass'}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value as CalibrationRecord['result'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="pass">{t('tools.calibrationLog.pass2', 'Pass')}</option>
                    <option value="fail">{t('tools.calibrationLog.fail2', 'Fail')}</option>
                    <option value="adjusted">{t('tools.calibrationLog.adjusted2', 'Adjusted')}</option>
                    <option value="out-of-tolerance">{t('tools.calibrationLog.outOfTolerance2', 'Out of Tolerance')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.beforeReading', 'Before Reading')}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.beforeReading || ''}
                    onChange={(e) => setFormData({ ...formData, beforeReading: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.afterReading', 'After Reading')}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.afterReading || ''}
                    onChange={(e) => setFormData({ ...formData, afterReading: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.tolerance', 'Tolerance')}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.tolerance || ''}
                    onChange={(e) => setFormData({ ...formData, tolerance: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.unit', 'Unit')}
                  </label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.calibrationLog.mmPsiC', 'mm, PSI, °C...')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.technician', 'Technician *')}
                  </label>
                  <input
                    type="text"
                    value={formData.technician || ''}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.standardUsed', 'Standard Used')}
                  </label>
                  <input
                    type="text"
                    value={formData.standard || ''}
                    onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.calibrationLog.certificateNumber', 'Certificate Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.certificate || ''}
                    onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.calibrationLog.adjustmentsMade', 'Adjustments Made')}
                </label>
                <textarea
                  value={formData.adjustmentsMade || ''}
                  onChange={(e) => setFormData({ ...formData, adjustmentsMade: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.calibrationLog.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCalibration(null);
                  setFormData({});
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('tools.calibrationLog.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {editingCalibration ? t('tools.calibrationLog.update', 'Update') : t('tools.calibrationLog.create', 'Create')} Record
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default CalibrationLogTool;
