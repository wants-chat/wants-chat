'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Book,
  Plus,
  Search,
  Calendar,
  Users,
  Package,
  Star,
  Clock,
  Gamepad2,
  PartyPopper,
  HandCoins,
  ShoppingCart,
  Award,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Tag,
  User,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Dice1,
  Sword,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ComicBookStoreToolProps {
  uiConfig?: UIConfig;
}

// Types
interface ComicBook {
  id: string;
  title: string;
  issue: string;
  publisher: string;
  condition: string;
  price: number;
  variant: boolean;
  variantType?: string;
  quantity: number;
  gradingNotes?: string;
  dateAdded: string;
}

interface PullListSubscription {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  publisher: string;
  startIssue: string;
  active: boolean;
  notes?: string;
}

interface NewRelease {
  id: string;
  title: string;
  issue: string;
  publisher: string;
  releaseDate: string;
  price: number;
  preOrderCount: number;
  received: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  pullListCount: number;
  storeCredit: number;
  memberSince: string;
  notes?: string;
}

interface SpecialOrder {
  id: string;
  customerId: string;
  customerName: string;
  item: string;
  status: 'pending' | 'ordered' | 'received' | 'notified' | 'completed';
  orderDate: string;
  estimatedArrival?: string;
  price: number;
  deposit: number;
  notes?: string;
}

interface GamingItem {
  id: string;
  name: string;
  category: 'tcg' | 'rpg' | 'miniatures' | 'supplies';
  publisher: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface StoreEvent {
  id: string;
  name: string;
  type: 'release_party' | 'gaming_night' | 'tournament' | 'signing' | 'other';
  date: string;
  time: string;
  description: string;
  maxAttendees?: number;
  currentAttendees: number;
  fee?: number;
}

interface ConsignmentItem {
  id: string;
  consignorName: string;
  consignorContact: string;
  item: string;
  condition: string;
  listPrice: number;
  commission: number;
  dateReceived: string;
  status: 'listed' | 'sold' | 'returned';
  soldDate?: string;
  soldPrice?: number;
}

interface PreOrder {
  id: string;
  customerId: string;
  customerName: string;
  item: string;
  releaseDate: string;
  price: number;
  deposit: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
}

interface CGCSubmission {
  id: string;
  title: string;
  issue: string;
  submissionDate: string;
  estimatedReturn: string;
  status: 'submitted' | 'received_by_cgc' | 'grading' | 'shipped_back' | 'completed';
  grade?: string;
  cost: number;
  customerId?: string;
  customerName?: string;
  notes?: string;
}

type TabType = 'inventory' | 'pullList' | 'releases' | 'customers' | 'specialOrders' | 'gaming' | 'events' | 'consignment' | 'preorders' | 'cgc';

// Combined store data structure for backend sync
interface StoreData {
  id: string;
  inventory: ComicBook[];
  pullList: PullListSubscription[];
  newReleases: NewRelease[];
  customers: Customer[];
  specialOrders: SpecialOrder[];
  gamingItems: GamingItem[];
  events: StoreEvent[];
  consignments: ConsignmentItem[];
  preorders: PreOrder[];
  cgcSubmissions: CGCSubmission[];
}

// Default store data for initial state
const DEFAULT_STORE_DATA: StoreData = {
  id: 'comic-book-store',
  inventory: [],
  pullList: [],
  newReleases: [],
  customers: [],
  specialOrders: [],
  gamingItems: [],
  events: [],
  consignments: [],
  preorders: [],
  cgcSubmissions: [],
};

// Column configuration for the store data (used for sync)
const STORE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

const STORAGE_KEY = 'comic-book-store-data';

const CONDITIONS = ['Mint', 'Near Mint', 'Very Fine', 'Fine', 'Very Good', 'Good', 'Fair', 'Poor'];
const PUBLISHERS = ['Marvel', 'DC Comics', 'Image', 'Dark Horse', 'IDW', 'Boom! Studios', 'Dynamite', 'Valiant', 'Oni Press', 'Aftershock', 'Other'];
const GAMING_CATEGORIES = [
  { value: 'tcg', label: 'Trading Card Games' },
  { value: 'rpg', label: 'Role-Playing Games' },
  { value: 'miniatures', label: 'Miniatures' },
  { value: 'supplies', label: 'Supplies' },
];
const EVENT_TYPES = [
  { value: 'release_party', label: 'Release Party' },
  { value: 'gaming_night', label: 'Gaming Night' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'signing', label: 'Signing Event' },
  { value: 'other', label: 'Other' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configurations for export
const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'issue', header: 'Issue', type: 'string' },
  { key: 'publisher', header: 'Publisher', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'variant', header: 'Variant', type: 'boolean' },
  { key: 'variantType', header: 'Variant Type', type: 'string' },
  { key: 'gradingNotes', header: 'Grading Notes', type: 'string' },
  { key: 'dateAdded', header: 'Date Added', type: 'date' },
];

const PULL_LIST_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'publisher', header: 'Publisher', type: 'string' },
  { key: 'startIssue', header: 'Start Issue', type: 'string' },
  { key: 'active', header: 'Active', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const RELEASES_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'issue', header: 'Issue', type: 'string' },
  { key: 'publisher', header: 'Publisher', type: 'string' },
  { key: 'releaseDate', header: 'Release Date', type: 'date' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'preOrderCount', header: 'Pre-Order Count', type: 'number' },
  { key: 'received', header: 'Received', type: 'boolean' },
];

const CUSTOMERS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'pullListCount', header: 'Pull List Count', type: 'number' },
  { key: 'storeCredit', header: 'Store Credit', type: 'currency' },
  { key: 'memberSince', header: 'Member Since', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const SPECIAL_ORDERS_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'orderDate', header: 'Order Date', type: 'date' },
  { key: 'estimatedArrival', header: 'Estimated Arrival', type: 'date' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'deposit', header: 'Deposit', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const GAMING_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'publisher', header: 'Publisher', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const EVENTS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Event Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'maxAttendees', header: 'Max Attendees', type: 'number' },
  { key: 'currentAttendees', header: 'Current Attendees', type: 'number' },
  { key: 'fee', header: 'Fee', type: 'currency' },
];

const CONSIGNMENT_COLUMNS: ColumnConfig[] = [
  { key: 'consignorName', header: 'Consignor Name', type: 'string' },
  { key: 'consignorContact', header: 'Contact', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'listPrice', header: 'List Price', type: 'currency' },
  { key: 'commission', header: 'Commission %', type: 'number' },
  { key: 'dateReceived', header: 'Date Received', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'soldDate', header: 'Sold Date', type: 'date' },
  { key: 'soldPrice', header: 'Sold Price', type: 'currency' },
];

