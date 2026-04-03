'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  PartyPopper,
  Calendar,
  MapPin,
  Truck,
  Users,
  Package,
  DollarSign,
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Armchair,
  Tent,
  Sparkles,
  FileText,
  Route,
  ShieldCheck,
  Droplets,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  X,
  Save,
  Eye,
  Copy,
  Printer,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface PartyRentalToolProps {
  uiConfig?: UIConfig;
}

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: 'tables' | 'chairs' | 'linens' | 'tents' | 'decor';
  description: string;
  quantity: number;
  basePrice: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  imageUrl?: string;
  dimensions?: string;
  color?: string;
  seasonalPricing: {
    spring: number;
    summer: number;
    fall: number;
    winter: number;
  };
}

interface BookingItem {
  itemId: string;
  quantity: number;
  pricePerUnit: number;
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  eventEndTime: string;
  eventType: string;
  location: string;
  locationAddress: string;
  items: BookingItem[];
  status: 'pending' | 'confirmed' | 'delivered' | 'completed' | 'cancelled';
  deliveryTime: string;
  pickupTime: string;
  setupCrewAssigned: string[];
  damageDeposit: number;
  damageDepositStatus: 'pending' | 'collected' | 'refunded' | 'partial-refund' | 'forfeited';
  cleaningFee: number;
  subtotal: number;
  total: number;
  notes: string;
  packageDeal?: string;
  createdAt: string;
}

interface PackageDeal {
  id: string;
  name: string;
  description: string;
  items: { itemId: string; quantity: number }[];
  discount: number;
  price: number;
}

interface CrewMember {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'setup' | 'both';
  available: boolean;
}

interface LoadSheet {
  bookingId: string;
  items: { name: string; quantity: number; condition: string }[];
  truckAssignment: string;
  loadOrder: number[];
  specialInstructions: string;
  generatedAt: string;
}

// Column configuration for exports
const BOOKING_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'eventDate', header: 'Event Date', type: 'date' },
  { key: 'eventType', header: 'Event Type', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'number', format: (v) => `$${v.toFixed(2)}` },
  { key: 'total', header: 'Total', type: 'number', format: (v) => `$${v.toFixed(2)}` },
  { key: 'damageDeposit', header: 'Deposit', type: 'number', format: (v) => `$${v.toFixed(2)}` },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'basePrice', header: 'Base Price', type: 'number', format: (v) => `$${v.toFixed(2)}` },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'dimensions', header: 'Dimensions', type: 'string' },
];

// Party rental data structure for combined sync
interface PartyRentalData {
  id: string;
  inventory: InventoryItem[];
  bookings: Booking[];
  packages: PackageDeal[];
  crew: CrewMember[];
  loadSheets: LoadSheet[];
}

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: '60" Round Table',
    category: 'tables',
    description: 'Seats 8-10 guests comfortably',
    quantity: 50,
    basePrice: 15,
    condition: 'excellent',
    dimensions: '60" diameter x 30" height',
    seasonalPricing: { spring: 15, summer: 18, fall: 15, winter: 12 },
  },
  {
    id: '2',
    name: '6ft Rectangular Table',
    category: 'tables',
    description: 'Seats 6-8 guests',
    quantity: 40,
    basePrice: 12,
    condition: 'good',
    dimensions: '72" x 30" x 30"',
    seasonalPricing: { spring: 12, summer: 15, fall: 12, winter: 10 },
  },
  {
    id: '3',
    name: 'White Folding Chair',
    category: 'chairs',
    description: 'Classic white resin folding chair',
    quantity: 300,
    basePrice: 3,
    condition: 'excellent',
    color: 'White',
    seasonalPricing: { spring: 3, summer: 4, fall: 3, winter: 2.5 },
  },
  {
    id: '4',
    name: 'Chiavari Chair - Gold',
    category: 'chairs',
    description: 'Elegant gold chiavari chair',
    quantity: 150,
    basePrice: 8,
    condition: 'excellent',
    color: 'Gold',
    seasonalPricing: { spring: 8, summer: 10, fall: 8, winter: 7 },
  },
  {
    id: '5',
    name: 'White Polyester Tablecloth 120"',
    category: 'linens',
    description: 'Floor-length for 60" round tables',
    quantity: 100,
    basePrice: 12,
    condition: 'good',
    color: 'White',
    seasonalPricing: { spring: 12, summer: 14, fall: 12, winter: 10 },
  },
  {
    id: '6',
    name: 'Satin Chair Sash',
    category: 'linens',
    description: 'Available in multiple colors',
    quantity: 500,
    basePrice: 1.5,
    condition: 'excellent',
    seasonalPricing: { spring: 1.5, summer: 2, fall: 1.5, winter: 1.25 },
  },
  {
    id: '7',
    name: '20x20 Frame Tent',
    category: 'tents',
    description: 'White frame tent, no center poles',
    quantity: 5,
    basePrice: 400,
    condition: 'excellent',
    dimensions: '20ft x 20ft',
    seasonalPricing: { spring: 400, summer: 500, fall: 400, winter: 350 },
  },
  {
    id: '8',
    name: '40x60 Pole Tent',
    category: 'tents',
    description: 'Large event tent with center poles',
    quantity: 3,
    basePrice: 1200,
    condition: 'good',
    dimensions: '40ft x 60ft',
    seasonalPricing: { spring: 1200, summer: 1500, fall: 1200, winter: 1000 },
  },
  {
    id: '9',
    name: 'String Light Strand 100ft',
    category: 'decor',
    description: 'Warm white LED string lights',
    quantity: 30,
    basePrice: 25,
    condition: 'excellent',
    seasonalPricing: { spring: 25, summer: 30, fall: 25, winter: 35 },
  },
  {
    id: '10',
    name: 'Centerpiece Vase Set',
    category: 'decor',
    description: 'Set of 3 glass cylinder vases',
    quantity: 50,
    basePrice: 15,
    condition: 'good',
    seasonalPricing: { spring: 15, summer: 18, fall: 15, winter: 12 },
  },
];

