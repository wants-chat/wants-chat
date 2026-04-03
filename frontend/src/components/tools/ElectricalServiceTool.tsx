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
  Zap,
  User,
  Clock,
  AlertTriangle,
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
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  AlertCircle,
  CircuitBoard,
  FileCheck,
  Loader2,
} from 'lucide-react';

// Types
interface Material {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface LaborEntry {
  id: string;
  electricianName: string;
  electricianId: string;
  licenseNumber: string;
  description: string;
  hours: number;
  rate: number;
  totalCost: number;
}

interface CircuitInfo {
  id: string;
  circuitNumber: string;
  description: string;
  amperage: string;
  voltage: string;
  wireSize: string;
  breakerType: string;
  location: string;
  status: 'active' | 'inactive' | 'needs-repair' | 'replaced';
}

interface PanelInfo {
  id: string;
  panelType: string;
  manufacturer: string;
  model: string;
  mainBreakerAmps: string;
  totalSlots: number;
  usedSlots: number;
  location: string;
  installDate: string;
  lastInspection: string;
  notes: string;
}

interface PermitInfo {
  permitNumber: string;
  permitType: string;
  issuedDate: string;
  expirationDate: string;
  inspectionDate: string;
  inspectionStatus: 'pending' | 'scheduled' | 'passed' | 'failed' | 'not-required';
  inspectorName: string;
  permitNotes: string;
}

interface CodeComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable' | 'pending';
  notes: string;
}

interface SafetyInspection {
  id: string;
  inspectionType: string;
  inspectionDate: string;
  inspectorName: string;
  result: 'pass' | 'fail' | 'conditional';
  findings: string;
  correctiveActions: string;
}

interface WarrantyInfo {
  laborWarranty: string;
  partsWarranty: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyNotes: string;
}

interface ServiceAgreement {
  enabled: boolean;
  agreementType: 'basic' | 'standard' | 'premium' | 'custom';
  startDate: string;
  endDate: string;
  monthlyFee: number;
  servicesIncluded: string;
  notes: string;
}

interface RecurringSchedule {
  enabled: boolean;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  nextServiceDate: string;
  notes: string;
}

