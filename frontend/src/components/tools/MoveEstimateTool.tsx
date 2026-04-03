'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Truck,
  Calculator,
  MapPin,
  Package,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Home,
  Building,
  Plus,
  Trash2,
  Save,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface RoomInventory {
  id: string;
  room: string;
  items: number;
  estimatedCubicFeet: number;
  fragileItems: number;
  specialItems: string[];
}

interface MoveEstimate {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  originType: 'apartment' | 'house' | 'condo' | 'office' | 'storage';
  originFloor: number;
  originElevator: boolean;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  destinationType: 'apartment' | 'house' | 'condo' | 'office' | 'storage';
  destinationFloor: number;
  destinationElevator: boolean;
  moveDate: string;
  moveTime: string;
  estimatedDistance: number;
  roomInventory: RoomInventory[];
  totalCubicFeet: number;
  estimatedWeight: number;
  packingRequired: boolean;
  packingLevel: 'none' | 'partial' | 'full';
  unpackingRequired: boolean;
  specialItems: string[];
  crewSize: number;
  estimatedHours: number;
  truckSize: 'small' | 'medium' | 'large' | 'semi';
  laborRate: number;
  travelRate: number;
  packingCost: number;
  materialsCost: number;
  insuranceCost: number;
  fuelSurcharge: number;
  totalEstimate: number;
  discount: number;
  finalPrice: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  validUntil: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const estimateColumns: ColumnConfig[] = [
  { key: 'id', header: 'Estimate ID', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'originCity', header: 'Origin City', type: 'string' },
  { key: 'originState', header: 'Origin State', type: 'string' },
  { key: 'destinationCity', header: 'Destination City', type: 'string' },
  { key: 'destinationState', header: 'Destination State', type: 'string' },
  { key: 'moveDate', header: 'Move Date', type: 'date' },
  { key: 'estimatedDistance', header: 'Distance (mi)', type: 'number' },
  { key: 'totalCubicFeet', header: 'Cubic Feet', type: 'number' },
  { key: 'crewSize', header: 'Crew Size', type: 'number' },
  { key: 'estimatedHours', header: 'Est. Hours', type: 'number' },
  { key: 'totalEstimate', header: 'Total Estimate', type: 'currency' },
  { key: 'discount', header: 'Discount', type: 'currency' },
  { key: 'finalPrice', header: 'Final Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Pricing constants
const PRICING = {
  laborRates: {
    small: 35,
    medium: 40,
    large: 45,
    semi: 50,
  },
  travelRatePerMile: 2.5,
  packingRates: {
    none: 0,
    partial: 150,
    full: 350,
  },
  materialsCostPerCubicFoot: 1.25,
  insuranceRatePerThousand: 8,
  fuelSurchargePercent: 0.08,
  truckCapacity: {
    small: 400,
    medium: 800,
    large: 1200,
    semi: 2000,
  },
  cubicFeetPerMover: 200,
  hoursPerCubicFoot: 0.015,
};

const ROOM_DEFAULTS: Record<string, { items: number; cubicFeet: number }> = {
  'Living Room': { items: 15, cubicFeet: 150 },
  'Master Bedroom': { items: 12, cubicFeet: 120 },
  'Bedroom': { items: 10, cubicFeet: 100 },
  'Kitchen': { items: 30, cubicFeet: 100 },
  'Dining Room': { items: 8, cubicFeet: 80 },
  'Office': { items: 15, cubicFeet: 100 },
  'Bathroom': { items: 5, cubicFeet: 20 },
  'Garage': { items: 25, cubicFeet: 200 },
  'Basement': { items: 20, cubicFeet: 180 },
  'Attic': { items: 10, cubicFeet: 80 },
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface MoveEstimateToolProps {
  uiConfig?: UIConfig;
}

export const MoveEstimateTool: React.FC<MoveEstimateToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: estimates,
    addItem: addEstimate,
    updateItem: updateEstimate,
    deleteItem: deleteEstimate,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MoveEstimate>('move-estimates', [], estimateColumns);

  // UI State
  const [activeTab, setActiveTab] = useState<'estimates' | 'calculator'>('calculator');
  const [showEstimateForm, setShowEstimateForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<MoveEstimate | null>(null);
  const [expandedEstimateId, setExpandedEstimateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calculator Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    originAddress: '',
    originCity: '',
    originState: '',
    originZip: '',
    originType: 'house' as 'apartment' | 'house' | 'condo' | 'office' | 'storage',
    originFloor: 1,
    originElevator: false,
    destinationAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    destinationType: 'house' as 'apartment' | 'house' | 'condo' | 'office' | 'storage',
    destinationFloor: 1,
    destinationElevator: false,
    moveDate: '',
    moveTime: '08:00',
    estimatedDistance: 0,
    packingRequired: false,
    packingLevel: 'none' as 'none' | 'partial' | 'full',
    unpackingRequired: false,
    specialItems: [] as string[],
    discount: 0,
    notes: '',
  });

  const [roomInventory, setRoomInventory] = useState<RoomInventory[]>([]);
  const [newRoom, setNewRoom] = useState('');
  const [specialItemInput, setSpecialItemInput] = useState('');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.customer || params.address || params.city) {
        setFormData((prev) => ({
          ...prev,
          customerName: params.customer || params.name || prev.customerName,
          customerPhone: params.phone || prev.customerPhone,
          customerEmail: params.email || prev.customerEmail,
          originAddress: params.address || params.originAddress || prev.originAddress,
          originCity: params.city || params.originCity || prev.originCity,
          originState: params.state || params.originState || prev.originState,
          originZip: params.zip || params.originZip || prev.originZip,
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate totals
  const calculatedValues = useMemo(() => {
    const totalCubicFeet = roomInventory.reduce((sum, room) => sum + room.estimatedCubicFeet, 0);
    const estimatedWeight = totalCubicFeet * 7; // Average 7 lbs per cubic foot

    // Determine truck size
    let truckSize: 'small' | 'medium' | 'large' | 'semi' = 'small';
    if (totalCubicFeet > PRICING.truckCapacity.large) truckSize = 'semi';
    else if (totalCubicFeet > PRICING.truckCapacity.medium) truckSize = 'large';
    else if (totalCubicFeet > PRICING.truckCapacity.small) truckSize = 'medium';

    // Calculate crew size
    const crewSize = Math.max(2, Math.ceil(totalCubicFeet / PRICING.cubicFeetPerMover));

    // Calculate hours
    const baseHours = totalCubicFeet * PRICING.hoursPerCubicFoot;
    const floorAdjustment =
      (formData.originFloor > 1 && !formData.originElevator ? 0.5 : 0) +
      (formData.destinationFloor > 1 && !formData.destinationElevator ? 0.5 : 0);
    const estimatedHours = Math.ceil(baseHours + floorAdjustment + formData.estimatedDistance / 60);

    // Calculate costs
    const laborRate = PRICING.laborRates[truckSize] * crewSize;
    const laborCost = laborRate * estimatedHours;
    const travelCost = formData.estimatedDistance * PRICING.travelRatePerMile;
    const packingCost = PRICING.packingRates[formData.packingLevel];
    const materialsCost = formData.packingLevel !== 'none' ? totalCubicFeet * PRICING.materialsCostPerCubicFoot : 0;
    const insuranceCost = Math.ceil(estimatedWeight * 7 / 1000) * PRICING.insuranceRatePerThousand;
    const subtotal = laborCost + travelCost + packingCost + materialsCost + insuranceCost;
    const fuelSurcharge = subtotal * PRICING.fuelSurchargePercent;
    const totalEstimate = subtotal + fuelSurcharge;
    const finalPrice = totalEstimate - formData.discount;

    return {
      totalCubicFeet,
      estimatedWeight,
      truckSize,
      crewSize,
      estimatedHours,
      laborRate,
      laborCost,
      travelCost,
      packingCost,
      materialsCost,
      insuranceCost,
      fuelSurcharge,
      totalEstimate,
      finalPrice,
    };
  }, [roomInventory, formData]);

  // Add room to inventory
  const addRoom = (roomName: string) => {
    const defaults = ROOM_DEFAULTS[roomName] || { items: 10, cubicFeet: 80 };
    const newRoomInventory: RoomInventory = {
      id: generateId(),
      room: roomName,
      items: defaults.items,
      estimatedCubicFeet: defaults.cubicFeet,
      fragileItems: 0,
      specialItems: [],
    };
    setRoomInventory([...roomInventory, newRoomInventory]);
    setNewRoom('');
  };

  // Update room inventory
  const updateRoom = (id: string, updates: Partial<RoomInventory>) => {
    setRoomInventory(roomInventory.map((room) => (room.id === id ? { ...room, ...updates } : room)));
  };

  // Remove room from inventory
  const removeRoom = (id: string) => {
    setRoomInventory(roomInventory.filter((room) => room.id !== id));
  };

  // Add special item
  const addSpecialItem = () => {
    if (specialItemInput.trim()) {
      setFormData({
        ...formData,
        specialItems: [...formData.specialItems, specialItemInput.trim()],
      });
      setSpecialItemInput('');
    }
  };

  // Remove special item
  const removeSpecialItem = (item: string) => {
    setFormData({
      ...formData,
      specialItems: formData.specialItems.filter((i) => i !== item),
    });
  };

  // Save estimate
  const saveEstimate = () => {
    if (!formData.customerName || !formData.originAddress || !formData.destinationAddress) {
      setValidationMessage('Please fill in required fields: Customer Name, Origin Address, and Destination Address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);

    const estimate: MoveEstimate = {
      id: editingEstimate?.id || generateId(),
      ...formData,
      roomInventory,
      totalCubicFeet: calculatedValues.totalCubicFeet,
      estimatedWeight: calculatedValues.estimatedWeight,
      crewSize: calculatedValues.crewSize,
      estimatedHours: calculatedValues.estimatedHours,
      truckSize: calculatedValues.truckSize,
      laborRate: calculatedValues.laborRate,
      travelRate: PRICING.travelRatePerMile,
      packingCost: calculatedValues.packingCost,
      materialsCost: calculatedValues.materialsCost,
      insuranceCost: calculatedValues.insuranceCost,
      fuelSurcharge: calculatedValues.fuelSurcharge,
      totalEstimate: calculatedValues.totalEstimate,
      finalPrice: calculatedValues.finalPrice,
      status: editingEstimate?.status || 'draft',
      validUntil: validUntilDate.toISOString(),
      createdAt: editingEstimate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingEstimate) {
      updateEstimate(editingEstimate.id, estimate);
    } else {
      addEstimate(estimate);
    }

    resetForm();
    setActiveTab('estimates');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      originAddress: '',
      originCity: '',
      originState: '',
      originZip: '',
      originType: 'house',
      originFloor: 1,
      originElevator: false,
      destinationAddress: '',
      destinationCity: '',
      destinationState: '',
      destinationZip: '',
      destinationType: 'house',
      destinationFloor: 1,
      destinationElevator: false,
      moveDate: '',
      moveTime: '08:00',
      estimatedDistance: 0,
      packingRequired: false,
      packingLevel: 'none',
      unpackingRequired: false,
      specialItems: [],
      discount: 0,
      notes: '',
    });
    setRoomInventory([]);
    setEditingEstimate(null);
    setShowEstimateForm(false);
  };

  // Edit estimate
  const editEstimateHandler = (estimate: MoveEstimate) => {
    setFormData({
      customerName: estimate.customerName,
      customerPhone: estimate.customerPhone,
      customerEmail: estimate.customerEmail,
      originAddress: estimate.originAddress,
      originCity: estimate.originCity,
      originState: estimate.originState,
      originZip: estimate.originZip,
      originType: estimate.originType,
      originFloor: estimate.originFloor,
      originElevator: estimate.originElevator,
      destinationAddress: estimate.destinationAddress,
      destinationCity: estimate.destinationCity,
      destinationState: estimate.destinationState,
      destinationZip: estimate.destinationZip,
      destinationType: estimate.destinationType,
      destinationFloor: estimate.destinationFloor,
      destinationElevator: estimate.destinationElevator,
      moveDate: estimate.moveDate,
      moveTime: estimate.moveTime,
      estimatedDistance: estimate.estimatedDistance,
      packingRequired: estimate.packingRequired,
      packingLevel: estimate.packingLevel,
      unpackingRequired: estimate.unpackingRequired,
      specialItems: estimate.specialItems,
      discount: estimate.discount,
      notes: estimate.notes,
    });
    setRoomInventory(estimate.roomInventory);
    setEditingEstimate(estimate);
    setActiveTab('calculator');
  };

  // Filter estimates
  const filteredEstimates = useMemo(() => {
    return estimates.filter((estimate) => {
      const matchesSearch =
        estimate.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.destinationCity.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || estimate.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [estimates, searchTerm, filterStatus]);

  // Export handlers
  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf' | 'clipboard' | 'print') => {
    const exportData = filteredEstimates.map((e) => ({
      ...e,
      originLocation: `${e.originCity}, ${e.originState}`,
      destinationLocation: `${e.destinationCity}, ${e.destinationState}`,
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, estimateColumns, 'move-estimates');
        break;
      case 'excel':
        exportToExcel(exportData, estimateColumns, 'move-estimates');
        break;
      case 'json':
        exportToJSON(exportData, 'move-estimates');
        break;
      case 'pdf':
        exportToPDF(exportData, estimateColumns, 'Move Estimates', 'move-estimates');
        break;
      case 'clipboard':
        await copyUtil(exportData, estimateColumns);
        break;
      case 'print':
        printData(exportData, estimateColumns, 'Move Estimates');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tools.moveEstimate.moveEstimateCalculator', 'Move Estimate Calculator')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.createAndManageMovingCost', 'Create and manage moving cost estimates')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="move-estimate" toolName="Move Estimate" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} error={syncError} onForceSync={forceSync} />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'calculator'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Calculator className="w-4 h-4 inline mr-2" />
          {t('tools.moveEstimate.calculator', 'Calculator')}
        </button>
        <button
          onClick={() => setActiveTab('estimates')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'estimates'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Saved Estimates ({estimates.length})
        </button>
      </div>

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t('tools.moveEstimate.customerInformation', 'Customer Information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.customerName', 'Customer Name *')}
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.moveEstimate.phone2', 'Phone')}
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder={t('tools.moveEstimate.email2', 'Email')}
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Origin Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  {t('tools.moveEstimate.originLocation', 'Origin Location')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder={t('tools.moveEstimate.streetAddress', 'Street Address *')}
                  value={formData.originAddress}
                  onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.city', 'City')}
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.state', 'State')}
                    value={formData.originState}
                    onChange={(e) => setFormData({ ...formData, originState: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.zip', 'ZIP')}
                    value={formData.originZip}
                    onChange={(e) => setFormData({ ...formData, originZip: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <select
                    value={formData.originType}
                    onChange={(e) => setFormData({ ...formData, originType: e.target.value as any })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="house">{t('tools.moveEstimate.house', 'House')}</option>
                    <option value="apartment">{t('tools.moveEstimate.apartment', 'Apartment')}</option>
                    <option value="condo">{t('tools.moveEstimate.condo', 'Condo')}</option>
                    <option value="office">{t('tools.moveEstimate.office', 'Office')}</option>
                    <option value="storage">{t('tools.moveEstimate.storage', 'Storage')}</option>
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.moveEstimate.floor', 'Floor')}
                    value={formData.originFloor}
                    onChange={(e) => setFormData({ ...formData, originFloor: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.originElevator}
                      onChange={(e) => setFormData({ ...formData, originElevator: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.moveEstimate.elevator', 'Elevator')}</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Destination Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {t('tools.moveEstimate.destinationLocation', 'Destination Location')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  placeholder={t('tools.moveEstimate.streetAddress2', 'Street Address *')}
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.city2', 'City')}
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.state2', 'State')}
                    value={formData.destinationState}
                    onChange={(e) => setFormData({ ...formData, destinationState: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('tools.moveEstimate.zip2', 'ZIP')}
                    value={formData.destinationZip}
                    onChange={(e) => setFormData({ ...formData, destinationZip: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <select
                    value={formData.destinationType}
                    onChange={(e) => setFormData({ ...formData, destinationType: e.target.value as any })}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="house">{t('tools.moveEstimate.house2', 'House')}</option>
                    <option value="apartment">{t('tools.moveEstimate.apartment2', 'Apartment')}</option>
                    <option value="condo">{t('tools.moveEstimate.condo2', 'Condo')}</option>
                    <option value="office">{t('tools.moveEstimate.office2', 'Office')}</option>
                    <option value="storage">{t('tools.moveEstimate.storage2', 'Storage')}</option>
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.moveEstimate.floor2', 'Floor')}
                    value={formData.destinationFloor}
                    onChange={(e) => setFormData({ ...formData, destinationFloor: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.destinationElevator}
                      onChange={(e) => setFormData({ ...formData, destinationElevator: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm dark:text-gray-300">{t('tools.moveEstimate.elevator2', 'Elevator')}</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.moveEstimate.estimatedDistanceMiles', 'Estimated Distance (miles)')}</label>
                  <input
                    type="number"
                    value={formData.estimatedDistance}
                    onChange={(e) => setFormData({ ...formData, estimatedDistance: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Room Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('tools.moveEstimate.roomInventory', 'Room Inventory')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('tools.moveEstimate.selectARoomToAdd', 'Select a room to add...')}</option>
                    {Object.keys(ROOM_DEFAULTS).map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => newRoom && addRoom(newRoom)}
                    disabled={!newRoom}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {roomInventory.length > 0 && (
                  <div className="space-y-3">
                    {roomInventory.map((room) => (
                      <div key={room.id} className="p-3 border rounded-lg dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium dark:text-white">{room.room}</span>
                          <button onClick={() => removeRoom(room.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.items', 'Items')}</label>
                            <input
                              type="number"
                              value={room.items}
                              onChange={(e) => updateRoom(room.id, { items: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.cubicFeet', 'Cubic Feet')}</label>
                            <input
                              type="number"
                              value={room.estimatedCubicFeet}
                              onChange={(e) => updateRoom(room.id, { estimatedCubicFeet: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.fragileItems', 'Fragile Items')}</label>
                            <input
                              type="number"
                              value={room.fragileItems}
                              onChange={(e) => updateRoom(room.id, { fragileItems: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Move Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t('tools.moveEstimate.moveDetails', 'Move Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.moveEstimate.moveDate', 'Move Date')}</label>
                    <input
                      type="date"
                      value={formData.moveDate}
                      onChange={(e) => setFormData({ ...formData, moveDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.moveEstimate.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={formData.moveTime}
                      onChange={(e) => setFormData({ ...formData, moveTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t('tools.moveEstimate.packingServices', 'Packing Services')}</label>
                  <div className="flex gap-4">
                    {(['none', 'partial', 'full'] as const).map((level) => (
                      <label key={level} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="packingLevel"
                          value={level}
                          checked={formData.packingLevel === level}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              packingLevel: e.target.value as any,
                              packingRequired: e.target.value !== 'none',
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm capitalize dark:text-gray-300">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.unpackingRequired}
                    onChange={(e) => setFormData({ ...formData, unpackingRequired: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm dark:text-gray-300">{t('tools.moveEstimate.includeUnpackingServices', 'Include Unpacking Services')}</span>
                </label>

                {/* Special Items */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t('tools.moveEstimate.specialItems', 'Special Items')}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={t('tools.moveEstimate.pianoHotTubSafeEtc', 'Piano, Hot Tub, Safe, etc.')}
                      value={specialItemInput}
                      onChange={(e) => setSpecialItemInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialItem()}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button onClick={addSpecialItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {t('tools.moveEstimate.add', 'Add')}
                    </button>
                  </div>
                  {formData.specialItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.specialItems.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-1">
                          {item}
                          <button onClick={() => removeSpecialItem(item)} className="text-red-500 hover:text-red-700">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.moveEstimate.notes', 'Notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder={t('tools.moveEstimate.additionalNotesAboutTheMove', 'Additional notes about the move...')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estimate Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('tools.moveEstimate.estimateSummary', 'Estimate Summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.totalCubicFeet', 'Total Cubic Feet:')}</span>
                    <span className="font-medium dark:text-white">{calculatedValues.totalCubicFeet} cu ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.estimatedWeight', 'Estimated Weight:')}</span>
                    <span className="font-medium dark:text-white">{calculatedValues.estimatedWeight.toLocaleString()} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.truckSize', 'Truck Size:')}</span>
                    <span className="font-medium capitalize dark:text-white">{calculatedValues.truckSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.crewSize', 'Crew Size:')}</span>
                    <span className="font-medium dark:text-white">{calculatedValues.crewSize} movers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.estimatedHours', 'Estimated Hours:')}</span>
                    <span className="font-medium dark:text-white">{calculatedValues.estimatedHours} hrs</span>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-600" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.laborCost', 'Labor Cost:')}</span>
                    <span className="dark:text-white">{formatCurrency(calculatedValues.laborCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.travelCost', 'Travel Cost:')}</span>
                    <span className="dark:text-white">{formatCurrency(calculatedValues.travelCost)}</span>
                  </div>
                  {calculatedValues.packingCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.packingService', 'Packing Service:')}</span>
                      <span className="dark:text-white">{formatCurrency(calculatedValues.packingCost)}</span>
                    </div>
                  )}
                  {calculatedValues.materialsCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.packingMaterials', 'Packing Materials:')}</span>
                      <span className="dark:text-white">{formatCurrency(calculatedValues.materialsCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.insurance', 'Insurance:')}</span>
                    <span className="dark:text-white">{formatCurrency(calculatedValues.insuranceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.fuelSurcharge', 'Fuel Surcharge:')}</span>
                    <span className="dark:text-white">{formatCurrency(calculatedValues.fuelSurcharge)}</span>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-600" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="dark:text-white">{t('tools.moveEstimate.totalEstimate', 'Total Estimate:')}</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(calculatedValues.totalEstimate)}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tools.moveEstimate.discount', 'Discount')}</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex justify-between text-xl font-bold">
                  <span className="dark:text-white">{t('tools.moveEstimate.finalPrice', 'Final Price:')}</span>
                  <span className="text-green-600 dark:text-green-400">{formatCurrency(calculatedValues.finalPrice)}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveEstimate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingEstimate ? t('tools.moveEstimate.updateEstimate', 'Update Estimate') : t('tools.moveEstimate.saveEstimate', 'Save Estimate')}
                  </button>
                  {editingEstimate && (
                    <button onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Estimates List Tab */}
      {activeTab === 'estimates' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={t('tools.moveEstimate.searchEstimates', 'Search estimates...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">{t('tools.moveEstimate.allStatus', 'All Status')}</option>
              <option value="draft">{t('tools.moveEstimate.draft', 'Draft')}</option>
              <option value="sent">{t('tools.moveEstimate.sent', 'Sent')}</option>
              <option value="accepted">{t('tools.moveEstimate.accepted', 'Accepted')}</option>
              <option value="declined">{t('tools.moveEstimate.declined', 'Declined')}</option>
              <option value="expired">{t('tools.moveEstimate.expired', 'Expired')}</option>
            </select>
          </div>

          {/* Estimates List */}
          {filteredEstimates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.noEstimatesFoundCreateYour', 'No estimates found. Create your first estimate using the calculator.')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEstimates.map((estimate) => (
                <Card key={estimate.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold dark:text-white">{estimate.customerName}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(estimate.status)}`}>{estimate.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {estimate.originCity}, {estimate.originState} → {estimate.destinationCity}, {estimate.destinationState}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {estimate.moveDate ? formatDate(estimate.moveDate) : 'Date TBD'} | {estimate.totalCubicFeet} cu ft |{' '}
                          {estimate.estimatedDistance} mi
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(estimate.finalPrice)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Created {formatDate(estimate.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => editEstimateHandler(estimate)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEstimate(estimate.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedEstimateId(expandedEstimateId === estimate.id ? null : estimate.id)}
                          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg dark:hover:bg-gray-700"
                        >
                          {expandedEstimateId === estimate.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {expandedEstimateId === estimate.id && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-600 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.crewSize2', 'Crew Size')}</p>
                          <p className="font-medium dark:text-white">{estimate.crewSize} movers</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.estHours', 'Est. Hours')}</p>
                          <p className="font-medium dark:text-white">{estimate.estimatedHours} hrs</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.truckSize2', 'Truck Size')}</p>
                          <p className="font-medium capitalize dark:text-white">{estimate.truckSize}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.packing', 'Packing')}</p>
                          <p className="font-medium capitalize dark:text-white">{estimate.packingLevel}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.phone', 'Phone')}</p>
                          <p className="font-medium dark:text-white">{estimate.customerPhone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.email', 'Email')}</p>
                          <p className="font-medium dark:text-white">{estimate.customerEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.validUntil', 'Valid Until')}</p>
                          <p className="font-medium dark:text-white">{formatDate(estimate.validUntil)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.weight', 'Weight')}</p>
                          <p className="font-medium dark:text-white">{estimate.estimatedWeight.toLocaleString()} lbs</p>
                        </div>
                        {estimate.notes && (
                          <div className="col-span-full">
                            <p className="text-gray-500 dark:text-gray-400">{t('tools.moveEstimate.notes2', 'Notes')}</p>
                            <p className="font-medium dark:text-white">{estimate.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default MoveEstimateTool;
