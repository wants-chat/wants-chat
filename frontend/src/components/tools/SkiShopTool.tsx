'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mountain,
  Snowflake,
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
  Shirt,
  GraduationCap,
  CreditCard,
  Droplets,
  Star,
  ShoppingBag,
  Bookmark,
  BookOpen,
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
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface SkiShopToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Equipment {
  id: string;
  name: string;
  type: 'ski' | 'snowboard' | 'boots' | 'bindings' | 'poles' | 'helmet' | 'goggles';
  brand: string;
  model: string;
  size: string;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  price: number;
  purchaseDate: string;
  category: 'sale' | 'rental' | 'demo' | 'consignment';
  status: 'available' | 'rented' | 'maintenance' | 'sold' | 'reserved';
  sku: string;
  notes: string;
}

interface RentalItem {
  id: string;
  equipmentId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'returned' | 'overdue' | 'reserved';
  dailyRate: number;
  totalCost: number;
  depositPaid: number;
  notes: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bootSize: string;
  height: string;
  weight: string;
  abilityLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  seasonPassId: string;
  notes: string;
  createdAt: string;
}

interface ServiceTicket {
  id: string;
  equipmentId: string;
  customerId: string;
  serviceType: 'tune' | 'wax' | 'mount' | 'binding-adjustment' | 'repair' | 'boot-fitting';
  status: 'pending' | 'in-progress' | 'completed' | 'awaiting-pickup';
  dinSetting?: number;
  priority: 'low' | 'normal' | 'high' | 'rush';
  estimatedCost: number;
  actualCost: number;
  createdAt: string;
  completedAt: string;
  notes: string;
}

interface Appointment {
  id: string;
  customerId: string;
  type: 'boot-fitting' | 'lesson' | 'rental-pickup' | 'service-pickup' | 'demo';
  date: string;
  time: string;
  duration: number;
  staffMember: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
}

interface SeasonalRental {
  id: string;
  customerId: string;
  packageType: 'junior' | 'adult' | 'performance';
  equipmentIds: string[];
  startDate: string;
  endDate: string;
  totalCost: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  swapsRemaining: number;
  notes: string;
}

interface Apparel {
  id: string;
  name: string;
  type: 'jacket' | 'pants' | 'base-layer' | 'gloves' | 'socks' | 'accessories';
  brand: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  sku: string;
}

interface Lesson {
  id: string;
  customerId: string;
  instructorId: string;
  type: 'private' | 'group' | 'kids';
  discipline: 'ski' | 'snowboard';
  level: 'beginner' | 'intermediate' | 'advanced';
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

type TabType = 'inventory' | 'rentals' | 'services' | 'customers' | 'appointments' | 'seasonal' | 'apparel' | 'lessons';

// Unified data structure for backend sync
interface SkiShopData {
  id: string;
  equipment: Equipment[];
  customers: Customer[];
  rentals: RentalItem[];
  services: ServiceTicket[];
  appointments: Appointment[];
  seasonalRentals: SeasonalRental[];
  apparel: Apparel[];
  lessons: Lesson[];
  updatedAt: string;
}

// Column configuration for unified data export
const SKI_SHOP_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'updatedAt', header: 'Last Updated', type: 'date' },
];

// Initial sample data
const initialEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Rossignol Experience 88',
    type: 'ski',
    brand: 'Rossignol',
    model: 'Experience 88 Ti',
    size: '172',
    condition: 'excellent',
    price: 799,
    purchaseDate: '2024-10-15',
    category: 'sale',
    status: 'available',
    sku: 'SKI-ROSS-EXP88-172',
    notes: 'All-mountain ski, great for intermediates',
  },
  {
    id: '2',
    name: 'Burton Custom Snowboard',
    type: 'snowboard',
    brand: 'Burton',
    model: 'Custom',
    size: '158',
    condition: 'new',
    price: 649,
    purchaseDate: '2024-11-01',
    category: 'sale',
    status: 'available',
    sku: 'SNB-BURT-CUST-158',
    notes: 'Versatile all-mountain board',
  },
  {
    id: '3',
    name: 'Atomic Hawx Prime 110',
    type: 'boots',
    brand: 'Atomic',
    model: 'Hawx Prime 110',
    size: '27.5',
    condition: 'good',
    price: 399,
    purchaseDate: '2024-09-20',
    category: 'rental',
    status: 'available',
    sku: 'BOOT-ATOM-HP110-275',
    notes: 'Medium flex, wide last',
  },
  {
    id: '4',
    name: 'Marker Griffon 13',
    type: 'bindings',
    brand: 'Marker',
    model: 'Griffon 13 ID',
    size: '90-120mm',
    condition: 'new',
    price: 349,
    purchaseDate: '2024-11-10',
    category: 'sale',
    status: 'available',
    sku: 'BIND-MARK-GRF13',
    notes: 'All-mountain binding, DIN 4-13',
  },
  {
    id: '5',
    name: 'K2 Recon 120 Demo',
    type: 'ski',
    brand: 'K2',
    model: 'Recon 120',
    size: '177',
    condition: 'excellent',
    price: 150,
    purchaseDate: '2024-10-01',
    category: 'demo',
    status: 'available',
    sku: 'DEMO-K2-RCN-177',
    notes: 'Demo ski - $50/day',
  },
];

const initialCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '555-123-4567',
    bootSize: '27.5',
    height: "5'10\"",
    weight: '175 lbs',
    abilityLevel: 'intermediate',
    seasonPassId: 'SP-2024-1234',
    notes: 'Prefers stiffer boots',
    createdAt: '2024-09-01',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '555-987-6543',
    bootSize: '24.0',
    height: "5'5\"",
    weight: '130 lbs',
    abilityLevel: 'advanced',
    seasonPassId: 'SP-2024-5678',
    notes: 'Race program participant',
    createdAt: '2024-08-15',
  },
];

const initialServices: ServiceTicket[] = [
  {
    id: '1',
    equipmentId: '1',
    customerId: '1',
    serviceType: 'tune',
    status: 'in-progress',
    priority: 'normal',
    estimatedCost: 45,
    actualCost: 0,
    createdAt: '2024-12-20',
    completedAt: '',
    notes: 'Full tune with edge work',
  },
  {
    id: '2',
    equipmentId: '3',
    customerId: '2',
    serviceType: 'boot-fitting',
    status: 'completed',
    priority: 'high',
    estimatedCost: 75,
    actualCost: 75,
    createdAt: '2024-12-18',
    completedAt: '2024-12-19',
    notes: 'Custom footbed and shell punch',
  },
];

// Default initial data for the shop
const defaultShopData: SkiShopData[] = [{
  id: 'ski-shop-main',
  equipment: initialEquipment,
  customers: initialCustomers,
  rentals: [],
  services: initialServices,
  appointments: [],
  seasonalRentals: [],
  apparel: [],
  lessons: [],
  updatedAt: new Date().toISOString(),
}];

