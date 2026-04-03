'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Camera,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  User,
  Calendar,
  AlertCircle,
  Wrench,
  Eye,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// ============================================
// TypeScript Interfaces
// ============================================

type InspectionResult = 'pass' | 'fail' | 'conditional_pass' | 'pending_review';
type DefectSeverity = 'critical' | 'major' | 'minor' | 'cosmetic';
type CorrectiveActionStatus = 'open' | 'in_progress' | 'completed' | 'verified';

interface ChecklistItem {
  id: string;
  name: string;
  description?: string;
  passed: boolean | null;
  notes: string;
}

interface Defect {
  id: string;
  inspectionId: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  location?: string;
  photoRefs: string[];
  createdAt: string;
  resolvedAt?: string;
}

interface CorrectiveAction {
  id: string;
  defectId: string;
  inspectionId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: CorrectiveActionStatus;
  completedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

interface Inspection {
  id: string;
  productName: string;
  batchNumber: string;
  inspector: string;
  inspectionDate: string;
  checklistItems: ChecklistItem[];
  result: InspectionResult;
  notes: string;
  photoRefs: string[];
  documentRefs: string[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  specifications: string;
  createdAt: string;
}

interface QualityMetrics {
  totalInspections: number;
  passRate: number;
  failRate: number;
  conditionalPassRate: number;
  pendingReviewCount: number;
  defectsByCategory: Record<DefectSeverity, number>;
  trendsLast30Days: { date: string; passRate: number }[];
}

interface QualityControlToolProps {
  uiConfig?: UIConfig;
}

// Compound data structure for useToolData hook
interface QualityControlData {
  id: string;
  inspections: Inspection[];
  defects: Defect[];
  correctiveActions: CorrectiveAction[];
  products: Product[];
}

// ============================================
// Constants
// ============================================

// Column configuration for exports (used with useToolData hook)
const COLUMNS: ColumnConfig[] = [
  { key: 'productName', header: 'Product Name', type: 'string' },
  { key: 'batchNumber', header: 'Batch Number', type: 'string' },
  { key: 'inspector', header: 'Inspector', type: 'string' },
  { key: 'inspectionDate', header: 'Inspection Date', type: 'date' },
  { key: 'result', header: 'Result', type: 'string' },
  { key: 'checklistPassedCount', header: 'Checklist Passed', type: 'number' },
  { key: 'checklistTotalCount', header: 'Checklist Total', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

// Default empty data structure
const DEFAULT_QC_DATA: QualityControlData = {
  id: 'quality-control-main',
  inspections: [],
  defects: [],
  correctiveActions: [],
  products: [],
};

const resultConfig: Record<InspectionResult, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pass: {
    label: 'Pass',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="w-4 h-4" />
  },
  fail: {
    label: 'Fail',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="w-4 h-4" />
  },
  conditional_pass: {
    label: 'Conditional Pass',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  pending_review: {
    label: 'Pending Review',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: <Clock className="w-4 h-4" />
  }
};

const severityConfig: Record<DefectSeverity, { label: string; color: string; bgColor: string }> = {
  critical: {
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  major: {
    label: 'Major',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  minor: {
    label: 'Minor',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  cosmetic: {
    label: 'Cosmetic',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  }
};

const actionStatusConfig: Record<CorrectiveActionStatus, { label: string; color: string; bgColor: string }> = {
  open: {
    label: 'Open',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  verified: {
    label: 'Verified',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  }
};

// ============================================
// Sample Data Generator
// ============================================

const generateSampleData = (): {
  inspections: Inspection[];
  defects: Defect[];
  correctiveActions: CorrectiveAction[];
  products: Product[];
} => {
  const products: Product[] = [
    {
      id: 'prod-1',
      name: 'Widget A-100',
      sku: 'WGT-A100',
      category: 'Electronics',
      specifications: 'Voltage: 12V, Current: 2A, Dimensions: 10x5x3cm',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'prod-2',
      name: 'Component B-200',
      sku: 'CMP-B200',
      category: 'Mechanical',
      specifications: 'Material: Steel, Weight: 500g, Tolerance: 0.01mm',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'prod-3',
      name: 'Assembly C-300',
      sku: 'ASM-C300',
      category: 'Assembly',
      specifications: 'Components: 15, Assembly time: 30min',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const inspections: Inspection[] = [
    {
      id: 'insp-1',
      productName: 'Widget A-100',
      batchNumber: 'BATCH-2024-001',
      inspector: 'John Smith',
      inspectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checklistItems: [
        { id: 'cl-1', name: 'Visual Inspection', passed: true, notes: '' },
        { id: 'cl-2', name: 'Dimensional Check', passed: true, notes: '' },
        { id: 'cl-3', name: 'Functional Test', passed: true, notes: '' },
        { id: 'cl-4', name: 'Safety Test', passed: true, notes: '' }
      ],
      result: 'pass',
      notes: 'All tests passed successfully',
      photoRefs: ['photo-001.jpg'],
      documentRefs: ['report-001.pdf'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'insp-2',
      productName: 'Component B-200',
      batchNumber: 'BATCH-2024-002',
      inspector: 'Sarah Johnson',
      inspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checklistItems: [
        { id: 'cl-5', name: 'Visual Inspection', passed: true, notes: '' },
        { id: 'cl-6', name: 'Dimensional Check', passed: false, notes: 'Tolerance exceeded by 0.02mm' },
        { id: 'cl-7', name: 'Material Test', passed: true, notes: '' },
        { id: 'cl-8', name: 'Surface Finish', passed: false, notes: 'Minor scratches detected' }
      ],
      result: 'conditional_pass',
      notes: 'Minor issues found, acceptable with corrective action',
      photoRefs: ['photo-002.jpg', 'photo-003.jpg'],
      documentRefs: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'insp-3',
      productName: 'Assembly C-300',
      batchNumber: 'BATCH-2024-003',
      inspector: 'Mike Wilson',
      inspectionDate: new Date().toISOString().split('T')[0],
      checklistItems: [
        { id: 'cl-9', name: 'Component Count', passed: true, notes: '' },
        { id: 'cl-10', name: 'Assembly Check', passed: false, notes: 'Missing fastener' },
        { id: 'cl-11', name: 'Functional Test', passed: false, notes: 'Motor not responding' },
        { id: 'cl-12', name: 'Packaging', passed: null, notes: '' }
      ],
      result: 'fail',
      notes: 'Critical defects found, batch rejected',
      photoRefs: ['photo-004.jpg'],
      documentRefs: ['ncr-001.pdf'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const defects: Defect[] = [
    {
      id: 'def-1',
      inspectionId: 'insp-2',
      title: 'Dimensional Out of Tolerance',
      description: 'Part dimension exceeds tolerance by 0.02mm',
      severity: 'minor',
      location: 'Component B-200, Mounting hole',
      photoRefs: ['defect-photo-001.jpg'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'def-2',
      inspectionId: 'insp-2',
      title: 'Surface Scratches',
      description: 'Minor scratches on visible surface',
      severity: 'cosmetic',
      location: 'Component B-200, Top surface',
      photoRefs: ['defect-photo-002.jpg'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'def-3',
      inspectionId: 'insp-3',
      title: 'Missing Fastener',
      description: 'M3 screw missing from assembly',
      severity: 'major',
      location: 'Assembly C-300, Position 4',
      photoRefs: ['defect-photo-003.jpg'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'def-4',
      inspectionId: 'insp-3',
      title: 'Motor Failure',
      description: 'Motor does not respond to power input',
      severity: 'critical',
      location: 'Assembly C-300, Motor unit',
      photoRefs: ['defect-photo-004.jpg'],
      createdAt: new Date().toISOString()
    }
  ];

  const correctiveActions: CorrectiveAction[] = [
    {
      id: 'ca-1',
      defectId: 'def-1',
      inspectionId: 'insp-2',
      title: 'Adjust machining parameters',
      description: 'Review and adjust CNC machining parameters to bring dimensions within tolerance',
      assignedTo: 'Production Team',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ca-2',
      defectId: 'def-3',
      inspectionId: 'insp-3',
      title: 'Implement fastener verification step',
      description: 'Add visual verification step to assembly process to ensure all fasteners are installed',
      assignedTo: 'Quality Team',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ca-3',
      defectId: 'def-4',
      inspectionId: 'insp-3',
      title: 'Replace motor supplier',
      description: 'Evaluate and qualify new motor supplier due to quality issues',
      assignedTo: 'Procurement',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      createdAt: new Date().toISOString()
    }
  ];

  return { inspections, defects, correctiveActions, products };
};

// ============================================
// Default Checklist Items
// ============================================

const getDefaultChecklistItems = (): ChecklistItem[] => [
  { id: `cl-${Date.now()}-1`, name: 'Visual Inspection', description: 'Check for visible defects', passed: null, notes: '' },
  { id: `cl-${Date.now()}-2`, name: 'Dimensional Check', description: 'Verify dimensions match specifications', passed: null, notes: '' },
  { id: `cl-${Date.now()}-3`, name: 'Functional Test', description: 'Test product functionality', passed: null, notes: '' },
  { id: `cl-${Date.now()}-4`, name: 'Packaging Inspection', description: 'Verify packaging integrity', passed: null, notes: '' }
];

// ============================================
// Main Component
// ============================================

export const QualityControlTool: React.FC<QualityControlToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence
  const {
    data: qcDataArray,
    setData: setQcDataArray,
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
  } = useToolData<QualityControlData>('quality-control', [DEFAULT_QC_DATA], COLUMNS);

  // Extract data from the compound structure (we store it as a single-item array)
  const qcData = qcDataArray[0] || DEFAULT_QC_DATA;
  const inspections = qcData.inspections;
  const defects = qcData.defects;
  const correctiveActions = qcData.correctiveActions;
  const products = qcData.products;

  // Helper function to update the compound data
  const updateQcData = (updates: Partial<Omit<QualityControlData, 'id'>>) => {
    setQcDataArray([{
      ...qcData,
      ...updates,
    }]);
  };

  // Setters for individual data arrays
  const setInspections = (updater: Inspection[] | ((prev: Inspection[]) => Inspection[])) => {
    const newInspections = typeof updater === 'function' ? updater(inspections) : updater;
    updateQcData({ inspections: newInspections });
  };

  const setDefects = (updater: Defect[] | ((prev: Defect[]) => Defect[])) => {
    const newDefects = typeof updater === 'function' ? updater(defects) : updater;
    updateQcData({ defects: newDefects });
  };

  const setCorrectiveActions = (updater: CorrectiveAction[] | ((prev: CorrectiveAction[]) => CorrectiveAction[])) => {
    const newActions = typeof updater === 'function' ? updater(correctiveActions) : updater;
    updateQcData({ correctiveActions: newActions });
  };

  const setProducts = (updater: Product[] | ((prev: Product[]) => Product[])) => {
    const newProducts = typeof updater === 'function' ? updater(products) : updater;
    updateQcData({ products: newProducts });
  };

  // UI State
  const [activeTab, setActiveTab] = useState<'inspections' | 'defects' | 'products' | 'reports'>('inspections');
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<InspectionResult | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // Modal State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);

  // Form State
  const [inspectionForm, setInspectionForm] = useState({
    productName: '',
    batchNumber: '',
    inspector: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    checklistItems: getDefaultChecklistItems(),
    result: 'pending_review' as InspectionResult,
    notes: '',
    photoRefs: [] as string[],
    documentRefs: [] as string[]
  });

  const [defectForm, setDefectForm] = useState({
    title: '',
    description: '',
    severity: 'minor' as DefectSeverity,
    location: '',
    photoRefs: [] as string[]
  });

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    specifications: ''
  });

  const [actionForm, setActionForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    status: 'open' as CorrectiveActionStatus
  });

  // Load sample data if no data exists (first time load)
  useEffect(() => {
    if (!isLoading && qcDataArray.length > 0) {
      const data = qcDataArray[0];
      // If all arrays are empty, load sample data
      if (
        data.inspections.length === 0 &&
        data.defects.length === 0 &&
        data.correctiveActions.length === 0 &&
        data.products.length === 0
      ) {
        const sampleData = generateSampleData();
        setQcDataArray([{
          id: 'quality-control-main',
          inspections: sampleData.inspections,
          defects: sampleData.defects,
          correctiveActions: sampleData.correctiveActions,
          products: sampleData.products,
        }]);
      }
    }
  }, [isLoading, qcDataArray, setQcDataArray]);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.productName) {
        setInspectionForm(prev => ({ ...prev, productName: String(params.productName) }));
        setShowInspectionModal(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate metrics
  const metrics: QualityMetrics = useMemo(() => {
    const totalInspections = inspections.length;
    const passCount = inspections.filter(i => i.result === 'pass').length;
    const failCount = inspections.filter(i => i.result === 'fail').length;
    const conditionalPassCount = inspections.filter(i => i.result === 'conditional_pass').length;
    const pendingReviewCount = inspections.filter(i => i.result === 'pending_review').length;

    const defectsByCategory: Record<DefectSeverity, number> = {
      critical: defects.filter(d => d.severity === 'critical').length,
      major: defects.filter(d => d.severity === 'major').length,
      minor: defects.filter(d => d.severity === 'minor').length,
      cosmetic: defects.filter(d => d.severity === 'cosmetic').length
    };

    // Calculate trends for last 30 days
    const trendsLast30Days: { date: string; passRate: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayInspections = inspections.filter(insp => insp.inspectionDate === dateStr);
      const dayPassCount = dayInspections.filter(insp => insp.result === 'pass').length;
      const passRate = dayInspections.length > 0 ? (dayPassCount / dayInspections.length) * 100 : 0;
      trendsLast30Days.push({ date: dateStr, passRate });
    }

    return {
      totalInspections,
      passRate: totalInspections > 0 ? (passCount / totalInspections) * 100 : 0,
      failRate: totalInspections > 0 ? (failCount / totalInspections) * 100 : 0,
      conditionalPassRate: totalInspections > 0 ? (conditionalPassCount / totalInspections) * 100 : 0,
      pendingReviewCount,
      defectsByCategory,
      trendsLast30Days
    };
  }, [inspections, defects]);

  // Filter inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      const matchesSearch = searchQuery === '' ||
        insp.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insp.inspector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesResult = resultFilter === '' || insp.result === resultFilter;
      const matchesProduct = productFilter === '' || insp.productName === productFilter;

      const matchesDateFrom = dateFrom === '' || insp.inspectionDate >= dateFrom;
      const matchesDateTo = dateTo === '' || insp.inspectionDate <= dateTo;

      return matchesSearch && matchesResult && matchesProduct && matchesDateFrom && matchesDateTo;
    });
  }, [inspections, searchQuery, resultFilter, productFilter, dateFrom, dateTo]);

  // Prepare export data with computed checklist counts
  const exportData = useMemo(() => {
    return filteredInspections.map(insp => ({
      ...insp,
      checklistPassedCount: insp.checklistItems.filter(item => item.passed === true).length,
      checklistTotalCount: insp.checklistItems.length,
    }));
  }, [filteredInspections]);

  // CRUD Operations
  const handleSaveInspection = () => {
    if (!inspectionForm.productName || !inspectionForm.batchNumber || !inspectionForm.inspector) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (editingInspection) {
      setInspections(prev => prev.map(insp =>
        insp.id === editingInspection.id
          ? { ...insp, ...inspectionForm, updatedAt: now }
          : insp
      ));
    } else {
      const newInspection: Inspection = {
        id: `insp-${Date.now()}`,
        ...inspectionForm,
        createdAt: now,
        updatedAt: now
      };
      setInspections(prev => [newInspection, ...prev]);
    }

    resetInspectionForm();
    setShowInspectionModal(false);
  };

  const handleDeleteInspection = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Inspection',
      message: 'Are you sure you want to delete this inspection?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      setInspections(prev => prev.filter(insp => insp.id !== id));
      setDefects(prev => prev.filter(def => def.inspectionId !== id));
      setCorrectiveActions(prev => prev.filter(ca => ca.inspectionId !== id));
    }
  };

  const handleSaveDefect = () => {
    if (!defectForm.title || !selectedInspectionId) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingDefect) {
      setDefects(prev => prev.map(def =>
        def.id === editingDefect.id
          ? { ...def, ...defectForm }
          : def
      ));
    } else {
      const newDefect: Defect = {
        id: `def-${Date.now()}`,
        inspectionId: selectedInspectionId,
        ...defectForm,
        createdAt: new Date().toISOString()
      };
      setDefects(prev => [newDefect, ...prev]);
    }

    resetDefectForm();
    setShowDefectModal(false);
    setSelectedInspectionId(null);
  };

  const handleDeleteDefect = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Defect',
      message: 'Are you sure you want to delete this defect?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      setDefects(prev => prev.filter(def => def.id !== id));
      setCorrectiveActions(prev => prev.filter(ca => ca.defectId !== id));
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.sku) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingProduct) {
      setProducts(prev => prev.map(prod =>
        prod.id === editingProduct.id
          ? { ...prod, ...productForm }
          : prod
      ));
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...productForm,
        createdAt: new Date().toISOString()
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    resetProductForm();
    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      setProducts(prev => prev.filter(prod => prod.id !== id));
    }
  };

  const handleSaveAction = () => {
    if (!actionForm.title || !selectedDefectId || !selectedInspectionId) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingAction) {
      setCorrectiveActions(prev => prev.map(ca =>
        ca.id === editingAction.id
          ? { ...ca, ...actionForm, completedAt: actionForm.status === 'completed' || actionForm.status === 'verified' ? new Date().toISOString() : undefined }
          : ca
      ));
    } else {
      const newAction: CorrectiveAction = {
        id: `ca-${Date.now()}`,
        defectId: selectedDefectId,
        inspectionId: selectedInspectionId,
        ...actionForm,
        createdAt: new Date().toISOString()
      };
      setCorrectiveActions(prev => [newAction, ...prev]);
    }

    resetActionForm();
    setShowActionModal(false);
    setSelectedDefectId(null);
    setSelectedInspectionId(null);
  };

  // Reset Functions
  const resetInspectionForm = () => {
    setInspectionForm({
      productName: '',
      batchNumber: '',
      inspector: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      checklistItems: getDefaultChecklistItems(),
      result: 'pending_review',
      notes: '',
      photoRefs: [],
      documentRefs: []
    });
    setEditingInspection(null);
  };

  const resetDefectForm = () => {
    setDefectForm({
      title: '',
      description: '',
      severity: 'minor',
      location: '',
      photoRefs: []
    });
    setEditingDefect(null);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      category: '',
      specifications: ''
    });
    setEditingProduct(null);
  };

