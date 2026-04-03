'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Circle,
  Users,
  Calendar,
  Trophy,
  Sparkles,
  ShoppingBag,
  Wrench,
  UtensilsCrossed,
  Coins,
  CreditCard,
  Star,
  Settings,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  PartyPopper,
  Moon,
  Hammer,
  Package,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Lane {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentReservation?: string;
  hourlyRate: number;
  cosmicEnabled: boolean;
}

interface Reservation {
  id: string;
  laneId: string;
  customerName: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPlayers: number;
  isPartyBooking: boolean;
  partyPackage?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
}

interface Team {
  id: string;
  name: string;
  leagueId: string;
  members: string[];
  wins: number;
  losses: number;
  totalPins: number;
  averageScore: number;
}

interface League {
  id: string;
  name: string;
  season: string;
  dayOfWeek: string;
  startTime: string;
  teams: string[];
  isActive: boolean;
}

interface ShoeRental {
  id: string;
  size: number;
  quantity: number;
  available: number;
  pricePerPair: number;
}

interface PartyPackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  includes: string[];
  maxGuests: number;
}

interface CosmicSession {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  priceMultiplier: number;
  isActive: boolean;
}

interface ProShopItem {
  id: string;
  name: string;
  category: 'balls' | 'bags' | 'shoes' | 'accessories' | 'apparel';
  price: number;
  quantity: number;
  sku: string;
}

interface DrillingService {
  id: string;
  customerName: string;
  ballType: string;
  drillingPattern: string;
  status: 'pending' | 'in-progress' | 'completed' | 'ready-for-pickup';
  dateReceived: string;
  dateCompleted?: string;
  price: number;
  notes: string;
}

interface SnackBarItem {
  id: string;
  name: string;
  category: 'food' | 'beverage' | 'snack';
  price: number;
  quantity: number;
  lowStockThreshold: number;
}

interface ArcadeCard {
  id: string;
  cardNumber: string;
  balance: number;
  customerName?: string;
  isActive: boolean;
  lastUsed?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium' | 'vip';
  points: number;
  joinDate: string;
  expiryDate: string;
  totalSpent: number;
}

interface MaintenanceSchedule {
  id: string;
  laneId: string;
  type: 'oil' | 'pin-replacement' | 'ball-return' | 'lane-repair' | 'general';
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  notes: string;
  technicianName: string;
}

interface RevenueRecord {
  id: string;
  date: string;
  laneId?: string;
  category: 'lane-rental' | 'shoe-rental' | 'pro-shop' | 'snack-bar' | 'arcade' | 'party' | 'league' | 'drilling';
  amount: number;
  description: string;
}

// Combined data structure for backend sync
interface BowlingAlleyData {
  id: string;
  lanes: Lane[];
  reservations: Reservation[];
  teams: Team[];
  leagues: League[];
  shoes: ShoeRental[];
  partyPackages: PartyPackage[];
  cosmicSessions: CosmicSession[];
  proShopItems: ProShopItem[];
  drillingServices: DrillingService[];
  snackBarItems: SnackBarItem[];
  arcadeCards: ArcadeCard[];
  members: Member[];
  maintenance: MaintenanceSchedule[];
  revenue: RevenueRecord[];
}

// Column configuration for combined data export
const BOWLING_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

// Storage keys
const STORAGE_KEYS = {
  lanes: 'bowling_lanes',
  reservations: 'bowling_reservations',
  teams: 'bowling_teams',
  leagues: 'bowling_leagues',
  shoes: 'bowling_shoes',
  partyPackages: 'bowling_party_packages',
  cosmicSessions: 'bowling_cosmic_sessions',
  proShopItems: 'bowling_pro_shop',
  drillingServices: 'bowling_drilling',
  snackBarItems: 'bowling_snack_bar',
  arcadeCards: 'bowling_arcade_cards',
  members: 'bowling_members',
  maintenance: 'bowling_maintenance',
  revenue: 'bowling_revenue',
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 9);

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Default data
const defaultLanes: Lane[] = Array.from({ length: 24 }, (_, i) => ({
  id: generateId(),
  number: i + 1,
  status: 'available',
  hourlyRate: 25,
  cosmicEnabled: i < 12,
}));

const defaultShoes: ShoeRental[] = [
  { id: generateId(), size: 6, quantity: 20, available: 20, pricePerPair: 4 },
  { id: generateId(), size: 7, quantity: 25, available: 25, pricePerPair: 4 },
  { id: generateId(), size: 8, quantity: 30, available: 30, pricePerPair: 4 },
  { id: generateId(), size: 9, quantity: 35, available: 35, pricePerPair: 4 },
  { id: generateId(), size: 10, quantity: 30, available: 30, pricePerPair: 4 },
  { id: generateId(), size: 11, quantity: 25, available: 25, pricePerPair: 4 },
  { id: generateId(), size: 12, quantity: 20, available: 20, pricePerPair: 4 },
  { id: generateId(), size: 13, quantity: 15, available: 15, pricePerPair: 4 },
];

const defaultPartyPackages: PartyPackage[] = [
  { id: generateId(), name: 'Kids Birthday Basic', duration: 2, price: 199, includes: ['2 lanes', '10 shoes', 'Pizza & drinks', 'Party host'], maxGuests: 10 },
  { id: generateId(), name: 'Kids Birthday Deluxe', duration: 2.5, price: 299, includes: ['3 lanes', '15 shoes', 'Pizza & drinks', 'Cake', 'Party host', 'Arcade tokens'], maxGuests: 15 },
  { id: generateId(), name: 'Teen Party', duration: 3, price: 349, includes: ['4 lanes', '20 shoes', 'Food buffet', 'Cosmic bowling', 'Music'], maxGuests: 20 },
  { id: generateId(), name: 'Corporate Event', duration: 4, price: 599, includes: ['6 lanes', '30 shoes', 'Catering', 'Private area', 'Bar service'], maxGuests: 30 },
];

const defaultCosmicSessions: CosmicSession[] = [
  { id: generateId(), dayOfWeek: 'Friday', startTime: '21:00', endTime: '00:00', priceMultiplier: 1.5, isActive: true },
  { id: generateId(), dayOfWeek: 'Saturday', startTime: '21:00', endTime: '01:00', priceMultiplier: 1.5, isActive: true },
  { id: generateId(), dayOfWeek: 'Saturday', startTime: '14:00', endTime: '17:00', priceMultiplier: 1.25, isActive: true },
];

const defaultSnackBarItems: SnackBarItem[] = [
  { id: generateId(), name: 'Hot Dog', category: 'food', price: 4.99, quantity: 100, lowStockThreshold: 20 },
  { id: generateId(), name: 'Nachos', category: 'food', price: 6.99, quantity: 80, lowStockThreshold: 15 },
  { id: generateId(), name: 'Pizza Slice', category: 'food', price: 3.99, quantity: 120, lowStockThreshold: 25 },
  { id: generateId(), name: 'Soda', category: 'beverage', price: 2.49, quantity: 200, lowStockThreshold: 50 },
  { id: generateId(), name: 'Beer', category: 'beverage', price: 5.99, quantity: 150, lowStockThreshold: 30 },
  { id: generateId(), name: 'Popcorn', category: 'snack', price: 3.49, quantity: 60, lowStockThreshold: 15 },
];

