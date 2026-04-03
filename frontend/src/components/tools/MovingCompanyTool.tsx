'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Truck,
  Package,
  Users,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  Star,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Home,
  Building,
  Warehouse,
  Shield,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Box,
  Route,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

// Types
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  room: string;
  fragile: boolean;
  specialHandling: string;
  estimatedWeight: number;
}

interface PackingChecklistItem {
  id: string;
  room: string;
  task: string;
  completed: boolean;
}

interface CrewMember {
  id: string;
  name: string;
  role: 'driver' | 'mover' | 'packer' | 'supervisor';
  phone: string;
  available: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  type: 'box_truck' | 'semi_truck' | 'van' | 'pickup';
  capacity: number;
  available: boolean;
  licensePlate: string;
}

interface PackingSupply {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

interface StorageUnit {
  id: string;
  name: string;
  size: string;
  monthlyRate: number;
  available: boolean;
}

interface Claim {
  id: string;
  itemName: string;
  description: string;
  estimatedValue: number;
  status: 'pending' | 'reviewing' | 'approved' | 'denied';
  dateReported: string;
  photos: string[];
}

interface SurveyResponse {
  id: string;
  rating: number;
  feedback: string;
  wouldRecommend: boolean;
  date: string;
}

interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  moveDate: string;
  moveTime: string;
  estimatedHours: number;
  distance: number;
  status: 'scheduled' | 'in_progress' | 'complete' | 'cancelled';
  inventoryItems: InventoryItem[];
  packingChecklist: PackingChecklistItem[];
  assignedCrew: string[];
  assignedVehicles: string[];
  packingSupplies: PackingSupply[];
  insuranceType: 'basic' | 'full_value' | 'declared_value';
  declaredValue: number;
  storageUnitId: string | null;
  storageStartDate: string | null;
  storageEndDate: string | null;
  claims: Claim[];
  survey: SurveyResponse | null;
  basePrice: number;
  laborCost: number;
  materialsCost: number;
  insuranceCost: number;
  storageCost: number;
  totalPrice: number;
  notes: string;
  createdAt: string;
}

type TabType = 'jobs' | 'inventory' | 'crew' | 'vehicles' | 'supplies' | 'storage' | 'claims' | 'surveys';

const defaultRooms = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Office', 'Garage', 'Basement', 'Attic', 'Outdoor'];

const defaultPackingTasks: Record<string, string[]> = {
  'Living Room': ['Pack electronics', 'Wrap furniture', 'Box decorations', 'Disassemble shelving', 'Roll up rugs'],
  'Bedroom': ['Pack clothes', 'Disassemble bed frame', 'Wrap mattress', 'Box personal items', 'Pack bedding'],
  'Kitchen': ['Wrap dishes', 'Pack appliances', 'Box utensils', 'Secure glassware', 'Pack pantry items'],
  'Bathroom': ['Pack toiletries', 'Secure medications', 'Box towels', 'Pack cleaning supplies'],
  'Dining Room': ['Wrap china', 'Disassemble table', 'Protect chair legs', 'Pack table linens'],
  'Office': ['Pack documents', 'Wrap monitors', 'Disassemble desk', 'Box office supplies', 'Backup electronics'],
  'Garage': ['Pack tools', 'Drain equipment', 'Box hardware', 'Secure ladders'],
  'Basement': ['Sort items', 'Pack seasonal items', 'Box storage items'],
  'Attic': ['Sort belongings', 'Pack memorabilia', 'Box holiday decorations'],
  'Outdoor': ['Clean furniture', 'Drain hoses', 'Pack garden tools', 'Secure grills'],
};

const insuranceRates = {
  basic: { rate: 0.60, perPound: true, description: 'Basic coverage at $0.60 per pound per article' },
  full_value: { rate: 0.01, perPound: false, description: 'Full replacement value coverage (1% of declared value)' },
  declared_value: { rate: 0.015, perPound: false, description: 'Declared value protection (1.5% of declared value)' },
};

