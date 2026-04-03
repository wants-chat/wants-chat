'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bike,
  Package,
  Calendar,
  Users,
  Wrench,
  Clock,
  DollarSign,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Tag,
  User,
  Phone,
  Mail,
  FileText,
  Settings,
  Filter,
  RefreshCw,
  Ruler,
  CreditCard,
  Star,
  ShoppingBag,
  Bookmark,
  ClipboardList,
  MapPin,
  Shield,
  TestTube,
  ArrowRightLeft,
  Layers,
  Timer,
  Route,
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
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface BicycleShopToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Bike {
  id: string;
  brand: string;
  model: string;
  type: 'road' | 'mountain' | 'hybrid' | 'electric' | 'gravel' | 'bmx' | 'cruiser' | 'kids';
  size: string;
  frameSize: string;
  wheelSize: string;
  color: string;
  year: number;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  price: number;
  cost: number;
  category: 'sale' | 'rental' | 'consignment' | 'trade-in';
  status: 'available' | 'sold' | 'rented' | 'reserved' | 'maintenance';
  sku: string;
  serialNumber: string;
  notes: string;
  createdAt: string;
}

interface Part {
  id: string;
  name: string;
  category: 'drivetrain' | 'brakes' | 'wheels' | 'tires' | 'handlebars' | 'saddle' | 'pedals' | 'accessories';
  brand: string;
  partNumber: string;
  compatibility: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  location: string;
  notes: string;
}

interface WorkOrder {
  id: string;
  customerId: string;
  bikeDescription: string;
  serviceType: 'tune-up' | 'repair' | 'assembly' | 'wheel-build' | 'suspension' | 'custom' | 'overhaul';
  status: 'pending' | 'in-progress' | 'waiting-parts' | 'completed' | 'picked-up';
  priority: 'low' | 'normal' | 'high' | 'rush';
  estimatedCost: number;
  actualCost: number;
  laborHours: number;
  partsUsed: { partId: string; quantity: number; price: number }[];
  technicianNotes: string;
  customerNotes: string;
  createdAt: string;
  promisedDate: string;
  completedAt: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bikePreferences: string;
  ridingStyle: 'casual' | 'commuter' | 'recreational' | 'competitive' | 'professional';
  memberSince: string;
  totalSpent: number;
  notes: string;
}

interface FittingAppointment {
  id: string;
  customerId: string;
  date: string;
  time: string;
  duration: number;
  fittingType: 'basic' | 'comprehensive' | 'professional' | 'retul';
  bikeType: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  fitter: string;
  measurements: {
    inseam?: number;
    torso?: number;
    armLength?: number;
    shoulderWidth?: number;
  };
  recommendations: string;
  price: number;
  notes: string;
}

interface TradeIn {
  id: string;
  customerId: string;
  bikeDescription: string;
  brand: string;
  model: string;
  year: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  originalMsrp: number;
  offeredValue: number;
  acceptedValue: number;
  status: 'pending' | 'evaluated' | 'accepted' | 'declined' | 'completed';
  evaluationNotes: string;
  createdAt: string;
}

interface SpecialOrder {
  id: string;
  customerId: string;
  itemDescription: string;
  brand: string;
  partNumber: string;
  quantity: number;
  estimatedCost: number;
  deposit: number;
  status: 'ordered' | 'shipped' | 'received' | 'notified' | 'picked-up' | 'cancelled';
  supplier: string;
  orderDate: string;
  expectedDate: string;
  receivedDate: string;
  notes: string;
}

interface Layaway {
  id: string;
  customerId: string;
  bikeId: string;
  totalPrice: number;
  downPayment: number;
  payments: { date: string; amount: number }[];
  remainingBalance: number;
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
  dueDate: string;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  notes: string;
}

interface RentalBike {
  id: string;
  bikeId: string;
  category: 'hourly' | 'daily' | 'weekly' | 'monthly';
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  currentRenterId: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  lastServiceDate: string;
  totalRentals: number;
  notes: string;
}

interface TuneUpPackage {
  id: string;
  name: string;
  description: string;
  services: string[];
  price: number;
  laborHours: number;
  popularity: number;
  isActive: boolean;
}

interface GroupRide {
  id: string;
  name: string;
  date: string;
  time: string;
  meetingPoint: string;
  route: string;
  distance: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  maxParticipants: number;
  participants: string[];
  leader: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
}

interface WarrantyClaim {
  id: string;
  customerId: string;
  bikeId: string;
  brand: string;
  itemDescription: string;
  purchaseDate: string;
  issueDescription: string;
  claimNumber: string;
  status: 'submitted' | 'under-review' | 'approved' | 'denied' | 'resolved';
  submittedDate: string;
  resolvedDate: string;
  resolution: string;
  notes: string;
}

interface TestRide {
  id: string;
  customerId: string;
  bikeId: string;
  date: string;
  time: string;
  duration: number;
  route: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  feedback: string;
  purchaseInterest: 'high' | 'medium' | 'low' | 'none';
  followUpDate: string;
  notes: string;
}

type TabType = 'bikes' | 'parts' | 'workorders' | 'customers' | 'fittings' | 'tradeins' | 'specialorders' | 'layaway' | 'rentals' | 'tuneups' | 'grouprides' | 'warranty' | 'testrides';

// Combined shop data interface for backend sync
interface BicycleShopData {
  id: string;
  bikes: Bike[];
  parts: Part[];
  workOrders: WorkOrder[];
  customers: Customer[];
  fittings: FittingAppointment[];
  tradeIns: TradeIn[];
  specialOrders: SpecialOrder[];
  layaways: Layaway[];
  rentalFleet: RentalBike[];
  tuneUpPackages: TuneUpPackage[];
  groupRides: GroupRide[];
  warrantyClaims: WarrantyClaim[];
  testRides: TestRide[];
}

// Column configuration for the combined shop data export (for sync purposes)
const SHOP_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

// Initial sample data
const initialBikes: Bike[] = [
  {
    id: '1',
    brand: 'Trek',
    model: 'Domane SL 6',
    type: 'road',
    size: '56cm',
    frameSize: '56',
    wheelSize: '700c',
    color: 'Crimson Red',
    year: 2024,
    condition: 'new',
    price: 4299,
    cost: 3200,
    category: 'sale',
    status: 'available',
    sku: 'TRK-DOM-SL6-56',
    serialNumber: 'WTU123456789',
    notes: 'Endurance road bike with IsoSpeed technology',
    createdAt: '2024-11-15',
  },
  {
    id: '2',
    brand: 'Specialized',
    model: 'Stumpjumper Expert',
    type: 'mountain',
    size: 'Large',
    frameSize: 'L',
    wheelSize: '29"',
    color: 'Satin Forest Green',
    year: 2024,
    condition: 'new',
    price: 5500,
    cost: 4100,
    category: 'sale',
    status: 'available',
    sku: 'SPZ-STJ-EXP-L',
    serialNumber: 'WSBC987654321',
    notes: 'Trail bike with SWAT storage',
    createdAt: '2024-10-20',
  },
  {
    id: '3',
    brand: 'Giant',
    model: 'Escape 3',
    type: 'hybrid',
    size: 'Medium',
    frameSize: 'M',
    wheelSize: '700c',
    color: 'Black',
    year: 2024,
    condition: 'new',
    price: 550,
    cost: 380,
    category: 'rental',
    status: 'available',
    sku: 'GNT-ESC3-M',
    serialNumber: 'GNT456789012',
    notes: 'Great commuter bike',
    createdAt: '2024-09-01',
  },
];