type TabType = 'lanes' | 'reservations' | 'leagues' | 'shoes' | 'parties' | 'cosmic' | 'proshop' | 'drilling' | 'snackbar' | 'arcade' | 'members' | 'maintenance' | 'revenue';

interface BowlingAlleyToolProps {
  uiConfig?: UIConfig;
}

export const BowlingAlleyTool = ({ uiConfig }: BowlingAlleyToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('lanes');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Default combined data
  const defaultBowlingData: BowlingAlleyData[] = [{
    id: 'bowling-data',
    lanes: defaultLanes,
    reservations: [],
    teams: [],
    leagues: [],
    shoes: defaultShoes,
    partyPackages: defaultPartyPackages,
    cosmicSessions: defaultCosmicSessions,
    proShopItems: [],
    drillingServices: [],
    snackBarItems: defaultSnackBarItems,
    arcadeCards: [],
    members: [],
    maintenance: [],
    revenue: [],
  }];

  // Use the useToolData hook for backend persistence
  const {
    data: bowlingDataArray,
    setData: setBowlingDataArray,
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
  } = useToolData<BowlingAlleyData>('bowling-alley', defaultBowlingData, BOWLING_COLUMNS);

  // Get the current data object (or use defaults)
  const bowlingData = bowlingDataArray[0] || defaultBowlingData[0];

  // Helper to update bowling data
  const updateBowlingData = useCallback((updates: Partial<BowlingAlleyData>) => {
    setBowlingDataArray([{ ...bowlingData, ...updates }]);
  }, [bowlingData, setBowlingDataArray]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.tab && ['lanes', 'reservations', 'leagues', 'shoes', 'parties', 'cosmic', 'proshop', 'drilling', 'snackbar', 'arcade', 'members', 'maintenance', 'reports'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Derive individual data arrays from combined data
  const lanes = bowlingData.lanes;
  const reservations = bowlingData.reservations;
  const teams = bowlingData.teams;
  const leagues = bowlingData.leagues;
  const shoes = bowlingData.shoes;
  const partyPackages = bowlingData.partyPackages;
  const cosmicSessions = bowlingData.cosmicSessions;
  const proShopItems = bowlingData.proShopItems;
  const drillingServices = bowlingData.drillingServices;
  const snackBarItems = bowlingData.snackBarItems;
  const arcadeCards = bowlingData.arcadeCards;
  const members = bowlingData.members;
  const maintenance = bowlingData.maintenance;
  const revenue = bowlingData.revenue;

  // Setter functions that update the combined data
  const setLanes = useCallback((updater: Lane[] | ((prev: Lane[]) => Lane[])) => {
    const newLanes = typeof updater === 'function' ? updater(lanes) : updater;
    updateBowlingData({ lanes: newLanes });
  }, [lanes, updateBowlingData]);

  const setReservations = useCallback((updater: Reservation[] | ((prev: Reservation[]) => Reservation[])) => {
    const newReservations = typeof updater === 'function' ? updater(reservations) : updater;
    updateBowlingData({ reservations: newReservations });
  }, [reservations, updateBowlingData]);

  const setTeams = useCallback((updater: Team[] | ((prev: Team[]) => Team[])) => {
    const newTeams = typeof updater === 'function' ? updater(teams) : updater;
    updateBowlingData({ teams: newTeams });
  }, [teams, updateBowlingData]);

  const setLeagues = useCallback((updater: League[] | ((prev: League[]) => League[])) => {
    const newLeagues = typeof updater === 'function' ? updater(leagues) : updater;
    updateBowlingData({ leagues: newLeagues });
  }, [leagues, updateBowlingData]);

  const setShoes = useCallback((updater: ShoeRental[] | ((prev: ShoeRental[]) => ShoeRental[])) => {
    const newShoes = typeof updater === 'function' ? updater(shoes) : updater;
    updateBowlingData({ shoes: newShoes });
  }, [shoes, updateBowlingData]);

  const setPartyPackages = useCallback((updater: PartyPackage[] | ((prev: PartyPackage[]) => PartyPackage[])) => {
    const newPartyPackages = typeof updater === 'function' ? updater(partyPackages) : updater;
    updateBowlingData({ partyPackages: newPartyPackages });
  }, [partyPackages, updateBowlingData]);

  const setCosmicSessions = useCallback((updater: CosmicSession[] | ((prev: CosmicSession[]) => CosmicSession[])) => {
    const newCosmicSessions = typeof updater === 'function' ? updater(cosmicSessions) : updater;
    updateBowlingData({ cosmicSessions: newCosmicSessions });
  }, [cosmicSessions, updateBowlingData]);

  const setProShopItems = useCallback((updater: ProShopItem[] | ((prev: ProShopItem[]) => ProShopItem[])) => {
    const newProShopItems = typeof updater === 'function' ? updater(proShopItems) : updater;
    updateBowlingData({ proShopItems: newProShopItems });
  }, [proShopItems, updateBowlingData]);

  const setDrillingServices = useCallback((updater: DrillingService[] | ((prev: DrillingService[]) => DrillingService[])) => {
    const newDrillingServices = typeof updater === 'function' ? updater(drillingServices) : updater;
    updateBowlingData({ drillingServices: newDrillingServices });
  }, [drillingServices, updateBowlingData]);

  const setSnackBarItems = useCallback((updater: SnackBarItem[] | ((prev: SnackBarItem[]) => SnackBarItem[])) => {
    const newSnackBarItems = typeof updater === 'function' ? updater(snackBarItems) : updater;
    updateBowlingData({ snackBarItems: newSnackBarItems });
  }, [snackBarItems, updateBowlingData]);

  const setArcadeCards = useCallback((updater: ArcadeCard[] | ((prev: ArcadeCard[]) => ArcadeCard[])) => {
    const newArcadeCards = typeof updater === 'function' ? updater(arcadeCards) : updater;
    updateBowlingData({ arcadeCards: newArcadeCards });
  }, [arcadeCards, updateBowlingData]);

  const setMembers = useCallback((updater: Member[] | ((prev: Member[]) => Member[])) => {
    const newMembers = typeof updater === 'function' ? updater(members) : updater;
    updateBowlingData({ members: newMembers });
  }, [members, updateBowlingData]);

  const setMaintenance = useCallback((updater: MaintenanceSchedule[] | ((prev: MaintenanceSchedule[]) => MaintenanceSchedule[])) => {
    const newMaintenance = typeof updater === 'function' ? updater(maintenance) : updater;
    updateBowlingData({ maintenance: newMaintenance });
  }, [maintenance, updateBowlingData]);

  const setRevenue = useCallback((updater: RevenueRecord[] | ((prev: RevenueRecord[]) => RevenueRecord[])) => {
    const newRevenue = typeof updater === 'function' ? updater(revenue) : updater;
    updateBowlingData({ revenue: newRevenue });
  }, [revenue, updateBowlingData]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const availableLanes = lanes.filter(l => l.status === 'available').length;
    const occupiedLanes = lanes.filter(l => l.status === 'occupied').length;
    const todayReservations = reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
    const activeLeagues = leagues.filter(l => l.isActive).length;
    const totalMembers = members.length;
    const lowStockItems = snackBarItems.filter(i => i.quantity <= i.lowStockThreshold).length;
    const pendingDrilling = drillingServices.filter(d => d.status !== 'completed' && d.status !== 'ready-for-pickup').length;
    const scheduledMaintenance = maintenance.filter(m => m.status === 'scheduled').length;

    const todayRevenue = revenue
      .filter(r => r.date === new Date().toISOString().split('T')[0])
      .reduce((sum, r) => sum + r.amount, 0);

    const monthlyRevenue = revenue
      .filter(r => {
        const recordDate = new Date(r.date);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      availableLanes,
      occupiedLanes,
      todayReservations,
      activeLeagues,
      totalMembers,
      lowStockItems,
      pendingDrilling,
      scheduledMaintenance,
      todayRevenue,
      monthlyRevenue,
    };
  }, [lanes, reservations, leagues, members, snackBarItems, drillingServices, maintenance, revenue]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'lanes', label: 'Lanes', icon: <Circle className="w-4 h-4" /> },
    { id: 'reservations', label: 'Reservations', icon: <Calendar className="w-4 h-4" /> },
    { id: 'leagues', label: 'Leagues', icon: <Trophy className="w-4 h-4" /> },
    { id: 'shoes', label: 'Shoes', icon: <Package className="w-4 h-4" /> },
    { id: 'parties', label: 'Parties', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'cosmic', label: 'Cosmic', icon: <Moon className="w-4 h-4" /> },
    { id: 'proshop', label: 'Pro Shop', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'drilling', label: 'Drilling', icon: <Hammer className="w-4 h-4" /> },
    { id: 'snackbar', label: 'Snack Bar', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'arcade', label: 'Arcade', icon: <Coins className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Star className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
  ];

  // Column configurations for each tab
  const COLUMNS_BY_TAB: Record<TabType, ColumnConfig[]> = {
    lanes: [
      { key: 'number', header: 'Lane Number', type: 'number' },
      { key: 'status', header: 'Status', type: 'string' },
      { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
      { key: 'cosmicEnabled', header: 'Cosmic Enabled', type: 'boolean' },
    ],
    reservations: [
      { key: 'customerName', header: 'Customer Name', type: 'string' },
      { key: 'phone', header: 'Phone', type: 'string' },
      { key: 'date', header: 'Date', type: 'date' },
      { key: 'startTime', header: 'Start Time', type: 'string' },
      { key: 'endTime', header: 'End Time', type: 'string' },
      { key: 'numberOfPlayers', header: 'Players', type: 'number' },
      { key: 'isPartyBooking', header: 'Party Booking', type: 'boolean' },
      { key: 'status', header: 'Status', type: 'string' },
      { key: 'totalAmount', header: 'Total Amount', type: 'currency' },
    ],
    leagues: [
      { key: 'name', header: 'League Name', type: 'string' },
      { key: 'season', header: 'Season', type: 'string' },
      { key: 'dayOfWeek', header: 'Day', type: 'string' },
      { key: 'startTime', header: 'Start Time', type: 'string' },
      { key: 'isActive', header: 'Active', type: 'boolean' },
    ],
    shoes: [
      { key: 'size', header: 'Size', type: 'number' },
      { key: 'quantity', header: 'Total Quantity', type: 'number' },
      { key: 'available', header: 'Available', type: 'number' },
      { key: 'pricePerPair', header: 'Price Per Pair', type: 'currency' },
    ],
    parties: [
      { key: 'name', header: 'Package Name', type: 'string' },
      { key: 'duration', header: 'Duration (hrs)', type: 'number' },
      { key: 'price', header: 'Price', type: 'currency' },
      { key: 'maxGuests', header: 'Max Guests', type: 'number' },
      { key: 'includes', header: 'Includes', type: 'string', format: (v: string[]) => Array.isArray(v) ? v.join(', ') : v },
    ],
    cosmic: [
      { key: 'dayOfWeek', header: 'Day', type: 'string' },
      { key: 'startTime', header: 'Start Time', type: 'string' },
      { key: 'endTime', header: 'End Time', type: 'string' },
      { key: 'priceMultiplier', header: 'Price Multiplier', type: 'number' },
      { key: 'isActive', header: 'Active', type: 'boolean' },
    ],
    proshop: [
      { key: 'name', header: 'Item Name', type: 'string' },
      { key: 'category', header: 'Category', type: 'string' },
      { key: 'sku', header: 'SKU', type: 'string' },
      { key: 'price', header: 'Price', type: 'currency' },
      { key: 'quantity', header: 'Quantity', type: 'number' },
    ],
    drilling: [
      { key: 'customerName', header: 'Customer', type: 'string' },
      { key: 'ballType', header: 'Ball Type', type: 'string' },
      { key: 'drillingPattern', header: 'Drilling Pattern', type: 'string' },
      { key: 'status', header: 'Status', type: 'string' },
      { key: 'dateReceived', header: 'Date Received', type: 'date' },
      { key: 'dateCompleted', header: 'Date Completed', type: 'date' },
      { key: 'price', header: 'Price', type: 'currency' },
      { key: 'notes', header: 'Notes', type: 'string' },
    ],
    snackbar: [
      { key: 'name', header: 'Item Name', type: 'string' },
      { key: 'category', header: 'Category', type: 'string' },
      { key: 'price', header: 'Price', type: 'currency' },
      { key: 'quantity', header: 'Quantity', type: 'number' },
      { key: 'lowStockThreshold', header: 'Low Stock Threshold', type: 'number' },
    ],
    arcade: [
      { key: 'cardNumber', header: 'Card Number', type: 'string' },
      { key: 'customerName', header: 'Customer Name', type: 'string' },
      { key: 'balance', header: 'Balance', type: 'currency' },
      { key: 'isActive', header: 'Active', type: 'boolean' },
      { key: 'lastUsed', header: 'Last Used', type: 'date' },
    ],
    members: [
      { key: 'name', header: 'Name', type: 'string' },
      { key: 'email', header: 'Email', type: 'string' },
      { key: 'phone', header: 'Phone', type: 'string' },
      { key: 'membershipType', header: 'Membership Type', type: 'string' },
      { key: 'points', header: 'Points', type: 'number' },
      { key: 'joinDate', header: 'Join Date', type: 'date' },
      { key: 'expiryDate', header: 'Expiry Date', type: 'date' },
      { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
    ],
    maintenance: [
      { key: 'laneId', header: 'Lane', type: 'string' },
      { key: 'type', header: 'Type', type: 'string' },
      { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
      { key: 'status', header: 'Status', type: 'string' },
      { key: 'technicianName', header: 'Technician', type: 'string' },
      { key: 'notes', header: 'Notes', type: 'string' },
    ],
    revenue: [
      { key: 'date', header: 'Date', type: 'date' },
      { key: 'category', header: 'Category', type: 'string' },
      { key: 'amount', header: 'Amount', type: 'currency' },
      { key: 'description', header: 'Description', type: 'string' },
    ],
  };

  // Get current data based on active tab
  const getCurrentData = (): any[] => {
    switch (activeTab) {
      case 'lanes': return lanes;
      case 'reservations': return reservations;
      case 'leagues': return leagues;
      case 'shoes': return shoes;
      case 'parties': return partyPackages;
      case 'cosmic': return cosmicSessions;
      case 'proshop': return proShopItems;
      case 'drilling': return drillingServices;
      case 'snackbar': return snackBarItems;
      case 'arcade': return arcadeCards;
      case 'members': return members;
      case 'maintenance': return maintenance;
      case 'revenue': return revenue;
      default: return [];
    }
  };

  // Get tab label for filename
  const getTabLabel = (): string => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab?.label || 'data';
  };

  // Export handlers - use the hook's export functions
  const handleExportCSV = () => {
    exportCSV({ filename: `bowling-${getTabLabel().toLowerCase()}` });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: `bowling-${getTabLabel().toLowerCase()}` });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: `bowling-${getTabLabel().toLowerCase()}` });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: `bowling-${getTabLabel().toLowerCase()}`,
      title: `Bowling Alley - ${getTabLabel()}`
    });
  };

  const handlePrint = () => {
    print(`Bowling Alley - ${getTabLabel()}`);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return await copyToClipboard('tab');
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const buttonPrimary = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20";

  const buttonSecondary = `px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  // Lane Management
  const [laneForm, setLaneForm] = useState({ number: 0, status: 'available' as Lane['status'], hourlyRate: 25, cosmicEnabled: false });

  const handleUpdateLane = (laneId: string, updates: Partial<Lane>) => {
    setLanes(prev => prev.map(lane => lane.id === laneId ? { ...lane, ...updates } : lane));
  };

  // Reservation Management
  const [reservationForm, setReservationForm] = useState<Partial<Reservation>>({
    customerName: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    numberOfPlayers: 1,
    isPartyBooking: false,
    status: 'pending',
  });

  const handleAddReservation = () => {
    if (!reservationForm.customerName || !reservationForm.laneId || !reservationForm.date || !reservationForm.startTime) return;

    const newReservation: Reservation = {
      id: generateId(),
      laneId: reservationForm.laneId!,
      customerName: reservationForm.customerName!,
      phone: reservationForm.phone || '',
      date: reservationForm.date!,
      startTime: reservationForm.startTime!,
      endTime: reservationForm.endTime || '',
      numberOfPlayers: reservationForm.numberOfPlayers || 1,
      isPartyBooking: reservationForm.isPartyBooking || false,
      partyPackage: reservationForm.partyPackage,
      status: 'pending',
      totalAmount: reservationForm.totalAmount || 0,
    };

    setReservations(prev => [...prev, newReservation]);
    setReservationForm({
      customerName: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      numberOfPlayers: 1,
      isPartyBooking: false,
      status: 'pending',
    });
    setShowForm(false);
  };

  const handleDeleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  // League Management
  const [leagueForm, setLeagueForm] = useState<Partial<League>>({
    name: '',
    season: '',
    dayOfWeek: 'Monday',
    startTime: '',
    isActive: true,
  });

  const handleAddLeague = () => {
    if (!leagueForm.name || !leagueForm.season) return;

    const newLeague: League = {
      id: generateId(),
      name: leagueForm.name!,
      season: leagueForm.season!,
      dayOfWeek: leagueForm.dayOfWeek || 'Monday',
      startTime: leagueForm.startTime || '',
      teams: [],
      isActive: true,
    };

    setLeagues(prev => [...prev, newLeague]);
    setLeagueForm({ name: '', season: '', dayOfWeek: 'Monday', startTime: '', isActive: true });
    setShowForm(false);
  };

  // Team Management
  const [teamForm, setTeamForm] = useState<Partial<Team>>({
    name: '',
    leagueId: '',
    members: [],
  });

  const handleAddTeam = () => {
    if (!teamForm.name || !teamForm.leagueId) return;

    const newTeam: Team = {
      id: generateId(),
      name: teamForm.name!,
      leagueId: teamForm.leagueId!,
      members: teamForm.members || [],
      wins: 0,
      losses: 0,
      totalPins: 0,
      averageScore: 0,
    };

    setTeams(prev => [...prev, newTeam]);
    setLeagues(prev => prev.map(l => l.id === teamForm.leagueId ? { ...l, teams: [...l.teams, newTeam.id] } : l));
    setTeamForm({ name: '', leagueId: '', members: [] });
  };

  // Pro Shop Management
  const [proShopForm, setProShopForm] = useState<Partial<ProShopItem>>({
    name: '',
    category: 'balls',
    price: 0,
    quantity: 0,
    sku: '',
  });

  const handleAddProShopItem = () => {
    if (!proShopForm.name || !proShopForm.sku) return;

    const newItem: ProShopItem = {
      id: generateId(),
      name: proShopForm.name!,
      category: proShopForm.category || 'balls',
      price: proShopForm.price || 0,
      quantity: proShopForm.quantity || 0,
      sku: proShopForm.sku!,
    };

    setProShopItems(prev => [...prev, newItem]);
    setProShopForm({ name: '', category: 'balls', price: 0, quantity: 0, sku: '' });
    setShowForm(false);
  };

  // Drilling Service Management
  const [drillingForm, setDrillingForm] = useState<Partial<DrillingService>>({
    customerName: '',
    ballType: '',
    drillingPattern: '',
    status: 'pending',
    price: 0,
    notes: '',
  });

  const handleAddDrillingService = () => {
    if (!drillingForm.customerName || !drillingForm.ballType) return;

    const newService: DrillingService = {
      id: generateId(),
      customerName: drillingForm.customerName!,
      ballType: drillingForm.ballType!,
      drillingPattern: drillingForm.drillingPattern || '',
      status: 'pending',
      dateReceived: new Date().toISOString().split('T')[0],
      price: drillingForm.price || 0,
      notes: drillingForm.notes || '',
    };

    setDrillingServices(prev => [...prev, newService]);
    setDrillingForm({ customerName: '', ballType: '', drillingPattern: '', status: 'pending', price: 0, notes: '' });
    setShowForm(false);
  };

  // Snack Bar Management
  const [snackForm, setSnackForm] = useState<Partial<SnackBarItem>>({
    name: '',
    category: 'food',
    price: 0,
    quantity: 0,
    lowStockThreshold: 10,
  });

  const handleAddSnackItem = () => {
    if (!snackForm.name) return;

    const newItem: SnackBarItem = {
      id: generateId(),
      name: snackForm.name!,
      category: snackForm.category || 'food',
      price: snackForm.price || 0,
      quantity: snackForm.quantity || 0,
      lowStockThreshold: snackForm.lowStockThreshold || 10,
    };

    setSnackBarItems(prev => [...prev, newItem]);
    setSnackForm({ name: '', category: 'food', price: 0, quantity: 0, lowStockThreshold: 10 });
    setShowForm(false);
  };

  // Arcade Card Management
  const [arcadeForm, setArcadeForm] = useState<Partial<ArcadeCard>>({
    cardNumber: '',
    balance: 0,
    customerName: '',
    isActive: true,
  });

  const handleAddArcadeCard = () => {
    if (!arcadeForm.cardNumber) return;

    const newCard: ArcadeCard = {
      id: generateId(),
      cardNumber: arcadeForm.cardNumber!,
      balance: arcadeForm.balance || 0,
      customerName: arcadeForm.customerName,
      isActive: true,
    };

    setArcadeCards(prev => [...prev, newCard]);
    setArcadeForm({ cardNumber: '', balance: 0, customerName: '', isActive: true });
    setShowForm(false);
  };

  // Member Management
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    name: '',
    email: '',
    phone: '',
    membershipType: 'basic',
  });

  const handleAddMember = () => {
    if (!memberForm.name || !memberForm.email) return;

    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const newMember: Member = {
      id: generateId(),
      name: memberForm.name!,
      email: memberForm.email!,
      phone: memberForm.phone || '',
      membershipType: memberForm.membershipType || 'basic',
      points: 0,
      joinDate: today.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      totalSpent: 0,
    };

    setMembers(prev => [...prev, newMember]);
    setMemberForm({ name: '', email: '', phone: '', membershipType: 'basic' });
    setShowForm(false);
  };

  // Maintenance Management
  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceSchedule>>({
    laneId: '',
    type: 'general',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    notes: '',
    technicianName: '',
  });

  const handleAddMaintenance = () => {
    if (!maintenanceForm.laneId || !maintenanceForm.scheduledDate) return;

    const newMaintenance: MaintenanceSchedule = {
      id: generateId(),
      laneId: maintenanceForm.laneId!,
      type: maintenanceForm.type || 'general',
      scheduledDate: maintenanceForm.scheduledDate!,
      status: 'scheduled',
      notes: maintenanceForm.notes || '',
      technicianName: maintenanceForm.technicianName || '',
    };

    setMaintenance(prev => [...prev, newMaintenance]);
    setMaintenanceForm({ laneId: '', type: 'general', scheduledDate: new Date().toISOString().split('T')[0], status: 'scheduled', notes: '', technicianName: '' });
    setShowForm(false);
  };

  // Revenue Management
  const [revenueForm, setRevenueForm] = useState<Partial<RevenueRecord>>({
    date: new Date().toISOString().split('T')[0],
    category: 'lane-rental',
    amount: 0,
    description: '',
  });

  const handleAddRevenue = () => {
    if (!revenueForm.amount || !revenueForm.category) return;

    const newRevenue: RevenueRecord = {
      id: generateId(),
      date: revenueForm.date || new Date().toISOString().split('T')[0],
      laneId: revenueForm.laneId,
      category: revenueForm.category!,
      amount: revenueForm.amount!,
      description: revenueForm.description || '',
    };

    setRevenue(prev => [...prev, newRevenue]);
    setRevenueForm({ date: new Date().toISOString().split('T')[0], category: 'lane-rental', amount: 0, description: '' });
    setShowForm(false);
  };

  // Render functions for each tab
  const renderLanesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>Available</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>{stats.availableLanes}</p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>Occupied</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>{stats.occupiedLanes}</p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}>Reserved</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>{lanes.filter(l => l.status === 'reserved').length}</p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Maintenance</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>{lanes.filter(l => l.status === 'maintenance').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
        {lanes.map(lane => (
          <div
            key={lane.id}
            className={`relative p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
              lane.status === 'available' ? (theme === 'dark' ? 'bg-green-900/50 border-green-500' : 'bg-green-100 border-green-400') :
              lane.status === 'occupied' ? (theme === 'dark' ? 'bg-red-900/50 border-red-500' : 'bg-red-100 border-red-400') :
              lane.status === 'reserved' ? (theme === 'dark' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-yellow-100 border-yellow-400') :
              (theme === 'dark' ? 'bg-gray-700 border-gray-500' : 'bg-gray-200 border-gray-400')
            } border-2`}
            onClick={() => {
              const statuses: Lane['status'][] = ['available', 'occupied', 'reserved', 'maintenance'];
              const currentIndex = statuses.indexOf(lane.status);
              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
              handleUpdateLane(lane.id, { status: nextStatus });
            }}
          >
            <p className={`text-center font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lane.number}</p>
            {lane.cosmicEnabled && (
              <Sparkles className="absolute top-1 right-1 w-3 h-3 text-purple-500" />
            )}
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Click on a lane to cycle through statuses: Available - Occupied - Reserved - Maintenance
        </p>
      </div>
    </div>
  );

  const renderReservationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Today's Reservations: {stats.todayReservations}
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Reservation
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={reservationForm.customerName || ''}
              onChange={(e) => setReservationForm(prev => ({ ...prev, customerName: e.target.value }))}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={reservationForm.phone || ''}
              onChange={(e) => setReservationForm(prev => ({ ...prev, phone: e.target.value }))}
              className={inputClass}
            />
            <select
              value={reservationForm.laneId || ''}
              onChange={(e) => setReservationForm(prev => ({ ...prev, laneId: e.target.value }))}
              className={selectClass}
            >
              <option value="">Select Lane</option>
              {lanes.filter(l => l.status === 'available').map(lane => (
                <option key={lane.id} value={lane.id}>Lane {lane.number}</option>
              ))}
            </select>
            <input
              type="date"
              value={reservationForm.date || ''}
              onChange={(e) => setReservationForm(prev => ({ ...prev, date: e.target.value }))}
              className={inputClass}
            />
            <input
              type="time"
              placeholder="Start Time"
              value={reservationForm.startTime || ''}
              onChange={(e) => setReservationForm(prev => ({ ...prev, startTime: e.target.value }))}
              className={inputClass}
            />
            <input
              type="time"
              placeholder="End Time"
              value={reservationForm.endTime || ''}
              onChange={(e) => setReservationForm(prev => ({ ...prev, endTime: e.target.value }))}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Number of Players"
              value={reservationForm.numberOfPlayers || 1}
              onChange={(e) => setReservationForm(prev => ({ ...prev, numberOfPlayers: parseInt(e.target.value) }))}
              className={inputClass}
              min={1}
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={reservationForm.totalAmount || 0}
              onChange={(e) => setReservationForm(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) }))}
              className={inputClass}
              min={0}
              step={0.01}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={reservationForm.isPartyBooking || false}
                onChange={(e) => setReservationForm(prev => ({ ...prev, isPartyBooking: e.target.checked }))}
                className="rounded"
              />
              Party Booking
            </label>
            {reservationForm.isPartyBooking && (
              <select
                value={reservationForm.partyPackage || ''}
                onChange={(e) => setReservationForm(prev => ({ ...prev, partyPackage: e.target.value }))}
                className={selectClass}
              >
                <option value="">Select Package</option>
                {partyPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} - ${pkg.price}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddReservation} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reservations.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No reservations yet. Add your first reservation above.
          </p>
        ) : (
          reservations.map(res => {
            const lane = lanes.find(l => l.id === res.laneId);
            return (
              <div key={res.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {res.customerName} - Lane {lane?.number || 'N/A'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {res.date} | {res.startTime} - {res.endTime} | {res.numberOfPlayers} players
                    </p>
                    {res.isPartyBooking && (
                      <span className="inline-block px-2 py-1 mt-1 text-xs bg-purple-500 text-white rounded">{t('tools.bowlingAlley.party', 'Party')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      res.status === 'confirmed' ? 'bg-green-500 text-white' :
                      res.status === 'pending' ? 'bg-yellow-500 text-white' :
                      res.status === 'completed' ? 'bg-blue-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {res.status}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      ${res.totalAmount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteReservation(res.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderLeaguesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Active Leagues: {stats.activeLeagues}
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add League
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.leagueName', 'League Name')}
              value={leagueForm.name || ''}
              onChange={(e) => setLeagueForm(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.seasonEGWinter2024', 'Season (e.g., Winter 2024)')}
              value={leagueForm.season || ''}
              onChange={(e) => setLeagueForm(prev => ({ ...prev, season: e.target.value }))}
              className={inputClass}
            />
            <select
              value={leagueForm.dayOfWeek || 'Monday'}
              onChange={(e) => setLeagueForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
              className={selectClass}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              placeholder={t('tools.bowlingAlley.startTime', 'Start Time')}
              value={leagueForm.startTime || ''}
              onChange={(e) => setLeagueForm(prev => ({ ...prev, startTime: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddLeague} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leagues.map(league => (
          <div key={league.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{league.name}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {league.season} | {league.dayOfWeek}s at {league.startTime}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${league.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {league.isActive ? t('tools.bowlingAlley.active', 'Active') : t('tools.bowlingAlley.inactive', 'Inactive')}
              </span>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Teams: {teams.filter(t => t.leagueId === league.id).length}
            </p>
          </div>
        ))}
      </div>

      {leagues.length > 0 && (
        <div className="mt-6">
          <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.bowlingAlley.teamsStandings', 'Teams & Standings')}</h4>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder={t('tools.bowlingAlley.teamName', 'Team Name')}
                value={teamForm.name || ''}
                onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass}
              />
              <select
                value={teamForm.leagueId || ''}
                onChange={(e) => setTeamForm(prev => ({ ...prev, leagueId: e.target.value }))}
                className={selectClass}
              >
                <option value="">{t('tools.bowlingAlley.selectLeague', 'Select League')}</option>
                {leagues.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <button onClick={handleAddTeam} className={buttonPrimary}>
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {teams.map(team => {
              const league = leagues.find(l => l.id === team.leagueId);
              return (
                <div key={team.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{team.name}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{league?.name}</p>
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      W: {team.wins} | L: {team.losses} | Avg: {team.averageScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderShoesTab = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.bowlingAlley.shoeRentalInventory', 'Shoe Rental Inventory')}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {shoes.map(shoe => (
          <div key={shoe.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <p className={`text-center font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Size {shoe.size}
            </p>
            <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {shoe.available} / {shoe.quantity}
            </p>
            <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              ${shoe.pricePerPair}/pair
            </p>
            <div className="flex justify-center gap-1 mt-2">
              <button
                onClick={() => setShoes(prev => prev.map(s => s.id === shoe.id ? { ...s, available: Math.max(0, s.available - 1) } : s))}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                disabled={shoe.available === 0}
              >
                -
              </button>
              <button
                onClick={() => setShoes(prev => prev.map(s => s.id === shoe.id ? { ...s, available: Math.min(s.quantity, s.available + 1) } : s))}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                disabled={shoe.available === shoe.quantity}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPartiesTab = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.bowlingAlley.partyPackages', 'Party Packages')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partyPackages.map(pkg => (
          <div key={pkg.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</h4>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${pkg.price}</span>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Duration: {pkg.duration} hours | Max Guests: {pkg.maxGuests}
            </p>
            <div className="mt-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bowlingAlley.includes', 'Includes:')}</p>
              <ul className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {pkg.includes.map((item, idx) => (
                  <li key={idx}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.bowlingAlley.partyBookings', 'Party Bookings')}</h4>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {reservations.filter(r => r.isPartyBooking).length} party reservations
        </p>
      </div>
    </div>
  );

  const renderCosmicTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.bowlingAlley.cosmicGlowBowlingSchedule', 'Cosmic/Glow Bowling Schedule')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cosmicSessions.map(session => (
          <div key={session.id} className={`p-4 rounded-lg border ${
            session.isActive
              ? (theme === 'dark' ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-400')
              : (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Moon className={`w-5 h-5 ${session.isActive ? 'text-purple-500' : 'text-gray-400'}`} />
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.dayOfWeek}</h4>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {session.startTime} - {session.endTime}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              {session.priceMultiplier}x regular price
            </p>
            <button
              onClick={() => setCosmicSessions(prev => prev.map(s => s.id === session.id ? { ...s, isActive: !s.isActive } : s))}
              className={`mt-2 px-3 py-1 text-xs rounded ${session.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
            >
              {session.isActive ? t('tools.bowlingAlley.active2', 'Active') : t('tools.bowlingAlley.inactive2', 'Inactive')}
            </button>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <Sparkles className="inline w-4 h-4 mr-1 text-purple-500" />
          {lanes.filter(l => l.cosmicEnabled).length} lanes are cosmic-enabled
        </p>
      </div>
    </div>
  );

  const renderProShopTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.bowlingAlley.proShopInventory', 'Pro Shop Inventory')}
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.itemName', 'Item Name')}
              value={proShopForm.name || ''}
              onChange={(e) => setProShopForm(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass}
            />
            <select
              value={proShopForm.category || 'balls'}
              onChange={(e) => setProShopForm(prev => ({ ...prev, category: e.target.value as ProShopItem['category'] }))}
              className={selectClass}
            >
              <option value="balls">{t('tools.bowlingAlley.bowlingBalls', 'Bowling Balls')}</option>
              <option value="bags">{t('tools.bowlingAlley.bags', 'Bags')}</option>
              <option value="shoes">{t('tools.bowlingAlley.shoes', 'Shoes')}</option>
              <option value="accessories">{t('tools.bowlingAlley.accessories', 'Accessories')}</option>
              <option value="apparel">{t('tools.bowlingAlley.apparel', 'Apparel')}</option>
            </select>
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.sku', 'SKU')}
              value={proShopForm.sku || ''}
              onChange={(e) => setProShopForm(prev => ({ ...prev, sku: e.target.value }))}
              className={inputClass}
            />
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.price', 'Price')}
              value={proShopForm.price || 0}
              onChange={(e) => setProShopForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className={inputClass}
              min={0}
              step={0.01}
            />
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.quantity', 'Quantity')}
              value={proShopForm.quantity || 0}
              onChange={(e) => setProShopForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className={inputClass}
              min={0}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddProShopItem} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proShopItems.map(item => (
          <div key={item.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>SKU: {item.sku}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded capitalize ${
                item.category === 'balls' ? 'bg-blue-500 text-white' :
                item.category === 'bags' ? 'bg-green-500 text-white' :
                item.category === 'shoes' ? 'bg-yellow-500 text-white' :
                item.category === 'accessories' ? 'bg-purple-500 text-white' :
                'bg-pink-500 text-white'
              }`}>
                {item.category}
              </span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${item.price.toFixed(2)}</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Qty: {item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {proShopItems.length === 0 && (
        <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('tools.bowlingAlley.noItemsInProShop', 'No items in pro shop inventory. Add your first item above.')}
        </p>
      )}
    </div>
  );

  const renderDrillingTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Ball Drilling Services ({stats.pendingDrilling} pending)
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.customerName', 'Customer Name')}
              value={drillingForm.customerName || ''}
              onChange={(e) => setDrillingForm(prev => ({ ...prev, customerName: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.ballTypeModel', 'Ball Type/Model')}
              value={drillingForm.ballType || ''}
              onChange={(e) => setDrillingForm(prev => ({ ...prev, ballType: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.drillingPattern', 'Drilling Pattern')}
              value={drillingForm.drillingPattern || ''}
              onChange={(e) => setDrillingForm(prev => ({ ...prev, drillingPattern: e.target.value }))}
              className={inputClass}
            />
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.price2', 'Price')}
              value={drillingForm.price || 0}
              onChange={(e) => setDrillingForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className={inputClass}
              min={0}
              step={0.01}
            />
            <textarea
              placeholder={t('tools.bowlingAlley.notes', 'Notes')}
              value={drillingForm.notes || ''}
              onChange={(e) => setDrillingForm(prev => ({ ...prev, notes: e.target.value }))}
              className={inputClass}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddDrillingService} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {drillingServices.map(service => (
          <div key={service.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{service.customerName}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {service.ballType} | {service.drillingPattern}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Received: {service.dateReceived}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={service.status}
                  onChange={(e) => setDrillingServices(prev => prev.map(s => s.id === service.id ? { ...s, status: e.target.value as DrillingService['status'] } : s))}
                  className={`text-xs px-2 py-1 rounded ${
                    service.status === 'pending' ? 'bg-yellow-500 text-white' :
                    service.status === 'in-progress' ? 'bg-blue-500 text-white' :
                    service.status === 'completed' ? 'bg-green-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}
                >
                  <option value="pending">{t('tools.bowlingAlley.pending', 'Pending')}</option>
                  <option value="in-progress">{t('tools.bowlingAlley.inProgress', 'In Progress')}</option>
                  <option value="completed">{t('tools.bowlingAlley.completed', 'Completed')}</option>
                  <option value="ready-for-pickup">{t('tools.bowlingAlley.readyForPickup', 'Ready for Pickup')}</option>
                </select>
                <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  ${service.price.toFixed(2)}
                </span>
              </div>
            </div>
            {service.notes && (
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Notes: {service.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSnackBarTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Snack Bar Inventory
          {stats.lowStockItems > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded">
              {stats.lowStockItems} low stock
            </span>
          )}
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.itemName2', 'Item Name')}
              value={snackForm.name || ''}
              onChange={(e) => setSnackForm(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass}
            />
            <select
              value={snackForm.category || 'food'}
              onChange={(e) => setSnackForm(prev => ({ ...prev, category: e.target.value as SnackBarItem['category'] }))}
              className={selectClass}
            >
              <option value="food">{t('tools.bowlingAlley.food', 'Food')}</option>
              <option value="beverage">{t('tools.bowlingAlley.beverage', 'Beverage')}</option>
              <option value="snack">{t('tools.bowlingAlley.snack', 'Snack')}</option>
            </select>
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.price3', 'Price')}
              value={snackForm.price || 0}
              onChange={(e) => setSnackForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className={inputClass}
              min={0}
              step={0.01}
            />
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.quantity2', 'Quantity')}
              value={snackForm.quantity || 0}
              onChange={(e) => setSnackForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className={inputClass}
              min={0}
            />
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.lowStockThreshold', 'Low Stock Threshold')}
              value={snackForm.lowStockThreshold || 10}
              onChange={(e) => setSnackForm(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) }))}
              className={inputClass}
              min={0}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddSnackItem} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snackBarItems.map(item => (
          <div key={item.id} className={`p-4 rounded-lg border ${
            item.quantity <= item.lowStockThreshold
              ? (theme === 'dark' ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-400')
              : (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')
          }`}>
            <div className="flex justify-between items-start">
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
              <span className={`px-2 py-1 text-xs rounded capitalize ${
                item.category === 'food' ? 'bg-orange-500 text-white' :
                item.category === 'beverage' ? 'bg-blue-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {item.category}
              </span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${item.price.toFixed(2)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSnackBarItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                >
                  -
                </button>
                <span className={`${item.quantity <= item.lowStockThreshold ? 'text-red-500 font-bold' : (theme === 'dark' ? 'text-gray-300' : 'text-gray-600')}`}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => setSnackBarItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 10 } : i))}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  +10
                </button>
              </div>
            </div>
            {item.quantity <= item.lowStockThreshold && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Low stock!
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderArcadeTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.bowlingAlley.arcadeCardsTokens', 'Arcade Cards & Tokens')}
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> New Card
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.cardNumber', 'Card Number')}
              value={arcadeForm.cardNumber || ''}
              onChange={(e) => setArcadeForm(prev => ({ ...prev, cardNumber: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.customerNameOptional', 'Customer Name (optional)')}
              value={arcadeForm.customerName || ''}
              onChange={(e) => setArcadeForm(prev => ({ ...prev, customerName: e.target.value }))}
              className={inputClass}
            />
            <input
              type="number"
              placeholder={t('tools.bowlingAlley.initialBalance', 'Initial Balance')}
              value={arcadeForm.balance || 0}
              onChange={(e) => setArcadeForm(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
              className={inputClass}
              min={0}
              step={0.01}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddArcadeCard} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arcadeCards.map(card => (
          <div key={card.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{card.cardNumber}</p>
                {card.customerName && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{card.customerName}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${card.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {card.isActive ? t('tools.bowlingAlley.active3', 'Active') : t('tools.bowlingAlley.inactive3', 'Inactive')}
              </span>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                ${card.balance.toFixed(2)}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setArcadeCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance + 10 } : c))}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  +$10
                </button>
                <button
                  onClick={() => setArcadeCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance + 25 } : c))}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  +$25
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Membership & Loyalty ({stats.totalMembers} members)
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.fullName', 'Full Name')}
              value={memberForm.name || ''}
              onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass}
            />
            <input
              type="email"
              placeholder={t('tools.bowlingAlley.email', 'Email')}
              value={memberForm.email || ''}
              onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder={t('tools.bowlingAlley.phone', 'Phone')}
              value={memberForm.phone || ''}
              onChange={(e) => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
              className={inputClass}
            />
            <select
              value={memberForm.membershipType || 'basic'}
              onChange={(e) => setMemberForm(prev => ({ ...prev, membershipType: e.target.value as Member['membershipType'] }))}
              className={selectClass}
            >
              <option value="basic">{t('tools.bowlingAlley.basic', 'Basic')}</option>
              <option value="premium">{t('tools.bowlingAlley.premium', 'Premium')}</option>
              <option value="vip">{t('tools.bowlingAlley.vip', 'VIP')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddMember} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{member.name}</p>
                  <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                    member.membershipType === 'vip' ? 'bg-yellow-500 text-white' :
                    member.membershipType === 'premium' ? 'bg-purple-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {member.membershipType}
                  </span>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Member since: {member.joinDate} | Expires: {member.expiryDate}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {member.points} pts
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total: ${member.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Lane Maintenance Schedule ({stats.scheduledMaintenance} scheduled)
        </h3>
        <button onClick={() => setShowForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Schedule Maintenance
        </button>
      </div>

      {showForm && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={maintenanceForm.laneId || ''}
              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, laneId: e.target.value }))}
              className={selectClass}
            >
              <option value="">{t('tools.bowlingAlley.selectLane', 'Select Lane')}</option>
              {lanes.map(lane => (
                <option key={lane.id} value={lane.id}>Lane {lane.number}</option>
              ))}
            </select>
            <select
              value={maintenanceForm.type || 'general'}
              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, type: e.target.value as MaintenanceSchedule['type'] }))}
              className={selectClass}
            >
              <option value="oil">{t('tools.bowlingAlley.oilChange', 'Oil Change')}</option>
              <option value="pin-replacement">{t('tools.bowlingAlley.pinReplacement', 'Pin Replacement')}</option>
              <option value="ball-return">{t('tools.bowlingAlley.ballReturnService', 'Ball Return Service')}</option>
              <option value="lane-repair">{t('tools.bowlingAlley.laneRepair', 'Lane Repair')}</option>
              <option value="general">{t('tools.bowlingAlley.generalMaintenance', 'General Maintenance')}</option>
            </select>
            <input
              type="date"
              value={maintenanceForm.scheduledDate || ''}
              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder={t('tools.bowlingAlley.technicianName', 'Technician Name')}
              value={maintenanceForm.technicianName || ''}
              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, technicianName: e.target.value }))}
              className={inputClass}
            />
            <textarea
              placeholder={t('tools.bowlingAlley.notes2', 'Notes')}
              value={maintenanceForm.notes || ''}
              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
              className={inputClass}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddMaintenance} className={buttonPrimary}>
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className={buttonSecondary}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {maintenance.map(m => {
          const lane = lanes.find(l => l.id === m.laneId);
          return (
            <div key={m.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Lane {lane?.number} - {m.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Scheduled: {m.scheduledDate} | Tech: {m.technicianName || 'Unassigned'}
                  </p>
                </div>
                <select
                  value={m.status}
                  onChange={(e) => setMaintenance(prev => prev.map(item => item.id === m.id ? { ...item, status: e.target.value as MaintenanceSchedule['status'] } : item))}
                  className={`text-xs px-2 py-1 rounded ${
                    m.status === 'scheduled' ? 'bg-yellow-500 text-white' :
                    m.status === 'in-progress' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}
                >
                  <option value="scheduled">{t('tools.bowlingAlley.scheduled', 'Scheduled')}</option>
                  <option value="in-progress">{t('tools.bowlingAlley.inProgress2', 'In Progress')}</option>
                  <option value="completed">{t('tools.bowlingAlley.completed2', 'Completed')}</option>
                </select>
              </div>
              {m.notes && (
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Notes: {m.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRevenueTab = () => {
    const revenueByCategory = useMemo(() => {
      const categories: Record<string, number> = {};
      revenue.forEach(r => {
        categories[r.category] = (categories[r.category] || 0) + r.amount;
      });
      return categories;
    }, [revenue]);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>{t('tools.bowlingAlley.todaySRevenue', 'Today\'s Revenue')}</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
              ${stats.todayRevenue.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.bowlingAlley.monthlyRevenue', 'Monthly Revenue')}</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
              ${stats.monthlyRevenue.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.bowlingAlley.totalRecords', 'Total Records')}</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
              {revenue.length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>{t('tools.bowlingAlley.categories', 'Categories')}</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'}`}>
              {Object.keys(revenueByCategory).length}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.bowlingAlley.revenueRecords', 'Revenue Records')}
          </h3>
          <button onClick={() => setShowForm(true)} className={buttonPrimary}>
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>

        {showForm && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="date"
                value={revenueForm.date || ''}
                onChange={(e) => setRevenueForm(prev => ({ ...prev, date: e.target.value }))}
                className={inputClass}
              />
              <select
                value={revenueForm.category || 'lane-rental'}
                onChange={(e) => setRevenueForm(prev => ({ ...prev, category: e.target.value as RevenueRecord['category'] }))}
                className={selectClass}
              >
                <option value="lane-rental">{t('tools.bowlingAlley.laneRental', 'Lane Rental')}</option>
                <option value="shoe-rental">{t('tools.bowlingAlley.shoeRental', 'Shoe Rental')}</option>
                <option value="pro-shop">{t('tools.bowlingAlley.proShop', 'Pro Shop')}</option>
                <option value="snack-bar">{t('tools.bowlingAlley.snackBar', 'Snack Bar')}</option>
                <option value="arcade">{t('tools.bowlingAlley.arcade', 'Arcade')}</option>
                <option value="party">{t('tools.bowlingAlley.partyBooking', 'Party Booking')}</option>
                <option value="league">{t('tools.bowlingAlley.leagueFees', 'League Fees')}</option>
                <option value="drilling">{t('tools.bowlingAlley.drillingService', 'Drilling Service')}</option>
              </select>
              <input
                type="number"
                placeholder={t('tools.bowlingAlley.amount', 'Amount')}
                value={revenueForm.amount || 0}
                onChange={(e) => setRevenueForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className={inputClass}
                min={0}
                step={0.01}
              />
              <input
                type="text"
                placeholder={t('tools.bowlingAlley.description', 'Description')}
                value={revenueForm.description || ''}
                onChange={(e) => setRevenueForm(prev => ({ ...prev, description: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddRevenue} className={buttonPrimary}>
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setShowForm(false)} className={buttonSecondary}>
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {Object.keys(revenueByCategory).length > 0 && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.bowlingAlley.revenueByCategory', 'Revenue by Category')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(revenueByCategory).map(([category, amount]) => (
                <div key={category} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                  <p className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {category.replace('-', ' ')}
                  </p>
                  <p className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    ${amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {revenue.slice().reverse().slice(0, 20).map(r => (
            <div key={r.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`px-2 py-0.5 text-xs rounded capitalize mr-2 ${
                    r.category === 'lane-rental' ? 'bg-blue-500 text-white' :
                    r.category === 'shoe-rental' ? 'bg-green-500 text-white' :
                    r.category === 'pro-shop' ? 'bg-purple-500 text-white' :
                    r.category === 'snack-bar' ? 'bg-orange-500 text-white' :
                    r.category === 'arcade' ? 'bg-pink-500 text-white' :
                    r.category === 'party' ? 'bg-yellow-500 text-white' :
                    r.category === 'league' ? 'bg-indigo-500 text-white' :
                    'bg-teal-500 text-white'
                  }`}>
                    {r.category.replace('-', ' ')}
                  </span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {r.description || 'No description'}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    ${r.amount.toFixed(2)}
                  </span>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{r.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lanes': return renderLanesTab();
      case 'reservations': return renderReservationsTab();
      case 'leagues': return renderLeaguesTab();
      case 'shoes': return renderShoesTab();
      case 'parties': return renderPartiesTab();
      case 'cosmic': return renderCosmicTab();
      case 'proshop': return renderProShopTab();
      case 'drilling': return renderDrillingTab();
      case 'snackbar': return renderSnackBarTab();
      case 'arcade': return renderArcadeTab();
      case 'members': return renderMembersTab();
      case 'maintenance': return renderMaintenanceTab();
      case 'revenue': return renderRevenueTab();
      default: return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.bowlingAlley.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Circle className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.bowlingAlley.bowlingAlleyManager', 'Bowling Alley Manager')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.bowlingAlley.completeManagementSystemForYour', 'Complete management system for your bowling center')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="bowling-alley" toolName="Bowling Alley" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={theme}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bowlingAlley.availableLanes', 'Available Lanes')}</p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{stats.availableLanes}</p>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bowlingAlley.todaySBookings', 'Today\'s Bookings')}</p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.todayReservations}</p>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bowlingAlley.activeLeagues', 'Active Leagues')}</p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{stats.activeLeagues}</p>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bowlingAlley.members', 'Members')}</p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.totalMembers}</p>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bowlingAlley.todaySRevenue2', 'Today\'s Revenue')}</p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${stats.todayRevenue.toFixed(0)}</p>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bowlingAlley.lowStockItems', 'Low Stock Items')}</p>
          <p className={`text-xl font-bold ${stats.lowStockItems > 0 ? 'text-red-500' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}`}>{stats.lowStockItems}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowForm(false); setEditingId(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.bowlingAlley.aboutBowlingAlleyManager', 'About Bowling Alley Manager')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          A comprehensive management system for bowling centers. Track lanes, reservations, leagues, shoe rentals,
          party bookings, cosmic bowling schedules, pro shop inventory, ball drilling services, snack bar stock,
          arcade cards, memberships, maintenance, and revenue. Data is automatically synced to the cloud when signed in,
          with local storage fallback for offline access.
        </p>
      </div>
    </div>
  );
};

export default BowlingAlleyTool;