// Column configurations for export
const jobColumns: ColumnConfig[] = [
  { key: 'id', header: 'Job ID', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'originAddress', header: 'Origin Address', type: 'string' },
  { key: 'originCity', header: 'Origin City', type: 'string' },
  { key: 'originState', header: 'Origin State', type: 'string' },
  { key: 'destinationAddress', header: 'Destination Address', type: 'string' },
  { key: 'destinationCity', header: 'Destination City', type: 'string' },
  { key: 'destinationState', header: 'Destination State', type: 'string' },
  { key: 'moveDate', header: 'Move Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
];

// Default sample data for initial state
const defaultJobs: Job[] = [];

const defaultCrewMembers: CrewMember[] = [
  { id: '1', name: 'John Smith', role: 'supervisor', phone: '555-0101', available: true },
  { id: '2', name: 'Mike Johnson', role: 'driver', phone: '555-0102', available: true },
  { id: '3', name: 'David Brown', role: 'mover', phone: '555-0103', available: true },
  { id: '4', name: 'Chris Wilson', role: 'mover', phone: '555-0104', available: true },
  { id: '5', name: 'Tom Davis', role: 'packer', phone: '555-0105', available: true },
];

const defaultVehicles: Vehicle[] = [
  { id: '1', name: 'Truck A', type: 'box_truck', capacity: 1200, available: true, licensePlate: 'ABC-1234' },
  { id: '2', name: 'Truck B', type: 'semi_truck', capacity: 2500, available: true, licensePlate: 'DEF-5678' },
  { id: '3', name: 'Van C', type: 'van', capacity: 400, available: true, licensePlate: 'GHI-9012' },
];

const defaultPackingSupplies: PackingSupply[] = [
  { id: '1', name: 'Small Box', quantity: 100, unit: 'boxes', pricePerUnit: 2.50 },
  { id: '2', name: 'Medium Box', quantity: 75, unit: 'boxes', pricePerUnit: 3.50 },
  { id: '3', name: 'Large Box', quantity: 50, unit: 'boxes', pricePerUnit: 4.50 },
  { id: '4', name: 'Wardrobe Box', quantity: 20, unit: 'boxes', pricePerUnit: 12.00 },
  { id: '5', name: 'Packing Paper', quantity: 200, unit: 'lbs', pricePerUnit: 0.50 },
  { id: '6', name: 'Bubble Wrap', quantity: 500, unit: 'feet', pricePerUnit: 0.25 },
  { id: '7', name: 'Packing Tape', quantity: 50, unit: 'rolls', pricePerUnit: 4.00 },
  { id: '8', name: 'Furniture Pads', quantity: 30, unit: 'pads', pricePerUnit: 15.00 },
  { id: '9', name: 'Stretch Wrap', quantity: 20, unit: 'rolls', pricePerUnit: 8.00 },
  { id: '10', name: 'Mattress Bags', quantity: 15, unit: 'bags', pricePerUnit: 10.00 },
];

const defaultStorageUnits: StorageUnit[] = [
  { id: '1', name: 'Unit A1 - Small', size: '5x5', monthlyRate: 75, available: true },
  { id: '2', name: 'Unit B2 - Medium', size: '10x10', monthlyRate: 150, available: true },
  { id: '3', name: 'Unit C3 - Large', size: '10x20', monthlyRate: 250, available: true },
  { id: '4', name: 'Unit D4 - Climate', size: '10x15', monthlyRate: 200, available: true },
];

interface MovingCompanyToolProps {
  uiConfig?: UIConfig;
}

export const MovingCompanyTool: React.FC<MovingCompanyToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use useToolData hook for jobs with backend sync
  const {
    data: jobsDataArray,
    addItem: addJob,
    updateItem: updateJob,
    deleteItem: deleteJobItem,
    findItem: findJob,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Job>(
    'moving-company-jobs',
    defaultJobs,
    jobColumns,
    { autoSave: true }
  );

  // Create a compatible jobsData object for existing code
  const jobsData = {
    data: jobsDataArray,
    addItem: addJob,
    updateItem: updateJob,
    deleteItem: deleteJobItem,
    findItem: findJob,
  };

  // Local state for reference data (crew, vehicles, supplies, storage)
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(defaultCrewMembers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(defaultVehicles);
  const [packingSupplies, setPackingSupplies] = useState<PackingSupply[]>(defaultPackingSupplies);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>(defaultStorageUnits);

  // Convenience accessor for jobs
  const jobs = jobsData.data;

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.address || params.location) {
        // Could be used for search or notes - mark as prefilled
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job>>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    originAddress: '',
    originCity: '',
    originState: '',
    originZip: '',
    destinationAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    moveDate: '',
    moveTime: '08:00',
    status: 'scheduled',
    inventoryItems: [],
    packingChecklist: [],
    assignedCrew: [],
    assignedVehicles: [],
    packingSupplies: [],
    insuranceType: 'basic',
    declaredValue: 0,
    storageUnitId: null,
    storageStartDate: null,
    storageEndDate: null,
    claims: [],
    survey: null,
    notes: '',
  });

  // Inventory form state
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [inventoryForm, setInventoryForm] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    room: 'Living Room',
    fragile: false,
    specialHandling: '',
    estimatedWeight: 0,
  });

  // UI state
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveyForm, setSurveyForm] = useState({ rating: 5, feedback: '', wouldRecommend: true });
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({ itemName: '', description: '', estimatedValue: 0 });

  // Calculate pricing
  const calculatePricing = (job: Partial<Job>) => {
    const distance = job.distance || 0;
    const hours = job.estimatedHours || 0;
    const totalWeight = (job.inventoryItems || []).reduce((sum, item) => sum + (item.estimatedWeight * item.quantity), 0);

    // Base price: $1.50 per mile
    const basePrice = distance * 1.50;

    // Labor cost: $150/hour for crew
    const crewCount = (job.assignedCrew || []).length;
    const laborCost = hours * 150 * Math.max(crewCount, 1);

    // Materials cost
    const materialsCost = (job.packingSupplies || []).reduce((sum, supply) => {
      const supplyData = packingSupplies.find((s: PackingSupply) => s.id === supply.id);
      return sum + (supplyData ? supplyData.pricePerUnit * supply.quantity : 0);
    }, 0);

    // Insurance cost
    let insuranceCost = 0;
    const insurance = insuranceRates[job.insuranceType || 'basic'];
    if (insurance.perPound) {
      insuranceCost = totalWeight * insurance.rate;
    } else {
      insuranceCost = (job.declaredValue || 0) * insurance.rate;
    }

    // Storage cost
    let storageCost = 0;
    if (job.storageUnitId && job.storageStartDate && job.storageEndDate) {
      const unit = storageUnits.find((u: StorageUnit) => u.id === job.storageUnitId);
      if (unit) {
        const start = new Date(job.storageStartDate);
        const end = new Date(job.storageEndDate);
        const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        storageCost = unit.monthlyRate * Math.max(months, 1);
      }
    }

    const totalPrice = basePrice + laborCost + materialsCost + insuranceCost + storageCost;

    return { basePrice, laborCost, materialsCost, insuranceCost, storageCost, totalPrice };
  };

  // Calculate distance (simplified - in production use a real API)
  const calculateDistance = (originZip: string, destZip: string): number => {
    if (!originZip || !destZip) return 0;
    // Simplified distance calculation based on zip code difference
    const originNum = parseInt(originZip.slice(0, 3)) || 0;
    const destNum = parseInt(destZip.slice(0, 3)) || 0;
    return Math.abs(originNum - destNum) * 10 + Math.floor(Math.random() * 50);
  };

  // Estimate hours based on inventory
  const estimateHours = (items: InventoryItem[]): number => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const fragileItems = items.filter(item => item.fragile).reduce((sum, item) => sum + item.quantity, 0);
    return Math.ceil((totalItems * 0.1) + (fragileItems * 0.15) + 2); // Base 2 hours + item calculation
  };

  // Generate packing checklist for selected rooms
  const generatePackingChecklist = (rooms: string[]): PackingChecklistItem[] => {
    const checklist: PackingChecklistItem[] = [];
    rooms.forEach(room => {
      const tasks = defaultPackingTasks[room] || [];
      tasks.forEach(task => {
        checklist.push({
          id: `${room}-${task}-${Date.now()}-${Math.random()}`,
          room,
          task,
          completed: false,
        });
      });
    });
    return checklist;
  };

  // Save job
  const saveJob = () => {
    const distance = calculateDistance(jobForm.originZip || '', jobForm.destinationZip || '');
    const estimatedHours = estimateHours(jobForm.inventoryItems || []);
    const pricing = calculatePricing({ ...jobForm, distance, estimatedHours });

    const newJob: Job = {
      id: editingJob?.id || `job-${Date.now()}`,
      customerName: jobForm.customerName || '',
      customerPhone: jobForm.customerPhone || '',
      customerEmail: jobForm.customerEmail || '',
      originAddress: jobForm.originAddress || '',
      originCity: jobForm.originCity || '',
      originState: jobForm.originState || '',
      originZip: jobForm.originZip || '',
      destinationAddress: jobForm.destinationAddress || '',
      destinationCity: jobForm.destinationCity || '',
      destinationState: jobForm.destinationState || '',
      destinationZip: jobForm.destinationZip || '',
      moveDate: jobForm.moveDate || '',
      moveTime: jobForm.moveTime || '08:00',
      estimatedHours,
      distance,
      status: jobForm.status || 'scheduled',
      inventoryItems: jobForm.inventoryItems || [],
      packingChecklist: jobForm.packingChecklist || [],
      assignedCrew: jobForm.assignedCrew || [],
      assignedVehicles: jobForm.assignedVehicles || [],
      packingSupplies: jobForm.packingSupplies || [],
      insuranceType: jobForm.insuranceType || 'basic',
      declaredValue: jobForm.declaredValue || 0,
      storageUnitId: jobForm.storageUnitId || null,
      storageStartDate: jobForm.storageStartDate || null,
      storageEndDate: jobForm.storageEndDate || null,
      claims: jobForm.claims || [],
      survey: jobForm.survey || null,
      notes: jobForm.notes || '',
      createdAt: editingJob?.createdAt || new Date().toISOString(),
      ...pricing,
    };

    if (editingJob) {
      jobsData.updateItem(editingJob.id, newJob);
    } else {
      jobsData.addItem(newJob);
    }

    resetJobForm();
  };

  const resetJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
    setJobForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      originAddress: '',
      originCity: '',
      originState: '',
      originZip: '',
      destinationAddress: '',
      destinationCity: '',
      destinationState: '',
      destinationZip: '',
      moveDate: '',
      moveTime: '08:00',
      status: 'scheduled',
      inventoryItems: [],
      packingChecklist: [],
      assignedCrew: [],
      assignedVehicles: [],
      packingSupplies: [],
      insuranceType: 'basic',
      declaredValue: 0,
      storageUnitId: null,
      storageStartDate: null,
      storageEndDate: null,
      claims: [],
      survey: null,
      notes: '',
    });
  };

  // Add inventory item to job
  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: inventoryForm.name || '',
      quantity: inventoryForm.quantity || 1,
      room: inventoryForm.room || 'Living Room',
      fragile: inventoryForm.fragile || false,
      specialHandling: inventoryForm.specialHandling || '',
      estimatedWeight: inventoryForm.estimatedWeight || 0,
    };

    setJobForm(prev => ({
      ...prev,
      inventoryItems: [...(prev.inventoryItems || []), newItem],
    }));

    // Auto-generate packing checklist for the room if not already present
    const existingRooms = new Set((jobForm.packingChecklist || []).map(item => item.room));
    if (!existingRooms.has(newItem.room)) {
      const newChecklistItems = generatePackingChecklist([newItem.room]);
      setJobForm(prev => ({
        ...prev,
        packingChecklist: [...(prev.packingChecklist || []), ...newChecklistItems],
      }));
    }

    setShowInventoryForm(false);
    setInventoryForm({
      name: '',
      quantity: 1,
      room: 'Living Room',
      fragile: false,
      specialHandling: '',
      estimatedWeight: 0,
    });
  };

  // Remove inventory item
  const removeInventoryItem = (itemId: string) => {
    setJobForm(prev => ({
      ...prev,
      inventoryItems: (prev.inventoryItems || []).filter(item => item.id !== itemId),
    }));
  };

  // Toggle checklist item
  const toggleChecklistItem = (jobId: string, itemId: string) => {
    const job = jobsData.findItem(jobId);
    if (job) {
      const updatedChecklist = job.packingChecklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      jobsData.updateItem(jobId, { packingChecklist: updatedChecklist });
    }
  };

  // Update job status
  const updateJobStatus = (jobId: string, status: Job['status']) => {
    jobsData.updateItem(jobId, { status });
  };

  // Add claim
  const addClaim = (jobId: string) => {
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      itemName: claimForm.itemName,
      description: claimForm.description,
      estimatedValue: claimForm.estimatedValue,
      status: 'pending',
      dateReported: new Date().toISOString(),
      photos: [],
    };

    const job = jobsData.findItem(jobId);
    if (job) {
      jobsData.updateItem(jobId, { claims: [...job.claims, newClaim] });
    }

    setShowClaimForm(false);
    setClaimForm({ itemName: '', description: '', estimatedValue: 0 });
  };

  // Add survey
  const addSurvey = (jobId: string) => {
    const newSurvey: SurveyResponse = {
      id: `survey-${Date.now()}`,
      rating: surveyForm.rating,
      feedback: surveyForm.feedback,
      wouldRecommend: surveyForm.wouldRecommend,
      date: new Date().toISOString(),
    };

    jobsData.updateItem(jobId, { survey: newSurvey });

    setShowSurveyForm(false);
    setSurveyForm({ rating: 5, feedback: '', wouldRecommend: true });
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this job?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      jobsData.deleteItem(jobId);
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    return {
      totalJobs: jobs.length,
      scheduledJobs: jobs.filter(j => j.status === 'scheduled').length,
      inProgressJobs: jobs.filter(j => j.status === 'in_progress').length,
      completedJobs: jobs.filter(j => j.status === 'complete').length,
      totalRevenue: jobs.filter(j => j.status === 'complete').reduce((sum, j) => sum + j.totalPrice, 0),
      avgRating: jobs.filter(j => j.survey).reduce((sum, j) => sum + (j.survey?.rating || 0), 0) /
                 Math.max(jobs.filter(j => j.survey).length, 1),
      pendingClaims: jobs.reduce((sum, j) => sum + j.claims.filter(c => c.status === 'pending').length, 0),
    };
  }, [jobs]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'jobs', label: 'Jobs', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'crew', label: 'Crew', icon: <Users className="w-4 h-4" /> },
    { id: 'vehicles', label: 'Vehicles', icon: <Truck className="w-4 h-4" /> },
    { id: 'supplies', label: 'Supplies', icon: <Box className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'claims', label: 'Claims', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'surveys', label: 'Surveys', icon: <Star className="w-4 h-4" /> },
  ];

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'complete': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getClaimStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'reviewing': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.movingCompanyManager', 'Moving Company Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.movingCompany.completeJobManagementForYour', 'Complete job management for your moving business')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isPrefilled && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                  <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span className="text-xs text-[#0D9488] font-medium">{t('tools.movingCompany.prefilled', 'Prefilled')}</span>
                </div>
              )}
              <WidgetEmbedButton toolSlug="moving-company" toolName="Moving Company" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(jobs, jobColumns, { filename: 'moving-company-jobs' })}
                onExportExcel={() => exportToExcel(jobs, jobColumns, { filename: 'moving-company-jobs' })}
                onExportJSON={() => exportToJSON(jobs, { filename: 'moving-company-jobs' })}
                onExportPDF={() => exportToPDF(jobs, jobColumns, { filename: 'moving-company-jobs' })}
                onCopy={() => copyUtil(jobs, jobColumns)}
                onPrint={() => printData(jobs, jobColumns, { title: 'Moving Company Jobs' })}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.totalJobs', 'Total Jobs')}</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalJobs}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.scheduled', 'Scheduled')}</div>
              <div className="text-2xl font-bold text-blue-500">{stats.scheduledJobs}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.inProgress', 'In Progress')}</div>
              <div className="text-2xl font-bold text-yellow-500">{stats.inProgressJobs}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.completed', 'Completed')}</div>
              <div className="text-2xl font-bold text-green-500">{stats.completedJobs}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.revenue', 'Revenue')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">${stats.totalRevenue.toLocaleString()}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.avgRating', 'Avg Rating')}</div>
              <div className="text-2xl font-bold text-orange-500">{stats.avgRating.toFixed(1)}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCompany.pendingClaims', 'Pending Claims')}</div>
              <div className="text-2xl font-bold text-red-500">{stats.pendingClaims}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0D9488] text-[#0D9488]'
                    : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.movingCompany.movingJobs', 'Moving Jobs')}
                  </h2>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.movingCompany.newJob', 'New Job')}
                  </button>
                </div>

                {/* Job Form Modal */}
                {showJobForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
                      <div className="sticky top-0 bg-inherit p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {editingJob ? t('tools.movingCompany.editJob', 'Edit Job') : t('tools.movingCompany.newJobBooking', 'New Job Booking')}
                        </h3>
                        <button onClick={resetJobForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {t('tools.movingCompany.customerInformation', 'Customer Information')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                              type="text"
                              placeholder={t('tools.movingCompany.customerName', 'Customer Name')}
                              value={jobForm.customerName}
                              onChange={(e) => setJobForm(prev => ({ ...prev, customerName: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <input
                              type="tel"
                              placeholder={t('tools.movingCompany.phoneNumber', 'Phone Number')}
                              value={jobForm.customerPhone}
                              onChange={(e) => setJobForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <input
                              type="email"
                              placeholder={t('tools.movingCompany.emailAddress', 'Email Address')}
                              value={jobForm.customerEmail}
                              onChange={(e) => setJobForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                          </div>
                        </div>

                        {/* Origin Address */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Home className="w-4 h-4" /> Origin Address
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                              type="text"
                              placeholder={t('tools.movingCompany.streetAddress', 'Street Address')}
                              value={jobForm.originAddress}
                              onChange={(e) => setJobForm(prev => ({ ...prev, originAddress: e.target.value }))}
                              className={`md:col-span-2 px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <input
                              type="text"
                              placeholder={t('tools.movingCompany.city', 'City')}
                              value={jobForm.originCity}
                              onChange={(e) => setJobForm(prev => ({ ...prev, originCity: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={t('tools.movingCompany.state', 'State')}
                                value={jobForm.originState}
                                onChange={(e) => setJobForm(prev => ({ ...prev, originState: e.target.value }))}
                                className={`w-1/2 px-4 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                              <input
                                type="text"
                                placeholder={t('tools.movingCompany.zip', 'ZIP')}
                                value={jobForm.originZip}
                                onChange={(e) => setJobForm(prev => ({ ...prev, originZip: e.target.value }))}
                                className={`w-1/2 px-4 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Destination Address */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Building className="w-4 h-4" /> Destination Address
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                              type="text"
                              placeholder={t('tools.movingCompany.streetAddress2', 'Street Address')}
                              value={jobForm.destinationAddress}
                              onChange={(e) => setJobForm(prev => ({ ...prev, destinationAddress: e.target.value }))}
                              className={`md:col-span-2 px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <input
                              type="text"
                              placeholder={t('tools.movingCompany.city2', 'City')}
                              value={jobForm.destinationCity}
                              onChange={(e) => setJobForm(prev => ({ ...prev, destinationCity: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={t('tools.movingCompany.state2', 'State')}
                                value={jobForm.destinationState}
                                onChange={(e) => setJobForm(prev => ({ ...prev, destinationState: e.target.value }))}
                                className={`w-1/2 px-4 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                              <input
                                type="text"
                                placeholder={t('tools.movingCompany.zip2', 'ZIP')}
                                value={jobForm.destinationZip}
                                onChange={(e) => setJobForm(prev => ({ ...prev, destinationZip: e.target.value }))}
                                className={`w-1/2 px-4 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Calendar className="w-4 h-4" /> Schedule
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="date"
                              value={jobForm.moveDate}
                              onChange={(e) => setJobForm(prev => ({ ...prev, moveDate: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                            <input
                              type="time"
                              value={jobForm.moveTime}
                              onChange={(e) => setJobForm(prev => ({ ...prev, moveTime: e.target.value }))}
                              className={`px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            />
                          </div>
                        </div>

                        {/* Inventory Section */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h4 className={`font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                              <Package className="w-4 h-4" /> Inventory Items
                            </h4>
                            <button
                              onClick={() => setShowInventoryForm(true)}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Item
                            </button>
                          </div>

                          {showInventoryForm && (
                            <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <input
                                  type="text"
                                  placeholder={t('tools.movingCompany.itemName2', 'Item Name')}
                                  value={inventoryForm.name}
                                  onChange={(e) => setInventoryForm(prev => ({ ...prev, name: e.target.value }))}
                                  className={`px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                                <input
                                  type="number"
                                  placeholder={t('tools.movingCompany.quantity', 'Quantity')}
                                  min="1"
                                  value={inventoryForm.quantity}
                                  onChange={(e) => setInventoryForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                  className={`px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                                <select
                                  value={inventoryForm.room}
                                  onChange={(e) => setInventoryForm(prev => ({ ...prev, room: e.target.value }))}
                                  className={`px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  {defaultRooms.map(room => (
                                    <option key={room} value={room}>{room}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <input
                                  type="number"
                                  placeholder={t('tools.movingCompany.estWeightLbs', 'Est. Weight (lbs)')}
                                  min="0"
                                  value={inventoryForm.estimatedWeight}
                                  onChange={(e) => setInventoryForm(prev => ({ ...prev, estimatedWeight: parseFloat(e.target.value) || 0 }))}
                                  className={`px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                                <input
                                  type="text"
                                  placeholder={t('tools.movingCompany.specialHandlingNotes', 'Special Handling Notes')}
                                  value={inventoryForm.specialHandling}
                                  onChange={(e) => setInventoryForm(prev => ({ ...prev, specialHandling: e.target.value }))}
                                  className={`px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={inventoryForm.fragile}
                                    onChange={(e) => setInventoryForm(prev => ({ ...prev, fragile: e.target.checked }))}
                                    className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                                  />
                                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.movingCompany.fragile', 'Fragile')}</span>
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={addInventoryItem}
                                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                                >
                                  {t('tools.movingCompany.add', 'Add')}
                                </button>
                                <button
                                  onClick={() => setShowInventoryForm(false)}
                                  className={`px-4 py-2 rounded-lg ${
                                    theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                  }`}
                                >
                                  {t('tools.movingCompany.cancel', 'Cancel')}
                                </button>
                              </div>
                            </div>
                          )}

                          {(jobForm.inventoryItems || []).length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {(jobForm.inventoryItems || []).map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {item.name}
                                    </span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      x{item.quantity}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                      {item.room}
                                    </span>
                                    {item.fragile && (
                                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">{t('tools.movingCompany.fragile2', 'Fragile')}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeInventoryItem(item.id)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Crew Assignment */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Users className="w-4 h-4" /> Assign Crew
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {crewMembers.filter(c => c.available).map((crew) => (
                              <label
                                key={crew.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                                  (jobForm.assignedCrew || []).includes(crew.id)
                                    ? 'bg-[#0D9488]/20 border-[#0D9488]'
                                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                } border`}
                              >
                                <input
                                  type="checkbox"
                                  checked={(jobForm.assignedCrew || []).includes(crew.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setJobForm(prev => ({
                                        ...prev,
                                        assignedCrew: [...(prev.assignedCrew || []), crew.id],
                                      }));
                                    } else {
                                      setJobForm(prev => ({
                                        ...prev,
                                        assignedCrew: (prev.assignedCrew || []).filter(id => id !== crew.id),
                                      }));
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                                />
                                <div>
                                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {crew.name}
                                  </div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {crew.role}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Vehicle Assignment */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Truck className="w-4 h-4" /> Assign Vehicles
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {vehicles.filter(v => v.available).map((vehicle) => (
                              <label
                                key={vehicle.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                                  (jobForm.assignedVehicles || []).includes(vehicle.id)
                                    ? 'bg-[#0D9488]/20 border-[#0D9488]'
                                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                } border`}
                              >
                                <input
                                  type="checkbox"
                                  checked={(jobForm.assignedVehicles || []).includes(vehicle.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setJobForm(prev => ({
                                        ...prev,
                                        assignedVehicles: [...(prev.assignedVehicles || []), vehicle.id],
                                      }));
                                    } else {
                                      setJobForm(prev => ({
                                        ...prev,
                                        assignedVehicles: (prev.assignedVehicles || []).filter(id => id !== vehicle.id),
                                      }));
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                                />
                                <div>
                                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {vehicle.name}
                                  </div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {vehicle.capacity} cu.ft
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Insurance */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Shield className="w-4 h-4" /> Insurance / Valuation
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(insuranceRates).map(([type, info]) => (
                              <label
                                key={type}
                                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer ${
                                  jobForm.insuranceType === type
                                    ? 'bg-[#0D9488]/20 border-[#0D9488]'
                                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                } border`}
                              >
                                <input
                                  type="radio"
                                  name="insurance"
                                  checked={jobForm.insuranceType === type}
                                  onChange={() => setJobForm(prev => ({ ...prev, insuranceType: type as Job['insuranceType'] }))}
                                  className="mt-1 w-4 h-4 text-[#0D9488] focus:ring-[#0D9488]"
                                />
                                <div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {info.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                            {(jobForm.insuranceType === 'full_value' || jobForm.insuranceType === 'declared_value') && (
                              <input
                                type="number"
                                placeholder={t('tools.movingCompany.declaredValue', 'Declared Value ($)')}
                                value={jobForm.declaredValue}
                                onChange={(e) => setJobForm(prev => ({ ...prev, declaredValue: parseFloat(e.target.value) || 0 }))}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Storage */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Warehouse className="w-4 h-4" /> Storage (Optional)
                          </h4>
                          <div className="space-y-3">
                            <select
                              value={jobForm.storageUnitId || ''}
                              onChange={(e) => setJobForm(prev => ({ ...prev, storageUnitId: e.target.value || null }))}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                            >
                              <option value="">{t('tools.movingCompany.noStorageNeeded', 'No storage needed')}</option>
                              {storageUnits.filter(u => u.available).map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name} ({unit.size}) - ${unit.monthlyRate}/mo
                                </option>
                              ))}
                            </select>
                            {jobForm.storageUnitId && (
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="date"
                                  placeholder={t('tools.movingCompany.startDate', 'Start Date')}
                                  value={jobForm.storageStartDate || ''}
                                  onChange={(e) => setJobForm(prev => ({ ...prev, storageStartDate: e.target.value }))}
                                  className={`px-4 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border-gray-600 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                                <input
                                  type="date"
                                  placeholder={t('tools.movingCompany.endDate', 'End Date')}
                                  value={jobForm.storageEndDate || ''}
                                  onChange={(e) => setJobForm(prev => ({ ...prev, storageEndDate: e.target.value }))}
                                  className={`px-4 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border-gray-600 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            <FileText className="w-4 h-4" /> Notes
                          </h4>
                          <textarea
                            placeholder={t('tools.movingCompany.additionalNotesOrSpecialInstructions', 'Additional notes or special instructions...')}
                            value={jobForm.notes}
                            onChange={(e) => setJobForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
                          />
                        </div>

                        {/* Price Estimate */}
                        {jobForm.originZip && jobForm.destinationZip && (
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                              <Calculator className="w-4 h-4" /> Price Estimate
                            </h4>
                            {(() => {
                              const distance = calculateDistance(jobForm.originZip || '', jobForm.destinationZip || '');
                              const hours = estimateHours(jobForm.inventoryItems || []);
                              const pricing = calculatePricing({ ...jobForm, distance, estimatedHours: hours });
                              return (
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.distance', 'Distance:')}</span>
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{distance} miles</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.estHours', 'Est. Hours:')}</span>
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{hours} hours</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.basePrice', 'Base Price:')}</span>
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricing.basePrice.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.labor', 'Labor:')}</span>
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricing.laborCost.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.materials', 'Materials:')}</span>
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricing.materialsCost.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.insurance', 'Insurance:')}</span>
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricing.insuranceCost.toFixed(2)}</span>
                                  </div>
                                  {pricing.storageCost > 0 && (
                                    <div className="flex justify-between">
                                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.movingCompany.storage', 'Storage:')}</span>
                                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${pricing.storageCost.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.movingCompany.total', 'Total:')}</span>
                                    <span className="text-[#0D9488]">${pricing.totalPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="sticky bottom-0 bg-inherit p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button
                          onClick={resetJobForm}
                          className={`px-6 py-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          {t('tools.movingCompany.cancel2', 'Cancel')}
                        </button>
                        <button
                          onClick={saveJob}
                          className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          {editingJob ? t('tools.movingCompany.updateJob', 'Update Job') : t('tools.movingCompany.createJob', 'Create Job')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Jobs List */}
                <div className="space-y-4">
                  {jobs.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.movingCompany.noJobsYetCreateYour', 'No jobs yet. Create your first moving job!')}</p>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <div
                        key={job.id}
                        className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} overflow-hidden`}
                      >
                        {/* Job Header */}
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedJobs(prev => {
                            const next = new Set(prev);
                            if (next.has(job.id)) next.delete(job.id);
                            else next.add(job.id);
                            return next;
                          })}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(job.status)}`}>
                                {job.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <div>
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {job.customerName}
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {job.originCity}, {job.originState} to {job.destinationCity}, {job.destinationState}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  ${job.totalPrice.toLocaleString()}
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {new Date(job.moveDate).toLocaleDateString()}
                                </div>
                              </div>
                              {expandedJobs.has(job.id) ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedJobs.has(job.id) && (
                          <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} p-4`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Contact Info */}
                              <div>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.contact', 'Contact')}</h5>
                                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <p>{job.customerPhone}</p>
                                  <p>{job.customerEmail}</p>
                                </div>
                              </div>

                              {/* Addresses */}
                              <div>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.route', 'Route')}</h5>
                                <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 text-green-500" />
                                    <span>{job.originAddress}, {job.originCity}, {job.originState} {job.originZip}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 text-red-500" />
                                    <span>{job.destinationAddress}, {job.destinationCity}, {job.destinationState} {job.destinationZip}</span>
                                  </div>
                                  <p className="flex items-center gap-2">
                                    <Route className="w-4 h-4" />
                                    {job.distance} miles | {job.estimatedHours} hours
                                  </p>
                                </div>
                              </div>

                              {/* Schedule */}
                              <div>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.schedule', 'Schedule')}</h5>
                                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(job.moveDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {job.moveTime}
                                  </p>
                                </div>
                              </div>

                              {/* Inventory Summary */}
                              <div>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.inventory', 'Inventory')}</h5>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <p>{job.inventoryItems.length} item types</p>
                                  <p>{job.inventoryItems.reduce((sum, i) => sum + i.quantity, 0)} total items</p>
                                  <p>{job.inventoryItems.reduce((sum, i) => sum + (i.estimatedWeight * i.quantity), 0)} lbs est.</p>
                                </div>
                              </div>

                              {/* Crew */}
                              <div>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.assignedCrew', 'Assigned Crew')}</h5>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {job.assignedCrew.map(crewId => {
                                    const crew = crewMembers.find(c => c.id === crewId);
                                    return crew ? <p key={crewId}>{crew.name} ({crew.role})</p> : null;
                                  })}
                                </div>
                              </div>

                              {/* Vehicles */}
                              <div>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.vehicles', 'Vehicles')}</h5>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {job.assignedVehicles.map(vehicleId => {
                                    const vehicle = vehicles.find(v => v.id === vehicleId);
                                    return vehicle ? <p key={vehicleId}>{vehicle.name} ({vehicle.licensePlate})</p> : null;
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Packing Checklist */}
                            {job.packingChecklist.length > 0 && (
                              <div className="mt-6">
                                <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                  Packing Checklist ({job.packingChecklist.filter(i => i.completed).length}/{job.packingChecklist.length})
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {Object.entries(
                                    job.packingChecklist.reduce((acc, item) => {
                                      if (!acc[item.room]) acc[item.room] = [];
                                      acc[item.room].push(item);
                                      return acc;
                                    }, {} as Record<string, PackingChecklistItem[]>)
                                  ).map(([room, items]) => (
                                    <div key={room} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                      <h6 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{room}</h6>
                                      <div className="space-y-1">
                                        {items.map(item => (
                                          <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={item.completed}
                                              onChange={() => toggleChecklistItem(job.id, item.id)}
                                              className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                                            />
                                            <span className={`text-sm ${item.completed ? 'line-through opacity-50' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                              {item.task}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Price Breakdown */}
                            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.priceBreakdown', 'Price Breakdown')}</h5>
                              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCompany.base', 'Base')}</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${job.basePrice.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCompany.labor2', 'Labor')}</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${job.laborCost.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCompany.materials2', 'Materials')}</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${job.materialsCost.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCompany.insurance2', 'Insurance')}</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${job.insuranceCost.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCompany.storage2', 'Storage')}</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${job.storageCost.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCompany.total2', 'Total')}</div>
                                  <div className="font-bold text-[#0D9488]">${job.totalPrice.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                              <select
                                value={job.status}
                                onChange={(e) => updateJobStatus(job.id, e.target.value as Job['status'])}
                                className={`px-4 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              >
                                <option value="scheduled">{t('tools.movingCompany.scheduled2', 'Scheduled')}</option>
                                <option value="in_progress">{t('tools.movingCompany.inProgress2', 'In Progress')}</option>
                                <option value="complete">{t('tools.movingCompany.complete', 'Complete')}</option>
                                <option value="cancelled">{t('tools.movingCompany.cancelled', 'Cancelled')}</option>
                              </select>

                              <button
                                onClick={() => {
                                  setEditingJob(job);
                                  setJobForm(job);
                                  setShowJobForm(true);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                  theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('tools.movingCompany.edit', 'Edit')}
                              </button>

                              {job.status === 'complete' && !job.survey && (
                                <button
                                  onClick={() => {
                                    setSelectedJobId(job.id);
                                    setShowSurveyForm(true);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                                >
                                  <Star className="w-4 h-4" />
                                  {t('tools.movingCompany.addSurvey', 'Add Survey')}
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedJobId(job.id);
                                  setShowClaimForm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                {t('tools.movingCompany.fileClaim', 'File Claim')}
                              </button>

                              <button
                                onClick={() => deleteJob(job.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>

                            {/* Claims */}
                            {job.claims.length > 0 && (
                              <div className="mt-6">
                                <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.claims', 'Claims')}</h5>
                                <div className="space-y-2">
                                  {job.claims.map(claim => (
                                    <div key={claim.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{claim.itemName}</div>
                                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{claim.description}</div>
                                        </div>
                                        <div className="text-right">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getClaimStatusColor(claim.status)}`}>
                                            {claim.status}
                                          </span>
                                          <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            ${claim.estimatedValue.toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Survey */}
                            {job.survey && (
                              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.movingCompany.customerFeedback', 'Customer Feedback')}</h5>
                                <div className="flex items-center gap-2 mb-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-5 h-5 ${star <= job.survey!.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                                    />
                                  ))}
                                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{job.survey.rating}/5</span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{job.survey.feedback}</p>
                                <p className={`text-sm mt-2 ${job.survey.wouldRecommend ? 'text-green-500' : 'text-red-500'}`}>
                                  {job.survey.wouldRecommend ? t('tools.movingCompany.wouldRecommend', 'Would recommend') : t('tools.movingCompany.wouldNotRecommend', 'Would not recommend')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Crew Tab */}
            {activeTab === 'crew' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.crewMembers', 'Crew Members')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crewMembers.map((crew) => (
                    <div
                      key={crew.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{crew.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${crew.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {crew.available ? t('tools.movingCompany.available', 'Available') : t('tools.movingCompany.busy', 'Busy')}
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Role: {crew.role}</p>
                        <p>Phone: {crew.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.fleetVehicles', 'Fleet Vehicles')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${vehicle.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {vehicle.available ? t('tools.movingCompany.available2', 'Available') : t('tools.movingCompany.inUse', 'In Use')}
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Type: {vehicle.type.replace('_', ' ')}</p>
                        <p>Capacity: {vehicle.capacity} cu.ft</p>
                        <p>License: {vehicle.licensePlate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplies Tab */}
            {activeTab === 'supplies' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.packingSuppliesInventory', 'Packing Supplies Inventory')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packingSupplies.map((supply) => (
                    <div
                      key={supply.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    >
                      <div className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{supply.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>In Stock: {supply.quantity} {supply.unit}</p>
                        <p>Price: ${supply.pricePerUnit.toFixed(2)} per {supply.unit.slice(0, -1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.storageUnits', 'Storage Units')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storageUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{unit.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${unit.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {unit.available ? t('tools.movingCompany.available3', 'Available') : t('tools.movingCompany.occupied', 'Occupied')}
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Size: {unit.size}</p>
                        <p>Rate: ${unit.monthlyRate}/month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === 'claims' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.damageClaims', 'Damage Claims')}
                </h2>
                {jobs.flatMap(job =>
                  job.claims.map(claim => ({ ...claim, jobId: job.id, customerName: job.customerName }))
                ).length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.movingCompany.noClaimsFiledYet', 'No claims filed yet.')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.flatMap(job =>
                      job.claims.map(claim => (
                        <div
                          key={claim.id}
                          className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{claim.itemName}</div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Customer: {job.customerName}
                              </div>
                              <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{claim.description}</div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getClaimStatusColor(claim.status)}`}>
                                {claim.status}
                              </span>
                              <div className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${claim.estimatedValue.toLocaleString()}
                              </div>
                              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(claim.dateReported).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Surveys Tab */}
            {activeTab === 'surveys' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.customerSatisfactionSurveys', 'Customer Satisfaction Surveys')}
                </h2>
                {jobs.filter(job => job.survey).length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.movingCompany.noSurveysCompletedYet', 'No surveys completed yet.')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.filter(job => job.survey).map(job => (
                      <div
                        key={job.id}
                        className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{job.customerName}</div>
                            <div className="flex items-center gap-1 my-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= job.survey!.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                                />
                              ))}
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{job.survey!.feedback}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${job.survey!.wouldRecommend ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {job.survey!.wouldRecommend ? t('tools.movingCompany.wouldRecommend2', 'Would Recommend') : t('tools.movingCompany.wouldNotRecommend2', 'Would Not Recommend')}
                            </span>
                            <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(job.survey!.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inventory Tab - Global View */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.movingCompany.allInventoryItems', 'All Inventory Items')}
                </h2>
                {jobs.flatMap(job =>
                  job.inventoryItems.map(item => ({ ...item, jobId: job.id, customerName: job.customerName, status: job.status }))
                ).length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.movingCompany.noInventoryItemsYetCreate', 'No inventory items yet. Create a job to add items.')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.item', 'Item')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.customer', 'Customer')}</th>
                          <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.room', 'Room')}</th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.qty', 'Qty')}</th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.weight', 'Weight')}</th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.fragile3', 'Fragile')}</th>
                          <th className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.movingCompany.status', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.flatMap(job =>
                          job.inventoryItems.map(item => (
                            <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`px-4 py-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                              <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{job.customerName}</td>
                              <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item.room}</td>
                              <td className={`px-4 py-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item.quantity}</td>
                              <td className={`px-4 py-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item.estimatedWeight} lbs</td>
                              <td className="px-4 py-3 text-center">
                                {item.fragile && <span className="text-red-500">{t('tools.movingCompany.yes', 'Yes')}</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(job.status)}`}>
                                  {job.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Survey Form Modal */}
        {showSurveyForm && selectedJobId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.movingCompany.customerSatisfactionSurvey', 'Customer Satisfaction Survey')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.movingCompany.rating', 'Rating')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setSurveyForm(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= surveyForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.movingCompany.feedback', 'Feedback')}
                  </label>
                  <textarea
                    value={surveyForm.feedback}
                    onChange={(e) => setSurveyForm(prev => ({ ...prev, feedback: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.movingCompany.howWasYourExperience', 'How was your experience?')}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={surveyForm.wouldRecommend}
                    onChange={(e) => setSurveyForm(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.movingCompany.wouldRecommendToOthers', 'Would recommend to others')}</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSurveyForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.movingCompany.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={() => addSurvey(selectedJobId)}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  {t('tools.movingCompany.submitSurvey', 'Submit Survey')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Form Modal */}
        {showClaimForm && selectedJobId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.movingCompany.fileDamageClaim', 'File Damage Claim')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.movingCompany.itemName', 'Item Name')}
                  </label>
                  <input
                    type="text"
                    value={claimForm.itemName}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, itemName: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.movingCompany.whatWasDamaged', 'What was damaged?')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.movingCompany.description', 'Description')}
                  </label>
                  <textarea
                    value={claimForm.description}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.movingCompany.describeTheDamage', 'Describe the damage...')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.movingCompany.estimatedValue', 'Estimated Value ($)')}
                  </label>
                  <input
                    type="number"
                    value={claimForm.estimatedValue}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, estimatedValue: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.movingCompany.valueOfItem', 'Value of item')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowClaimForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.movingCompany.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={() => addClaim(selectedJobId)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  {t('tools.movingCompany.submitClaim', 'Submit Claim')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.movingCompany.aboutMovingCompanyManager', 'About Moving Company Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            A comprehensive tool for managing your moving company operations. Track customer jobs from booking to completion,
            manage inventory with room-by-room packing checklists, assign crew members and vehicles, calculate pricing based on
            distance and labor, handle insurance options, manage storage units, process damage claims, and collect customer
            satisfaction surveys. All data is automatically saved to your browser.
          </p>
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default MovingCompanyTool;
