'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Car,
  Droplets,
  Users,
  Package,
  Wrench,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CloudRain,
  CreditCard,
  Gift,
  Zap,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Timer,
  UserPlus,
  Beaker,
  Calendar,
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

// Types
interface ServicePackage {
  id: string;
  name: string;
  type: 'basic' | 'deluxe' | 'ultimate';
  price: number;
  duration: number; // in minutes
  services: string[];
  isExpress: boolean;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'other';
  customerName: string;
  customerPhone: string;
  packageId: string;
  addOns: string[];
  status: 'waiting' | 'in-progress' | 'completed';
  assignedEmployee: string;
  startTime?: string;
  endTime?: string;
  notes: string;
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  planType: 'monthly' | 'yearly' | 'unlimited';
  startDate: string;
  endDate: string;
  washesUsed: number;
  maxWashes: number | null; // null for unlimited
  isActive: boolean;
}

interface Employee {
  id: string;
  name: string;
  role: 'washer' | 'detailer' | 'manager' | 'cashier';
  isAvailable: boolean;
  shiftsToday: number;
  carsWashed: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'soap' | 'wax' | 'chemical' | 'towel' | 'equipment' | 'other';
  quantity: number;
  unit: string;
  minStock: number;
  lastRestocked: string;
  costPerUnit: number;
}

interface MaintenanceLog {
  id: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  date: string;
  performedBy: string;
  cost: number;
  nextDueDate?: string;
}

interface AddOnService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface PrepaidCard {
  id: string;
  cardNumber: string;
  type: 'prepaid' | 'gift';
  balance: number;
  originalAmount: number;
  customerName: string;
  purchaseDate: string;
  expiryDate: string;
  isActive: boolean;
}

interface DailyStats {
  date: string;
  totalCars: number;
  revenueByService: Record<string, number>;
  expressCount: number;
  fullServiceCount: number;
  weatherNote: string;
}

// Combined data structure for backend sync
interface CarWashData {
  id: string;
  packages: ServicePackage[];
  vehicles: Vehicle[];
  members: Member[];
  employees: Employee[];
  inventory: InventoryItem[];
  maintenanceLogs: MaintenanceLog[];
  addOns: AddOnService[];
  prepaidCards: PrepaidCard[];
  dailyStats: DailyStats[];
  weatherNote: string;
}

type TabType = 'queue' | 'packages' | 'members' | 'employees' | 'inventory' | 'maintenance' | 'cards' | 'analytics';

// Column configuration for exports (used by useToolData hook)
const CARWASH_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'weatherNote', header: 'Weather Note', type: 'string' },
];

const defaultPackages: ServicePackage[] = [
  {
    id: '1',
    name: 'Basic Wash',
    type: 'basic',
    price: 15,
    duration: 10,
    services: ['Exterior wash', 'Rinse', 'Air dry'],
    isExpress: true,
  },
  {
    id: '2',
    name: 'Deluxe Wash',
    type: 'deluxe',
    price: 30,
    duration: 25,
    services: ['Exterior wash', 'Interior vacuum', 'Windows', 'Tire shine', 'Air freshener'],
    isExpress: false,
  },
  {
    id: '3',
    name: 'Ultimate Detail',
    type: 'ultimate',
    price: 75,
    duration: 60,
    services: ['Full exterior wash', 'Hand wax', 'Interior deep clean', 'Leather conditioning', 'Engine bay clean', 'Ceramic coating'],
    isExpress: false,
  },
];

const defaultAddOns: AddOnService[] = [
  { id: '1', name: 'Tire Shine', price: 5, duration: 5 },
  { id: '2', name: 'Air Freshener', price: 3, duration: 2 },
  { id: '3', name: 'Hand Wax', price: 20, duration: 15 },
  { id: '4', name: 'Interior Vacuum', price: 10, duration: 10 },
  { id: '5', name: 'Leather Conditioning', price: 15, duration: 10 },
  { id: '6', name: 'Engine Bay Clean', price: 25, duration: 20 },
];

const defaultEmployees: Employee[] = [
  { id: '1', name: 'John Smith', role: 'washer', isAvailable: true, shiftsToday: 1, carsWashed: 12 },
  { id: '2', name: 'Maria Garcia', role: 'detailer', isAvailable: true, shiftsToday: 1, carsWashed: 8 },
  { id: '3', name: 'Mike Johnson', role: 'manager', isAvailable: true, shiftsToday: 1, carsWashed: 5 },
];

interface CarWashToolProps {
  uiConfig?: UIConfig;
}

// Default data for initialization
const defaultCarWashData: CarWashData = {
  id: 'carwash-main',
  packages: defaultPackages,
  vehicles: [],
  members: [],
  employees: defaultEmployees,
  inventory: [],
  maintenanceLogs: [],
  addOns: defaultAddOns,
  prepaidCards: [],
  dailyStats: [],
  weatherNote: '',
};

