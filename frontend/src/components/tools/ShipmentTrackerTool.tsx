'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Package,
  Truck,
  MapPin,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertTriangle,
  Clock,
  Calendar,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  DollarSign,
  Filter,
  Activity,
  Settings,
  Box,
  Navigation,
  CheckCircle2,
  CircleDot,
  ArrowRight,
  FileText,
  BarChart3,
  Plane,
  Ship,
  Building2,
  RefreshCw,
  Download,
  Copy,
  Eye,
  Scale,
  Ruler,
  Loader2,
} from 'lucide-react';

// Types
interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl' | 'amazon' | 'ontrac' | 'lasership' | 'other';
  carrierName?: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'returned' | 'exception';
  origin: string;
  originCity: string;
  originState: string;
  originZip: string;
  originCountry: string;
  destination: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  destinationCountry: string;
  weight: number;
  weightUnit: 'lbs' | 'kg' | 'oz';
  length: number;
  width: number;
  height: number;
  dimensionUnit: 'in' | 'cm';
  serviceType: string;
  estimatedDelivery: string;
  actualDelivery: string | null;
  shippingCost: number;
  insuranceValue: number;
  signatureRequired: boolean;
  contents: string;
  reference: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  notes: string;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

interface Carrier {
  id: string;
  code: string;
  name: string;
  trackingUrl: string;
  logo: string;
  isActive: boolean;
  accountNumber: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
}

type TabType = 'shipments' | 'tracking' | 'carriers' | 'reports';