const PREORDERS_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'releaseDate', header: 'Release Date', type: 'date' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'deposit', header: 'Deposit', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const CGC_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'issue', header: 'Issue', type: 'string' },
  { key: 'submissionDate', header: 'Submission Date', type: 'date' },
  { key: 'estimatedReturn', header: 'Estimated Return', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'grade', header: 'Grade', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const ComicBookStoreTool: React.FC<ComicBookStoreToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use useToolData hook for backend persistence with combined store data
  const {
    data: storeDataArray,
    setData: setStoreDataArray,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyUtil,
    print: printData,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<StoreData>('comic-book-store', [DEFAULT_STORE_DATA], STORE_COLUMNS);

  // Get the store data from the array (we only have one store data object)
  const storeData = storeDataArray[0] || DEFAULT_STORE_DATA;

  // Helper to update store data
  const updateStoreData = (updates: Partial<StoreData>) => {
    setStoreDataArray([{ ...storeData, ...updates }]);
  };

  // Derived state from store data
  const inventory = storeData.inventory;
  const pullList = storeData.pullList;
  const newReleases = storeData.newReleases;
  const customers = storeData.customers;
  const specialOrders = storeData.specialOrders;
  const gamingItems = storeData.gamingItems;
  const events = storeData.events;
  const consignments = storeData.consignments;
  const preorders = storeData.preorders;
  const cgcSubmissions = storeData.cgcSubmissions;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

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

      if (params.tab && ['inventory', 'pullList', 'releases', 'customers', 'specialOrders', 'gaming', 'events', 'consignment', 'preorders', 'cgc'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill comic book title
      if (params.title || params.itemName || params.name) {
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

      // Prefill issue number
      if (params.issueNumber || params.issue) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form state for new items
  const [newComic, setNewComic] = useState<Partial<ComicBook>>({
    title: '',
    issue: '',
    publisher: 'Marvel',
    condition: 'Near Mint',
    price: 0,
    variant: false,
    quantity: 1,
  });

  const [newPullSubscription, setNewPullSubscription] = useState<Partial<PullListSubscription>>({
    customerId: '',
    customerName: '',
    title: '',
    publisher: 'Marvel',
    startIssue: '1',
    active: true,
  });

  const [newRelease, setNewRelease] = useState<Partial<NewRelease>>({
    title: '',
    issue: '',
    publisher: 'Marvel',
    releaseDate: '',
    price: 0,
    preOrderCount: 0,
    received: false,
  });

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    storeCredit: 0,
  });

  const [newSpecialOrder, setNewSpecialOrder] = useState<Partial<SpecialOrder>>({
    customerId: '',
    customerName: '',
    item: '',
    status: 'pending',
    price: 0,
    deposit: 0,
  });

  const [newGamingItem, setNewGamingItem] = useState<Partial<GamingItem>>({
    name: '',
    category: 'tcg',
    publisher: '',
    price: 0,
    quantity: 1,
  });

  const [newEvent, setNewEvent] = useState<Partial<StoreEvent>>({
    name: '',
    type: 'release_party',
    date: '',
    time: '',
    description: '',
    currentAttendees: 0,
  });

  const [newConsignment, setNewConsignment] = useState<Partial<ConsignmentItem>>({
    consignorName: '',
    consignorContact: '',
    item: '',
    condition: 'Near Mint',
    listPrice: 0,
    commission: 20,
    status: 'listed',
  });

  const [newPreorder, setNewPreorder] = useState<Partial<PreOrder>>({
    customerId: '',
    customerName: '',
    item: '',
    releaseDate: '',
    price: 0,
    deposit: 0,
    status: 'pending',
  });

  const [newCGCSubmission, setNewCGCSubmission] = useState<Partial<CGCSubmission>>({
    title: '',
    issue: '',
    submissionDate: '',
    estimatedReturn: '',
    status: 'submitted',
    cost: 0,
  });

  // Filtered data based on search
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    const term = searchTerm.toLowerCase();
    return inventory.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.publisher.toLowerCase().includes(term) ||
        item.issue.toLowerCase().includes(term)
    );
  }, [inventory, searchTerm]);

  const filteredPullList = useMemo(() => {
    if (!searchTerm) return pullList;
    const term = searchTerm.toLowerCase();
    return pullList.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term)
    );
  }, [pullList, searchTerm]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  // CRUD Operations
  const addComic = () => {
    if (!newComic.title || !newComic.issue) return;
    const comic: ComicBook = {
      id: generateId(),
      title: newComic.title || '',
      issue: newComic.issue || '',
      publisher: newComic.publisher || 'Marvel',
      condition: newComic.condition || 'Near Mint',
      price: newComic.price || 0,
      variant: newComic.variant || false,
      variantType: newComic.variantType,
      quantity: newComic.quantity || 1,
      gradingNotes: newComic.gradingNotes,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    updateStoreData({ inventory: [...inventory, comic] });
    setNewComic({
      title: '',
      issue: '',
      publisher: 'Marvel',
      condition: 'Near Mint',
      price: 0,
      variant: false,
      quantity: 1,
    });
    setShowAddForm(false);
  };

  const deleteComic = (id: string) => {
    updateStoreData({ inventory: inventory.filter((item) => item.id !== id) });
  };

  const addPullSubscription = () => {
    if (!newPullSubscription.title || !newPullSubscription.customerName) return;
    const subscription: PullListSubscription = {
      id: generateId(),
      customerId: newPullSubscription.customerId || generateId(),
      customerName: newPullSubscription.customerName || '',
      title: newPullSubscription.title || '',
      publisher: newPullSubscription.publisher || 'Marvel',
      startIssue: newPullSubscription.startIssue || '1',
      active: newPullSubscription.active ?? true,
      notes: newPullSubscription.notes,
    };
    updateStoreData({ pullList: [...pullList, subscription] });
    setNewPullSubscription({
      customerId: '',
      customerName: '',
      title: '',
      publisher: 'Marvel',
      startIssue: '1',
      active: true,
    });
    setShowAddForm(false);
  };

  const deletePullSubscription = (id: string) => {
    updateStoreData({ pullList: pullList.filter((item) => item.id !== id) });
  };

  const addNewRelease = () => {
    if (!newRelease.title || !newRelease.releaseDate) return;
    const release: NewRelease = {
      id: generateId(),
      title: newRelease.title || '',
      issue: newRelease.issue || '1',
      publisher: newRelease.publisher || 'Marvel',
      releaseDate: newRelease.releaseDate || '',
      price: newRelease.price || 0,
      preOrderCount: newRelease.preOrderCount || 0,
      received: newRelease.received || false,
    };
    updateStoreData({ newReleases: [...newReleases, release] });
    setNewRelease({
      title: '',
      issue: '',
      publisher: 'Marvel',
      releaseDate: '',
      price: 0,
      preOrderCount: 0,
      received: false,
    });
    setShowAddForm(false);
  };

  const deleteNewRelease = (id: string) => {
    updateStoreData({ newReleases: newReleases.filter((item) => item.id !== id) });
  };

  const toggleReleaseReceived = (id: string) => {
    updateStoreData({
      newReleases: newReleases.map((item) =>
        item.id === id ? { ...item, received: !item.received } : item
      ),
    });
  };

  const addCustomer = () => {
    if (!newCustomer.name) return;
    const customer: Customer = {
      id: generateId(),
      name: newCustomer.name || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      pullListCount: 0,
      storeCredit: newCustomer.storeCredit || 0,
      memberSince: new Date().toISOString().split('T')[0],
      notes: newCustomer.notes,
    };
    updateStoreData({ customers: [...customers, customer] });
    setNewCustomer({ name: '', email: '', phone: '', storeCredit: 0 });
    setShowAddForm(false);
  };

  const deleteCustomer = (id: string) => {
    updateStoreData({ customers: customers.filter((item) => item.id !== id) });
  };

  const addSpecialOrder = () => {
    if (!newSpecialOrder.item || !newSpecialOrder.customerName) return;
    const order: SpecialOrder = {
      id: generateId(),
      customerId: newSpecialOrder.customerId || generateId(),
      customerName: newSpecialOrder.customerName || '',
      item: newSpecialOrder.item || '',
      status: newSpecialOrder.status || 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      estimatedArrival: newSpecialOrder.estimatedArrival,
      price: newSpecialOrder.price || 0,
      deposit: newSpecialOrder.deposit || 0,
      notes: newSpecialOrder.notes,
    };
    updateStoreData({ specialOrders: [...specialOrders, order] });
    setNewSpecialOrder({
      customerId: '',
      customerName: '',
      item: '',
      status: 'pending',
      price: 0,
      deposit: 0,
    });
    setShowAddForm(false);
  };

  const deleteSpecialOrder = (id: string) => {
    updateStoreData({ specialOrders: specialOrders.filter((item) => item.id !== id) });
  };

  const updateSpecialOrderStatus = (id: string, status: SpecialOrder['status']) => {
    updateStoreData({
      specialOrders: specialOrders.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    });
  };

  const addGamingItem = () => {
    if (!newGamingItem.name) return;
    const item: GamingItem = {
      id: generateId(),
      name: newGamingItem.name || '',
      category: newGamingItem.category || 'tcg',
      publisher: newGamingItem.publisher || '',
      price: newGamingItem.price || 0,
      quantity: newGamingItem.quantity || 1,
      notes: newGamingItem.notes,
    };
    updateStoreData({ gamingItems: [...gamingItems, item] });
    setNewGamingItem({
      name: '',
      category: 'tcg',
      publisher: '',
      price: 0,
      quantity: 1,
    });
    setShowAddForm(false);
  };

  const deleteGamingItem = (id: string) => {
    updateStoreData({ gamingItems: gamingItems.filter((item) => item.id !== id) });
  };

  const addEvent = () => {
    if (!newEvent.name || !newEvent.date) return;
    const event: StoreEvent = {
      id: generateId(),
      name: newEvent.name || '',
      type: newEvent.type || 'release_party',
      date: newEvent.date || '',
      time: newEvent.time || '',
      description: newEvent.description || '',
      maxAttendees: newEvent.maxAttendees,
      currentAttendees: newEvent.currentAttendees || 0,
      fee: newEvent.fee,
    };
    updateStoreData({ events: [...events, event] });
    setNewEvent({
      name: '',
      type: 'release_party',
      date: '',
      time: '',
      description: '',
      currentAttendees: 0,
    });
    setShowAddForm(false);
  };

  const deleteEvent = (id: string) => {
    updateStoreData({ events: events.filter((item) => item.id !== id) });
  };

  const addConsignment = () => {
    if (!newConsignment.item || !newConsignment.consignorName) return;
    const item: ConsignmentItem = {
      id: generateId(),
      consignorName: newConsignment.consignorName || '',
      consignorContact: newConsignment.consignorContact || '',
      item: newConsignment.item || '',
      condition: newConsignment.condition || 'Near Mint',
      listPrice: newConsignment.listPrice || 0,
      commission: newConsignment.commission || 20,
      dateReceived: new Date().toISOString().split('T')[0],
      status: 'listed',
    };
    updateStoreData({ consignments: [...consignments, item] });
    setNewConsignment({
      consignorName: '',
      consignorContact: '',
      item: '',
      condition: 'Near Mint',
      listPrice: 0,
      commission: 20,
      status: 'listed',
    });
    setShowAddForm(false);
  };

  const deleteConsignment = (id: string) => {
    updateStoreData({ consignments: consignments.filter((item) => item.id !== id) });
  };

  const updateConsignmentStatus = (id: string, status: ConsignmentItem['status'], soldPrice?: number) => {
    updateStoreData({
      consignments: consignments.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              soldDate: status === 'sold' ? new Date().toISOString().split('T')[0] : item.soldDate,
              soldPrice: soldPrice ?? item.soldPrice,
            }
          : item
      ),
    });
  };

  const addPreorder = () => {
    if (!newPreorder.item || !newPreorder.customerName) return;
    const order: PreOrder = {
      id: generateId(),
      customerId: newPreorder.customerId || generateId(),
      customerName: newPreorder.customerName || '',
      item: newPreorder.item || '',
      releaseDate: newPreorder.releaseDate || '',
      price: newPreorder.price || 0,
      deposit: newPreorder.deposit || 0,
      status: 'pending',
    };
    updateStoreData({ preorders: [...preorders, order] });
    setNewPreorder({
      customerId: '',
      customerName: '',
      item: '',
      releaseDate: '',
      price: 0,
      deposit: 0,
      status: 'pending',
    });
    setShowAddForm(false);
  };

  const deletePreorder = (id: string) => {
    updateStoreData({ preorders: preorders.filter((item) => item.id !== id) });
  };

  const updatePreorderStatus = (id: string, status: PreOrder['status']) => {
    updateStoreData({
      preorders: preorders.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    });
  };

  const addCGCSubmission = () => {
    if (!newCGCSubmission.title) return;
    const submission: CGCSubmission = {
      id: generateId(),
      title: newCGCSubmission.title || '',
      issue: newCGCSubmission.issue || '',
      submissionDate: newCGCSubmission.submissionDate || new Date().toISOString().split('T')[0],
      estimatedReturn: newCGCSubmission.estimatedReturn || '',
      status: 'submitted',
      cost: newCGCSubmission.cost || 0,
      customerId: newCGCSubmission.customerId,
      customerName: newCGCSubmission.customerName,
      notes: newCGCSubmission.notes,
    };
    updateStoreData({ cgcSubmissions: [...cgcSubmissions, submission] });
    setNewCGCSubmission({
      title: '',
      issue: '',
      submissionDate: '',
      estimatedReturn: '',
      status: 'submitted',
      cost: 0,
    });
    setShowAddForm(false);
  };

  const deleteCGCSubmission = (id: string) => {
    updateStoreData({ cgcSubmissions: cgcSubmissions.filter((item) => item.id !== id) });
  };

  const updateCGCStatus = (id: string, status: CGCSubmission['status'], grade?: string) => {
    updateStoreData({
      cgcSubmissions: cgcSubmissions.map((item) =>
        item.id === id ? { ...item, status, grade: grade ?? item.grade } : item
      ),
    });
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const activeSubscriptions = pullList.filter((p) => p.active).length;
    const pendingOrders = specialOrders.filter((o) => o.status !== 'completed').length;
    const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date()).length;
    const pendingCGC = cgcSubmissions.filter((c) => c.status !== 'completed').length;

    return {
      totalInventoryValue,
      activeSubscriptions,
      pendingOrders,
      upcomingEvents,
      pendingCGC,
      totalCustomers: customers.length,
      totalComics: inventory.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [inventory, pullList, specialOrders, events, cgcSubmissions, customers]);

  // Get current export data and columns based on active tab
  const getExportDataAndColumns = (): { data: any[]; columns: ColumnConfig[]; filename: string; label: string } => {
    switch (activeTab) {
      case 'inventory':
        return { data: filteredInventory, columns: INVENTORY_COLUMNS, filename: 'comic-inventory', label: 'Inventory' };
      case 'pullList':
        return { data: filteredPullList, columns: PULL_LIST_COLUMNS, filename: 'pull-list', label: 'Pull List' };
      case 'releases':
        return { data: newReleases, columns: RELEASES_COLUMNS, filename: 'new-releases', label: 'New Releases' };
      case 'customers':
        return { data: filteredCustomers, columns: CUSTOMERS_COLUMNS, filename: 'customers', label: 'Customers' };
      case 'specialOrders':
        return { data: specialOrders, columns: SPECIAL_ORDERS_COLUMNS, filename: 'special-orders', label: 'Special Orders' };
      case 'gaming':
        return { data: gamingItems, columns: GAMING_COLUMNS, filename: 'gaming-items', label: 'Gaming' };
      case 'events':
        return { data: events, columns: EVENTS_COLUMNS, filename: 'store-events', label: 'Events' };
      case 'consignment':
        return { data: consignments, columns: CONSIGNMENT_COLUMNS, filename: 'consignment-items', label: 'Consignment' };
      case 'preorders':
        return { data: preorders, columns: PREORDERS_COLUMNS, filename: 'preorders', label: 'Pre-Orders' };
      case 'cgc':
        return { data: cgcSubmissions, columns: CGC_COLUMNS, filename: 'cgc-submissions', label: 'CGC Submissions' };
      default:
        return { data: [], columns: [], filename: 'export', label: 'Export' };
    }
  };

  // Export handlers - use tab-specific data
  const handleExportCSV = () => {
    const { filename } = getExportDataAndColumns();
    exportCSV({ filename });
  };

  const handleExportExcel = () => {
    const { filename } = getExportDataAndColumns();
    exportExcel({ filename });
  };

  const handleExportJSON = () => {
    const { filename } = getExportDataAndColumns();
    exportJSON({ filename });
  };

  const handleExportPDF = async () => {
    const { filename, label } = getExportDataAndColumns();
    await exportPDF({ filename, title: `Comic Book Store - ${label}` });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return copyUtil('tab');
  };

  const handlePrint = () => {
    const { label } = getExportDataAndColumns();
    printData(`Comic Book Store - ${label}`);
  };

  // Get next Wednesday for new releases
  const getNextWednesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilWednesday = (3 - dayOfWeek + 7) % 7 || 7;
    const nextWed = new Date(today);
    nextWed.setDate(today.getDate() + daysUntilWednesday);
    return nextWed.toISOString().split('T')[0];
  };

  // Styles
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;

  const cardClass = `p-4 rounded-lg border ${
    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
  }`;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Inventory', icon: <Book className="w-4 h-4" /> },
    { id: 'pullList', label: 'Pull List', icon: <FileText className="w-4 h-4" /> },
    { id: 'releases', label: 'New Releases', icon: <Calendar className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'specialOrders', label: 'Special Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'gaming', label: 'Gaming', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'consignment', label: 'Consignment', icon: <HandCoins className="w-4 h-4" /> },
    { id: 'preorders', label: 'Pre-Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'cgc', label: 'CGC Submissions', icon: <Award className="w-4 h-4" /> },
  ];

  const renderAddForm = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.title', 'Title *')}</label>
                <input
                  type="text"
                  value={newComic.title}
                  onChange={(e) => setNewComic({ ...newComic, title: e.target.value })}
                  placeholder={t('tools.comicBookStore.eGAmazingSpiderMan', 'e.g., Amazing Spider-Man')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.issue', 'Issue # *')}</label>
                <input
                  type="text"
                  value={newComic.issue}
                  onChange={(e) => setNewComic({ ...newComic, issue: e.target.value })}
                  placeholder={t('tools.comicBookStore.eG1300Annual', 'e.g., 1, 300, Annual 1')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.publisher', 'Publisher')}</label>
                <select
                  value={newComic.publisher}
                  onChange={(e) => setNewComic({ ...newComic, publisher: e.target.value })}
                  className={selectClass}
                >
                  {PUBLISHERS.map((pub) => (
                    <option key={pub} value={pub}>{pub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.condition', 'Condition')}</label>
                <select
                  value={newComic.condition}
                  onChange={(e) => setNewComic({ ...newComic, condition: e.target.value })}
                  className={selectClass}
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.price', 'Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newComic.price}
                  onChange={(e) => setNewComic({ ...newComic, price: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.quantity', 'Quantity')}</label>
                <input
                  type="number"
                  value={newComic.quantity}
                  onChange={(e) => setNewComic({ ...newComic, quantity: parseInt(e.target.value) || 1 })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newComic.variant}
                  onChange={(e) => setNewComic({ ...newComic, variant: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{t('tools.comicBookStore.variantCover', 'Variant Cover')}</span>
              </label>
            </div>
            {newComic.variant && (
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.variantType', 'Variant Type')}</label>
                <input
                  type="text"
                  value={newComic.variantType || ''}
                  onChange={(e) => setNewComic({ ...newComic, variantType: e.target.value })}
                  placeholder={t('tools.comicBookStore.eG125Exclusive', 'e.g., 1:25, Exclusive, Signed')}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.gradingNotes', 'Grading Notes')}</label>
              <textarea
                value={newComic.gradingNotes || ''}
                onChange={(e) => setNewComic({ ...newComic, gradingNotes: e.target.value })}
                placeholder={t('tools.comicBookStore.noteAnyDefectsPressingNeeds', 'Note any defects, pressing needs, etc.')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addComic}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addToInventory', 'Add to Inventory')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'pullList':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.customerName', 'Customer Name *')}</label>
                <input
                  type="text"
                  value={newPullSubscription.customerName}
                  onChange={(e) => setNewPullSubscription({ ...newPullSubscription, customerName: e.target.value })}
                  placeholder={t('tools.comicBookStore.customerName4', 'Customer name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.title2', 'Title *')}</label>
                <input
                  type="text"
                  value={newPullSubscription.title}
                  onChange={(e) => setNewPullSubscription({ ...newPullSubscription, title: e.target.value })}
                  placeholder={t('tools.comicBookStore.comicTitle2', 'Comic title')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.publisher2', 'Publisher')}</label>
                <select
                  value={newPullSubscription.publisher}
                  onChange={(e) => setNewPullSubscription({ ...newPullSubscription, publisher: e.target.value })}
                  className={selectClass}
                >
                  {PUBLISHERS.map((pub) => (
                    <option key={pub} value={pub}>{pub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.startingIssue', 'Starting Issue')}</label>
                <input
                  type="text"
                  value={newPullSubscription.startIssue}
                  onChange={(e) => setNewPullSubscription({ ...newPullSubscription, startIssue: e.target.value })}
                  placeholder={t('tools.comicBookStore.issueNumber', 'Issue number')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.notes', 'Notes')}</label>
              <textarea
                value={newPullSubscription.notes || ''}
                onChange={(e) => setNewPullSubscription({ ...newPullSubscription, notes: e.target.value })}
                placeholder={t('tools.comicBookStore.anySpecialRequests', 'Any special requests')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addPullSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addSubscription', 'Add Subscription')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel2', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'releases':
        return (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                Next New Comic Day (Wednesday): {getNextWednesday()}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.title3', 'Title *')}</label>
                <input
                  type="text"
                  value={newRelease.title}
                  onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                  placeholder={t('tools.comicBookStore.comicTitle3', 'Comic title')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.issue2', 'Issue #')}</label>
                <input
                  type="text"
                  value={newRelease.issue}
                  onChange={(e) => setNewRelease({ ...newRelease, issue: e.target.value })}
                  placeholder={t('tools.comicBookStore.issueNumber2', 'Issue number')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.publisher3', 'Publisher')}</label>
                <select
                  value={newRelease.publisher}
                  onChange={(e) => setNewRelease({ ...newRelease, publisher: e.target.value })}
                  className={selectClass}
                >
                  {PUBLISHERS.map((pub) => (
                    <option key={pub} value={pub}>{pub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.releaseDate', 'Release Date *')}</label>
                <input
                  type="date"
                  value={newRelease.releaseDate}
                  onChange={(e) => setNewRelease({ ...newRelease, releaseDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.coverPrice', 'Cover Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRelease.price}
                  onChange={(e) => setNewRelease({ ...newRelease, price: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.preOrderCount', 'Pre-Order Count')}</label>
                <input
                  type="number"
                  value={newRelease.preOrderCount}
                  onChange={(e) => setNewRelease({ ...newRelease, preOrderCount: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addNewRelease}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addRelease', 'Add Release')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel3', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.name', 'Name *')}</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder={t('tools.comicBookStore.customerName5', 'Customer name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.email', 'Email')}</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder={t('tools.comicBookStore.emailExampleCom', 'email@example.com')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.phone', 'Phone')}</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.storeCredit', 'Store Credit ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCustomer.storeCredit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, storeCredit: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.notes2', 'Notes')}</label>
              <textarea
                value={newCustomer.notes || ''}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                placeholder={t('tools.comicBookStore.customerPreferencesInterestsEtc', 'Customer preferences, interests, etc.')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addCustomer}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addCustomer', 'Add Customer')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel4', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'specialOrders':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.customerName2', 'Customer Name *')}</label>
                <input
                  type="text"
                  value={newSpecialOrder.customerName}
                  onChange={(e) => setNewSpecialOrder({ ...newSpecialOrder, customerName: e.target.value })}
                  placeholder={t('tools.comicBookStore.customerName6', 'Customer name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.item', 'Item *')}</label>
                <input
                  type="text"
                  value={newSpecialOrder.item}
                  onChange={(e) => setNewSpecialOrder({ ...newSpecialOrder, item: e.target.value })}
                  placeholder={t('tools.comicBookStore.itemDescription2', 'Item description')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.price2', 'Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSpecialOrder.price}
                  onChange={(e) => setNewSpecialOrder({ ...newSpecialOrder, price: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.deposit', 'Deposit ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSpecialOrder.deposit}
                  onChange={(e) => setNewSpecialOrder({ ...newSpecialOrder, deposit: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.estimatedArrival', 'Estimated Arrival')}</label>
                <input
                  type="date"
                  value={newSpecialOrder.estimatedArrival || ''}
                  onChange={(e) => setNewSpecialOrder({ ...newSpecialOrder, estimatedArrival: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.notes3', 'Notes')}</label>
              <textarea
                value={newSpecialOrder.notes || ''}
                onChange={(e) => setNewSpecialOrder({ ...newSpecialOrder, notes: e.target.value })}
                placeholder={t('tools.comicBookStore.orderDetailsSourceEtc', 'Order details, source, etc.')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addSpecialOrder}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addOrder', 'Add Order')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel5', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'gaming':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.productName', 'Product Name *')}</label>
                <input
                  type="text"
                  value={newGamingItem.name}
                  onChange={(e) => setNewGamingItem({ ...newGamingItem, name: e.target.value })}
                  placeholder={t('tools.comicBookStore.eGMtgBoosterBox', 'e.g., MTG Booster Box, D&D Player\'s Handbook')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.category', 'Category')}</label>
                <select
                  value={newGamingItem.category}
                  onChange={(e) => setNewGamingItem({ ...newGamingItem, category: e.target.value as GamingItem['category'] })}
                  className={selectClass}
                >
                  {GAMING_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.publisherManufacturer', 'Publisher/Manufacturer')}</label>
                <input
                  type="text"
                  value={newGamingItem.publisher}
                  onChange={(e) => setNewGamingItem({ ...newGamingItem, publisher: e.target.value })}
                  placeholder={t('tools.comicBookStore.eGWizardsOfThe', 'e.g., Wizards of the Coast')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.price3', 'Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newGamingItem.price}
                  onChange={(e) => setNewGamingItem({ ...newGamingItem, price: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.quantity2', 'Quantity')}</label>
                <input
                  type="number"
                  value={newGamingItem.quantity}
                  onChange={(e) => setNewGamingItem({ ...newGamingItem, quantity: parseInt(e.target.value) || 1 })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.notes4', 'Notes')}</label>
              <textarea
                value={newGamingItem.notes || ''}
                onChange={(e) => setNewGamingItem({ ...newGamingItem, notes: e.target.value })}
                placeholder={t('tools.comicBookStore.additionalDetails', 'Additional details')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addGamingItem}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addItem', 'Add Item')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel6', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.eventName', 'Event Name *')}</label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder={t('tools.comicBookStore.eGMidnightReleaseParty', 'e.g., Midnight Release Party')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.eventType', 'Event Type')}</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as StoreEvent['type'] })}
                  className={selectClass}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.date', 'Date *')}</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.time', 'Time')}</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.maxAttendees', 'Max Attendees')}</label>
                <input
                  type="number"
                  value={newEvent.maxAttendees || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: parseInt(e.target.value) || undefined })}
                  placeholder={t('tools.comicBookStore.leaveEmptyForUnlimited', 'Leave empty for unlimited')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.entryFee', 'Entry Fee ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEvent.fee || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, fee: parseFloat(e.target.value) || undefined })}
                  placeholder={t('tools.comicBookStore.leaveEmptyForFree', 'Leave empty for free')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.description', 'Description')}</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder={t('tools.comicBookStore.eventDetails', 'Event details')}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addEvent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addEvent', 'Add Event')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel7', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'consignment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.consignorName', 'Consignor Name *')}</label>
                <input
                  type="text"
                  value={newConsignment.consignorName}
                  onChange={(e) => setNewConsignment({ ...newConsignment, consignorName: e.target.value })}
                  placeholder={t('tools.comicBookStore.ownerSName', 'Owner\'s name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.contactInfo', 'Contact Info')}</label>
                <input
                  type="text"
                  value={newConsignment.consignorContact}
                  onChange={(e) => setNewConsignment({ ...newConsignment, consignorContact: e.target.value })}
                  placeholder={t('tools.comicBookStore.phoneOrEmail', 'Phone or email')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.itemDescription', 'Item Description *')}</label>
                <input
                  type="text"
                  value={newConsignment.item}
                  onChange={(e) => setNewConsignment({ ...newConsignment, item: e.target.value })}
                  placeholder={t('tools.comicBookStore.eGAmazingFantasy15', 'e.g., Amazing Fantasy #15')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.condition2', 'Condition')}</label>
                <select
                  value={newConsignment.condition}
                  onChange={(e) => setNewConsignment({ ...newConsignment, condition: e.target.value })}
                  className={selectClass}
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.listPrice', 'List Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newConsignment.listPrice}
                  onChange={(e) => setNewConsignment({ ...newConsignment, listPrice: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.commission', 'Commission (%)')}</label>
                <input
                  type="number"
                  value={newConsignment.commission}
                  onChange={(e) => setNewConsignment({ ...newConsignment, commission: parseInt(e.target.value) || 20 })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addConsignment}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addConsignment', 'Add Consignment')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel8', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'preorders':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.customerName3', 'Customer Name *')}</label>
                <input
                  type="text"
                  value={newPreorder.customerName}
                  onChange={(e) => setNewPreorder({ ...newPreorder, customerName: e.target.value })}
                  placeholder={t('tools.comicBookStore.customerName7', 'Customer name')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.item2', 'Item *')}</label>
                <input
                  type="text"
                  value={newPreorder.item}
                  onChange={(e) => setNewPreorder({ ...newPreorder, item: e.target.value })}
                  placeholder={t('tools.comicBookStore.preOrderItem', 'Pre-order item')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.releaseDate2', 'Release Date')}</label>
                <input
                  type="date"
                  value={newPreorder.releaseDate}
                  onChange={(e) => setNewPreorder({ ...newPreorder, releaseDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.price4', 'Price ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPreorder.price}
                  onChange={(e) => setNewPreorder({ ...newPreorder, price: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.deposit2', 'Deposit ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPreorder.deposit}
                  onChange={(e) => setNewPreorder({ ...newPreorder, deposit: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addPreorder}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addPreOrder', 'Add Pre-Order')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel9', 'Cancel')}
              </button>
            </div>
          </div>
        );

      case 'cgc':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.comicTitle', 'Comic Title *')}</label>
                <input
                  type="text"
                  value={newCGCSubmission.title}
                  onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, title: e.target.value })}
                  placeholder={t('tools.comicBookStore.eGAmazingSpiderMan2', 'e.g., Amazing Spider-Man')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.issue3', 'Issue #')}</label>
                <input
                  type="text"
                  value={newCGCSubmission.issue}
                  onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, issue: e.target.value })}
                  placeholder={t('tools.comicBookStore.issueNumber3', 'Issue number')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.submissionDate', 'Submission Date')}</label>
                <input
                  type="date"
                  value={newCGCSubmission.submissionDate}
                  onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, submissionDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.estimatedReturn', 'Estimated Return')}</label>
                <input
                  type="date"
                  value={newCGCSubmission.estimatedReturn}
                  onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, estimatedReturn: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.gradingCost', 'Grading Cost ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCGCSubmission.cost}
                  onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, cost: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.comicBookStore.customerNameIfCustomerS', 'Customer Name (if customer\'s book)')}</label>
                <input
                  type="text"
                  value={newCGCSubmission.customerName || ''}
                  onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, customerName: e.target.value })}
                  placeholder={t('tools.comicBookStore.leaveBlankIfStoreInventory', 'Leave blank if store inventory')}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.comicBookStore.notes5', 'Notes')}</label>
              <textarea
                value={newCGCSubmission.notes || ''}
                onChange={(e) => setNewCGCSubmission({ ...newCGCSubmission, notes: e.target.value })}
                placeholder={t('tools.comicBookStore.gradingTierPressingEtc', 'Grading tier, pressing, etc.')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addCGCSubmission}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all"
              >
                <Save className="w-4 h-4" />
                {t('tools.comicBookStore.addSubmission', 'Add Submission')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.comicBookStore.cancel10', 'Cancel')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div className="space-y-4">
            {filteredInventory.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noComicsInInventoryAdd', 'No comics in inventory. Add your first comic!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredInventory.map((comic) => (
                  <div key={comic.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {comic.title} #{comic.issue}
                          </h3>
                          {comic.variant && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                              <Sparkles className="w-3 h-3 inline mr-1" />
                              {comic.variantType || 'Variant'}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {comic.publisher} | {comic.condition}
                        </p>
                        {comic.gradingNotes && (
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Notes: {comic.gradingNotes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isDark ? t('tools.comicBookStore.text2dd4bf', 'text-[#2DD4BF]') : t('tools.comicBookStore.text0d9488', 'text-[#0D9488]')}`}>
                          ${comic.price.toFixed(2)}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Qty: {comic.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteComic(comic.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'pullList':
        return (
          <div className="space-y-4">
            {filteredPullList.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noPullListSubscriptionsAdd', 'No pull list subscriptions. Add a subscription!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPullList.map((sub) => (
                  <div key={sub.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {sub.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            sub.active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {sub.active ? t('tools.comicBookStore.active', 'Active') : t('tools.comicBookStore.paused', 'Paused')}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-3 h-3 inline mr-1" />
                          {sub.customerName} | {sub.publisher} | Starting #{sub.startIssue}
                        </p>
                        {sub.notes && (
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {sub.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deletePullSubscription(sub.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'releases':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
              <h4 className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('tools.comicBookStore.newComicBookDayIs', 'New Comic Book Day is Every Wednesday!')}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                Next release date: {getNextWednesday()}
              </p>
            </div>
            {newReleases.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noReleasesTrackedAddUpcoming', 'No releases tracked. Add upcoming releases!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {newReleases.map((release) => (
                  <div key={release.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {release.title} #{release.issue}
                          </h3>
                          {release.received ? (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              {t('tools.comicBookStore.received2', 'Received')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {t('tools.comicBookStore.pending3', 'Pending')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {release.publisher} | Release: {release.releaseDate}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Pre-orders: {release.preOrderCount} | ${release.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleReleaseReceived(release.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            release.received
                              ? 'bg-green-500/20 text-green-400'
                              : isDark
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNewRelease(release.id)}
                          className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noCustomersYetAddYour', 'No customers yet. Add your first customer!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {customer.name}
                        </h3>
                        <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {customer.email && (
                            <p><Mail className="w-3 h-3 inline mr-1" />{customer.email}</p>
                          )}
                          {customer.phone && (
                            <p><Phone className="w-3 h-3 inline mr-1" />{customer.phone}</p>
                          )}
                          <p>Member since: {customer.memberSince}</p>
                        </div>
                        {customer.notes && (
                          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {customer.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {customer.storeCredit > 0 && (
                          <p className={`font-medium ${isDark ? t('tools.comicBookStore.text2dd4bf2', 'text-[#2DD4BF]') : t('tools.comicBookStore.text0d94882', 'text-[#0D9488]')}`}>
                            <DollarSign className="w-4 h-4 inline" />
                            {customer.storeCredit.toFixed(2)} credit
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCustomer(customer.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'specialOrders':
        return (
          <div className="space-y-4">
            {specialOrders.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noSpecialOrdersCreateOne', 'No special orders. Create one for a customer!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {specialOrders.map((order) => (
                  <div key={order.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {order.item}
                          </h3>
                          <select
                            value={order.status}
                            onChange={(e) => updateSpecialOrderStatus(order.id, e.target.value as SpecialOrder['status'])}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${
                              order.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : order.status === 'received'
                                ? 'bg-blue-500/20 text-blue-400'
                                : order.status === 'ordered'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            <option value="pending">{t('tools.comicBookStore.pending', 'Pending')}</option>
                            <option value="ordered">{t('tools.comicBookStore.ordered', 'Ordered')}</option>
                            <option value="received">{t('tools.comicBookStore.received', 'Received')}</option>
                            <option value="notified">{t('tools.comicBookStore.notified', 'Notified')}</option>
                            <option value="completed">{t('tools.comicBookStore.completed', 'Completed')}</option>
                          </select>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-3 h-3 inline mr-1" />
                          {order.customerName} | Ordered: {order.orderDate}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Price: ${order.price.toFixed(2)} | Deposit: ${order.deposit.toFixed(2)}
                        </p>
                        {order.estimatedArrival && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ETA: {order.estimatedArrival}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSpecialOrder(order.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'gaming':
        return (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {GAMING_CATEGORIES.map((cat) => {
                const count = gamingItems.filter((i) => i.category === cat.value).length;
                return (
                  <span
                    key={cat.value}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.value === 'tcg' && <Dice1 className="w-3 h-3 inline mr-1" />}
                    {cat.value === 'rpg' && <Sword className="w-3 h-3 inline mr-1" />}
                    {cat.label}: {count}
                  </span>
                );
              })}
            </div>
            {gamingItems.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noGamingItemsAddTcgs', 'No gaming items. Add TCGs, RPGs, and more!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {gamingItems.map((item) => (
                  <div key={item.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {GAMING_CATEGORIES.find((c) => c.value === item.category)?.label}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.publisher && `${item.publisher} | `}Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isDark ? t('tools.comicBookStore.text2dd4bf3', 'text-[#2DD4BF]') : t('tools.comicBookStore.text0d94883', 'text-[#0D9488]')}`}>
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteGamingItem(item.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noEventsScheduledPlanA', 'No events scheduled. Plan a release party or gaming night!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => {
                  const isPast = new Date(event.date) < new Date();
                  return (
                    <div key={event.id} className={`${cardClass} ${isPast ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {event.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {EVENT_TYPES.find((t) => t.value === event.type)?.label}
                            </span>
                            {isPast && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">
                                {t('tools.comicBookStore.past', 'Past')}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {event.date} {event.time && `at ${event.time}`}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Users className="w-3 h-3 inline mr-1" />
                            {event.currentAttendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attendees
                            {event.fee && ` | $${event.fee.toFixed(2)} entry`}
                          </p>
                          {event.description && (
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {event.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'consignment':
        return (
          <div className="space-y-4">
            {consignments.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <HandCoins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noConsignmentItemsStartAccepting', 'No consignment items. Start accepting consignments!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {consignments.map((item) => (
                  <div key={item.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.item}
                          </h3>
                          <select
                            value={item.status}
                            onChange={(e) => updateConsignmentStatus(item.id, e.target.value as ConsignmentItem['status'])}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${
                              item.status === 'sold'
                                ? 'bg-green-500/20 text-green-400'
                                : item.status === 'returned'
                                ? 'bg-gray-500/20 text-gray-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            <option value="listed">{t('tools.comicBookStore.listed', 'Listed')}</option>
                            <option value="sold">{t('tools.comicBookStore.sold', 'Sold')}</option>
                            <option value="returned">{t('tools.comicBookStore.returned', 'Returned')}</option>
                          </select>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Consignor: {item.consignorName} | {item.condition}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Price: ${item.listPrice.toFixed(2)} | Commission: {item.commission}%
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Received: {item.dateReceived}
                          {item.soldDate && ` | Sold: ${item.soldDate}`}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteConsignment(item.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'preorders':
        return (
          <div className="space-y-4">
            {preorders.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noPreOrdersTakeA', 'No pre-orders. Take a customer pre-order!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {preorders.map((order) => (
                  <div key={order.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {order.item}
                          </h3>
                          <select
                            value={order.status}
                            onChange={(e) => updatePreorderStatus(order.id, e.target.value as PreOrder['status'])}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${
                              order.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : order.status === 'ready'
                                ? 'bg-blue-500/20 text-blue-400'
                                : order.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            <option value="pending">{t('tools.comicBookStore.pending2', 'Pending')}</option>
                            <option value="ready">{t('tools.comicBookStore.ready', 'Ready')}</option>
                            <option value="completed">{t('tools.comicBookStore.completed2', 'Completed')}</option>
                            <option value="cancelled">{t('tools.comicBookStore.cancelled', 'Cancelled')}</option>
                          </select>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-3 h-3 inline mr-1" />
                          {order.customerName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Release: {order.releaseDate} | Price: ${order.price.toFixed(2)} | Deposit: ${order.deposit.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePreorder(order.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'cgc':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <h4 className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <Award className="w-4 h-4 inline mr-2" />
                {t('tools.comicBookStore.cgcCertifiedGuarantyCompanySubmission', 'CGC (Certified Guaranty Company) Submission Tracking')}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-400/80' : 'text-blue-600'}`}>
                {t('tools.comicBookStore.trackComicsSentForProfessional', 'Track comics sent for professional grading and encapsulation.')}
              </p>
            </div>
            {cgcSubmissions.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.comicBookStore.noCgcSubmissionsTrackYour', 'No CGC submissions. Track your grading submissions!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {cgcSubmissions.map((sub) => (
                  <div key={sub.id} className={cardClass}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {sub.title} #{sub.issue}
                          </h3>
                          <select
                            value={sub.status}
                            onChange={(e) => updateCGCStatus(sub.id, e.target.value as CGCSubmission['status'])}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${
                              sub.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : sub.status === 'shipped_back'
                                ? 'bg-purple-500/20 text-purple-400'
                                : sub.status === 'grading'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            <option value="submitted">{t('tools.comicBookStore.submitted', 'Submitted')}</option>
                            <option value="received_by_cgc">{t('tools.comicBookStore.receivedByCgc', 'Received by CGC')}</option>
                            <option value="grading">{t('tools.comicBookStore.grading', 'Grading')}</option>
                            <option value="shipped_back">{t('tools.comicBookStore.shippedBack', 'Shipped Back')}</option>
                            <option value="completed">{t('tools.comicBookStore.completed3', 'Completed')}</option>
                          </select>
                          {sub.grade && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[#0D9488]/20 text-[#2DD4BF] font-bold">
                              {sub.grade}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Submitted: {sub.submissionDate} | ETA: {sub.estimatedReturn || 'TBD'}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Cost: ${sub.cost.toFixed(2)}
                          {sub.customerName && ` | Customer: ${sub.customerName}`}
                        </p>
                        {sub.notes && (
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {sub.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCGCSubmission(sub.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-6xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Book className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.comicBookStore.comicBookStoreManager', 'Comic Book Store Manager')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.comicBookStore.completeInventoryCustomersAndStore', 'Complete inventory, customers, and store management')}
            </p>
          </div>
        </div>
        <WidgetEmbedButton toolSlug="comic-book-store" toolName="Comic Book Store" />

        <SyncStatus
          isSynced={isSynced}
          isSaving={isSaving}
          lastSaved={lastSaved}
          syncError={syncError}
          onForceSync={forceSync}
          theme={isDark ? 'dark' : 'light'}
          size="sm"
        />
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className="text-sm text-teal-500 font-medium">{t('tools.comicBookStore.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.comics', 'Comics')}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalComics}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.inventoryValue', 'Inventory Value')}</p>
          <p className={`text-xl font-bold ${isDark ? t('tools.comicBookStore.text2dd4bf4', 'text-[#2DD4BF]') : t('tools.comicBookStore.text0d94884', 'text-[#0D9488]')}`}>
            ${stats.totalInventoryValue.toFixed(0)}
          </p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.customers', 'Customers')}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCustomers}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.subscriptions', 'Subscriptions')}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeSubscriptions}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.pendingOrders', 'Pending Orders')}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingOrders}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.upcomingEvents', 'Upcoming Events')}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.upcomingEvents}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.comicBookStore.cgcPending', 'CGC Pending')}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingCGC}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowAddForm(false);
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
            className={`${inputClass} pl-10`}
          />
        </div>
        <div className="flex gap-2">
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg hover:from-[#2DD4BF] hover:to-[#0D9488] transition-all whitespace-nowrap"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Cancel' : `Add ${tabs.find((t) => t.id === activeTab)?.label.slice(0, -1) || 'Item'}`}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Add New {tabs.find((t) => t.id === activeTab)?.label.slice(0, -1) || 'Item'}
          </h3>
          {renderAddForm()}
        </div>
      )}

      {/* Content */}
      {renderContent()}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.comicBookStore.aboutComicBookStoreManager', 'About Comic Book Store Manager')}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          A comprehensive tool for managing your comic book store. Track inventory with grading notes and variants,
          manage customer pull lists and subscriptions, monitor new release Wednesdays, handle special orders and
          pre-orders, manage gaming inventory (TCGs, RPGs), schedule store events, track consignment items, and
          monitor CGC submissions. Your data is automatically synced to the cloud when logged in.
        </p>
      </div>
    </div>
  );
};

export default ComicBookStoreTool;
