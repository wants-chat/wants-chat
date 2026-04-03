'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Flower2,
  Leaf,
  Package,
  Users,
  Calendar,
  ShoppingCart,
  Shield,
  Truck,
  Layers,
  Snowflake,
  GraduationCap,
  Cloud,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Sun,
  Droplets,
  TreeDeciduous,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface GardenCenterToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Plant {
  id: string;
  name: string;
  type: 'annual' | 'perennial' | 'shrub' | 'tree' | 'succulent' | 'herb' | 'vegetable' | 'houseplant';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  careLevel: 'easy' | 'moderate' | 'expert';
  price: number;
  quantity: number;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  sunRequirement: 'full-sun' | 'partial-shade' | 'shade';
  waterNeeds: 'low' | 'moderate' | 'high';
  notes: string;
}

interface GardenSupply {
  id: string;
  name: string;
  category: 'soil' | 'fertilizer' | 'tools' | 'pots' | 'seeds' | 'pesticides' | 'irrigation' | 'other';
  price: number;
  quantity: number;
  unit: string;
  reorderLevel: number;
}

interface CustomerAdvice {
  id: string;
  customerName: string;
  date: string;
  topic: string;
  notes: string;
  followUpDate?: string;
}

interface Consultation {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  type: 'landscape-design' | 'plant-selection' | 'garden-maintenance' | 'hardscape' | 'irrigation';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

interface SpecialOrder {
  id: string;
  customerName: string;
  plantName: string;
  quantity: number;
  status: 'pending' | 'ordered' | 'arrived' | 'delivered';
  orderDate: string;
  expectedArrival: string;
  notes: string;
}

interface PlantGuarantee {
  id: string;
  plantName: string;
  customerName: string;
  purchaseDate: string;
  expirationDate: string;
  status: 'active' | 'claimed' | 'expired';
  claimNotes?: string;
}

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  date: string;
  timeSlot: string;
  items: string;
  status: 'scheduled' | 'in-transit' | 'delivered' | 'cancelled';
  notes: string;
}

interface HardscapeItem {
  id: string;
  name: string;
  type: 'pavers' | 'stone' | 'gravel' | 'mulch' | 'edging' | 'boulders' | 'retaining-wall' | 'other';
  unit: string;
  pricePerUnit: number;
  quantityInStock: number;
  color: string;
}

interface HolidayPlan {
  id: string;
  holiday: string;
  year: number;
  startDate: string;
  endDate: string;
  products: string;
  marketingNotes: string;
  status: 'planning' | 'active' | 'completed';
}

interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  instructor: string;
  capacity: number;
  enrolled: number;
  price: number;
  description: string;
  status: 'scheduled' | 'full' | 'completed' | 'cancelled';
}

interface WeatherImpact {
  id: string;
  date: string;
  weatherEvent: 'frost' | 'heatwave' | 'storm' | 'drought' | 'heavy-rain' | 'hail';
  severity: 'low' | 'medium' | 'high';
  affectedAreas: string;
  actionsTaken: string;
  financialImpact: number;
}

interface SalesRecord {
  id: string;
  date: string;
  category: 'plants' | 'supplies' | 'hardscape' | 'services' | 'workshops';
  amount: number;
  notes: string;
}

type TabType = 'plants' | 'supplies' | 'advice' | 'consultations' | 'orders' | 'guarantees' | 'deliveries' | 'hardscape' | 'holidays' | 'workshops' | 'weather' | 'sales';

// Wrapper interface for useToolData - stores all garden center data as a single record
interface GardenCenterData {
  id: string;
  plants: Plant[];
  supplies: GardenSupply[];
  advice: CustomerAdvice[];
  consultations: Consultation[];
  orders: SpecialOrder[];
  guarantees: PlantGuarantee[];
  deliveries: Delivery[];
  hardscape: HardscapeItem[];
  holidays: HolidayPlan[];
  workshops: Workshop[];
  weather: WeatherImpact[];
  sales: SalesRecord[];
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Backwards compatibility alias
const gardenCenterColumns = COLUMNS;

const defaultGardenData: GardenCenterData = {
  id: 'garden-center-main',
  plants: [],
  supplies: [],
  advice: [],
  consultations: [],
  orders: [],
  guarantees: [],
  deliveries: [],
  hardscape: [],
  holidays: [],
  workshops: [],
  weather: [],
  sales: [],
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const GardenCenterTool: React.FC<GardenCenterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('plants');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence with localStorage fallback
  const {
    data: toolDataArray,
    addItem,
    updateItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<GardenCenterData>(
    'garden-center',
    [defaultGardenData],
    gardenCenterColumns,
    { autoSave: true }
  );

  // Extract the main data record (always first item in array)
  const data = toolDataArray[0] || defaultGardenData;

  // Helper function to update data through the hook
  const saveData = (newData: GardenCenterData) => {
    if (toolDataArray.length === 0) {
      addItem(newData);
    } else {
      updateItem(data.id, newData);
    }
  };

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill plant name
      if (params.plantName || params.itemName || params.name) {
        hasChanges = true;
      }

      // Prefill customer name
      if (params.customerName) {
        hasChanges = true;
      }

      // Prefill price
      if (params.price || params.amount) {
        hasChanges = true;
      }

      // Prefill quantity
      if (params.quantity) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Plant form state
  const [plantForm, setPlantForm] = useState<Partial<Plant>>({
    name: '',
    type: 'perennial',
    size: 'medium',
    careLevel: 'moderate',
    price: 0,
    quantity: 0,
    season: 'all-season',
    sunRequirement: 'full-sun',
    waterNeeds: 'moderate',
    notes: '',
  });

  // Supply form state
  const [supplyForm, setSupplyForm] = useState<Partial<GardenSupply>>({
    name: '',
    category: 'soil',
    price: 0,
    quantity: 0,
    unit: 'bag',
    reorderLevel: 10,
  });

  // Advice form state
  const [adviceForm, setAdviceForm] = useState<Partial<CustomerAdvice>>({
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    topic: '',
    notes: '',
    followUpDate: '',
  });

  // Consultation form state
  const [consultationForm, setConsultationForm] = useState<Partial<Consultation>>({
    customerName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'landscape-design',
    status: 'scheduled',
    notes: '',
  });

  // Special order form state
  const [orderForm, setOrderForm] = useState<Partial<SpecialOrder>>({
    customerName: '',
    plantName: '',
    quantity: 1,
    status: 'pending',
    orderDate: new Date().toISOString().split('T')[0],
    expectedArrival: '',
    notes: '',
  });

  // Guarantee form state
  const [guaranteeForm, setGuaranteeForm] = useState<Partial<PlantGuarantee>>({
    plantName: '',
    customerName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    status: 'active',
    claimNotes: '',
  });

  // Delivery form state
  const [deliveryForm, setDeliveryForm] = useState<Partial<Delivery>>({
    customerName: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'morning',
    items: '',
    status: 'scheduled',
    notes: '',
  });

  // Hardscape form state
  const [hardscapeForm, setHardscapeForm] = useState<Partial<HardscapeItem>>({
    name: '',
    type: 'pavers',
    unit: 'sq ft',
    pricePerUnit: 0,
    quantityInStock: 0,
    color: '',
  });

  // Holiday form state
  const [holidayForm, setHolidayForm] = useState<Partial<HolidayPlan>>({
    holiday: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    products: '',
    marketingNotes: '',
    status: 'planning',
  });

  // Workshop form state
  const [workshopForm, setWorkshopForm] = useState<Partial<Workshop>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    instructor: '',
    capacity: 20,
    enrolled: 0,
    price: 0,
    description: '',
    status: 'scheduled',
  });