const DEFAULT_PACKAGES: PackageDeal[] = [
  {
    id: 'pkg-1',
    name: 'Basic Party Package (50 guests)',
    description: '5 round tables, 50 white chairs, 5 tablecloths',
    items: [
      { itemId: '1', quantity: 5 },
      { itemId: '3', quantity: 50 },
      { itemId: '5', quantity: 5 },
    ],
    discount: 15,
    price: 250,
  },
  {
    id: 'pkg-2',
    name: 'Elegant Wedding Package (100 guests)',
    description: '10 round tables, 100 chiavari chairs, 10 tablecloths, 100 chair sashes, string lights',
    items: [
      { itemId: '1', quantity: 10 },
      { itemId: '4', quantity: 100 },
      { itemId: '5', quantity: 10 },
      { itemId: '6', quantity: 100 },
      { itemId: '9', quantity: 5 },
    ],
    discount: 20,
    price: 1200,
  },
  {
    id: 'pkg-3',
    name: 'Outdoor Tent Package',
    description: '20x20 tent, 4 round tables, 32 white chairs, 4 tablecloths, string lights',
    items: [
      { itemId: '7', quantity: 1 },
      { itemId: '1', quantity: 4 },
      { itemId: '3', quantity: 32 },
      { itemId: '5', quantity: 4 },
      { itemId: '9', quantity: 2 },
    ],
    discount: 10,
    price: 600,
  },
];

const DEFAULT_CREW: CrewMember[] = [
  { id: 'crew-1', name: 'Mike Johnson', phone: '555-0101', role: 'both', available: true },
  { id: 'crew-2', name: 'Sarah Williams', phone: '555-0102', role: 'setup', available: true },
  { id: 'crew-3', name: 'David Brown', phone: '555-0103', role: 'driver', available: true },
  { id: 'crew-4', name: 'Emily Davis', phone: '555-0104', role: 'setup', available: true },
  { id: 'crew-5', name: 'James Wilson', phone: '555-0105', role: 'both', available: false },
];

const CATEGORY_ICONS = {
  tables: Armchair,
  chairs: Armchair,
  linens: Sparkles,
  tents: Tent,
  decor: Flower2,
};

const SEASON_ICONS = {
  spring: Flower2,
  summer: Sun,
  fall: Leaf,
  winter: Snowflake,
};

// Helper functions
const getCurrentSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Default combined data
const DEFAULT_PARTY_RENTAL_DATA: PartyRentalData[] = [{
  id: 'party-rental-data',
  inventory: DEFAULT_INVENTORY,
  bookings: [],
  packages: DEFAULT_PACKAGES,
  crew: DEFAULT_CREW,
  loadSheets: [],
}];

// Columns for combined data export (we'll extract specific arrays for export)
const COMBINED_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

