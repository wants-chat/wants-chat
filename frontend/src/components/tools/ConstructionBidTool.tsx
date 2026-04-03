'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Package,
  Truck,
  Calculator,
  TrendingUp,
  TrendingDown,
  Save,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ConstructionBidToolProps {
  uiConfig?: UIConfig;
}

// Types
interface LaborItem {
  id: string;
  trade: string;
  hours: number;
  rate: number;
  workers: number;
}

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  vendor: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  rentalDays: number;
  dailyRate: number;
}

interface SubcontractorQuote {
  id: string;
  company: string;
  scope: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface CompetitorBid {
  id: string;
  company: string;
  amount: number;
  notes: string;
}

interface BidRecord {
  id: string;
  projectName: string;
  totalBid: number;
  status: 'won' | 'lost' | 'pending';
  submittedDate: string;
  clientName?: string;
}

interface ProjectDetails {
  name: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

// Combined data structure for backend sync
interface ConstructionBidData {
  id: string;
  projectDetails: ProjectDetails;
  laborItems: LaborItem[];
  materialItems: MaterialItem[];
  equipmentItems: EquipmentItem[];
  subcontractorQuotes: SubcontractorQuote[];
  overheadPercent: number;
  profitMargin: number;
  contingencyPercent: number;
  competitorBids: CompetitorBid[];
  bidRecords: BidRecord[];
  updatedAt: string;
}

const TRADE_TYPES = [
  'General Labor',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Mason',
  'HVAC Technician',
  'Welder',
  'Painter',
  'Roofer',
  'Concrete Finisher',
  'Heavy Equipment Operator',
  'Ironworker',
  'Drywall Installer',
  'Tile Setter',
  'Landscaper',
];

const PROJECT_TYPES = [
  'Residential - New Construction',
  'Residential - Renovation',
  'Commercial - New Construction',
  'Commercial - Renovation',
  'Industrial',
  'Infrastructure',
  'Mixed Use',
  'Government/Public',
];

const MATERIAL_UNITS = ['units', 'lbs', 'kg', 'sqft', 'sqm', 'linear ft', 'cubic yards', 'gallons', 'tons', 'pieces'];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Default project details
const DEFAULT_PROJECT_DETAILS: ProjectDetails = {
  name: '',
  type: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
};

// Default data for sync
const DEFAULT_BID_DATA: ConstructionBidData = {
  id: 'current-bid',
  projectDetails: DEFAULT_PROJECT_DETAILS,
  laborItems: [],
  materialItems: [],
  equipmentItems: [],
  subcontractorQuotes: [],
  overheadPercent: 10,
  profitMargin: 15,
  contingencyPercent: 5,
  competitorBids: [],
  bidRecords: [],
  updatedAt: new Date().toISOString(),
};

// Column configurations for export
const BID_RECORD_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'totalBid', header: 'Total Bid', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'submittedDate', header: 'Submitted Date', type: 'date' },
  { key: 'clientName', header: 'Client/Location', type: 'string' },
];