export const SkiShopTool: React.FC<SkiShopToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: shopDataArray,
    setData: setShopDataArray,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<SkiShopData>('ski-shop', defaultShopData, SKI_SHOP_COLUMNS);

  // Derive individual data arrays from the unified shop data
  const shopData = shopDataArray[0] || defaultShopData[0];
  const equipment = shopData.equipment;
  const customers = shopData.customers;
  const rentals = shopData.rentals;
  const services = shopData.services;
  const appointments = shopData.appointments;
  const seasonalRentals = shopData.seasonalRentals;
  const apparel = shopData.apparel;
  const lessons = shopData.lessons;

  // Helper function to update shop data
  const updateShopData = (updates: Partial<SkiShopData>) => {
    setShopDataArray([{
      ...shopData,
      ...updates,
      updatedAt: new Date().toISOString(),
    }]);
  };

  // Setter functions that use the unified update
  const setEquipment = (newEquipment: Equipment[] | ((prev: Equipment[]) => Equipment[])) => {
    const updated = typeof newEquipment === 'function' ? newEquipment(equipment) : newEquipment;
    updateShopData({ equipment: updated });
  };

  const setCustomers = (newCustomers: Customer[] | ((prev: Customer[]) => Customer[])) => {
    const updated = typeof newCustomers === 'function' ? newCustomers(customers) : newCustomers;
    updateShopData({ customers: updated });
  };

  const setRentals = (newRentals: RentalItem[] | ((prev: RentalItem[]) => RentalItem[])) => {
    const updated = typeof newRentals === 'function' ? newRentals(rentals) : newRentals;
    updateShopData({ rentals: updated });
  };

  const setServices = (newServices: ServiceTicket[] | ((prev: ServiceTicket[]) => ServiceTicket[])) => {
    const updated = typeof newServices === 'function' ? newServices(services) : newServices;
    updateShopData({ services: updated });
  };

  const setAppointments = (newAppointments: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    const updated = typeof newAppointments === 'function' ? newAppointments(appointments) : newAppointments;
    updateShopData({ appointments: updated });
  };

  const setSeasonalRentals = (newSeasonalRentals: SeasonalRental[] | ((prev: SeasonalRental[]) => SeasonalRental[])) => {
    const updated = typeof newSeasonalRentals === 'function' ? newSeasonalRentals(seasonalRentals) : newSeasonalRentals;
    updateShopData({ seasonalRentals: updated });
  };

  const setApparel = (newApparel: Apparel[] | ((prev: Apparel[]) => Apparel[])) => {
    const updated = typeof newApparel === 'function' ? newApparel(apparel) : newApparel;
    updateShopData({ apparel: updated });
  };

  const setLessons = (newLessons: Lesson[] | ((prev: Lesson[]) => Lesson[])) => {
    const updated = typeof newLessons === 'function' ? newLessons(lessons) : newLessons;
    updateShopData({ lessons: updated });
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill customer name
      if (params.customerName || params.name) {
        hasChanges = true;
      }

      // Prefill equipment details
      if (params.equipmentType || params.type || params.itemName) {
        hasChanges = true;
      }

      // Prefill service type
      if (params.serviceType) {
        hasChanges = true;
      }

      // Prefill rental dates
      if (params.startDate || params.endDate || params.rentalDays) {
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

  // Filtered data
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [equipment, searchTerm, filterType, filterStatus, filterCategory]);

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

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
      return matchesStatus;
    });
  }, [services, filterStatus]);

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

  const getEquipmentById = (id: string) => equipment.find((e) => e.id === id);
  const getCustomerById = (id: string) => customers.find((c) => c.id === id);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      sold: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      reserved: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'awaiting-pickup': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'no-show': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ski':
        return <Mountain className="w-4 h-4" />;
      case 'snowboard':
        return <Snowflake className="w-4 h-4" />;
      case 'boots':
        return <Package className="w-4 h-4" />;
      case 'bindings':
        return <Settings className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalInventory = equipment.length;
    const availableItems = equipment.filter((e) => e.status === 'available').length;
    const activeRentals = rentals.filter((r) => r.status === 'active').length;
    const pendingServices = services.filter((s) => s.status === 'pending' || s.status === 'in-progress').length;
    const todayAppointments = appointments.filter(
      (a) => a.date === new Date().toISOString().split('T')[0] && a.status !== 'cancelled'
    ).length;
    const inventoryValue = equipment.reduce((sum, e) => sum + e.price, 0);

    return {
      totalInventory,
      availableItems,
      activeRentals,
      pendingServices,
      todayAppointments,
      inventoryValue,
    };
  }, [equipment, rentals, services, appointments]);

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState<Partial<Equipment>>({
    name: '',
    type: 'ski',
    brand: '',
    model: '',
    size: '',
    condition: 'new',
    price: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    category: 'sale',
    status: 'available',
    sku: '',
    notes: '',
  });

  // Customer form state
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bootSize: '',
    height: '',
    weight: '',
    abilityLevel: 'beginner',
    seasonPassId: '',
    notes: '',
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState<Partial<ServiceTicket>>({
    equipmentId: '',
    customerId: '',
    serviceType: 'tune',
    status: 'pending',
    dinSetting: undefined,
    priority: 'normal',
    estimatedCost: 0,
    actualCost: 0,
    notes: '',
  });

  // Rental form state
  const [rentalForm, setRentalForm] = useState<Partial<RentalItem>>({
    equipmentId: '',
    customerId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    dailyRate: 0,
    totalCost: 0,
    depositPaid: 0,
    notes: '',
  });

  // CRUD operations
  const addEquipment = () => {
    const newEquipment: Equipment = {
      ...equipmentForm,
      id: generateId(),
    } as Equipment;
    setEquipment([...equipment, newEquipment]);
    setEquipmentForm({
      name: '',
      type: 'ski',
      brand: '',
      model: '',
      size: '',
      condition: 'new',
      price: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      category: 'sale',
      status: 'available',
      sku: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const deleteEquipment = (id: string) => {
    setEquipment(equipment.filter((e) => e.id !== id));
  };

  const addCustomer = () => {
    const newCustomer: Customer = {
      ...customerForm,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    } as Customer;
    setCustomers([...customers, newCustomer]);
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bootSize: '',
      height: '',
      weight: '',
      abilityLevel: 'beginner',
      seasonPassId: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const addService = () => {
    const newService: ServiceTicket = {
      ...serviceForm,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: '',
    } as ServiceTicket;
    setServices([...services, newService]);
    setServiceForm({
      equipmentId: '',
      customerId: '',
      serviceType: 'tune',
      status: 'pending',
      priority: 'normal',
      estimatedCost: 0,
      actualCost: 0,
      notes: '',
    });
    setShowAddModal(false);
  };

  const updateServiceStatus = (id: string, newStatus: ServiceTicket['status']) => {
    setServices(
      services.map((s) =>
        s.id === id
          ? {
              ...s,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : s.completedAt,
            }
          : s
      )
    );
  };

  const deleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const addRental = () => {
    const newRental: RentalItem = {
      ...rentalForm,
      id: generateId(),
    } as RentalItem;
    setRentals([...rentals, newRental]);

    // Update equipment status
    setEquipment(
      equipment.map((e) => (e.id === rentalForm.equipmentId ? { ...e, status: 'rented' as const } : e))
    );

    setRentalForm({
      equipmentId: '',
      customerId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      dailyRate: 0,
      totalCost: 0,
      depositPaid: 0,
      notes: '',
    });
    setShowAddModal(false);
  };

  const returnRental = (id: string) => {
    const rental = rentals.find((r) => r.id === id);
    if (rental) {
      setRentals(rentals.map((r) => (r.id === id ? { ...r, status: 'returned' as const } : r)));
      setEquipment(
        equipment.map((e) => (e.id === rental.equipmentId ? { ...e, status: 'available' as const } : e))
      );
    }
  };

  // Render tabs
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'rentals', label: 'Rentals', icon: <Calendar className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Clock className="w-4 h-4" /> },
    { id: 'seasonal', label: 'Seasonal', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'apparel', label: 'Apparel', icon: <Shirt className="w-4 h-4" /> },
    { id: 'lessons', label: 'Lessons', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  // Column configurations for export
  const EQUIPMENT_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'model', header: 'Model', type: 'string' },
    { key: 'size', header: 'Size', type: 'string' },
    { key: 'condition', header: 'Condition', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'sku', header: 'SKU', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const CUSTOMER_COLUMNS: ColumnConfig[] = [
    { key: 'firstName', header: 'First Name', type: 'string' },
    { key: 'lastName', header: 'Last Name', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'phone', header: 'Phone', type: 'string' },
    { key: 'bootSize', header: 'Boot Size', type: 'string' },
    { key: 'height', header: 'Height', type: 'string' },
    { key: 'weight', header: 'Weight', type: 'string' },
    { key: 'abilityLevel', header: 'Ability Level', type: 'string' },
    { key: 'seasonPassId', header: 'Season Pass ID', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
  ];

  const RENTAL_COLUMNS: ColumnConfig[] = [
    { key: 'equipmentId', header: 'Equipment ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'startDate', header: 'Start Date', type: 'date' },
    { key: 'endDate', header: 'End Date', type: 'date' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'dailyRate', header: 'Daily Rate', type: 'currency' },
    { key: 'totalCost', header: 'Total Cost', type: 'currency' },
    { key: 'depositPaid', header: 'Deposit Paid', type: 'currency' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const SERVICE_COLUMNS: ColumnConfig[] = [
    { key: 'equipmentId', header: 'Equipment ID', type: 'string' },
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'serviceType', header: 'Service Type', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'dinSetting', header: 'DIN Setting', type: 'number' },
    { key: 'priority', header: 'Priority', type: 'string' },
    { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
    { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
    { key: 'completedAt', header: 'Completed At', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const APPOINTMENT_COLUMNS: ColumnConfig[] = [
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'time', header: 'Time', type: 'string' },
    { key: 'duration', header: 'Duration (min)', type: 'number' },
    { key: 'staffMember', header: 'Staff Member', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const SEASONAL_RENTAL_COLUMNS: ColumnConfig[] = [
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'packageType', header: 'Package Type', type: 'string' },
    { key: 'startDate', header: 'Start Date', type: 'date' },
    { key: 'endDate', header: 'End Date', type: 'date' },
    { key: 'totalCost', header: 'Total Cost', type: 'currency' },
    { key: 'paymentStatus', header: 'Payment Status', type: 'string' },
    { key: 'swapsRemaining', header: 'Swaps Remaining', type: 'number' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const APPAREL_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'brand', header: 'Brand', type: 'string' },
    { key: 'size', header: 'Size', type: 'string' },
    { key: 'color', header: 'Color', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'sku', header: 'SKU', type: 'string' },
  ];

  const LESSON_COLUMNS: ColumnConfig[] = [
    { key: 'customerId', header: 'Customer ID', type: 'string' },
    { key: 'instructorId', header: 'Instructor ID', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'discipline', header: 'Discipline', type: 'string' },
    { key: 'level', header: 'Level', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'time', header: 'Time', type: 'string' },
    { key: 'duration', header: 'Duration (min)', type: 'number' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  // Get current data and columns based on active tab
  const getCurrentExportData = (): { data: any[]; columns: ColumnConfig[]; filename: string } => {
    switch (activeTab) {
      case 'inventory':
        return { data: filteredEquipment, columns: EQUIPMENT_COLUMNS, filename: 'ski_shop_inventory' };
      case 'rentals':
        return { data: rentals, columns: RENTAL_COLUMNS, filename: 'ski_shop_rentals' };
      case 'services':
        return { data: filteredServices, columns: SERVICE_COLUMNS, filename: 'ski_shop_services' };
      case 'customers':
        return { data: filteredCustomers, columns: CUSTOMER_COLUMNS, filename: 'ski_shop_customers' };
      case 'appointments':
        return { data: appointments, columns: APPOINTMENT_COLUMNS, filename: 'ski_shop_appointments' };
      case 'seasonal':
        return { data: seasonalRentals, columns: SEASONAL_RENTAL_COLUMNS, filename: 'ski_shop_seasonal_rentals' };
      case 'apparel':
        return { data: apparel, columns: APPAREL_COLUMNS, filename: 'ski_shop_apparel' };
      case 'lessons':
        return { data: lessons, columns: LESSON_COLUMNS, filename: 'ski_shop_lessons' };
      default:
        return { data: filteredEquipment, columns: EQUIPMENT_COLUMNS, filename: 'ski_shop_inventory' };
    }
  };

  // Export handlers - using the hook's export functions for current tab data
  const handleExportCSV = () => {
    const { filename } = getCurrentExportData();
    exportCSV({ filename });
  };

  const handleExportExcel = () => {
    const { filename } = getCurrentExportData();
    exportExcel({ filename });
  };

  const handleExportJSON = () => {
    const { filename } = getCurrentExportData();
    exportJSON({ filename });
  };

  const handleExportPDF = async () => {
    const { filename } = getCurrentExportData();
    await exportPDF({
      filename,
      title: `Ski Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return await copyToClipboard('tab');
  };

  const handlePrint = () => {
    print(`Ski Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Mountain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiShop.skiShopManager', 'Ski Shop Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.skiShop.equipmentRentalsServicesMore', 'Equipment, rentals, services & more')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="ski-shop" toolName="Ski Shop" />

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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                {t('tools.skiShop.addNew', 'Add New')}
              </button>
            </div>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-500 font-medium">{t('tools.skiShop.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-500" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.totalInventory', 'Total Inventory')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalInventory}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.available', 'Available')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.availableItems}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.activeRentals', 'Active Rentals')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeRentals}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-yellow-500" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.pendingServices', 'Pending Services')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingServices}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Today&apos;s Appts</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.todayAppointments}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.inventoryValue', 'Inventory Value')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${stats.inventoryValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('tools.skiShop.search', 'Search...')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {activeTab === 'inventory' && (
              <>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">{t('tools.skiShop.allTypes', 'All Types')}</option>
                  <option value="ski">{t('tools.skiShop.skis', 'Skis')}</option>
                  <option value="snowboard">{t('tools.skiShop.snowboards', 'Snowboards')}</option>
                  <option value="boots">{t('tools.skiShop.boots', 'Boots')}</option>
                  <option value="bindings">{t('tools.skiShop.bindings', 'Bindings')}</option>
                  <option value="poles">{t('tools.skiShop.poles', 'Poles')}</option>
                  <option value="helmet">{t('tools.skiShop.helmets', 'Helmets')}</option>
                  <option value="goggles">{t('tools.skiShop.goggles', 'Goggles')}</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">{t('tools.skiShop.allCategories', 'All Categories')}</option>
                  <option value="sale">{t('tools.skiShop.forSale', 'For Sale')}</option>
                  <option value="rental">{t('tools.skiShop.rental', 'Rental')}</option>
                  <option value="demo">{t('tools.skiShop.demo', 'Demo')}</option>
                  <option value="consignment">{t('tools.skiShop.consignment', 'Consignment')}</option>
                </select>
              </>
            )}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">{t('tools.skiShop.allStatus', 'All Status')}</option>
              <option value="available">{t('tools.skiShop.available2', 'Available')}</option>
              <option value="rented">{t('tools.skiShop.rented', 'Rented')}</option>
              <option value="maintenance">{t('tools.skiShop.maintenance', 'Maintenance')}</option>
              <option value="sold">{t('tools.skiShop.sold', 'Sold')}</option>
              <option value="reserved">{t('tools.skiShop.reserved', 'Reserved')}</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Equipment Inventory ({filteredEquipment.length})
                </h2>
              </div>

              {filteredEquipment.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noEquipmentFound', 'No equipment found')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEquipment.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} overflow-hidden`}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.brand} {item.model} - Size: {item.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${item.price}
                          </span>
                          {expandedItems.has(item.id) ? (
                            <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                      </div>
                      {expandedItems.has(item.id) && (
                        <div className={`p-4 border-t ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.sku', 'SKU')}</span>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.sku}</p>
                            </div>
                            <div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.condition', 'Condition')}</span>
                              <p className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.condition}</p>
                            </div>
                            <div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.category', 'Category')}</span>
                              <p className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.category}</p>
                            </div>
                            <div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.purchaseDate', 'Purchase Date')}</span>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.purchaseDate}</p>
                            </div>
                          </div>
                          {item.notes && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                              {item.notes}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item.id);
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                                isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              <Edit2 className="w-4 h-4" />
                              {t('tools.skiShop.edit', 'Edit')}
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const confirmed = await confirm({
                                  title: 'Confirm Delete',
                                  message: 'Are you sure you want to delete this item?',
                                  confirmText: 'Yes',
                                  cancelText: 'Cancel',
                                  variant: 'danger'
                                });
                                if (confirmed) {
                                  deleteEquipment(item.id);
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rentals Tab */}
          {activeTab === 'rentals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiShop.rentalManagement', 'Rental Management')}
                </h2>
              </div>

              {rentals.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noActiveRentals', 'No active rentals')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.skiShop.createRental', 'Create Rental')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rentals.map((rental) => {
                    const equipmentItem = getEquipmentById(rental.equipmentId);
                    const customer = getCustomerById(rental.customerId);
                    return (
                      <div
                        key={rental.id}
                        className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {equipmentItem?.name || 'Unknown Equipment'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Rented by: {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {rental.startDate} to {rental.endDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rental.status)}`}>
                              {rental.status}
                            </span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${rental.totalCost}
                            </span>
                            {rental.status === 'active' && (
                              <button
                                onClick={() => returnRental(rental.id)}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                              >
                                {t('tools.skiShop.return', 'Return')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Service Tickets ({filteredServices.length})
                </h2>
              </div>

              {/* Service Type Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { type: 'tune', label: 'Tune-up', icon: <Wrench className="w-3 h-3" /> },
                  { type: 'wax', label: 'Wax', icon: <Droplets className="w-3 h-3" /> },
                  { type: 'mount', label: 'Binding Mount', icon: <Settings className="w-3 h-3" /> },
                  { type: 'binding-adjustment', label: 'DIN Adjustment', icon: <Settings className="w-3 h-3" /> },
                  { type: 'repair', label: 'Repair', icon: <Wrench className="w-3 h-3" /> },
                  { type: 'boot-fitting', label: 'Boot Fitting', icon: <Package className="w-3 h-3" /> },
                ].map((item) => (
                  <span
                    key={item.type}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </span>
                ))}
              </div>

              {filteredServices.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noServiceTicketsFound', 'No service tickets found')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredServices.map((service) => {
                    const equipmentItem = getEquipmentById(service.equipmentId);
                    const customer = getCustomerById(service.customerId);
                    return (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              service.priority === 'rush' ? 'bg-red-100 dark:bg-red-900/30' :
                              service.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                              isDark ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              <Wrench className={`w-5 h-5 ${
                                service.priority === 'rush' ? 'text-red-600' :
                                service.priority === 'high' ? 'text-orange-600' :
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {service.serviceType.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h3>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {equipmentItem?.name || 'Unknown Equipment'} - {customer ? `${customer.firstName} ${customer.lastName}` : 'Walk-in'}
                              </p>
                              {service.dinSetting && (
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  DIN Setting: {service.dinSetting}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                              {service.status.replace('-', ' ')}
                            </span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${service.estimatedCost}
                            </span>
                            <select
                              value={service.status}
                              onChange={(e) => updateServiceStatus(service.id, e.target.value as ServiceTicket['status'])}
                              className={`px-2 py-1 text-sm rounded-lg border ${
                                isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="pending">{t('tools.skiShop.pending', 'Pending')}</option>
                              <option value="in-progress">{t('tools.skiShop.inProgress', 'In Progress')}</option>
                              <option value="completed">{t('tools.skiShop.completed', 'Completed')}</option>
                              <option value="awaiting-pickup">{t('tools.skiShop.awaitingPickup', 'Awaiting Pickup')}</option>
                            </select>
                            <button
                              onClick={() => deleteService(service.id)}
                              className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
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
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Customer Profiles ({filteredCustomers.length})
                </h2>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noCustomersFound', 'No customers found')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <User className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {customer.firstName} {customer.lastName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              customer.abilityLevel === 'expert' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              customer.abilityLevel === 'advanced' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              customer.abilityLevel === 'intermediate' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                            }`}>
                              {customer.abilityLevel}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{customer.phone}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.boot', 'Boot')}</span>
                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.bootSize}</p>
                          </div>
                          <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.height', 'Height')}</span>
                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.height}</p>
                          </div>
                          <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiShop.weight', 'Weight')}</span>
                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.weight}</p>
                          </div>
                        </div>
                        {customer.seasonPassId && (
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <CreditCard className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Pass: {customer.seasonPassId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiShop.appointments', 'Appointments')}
                </h2>
              </div>

              {appointments.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noAppointmentsScheduled', 'No appointments scheduled')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.skiShop.scheduleAppointment', 'Schedule Appointment')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const customer = getCustomerById(apt.customerId);
                    return (
                      <div
                        key={apt.id}
                        className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {apt.type.replace('-', ' ')}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'} - {apt.date} at {apt.time}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Seasonal Tab */}
          {activeTab === 'seasonal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiShop.seasonalRentalPrograms', 'Seasonal Rental Programs')}
                </h2>
              </div>

              {/* Package Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { type: 'Junior', price: '$199', desc: 'Skis, boots, poles - Free size swaps', color: 'from-green-500 to-emerald-500' },
                  { type: 'Adult', price: '$299', desc: 'Skis or board, boots, poles/bindings', color: 'from-blue-500 to-cyan-500' },
                  { type: 'Performance', price: '$449', desc: 'High-end equipment, unlimited swaps', color: 'from-purple-500 to-pink-500' },
                ].map((pkg) => (
                  <div
                    key={pkg.type}
                    className={`p-4 rounded-xl bg-gradient-to-br ${pkg.color} text-white`}
                  >
                    <h3 className="text-lg font-bold">{pkg.type} Package</h3>
                    <p className="text-3xl font-bold mt-2">{pkg.price}</p>
                    <p className="text-sm opacity-90 mt-1">{pkg.desc}</p>
                  </div>
                ))}
              </div>

              {seasonalRentals.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Snowflake className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noSeasonalRentalsActive', 'No seasonal rentals active')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {seasonalRentals.map((rental) => {
                    const customer = getCustomerById(rental.customerId);
                    return (
                      <div
                        key={rental.id}
                        className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {rental.packageType} Package
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {rental.startDate} - {rental.endDate} | Swaps remaining: {rental.swapsRemaining}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rental.paymentStatus)}`}>
                              {rental.paymentStatus}
                            </span>
                            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${rental.totalCost}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Apparel Tab */}
          {activeTab === 'apparel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiShop.apparelInventory', 'Apparel Inventory')}
                </h2>
              </div>

              {apparel.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Shirt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noApparelInInventory', 'No apparel in inventory')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.skiShop.addApparel', 'Add Apparel')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apparel.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.brand} - {item.color} - Size: {item.size}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${item.price}</span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiShop.lessonCoordination', 'Lesson Coordination')}
                </h2>
              </div>

              {/* Lesson Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { type: 'Private', price: '$150/hr', desc: 'One-on-one instruction' },
                  { type: 'Group', price: '$75/hr', desc: 'Up to 6 students' },
                  { type: 'Kids Camp', price: '$120/day', desc: 'Full day program (ages 4-12)' },
                ].map((lesson) => (
                  <div
                    key={lesson.type}
                    className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lesson.type}</h3>
                    <p className="text-2xl font-bold text-blue-500 mt-1">{lesson.price}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{lesson.desc}</p>
                  </div>
                ))}
              </div>

              {lessons.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('tools.skiShop.noLessonsScheduled', 'No lessons scheduled')}</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.skiShop.scheduleLesson', 'Schedule Lesson')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson) => {
                    const customer = getCustomerById(lesson.customerId);
                    return (
                      <div
                        key={lesson.id}
                        className={`border rounded-lg p-4 ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {lesson.type} {lesson.discipline} Lesson
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'} - {lesson.level}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {lesson.date} at {lesson.time} ({lesson.duration} min)
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                              {lesson.status}
                            </span>
                            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${lesson.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Add New {activeTab === 'inventory' ? 'Equipment' : activeTab === 'customers' ? 'Customer' : activeTab === 'services' ? 'Service Ticket' : activeTab === 'rentals' ? t('tools.skiShop.rental3', 'Rental') : t('tools.skiShop.item', 'Item')}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Equipment Form */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.name', 'Name *')}
                      </label>
                      <input
                        type="text"
                        value={equipmentForm.name}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.type', 'Type *')}
                      </label>
                      <select
                        value={equipmentForm.type}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value as Equipment['type'] })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="ski">{t('tools.skiShop.ski', 'Ski')}</option>
                        <option value="snowboard">{t('tools.skiShop.snowboard', 'Snowboard')}</option>
                        <option value="boots">{t('tools.skiShop.boots2', 'Boots')}</option>
                        <option value="bindings">{t('tools.skiShop.bindings2', 'Bindings')}</option>
                        <option value="poles">{t('tools.skiShop.poles2', 'Poles')}</option>
                        <option value="helmet">{t('tools.skiShop.helmet', 'Helmet')}</option>
                        <option value="goggles">{t('tools.skiShop.goggles2', 'Goggles')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.brand', 'Brand')}
                      </label>
                      <input
                        type="text"
                        value={equipmentForm.brand}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, brand: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.model', 'Model')}
                      </label>
                      <input
                        type="text"
                        value={equipmentForm.model}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.size', 'Size')}
                      </label>
                      <input
                        type="text"
                        value={equipmentForm.size}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, size: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.condition2', 'Condition')}
                      </label>
                      <select
                        value={equipmentForm.condition}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, condition: e.target.value as Equipment['condition'] })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="new">{t('tools.skiShop.new', 'New')}</option>
                        <option value="excellent">{t('tools.skiShop.excellent', 'Excellent')}</option>
                        <option value="good">{t('tools.skiShop.good', 'Good')}</option>
                        <option value="fair">{t('tools.skiShop.fair', 'Fair')}</option>
                        <option value="poor">{t('tools.skiShop.poor', 'Poor')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.price', 'Price ($)')}
                      </label>
                      <input
                        type="number"
                        value={equipmentForm.price}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, price: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.category2', 'Category')}
                      </label>
                      <select
                        value={equipmentForm.category}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value as Equipment['category'] })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="sale">{t('tools.skiShop.forSale2', 'For Sale')}</option>
                        <option value="rental">{t('tools.skiShop.rental2', 'Rental')}</option>
                        <option value="demo">{t('tools.skiShop.demo2', 'Demo')}</option>
                        <option value="consignment">{t('tools.skiShop.consignment2', 'Consignment')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.sku2', 'SKU')}
                      </label>
                      <input
                        type="text"
                        value={equipmentForm.sku}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, sku: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.skiShop.notes', 'Notes')}
                    </label>
                    <textarea
                      value={equipmentForm.notes}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, notes: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <button
                    onClick={addEquipment}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    {t('tools.skiShop.addEquipment', 'Add Equipment')}
                  </button>
                </div>
              )}

              {/* Customer Form */}
              {activeTab === 'customers' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.firstName', 'First Name *')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.firstName}
                        onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.lastName', 'Last Name *')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.lastName}
                        onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.email', 'Email')}
                      </label>
                      <input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.bootSize', 'Boot Size')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.bootSize}
                        onChange={(e) => setCustomerForm({ ...customerForm, bootSize: e.target.value })}
                        placeholder="e.g., 27.5"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.height2', 'Height')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.height}
                        onChange={(e) => setCustomerForm({ ...customerForm, height: e.target.value })}
                        placeholder={t('tools.skiShop.eG5ft10in', 'e.g., 5ft 10in')}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.weight2', 'Weight')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.weight}
                        onChange={(e) => setCustomerForm({ ...customerForm, weight: e.target.value })}
                        placeholder={t('tools.skiShop.eG175Lbs', 'e.g., 175 lbs')}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.abilityLevel', 'Ability Level')}
                      </label>
                      <select
                        value={customerForm.abilityLevel}
                        onChange={(e) => setCustomerForm({ ...customerForm, abilityLevel: e.target.value as Customer['abilityLevel'] })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="beginner">{t('tools.skiShop.beginner', 'Beginner')}</option>
                        <option value="intermediate">{t('tools.skiShop.intermediate', 'Intermediate')}</option>
                        <option value="advanced">{t('tools.skiShop.advanced', 'Advanced')}</option>
                        <option value="expert">{t('tools.skiShop.expert', 'Expert')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.seasonPassId', 'Season Pass ID')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.seasonPassId}
                        onChange={(e) => setCustomerForm({ ...customerForm, seasonPassId: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.skiShop.notes2', 'Notes')}
                    </label>
                    <textarea
                      value={customerForm.notes}
                      onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <button
                    onClick={addCustomer}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    {t('tools.skiShop.addCustomer', 'Add Customer')}
                  </button>
                </div>
              )}

              {/* Service Ticket Form */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.equipment', 'Equipment *')}
                      </label>
                      <select
                        value={serviceForm.equipmentId}
                        onChange={(e) => setServiceForm({ ...serviceForm, equipmentId: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">{t('tools.skiShop.selectEquipment', 'Select equipment...')}</option>
                        {equipment.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.name} ({eq.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.customer', 'Customer')}
                      </label>
                      <select
                        value={serviceForm.customerId}
                        onChange={(e) => setServiceForm({ ...serviceForm, customerId: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">{t('tools.skiShop.walkInCustomer', 'Walk-in customer')}</option>
                        {customers.map((cust) => (
                          <option key={cust.id} value={cust.id}>
                            {cust.firstName} {cust.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.serviceType', 'Service Type *')}
                      </label>
                      <select
                        value={serviceForm.serviceType}
                        onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value as ServiceTicket['serviceType'] })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="tune">{t('tools.skiShop.tuneUp', 'Tune-up')}</option>
                        <option value="wax">{t('tools.skiShop.waxOnly', 'Wax Only')}</option>
                        <option value="mount">{t('tools.skiShop.bindingMount', 'Binding Mount')}</option>
                        <option value="binding-adjustment">{t('tools.skiShop.bindingDinAdjustment', 'Binding/DIN Adjustment')}</option>
                        <option value="repair">{t('tools.skiShop.repair', 'Repair')}</option>
                        <option value="boot-fitting">{t('tools.skiShop.bootFitting', 'Boot Fitting')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.priority', 'Priority')}
                      </label>
                      <select
                        value={serviceForm.priority}
                        onChange={(e) => setServiceForm({ ...serviceForm, priority: e.target.value as ServiceTicket['priority'] })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="low">{t('tools.skiShop.low', 'Low')}</option>
                        <option value="normal">{t('tools.skiShop.normal', 'Normal')}</option>
                        <option value="high">{t('tools.skiShop.high', 'High')}</option>
                        <option value="rush">{t('tools.skiShop.rush20', 'Rush (+$20)')}</option>
                      </select>
                    </div>
                  </div>
                  {serviceForm.serviceType === 'binding-adjustment' && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.dinSetting', 'DIN Setting')}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="18"
                        value={serviceForm.dinSetting || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, dinSetting: parseFloat(e.target.value) || undefined })}
                        placeholder="e.g., 7.5"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  )}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.skiShop.estimatedCost', 'Estimated Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={serviceForm.estimatedCost}
                      onChange={(e) => setServiceForm({ ...serviceForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.skiShop.notes3', 'Notes')}
                    </label>
                    <textarea
                      value={serviceForm.notes}
                      onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <button
                    onClick={addService}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    {t('tools.skiShop.createServiceTicket', 'Create Service Ticket')}
                  </button>
                </div>
              )}

              {/* Rental Form */}
              {activeTab === 'rentals' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.equipment2', 'Equipment *')}
                      </label>
                      <select
                        value={rentalForm.equipmentId}
                        onChange={(e) => setRentalForm({ ...rentalForm, equipmentId: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">{t('tools.skiShop.selectEquipment2', 'Select equipment...')}</option>
                        {equipment
                          .filter((eq) => eq.category === 'rental' && eq.status === 'available')
                          .map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              {eq.name} - Size: {eq.size}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.customer2', 'Customer *')}
                      </label>
                      <select
                        value={rentalForm.customerId}
                        onChange={(e) => setRentalForm({ ...rentalForm, customerId: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">{t('tools.skiShop.selectCustomer', 'Select customer...')}</option>
                        {customers.map((cust) => (
                          <option key={cust.id} value={cust.id}>
                            {cust.firstName} {cust.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.startDate', 'Start Date *')}
                      </label>
                      <input
                        type="date"
                        value={rentalForm.startDate}
                        onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.endDate', 'End Date *')}
                      </label>
                      <input
                        type="date"
                        value={rentalForm.endDate}
                        onChange={(e) => setRentalForm({ ...rentalForm, endDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.dailyRate', 'Daily Rate ($)')}
                      </label>
                      <input
                        type="number"
                        value={rentalForm.dailyRate}
                        onChange={(e) => setRentalForm({ ...rentalForm, dailyRate: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.totalCost', 'Total Cost ($)')}
                      </label>
                      <input
                        type="number"
                        value={rentalForm.totalCost}
                        onChange={(e) => setRentalForm({ ...rentalForm, totalCost: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.skiShop.deposit', 'Deposit ($)')}
                      </label>
                      <input
                        type="number"
                        value={rentalForm.depositPaid}
                        onChange={(e) => setRentalForm({ ...rentalForm, depositPaid: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.skiShop.notes4', 'Notes')}
                    </label>
                    <textarea
                      value={rentalForm.notes}
                      onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <button
                    onClick={addRental}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    {t('tools.skiShop.createRental2', 'Create Rental')}
                  </button>
                </div>
              )}

              {/* Other tabs placeholder */}
              {!['inventory', 'customers', 'services', 'rentals'].includes(activeTab) && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Form for {activeTab} coming soon...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default SkiShopTool;
