'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Wrench,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  Camera,
  FileText,
  DollarSign,
  Package,
  ClipboardList,
  Shield,
  RefreshCw,
  Truck,
  Plus,
  Trash2,
  Save,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Edit,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

// Types
interface Material {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface LaborEntry {
  id: string;
  description: string;
  hours: number;
  rate: number;
  totalCost: number;
}

interface PhotoEntry {
  id: string;
  type: 'before' | 'after';
  description: string;
  timestamp: string;
}

interface RecurringSchedule {
  enabled: boolean;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextServiceDate: string;
  notes: string;
}

interface WarrantyInfo {
  laborWarranty: string;
  partsWarranty: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyNotes: string;
}

interface WorkOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceAddress: string;
  serviceCity: string;
  serviceState: string;
  serviceZip: string;
  jobType: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'dispatched' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  dispatchTime: string;
  arrivalTime: string;
  completionTime: string;
  technicianName: string;
  technicianId: string;
  jobDescription: string;
  diagnosticFindings: string;
  workPerformed: string;
  materials: Material[];
  laborEntries: LaborEntry[];
  photos: PhotoEntry[];
  estimatedTotal: number;
  actualTotal: number;
  isEmergency: boolean;
  emergencyNotes: string;
  warranty: WarrantyInfo;
  recurringSchedule: RecurringSchedule;
  customerSignature: boolean;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const JOB_TYPES = [
  { value: 'repair', label: 'General Repair' },
  { value: 'install', label: 'New Installation' },
  { value: 'drain-cleaning', label: 'Drain Cleaning' },
  { value: 'water-heater', label: 'Water Heater Service' },
  { value: 'pipe-repair', label: 'Pipe Repair/Replacement' },
  { value: 'fixture-install', label: 'Fixture Installation' },
  { value: 'leak-detection', label: 'Leak Detection' },
  { value: 'sewer-line', label: 'Sewer Line Service' },
  { value: 'gas-line', label: 'Gas Line Service' },
  { value: 'water-filtration', label: 'Water Filtration' },
  { value: 'backflow-testing', label: 'Backflow Testing' },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'inspection', label: 'Plumbing Inspection' },
  { value: 'maintenance', label: 'Preventive Maintenance' },
];