const CARRIERS: { value: Shipment['carrier']; label: string; trackingUrl: string }[] = [
  { value: 'fedex', label: 'FedEx', trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=' },
  { value: 'ups', label: 'UPS', trackingUrl: 'https://www.ups.com/track?tracknum=' },
  { value: 'usps', label: 'USPS', trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' },
  { value: 'dhl', label: 'DHL', trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=' },
  { value: 'amazon', label: 'Amazon Logistics', trackingUrl: 'https://track.amazon.com/tracking/' },
  { value: 'ontrac', label: 'OnTrac', trackingUrl: 'https://www.ontrac.com/tracking.asp?tracking_number=' },
  { value: 'lasership', label: 'LaserShip', trackingUrl: 'https://www.lasership.com/track/' },
  { value: 'other', label: 'Other', trackingUrl: '' },
];

const SHIPMENT_STATUSES: { value: Shipment['status']; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'picked-up', label: 'Picked Up', color: 'blue' },
  { value: 'in-transit', label: 'In Transit', color: 'yellow' },
  { value: 'out-for-delivery', label: 'Out for Delivery', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'returned', label: 'Returned', color: 'orange' },
  { value: 'exception', label: 'Exception', color: 'red' },
];

const SERVICE_TYPES = [
  'Ground',
  'Express',
  'Overnight',
  '2-Day',
  '3-Day',
  'Economy',
  'Priority',
  'Standard',
  'Freight',
  'International',
];

const WEIGHT_UNITS = [
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'oz', label: 'Ounces (oz)' },
];

const DIMENSION_UNITS = [
  { value: 'in', label: 'Inches (in)' },
  { value: 'cm', label: 'Centimeters (cm)' },
];

// Column configuration for exports
const SHIPMENT_COLUMNS: ColumnConfig[] = [
  { key: 'trackingNumber', header: 'Tracking Number', type: 'string' },
  { key: 'carrier', header: 'Carrier', type: 'string', format: (value) => CARRIERS.find(c => c.value === value)?.label || value },
  { key: 'status', header: 'Status', type: 'string', format: (value) => SHIPMENT_STATUSES.find(s => s.value === value)?.label || value },
  { key: 'origin', header: 'Origin Address', type: 'string' },
  { key: 'originCity', header: 'Origin City', type: 'string' },
  { key: 'originState', header: 'Origin State', type: 'string' },
  { key: 'destination', header: 'Destination Address', type: 'string' },
  { key: 'destinationCity', header: 'Destination City', type: 'string' },
  { key: 'destinationState', header: 'Destination State', type: 'string' },
  { key: 'recipientName', header: 'Recipient', type: 'string' },
  { key: 'recipientPhone', header: 'Recipient Phone', type: 'string' },
  { key: 'recipientEmail', header: 'Recipient Email', type: 'string' },
  { key: 'weight', header: 'Weight', type: 'number' },
  { key: 'weightUnit', header: 'Weight Unit', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'shippingCost', header: 'Shipping Cost', type: 'currency' },
  { key: 'insuranceValue', header: 'Insurance Value', type: 'currency' },
  { key: 'estimatedDelivery', header: 'Estimated Delivery', type: 'date' },
  { key: 'actualDelivery', header: 'Actual Delivery', type: 'date' },
  { key: 'reference', header: 'Reference', type: 'string' },
  { key: 'contents', header: 'Contents', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

// Column configuration for carriers
const CARRIER_COLUMNS: ColumnConfig[] = [
  { key: 'code', header: 'Code', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'trackingUrl', header: 'Tracking URL', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
  { key: 'accountNumber', header: 'Account Number', type: 'string' },
  { key: 'contactPhone', header: 'Contact Phone', type: 'string' },
  { key: 'contactEmail', header: 'Contact Email', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Sample data generator
const generateSampleData = () => {
  const sampleShipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: '794644790138',
      carrier: 'fedex',
      status: 'in-transit',
      origin: '123 Warehouse St',
      originCity: 'Los Angeles',
      originState: 'CA',
      originZip: '90001',
      originCountry: 'USA',
      destination: '456 Customer Ave',
      destinationCity: 'New York',
      destinationState: 'NY',
      destinationZip: '10001',
      destinationCountry: 'USA',
      weight: 5.5,
      weightUnit: 'lbs',
      length: 12,
      width: 8,
      height: 6,
      dimensionUnit: 'in',
      serviceType: 'Ground',
      estimatedDelivery: '2025-01-03',
      actualDelivery: null,
      shippingCost: 15.99,
      insuranceValue: 100,
      signatureRequired: false,
      contents: 'Electronics - Wireless Mouse',
      reference: 'ORD-2024-001234',
      senderName: 'ABC Warehouse',
      recipientName: 'John Smith',
      recipientPhone: '+1 (555) 123-4567',
      recipientEmail: 'john.smith@email.com',
      notes: 'Handle with care',
      trackingEvents: [
        {
          id: '1',
          timestamp: '2024-12-28T08:30:00Z',
          location: 'Los Angeles, CA',
          status: 'Picked up',
          description: 'Shipment picked up from sender',
        },
        {
          id: '2',
          timestamp: '2024-12-28T14:45:00Z',
          location: 'Los Angeles, CA',
          status: 'In transit',
          description: 'Departed FedEx location',
        },
        {
          id: '3',
          timestamp: '2024-12-29T06:20:00Z',
          location: 'Phoenix, AZ',
          status: 'In transit',
          description: 'Arrived at FedEx location',
        },
        {
          id: '4',
          timestamp: '2024-12-29T18:10:00Z',
          location: 'Dallas, TX',
          status: 'In transit',
          description: 'In transit to destination',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'ups',
      status: 'delivered',
      origin: '789 Distribution Center',
      originCity: 'Chicago',
      originState: 'IL',
      originZip: '60601',
      originCountry: 'USA',
      destination: '321 Home Street',
      destinationCity: 'Miami',
      destinationState: 'FL',
      destinationZip: '33101',
      destinationCountry: 'USA',
      weight: 2.3,
      weightUnit: 'lbs',
      length: 10,
      width: 6,
      height: 4,
      dimensionUnit: 'in',
      serviceType: '2-Day',
      estimatedDelivery: '2024-12-27',
      actualDelivery: '2024-12-27',
      shippingCost: 24.99,
      insuranceValue: 250,
      signatureRequired: true,
      contents: 'Clothing - Winter Jacket',
      reference: 'ORD-2024-001230',
      senderName: 'Fashion Hub',
      recipientName: 'Sarah Johnson',
      recipientPhone: '+1 (555) 987-6543',
      recipientEmail: 'sarah.j@email.com',
      notes: '',
      trackingEvents: [
        {
          id: '1',
          timestamp: '2024-12-25T10:00:00Z',
          location: 'Chicago, IL',
          status: 'Picked up',
          description: 'Shipment picked up',
        },
        {
          id: '2',
          timestamp: '2024-12-26T08:30:00Z',
          location: 'Atlanta, GA',
          status: 'In transit',
          description: 'Package at sorting facility',
        },
        {
          id: '3',
          timestamp: '2024-12-27T06:15:00Z',
          location: 'Miami, FL',
          status: 'Out for delivery',
          description: 'Out for delivery',
        },
        {
          id: '4',
          timestamp: '2024-12-27T14:22:00Z',
          location: 'Miami, FL',
          status: 'Delivered',
          description: 'Delivered - Signed by: S. Johnson',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      trackingNumber: '9400111899223456789012',
      carrier: 'usps',
      status: 'out-for-delivery',
      origin: '555 Small Business Rd',
      originCity: 'Seattle',
      originState: 'WA',
      originZip: '98101',
      originCountry: 'USA',
      destination: '888 Apartment Complex',
      destinationCity: 'Portland',
      destinationState: 'OR',
      destinationZip: '97201',
      destinationCountry: 'USA',
      weight: 0.8,
      weightUnit: 'lbs',
      length: 8,
      width: 5,
      height: 2,
      dimensionUnit: 'in',
      serviceType: 'Priority',
      estimatedDelivery: '2024-12-30',
      actualDelivery: null,
      shippingCost: 8.75,
      insuranceValue: 50,
      signatureRequired: false,
      contents: 'Books - Paperback Novel',
      reference: 'ORD-2024-001235',
      senderName: 'Book Haven',
      recipientName: 'Mike Chen',
      recipientPhone: '+1 (555) 456-7890',
      recipientEmail: 'mike.chen@email.com',
      notes: 'Leave at front door if not home',
      trackingEvents: [
        {
          id: '1',
          timestamp: '2024-12-28T16:00:00Z',
          location: 'Seattle, WA',
          status: 'Accepted',
          description: 'USPS in possession of item',
        },
        {
          id: '2',
          timestamp: '2024-12-29T05:30:00Z',
          location: 'Seattle, WA',
          status: 'In transit',
          description: 'Departed post office',
        },
        {
          id: '3',
          timestamp: '2024-12-30T07:45:00Z',
          location: 'Portland, OR',
          status: 'Out for delivery',
          description: 'Out for delivery',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleCarriers: Carrier[] = [
    {
      id: '1',
      code: 'fedex',
      name: 'FedEx',
      trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=',
      logo: 'fedex',
      isActive: true,
      accountNumber: 'FDX-123456789',
      contactPhone: '1-800-463-3339',
      contactEmail: 'support@fedex.com',
      notes: 'Primary carrier for ground shipments',
    },
    {
      id: '2',
      code: 'ups',
      name: 'UPS',
      trackingUrl: 'https://www.ups.com/track?tracknum=',
      logo: 'ups',
      isActive: true,
      accountNumber: 'UPS-987654321',
      contactPhone: '1-800-742-5877',
      contactEmail: 'support@ups.com',
      notes: 'Preferred for 2-day shipping',
    },
    {
      id: '3',
      code: 'usps',
      name: 'USPS',
      trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
      logo: 'usps',
      isActive: true,
      accountNumber: '',
      contactPhone: '1-800-275-8777',
      contactEmail: '',
      notes: 'Best for lightweight packages',
    },
    {
      id: '4',
      code: 'dhl',
      name: 'DHL',
      trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
      logo: 'dhl',
      isActive: true,
      accountNumber: 'DHL-555555555',
      contactPhone: '1-800-225-5345',
      contactEmail: 'support@dhl.com',
      notes: 'International shipments',
    },
  ];

  return {
    shipments: sampleShipments,
    carriers: sampleCarriers,
  };
};

interface ShipmentTrackerToolProps {
  uiConfig?: UIConfig;
}

export const ShipmentTrackerTool: React.FC<ShipmentTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('shipments');

  // Use the useToolData hook for backend persistence - Shipments
  const {
    data: shipments,
    setData: setShipments,
    addItem: addShipment,
    updateItem: updateShipment,
    deleteItem: deleteShipmentItem,
    exportCSV: exportShipmentsCSV,
    exportExcel: exportShipmentsExcel,
    exportJSON: exportShipmentsJSON,
    exportPDF: exportShipmentsPDF,
    importCSV: importShipmentsCSV,
    importJSON: importShipmentsJSON,
    copyToClipboard: copyShipmentsToClipboard,
    print: printShipments,
    isLoading: isLoadingShipments,
    isSaving: isSavingShipments,
    isSynced: isShipmentsSynced,
    lastSaved: shipmentsLastSaved,
    syncError: shipmentsSyncError,
    forceSync: forceSyncShipments,
  } = useToolData<Shipment>('shipment-tracker', [], SHIPMENT_COLUMNS);

  // Use the useToolData hook for backend persistence - Carriers
  const {
    data: carriers,
    setData: setCarriers,
    addItem: addCarrier,
    updateItem: updateCarrier,
    deleteItem: deleteCarrierItem,
    isLoading: isLoadingCarriers,
    isSaving: isSavingCarriers,
    isSynced: isCarriersSynced,
  } = useToolData<Carrier>('shipment-tracker-carriers', [], CARRIER_COLUMNS);

  const isLoading = isLoadingShipments || isLoadingCarriers;

  // Form states
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [showCarrierForm, setShowCarrierForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrier, setFilterCarrier] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);

  // Quick tracking
  const [quickTrackNumber, setQuickTrackNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<Shipment | null>(null);

  // Shipment form
  const [shipmentForm, setShipmentForm] = useState({
    trackingNumber: '',
    carrier: 'fedex' as Shipment['carrier'],
    carrierName: '',
    status: 'pending' as Shipment['status'],
    origin: '',
    originCity: '',
    originState: '',
    originZip: '',
    originCountry: 'USA',
    destination: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    destinationCountry: 'USA',
    weight: 0,
    weightUnit: 'lbs' as Shipment['weightUnit'],
    length: 0,
    width: 0,
    height: 0,
    dimensionUnit: 'in' as Shipment['dimensionUnit'],
    serviceType: 'Ground',
    estimatedDelivery: '',
    actualDelivery: '' as string | null,
    shippingCost: 0,
    insuranceValue: 0,
    signatureRequired: false,
    contents: '',
    reference: '',
    senderName: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    notes: '',
  });

  // Carrier form
  const [carrierForm, setCarrierForm] = useState({
    code: '',
    name: '',
    trackingUrl: '',
    logo: '',
    isActive: true,
    accountNumber: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.description) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Generate sample data
  const handleGenerateSampleData = () => {
    const sample = generateSampleData();
    setShipments(sample.shipments);
    setCarriers(sample.carriers);
  };

  // Shipment CRUD operations
  const handleSaveShipment = () => {
    if (!shipmentForm.trackingNumber.trim()) return;

    const now = new Date().toISOString();

    if (editingShipment) {
      updateShipment(editingShipment.id, {
        ...shipmentForm,
        actualDelivery: shipmentForm.actualDelivery || null,
        updatedAt: now
      });
    } else {
      const newShipment: Shipment = {
        id: Date.now().toString(),
        ...shipmentForm,
        actualDelivery: shipmentForm.actualDelivery || null,
        trackingEvents: [{
          id: '1',
          timestamp: now,
          location: `${shipmentForm.originCity}, ${shipmentForm.originState}`,
          status: 'Label Created',
          description: 'Shipping label created',
        }],
        createdAt: now,
        updatedAt: now,
      };
      setShipments(prev => [...prev, newShipment]);
    }

    resetShipmentForm();
  };

  const handleEditShipment = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setShipmentForm({
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      carrierName: shipment.carrierName || '',
      status: shipment.status,
      origin: shipment.origin,
      originCity: shipment.originCity,
      originState: shipment.originState,
      originZip: shipment.originZip,
      originCountry: shipment.originCountry,
      destination: shipment.destination,
      destinationCity: shipment.destinationCity,
      destinationState: shipment.destinationState,
      destinationZip: shipment.destinationZip,
      destinationCountry: shipment.destinationCountry,
      weight: shipment.weight,
      weightUnit: shipment.weightUnit,
      length: shipment.length,
      width: shipment.width,
      height: shipment.height,
      dimensionUnit: shipment.dimensionUnit,
      serviceType: shipment.serviceType,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery || '',
      shippingCost: shipment.shippingCost,
      insuranceValue: shipment.insuranceValue,
      signatureRequired: shipment.signatureRequired,
      contents: shipment.contents,
      reference: shipment.reference,
      senderName: shipment.senderName,
      recipientName: shipment.recipientName,
      recipientPhone: shipment.recipientPhone,
      recipientEmail: shipment.recipientEmail,
      notes: shipment.notes,
    });
    setShowShipmentForm(true);
  };

  const handleDeleteShipment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this shipment?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setShipments(prev => prev.filter(s => s.id !== id));
  };

  const resetShipmentForm = () => {
    setShowShipmentForm(false);
    setEditingShipment(null);
    setShipmentForm({
      trackingNumber: '',
      carrier: 'fedex',
      carrierName: '',
      status: 'pending',
      origin: '',
      originCity: '',
      originState: '',
      originZip: '',
      originCountry: 'USA',
      destination: '',
      destinationCity: '',
      destinationState: '',
      destinationZip: '',
      destinationCountry: 'USA',
      weight: 0,
      weightUnit: 'lbs',
      length: 0,
      width: 0,
      height: 0,
      dimensionUnit: 'in',
      serviceType: 'Ground',
      estimatedDelivery: '',
      actualDelivery: '',
      shippingCost: 0,
      insuranceValue: 0,
      signatureRequired: false,
      contents: '',
      reference: '',
      senderName: '',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      notes: '',
    });
  };

  // Carrier CRUD operations
  const handleSaveCarrier = () => {
    if (!carrierForm.code.trim() || !carrierForm.name.trim()) return;

    if (editingCarrier) {
      setCarriers(prev => prev.map(c =>
        c.id === editingCarrier.id
          ? { ...c, ...carrierForm }
          : c
      ));
    } else {
      const newCarrier: Carrier = {
        id: Date.now().toString(),
        ...carrierForm,
      };
      setCarriers(prev => [...prev, newCarrier]);
    }

    resetCarrierForm();
  };

  const handleEditCarrier = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setCarrierForm({
      code: carrier.code,
      name: carrier.name,
      trackingUrl: carrier.trackingUrl,
      logo: carrier.logo,
      isActive: carrier.isActive,
      accountNumber: carrier.accountNumber,
      contactPhone: carrier.contactPhone,
      contactEmail: carrier.contactEmail,
      notes: carrier.notes,
    });
    setShowCarrierForm(true);
  };

  const handleDeleteCarrier = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this carrier?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setCarriers(prev => prev.filter(c => c.id !== id));
  };

  const resetCarrierForm = () => {
    setShowCarrierForm(false);
    setEditingCarrier(null);
    setCarrierForm({
      code: '',
      name: '',
      trackingUrl: '',
      logo: '',
      isActive: true,
      accountNumber: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
    });
  };

  // Quick track
  const handleQuickTrack = () => {
    if (!quickTrackNumber.trim()) return;

    const found = shipments.find(s =>
      s.trackingNumber.toLowerCase() === quickTrackNumber.toLowerCase()
    );

    setTrackingResult(found || null);
    if (!found) {
      setValidationMessage('Shipment not found. Please check the tracking number.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
  };

  // Add tracking event
  const handleAddTrackingEvent = (shipmentId: string) => {
    const location = prompt('Enter location:');
    const status = prompt('Enter status:');
    const description = prompt('Enter description:');

    if (location && status && description) {
      setShipments(prev => prev.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            trackingEvents: [
              ...s.trackingEvents,
              {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                location,
                status,
                description,
              }
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      }));
    }
  };

  // Copy tracking number
  const handleCopyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
  };

  // Open carrier tracking page
  const handleOpenCarrierTracking = (shipment: Shipment) => {
    const carrier = CARRIERS.find(c => c.value === shipment.carrier);
    if (carrier && carrier.trackingUrl) {
      window.open(carrier.trackingUrl + shipment.trackingNumber, '_blank');
    }
  };

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const matchesSearch = searchTerm === '' ||
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destinationCity.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCarrier = filterCarrier === '' || shipment.carrier === filterCarrier;
      const matchesStatus = filterStatus === '' || shipment.status === filterStatus;

      const matchesDateFrom = filterDateFrom === '' ||
        new Date(shipment.createdAt) >= new Date(filterDateFrom);
      const matchesDateTo = filterDateTo === '' ||
        new Date(shipment.createdAt) <= new Date(filterDateTo + 'T23:59:59');

      return matchesSearch && matchesCarrier && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [shipments, searchTerm, filterCarrier, filterStatus, filterDateFrom, filterDateTo]);

  // Statistics
  const stats = useMemo(() => {
    const totalShipments = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const exceptions = shipments.filter(s => s.status === 'exception').length;
    const totalCost = shipments.reduce((sum, s) => sum + s.shippingCost, 0);
    const avgCost = totalShipments > 0 ? totalCost / totalShipments : 0;

    const carrierBreakdown: Record<string, number> = {};
    shipments.forEach(s => {
      carrierBreakdown[s.carrier] = (carrierBreakdown[s.carrier] || 0) + 1;
    });

    return {
      totalShipments,
      inTransit,
      delivered,
      pending,
      exceptions,
      totalCost,
      avgCost,
      carrierBreakdown,
      deliveryRate: totalShipments > 0 ? (delivered / totalShipments) * 100 : 0,
    };
  }, [shipments]);

  // Column configuration for export
  const shipmentColumns: ColumnConfig[] = [
    { key: 'trackingNumber', header: 'Tracking Number', type: 'string' },
    { key: 'carrier', header: 'Carrier', type: 'string', format: (value) => CARRIERS.find(c => c.value === value)?.label || value },
    { key: 'status', header: 'Status', type: 'string', format: (value) => SHIPMENT_STATUSES.find(s => s.value === value)?.label || value },
    { key: 'origin', header: 'Origin Address', type: 'string' },
    { key: 'originCity', header: 'Origin City', type: 'string' },
    { key: 'originState', header: 'Origin State', type: 'string' },
    { key: 'destination', header: 'Destination Address', type: 'string' },
    { key: 'destinationCity', header: 'Destination City', type: 'string' },
    { key: 'destinationState', header: 'Destination State', type: 'string' },
    { key: 'recipientName', header: 'Recipient', type: 'string' },
    { key: 'recipientPhone', header: 'Recipient Phone', type: 'string' },
    { key: 'recipientEmail', header: 'Recipient Email', type: 'string' },
    { key: 'weight', header: 'Weight', type: 'number' },
    { key: 'weightUnit', header: 'Weight Unit', type: 'string' },
    { key: 'serviceType', header: 'Service Type', type: 'string' },
    { key: 'shippingCost', header: 'Shipping Cost', type: 'currency' },
    { key: 'insuranceValue', header: 'Insurance Value', type: 'currency' },
    { key: 'estimatedDelivery', header: 'Estimated Delivery', type: 'date' },
    { key: 'actualDelivery', header: 'Actual Delivery', type: 'date' },
    { key: 'reference', header: 'Reference', type: 'string' },
    { key: 'contents', header: 'Contents', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
  ];

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(filteredShipments, shipmentColumns, { filename: 'shipments' });
  };

  const handleExportExcel = () => {
    exportToExcel(filteredShipments, shipmentColumns, { filename: 'shipments' });
  };

  const handleExportJSON = () => {
    exportToJSON(filteredShipments, { filename: 'shipments' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(filteredShipments, shipmentColumns, {
      filename: 'shipments',
      title: 'Shipment Report',
      subtitle: `${filteredShipments.length} shipments`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    printData(filteredShipments, shipmentColumns, { title: 'Shipment Report' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(filteredShipments, shipmentColumns);
  };

  // Get status color
  const getStatusColor = (status: Shipment['status']) => {
    const statusInfo = SHIPMENT_STATUSES.find(s => s.value === status);
    return statusInfo?.color || 'gray';
  };

  // Get carrier icon
  const getCarrierIcon = (carrier: Shipment['carrier']) => {
    switch (carrier) {
      case 'fedex':
      case 'ups':
      case 'dhl':
        return <Truck className="w-4 h-4" />;
      case 'usps':
        return <Building2 className="w-4 h-4" />;
      case 'amazon':
        return <Package className="w-4 h-4" />;
      default:
        return <Box className="w-4 h-4" />;
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'shipments' as TabType, label: 'Shipments', icon: Package, count: shipments.length },
    { id: 'tracking' as TabType, label: 'Tracking', icon: Navigation },
    { id: 'carriers' as TabType, label: 'Carriers', icon: Truck, count: carriers.length },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className={`min-h-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-7 h-7 text-teal-500" />
              Shipment Tracker
              {isPrefilled && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.shipmentTracker.prefilled', 'Prefilled')}
                </span>
              )}
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.shipmentTracker.trackAndManageAllYour', 'Track and manage all your shipments in one place')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {shipments.length === 0 && (
              <button
                onClick={handleGenerateSampleData}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {t('tools.shipmentTracker.loadSampleData', 'Load Sample Data')}
              </button>
            )}
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              disabled={filteredShipments.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2">
              <Package className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.shipmentTracker.total', 'Total')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalShipments}
            </p>
          </div>

          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
            <div className="flex items-center gap-2">
              <Truck className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.shipmentTracker.inTransit', 'In Transit')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.inTransit}
            </p>
          </div>

          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.shipmentTracker.delivered', 'Delivered')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.delivered}
            </p>
          </div>

          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.shipmentTracker.exceptions', 'Exceptions')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.exceptions}
            </p>
          </div>

          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-teal-50'}`}>
            <div className="flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.shipmentTracker.totalCost', 'Total Cost')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20'
                    : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.shipmentTracker.searchByTrackingRecipientReference', 'Search by tracking #, recipient, reference, or city...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <select
                  value={filterCarrier}
                  onChange={(e) => setFilterCarrier(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.shipmentTracker.allCarriers', 'All Carriers')}</option>
                  {CARRIERS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.shipmentTracker.allStatuses', 'All Statuses')}</option>
                  {SHIPMENT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowShipmentForm(true)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.shipmentTracker.addShipment', 'Add Shipment')}
                </button>
              </div>

              <div className="flex gap-3 mt-3">
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shipmentTracker.fromDate', 'From Date')}</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className={`block w-full mt-1 px-3 py-1.5 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shipmentTracker.toDate', 'To Date')}</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className={`block w-full mt-1 px-3 py-1.5 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                {(filterDateFrom || filterDateTo) && (
                  <button
                    onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); }}
                    className={`self-end px-3 py-1.5 rounded-lg text-sm ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.shipmentTracker.clearDates', 'Clear Dates')}
                  </button>
                )}
              </div>
            </div>

            {/* Shipment Form Modal */}
            {showShipmentForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`sticky top-0 p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {editingShipment ? t('tools.shipmentTracker.editShipment', 'Edit Shipment') : t('tools.shipmentTracker.newShipment', 'New Shipment')}
                      </h2>
                      <button onClick={resetShipmentForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.shipmentTracker.basicInformation', 'Basic Information')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.trackingNumber', 'Tracking Number *')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.trackingNumber}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder={t('tools.shipmentTracker.enterTrackingNumber', 'Enter tracking number')}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.carrier', 'Carrier *')}
                          </label>
                          <select
                            value={shipmentForm.carrier}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, carrier: e.target.value as Shipment['carrier'] }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {CARRIERS.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.status', 'Status')}
                          </label>
                          <select
                            value={shipmentForm.status}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, status: e.target.value as Shipment['status'] }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {SHIPMENT_STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.serviceType', 'Service Type')}
                          </label>
                          <select
                            value={shipmentForm.serviceType}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, serviceType: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {SERVICE_TYPES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.reference', 'Reference')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.reference}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, reference: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder={t('tools.shipmentTracker.orderOrReference', 'Order # or reference')}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.contents', 'Contents')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.contents}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, contents: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder={t('tools.shipmentTracker.packageContents', 'Package contents')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Origin Address */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.shipmentTracker.originAddress', 'Origin Address')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.senderName', 'Sender Name')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.senderName}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, senderName: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.streetAddress', 'Street Address')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.origin}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, origin: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.city', 'City')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.originCity}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, originCity: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.shipmentTracker.state', 'State')}
                            </label>
                            <input
                              type="text"
                              value={shipmentForm.originState}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, originState: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.shipmentTracker.zip', 'ZIP')}
                            </label>
                            <input
                              type="text"
                              value={shipmentForm.originZip}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, originZip: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Destination Address */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.shipmentTracker.destinationAddress', 'Destination Address')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.recipientName', 'Recipient Name')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.recipientName}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, recipientName: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.shipmentTracker.phone', 'Phone')}
                            </label>
                            <input
                              type="tel"
                              value={shipmentForm.recipientPhone}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, recipientPhone: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.shipmentTracker.email', 'Email')}
                            </label>
                            <input
                              type="email"
                              value={shipmentForm.recipientEmail}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.streetAddress2', 'Street Address')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.destination}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, destination: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.city2', 'City')}
                          </label>
                          <input
                            type="text"
                            value={shipmentForm.destinationCity}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, destinationCity: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.shipmentTracker.state2', 'State')}
                            </label>
                            <input
                              type="text"
                              value={shipmentForm.destinationState}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, destinationState: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.shipmentTracker.zip2', 'ZIP')}
                            </label>
                            <input
                              type="text"
                              value={shipmentForm.destinationZip}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, destinationZip: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.shipmentTracker.packageDetails', 'Package Details')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.weight', 'Weight')}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={shipmentForm.weight}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                              className={`flex-1 px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                            <select
                              value={shipmentForm.weightUnit}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, weightUnit: e.target.value as Shipment['weightUnit'] }))}
                              className={`w-20 px-2 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {WEIGHT_UNITS.map(u => (
                                <option key={u.value} value={u.value}>{u.value}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.length', 'Length')}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={shipmentForm.length}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.width', 'Width')}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={shipmentForm.width}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.height', 'Height')}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={shipmentForm.height}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                              className={`flex-1 px-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                            <select
                              value={shipmentForm.dimensionUnit}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, dimensionUnit: e.target.value as Shipment['dimensionUnit'] }))}
                              className={`w-16 px-2 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {DIMENSION_UNITS.map(u => (
                                <option key={u.value} value={u.value}>{u.value}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost and Delivery */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.shipmentTracker.costDelivery', 'Cost & Delivery')}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.shippingCost', 'Shipping Cost')}
                          </label>
                          <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={shipmentForm.shippingCost}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                              className={`w-full pl-7 pr-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.insuranceValue', 'Insurance Value')}
                          </label>
                          <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={shipmentForm.insuranceValue}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, insuranceValue: parseFloat(e.target.value) || 0 }))}
                              className={`w-full pl-7 pr-3 py-2 rounded-lg border ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.shipmentTracker.estDelivery', 'Est. Delivery')}
                          </label>
                          <input
                            type="date"
                            value={shipmentForm.estimatedDelivery}
                            onChange={(e) => setShipmentForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={shipmentForm.signatureRequired}
                              onChange={(e) => setShipmentForm(prev => ({ ...prev, signatureRequired: e.target.checked }))}
                              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.shipmentTracker.signatureRequired2', 'Signature Required')}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.shipmentTracker.notes', 'Notes')}
                      </label>
                      <textarea
                        value={shipmentForm.notes}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.shipmentTracker.additionalNotes', 'Additional notes...')}
                      />
                    </div>
                  </div>

                  <div className={`sticky bottom-0 p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={resetShipmentForm}
                        className={`px-4 py-2 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t('tools.shipmentTracker.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={handleSaveShipment}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {editingShipment ? t('tools.shipmentTracker.updateShipment', 'Update Shipment') : t('tools.shipmentTracker.createShipment', 'Create Shipment')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipment List */}
            <div className="space-y-3">
              {filteredShipments.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Package className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.shipmentTracker.noShipmentsFoundAddYour', 'No shipments found. Add your first shipment to get started!')}
                  </p>
                </div>
              ) : (
                filteredShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                  >
                    {/* Shipment Header */}
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            shipment.status === 'delivered'
                              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                              : shipment.status === 'in-transit'
                              ? isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                              : shipment.status === 'exception'
                              ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                              : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getCarrierIcon(shipment.carrier)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {shipment.trackingNumber}
                              </span>
                              <button
                                onClick={() => handleCopyTrackingNumber(shipment.trackingNumber)}
                                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
                                title={t('tools.shipmentTracker.copyTrackingNumber', 'Copy tracking number')}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                shipment.status === 'delivered'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                  : shipment.status === 'in-transit'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                  : shipment.status === 'out-for-delivery'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                  : shipment.status === 'exception'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {SHIPMENT_STATUSES.find(s => s.value === shipment.status)?.label}
                              </span>
                            </div>

                            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="font-medium">{CARRIERS.find(c => c.value === shipment.carrier)?.label}</span>
                              {' - '}
                              {shipment.serviceType}
                              {shipment.reference && (
                                <span className="ml-2">
                                  Ref: {shipment.reference}
                                </span>
                              )}
                            </div>

                            <div className={`flex items-center gap-2 text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{shipment.originCity}, {shipment.originState}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>{shipment.destinationCity}, {shipment.destinationState}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCarrierTracking(shipment)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            title={t('tools.shipmentTracker.trackOnCarrierWebsite2', 'Track on carrier website')}
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpandedShipment(expandedShipment === shipment.id ? null : shipment.id)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            {expandedShipment === shipment.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditShipment(shipment)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteShipment(shipment.id)}
                            className={`p-2 rounded-lg text-red-500 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedShipment === shipment.id && (
                      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Shipment Details */}
                          <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.shipmentTracker.packageDetails2', 'Package Details')}
                            </h4>
                            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-2">
                                <Scale className="w-4 h-4" />
                                <span>Weight: {shipment.weight} {shipment.weightUnit}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4" />
                                <span>Dimensions: {shipment.length} x {shipment.width} x {shipment.height} {shipment.dimensionUnit}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Shipping Cost: ${shipment.shippingCost.toFixed(2)}</span>
                              </div>
                              {shipment.insuranceValue > 0 && (
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  <span>Insured Value: ${shipment.insuranceValue.toFixed(2)}</span>
                                </div>
                              )}
                              {shipment.contents && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span>Contents: {shipment.contents}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Recipient Info */}
                          <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.shipmentTracker.recipient', 'Recipient')}
                            </h4>
                            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p className="font-medium">{shipment.recipientName}</p>
                              <p>{shipment.destination}</p>
                              <p>{shipment.destinationCity}, {shipment.destinationState} {shipment.destinationZip}</p>
                              {shipment.recipientPhone && <p>{shipment.recipientPhone}</p>}
                              {shipment.recipientEmail && <p>{shipment.recipientEmail}</p>}
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.shipmentTracker.deliveryInformation', 'Delivery Information')}
                            </h4>
                            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Est. Delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                              </div>
                              {shipment.actualDelivery && (
                                <div className="flex items-center gap-2 text-green-500">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Delivered: {new Date(shipment.actualDelivery).toLocaleDateString()}</span>
                                </div>
                              )}
                              {shipment.signatureRequired && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span>{t('tools.shipmentTracker.signatureRequired', 'Signature Required')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tracking Timeline */}
                        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.shipmentTracker.trackingHistory', 'Tracking History')}
                            </h4>
                            <button
                              onClick={() => handleAddTrackingEvent(shipment.id)}
                              className={`text-xs px-2 py-1 rounded ${
                                isDark
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {t('tools.shipmentTracker.addEvent', '+ Add Event')}
                            </button>
                          </div>

                          <div className="space-y-3">
                            {shipment.trackingEvents.slice().reverse().map((event, index) => (
                              <div key={event.id} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3 h-3 rounded-full ${
                                    index === 0
                                      ? 'bg-teal-500'
                                      : isDark ? 'bg-gray-600' : 'bg-gray-300'
                                  }`} />
                                  {index < shipment.trackingEvents.length - 1 && (
                                    <div className={`w-0.5 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                  )}
                                </div>
                                <div className="pb-3">
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {event.status}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {event.description}
                                  </p>
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {event.location} - {new Date(event.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-4">
            {/* Quick Track */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shipmentTracker.trackAPackage', 'Track a Package')}
              </h2>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.shipmentTracker.enterTrackingNumber2', 'Enter tracking number...')}
                    value={quickTrackNumber}
                    onChange={(e) => setQuickTrackNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickTrack()}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
                <button
                  onClick={handleQuickTrack}
                  className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {t('tools.shipmentTracker.track', 'Track')}
                </button>
              </div>

              {/* Tracking Result */}
              {trackingResult && (
                <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono font-semibold text-lg">{trackingResult.trackingNumber}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {CARRIERS.find(c => c.value === trackingResult.carrier)?.label} - {trackingResult.serviceType}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trackingResult.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : trackingResult.status === 'in-transit'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {SHIPMENT_STATUSES.find(s => s.value === trackingResult.status)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.shipmentTracker.from', 'From')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {trackingResult.originCity}, {trackingResult.originState}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>To</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {trackingResult.destinationCity}, {trackingResult.destinationState}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {trackingResult.trackingEvents.slice().reverse().map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-teal-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                          }`} />
                          {index < trackingResult.trackingEvents.length - 1 && (
                            <div className={`w-0.5 h-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {event.status}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event.description}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {event.location} - {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* External Carrier Links */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shipmentTracker.trackOnCarrierWebsite', 'Track on Carrier Website')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CARRIERS.filter(c => c.trackingUrl).map((carrier) => (
                  <a
                    key={carrier.value}
                    href={carrier.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-lg text-center transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <Truck className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{carrier.label}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Carriers Tab */}
        {activeTab === 'carriers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shipmentTracker.carrierManagement', 'Carrier Management')}
              </h2>
              <button
                onClick={() => setShowCarrierForm(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.shipmentTracker.addCarrier', 'Add Carrier')}
              </button>
            </div>

            {/* Carrier Form Modal */}
            {showCarrierForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                  <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {editingCarrier ? t('tools.shipmentTracker.editCarrier', 'Edit Carrier') : t('tools.shipmentTracker.addCarrier2', 'Add Carrier')}
                      </h2>
                      <button onClick={resetCarrierForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.shipmentTracker.code', 'Code *')}
                        </label>
                        <input
                          type="text"
                          value={carrierForm.code}
                          onChange={(e) => setCarrierForm(prev => ({ ...prev, code: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={t('tools.shipmentTracker.eGFedex', 'e.g., fedex')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.shipmentTracker.name', 'Name *')}
                        </label>
                        <input
                          type="text"
                          value={carrierForm.name}
                          onChange={(e) => setCarrierForm(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={t('tools.shipmentTracker.eGFedex2', 'e.g., FedEx')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.shipmentTracker.trackingUrl', 'Tracking URL')}
                      </label>
                      <input
                        type="url"
                        value={carrierForm.trackingUrl}
                        onChange={(e) => setCarrierForm(prev => ({ ...prev, trackingUrl: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.shipmentTracker.https', 'https://...')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.shipmentTracker.accountNumber', 'Account Number')}
                        </label>
                        <input
                          type="text"
                          value={carrierForm.accountNumber}
                          onChange={(e) => setCarrierForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.shipmentTracker.contactPhone', 'Contact Phone')}
                        </label>
                        <input
                          type="tel"
                          value={carrierForm.contactPhone}
                          onChange={(e) => setCarrierForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.shipmentTracker.contactEmail', 'Contact Email')}
                      </label>
                      <input
                        type="email"
                        value={carrierForm.contactEmail}
                        onChange={(e) => setCarrierForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.shipmentTracker.notes2', 'Notes')}
                      </label>
                      <textarea
                        value={carrierForm.notes}
                        onChange={(e) => setCarrierForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={carrierForm.isActive}
                          onChange={(e) => setCarrierForm(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.shipmentTracker.active', 'Active')}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={resetCarrierForm}
                        className={`px-4 py-2 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t('tools.shipmentTracker.cancel2', 'Cancel')}
                      </button>
                      <button
                        onClick={handleSaveCarrier}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {editingCarrier ? t('tools.shipmentTracker.update', 'Update') : t('tools.shipmentTracker.add', 'Add')} Carrier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Carriers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carriers.length === 0 ? (
                <div className={`md:col-span-2 p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Truck className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.shipmentTracker.noCarriersConfiguredAddYour', 'No carriers configured. Add your first carrier to get started!')}
                  </p>
                </div>
              ) : (
                carriers.map((carrier) => (
                  <div
                    key={carrier.id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          carrier.isActive
                            ? isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-600'
                            : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {carrier.name}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Code: {carrier.code}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditCarrier(carrier)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCarrier(carrier.id)}
                          className={`p-2 rounded-lg text-red-500 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className={`mt-3 pt-3 border-t space-y-1 text-sm ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                      {carrier.accountNumber && <p>Account: {carrier.accountNumber}</p>}
                      {carrier.contactPhone && <p>Phone: {carrier.contactPhone}</p>}
                      {carrier.contactEmail && <p>Email: {carrier.contactEmail}</p>}
                      {carrier.notes && <p className="italic">{carrier.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shipmentTracker.shippingAnalytics', 'Shipping Analytics')}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shipmentTracker.totalShipments', 'Total Shipments')}</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalShipments}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shipmentTracker.deliveryRate', 'Delivery Rate')}</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.deliveryRate.toFixed(1)}%
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shipmentTracker.totalSpend', 'Total Spend')}</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${stats.totalCost.toFixed(2)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shipmentTracker.avgCost', 'Avg. Cost')}</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${stats.avgCost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Carrier Breakdown */}
              <div>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.shipmentTracker.shipmentsByCarrier', 'Shipments by Carrier')}
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.carrierBreakdown).map(([carrier, count]) => (
                    <div key={carrier} className="flex items-center gap-3">
                      <span className={`w-20 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {CARRIERS.find(c => c.value === carrier)?.label || carrier}
                      </span>
                      <div className="flex-1">
                        <div className={`h-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-teal-500 rounded flex items-center justify-end pr-2"
                            style={{ width: `${(count / stats.totalShipments) * 100}%` }}
                          >
                            <span className="text-xs text-white font-medium">{count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="mt-6">
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.shipmentTracker.shipmentsByStatus', 'Shipments by Status')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SHIPMENT_STATUSES.map((status) => {
                    const count = shipments.filter(s => s.status === status.value).length;
                    return (
                      <div
                        key={status.value}
                        className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {status.label}
                        </p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {count}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default ShipmentTrackerTool;