const initialParts: Part[] = [
  {
    id: '1',
    name: 'Shimano 105 Rear Derailleur',
    category: 'drivetrain',
    brand: 'Shimano',
    partNumber: 'RD-R7000-SS',
    compatibility: '11-speed road',
    price: 89.99,
    cost: 55,
    quantity: 8,
    minStock: 3,
    location: 'Aisle 2, Shelf B',
    notes: 'Best seller for road upgrades',
  },
  {
    id: '2',
    name: 'Continental GP 5000 Tire',
    category: 'tires',
    brand: 'Continental',
    partNumber: 'GP5000-25',
    compatibility: '700x25c',
    price: 74.99,
    cost: 45,
    quantity: 24,
    minStock: 10,
    location: 'Aisle 1, Shelf A',
    notes: 'Premium road tire',
  },
  {
    id: '3',
    name: 'SRAM Eagle Chain',
    category: 'drivetrain',
    brand: 'SRAM',
    partNumber: 'XX1-EAGLE-12S',
    compatibility: '12-speed Eagle',
    price: 54.99,
    cost: 32,
    quantity: 15,
    minStock: 5,
    location: 'Aisle 2, Shelf C',
    notes: 'MTB 12-speed chain',
  },
];

const initialCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '555-234-5678',
    address: '123 Bike Lane',
    city: 'Portland, OR',
    bikePreferences: 'Road bikes, carbon frame preferred',
    ridingStyle: 'competitive',
    memberSince: '2022-03-15',
    totalSpent: 8500,
    notes: 'Club member, races Cat 3',
  },
  {
    id: '2',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    email: 'emma.r@email.com',
    phone: '555-345-6789',
    address: '456 Trail Way',
    city: 'Portland, OR',
    bikePreferences: 'Mountain bikes, enduro style',
    ridingStyle: 'recreational',
    memberSince: '2023-06-01',
    totalSpent: 3200,
    notes: 'Interested in group rides',
  },
];

const initialWorkOrders: WorkOrder[] = [
  {
    id: '1',
    customerId: '1',
    bikeDescription: 'Trek Domane SL 5 - 2023',
    serviceType: 'tune-up',
    status: 'in-progress',
    priority: 'normal',
    estimatedCost: 89,
    actualCost: 0,
    laborHours: 1.5,
    partsUsed: [],
    technicianNotes: 'Shifting needs adjustment, cables stretching',
    customerNotes: 'Bike making clicking noise when pedaling',
    createdAt: '2024-12-20',
    promisedDate: '2024-12-23',
    completedAt: '',
  },
];

const initialTuneUpPackages: TuneUpPackage[] = [
  {
    id: '1',
    name: 'Basic Tune-Up',
    description: 'Essential maintenance for regular riders',
    services: ['Brake adjustment', 'Derailleur adjustment', 'Tire inflation', 'Safety check', 'Chain lube'],
    price: 59,
    laborHours: 0.75,
    popularity: 45,
    isActive: true,
  },
  {
    id: '2',
    name: 'Standard Tune-Up',
    description: 'Comprehensive service for active cyclists',
    services: ['All Basic services', 'Wheel true', 'Cable tension', 'Headset adjustment', 'Bottom bracket check', 'Drivetrain cleaning'],
    price: 99,
    laborHours: 1.5,
    popularity: 35,
    isActive: true,
  },
  {
    id: '3',
    name: 'Premium Overhaul',
    description: 'Complete bike restoration',
    services: ['Full disassembly', 'Deep cleaning', 'All bearings serviced', 'New cables/housing', 'Complete adjustment', 'Road test'],
    price: 249,
    laborHours: 4,
    popularity: 20,
    isActive: true,
  },
];

// Default initial shop data
const defaultShopData: BicycleShopData[] = [{
  id: 'shop-data-main',
  bikes: initialBikes,
  parts: initialParts,
  workOrders: initialWorkOrders,
  customers: initialCustomers,
  fittings: [],
  tradeIns: [],
  specialOrders: [],
  layaways: [],
  rentalFleet: [],
  tuneUpPackages: initialTuneUpPackages,
  groupRides: [],
  warrantyClaims: [],
  testRides: [],
}];