interface WorkOrder {
  id: string;
  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyType: 'residential' | 'commercial' | 'industrial';
  serviceAddress: string;
  serviceCity: string;
  serviceState: string;
  serviceZip: string;
  // Job Information
  jobType: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'dispatched' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  dispatchTime: string;
  arrivalTime: string;
  completionTime: string;
  jobDescription: string;
  diagnosticFindings: string;
  workPerformed: string;
  // Materials and Labor
  materials: Material[];
  laborEntries: LaborEntry[];
  // Panel and Circuit Documentation
  panels: PanelInfo[];
  circuits: CircuitInfo[];
  // Permits and Compliance
  permit: PermitInfo;
  codeCompliance: CodeComplianceItem[];
  safetyInspections: SafetyInspection[];
  // Cost Tracking
  estimatedTotal: number;
  actualTotal: number;
  // Emergency
  isEmergency: boolean;
  emergencyNotes: string;
  // Warranty and Service Agreements
  warranty: WarrantyInfo;
  serviceAgreement: ServiceAgreement;
  recurringSchedule: RecurringSchedule;
  // Payment
  customerSignature: boolean;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const JOB_TYPES = [
  { value: 'repair', label: 'Electrical Repair' },
  { value: 'installation', label: 'New Installation' },
  { value: 'upgrade', label: 'Electrical Upgrade' },
  { value: 'inspection', label: 'Electrical Inspection' },
  { value: 'panel-upgrade', label: 'Panel Upgrade' },
  { value: 'outlet-installation', label: 'Outlet Installation' },
  { value: 'lighting', label: 'Lighting Installation' },
  { value: 'ceiling-fan', label: 'Ceiling Fan Installation' },
  { value: 'circuit-breaker', label: 'Circuit Breaker Service' },
  { value: 'wiring', label: 'Wiring/Rewiring' },
  { value: 'generator', label: 'Generator Installation' },
  { value: 'ev-charger', label: 'EV Charger Installation' },
  { value: 'surge-protection', label: 'Surge Protection' },
  { value: 'safety-inspection', label: 'Safety Inspection' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'maintenance', label: 'Preventive Maintenance' },
];

const CODE_COMPLIANCE_CATEGORIES = [
  { category: 'NEC Article 210', requirement: 'Branch Circuits - Proper sizing and protection' },
  { category: 'NEC Article 220', requirement: 'Branch Circuit, Feeder, and Service Calculations' },
  { category: 'NEC Article 230', requirement: 'Services - Proper installation and grounding' },
  { category: 'NEC Article 240', requirement: 'Overcurrent Protection - Proper breaker sizing' },
  { category: 'NEC Article 250', requirement: 'Grounding and Bonding - Proper grounding' },
  { category: 'NEC Article 300', requirement: 'Wiring Methods - Proper cable/conduit installation' },
  { category: 'NEC Article 310', requirement: 'Conductors - Proper wire sizing' },
  { category: 'NEC Article 334', requirement: 'NM Cable (Romex) - Proper usage and installation' },
  { category: 'NEC Article 406', requirement: 'Receptacles - GFCI/AFCI requirements' },
  { category: 'NEC Article 408', requirement: 'Switchboards and Panelboards - Installation' },
  { category: 'NEC Article 410', requirement: 'Luminaires - Proper fixture installation' },
  { category: 'NEC Article 422', requirement: 'Appliances - Dedicated circuits' },
  { category: 'Local Code', requirement: 'Local jurisdiction requirements met' },
];

// Export columns configuration
const WORK_ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Order ID', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'serviceAddress', header: 'Service Address', type: 'string' },
  { key: 'serviceCity', header: 'City', type: 'string' },
  { key: 'serviceState', header: 'State', type: 'string' },
  { key: 'serviceZip', header: 'ZIP', type: 'string' },
  { key: 'jobType', header: 'Job Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'estimatedTotal', header: 'Estimated Total', type: 'currency' },
  { key: 'actualTotal', header: 'Actual Total', type: 'currency' },
  { key: 'isEmergency', header: 'Emergency', type: 'boolean' },
  { key: 'paymentStatus', header: 'Payment Status', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const createEmptyWorkOrder = (): WorkOrder => ({
  id: generateId(),
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  propertyType: 'residential',
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
  jobDescription: '',
  diagnosticFindings: '',
  workPerformed: '',
  materials: [],
  laborEntries: [],
  panels: [],
  circuits: [],
  permit: {
    permitNumber: '',
    permitType: '',
    issuedDate: '',
    expirationDate: '',
    inspectionDate: '',
    inspectionStatus: 'not-required',
    inspectorName: '',
    permitNotes: '',
  },
  codeCompliance: [],
  safetyInspections: [],
  estimatedTotal: 0,
  actualTotal: 0,
  isEmergency: false,
  emergencyNotes: '',
  warranty: {
    laborWarranty: '1 year',
    partsWarranty: 'Manufacturer warranty',
    warrantyStartDate: '',
    warrantyEndDate: '',
    warrantyNotes: '',
  },
  serviceAgreement: {
    enabled: false,
    agreementType: 'standard',
    startDate: '',
    endDate: '',
    monthlyFee: 0,
    servicesIncluded: '',
    notes: '',
  },
  recurringSchedule: {
    enabled: false,
    frequency: 'annually',
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

interface ElectricalServiceToolProps {
  uiConfig?: UIConfig;
}

export const ElectricalServiceTool = ({ uiConfig }: ElectricalServiceToolProps) => {
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
  } = useToolData<WorkOrder>('electrical-service', [], WORK_ORDER_COLUMNS);

  const [currentOrder, setCurrentOrder] = useState<WorkOrder>(createEmptyWorkOrder());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    job: false,
    materials: false,
    labor: false,
    panels: false,
    circuits: false,
    permits: false,
    compliance: false,
    safety: false,
    warranty: false,
    serviceAgreement: false,
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
      partNumber: '',
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
      electricianName: '',
      electricianId: '',
      licenseNumber: '',
      description: '',
      hours: 0,
      rate: 95,
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

  // Panel handlers
  const addPanel = () => {
    const newPanel: PanelInfo = {
      id: generateId(),
      panelType: 'main',
      manufacturer: '',
      model: '',
      mainBreakerAmps: '200',
      totalSlots: 40,
      usedSlots: 0,
      location: '',
      installDate: '',
      lastInspection: '',
      notes: '',
    };
    setCurrentOrder(prev => ({
      ...prev,
      panels: [...prev.panels, newPanel],
    }));
  };

  const updatePanel = (id: string, field: keyof PanelInfo, value: string | number) => {
    setCurrentOrder(prev => ({
      ...prev,
      panels: prev.panels.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removePanel = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      panels: prev.panels.filter(p => p.id !== id),
    }));
  };

  // Circuit handlers
  const addCircuit = () => {
    const newCircuit: CircuitInfo = {
      id: generateId(),
      circuitNumber: '',
      description: '',
      amperage: '20',
      voltage: '120',
      wireSize: '12 AWG',
      breakerType: 'single-pole',
      location: '',
      status: 'active',
    };
    setCurrentOrder(prev => ({
      ...prev,
      circuits: [...prev.circuits, newCircuit],
    }));
  };

  const updateCircuit = (id: string, field: keyof CircuitInfo, value: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      circuits: prev.circuits.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeCircuit = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      circuits: prev.circuits.filter(c => c.id !== id),
    }));
  };

  // Code Compliance handlers
  const addComplianceItem = () => {
    const newItem: CodeComplianceItem = {
      id: generateId(),
      category: '',
      requirement: '',
      status: 'pending',
      notes: '',
    };
    setCurrentOrder(prev => ({
      ...prev,
      codeCompliance: [...prev.codeCompliance, newItem],
    }));
  };

  const updateComplianceItem = (id: string, field: keyof CodeComplianceItem, value: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      codeCompliance: prev.codeCompliance.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeComplianceItem = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      codeCompliance: prev.codeCompliance.filter(c => c.id !== id),
    }));
  };

  const initializeComplianceChecklist = () => {
    const items: CodeComplianceItem[] = CODE_COMPLIANCE_CATEGORIES.map(cat => ({
      id: generateId(),
      category: cat.category,
      requirement: cat.requirement,
      status: 'pending' as const,
      notes: '',
    }));
    setCurrentOrder(prev => ({
      ...prev,
      codeCompliance: items,
    }));
  };

  // Safety Inspection handlers
  const addSafetyInspection = () => {
    const newInspection: SafetyInspection = {
      id: generateId(),
      inspectionType: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectorName: '',
      result: 'pass',
      findings: '',
      correctiveActions: '',
    };
    setCurrentOrder(prev => ({
      ...prev,
      safetyInspections: [...prev.safetyInspections, newInspection],
    }));
  };

  const updateSafetyInspection = (id: string, field: keyof SafetyInspection, value: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      safetyInspections: prev.safetyInspections.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const removeSafetyInspection = (id: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      safetyInspections: prev.safetyInspections.filter(s => s.id !== id),
    }));
  };

  // Work order handlers
  const saveWorkOrder = () => {
    const updatedOrder = {
      ...currentOrder,
      actualTotal: grandTotal,
      updatedAt: new Date().toISOString(),
    };

    const existingOrder = workOrders.find(w => w.id === updatedOrder.id);
    if (existingOrder) {
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
    const complianceStatus = currentOrder.codeCompliance.length > 0
      ? `${currentOrder.codeCompliance.filter(c => c.status === 'compliant').length}/${currentOrder.codeCompliance.length} items compliant`
      : 'No compliance items recorded';

    const invoice = `
ELECTRICAL SERVICE INVOICE
===========================

Invoice #: INV-${currentOrder.id.toUpperCase()}
Date: ${new Date().toLocaleDateString()}

CUSTOMER INFORMATION
--------------------
Name: ${currentOrder.customerName}
Phone: ${currentOrder.customerPhone}
Email: ${currentOrder.customerEmail}
Property Type: ${currentOrder.propertyType.charAt(0).toUpperCase() + currentOrder.propertyType.slice(1)}
Service Address: ${currentOrder.serviceAddress}
${currentOrder.serviceCity}, ${currentOrder.serviceState} ${currentOrder.serviceZip}

JOB DETAILS
-----------
Job Type: ${JOB_TYPES.find(j => j.value === currentOrder.jobType)?.label || currentOrder.jobType}
Service Date: ${currentOrder.scheduledDate}
${currentOrder.isEmergency ? '*** EMERGENCY CALL ***' : ''}

Work Performed:
${currentOrder.workPerformed || 'N/A'}

ELECTRICIANS
------------
${currentOrder.laborEntries.map(l => `${l.electricianName} (License: ${l.licenseNumber})`).join('\n') || 'No electricians assigned'}

MATERIALS & PARTS
-----------------
${currentOrder.materials.map(m => `${m.name}${m.partNumber ? ` (${m.partNumber})` : ''} x${m.quantity} @ $${m.unitPrice.toFixed(2)} = $${m.totalPrice.toFixed(2)}`).join('\n') || 'No materials used'}

Materials Subtotal: $${materialsTotal.toFixed(2)}

LABOR
-----
${currentOrder.laborEntries.map(l => `${l.description}: ${l.hours}hrs @ $${l.rate.toFixed(2)}/hr = $${l.totalCost.toFixed(2)}`).join('\n') || 'No labor entries'}

Labor Subtotal: $${laborTotal.toFixed(2)}

${currentOrder.permit.permitNumber ? `
PERMIT INFORMATION
------------------
Permit #: ${currentOrder.permit.permitNumber}
Type: ${currentOrder.permit.permitType}
Inspection Status: ${currentOrder.permit.inspectionStatus}
` : ''}

CODE COMPLIANCE
---------------
${complianceStatus}

===========================
TOTAL DUE: $${grandTotal.toFixed(2)}
===========================

WARRANTY INFORMATION
--------------------
Labor Warranty: ${currentOrder.warranty.laborWarranty}
Parts Warranty: ${currentOrder.warranty.partsWarranty}
${currentOrder.warranty.warrantyStartDate ? `Warranty Period: ${currentOrder.warranty.warrantyStartDate} to ${currentOrder.warranty.warrantyEndDate}` : ''}

${currentOrder.serviceAgreement.enabled ? `
SERVICE AGREEMENT
-----------------
Type: ${currentOrder.serviceAgreement.agreementType.charAt(0).toUpperCase() + currentOrder.serviceAgreement.agreementType.slice(1)}
Monthly Fee: $${currentOrder.serviceAgreement.monthlyFee.toFixed(2)}
` : ''}

Thank you for your business!
Licensed & Insured Electrical Contractor
    `.trim();

    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrical-invoice-${currentOrder.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;

  const sectionHeaderClass = `flex items-center justify-between cursor-pointer p-3 rounded-lg ${
    isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-100 hover:bg-gray-200'
  }`;

  const cardClass = `rounded-lg border ${
    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Zap className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.electricalService.electricalServiceManager', 'Electrical Service Manager')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.electricalService.completeElectricalContractorServiceAnd', 'Complete electrical contractor service and work order management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="electrical-service" toolName="Electrical Service" />

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
            onExportCSV={() => exportCSV({ filename: 'electrical-work-orders' })}
            onExportExcel={() => exportExcel({ filename: 'electrical-work-orders' })}
            onExportJSON={() => exportJSON({ filename: 'electrical-work-orders' })}
            onExportPDF={async () => { await exportPDF({
              filename: 'electrical-work-orders',
              title: 'Electrical Work Orders',
              orientation: 'landscape'
            }); }}
            onPrint={() => print('Electrical Work Orders')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            disabled={workOrders.length === 0}
            theme={isDark ? 'dark' : 'light'}
          />
          <button
            onClick={createNewWorkOrder}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.electricalService.newOrder', 'New Order')}
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
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.electricalService.workOrders', 'Work Orders')}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {workOrders.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.electricalService.noWorkOrdersYet', 'No work orders yet')}
              </p>
            ) : (
              workOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    currentOrder.id === order.id
                      ? 'bg-[#0D9488]/20 border border-[#0D9488]'
                      : isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => loadWorkOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {order.customerName || 'Unnamed Customer'}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.customerPropertyInformation', 'Customer & Property Information')}
                </span>
              </div>
              {expandedSections.customer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.customer && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.electricalService.customerName', 'Customer Name *')}</label>
                  <input
                    type="text"
                    value={currentOrder.customerName}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder={t('tools.electricalService.fullName', 'Full name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.phoneNumber', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    value={currentOrder.customerPhone}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.email', 'Email')}</label>
                  <input
                    type="email"
                    value={currentOrder.customerEmail}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder={t('tools.electricalService.customerEmailCom', 'customer@email.com')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.propertyType', 'Property Type *')}</label>
                  <select
                    value={currentOrder.propertyType}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, propertyType: e.target.value as WorkOrder['propertyType'] }))}
                    className={selectClass}
                  >
                    <option value="residential">{t('tools.electricalService.residential', 'Residential')}</option>
                    <option value="commercial">{t('tools.electricalService.commercial', 'Commercial')}</option>
                    <option value="industrial">{t('tools.electricalService.industrial', 'Industrial')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.serviceAddress', 'Service Address *')}</label>
                  <input
                    type="text"
                    value={currentOrder.serviceAddress}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, serviceAddress: e.target.value }))}
                    placeholder={t('tools.electricalService.123MainStreet', '123 Main Street')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.city', 'City')}</label>
                  <input
                    type="text"
                    value={currentOrder.serviceCity}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, serviceCity: e.target.value }))}
                    placeholder={t('tools.electricalService.city2', 'City')}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.state', 'State')}</label>
                    <input
                      type="text"
                      value={currentOrder.serviceState}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, serviceState: e.target.value }))}
                      placeholder={t('tools.electricalService.state2', 'State')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.zipCode', 'ZIP Code')}</label>
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.jobDetailsDispatch', 'Job Details & Dispatch')}
                </span>
              </div>
              {expandedSections.job ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.job && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.jobType', 'Job Type *')}</label>
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
                    <label className={labelClass}>{t('tools.electricalService.priority', 'Priority')}</label>
                    <select
                      value={currentOrder.priority}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, priority: e.target.value as 'normal' | 'urgent' | 'emergency' }))}
                      className={selectClass}
                    >
                      <option value="normal">{t('tools.electricalService.normal', 'Normal')}</option>
                      <option value="urgent">{t('tools.electricalService.urgent', 'Urgent')}</option>
                      <option value="emergency">{t('tools.electricalService.emergency', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.status', 'Status')}</label>
                    <select
                      value={currentOrder.status}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, status: e.target.value as WorkOrder['status'] }))}
                      className={selectClass}
                    >
                      <option value="pending">{t('tools.electricalService.pending', 'Pending')}</option>
                      <option value="dispatched">{t('tools.electricalService.dispatched', 'Dispatched')}</option>
                      <option value="in-progress">{t('tools.electricalService.inProgress', 'In Progress')}</option>
                      <option value="completed">{t('tools.electricalService.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.electricalService.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.scheduledDate', 'Scheduled Date')}</label>
                    <input
                      type="date"
                      value={currentOrder.scheduledDate}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.scheduledTime', 'Scheduled Time')}</label>
                    <input
                      type="time"
                      value={currentOrder.scheduledTime}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.electricalService.jobDescription', 'Job Description')}</label>
                  <textarea
                    value={currentOrder.jobDescription}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, jobDescription: e.target.value }))}
                    placeholder={t('tools.electricalService.describeTheElectricalWorkRequired', 'Describe the electrical work required...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.electricalService.diagnosticFindings', 'Diagnostic Findings')}</label>
                  <textarea
                    value={currentOrder.diagnosticFindings}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, diagnosticFindings: e.target.value }))}
                    placeholder={t('tools.electricalService.documentDiagnosticFindings', 'Document diagnostic findings...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.electricalService.workPerformed', 'Work Performed')}</label>
                  <textarea
                    value={currentOrder.workPerformed}
                    onChange={e => setCurrentOrder(prev => ({ ...prev, workPerformed: e.target.value }))}
                    placeholder={t('tools.electricalService.documentWorkPerformed', 'Document work performed...')}
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
                    {t('tools.electricalService.dispatchServiceCall', 'Dispatch Service Call')}
                  </button>
                )}

                {currentOrder.dispatchTime && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.materialsParts', 'Materials & Parts')}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  (${materialsTotal.toFixed(2)})
                </span>
              </div>
              {expandedSections.materials ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.materials && (
              <div className="mt-4 space-y-4">
                {currentOrder.materials.map((material) => (
                  <div key={material.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.electricalService.materialPartName', 'Material/Part Name')}</label>
                        <input
                          type="text"
                          value={material.name}
                          onChange={e => updateMaterial(material.id, 'name', e.target.value)}
                          placeholder={t('tools.electricalService.partName', 'Part name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.part', 'Part #')}</label>
                        <input
                          type="text"
                          value={material.partNumber}
                          onChange={e => updateMaterial(material.id, 'partNumber', e.target.value)}
                          placeholder={t('tools.electricalService.skuPart', 'SKU/Part #')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.qty', 'Qty')}</label>
                        <input
                          type="number"
                          value={material.quantity}
                          onChange={e => updateMaterial(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.unitPrice', 'Unit Price ($)')}</label>
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
                          <label className={labelClass}>{t('tools.electricalService.total', 'Total')}</label>
                          <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
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
                  {t('tools.electricalService.addMaterialPart', 'Add Material/Part')}
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.laborHoursByElectrician', 'Labor Hours by Electrician')}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  (${laborTotal.toFixed(2)})
                </span>
              </div>
              {expandedSections.labor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.labor && (
              <div className="mt-4 space-y-4">
                {currentOrder.laborEntries.map((labor) => (
                  <div key={labor.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.electricianName', 'Electrician Name')}</label>
                        <input
                          type="text"
                          value={labor.electricianName}
                          onChange={e => updateLabor(labor.id, 'electricianName', e.target.value)}
                          placeholder={t('tools.electricalService.electricianName2', 'Electrician name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.employeeId', 'Employee ID')}</label>
                        <input
                          type="text"
                          value={labor.electricianId}
                          onChange={e => updateLabor(labor.id, 'electricianId', e.target.value)}
                          placeholder={t('tools.electricalService.employeeId2', 'Employee ID')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.licenseNumber', 'License Number')}</label>
                        <input
                          type="text"
                          value={labor.licenseNumber}
                          onChange={e => updateLabor(labor.id, 'licenseNumber', e.target.value)}
                          placeholder={t('tools.electricalService.license', 'License #')}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.electricalService.workDescription', 'Work Description')}</label>
                        <input
                          type="text"
                          value={labor.description}
                          onChange={e => updateLabor(labor.id, 'description', e.target.value)}
                          placeholder={t('tools.electricalService.workDescription2', 'Work description')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.hours', 'Hours')}</label>
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
                        <label className={labelClass}>{t('tools.electricalService.rateHr', 'Rate ($/hr)')}</label>
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
                          <label className={labelClass}>{t('tools.electricalService.total2', 'Total')}</label>
                          <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
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
                  {t('tools.electricalService.addElectricianLaborEntry', 'Add Electrician Labor Entry')}
                </button>
              </div>
            )}
          </div>

          {/* Panel Documentation Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('panels')}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.panelDocumentation', 'Panel Documentation')}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentOrder.panels.length} panels)
                </span>
              </div>
              {expandedSections.panels ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.panels && (
              <div className="mt-4 space-y-4">
                {currentOrder.panels.map((panel) => (
                  <div key={panel.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Panel: {panel.manufacturer} {panel.model || 'Unnamed'}
                      </h4>
                      <button
                        onClick={() => removePanel(panel.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.panelType', 'Panel Type')}</label>
                        <select
                          value={panel.panelType}
                          onChange={e => updatePanel(panel.id, 'panelType', e.target.value)}
                          className={selectClass}
                        >
                          <option value="main">{t('tools.electricalService.mainPanel', 'Main Panel')}</option>
                          <option value="sub">{t('tools.electricalService.subPanel', 'Sub Panel')}</option>
                          <option value="meter">{t('tools.electricalService.meterBox', 'Meter Box')}</option>
                          <option value="disconnect">{t('tools.electricalService.disconnect', 'Disconnect')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.manufacturer', 'Manufacturer')}</label>
                        <input
                          type="text"
                          value={panel.manufacturer}
                          onChange={e => updatePanel(panel.id, 'manufacturer', e.target.value)}
                          placeholder={t('tools.electricalService.eGSquareDSiemens', 'e.g., Square D, Siemens')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.model', 'Model')}</label>
                        <input
                          type="text"
                          value={panel.model}
                          onChange={e => updatePanel(panel.id, 'model', e.target.value)}
                          placeholder={t('tools.electricalService.model2', 'Model #')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.mainBreakerAmps', 'Main Breaker (Amps)')}</label>
                        <select
                          value={panel.mainBreakerAmps}
                          onChange={e => updatePanel(panel.id, 'mainBreakerAmps', e.target.value)}
                          className={selectClass}
                        >
                          <option value="100">100A</option>
                          <option value="125">125A</option>
                          <option value="150">150A</option>
                          <option value="200">200A</option>
                          <option value="225">225A</option>
                          <option value="400">400A</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.totalSlots', 'Total Slots')}</label>
                        <input
                          type="number"
                          value={panel.totalSlots}
                          onChange={e => updatePanel(panel.id, 'totalSlots', parseInt(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.usedSlots', 'Used Slots')}</label>
                        <input
                          type="number"
                          value={panel.usedSlots}
                          onChange={e => updatePanel(panel.id, 'usedSlots', parseInt(e.target.value) || 0)}
                          min="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.location', 'Location')}</label>
                        <input
                          type="text"
                          value={panel.location}
                          onChange={e => updatePanel(panel.id, 'location', e.target.value)}
                          placeholder={t('tools.electricalService.eGGarageBasement', 'e.g., Garage, Basement')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.installDate', 'Install Date')}</label>
                        <input
                          type="date"
                          value={panel.installDate}
                          onChange={e => updatePanel(panel.id, 'installDate', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>{t('tools.electricalService.notes', 'Notes')}</label>
                      <textarea
                        value={panel.notes}
                        onChange={e => updatePanel(panel.id, 'notes', e.target.value)}
                        placeholder={t('tools.electricalService.panelConditionObservations', 'Panel condition, observations...')}
                        rows={2}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addPanel}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.electricalService.addPanel', 'Add Panel')}
                </button>
              </div>
            )}
          </div>

          {/* Circuit Documentation Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('circuits')}
            >
              <div className="flex items-center gap-2">
                <CircuitBoard className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.circuitDocumentation', 'Circuit Documentation')}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentOrder.circuits.length} circuits)
                </span>
              </div>
              {expandedSections.circuits ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.circuits && (
              <div className="mt-4 space-y-4">
                {currentOrder.circuits.map((circuit) => (
                  <div key={circuit.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-8 gap-4 items-end">
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.circuit', 'Circuit #')}</label>
                        <input
                          type="text"
                          value={circuit.circuitNumber}
                          onChange={e => updateCircuit(circuit.id, 'circuitNumber', e.target.value)}
                          placeholder="#"
                          className={inputClass}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.electricalService.description', 'Description')}</label>
                        <input
                          type="text"
                          value={circuit.description}
                          onChange={e => updateCircuit(circuit.id, 'description', e.target.value)}
                          placeholder={t('tools.electricalService.eGKitchenOutlets', 'e.g., Kitchen outlets')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.amps', 'Amps')}</label>
                        <select
                          value={circuit.amperage}
                          onChange={e => updateCircuit(circuit.id, 'amperage', e.target.value)}
                          className={selectClass}
                        >
                          <option value="15">15A</option>
                          <option value="20">20A</option>
                          <option value="30">30A</option>
                          <option value="40">40A</option>
                          <option value="50">50A</option>
                          <option value="60">60A</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.voltage', 'Voltage')}</label>
                        <select
                          value={circuit.voltage}
                          onChange={e => updateCircuit(circuit.id, 'voltage', e.target.value)}
                          className={selectClass}
                        >
                          <option value="120">120V</option>
                          <option value="240">240V</option>
                          <option value="208">208V</option>
                          <option value="277">277V</option>
                          <option value="480">480V</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.wireSize', 'Wire Size')}</label>
                        <select
                          value={circuit.wireSize}
                          onChange={e => updateCircuit(circuit.id, 'wireSize', e.target.value)}
                          className={selectClass}
                        >
                          <option value="14 AWG">14 AWG</option>
                          <option value="12 AWG">12 AWG</option>
                          <option value="10 AWG">10 AWG</option>
                          <option value="8 AWG">8 AWG</option>
                          <option value="6 AWG">6 AWG</option>
                          <option value="4 AWG">4 AWG</option>
                          <option value="2 AWG">2 AWG</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.status2', 'Status')}</label>
                        <select
                          value={circuit.status}
                          onChange={e => updateCircuit(circuit.id, 'status', e.target.value)}
                          className={selectClass}
                        >
                          <option value="active">{t('tools.electricalService.active', 'Active')}</option>
                          <option value="inactive">{t('tools.electricalService.inactive', 'Inactive')}</option>
                          <option value="needs-repair">{t('tools.electricalService.needsRepair', 'Needs Repair')}</option>
                          <option value="replaced">{t('tools.electricalService.replaced', 'Replaced')}</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeCircuit(circuit.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCircuit}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.electricalService.addCircuit', 'Add Circuit')}
                </button>
              </div>
            )}
          </div>

          {/* Permit Tracking Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('permits')}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.permitTracking', 'Permit Tracking')}
                </span>
                {currentOrder.permit.permitNumber && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    {currentOrder.permit.inspectionStatus}
                  </span>
                )}
              </div>
              {expandedSections.permits ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.permits && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.electricalService.permitNumber', 'Permit Number')}</label>
                  <input
                    type="text"
                    value={currentOrder.permit.permitNumber}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, permitNumber: e.target.value }
                    }))}
                    placeholder={t('tools.electricalService.permit', 'Permit #')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.permitType', 'Permit Type')}</label>
                  <select
                    value={currentOrder.permit.permitType}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, permitType: e.target.value }
                    }))}
                    className={selectClass}
                  >
                    <option value="">{t('tools.electricalService.selectType', 'Select type...')}</option>
                    <option value="electrical">{t('tools.electricalService.electricalPermit', 'Electrical Permit')}</option>
                    <option value="building">{t('tools.electricalService.buildingPermit', 'Building Permit')}</option>
                    <option value="remodel">{t('tools.electricalService.remodelPermit', 'Remodel Permit')}</option>
                    <option value="service-upgrade">{t('tools.electricalService.serviceUpgradePermit', 'Service Upgrade Permit')}</option>
                    <option value="solar">{t('tools.electricalService.solarPvPermit', 'Solar/PV Permit')}</option>
                    <option value="ev-charger">{t('tools.electricalService.evChargerPermit', 'EV Charger Permit')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.issuedDate', 'Issued Date')}</label>
                  <input
                    type="date"
                    value={currentOrder.permit.issuedDate}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, issuedDate: e.target.value }
                    }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.expirationDate', 'Expiration Date')}</label>
                  <input
                    type="date"
                    value={currentOrder.permit.expirationDate}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, expirationDate: e.target.value }
                    }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.inspectionDate', 'Inspection Date')}</label>
                  <input
                    type="date"
                    value={currentOrder.permit.inspectionDate}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, inspectionDate: e.target.value }
                    }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.inspectionStatus', 'Inspection Status')}</label>
                  <select
                    value={currentOrder.permit.inspectionStatus}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, inspectionStatus: e.target.value as PermitInfo['inspectionStatus'] }
                    }))}
                    className={selectClass}
                  >
                    <option value="not-required">{t('tools.electricalService.notRequired', 'Not Required')}</option>
                    <option value="pending">{t('tools.electricalService.pending2', 'Pending')}</option>
                    <option value="scheduled">{t('tools.electricalService.scheduled', 'Scheduled')}</option>
                    <option value="passed">{t('tools.electricalService.passed', 'Passed')}</option>
                    <option value="failed">{t('tools.electricalService.failed', 'Failed')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.inspectorName', 'Inspector Name')}</label>
                  <input
                    type="text"
                    value={currentOrder.permit.inspectorName}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, inspectorName: e.target.value }
                    }))}
                    placeholder={t('tools.electricalService.inspectorName2', 'Inspector name')}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.electricalService.permitNotes', 'Permit Notes')}</label>
                  <textarea
                    value={currentOrder.permit.permitNotes}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      permit: { ...prev.permit, permitNotes: e.target.value }
                    }))}
                    placeholder={t('tools.electricalService.additionalPermitInformation', 'Additional permit information...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Code Compliance Checklist Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('compliance')}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.codeComplianceChecklist', 'Code Compliance Checklist')}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentOrder.codeCompliance.filter(c => c.status === 'compliant').length}/{currentOrder.codeCompliance.length} compliant)
                </span>
              </div>
              {expandedSections.compliance ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.compliance && (
              <div className="mt-4 space-y-4">
                {currentOrder.codeCompliance.length === 0 && (
                  <button
                    onClick={initializeComplianceChecklist}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    {t('tools.electricalService.initializeNecComplianceChecklist', 'Initialize NEC Compliance Checklist')}
                  </button>
                )}

                {currentOrder.codeCompliance.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.category}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            item.status === 'compliant' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            item.status === 'non-compliant' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            item.status === 'not-applicable' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.requirement}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <select
                              value={item.status}
                              onChange={e => updateComplianceItem(item.id, 'status', e.target.value)}
                              className={selectClass}
                            >
                              <option value="pending">{t('tools.electricalService.pendingReview', 'Pending Review')}</option>
                              <option value="compliant">{t('tools.electricalService.compliant', 'Compliant')}</option>
                              <option value="non-compliant">{t('tools.electricalService.nonCompliant', 'Non-Compliant')}</option>
                              <option value="not-applicable">{t('tools.electricalService.notApplicable', 'Not Applicable')}</option>
                            </select>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={e => updateComplianceItem(item.id, 'notes', e.target.value)}
                              placeholder={t('tools.electricalService.notes2', 'Notes...')}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeComplianceItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addComplianceItem}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.electricalService.addComplianceItem', 'Add Compliance Item')}
                </button>
              </div>
            )}
          </div>

          {/* Safety Inspection Notes Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('safety')}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.safetyInspectionNotes', 'Safety Inspection Notes')}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({currentOrder.safetyInspections.length} inspections)
                </span>
              </div>
              {expandedSections.safety ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.safety && (
              <div className="mt-4 space-y-4">
                {currentOrder.safetyInspections.map((inspection) => (
                  <div key={inspection.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          inspection.result === 'pass' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          inspection.result === 'fail' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {inspection.result.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSafetyInspection(inspection.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.inspectionType', 'Inspection Type')}</label>
                        <input
                          type="text"
                          value={inspection.inspectionType}
                          onChange={e => updateSafetyInspection(inspection.id, 'inspectionType', e.target.value)}
                          placeholder={t('tools.electricalService.eGPreWorkFinal', 'e.g., Pre-work, Final')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.date', 'Date')}</label>
                        <input
                          type="date"
                          value={inspection.inspectionDate}
                          onChange={e => updateSafetyInspection(inspection.id, 'inspectionDate', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.inspector', 'Inspector')}</label>
                        <input
                          type="text"
                          value={inspection.inspectorName}
                          onChange={e => updateSafetyInspection(inspection.id, 'inspectorName', e.target.value)}
                          placeholder={t('tools.electricalService.inspectorName3', 'Inspector name')}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.result', 'Result')}</label>
                        <select
                          value={inspection.result}
                          onChange={e => updateSafetyInspection(inspection.id, 'result', e.target.value)}
                          className={selectClass}
                        >
                          <option value="pass">{t('tools.electricalService.pass', 'Pass')}</option>
                          <option value="fail">{t('tools.electricalService.fail', 'Fail')}</option>
                          <option value="conditional">{t('tools.electricalService.conditional', 'Conditional')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.findings', 'Findings')}</label>
                        <textarea
                          value={inspection.findings}
                          onChange={e => updateSafetyInspection(inspection.id, 'findings', e.target.value)}
                          placeholder={t('tools.electricalService.inspectionFindings', 'Inspection findings...')}
                          rows={2}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.electricalService.correctiveActions', 'Corrective Actions')}</label>
                        <textarea
                          value={inspection.correctiveActions}
                          onChange={e => updateSafetyInspection(inspection.id, 'correctiveActions', e.target.value)}
                          placeholder={t('tools.electricalService.requiredCorrectiveActions', 'Required corrective actions...')}
                          rows={2}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addSafetyInspection}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0D9488] text-gray-500 dark:text-gray-400 hover:text-[#0D9488] rounded-lg transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.electricalService.addSafetyInspection', 'Add Safety Inspection')}
                </button>
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.emergencyCallTracking', 'Emergency Call Tracking')}
                </span>
                {currentOrder.isEmergency && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                    {t('tools.electricalService.emergency2', 'EMERGENCY')}
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
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                    {t('tools.electricalService.thisIsAnEmergencyService', 'This is an emergency service call')}
                  </span>
                </label>

                {currentOrder.isEmergency && (
                  <div>
                    <label className={labelClass}>{t('tools.electricalService.emergencyDetails', 'Emergency Details')}</label>
                    <textarea
                      value={currentOrder.emergencyNotes}
                      onChange={e => setCurrentOrder(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                      placeholder={t('tools.electricalService.describeTheEmergencySituationPower', 'Describe the emergency situation (power outage, sparking, burning smell, etc.)...')}
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.warrantyTracking', 'Warranty Tracking')}
                </span>
              </div>
              {expandedSections.warranty ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.warranty && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.electricalService.laborWarranty', 'Labor Warranty')}</label>
                  <input
                    type="text"
                    value={currentOrder.warranty.laborWarranty}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, laborWarranty: e.target.value }
                    }))}
                    placeholder={t('tools.electricalService.eG1Year', 'e.g., 1 year')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.partsWarranty', 'Parts Warranty')}</label>
                  <input
                    type="text"
                    value={currentOrder.warranty.partsWarranty}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, partsWarranty: e.target.value }
                    }))}
                    placeholder={t('tools.electricalService.eGManufacturerWarranty', 'e.g., Manufacturer warranty')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.electricalService.warrantyStartDate', 'Warranty Start Date')}</label>
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
                  <label className={labelClass}>{t('tools.electricalService.warrantyEndDate', 'Warranty End Date')}</label>
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
                  <label className={labelClass}>{t('tools.electricalService.warrantyNotes', 'Warranty Notes')}</label>
                  <textarea
                    value={currentOrder.warranty.warrantyNotes}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      warranty: { ...prev.warranty, warrantyNotes: e.target.value }
                    }))}
                    placeholder={t('tools.electricalService.additionalWarrantyInformation', 'Additional warranty information...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Service Agreement Section */}
          <div className={cardClass}>
            <div
              className={sectionHeaderClass}
              onClick={() => toggleSection('serviceAgreement')}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0D9488]" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.serviceAgreementMaintenancePlan', 'Service Agreement / Maintenance Plan')}
                </span>
                {currentOrder.serviceAgreement.enabled && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                    {t('tools.electricalService.active2', 'ACTIVE')}
                  </span>
                )}
              </div>
              {expandedSections.serviceAgreement ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {expandedSections.serviceAgreement && (
              <div className="mt-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentOrder.serviceAgreement.enabled}
                    onChange={e => setCurrentOrder(prev => ({
                      ...prev,
                      serviceAgreement: { ...prev.serviceAgreement, enabled: e.target.checked }
                    }))}
                    className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                    {t('tools.electricalService.customerHasServiceAgreement', 'Customer has service agreement')}
                  </span>
                </label>

                {currentOrder.serviceAgreement.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.electricalService.agreementType', 'Agreement Type')}</label>
                      <select
                        value={currentOrder.serviceAgreement.agreementType}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          serviceAgreement: { ...prev.serviceAgreement, agreementType: e.target.value as ServiceAgreement['agreementType'] }
                        }))}
                        className={selectClass}
                      >
                        <option value="basic">{t('tools.electricalService.basic', 'Basic')}</option>
                        <option value="standard">{t('tools.electricalService.standard', 'Standard')}</option>
                        <option value="premium">{t('tools.electricalService.premium', 'Premium')}</option>
                        <option value="custom">{t('tools.electricalService.custom', 'Custom')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.electricalService.monthlyFee', 'Monthly Fee ($)')}</label>
                      <input
                        type="number"
                        value={currentOrder.serviceAgreement.monthlyFee}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          serviceAgreement: { ...prev.serviceAgreement, monthlyFee: parseFloat(e.target.value) || 0 }
                        }))}
                        min="0"
                        step="0.01"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.electricalService.startDate', 'Start Date')}</label>
                      <input
                        type="date"
                        value={currentOrder.serviceAgreement.startDate}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          serviceAgreement: { ...prev.serviceAgreement, startDate: e.target.value }
                        }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.electricalService.endDate', 'End Date')}</label>
                      <input
                        type="date"
                        value={currentOrder.serviceAgreement.endDate}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          serviceAgreement: { ...prev.serviceAgreement, endDate: e.target.value }
                        }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('tools.electricalService.servicesIncluded', 'Services Included')}</label>
                      <textarea
                        value={currentOrder.serviceAgreement.servicesIncluded}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          serviceAgreement: { ...prev.serviceAgreement, servicesIncluded: e.target.value }
                        }))}
                        placeholder={t('tools.electricalService.listIncludedServicesAnnualInspection', 'List included services (annual inspection, priority scheduling, etc.)...')}
                        rows={2}
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('tools.electricalService.agreementNotes', 'Agreement Notes')}</label>
                      <textarea
                        value={currentOrder.serviceAgreement.notes}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          serviceAgreement: { ...prev.serviceAgreement, notes: e.target.value }
                        }))}
                        placeholder={t('tools.electricalService.additionalAgreementNotes', 'Additional agreement notes...')}
                        rows={2}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.electricalService.recurringServiceSchedule', 'Recurring Service Schedule')}
                </span>
                {currentOrder.recurringSchedule.enabled && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    {t('tools.electricalService.scheduled2', 'SCHEDULED')}
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
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                    {t('tools.electricalService.enableRecurringServiceSchedule', 'Enable recurring service schedule')}
                  </span>
                </label>

                {currentOrder.recurringSchedule.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.electricalService.frequency', 'Frequency')}</label>
                      <select
                        value={currentOrder.recurringSchedule.frequency}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          recurringSchedule: { ...prev.recurringSchedule, frequency: e.target.value as RecurringSchedule['frequency'] }
                        }))}
                        className={selectClass}
                      >
                        <option value="weekly">{t('tools.electricalService.weekly', 'Weekly')}</option>
                        <option value="monthly">{t('tools.electricalService.monthly', 'Monthly')}</option>
                        <option value="quarterly">{t('tools.electricalService.quarterly', 'Quarterly')}</option>
                        <option value="semi-annually">{t('tools.electricalService.semiAnnually', 'Semi-Annually')}</option>
                        <option value="annually">{t('tools.electricalService.annually', 'Annually')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.electricalService.nextServiceDate', 'Next Service Date')}</label>
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
                      <label className={labelClass}>{t('tools.electricalService.scheduleNotes', 'Schedule Notes')}</label>
                      <textarea
                        value={currentOrder.recurringSchedule.notes}
                        onChange={e => setCurrentOrder(prev => ({
                          ...prev,
                          recurringSchedule: { ...prev.recurringSchedule, notes: e.target.value }
                        }))}
                        placeholder={t('tools.electricalService.notesAboutRecurringService', 'Notes about recurring service...')}
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
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5 text-[#0D9488]" />
              {t('tools.electricalService.estimateVsActualCosts', 'Estimate vs Actual Costs')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>{t('tools.electricalService.estimatedTotal', 'Estimated Total')}</label>
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
                <label className={labelClass}>{t('tools.electricalService.materialsTotal', 'Materials Total')}</label>
                <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  ${materialsTotal.toFixed(2)}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.electricalService.laborTotal', 'Labor Total')}</label>
                <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  ${laborTotal.toFixed(2)}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.electricalService.actualTotal', 'Actual Total')}</label>
                <div className={`px-4 py-2 rounded-lg font-bold ${isDark ? t('tools.electricalService.bg0d948820Text2dd4bf', 'bg-[#0D9488]/20 text-[#2DD4BF]') : t('tools.electricalService.bg0d948810Text0d9488', 'bg-[#0D9488]/10 text-[#0D9488]')}`}>
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
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {t('tools.electricalService.varianceFromEstimate', 'Variance from Estimate')}
                  </span>
                  <span className={`font-bold ${
                    variance > 0
                      ? 'text-red-600 dark:text-red-400'
                      : variance < 0
                      ? 'text-green-600 dark:text-green-400'
                      : isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {variance > 0 ? '+' : ''}${variance.toFixed(2)} ({currentOrder.estimatedTotal > 0 ? ((variance / currentOrder.estimatedTotal) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5 text-[#0D9488]" />
              {t('tools.electricalService.paymentInformation', 'Payment Information')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.electricalService.paymentStatus', 'Payment Status')}</label>
                <select
                  value={currentOrder.paymentStatus}
                  onChange={e => setCurrentOrder(prev => ({ ...prev, paymentStatus: e.target.value as WorkOrder['paymentStatus'] }))}
                  className={selectClass}
                >
                  <option value="pending">{t('tools.electricalService.pending3', 'Pending')}</option>
                  <option value="partial">{t('tools.electricalService.partialPayment', 'Partial Payment')}</option>
                  <option value="paid">{t('tools.electricalService.paidInFull', 'Paid in Full')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.electricalService.paymentMethod', 'Payment Method')}</label>
                <select
                  value={currentOrder.paymentMethod}
                  onChange={e => setCurrentOrder(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">{t('tools.electricalService.selectMethod', 'Select method...')}</option>
                  <option value="cash">{t('tools.electricalService.cash', 'Cash')}</option>
                  <option value="check">{t('tools.electricalService.check', 'Check')}</option>
                  <option value="credit">{t('tools.electricalService.creditCard', 'Credit Card')}</option>
                  <option value="debit">{t('tools.electricalService.debitCard', 'Debit Card')}</option>
                  <option value="invoice">{t('tools.electricalService.invoiceNet30', 'Invoice (Net 30)')}</option>
                  <option value="financing">{t('tools.electricalService.financing', 'Financing')}</option>
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
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {t('tools.electricalService.customerSignatureObtained', 'Customer signature obtained')}
                </span>
              </label>
            </div>
          </div>

          {/* Notes Section */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-[#0D9488]" />
              {t('tools.electricalService.additionalNotes', 'Additional Notes')}
            </h3>
            <textarea
              value={currentOrder.notes}
              onChange={e => setCurrentOrder(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('tools.electricalService.anyAdditionalNotesAboutThis', 'Any additional notes about this work order...')}
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
              {t('tools.electricalService.saveWorkOrder', 'Save Work Order')}
            </button>
            <button
              onClick={generateInvoice}
              disabled={!currentOrder.customerName}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {t('tools.electricalService.generateInvoice', 'Generate Invoice')}
            </button>
            <button
              onClick={createNewWorkOrder}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.electricalService.newWorkOrder', 'New Work Order')}
            </button>
          </div>

          {/* Info Section */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.electricalService.aboutElectricalServiceManager', 'About Electrical Service Manager')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              A comprehensive tool for electrical contractors to manage service calls, work orders, and invoicing.
              Track customer and property information, job types (repair, installation, upgrade, inspection),
              work orders, permits, materials, labor hours by electrician, panel/circuit documentation,
              NEC code compliance checklists, safety inspection notes, estimate vs actual costs, warranty tracking,
              and service agreements. All data is automatically saved to your browser's local storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalServiceTool;
