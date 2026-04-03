'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Car,
  Gauge,
  Wrench,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  Camera,
  StickyNote,
  DollarSign,
  ClipboardCheck,
  Disc,
  Zap,
  Wind,
  Eye,
  Sofa,
  Droplet,
  CircleDot,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type ConditionRating = 'good' | 'fair' | 'needs_attention' | 'urgent';

interface InspectionItem {
  id: string;
  name: string;
  condition: ConditionRating | null;
  notes: string;
  hasPhoto: boolean;
  estimatedCost: number;
}

interface InspectionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: InspectionItem[];
  isExpanded: boolean;
}

interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  mileage: string;
  vin: string;
  licensePlate: string;
  inspectionDate: string;
  inspectorName: string;
}

interface SavedInspection {
  id: string;
  vehicleInfo: VehicleInfo;
  categories: InspectionCategory[];
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const INSPECTION_COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'hasPhoto', header: 'Photo Attached', type: 'boolean' },
];

const getDefaultCategories = (): InspectionCategory[] => [
  {
    id: 'exterior',
    name: 'Exterior',
    icon: <Car className="w-5 h-5" />,
    isExpanded: true,
    items: [
      { id: 'body_panels', name: 'Body Panels & Paint', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'headlights', name: 'Headlights', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'taillights', name: 'Taillights', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'turn_signals', name: 'Turn Signals', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'windshield', name: 'Windshield', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'windows', name: 'Side & Rear Windows', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'mirrors', name: 'Mirrors', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'wipers', name: 'Wiper Blades', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'door_locks', name: 'Door Locks & Handles', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'trunk', name: 'Trunk/Hatch', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
  {
    id: 'interior',
    name: 'Interior',
    icon: <Sofa className="w-5 h-5" />,
    isExpanded: false,
    items: [
      { id: 'seats', name: 'Seats & Upholstery', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'seatbelts', name: 'Seatbelts', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'dashboard', name: 'Dashboard & Gauges', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'steering', name: 'Steering Wheel & Controls', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'pedals', name: 'Pedals', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'ac_heater', name: 'AC/Heater', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'radio_audio', name: 'Radio/Audio System', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'power_windows', name: 'Power Windows', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'horn', name: 'Horn', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'carpet_mats', name: 'Carpet & Floor Mats', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
  {
    id: 'under_hood',
    name: 'Under Hood',
    icon: <Wrench className="w-5 h-5" />,
    isExpanded: false,
    items: [
      { id: 'engine_oil', name: 'Engine Oil Level & Condition', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'coolant', name: 'Coolant Level & Condition', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'brake_fluid', name: 'Brake Fluid', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'power_steering', name: 'Power Steering Fluid', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'transmission_fluid', name: 'Transmission Fluid', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'serpentine_belt', name: 'Serpentine Belt', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'hoses', name: 'Hoses & Connections', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'battery', name: 'Battery & Terminals', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'air_filter', name: 'Air Filter', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'wiring', name: 'Wiring & Electrical', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
  {
    id: 'brakes',
    name: 'Brakes',
    icon: <Disc className="w-5 h-5" />,
    isExpanded: false,
    items: [
      { id: 'front_pads', name: 'Front Brake Pads', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'rear_pads', name: 'Rear Brake Pads', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'front_rotors', name: 'Front Rotors', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'rear_rotors', name: 'Rear Rotors', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'brake_lines', name: 'Brake Lines & Hoses', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'parking_brake', name: 'Parking Brake', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'brake_calipers', name: 'Brake Calipers', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'abs_system', name: 'ABS System', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
  {
    id: 'tires',
    name: 'Tires & Wheels',
    icon: <CircleDot className="w-5 h-5" />,
    isExpanded: false,
    items: [
      { id: 'front_left_tire', name: 'Front Left Tire', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'front_right_tire', name: 'Front Right Tire', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'rear_left_tire', name: 'Rear Left Tire', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'rear_right_tire', name: 'Rear Right Tire', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'spare_tire', name: 'Spare Tire', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'tire_pressure', name: 'Tire Pressure (all)', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'tread_depth', name: 'Tread Depth', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'wheel_alignment', name: 'Wheel Alignment Signs', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'wheels_rims', name: 'Wheels/Rims Condition', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
  {
    id: 'suspension',
    name: 'Suspension & Steering',
    icon: <Zap className="w-5 h-5" />,
    isExpanded: false,
    items: [
      { id: 'front_shocks', name: 'Front Shocks/Struts', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'rear_shocks', name: 'Rear Shocks/Struts', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'control_arms', name: 'Control Arms', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'ball_joints', name: 'Ball Joints', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'tie_rods', name: 'Tie Rods', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'bushings', name: 'Bushings', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'springs', name: 'Springs', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'steering_rack', name: 'Steering Rack/Box', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'cv_joints', name: 'CV Joints/Boots', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
  {
    id: 'exhaust',
    name: 'Exhaust System',
    icon: <Wind className="w-5 h-5" />,
    isExpanded: false,
    items: [
      { id: 'exhaust_manifold', name: 'Exhaust Manifold', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'catalytic_converter', name: 'Catalytic Converter', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'muffler', name: 'Muffler', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'exhaust_pipes', name: 'Exhaust Pipes', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'exhaust_hangers', name: 'Exhaust Hangers', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'tailpipe', name: 'Tailpipe', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
      { id: 'exhaust_leaks', name: 'Exhaust Leaks', condition: null, notes: '', hasPhoto: false, estimatedCost: 0 },
    ],
  },
];

const getDefaultVehicleInfo = (): VehicleInfo => ({
  year: '',
  make: '',
  model: '',
  mileage: '',
  vin: '',
  licensePlate: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectorName: '',
});

const conditionConfig: Record<ConditionRating, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  good: {
    label: 'Good',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="w-4 h-4" />
  },
  fair: {
    label: 'Fair',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: <AlertCircle className="w-4 h-4" />
  },
  needs_attention: {
    label: 'Needs Attention',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <AlertTriangle className="w-4 h-4" />
  },
};

// Columns for saved inspections (used by useToolData hook)
const SAVED_INSPECTION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'vehicleYear', header: 'Year', type: 'string' },
  { key: 'vehicleMake', header: 'Make', type: 'string' },
  { key: 'vehicleModel', header: 'Model', type: 'string' },
  { key: 'vehicleMileage', header: 'Mileage', type: 'string' },
  { key: 'inspectionDate', header: 'Inspection Date', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

interface VehicleInspectionToolProps {
  uiConfig?: UIConfig;
}

export const VehicleInspectionTool: React.FC<VehicleInspectionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: savedInspections,
    setData: setSavedInspections,
    addItem: addInspection,
    updateItem: updateInspection,
    deleteItem: deleteInspectionItem,
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
  } = useToolData<SavedInspection>('vehicle-inspection', [], SAVED_INSPECTION_COLUMNS);

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(getDefaultVehicleInfo());
  const [categories, setCategories] = useState<InspectionCategory[]>(getDefaultCategories());
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const [showSavedList, setShowSavedList] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.year) {
        setVehicleInfo(prev => ({ ...prev, year: String(params.year) }));
        setIsPrefilled(true);
      }
      if (params.make) {
        setVehicleInfo(prev => ({ ...prev, make: params.make }));
        setIsPrefilled(true);
      }
      if (params.model) {
        setVehicleInfo(prev => ({ ...prev, model: params.model }));
        setIsPrefilled(true);
      }
      if (params.mileage !== undefined) {
        setVehicleInfo(prev => ({ ...prev, mileage: String(params.mileage) }));
        setIsPrefilled(true);
      }
      if (params.vin) {
        setVehicleInfo(prev => ({ ...prev, vin: params.vin }));
        setIsPrefilled(true);
      }
      if (params.licensePlate) {
        setVehicleInfo(prev => ({ ...prev, licensePlate: params.licensePlate }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const updateItemCondition = (categoryId: string, itemId: string, condition: ConditionRating) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, condition } : item
            )
          }
        : cat
    ));
  };

  const updateItemNotes = (categoryId: string, itemId: string, notes: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, notes } : item
            )
          }
        : cat
    ));
  };

  const updateItemCost = (categoryId: string, itemId: string, cost: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, estimatedCost: cost } : item
            )
          }
        : cat
    ));
  };

  const toggleItemPhoto = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, hasPhoto: !item.hasPhoto } : item
            )
          }
        : cat
    ));
  };

  const saveInspection = () => {
    if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
      setValidationMessage('Please enter vehicle year, make, and model before saving.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (currentInspectionId) {
      // Update existing using hook's updateItem
      updateInspection(currentInspectionId, {
        vehicleInfo,
        categories,
        updatedAt: now,
      });
    } else {
      // Create new using hook's addItem
      const newInspection: SavedInspection = {
        id: Date.now().toString(),
        vehicleInfo,
        categories,
        createdAt: now,
        updatedAt: now,
      };
      addInspection(newInspection);
      setCurrentInspectionId(newInspection.id);
    }
  };

  const loadInspection = (inspection: SavedInspection) => {
    setVehicleInfo(inspection.vehicleInfo);
    setCategories(inspection.categories);
    setCurrentInspectionId(inspection.id);
    setShowSavedList(false);
  };

  const deleteInspection = async (inspectionId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this inspection?');
    if (confirmed) {
      deleteInspectionItem(inspectionId);
      if (currentInspectionId === inspectionId) {
        resetInspection();
      }
    }
  };

  const resetInspection = () => {
    setVehicleInfo(getDefaultVehicleInfo());
    setCategories(getDefaultCategories());
    setCurrentInspectionId(null);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    let totalItems = 0;
    let inspectedItems = 0;
    let goodCount = 0;
    let fairCount = 0;
    let needsAttentionCount = 0;
    let urgentCount = 0;
    let totalEstimatedCost = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        totalItems++;
        if (item.condition) {
          inspectedItems++;
          if (item.condition === 'good') goodCount++;
          if (item.condition === 'fair') fairCount++;
          if (item.condition === 'needs_attention') needsAttentionCount++;
          if (item.condition === 'urgent') urgentCount++;
        }
        if (item.estimatedCost > 0) {
          totalEstimatedCost += item.estimatedCost;
        }
      });
    });

    return {
      totalItems,
      inspectedItems,
      goodCount,
      fairCount,
      needsAttentionCount,
      urgentCount,
      totalEstimatedCost,
      completionPercentage: totalItems > 0 ? Math.round((inspectedItems / totalItems) * 100) : 0,
    };
  }, [categories]);

  // Generate recommended services
  const recommendedServices = useMemo(() => {
    const services: { item: string; category: string; condition: ConditionRating; estimatedCost: number }[] = [];

    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (item.condition === 'needs_attention' || item.condition === 'urgent') {
          services.push({
            item: item.name,
            category: cat.name,
            condition: item.condition,
            estimatedCost: item.estimatedCost,
          });
        }
      });
    });

    // Sort by urgency (urgent first)
    return services.sort((a, b) => {
      if (a.condition === 'urgent' && b.condition !== 'urgent') return -1;
      if (a.condition !== 'urgent' && b.condition === 'urgent') return 1;
      return 0;
    });
  }, [categories]);

  // Flatten categories for export - this exports the CURRENT inspection items
  const exportData = useMemo(() => {
    const rows: Array<{
      category: string;
      item: string;
      condition: string;
      notes: string;
      estimatedCost: number;
      hasPhoto: boolean;
    }> = [];

    categories.forEach(cat => {
      cat.items.forEach(item => {
        rows.push({
          category: cat.name,
          item: item.name,
          condition: item.condition ? conditionConfig[item.condition].label : 'Not Inspected',
          notes: item.notes,
          estimatedCost: item.estimatedCost,
          hasPhoto: item.hasPhoto,
        });
      });
    });

    return rows;
  }, [categories]);

  // Export filename based on vehicle info
  const exportFilename = useMemo(() => {
    const parts = ['vehicle_inspection'];
    if (vehicleInfo.year) parts.push(vehicleInfo.year);
    if (vehicleInfo.make) parts.push(vehicleInfo.make);
    if (vehicleInfo.model) parts.push(vehicleInfo.model);
    return parts.join('_').replace(/\s+/g, '_');
  }, [vehicleInfo]);

  // Custom export functions for the current inspection (not the saved inspections list)
  const handleExportCurrentCSV = () => {
    import('../../lib/toolDataUtils').then(({ exportToCSV }) => {
      exportToCSV(exportData, INSPECTION_COLUMNS, { filename: exportFilename });
    });
  };

  const handleExportCurrentExcel = () => {
    import('../../lib/toolDataUtils').then(({ exportToExcel }) => {
      exportToExcel(exportData, INSPECTION_COLUMNS, { filename: exportFilename });
    });
  };

  const handleExportCurrentJSON = () => {
    import('../../lib/toolDataUtils').then(({ exportToJSON }) => {
      exportToJSON(exportData, { filename: exportFilename });
    });
  };

  const handleExportCurrentPDF = async () => {
    const { exportToPDF } = await import('../../lib/toolDataUtils');
    await exportToPDF(exportData, INSPECTION_COLUMNS, {
      filename: exportFilename,
      title: 'Vehicle Inspection Report',
      subtitle: `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`.trim() || 'Vehicle Inspection',
    });
  };

  const handlePrintCurrent = () => {
    import('../../lib/toolDataUtils').then(({ printData }) => {
      printData(exportData, INSPECTION_COLUMNS, { title: 'Vehicle Inspection Report' });
    });
  };

  const handleCopyToClipboardCurrent = async () => {
    const { copyToClipboard: copyUtil } = await import('../../lib/toolDataUtils');
    return copyUtil(exportData, INSPECTION_COLUMNS, 'tab');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 print:bg-white print:py-0`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20 print:hidden">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.vehicleInspection.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 print:shadow-none print:mb-4`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg print:bg-gray-200">
                <ClipboardCheck className="w-6 h-6 text-white print:text-gray-700" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vehicleInspection.vehicleInspectionChecklist', 'Vehicle Inspection Checklist')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.vehicleInspection.multiPointVehicleInspectionTool', 'Multi-point vehicle inspection tool')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <WidgetEmbedButton toolSlug="vehicle-inspection" toolName="Vehicle Inspection" />

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
                onClick={() => setShowSavedList(!showSavedList)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                Saved ({savedInspections.length})
              </button>
              <button
                onClick={saveInspection}
                disabled={isSaving}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: exportFilename })}
                onExportExcel={() => exportExcel({ filename: exportFilename })}
                onExportJSON={() => exportJSON({ filename: exportFilename })}
                onExportPDF={() => exportPDF({
                  filename: exportFilename,
                  title: 'Vehicle Inspection Report',
                  subtitle: `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`.trim() || 'Vehicle Inspection',
                })}
                onPrint={() => print('Vehicle Inspection Report')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={theme}
              />
              <button
                onClick={resetInspection}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {t('tools.vehicleInspection.new', 'New')}
              </button>
            </div>
          </div>

          {/* Saved Inspections List */}
          {showSavedList && savedInspections.length > 0 && (
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} print:hidden`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vehicleInspection.savedInspections', 'Saved Inspections')}
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedInspections.map(insp => (
                  <div
                    key={insp.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                    } ${currentInspectionId === insp.id ? 'ring-2 ring-[#0D9488]' : ''}`}
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => loadInspection(insp)}>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {insp.vehicleInfo.year} {insp.vehicleInfo.make} {insp.vehicleInfo.model}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(insp.updatedAt).toLocaleDateString()} - {insp.vehicleInfo.mileage} miles
                      </div>
                    </div>
                    <button
                      onClick={() => deleteInspection(insp.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.year', 'Year *')}
              </label>
              <input
                type="text"
                value={vehicleInfo.year}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.make', 'Make *')}
              </label>
              <input
                type="text"
                value={vehicleInfo.make}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, make: e.target.value }))}
                placeholder={t('tools.vehicleInspection.toyota', 'Toyota')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.model', 'Model *')}
              </label>
              <input
                type="text"
                value={vehicleInfo.model}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
                placeholder={t('tools.vehicleInspection.camry', 'Camry')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.mileage', 'Mileage')}
              </label>
              <input
                type="text"
                value={vehicleInfo.mileage}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="50000"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.vin', 'VIN')}
              </label>
              <input
                type="text"
                value={vehicleInfo.vin}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                placeholder={t('tools.vehicleInspection.1hgbh41jxmn109186', '1HGBH41JXMN109186')}
                maxLength={17}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.licensePlate', 'License Plate')}
              </label>
              <input
                type="text"
                value={vehicleInfo.licensePlate}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                placeholder={t('tools.vehicleInspection.abc1234', 'ABC-1234')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.inspectionDate', 'Inspection Date')}
              </label>
              <input
                type="date"
                value={vehicleInfo.inspectionDate}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, inspectionDate: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.vehicleInspection.inspectorName', 'Inspector Name')}
              </label>
              <input
                type="text"
                value={vehicleInfo.inspectorName}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, inspectorName: e.target.value }))}
                placeholder={t('tools.vehicleInspection.johnSmith', 'John Smith')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] print:border-gray-300`}
              />
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.completionPercentage}%
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vehicleInspection.complete', 'Complete')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.inspectedItems}/{stats.totalItems}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vehicleInspection.inspected', 'Inspected')}</div>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.goodCount}</div>
              <div className="text-xs text-green-600 dark:text-green-400">{t('tools.vehicleInspection.good', 'Good')}</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.fairCount}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">{t('tools.vehicleInspection.fair', 'Fair')}</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.needsAttentionCount}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">{t('tools.vehicleInspection.attention', 'Attention')}</div>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgentCount}</div>
              <div className="text-xs text-red-600 dark:text-red-400">{t('tools.vehicleInspection.urgent', 'Urgent')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalEstimatedCost.toLocaleString()}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vehicleInspection.estCost', 'Est. Cost')}</div>
            </div>
          </div>
        </div>

        {/* Inspection Categories */}
        <div className="space-y-4 mb-6">
          {categories.map(category => (
            <div
              key={category.id}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden print:shadow-none print:border print:border-gray-300`}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between p-4 ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } transition-colors print:bg-gray-100`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} print:bg-gray-200`}>
                    {category.icon}
                  </div>
                  <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {category.name}
                  </span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({category.items.filter(i => i.condition).length}/{category.items.length})
                  </span>
                </div>
                <div className="print:hidden">
                  {category.isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {(category.isExpanded || true) && (
                <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${!category.isExpanded ? 'hidden print:block' : ''}`}>
                  {category.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 ${index !== category.items.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Item Name */}
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </span>
                        </div>

                        {/* Condition Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(conditionConfig) as ConditionRating[]).map(condition => (
                            <button
                              key={condition}
                              onClick={() => updateItemCondition(category.id, item.id, condition)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                                item.condition === condition
                                  ? `${conditionConfig[condition].bgColor} ${conditionConfig[condition].color} ring-2 ring-current`
                                  : theme === 'dark'
                                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } print:text-xs print:px-2 print:py-1`}
                            >
                              {item.condition === condition && conditionConfig[condition].icon}
                              {conditionConfig[condition].label}
                            </button>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 print:hidden">
                          <button
                            onClick={() => setActiveItemId(activeItemId === `${category.id}-${item.id}` ? null : `${category.id}-${item.id}`)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.notes
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={t('tools.vehicleInspection.addNotes', 'Add Notes')}
                          >
                            <StickyNote className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleItemPhoto(category.id, item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.hasPhoto
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={t('tools.vehicleInspection.photoAttached', 'Photo Attached')}
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Notes/Cost Section */}
                      {activeItemId === `${category.id}-${item.id}` && (
                        <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} print:hidden`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.vehicleInspection.notes2', 'Notes')}
                              </label>
                              <textarea
                                value={item.notes}
                                onChange={(e) => updateItemNotes(category.id, item.id, e.target.value)}
                                placeholder={t('tools.vehicleInspection.addInspectionNotes', 'Add inspection notes...')}
                                rows={2}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.vehicleInspection.estimatedRepairCost', 'Estimated Repair Cost ($)')}
                              </label>
                              <div className="relative">
                                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <input
                                  type="number"
                                  value={item.estimatedCost || ''}
                                  onChange={(e) => updateItemCost(category.id, item.id, parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  min="0"
                                  className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Print-only notes display */}
                      {item.notes && (
                        <div className="hidden print:block mt-2 text-sm text-gray-600">
                          <strong>{t('tools.vehicleInspection.notes', 'Notes:')}</strong> {item.notes}
                        </div>
                      )}
                      {item.estimatedCost > 0 && (
                        <div className="hidden print:block mt-1 text-sm text-gray-600">
                          <strong>{t('tools.vehicleInspection.estimatedCost', 'Estimated Cost:')}</strong> ${item.estimatedCost}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recommended Services */}
        {recommendedServices.length > 0 && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 print:shadow-none print:border print:border-gray-300`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vehicleInspection.recommendedServices', 'Recommended Services')}
              </h2>
            </div>
            <div className="space-y-3">
              {recommendedServices.map((service, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    service.condition === 'urgent'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${service.condition === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {service.condition === 'urgent' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {service.item}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {service.category} - {conditionConfig[service.condition].label}
                      </div>
                    </div>
                  </div>
                  {service.estimatedCost > 0 && (
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${service.estimatedCost.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vehicleInspection.totalEstimatedRepairCost', 'Total Estimated Repair Cost:')}
                </span>
                <span className="text-2xl font-bold text-[#0D9488]">
                  ${stats.totalEstimatedCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <strong>{t('tools.vehicleInspection.inspector', 'Inspector:')}</strong> {vehicleInfo.inspectorName || 'N/A'}
            </div>
            <div>
              <strong>{t('tools.vehicleInspection.date', 'Date:')}</strong> {vehicleInfo.inspectionDate}
            </div>
          </div>
          <div className="mt-4">
            <div className="border-b border-gray-300 pb-2 mb-2">
              <strong>{t('tools.vehicleInspection.inspectorSignature', 'Inspector Signature:')}</strong>
            </div>
            <div className="h-12"></div>
          </div>
          <div className="mt-4">
            <div className="border-b border-gray-300 pb-2 mb-2">
              <strong>{t('tools.vehicleInspection.customerSignature', 'Customer Signature:')}</strong>
            </div>
            <div className="h-12"></div>
          </div>
        </div>

        {/* Info Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:hidden`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.vehicleInspection.howToUseThisTool', 'How to Use This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>1. Enter the vehicle information at the top of the form.</p>
            <p>2. Click on each category to expand and view inspection items.</p>
            <p>3. Rate each item's condition: Good, Fair, Needs Attention, or Urgent.</p>
            <p>4. Use the notes button to add detailed observations for any item.</p>
            <p>5. Add estimated repair costs for items that need service.</p>
            <p>6. Save your inspection to continue later or keep records.</p>
            <p>7. Print the report for customer documentation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInspectionTool;