export const BicycleShopTool: React.FC<BicycleShopToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: shopDataArray,
    setData: setShopDataArray,
    updateItem: updateShopData,
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
  } = useToolData<BicycleShopData>('bicycle-shop', defaultShopData, SHOP_DATA_COLUMNS);

  // Get the main shop data object (we store all data in a single object)
  const shopData = shopDataArray[0] || defaultShopData[0];

  // Extract individual data arrays from shop data
  const bikes = shopData.bikes || [];
  const parts = shopData.parts || [];
  const workOrders = shopData.workOrders || [];
  const customers = shopData.customers || [];
  const fittings = shopData.fittings || [];
  const tradeIns = shopData.tradeIns || [];
  const specialOrders = shopData.specialOrders || [];
  const layaways = shopData.layaways || [];
  const rentalFleet = shopData.rentalFleet || [];
  const tuneUpPackages = shopData.tuneUpPackages || [];
  const groupRides = shopData.groupRides || [];
  const warrantyClaims = shopData.warrantyClaims || [];
  const testRides = shopData.testRides || [];

  // Helper to update a specific data array in shop data
  const updateShopDataField = <K extends keyof BicycleShopData>(field: K, value: BicycleShopData[K]) => {
    updateShopData('shop-data-main', { [field]: value });
  };

  // Setter functions for individual data arrays
  const setBikes = (newBikes: Bike[] | ((prev: Bike[]) => Bike[])) => {
    const updated = typeof newBikes === 'function' ? newBikes(bikes) : newBikes;
    updateShopDataField('bikes', updated);
  };

  const setParts = (newParts: Part[] | ((prev: Part[]) => Part[])) => {
    const updated = typeof newParts === 'function' ? newParts(parts) : newParts;
    updateShopDataField('parts', updated);
  };

  const setWorkOrders = (newOrders: WorkOrder[] | ((prev: WorkOrder[]) => WorkOrder[])) => {
    const updated = typeof newOrders === 'function' ? newOrders(workOrders) : newOrders;
    updateShopDataField('workOrders', updated);
  };

  const setCustomers = (newCustomers: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const updated = typeof newCustomers === 'function' ? newCustomers(customers) : newCustomers;
    updateShopDataField('customers', updated);
  };

  const setFittings = (newFittings: FittingAppointment[] | ((prev: FittingAppointment[]) => FittingAppointment[])) => {
    const updated = typeof newFittings === 'function' ? newFittings(fittings) : newFittings;
    updateShopDataField('fittings', updated);
  };

  const setTradeIns = (newTradeIns: TradeIn[] | ((prev: TradeIn[]) => TradeIn[])) => {
    const updated = typeof newTradeIns === 'function' ? newTradeIns(tradeIns) : newTradeIns;
    updateShopDataField('tradeIns', updated);
  };

  const setSpecialOrders = (newOrders: SpecialOrder[] | ((prev: SpecialOrder[]) => SpecialOrder[])) => {
    const updated = typeof newOrders === 'function' ? newOrders(specialOrders) : newOrders;
    updateShopDataField('specialOrders', updated);
  };

  const setLayaways = (newLayaways: Layaway[] | ((prev: Layaway[]) => Layaway[])) => {
    const updated = typeof newLayaways === 'function' ? newLayaways(layaways) : newLayaways;
    updateShopDataField('layaways', updated);
  };

  const setRentalFleet = (newRentals: RentalBike[] | ((prev: RentalBike[]) => RentalBike[])) => {
    const updated = typeof newRentals === 'function' ? newRentals(rentalFleet) : newRentals;
    updateShopDataField('rentalFleet', updated);
  };

  const setTuneUpPackages = (newPackages: TuneUpPackage[] | ((prev: TuneUpPackage[]) => TuneUpPackage[])) => {
    const updated = typeof newPackages === 'function' ? newPackages(tuneUpPackages) : newPackages;
    updateShopDataField('tuneUpPackages', updated);
  };

  const setGroupRides = (newRides: GroupRide[] | ((prev: GroupRide[]) => GroupRide[])) => {
    const updated = typeof newRides === 'function' ? newRides(groupRides) : newRides;
    updateShopDataField('groupRides', updated);
  };

  const setWarrantyClaims = (newClaims: WarrantyClaim[] | ((prev: WarrantyClaim[]) => WarrantyClaim[])) => {
    const updated = typeof newClaims === 'function' ? newClaims(warrantyClaims) : newClaims;
    updateShopDataField('warrantyClaims', updated);
  };

  const setTestRides = (newRides: TestRide[] | ((prev: TestRide[]) => TestRide[])) => {
    const updated = typeof newRides === 'function' ? newRides(testRides) : newRides;
    updateShopDataField('testRides', updated);
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('bikes');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill customer name
      if (params.customerName || params.name) {
        hasChanges = true;
      }

      // Prefill bike/equipment details
      if (params.itemName || params.title || params.brand || params.model) {
        hasChanges = true;
      }

      // Prefill service type
      if (params.serviceType || params.type) {
        hasChanges = true;
      }

      // Prefill price
      if (params.price || params.amount) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filtered data
  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      const matchesSearch =
        bike.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || bike.type === filterType;
      const matchesStatus = filterStatus === 'all' || bike.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || bike.category === filterCategory;
      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [bikes, searchTerm, filterType, filterStatus, filterCategory]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [parts, searchTerm, filterCategory]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((order) => {
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const customer = customers.find(c => c.id === order.customerId);
      const matchesSearch = customer
        ? `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.bikeDescription.toLowerCase().includes(searchTerm.toLowerCase())
        : order.bikeDescription.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, customers, searchTerm, filterStatus]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    });
  }, [customers, searchTerm]);

  // Helper functions
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getBikeById = (id: string) => bikes.find((b) => b.id === id);
  const getCustomerById = (id: string) => customers.find((c) => c.id === id);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      sold: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      reserved: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'waiting-parts': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'picked-up': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'no-show': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      evaluated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      ordered: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      received: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      notified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      defaulted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'under-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      resolved: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getBikeTypeIcon = (type: string) => {
    switch (type) {
      case 'road':
        return <Bike className="w-4 h-4" />;
      case 'mountain':
        return <Route className="w-4 h-4" />;
      case 'electric':
        return <Bike className="w-4 h-4" />;
      default:
        return <Bike className="w-4 h-4" />;
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalBikes = bikes.length;
    const availableBikes = bikes.filter((b) => b.status === 'available').length;
    const activeWorkOrders = workOrders.filter((w) => w.status !== 'picked-up' && w.status !== 'completed').length;
    const lowStockParts = parts.filter((p) => p.quantity <= p.minStock).length;
    const totalInventoryValue = bikes.reduce((sum, b) => sum + b.price, 0);
    const activeRentals = rentalFleet.filter((r) => r.status === 'rented').length;
    const pendingTradeIns = tradeIns.filter((t) => t.status === 'pending' || t.status === 'evaluated').length;
    const upcomingGroupRides = groupRides.filter((g) => g.status === 'scheduled').length;

    return {
      totalBikes,
      availableBikes,
      activeWorkOrders,
      lowStockParts,
      totalInventoryValue,
      activeRentals,
      pendingTradeIns,
      upcomingGroupRides,
    };
  }, [bikes, workOrders, parts, rentalFleet, tradeIns, groupRides]);

  // Form states
  const [bikeForm, setBikeForm] = useState<Partial<Bike>>({
    brand: '',
    model: '',
    type: 'road',
    size: '',
    frameSize: '',
    wheelSize: '',
    color: '',
    year: new Date().getFullYear(),
    condition: 'new',
    price: 0,
    cost: 0,
    category: 'sale',
    status: 'available',
    sku: '',
    serialNumber: '',
    notes: '',
  });

  const [partForm, setPartForm] = useState<Partial<Part>>({
    name: '',
    category: 'drivetrain',
    brand: '',
    partNumber: '',
    compatibility: '',
    price: 0,
    cost: 0,
    quantity: 0,
    minStock: 0,
    location: '',
    notes: '',
  });

  const [workOrderForm, setWorkOrderForm] = useState<Partial<WorkOrder>>({
    customerId: '',
    bikeDescription: '',
    serviceType: 'tune-up',
    status: 'pending',
    priority: 'normal',
    estimatedCost: 0,
    actualCost: 0,
    laborHours: 0,
    partsUsed: [],
    technicianNotes: '',
    customerNotes: '',
    promisedDate: '',
  });

  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    bikePreferences: '',
    ridingStyle: 'recreational',
    notes: '',
  });

  // CRUD operations
  const addBike = () => {
    const newBike: Bike = {
      ...bikeForm as Bike,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBikes([...bikes, newBike]);
    setBikeForm({
      brand: '',
      model: '',
      type: 'road',
      size: '',
      frameSize: '',
      wheelSize: '',
      color: '',
      year: new Date().getFullYear(),
      condition: 'new',
      price: 0,
      cost: 0,
      category: 'sale',
      status: 'available',
      sku: '',
      serialNumber: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const updateBike = (id: string) => {
    setBikes(bikes.map((b) => (b.id === id ? { ...b, ...bikeForm } : b)));
    setEditingItem(null);
  };

  const deleteBike = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Bike',
      message: 'Are you sure you want to delete this bike?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setBikes(bikes.filter((b) => b.id !== id));
    }
  };

  const addPart = () => {
    const newPart: Part = {
      ...partForm as Part,
      id: generateId(),
    };
    setParts([...parts, newPart]);
    setPartForm({
      name: '',
      category: 'drivetrain',
      brand: '',
      partNumber: '',
      compatibility: '',
      price: 0,
      cost: 0,
      quantity: 0,
      minStock: 0,
      location: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const addWorkOrder = () => {
    const newOrder: WorkOrder = {
      ...workOrderForm as WorkOrder,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: '',
    };
    setWorkOrders([...workOrders, newOrder]);
    setWorkOrderForm({
      customerId: '',
      bikeDescription: '',
      serviceType: 'tune-up',
      status: 'pending',
      priority: 'normal',
      estimatedCost: 0,
      actualCost: 0,
      laborHours: 0,
      partsUsed: [],
      technicianNotes: '',
      customerNotes: '',
      promisedDate: '',
    });
    setShowAddModal(false);
  };

  const addCustomer = () => {
    const newCustomer: Customer = {
      ...customerForm as Customer,
      id: generateId(),
      memberSince: new Date().toISOString().split('T')[0],
      totalSpent: 0,
    };
    setCustomers([...customers, newCustomer]);
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      bikePreferences: '',
      ridingStyle: 'recreational',
      notes: '',
    });
    setShowAddModal(false);
  };

  const deleteCustomer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const deletePart = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Part',
      message: 'Are you sure you want to delete this part?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setParts(parts.filter((p) => p.id !== id));
    }
  };

  const deleteWorkOrder = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Work Order',
      message: 'Are you sure you want to delete this work order?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setWorkOrders(workOrders.filter((w) => w.id !== id));
    }
  };

  // Tabs configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'bikes', label: 'Bikes', icon: <Bike className="w-4 h-4" /> },
    { id: 'parts', label: 'Parts', icon: <Settings className="w-4 h-4" /> },
    { id: 'workorders', label: 'Work Orders', icon: <Wrench className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'fittings', label: 'Fittings', icon: <Ruler className="w-4 h-4" /> },
    { id: 'tradeins', label: 'Trade-Ins', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'specialorders', label: 'Special Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'layaway', label: 'Layaway', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'rentals', label: 'Rentals', icon: <Clock className="w-4 h-4" /> },
    { id: 'tuneups', label: 'Tune-Ups', icon: <Layers className="w-4 h-4" /> },
    { id: 'grouprides', label: 'Group Rides', icon: <Route className="w-4 h-4" /> },
    { id: 'warranty', label: 'Warranty', icon: <Shield className="w-4 h-4" /> },
    { id: 'testrides', label: 'Test Rides', icon: <TestTube className="w-4 h-4" /> },
  ];

  // Column configurations for export
  const BIKES_COLUMNS: ColumnConfig[] = [
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'model', header: 'Model', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'size', header: 'Size', type: 'string' },
    { key: 'frameSize', header: 'Frame Size', type: 'string' },
    { key: 'wheelSize', header: 'Wheel Size', type: 'string' },
    { key: 'color', header: 'Color', type: 'string' },
    { key: 'year', header: 'Year', type: 'number' },
    { key: 'condition', header: 'Condition', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'cost', header: 'Cost', type: 'currency' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'sku', header: 'SKU', type: 'string' },
    { key: 'serialNumber', header: 'Serial Number', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
  ];

  const PARTS_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'partNumber', header: 'Part Number', type: 'string' },
    { key: 'compatibility', header: 'Compatibility', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'cost', header: 'Cost', type: 'currency' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'minStock', header: 'Min Stock', type: 'number' },
    { key: 'location', header: 'Location', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const WORK_ORDERS_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'bikeDescription', header: 'Bike Description', type: 'string' },
    { key: 'serviceType', header: 'Service Type', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'priority', header: 'Priority', type: 'string' },
    { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
    { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
    { key: 'laborHours', header: 'Labor Hours', type: 'number' },
    { key: 'technicianNotes', header: 'Technician Notes', type: 'string' },
    { key: 'customerNotes', header: 'Customer Notes', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
    { key: 'promisedDate', header: 'Promised Date', type: 'date' },
    { key: 'completedAt', header: 'Completed At', type: 'date' },
  ];

  const CUSTOMERS_COLUMNS: ColumnConfig[] = [
    { key: 'firstName', header: 'First Name', type: 'string' },
    { key: 'lastName', header: 'Last Name', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'phone', header: 'Phone', type: 'string' },
    { key: 'address', header: 'Address', type: 'string' },
    { key: 'city', header: 'City', type: 'string' },
    { key: 'bikePreferences', header: 'Bike Preferences', type: 'string' },
    { key: 'ridingStyle', header: 'Riding Style', type: 'string' },
    { key: 'memberSince', header: 'Member Since', type: 'date' },
    { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const FITTINGS_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'time', header: 'Time', type: 'string' },
    { key: 'duration', header: 'Duration (min)', type: 'number' },
    { key: 'fittingType', header: 'Fitting Type', type: 'string' },
    { key: 'bikeType', header: 'Bike Type', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'fitter', header: 'Fitter', type: 'string' },
    { key: 'recommendations', header: 'Recommendations', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const TRADE_INS_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'bikeDescription', header: 'Bike Description', type: 'string' },
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'model', header: 'Model', type: 'string' },
    { key: 'year', header: 'Year', type: 'number' },
    { key: 'condition', header: 'Condition', type: 'string' },
    { key: 'originalMsrp', header: 'Original MSRP', type: 'currency' },
    { key: 'offeredValue', header: 'Offered Value', type: 'currency' },
    { key: 'acceptedValue', header: 'Accepted Value', type: 'currency' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'evaluationNotes', header: 'Evaluation Notes', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
  ];

  const SPECIAL_ORDERS_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'itemDescription', header: 'Item Description', type: 'string' },
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'partNumber', header: 'Part Number', type: 'string' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
    { key: 'deposit', header: 'Deposit', type: 'currency' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'supplier', header: 'Supplier', type: 'string' },
    { key: 'orderDate', header: 'Order Date', type: 'date' },
    { key: 'expectedDate', header: 'Expected Date', type: 'date' },
    { key: 'receivedDate', header: 'Received Date', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const LAYAWAY_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'bikeId', header: 'Bike ID', type: 'string' },
    { key: 'totalPrice', header: 'Total Price', type: 'currency' },
    { key: 'downPayment', header: 'Down Payment', type: 'currency' },
    { key: 'remainingBalance', header: 'Remaining Balance', type: 'currency' },
    { key: 'paymentSchedule', header: 'Payment Schedule', type: 'string' },
    { key: 'startDate', header: 'Start Date', type: 'date' },
    { key: 'dueDate', header: 'Due Date', type: 'date' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const RENTALS_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'bikeId', header: 'Bike ID', type: 'string' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
    { key: 'dailyRate', header: 'Daily Rate', type: 'currency' },
    { key: 'weeklyRate', header: 'Weekly Rate', type: 'currency' },
    { key: 'monthlyRate', header: 'Monthly Rate', type: 'currency' },
    { key: 'currentRenterId', header: 'Current Renter ID', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'lastServiceDate', header: 'Last Service Date', type: 'date' },
    { key: 'totalRentals', header: 'Total Rentals', type: 'number' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const TUNE_UPS_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'laborHours', header: 'Labor Hours', type: 'number' },
    { key: 'popularity', header: 'Popularity', type: 'number' },
    { key: 'isActive', header: 'Active', type: 'boolean' },
  ];

  const GROUP_RIDES_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'time', header: 'Time', type: 'string' },
    { key: 'meetingPoint', header: 'Meeting Point', type: 'string' },
    { key: 'route', header: 'Route', type: 'string' },
    { key: 'distance', header: 'Distance (mi)', type: 'number' },
    { key: 'difficulty', header: 'Difficulty', type: 'string' },
    { key: 'maxParticipants', header: 'Max Participants', type: 'number' },
    { key: 'leader', header: 'Leader', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const WARRANTY_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'bikeId', header: 'Bike ID', type: 'string' },
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'itemDescription', header: 'Item Description', type: 'string' },
    { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
    { key: 'issueDescription', header: 'Issue Description', type: 'string' },
    { key: 'claimNumber', header: 'Claim Number', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'submittedDate', header: 'Submitted Date', type: 'date' },
    { key: 'resolvedDate', header: 'Resolved Date', type: 'date' },
    { key: 'resolution', header: 'Resolution', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const TEST_RIDES_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'bikeId', header: 'Bike ID', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'time', header: 'Time', type: 'string' },
    { key: 'duration', header: 'Duration (min)', type: 'number' },
    { key: 'route', header: 'Route', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'feedback', header: 'Feedback', type: 'string' },
    { key: 'purchaseInterest', header: 'Purchase Interest', type: 'string' },
    { key: 'followUpDate', header: 'Follow Up Date', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  // Get current export data and columns based on active tab
  const getExportConfig = (): { data: any[]; columns: ColumnConfig[]; filename: string } => {
    switch (activeTab) {
      case 'bikes':
        return { data: filteredBikes, columns: BIKES_COLUMNS, filename: 'bicycles' };
      case 'parts':
        return { data: filteredParts, columns: PARTS_COLUMNS, filename: 'parts' };
      case 'workorders':
        return { data: filteredWorkOrders, columns: WORK_ORDERS_COLUMNS, filename: 'work_orders' };
      case 'customers':
        return { data: filteredCustomers, columns: CUSTOMERS_COLUMNS, filename: 'customers' };
      case 'fittings':
        return { data: fittings, columns: FITTINGS_COLUMNS, filename: 'fittings' };
      case 'tradeins':
        return { data: tradeIns, columns: TRADE_INS_COLUMNS, filename: 'trade_ins' };
      case 'specialorders':
        return { data: specialOrders, columns: SPECIAL_ORDERS_COLUMNS, filename: 'special_orders' };
      case 'layaway':
        return { data: layaways, columns: LAYAWAY_COLUMNS, filename: 'layaway' };
      case 'rentals':
        return { data: rentalFleet, columns: RENTALS_COLUMNS, filename: 'rentals' };
      case 'tuneups':
        return { data: tuneUpPackages, columns: TUNE_UPS_COLUMNS, filename: 'tune_up_packages' };
      case 'grouprides':
        return { data: groupRides, columns: GROUP_RIDES_COLUMNS, filename: 'group_rides' };
      case 'warranty':
        return { data: warrantyClaims, columns: WARRANTY_COLUMNS, filename: 'warranty_claims' };
      case 'testrides':
        return { data: testRides, columns: TEST_RIDES_COLUMNS, filename: 'test_rides' };
      default:
        return { data: filteredBikes, columns: BIKES_COLUMNS, filename: 'bicycles' };
    }
  };

  // Export handlers - use hook's export functions for tab-specific exports
  const handleExportCSV = () => {
    const { filename } = getExportConfig();
    exportCSV({ filename: `bicycle_shop_${filename}` });
  };

  const handleExportExcel = () => {
    const { filename } = getExportConfig();
    exportExcel({ filename: `bicycle_shop_${filename}` });
  };

  const handleExportJSON = () => {
    const { filename } = getExportConfig();
    exportJSON({ filename: `bicycle_shop_${filename}` });
  };

  const handleExportPDF = async () => {
    const { filename } = getExportConfig();
    await exportPDF({
      filename: `bicycle_shop_${filename}`,
      title: `Bicycle Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return await copyToClipboard('tab');
  };

  const handlePrint = () => {
    print(`Bicycle Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`);
  };

  // Render functions
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bicycleShop.totalBikes', 'Total Bikes')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalBikes}</p>
            </div>
            <Bike className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
          </div>
        </CardContent>
      </Card>
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bicycleShop.activeWorkOrders', 'Active Work Orders')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeWorkOrders}</p>
            </div>
            <Wrench className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
        </CardContent>
      </Card>
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bicycleShop.lowStockParts', 'Low Stock Parts')}</p>
              <p className={`text-2xl font-bold ${stats.lowStockParts > 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{stats.lowStockParts}</p>
            </div>
            <AlertCircle className={`w-8 h-8 ${stats.lowStockParts > 0 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </CardContent>
      </Card>
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bicycleShop.inventoryValue', 'Inventory Value')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalInventoryValue.toLocaleString()}</p>
            </div>
            <DollarSign className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBikesTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">{t('tools.bicycleShop.allTypes', 'All Types')}</option>
          <option value="road">{t('tools.bicycleShop.road', 'Road')}</option>
          <option value="mountain">{t('tools.bicycleShop.mountain', 'Mountain')}</option>
          <option value="hybrid">{t('tools.bicycleShop.hybrid', 'Hybrid')}</option>
          <option value="electric">{t('tools.bicycleShop.electric', 'Electric')}</option>
          <option value="gravel">{t('tools.bicycleShop.gravel', 'Gravel')}</option>
          <option value="bmx">{t('tools.bicycleShop.bmx', 'BMX')}</option>
          <option value="cruiser">{t('tools.bicycleShop.cruiser', 'Cruiser')}</option>
          <option value="kids">{t('tools.bicycleShop.kids', 'Kids')}</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">{t('tools.bicycleShop.allStatus', 'All Status')}</option>
          <option value="available">{t('tools.bicycleShop.available', 'Available')}</option>
          <option value="sold">{t('tools.bicycleShop.sold', 'Sold')}</option>
          <option value="rented">{t('tools.bicycleShop.rented', 'Rented')}</option>
          <option value="reserved">{t('tools.bicycleShop.reserved', 'Reserved')}</option>
          <option value="maintenance">{t('tools.bicycleShop.maintenance', 'Maintenance')}</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">{t('tools.bicycleShop.allCategories', 'All Categories')}</option>
          <option value="sale">{t('tools.bicycleShop.forSale', 'For Sale')}</option>
          <option value="rental">{t('tools.bicycleShop.rental', 'Rental')}</option>
          <option value="consignment">{t('tools.bicycleShop.consignment', 'Consignment')}</option>
          <option value="trade-in">{t('tools.bicycleShop.tradeIn', 'Trade-In')}</option>
        </select>
      </div>

      {/* Bikes List */}
      {filteredBikes.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Bike className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.bicycleShop.noBikesFound', 'No bikes found')}</p>
        </div>
      ) : (
        filteredBikes.map((bike) => (
          <Card key={bike.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getBikeTypeIcon(bike.type)}
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {bike.brand} {bike.model}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(bike.status)}`}>
                      {bike.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {bike.category}
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Size: {bike.size}</span>
                    <span>Year: {bike.year}</span>
                    <span>Color: {bike.color}</span>
                    <span className="font-semibold text-green-500">${bike.price.toLocaleString()}</span>
                  </div>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>SKU: {bike.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(bike.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    {expandedItems.has(bike.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setBikeForm(bike);
                      setEditingItem(bike.id);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-500'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBike(bike.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedItems.has(bike.id) && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.frameSize', 'Frame Size:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{bike.frameSize}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.wheelSize', 'Wheel Size:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{bike.wheelSize}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.condition', 'Condition:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{bike.condition}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.serial', 'Serial:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{bike.serialNumber}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.cost', 'Cost:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>${bike.cost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.margin', 'Margin:')}</span>
                      <span className="ml-2 text-green-500">${(bike.price - bike.cost).toLocaleString()}</span>
                    </div>
                  </div>
                  {bike.notes && (
                    <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      {bike.notes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderPartsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">{t('tools.bicycleShop.allCategories2', 'All Categories')}</option>
          <option value="drivetrain">{t('tools.bicycleShop.drivetrain', 'Drivetrain')}</option>
          <option value="brakes">{t('tools.bicycleShop.brakes', 'Brakes')}</option>
          <option value="wheels">{t('tools.bicycleShop.wheels', 'Wheels')}</option>
          <option value="tires">{t('tools.bicycleShop.tires', 'Tires')}</option>
          <option value="handlebars">{t('tools.bicycleShop.handlebars', 'Handlebars')}</option>
          <option value="saddle">{t('tools.bicycleShop.saddle', 'Saddle')}</option>
          <option value="pedals">{t('tools.bicycleShop.pedals', 'Pedals')}</option>
          <option value="accessories">{t('tools.bicycleShop.accessories', 'Accessories')}</option>
        </select>
      </div>

      {/* Parts List */}
      {filteredParts.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.bicycleShop.noPartsFound', 'No parts found')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParts.map((part) => (
            <Card key={part.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${part.quantity <= part.minStock ? 'border-red-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{part.name}</h3>
                      {part.quantity <= part.minStock && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{part.brand} - {part.partNumber}</p>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Qty: <span className={part.quantity <= part.minStock ? 'text-red-500 font-bold' : ''}>{part.quantity}</span></span>
                      <span className="text-green-500 font-semibold">${part.price}</span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{part.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPartForm(part);
                        setEditingItem(part.id);
                      }}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-500'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePart(part.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderWorkOrdersTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">{t('tools.bicycleShop.allStatus2', 'All Status')}</option>
          <option value="pending">{t('tools.bicycleShop.pending', 'Pending')}</option>
          <option value="in-progress">{t('tools.bicycleShop.inProgress', 'In Progress')}</option>
          <option value="waiting-parts">{t('tools.bicycleShop.waitingParts', 'Waiting Parts')}</option>
          <option value="completed">{t('tools.bicycleShop.completed', 'Completed')}</option>
          <option value="picked-up">{t('tools.bicycleShop.pickedUp', 'Picked Up')}</option>
        </select>
      </div>

      {/* Work Orders List */}
      {filteredWorkOrders.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.bicycleShop.noWorkOrdersFound', 'No work orders found')}</p>
        </div>
      ) : (
        filteredWorkOrders.map((order) => {
          const customer = getCustomerById(order.customerId);
          return (
            <Card key={order.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4" />
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        #{order.id.slice(-6).toUpperCase()} - {order.bikeDescription}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.priority === 'rush' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        order.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.priority}
                      </span>
                    </div>
                    {customer && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <User className="w-3 h-3 inline mr-1" />
                        {customer.firstName} {customer.lastName} - {customer.phone}
                      </p>
                    )}
                    <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Service: {order.serviceType}</span>
                      <span>Est: ${order.estimatedCost}</span>
                      <span>Due: {order.promisedDate}</span>
                    </div>
                    {order.customerNotes && (
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FileText className="w-3 h-3 inline mr-1" />
                        {order.customerNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedItems.has(order.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteWorkOrder(order.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {expandedItems.has(order.id) && (
                  <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.laborHours', 'Labor Hours:')}</span>
                        <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.laborHours}h</span>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.actualCost', 'Actual Cost:')}</span>
                        <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>${order.actualCost || '-'}</span>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.created', 'Created:')}</span>
                        <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.createdAt}</span>
                      </div>
                      {order.completedAt && (
                        <div>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.completed2', 'Completed:')}</span>
                          <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.completedAt}</span>
                        </div>
                      )}
                    </div>
                    {order.technicianNotes && (
                      <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <strong>{t('tools.bicycleShop.techNotes', 'Tech Notes:')}</strong> {order.technicianNotes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  const renderCustomersTab = () => (
    <div className="space-y-4">
      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.bicycleShop.noCustomersFound', 'No customers found')}</p>
        </div>
      ) : (
        filteredCustomers.map((customer) => (
          <Card key={customer.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {customer.ridingStyle}
                    </span>
                  </div>
                  <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span><Phone className="w-3 h-3 inline mr-1" />{customer.phone}</span>
                    <span><Mail className="w-3 h-3 inline mr-1" />{customer.email}</span>
                    <span><MapPin className="w-3 h-3 inline mr-1" />{customer.city}</span>
                  </div>
                  <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Member since: {customer.memberSince}</span>
                    <span className="text-green-500 font-semibold">Total: ${customer.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(customer.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    {expandedItems.has(customer.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setCustomerForm(customer);
                      setEditingItem(customer.id);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-500'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCustomer(customer.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedItems.has(customer.id) && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.address', 'Address:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.address}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.bicycleShop.preferences', 'Preferences:')}</span>
                      <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.bikePreferences}</span>
                    </div>
                  </div>
                  {customer.notes && (
                    <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      {customer.notes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderTuneUpsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tuneUpPackages.filter(p => p.isActive).map((pkg) => (
          <Card key={pkg.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {pkg.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold text-green-500 mb-2`}>${pkg.price}</p>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.description}</p>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {pkg.services.map((service, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {service}
                  </li>
                ))}
              </ul>
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Est. Time: {pkg.laborHours}h</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Popularity: {pkg.popularity}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEmptyState = (icon: React.ReactNode, text: string) => (
    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      <div className="w-16 h-16 mx-auto mb-4 opacity-50">{icon}</div>
      <p className="text-lg">{text}</p>
      <p className="text-sm mt-2">{t('tools.bicycleShop.clickAddNewToGet', 'Click "Add New" to get started')}</p>
    </div>
  );

  // Modal for adding new items
  const renderAddModal = () => {
    if (!showAddModal) return null;

    const getModalContent = () => {
      switch (activeTab) {
        case 'bikes':
          return (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bicycleShop.addNewBike', 'Add New Bike')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.brand', 'Brand')}
                  value={bikeForm.brand || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, brand: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.model', 'Model')}
                  value={bikeForm.model || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <select
                  value={bikeForm.type || 'road'}
                  onChange={(e) => setBikeForm({ ...bikeForm, type: e.target.value as Bike['type'] })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="road">{t('tools.bicycleShop.road2', 'Road')}</option>
                  <option value="mountain">{t('tools.bicycleShop.mountain2', 'Mountain')}</option>
                  <option value="hybrid">{t('tools.bicycleShop.hybrid2', 'Hybrid')}</option>
                  <option value="electric">{t('tools.bicycleShop.electric2', 'Electric')}</option>
                  <option value="gravel">{t('tools.bicycleShop.gravel2', 'Gravel')}</option>
                  <option value="bmx">{t('tools.bicycleShop.bmx2', 'BMX')}</option>
                  <option value="cruiser">{t('tools.bicycleShop.cruiser2', 'Cruiser')}</option>
                  <option value="kids">{t('tools.bicycleShop.kids2', 'Kids')}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.size', 'Size')}
                  value={bikeForm.size || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, size: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.frameSize2', 'Frame Size')}
                  value={bikeForm.frameSize || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, frameSize: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.wheelSize2', 'Wheel Size')}
                  value={bikeForm.wheelSize || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, wheelSize: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.color', 'Color')}
                  value={bikeForm.color || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, color: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.year', 'Year')}
                  value={bikeForm.year || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, year: parseInt(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.price', 'Price')}
                  value={bikeForm.price || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, price: parseFloat(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.cost2', 'Cost')}
                  value={bikeForm.cost || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, cost: parseFloat(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.sku', 'SKU')}
                  value={bikeForm.sku || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, sku: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.serialNumber', 'Serial Number')}
                  value={bikeForm.serialNumber || ''}
                  onChange={(e) => setBikeForm({ ...bikeForm, serialNumber: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <textarea
                placeholder={t('tools.bicycleShop.notes', 'Notes')}
                value={bikeForm.notes || ''}
                onChange={(e) => setBikeForm({ ...bikeForm, notes: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {t('tools.bicycleShop.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addBike}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {t('tools.bicycleShop.addBike', 'Add Bike')}
                </button>
              </div>
            </div>
          );
        case 'parts':
          return (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bicycleShop.addNewPart', 'Add New Part')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.partName', 'Part Name')}
                  value={partForm.name || ''}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <select
                  value={partForm.category || 'drivetrain'}
                  onChange={(e) => setPartForm({ ...partForm, category: e.target.value as Part['category'] })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="drivetrain">{t('tools.bicycleShop.drivetrain2', 'Drivetrain')}</option>
                  <option value="brakes">{t('tools.bicycleShop.brakes2', 'Brakes')}</option>
                  <option value="wheels">{t('tools.bicycleShop.wheels2', 'Wheels')}</option>
                  <option value="tires">{t('tools.bicycleShop.tires2', 'Tires')}</option>
                  <option value="handlebars">{t('tools.bicycleShop.handlebars2', 'Handlebars')}</option>
                  <option value="saddle">{t('tools.bicycleShop.saddle2', 'Saddle')}</option>
                  <option value="pedals">{t('tools.bicycleShop.pedals2', 'Pedals')}</option>
                  <option value="accessories">{t('tools.bicycleShop.accessories2', 'Accessories')}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.brand2', 'Brand')}
                  value={partForm.brand || ''}
                  onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.partNumber', 'Part Number')}
                  value={partForm.partNumber || ''}
                  onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.price2', 'Price')}
                  value={partForm.price || ''}
                  onChange={(e) => setPartForm({ ...partForm, price: parseFloat(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.quantity', 'Quantity')}
                  value={partForm.quantity || ''}
                  onChange={(e) => setPartForm({ ...partForm, quantity: parseInt(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.location', 'Location')}
                  value={partForm.location || ''}
                  onChange={(e) => setPartForm({ ...partForm, location: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.minStock', 'Min Stock')}
                  value={partForm.minStock || ''}
                  onChange={(e) => setPartForm({ ...partForm, minStock: parseInt(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {t('tools.bicycleShop.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addPart}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {t('tools.bicycleShop.addPart', 'Add Part')}
                </button>
              </div>
            </div>
          );
        case 'customers':
          return (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bicycleShop.addNewCustomer', 'Add New Customer')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.firstName', 'First Name')}
                  value={customerForm.firstName || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.lastName', 'Last Name')}
                  value={customerForm.lastName || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="email"
                  placeholder={t('tools.bicycleShop.email', 'Email')}
                  value={customerForm.email || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="tel"
                  placeholder={t('tools.bicycleShop.phone', 'Phone')}
                  value={customerForm.phone || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.address2', 'Address')}
                  value={customerForm.address || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.city', 'City')}
                  value={customerForm.city || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <select
                  value={customerForm.ridingStyle || 'recreational'}
                  onChange={(e) => setCustomerForm({ ...customerForm, ridingStyle: e.target.value as Customer['ridingStyle'] })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="casual">{t('tools.bicycleShop.casual', 'Casual')}</option>
                  <option value="commuter">{t('tools.bicycleShop.commuter', 'Commuter')}</option>
                  <option value="recreational">{t('tools.bicycleShop.recreational', 'Recreational')}</option>
                  <option value="competitive">{t('tools.bicycleShop.competitive', 'Competitive')}</option>
                  <option value="professional">{t('tools.bicycleShop.professional', 'Professional')}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.bikePreferences', 'Bike Preferences')}
                  value={customerForm.bikePreferences || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, bikePreferences: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <textarea
                placeholder={t('tools.bicycleShop.notes2', 'Notes')}
                value={customerForm.notes || ''}
                onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {t('tools.bicycleShop.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={addCustomer}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {t('tools.bicycleShop.addCustomer', 'Add Customer')}
                </button>
              </div>
            </div>
          );
        case 'workorders':
          return (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bicycleShop.addNewWorkOrder', 'Add New Work Order')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={workOrderForm.customerId || ''}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, customerId: e.target.value })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="">{t('tools.bicycleShop.selectCustomer', 'Select Customer')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
                <select
                  value={workOrderForm.serviceType || 'tune-up'}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, serviceType: e.target.value as WorkOrder['serviceType'] })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="tune-up">{t('tools.bicycleShop.tuneUp', 'Tune-Up')}</option>
                  <option value="repair">{t('tools.bicycleShop.repair', 'Repair')}</option>
                  <option value="assembly">{t('tools.bicycleShop.assembly', 'Assembly')}</option>
                  <option value="wheel-build">{t('tools.bicycleShop.wheelBuild', 'Wheel Build')}</option>
                  <option value="suspension">{t('tools.bicycleShop.suspension', 'Suspension')}</option>
                  <option value="custom">{t('tools.bicycleShop.custom', 'Custom')}</option>
                  <option value="overhaul">{t('tools.bicycleShop.overhaul', 'Overhaul')}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('tools.bicycleShop.bikeDescription', 'Bike Description')}
                  value={workOrderForm.bikeDescription || ''}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, bikeDescription: e.target.value })}
                  className={`col-span-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <select
                  value={workOrderForm.priority || 'normal'}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, priority: e.target.value as WorkOrder['priority'] })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="low">{t('tools.bicycleShop.low', 'Low')}</option>
                  <option value="normal">{t('tools.bicycleShop.normal', 'Normal')}</option>
                  <option value="high">{t('tools.bicycleShop.high', 'High')}</option>
                  <option value="rush">{t('tools.bicycleShop.rush', 'Rush')}</option>
                </select>
                <input
                  type="number"
                  placeholder={t('tools.bicycleShop.estimatedCost', 'Estimated Cost')}
                  value={workOrderForm.estimatedCost || ''}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, estimatedCost: parseFloat(e.target.value) })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <input
                  type="date"
                  placeholder={t('tools.bicycleShop.promisedDate', 'Promised Date')}
                  value={workOrderForm.promisedDate || ''}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, promisedDate: e.target.value })}
                  className={`col-span-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <textarea
                placeholder={t('tools.bicycleShop.customerNotes', 'Customer Notes')}
                value={workOrderForm.customerNotes || ''}
                onChange={(e) => setWorkOrderForm({ ...workOrderForm, customerNotes: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {t('tools.bicycleShop.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={addWorkOrder}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {t('tools.bicycleShop.addWorkOrder', 'Add Work Order')}
                </button>
              </div>
            </div>
          );
        default:
          return (
            <div className="text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Form for {activeTab} coming soon
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className={`mt-4 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                {t('tools.bicycleShop.close', 'Close')}
              </button>
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {getModalContent()}
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'bikes':
        return renderBikesTab();
      case 'parts':
        return renderPartsTab();
      case 'workorders':
        return renderWorkOrdersTab();
      case 'customers':
        return renderCustomersTab();
      case 'tuneups':
        return renderTuneUpsTab();
      case 'fittings':
        return fittings.length > 0 ? <div>{t('tools.bicycleShop.fittingsContent', 'Fittings content')}</div> : renderEmptyState(<Ruler className="w-16 h-16" />, 'No bike fitting appointments yet');
      case 'tradeins':
        return tradeIns.length > 0 ? <div>{t('tools.bicycleShop.tradeInsContent', 'Trade-ins content')}</div> : renderEmptyState(<ArrowRightLeft className="w-16 h-16" />, 'No trade-in valuations yet');
      case 'specialorders':
        return specialOrders.length > 0 ? <div>{t('tools.bicycleShop.specialOrdersContent', 'Special orders content')}</div> : renderEmptyState(<ShoppingBag className="w-16 h-16" />, 'No special orders yet');
      case 'layaway':
        return layaways.length > 0 ? <div>{t('tools.bicycleShop.layawayContent', 'Layaway content')}</div> : renderEmptyState(<CreditCard className="w-16 h-16" />, 'No layaway accounts yet');
      case 'rentals':
        return rentalFleet.length > 0 ? <div>{t('tools.bicycleShop.rentalsContent', 'Rentals content')}</div> : renderEmptyState(<Clock className="w-16 h-16" />, 'No rental fleet yet');
      case 'grouprides':
        return groupRides.length > 0 ? <div>{t('tools.bicycleShop.groupRidesContent', 'Group rides content')}</div> : renderEmptyState(<Route className="w-16 h-16" />, 'No group rides scheduled');
      case 'warranty':
        return warrantyClaims.length > 0 ? <div>{t('tools.bicycleShop.warrantyClaimsContent', 'Warranty claims content')}</div> : renderEmptyState(<Shield className="w-16 h-16" />, 'No warranty claims');
      case 'testrides':
        return testRides.length > 0 ? <div>{t('tools.bicycleShop.testRidesContent', 'Test rides content')}</div> : renderEmptyState(<TestTube className="w-16 h-16" />, 'No test rides scheduled');
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
              <Bike className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bicycleShop.bicycleShopManager', 'Bicycle Shop Manager')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.bicycleShop.completeBikeShopManagementSystem', 'Complete bike shop management system')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="bicycle-shop" toolName="Bicycle Shop" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.bicycleShop.addNew', 'Add New')}
            </button>
          </div>
        </div>

        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.bicycleShop.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Stats */}
        {renderStats()}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.bicycleShop.search', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderActiveTab()}

        {/* Add Modal */}
        {renderAddModal()}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default BicycleShopTool;
