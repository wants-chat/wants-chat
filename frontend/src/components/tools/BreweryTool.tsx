'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Beer,
  Package,
  Leaf,
  Calendar,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Music,
  Users,
  ClipboardCheck,
  UserCog,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  BarChart3,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  Check,
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

// Types
interface BeerItem {
  id: string;
  name: string;
  style: string;
  abv: number;
  ibu: number;
  format: 'tap' | 'can' | 'bottle';
  quantity: number;
  price: number;
  batchId?: string;
  createdAt: string;
}

interface Batch {
  id: string;
  name: string;
  style: string;
  brewDate: string;
  abv: number;
  ibu: number;
  status: 'fermenting' | 'conditioning' | 'ready' | 'tapped';
  volume: number;
  notes: string;
  createdAt: string;
}

interface Ingredient {
  id: string;
  name: string;
  type: 'hops' | 'malt' | 'yeast' | 'adjunct';
  quantity: number;
  unit: string;
  supplier: string;
  expiryDate: string;
  lowStockThreshold: number;
  createdAt: string;
}

interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  partySize: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

interface FlightItem {
  id: string;
  name: string;
  description: string;
  beers: string[];
  price: number;
  isActive: boolean;
  createdAt: string;
}

interface MerchItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  createdAt: string;
}

interface MerchSale {
  id: string;
  merchId: string;
  quantity: number;
  totalPrice: number;
  saleDate: string;
  paymentMethod: string;
  createdAt: string;
}

interface Distribution {
  id: string;
  customerName: string;
  beerId: string;
  quantity: number;
  unit: 'keg' | 'case' | 'pallet';
  deliveryDate: string;
  status: 'pending' | 'shipped' | 'delivered';
  address: string;
  notes: string;
  createdAt: string;
}

interface BreweryEvent {
  id: string;
  name: string;
  type: 'trivia' | 'live_music' | 'food_pairing' | 'release_party' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  capacity: number;
  registrations: number;
  price: number;
  createdAt: string;
}

interface TourBooking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  groupSize: number;
  tourType: 'standard' | 'vip' | 'private';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  notes: string;
  createdAt: string;
}

interface GrowlerFill {
  id: string;
  beerId: string;
  containerType: 'growler_32' | 'growler_64' | 'crowler_32' | 'crowler_16';
  quantity: number;
  price: number;
  customerName: string;
  fillDate: string;
  createdAt: string;
}

interface QualityNote {
  id: string;
  batchId: string;
  date: string;
  inspector: string;
  category: 'appearance' | 'aroma' | 'taste' | 'overall';
  rating: number;
  notes: string;
  issues: string;
  action: string;
  createdAt: string;
}

interface StaffShift {
  id: string;
  staffName: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface RevenueEntry {
  id: string;
  date: string;
  category: 'beer_sales' | 'merchandise' | 'tours' | 'events' | 'distribution' | 'growler_fills';
  productName: string;
  quantity: number;
  unitPrice: number;
  totalRevenue: number;
  notes: string;
  createdAt: string;
}

interface BreweryData {
  beers: BeerItem[];
  batches: Batch[];
  ingredients: Ingredient[];
  reservations: Reservation[];
  flights: FlightItem[];
  merchandise: MerchItem[];
  merchSales: MerchSale[];
  distributions: Distribution[];
  events: BreweryEvent[];
  tourBookings: TourBooking[];
  growlerFills: GrowlerFill[];
  qualityNotes: QualityNote[];
  staffShifts: StaffShift[];
  revenue: RevenueEntry[];
}

type TabType =
  | 'inventory'
  | 'batches'
  | 'ingredients'
  | 'reservations'
  | 'flights'
  | 'merchandise'
  | 'distribution'
  | 'events'
  | 'tours'
  | 'growlers'
  | 'quality'
  | 'staff'
  | 'revenue';

// Wrapper type for useToolData hook compatibility
interface BreweryDataWrapper {
  id: string;
  data: BreweryData;
}

const TOOL_ID = 'brewery-tool';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getDefaultBreweryData = (): BreweryData => ({
  beers: [],
  batches: [],
  ingredients: [],
  reservations: [],
  flights: [],
  merchandise: [],
  merchSales: [],
  distributions: [],
  events: [],
  tourBookings: [],
  growlerFills: [],
  qualityNotes: [],
  staffShifts: [],
  revenue: [],
});

// Column configuration for export (simplified since we're storing complex nested data)
const breweryColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'data', header: 'Data', type: 'string', format: (v) => JSON.stringify(v) },
];