  // Weather form state
  const [weatherForm, setWeatherForm] = useState<Partial<WeatherImpact>>({
    date: new Date().toISOString().split('T')[0],
    weatherEvent: 'frost',
    severity: 'medium',
    affectedAreas: '',
    actionsTaken: '',
    financialImpact: 0,
  });

  // Sales form state
  const [salesForm, setSalesForm] = useState<Partial<SalesRecord>>({
    date: new Date().toISOString().split('T')[0],
    category: 'plants',
    amount: 0,
    notes: '',
  });

  // Filter states
  const [plantTypeFilter, setPlantTypeFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');

  // Memoized filtered data
  const filteredPlants = useMemo(() => {
    return data.plants.filter((plant: Plant) => {
      const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = plantTypeFilter === 'all' || plant.type === plantTypeFilter;
      const matchesSeason = seasonFilter === 'all' || plant.season === seasonFilter;
      return matchesSearch && matchesType && matchesSeason;
    });
  }, [data.plants, searchTerm, plantTypeFilter, seasonFilter]);

  const filteredSupplies = useMemo(() => {
    return data.supplies.filter((supply: GardenSupply) =>
      supply.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.supplies, searchTerm]);

  // Sales analytics
  const salesByCategory = useMemo(() => {
    const categories: Record<string, number> = {
      plants: 0,
      supplies: 0,
      hardscape: 0,
      services: 0,
      workshops: 0,
    };
    data.sales.forEach((sale: SalesRecord) => {
      if (categories[sale.category] !== undefined) {
        categories[sale.category] += sale.amount;
      }
    });
    return categories;
  }, [data.sales]);

  const totalSales = useMemo(() => {
    return data.sales.reduce((sum: number, sale: SalesRecord) => sum + sale.amount, 0);
  }, [data.sales]);

  // Low stock alerts
  const lowStockSupplies = useMemo(() => {
    return data.supplies.filter((supply: GardenSupply) => supply.quantity <= supply.reorderLevel);
  }, [data.supplies]);

  // CRUD Operations
  const handleSavePlant = () => {
    if (!plantForm.name) return;

    const newPlants = editingId
      ? data.plants.map((p: Plant) => (p.id === editingId ? { ...plantForm, id: editingId } : p))
      : [...data.plants, { ...plantForm, id: generateId() }];

    saveData({ ...data, plants: newPlants });
    resetForm();
  };

  const handleSaveSupply = () => {
    if (!supplyForm.name) return;

    const newSupplies = editingId
      ? data.supplies.map((s: GardenSupply) => (s.id === editingId ? { ...supplyForm, id: editingId } : s))
      : [...data.supplies, { ...supplyForm, id: generateId() }];

    saveData({ ...data, supplies: newSupplies });
    resetForm();
  };

  const handleSaveAdvice = () => {
    if (!adviceForm.customerName || !adviceForm.topic) return;

    const newAdvice = editingId
      ? data.advice.map((a: CustomerAdvice) => (a.id === editingId ? { ...adviceForm, id: editingId } : a))
      : [...data.advice, { ...adviceForm, id: generateId() }];

    saveData({ ...data, advice: newAdvice });
    resetForm();
  };

  const handleSaveConsultation = () => {
    if (!consultationForm.customerName || !consultationForm.date) return;

    const newConsultations = editingId
      ? data.consultations.map((c: Consultation) => (c.id === editingId ? { ...consultationForm, id: editingId } : c))
      : [...data.consultations, { ...consultationForm, id: generateId() }];

    saveData({ ...data, consultations: newConsultations });
    resetForm();
  };

  const handleSaveOrder = () => {
    if (!orderForm.customerName || !orderForm.plantName) return;

    const newOrders = editingId
      ? data.orders.map((o: SpecialOrder) => (o.id === editingId ? { ...orderForm, id: editingId } : o))
      : [...data.orders, { ...orderForm, id: generateId() }];

    saveData({ ...data, orders: newOrders });
    resetForm();
  };

  const handleSaveGuarantee = () => {
    if (!guaranteeForm.plantName || !guaranteeForm.customerName) return;

    const newGuarantees = editingId
      ? data.guarantees.map((g: PlantGuarantee) => (g.id === editingId ? { ...guaranteeForm, id: editingId } : g))
      : [...data.guarantees, { ...guaranteeForm, id: generateId() }];

    saveData({ ...data, guarantees: newGuarantees });
    resetForm();
  };

  const handleSaveDelivery = () => {
    if (!deliveryForm.customerName || !deliveryForm.address) return;

    const newDeliveries = editingId
      ? data.deliveries.map((d: Delivery) => (d.id === editingId ? { ...deliveryForm, id: editingId } : d))
      : [...data.deliveries, { ...deliveryForm, id: generateId() }];

    saveData({ ...data, deliveries: newDeliveries });
    resetForm();
  };

  const handleSaveHardscape = () => {
    if (!hardscapeForm.name) return;

    const newHardscape = editingId
      ? data.hardscape.map((h: HardscapeItem) => (h.id === editingId ? { ...hardscapeForm, id: editingId } : h))
      : [...data.hardscape, { ...hardscapeForm, id: generateId() }];

    saveData({ ...data, hardscape: newHardscape });
    resetForm();
  };

  const handleSaveHoliday = () => {
    if (!holidayForm.holiday) return;

    const newHolidays = editingId
      ? data.holidays.map((h: HolidayPlan) => (h.id === editingId ? { ...holidayForm, id: editingId } : h))
      : [...data.holidays, { ...holidayForm, id: generateId() }];

    saveData({ ...data, holidays: newHolidays });
    resetForm();
  };

  const handleSaveWorkshop = () => {
    if (!workshopForm.title) return;

    const newWorkshops = editingId
      ? data.workshops.map((w: Workshop) => (w.id === editingId ? { ...workshopForm, id: editingId } : w))
      : [...data.workshops, { ...workshopForm, id: generateId() }];

    saveData({ ...data, workshops: newWorkshops });
    resetForm();
  };

  const handleSaveWeather = () => {
    if (!weatherForm.date || !weatherForm.weatherEvent) return;

    const newWeather = editingId
      ? data.weather.map((w: WeatherImpact) => (w.id === editingId ? { ...weatherForm, id: editingId } : w))
      : [...data.weather, { ...weatherForm, id: generateId() }];

    saveData({ ...data, weather: newWeather });
    resetForm();
  };

  const handleSaveSales = () => {
    if (!salesForm.date || !salesForm.amount) return;

    const newSales = editingId
      ? data.sales.map((s: SalesRecord) => (s.id === editingId ? { ...salesForm, id: editingId } : s))
      : [...data.sales, { ...salesForm, id: generateId() }];

    saveData({ ...data, sales: newSales });
    resetForm();
  };

  const handleDelete = (type: TabType, id: string) => {
    const newData = { ...data };
    newData[type] = data[type].filter((item: { id: string }) => item.id !== id);
    saveData(newData);
  };

  const handleEdit = (type: TabType, item: any) => {
    setEditingId(item.id);
    setShowForm(true);

    switch (type) {
      case 'plants':
        setPlantForm(item);
        break;
      case 'supplies':
        setSupplyForm(item);
        break;
      case 'advice':
        setAdviceForm(item);
        break;
      case 'consultations':
        setConsultationForm(item);
        break;
      case 'orders':
        setOrderForm(item);
        break;
      case 'guarantees':
        setGuaranteeForm(item);
        break;
      case 'deliveries':
        setDeliveryForm(item);
        break;
      case 'hardscape':
        setHardscapeForm(item);
        break;
      case 'holidays':
        setHolidayForm(item);
        break;
      case 'workshops':
        setWorkshopForm(item);
        break;
      case 'weather':
        setWeatherForm(item);
        break;
      case 'sales':
        setSalesForm(item);
        break;
    }
  };

  const clearFormData = () => {
    setPlantForm({
      name: '',
      type: 'perennial',
      size: 'medium',
      careLevel: 'moderate',
      price: 0,
      quantity: 0,
      season: 'all-season',
      sunRequirement: 'full-sun',
      waterNeeds: 'moderate',
      notes: '',
    });
    setSupplyForm({
      name: '',
      category: 'soil',
      price: 0,
      quantity: 0,
      unit: 'bag',
      reorderLevel: 10,
    });
    setAdviceForm({
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      topic: '',
      notes: '',
      followUpDate: '',
    });
    setConsultationForm({
      customerName: '',
      email: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'landscape-design',
      status: 'scheduled',
      notes: '',
    });
    setOrderForm({
      customerName: '',
      plantName: '',
      quantity: 1,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      expectedArrival: '',
      notes: '',
    });
    setGuaranteeForm({
      plantName: '',
      customerName: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      status: 'active',
      claimNotes: '',
    });
    setDeliveryForm({
      customerName: '',
      address: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'morning',
      items: '',
      status: 'scheduled',
      notes: '',
    });
    setHardscapeForm({
      name: '',
      type: 'pavers',
      unit: 'sq ft',
      pricePerUnit: 0,
      quantityInStock: 0,
      color: '',
    });
    setHolidayForm({
      holiday: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      products: '',
      marketingNotes: '',
      status: 'planning',
    });
    setWorkshopForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      instructor: '',
      capacity: 20,
      enrolled: 0,
      price: 0,
      description: '',
      status: 'scheduled',
    });
    setWeatherForm({
      date: new Date().toISOString().split('T')[0],
      weatherEvent: 'frost',
      severity: 'medium',
      affectedAreas: '',
      actionsTaken: '',
      financialImpact: 0,
    });
    setSalesForm({
      date: new Date().toISOString().split('T')[0],
      category: 'plants',
      amount: 0,
      notes: '',
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    clearFormData();
  };

  const tabs = [
    { id: 'plants', label: 'Plants', icon: Flower2 },
    { id: 'supplies', label: 'Supplies', icon: Package },
    { id: 'advice', label: 'Advice', icon: Users },
    { id: 'consultations', label: 'Consultations', icon: Calendar },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'guarantees', label: 'Guarantees', icon: Shield },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'hardscape', label: 'Hardscape', icon: Layers },
    { id: 'holidays', label: 'Holidays', icon: Snowflake },
    { id: 'workshops', label: 'Workshops', icon: GraduationCap },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'sales', label: 'Sales', icon: BarChart3 },
  ];

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`;

  const selectClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
  }`;

  const cardClass = `p-4 rounded-lg border ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } shadow-sm`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'scheduled':
      case 'completed':
      case 'delivered':
        return 'text-green-500';
      case 'pending':
      case 'ordered':
      case 'in-transit':
      case 'planning':
        return 'text-yellow-500';
      case 'cancelled':
      case 'expired':
      case 'claimed':
        return 'text-red-500';
      case 'full':
        return 'text-blue-500';
      case 'arrived':
        return 'text-purple-500';
      default:
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    }
  };

  const renderPlantForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Plant Name *</label>
        <input
          type="text"
          value={plantForm.name || ''}
          onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
          placeholder="e.g., Japanese Maple"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Type</label>
        <select
          value={plantForm.type || 'perennial'}
          onChange={(e) => setPlantForm({ ...plantForm, type: e.target.value as Plant['type'] })}
          className={selectClass}
        >
          <option value="annual">Annual</option>
          <option value="perennial">Perennial</option>
          <option value="shrub">Shrub</option>
          <option value="tree">Tree</option>
          <option value="succulent">Succulent</option>
          <option value="herb">Herb</option>
          <option value="vegetable">Vegetable</option>
          <option value="houseplant">Houseplant</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Size</label>
        <select
          value={plantForm.size || 'medium'}
          onChange={(e) => setPlantForm({ ...plantForm, size: e.target.value as Plant['size'] })}
          className={selectClass}
        >
          <option value="small">Small (1-3 gal)</option>
          <option value="medium">Medium (5-7 gal)</option>
          <option value="large">Large (10-15 gal)</option>
          <option value="extra-large">Extra Large (15+ gal)</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Care Level</label>
        <select
          value={plantForm.careLevel || 'moderate'}
          onChange={(e) => setPlantForm({ ...plantForm, careLevel: e.target.value as Plant['careLevel'] })}
          className={selectClass}
        >
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Price ($)</label>
        <input
          type="number"
          value={plantForm.price || 0}
          onChange={(e) => setPlantForm({ ...plantForm, price: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Quantity</label>
        <input
          type="number"
          value={plantForm.quantity || 0}
          onChange={(e) => setPlantForm({ ...plantForm, quantity: parseInt(e.target.value) || 0 })}
          min="0"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Season</label>
        <select
          value={plantForm.season || 'all-season'}
          onChange={(e) => setPlantForm({ ...plantForm, season: e.target.value as Plant['season'] })}
          className={selectClass}
        >
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="fall">Fall</option>
          <option value="winter">Winter</option>
          <option value="all-season">All Season</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Sun Requirement</label>
        <select
          value={plantForm.sunRequirement || 'full-sun'}
          onChange={(e) => setPlantForm({ ...plantForm, sunRequirement: e.target.value as Plant['sunRequirement'] })}
          className={selectClass}
        >
          <option value="full-sun">Full Sun</option>
          <option value="partial-shade">Partial Shade</option>
          <option value="shade">Shade</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Water Needs</label>
        <select
          value={plantForm.waterNeeds || 'moderate'}
          onChange={(e) => setPlantForm({ ...plantForm, waterNeeds: e.target.value as Plant['waterNeeds'] })}
          className={selectClass}
        >
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          value={plantForm.notes || ''}
          onChange={(e) => setPlantForm({ ...plantForm, notes: e.target.value })}
          placeholder="Additional notes about this plant..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderSupplyForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Supply Name *</label>
        <input
          type="text"
          value={supplyForm.name || ''}
          onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
          placeholder="e.g., Premium Potting Mix"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Category</label>
        <select
          value={supplyForm.category || 'soil'}
          onChange={(e) => setSupplyForm({ ...supplyForm, category: e.target.value as GardenSupply['category'] })}
          className={selectClass}
        >
          <option value="soil">Soil & Amendments</option>
          <option value="fertilizer">Fertilizer</option>
          <option value="tools">Tools</option>
          <option value="pots">Pots & Containers</option>
          <option value="seeds">Seeds</option>
          <option value="pesticides">Pesticides & Herbicides</option>
          <option value="irrigation">Irrigation</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Price ($)</label>
        <input
          type="number"
          value={supplyForm.price || 0}
          onChange={(e) => setSupplyForm({ ...supplyForm, price: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Quantity</label>
        <input
          type="number"
          value={supplyForm.quantity || 0}
          onChange={(e) => setSupplyForm({ ...supplyForm, quantity: parseInt(e.target.value) || 0 })}
          min="0"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Unit</label>
        <input
          type="text"
          value={supplyForm.unit || ''}
          onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}
          placeholder="e.g., bag, each, gallon"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Reorder Level</label>
        <input
          type="number"
          value={supplyForm.reorderLevel || 10}
          onChange={(e) => setSupplyForm({ ...supplyForm, reorderLevel: parseInt(e.target.value) || 0 })}
          min="0"
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderAdviceForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Customer Name *</label>
        <input
          type="text"
          value={adviceForm.customerName || ''}
          onChange={(e) => setAdviceForm({ ...adviceForm, customerName: e.target.value })}
          placeholder="Customer name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          value={adviceForm.date || ''}
          onChange={(e) => setAdviceForm({ ...adviceForm, date: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Topic *</label>
        <input
          type="text"
          value={adviceForm.topic || ''}
          onChange={(e) => setAdviceForm({ ...adviceForm, topic: e.target.value })}
          placeholder="e.g., Rose care, Pest control"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Follow-up Date</label>
        <input
          type="date"
          value={adviceForm.followUpDate || ''}
          onChange={(e) => setAdviceForm({ ...adviceForm, followUpDate: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          value={adviceForm.notes || ''}
          onChange={(e) => setAdviceForm({ ...adviceForm, notes: e.target.value })}
          placeholder="Detailed advice given..."
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderConsultationForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Customer Name *</label>
        <input
          type="text"
          value={consultationForm.customerName || ''}
          onChange={(e) => setConsultationForm({ ...consultationForm, customerName: e.target.value })}
          placeholder="Customer name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={consultationForm.email || ''}
          onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
          placeholder="customer@email.com"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input
          type="tel"
          value={consultationForm.phone || ''}
          onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
          placeholder="(555) 123-4567"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Consultation Type</label>
        <select
          value={consultationForm.type || 'landscape-design'}
          onChange={(e) => setConsultationForm({ ...consultationForm, type: e.target.value as Consultation['type'] })}
          className={selectClass}
        >
          <option value="landscape-design">Landscape Design</option>
          <option value="plant-selection">Plant Selection</option>
          <option value="garden-maintenance">Garden Maintenance</option>
          <option value="hardscape">Hardscape Planning</option>
          <option value="irrigation">Irrigation Systems</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Date *</label>
        <input
          type="date"
          value={consultationForm.date || ''}
          onChange={(e) => setConsultationForm({ ...consultationForm, date: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Time</label>
        <input
          type="time"
          value={consultationForm.time || ''}
          onChange={(e) => setConsultationForm({ ...consultationForm, time: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={consultationForm.status || 'scheduled'}
          onChange={(e) => setConsultationForm({ ...consultationForm, status: e.target.value as Consultation['status'] })}
          className={selectClass}
        >
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          value={consultationForm.notes || ''}
          onChange={(e) => setConsultationForm({ ...consultationForm, notes: e.target.value })}
          placeholder="Consultation details..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderOrderForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Customer Name *</label>
        <input
          type="text"
          value={orderForm.customerName || ''}
          onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
          placeholder="Customer name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Plant Name *</label>
        <input
          type="text"
          value={orderForm.plantName || ''}
          onChange={(e) => setOrderForm({ ...orderForm, plantName: e.target.value })}
          placeholder="e.g., Blue Atlas Cedar"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Quantity</label>
        <input
          type="number"
          value={orderForm.quantity || 1}
          onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
          min="1"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={orderForm.status || 'pending'}
          onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as SpecialOrder['status'] })}
          className={selectClass}
        >
          <option value="pending">Pending</option>
          <option value="ordered">Ordered</option>
          <option value="arrived">Arrived</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Order Date</label>
        <input
          type="date"
          value={orderForm.orderDate || ''}
          onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Expected Arrival</label>
        <input
          type="date"
          value={orderForm.expectedArrival || ''}
          onChange={(e) => setOrderForm({ ...orderForm, expectedArrival: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          value={orderForm.notes || ''}
          onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
          placeholder="Order notes..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderGuaranteeForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Plant Name *</label>
        <input
          type="text"
          value={guaranteeForm.plantName || ''}
          onChange={(e) => setGuaranteeForm({ ...guaranteeForm, plantName: e.target.value })}
          placeholder="Plant name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Customer Name *</label>
        <input
          type="text"
          value={guaranteeForm.customerName || ''}
          onChange={(e) => setGuaranteeForm({ ...guaranteeForm, customerName: e.target.value })}
          placeholder="Customer name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Purchase Date</label>
        <input
          type="date"
          value={guaranteeForm.purchaseDate || ''}
          onChange={(e) => setGuaranteeForm({ ...guaranteeForm, purchaseDate: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Expiration Date</label>
        <input
          type="date"
          value={guaranteeForm.expirationDate || ''}
          onChange={(e) => setGuaranteeForm({ ...guaranteeForm, expirationDate: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={guaranteeForm.status || 'active'}
          onChange={(e) => setGuaranteeForm({ ...guaranteeForm, status: e.target.value as PlantGuarantee['status'] })}
          className={selectClass}
        >
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Claim Notes</label>
        <textarea
          value={guaranteeForm.claimNotes || ''}
          onChange={(e) => setGuaranteeForm({ ...guaranteeForm, claimNotes: e.target.value })}
          placeholder="Notes about claim if applicable..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderDeliveryForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Customer Name *</label>
        <input
          type="text"
          value={deliveryForm.customerName || ''}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, customerName: e.target.value })}
          placeholder="Customer name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Address *</label>
        <input
          type="text"
          value={deliveryForm.address || ''}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
          placeholder="Delivery address"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          value={deliveryForm.date || ''}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, date: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Time Slot</label>
        <select
          value={deliveryForm.timeSlot || 'morning'}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, timeSlot: e.target.value })}
          className={selectClass}
        >
          <option value="morning">Morning (8am-12pm)</option>
          <option value="afternoon">Afternoon (12pm-5pm)</option>
          <option value="evening">Evening (5pm-8pm)</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={deliveryForm.status || 'scheduled'}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, status: e.target.value as Delivery['status'] })}
          className={selectClass}
        >
          <option value="scheduled">Scheduled</option>
          <option value="in-transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Items</label>
        <input
          type="text"
          value={deliveryForm.items || ''}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, items: e.target.value })}
          placeholder="e.g., 3x Japanese Maple, 10 bags mulch"
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          value={deliveryForm.notes || ''}
          onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
          placeholder="Delivery instructions..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderHardscapeForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Item Name *</label>
        <input
          type="text"
          value={hardscapeForm.name || ''}
          onChange={(e) => setHardscapeForm({ ...hardscapeForm, name: e.target.value })}
          placeholder="e.g., Bluestone Pavers"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Type</label>
        <select
          value={hardscapeForm.type || 'pavers'}
          onChange={(e) => setHardscapeForm({ ...hardscapeForm, type: e.target.value as HardscapeItem['type'] })}
          className={selectClass}
        >
          <option value="pavers">Pavers</option>
          <option value="stone">Stone</option>
          <option value="gravel">Gravel</option>
          <option value="mulch">Mulch</option>
          <option value="edging">Edging</option>
          <option value="boulders">Boulders</option>
          <option value="retaining-wall">Retaining Wall</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Unit</label>
        <input
          type="text"
          value={hardscapeForm.unit || ''}
          onChange={(e) => setHardscapeForm({ ...hardscapeForm, unit: e.target.value })}
          placeholder="e.g., sq ft, pallet, ton"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Price Per Unit ($)</label>
        <input
          type="number"
          value={hardscapeForm.pricePerUnit || 0}
          onChange={(e) => setHardscapeForm({ ...hardscapeForm, pricePerUnit: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Quantity in Stock</label>
        <input
          type="number"
          value={hardscapeForm.quantityInStock || 0}
          onChange={(e) => setHardscapeForm({ ...hardscapeForm, quantityInStock: parseInt(e.target.value) || 0 })}
          min="0"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Color</label>
        <input
          type="text"
          value={hardscapeForm.color || ''}
          onChange={(e) => setHardscapeForm({ ...hardscapeForm, color: e.target.value })}
          placeholder="e.g., Natural Gray, Terracotta"
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderHolidayForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Holiday *</label>
        <input
          type="text"
          value={holidayForm.holiday || ''}
          onChange={(e) => setHolidayForm({ ...holidayForm, holiday: e.target.value })}
          placeholder="e.g., Easter, Christmas, Mother's Day"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Year</label>
        <input
          type="number"
          value={holidayForm.year || new Date().getFullYear()}
          onChange={(e) => setHolidayForm({ ...holidayForm, year: parseInt(e.target.value) })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Start Date</label>
        <input
          type="date"
          value={holidayForm.startDate || ''}
          onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>End Date</label>
        <input
          type="date"
          value={holidayForm.endDate || ''}
          onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={holidayForm.status || 'planning'}
          onChange={(e) => setHolidayForm({ ...holidayForm, status: e.target.value as HolidayPlan['status'] })}
          className={selectClass}
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Featured Products</label>
        <input
          type="text"
          value={holidayForm.products || ''}
          onChange={(e) => setHolidayForm({ ...holidayForm, products: e.target.value })}
          placeholder="e.g., Poinsettias, Easter Lilies"
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Marketing Notes</label>
        <textarea
          value={holidayForm.marketingNotes || ''}
          onChange={(e) => setHolidayForm({ ...holidayForm, marketingNotes: e.target.value })}
          placeholder="Marketing and display plans..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderWorkshopForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Workshop Title *</label>
        <input
          type="text"
          value={workshopForm.title || ''}
          onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
          placeholder="e.g., Container Gardening 101"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Instructor</label>
        <input
          type="text"
          value={workshopForm.instructor || ''}
          onChange={(e) => setWorkshopForm({ ...workshopForm, instructor: e.target.value })}
          placeholder="Instructor name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          value={workshopForm.date || ''}
          onChange={(e) => setWorkshopForm({ ...workshopForm, date: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Time</label>
        <input
          type="time"
          value={workshopForm.time || ''}
          onChange={(e) => setWorkshopForm({ ...workshopForm, time: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Duration (minutes)</label>
        <input
          type="number"
          value={workshopForm.duration || 60}
          onChange={(e) => setWorkshopForm({ ...workshopForm, duration: parseInt(e.target.value) || 60 })}
          min="15"
          step="15"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Capacity</label>
        <input
          type="number"
          value={workshopForm.capacity || 20}
          onChange={(e) => setWorkshopForm({ ...workshopForm, capacity: parseInt(e.target.value) || 20 })}
          min="1"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Enrolled</label>
        <input
          type="number"
          value={workshopForm.enrolled || 0}
          onChange={(e) => setWorkshopForm({ ...workshopForm, enrolled: parseInt(e.target.value) || 0 })}
          min="0"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Price ($)</label>
        <input
          type="number"
          value={workshopForm.price || 0}
          onChange={(e) => setWorkshopForm({ ...workshopForm, price: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={workshopForm.status || 'scheduled'}
          onChange={(e) => setWorkshopForm({ ...workshopForm, status: e.target.value as Workshop['status'] })}
          className={selectClass}
        >
          <option value="scheduled">Scheduled</option>
          <option value="full">Full</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Description</label>
        <textarea
          value={workshopForm.description || ''}
          onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
          placeholder="Workshop description..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderWeatherForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Date *</label>
        <input
          type="date"
          value={weatherForm.date || ''}
          onChange={(e) => setWeatherForm({ ...weatherForm, date: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Weather Event *</label>
        <select
          value={weatherForm.weatherEvent || 'frost'}
          onChange={(e) => setWeatherForm({ ...weatherForm, weatherEvent: e.target.value as WeatherImpact['weatherEvent'] })}
          className={selectClass}
        >
          <option value="frost">Frost</option>
          <option value="heatwave">Heatwave</option>
          <option value="storm">Storm</option>
          <option value="drought">Drought</option>
          <option value="heavy-rain">Heavy Rain</option>
          <option value="hail">Hail</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Severity</label>
        <select
          value={weatherForm.severity || 'medium'}
          onChange={(e) => setWeatherForm({ ...weatherForm, severity: e.target.value as WeatherImpact['severity'] })}
          className={selectClass}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Financial Impact ($)</label>
        <input
          type="number"
          value={weatherForm.financialImpact || 0}
          onChange={(e) => setWeatherForm({ ...weatherForm, financialImpact: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Affected Areas</label>
        <input
          type="text"
          value={weatherForm.affectedAreas || ''}
          onChange={(e) => setWeatherForm({ ...weatherForm, affectedAreas: e.target.value })}
          placeholder="e.g., Greenhouse A, Outdoor nursery"
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Actions Taken</label>
        <textarea
          value={weatherForm.actionsTaken || ''}
          onChange={(e) => setWeatherForm({ ...weatherForm, actionsTaken: e.target.value })}
          placeholder="Describe actions taken to mitigate damage..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderSalesForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Date *</label>
        <input
          type="date"
          value={salesForm.date || ''}
          onChange={(e) => setSalesForm({ ...salesForm, date: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Category</label>
        <select
          value={salesForm.category || 'plants'}
          onChange={(e) => setSalesForm({ ...salesForm, category: e.target.value as SalesRecord['category'] })}
          className={selectClass}
        >
          <option value="plants">Plants</option>
          <option value="supplies">Supplies</option>
          <option value="hardscape">Hardscape</option>
          <option value="services">Services</option>
          <option value="workshops">Workshops</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Amount ($) *</label>
        <input
          type="number"
          value={salesForm.amount || 0}
          onChange={(e) => setSalesForm({ ...salesForm, amount: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          value={salesForm.notes || ''}
          onChange={(e) => setSalesForm({ ...salesForm, notes: e.target.value })}
          placeholder="Sales notes..."
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'plants':
        return renderPlantForm();
      case 'supplies':
        return renderSupplyForm();
      case 'advice':
        return renderAdviceForm();
      case 'consultations':
        return renderConsultationForm();
      case 'orders':
        return renderOrderForm();
      case 'guarantees':
        return renderGuaranteeForm();
      case 'deliveries':
        return renderDeliveryForm();
      case 'hardscape':
        return renderHardscapeForm();
      case 'holidays':
        return renderHolidayForm();
      case 'workshops':
        return renderWorkshopForm();
      case 'weather':
        return renderWeatherForm();
      case 'sales':
        return renderSalesForm();
      default:
        return null;
    }
  };

  const handleSave = () => {
    switch (activeTab) {
      case 'plants':
        handleSavePlant();
        break;
      case 'supplies':
        handleSaveSupply();
        break;
      case 'advice':
        handleSaveAdvice();
        break;
      case 'consultations':
        handleSaveConsultation();
        break;
      case 'orders':
        handleSaveOrder();
        break;
      case 'guarantees':
        handleSaveGuarantee();
        break;
      case 'deliveries':
        handleSaveDelivery();
        break;
      case 'hardscape':
        handleSaveHardscape();
        break;
      case 'holidays':
        handleSaveHoliday();
        break;
      case 'workshops':
        handleSaveWorkshop();
        break;
      case 'weather':
        handleSaveWeather();
        break;
      case 'sales':
        handleSaveSales();
        break;
    }
  };

  const renderPlantsList = () => (
    <div className="space-y-3">
      {filteredPlants.length === 0 ? (
        <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No plants found. Add your first plant to get started!
        </p>
      ) : (
        filteredPlants.map((plant: Plant) => (
          <div key={plant.id} className={cardClass}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flower2 className="w-5 h-5 text-green-500" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {plant.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    {plant.type}
                  </span>
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <TreeDeciduous className="w-4 h-4" />
                    <span>{plant.size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4" />
                    <span>{plant.sunRequirement}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4" />
                    <span>{plant.waterNeeds}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    <span>{plant.careLevel}</span>
                  </div>
                </div>
                <div className={`mt-2 flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium text-green-600">${plant.price.toFixed(2)}</span>
                  <span>Qty: {plant.quantity}</span>
                  <span>Season: {plant.season}</span>
                </div>
                {plant.notes && (
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plant.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit('plants', plant)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete('plants', plant.id)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSuppliesList = () => (
    <div className="space-y-3">
      {lowStockSupplies.length > 0 && (
        <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className={`font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Low Stock Alert: {lowStockSupplies.length} item(s) need reordering
            </span>
          </div>
        </div>
      )}
      {filteredSupplies.length === 0 ? (
        <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No supplies found. Add your first supply item!
        </p>
      ) : (
        filteredSupplies.map((supply: GardenSupply) => (
          <div
            key={supply.id}
            className={`${cardClass} ${supply.quantity <= supply.reorderLevel ? 'border-l-4 border-yellow-500' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {supply.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {supply.category}
                  </span>
                </div>
                <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium text-green-600">${supply.price.toFixed(2)} / {supply.unit}</span>
                  <span className={supply.quantity <= supply.reorderLevel ? 'text-yellow-500 font-medium' : ''}>
                    Stock: {supply.quantity}
                  </span>
                  <span>Reorder at: {supply.reorderLevel}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit('supplies', supply)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete('supplies', supply.id)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderGenericList = (items: any[], type: TabType, icon: React.ElementType, titleKey: string, subtitleKey?: string) => {
    const Icon = icon;
    return (
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.gardenCenter.noItemsFoundAddYour', 'No items found. Add your first entry!')}
          </p>
        ) : (
          items.map((item: any) => (
            <div key={item.id} className={cardClass}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-green-500" />
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item[titleKey]}
                    </h3>
                    {item.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)} ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  {subtitleKey && item[subtitleKey] && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item[subtitleKey]}
                    </p>
                  )}
                  <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.date && <span>Date: {item.date}</span>}
                    {item.time && <span className="ml-3">Time: {item.time}</span>}
                    {item.customerName && <span className="ml-3">Customer: {item.customerName}</span>}
                    {item.amount !== undefined && (
                      <span className="ml-3 font-medium text-green-600">${item.amount.toFixed(2)}</span>
                    )}
                    {item.price !== undefined && (
                      <span className="ml-3 font-medium text-green-600">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                  {item.notes && (
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(type, item)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(type, item.id)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderSalesAnalytics = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.gardenCenter.salesByCategory', 'Sales by Category')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(salesByCategory).map(([category, amount]) => (
            <div key={category} className={cardClass}>
              <p className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {category}
              </p>
              <p className={`text-xl font-bold text-green-500`}>
                ${amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.gardenCenter.totalSales2', 'Total Sales')}
            </span>
            <span className="text-2xl font-bold text-green-500">${totalSales.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {renderGenericList(data.sales, 'sales', BarChart3, 'category', 'notes')}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'plants':
        return renderPlantsList();
      case 'supplies':
        return renderSuppliesList();
      case 'advice':
        return renderGenericList(data.advice, 'advice', Users, 'topic', 'customerName');
      case 'consultations':
        return renderGenericList(data.consultations, 'consultations', Calendar, 'customerName', 'type');
      case 'orders':
        return renderGenericList(data.orders, 'orders', ShoppingCart, 'plantName', 'customerName');
      case 'guarantees':
        return renderGenericList(data.guarantees, 'guarantees', Shield, 'plantName', 'customerName');
      case 'deliveries':
        return renderGenericList(data.deliveries, 'deliveries', Truck, 'customerName', 'address');
      case 'hardscape':
        return renderGenericList(data.hardscape, 'hardscape', Layers, 'name', 'type');
      case 'holidays':
        return renderGenericList(data.holidays, 'holidays', Snowflake, 'holiday', 'products');
      case 'workshops':
        return renderGenericList(data.workshops, 'workshops', GraduationCap, 'title', 'instructor');
      case 'weather':
        return renderGenericList(data.weather, 'weather', Cloud, 'weatherEvent', 'affectedAreas');
      case 'sales':
        return renderSalesAnalytics();
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Flower2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.gardenCenter.gardenCenterManager', 'Garden Center Manager')}
                </CardTitle>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.gardenCenter.comprehensiveNurseryAndGardenCenter', 'Comprehensive nursery and garden center management')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WidgetEmbedButton toolSlug="garden-center" toolName="Garden Center" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
              />
              <ExportDropdown
                onExportCSV={() => {
                  // Flatten all data for export
                  const flatData = [
                    ...data.plants.map(p => ({ ...p, dataType: 'plant' })),
                    ...data.supplies.map(s => ({ ...s, dataType: 'supply' })),
                    ...data.orders.map(o => ({ ...o, dataType: 'order' })),
                    ...data.sales.map(s => ({ ...s, dataType: 'sale' })),
                  ];
                  exportToCSV(flatData, COLUMNS, { filename: 'garden-center-data' });
                }}
                onExportExcel={() => {
                  const flatData = [
                    ...data.plants.map(p => ({ ...p, dataType: 'plant' })),
                    ...data.supplies.map(s => ({ ...s, dataType: 'supply' })),
                    ...data.orders.map(o => ({ ...o, dataType: 'order' })),
                    ...data.sales.map(s => ({ ...s, dataType: 'sale' })),
                  ];
                  exportToExcel(flatData, COLUMNS, { filename: 'garden-center-data' });
                }}
                onExportJSON={() => {
                  exportToJSON(data, { filename: 'garden-center-data' });
                }}
                onExportPDF={async () => {
                  const flatData = [
                    ...data.plants.map(p => ({ ...p, dataType: 'plant' })),
                    ...data.supplies.map(s => ({ ...s, dataType: 'supply' })),
                    ...data.orders.map(o => ({ ...o, dataType: 'order' })),
                    ...data.sales.map(s => ({ ...s, dataType: 'sale' })),
                  ];
                  await exportToPDF(flatData, COLUMNS, { filename: 'garden-center-data', title: 'Garden Center Data' });
                }}
                onPrint={() => {
                  const flatData = [
                    ...data.plants.map(p => ({ ...p, dataType: 'plant' })),
                    ...data.supplies.map(s => ({ ...s, dataType: 'supply' })),
                    ...data.orders.map(o => ({ ...o, dataType: 'order' })),
                    ...data.sales.map(s => ({ ...s, dataType: 'sale' })),
                  ];
                  printData(flatData, COLUMNS, { title: 'Garden Center Data' });
                }}
                onCopyToClipboard={async () => {
                  return await copyUtil(data, COLUMNS);
                }}
                theme={theme}
                showImport={false}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">{t('tools.gardenCenter.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={cardClass}>
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gardenCenter.plants', 'Plants')}</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {data.plants.length}
              </p>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gardenCenter.orders', 'Orders')}</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {data.orders.filter((o: SpecialOrder) => o.status !== 'delivered').length}
              </p>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gardenCenter.consultations', 'Consultations')}</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {data.consultations.filter((c: Consultation) => c.status === 'scheduled').length}
              </p>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gardenCenter.totalSales', 'Total Sales')}</span>
              </div>
              <p className={`text-2xl font-bold text-green-500`}>
                ${totalSales.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setShowForm(false);
                    resetForm();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('tools.gardenCenter.search', 'Search...')}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
              />
            </div>
            {activeTab === 'plants' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => {
                clearFormData();
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.gardenCenter.addNew', 'Add New')}
            </button>
          </div>

          {/* Filters */}
          {showFilters && activeTab === 'plants' && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.gardenCenter.plantType', 'Plant Type')}</label>
                  <select
                    value={plantTypeFilter}
                    onChange={(e) => setPlantTypeFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">{t('tools.gardenCenter.allTypes', 'All Types')}</option>
                    <option value="annual">{t('tools.gardenCenter.annual', 'Annual')}</option>
                    <option value="perennial">{t('tools.gardenCenter.perennial', 'Perennial')}</option>
                    <option value="shrub">{t('tools.gardenCenter.shrub', 'Shrub')}</option>
                    <option value="tree">{t('tools.gardenCenter.tree', 'Tree')}</option>
                    <option value="succulent">{t('tools.gardenCenter.succulent', 'Succulent')}</option>
                    <option value="herb">{t('tools.gardenCenter.herb', 'Herb')}</option>
                    <option value="vegetable">{t('tools.gardenCenter.vegetable', 'Vegetable')}</option>
                    <option value="houseplant">{t('tools.gardenCenter.houseplant', 'Houseplant')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.gardenCenter.season', 'Season')}</label>
                  <select
                    value={seasonFilter}
                    onChange={(e) => setSeasonFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">{t('tools.gardenCenter.allSeasons', 'All Seasons')}</option>
                    <option value="spring">{t('tools.gardenCenter.spring', 'Spring')}</option>
                    <option value="summer">{t('tools.gardenCenter.summer', 'Summer')}</option>
                    <option value="fall">{t('tools.gardenCenter.fall', 'Fall')}</option>
                    <option value="winter">{t('tools.gardenCenter.winter', 'Winter')}</option>
                    <option value="all-season">{t('tools.gardenCenter.allSeason', 'All Season')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className={`mb-6 p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingId ? t('tools.gardenCenter.editEntry', 'Edit Entry') : t('tools.gardenCenter.addNewEntry', 'Add New Entry')}
                </h3>
                <button
                  onClick={resetForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderForm()}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.gardenCenter.save', 'Save')}
                </button>
                <button
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.gardenCenter.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {renderContent()}

          {/* Info Section */}
          <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gardenCenter.aboutGardenCenterManager', 'About Garden Center Manager')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              A comprehensive tool for managing garden centers and nurseries. Track plant inventory, garden supplies,
              customer consultations, special orders, plant care guarantees, deliveries, hardscape materials,
              holiday planning, workshops, weather impacts, and sales analytics. Your data is automatically synced to the cloud when logged in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GardenCenterTool;