export const CarWashTool: React.FC<CarWashToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('queue');

  // Use the useToolData hook for backend persistence
  const {
    data: carWashDataArray,
    setData: setCarWashDataArray,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyToClipboardHook,
    print: printHook,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CarWashData>('carwash-manager', [defaultCarWashData], CARWASH_COLUMNS);

  // Extract the main data object from the array (we only store one record)
  const carWashData = useMemo(() => carWashDataArray[0] || defaultCarWashData, [carWashDataArray]);

  // Helper function to update carwash data
  const updateCarWashData = useCallback((updates: Partial<CarWashData>) => {
    setCarWashDataArray(prev => {
      const current = prev[0] || defaultCarWashData;
      return [{ ...current, ...updates }];
    });
  }, [setCarWashDataArray]);

  // Extract individual data from the combined structure
  const packages = carWashData.packages;
  const vehicles = carWashData.vehicles;
  const members = carWashData.members;
  const employees = carWashData.employees;
  const inventory = carWashData.inventory;
  const maintenanceLogs = carWashData.maintenanceLogs;
  const addOns = carWashData.addOns;
  const prepaidCards = carWashData.prepaidCards;
  const dailyStats = carWashData.dailyStats;
  const weatherNote = carWashData.weatherNote;

  // Setter functions that update the combined structure
  const setPackages = useCallback((updater: ServicePackage[] | ((prev: ServicePackage[]) => ServicePackage[])) => {
    updateCarWashData({
      packages: typeof updater === 'function' ? updater(carWashData.packages) : updater
    });
  }, [updateCarWashData, carWashData.packages]);

  const setVehicles = useCallback((updater: Vehicle[] | ((prev: Vehicle[]) => Vehicle[])) => {
    updateCarWashData({
      vehicles: typeof updater === 'function' ? updater(carWashData.vehicles) : updater
    });
  }, [updateCarWashData, carWashData.vehicles]);

  const setMembers = useCallback((updater: Member[] | ((prev: Member[]) => Member[])) => {
    updateCarWashData({
      members: typeof updater === 'function' ? updater(carWashData.members) : updater
    });
  }, [updateCarWashData, carWashData.members]);

  const setEmployees = useCallback((updater: Employee[] | ((prev: Employee[]) => Employee[])) => {
    updateCarWashData({
      employees: typeof updater === 'function' ? updater(carWashData.employees) : updater
    });
  }, [updateCarWashData, carWashData.employees]);

  const setInventory = useCallback((updater: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => {
    updateCarWashData({
      inventory: typeof updater === 'function' ? updater(carWashData.inventory) : updater
    });
  }, [updateCarWashData, carWashData.inventory]);

  const setMaintenanceLogs = useCallback((updater: MaintenanceLog[] | ((prev: MaintenanceLog[]) => MaintenanceLog[])) => {
    updateCarWashData({
      maintenanceLogs: typeof updater === 'function' ? updater(carWashData.maintenanceLogs) : updater
    });
  }, [updateCarWashData, carWashData.maintenanceLogs]);

  const setAddOns = useCallback((updater: AddOnService[] | ((prev: AddOnService[]) => AddOnService[])) => {
    updateCarWashData({
      addOns: typeof updater === 'function' ? updater(carWashData.addOns) : updater
    });
  }, [updateCarWashData, carWashData.addOns]);

  const setPrepaidCards = useCallback((updater: PrepaidCard[] | ((prev: PrepaidCard[]) => PrepaidCard[])) => {
    updateCarWashData({
      prepaidCards: typeof updater === 'function' ? updater(carWashData.prepaidCards) : updater
    });
  }, [updateCarWashData, carWashData.prepaidCards]);

  const setDailyStats = useCallback((updater: DailyStats[] | ((prev: DailyStats[]) => DailyStats[])) => {
    updateCarWashData({
      dailyStats: typeof updater === 'function' ? updater(carWashData.dailyStats) : updater
    });
  }, [updateCarWashData, carWashData.dailyStats]);

  const setWeatherNote = useCallback((value: string) => {
    updateCarWashData({ weatherNote: value });
  }, [updateCarWashData]);

  // Form states
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.customerName || params.plateNumber || params.vehicleType) {
        setShowVehicleForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayVehicles = vehicles.filter(v => v.createdAt.startsWith(today));
    const completed = todayVehicles.filter(v => v.status === 'completed');

    const revenueByService: Record<string, number> = {};
    completed.forEach(v => {
      const pkg = packages.find(p => p.id === v.packageId);
      if (pkg) {
        revenueByService[pkg.name] = (revenueByService[pkg.name] || 0) + pkg.price;
      }
      v.addOns.forEach(addOnId => {
        const addOn = addOns.find(a => a.id === addOnId);
        if (addOn) {
          revenueByService[addOn.name] = (revenueByService[addOn.name] || 0) + addOn.price;
        }
      });
    });

    const expressCount = completed.filter(v => {
      const pkg = packages.find(p => p.id === v.packageId);
      return pkg?.isExpress;
    }).length;

    return {
      totalCars: todayVehicles.length,
      completedCars: completed.length,
      inProgress: todayVehicles.filter(v => v.status === 'in-progress').length,
      waiting: todayVehicles.filter(v => v.status === 'waiting').length,
      totalRevenue: Object.values(revenueByService).reduce((a, b) => a + b, 0),
      revenueByService,
      expressCount,
      fullServiceCount: completed.length - expressCount,
    };
  }, [vehicles, packages, addOns]);

  const queuedVehicles = useMemo(() =>
    vehicles.filter(v => v.status !== 'completed').sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ), [vehicles]);

  const lowStockItems = useMemo(() =>
    inventory.filter(item => item.quantity <= item.minStock), [inventory]);

  // Vehicle Form Component
  const VehicleForm = ({ onClose, vehicle }: { onClose: () => void; vehicle?: Vehicle | null }) => {
    const [formData, setFormData] = useState({
      plateNumber: vehicle?.plateNumber || '',
      type: vehicle?.type || 'sedan' as Vehicle['type'],
      customerName: vehicle?.customerName || '',
      customerPhone: vehicle?.customerPhone || '',
      packageId: vehicle?.packageId || packages[0]?.id || '',
      addOns: vehicle?.addOns || [] as string[],
      assignedEmployee: vehicle?.assignedEmployee || '',
      notes: vehicle?.notes || '',
    });

    const handleSubmit = () => {
      if (!formData.plateNumber || !formData.customerName) return;

      if (vehicle) {
        setVehicles(prev => prev.map(v =>
          v.id === vehicle.id ? { ...v, ...formData } : v
        ));
      } else {
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          ...formData,
          status: 'waiting',
          createdAt: new Date().toISOString(),
        };
        setVehicles(prev => [...prev, newVehicle]);
      }
      onClose();
    };

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {vehicle ? t('tools.carWash.editVehicle', 'Edit Vehicle') : t('tools.carWash.addVehicleToQueue', 'Add Vehicle to Queue')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.licensePlate', 'License Plate *')}
            </label>
            <input
              type="text"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder={t('tools.carWash.abc1234', 'ABC-1234')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.vehicleType', 'Vehicle Type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Vehicle['type'] })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="sedan">{t('tools.carWash.sedan', 'Sedan')}</option>
              <option value="suv">{t('tools.carWash.suv', 'SUV')}</option>
              <option value="truck">{t('tools.carWash.truck', 'Truck')}</option>
              <option value="van">{t('tools.carWash.van', 'Van')}</option>
              <option value="motorcycle">{t('tools.carWash.motorcycle', 'Motorcycle')}</option>
              <option value="other">{t('tools.carWash.other', 'Other')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.customerName', 'Customer Name *')}
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.phone', 'Phone')}
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.servicePackage', 'Service Package')}
            </label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - ${pkg.price}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.assignedEmployee', 'Assigned Employee')}
            </label>
            <select
              value={formData.assignedEmployee}
              onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.carWash.unassigned', 'Unassigned')}</option>
              {employees.filter(e => e.isAvailable).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.addOnServices', 'Add-on Services')}
            </label>
            <div className="flex flex-wrap gap-2">
              {addOns.map(addOn => (
                <button
                  key={addOn.id}
                  onClick={() => {
                    const newAddOns = formData.addOns.includes(addOn.id)
                      ? formData.addOns.filter(id => id !== addOn.id)
                      : [...formData.addOns, addOn.id];
                    setFormData({ ...formData, addOns: newAddOns });
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.addOns.includes(addOn.id)
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {addOn.name} (+${addOn.price})
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.notes', 'Notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={2}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
          >
            <Check className="w-4 h-4" />
            {vehicle ? t('tools.carWash.update', 'Update') : t('tools.carWash.addToQueue', 'Add to Queue')}
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.carWash.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    );
  };

  // Vehicle Card Component
  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const pkg = packages.find(p => p.id === vehicle.packageId);
    const employee = employees.find(e => e.id === vehicle.assignedEmployee);
    const vehicleAddOns = addOns.filter(a => vehicle.addOns.includes(a.id));
    const totalPrice = (pkg?.price || 0) + vehicleAddOns.reduce((sum, a) => sum + a.price, 0);

    const statusColors = {
      waiting: 'bg-yellow-500',
      'in-progress': 'bg-blue-500',
      completed: 'bg-green-500',
    };

    const updateStatus = (newStatus: Vehicle['status']) => {
      setVehicles(prev => prev.map(v =>
        v.id === vehicle.id
          ? {
              ...v,
              status: newStatus,
              startTime: newStatus === 'in-progress' ? new Date().toISOString() : v.startTime,
              endTime: newStatus === 'completed' ? new Date().toISOString() : v.endTime,
            }
          : v
      ));

      if (newStatus === 'completed' && vehicle.assignedEmployee) {
        setEmployees(prev => prev.map(e =>
          e.id === vehicle.assignedEmployee
            ? { ...e, carsWashed: e.carsWashed + 1 }
            : e
        ));
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              pkg?.isExpress ? 'bg-yellow-500/20' : 'bg-blue-500/20'
            }`}>
              <Car className={`w-5 h-5 ${pkg?.isExpress ? 'text-yellow-500' : 'text-blue-500'}`} />
            </div>
            <div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {vehicle.plateNumber}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} - {vehicle.customerName}
              </div>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium text-white ${statusColors[vehicle.status]}`}>
            {vehicle.status.replace('-', ' ').toUpperCase()}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.package', 'Package:')}</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {pkg?.name} {pkg?.isExpress && <Zap className="inline w-3 h-3 text-yellow-500" />}
            </span>
          </div>
          {vehicleAddOns.length > 0 && (
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.addOns', 'Add-ons:')}</span>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {vehicleAddOns.map(a => a.name).join(', ')}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.assigned', 'Assigned:')}</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {employee?.name || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.total', 'Total:')}</span>
            <span className="font-bold text-[#0D9488]">${totalPrice}</span>
          </div>
        </div>

        {vehicle.notes && (
          <div className={`p-2 rounded text-sm mb-3 ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {vehicle.notes}
          </div>
        )}

        <div className="flex gap-2">
          {vehicle.status === 'waiting' && (
            <button
              onClick={() => updateStatus('in-progress')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              <Timer className="w-4 h-4" /> Start
            </button>
          )}
          {vehicle.status === 'in-progress' && (
            <button
              onClick={() => updateStatus('completed')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
            >
              <CheckCircle className="w-4 h-4" /> Complete
            </button>
          )}
          <button
            onClick={() => {
              setEditingVehicle(vehicle);
              setShowVehicleForm(true);
            }}
            className={`p-2 rounded-lg ${
              isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={() => setVehicles(prev => prev.filter(v => v.id !== vehicle.id))}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  // Member Form Component
  const MemberForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      email: '',
      planType: 'monthly' as Member['planType'],
    });

    const handleSubmit = () => {
      if (!formData.name) return;

      const startDate = new Date();
      const endDate = new Date();
      if (formData.planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const newMember: Member = {
        id: Date.now().toString(),
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        washesUsed: 0,
        maxWashes: formData.planType === 'unlimited' ? null : formData.planType === 'monthly' ? 4 : 52,
        isActive: true,
      };
      setMembers(prev => [...prev, newMember]);
      onClose();
    };

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.carWash.addNewMember', 'Add New Member')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.name', 'Name *')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.phone2', 'Phone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.email', 'Email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.planType', 'Plan Type')}
            </label>
            <select
              value={formData.planType}
              onChange={(e) => setFormData({ ...formData, planType: e.target.value as Member['planType'] })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="monthly">{t('tools.carWash.monthly4Washes', 'Monthly (4 washes)')}</option>
              <option value="yearly">{t('tools.carWash.yearly52Washes', 'Yearly (52 washes)')}</option>
              <option value="unlimited">{t('tools.carWash.unlimited', 'Unlimited')}</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
          >
            <Check className="w-4 h-4" /> Add Member
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.carWash.cancel2', 'Cancel')}
          </button>
        </div>
      </div>
    );
  };

  // Inventory Form Component
  const InventoryForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      category: 'soap' as InventoryItem['category'],
      quantity: 0,
      unit: 'gallons',
      minStock: 5,
      costPerUnit: 0,
    });

    const handleSubmit = () => {
      if (!formData.name) return;

      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...formData,
        lastRestocked: new Date().toISOString(),
      };
      setInventory(prev => [...prev, newItem]);
      onClose();
    };

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.carWash.addInventoryItem', 'Add Inventory Item')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.itemName', 'Item Name *')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.category2', 'Category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryItem['category'] })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="soap">{t('tools.carWash.soap', 'Soap')}</option>
              <option value="wax">{t('tools.carWash.wax', 'Wax')}</option>
              <option value="chemical">{t('tools.carWash.chemical', 'Chemical')}</option>
              <option value="towel">{t('tools.carWash.towel', 'Towel')}</option>
              <option value="equipment">{t('tools.carWash.equipment', 'Equipment')}</option>
              <option value="other">{t('tools.carWash.other2', 'Other')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.quantity2', 'Quantity')}
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.unit', 'Unit')}
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.minStockLevel', 'Min Stock Level')}
            </label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.costPerUnit', 'Cost Per Unit ($)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
          >
            <Check className="w-4 h-4" /> Add Item
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.carWash.cancel3', 'Cancel')}
          </button>
        </div>
      </div>
    );
  };

  // Maintenance Form Component
  const MaintenanceForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      equipmentName: '',
      type: 'routine' as MaintenanceLog['type'],
      description: '',
      performedBy: '',
      cost: 0,
      nextDueDate: '',
    });

    const handleSubmit = () => {
      if (!formData.equipmentName) return;

      const newLog: MaintenanceLog = {
        id: Date.now().toString(),
        ...formData,
        date: new Date().toISOString(),
      };
      setMaintenanceLogs(prev => [...prev, newLog]);
      onClose();
    };

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.carWash.addMaintenanceLog', 'Add Maintenance Log')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.equipmentName', 'Equipment Name *')}
            </label>
            <input
              type="text"
              value={formData.equipmentName}
              onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.type', 'Type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceLog['type'] })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="routine">{t('tools.carWash.routine', 'Routine')}</option>
              <option value="repair">{t('tools.carWash.repair', 'Repair')}</option>
              <option value="inspection">{t('tools.carWash.inspection', 'Inspection')}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.description', 'Description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={2}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.performedBy', 'Performed By')}
            </label>
            <input
              type="text"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.cost', 'Cost ($)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.nextDueDate', 'Next Due Date')}
            </label>
            <input
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
          >
            <Check className="w-4 h-4" /> Add Log
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.carWash.cancel4', 'Cancel')}
          </button>
        </div>
      </div>
    );
  };

  // Prepaid Card Form Component
  const CardForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      type: 'prepaid' as PrepaidCard['type'],
      amount: 50,
      customerName: '',
      expiryMonths: 12,
    });

    const handleSubmit = () => {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + formData.expiryMonths);

      const newCard: PrepaidCard = {
        id: Date.now().toString(),
        cardNumber: `CW${Date.now().toString().slice(-8)}`,
        type: formData.type,
        balance: formData.amount,
        originalAmount: formData.amount,
        customerName: formData.customerName,
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
      };
      setPrepaidCards(prev => [...prev, newCard]);
      onClose();
    };

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.carWash.createNewCard', 'Create New Card')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.cardType', 'Card Type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PrepaidCard['type'] })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="prepaid">{t('tools.carWash.prepaidCard', 'Prepaid Card')}</option>
              <option value="gift">{t('tools.carWash.giftCard', 'Gift Card')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.amount', 'Amount ($)')}
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.customerName2', 'Customer Name')}
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.validForMonths', 'Valid For (months)')}
            </label>
            <input
              type="number"
              value={formData.expiryMonths}
              onChange={(e) => setFormData({ ...formData, expiryMonths: parseInt(e.target.value) || 12 })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
          >
            <Check className="w-4 h-4" /> Create Card
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.carWash.cancel5', 'Cancel')}
          </button>
        </div>
      </div>
    );
  };

  // Employee Form Component
  const EmployeeForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      role: 'washer' as Employee['role'],
    });

    const handleSubmit = () => {
      if (!formData.name) return;

      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        isAvailable: true,
        shiftsToday: 0,
        carsWashed: 0,
      };
      setEmployees(prev => [...prev, newEmployee]);
      onClose();
    };

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.carWash.addEmployee', 'Add Employee')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.name2', 'Name *')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.carWash.role', 'Role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Employee['role'] })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="washer">{t('tools.carWash.washer', 'Washer')}</option>
              <option value="detailer">{t('tools.carWash.detailer', 'Detailer')}</option>
              <option value="manager">{t('tools.carWash.manager', 'Manager')}</option>
              <option value="cashier">{t('tools.carWash.cashier', 'Cashier')}</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
          >
            <Check className="w-4 h-4" /> Add Employee
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.carWash.cancel6', 'Cancel')}
          </button>
        </div>
      </div>
    );
  };

  // Column configurations for export
  const VEHICLE_COLUMNS: ColumnConfig[] = [
    { key: 'plateNumber', header: 'Plate Number', type: 'string' },
    { key: 'type', header: 'Vehicle Type', type: 'string' },
    { key: 'customerName', header: 'Customer Name', type: 'string' },
    { key: 'customerPhone', header: 'Phone', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'assignedEmployee', header: 'Assigned Employee', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const MEMBER_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'phone', header: 'Phone', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'planType', header: 'Plan Type', type: 'string' },
    { key: 'startDate', header: 'Start Date', type: 'date' },
    { key: 'endDate', header: 'End Date', type: 'date' },
    { key: 'washesUsed', header: 'Washes Used', type: 'number' },
    { key: 'isActive', header: 'Active', type: 'boolean' },
  ];

  const EMPLOYEE_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'role', header: 'Role', type: 'string' },
    { key: 'isAvailable', header: 'Available', type: 'boolean' },
    { key: 'shiftsToday', header: 'Shifts Today', type: 'number' },
    { key: 'carsWashed', header: 'Cars Washed', type: 'number' },
  ];

  const INVENTORY_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Item Name', type: 'string' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'unit', header: 'Unit', type: 'string' },
    { key: 'minStock', header: 'Min Stock', type: 'number' },
    { key: 'lastRestocked', header: 'Last Restocked', type: 'date' },
    { key: 'costPerUnit', header: 'Cost/Unit', type: 'currency' },
  ];

  const MAINTENANCE_COLUMNS: ColumnConfig[] = [
    { key: 'equipmentName', header: 'Equipment', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'performedBy', header: 'Performed By', type: 'string' },
    { key: 'cost', header: 'Cost', type: 'currency' },
    { key: 'nextDueDate', header: 'Next Due', type: 'date' },
  ];

  const CARD_COLUMNS: ColumnConfig[] = [
    { key: 'cardNumber', header: 'Card Number', type: 'string' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'customerName', header: 'Customer Name', type: 'string' },
    { key: 'originalAmount', header: 'Original Amount', type: 'currency' },
    { key: 'balance', header: 'Balance', type: 'currency' },
    { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
    { key: 'expiryDate', header: 'Expiry Date', type: 'date' },
    { key: 'isActive', header: 'Active', type: 'boolean' },
  ];

  // Get current export data and columns based on active tab
  const getExportConfig = useCallback(() => {
    switch (activeTab) {
      case 'queue':
        return { data: vehicles, columns: VEHICLE_COLUMNS, filename: 'carwash_queue' };
      case 'members':
        return { data: members, columns: MEMBER_COLUMNS, filename: 'carwash_members' };
      case 'employees':
        return { data: employees, columns: EMPLOYEE_COLUMNS, filename: 'carwash_employees' };
      case 'inventory':
        return { data: inventory, columns: INVENTORY_COLUMNS, filename: 'carwash_inventory' };
      case 'maintenance':
        return { data: maintenanceLogs, columns: MAINTENANCE_COLUMNS, filename: 'carwash_maintenance' };
      case 'cards':
        return { data: prepaidCards, columns: CARD_COLUMNS, filename: 'carwash_cards' };
      default:
        return { data: vehicles, columns: VEHICLE_COLUMNS, filename: 'carwash_data' };
    }
  }, [activeTab, vehicles, members, employees, inventory, maintenanceLogs, prepaidCards]);

  // Export handlers - using hook's export functions with tab-specific data
  const handleExportCSV = useCallback(() => {
    const { filename } = getExportConfig();
    exportCSV({ filename });
  }, [getExportConfig, exportCSV]);

  const handleExportExcel = useCallback(() => {
    const { filename } = getExportConfig();
    exportExcel({ filename });
  }, [getExportConfig, exportExcel]);

  const handleExportJSON = useCallback(() => {
    const { filename } = getExportConfig();
    exportJSON({ filename });
  }, [getExportConfig, exportJSON]);

  const handleExportPDF = useCallback(async () => {
    const { filename } = getExportConfig();
    await exportPDF({
      filename,
      title: `Car Wash - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
    });
  }, [getExportConfig, activeTab, exportPDF]);

  const handlePrint = useCallback(() => {
    printHook(`Car Wash - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`);
  }, [activeTab, printHook]);

  const handleCopyToClipboard = useCallback(async () => {
    return await copyToClipboardHook('tab');
  }, [copyToClipboardHook]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'queue', label: 'Queue', icon: <Clock className="w-4 h-4" /> },
    { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'employees', label: 'Staff', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Beaker className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'cards', label: 'Cards', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.loadingCarWashData', 'Loading car wash data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.carWash.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.carWashManager', 'Car Wash Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.carWash.businessManagementDashboard', 'Business management dashboard')}
                </p>
              </div>
            </div>

            {/* Quick Stats and Export */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.todaySCars', 'Today\'s Cars')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {todayStats.totalCars}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.inQueue', 'In Queue')}</div>
                <div className="text-xl font-bold text-yellow-500">{todayStats.waiting}</div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.revenue', 'Revenue')}</div>
                <div className="text-xl font-bold text-green-500">${todayStats.totalRevenue}</div>
              </div>
              <WidgetEmbedButton toolSlug="car-wash" toolName="Car Wash" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              {activeTab !== 'packages' && activeTab !== 'analytics' && (
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
              )}
            </div>
          </div>

          {/* Weather Note */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <CloudRain className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <input
                type="text"
                value={weatherNote}
                onChange={(e) => setWeatherNote(e.target.value)}
                placeholder={t('tools.carWash.addWeatherImpactNoteE', 'Add weather impact note (e.g., \'Rainy day - slow traffic expected\')')}
                className={`flex-1 px-3 py-1 rounded-lg border text-sm ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={isDark ? 'text-red-300' : 'text-red-700'}>
              Low stock alert: {lowStockItems.map(i => i.name).join(', ')}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.vehicleQueue', 'Vehicle Queue')}
                </h2>
                <button
                  onClick={() => {
                    setEditingVehicle(null);
                    setShowVehicleForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Vehicle
                </button>
              </div>

              {showVehicleForm && (
                <VehicleForm
                  onClose={() => {
                    setShowVehicleForm(false);
                    setEditingVehicle(null);
                  }}
                  vehicle={editingVehicle}
                />
              )}

              {queuedVehicles.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.carWash.noVehiclesInQueue', 'No vehicles in queue')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {queuedVehicles.map(vehicle => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.carWash.servicePackages', 'Service Packages')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-lg border-2 ${
                      pkg.type === 'basic'
                        ? 'border-gray-400'
                        : pkg.type === 'deluxe'
                        ? 'border-blue-500'
                        : 'border-yellow-500'
                    } ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pkg.name}
                      </h3>
                      {pkg.isExpress && (
                        <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                          <Zap className="w-3 h-3" /> Express
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-[#0D9488] mb-2">${pkg.price}</div>
                    <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ~{pkg.duration} minutes
                    </div>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {pkg.services.map((service, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.addOnServices2', 'Add-on Services')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {addOns.map(addOn => (
                    <div
                      key={addOn.id}
                      className={`p-3 rounded-lg text-center ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {addOn.name}
                      </div>
                      <div className="text-[#0D9488] font-bold">${addOn.price}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        +{addOn.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.membershipPlans', 'Membership Plans')}
                </h2>
                <button
                  onClick={() => setShowMemberForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>

              {showMemberForm && <MemberForm onClose={() => setShowMemberForm(false)} />}

              {members.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.carWash.noMembersYet', 'No members yet')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map(member => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {member.name}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.planType.charAt(0).toUpperCase() + member.planType.slice(1)} Plan
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          member.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {member.isActive ? t('tools.carWash.active', 'Active') : t('tools.carWash.expired', 'Expired')}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carWash.washesUsed', 'Washes Used:')}</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {member.washesUsed}/{member.maxWashes ?? 'Unlimited'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carWash.expires', 'Expires:')}</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {new Date(member.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setMembers(prev => prev.filter(m => m.id !== member.id))}
                        className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm hover:bg-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.staffManagement', 'Staff Management')}
                </h2>
                <button
                  onClick={() => setShowEmployeeForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Employee
                </button>
              </div>

              {showEmployeeForm && <EmployeeForm onClose={() => setShowEmployeeForm(false)} />}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map(emp => (
                  <div
                    key={emp.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {emp.name}
                        </div>
                        <div className={`text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {emp.role}
                        </div>
                      </div>
                      <button
                        onClick={() => setEmployees(prev => prev.map(e =>
                          e.id === emp.id ? { ...e, isAvailable: !e.isAvailable } : e
                        ))}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          emp.isAvailable ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                        }`}
                      >
                        {emp.isAvailable ? t('tools.carWash.available', 'Available') : t('tools.carWash.busy', 'Busy')}
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carWash.carsWashedToday', 'Cars Washed Today:')}</span>
                      <span className="font-bold text-[#0D9488]">{emp.carsWashed}</span>
                    </div>
                    <button
                      onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))}
                      className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm hover:bg-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.chemicalSupplyInventory', 'Chemical & Supply Inventory')}
                </h2>
                <button
                  onClick={() => setShowInventoryForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {showInventoryForm && <InventoryForm onClose={() => setShowInventoryForm(false)} />}

              {inventory.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Beaker className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.carWash.noInventoryItems', 'No inventory items')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        <th className="text-left py-2 px-3">{t('tools.carWash.item', 'Item')}</th>
                        <th className="text-left py-2 px-3">{t('tools.carWash.category', 'Category')}</th>
                        <th className="text-right py-2 px-3">{t('tools.carWash.quantity', 'Quantity')}</th>
                        <th className="text-right py-2 px-3">{t('tools.carWash.minStock', 'Min Stock')}</th>
                        <th className="text-right py-2 px-3">{t('tools.carWash.costUnit', 'Cost/Unit')}</th>
                        <th className="text-center py-2 px-3">{t('tools.carWash.status', 'Status')}</th>
                        <th className="text-center py-2 px-3">{t('tools.carWash.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(item => (
                        <tr key={item.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-3 px-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </td>
                          <td className={`py-3 px-3 capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.category}
                          </td>
                          <td className={`py-3 px-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.quantity} {item.unit}
                          </td>
                          <td className={`py-3 px-3 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.minStock}
                          </td>
                          <td className={`py-3 px-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${item.costPerUnit.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.quantity <= item.minStock ? (
                              <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs">{t('tools.carWash.lowStock', 'Low Stock')}</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">{t('tools.carWash.inStock', 'In Stock')}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => setInventory(prev => prev.filter(i => i.id !== item.id))}
                              className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.equipmentMaintenanceLog', 'Equipment Maintenance Log')}
                </h2>
                <button
                  onClick={() => setShowMaintenanceForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Log
                </button>
              </div>

              {showMaintenanceForm && <MaintenanceForm onClose={() => setShowMaintenanceForm(false)} />}

              {maintenanceLogs.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.carWash.noMaintenanceLogs', 'No maintenance logs')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {log.equipmentName}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {log.description}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${
                          log.type === 'repair'
                            ? 'bg-red-500/20 text-red-500'
                            : log.type === 'inspection'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-green-500/20 text-green-500'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          <Calendar className="inline w-3 h-3 mr-1" />
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          By: {log.performedBy}
                        </span>
                        <span className="text-[#0D9488] font-medium">
                          ${log.cost.toFixed(2)}
                        </span>
                        {log.nextDueDate && (
                          <span className="text-yellow-500">
                            Next: {new Date(log.nextDueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.prepaidGiftCards', 'Prepaid & Gift Cards')}
                </h2>
                <button
                  onClick={() => setShowCardForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Create Card
                </button>
              </div>

              {showCardForm && <CardForm onClose={() => setShowCardForm(false)} />}

              {prepaidCards.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.carWash.noCardsIssued', 'No cards issued')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prepaidCards.map(card => (
                    <div
                      key={card.id}
                      className={`p-4 rounded-lg border ${
                        card.type === 'gift'
                          ? 'border-purple-500 bg-purple-500/10'
                          : isDark
                          ? 'border-gray-600 bg-gray-700'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {card.type === 'gift' ? (
                            <Gift className="w-5 h-5 text-purple-500" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-[#0D9488]" />
                          )}
                          <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {card.cardNumber}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          card.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {card.isActive ? t('tools.carWash.active2', 'Active') : t('tools.carWash.expired2', 'Expired')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#0D9488] mb-2">
                        ${card.balance.toFixed(2)}
                        <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          / ${card.originalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {card.customerName && (
                          <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Customer: {card.customerName}
                          </div>
                        )}
                        <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Expires: {new Date(card.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setPrepaidCards(prev => prev.filter(c => c.id !== card.id))}
                        className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm hover:bg-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.carWash.dailyAnalytics', 'Daily Analytics')}
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.totalCarsToday', 'Total Cars Today')}</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {todayStats.totalCars}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.completed', 'Completed')}</div>
                  <div className="text-3xl font-bold text-green-500">{todayStats.completedCars}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.expressLane', 'Express Lane')}</div>
                  <div className="text-3xl font-bold text-yellow-500">{todayStats.expressCount}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carWash.fullService', 'Full Service')}</div>
                  <div className="text-3xl font-bold text-blue-500">{todayStats.fullServiceCount}</div>
                </div>
              </div>

              {/* Revenue by Service */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.revenueByServiceType', 'Revenue by Service Type')}
                </h3>
                {Object.keys(todayStats.revenueByService).length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.carWash.noCompletedServicesToday', 'No completed services today')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(todayStats.revenueByService).map(([service, revenue]) => (
                      <div key={service} className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{service}</span>
                        <span className="font-bold text-[#0D9488]">${revenue.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className={`border-t pt-3 flex items-center justify-between ${
                      isDark ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carWash.totalRevenue', 'Total Revenue')}</span>
                      <span className="text-2xl font-bold text-green-500">${todayStats.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Members Summary */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carWash.membershipSummary', 'Membership Summary')}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#0D9488]">
                      {members.filter(m => m.isActive).length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.carWash.activeMembers', 'Active Members')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {members.filter(m => m.planType === 'unlimited').length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.carWash.unlimitedPlans', 'Unlimited Plans')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">
                      {prepaidCards.filter(c => c.isActive).length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.carWash.activeCards', 'Active Cards')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarWashTool;