const LABOR_COLUMNS: ColumnConfig[] = [
  { key: 'trade', header: 'Trade', type: 'string' },
  { key: 'hours', header: 'Hours', type: 'number' },
  { key: 'rate', header: 'Hourly Rate', type: 'currency' },
  { key: 'workers', header: 'Workers', type: 'number' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
];

const MATERIAL_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Material Name', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
  { key: 'vendor', header: 'Vendor', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
];

const EQUIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Equipment Name', type: 'string' },
  { key: 'rentalDays', header: 'Rental Days', type: 'number' },
  { key: 'dailyRate', header: 'Daily Rate', type: 'currency' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
];

const SUBCONTRACTOR_COLUMNS: ColumnConfig[] = [
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'scope', header: 'Scope of Work', type: 'string' },
  { key: 'amount', header: 'Quote Amount', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Columns for useToolData hook (main sync data)
const SYNC_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'projectDetails.name', header: 'Project Name', type: 'string' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

export const ConstructionBidTool = ({ uiConfig }: ConstructionBidToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence
  const {
    data: syncData,
    setData: setSyncData,
    updateItem: updateSyncItem,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ConstructionBidData>('construction-bid', [DEFAULT_BID_DATA], SYNC_COLUMNS);

  // Get the current bid data (first item in the array, or default)
  const currentBid = syncData[0] || DEFAULT_BID_DATA;

  // Helper to update the current bid data
  const updateCurrentBid = (updates: Partial<ConstructionBidData>) => {
    const updatedBid = { ...currentBid, ...updates, updatedAt: new Date().toISOString() };
    setSyncData([updatedBid]);
  };

  // Extract state from synced data
  const projectDetails = currentBid.projectDetails;
  const laborItems = currentBid.laborItems;
  const materialItems = currentBid.materialItems;
  const equipmentItems = currentBid.equipmentItems;
  const subcontractorQuotes = currentBid.subcontractorQuotes;
  const overheadPercent = currentBid.overheadPercent;
  const profitMargin = currentBid.profitMargin;
  const contingencyPercent = currentBid.contingencyPercent;
  const competitorBids = currentBid.competitorBids;
  const bidRecords = currentBid.bidRecords;

  // Setters that update the synced data
  const setProjectDetails = (details: ProjectDetails | ((prev: ProjectDetails) => ProjectDetails)) => {
    const newDetails = typeof details === 'function' ? details(projectDetails) : details;
    updateCurrentBid({ projectDetails: newDetails });
  };

  const setLaborItems = (items: LaborItem[] | ((prev: LaborItem[]) => LaborItem[])) => {
    const newItems = typeof items === 'function' ? items(laborItems) : items;
    updateCurrentBid({ laborItems: newItems });
  };

  const setMaterialItems = (items: MaterialItem[] | ((prev: MaterialItem[]) => MaterialItem[])) => {
    const newItems = typeof items === 'function' ? items(materialItems) : items;
    updateCurrentBid({ materialItems: newItems });
  };

  const setEquipmentItems = (items: EquipmentItem[] | ((prev: EquipmentItem[]) => EquipmentItem[])) => {
    const newItems = typeof items === 'function' ? items(equipmentItems) : items;
    updateCurrentBid({ equipmentItems: newItems });
  };

  const setSubcontractorQuotes = (items: SubcontractorQuote[] | ((prev: SubcontractorQuote[]) => SubcontractorQuote[])) => {
    const newItems = typeof items === 'function' ? items(subcontractorQuotes) : items;
    updateCurrentBid({ subcontractorQuotes: newItems });
  };

  const setOverheadPercent = (value: number) => {
    updateCurrentBid({ overheadPercent: value });
  };

  const setProfitMargin = (value: number) => {
    updateCurrentBid({ profitMargin: value });
  };

  const setContingencyPercent = (value: number) => {
    updateCurrentBid({ contingencyPercent: value });
  };

  const setCompetitorBids = (items: CompetitorBid[] | ((prev: CompetitorBid[]) => CompetitorBid[])) => {
    const newItems = typeof items === 'function' ? items(competitorBids) : items;
    updateCurrentBid({ competitorBids: newItems });
  };

  const setBidRecords = (items: BidRecord[] | ((prev: BidRecord[]) => BidRecord[])) => {
    const newItems = typeof items === 'function' ? items(bidRecords) : items;
    updateCurrentBid({ bidRecords: newItems });
  };

  // UI State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    project: true,
    labor: true,
    materials: true,
    equipment: true,
    subcontractors: true,
    adjustments: true,
    competitors: true,
    summary: true,
    history: false,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isLoading) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.projectName || params.title || params.location) {
        setProjectDetails({
          ...projectDetails,
          name: params.projectName || params.title || '',
          location: params.location || '',
          type: params.type || '',
          description: params.description || '',
        });
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isLoading]);

  // Calculations
  const calculations = useMemo(() => {
    const laborTotal = laborItems.reduce((sum, item) => sum + item.hours * item.rate * item.workers, 0);
    const materialsTotal = materialItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const equipmentTotal = equipmentItems.reduce((sum, item) => sum + item.rentalDays * item.dailyRate, 0);
    const subcontractorTotal = subcontractorQuotes
      .filter((q) => q.status === 'accepted')
      .reduce((sum, item) => sum + item.amount, 0);

    const directCosts = laborTotal + materialsTotal + equipmentTotal + subcontractorTotal;
    const overheadAmount = directCosts * (overheadPercent / 100);
    const subtotalWithOverhead = directCosts + overheadAmount;
    const profitAmount = subtotalWithOverhead * (profitMargin / 100);
    const subtotalWithProfit = subtotalWithOverhead + profitAmount;
    const contingencyAmount = subtotalWithProfit * (contingencyPercent / 100);
    const totalBid = subtotalWithProfit + contingencyAmount;

    return {
      laborTotal,
      materialsTotal,
      equipmentTotal,
      subcontractorTotal,
      directCosts,
      overheadAmount,
      profitAmount,
      contingencyAmount,
      totalBid,
    };
  }, [laborItems, materialItems, equipmentItems, subcontractorQuotes, overheadPercent, profitMargin, contingencyPercent]);

  // Win/Loss Statistics
  const bidStats = useMemo(() => {
    const won = bidRecords.filter((r) => r.status === 'won').length;
    const lost = bidRecords.filter((r) => r.status === 'lost').length;
    const pending = bidRecords.filter((r) => r.status === 'pending').length;
    const total = bidRecords.length;
    const winRate = total > 0 ? ((won / (won + lost)) * 100) || 0 : 0;
    const totalValue = bidRecords.filter((r) => r.status === 'won').reduce((sum, r) => sum + r.totalBid, 0);

    return { won, lost, pending, total, winRate, totalValue };
  }, [bidRecords]);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Labor handlers
  const addLaborItem = () => {
    setLaborItems([...laborItems, { id: generateId(), trade: 'General Labor', hours: 0, rate: 0, workers: 1 }]);
  };

  const updateLaborItem = (id: string, field: keyof LaborItem, value: string | number) => {
    setLaborItems(laborItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeLaborItem = (id: string) => {
    setLaborItems(laborItems.filter((item) => item.id !== id));
  };

  // Material handlers
  const addMaterialItem = () => {
    setMaterialItems([
      ...materialItems,
      { id: generateId(), name: '', quantity: 0, unit: 'units', unitCost: 0, vendor: '' },
    ]);
  };

  const updateMaterialItem = (id: string, field: keyof MaterialItem, value: string | number) => {
    setMaterialItems(materialItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeMaterialItem = (id: string) => {
    setMaterialItems(materialItems.filter((item) => item.id !== id));
  };

  // Equipment handlers
  const addEquipmentItem = () => {
    setEquipmentItems([...equipmentItems, { id: generateId(), name: '', rentalDays: 0, dailyRate: 0 }]);
  };

  const updateEquipmentItem = (id: string, field: keyof EquipmentItem, value: string | number) => {
    setEquipmentItems(equipmentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeEquipmentItem = (id: string) => {
    setEquipmentItems(equipmentItems.filter((item) => item.id !== id));
  };

  // Subcontractor handlers
  const addSubcontractorQuote = () => {
    setSubcontractorQuotes([
      ...subcontractorQuotes,
      { id: generateId(), company: '', scope: '', amount: 0, status: 'pending' },
    ]);
  };

  const updateSubcontractorQuote = (id: string, field: keyof SubcontractorQuote, value: string | number) => {
    setSubcontractorQuotes(subcontractorQuotes.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeSubcontractorQuote = (id: string) => {
    setSubcontractorQuotes(subcontractorQuotes.filter((item) => item.id !== id));
  };

  // Competitor handlers
  const addCompetitorBid = () => {
    setCompetitorBids([...competitorBids, { id: generateId(), company: '', amount: 0, notes: '' }]);
  };

  const updateCompetitorBid = (id: string, field: keyof CompetitorBid, value: string | number) => {
    setCompetitorBids(competitorBids.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeCompetitorBid = (id: string) => {
    setCompetitorBids(competitorBids.filter((item) => item.id !== id));
  };

  // Save current bid to history
  const saveBidToHistory = (status: 'won' | 'lost' | 'pending') => {
    if (!projectDetails.name) {
      setValidationMessage('Please enter a project name before saving.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newRecord: BidRecord = {
      id: generateId(),
      projectName: projectDetails.name,
      totalBid: calculations.totalBid,
      status,
      submittedDate: new Date().toISOString().split('T')[0],
      clientName: projectDetails.location,
    };

    setBidRecords([newRecord, ...bidRecords]);
  };

  // Update bid record status
  const updateBidRecordStatus = (id: string, status: 'won' | 'lost' | 'pending') => {
    setBidRecords(bidRecords.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  // Delete bid record
  const deleteBidRecord = (id: string) => {
    setBidRecords(bidRecords.filter((r) => r.id !== id));
  };

  // Reset form
  const resetForm = async () => {
    const confirmed = await confirm({
      title: 'Reset All Data',
      message: 'Are you sure you want to reset all data? This cannot be undone.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      updateCurrentBid({
        projectDetails: DEFAULT_PROJECT_DETAILS,
        laborItems: [],
        materialItems: [],
        equipmentItems: [],
        subcontractorQuotes: [],
        overheadPercent: 10,
        profitMargin: 15,
        contingencyPercent: 5,
        competitorBids: [],
      });
    }
  };

  // Export bid summary
  const exportBidSummary = () => {
    const summary = `
CONSTRUCTION BID SUMMARY
========================

PROJECT DETAILS
---------------
Project Name: ${projectDetails.name}
Type: ${projectDetails.type}
Location: ${projectDetails.location}
Start Date: ${projectDetails.startDate}
End Date: ${projectDetails.endDate}
Description: ${projectDetails.description}

COST BREAKDOWN
--------------
Labor Costs: $${calculations.laborTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Material Costs: $${calculations.materialsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Equipment Rental: $${calculations.equipmentTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Subcontractor Costs: $${calculations.subcontractorTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
--------------
Direct Costs Subtotal: $${calculations.directCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}

ADJUSTMENTS
-----------
Overhead (${overheadPercent}%): $${calculations.overheadAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Profit Margin (${profitMargin}%): $${calculations.profitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Contingency (${contingencyPercent}%): $${calculations.contingencyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

========================
TOTAL BID: $${calculations.totalBid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
========================

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bid-summary-${projectDetails.name || 'project'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy bid total to clipboard
  const copyBidTotal = () => {
    navigator.clipboard.writeText(calculations.totalBid.toFixed(2));
    setValidationMessage('Bid total copied to clipboard!');
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Prepare data for export (add calculated subtotals)
  const getExportData = () => {
    // Create comprehensive export data with all bid components
    const laborWithSubtotals = laborItems.map((item) => ({
      ...item,
      subtotal: item.hours * item.rate * item.workers,
    }));

    const materialsWithSubtotals = materialItems.map((item) => ({
      ...item,
      subtotal: item.quantity * item.unitCost,
    }));

    const equipmentWithSubtotals = equipmentItems.map((item) => ({
      ...item,
      subtotal: item.rentalDays * item.dailyRate,
    }));

    return {
      projectDetails,
      labor: laborWithSubtotals,
      materials: materialsWithSubtotals,
      equipment: equipmentWithSubtotals,
      subcontractors: subcontractorQuotes,
      calculations,
      adjustments: {
        overheadPercent,
        profitMargin,
        contingencyPercent,
      },
      bidRecords,
    };
  };

  // Export handlers
  const handleExportCSV = () => {
    if (bidRecords.length > 0) {
      exportToCSV(bidRecords, BID_RECORD_COLUMNS, {
        filename: `construction-bids-${projectDetails.name || 'export'}`,
      });
    } else {
      // Export current bid details as a single row summary
      const currentBidSummary = [{
        projectName: projectDetails.name || 'Untitled Project',
        totalBid: calculations.totalBid,
        status: 'draft',
        submittedDate: new Date().toISOString().split('T')[0],
        clientName: projectDetails.location || '',
      }];
      exportToCSV(currentBidSummary, BID_RECORD_COLUMNS, {
        filename: `construction-bid-${projectDetails.name || 'export'}`,
      });
    }
  };

  const handleExportExcel = () => {
    if (bidRecords.length > 0) {
      exportToExcel(bidRecords, BID_RECORD_COLUMNS, {
        filename: `construction-bids-${projectDetails.name || 'export'}`,
      });
    } else {
      const currentBidSummary = [{
        projectName: projectDetails.name || 'Untitled Project',
        totalBid: calculations.totalBid,
        status: 'draft',
        submittedDate: new Date().toISOString().split('T')[0],
        clientName: projectDetails.location || '',
      }];
      exportToExcel(currentBidSummary, BID_RECORD_COLUMNS, {
        filename: `construction-bid-${projectDetails.name || 'export'}`,
      });
    }
  };

  const handleExportJSON = () => {
    const exportData = getExportData();
    exportToJSON([exportData], {
      filename: `construction-bid-${projectDetails.name || 'export'}`,
      includeMetadata: true,
    });
  };

  const handleExportPDF = async () => {
    if (bidRecords.length > 0) {
      await exportToPDF(bidRecords, BID_RECORD_COLUMNS, {
        filename: `construction-bids-${projectDetails.name || 'export'}`,
        title: 'Construction Bid History',
        subtitle: projectDetails.name || 'Bid Records',
        orientation: 'landscape',
      });
    } else {
      const currentBidSummary = [{
        projectName: projectDetails.name || 'Untitled Project',
        totalBid: calculations.totalBid,
        status: 'draft',
        submittedDate: new Date().toISOString().split('T')[0],
        clientName: projectDetails.location || '',
      }];
      await exportToPDF(currentBidSummary, BID_RECORD_COLUMNS, {
        filename: `construction-bid-${projectDetails.name || 'export'}`,
        title: 'Construction Bid Summary',
        subtitle: projectDetails.name || 'Current Bid',
      });
    }
  };

  const handlePrint = () => {
    if (bidRecords.length > 0) {
      printData(bidRecords, BID_RECORD_COLUMNS, {
        title: `Construction Bid History - ${projectDetails.name || 'All Bids'}`,
      });
    } else {
      const currentBidSummary = [{
        projectName: projectDetails.name || 'Untitled Project',
        totalBid: calculations.totalBid,
        status: 'draft',
        submittedDate: new Date().toISOString().split('T')[0],
        clientName: projectDetails.location || '',
      }];
      printData(currentBidSummary, BID_RECORD_COLUMNS, {
        title: `Construction Bid - ${projectDetails.name || 'Current Bid'}`,
      });
    }
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (bidRecords.length > 0) {
      return await copyUtil(bidRecords, BID_RECORD_COLUMNS, 'tab');
    } else {
      const currentBidSummary = [{
        projectName: projectDetails.name || 'Untitled Project',
        totalBid: calculations.totalBid,
        status: 'draft',
        submittedDate: new Date().toISOString().split('T')[0],
        clientName: projectDetails.location || '',
      }];
      return await copyUtil(currentBidSummary, BID_RECORD_COLUMNS, 'tab');
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Section Header Component
  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    count,
  }: {
    title: string;
    icon: React.ElementType;
    section: string;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#0D9488]" />
        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</span>
        {count !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}>
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
      ) : (
        <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
      )}
    </button>
  );

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const selectClass = `px-3 py-2 rounded-lg border ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.constructionBid.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('tools.constructionBid.constructionBidCalculator', 'Construction Bid Calculator')}
                  </CardTitle>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.constructionBid.comprehensiveBidEstimationAndTracking', 'Comprehensive bid estimation and tracking tool')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="construction-bid" toolName="Construction Bid" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={theme}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={exportBidSummary}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                  title={t('tools.constructionBid.exportDetailedTextSummary', 'Export detailed text summary')}
                >
                  <FileText className="w-4 h-4" />
                  {t('tools.constructionBid.summary', 'Summary')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.constructionBid.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Project Details Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.projectDetails', 'Project Details')} icon={FileText} section="project" />
            {expandedSections.project && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.constructionBid.projectName', 'Project Name *')}
                    </label>
                    <input
                      type="text"
                      value={projectDetails.name}
                      onChange={(e) => setProjectDetails({ ...projectDetails, name: e.target.value })}
                      placeholder={t('tools.constructionBid.enterProjectName', 'Enter project name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.constructionBid.projectType', 'Project Type')}
                    </label>
                    <select
                      value={projectDetails.type}
                      onChange={(e) => setProjectDetails({ ...projectDetails, type: e.target.value })}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.constructionBid.selectType', 'Select type')}</option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {t('tools.constructionBid.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={projectDetails.location}
                      onChange={(e) => setProjectDetails({ ...projectDetails, location: e.target.value })}
                      placeholder={t('tools.constructionBid.cityState', 'City, State')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('tools.constructionBid.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={projectDetails.startDate}
                      onChange={(e) => setProjectDetails({ ...projectDetails, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('tools.constructionBid.endDate', 'End Date')}
                    </label>
                    <input
                      type="date"
                      value={projectDetails.endDate}
                      onChange={(e) => setProjectDetails({ ...projectDetails, endDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.constructionBid.projectDescription', 'Project Description')}
                  </label>
                  <textarea
                    value={projectDetails.description}
                    onChange={(e) => setProjectDetails({ ...projectDetails, description: e.target.value })}
                    placeholder={t('tools.constructionBid.briefDescriptionOfTheProject', 'Brief description of the project scope...')}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Labor Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.laborCosts2', 'Labor Costs')} icon={Users} section="labor" count={laborItems.length} />
            {expandedSections.labor && (
              <div className="p-4 space-y-4">
                {laborItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Worker #{index + 1}
                      </span>
                      <button
                        onClick={() => removeLaborItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.trade', 'Trade')}
                        </label>
                        <select
                          value={item.trade}
                          onChange={(e) => updateLaborItem(item.id, 'trade', e.target.value)}
                          className={`${selectClass} w-full text-sm`}
                        >
                          {TRADE_TYPES.map((trade) => (
                            <option key={trade} value={trade}>
                              {trade}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.hours', 'Hours')}
                        </label>
                        <input
                          type="number"
                          value={item.hours || ''}
                          onChange={(e) => updateLaborItem(item.id, 'hours', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.hourlyRate', 'Hourly Rate ($)')}
                        </label>
                        <input
                          type="number"
                          value={item.rate || ''}
                          onChange={(e) => updateLaborItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.workers', '# Workers')}
                        </label>
                        <input
                          type="number"
                          value={item.workers || ''}
                          onChange={(e) => updateLaborItem(item.id, 'workers', parseInt(e.target.value) || 1)}
                          placeholder="1"
                          min="1"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                    </div>
                    <div className={`mt-2 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Subtotal: <span className="font-semibold text-[#0D9488]">{formatCurrency(item.hours * item.rate * item.workers)}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addLaborItem}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.constructionBid.addLaborItem', 'Add Labor Item')}
                </button>
                <div className={`text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Total Labor: <span className="text-[#0D9488]">{formatCurrency(calculations.laborTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.materialTakeoff', 'Material Takeoff')} icon={Package} section="materials" count={materialItems.length} />
            {expandedSections.materials && (
              <div className="p-4 space-y-4">
                {materialItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Material #{index + 1}
                      </span>
                      <button
                        onClick={() => removeMaterialItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.materialName', 'Material Name')}
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateMaterialItem(item.id, 'name', e.target.value)}
                          placeholder={t('tools.constructionBid.eG2x4Lumber', 'e.g., 2x4 Lumber')}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.quantity', 'Quantity')}
                        </label>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => updateMaterialItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.unit', 'Unit')}
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateMaterialItem(item.id, 'unit', e.target.value)}
                          className={`${selectClass} w-full text-sm`}
                        >
                          {MATERIAL_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.unitCost', 'Unit Cost ($)')}
                        </label>
                        <input
                          type="number"
                          value={item.unitCost || ''}
                          onChange={(e) => updateMaterialItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.constructionBid.vendorOptional', 'Vendor (optional)')}
                      </label>
                      <input
                        type="text"
                        value={item.vendor}
                        onChange={(e) => updateMaterialItem(item.id, 'vendor', e.target.value)}
                        placeholder={t('tools.constructionBid.supplierName', 'Supplier name')}
                        className={`${inputClass} text-sm`}
                      />
                    </div>
                    <div className={`mt-2 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Subtotal: <span className="font-semibold text-[#0D9488]">{formatCurrency(item.quantity * item.unitCost)}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addMaterialItem}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.constructionBid.addMaterial', 'Add Material')}
                </button>
                <div className={`text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Total Materials: <span className="text-[#0D9488]">{formatCurrency(calculations.materialsTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.equipmentRental2', 'Equipment Rental')} icon={Truck} section="equipment" count={equipmentItems.length} />
            {expandedSections.equipment && (
              <div className="p-4 space-y-4">
                {equipmentItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Equipment #{index + 1}
                      </span>
                      <button
                        onClick={() => removeEquipmentItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.equipmentName', 'Equipment Name')}
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateEquipmentItem(item.id, 'name', e.target.value)}
                          placeholder={t('tools.constructionBid.eGExcavatorCrane', 'e.g., Excavator, Crane')}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.rentalDays', 'Rental Days')}
                        </label>
                        <input
                          type="number"
                          value={item.rentalDays || ''}
                          onChange={(e) => updateEquipmentItem(item.id, 'rentalDays', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.dailyRate', 'Daily Rate ($)')}
                        </label>
                        <input
                          type="number"
                          value={item.dailyRate || ''}
                          onChange={(e) => updateEquipmentItem(item.id, 'dailyRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                    </div>
                    <div className={`mt-2 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Subtotal: <span className="font-semibold text-[#0D9488]">{formatCurrency(item.rentalDays * item.dailyRate)}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEquipmentItem}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.constructionBid.addEquipment', 'Add Equipment')}
                </button>
                <div className={`text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Total Equipment: <span className="text-[#0D9488]">{formatCurrency(calculations.equipmentTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subcontractors Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.subcontractorQuotes', 'Subcontractor Quotes')} icon={Users} section="subcontractors" count={subcontractorQuotes.length} />
            {expandedSections.subcontractors && (
              <div className="p-4 space-y-4">
                {subcontractorQuotes.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Quote #{index + 1}
                      </span>
                      <button
                        onClick={() => removeSubcontractorQuote(item.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.companyName', 'Company Name')}
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => updateSubcontractorQuote(item.id, 'company', e.target.value)}
                          placeholder={t('tools.constructionBid.subcontractorName', 'Subcontractor name')}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.scopeOfWork', 'Scope of Work')}
                        </label>
                        <input
                          type="text"
                          value={item.scope}
                          onChange={(e) => updateSubcontractorQuote(item.id, 'scope', e.target.value)}
                          placeholder={t('tools.constructionBid.eGElectricalHvac', 'e.g., Electrical, HVAC')}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.quoteAmount', 'Quote Amount ($)')}
                        </label>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateSubcontractorQuote(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.status', 'Status')}
                        </label>
                        <select
                          value={item.status}
                          onChange={(e) => updateSubcontractorQuote(item.id, 'status', e.target.value)}
                          className={`${selectClass} w-full text-sm`}
                        >
                          <option value="pending">{t('tools.constructionBid.pending', 'Pending')}</option>
                          <option value="accepted">{t('tools.constructionBid.accepted', 'Accepted')}</option>
                          <option value="rejected">{t('tools.constructionBid.rejected', 'Rejected')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSubcontractorQuote}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.constructionBid.addSubcontractorQuote', 'Add Subcontractor Quote')}
                </button>
                <div className={`text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Total (Accepted): <span className="text-[#0D9488]">{formatCurrency(calculations.subcontractorTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adjustments Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.overheadProfitContingency', 'Overhead, Profit & Contingency')} icon={Percent} section="adjustments" />
            {expandedSections.adjustments && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.constructionBid.overheadPercentage', 'Overhead Percentage')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={overheadPercent}
                        onChange={(e) => setOverheadPercent(parseInt(e.target.value))}
                        className="flex-1 accent-[#0D9488]"
                      />
                      <span className={`w-16 text-center font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {overheadPercent}%
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Amount: {formatCurrency(calculations.overheadAmount)}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.constructionBid.profitMargin', 'Profit Margin')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                        className="flex-1 accent-[#0D9488]"
                      />
                      <span className={`w-16 text-center font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {profitMargin}%
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Amount: {formatCurrency(calculations.profitAmount)}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.constructionBid.contingencyAllowance', 'Contingency Allowance')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={contingencyPercent}
                        onChange={(e) => setContingencyPercent(parseInt(e.target.value))}
                        className="flex-1 accent-[#0D9488]"
                      />
                      <span className={`w-16 text-center font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {contingencyPercent}%
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Amount: {formatCurrency(calculations.contingencyAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitor Bids Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.competitiveBidComparison', 'Competitive Bid Comparison')} icon={BarChart3} section="competitors" count={competitorBids.length} />
            {expandedSections.competitors && (
              <div className="p-4 space-y-4">
                {competitorBids.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Competitor #{index + 1}
                      </span>
                      <button
                        onClick={() => removeCompetitorBid(item.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.companyName2', 'Company Name')}
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => updateCompetitorBid(item.id, 'company', e.target.value)}
                          placeholder={t('tools.constructionBid.competitorName', 'Competitor name')}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.bidAmount', 'Bid Amount ($)')}
                        </label>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateCompetitorBid(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.constructionBid.notes', 'Notes')}
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateCompetitorBid(item.id, 'notes', e.target.value)}
                          placeholder={t('tools.constructionBid.anyRelevantNotes', 'Any relevant notes')}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                    </div>
                    {item.amount > 0 && calculations.totalBid > 0 && (
                      <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Difference from your bid:{' '}
                        <span
                          className={`font-semibold ${
                            item.amount > calculations.totalBid ? 'text-green-500' : item.amount < calculations.totalBid ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          {item.amount > calculations.totalBid ? (
                            <>
                              <TrendingUp className="w-4 h-4 inline" /> +{formatCurrency(item.amount - calculations.totalBid)}
                            </>
                          ) : item.amount < calculations.totalBid ? (
                            <>
                              <TrendingDown className="w-4 h-4 inline" /> {formatCurrency(item.amount - calculations.totalBid)}
                            </>
                          ) : (
                            'Same'
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCompetitorBid}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#0D9488] text-[#0D9488] rounded-lg hover:bg-[#0D9488]/10 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.constructionBid.addCompetitorBid', 'Add Competitor Bid')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid Summary Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.bidSummary', 'Bid Summary')} icon={Calculator} section="summary" />
            {expandedSections.summary && (
              <div className="p-4 space-y-4">
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.constructionBid.laborCosts', 'Labor Costs:')}</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.laborTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.constructionBid.materialCosts', 'Material Costs:')}</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.materialsTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.constructionBid.equipmentRental', 'Equipment Rental:')}</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.equipmentTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.constructionBid.subcontractorsAccepted', 'Subcontractors (Accepted):')}</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.subcontractorTotal)}
                      </span>
                    </div>
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} pt-3`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {t('tools.constructionBid.directCostsSubtotal', 'Direct Costs Subtotal:')}
                        </span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(calculations.directCosts)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Overhead ({overheadPercent}%):</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.overheadAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Profit Margin ({profitMargin}%):</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.profitAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Contingency ({contingencyPercent}%):</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculations.contingencyAmount)}
                      </span>
                    </div>
                    <div className={`border-t-2 ${theme === 'dark' ? t('tools.constructionBid.border0d9488', 'border-[#0D9488]') : t('tools.constructionBid.border0d94882', 'border-[#0D9488]')} pt-4 mt-4`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.constructionBid.totalBid', 'TOTAL BID:')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-[#0D9488]">{formatCurrency(calculations.totalBid)}</span>
                          <button
                            onClick={copyBidTotal}
                            className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded transition-colors"
                            title={t('tools.constructionBid.copyToClipboard', 'Copy to clipboard')}
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Bid Actions */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => saveBidToHistory('pending')}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    {t('tools.constructionBid.saveAsPending', 'Save as Pending')}
                  </button>
                  <button
                    onClick={() => saveBidToHistory('won')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.constructionBid.markAsWon', 'Mark as Won')}
                  </button>
                  <button
                    onClick={() => saveBidToHistory('lost')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('tools.constructionBid.markAsLost', 'Mark as Lost')}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid History / Win-Loss Tracking */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <SectionHeader title={t('tools.constructionBid.bidHistoryWinLossTracking', 'Bid History & Win/Loss Tracking')} icon={TrendingUp} section="history" count={bidRecords.length} />
            {expandedSections.history && (
              <div className="p-4 space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {bidStats.total}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.constructionBid.totalBids', 'Total Bids')}</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className="text-2xl font-bold text-green-500">{bidStats.won}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.constructionBid.won', 'Won')}</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'}`}>
                    <div className="text-2xl font-bold text-red-500">{bidStats.lost}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.constructionBid.lost', 'Lost')}</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <div className="text-2xl font-bold text-yellow-500">{bidStats.pending}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.constructionBid.pending2', 'Pending')}</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? t('tools.constructionBid.bg0d948830', 'bg-[#0D9488]/30') : t('tools.constructionBid.bg0d948810', 'bg-[#0D9488]/10')}`}>
                    <div className="text-2xl font-bold text-[#0D9488]">{bidStats.winRate.toFixed(1)}%</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.constructionBid.winRate', 'Win Rate')}</div>
                  </div>
                </div>

                <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Value of Won Bids:{' '}
                  </span>
                  <span className="font-bold text-[#0D9488]">{formatCurrency(bidStats.totalValue)}</span>
                </div>

                {/* Bid Records List */}
                {bidRecords.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bidRecords.map((record) => (
                      <div
                        key={record.id}
                        className={`p-4 rounded-lg flex items-center justify-between ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                record.status === 'won'
                                  ? 'bg-green-500'
                                  : record.status === 'lost'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                              }`}
                            />
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {record.projectName}
                            </span>
                          </div>
                          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {record.submittedDate} | {formatCurrency(record.totalBid)}
                            {record.clientName && ` | ${record.clientName}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={record.status}
                            onChange={(e) => updateBidRecordStatus(record.id, e.target.value as 'won' | 'lost' | 'pending')}
                            className={`${selectClass} text-sm`}
                          >
                            <option value="pending">{t('tools.constructionBid.pending3', 'Pending')}</option>
                            <option value="won">{t('tools.constructionBid.won2', 'Won')}</option>
                            <option value="lost">{t('tools.constructionBid.lost2', 'Lost')}</option>
                          </select>
                          <button
                            onClick={() => deleteBidRecord(record.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.constructionBid.noBidHistoryYetSave', 'No bid history yet. Save your first bid to start tracking!')}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.constructionBid.aboutConstructionBidCalculator', 'About Construction Bid Calculator')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                This comprehensive bid calculator helps contractors estimate project costs accurately. Enter your labor,
                materials, equipment, and subcontractor costs to generate a complete bid breakdown.
              </p>
              <p>
                <strong>{t('tools.constructionBid.features', 'Features:')}</strong> Labor estimation by trade, material takeoff with vendor tracking, equipment rental
                calculations, subcontractor quote management, adjustable overhead/profit/contingency percentages, competitive
                bid comparison, and win/loss tracking.
              </p>
              <p className="text-xs italic">
                Note: All data is automatically synced to the cloud when logged in, with local storage fallback for
                offline use. Export your bid summary for documentation or client presentation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-[#0D9488] text-white rounded-lg shadow-lg z-50">
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ConstructionBidTool;