// Export columns configuration
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'serviceAddress', header: 'Address', type: 'string' },
  { key: 'serviceCity', header: 'City', type: 'string' },
  { key: 'serviceState', header: 'State', type: 'string' },
  { key: 'serviceZip', header: 'ZIP', type: 'string' },
  { key: 'jobType', header: 'Job Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'technicianId', header: 'Tech ID', type: 'string' },
  { key: 'jobDescription', header: 'Job Description', type: 'string' },
  { key: 'workPerformed', header: 'Work Performed', type: 'string' },
  { key: 'estimatedTotal', header: 'Estimated Total', type: 'currency' },
  { key: 'actualTotal', header: 'Actual Total', type: 'currency' },
  { key: 'isEmergency', header: 'Emergency', type: 'boolean' },
  { key: 'paymentStatus', header: 'Payment Status', type: 'string' },
  { key: 'paymentMethod', header: 'Payment Method', type: 'string' },
  { key: 'customerSignature', header: 'Signature Obtained', type: 'boolean' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const createEmptyWorkOrder = (): WorkOrder => ({
  id: generateId(),
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  serviceAddress: '',
  serviceCity: '',
  serviceState: '',
  serviceZip: '',
  jobType: 'repair',
  priority: 'normal',
  status: 'pending',
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduledTime: '',
  dispatchTime: '',
  arrivalTime: '',
  completionTime: '',
  technicianName: '',
  technicianId: '',
  jobDescription: '',
  diagnosticFindings: '',
  workPerformed: '',
  materials: [],
  laborEntries: [],
  photos: [],
  estimatedTotal: 0,
  actualTotal: 0,
  isEmergency: false,
  emergencyNotes: '',
  warranty: {
    laborWarranty: '90 days',
    partsWarranty: '1 year',
    warrantyStartDate: '',
    warrantyEndDate: '',
    warrantyNotes: '',
  },
  recurringSchedule: {
    enabled: false,
    frequency: 'quarterly',
    nextServiceDate: '',
    notes: '',
  },
  customerSignature: false,
  paymentStatus: 'pending',
  paymentMethod: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface PlumbingServiceToolProps {
  uiConfig?: UIConfig;
}

export const PlumbingServiceTool = ({ uiConfig }: PlumbingServiceToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: workOrders,
    setData: setWorkOrders,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<WorkOrder>('plumbing-service', [], COLUMNS);

  const [currentOrder, setCurrentOrder] = useState<WorkOrder>(createEmptyWorkOrder());
  const [activeTab, setActiveTab] = useState<'customer' | 'job' | 'materials' | 'labor' | 'photos' | 'warranty' | 'invoice'>('customer');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    job: false,
    materials: false,
    labor: false,
    photos: false,
    warranty: false,
    recurring: false,
    emergency: false,
  });
  const [savedMessage, setSavedMessage] = useState('');

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.customerName) {
        setCurrentOrder(prev => ({ ...prev, customerName: params.customerName as string }));
        hasChanges = true;
      }
      if (params.phone) {
        setCurrentOrder(prev => ({ ...prev, customerPhone: params.phone as string }));
        hasChanges = true;
      }
      if (params.address) {
        setCurrentOrder(prev => ({ ...prev, serviceAddress: params.address as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate totals
  const materialsTotal = useMemo(() => {
    return currentOrder.materials.reduce((sum, m) => sum + m.totalPrice, 0);
  }, [currentOrder.materials]);

  const laborTotal = useMemo(() => {
    return currentOrder.laborEntries.reduce((sum, l) => sum + l.totalCost, 0);
  }, [currentOrder.laborEntries]);

  const grandTotal = useMemo(() => {
    return materialsTotal + laborTotal;
  }, [materialsTotal, laborTotal]);

  const variance = useMemo(() => {
    return grandTotal - currentOrder.estimatedTotal;
  }, [grandTotal, currentOrder.estimatedTotal]);

  // Material handlers
  const addMaterial = () => {
    const newMaterial: Material = {
      id: generateId(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setCurrentOrder(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));
  };

  const updateMaterial = (id: string, field: keyof Material, value: string | number) => {
    setCurrentOrder(prev => ({
      ...prev,
      materials: prev.materials.map(m => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.totalPrice = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return m;
      }),
    }));
  };

  const removeMaterial = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id),
    }));
  };

  // Labor handlers
  const addLabor = () => {
    const newLabor: LaborEntry = {
      id: generateId(),
      description: '',
      hours: 0,
      rate: 85,
      totalCost: 0,
    };
    setCurrentOrder(prev => ({
      ...prev,
      laborEntries: [...prev.laborEntries, newLabor],
    }));
  };

  const updateLabor = (id: string, field: keyof LaborEntry, value: string | number) => {
    setCurrentOrder(prev => ({
      ...prev,
      laborEntries: prev.laborEntries.map(l => {
        if (l.id === id) {
          const updated = { ...l, [field]: value };
          if (field === 'hours' || field === 'rate') {
            updated.totalCost = updated.hours * updated.rate;
          }
          return updated;
        }
        return l;
      }),
    }));
  };

  const removeLabor = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      laborEntries: prev.laborEntries.filter(l => l.id !== id),
    }));
  };

  // Photo handlers
  const addPhoto = (type: 'before' | 'after') => {
    const newPhoto: PhotoEntry = {
      id: generateId(),
      type,
      description: '',
      timestamp: new Date().toISOString(),
    };
    setCurrentOrder(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto],
    }));
  };

  const updatePhoto = (id: string, description: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      photos: prev.photos.map(p =>
        p.id === id ? { ...p, description } : p
      ),
    }));
  };

  const removePhoto = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id),
    }));
  };

  // Work order handlers
  const saveWorkOrder = () => {
    const updatedOrder = {
      ...currentOrder,
      actualTotal: grandTotal,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = workOrders.findIndex(w => w.id === updatedOrder.id);
    if (existingIndex >= 0) {
      updateItem(updatedOrder.id, updatedOrder);
    } else {
      addItem(updatedOrder);
    }

    setCurrentOrder(updatedOrder);
    setSavedMessage('Work order saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const createNewWorkOrder = () => {
    setCurrentOrder(createEmptyWorkOrder());
  };

  const loadWorkOrder = (order: WorkOrder) => {
    setCurrentOrder(order);
  };

  const handleDeleteWorkOrder = (id: string) => {
    deleteItem(id);
    if (currentOrder.id === id) {
      createNewWorkOrder();
    }
  };

  const dispatchCall = () => {
    setCurrentOrder(prev => ({
      ...prev,
      status: 'dispatched',
      dispatchTime: new Date().toISOString(),
    }));
    saveWorkOrder();
  };

  const generateInvoice = () => {
    const invoice = `
PLUMBING SERVICE INVOICE
========================

Invoice #: INV-${currentOrder.id.toUpperCase()}
Date: ${new Date().toLocaleDateString()}

CUSTOMER INFORMATION
--------------------
Name: ${currentOrder.customerName}
Phone: ${currentOrder.customerPhone}
Email: ${currentOrder.customerEmail}
Service Address: ${currentOrder.serviceAddress}
${currentOrder.serviceCity}, ${currentOrder.serviceState} ${currentOrder.serviceZip}

JOB DETAILS
-----------
Job Type: ${JOB_TYPES.find(j => j.value === currentOrder.jobType)?.label || currentOrder.jobType}
Technician: ${currentOrder.technicianName}
Service Date: ${currentOrder.scheduledDate}
${currentOrder.isEmergency ? '*** EMERGENCY CALL ***' : ''}

Work Performed:
${currentOrder.workPerformed || 'N/A'}

MATERIALS
---------
${currentOrder.materials.map(m => `${m.name} x${m.quantity} @ $${m.unitPrice.toFixed(2)} = $${m.totalPrice.toFixed(2)}`).join('\n') || 'No materials used'}

Materials Subtotal: $${materialsTotal.toFixed(2)}

LABOR
-----
${currentOrder.laborEntries.map(l => `${l.description}: ${l.hours}hrs @ $${l.rate.toFixed(2)}/hr = $${l.totalCost.toFixed(2)}`).join('\n') || 'No labor entries'}

Labor Subtotal: $${laborTotal.toFixed(2)}

========================
TOTAL DUE: $${grandTotal.toFixed(2)}
========================

WARRANTY INFORMATION
--------------------
Labor Warranty: ${currentOrder.warranty.laborWarranty}
Parts Warranty: ${currentOrder.warranty.partsWarranty}

Thank you for your business!
    `.trim();

    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${currentOrder.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;

  const sectionHeaderClass = `flex items-center justify-between cursor-pointer p-3 rounded-lg ${
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-100 hover:bg-gray-200'
  }`;

  const cardClass = `rounded-lg border ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } p-4 mb-4`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Wrench className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.plumbingService.plumbingServiceManager', 'Plumbing Service Manager')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.plumbingService.completePlumbingServiceAndWork', 'Complete plumbing service and work order management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="plumbing-service" toolName="Plumbing Service" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'plumbing-work-orders' })}
            onExportExcel={() => exportExcel({ filename: 'plumbing-work-orders' })}
            onExportJSON={() => exportJSON({ filename: 'plumbing-work-orders' })}
            onExportPDF={() => exportPDF({
              filename: 'plumbing-work-orders',
              title: 'Plumbing Work Orders',
              subtitle: `${workOrders.length} work orders`
            })}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onPrint={() => print('Plumbing Work Orders')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
          />
          <button
            onClick={createNewWorkOrder}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.plumbingService.newOrder', 'New Order')}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {savedMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Work Orders Sidebar */}
        <div className={`lg:col-span-1 ${cardClass}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.plumbingService.workOrders', 'Work Orders')}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {workOrders.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.plumbingService.noWorkOrdersYet', 'No work orders yet')}
              </p>
            ) : (
              workOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    currentOrder.id === order.id
                      ? 'bg-[#0D9488]/20 border border-[#0D9488]'
                      : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => loadWorkOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {order.customerName || 'Unnamed Customer'}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {JOB_TYPES.find(j => j.value === order.jobType)?.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {order.isEmergency && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkOrder(order.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      order.status === 'dispatched' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer Information Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('customer')}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.customerInformation', 'Customer Information')}
                </span>
              </div>
              {expandedSections.customer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.customer && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.customerName', 'Customer Name *')}</label>
                  <input
                    type="text"
                    value={currentOrder.customerName}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder={t('tools.plumbingService.fullName', 'Full name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.phoneNumber', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    value={currentOrder.customerPhone}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.email', 'Email')}</label>
                  <input
                    type="email"
                    value={currentOrder.customerEmail}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder={t('tools.plumbingService.customerEmailCom', 'customer@email.com')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.serviceAddress', 'Service Address *')}</label>
                  <input
                    type="text"
                    value={currentOrder.serviceAddress}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, serviceAddress: e.target.value }))}
                    placeholder={t('tools.plumbingService.123MainStreet', '123 Main Street')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.city', 'City')}</label>
                  <input
                    type="text"
                    value={currentOrder.serviceCity}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, serviceCity: e.target.value }))}
                    placeholder={t('tools.plumbingService.city2', 'City')}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.state', 'State')}</label>
                    <input
                      type="text"
                      value={currentOrder.serviceState}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, serviceState: e.target.value }))}
                      placeholder={t('tools.plumbingService.state2', 'State')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.zipCode', 'ZIP Code')}</label>
                    <input
                      type="text"
                      value={currentOrder.serviceZip}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, serviceZip: e.target.value }))}
                      placeholder="12345"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job Details Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('job')}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.jobDetailsDispatch', 'Job Details & Dispatch')}
                </span>
              </div>
              {expandedSections.job ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.job && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.jobType', 'Job Type *')}</label>
                    <select
                      value={currentOrder.jobType}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, jobType: e.target.value }))}
                      className={selectClass}
                    >
                      {JOB_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.priority', 'Priority')}</label>
                    <select
                      value={currentOrder.priority}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, priority: e.target.value as 'normal' | 'urgent' | 'emergency' }))}
                      className={selectClass}
                    >
                      <option value="normal">{t('tools.plumbingService.normal', 'Normal')}</option>
                      <option value="urgent">{t('tools.plumbingService.urgent', 'Urgent')}</option>
                      <option value="emergency">{t('tools.plumbingService.emergency', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.status', 'Status')}</label>
                    <select
                      value={currentOrder.status}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, status: e.target.value as WorkOrder['status'] }))}
                      className={selectClass}
                    >
                      <option value="pending">{t('tools.plumbingService.pending', 'Pending')}</option>
                      <option value="dispatched">{t('tools.plumbingService.dispatched', 'Dispatched')}</option>
                      <option value="in-progress">{t('tools.plumbingService.inProgress', 'In Progress')}</option>
                      <option value="completed">{t('tools.plumbingService.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.plumbingService.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.scheduledDate', 'Scheduled Date')}</label>
                    <input
                      type="date"
                      value={currentOrder.scheduledDate}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.scheduledTime', 'Scheduled Time')}</label>
                    <input
                      type="time"
                      value={currentOrder.scheduledTime}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.technicianName', 'Technician Name')}</label>
                    <input
                      type="text"
                      value={currentOrder.technicianName}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, technicianName: e.target.value }))}
                      placeholder={t('tools.plumbingService.technicianName2', 'Technician name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.technicianId', 'Technician ID')}</label>
                    <input
                      type="text"
                      value={currentOrder.technicianId}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, technicianId: e.target.value }))}
                      placeholder={t('tools.plumbingService.techId', 'Tech ID')}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.plumbingService.jobDescription', 'Job Description')}</label>
                  <textarea
                    value={currentOrder.jobDescription}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, jobDescription: e.target.value }))}
                    placeholder={t('tools.plumbingService.describeTheJobRequirements', 'Describe the job requirements...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.plumbingService.diagnosticFindings', 'Diagnostic Findings')}</label>
                  <textarea
                    value={currentOrder.diagnosticFindings}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, diagnosticFindings: e.target.value }))}
                    placeholder={t('tools.plumbingService.documentDiagnosticFindings', 'Document diagnostic findings...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.plumbingService.workPerformed', 'Work Performed')}</label>
                  <textarea
                    value={currentOrder.workPerformed}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, workPerformed: e.target.value }))}
                    placeholder={t('tools.plumbingService.documentWorkPerformed', 'Document work performed...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                {/* Dispatch Button */}
                {currentOrder.status === 'pending' && (
                  <button
                    onClick={dispatchCall}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    {t('tools.plumbingService.dispatchServiceCall', 'Dispatch Service Call')}
                  </button>
                )}

                {currentOrder.dispatchTime && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Dispatched: {new Date(currentOrder.dispatchTime).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Materials Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('materials')}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.materialsParts', 'Materials & Parts')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  (${materialsTotal.toFixed(2)})
                </span>
              </div>
              {expandedSections.materials ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.materials && (
              <div className="mt-4 space-y-4">
                {currentOrder.materials.map((material, index) => (
                  <div key={material.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.plumbingService.materialPartName', 'Material/Part Name')}</label>
                        <input
                          type="text"
                          value={material.name}
                          onChange={e => updateMaterial(material.id, 'name', e.target.value)}
                          placeholder={t('tools.plumbingService.partName', 'Part name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.plumbingService.quantity', 'Quantity')}</label>
                        <input
                          type="number"
                          value={material.quantity}
                          onChange={e => updateMaterial(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.plumbingService.unitPrice', 'Unit Price ($)')}</label>
                        <input
                          type="number"
                          value={material.unitPrice}
                          onChange={e => updateMaterial(material.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className={labelClass}>{t('tools.plumbingService.total', 'Total')}</label>
                          <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            ${material.totalPrice.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeMaterial(material.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addMaterial}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.plumbingService.addMaterialPart', 'Add Material/Part')}
                </button>
              </div>
            )}
          </div>

          {/* Labor Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('labor')}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.laborTimeTracking', 'Labor Time Tracking')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  (${laborTotal.toFixed(2)})
                </span>
              </div>
              {expandedSections.labor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.labor && (
              <div className="mt-4 space-y-4">
                {currentOrder.laborEntries.map((labor, index) => (
                  <div key={labor.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.plumbingService.description', 'Description')}</label>
                        <input
                          type="text"
                          value={labor.description}
                          onChange={e => updateLabor(labor.id, 'description', e.target.value)}
                          placeholder={t('tools.plumbingService.laborDescription', 'Labor description')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.plumbingService.hours', 'Hours')}</label>
                        <input
                          type="number"
                          value={labor.hours}
                          onChange={e => updateLabor(labor.id, 'hours', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.25"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.plumbingService.rateHr', 'Rate ($/hr)')}</label>
                        <input
                          type="number"
                          value={labor.rate}
                          onChange={e => updateLabor(labor.id, 'rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className={labelClass}>{t('tools.plumbingService.total2', 'Total')}</label>
                          <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            ${labor.totalCost.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeLabor(labor.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addLabor}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.plumbingService.addLaborEntry', 'Add Labor Entry')}
                </button>
              </div>
            )}
          </div>

          {/* Photos Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('photos')}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.beforeAfterPhotos', 'Before/After Photos')}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentOrder.photos.length} photos)
                </span>
              </div>
              {expandedSections.photos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.photos && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before Photos */}
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.plumbingService.beforePhotos', 'Before Photos')}
                    </h4>
                    {currentOrder.photos.filter(p => p.type === 'before').map(photo => (
                      <div key={photo.id} className={`p-3 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <Camera className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={photo.description}
                          onChange={e => updatePhoto(photo.id, e.target.value)}
                          placeholder={t('tools.plumbingService.photoDescription', 'Photo description')}
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addPhoto('before')}
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg w-full justify-center ${
                        theme === 'dark'
                          ? t('tools.plumbingService.borderGray600TextGray', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.plumbingService.borderGray300TextGray', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.plumbingService.addBeforePhoto', 'Add Before Photo')}
                    </button>
                  </div>

                  {/* After Photos */}
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.plumbingService.afterPhotos', 'After Photos')}
                    </h4>
                    {currentOrder.photos.filter(p => p.type === 'after').map(photo => (
                      <div key={photo.id} className={`p-3 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <Camera className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={photo.description}
                          onChange={e => updatePhoto(photo.id, e.target.value)}
                          placeholder={t('tools.plumbingService.photoDescription2', 'Photo description')}
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addPhoto('after')}
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg w-full justify-center ${
                        theme === 'dark'
                          ? t('tools.plumbingService.borderGray600TextGray2', 'border-gray-600 text-gray-400 hover:border-[#0D9488] hover:text-[#0D9488]') : t('tools.plumbingService.borderGray300TextGray2', 'border-gray-300 text-gray-500 hover:border-[#0D9488] hover:text-[#0D9488]')
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.plumbingService.addAfterPhoto', 'Add After Photo')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Call Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('emergency')}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.emergencyCallTracking', 'Emergency Call Tracking')}
                </span>
                {currentOrder.isEmergency && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                    {t('tools.plumbingService.emergency2', 'EMERGENCY')}
                  </span>
                )}
              </div>
              {expandedSections.emergency ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.emergency && (
              <div className="mt-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentOrder.isEmergency}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, isEmergency: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                    {t('tools.plumbingService.thisIsAnEmergencyService', 'This is an emergency service call')}
                  </span>
                </label>

                {currentOrder.isEmergency && (
                  <div>
                    <label className={labelClass}>{t('tools.plumbingService.emergencyDetails', 'Emergency Details')}</label>
                    <textarea
                      value={currentOrder.emergencyNotes}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                      placeholder={t('tools.plumbingService.describeTheEmergencySituation', 'Describe the emergency situation...')}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warranty Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('warranty')}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.warrantyInformation', 'Warranty Information')}
                </span>
              </div>
              {expandedSections.warranty ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.warranty && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.laborWarranty', 'Labor Warranty')}</label>
                  <input
                    type="text"
                    value={currentOrder.warranty.laborWarranty}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, laborWarranty: e.target.value }
                    }))}
                    placeholder={t('tools.plumbingService.eG90Days', 'e.g., 90 days')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.partsWarranty', 'Parts Warranty')}</label>
                  <input
                    type="text"
                    value={currentOrder.warranty.partsWarranty}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, partsWarranty: e.target.value }
                    }))}
                    placeholder={t('tools.plumbingService.eG1YearManufacturer', 'e.g., 1 year manufacturer warranty')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.warrantyStartDate', 'Warranty Start Date')}</label>
                  <input
                    type="date"
                    value={currentOrder.warranty.warrantyStartDate}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, warrantyStartDate: e.target.value }
                    }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.plumbingService.warrantyEndDate', 'Warranty End Date')}</label>
                  <input
                    type="date"
                    value={currentOrder.warranty.warrantyEndDate}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, warrantyEndDate: e.target.value }
                    }))}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.plumbingService.warrantyNotes', 'Warranty Notes')}</label>
                  <textarea
                    value={currentOrder.warranty.warrantyNotes}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, warrantyNotes: e.target.value }
                    }))}
                    placeholder={t('tools.plumbingService.additionalWarrantyInformation', 'Additional warranty information...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recurring Service Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('recurring')}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.plumbingService.recurringServiceSchedule', 'Recurring Service Schedule')}
                </span>
                {currentOrder.recurringSchedule.enabled && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    {t('tools.plumbingService.scheduled', 'SCHEDULED')}
                  </span>
                )}
              </div>
              {expandedSections.recurring ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.recurring && (
              <div className="mt-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentOrder.recurringSchedule.enabled}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      recurringSchedule: { ...prev.recurringSchedule, enabled: e.target.checked }
                    }))}
                    className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                    {t('tools.plumbingService.enableRecurringServiceSchedule', 'Enable recurring service schedule')}
                  </span>
                </label>

                {currentOrder.recurringSchedule.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.plumbingService.frequency', 'Frequency')}</label>
                      <select
                        value={currentOrder.recurringSchedule.frequency}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          recurringSchedule: { ...prev.recurringSchedule, frequency: e.target.value as RecurringSchedule['frequency'] }
                        }))}
                        className={selectClass}
                      >
                        <option value="weekly">{t('tools.plumbingService.weekly', 'Weekly')}</option>
                        <option value="monthly">{t('tools.plumbingService.monthly', 'Monthly')}</option>
                        <option value="quarterly">{t('tools.plumbingService.quarterly', 'Quarterly')}</option>
                        <option value="annually">{t('tools.plumbingService.annually', 'Annually')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.plumbingService.nextServiceDate', 'Next Service Date')}</label>
                      <input
                        type="date"
                        value={currentOrder.recurringSchedule.nextServiceDate}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          recurringSchedule: { ...prev.recurringSchedule, nextServiceDate: e.target.value }
                        }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('tools.plumbingService.scheduleNotes', 'Schedule Notes')}</label>
                      <textarea
                        value={currentOrder.recurringSchedule.notes}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          recurringSchedule: { ...prev.recurringSchedule, notes: e.target.value }
                        }))}
                        placeholder={t('tools.plumbingService.notesAboutRecurringService', 'Notes about recurring service...')}
                        rows={2}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estimate vs Actual Comparison */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5 text-[#0D9488]" />
              {t('tools.plumbingService.costSummary', 'Cost Summary')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>{t('tools.plumbingService.estimatedTotal', 'Estimated Total')}</label>
                <input
                  type="number"
                  value={currentOrder.estimatedTotal}
                  onChange={e => setCurrentOrder(prev => ({ ...prev, estimatedTotal: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.plumbingService.materialsTotal', 'Materials Total')}</label>
                <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  ${materialsTotal.toFixed(2)}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.plumbingService.laborTotal', 'Labor Total')}</label>
                <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  ${laborTotal.toFixed(2)}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.plumbingService.actualTotal', 'Actual Total')}</label>
                <div className={`px-4 py-2 rounded-lg font-bold ${theme === 'dark' ? t('tools.plumbingService.bg0d948820Text2dd4bf', 'bg-[#0D9488]/20 text-[#2DD4BF]') : t('tools.plumbingService.bg0d948810Text0d9488', 'bg-[#0D9488]/10 text-[#0D9488]')}`}>
                  ${grandTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {currentOrder.estimatedTotal > 0 && (
              <div className={`mt-4 p-4 rounded-lg ${
                variance > 0
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : variance < 0
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {t('tools.plumbingService.varianceFromEstimate', 'Variance from Estimate')}
                  </span>
                  <span className={`font-bold ${
                    variance > 0
                      ? 'text-red-600 dark:text-red-400'
                      : variance < 0
                      ? 'text-green-600 dark:text-green-400'
                      : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {variance > 0 ? '+' : ''}{variance.toFixed(2)} ({currentOrder.estimatedTotal > 0 ? ((variance / currentOrder.estimatedTotal) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5 text-[#0D9488]" />
              {t('tools.plumbingService.paymentInformation', 'Payment Information')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.plumbingService.paymentStatus', 'Payment Status')}</label>
                <select
                  value={currentOrder.paymentStatus}
                  onChange={e => setCurrentOrder(prev => ({ ...prev, paymentStatus: e.target.value as WorkOrder['paymentStatus'] }))}
                  className={selectClass}
                >
                  <option value="pending">{t('tools.plumbingService.pending2', 'Pending')}</option>
                  <option value="partial">{t('tools.plumbingService.partialPayment', 'Partial Payment')}</option>
                  <option value="paid">{t('tools.plumbingService.paidInFull', 'Paid in Full')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.plumbingService.paymentMethod', 'Payment Method')}</label>
                <select
                  value={currentOrder.paymentMethod}
                  onChange={e => setCurrentOrder(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">{t('tools.plumbingService.selectMethod', 'Select method...')}</option>
                  <option value="cash">{t('tools.plumbingService.cash', 'Cash')}</option>
                  <option value="check">{t('tools.plumbingService.check', 'Check')}</option>
                  <option value="credit">{t('tools.plumbingService.creditCard', 'Credit Card')}</option>
                  <option value="debit">{t('tools.plumbingService.debitCard', 'Debit Card')}</option>
                  <option value="invoice">{t('tools.plumbingService.invoiceNet30', 'Invoice (Net 30)')}</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentOrder.customerSignature}
                  onChange={e => setCurrentOrder(prev => ({ ...prev, customerSignature: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                  {t('tools.plumbingService.customerSignatureObtained', 'Customer signature obtained')}
                </span>
              </label>
            </div>
          </div>

          {/* Notes Section */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-[#0D9488]" />
              {t('tools.plumbingService.additionalNotes', 'Additional Notes')}
            </h3>
            <textarea
              value={currentOrder.notes}
              onChange={e => setCurrentOrder(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('tools.plumbingService.anyAdditionalNotesAboutThis', 'Any additional notes about this work order...')}
              rows={4}
              className={inputClass}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveWorkOrder}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20"
            >
              <Save className="w-4 h-4" />
              {t('tools.plumbingService.saveWorkOrder', 'Save Work Order')}
            </button>
            <button
              onClick={generateInvoice}
              disabled={!currentOrder.customerName}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {t('tools.plumbingService.generateInvoice', 'Generate Invoice')}
            </button>
            <button
              onClick={createNewWorkOrder}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.plumbingService.newWorkOrder', 'New Work Order')}
            </button>
          </div>

          {/* Info Section */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.plumbingService.aboutPlumbingServiceManager', 'About Plumbing Service Manager')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              A comprehensive tool for managing plumbing service calls, work orders, and invoicing. Track customer information,
              job details, materials, labor, before/after photos, warranties, and recurring service schedules.
              Your data syncs automatically to the cloud when logged in, with offline support via local storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlumbingServiceTool;
