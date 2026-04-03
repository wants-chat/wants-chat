'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  TreePine,
  User,
  MapPin,
  Ruler,
  Package,
  Clock,
  Wrench,
  Calendar,
  DollarSign,
  Sun,
  Camera,
  BarChart3,
  Percent,
  Save,
  Trash2,
  Plus,
  Minus,
  Download,
  RefreshCw,
  Leaf,
  Droplets,
  Shovel,
  Hammer,
  Scissors,
  Loader2,
} from 'lucide-react';

// Types
interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  notes: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  items: ServiceItem[];
}

interface ServiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface AreaMeasurement {
  lawnSqft: number;
  gardenBedsSqft: number;
  drivewaySqft: number;
  patioSqft: number;
  walkwaySqft: number;
  fenceLinearFt: number;
}

interface MaterialEstimate {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  markup: number;
  total: number;
}

interface LaborEntry {
  id: string;
  taskType: string;
  hours: number;
  workers: number;
  hourlyRate: number;
  total: number;
}

interface EquipmentEntry {
  id: string;
  name: string;
  rentalDays: number;
  dailyRate: number;
  owned: boolean;
  usageFee: number;
  total: number;
}

interface RecurringService {
  id: string;
  name: string;
  frequency: string;
  pricePerVisit: number;
  visitsPerYear: number;
  annualTotal: number;
}

interface OneTimeProject {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface SeasonalConsideration {
  season: string;
  notes: string;
  adjustmentPercent: number;
}

interface PhotoSketch {
  id: string;
  name: string;
  dataUrl: string;
  notes: string;
}

interface EstimateData {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientInfo: ClientInfo;
  areaMeasurements: AreaMeasurement;
  materials: MaterialEstimate[];
  labor: LaborEntry[];
  equipment: EquipmentEntry[];
  recurringServices: RecurringService[];
  oneTimeProjects: OneTimeProject[];
  seasonalConsiderations: SeasonalConsideration[];
  photos: PhotoSketch[];
  profitMarginPercent: number;
  taxPercent: number;
  discountPercent: number;
}

// Default values
const defaultClientInfo: ClientInfo = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  propertyType: 'residential',
  notes: '',
};

const defaultAreaMeasurements: AreaMeasurement = {
  lawnSqft: 0,
  gardenBedsSqft: 0,
  drivewaySqft: 0,
  patioSqft: 0,
  walkwaySqft: 0,
  fenceLinearFt: 0,
};

const defaultSeasonalConsiderations: SeasonalConsideration[] = [
  { season: 'Spring', notes: '', adjustmentPercent: 0 },
  { season: 'Summer', notes: '', adjustmentPercent: 0 },
  { season: 'Fall', notes: '', adjustmentPercent: 0 },
  { season: 'Winter', notes: '', adjustmentPercent: 0 },
];

const serviceCategories: { id: string; name: string; icon: string }[] = [
  { id: 'lawn_care', name: 'Lawn Care', icon: 'leaf' },
  { id: 'planting', name: 'Planting', icon: 'tree' },
  { id: 'hardscaping', name: 'Hardscaping', icon: 'hammer' },
  { id: 'irrigation', name: 'Irrigation', icon: 'droplets' },
  { id: 'tree_service', name: 'Tree Service', icon: 'scissors' },
];