  const resetActionForm = () => {
    setActionForm({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      status: 'open'
    });
    setEditingAction(null);
  };

  const openEditInspection = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setInspectionForm({
      productName: inspection.productName,
      batchNumber: inspection.batchNumber,
      inspector: inspection.inspector,
      inspectionDate: inspection.inspectionDate,
      checklistItems: inspection.checklistItems,
      result: inspection.result,
      notes: inspection.notes,
      photoRefs: inspection.photoRefs,
      documentRefs: inspection.documentRefs
    });
    setShowInspectionModal(true);
  };

  const updateChecklistItem = (itemId: string, field: 'passed' | 'notes', value: boolean | null | string) => {
    setInspectionForm(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `cl-${Date.now()}`,
      name: '',
      passed: null,
      notes: ''
    };
    setInspectionForm(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, newItem]
    }));
  };

  const removeChecklistItem = (itemId: string) => {
    setInspectionForm(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter(item => item.id !== itemId)
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  // Render Functions
  const renderInspectionsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.qualityControl.searchInspections', 'Search inspections...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as InspectionResult | '')}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="">{t('tools.qualityControl.allResults', 'All Results')}</option>
            <option value="pass">{t('tools.qualityControl.pass', 'Pass')}</option>
            <option value="fail">{t('tools.qualityControl.fail', 'Fail')}</option>
            <option value="conditional_pass">{t('tools.qualityControl.conditionalPass', 'Conditional Pass')}</option>
            <option value="pending_review">{t('tools.qualityControl.pendingReview', 'Pending Review')}</option>
          </select>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="">{t('tools.qualityControl.allProducts', 'All Products')}</option>
            {products.map(prod => (
              <option key={prod.id} value={prod.name}>{prod.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder={t('tools.qualityControl.from', 'From')}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To"
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
      </div>

      {/* Inspections List */}
      <div className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        {filteredInspections.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardCheck className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.qualityControl.noInspectionsFound', 'No inspections found')}</p>
            <button
              onClick={() => {
                resetInspectionForm();
                setShowInspectionModal(true);
              }}
              className="mt-4 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
            >
              {t('tools.qualityControl.createFirstInspection', 'Create First Inspection')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.productBatch', 'Product/Batch')}</th>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.inspector', 'Inspector')}</th>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.date', 'Date')}</th>
                  <th className={`text-center p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.checklist', 'Checklist')}</th>
                  <th className={`text-center p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.result', 'Result')}</th>
                  <th className={`text-right p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.map(inspection => {
                  const passedItems = inspection.checklistItems.filter(i => i.passed === true).length;
                  const totalItems = inspection.checklistItems.length;
                  const inspectionDefects = defects.filter(d => d.inspectionId === inspection.id);

                  return (
                    <tr key={inspection.id} className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/20' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="p-4">
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{inspection.productName}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{inspection.batchNumber}</p>
                        </div>
                      </td>
                      <td className={`p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {inspection.inspector}
                        </div>
                      </td>
                      <td className={`p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {inspection.inspectionDate}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          passedItems === totalItems
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : passedItems > 0
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {passedItems}/{totalItems}
                        </span>
                        {inspectionDefects.length > 0 && (
                          <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            {inspectionDefects.length} defects
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${resultConfig[inspection.result].bgColor} ${resultConfig[inspection.result].color}`}>
                            {resultConfig[inspection.result].icon}
                            {resultConfig[inspection.result].label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInspectionId(inspection.id);
                              resetDefectForm();
                              setShowDefectModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-yellow-600'}`}
                            title={t('tools.qualityControl.addDefect', 'Add Defect')}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditInspection(inspection)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            title={t('tools.qualityControl.edit', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInspection(inspection.id)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderDefectsTab = () => (
    <div className="space-y-4">
      {/* Defects List */}
      <div className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        {defects.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.qualityControl.noDefectsRecorded', 'No defects recorded')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {defects.map(defect => {
              const inspection = inspections.find(i => i.id === defect.inspectionId);
              const relatedActions = correctiveActions.filter(ca => ca.defectId === defect.id);

              return (
                <div key={defect.id} className={`p-4 ${theme === 'dark' ? 'hover:bg-gray-700/20' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityConfig[defect.severity].bgColor} ${severityConfig[defect.severity].color}`}>
                          {severityConfig[defect.severity].label}
                        </span>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{defect.title}</h3>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{defect.description}</p>
                      {defect.location && (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Location: {defect.location}
                        </p>
                      )}
                      {inspection && (
                        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          From: {inspection.productName} - {inspection.batchNumber}
                        </p>
                      )}
                      {relatedActions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {relatedActions.map(action => (
                            <span key={action.id} className={`px-2 py-0.5 rounded text-xs ${actionStatusConfig[action.status].bgColor} ${actionStatusConfig[action.status].color}`}>
                              {action.title} - {actionStatusConfig[action.status].label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedDefectId(defect.id);
                          setSelectedInspectionId(defect.inspectionId);
                          resetActionForm();
                          setShowActionModal(true);
                        }}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
                        title={t('tools.qualityControl.addCorrectiveAction2', 'Add Corrective Action')}
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDefect(defect.id)}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Corrective Actions */}
      {correctiveActions.length > 0 && (
        <div className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Wrench className="w-5 h-5" />
            {t('tools.qualityControl.correctiveActions', 'Corrective Actions')}
          </h3>
          <div className="space-y-3">
            {correctiveActions.map(action => (
              <div key={action.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionStatusConfig[action.status].bgColor} ${actionStatusConfig[action.status].color}`}>
                        {actionStatusConfig[action.status].label}
                      </span>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{action.title}</h4>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                    <div className={`text-xs mt-2 flex items-center gap-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span>Assigned to: {action.assignedTo}</span>
                      <span>Due: {action.dueDate}</span>
                    </div>
                  </div>
                  <select
                    value={action.status}
                    onChange={(e) => {
                      setCorrectiveActions(prev => prev.map(ca =>
                        ca.id === action.id
                          ? { ...ca, status: e.target.value as CorrectiveActionStatus }
                          : ca
                      ));
                    }}
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="open">{t('tools.qualityControl.open', 'Open')}</option>
                    <option value="in_progress">{t('tools.qualityControl.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.qualityControl.completed', 'Completed')}</option>
                    <option value="verified">{t('tools.qualityControl.verified', 'Verified')}</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetProductForm();
            setShowProductModal(true);
          }}
          className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('tools.qualityControl.addProduct', 'Add Product')}
        </button>
      </div>

      <div className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.qualityControl.noProductsRegistered', 'No products registered')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.product', 'Product')}</th>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.sku', 'SKU')}</th>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.category', 'Category')}</th>
                  <th className={`text-left p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.specifications', 'Specifications')}</th>
                  <th className={`text-right p-4 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.actions2', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/20' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className={`p-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{product.name}</td>
                    <td className={`p-4 font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{product.sku}</td>
                    <td className={`p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{product.category}</td>
                    <td className={`p-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{product.specifications}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              sku: product.sku,
                              category: product.category,
                              specifications: product.specifications
                            });
                            setShowProductModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
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
        )}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-5 h-5 text-[#0D9488]" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.totalInspections', 'Total Inspections')}</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{metrics.totalInspections}</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.passRate', 'Pass Rate')}</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{metrics.passRate.toFixed(1)}%</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.failRate', 'Fail Rate')}</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{metrics.failRate.toFixed(1)}%</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.qualityControl.pendingReview2', 'Pending Review')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{metrics.pendingReviewCount}</p>
        </div>
      </div>

      {/* Defects by Severity */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <AlertTriangle className="w-5 h-5" />
          {t('tools.qualityControl.defectsBySeverity', 'Defects by Severity')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(severityConfig) as DefectSeverity[]).map(severity => (
            <div key={severity} className={`p-4 rounded-lg ${severityConfig[severity].bgColor}`}>
              <p className={`text-sm font-medium ${severityConfig[severity].color}`}>{severityConfig[severity].label}</p>
              <p className={`text-2xl font-bold ${severityConfig[severity].color}`}>{metrics.defectsByCategory[severity]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Corrective Actions Summary */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Wrench className="w-5 h-5" />
          {t('tools.qualityControl.correctiveActionsSummary', 'Corrective Actions Summary')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(actionStatusConfig) as CorrectiveActionStatus[]).map(status => {
            const count = correctiveActions.filter(ca => ca.status === status).length;
            return (
              <div key={status} className={`p-4 rounded-lg ${actionStatusConfig[status].bgColor}`}>
                <p className={`text-sm font-medium ${actionStatusConfig[status].color}`}>{actionStatusConfig[status].label}</p>
                <p className={`text-2xl font-bold ${actionStatusConfig[status].color}`}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <BarChart3 className="w-5 h-5" />
          {t('tools.qualityControl.recentInspections', 'Recent Inspections')}
        </h3>
        <div className="space-y-2">
          {inspections.slice(0, 5).map(insp => (
            <div key={insp.id} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{insp.productName}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{insp.batchNumber} - {insp.inspectionDate}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${resultConfig[insp.result].bgColor} ${resultConfig[insp.result].color}`}>
                {resultConfig[insp.result].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0D9488]/20 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-[#0D9488]" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.qualityControl.qualityControl', 'Quality Control')}</h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.qualityControl.inspectionAndDefectTrackingFor', 'Inspection and defect tracking for manufacturing')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="quality-control" toolName="Quality Control" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme === 'dark' ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'quality-control-inspections' })}
              onExportExcel={() => exportExcel({ filename: 'quality-control-inspections' })}
              onExportJSON={() => exportJSON({ filename: 'quality-control-inspections' })}
              onExportPDF={() => exportPDF({ filename: 'quality-control-inspections', title: 'Quality Control Inspections Report' })}
              onPrint={() => print('Quality Control Inspections Report')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={exportData.length === 0}
              theme={theme}
            />
            <button
              onClick={() => {
                resetInspectionForm();
                setShowInspectionModal(true);
              }}
              className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.qualityControl.newInspection', 'New Inspection')}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t('tools.qualityControl.passRate2', 'Pass Rate')}</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{metrics.passRate.toFixed(1)}%</p>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t('tools.qualityControl.totalDefects', 'Total Defects')}</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{defects.length}</p>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Wrench className="w-4 h-4" />
              <span className="text-sm">{t('tools.qualityControl.openActions', 'Open Actions')}</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">
              {correctiveActions.filter(ca => ca.status === 'open' || ca.status === 'in_progress').length}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`flex items-center gap-2 mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <ClipboardCheck className="w-4 h-4" />
              <span className="text-sm">{t('tools.qualityControl.thisMonth', 'This Month')}</span>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{metrics.totalInspections}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {(['inspections', 'defects', 'products', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'inspections' && renderInspectionsTab()}
        {activeTab === 'defects' && renderDefectsTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'reports' && renderReportsTab()}

        {/* Inspection Modal */}
        {showInspectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingInspection ? t('tools.qualityControl.editInspection', 'Edit Inspection') : t('tools.qualityControl.newInspection2', 'New Inspection')}
                </h2>
                <button
                  onClick={() => {
                    setShowInspectionModal(false);
                    resetInspectionForm();
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.productName', 'Product Name *')}</label>
                    <input
                      type="text"
                      value={inspectionForm.productName}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, productName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      list="products-list"
                    />
                    <datalist id="products-list">
                      {products.map(prod => (
                        <option key={prod.id} value={prod.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.batchNumber', 'Batch Number *')}</label>
                    <input
                      type="text"
                      value={inspectionForm.batchNumber}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, batchNumber: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.inspector2', 'Inspector *')}</label>
                    <input
                      type="text"
                      value={inspectionForm.inspector}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspector: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.inspectionDate', 'Inspection Date')}</label>
                    <input
                      type="date"
                      value={inspectionForm.inspectionDate}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.checklistItems', 'Checklist Items')}</label>
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="text-sm text-[#0D9488] hover:text-[#0F766E]"
                    >
                      {t('tools.qualityControl.addItem', '+ Add Item')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {inspectionForm.checklistItems.map((item, index) => (
                      <div key={item.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              setInspectionForm(prev => ({
                                ...prev,
                                checklistItems: prev.checklistItems.map((i, idx) =>
                                  idx === index ? { ...i, name: e.target.value } : i
                                )
                              }));
                            }}
                            placeholder={t('tools.qualityControl.itemName', 'Item name')}
                            className={`flex-1 px-3 py-1 rounded border ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => updateChecklistItem(item.id, 'passed', true)}
                              className={`p-1 rounded ${item.passed === true ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateChecklistItem(item.id, 'passed', false)}
                              className={`p-1 rounded ${item.passed === false ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeChecklistItem(item.id)}
                              className={`p-1 rounded ${theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateChecklistItem(item.id, 'notes', e.target.value)}
                          placeholder={t('tools.qualityControl.notesOptional', 'Notes (optional)')}
                          className={`mt-2 w-full px-3 py-1 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.result2', 'Result')}</label>
                  <select
                    value={inspectionForm.result}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, result: e.target.value as InspectionResult })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="pending_review">{t('tools.qualityControl.pendingReview3', 'Pending Review')}</option>
                    <option value="pass">{t('tools.qualityControl.pass2', 'Pass')}</option>
                    <option value="fail">{t('tools.qualityControl.fail2', 'Fail')}</option>
                    <option value="conditional_pass">{t('tools.qualityControl.conditionalPass2', 'Conditional Pass')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.notes', 'Notes')}</label>
                  <textarea
                    value={inspectionForm.notes}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInspectionModal(false);
                      resetInspectionForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  >
                    {t('tools.qualityControl.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveInspection}
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingInspection ? t('tools.qualityControl.update', 'Update') : t('tools.qualityControl.create', 'Create')} Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Defect Modal */}
        {showDefectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingDefect ? t('tools.qualityControl.editDefect', 'Edit Defect') : t('tools.qualityControl.reportDefect', 'Report Defect')}
                </h2>
                <button
                  onClick={() => {
                    setShowDefectModal(false);
                    resetDefectForm();
                    setSelectedInspectionId(null);
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.title', 'Title *')}</label>
                  <input
                    type="text"
                    value={defectForm.title}
                    onChange={(e) => setDefectForm({ ...defectForm, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.description', 'Description')}</label>
                  <textarea
                    value={defectForm.description}
                    onChange={(e) => setDefectForm({ ...defectForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.severity', 'Severity')}</label>
                  <select
                    value={defectForm.severity}
                    onChange={(e) => setDefectForm({ ...defectForm, severity: e.target.value as DefectSeverity })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="critical">{t('tools.qualityControl.critical', 'Critical')}</option>
                    <option value="major">{t('tools.qualityControl.major', 'Major')}</option>
                    <option value="minor">{t('tools.qualityControl.minor', 'Minor')}</option>
                    <option value="cosmetic">{t('tools.qualityControl.cosmetic', 'Cosmetic')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.location', 'Location')}</label>
                  <input
                    type="text"
                    value={defectForm.location}
                    onChange={(e) => setDefectForm({ ...defectForm, location: e.target.value })}
                    placeholder={t('tools.qualityControl.eGComponentAPosition', 'e.g., Component A, Position 3')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDefectModal(false);
                      resetDefectForm();
                      setSelectedInspectionId(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  >
                    {t('tools.qualityControl.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveDefect}
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    {t('tools.qualityControl.saveDefect', 'Save Defect')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingProduct ? t('tools.qualityControl.editProduct', 'Edit Product') : t('tools.qualityControl.addProduct2', 'Add Product')}
                </h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.productName2', 'Product Name *')}</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.sku2', 'SKU *')}</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.category2', 'Category')}</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.specifications2', 'Specifications')}</label>
                  <textarea
                    value={productForm.specifications}
                    onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      resetProductForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  >
                    {t('tools.qualityControl.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    {t('tools.qualityControl.saveProduct', 'Save Product')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Corrective Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingAction ? t('tools.qualityControl.editCorrectiveAction', 'Edit Corrective Action') : t('tools.qualityControl.addCorrectiveAction', 'Add Corrective Action')}
                </h2>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    resetActionForm();
                    setSelectedDefectId(null);
                    setSelectedInspectionId(null);
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.title2', 'Title *')}</label>
                  <input
                    type="text"
                    value={actionForm.title}
                    onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.description2', 'Description')}</label>
                  <textarea
                    value={actionForm.description}
                    onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.assignedTo', 'Assigned To')}</label>
                  <input
                    type="text"
                    value={actionForm.assignedTo}
                    onChange={(e) => setActionForm({ ...actionForm, assignedTo: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.dueDate', 'Due Date')}</label>
                  <input
                    type="date"
                    value={actionForm.dueDate}
                    onChange={(e) => setActionForm({ ...actionForm, dueDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.qualityControl.status', 'Status')}</label>
                  <select
                    value={actionForm.status}
                    onChange={(e) => setActionForm({ ...actionForm, status: e.target.value as CorrectiveActionStatus })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="open">{t('tools.qualityControl.open2', 'Open')}</option>
                    <option value="in_progress">{t('tools.qualityControl.inProgress2', 'In Progress')}</option>
                    <option value="completed">{t('tools.qualityControl.completed2', 'Completed')}</option>
                    <option value="verified">{t('tools.qualityControl.verified2', 'Verified')}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionModal(false);
                      resetActionForm();
                      setSelectedDefectId(null);
                      setSelectedInspectionId(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  >
                    {t('tools.qualityControl.cancel4', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveAction}
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    {t('tools.qualityControl.saveAction', 'Save Action')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom duration-300">
            <p className="text-sm">{validationMessage}</p>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default QualityControlTool;
