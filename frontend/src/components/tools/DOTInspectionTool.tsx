'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  ClipboardCheck,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BarChart3,
  FileText,
  User,
  MapPin,
  Clock,
  Camera,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na' | 'needs-attention';
  notes: string;
}

interface DOTInspection {
  id: string;
  inspectionNumber: string;
  inspectionType: 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5' | 'pre-trip' | 'post-trip' | 'annual';
  vehicleId: string;
  vehicleType: string;
  vin: string;
  licensePlate: string;
  trailerNumber: string | null;
  driverId: string;
  driverName: string;
  driverLicense: string;
  inspectorName: string;
  inspectorBadge: string;
  location: string;
  date: string;
  time: string;
  odometer: number;
  items: InspectionItem[];
  overallResult: 'pass' | 'fail' | 'out-of-service';
  violations: string[];
  correctiveActions: string[];
  defectsFound: number;
  criticalDefects: number;
  outOfService: boolean;
  oosReason: string | null;
  photos: string[];
  signature: string | null;
  notes: string;
  nextInspectionDue: string | null;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'inspections' | 'checklist' | 'violations' | 'reports';

const INSPECTION_TYPES: { value: DOTInspection['inspectionType']; label: string; description: string }[] = [
  { value: 'level-1', label: 'Level I - Full', description: 'North American Standard Inspection' },
  { value: 'level-2', label: 'Level II - Walk-Around', description: 'Walk-around driver/vehicle inspection' },
  { value: 'level-3', label: 'Level III - Driver Only', description: 'Driver credentials and log check' },
  { value: 'level-4', label: 'Level IV - Special', description: 'Special inspections (one-time)' },
  { value: 'level-5', label: 'Level V - Vehicle Only', description: 'Vehicle-only inspection (no driver)' },
  { value: 'pre-trip', label: 'Pre-Trip', description: 'Daily pre-trip inspection' },
  { value: 'post-trip', label: 'Post-Trip', description: 'Daily post-trip inspection' },
  { value: 'annual', label: 'Annual', description: 'Required annual inspection' },
];

const INSPECTION_CATEGORIES = [
  'Brake System',
  'Coupling Devices',
  'Exhaust System',
  'Frame',
  'Fuel System',
  'Lighting Devices',
  'Steering Mechanism',
  'Suspension',
  'Tires',
  'Wheels & Rims',
  'Windshield Wipers',
  'Emergency Equipment',
  'Load Securement',
  'Hazardous Materials',
];

const DEFAULT_INSPECTION_ITEMS: Omit<InspectionItem, 'id'>[] = [
  { category: 'Brake System', item: 'Service brakes', status: 'pass', notes: '' },
  { category: 'Brake System', item: 'Parking brake', status: 'pass', notes: '' },
  { category: 'Brake System', item: 'Brake hoses/lines', status: 'pass', notes: '' },
  { category: 'Brake System', item: 'ABS indicator light', status: 'pass', notes: '' },
  { category: 'Lighting Devices', item: 'Headlights', status: 'pass', notes: '' },
  { category: 'Lighting Devices', item: 'Tail lights', status: 'pass', notes: '' },
  { category: 'Lighting Devices', item: 'Turn signals', status: 'pass', notes: '' },
  { category: 'Lighting Devices', item: 'Brake lights', status: 'pass', notes: '' },
  { category: 'Lighting Devices', item: 'Clearance lights', status: 'pass', notes: '' },
  { category: 'Tires', item: 'Tire condition', status: 'pass', notes: '' },
  { category: 'Tires', item: 'Tire pressure', status: 'pass', notes: '' },
  { category: 'Tires', item: 'Tread depth', status: 'pass', notes: '' },
  { category: 'Steering Mechanism', item: 'Steering wheel play', status: 'pass', notes: '' },
  { category: 'Steering Mechanism', item: 'Power steering', status: 'pass', notes: '' },
  { category: 'Suspension', item: 'Springs', status: 'pass', notes: '' },
  { category: 'Suspension', item: 'Shock absorbers', status: 'pass', notes: '' },
  { category: 'Exhaust System', item: 'Exhaust leaks', status: 'pass', notes: '' },
  { category: 'Exhaust System', item: 'Muffler condition', status: 'pass', notes: '' },
  { category: 'Emergency Equipment', item: 'Fire extinguisher', status: 'pass', notes: '' },
  { category: 'Emergency Equipment', item: 'Warning triangles', status: 'pass', notes: '' },
  { category: 'Emergency Equipment', item: 'First aid kit', status: 'pass', notes: '' },
  { category: 'Windshield Wipers', item: 'Wiper operation', status: 'pass', notes: '' },
  { category: 'Windshield Wipers', item: 'Washer fluid', status: 'pass', notes: '' },
  { category: 'Coupling Devices', item: 'Fifth wheel', status: 'pass', notes: '' },
  { category: 'Coupling Devices', item: 'Pintle hook', status: 'pass', notes: '' },
  { category: 'Load Securement', item: 'Tie-downs', status: 'pass', notes: '' },
  { category: 'Load Securement', item: 'Load distribution', status: 'pass', notes: '' },
];

// Column configuration for exports
const INSPECTION_COLUMNS: ColumnConfig[] = [
  { key: 'inspectionNumber', header: 'Inspection #', type: 'string' },
  { key: 'inspectionType', header: 'Type', type: 'string', format: (value) => INSPECTION_TYPES.find(t => t.value === value)?.label || value },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'vehicleId', header: 'Vehicle', type: 'string' },
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'inspectorName', header: 'Inspector', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'overallResult', header: 'Result', type: 'string' },
  { key: 'defectsFound', header: 'Defects', type: 'number' },
  { key: 'outOfService', header: 'OOS', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Sample data
const generateSampleData = (): DOTInspection[] => [
  {
    id: '1',
    inspectionNumber: 'INS-2025-0001',
    inspectionType: 'pre-trip',
    vehicleId: 'TRK-101',
    vehicleType: 'Tractor-Trailer',
    vin: '1HGBH41JXMN109186',
    licensePlate: 'ABC-1234',
    trailerNumber: 'TRL-2501',
    driverId: 'DRV-001',
    driverName: 'John Smith',
    driverLicense: 'D1234567',
    inspectorName: 'John Smith',
    inspectorBadge: '',
    location: 'Phoenix Terminal',
    date: '2025-01-02',
    time: '05:30',
    odometer: 125450,
    items: DEFAULT_INSPECTION_ITEMS.map((item, idx) => ({ ...item, id: `item-${idx}` })),
    overallResult: 'pass',
    violations: [],
    correctiveActions: [],
    defectsFound: 0,
    criticalDefects: 0,
    outOfService: false,
    oosReason: null,
    photos: [],
    signature: 'John Smith',
    notes: 'All items in good condition',
    nextInspectionDue: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    inspectionNumber: 'INS-2024-1250',
    inspectionType: 'annual',
    vehicleId: 'TRK-101',
    vehicleType: 'Tractor-Trailer',
    vin: '1HGBH41JXMN109186',
    licensePlate: 'ABC-1234',
    trailerNumber: null,
    driverId: '',
    driverName: '',
    driverLicense: '',
    inspectorName: 'Mike Johnson (Certified)',
    inspectorBadge: 'INSP-4521',
    location: 'ABC Trucking Maintenance',
    date: '2024-06-15',
    time: '09:00',
    odometer: 98500,
    items: DEFAULT_INSPECTION_ITEMS.map((item, idx) => ({ ...item, id: `item-${idx}` })),
    overallResult: 'pass',
    violations: [],
    correctiveActions: [],
    defectsFound: 2,
    criticalDefects: 0,
    outOfService: false,
    oosReason: null,
    photos: [],
    signature: 'Mike Johnson',
    notes: 'Minor wear on brake pads - replaced. Tire tread within limits but recommend replacement within 30 days.',
    nextInspectionDue: '2025-06-15',
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-06-15T11:30:00Z',
  },
];

const emptyInspection: Omit<DOTInspection, 'id' | 'createdAt' | 'updatedAt'> = {
  inspectionNumber: '',
  inspectionType: 'pre-trip',
  vehicleId: '',
  vehicleType: '',
  vin: '',
  licensePlate: '',
  trailerNumber: null,
  driverId: '',
  driverName: '',
  driverLicense: '',
  inspectorName: '',
  inspectorBadge: '',
  location: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  odometer: 0,
  items: DEFAULT_INSPECTION_ITEMS.map((item, idx) => ({ ...item, id: `new-item-${idx}` })),
  overallResult: 'pass',
  violations: [],
  correctiveActions: [],
  defectsFound: 0,
  criticalDefects: 0,
  outOfService: false,
  oosReason: null,
  photos: [],
  signature: null,
  notes: '',
  nextInspectionDue: null,
};

export default function DOTInspectionTool() {
  const { t } = useTranslation();
  const {
    data: inspections,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    refresh,
  } = useToolData<DOTInspection>('dot-inspection', generateSampleData);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<TabType>('inspections');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<DOTInspection | null>(null);
  const [formData, setFormData] = useState<Omit<DOTInspection, 'id' | 'createdAt' | 'updatedAt'>>(emptyInspection);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtered inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      const matchesSearch =
        insp.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || insp.inspectionType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [inspections, searchQuery, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = inspections.length;
    const passed = inspections.filter((i) => i.overallResult === 'pass').length;
    const failed = inspections.filter((i) => i.overallResult === 'fail').length;
    const oos = inspections.filter((i) => i.outOfService).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const totalDefects = inspections.reduce((sum, i) => sum + i.defectsFound, 0);
    return { total, passed, failed, oos, passRate, totalDefects };
  }, [inspections]);

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    // Calculate defects and result
    const defects = formData.items.filter((i) => i.status === 'fail').length;
    const criticalDefects = formData.items.filter((i) => i.status === 'fail' && ['Brake System', 'Steering Mechanism', 'Tires'].includes(i.category)).length;
    const overallResult = criticalDefects > 0 ? 'out-of-service' : defects > 0 ? 'fail' : 'pass';

    const inspectionData = {
      ...formData,
      defectsFound: defects,
      criticalDefects,
      overallResult,
      outOfService: criticalDefects > 0,
      oosReason: criticalDefects > 0 ? 'Critical safety defects found' : null,
    };

    if (editingInspection) {
      await updateItem(editingInspection.id, { ...inspectionData, updatedAt: now });
    } else {
      await addItem({
        ...inspectionData,
        id: `insp-${Date.now()}`,
        inspectionNumber: formData.inspectionNumber || `INS-${new Date().getFullYear()}-${String(inspections.length + 1).padStart(4, '0')}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyInspection);
    setEditingInspection(null);
    setIsFormOpen(false);
    setSelectedCategory('all');
  };

  const handleEdit = (inspection: DOTInspection) => {
    setEditingInspection(inspection);
    setFormData({ ...inspection });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Inspection',
      message: 'Are you sure you want to delete this inspection?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
    }
  };

  const updateItemStatus = (itemId: string, status: InspectionItem['status']) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    });
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId ? { ...item, notes } : item
      ),
    });
  };

  const getResultColor = (result: DOTInspection['overallResult']) => {
    if (result === 'pass') return 'green';
    if (result === 'fail') return 'yellow';
    return 'red';
  };

  const getStatusIcon = (status: InspectionItem['status']) => {
    if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'needs-attention') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <span className="w-5 h-5 text-gray-400">N/A</span>;
  };

  const filteredItems = selectedCategory === 'all'
    ? formData.items
    : formData.items.filter((i) => i.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-orange-600" />
            {t('tools.dOTInspection.dotInspection', 'DOT Inspection')}
          </h1>
          <p className="text-gray-600 mt-1">{t('tools.dOTInspection.vehicleInspectionRecordsAndCompliance', 'Vehicle inspection records and compliance')}</p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="d-o-t-inspection" toolName="D O T Inspection" />

          <SyncStatus state={syncState} onRetry={refresh} />
          <ExportDropdown
            data={filteredInspections}
            filename="dot-inspections"
            columns={INSPECTION_COLUMNS}
          />
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.dOTInspection.newInspection', 'New Inspection')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.total', 'Total')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.passed', 'Passed')}</p>
              <p className="text-xl font-bold text-green-600">{stats.passed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.failed', 'Failed')}</p>
              <p className="text-xl font-bold text-yellow-600">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.outOfService', 'Out of Service')}</p>
              <p className="text-xl font-bold text-red-600">{stats.oos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.passRate', 'Pass Rate')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.passRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.totalDefects', 'Total Defects')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDefects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {(['inspections', 'checklist', 'violations', 'reports'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'inspections' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.dOTInspection.searchInspections', 'Search inspections...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">{t('tools.dOTInspection.allTypes', 'All Types')}</option>
            {INSPECTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Inspections List */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          {filteredInspections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('tools.dOTInspection.noInspectionsFound', 'No inspections found')}</h3>
              <p className="text-gray-500 mt-1">{t('tools.dOTInspection.createANewInspectionTo', 'Create a new inspection to get started')}</p>
            </div>
          ) : (
            filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${getResultColor(inspection.overallResult)}-100`}>
                      {inspection.overallResult === 'pass' ? (
                        <CheckCircle2 className={`w-6 h-6 text-${getResultColor(inspection.overallResult)}-600`} />
                      ) : inspection.overallResult === 'fail' ? (
                        <AlertTriangle className={`w-6 h-6 text-${getResultColor(inspection.overallResult)}-600`} />
                      ) : (
                        <XCircle className={`w-6 h-6 text-${getResultColor(inspection.overallResult)}-600`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{inspection.inspectionNumber}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${getResultColor(inspection.overallResult)}-100 text-${getResultColor(inspection.overallResult)}-700`}>
                          {inspection.overallResult === 'out-of-service' ? 'Out of Service' : inspection.overallResult.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{INSPECTION_TYPES.find((t) => t.value === inspection.inspectionType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-900">{inspection.date}</p>
                      <p className="text-gray-500">{inspection.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(inspection)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inspection.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {inspection.vehicleId}
                  </div>
                  {inspection.driverName && (
                    <>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {inspection.driverName}
                      </div>
                    </>
                  )}
                  <span className="text-gray-400">|</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {inspection.location}
                  </div>
                  <span className="text-gray-400">|</span>
                  <span>Defects: {inspection.defectsFound}</span>
                  {inspection.nextInspectionDue && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="text-orange-600">Next due: {inspection.nextInspectionDue}</span>
                    </>
                  )}
                </div>
                {inspection.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">{inspection.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.dOTInspection.standardInspectionChecklist', 'Standard Inspection Checklist')}</h3>
          <div className="space-y-4">
            {INSPECTION_CATEGORIES.map((category) => (
              <div key={category}>
                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DEFAULT_INSPECTION_ITEMS
                    .filter((i) => i.category === category)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{item.item}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.dOTInspection.violationHistory', 'Violation History')}</h3>
          {inspections.filter((i) => i.violations.length > 0).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">{t('tools.dOTInspection.noViolationsRecorded', 'No violations recorded')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections
                .filter((i) => i.violations.length > 0)
                .map((i) => (
                  <div key={i.id} className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium">{i.inspectionNumber}</p>
                    <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                      {i.violations.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            {t('tools.dOTInspection.inspectionReports', 'Inspection Reports')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.totalInspections', 'Total Inspections')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.passRate2', 'Pass Rate')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.passRate}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{t('tools.dOTInspection.outOfServiceRate', 'Out of Service Rate')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.total > 0 ? Math.round((stats.oos / stats.total) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingInspection ? t('tools.dOTInspection.editInspection', 'Edit Inspection') : t('tools.dOTInspection.newDotInspection', 'New DOT Inspection')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.inspectionType', 'Inspection Type')}</label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value as DOTInspection['inspectionType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {INSPECTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.date', 'Date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.time', 'Time')}</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.location', 'Location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.vehicleId', 'Vehicle ID')}</label>
                  <input
                    type="text"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.vin', 'VIN')}</label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.licensePlate', 'License Plate')}</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.odometer', 'Odometer')}</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Inspector Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.inspectorName', 'Inspector Name')}</label>
                  <input
                    type="text"
                    value={formData.inspectorName}
                    onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.driverName', 'Driver Name')}</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.driverLicense', 'Driver License')}</label>
                  <input
                    type="text"
                    value={formData.driverLicense}
                    onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Inspection Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">{t('tools.dOTInspection.inspectionChecklist', 'Inspection Checklist')}</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">{t('tools.dOTInspection.allCategories', 'All Categories')}</option>
                    {INSPECTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.item}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {['pass', 'fail', 'needs-attention', 'na'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateItemStatus(item.id, status as InspectionItem['status'])}
                            className={`p-1 rounded ${item.status === status ? 'ring-2 ring-offset-1' : ''} ${
                              status === 'pass' ? 'ring-green-500' :
                              status === 'fail' ? 'ring-red-500' :
                              status === 'needs-attention' ? 'ring-yellow-500' : 'ring-gray-500'
                            }`}
                            title={status}
                          >
                            {status === 'pass' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {status === 'fail' && <XCircle className="w-5 h-5 text-red-500" />}
                            {status === 'needs-attention' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                            {status === 'na' && <span className="w-5 h-5 text-gray-400 text-xs flex items-center justify-center">N/A</span>}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={t('tools.dOTInspection.notes2', 'Notes')}
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.dOTInspection.notes', 'Notes')}</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('tools.dOTInspection.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Save className="w-4 h-4" />
                {editingInspection ? t('tools.dOTInspection.updateInspection', 'Update Inspection') : t('tools.dOTInspection.completeInspection', 'Complete Inspection')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}

export { DOTInspectionTool };