// Main Component
export const PartyRentalTool: React.FC<PartyRentalToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: partyRentalData,
    setData: setPartyRentalData,
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
  } = useToolData<PartyRentalData>('party-rental', DEFAULT_PARTY_RENTAL_DATA, COMBINED_COLUMNS);

  // Extract individual data arrays from the combined data
  const currentData = partyRentalData[0] || DEFAULT_PARTY_RENTAL_DATA[0];
  const inventory = currentData.inventory;
  const bookings = currentData.bookings;
  const packages = currentData.packages;
  const crew = currentData.crew;
  const loadSheets = currentData.loadSheets;

  // Helper functions to update specific arrays
  const setInventory = (updater: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => {
    setPartyRentalData(prev => {
      const current = prev[0] || DEFAULT_PARTY_RENTAL_DATA[0];
      const newInventory = typeof updater === 'function' ? updater(current.inventory) : updater;
      return [{ ...current, inventory: newInventory }];
    });
  };

  const setBookings = (updater: Booking[] | ((prev: Booking[]) => Booking[])) => {
    setPartyRentalData(prev => {
      const current = prev[0] || DEFAULT_PARTY_RENTAL_DATA[0];
      const newBookings = typeof updater === 'function' ? updater(current.bookings) : updater;
      return [{ ...current, bookings: newBookings }];
    });
  };

  const setPackages = (updater: PackageDeal[] | ((prev: PackageDeal[]) => PackageDeal[])) => {
    setPartyRentalData(prev => {
      const current = prev[0] || DEFAULT_PARTY_RENTAL_DATA[0];
      const newPackages = typeof updater === 'function' ? updater(current.packages) : updater;
      return [{ ...current, packages: newPackages }];
    });
  };

  const setCrew = (updater: CrewMember[] | ((prev: CrewMember[]) => CrewMember[])) => {
    setPartyRentalData(prev => {
      const current = prev[0] || DEFAULT_PARTY_RENTAL_DATA[0];
      const newCrew = typeof updater === 'function' ? updater(current.crew) : updater;
      return [{ ...current, crew: newCrew }];
    });
  };

  const setLoadSheets = (updater: LoadSheet[] | ((prev: LoadSheet[]) => LoadSheet[])) => {
    setPartyRentalData(prev => {
      const current = prev[0] || DEFAULT_PARTY_RENTAL_DATA[0];
      const newLoadSheets = typeof updater === 'function' ? updater(current.loadSheets) : updater;
      return [{ ...current, loadSheets: newLoadSheets }];
    });
  };

  // State
  const [activeTab, setActiveTab] = useState<
    'inventory' | 'bookings' | 'quotes' | 'schedule' | 'packages' | 'loadsheets'
  >('inventory');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showLoadSheetModal, setShowLoadSheetModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingLoadSheet, setViewingLoadSheet] = useState<LoadSheet | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill customer name
      if (params.customerName || params.name) {
        hasChanges = true;
      }

      // Prefill event type/name
      if (params.eventType || params.type || params.eventName) {
        hasChanges = true;
      }

      // Prefill event date
      if (params.eventDate || params.date) {
        hasChanges = true;
      }

      // Prefill quantity
      if (params.quantity || params.guestCount) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'tables',
    condition: 'excellent',
    seasonalPricing: { spring: 0, summer: 0, fall: 0, winter: 0 },
  });
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    status: 'pending',
    items: [],
    damageDepositStatus: 'pending',
    setupCrewAssigned: [],
  });
  const [quoteItems, setQuoteItems] = useState<BookingItem[]>([]);
  const [quoteDate, setQuoteDate] = useState('');


  // Current season for pricing
  const currentSeason = useMemo(() => getCurrentSeason(), []);

  // Get seasonal price for an item
  const getSeasonalPrice = (item: InventoryItem, date?: string): number => {
    if (date) {
      const month = new Date(date).getMonth();
      if (month >= 2 && month <= 4) return item.seasonalPricing.spring;
      if (month >= 5 && month <= 7) return item.seasonalPricing.summer;
      if (month >= 8 && month <= 10) return item.seasonalPricing.fall;
      return item.seasonalPricing.winter;
    }
    return item.seasonalPricing[currentSeason];
  };

  // Check availability for a specific date
  const getAvailability = (itemId: string, date: string): number => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return 0;

    const bookedQuantity = bookings
      .filter(
        (b) =>
          b.eventDate === date &&
          b.status !== 'cancelled' &&
          b.status !== 'completed'
      )
      .reduce((sum, b) => {
        const bookingItem = b.items.find((bi) => bi.itemId === itemId);
        return sum + (bookingItem?.quantity || 0);
      }, 0);

    return item.quantity - bookedQuantity;
  };

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.description.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;
      const matchesCondition =
        conditionFilter === 'all' || item.condition === conditionFilter;
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [inventory, inventorySearch, categoryFilter, conditionFilter]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.location.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;
      const matchesDate = !dateFilter || booking.eventDate === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, bookingSearch, statusFilter, dateFilter]);

  // Schedule view - bookings grouped by date
  const scheduleByDate = useMemo(() => {
    const grouped: { [key: string]: Booking[] } = {};
    bookings
      .filter((b) => b.status !== 'cancelled')
      .forEach((booking) => {
        if (!grouped[booking.eventDate]) {
          grouped[booking.eventDate] = [];
        }
        grouped[booking.eventDate].push(booking);
      });
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .filter(([date]) => new Date(date) >= new Date(new Date().toDateString()));
  }, [bookings]);

  // Inventory handlers
  const handleSaveInventoryItem = () => {
    if (!newItem.name || !newItem.basePrice) return;

    if (editingItem) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...newItem } as InventoryItem : item
        )
      );
    } else {
      const item: InventoryItem = {
        id: generateId(),
        name: newItem.name || '',
        category: newItem.category || 'tables',
        description: newItem.description || '',
        quantity: newItem.quantity || 0,
        basePrice: newItem.basePrice || 0,
        condition: newItem.condition || 'excellent',
        dimensions: newItem.dimensions,
        color: newItem.color,
        seasonalPricing: newItem.seasonalPricing || {
          spring: newItem.basePrice || 0,
          summer: newItem.basePrice || 0,
          fall: newItem.basePrice || 0,
          winter: newItem.basePrice || 0,
        },
      };
      setInventory((prev) => [...prev, item]);
    }

    setShowInventoryModal(false);
    setEditingItem(null);
    setNewItem({
      category: 'tables',
      condition: 'excellent',
      seasonalPricing: { spring: 0, summer: 0, fall: 0, winter: 0 },
    });
  };

  const handleDeleteInventoryItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Booking handlers
  const calculateBookingTotal = (items: BookingItem[], cleaningFee: number, deposit: number): { subtotal: number; total: number } => {
    const subtotal = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
    return { subtotal, total: subtotal + cleaningFee };
  };

  const handleSaveBooking = () => {
    if (!newBooking.customerName || !newBooking.eventDate || !newBooking.items?.length) return;

    const { subtotal, total } = calculateBookingTotal(
      newBooking.items || [],
      newBooking.cleaningFee || 0,
      newBooking.damageDeposit || 0
    );

    if (editingBooking) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === editingBooking.id
            ? { ...booking, ...newBooking, subtotal, total } as Booking
            : booking
        )
      );
    } else {
      const booking: Booking = {
        id: generateId(),
        customerName: newBooking.customerName || '',
        customerEmail: newBooking.customerEmail || '',
        customerPhone: newBooking.customerPhone || '',
        eventDate: newBooking.eventDate || '',
        eventTime: newBooking.eventTime || '',
        eventEndTime: newBooking.eventEndTime || '',
        eventType: newBooking.eventType || '',
        location: newBooking.location || '',
        locationAddress: newBooking.locationAddress || '',
        items: newBooking.items || [],
        status: 'pending',
        deliveryTime: newBooking.deliveryTime || '',
        pickupTime: newBooking.pickupTime || '',
        setupCrewAssigned: newBooking.setupCrewAssigned || [],
        damageDeposit: newBooking.damageDeposit || 0,
        damageDepositStatus: 'pending',
        cleaningFee: newBooking.cleaningFee || 0,
        subtotal,
        total,
        notes: newBooking.notes || '',
        packageDeal: newBooking.packageDeal,
        createdAt: new Date().toISOString(),
      };
      setBookings((prev) => [...prev, booking]);
    }

    setShowBookingModal(false);
    setEditingBooking(null);
    setNewBooking({
      status: 'pending',
      items: [],
      damageDepositStatus: 'pending',
      setupCrewAssigned: [],
    });
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const handleUpdateDepositStatus = (bookingId: string, status: Booking['damageDepositStatus']) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, damageDepositStatus: status } : booking
      )
    );
  };

  // Quote builder
  const addItemToQuote = (itemId: string, quantity: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const price = getSeasonalPrice(item, quoteDate);
    const existingIndex = quoteItems.findIndex((qi) => qi.itemId === itemId);

    if (existingIndex >= 0) {
      setQuoteItems((prev) =>
        prev.map((qi, i) =>
          i === existingIndex ? { ...qi, quantity: qi.quantity + quantity } : qi
        )
      );
    } else {
      setQuoteItems((prev) => [...prev, { itemId, quantity, pricePerUnit: price }]);
    }
  };

  const removeItemFromQuote = (itemId: string) => {
    setQuoteItems((prev) => prev.filter((qi) => qi.itemId !== itemId));
  };

  const applyPackageToQuote = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return;

    const newItems: BookingItem[] = pkg.items.map((pi) => {
      const item = inventory.find((i) => i.id === pi.itemId);
      const price = item ? getSeasonalPrice(item, quoteDate) : 0;
      return { itemId: pi.itemId, quantity: pi.quantity, pricePerUnit: price };
    });

    setQuoteItems(newItems);
  };

  const quoteTotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  }, [quoteItems]);

  // Load sheet generation
  const generateLoadSheet = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const loadSheet: LoadSheet = {
      bookingId,
      items: booking.items.map((bi) => {
        const item = inventory.find((i) => i.id === bi.itemId);
        return {
          name: item?.name || 'Unknown Item',
          quantity: bi.quantity,
          condition: item?.condition || 'unknown',
        };
      }),
      truckAssignment: 'Truck 1',
      loadOrder: booking.items.map((_, i) => i + 1),
      specialInstructions: booking.notes,
      generatedAt: new Date().toISOString(),
    };

    setLoadSheets((prev) => [...prev, loadSheet]);
    setViewingLoadSheet(loadSheet);
    setShowLoadSheetModal(true);
  };

  // Export/Print functions
  const exportQuote = () => {
    const quoteData = {
      date: new Date().toISOString(),
      eventDate: quoteDate,
      items: quoteItems.map((qi) => {
        const item = inventory.find((i) => i.id === qi.itemId);
        return {
          name: item?.name || '',
          quantity: qi.quantity,
          pricePerUnit: qi.pricePerUnit,
          total: qi.quantity * qi.pricePerUnit,
        };
      }),
      subtotal: quoteTotal,
      season: currentSeason,
    };

    const blob = new Blob([JSON.stringify(quoteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printLoadSheet = () => {
    window.print();
  };

  // Tab styles
  const tabClass = (tab: string) =>
    `px-4 py-2 rounded-lg font-medium transition-all ${
      activeTab === tab
        ? 'bg-[#0D9488] text-white'
        : isDark
        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const selectClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white'
      : 'border-gray-200 bg-white text-gray-900'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const labelClass = `block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } flex items-center justify-center h-64`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${
          isDark ? t('tools.partyRental.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.partyRental.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')
        } px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <PartyPopper className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.partyRental.partyRentalManager', 'Party Rental Manager')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.partyRental.manageInventoryBookingsQuotesAnd', 'Manage inventory, bookings, quotes, and deliveries')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="party-rental" toolName="Party Rental" />

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
              onExportCSV={() => exportCSV({ filename: 'party-rental-bookings' })}
              onExportExcel={() => exportExcel({ filename: 'party-rental-bookings' })}
              onExportJSON={() => exportJSON({ filename: 'party-rental-data' })}
              onExportPDF={() => exportPDF({
                filename: 'party-rental-report',
                title: 'Party Rental Report',
                subtitle: `${bookings.length} bookings, ${inventory.length} inventory items`
              })}
              onPrint={() => print('Party Rental Manager')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className={`px-6 py-3 border-b ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
        } overflow-x-auto`}
      >
        <div className="flex gap-2 min-w-max">
          <button onClick={() => setActiveTab('inventory')} className={tabClass('inventory')}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t('tools.partyRental.inventory', 'Inventory')}
            </div>
          </button>
          <button onClick={() => setActiveTab('bookings')} className={tabClass('bookings')}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('tools.partyRental.bookings', 'Bookings')}
            </div>
          </button>
          <button onClick={() => setActiveTab('quotes')} className={tabClass('quotes')}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('tools.partyRental.quoteBuilder', 'Quote Builder')}
            </div>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={tabClass('schedule')}>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {t('tools.partyRental.schedule', 'Schedule')}
            </div>
          </button>
          <button onClick={() => setActiveTab('packages')} className={tabClass('packages')}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t('tools.partyRental.packages', 'Packages')}
            </div>
          </button>
          <button onClick={() => setActiveTab('loadsheets')} className={tabClass('loadsheets')}>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              {t('tools.partyRental.loadSheets', 'Load Sheets')}
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.partyRental.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.partyRental.searchInventory', 'Search inventory...')}
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={selectClass}
                  style={{ maxWidth: '160px' }}
                >
                  <option value="all">{t('tools.partyRental.allCategories', 'All Categories')}</option>
                  <option value="tables">{t('tools.partyRental.tables', 'Tables')}</option>
                  <option value="chairs">{t('tools.partyRental.chairs', 'Chairs')}</option>
                  <option value="linens">{t('tools.partyRental.linens', 'Linens')}</option>
                  <option value="tents">{t('tools.partyRental.tents', 'Tents')}</option>
                  <option value="decor">{t('tools.partyRental.decor', 'Decor')}</option>
                </select>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className={selectClass}
                  style={{ maxWidth: '160px' }}
                >
                  <option value="all">{t('tools.partyRental.allConditions', 'All Conditions')}</option>
                  <option value="excellent">{t('tools.partyRental.excellent', 'Excellent')}</option>
                  <option value="good">{t('tools.partyRental.good', 'Good')}</option>
                  <option value="fair">{t('tools.partyRental.fair', 'Fair')}</option>
                  <option value="needs-repair">{t('tools.partyRental.needsRepair', 'Needs Repair')}</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({
                    category: 'tables',
                    condition: 'excellent',
                    seasonalPricing: { spring: 0, summer: 0, fall: 0, winter: 0 },
                  });
                  setShowInventoryModal(true);
                }}
                className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0D9488]/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.partyRental.addItem', 'Add Item')}
              </button>
            </div>

            {/* Season indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {React.createElement(SEASON_ICONS[currentSeason], { className: 'w-4 h-4 text-[#0D9488]' })}
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Current Season: <span className="font-medium capitalize">{currentSeason}</span> - Prices shown reflect seasonal rates
              </span>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item) => {
                const CategoryIcon = CATEGORY_ICONS[item.category];
                const seasonPrice = getSeasonalPrice(item);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${
                      isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                          <CategoryIcon className="w-4 h-4 text-[#0D9488]" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h4>
                          <p className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setNewItem(item);
                            setShowInventoryModal(true);
                          }}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                        >
                          <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteInventoryItem(item.id)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-50'} transition-colors`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.partyRental.quantity', 'Quantity:')}</span>
                        <span className={`ml-1 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.partyRental.price', 'Price:')}</span>
                        <span className={`ml-1 font-medium text-[#0D9488]`}>
                          {formatCurrency(seasonPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.condition === 'excellent'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : item.condition === 'good'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : item.condition === 'fair'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {item.condition}
                      </span>
                      {item.color && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.color}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInventory.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.partyRental.noInventoryItemsFound', 'No inventory items found')}</p>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.partyRental.searchBookings', 'Search bookings...')}
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={selectClass}
                  style={{ maxWidth: '160px' }}
                >
                  <option value="all">{t('tools.partyRental.allStatus', 'All Status')}</option>
                  <option value="pending">{t('tools.partyRental.pending', 'Pending')}</option>
                  <option value="confirmed">{t('tools.partyRental.confirmed', 'Confirmed')}</option>
                  <option value="delivered">{t('tools.partyRental.delivered', 'Delivered')}</option>
                  <option value="completed">{t('tools.partyRental.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.partyRental.cancelled', 'Cancelled')}</option>
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={selectClass}
                  style={{ maxWidth: '180px' }}
                />
              </div>
              <button
                onClick={() => {
                  setEditingBooking(null);
                  setNewBooking({
                    status: 'pending',
                    items: [],
                    damageDepositStatus: 'pending',
                    setupCrewAssigned: [],
                  });
                  setShowBookingModal(true);
                }}
                className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0D9488]/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.partyRental.newBooking', 'New Booking')}
              </button>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {booking.customerName}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : booking.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : booking.status === 'delivered'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : booking.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {formatDate(booking.eventDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {booking.eventTime} - {booking.eventEndTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {booking.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`font-medium text-[#0D9488]`}>
                            {formatCurrency(booking.total)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {booking.items.slice(0, 3).map((item, idx) => {
                          const invItem = inventory.find((i) => i.id === item.itemId);
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {item.quantity}x {invItem?.name || 'Unknown'}
                            </span>
                          );
                        })}
                        {booking.items.length > 3 && (
                          <span className={`px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            +{booking.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <select
                        value={booking.status}
                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as Booking['status'])}
                        className={`px-3 py-1.5 text-sm rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-200 bg-white text-gray-900'
                        }`}
                      >
                        <option value="pending">{t('tools.partyRental.pending2', 'Pending')}</option>
                        <option value="confirmed">{t('tools.partyRental.confirmed2', 'Confirmed')}</option>
                        <option value="delivered">{t('tools.partyRental.delivered2', 'Delivered')}</option>
                        <option value="completed">{t('tools.partyRental.completed2', 'Completed')}</option>
                        <option value="cancelled">{t('tools.partyRental.cancelled2', 'Cancelled')}</option>
                      </select>
                      <button
                        onClick={() => generateLoadSheet(booking.id)}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                        title={t('tools.partyRental.generateLoadSheet', 'Generate Load Sheet')}
                      >
                        <FileText className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBooking(booking);
                          setNewBooking(booking);
                          setShowBookingModal(true);
                        }}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Deposit & Cleaning Fee Status */}
                  <div className="mt-3 pt-3 border-t border-gray-600/30 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partyRental.deposit', 'Deposit:')}</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(booking.damageDeposit)}
                      </span>
                      <select
                        value={booking.damageDepositStatus}
                        onChange={(e) => handleUpdateDepositStatus(booking.id, e.target.value as Booking['damageDepositStatus'])}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-200 bg-white text-gray-900'
                        }`}
                      >
                        <option value="pending">{t('tools.partyRental.pending3', 'Pending')}</option>
                        <option value="collected">{t('tools.partyRental.collected', 'Collected')}</option>
                        <option value="refunded">{t('tools.partyRental.refunded', 'Refunded')}</option>
                        <option value="partial-refund">{t('tools.partyRental.partialRefund', 'Partial Refund')}</option>
                        <option value="forfeited">{t('tools.partyRental.forfeited', 'Forfeited')}</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partyRental.cleaningFee', 'Cleaning Fee:')}</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(booking.cleaningFee)}
                      </span>
                    </div>
                    {booking.setupCrewAssigned.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.partyRental.crew', 'Crew:')}</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {booking.setupCrewAssigned.map((id) => crew.find((c) => c.id === id)?.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.partyRental.noBookingsFound', 'No bookings found')}</p>
              </div>
            )}
          </div>
        )}

        {/* Quote Builder Tab */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Item Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.partyRental.selectItems', 'Select Items')}
                  </h4>
                  <div className="flex items-center gap-2">
                    <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.partyRental.eventDate2', 'Event Date:')}
                    </label>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Package Selection */}
                <div className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                  <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.partyRental.quickPackages', 'Quick Packages')}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => applyPackageToQuote(pkg.id)}
                        className={`px-3 py-1.5 text-sm rounded-lg border ${
                          isDark
                            ? 'border-gray-600 bg-gray-600 text-white hover:bg-gray-500'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                        } transition-colors`}
                      >
                        {pkg.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inventory Items */}
                <div className={`max-h-96 overflow-y-auto rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {Object.entries(
                    inventory.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as { [key: string]: InventoryItem[] })
                  ).map(([category, items]) => (
                    <div key={category}>
                      <div className={`px-4 py-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} sticky top-0`}>
                        <span className={`text-sm font-medium capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {category}
                        </span>
                      </div>
                      {items.map((item) => {
                        const available = quoteDate ? getAvailability(item.id, quoteDate) : item.quantity;
                        const price = getSeasonalPrice(item, quoteDate);
                        return (
                          <div
                            key={item.id}
                            className={`px-4 py-3 flex items-center justify-between border-b ${
                              isDark ? 'border-gray-700' : 'border-gray-100'
                            }`}
                          >
                            <div>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatCurrency(price)} each | {available} available
                              </p>
                            </div>
                            <button
                              onClick={() => addItemToQuote(item.id, 1)}
                              disabled={available <= 0}
                              className={`p-2 rounded-lg ${
                                available <= 0
                                  ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-600' : t('tools.partyRental.bg0d9488HoverBg0d9488', 'bg-[#0D9488] hover:bg-[#0D9488]/80 text-white')
                              } transition-colors`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote Summary */}
              <div className="space-y-4">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.quoteSummary', 'Quote Summary')}
                </h4>

                <div className={`rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'} overflow-hidden`}>
                  {quoteItems.length === 0 ? (
                    <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('tools.partyRental.addItemsToBuildYour', 'Add items to build your quote')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {quoteItems.map((qi) => {
                          const item = inventory.find((i) => i.id === qi.itemId);
                          return (
                            <div key={qi.itemId} className="p-4 flex items-center justify-between">
                              <div className="flex-1">
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item?.name}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatCurrency(qi.pricePerUnit)} x {qi.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={qi.quantity}
                                  onChange={(e) => {
                                    const newQty = parseInt(e.target.value) || 1;
                                    setQuoteItems((prev) =>
                                      prev.map((q) =>
                                        q.itemId === qi.itemId ? { ...q, quantity: newQty } : q
                                      )
                                    );
                                  }}
                                  className={`w-20 px-3 py-1.5 text-sm text-center rounded-lg border ${
                                    isDark
                                      ? 'border-gray-600 bg-gray-700 text-white'
                                      : 'border-gray-200 bg-white text-gray-900'
                                  }`}
                                />
                                <span className={`font-medium min-w-[80px] text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(qi.pricePerUnit * qi.quantity)}
                                </span>
                                <button
                                  onClick={() => removeItemFromQuote(qi.itemId)}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className={`p-4 border-t ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-100'}`}>
                        <div className="flex justify-between items-center text-lg font-medium">
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.partyRental.total', 'Total')}</span>
                          <span className="text-[#0D9488]">{formatCurrency(quoteTotal)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {quoteItems.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={exportQuote}
                      className={`flex-1 px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      } transition-colors flex items-center justify-center gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      {t('tools.partyRental.exportQuote', 'Export Quote')}
                    </button>
                    <button
                      onClick={() => {
                        setNewBooking({
                          ...newBooking,
                          items: quoteItems,
                          eventDate: quoteDate,
                        });
                        setShowBookingModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0D9488]/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      {t('tools.partyRental.convertToBooking', 'Convert to Booking')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.partyRental.upcomingDeliveriesPickups', 'Upcoming Deliveries & Pickups')}
              </h4>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0D9488]" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {scheduleByDate.reduce((sum, [, bookings]) => sum + bookings.length, 0)} scheduled events
                </span>
              </div>
            </div>

            {scheduleByDate.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.partyRental.noUpcomingEventsScheduled', 'No upcoming events scheduled')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {scheduleByDate.map(([date, dayBookings]) => (
                  <div key={date}>
                    <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <Calendar className="w-5 h-5 text-[#0D9488]" />
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(date)}
                      </h5>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {dayBookings.length} event{dayBookings.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-4 rounded-xl border ${
                            isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h6 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.customerName}
                              </h6>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {booking.eventType}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : booking.status === 'delivered'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                {booking.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Truck className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                  Delivery: {booking.deliveryTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                  Pickup: {booking.pickupTime}
                                </span>
                              </div>
                            </div>
                            {booking.setupCrewAssigned.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                  {booking.setupCrewAssigned.map((id) => crew.find((c) => c.id === id)?.name).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-600/30 flex gap-2">
                            <button
                              onClick={() => generateLoadSheet(booking.id)}
                              className={`flex-1 px-3 py-1.5 text-sm rounded-lg ${
                                isDark
                                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } transition-colors flex items-center justify-center gap-1`}
                            >
                              <FileText className="w-4 h-4" />
                              {t('tools.partyRental.loadSheet', 'Load Sheet')}
                            </button>
                            <button
                              className={`flex-1 px-3 py-1.5 text-sm rounded-lg ${
                                isDark
                                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } transition-colors flex items-center justify-center gap-1`}
                            >
                              <Route className="w-4 h-4" />
                              {t('tools.partyRental.route', 'Route')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Crew Availability */}
            <div className={`mt-8 p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
              <h5 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.partyRental.crewAvailability', 'Crew Availability')}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {crew.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 rounded-lg border ${
                      member.available
                        ? isDark
                          ? 'border-green-800 bg-green-900/20'
                          : 'border-green-200 bg-green-50'
                        : isDark
                        ? 'border-gray-600 bg-gray-700'
                        : 'border-gray-200 bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.available ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {member.name}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.partyRental.packageDeals', 'Package Deals')}
              </h4>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.partyRental.preConfiguredPackagesForCommon', 'Pre-configured packages for common events')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pkg.name}
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {pkg.description}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {pkg.discount}% off
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {pkg.items.map((pi, idx) => {
                      const item = inventory.find((i) => i.id === pi.itemId);
                      return (
                        <div key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {pi.quantity}x {item?.name || 'Unknown Item'}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                    <span className="text-lg font-bold text-[#0D9488]">
                      {formatCurrency(pkg.price)}
                    </span>
                    <button
                      onClick={() => {
                        applyPackageToQuote(pkg.id);
                        setActiveTab('quotes');
                      }}
                      className="px-4 py-2 bg-[#0D9488] text-white text-sm rounded-lg hover:bg-[#0D9488]/90 transition-colors"
                    >
                      {t('tools.partyRental.usePackage', 'Use Package')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load Sheets Tab */}
        {activeTab === 'loadsheets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.partyRental.generatedLoadSheets', 'Generated Load Sheets')}
              </h4>
            </div>

            {loadSheets.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.partyRental.noLoadSheetsGeneratedYet', 'No load sheets generated yet')}</p>
                <p className="text-sm mt-1">{t('tools.partyRental.generateLoadSheetsFromBookings', 'Generate load sheets from bookings')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loadSheets.map((sheet, idx) => {
                  const booking = bookings.find((b) => b.id === sheet.bookingId);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking?.customerName || 'Unknown Booking'}
                          </h5>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Generated: {formatDate(sheet.generatedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setViewingLoadSheet(sheet);
                              setShowLoadSheetModal(true);
                            }}
                            className={`p-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                          >
                            <Eye className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={printLoadSheet}
                            className={`p-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                          >
                            <Printer className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sheet.items.map((item, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-lg text-xs ${
                              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingItem ? t('tools.partyRental.editInventoryItem', 'Edit Inventory Item') : t('tools.partyRental.addInventoryItem', 'Add Inventory Item')}
              </h3>
              <button
                onClick={() => {
                  setShowInventoryModal(false);
                  setEditingItem(null);
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.partyRental.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.partyRental.itemName', 'Item name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partyRental.category', 'Category *')}</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryItem['category'] })}
                    className={selectClass}
                  >
                    <option value="tables">{t('tools.partyRental.tables2', 'Tables')}</option>
                    <option value="chairs">{t('tools.partyRental.chairs2', 'Chairs')}</option>
                    <option value="linens">{t('tools.partyRental.linens2', 'Linens')}</option>
                    <option value="tents">{t('tools.partyRental.tents2', 'Tents')}</option>
                    <option value="decor">{t('tools.partyRental.decor2', 'Decor')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.partyRental.description', 'Description')}</label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder={t('tools.partyRental.itemDescription', 'Item description')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.partyRental.quantity2', 'Quantity *')}</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partyRental.basePrice', 'Base Price *')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.basePrice || 0}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      setNewItem({
                        ...newItem,
                        basePrice: price,
                        seasonalPricing: {
                          spring: price,
                          summer: price * 1.2,
                          fall: price,
                          winter: price * 0.9,
                        },
                      });
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partyRental.condition', 'Condition')}</label>
                  <select
                    value={newItem.condition}
                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value as InventoryItem['condition'] })}
                    className={selectClass}
                  >
                    <option value="excellent">{t('tools.partyRental.excellent2', 'Excellent')}</option>
                    <option value="good">{t('tools.partyRental.good2', 'Good')}</option>
                    <option value="fair">{t('tools.partyRental.fair2', 'Fair')}</option>
                    <option value="needs-repair">{t('tools.partyRental.needsRepair2', 'Needs Repair')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.partyRental.dimensions', 'Dimensions')}</label>
                  <input
                    type="text"
                    value={newItem.dimensions || ''}
                    onChange={(e) => setNewItem({ ...newItem, dimensions: e.target.value })}
                    className={inputClass}
                    placeholder='e.g., 60" x 30"'
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.partyRental.color', 'Color')}</label>
                  <input
                    type="text"
                    value={newItem.color || ''}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.partyRental.eGWhite', 'e.g., White')}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.partyRental.seasonalPricing', 'Seasonal Pricing')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['spring', 'summer', 'fall', 'winter'] as const).map((season) => (
                    <div key={season}>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                        {season}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.seasonalPricing?.[season] || 0}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            seasonalPricing: {
                              ...newItem.seasonalPricing!,
                              [season]: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setShowInventoryModal(false);
                  setEditingItem(null);
                }}
                className={`px-4 py-2 rounded-xl ${
                  isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                {t('tools.partyRental.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveInventoryItem}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-xl hover:bg-[#0D9488]/90 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingItem ? t('tools.partyRental.saveChanges', 'Save Changes') : t('tools.partyRental.addItem2', 'Add Item')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingBooking ? t('tools.partyRental.editBooking', 'Edit Booking') : t('tools.partyRental.newBooking2', 'New Booking')}
              </h3>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setEditingBooking(null);
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.customerInformation', 'Customer Information')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.name2', 'Name *')}</label>
                    <input
                      type="text"
                      value={newBooking.customerName || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.email', 'Email')}</label>
                    <input
                      type="email"
                      value={newBooking.customerEmail || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, customerEmail: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={newBooking.customerPhone || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.eventDetails', 'Event Details')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.eventType', 'Event Type')}</label>
                    <input
                      type="text"
                      value={newBooking.eventType || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, eventType: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.partyRental.eGWeddingBirthdayCorporate', 'e.g., Wedding, Birthday, Corporate')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.eventDate', 'Event Date *')}</label>
                    <input
                      type="date"
                      value={newBooking.eventDate || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, eventDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={newBooking.eventTime || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, eventTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.endTime', 'End Time')}</label>
                    <input
                      type="time"
                      value={newBooking.eventEndTime || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, eventEndTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.locationName', 'Location Name')}</label>
                    <input
                      type="text"
                      value={newBooking.location || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.fullAddress', 'Full Address')}</label>
                    <input
                      type="text"
                      value={newBooking.locationAddress || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, locationAddress: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Pickup */}
              <div>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.deliveryPickup', 'Delivery & Pickup')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.deliveryTime', 'Delivery Time')}</label>
                    <input
                      type="time"
                      value={newBooking.deliveryTime || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, deliveryTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.pickupTime', 'Pickup Time')}</label>
                    <input
                      type="time"
                      value={newBooking.pickupTime || ''}
                      onChange={(e) => setNewBooking({ ...newBooking, pickupTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Crew Assignment */}
              <div>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.setupCrew', 'Setup Crew')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {crew.map((member) => (
                    <label
                      key={member.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                        newBooking.setupCrewAssigned?.includes(member.id)
                          ? 'border-[#0D9488] bg-[#0D9488]/10'
                          : isDark
                          ? 'border-gray-600 bg-gray-700'
                          : 'border-gray-200 bg-gray-50'
                      } ${!member.available ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={newBooking.setupCrewAssigned?.includes(member.id) || false}
                        onChange={(e) => {
                          const current = newBooking.setupCrewAssigned || [];
                          if (e.target.checked) {
                            setNewBooking({ ...newBooking, setupCrewAssigned: [...current, member.id] });
                          } else {
                            setNewBooking({
                              ...newBooking,
                              setupCrewAssigned: current.filter((id) => id !== member.id),
                            });
                          }
                        }}
                        disabled={!member.available}
                        className="sr-only"
                      />
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{member.name}</span>
                      <span className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({member.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.feesDeposits', 'Fees & Deposits')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.damageDeposit', 'Damage Deposit')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newBooking.damageDeposit || 0}
                      onChange={(e) => setNewBooking({ ...newBooking, damageDeposit: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.partyRental.cleaningFee2', 'Cleaning Fee')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newBooking.cleaningFee || 0}
                      onChange={(e) => setNewBooking({ ...newBooking, cleaningFee: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.partyRental.rentalItems', 'Rental Items')}
                </h4>
                {newBooking.items && newBooking.items.length > 0 ? (
                  <div className="space-y-2">
                    {newBooking.items.map((bi, idx) => {
                      const item = inventory.find((i) => i.id === bi.itemId);
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {item?.name || 'Unknown'} x {bi.quantity}
                          </span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {formatCurrency(bi.pricePerUnit * bi.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.partyRental.noItemsAddedUseThe', 'No items added. Use the Quote Builder to add items first.')}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.partyRental.notes', 'Notes')}</label>
                <textarea
                  value={newBooking.notes || ''}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder={t('tools.partyRental.specialInstructionsAccessCodesEtc', 'Special instructions, access codes, etc.')}
                />
              </div>
            </div>

            <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setEditingBooking(null);
                }}
                className={`px-4 py-2 rounded-xl ${
                  isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                {t('tools.partyRental.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveBooking}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-xl hover:bg-[#0D9488]/90 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingBooking ? t('tools.partyRental.saveChanges2', 'Save Changes') : t('tools.partyRental.createBooking', 'Create Booking')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Sheet Modal */}
      {showLoadSheetModal && viewingLoadSheet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.partyRental.loadSheet2', 'Load Sheet')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={printLoadSheet}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Printer className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => {
                    setShowLoadSheetModal(false);
                    setViewingLoadSheet(null);
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 print:text-black">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {bookings.find((b) => b.id === viewingLoadSheet.bookingId)?.customerName}
                  </h4>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {bookings.find((b) => b.id === viewingLoadSheet.bookingId)?.location}
                  </p>
                </div>
                <div className={`text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Truck: {viewingLoadSheet.truckAssignment}</p>
                  <p>Generated: {formatDate(viewingLoadSheet.generatedAt)}</p>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>#</th>
                    <th className={`py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partyRental.item', 'Item')}</th>
                    <th className={`py-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partyRental.qty', 'Qty')}</th>
                    <th className={`py-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partyRental.condition2', 'Condition')}</th>
                    <th className={`py-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.partyRental.loaded', 'Loaded')}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingLoadSheet.items.map((item, idx) => (
                    <tr key={idx} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{idx + 1}</td>
                      <td className={`py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </td>
                      <td className={`py-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.quantity}
                      </td>
                      <td className={`py-3 text-center capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.condition}
                      </td>
                      <td className="py-3 text-center">
                        <div className={`w-5 h-5 mx-auto border-2 rounded ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {viewingLoadSheet.specialInstructions && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.partyRental.specialInstructions', 'Special Instructions')}
                  </h5>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {viewingLoadSheet.specialInstructions}
                  </p>
                </div>
              )}

              <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partyRental.loadedBy', 'Loaded By:')}</p>
                    <div className={`mt-8 border-b ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partyRental.verifiedBy', 'Verified By:')}</p>
                    <div className={`mt-8 border-b ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default PartyRentalTool;