// Columns for beer inventory export
const BEER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Beer Name', type: 'string' },
  { key: 'style', header: 'Style', type: 'string' },
  { key: 'abv', header: 'ABV (%)', type: 'number' },
  { key: 'ibu', header: 'IBU', type: 'number' },
  { key: 'format', header: 'Format', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'price', header: 'Price ($)', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Columns for revenue export
const REVENUE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'productName', header: 'Product', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unitPrice', header: 'Unit Price ($)', type: 'currency' },
  { key: 'totalRevenue', header: 'Total Revenue ($)', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'inventory', label: 'Beer Inventory', icon: <Beer className="w-4 h-4" /> },
  { id: 'batches', label: 'Batch Tracking', icon: <Package className="w-4 h-4" /> },
  { id: 'ingredients', label: 'Ingredients', icon: <Leaf className="w-4 h-4" /> },
  { id: 'reservations', label: 'Reservations', icon: <Calendar className="w-4 h-4" /> },
  { id: 'flights', label: 'Flights/Tastings', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'merchandise', label: 'Merchandise', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'distribution', label: 'Distribution', icon: <Truck className="w-4 h-4" /> },
  { id: 'events', label: 'Events', icon: <Music className="w-4 h-4" /> },
  { id: 'tours', label: 'Brewery Tours', icon: <Users className="w-4 h-4" /> },
  { id: 'growlers', label: 'Growler Fills', icon: <Beer className="w-4 h-4" /> },
  { id: 'quality', label: 'Quality Control', icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: 'staff', label: 'Staff Schedule', icon: <UserCog className="w-4 h-4" /> },
  { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
];

interface BreweryToolProps {
  uiConfig?: UIConfig;
}

export const BreweryTool = ({ uiConfig }: BreweryToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Initialize useToolData hook with wrapper structure
  const {
    data: toolDataArray,
    setData: setToolData,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<BreweryDataWrapper>(
    TOOL_ID,
    [{ id: 'brewery-main', data: getDefaultBreweryData() }],
    breweryColumns,
    { autoSave: true }
  );

  // Extract the actual brewery data from the wrapper
  const data: BreweryData = toolDataArray[0]?.data ?? getDefaultBreweryData();

  // Create a setter that wraps updates in the expected structure
  const setData = useCallback((updater: BreweryData | ((prev: BreweryData) => BreweryData)) => {
    setToolData((prev) => {
      const currentData = prev[0]?.data ?? getDefaultBreweryData();
      const newData = typeof updater === 'function' ? updater(currentData) : updater;
      return [{ id: 'brewery-main', data: newData }];
    });
  }, [setToolData]);

  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedTabs, setExpandedTabs] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states for each section
  const [beerForm, setBeerForm] = useState<Partial<BeerItem>>({
    format: 'tap',
    abv: 5,
    ibu: 30,
    quantity: 0,
    price: 0,
  });
  const [batchForm, setBatchForm] = useState<Partial<Batch>>({
    status: 'fermenting',
    abv: 5,
    ibu: 30,
    volume: 0,
  });
  const [ingredientForm, setIngredientForm] = useState<Partial<Ingredient>>({
    type: 'hops',
    quantity: 0,
    lowStockThreshold: 10,
  });
  const [reservationForm, setReservationForm] = useState<Partial<Reservation>>({
    status: 'pending',
    partySize: 2,
  });
  const [flightForm, setFlightForm] = useState<Partial<FlightItem>>({
    beers: [],
    isActive: true,
    price: 0,
  });
  const [merchForm, setMerchForm] = useState<Partial<MerchItem>>({
    quantity: 0,
    price: 0,
    cost: 0,
  });
  const [distributionForm, setDistributionForm] = useState<Partial<Distribution>>({
    unit: 'keg',
    status: 'pending',
    quantity: 0,
  });
  const [eventForm, setEventForm] = useState<Partial<BreweryEvent>>({
    type: 'trivia',
    capacity: 50,
    registrations: 0,
    price: 0,
  });
  const [tourForm, setTourForm] = useState<Partial<TourBooking>>({
    tourType: 'standard',
    status: 'pending',
    groupSize: 2,
    price: 0,
  });
  const [growlerForm, setGrowlerForm] = useState<Partial<GrowlerFill>>({
    containerType: 'growler_64',
    quantity: 1,
    price: 0,
  });
  const [qualityForm, setQualityForm] = useState<Partial<QualityNote>>({
    category: 'overall',
    rating: 5,
  });
  const [staffForm, setStaffForm] = useState<Partial<StaffShift>>({
    status: 'scheduled',
  });
  const [revenueForm, setRevenueForm] = useState<Partial<RevenueEntry>>({
    category: 'beer_sales',
    quantity: 1,
    unitPrice: 0,
    totalRevenue: 0,
  });

  const resetForms = () => {
    setBeerForm({ format: 'tap', abv: 5, ibu: 30, quantity: 0, price: 0 });
    setBatchForm({ status: 'fermenting', abv: 5, ibu: 30, volume: 0 });
    setIngredientForm({ type: 'hops', quantity: 0, lowStockThreshold: 10 });
    setReservationForm({ status: 'pending', partySize: 2 });
    setFlightForm({ beers: [], isActive: true, price: 0 });
    setMerchForm({ quantity: 0, price: 0, cost: 0 });
    setDistributionForm({ unit: 'keg', status: 'pending', quantity: 0 });
    setEventForm({ type: 'trivia', capacity: 50, registrations: 0, price: 0 });
    setTourForm({ tourType: 'standard', status: 'pending', groupSize: 2, price: 0 });
    setGrowlerForm({ containerType: 'growler_64', quantity: 1, price: 0 });
    setQualityForm({ category: 'overall', rating: 5 });
    setStaffForm({ status: 'scheduled' });
    setRevenueForm({ category: 'beer_sales', quantity: 1, unitPrice: 0, totalRevenue: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalBeersOnTap = data.beers.filter((b) => b.format === 'tap').length;
    const totalBatches = data.batches.length;
    const activeBatches = data.batches.filter((b) => b.status !== 'tapped').length;
    const lowStockIngredients = data.ingredients.filter(
      (i) => i.quantity <= i.lowStockThreshold
    ).length;
    const todayReservations = data.reservations.filter(
      (r) => r.date === new Date().toISOString().split('T')[0] && r.status !== 'cancelled'
    ).length;
    const upcomingEvents = data.events.filter((e) => new Date(e.date) >= new Date()).length;
    const pendingDistributions = data.distributions.filter((d) => d.status !== 'delivered').length;
    const monthlyRevenue = data.revenue
      .filter((r) => {
        const date = new Date(r.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + r.totalRevenue, 0);

    return {
      totalBeersOnTap,
      totalBatches,
      activeBatches,
      lowStockIngredients,
      todayReservations,
      upcomingEvents,
      pendingDistributions,
      monthlyRevenue,
    };
  }, [data]);

  // CRUD operations
  const handleSaveBeer = () => {
    if (!beerForm.name || !beerForm.style) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        beers: prev.beers.map((b) =>
          b.id === editingId ? { ...b, ...beerForm, id: editingId } : b
        ),
      }));
    } else {
      const newBeer: BeerItem = {
        id: generateId(),
        name: beerForm.name || '',
        style: beerForm.style || '',
        abv: beerForm.abv || 0,
        ibu: beerForm.ibu || 0,
        format: beerForm.format || 'tap',
        quantity: beerForm.quantity || 0,
        price: beerForm.price || 0,
        batchId: beerForm.batchId,
        createdAt: now,
      };
      setData((prev) => ({ ...prev, beers: [...prev.beers, newBeer] }));
    }
    resetForms();
  };

  const handleSaveBatch = () => {
    if (!batchForm.name || !batchForm.style) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        batches: prev.batches.map((b) =>
          b.id === editingId ? { ...b, ...batchForm, id: editingId } : b
        ),
      }));
    } else {
      const newBatch: Batch = {
        id: generateId(),
        name: batchForm.name || '',
        style: batchForm.style || '',
        brewDate: batchForm.brewDate || now.split('T')[0],
        abv: batchForm.abv || 0,
        ibu: batchForm.ibu || 0,
        status: batchForm.status || 'fermenting',
        volume: batchForm.volume || 0,
        notes: batchForm.notes || '',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, batches: [...prev.batches, newBatch] }));
    }
    resetForms();
  };

  const handleSaveIngredient = () => {
    if (!ingredientForm.name) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((i) =>
          i.id === editingId ? { ...i, ...ingredientForm, id: editingId } : i
        ),
      }));
    } else {
      const newIngredient: Ingredient = {
        id: generateId(),
        name: ingredientForm.name || '',
        type: ingredientForm.type || 'hops',
        quantity: ingredientForm.quantity || 0,
        unit: ingredientForm.unit || 'oz',
        supplier: ingredientForm.supplier || '',
        expiryDate: ingredientForm.expiryDate || '',
        lowStockThreshold: ingredientForm.lowStockThreshold || 10,
        createdAt: now,
      };
      setData((prev) => ({ ...prev, ingredients: [...prev.ingredients, newIngredient] }));
    }
    resetForms();
  };

  const handleSaveReservation = () => {
    if (!reservationForm.customerName || !reservationForm.date) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        reservations: prev.reservations.map((r) =>
          r.id === editingId ? { ...r, ...reservationForm, id: editingId } : r
        ),
      }));
    } else {
      const newReservation: Reservation = {
        id: generateId(),
        customerName: reservationForm.customerName || '',
        phone: reservationForm.phone || '',
        email: reservationForm.email || '',
        date: reservationForm.date || '',
        time: reservationForm.time || '',
        partySize: reservationForm.partySize || 2,
        notes: reservationForm.notes || '',
        status: reservationForm.status || 'pending',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, reservations: [...prev.reservations, newReservation] }));
    }
    resetForms();
  };

  const handleSaveFlight = () => {
    if (!flightForm.name) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        flights: prev.flights.map((f) =>
          f.id === editingId ? { ...f, ...flightForm, id: editingId } : f
        ),
      }));
    } else {
      const newFlight: FlightItem = {
        id: generateId(),
        name: flightForm.name || '',
        description: flightForm.description || '',
        beers: flightForm.beers || [],
        price: flightForm.price || 0,
        isActive: flightForm.isActive ?? true,
        createdAt: now,
      };
      setData((prev) => ({ ...prev, flights: [...prev.flights, newFlight] }));
    }
    resetForms();
  };

  const handleSaveMerch = () => {
    if (!merchForm.name) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        merchandise: prev.merchandise.map((m) =>
          m.id === editingId ? { ...m, ...merchForm, id: editingId } : m
        ),
      }));
    } else {
      const newMerch: MerchItem = {
        id: generateId(),
        name: merchForm.name || '',
        category: merchForm.category || '',
        sku: merchForm.sku || '',
        price: merchForm.price || 0,
        cost: merchForm.cost || 0,
        quantity: merchForm.quantity || 0,
        createdAt: now,
      };
      setData((prev) => ({ ...prev, merchandise: [...prev.merchandise, newMerch] }));
    }
    resetForms();
  };

  const handleSaveDistribution = () => {
    if (!distributionForm.customerName || !distributionForm.beerId) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        distributions: prev.distributions.map((d) =>
          d.id === editingId ? { ...d, ...distributionForm, id: editingId } : d
        ),
      }));
    } else {
      const newDistribution: Distribution = {
        id: generateId(),
        customerName: distributionForm.customerName || '',
        beerId: distributionForm.beerId || '',
        quantity: distributionForm.quantity || 0,
        unit: distributionForm.unit || 'keg',
        deliveryDate: distributionForm.deliveryDate || '',
        status: distributionForm.status || 'pending',
        address: distributionForm.address || '',
        notes: distributionForm.notes || '',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, distributions: [...prev.distributions, newDistribution] }));
    }
    resetForms();
  };

  const handleSaveEvent = () => {
    if (!eventForm.name || !eventForm.date) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === editingId ? { ...e, ...eventForm, id: editingId } : e
        ),
      }));
    } else {
      const newEvent: BreweryEvent = {
        id: generateId(),
        name: eventForm.name || '',
        type: eventForm.type || 'trivia',
        date: eventForm.date || '',
        startTime: eventForm.startTime || '',
        endTime: eventForm.endTime || '',
        description: eventForm.description || '',
        capacity: eventForm.capacity || 50,
        registrations: eventForm.registrations || 0,
        price: eventForm.price || 0,
        createdAt: now,
      };
      setData((prev) => ({ ...prev, events: [...prev.events, newEvent] }));
    }
    resetForms();
  };

  const handleSaveTour = () => {
    if (!tourForm.customerName || !tourForm.date) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        tourBookings: prev.tourBookings.map((t) =>
          t.id === editingId ? { ...t, ...tourForm, id: editingId } : t
        ),
      }));
    } else {
      const newTour: TourBooking = {
        id: generateId(),
        customerName: tourForm.customerName || '',
        email: tourForm.email || '',
        phone: tourForm.phone || '',
        date: tourForm.date || '',
        time: tourForm.time || '',
        groupSize: tourForm.groupSize || 2,
        tourType: tourForm.tourType || 'standard',
        status: tourForm.status || 'pending',
        price: tourForm.price || 0,
        notes: tourForm.notes || '',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, tourBookings: [...prev.tourBookings, newTour] }));
    }
    resetForms();
  };

  const handleSaveGrowler = () => {
    if (!growlerForm.beerId || !growlerForm.customerName) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        growlerFills: prev.growlerFills.map((g) =>
          g.id === editingId ? { ...g, ...growlerForm, id: editingId } : g
        ),
      }));
    } else {
      const newGrowler: GrowlerFill = {
        id: generateId(),
        beerId: growlerForm.beerId || '',
        containerType: growlerForm.containerType || 'growler_64',
        quantity: growlerForm.quantity || 1,
        price: growlerForm.price || 0,
        customerName: growlerForm.customerName || '',
        fillDate: growlerForm.fillDate || now.split('T')[0],
        createdAt: now,
      };
      setData((prev) => ({ ...prev, growlerFills: [...prev.growlerFills, newGrowler] }));
    }
    resetForms();
  };

  const handleSaveQuality = () => {
    if (!qualityForm.batchId || !qualityForm.inspector) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        qualityNotes: prev.qualityNotes.map((q) =>
          q.id === editingId ? { ...q, ...qualityForm, id: editingId } : q
        ),
      }));
    } else {
      const newQuality: QualityNote = {
        id: generateId(),
        batchId: qualityForm.batchId || '',
        date: qualityForm.date || now.split('T')[0],
        inspector: qualityForm.inspector || '',
        category: qualityForm.category || 'overall',
        rating: qualityForm.rating || 5,
        notes: qualityForm.notes || '',
        issues: qualityForm.issues || '',
        action: qualityForm.action || '',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, qualityNotes: [...prev.qualityNotes, newQuality] }));
    }
    resetForms();
  };

  const handleSaveStaff = () => {
    if (!staffForm.staffName || !staffForm.date) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        staffShifts: prev.staffShifts.map((s) =>
          s.id === editingId ? { ...s, ...staffForm, id: editingId } : s
        ),
      }));
    } else {
      const newShift: StaffShift = {
        id: generateId(),
        staffName: staffForm.staffName || '',
        role: staffForm.role || '',
        date: staffForm.date || '',
        startTime: staffForm.startTime || '',
        endTime: staffForm.endTime || '',
        notes: staffForm.notes || '',
        status: staffForm.status || 'scheduled',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, staffShifts: [...prev.staffShifts, newShift] }));
    }
    resetForms();
  };

  const handleSaveRevenue = () => {
    if (!revenueForm.date || !revenueForm.productName) return;
    const now = new Date().toISOString();
    const total = (revenueForm.quantity || 0) * (revenueForm.unitPrice || 0);
    if (editingId) {
      setData((prev) => ({
        ...prev,
        revenue: prev.revenue.map((r) =>
          r.id === editingId ? { ...r, ...revenueForm, totalRevenue: total, id: editingId } : r
        ),
      }));
    } else {
      const newRevenue: RevenueEntry = {
        id: generateId(),
        date: revenueForm.date || '',
        category: revenueForm.category || 'beer_sales',
        productName: revenueForm.productName || '',
        quantity: revenueForm.quantity || 0,
        unitPrice: revenueForm.unitPrice || 0,
        totalRevenue: total,
        notes: revenueForm.notes || '',
        createdAt: now,
      };
      setData((prev) => ({ ...prev, revenue: [...prev.revenue, newRevenue] }));
    }
    resetForms();
  };

  const handleDelete = (type: keyof BreweryData, id: string) => {
    setData((prev) => ({
      ...prev,
      [type]: (prev[type] as { id: string }[]).filter((item) => item.id !== id),
    }));
  };

  const handleEdit = (type: TabType, item: any) => {
    setEditingId(item.id);
    setShowForm(true);
    switch (type) {
      case 'inventory':
        setBeerForm(item);
        break;
      case 'batches':
        setBatchForm(item);
        break;
      case 'ingredients':
        setIngredientForm(item);
        break;
      case 'reservations':
        setReservationForm(item);
        break;
      case 'flights':
        setFlightForm(item);
        break;
      case 'merchandise':
        setMerchForm(item);
        break;
      case 'distribution':
        setDistributionForm(item);
        break;
      case 'events':
        setEventForm(item);
        break;
      case 'tours':
        setTourForm(item);
        break;
      case 'growlers':
        setGrowlerForm(item);
        break;
      case 'quality':
        setQualityForm(item);
        break;
      case 'staff':
        setStaffForm(item);
        break;
      case 'revenue':
        setRevenueForm(item);
        break;
    }
  };

  // Input and Select component styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-amber-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-amber-500'
  } focus:outline-none focus:ring-2 focus:ring-amber-500/20`;

  const selectClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-amber-500'
  } focus:outline-none focus:ring-2 focus:ring-amber-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const cardClass = `rounded-lg border p-4 ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium`;
  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  // Render form based on active tab
  const renderForm = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.beerName', 'Beer Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={beerForm.name || ''}
                onChange={(e) => setBeerForm({ ...beerForm, name: e.target.value })}
                placeholder={t('tools.brewery.eGHoppyIpa', 'e.g., Hoppy IPA')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.style', 'Style *')}</label>
              <input
                type="text"
                className={inputClass}
                value={beerForm.style || ''}
                onChange={(e) => setBeerForm({ ...beerForm, style: e.target.value })}
                placeholder={t('tools.brewery.eGIpaStoutLager', 'e.g., IPA, Stout, Lager')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.format', 'Format')}</label>
              <select
                className={selectClass}
                value={beerForm.format}
                onChange={(e) =>
                  setBeerForm({ ...beerForm, format: e.target.value as 'tap' | 'can' | 'bottle' })
                }
              >
                <option value="tap">{t('tools.brewery.onTap', 'On Tap')}</option>
                <option value="can">{t('tools.brewery.can', 'Can')}</option>
                <option value="bottle">{t('tools.brewery.bottle', 'Bottle')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.abv', 'ABV (%)')}</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={beerForm.abv || ''}
                onChange={(e) => setBeerForm({ ...beerForm, abv: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.ibu', 'IBU')}</label>
              <input
                type="number"
                className={inputClass}
                value={beerForm.ibu || ''}
                onChange={(e) => setBeerForm({ ...beerForm, ibu: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.quantity', 'Quantity')}</label>
              <input
                type="number"
                className={inputClass}
                value={beerForm.quantity || ''}
                onChange={(e) => setBeerForm({ ...beerForm, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.price', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={beerForm.price || ''}
                onChange={(e) => setBeerForm({ ...beerForm, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.batch', 'Batch')}</label>
              <select
                className={selectClass}
                value={beerForm.batchId || ''}
                onChange={(e) => setBeerForm({ ...beerForm, batchId: e.target.value })}
              >
                <option value="">{t('tools.brewery.selectBatch', 'Select Batch')}</option>
                {data.batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'batches':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.batchName', 'Batch Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={batchForm.name || ''}
                onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                placeholder={t('tools.brewery.eGBatch42', 'e.g., Batch #42')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.style2', 'Style *')}</label>
              <input
                type="text"
                className={inputClass}
                value={batchForm.style || ''}
                onChange={(e) => setBatchForm({ ...batchForm, style: e.target.value })}
                placeholder={t('tools.brewery.eGIpaStout', 'e.g., IPA, Stout')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.brewDate', 'Brew Date')}</label>
              <input
                type="date"
                className={inputClass}
                value={batchForm.brewDate || ''}
                onChange={(e) => setBatchForm({ ...batchForm, brewDate: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.status', 'Status')}</label>
              <select
                className={selectClass}
                value={batchForm.status}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    status: e.target.value as 'fermenting' | 'conditioning' | 'ready' | 'tapped',
                  })
                }
              >
                <option value="fermenting">{t('tools.brewery.fermenting', 'Fermenting')}</option>
                <option value="conditioning">{t('tools.brewery.conditioning', 'Conditioning')}</option>
                <option value="ready">{t('tools.brewery.ready', 'Ready')}</option>
                <option value="tapped">{t('tools.brewery.tapped', 'Tapped')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.abv2', 'ABV (%)')}</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={batchForm.abv || ''}
                onChange={(e) => setBatchForm({ ...batchForm, abv: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.ibu2', 'IBU')}</label>
              <input
                type="number"
                className={inputClass}
                value={batchForm.ibu || ''}
                onChange={(e) => setBatchForm({ ...batchForm, ibu: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.volumeGal', 'Volume (gal)')}</label>
              <input
                type="number"
                className={inputClass}
                value={batchForm.volume || ''}
                onChange={(e) => setBatchForm({ ...batchForm, volume: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.notes', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={batchForm.notes || ''}
                onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                placeholder={t('tools.brewery.brewingNotes', 'Brewing notes...')}
              />
            </div>
          </div>
        );

      case 'ingredients':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.ingredientName', 'Ingredient Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={ingredientForm.name || ''}
                onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                placeholder={t('tools.brewery.eGCascadeHops', 'e.g., Cascade Hops')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.type', 'Type')}</label>
              <select
                className={selectClass}
                value={ingredientForm.type}
                onChange={(e) =>
                  setIngredientForm({
                    ...ingredientForm,
                    type: e.target.value as 'hops' | 'malt' | 'yeast' | 'adjunct',
                  })
                }
              >
                <option value="hops">{t('tools.brewery.hops', 'Hops')}</option>
                <option value="malt">{t('tools.brewery.malt', 'Malt')}</option>
                <option value="yeast">{t('tools.brewery.yeast', 'Yeast')}</option>
                <option value="adjunct">{t('tools.brewery.adjunct', 'Adjunct')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.quantity2', 'Quantity')}</label>
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={ingredientForm.quantity || ''}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, quantity: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.unit', 'Unit')}</label>
              <input
                type="text"
                className={inputClass}
                value={ingredientForm.unit || ''}
                onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                placeholder={t('tools.brewery.eGOzLbPackets', 'e.g., oz, lb, packets')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.supplier', 'Supplier')}</label>
              <input
                type="text"
                className={inputClass}
                value={ingredientForm.supplier || ''}
                onChange={(e) => setIngredientForm({ ...ingredientForm, supplier: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.expiryDate', 'Expiry Date')}</label>
              <input
                type="date"
                className={inputClass}
                value={ingredientForm.expiryDate || ''}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, expiryDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.lowStockThreshold', 'Low Stock Threshold')}</label>
              <input
                type="number"
                className={inputClass}
                value={ingredientForm.lowStockThreshold || ''}
                onChange={(e) =>
                  setIngredientForm({
                    ...ingredientForm,
                    lowStockThreshold: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        );

      case 'reservations':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.customerName', 'Customer Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={reservationForm.customerName || ''}
                onChange={(e) =>
                  setReservationForm({ ...reservationForm, customerName: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.phone', 'Phone')}</label>
              <input
                type="tel"
                className={inputClass}
                value={reservationForm.phone || ''}
                onChange={(e) => setReservationForm({ ...reservationForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.email', 'Email')}</label>
              <input
                type="email"
                className={inputClass}
                value={reservationForm.email || ''}
                onChange={(e) => setReservationForm({ ...reservationForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.date', 'Date *')}</label>
              <input
                type="date"
                className={inputClass}
                value={reservationForm.date || ''}
                onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.time', 'Time')}</label>
              <input
                type="time"
                className={inputClass}
                value={reservationForm.time || ''}
                onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.partySize', 'Party Size')}</label>
              <input
                type="number"
                className={inputClass}
                value={reservationForm.partySize || ''}
                onChange={(e) =>
                  setReservationForm({ ...reservationForm, partySize: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.status2', 'Status')}</label>
              <select
                className={selectClass}
                value={reservationForm.status}
                onChange={(e) =>
                  setReservationForm({
                    ...reservationForm,
                    status: e.target.value as 'pending' | 'confirmed' | 'cancelled' | 'completed',
                  })
                }
              >
                <option value="pending">{t('tools.brewery.pending', 'Pending')}</option>
                <option value="confirmed">{t('tools.brewery.confirmed', 'Confirmed')}</option>
                <option value="cancelled">{t('tools.brewery.cancelled', 'Cancelled')}</option>
                <option value="completed">{t('tools.brewery.completed', 'Completed')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.notes2', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={reservationForm.notes || ''}
                onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
              />
            </div>
          </div>
        );

      case 'flights':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.flightName', 'Flight Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={flightForm.name || ''}
                onChange={(e) => setFlightForm({ ...flightForm, name: e.target.value })}
                placeholder={t('tools.brewery.eGHoppyFlight', 'e.g., Hoppy Flight')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.price2', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={flightForm.price || ''}
                onChange={(e) => setFlightForm({ ...flightForm, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.description', 'Description')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={flightForm.description || ''}
                onChange={(e) => setFlightForm({ ...flightForm, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.beersInFlight', 'Beers in Flight')}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.beers.map((beer) => (
                  <label
                    key={beer.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer border ${
                      flightForm.beers?.includes(beer.id)
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={flightForm.beers?.includes(beer.id) || false}
                      onChange={(e) => {
                        const beers = flightForm.beers || [];
                        if (e.target.checked) {
                          setFlightForm({ ...flightForm, beers: [...beers, beer.id] });
                        } else {
                          setFlightForm({
                            ...flightForm,
                            beers: beers.filter((id) => id !== beer.id),
                          });
                        }
                      }}
                    />
                    {beer.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightForm.isActive ?? true}
                  onChange={(e) => setFlightForm({ ...flightForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.brewery.activeOnMenu', 'Active on Menu')}
                </span>
              </label>
            </div>
          </div>
        );

      case 'merchandise':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.productName', 'Product Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={merchForm.name || ''}
                onChange={(e) => setMerchForm({ ...merchForm, name: e.target.value })}
                placeholder={t('tools.brewery.eGBreweryTShirt', 'e.g., Brewery T-Shirt')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.category', 'Category')}</label>
              <input
                type="text"
                className={inputClass}
                value={merchForm.category || ''}
                onChange={(e) => setMerchForm({ ...merchForm, category: e.target.value })}
                placeholder={t('tools.brewery.eGApparelGlassware', 'e.g., Apparel, Glassware')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.sku', 'SKU')}</label>
              <input
                type="text"
                className={inputClass}
                value={merchForm.sku || ''}
                onChange={(e) => setMerchForm({ ...merchForm, sku: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.price3', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={merchForm.price || ''}
                onChange={(e) => setMerchForm({ ...merchForm, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.cost', 'Cost ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={merchForm.cost || ''}
                onChange={(e) => setMerchForm({ ...merchForm, cost: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.quantity3', 'Quantity')}</label>
              <input
                type="number"
                className={inputClass}
                value={merchForm.quantity || ''}
                onChange={(e) => setMerchForm({ ...merchForm, quantity: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );

      case 'distribution':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.customerName2', 'Customer Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={distributionForm.customerName || ''}
                onChange={(e) =>
                  setDistributionForm({ ...distributionForm, customerName: e.target.value })
                }
                placeholder={t('tools.brewery.eGBarName', 'e.g., Bar Name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.beer', 'Beer *')}</label>
              <select
                className={selectClass}
                value={distributionForm.beerId || ''}
                onChange={(e) =>
                  setDistributionForm({ ...distributionForm, beerId: e.target.value })
                }
              >
                <option value="">{t('tools.brewery.selectBeer', 'Select Beer')}</option>
                {data.beers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.quantity4', 'Quantity')}</label>
              <input
                type="number"
                className={inputClass}
                value={distributionForm.quantity || ''}
                onChange={(e) =>
                  setDistributionForm({ ...distributionForm, quantity: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.unit2', 'Unit')}</label>
              <select
                className={selectClass}
                value={distributionForm.unit}
                onChange={(e) =>
                  setDistributionForm({
                    ...distributionForm,
                    unit: e.target.value as 'keg' | 'case' | 'pallet',
                  })
                }
              >
                <option value="keg">{t('tools.brewery.keg', 'Keg')}</option>
                <option value="case">{t('tools.brewery.case', 'Case')}</option>
                <option value="pallet">{t('tools.brewery.pallet', 'Pallet')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.deliveryDate', 'Delivery Date')}</label>
              <input
                type="date"
                className={inputClass}
                value={distributionForm.deliveryDate || ''}
                onChange={(e) =>
                  setDistributionForm({ ...distributionForm, deliveryDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.status3', 'Status')}</label>
              <select
                className={selectClass}
                value={distributionForm.status}
                onChange={(e) =>
                  setDistributionForm({
                    ...distributionForm,
                    status: e.target.value as 'pending' | 'shipped' | 'delivered',
                  })
                }
              >
                <option value="pending">{t('tools.brewery.pending2', 'Pending')}</option>
                <option value="shipped">{t('tools.brewery.shipped', 'Shipped')}</option>
                <option value="delivered">{t('tools.brewery.delivered', 'Delivered')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.deliveryAddress', 'Delivery Address')}</label>
              <input
                type="text"
                className={inputClass}
                value={distributionForm.address || ''}
                onChange={(e) =>
                  setDistributionForm({ ...distributionForm, address: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.notes3', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={distributionForm.notes || ''}
                onChange={(e) =>
                  setDistributionForm({ ...distributionForm, notes: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.eventName', 'Event Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={eventForm.name || ''}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                placeholder={t('tools.brewery.eGTriviaNight', 'e.g., Trivia Night')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.type2', 'Type')}</label>
              <select
                className={selectClass}
                value={eventForm.type}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    type: e.target.value as
                      | 'trivia'
                      | 'live_music'
                      | 'food_pairing'
                      | 'release_party'
                      | 'other',
                  })
                }
              >
                <option value="trivia">{t('tools.brewery.trivia', 'Trivia')}</option>
                <option value="live_music">{t('tools.brewery.liveMusic', 'Live Music')}</option>
                <option value="food_pairing">{t('tools.brewery.foodPairing', 'Food Pairing')}</option>
                <option value="release_party">{t('tools.brewery.releaseParty', 'Release Party')}</option>
                <option value="other">{t('tools.brewery.other', 'Other')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.date2', 'Date *')}</label>
              <input
                type="date"
                className={inputClass}
                value={eventForm.date || ''}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.startTime', 'Start Time')}</label>
              <input
                type="time"
                className={inputClass}
                value={eventForm.startTime || ''}
                onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.endTime', 'End Time')}</label>
              <input
                type="time"
                className={inputClass}
                value={eventForm.endTime || ''}
                onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.capacity', 'Capacity')}</label>
              <input
                type="number"
                className={inputClass}
                value={eventForm.capacity || ''}
                onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.registrations', 'Registrations')}</label>
              <input
                type="number"
                className={inputClass}
                value={eventForm.registrations || ''}
                onChange={(e) =>
                  setEventForm({ ...eventForm, registrations: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.price4', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={eventForm.price || ''}
                onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.description2', 'Description')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={eventForm.description || ''}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </div>
          </div>
        );

      case 'tours':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.customerName3', 'Customer Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={tourForm.customerName || ''}
                onChange={(e) => setTourForm({ ...tourForm, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.email2', 'Email')}</label>
              <input
                type="email"
                className={inputClass}
                value={tourForm.email || ''}
                onChange={(e) => setTourForm({ ...tourForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.phone2', 'Phone')}</label>
              <input
                type="tel"
                className={inputClass}
                value={tourForm.phone || ''}
                onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.date3', 'Date *')}</label>
              <input
                type="date"
                className={inputClass}
                value={tourForm.date || ''}
                onChange={(e) => setTourForm({ ...tourForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.time2', 'Time')}</label>
              <input
                type="time"
                className={inputClass}
                value={tourForm.time || ''}
                onChange={(e) => setTourForm({ ...tourForm, time: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.groupSize', 'Group Size')}</label>
              <input
                type="number"
                className={inputClass}
                value={tourForm.groupSize || ''}
                onChange={(e) => setTourForm({ ...tourForm, groupSize: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.tourType', 'Tour Type')}</label>
              <select
                className={selectClass}
                value={tourForm.tourType}
                onChange={(e) =>
                  setTourForm({
                    ...tourForm,
                    tourType: e.target.value as 'standard' | 'vip' | 'private',
                  })
                }
              >
                <option value="standard">{t('tools.brewery.standard', 'Standard')}</option>
                <option value="vip">{t('tools.brewery.vip', 'VIP')}</option>
                <option value="private">{t('tools.brewery.private', 'Private')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.status4', 'Status')}</label>
              <select
                className={selectClass}
                value={tourForm.status}
                onChange={(e) =>
                  setTourForm({
                    ...tourForm,
                    status: e.target.value as 'pending' | 'confirmed' | 'cancelled' | 'completed',
                  })
                }
              >
                <option value="pending">{t('tools.brewery.pending3', 'Pending')}</option>
                <option value="confirmed">{t('tools.brewery.confirmed2', 'Confirmed')}</option>
                <option value="cancelled">{t('tools.brewery.cancelled2', 'Cancelled')}</option>
                <option value="completed">{t('tools.brewery.completed2', 'Completed')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.price5', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={tourForm.price || ''}
                onChange={(e) => setTourForm({ ...tourForm, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.notes4', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={tourForm.notes || ''}
                onChange={(e) => setTourForm({ ...tourForm, notes: e.target.value })}
              />
            </div>
          </div>
        );

      case 'growlers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.customerName4', 'Customer Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={growlerForm.customerName || ''}
                onChange={(e) => setGrowlerForm({ ...growlerForm, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.beer2', 'Beer *')}</label>
              <select
                className={selectClass}
                value={growlerForm.beerId || ''}
                onChange={(e) => setGrowlerForm({ ...growlerForm, beerId: e.target.value })}
              >
                <option value="">{t('tools.brewery.selectBeer2', 'Select Beer')}</option>
                {data.beers
                  .filter((b) => b.format === 'tap')
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.containerType', 'Container Type')}</label>
              <select
                className={selectClass}
                value={growlerForm.containerType}
                onChange={(e) =>
                  setGrowlerForm({
                    ...growlerForm,
                    containerType: e.target.value as
                      | 'growler_32'
                      | 'growler_64'
                      | 'crowler_32'
                      | 'crowler_16',
                  })
                }
              >
                <option value="growler_64">{t('tools.brewery.growler64oz', 'Growler 64oz')}</option>
                <option value="growler_32">{t('tools.brewery.growler32oz', 'Growler 32oz')}</option>
                <option value="crowler_32">{t('tools.brewery.crowler32oz', 'Crowler 32oz')}</option>
                <option value="crowler_16">{t('tools.brewery.crowler16oz', 'Crowler 16oz')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.quantity5', 'Quantity')}</label>
              <input
                type="number"
                className={inputClass}
                value={growlerForm.quantity || ''}
                onChange={(e) =>
                  setGrowlerForm({ ...growlerForm, quantity: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.price6', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={growlerForm.price || ''}
                onChange={(e) =>
                  setGrowlerForm({ ...growlerForm, price: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.fillDate', 'Fill Date')}</label>
              <input
                type="date"
                className={inputClass}
                value={growlerForm.fillDate || ''}
                onChange={(e) => setGrowlerForm({ ...growlerForm, fillDate: e.target.value })}
              />
            </div>
          </div>
        );

      case 'quality':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.batch2', 'Batch *')}</label>
              <select
                className={selectClass}
                value={qualityForm.batchId || ''}
                onChange={(e) => setQualityForm({ ...qualityForm, batchId: e.target.value })}
              >
                <option value="">{t('tools.brewery.selectBatch2', 'Select Batch')}</option>
                {data.batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.inspector', 'Inspector *')}</label>
              <input
                type="text"
                className={inputClass}
                value={qualityForm.inspector || ''}
                onChange={(e) => setQualityForm({ ...qualityForm, inspector: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.date4', 'Date')}</label>
              <input
                type="date"
                className={inputClass}
                value={qualityForm.date || ''}
                onChange={(e) => setQualityForm({ ...qualityForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.category2', 'Category')}</label>
              <select
                className={selectClass}
                value={qualityForm.category}
                onChange={(e) =>
                  setQualityForm({
                    ...qualityForm,
                    category: e.target.value as 'appearance' | 'aroma' | 'taste' | 'overall',
                  })
                }
              >
                <option value="appearance">{t('tools.brewery.appearance', 'Appearance')}</option>
                <option value="aroma">{t('tools.brewery.aroma', 'Aroma')}</option>
                <option value="taste">{t('tools.brewery.taste', 'Taste')}</option>
                <option value="overall">{t('tools.brewery.overall', 'Overall')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.rating110', 'Rating (1-10)')}</label>
              <input
                type="number"
                min="1"
                max="10"
                className={inputClass}
                value={qualityForm.rating || ''}
                onChange={(e) =>
                  setQualityForm({ ...qualityForm, rating: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.notes5', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={qualityForm.notes || ''}
                onChange={(e) => setQualityForm({ ...qualityForm, notes: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.issuesFound', 'Issues Found')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={qualityForm.issues || ''}
                onChange={(e) => setQualityForm({ ...qualityForm, issues: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.correctiveAction', 'Corrective Action')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={qualityForm.action || ''}
                onChange={(e) => setQualityForm({ ...qualityForm, action: e.target.value })}
              />
            </div>
          </div>
        );

      case 'staff':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.staffName', 'Staff Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={staffForm.staffName || ''}
                onChange={(e) => setStaffForm({ ...staffForm, staffName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.role', 'Role')}</label>
              <input
                type="text"
                className={inputClass}
                value={staffForm.role || ''}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                placeholder={t('tools.brewery.eGBartenderBrewer', 'e.g., Bartender, Brewer')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.date5', 'Date *')}</label>
              <input
                type="date"
                className={inputClass}
                value={staffForm.date || ''}
                onChange={(e) => setStaffForm({ ...staffForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.startTime2', 'Start Time')}</label>
              <input
                type="time"
                className={inputClass}
                value={staffForm.startTime || ''}
                onChange={(e) => setStaffForm({ ...staffForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.endTime2', 'End Time')}</label>
              <input
                type="time"
                className={inputClass}
                value={staffForm.endTime || ''}
                onChange={(e) => setStaffForm({ ...staffForm, endTime: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.status5', 'Status')}</label>
              <select
                className={selectClass}
                value={staffForm.status}
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    status: e.target.value as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
                  })
                }
              >
                <option value="scheduled">{t('tools.brewery.scheduled', 'Scheduled')}</option>
                <option value="confirmed">{t('tools.brewery.confirmed3', 'Confirmed')}</option>
                <option value="completed">{t('tools.brewery.completed3', 'Completed')}</option>
                <option value="cancelled">{t('tools.brewery.cancelled3', 'Cancelled')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.notes6', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={staffForm.notes || ''}
                onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
              />
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.brewery.date6', 'Date *')}</label>
              <input
                type="date"
                className={inputClass}
                value={revenueForm.date || ''}
                onChange={(e) => setRevenueForm({ ...revenueForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.category3', 'Category')}</label>
              <select
                className={selectClass}
                value={revenueForm.category}
                onChange={(e) =>
                  setRevenueForm({
                    ...revenueForm,
                    category: e.target.value as
                      | 'beer_sales'
                      | 'merchandise'
                      | 'tours'
                      | 'events'
                      | 'distribution'
                      | 'growler_fills',
                  })
                }
              >
                <option value="beer_sales">{t('tools.brewery.beerSales', 'Beer Sales')}</option>
                <option value="merchandise">{t('tools.brewery.merchandise', 'Merchandise')}</option>
                <option value="tours">{t('tools.brewery.tours', 'Tours')}</option>
                <option value="events">{t('tools.brewery.events', 'Events')}</option>
                <option value="distribution">{t('tools.brewery.distribution', 'Distribution')}</option>
                <option value="growler_fills">{t('tools.brewery.growlerFills', 'Growler Fills')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.productName2', 'Product Name *')}</label>
              <input
                type="text"
                className={inputClass}
                value={revenueForm.productName || ''}
                onChange={(e) => setRevenueForm({ ...revenueForm, productName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.quantity6', 'Quantity')}</label>
              <input
                type="number"
                className={inputClass}
                value={revenueForm.quantity || ''}
                onChange={(e) =>
                  setRevenueForm({ ...revenueForm, quantity: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.unitPrice', 'Unit Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={revenueForm.unitPrice || ''}
                onChange={(e) =>
                  setRevenueForm({ ...revenueForm, unitPrice: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.brewery.totalRevenue', 'Total Revenue ($)')}</label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={(revenueForm.quantity || 0) * (revenueForm.unitPrice || 0)}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('tools.brewery.notes7', 'Notes')}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={revenueForm.notes || ''}
                onChange={(e) => setRevenueForm({ ...revenueForm, notes: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = () => {
    switch (activeTab) {
      case 'inventory':
        handleSaveBeer();
        break;
      case 'batches':
        handleSaveBatch();
        break;
      case 'ingredients':
        handleSaveIngredient();
        break;
      case 'reservations':
        handleSaveReservation();
        break;
      case 'flights':
        handleSaveFlight();
        break;
      case 'merchandise':
        handleSaveMerch();
        break;
      case 'distribution':
        handleSaveDistribution();
        break;
      case 'events':
        handleSaveEvent();
        break;
      case 'tours':
        handleSaveTour();
        break;
      case 'growlers':
        handleSaveGrowler();
        break;
      case 'quality':
        handleSaveQuality();
        break;
      case 'staff':
        handleSaveStaff();
        break;
      case 'revenue':
        handleSaveRevenue();
        break;
    }
  };

  const getDataKey = (tab: TabType): keyof BreweryData => {
    const mapping: Record<TabType, keyof BreweryData> = {
      inventory: 'beers',
      batches: 'batches',
      ingredients: 'ingredients',
      reservations: 'reservations',
      flights: 'flights',
      merchandise: 'merchandise',
      distribution: 'distributions',
      events: 'events',
      tours: 'tourBookings',
      growlers: 'growlerFills',
      quality: 'qualityNotes',
      staff: 'staffShifts',
      revenue: 'revenue',
    };
    return mapping[tab];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      fermenting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      conditioning: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      tapped: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      scheduled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Render items list based on active tab
  const renderItems = () => {
    const dataKey = getDataKey(activeTab);
    const items = data[dataKey] as { id: string; [key: string]: any }[];
    const filteredItems = items.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(item).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(searchLower)
      );
    });

    if (filteredItems.length === 0) {
      return (
        <div
          className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
        >
          <p className="text-lg">{t('tools.brewery.noItemsFound', 'No items found')}</p>
          <p className="text-sm mt-1">{t('tools.brewery.clickAddNewToCreate', 'Click "Add New" to create your first entry')}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className={cardClass}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {activeTab === 'inventory' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.format === 'tap'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : item.format === 'can'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {item.format}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.style} | ABV: {item.abv}% | IBU: {item.ibu}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Qty: {item.quantity} | ${item.price?.toFixed(2)}
                    </p>
                  </>
                )}
                {activeTab === 'batches' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.style} | Brewed: {item.brewDate}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ABV: {item.abv}% | IBU: {item.ibu} | Volume: {item.volume} gal
                    </p>
                  </>
                )}
                {activeTab === 'ingredients' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {item.type}
                      </span>
                      {item.quantity <= item.lowStockThreshold && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Low Stock
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Qty: {item.quantity} {item.unit} | Supplier: {item.supplier || 'N/A'}
                    </p>
                  </>
                )}
                {activeTab === 'reservations' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.customerName}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.date} at {item.time} | Party of {item.partySize}
                    </p>
                  </>
                )}
                {activeTab === 'flights' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </h3>
                      {item.isActive ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {t('tools.brewery.active', 'Active')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {t('tools.brewery.inactive', 'Inactive')}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${item.price?.toFixed(2)} | {item.beers?.length || 0} beers
                    </p>
                  </>
                )}
                {activeTab === 'merchandise' && (
                  <>
                    <h3
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.category} | SKU: {item.sku} | Qty: {item.quantity}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Price: ${item.price?.toFixed(2)} | Cost: ${item.cost?.toFixed(2)} | Margin: $
                      {(item.price - item.cost).toFixed(2)}
                    </p>
                  </>
                )}
                {activeTab === 'distribution' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.customerName}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.quantity} {item.unit}(s) | Delivery: {item.deliveryDate}
                    </p>
                  </>
                )}
                {activeTab === 'events' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {item.type?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.date} | {item.startTime} - {item.endTime}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Registrations: {item.registrations}/{item.capacity} | ${item.price?.toFixed(2)}
                    </p>
                  </>
                )}
                {activeTab === 'tours' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.customerName}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        {item.tourType}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.date} at {item.time} | Group of {item.groupSize}
                    </p>
                  </>
                )}
                {activeTab === 'growlers' && (
                  <>
                    <h3
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.customerName}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.containerType?.replace('_', ' ')} x {item.quantity} | ${item.price?.toFixed(2)}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Filled: {item.fillDate}
                    </p>
                  </>
                )}
                {activeTab === 'quality' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {data.batches.find((b) => b.id === item.batchId)?.name || 'Unknown Batch'}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span
                          className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {item.rating}/10
                        </span>
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Inspector: {item.inspector} | {item.date}
                    </p>
                  </>
                )}
                {activeTab === 'staff' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.staffName}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.role} | {item.date}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.startTime} - {item.endTime}
                    </p>
                  </>
                )}
                {activeTab === 'revenue' && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {item.productName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {item.category?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.date} | Qty: {item.quantity} x ${item.unitPrice?.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}
                    >
                      Total: ${item.totalRevenue?.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(activeTab, item)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dataKey, item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-red-900/50 text-red-400'
                      : 'hover:bg-red-100 text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.brewery.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600 rounded-xl">
              <Beer className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.brewery.breweryManager', 'Brewery Manager')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.brewery.completeTaproomAndBreweryManagement', 'Complete taproom and brewery management')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="brewery" toolName="Brewery" />

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
              onExportCSV={() => {
                const exportData = activeTab === 'revenue' ? data.revenue : data.beers;
                const columns = activeTab === 'revenue' ? REVENUE_COLUMNS : BEER_COLUMNS;
                exportToCSV(exportData, columns, { filename: `brewery-${activeTab}` });
              }}
              onExportExcel={() => {
                const exportData = activeTab === 'revenue' ? data.revenue : data.beers;
                const columns = activeTab === 'revenue' ? REVENUE_COLUMNS : BEER_COLUMNS;
                exportToExcel(exportData, columns, { filename: `brewery-${activeTab}` });
              }}
              onExportJSON={() => {
                exportToJSON(data, { filename: 'brewery-data' });
              }}
              onExportPDF={async () => {
                const exportData = activeTab === 'revenue' ? data.revenue : data.beers;
                const columns = activeTab === 'revenue' ? REVENUE_COLUMNS : BEER_COLUMNS;
                await exportToPDF(exportData, columns, {
                  filename: `brewery-${activeTab}`,
                  title: 'Brewery Manager Report',
                  subtitle: `${data.beers.length} beers | ${stats.monthlyRevenue.toLocaleString()} monthly revenue`,
                });
              }}
              onPrint={() => {
                const exportData = activeTab === 'revenue' ? data.revenue : data.beers;
                const columns = activeTab === 'revenue' ? REVENUE_COLUMNS : BEER_COLUMNS;
                printData(exportData, columns, { title: 'Brewery Manager' });
              }}
              onCopyToClipboard={async () => {
                const exportData = activeTab === 'revenue' ? data.revenue : data.beers;
                const columns = activeTab === 'revenue' ? REVENUE_COLUMNS : BEER_COLUMNS;
                return await copyUtil(exportData, columns, 'tab');
              }}
              showImport={false}
              theme={theme}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Beer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.totalBeersOnTap}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.brewery.onTap2', 'On Tap')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.activeBatches}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.brewery.activeBatches', 'Active Batches')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.todayReservations}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.brewery.todaySReservations', 'Today\'s Reservations')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.brewery.monthlyRevenue', 'Monthly Revenue')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.lowStockIngredients > 0 || stats.pendingDistributions > 0) && (
          <div className="mb-6 space-y-2">
            {stats.lowStockIngredients > 0 && (
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                />
                <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  {stats.lowStockIngredients} ingredient(s) running low on stock
                </p>
              </div>
            )}
            {stats.pendingDistributions > 0 && (
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-amber-900/30 border border-amber-800' : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <Truck
                  className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}
                />
                <p className={`text-sm ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                  {stats.pendingDistributions} distribution(s) pending delivery
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setExpandedTabs(!expandedTabs)}
              className={`flex items-center gap-2 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {expandedTabs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expandedTabs ? t('tools.brewery.showLess', 'Show Less') : t('tools.brewery.showAllSections', 'Show All Sections')}
            </button>
          </div>
          <div
            className={`flex flex-wrap gap-2 ${
              !expandedTabs ? 'max-h-12 overflow-hidden' : ''
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowForm(false);
                  setEditingId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card
          className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle
                className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                {tabs.find((t) => t.id === activeTab)?.label}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.brewery.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
                  />
                </div>
                <button
                  onClick={() => {
                    resetForms();
                    setShowForm(true);
                  }}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.brewery.addNew', 'Add New')}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Form */}
            {showForm && (
              <div
                className={`mb-6 p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {editingId ? t('tools.brewery.editEntry', 'Edit Entry') : t('tools.brewery.addNewEntry', 'Add New Entry')}
                  </h3>
                  <button
                    onClick={resetForms}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderForm()}
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSave} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {editingId ? t('tools.brewery.update', 'Update') : t('tools.brewery.save', 'Save')}
                  </button>
                  <button onClick={resetForms} className={buttonSecondary}>
                    {t('tools.brewery.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            {renderItems()}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div
          className={`mt-6 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            {t('tools.brewery.aboutBreweryManager', 'About Brewery Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive brewery and taproom management tool. Track your beer inventory, manage
            batches through the brewing process, monitor ingredient stock levels, handle taproom
            reservations, create flight menus, manage merchandise sales, coordinate distribution,
            schedule events and brewery tours, track growler fills, maintain quality control notes,
            manage staff scheduling, and analyze revenue by product category. All data is
            automatically saved to your browser's local storage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreweryTool;