// Column configuration for backend sync and exports
const ESTIMATES_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'clientPhone', header: 'Phone', type: 'string' },
  { key: 'clientAddress', header: 'Address', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'materialsCost', header: 'Materials Cost', type: 'currency' },
  { key: 'laborCost', header: 'Labor Cost', type: 'currency' },
  { key: 'equipmentCost', header: 'Equipment Cost', type: 'currency' },
  { key: 'grandTotal', header: 'Grand Total', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

interface LandscapingEstimateToolProps {
  uiConfig?: UIConfig;
}

export const LandscapingEstimateTool = ({
  uiConfig }: LandscapingEstimateToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence
  const {
    data: savedEstimates,
    addItem: addEstimate,
    updateItem: updateEstimate,
    deleteItem: removeEstimate,
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
  } = useToolData<EstimateData>('landscaping-estimate', [], ESTIMATES_COLUMNS);

  // Form state
  const [clientInfo, setClientInfo] = useState<ClientInfo>(defaultClientInfo);
  const [enabledCategories, setEnabledCategories] = useState<string[]>(['lawn_care']);
  const [areaMeasurements, setAreaMeasurements] = useState<AreaMeasurement>(defaultAreaMeasurements);
  const [materials, setMaterials] = useState<MaterialEstimate[]>([]);
  const [labor, setLabor] = useState<LaborEntry[]>([]);
  const [equipment, setEquipment] = useState<EquipmentEntry[]>([]);
  const [recurringServices, setRecurringServices] = useState<RecurringService[]>([]);
  const [oneTimeProjects, setOneTimeProjects] = useState<OneTimeProject[]>([]);
  const [seasonalConsiderations, setSeasonalConsiderations] = useState<SeasonalConsideration[]>(defaultSeasonalConsiderations);
  const [photos, setPhotos] = useState<PhotoSketch[]>([]);
  const [profitMarginPercent, setProfitMarginPercent] = useState(20);
  const [taxPercent, setTaxPercent] = useState(8);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName) {
        setClientInfo(prev => ({ ...prev, name: params.clientName as string }));
        hasChanges = true;
      }
      if (params.address) {
        setClientInfo(prev => ({ ...prev, address: params.address as string }));
        hasChanges = true;
      }
      if (params.phone) {
        setClientInfo(prev => ({ ...prev, phone: params.phone as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate totals
  const totals = useMemo(() => {
    const materialsCost = materials.reduce((sum, m) => sum + m.total, 0);
    const laborCost = labor.reduce((sum, l) => sum + l.total, 0);
    const equipmentCost = equipment.reduce((sum, e) => sum + e.total, 0);
    const recurringAnnual = recurringServices.reduce((sum, r) => sum + r.annualTotal, 0);
    const oneTimeCost = oneTimeProjects.reduce((sum, p) => sum + p.estimatedCost, 0);
    const oneTimeActual = oneTimeProjects.reduce((sum, p) => sum + (p.actualCost || 0), 0);

    const subtotal = materialsCost + laborCost + equipmentCost + oneTimeCost;
    const seasonalAdjustment = seasonalConsiderations.reduce((sum, s) => sum + s.adjustmentPercent, 0) / 4;
    const adjustedSubtotal = subtotal * (1 + seasonalAdjustment / 100);
    const discount = adjustedSubtotal * (discountPercent / 100);
    const afterDiscount = adjustedSubtotal - discount;
    const profitMargin = afterDiscount * (profitMarginPercent / 100);
    const beforeTax = afterDiscount + profitMargin;
    const tax = beforeTax * (taxPercent / 100);
    const grandTotal = beforeTax + tax;

    return {
      materialsCost,
      laborCost,
      equipmentCost,
      recurringAnnual,
      oneTimeCost,
      oneTimeActual,
      subtotal,
      seasonalAdjustment,
      adjustedSubtotal,
      discount,
      afterDiscount,
      profitMargin,
      beforeTax,
      tax,
      grandTotal,
      variance: oneTimeActual - oneTimeCost,
      variancePercent: oneTimeCost > 0 ? ((oneTimeActual - oneTimeCost) / oneTimeCost) * 100 : 0,
    };
  }, [materials, labor, equipment, recurringServices, oneTimeProjects, seasonalConsiderations, profitMarginPercent, taxPercent, discountPercent]);

  // Column definitions for export
  const ESTIMATE_COLUMNS: ColumnConfig[] = [
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'item', header: 'Item', type: 'string' },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'unit', header: 'Unit', type: 'string' },
    { key: 'unitCost', header: 'Unit Cost', type: 'currency' },
    { key: 'total', header: 'Total', type: 'currency' },
  ];

  // Build export data from all estimate components
  const exportData = useMemo(() => {
    const data: Array<{
      category: string;
      item: string;
      description: string;
      quantity: number | string;
      unit: string;
      unitCost: number | string;
      total: number;
    }> = [];

    // Materials
    materials.forEach(m => {
      data.push({
        category: 'Materials',
        item: m.name || 'Unnamed Material',
        description: `Markup: ${m.markup}%`,
        quantity: m.quantity,
        unit: m.unit,
        unitCost: m.unitCost,
        total: m.total,
      });
    });

    // Labor
    labor.forEach(l => {
      data.push({
        category: 'Labor',
        item: l.taskType || 'Unnamed Task',
        description: `${l.workers} worker(s) x ${l.hours} hrs`,
        quantity: l.hours * l.workers,
        unit: 'hours',
        unitCost: l.hourlyRate,
        total: l.total,
      });
    });

    // Equipment
    equipment.forEach(e => {
      data.push({
        category: 'Equipment',
        item: e.name || 'Unnamed Equipment',
        description: e.owned ? 'Owned' : `${e.rentalDays} day(s) rental`,
        quantity: e.owned ? 1 : e.rentalDays,
        unit: e.owned ? 'usage' : 'days',
        unitCost: e.owned ? e.usageFee : e.dailyRate,
        total: e.total,
      });
    });

    // Recurring Services
    recurringServices.forEach(s => {
      data.push({
        category: 'Recurring Services',
        item: s.name || 'Unnamed Service',
        description: `${s.frequency} - ${s.visitsPerYear} visits/year`,
        quantity: s.visitsPerYear,
        unit: 'visits',
        unitCost: s.pricePerVisit,
        total: s.annualTotal,
      });
    });

    // One-Time Projects
    oneTimeProjects.forEach(p => {
      data.push({
        category: 'One-Time Projects',
        item: p.name || 'Unnamed Project',
        description: `${p.description || ''} (${p.status})`,
        quantity: 1,
        unit: 'project',
        unitCost: p.estimatedCost,
        total: p.estimatedCost,
      });
    });

    // Summary rows
    if (data.length > 0) {
      data.push({
        category: 'Summary',
        item: 'Subtotal',
        description: '',
        quantity: '',
        unit: '',
        unitCost: '',
        total: totals.subtotal,
      });

      if (discountPercent > 0) {
        data.push({
          category: 'Summary',
          item: `Discount (${discountPercent}%)`,
          description: '',
          quantity: '',
          unit: '',
          unitCost: '',
          total: -totals.discount,
        });
      }

      data.push({
        category: 'Summary',
        item: `Profit Margin (${profitMarginPercent}%)`,
        description: '',
        quantity: '',
        unit: '',
        unitCost: '',
        total: totals.profitMargin,
      });

      data.push({
        category: 'Summary',
        item: `Tax (${taxPercent}%)`,
        description: '',
        quantity: '',
        unit: '',
        unitCost: '',
        total: totals.tax,
      });

      data.push({
        category: 'Summary',
        item: 'Grand Total',
        description: '',
        quantity: '',
        unit: '',
        unitCost: '',
        total: totals.grandTotal,
      });
    }

    return data;
  }, [materials, labor, equipment, recurringServices, oneTimeProjects, totals, discountPercent, profitMarginPercent, taxPercent]);

  // Export handlers using the hook's export functions
  const handleExportCSV = () => {
    exportCSV({
      filename: `landscaping-estimate-${clientInfo.name || 'unnamed'}`,
    });
  };

  const handleExportExcel = () => {
    exportExcel({
      filename: `landscaping-estimate-${clientInfo.name || 'unnamed'}`,
    });
  };

  const handleExportJSON = () => {
    exportJSON({
      filename: `landscaping-estimate-${clientInfo.name || 'unnamed'}`,
    });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: `landscaping-estimate-${clientInfo.name || 'unnamed'}`,
      title: 'Landscaping Estimate',
      subtitle: clientInfo.name ? `Client: ${clientInfo.name}` : undefined,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print(`Landscaping Estimate${clientInfo.name ? ` - ${clientInfo.name}` : ''}`);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return await copyToClipboard('tab');
  };

  // Add material
  const addMaterial = () => {
    const newMaterial: MaterialEstimate = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      unit: 'bags',
      unitCost: 0,
      markup: 15,
      total: 0,
    };
    setMaterials([...materials, newMaterial]);
  };

  // Update material
  const updateMaterial = (id: string, field: keyof MaterialEstimate, value: string | number) => {
    setMaterials(materials.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };
        updated.total = updated.quantity * updated.unitCost * (1 + updated.markup / 100);
        return updated;
      }
      return m;
    }));
  };

  // Remove material
  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  // Add labor entry
  const addLabor = () => {
    const newLabor: LaborEntry = {
      id: Date.now().toString(),
      taskType: '',
      hours: 0,
      workers: 1,
      hourlyRate: 25,
      total: 0,
    };
    setLabor([...labor, newLabor]);
  };

  // Update labor
  const updateLabor = (id: string, field: keyof LaborEntry, value: string | number) => {
    setLabor(labor.map(l => {
      if (l.id === id) {
        const updated = { ...l, [field]: value };
        updated.total = updated.hours * updated.workers * updated.hourlyRate;
        return updated;
      }
      return l;
    }));
  };

  // Remove labor
  const removeLabor = (id: string) => {
    setLabor(labor.filter(l => l.id !== id));
  };

  // Add equipment
  const addEquipment = () => {
    const newEquipment: EquipmentEntry = {
      id: Date.now().toString(),
      name: '',
      rentalDays: 1,
      dailyRate: 0,
      owned: false,
      usageFee: 0,
      total: 0,
    };
    setEquipment([...equipment, newEquipment]);
  };

  // Update equipment
  const updateEquipment = (id: string, field: keyof EquipmentEntry, value: string | number | boolean) => {
    setEquipment(equipment.map(e => {
      if (e.id === id) {
        const updated = { ...e, [field]: value };
        updated.total = updated.owned ? updated.usageFee : updated.rentalDays * updated.dailyRate;
        return updated;
      }
      return e;
    }));
  };

  // Remove equipment
  const removeEquipment = (id: string) => {
    setEquipment(equipment.filter(e => e.id !== id));
  };

  // Add recurring service
  const addRecurringService = () => {
    const newService: RecurringService = {
      id: Date.now().toString(),
      name: '',
      frequency: 'weekly',
      pricePerVisit: 0,
      visitsPerYear: 52,
      annualTotal: 0,
    };
    setRecurringServices([...recurringServices, newService]);
  };

  // Update recurring service
  const updateRecurringService = (id: string, field: keyof RecurringService, value: string | number) => {
    setRecurringServices(recurringServices.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        // Update visits based on frequency
        if (field === 'frequency') {
          switch (value) {
            case 'weekly': updated.visitsPerYear = 52; break;
            case 'biweekly': updated.visitsPerYear = 26; break;
            case 'monthly': updated.visitsPerYear = 12; break;
            case 'quarterly': updated.visitsPerYear = 4; break;
            case 'annually': updated.visitsPerYear = 1; break;
          }
        }
        updated.annualTotal = updated.pricePerVisit * updated.visitsPerYear;
        return updated;
      }
      return s;
    }));
  };

  // Remove recurring service
  const removeRecurringService = (id: string) => {
    setRecurringServices(recurringServices.filter(s => s.id !== id));
  };

  // Add one-time project
  const addOneTimeProject = () => {
    const newProject: OneTimeProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      status: 'pending',
    };
    setOneTimeProjects([...oneTimeProjects, newProject]);
  };

  // Update one-time project
  const updateOneTimeProject = (id: string, field: keyof OneTimeProject, value: string | number) => {
    setOneTimeProjects(oneTimeProjects.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Remove one-time project
  const removeOneTimeProject = (id: string) => {
    setOneTimeProjects(oneTimeProjects.filter(p => p.id !== id));
  };

  // Update seasonal consideration
  const updateSeasonalConsideration = (season: string, field: keyof SeasonalConsideration, value: string | number) => {
    setSeasonalConsiderations(seasonalConsiderations.map(s => {
      if (s.season === season) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: PhotoSketch = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          dataUrl: event.target?.result as string,
          notes: '',
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Update photo notes
  const updatePhotoNotes = (id: string, notes: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, notes } : p));
  };

  // Remove photo
  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  // Save current estimate
  const saveEstimate = () => {
    const estimateId = currentEstimateId || Date.now().toString();
    const existingEstimate = savedEstimates.find(e => e.id === currentEstimateId);

    const estimate: EstimateData = {
      id: estimateId,
      createdAt: existingEstimate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientInfo,
      areaMeasurements,
      materials,
      labor,
      equipment,
      recurringServices,
      oneTimeProjects,
      seasonalConsiderations,
      photos,
      profitMarginPercent,
      taxPercent,
      discountPercent,
    };

    if (currentEstimateId && existingEstimate) {
      // Update existing estimate
      updateEstimate(currentEstimateId, estimate);
    } else {
      // Add new estimate
      addEstimate(estimate);
      setCurrentEstimateId(estimateId);
    }

    setValidationMessage('Estimate saved successfully!');
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Load estimate
  const loadEstimate = (id: string) => {
    const estimate = savedEstimates.find(e => e.id === id);
    if (!estimate) return;

    setCurrentEstimateId(id);
    setClientInfo(estimate.clientInfo);
    setAreaMeasurements(estimate.areaMeasurements);
    setMaterials(estimate.materials);
    setLabor(estimate.labor);
    setEquipment(estimate.equipment);
    setRecurringServices(estimate.recurringServices);
    setOneTimeProjects(estimate.oneTimeProjects);
    setSeasonalConsiderations(estimate.seasonalConsiderations);
    setPhotos(estimate.photos);
    setProfitMarginPercent(estimate.profitMarginPercent);
    setTaxPercent(estimate.taxPercent);
    setDiscountPercent(estimate.discountPercent);
  };

  // Delete estimate
  const deleteEstimate = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Estimate',
      message: 'Are you sure you want to delete this estimate?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      removeEstimate(id);
      if (currentEstimateId === id) {
        resetForm();
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentEstimateId(null);
    setClientInfo(defaultClientInfo);
    setEnabledCategories(['lawn_care']);
    setAreaMeasurements(defaultAreaMeasurements);
    setMaterials([]);
    setLabor([]);
    setEquipment([]);
    setRecurringServices([]);
    setOneTimeProjects([]);
    setSeasonalConsiderations(defaultSeasonalConsiderations);
    setPhotos([]);
    setProfitMarginPercent(20);
    setTaxPercent(8);
    setDiscountPercent(0);
  };

  // Export estimate as JSON
  const exportEstimate = () => {
    const estimate: EstimateData = {
      id: currentEstimateId || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientInfo,
      areaMeasurements,
      materials,
      labor,
      equipment,
      recurringServices,
      oneTimeProjects,
      seasonalConsiderations,
      photos,
      profitMarginPercent,
      taxPercent,
      discountPercent,
    };

    const blob = new Blob([JSON.stringify(estimate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landscaping-estimate-${clientInfo.name || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'client', label: 'Client Info', icon: User },
    { id: 'services', label: 'Services', icon: Leaf },
    { id: 'areas', label: 'Areas', icon: Ruler },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'labor', label: 'Labor', icon: Clock },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
    { id: 'recurring', label: 'Recurring', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: Hammer },
    { id: 'seasonal', label: 'Seasonal', icon: Sun },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'profit', label: 'Profit', icon: Percent },
  ];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf': return <Leaf className="w-5 h-5" />;
      case 'tree': return <TreePine className="w-5 h-5" />;
      case 'hammer': return <Hammer className="w-5 h-5" />;
      case 'droplets': return <Droplets className="w-5 h-5" />;
      case 'scissors': return <Scissors className="w-5 h-5" />;
      default: return <Shovel className="w-5 h-5" />;
    }
  };

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488] mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.landscapingEstimate.loadingEstimates', 'Loading estimates...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.landscapingEstimateTool', 'Landscaping Estimate Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.createComprehensiveLandscapingJobEstimates', 'Create comprehensive landscaping job estimates')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="landscaping-estimate" toolName="Landscaping Estimate" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <button
                onClick={resetForm}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.landscapingEstimate.new', 'New')}
              </button>
              <button
                onClick={saveEstimate}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('tools.landscapingEstimate.save', 'Save')}
              </button>
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={theme}
                disabled={exportData.length === 0}
              />
            </div>
          </div>

          {/* Saved Estimates */}
          {savedEstimates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.landscapingEstimate.savedEstimates', 'Saved Estimates')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {savedEstimates.map(estimate => (
                  <div
                    key={estimate.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                      currentEstimateId === estimate.id
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <button onClick={() => loadEstimate(estimate.id)} className="hover:underline">
                      {estimate.clientInfo.name || 'Unnamed'} - {new Date(estimate.createdAt).toLocaleDateString()}
                    </button>
                    <button
                      onClick={() => deleteEstimate(estimate.id)}
                      className="hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className={`${cardClass} p-2 mb-6 overflow-x-auto`}>
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${cardClass} p-6`}>
          {/* Client Info Tab */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.clientPropertyInformation', 'Client & Property Information')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.clientName', 'Client Name *')}</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    placeholder={t('tools.landscapingEstimate.johnDoe', 'John Doe')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.email', 'Email')}</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder={t('tools.landscapingEstimate.johnExampleCom', 'john@example.com')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.propertyType', 'Property Type')}</label>
                  <select
                    value={clientInfo.propertyType}
                    onChange={(e) => setClientInfo({ ...clientInfo, propertyType: e.target.value })}
                    className={inputClass}
                  >
                    <option value="residential">{t('tools.landscapingEstimate.residential', 'Residential')}</option>
                    <option value="commercial">{t('tools.landscapingEstimate.commercial', 'Commercial')}</option>
                    <option value="industrial">{t('tools.landscapingEstimate.industrial', 'Industrial')}</option>
                    <option value="municipal">{t('tools.landscapingEstimate.municipal', 'Municipal')}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.landscapingEstimate.streetAddress', 'Street Address')}</label>
                  <input
                    type="text"
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                    placeholder={t('tools.landscapingEstimate.123MainStreet', '123 Main Street')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.city', 'City')}</label>
                  <input
                    type="text"
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                    placeholder={t('tools.landscapingEstimate.springfield', 'Springfield')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.state', 'State')}</label>
                  <input
                    type="text"
                    value={clientInfo.state}
                    onChange={(e) => setClientInfo({ ...clientInfo, state: e.target.value })}
                    placeholder="IL"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.zipCode', 'ZIP Code')}</label>
                  <input
                    type="text"
                    value={clientInfo.zipCode}
                    onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                    placeholder="62701"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.landscapingEstimate.notes', 'Notes')}</label>
                  <textarea
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                    placeholder={t('tools.landscapingEstimate.additionalNotesAboutTheClient', 'Additional notes about the client or property...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.serviceCategories', 'Service Categories')}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.landscapingEstimate.selectTheServiceCategoriesApplicable', 'Select the service categories applicable to this job')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      if (enabledCategories.includes(category.id)) {
                        setEnabledCategories(enabledCategories.filter(c => c !== category.id));
                      } else {
                        setEnabledCategories([...enabledCategories, category.id]);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      enabledCategories.includes(category.id)
                        ? 'border-[#0D9488] bg-[#0D9488]/10'
                        : theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      enabledCategories.includes(category.id)
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getCategoryIcon(category.icon)}
                    </div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Areas Tab */}
          {activeTab === 'areas' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.areaMeasurements', 'Area Measurements')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.lawnAreaSqFt', 'Lawn Area (sq ft)')}</label>
                  <input
                    type="number"
                    value={areaMeasurements.lawnSqft || ''}
                    onChange={(e) => setAreaMeasurements({ ...areaMeasurements, lawnSqft: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.gardenBedsSqFt', 'Garden Beds (sq ft)')}</label>
                  <input
                    type="number"
                    value={areaMeasurements.gardenBedsSqft || ''}
                    onChange={(e) => setAreaMeasurements({ ...areaMeasurements, gardenBedsSqft: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.drivewaySqFt', 'Driveway (sq ft)')}</label>
                  <input
                    type="number"
                    value={areaMeasurements.drivewaySqft || ''}
                    onChange={(e) => setAreaMeasurements({ ...areaMeasurements, drivewaySqft: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.patioAreaSqFt', 'Patio Area (sq ft)')}</label>
                  <input
                    type="number"
                    value={areaMeasurements.patioSqft || ''}
                    onChange={(e) => setAreaMeasurements({ ...areaMeasurements, patioSqft: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.walkwaySqFt', 'Walkway (sq ft)')}</label>
                  <input
                    type="number"
                    value={areaMeasurements.walkwaySqft || ''}
                    onChange={(e) => setAreaMeasurements({ ...areaMeasurements, walkwaySqft: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.fenceLineLinearFt', 'Fence Line (linear ft)')}</label>
                  <input
                    type="number"
                    value={areaMeasurements.fenceLinearFt || ''}
                    onChange={(e) => setAreaMeasurements({ ...areaMeasurements, fenceLinearFt: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.totalAreaSummary', 'Total Area Summary')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total Hardscape: {(areaMeasurements.drivewaySqft + areaMeasurements.patioSqft + areaMeasurements.walkwaySqft).toLocaleString()} sq ft
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total Softscape: {(areaMeasurements.lawnSqft + areaMeasurements.gardenBedsSqft).toLocaleString()} sq ft
                </p>
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.materialEstimates', 'Material Estimates')}
                </h2>
                <button
                  onClick={addMaterial}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.landscapingEstimate.addMaterial', 'Add Material')}
                </button>
              </div>

              {materials.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.noMaterialsAddedYetClick', 'No materials added yet. Click "Add Material" to start.')}
                </p>
              ) : (
                <div className="space-y-4">
                  {materials.map(material => (
                    <div key={material.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.landscapingEstimate.materialName', 'Material Name')}</label>
                          <input
                            type="text"
                            value={material.name}
                            onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                            placeholder={t('tools.landscapingEstimate.eGMulchSodPavers', 'e.g., Mulch, Sod, Pavers')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.quantity', 'Quantity')}</label>
                          <input
                            type="number"
                            value={material.quantity || ''}
                            onChange={(e) => updateMaterial(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.unit', 'Unit')}</label>
                          <select
                            value={material.unit}
                            onChange={(e) => updateMaterial(material.id, 'unit', e.target.value)}
                            className={inputClass}
                          >
                            <option value="bags">{t('tools.landscapingEstimate.bags', 'Bags')}</option>
                            <option value="yards">{t('tools.landscapingEstimate.cubicYards', 'Cubic Yards')}</option>
                            <option value="sqft">{t('tools.landscapingEstimate.sqFt', 'Sq Ft')}</option>
                            <option value="pallets">{t('tools.landscapingEstimate.pallets', 'Pallets')}</option>
                            <option value="pieces">{t('tools.landscapingEstimate.pieces', 'Pieces')}</option>
                            <option value="tons">{t('tools.landscapingEstimate.tons', 'Tons')}</option>
                            <option value="gallons">{t('tools.landscapingEstimate.gallons', 'Gallons')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.unitCost', 'Unit Cost ($)')}</label>
                          <input
                            type="number"
                            value={material.unitCost || ''}
                            onChange={(e) => updateMaterial(material.id, 'unitCost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className={labelClass}>{t('tools.landscapingEstimate.markup', 'Markup %')}</label>
                            <input
                              type="number"
                              value={material.markup || ''}
                              onChange={(e) => updateMaterial(material.id, 'markup', parseFloat(e.target.value) || 0)}
                              placeholder="15"
                              min="0"
                              className={inputClass}
                            />
                          </div>
                          <button
                            onClick={() => removeMaterial(material.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className={`mt-2 text-right font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total: ${material.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.landscapingEstimate.totalMaterialsCost', 'Total Materials Cost')}
                      </span>
                      <span className="text-xl font-bold text-[#0D9488]">
                        ${totals.materialsCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Labor Tab */}
          {activeTab === 'labor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.laborHours', 'Labor Hours')}
                </h2>
                <button
                  onClick={addLabor}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.landscapingEstimate.addLabor', 'Add Labor')}
                </button>
              </div>

              {labor.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.noLaborEntriesAddedYet', 'No labor entries added yet. Click "Add Labor" to start.')}
                </p>
              ) : (
                <div className="space-y-4">
                  {labor.map(entry => (
                    <div key={entry.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.landscapingEstimate.taskType', 'Task Type')}</label>
                          <input
                            type="text"
                            value={entry.taskType}
                            onChange={(e) => updateLabor(entry.id, 'taskType', e.target.value)}
                            placeholder={t('tools.landscapingEstimate.eGMowingPlantingExcavation', 'e.g., Mowing, Planting, Excavation')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.hours', 'Hours')}</label>
                          <input
                            type="number"
                            value={entry.hours || ''}
                            onChange={(e) => updateLabor(entry.id, 'hours', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.5"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.workers', 'Workers')}</label>
                          <input
                            type="number"
                            value={entry.workers || ''}
                            onChange={(e) => updateLabor(entry.id, 'workers', parseInt(e.target.value) || 1)}
                            placeholder="1"
                            min="1"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className={labelClass}>{t('tools.landscapingEstimate.hourlyRate', 'Hourly Rate ($)')}</label>
                            <input
                              type="number"
                              value={entry.hourlyRate || ''}
                              onChange={(e) => updateLabor(entry.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                              placeholder="25.00"
                              min="0"
                              step="0.01"
                              className={inputClass}
                            />
                          </div>
                          <button
                            onClick={() => removeLabor(entry.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className={`mt-2 text-right font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total: ${entry.total.toFixed(2)} ({entry.hours * entry.workers} total hours)
                      </div>
                    </div>
                  ))}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.landscapingEstimate.totalLaborCost', 'Total Labor Cost')}
                      </span>
                      <span className="text-xl font-bold text-[#0D9488]">
                        ${totals.laborCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.equipmentNeedsRentalCosts', 'Equipment Needs & Rental Costs')}
                </h2>
                <button
                  onClick={addEquipment}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.landscapingEstimate.addEquipment', 'Add Equipment')}
                </button>
              </div>

              {equipment.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.noEquipmentAddedYetClick', 'No equipment added yet. Click "Add Equipment" to start.')}
                </p>
              ) : (
                <div className="space-y-4">
                  {equipment.map(entry => (
                    <div key={entry.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.landscapingEstimate.equipmentName', 'Equipment Name')}</label>
                          <input
                            type="text"
                            value={entry.name}
                            onChange={(e) => updateEquipment(entry.id, 'name', e.target.value)}
                            placeholder={t('tools.landscapingEstimate.eGSkidSteerTrencher', 'e.g., Skid Steer, Trencher, Chipper')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.owned', 'Owned?')}</label>
                          <select
                            value={entry.owned ? 'yes' : 'no'}
                            onChange={(e) => updateEquipment(entry.id, 'owned', e.target.value === 'yes')}
                            className={inputClass}
                          >
                            <option value="no">{t('tools.landscapingEstimate.rental', 'Rental')}</option>
                            <option value="yes">{t('tools.landscapingEstimate.owned2', 'Owned')}</option>
                          </select>
                        </div>
                        {entry.owned ? (
                          <div>
                            <label className={labelClass}>{t('tools.landscapingEstimate.usageFee', 'Usage Fee ($)')}</label>
                            <input
                              type="number"
                              value={entry.usageFee || ''}
                              onChange={(e) => updateEquipment(entry.id, 'usageFee', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={inputClass}
                            />
                          </div>
                        ) : (
                          <>
                            <div>
                              <label className={labelClass}>{t('tools.landscapingEstimate.rentalDays', 'Rental Days')}</label>
                              <input
                                type="number"
                                value={entry.rentalDays || ''}
                                onChange={(e) => updateEquipment(entry.id, 'rentalDays', parseInt(e.target.value) || 1)}
                                placeholder="1"
                                min="1"
                                className={inputClass}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex items-end gap-2">
                          {!entry.owned && (
                            <div className="flex-1">
                              <label className={labelClass}>{t('tools.landscapingEstimate.dailyRate', 'Daily Rate ($)')}</label>
                              <input
                                type="number"
                                value={entry.dailyRate || ''}
                                onChange={(e) => updateEquipment(entry.id, 'dailyRate', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={inputClass}
                              />
                            </div>
                          )}
                          <button
                            onClick={() => removeEquipment(entry.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className={`mt-2 text-right font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total: ${entry.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.landscapingEstimate.totalEquipmentCost', 'Total Equipment Cost')}
                      </span>
                      <span className="text-xl font-bold text-[#0D9488]">
                        ${totals.equipmentCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recurring Services Tab */}
          {activeTab === 'recurring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.recurringServicePricing', 'Recurring Service Pricing')}
                </h2>
                <button
                  onClick={addRecurringService}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.landscapingEstimate.addService', 'Add Service')}
                </button>
              </div>

              {recurringServices.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.noRecurringServicesAddedYet', 'No recurring services added yet. Click "Add Service" to start.')}
                </p>
              ) : (
                <div className="space-y-4">
                  {recurringServices.map(service => (
                    <div key={service.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.landscapingEstimate.serviceName', 'Service Name')}</label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateRecurringService(service.id, 'name', e.target.value)}
                            placeholder={t('tools.landscapingEstimate.eGLawnMowingMaintenance', 'e.g., Lawn Mowing, Maintenance')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.frequency', 'Frequency')}</label>
                          <select
                            value={service.frequency}
                            onChange={(e) => updateRecurringService(service.id, 'frequency', e.target.value)}
                            className={inputClass}
                          >
                            <option value="weekly">{t('tools.landscapingEstimate.weekly', 'Weekly')}</option>
                            <option value="biweekly">{t('tools.landscapingEstimate.biWeekly', 'Bi-Weekly')}</option>
                            <option value="monthly">{t('tools.landscapingEstimate.monthly', 'Monthly')}</option>
                            <option value="quarterly">{t('tools.landscapingEstimate.quarterly', 'Quarterly')}</option>
                            <option value="annually">{t('tools.landscapingEstimate.annually', 'Annually')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.priceVisit', 'Price/Visit ($)')}</label>
                          <input
                            type="number"
                            value={service.pricePerVisit || ''}
                            onChange={(e) => updateRecurringService(service.id, 'pricePerVisit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className={labelClass}>{t('tools.landscapingEstimate.visitsYear', 'Visits/Year')}</label>
                            <input
                              type="number"
                              value={service.visitsPerYear || ''}
                              onChange={(e) => updateRecurringService(service.id, 'visitsPerYear', parseInt(e.target.value) || 0)}
                              placeholder="52"
                              min="1"
                              className={inputClass}
                            />
                          </div>
                          <button
                            onClick={() => removeRecurringService(service.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className={`mt-2 text-right font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Annual Total: ${service.annualTotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.landscapingEstimate.totalAnnualRecurringRevenue', 'Total Annual Recurring Revenue')}
                      </span>
                      <span className="text-xl font-bold text-[#0D9488]">
                        ${totals.recurringAnnual.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* One-Time Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.oneTimeProjectPricing', 'One-Time Project Pricing')}
                </h2>
                <button
                  onClick={addOneTimeProject}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.landscapingEstimate.addProject', 'Add Project')}
                </button>
              </div>

              {oneTimeProjects.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.noProjectsAddedYetClick', 'No projects added yet. Click "Add Project" to start.')}
                </p>
              ) : (
                <div className="space-y-4">
                  {oneTimeProjects.map(project => (
                    <div key={project.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.projectName', 'Project Name')}</label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) => updateOneTimeProject(project.id, 'name', e.target.value)}
                            placeholder={t('tools.landscapingEstimate.eGPatioInstallation', 'e.g., Patio Installation')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.description', 'Description')}</label>
                          <input
                            type="text"
                            value={project.description}
                            onChange={(e) => updateOneTimeProject(project.id, 'description', e.target.value)}
                            placeholder={t('tools.landscapingEstimate.briefDescription', 'Brief description')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.estimatedCost', 'Estimated Cost ($)')}</label>
                          <input
                            type="number"
                            value={project.estimatedCost || ''}
                            onChange={(e) => updateOneTimeProject(project.id, 'estimatedCost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.landscapingEstimate.actualCost', 'Actual Cost ($)')}</label>
                          <input
                            type="number"
                            value={project.actualCost || ''}
                            onChange={(e) => updateOneTimeProject(project.id, 'actualCost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className={labelClass}>{t('tools.landscapingEstimate.status', 'Status')}</label>
                            <select
                              value={project.status}
                              onChange={(e) => updateOneTimeProject(project.id, 'status', e.target.value)}
                              className={inputClass}
                            >
                              <option value="pending">{t('tools.landscapingEstimate.pending', 'Pending')}</option>
                              <option value="in_progress">{t('tools.landscapingEstimate.inProgress', 'In Progress')}</option>
                              <option value="completed">{t('tools.landscapingEstimate.completed', 'Completed')}</option>
                            </select>
                          </div>
                          <button
                            onClick={() => removeOneTimeProject(project.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.landscapingEstimate.totalOneTimeProjects', 'Total One-Time Projects')}
                      </span>
                      <span className="text-xl font-bold text-[#0D9488]">
                        ${totals.oneTimeCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seasonal Tab */}
          {activeTab === 'seasonal' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.seasonalConsiderations', 'Seasonal Considerations')}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.landscapingEstimate.adjustPricingBasedOnSeasonal', 'Adjust pricing based on seasonal factors (positive values increase price, negative decrease)')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonalConsiderations.map(season => (
                  <div key={season.season} className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className={`w-5 h-5 ${
                        season.season === 'Summer' ? 'text-yellow-500' :
                        season.season === 'Winter' ? 'text-blue-400' :
                        season.season === 'Fall' ? 'text-orange-500' :
                        'text-green-500'
                      }`} />
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {season.season}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>{t('tools.landscapingEstimate.adjustment', 'Adjustment (%)')}</label>
                        <input
                          type="number"
                          value={season.adjustmentPercent || ''}
                          onChange={(e) => updateSeasonalConsideration(season.season, 'adjustmentPercent', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.landscapingEstimate.notes2', 'Notes')}</label>
                        <textarea
                          value={season.notes}
                          onChange={(e) => updateSeasonalConsideration(season.season, 'notes', e.target.value)}
                          placeholder={t('tools.landscapingEstimate.seasonalConsiderations2', 'Seasonal considerations...')}
                          rows={2}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.landscapingEstimate.averageSeasonalAdjustment', 'Average Seasonal Adjustment')}
                  </span>
                  <span className={`text-xl font-bold ${totals.seasonalAdjustment >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totals.seasonalAdjustment >= 0 ? '+' : ''}{totals.seasonalAdjustment.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.propertyPhotosSketches', 'Property Photos & Sketches')}
                </h2>
                <label className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  Upload Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <Camera className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.landscapingEstimate.noPhotosAddedYetUpload', 'No photos added yet. Upload photos or sketches of the property layout.')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="aspect-video relative">
                        <img
                          src={photo.dataUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3">
                        <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {photo.name}
                        </p>
                        <textarea
                          value={photo.notes}
                          onChange={(e) => updatePhotoNotes(photo.id, e.target.value)}
                          placeholder={t('tools.landscapingEstimate.addNotes', 'Add notes...')}
                          rows={2}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.estimateVsActualComparison', 'Estimate vs Actual Comparison')}
              </h2>

              {oneTimeProjects.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.landscapingEstimate.addOneTimeProjectsTo', 'Add one-time projects to compare estimates vs actuals.')}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.landscapingEstimate.project', 'Project')}</th>
                          <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.landscapingEstimate.estimated', 'Estimated')}</th>
                          <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.landscapingEstimate.actual', 'Actual')}</th>
                          <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.landscapingEstimate.variance', 'Variance')}</th>
                          <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.landscapingEstimate.status2', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oneTimeProjects.map(project => {
                          const variance = project.actualCost - project.estimatedCost;
                          const variancePercent = project.estimatedCost > 0 ? (variance / project.estimatedCost) * 100 : 0;
                          return (
                            <tr key={project.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                              <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.name || 'Unnamed'}</td>
                              <td className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                ${project.estimatedCost.toFixed(2)}
                              </td>
                              <td className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                ${project.actualCost.toFixed(2)}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${variance > 0 ? 'text-red-500' : variance < 0 ? 'text-green-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {variance > 0 ? '+' : ''}{variance.toFixed(2)} ({variancePercent.toFixed(1)}%)
                              </td>
                              <td className={`py-3 px-4 text-right`}>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  project.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {project.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.landscapingEstimate.totalEstimated', 'Total Estimated')}</p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${totals.oneTimeCost.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.landscapingEstimate.totalActual', 'Total Actual')}</p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${totals.oneTimeActual.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.landscapingEstimate.totalVariance', 'Total Variance')}</p>
                        <p className={`text-2xl font-bold ${totals.variance > 0 ? 'text-red-500' : totals.variance < 0 ? 'text-green-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {totals.variance > 0 ? '+' : ''}${totals.variance.toFixed(2)} ({totals.variancePercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profit Tab */}
          {activeTab === 'profit' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.profitMarginCalculator', 'Profit Margin Calculator')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.profitMargin', 'Profit Margin (%)')}</label>
                  <input
                    type="number"
                    value={profitMarginPercent || ''}
                    onChange={(e) => setProfitMarginPercent(parseFloat(e.target.value) || 0)}
                    placeholder="20"
                    min="0"
                    max="100"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.taxRate', 'Tax Rate (%)')}</label>
                  <input
                    type="number"
                    value={taxPercent || ''}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    placeholder="8"
                    min="0"
                    max="100"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.landscapingEstimate.discount', 'Discount (%)')}</label>
                  <input
                    type="number"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    max="100"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.landscapingEstimate.costBreakdown', 'Cost Breakdown')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.landscapingEstimate.materials', 'Materials:')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${totals.materialsCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.landscapingEstimate.labor', 'Labor:')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${totals.laborCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.landscapingEstimate.equipment', 'Equipment:')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${totals.equipmentCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.landscapingEstimate.oneTimeProjects', 'One-Time Projects:')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${totals.oneTimeCost.toFixed(2)}
                    </span>
                  </div>
                  <div className={`border-t pt-3 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.landscapingEstimate.subtotal', 'Subtotal:')}</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${totals.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {totals.seasonalAdjustment !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Seasonal Adjustment ({totals.seasonalAdjustment.toFixed(1)}%):
                      </span>
                      <span className={`font-medium ${totals.seasonalAdjustment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totals.seasonalAdjustment > 0 ? '+' : ''}${(totals.adjustedSubtotal - totals.subtotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Discount ({discountPercent}%):
                      </span>
                      <span className="font-medium text-red-500">
                        -${totals.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Profit Margin ({profitMarginPercent}%):
                    </span>
                    <span className="font-medium text-green-500">
                      +${totals.profitMargin.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Tax ({taxPercent}%):
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      +${totals.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className={`border-t-2 pt-3 ${theme === 'dark' ? 'border-gray-500' : 'border-gray-400'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.landscapingEstimate.grandTotal', 'Grand Total:')}
                      </span>
                      <span className="text-2xl font-bold text-[#0D9488]">
                        ${totals.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {totals.recurringAnnual > 0 && (
                <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.landscapingEstimate.recurringRevenueNotIncludedIn', 'Recurring Revenue (Not included in one-time total)')}
                  </h4>
                  <p className="text-2xl font-bold text-blue-500">
                    ${totals.recurringAnnual.toFixed(2)}/year
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    ${(totals.recurringAnnual / 12).toFixed(2)}/month average
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className={`${cardClass} p-6 mt-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.landscapingEstimate.estimateSummary', 'Estimate Summary')}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {clientInfo.name || 'No client'} - {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.landscapingEstimate.oneTime', 'One-Time')}</p>
                <p className="text-xl font-bold text-[#0D9488]">${totals.grandTotal.toFixed(2)}</p>
              </div>
              {totals.recurringAnnual > 0 && (
                <div className="text-center">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.landscapingEstimate.annualRecurring', 'Annual Recurring')}</p>
                  <p className="text-xl font-bold text-blue-500">${totals.recurringAnnual.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className={`${cardClass} p-6 mt-6`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.landscapingEstimate.aboutLandscapingEstimateTool', 'About Landscaping Estimate Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              {t('tools.landscapingEstimate.thisComprehensiveLandscapingEstimateTool', 'This comprehensive landscaping estimate tool helps you create detailed job quotes including materials, labor, equipment, and recurring services.')}
            </p>
            <p>
              {t('tools.landscapingEstimate.featuresIncludeSeasonalPricingAdjustments', 'Features include seasonal pricing adjustments, profit margin calculations, photo documentation, and estimate vs actual comparisons for completed projects.')}
            </p>
            <p className="text-xs italic">
              {t('tools.landscapingEstimate.yourEstimatesAreAutomaticallySynced', 'Your estimates are automatically synced to the cloud when signed in, with local backup for offline access.')}
            </p>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default LandscapingEstimateTool;
