import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Users,
  Calendar,
  DollarSign,
  CheckSquare,
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Palette,
  UserPlus,
  Grid3X3,
  Save,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
type TabType = 'details' | 'budget' | 'guests' | 'checklist' | 'vendors' | 'seating';
type RSVPStatus = 'pending' | 'confirmed' | 'declined';
type VendorStatus = 'contacted' | 'booked' | 'paid';
type BudgetCategory = 'venue' | 'catering' | 'photography' | 'attire' | 'flowers' | 'music' | 'invitations' | 'decorations' | 'other';

interface WeddingDetails {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  theme: string;
  colors: string[];
}

interface BudgetItem {
  id: string;
  category: BudgetCategory;
  description: string;
  amount: number;
}

interface CategoryBudget {
  category: BudgetCategory;
  allocated: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  rsvpStatus: RSVPStatus;
  mealPreference: string;
  tableAssignment: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  dueDate: string;
  timeline: string;
  completed: boolean;
}

interface Vendor {
  id: string;
  name: string;
  service: string;
  contact: string;
  email: string;
  price: number;
  status: VendorStatus;
  contractDate: string;
  paymentDueDate: string;
  notes: string;
}

interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  guests: string[];
}

interface WeddingPlannerData {
  id: string;
  details: WeddingDetails;
  totalBudget: number;
  categoryBudgets: CategoryBudget[];
  expenses: BudgetItem[];
  guests: Guest[];
  checklist: ChecklistItem[];
  vendors: Vendor[];
  tables: SeatingTable[];
}

const BUDGET_CATEGORIES: { value: BudgetCategory; label: string; icon: string }[] = [
  { value: 'venue', label: 'Venue', icon: 'Building2' },
  { value: 'catering', label: 'Catering', icon: 'Utensils' },
  { value: 'photography', label: 'Photography', icon: 'Camera' },
  { value: 'attire', label: 'Attire', icon: 'Shirt' },
  { value: 'flowers', label: 'Flowers', icon: 'Flower' },
  { value: 'music', label: 'Music', icon: 'Music' },
  { value: 'invitations', label: 'Invitations', icon: 'Mail' },
  { value: 'decorations', label: 'Decorations', icon: 'Sparkles' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { task: 'Set a budget', timeline: '12 months', dueDate: '', completed: false },
  { task: 'Create guest list', timeline: '12 months', dueDate: '', completed: false },
  { task: 'Choose wedding party', timeline: '12 months', dueDate: '', completed: false },
  { task: 'Book venue', timeline: '12 months', dueDate: '', completed: false },
  { task: 'Hire photographer', timeline: '10 months', dueDate: '', completed: false },
  { task: 'Book caterer', timeline: '9 months', dueDate: '', completed: false },
  { task: 'Choose wedding dress/attire', timeline: '8 months', dueDate: '', completed: false },
  { task: 'Book florist', timeline: '6 months', dueDate: '', completed: false },
  { task: 'Order invitations', timeline: '6 months', dueDate: '', completed: false },
  { task: 'Book DJ/band', timeline: '6 months', dueDate: '', completed: false },
  { task: 'Plan honeymoon', timeline: '6 months', dueDate: '', completed: false },
  { task: 'Send save-the-dates', timeline: '6 months', dueDate: '', completed: false },
  { task: 'Order wedding cake', timeline: '3 months', dueDate: '', completed: false },
  { task: 'Arrange transportation', timeline: '3 months', dueDate: '', completed: false },
  { task: 'Send invitations', timeline: '3 months', dueDate: '', completed: false },
  { task: 'Final dress fitting', timeline: '1 month', dueDate: '', completed: false },
  { task: 'Confirm all vendors', timeline: '1 month', dueDate: '', completed: false },
  { task: 'Create seating chart', timeline: '1 month', dueDate: '', completed: false },
  { task: 'Wedding rehearsal', timeline: 'Week of', dueDate: '', completed: false },
  { task: 'Pick up dress/attire', timeline: 'Week of', dueDate: '', completed: false },
  { task: 'Confirm final headcount', timeline: 'Week of', dueDate: '', completed: false },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const STORAGE_KEY = 'wedding-planner-data';

const getInitialData = (): WeddingPlannerData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load wedding planner data:', e);
  }

  return {
    id: generateId(),
    details: {
      partner1Name: '',
      partner2Name: '',
      weddingDate: '',
      venueName: '',
      venueAddress: '',
      theme: '',
      colors: [],
    },
    totalBudget: 0,
    categoryBudgets: BUDGET_CATEGORIES.map(cat => ({ category: cat.value, allocated: 0 })),
    expenses: [],
    guests: [],
    checklist: DEFAULT_CHECKLIST.map(item => ({ ...item, id: generateId() })),
    vendors: [],
    tables: [],
  };
};

interface WeddingPlannerToolProps {
  uiConfig?: UIConfig;
}

// Column configurations for export
const WEDDING_PLANNER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'details', header: 'Details', type: 'string' },
];

export const WeddingPlannerTool: React.FC<WeddingPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use useToolData hook for backend sync with fallback to localStorage
  const {
    data: toolData,
    setData,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<WeddingPlannerData>(
    'wedding-planner',
    [getInitialData()],
    WEDDING_PLANNER_COLUMNS,
    {
      autoSave: true,
      autoSaveDelay: 1000,
    }
  );

  // Get the current data (handle array from hook)
  const data = Array.isArray(toolData) && toolData.length > 0 ? toolData[0] : getInitialData();

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.dates && params.dates.length > 0) {
        setData(prev => {
          const current = Array.isArray(prev) && prev.length > 0 ? prev[0] : getInitialData();
          return [{
            ...current,
            details: { ...current.details, weddingDate: params.dates![0] }
          }];
        });
        setIsPrefilled(true);
      }
      if (params.amount) {
        setData(prev => {
          const current = Array.isArray(prev) && prev.length > 0 ? prev[0] : getInitialData();
          return [{ ...current, totalBudget: params.amount! }];
        });
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.partner1Name || params.formData.partner2Name) {
          setData(prev => {
            const current = Array.isArray(prev) && prev.length > 0 ? prev[0] : getInitialData();
            return [{
              ...current,
              details: {
                ...current.details,
                partner1Name: params.formData?.partner1Name || current.details.partner1Name,
                partner2Name: params.formData?.partner2Name || current.details.partner2Name,
              }
            }];
          });
          setIsPrefilled(true);
        }
        if (params.formData.weddingDate) {
          setData(prev => {
            const current = Array.isArray(prev) && prev.length > 0 ? prev[0] : getInitialData();
            return [{
              ...current,
              details: { ...current.details, weddingDate: params.formData!.weddingDate }
            }];
          });
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params, setData]);

  // Guest filter state
  const [guestFilter, setGuestFilter] = useState<RSVPStatus | 'all'>('all');

  // Form states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);

  // Edit states
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);

  // Expanded sections
  const [expandedTimelines, setExpandedTimelines] = useState<string[]>(['12 months', '6 months', '3 months', '1 month', 'Week of']);

  // New color input
  const [newColor, setNewColor] = useState('#FF69B4');

  // Calculate days until wedding
  const getDaysUntilWedding = () => {
    if (!data.details.weddingDate) return null;
    const wedding = new Date(data.details.weddingDate);
    const today = new Date();
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Budget calculations
  const getTotalSpent = () => data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const getSpentByCategory = (category: BudgetCategory) =>
    data.expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + exp.amount, 0);
  const getCategoryBudget = (category: BudgetCategory) =>
    data.categoryBudgets.find(cb => cb.category === category)?.allocated || 0;

  // Guest calculations
  const getTotalGuests = () => data.guests.reduce((sum, g) => sum + g.partySize, 0);
  const getConfirmedGuests = () =>
    data.guests.filter(g => g.rsvpStatus === 'confirmed').reduce((sum, g) => sum + g.partySize, 0);
  const getPendingGuests = () =>
    data.guests.filter(g => g.rsvpStatus === 'pending').reduce((sum, g) => sum + g.partySize, 0);
  const getDeclinedGuests = () =>
    data.guests.filter(g => g.rsvpStatus === 'declined').reduce((sum, g) => sum + g.partySize, 0);

  // Checklist calculations
  const getCompletedTasks = () => data.checklist.filter(item => item.completed).length;

  // Seating calculations
  const getAssignedGuests = () => data.tables.reduce((sum, t) => sum + t.guests.length, 0);
  const getUnassignedGuests = () => data.guests.filter(g => g.rsvpStatus === 'confirmed' && !g.tableAssignment).length;

  // Tab components
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details', icon: <Heart className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'guests', label: 'Guests', icon: <Users className="w-4 h-4" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Building2 className="w-4 h-4" /> },
    { id: 'seating', label: 'Seating', icon: <Grid3X3 className="w-4 h-4" /> },
  ];

  // Update details
  const updateDetails = (field: keyof WeddingDetails, value: string | string[]) => {
    setData(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }));
  };

  // Add color
  const addColor = () => {
    if (!data.details.colors.includes(newColor)) {
      updateDetails('colors', [...data.details.colors, newColor]);
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    updateDetails('colors', data.details.colors.filter(c => c !== color));
  };

  // Add expense
  const addExpense = (expense: Omit<BudgetItem, 'id'>) => {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: generateId() }]
    }));
    setShowAddExpense(false);
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  // Update category budget
  const updateCategoryBudget = (category: BudgetCategory, amount: number) => {
    setData(prev => ({
      ...prev,
      categoryBudgets: prev.categoryBudgets.map(cb =>
        cb.category === category ? { ...cb, allocated: amount } : cb
      )
    }));
  };

  // Add guest
  const addGuest = (guest: Omit<Guest, 'id'>) => {
    setData(prev => ({
      ...prev,
      guests: [...prev.guests, { ...guest, id: generateId() }]
    }));
    setShowAddGuest(false);
  };

  // Update guest
  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setData(prev => ({
      ...prev,
      guests: prev.guests.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
    setEditingGuest(null);
  };

  // Delete guest
  const deleteGuest = (id: string) => {
    const guest = data.guests.find(g => g.id === id);
    setData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g.id !== id),
      tables: prev.tables.map(t => ({
        ...t,
        guests: t.guests.filter(gId => gId !== id)
      }))
    }));
    if (guest?.tableAssignment) {
      // Remove from table
    }
  };

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  // Add task
  const addTask = (task: Omit<ChecklistItem, 'id'>) => {
    setData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { ...task, id: generateId() }]
    }));
    setShowAddTask(false);
  };

  // Delete task
  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(t => t.id !== id)
    }));
  };

  // Add vendor
  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    setData(prev => ({
      ...prev,
      vendors: [...prev.vendors, { ...vendor, id: generateId() }]
    }));
    setShowAddVendor(false);
  };

  // Update vendor
  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setData(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === id ? { ...v, ...updates } : v)
    }));
    setEditingVendor(null);
  };

  // Delete vendor
  const deleteVendor = (id: string) => {
    setData(prev => ({
      ...prev,
      vendors: prev.vendors.filter(v => v.id !== id)
    }));
  };

  // Add table
  const addTable = (table: Omit<SeatingTable, 'id'>) => {
    setData(prev => ({
      ...prev,
      tables: [...prev.tables, { ...table, id: generateId() }]
    }));
    setShowAddTable(false);
  };

  // Delete table
  const deleteTable = (id: string) => {
    const table = data.tables.find(t => t.id === id);
    if (table) {
      // Unassign all guests from this table
      setData(prev => ({
        ...prev,
        tables: prev.tables.filter(t => t.id !== id),
        guests: prev.guests.map(g =>
          table.guests.includes(g.id) ? { ...g, tableAssignment: '' } : g
        )
      }));
    }
  };

  // Assign guest to table
  const assignGuestToTable = (guestId: string, tableId: string) => {
    const table = data.tables.find(t => t.id === tableId);
    if (!table || table.guests.length >= table.capacity) return;

    // Remove from previous table
    const previousTable = data.tables.find(t => t.guests.includes(guestId));

    setData(prev => ({
      ...prev,
      tables: prev.tables.map(t => {
        if (t.id === tableId) {
          return { ...t, guests: [...t.guests, guestId] };
        }
        if (t.id === previousTable?.id) {
          return { ...t, guests: t.guests.filter(g => g !== guestId) };
        }
        return t;
      }),
      guests: prev.guests.map(g =>
        g.id === guestId ? { ...g, tableAssignment: table.name } : g
      )
    }));
  };

  // Remove guest from table
  const removeGuestFromTable = (guestId: string, tableId: string) => {
    setData(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === tableId ? { ...t, guests: t.guests.filter(g => g !== guestId) } : t
      ),
      guests: prev.guests.map(g =>
        g.id === guestId ? { ...g, tableAssignment: '' } : g
      )
    }));
  };

  // Filtered guests
  const filteredGuests = guestFilter === 'all'
    ? data.guests
    : data.guests.filter(g => g.rsvpStatus === guestFilter);

  // Group checklist by timeline
  const groupedChecklist = data.checklist.reduce((acc, item) => {
    if (!acc[item.timeline]) {
      acc[item.timeline] = [];
    }
    acc[item.timeline].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const daysUntil = getDaysUntilWedding();

  // Column configurations for export
  const guestColumns: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'phone', header: 'Phone', type: 'string' },
    { key: 'partySize', header: 'Party Size', type: 'number' },
    { key: 'rsvpStatus', header: 'RSVP Status', type: 'string' },
    { key: 'mealPreference', header: 'Meal Preference', type: 'string' },
    { key: 'tableAssignment', header: 'Table', type: 'string' },
  ];

  const vendorColumns: ColumnConfig[] = [
    { key: 'name', header: 'Vendor Name', type: 'string' },
    { key: 'service', header: 'Service', type: 'string' },
    { key: 'contact', header: 'Contact', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'contractDate', header: 'Contract Date', type: 'date' },
    { key: 'paymentDueDate', header: 'Payment Due', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const expenseColumns: ColumnConfig[] = [
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'amount', header: 'Amount', type: 'currency' },
  ];

  const checklistColumns: ColumnConfig[] = [
    { key: 'task', header: 'Task', type: 'string' },
    { key: 'timeline', header: 'Timeline', type: 'string' },
    { key: 'dueDate', header: 'Due Date', type: 'date' },
    { key: 'completed', header: 'Completed', type: 'boolean' },
  ];

  // Get current tab's export data and columns
  const getExportDataAndColumns = (): { data: any[]; columns: ColumnConfig[]; title: string } => {
    switch (activeTab) {
      case 'guests':
        return { data: data.guests, columns: guestColumns, title: 'Wedding Guest List' };
      case 'vendors':
        return { data: data.vendors, columns: vendorColumns, title: 'Wedding Vendors' };
      case 'budget':
        return { data: data.expenses, columns: expenseColumns, title: 'Wedding Expenses' };
      case 'checklist':
        return { data: data.checklist, columns: checklistColumns, title: 'Wedding Checklist' };
      default:
        return { data: data.guests, columns: guestColumns, title: 'Wedding Guest List' };
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const { data: exportData, columns, title } = getExportDataAndColumns();
    exportToCSV(exportData, columns, { filename: title.toLowerCase().replace(/\s+/g, '_') });
  };

  const handleExportExcel = () => {
    const { data: exportData, columns, title } = getExportDataAndColumns();
    exportToExcel(exportData, columns, { filename: title.toLowerCase().replace(/\s+/g, '_') });
  };

  const handleExportJSON = () => {
    const { data: exportData, title } = getExportDataAndColumns();
    exportToJSON(exportData, { filename: title.toLowerCase().replace(/\s+/g, '_') });
  };

  const handleExportPDF = async () => {
    const { data: exportData, columns, title } = getExportDataAndColumns();
    const coupleName = data.details.partner1Name && data.details.partner2Name
      ? `${data.details.partner1Name} & ${data.details.partner2Name}`
      : undefined;
    await exportToPDF(exportData, columns, {
      filename: title.toLowerCase().replace(/\s+/g, '_'),
      title,
      subtitle: coupleName,
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const { data: exportData, columns } = getExportDataAndColumns();
    return await copyUtil(exportData, columns);
  };

  const handlePrint = () => {
    const { data: exportData, columns, title } = getExportDataAndColumns();
    printData(exportData, columns, { title });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.weddingPlanner.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.weddingPlanner.weddingPlanner', 'Wedding Planner')}
                </h1>
                {data.details.partner1Name && data.details.partner2Name && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {data.details.partner1Name} & {data.details.partner2Name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {daysUntil !== null && (
                <div className={`text-center px-4 py-2 rounded-lg ${
                  daysUntil > 0
                    ? 'bg-pink-100 text-pink-700'
                    : daysUntil === 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  <div className="text-2xl font-bold">{Math.abs(daysUntil)}</div>
                  <div className="text-xs">
                    {daysUntil > 0 ? 'days to go' : daysUntil === 0 ? t('tools.weddingPlanner.today', 'Today!') : t('tools.weddingPlanner.daysAgo', 'days ago')}
                  </div>
                </div>
              )}
              <WidgetEmbedButton toolSlug="wedding-planner" toolName="Wedding Planner" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopyToClipboard}
                onPrint={handlePrint}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingPlanner.budget', 'Budget')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${getTotalSpent().toLocaleString()} / ${data.totalBudget.toLocaleString()}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingPlanner.guests', 'Guests')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getConfirmedGuests()} confirmed / {getTotalGuests()} total
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingPlanner.tasks', 'Tasks')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getCompletedTasks()} / {data.checklist.length} completed
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingPlanner.vendors', 'Vendors')}</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data.vendors.filter(v => v.status === 'booked' || v.status === 'paid').length} booked
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className={`flex overflow-x-auto border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingPlanner.partner1Name', 'Partner 1 Name')}
                    </label>
                    <input
                      type="text"
                      value={data.details.partner1Name}
                      onChange={(e) => updateDetails('partner1Name', e.target.value)}
                      placeholder={t('tools.weddingPlanner.enterName', 'Enter name')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.weddingPlanner.partner2Name', 'Partner 2 Name')}
                    </label>
                    <input
                      type="text"
                      value={data.details.partner2Name}
                      onChange={(e) => updateDetails('partner2Name', e.target.value)}
                      placeholder={t('tools.weddingPlanner.enterName2', 'Enter name')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('tools.weddingPlanner.weddingDate', 'Wedding Date')}
                  </label>
                  <input
                    type="date"
                    value={data.details.weddingDate}
                    onChange={(e) => updateDetails('weddingDate', e.target.value)}
                    className={`w-full md:w-auto px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Building2 className="w-4 h-4 inline mr-2" />
                      {t('tools.weddingPlanner.venueName', 'Venue Name')}
                    </label>
                    <input
                      type="text"
                      value={data.details.venueName}
                      onChange={(e) => updateDetails('venueName', e.target.value)}
                      placeholder={t('tools.weddingPlanner.enterVenueName', 'Enter venue name')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin className="w-4 h-4 inline mr-2" />
                      {t('tools.weddingPlanner.venueAddress', 'Venue Address')}
                    </label>
                    <input
                      type="text"
                      value={data.details.venueAddress}
                      onChange={(e) => updateDetails('venueAddress', e.target.value)}
                      placeholder={t('tools.weddingPlanner.enterVenueAddress', 'Enter venue address')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Palette className="w-4 h-4 inline mr-2" />
                    {t('tools.weddingPlanner.weddingTheme', 'Wedding Theme')}
                  </label>
                  <input
                    type="text"
                    value={data.details.theme}
                    onChange={(e) => updateDetails('theme', e.target.value)}
                    placeholder={t('tools.weddingPlanner.eGRusticBohemianClassic', 'e.g., Rustic, Bohemian, Classic, Beach')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingPlanner.weddingColors', 'Wedding Colors')}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.details.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {color}
                        </span>
                        <button
                          onClick={() => removeColor(color)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className={`w-32 px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={addColor}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                    >
                      {t('tools.weddingPlanner.addColor', 'Add Color')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Tab */}
            {activeTab === 'budget' && (
              <div className="space-y-6">
                {/* Total Budget */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.weddingPlanner.totalWeddingBudget', 'Total Wedding Budget')}
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      value={data.totalBudget || ''}
                      onChange={(e) => setData(prev => ({ ...prev, totalBudget: parseFloat(e.target.value) || 0 }))}
                      placeholder={t('tools.weddingPlanner.enterTotalBudget', 'Enter total budget')}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    />
                  </div>
                </div>

                {/* Budget Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.weddingPlanner.totalBudget', 'Total Budget')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      ${data.totalBudget.toLocaleString()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/30' : 'bg-pink-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{t('tools.weddingPlanner.totalSpent', 'Total Spent')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                      ${getTotalSpent().toLocaleString()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    data.totalBudget - getTotalSpent() >= 0
                      ? isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                      : isDark ? 'bg-red-900/30' : 'bg-red-50'
                  }`}>
                    <div className={`text-sm ${
                      data.totalBudget - getTotalSpent() >= 0
                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>{t('tools.weddingPlanner.remaining', 'Remaining')}</div>
                    <div className={`text-2xl font-bold ${
                      data.totalBudget - getTotalSpent() >= 0
                        ? isDark ? 'text-blue-300' : 'text-blue-700'
                        : isDark ? 'text-red-300' : 'text-red-700'
                    }`}>
                      ${(data.totalBudget - getTotalSpent()).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Category Budgets */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.weddingPlanner.categoryBudgets', 'Category Budgets')}
                  </h3>
                  <div className="space-y-4">
                    {BUDGET_CATEGORIES.map(cat => {
                      const allocated = getCategoryBudget(cat.value);
                      const spent = getSpentByCategory(cat.value);
                      const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;

                      return (
                        <div key={cat.value} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                ${spent.toLocaleString()} /
                              </span>
                              <input
                                type="number"
                                value={allocated || ''}
                                onChange={(e) => updateCategoryBudget(cat.value, parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className={`w-24 px-2 py-1 text-right rounded border ${
                                  isDark
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-pink-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Expense */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.weddingPlanner.expenses', 'Expenses')}
                    </h3>
                    <button
                      onClick={() => setShowAddExpense(!showAddExpense)}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.weddingPlanner.addExpense', 'Add Expense')}
                    </button>
                  </div>

                  {showAddExpense && (
                    <ExpenseForm
                      isDark={isDark}
                      onSubmit={addExpense}
                      onCancel={() => setShowAddExpense(false)}
                    />
                  )}

                  {/* Expense List */}
                  <div className="space-y-2">
                    {data.expenses.length === 0 ? (
                      <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.weddingPlanner.noExpensesAddedYet', 'No expenses added yet')}
                      </p>
                    ) : (
                      data.expenses.map(expense => (
                        <div
                          key={expense.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isDark ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {expense.description}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {BUDGET_CATEGORIES.find(c => c.value === expense.category)?.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${expense.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Guests Tab */}
            {activeTab === 'guests' && (
              <div className="space-y-6">
                {/* Guest Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingPlanner.totalInvited', 'Total Invited')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getTotalGuests()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.weddingPlanner.confirmed', 'Confirmed')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      {getConfirmedGuests()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.weddingPlanner.pending', 'Pending')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      {getPendingGuests()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{t('tools.weddingPlanner.declined', 'Declined')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      {getDeclinedGuests()}
                    </div>
                  </div>
                </div>

                {/* Filter and Add */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <select
                      value={guestFilter}
                      onChange={(e) => setGuestFilter(e.target.value as RSVPStatus | 'all')}
                      className={`px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">{t('tools.weddingPlanner.allGuests', 'All Guests')}</option>
                      <option value="pending">{t('tools.weddingPlanner.pending2', 'Pending')}</option>
                      <option value="confirmed">{t('tools.weddingPlanner.confirmed2', 'Confirmed')}</option>
                      <option value="declined">{t('tools.weddingPlanner.declined2', 'Declined')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddGuest(!showAddGuest)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('tools.weddingPlanner.addGuest2', 'Add Guest')}
                  </button>
                </div>

                {showAddGuest && (
                  <GuestForm
                    isDark={isDark}
                    onSubmit={addGuest}
                    onCancel={() => setShowAddGuest(false)}
                  />
                )}

                {/* Guest List */}
                <div className="space-y-3">
                  {filteredGuests.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.weddingPlanner.noGuestsFound', 'No guests found')}
                    </p>
                  ) : (
                    filteredGuests.map(guest => (
                      <div
                        key={guest.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {editingGuest === guest.id ? (
                          <GuestForm
                            isDark={isDark}
                            initialData={guest}
                            onSubmit={(data) => updateGuest(guest.id, data)}
                            onCancel={() => setEditingGuest(null)}
                            isEdit
                          />
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {guest.name}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  guest.rsvpStatus === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : guest.rsvpStatus === 'declined'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {guest.rsvpStatus}
                                </span>
                              </div>
                              <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {guest.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {guest.email}
                                  </div>
                                )}
                                {guest.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {guest.phone}
                                  </div>
                                )}
                                <div>Party size: {guest.partySize}</div>
                                {guest.mealPreference && <div>Meal: {guest.mealPreference}</div>}
                                {guest.tableAssignment && <div>Table: {guest.tableAssignment}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={guest.rsvpStatus}
                                onChange={(e) => updateGuest(guest.id, { rsvpStatus: e.target.value as RSVPStatus })}
                                className={`px-2 py-1 text-sm rounded border ${
                                  isDark
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="pending">{t('tools.weddingPlanner.pending3', 'Pending')}</option>
                                <option value="confirmed">{t('tools.weddingPlanner.confirmed3', 'Confirmed')}</option>
                                <option value="declined">{t('tools.weddingPlanner.declined3', 'Declined')}</option>
                              </select>
                              <button
                                onClick={() => setEditingGuest(guest.id)}
                                className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteGuest(guest.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                {/* Progress */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.weddingPlanner.overallProgress', 'Overall Progress')}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getCompletedTasks()} / {data.checklist.length} tasks completed
                    </span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-pink-500 rounded-full transition-all"
                      style={{ width: `${data.checklist.length > 0 ? (getCompletedTasks() / data.checklist.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Add Task Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.weddingPlanner.addTask', 'Add Task')}
                  </button>
                </div>

                {showAddTask && (
                  <TaskForm
                    isDark={isDark}
                    onSubmit={addTask}
                    onCancel={() => setShowAddTask(false)}
                  />
                )}

                {/* Grouped Checklist */}
                <div className="space-y-4">
                  {Object.entries(groupedChecklist).map(([timeline, items]) => (
                    <div key={timeline} className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <button
                        onClick={() => setExpandedTimelines(prev =>
                          prev.includes(timeline)
                            ? prev.filter(t => t !== timeline)
                            : [...prev, timeline]
                        )}
                        className={`w-full flex items-center justify-between p-4 ${
                          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {timeline}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({items.filter(i => i.completed).length}/{items.length} completed)
                          </span>
                        </div>
                        {expandedTimelines.includes(timeline) ? (
                          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>

                      {expandedTimelines.includes(timeline) && (
                        <div className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          {items.map(item => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 p-4 ${
                                isDark ? 'border-b border-gray-600 last:border-0' : 'border-b border-gray-200 last:border-0'
                              }`}
                            >
                              <button
                                onClick={() => toggleChecklistItem(item.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  item.completed
                                    ? 'bg-pink-500 border-pink-500 text-white'
                                    : isDark
                                      ? 'border-gray-500 hover:border-pink-500'
                                      : 'border-gray-300 hover:border-pink-500'
                                }`}
                              >
                                {item.completed && <Check className="w-4 h-4" />}
                              </button>
                              <div className="flex-1">
                                <span className={`${
                                  item.completed
                                    ? isDark ? 'text-gray-500 line-through' : 'text-gray-400 line-through'
                                    : isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {item.task}
                                </span>
                                {item.dueDate && (
                                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => deleteTask(item.id)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddVendor(!showAddVendor)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.weddingPlanner.addVendor', 'Add Vendor')}
                  </button>
                </div>

                {showAddVendor && (
                  <VendorForm
                    isDark={isDark}
                    onSubmit={addVendor}
                    onCancel={() => setShowAddVendor(false)}
                  />
                )}

                {/* Vendor List */}
                <div className="space-y-4">
                  {data.vendors.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.weddingPlanner.noVendorsAddedYet', 'No vendors added yet')}
                    </p>
                  ) : (
                    data.vendors.map(vendor => (
                      <div
                        key={vendor.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {editingVendor === vendor.id ? (
                          <VendorForm
                            isDark={isDark}
                            initialData={vendor}
                            onSubmit={(data) => updateVendor(vendor.id, data)}
                            onCancel={() => setEditingVendor(null)}
                            isEdit
                          />
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {vendor.name}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  vendor.status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : vendor.status === 'booked'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {vendor.status}
                                </span>
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {vendor.service}
                              </div>
                              <div className={`text-sm space-y-1 mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {vendor.contact && <div>Contact: {vendor.contact}</div>}
                                {vendor.email && <div>Email: {vendor.email}</div>}
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  Price: ${vendor.price.toLocaleString()}
                                </div>
                                {vendor.contractDate && <div>Contract Date: {new Date(vendor.contractDate).toLocaleDateString()}</div>}
                                {vendor.paymentDueDate && <div>Payment Due: {new Date(vendor.paymentDueDate).toLocaleDateString()}</div>}
                                {vendor.notes && <div className="italic">{vendor.notes}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={vendor.status}
                                onChange={(e) => updateVendor(vendor.id, { status: e.target.value as VendorStatus })}
                                className={`px-2 py-1 text-sm rounded border ${
                                  isDark
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="contacted">{t('tools.weddingPlanner.contacted', 'Contacted')}</option>
                                <option value="booked">{t('tools.weddingPlanner.booked', 'Booked')}</option>
                                <option value="paid">{t('tools.weddingPlanner.paid', 'Paid')}</option>
                              </select>
                              <button
                                onClick={() => setEditingVendor(vendor.id)}
                                className={`p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteVendor(vendor.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Seating Tab */}
            {activeTab === 'seating' && (
              <div className="space-y-6">
                {/* Seating Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingPlanner.tables', 'Tables')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {data.tables.length}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.weddingPlanner.assignedGuests', 'Assigned Guests')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      {getAssignedGuests()}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.weddingPlanner.unassigned', 'Unassigned')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      {getUnassignedGuests()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddTable(!showAddTable)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.weddingPlanner.addTable', 'Add Table')}
                  </button>
                </div>

                {showAddTable && (
                  <TableForm
                    isDark={isDark}
                    onSubmit={addTable}
                    onCancel={() => setShowAddTable(false)}
                  />
                )}

                {/* Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.tables.map(table => (
                    <div
                      key={table.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {table.name}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {table.guests.length} / {table.capacity} seats
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTable(table.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Capacity Bar */}
                      <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all ${
                            table.guests.length >= table.capacity ? 'bg-green-500' : 'bg-pink-500'
                          }`}
                          style={{ width: `${(table.guests.length / table.capacity) * 100}%` }}
                        />
                      </div>

                      {/* Assigned Guests */}
                      <div className="space-y-2 mb-3">
                        {table.guests.map(guestId => {
                          const guest = data.guests.find(g => g.id === guestId);
                          if (!guest) return null;
                          return (
                            <div
                              key={guestId}
                              className={`flex items-center justify-between px-2 py-1 rounded ${
                                isDark ? 'bg-gray-600' : 'bg-gray-100'
                              }`}
                            >
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {guest.name}
                              </span>
                              <button
                                onClick={() => removeGuestFromTable(guestId, table.id)}
                                className="p-1 text-gray-500 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Guest to Table */}
                      {table.guests.length < table.capacity && (
                        <select
                          value=""
                          onChange={(e) => assignGuestToTable(e.target.value, table.id)}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">{t('tools.weddingPlanner.addGuest', 'Add guest...')}</option>
                          {data.guests
                            .filter(g => g.rsvpStatus === 'confirmed' && !table.guests.includes(g.id))
                            .map(guest => (
                              <option key={guest.id} value={guest.id}>
                                {guest.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                {data.tables.length === 0 && (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.weddingPlanner.noTablesCreatedYetAdd', 'No tables created yet. Add tables to start creating your seating chart.')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Components
interface ExpenseFormProps {
  isDark: boolean;
  onSubmit: (expense: Omit<BudgetItem, 'id'>) => void;
  onCancel: () => void;
}

const ExpenseForm = ({ isDark, onSubmit, onCancel }: ExpenseFormProps) => {
  const [category, setCategory] = useState<BudgetCategory>('other');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSubmit({ category, description, amount: parseFloat(amount) });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as BudgetCategory)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {BUDGET_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('tools.weddingPlanner.description', 'Description')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t('tools.weddingPlanner.amount', 'Amount')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.weddingPlanner.cancel', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
        >
          {t('tools.weddingPlanner.addExpense2', 'Add Expense')}
        </button>
      </div>
    </form>
  );
};

interface GuestFormProps {
  isDark: boolean;
  initialData?: Guest;
  onSubmit: (guest: Omit<Guest, 'id'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const GuestForm = ({ isDark, initialData, onSubmit, onCancel, isEdit }: GuestFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [partySize, setPartySize] = useState(initialData?.partySize?.toString() || '1');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(initialData?.rsvpStatus || 'pending');
  const [mealPreference, setMealPreference] = useState(initialData?.mealPreference || '');
  const [tableAssignment, setTableAssignment] = useState(initialData?.tableAssignment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      email,
      phone,
      partySize: parseInt(partySize) || 1,
      rsvpStatus,
      mealPreference,
      tableAssignment
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tools.weddingPlanner.guestName', 'Guest Name *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('tools.weddingPlanner.email', 'Email')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('tools.weddingPlanner.phone', 'Phone')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
          placeholder={t('tools.weddingPlanner.partySize', 'Party Size')}
          min="1"
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <select
          value={rsvpStatus}
          onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="pending">{t('tools.weddingPlanner.pending4', 'Pending')}</option>
          <option value="confirmed">{t('tools.weddingPlanner.confirmed4', 'Confirmed')}</option>
          <option value="declined">{t('tools.weddingPlanner.declined4', 'Declined')}</option>
        </select>
        <input
          type="text"
          value={mealPreference}
          onChange={(e) => setMealPreference(e.target.value)}
          placeholder={t('tools.weddingPlanner.mealPreference', 'Meal Preference')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.weddingPlanner.cancel2', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? t('tools.weddingPlanner.saveChanges', 'Save Changes') : t('tools.weddingPlanner.addGuest3', 'Add Guest')}
        </button>
      </div>
    </form>
  );
};

interface TaskFormProps {
  isDark: boolean;
  onSubmit: (task: Omit<ChecklistItem, 'id'>) => void;
  onCancel: () => void;
}

const TaskForm = ({ isDark, onSubmit, onCancel }: TaskFormProps) => {
  const [task, setTask] = useState('');
  const [timeline, setTimeline] = useState('6 months');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    onSubmit({ task, timeline, dueDate, completed: false });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder={t('tools.weddingPlanner.taskDescription', 'Task description *')}
          className={`md:col-span-2 px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <select
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="12 months">12 months out</option>
          <option value="10 months">10 months out</option>
          <option value="9 months">9 months out</option>
          <option value="8 months">8 months out</option>
          <option value="6 months">6 months out</option>
          <option value="3 months">3 months out</option>
          <option value="1 month">1 month out</option>
          <option value="Week of">{t('tools.weddingPlanner.weekOfWedding', 'Week of wedding')}</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.weddingPlanner.cancel3', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
        >
          {t('tools.weddingPlanner.addTask2', 'Add Task')}
        </button>
      </div>
    </form>
  );
};

interface VendorFormProps {
  isDark: boolean;
  initialData?: Vendor;
  onSubmit: (vendor: Omit<Vendor, 'id'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const VendorForm = ({ isDark, initialData, onSubmit, onCancel, isEdit }: VendorFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [service, setService] = useState(initialData?.service || '');
  const [contact, setContact] = useState(initialData?.contact || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [status, setStatus] = useState<VendorStatus>(initialData?.status || 'contacted');
  const [contractDate, setContractDate] = useState(initialData?.contractDate || '');
  const [paymentDueDate, setPaymentDueDate] = useState(initialData?.paymentDueDate || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !service) return;
    onSubmit({
      name,
      service,
      contact,
      email,
      price: parseFloat(price) || 0,
      status,
      contractDate,
      paymentDueDate,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tools.weddingPlanner.vendorName', 'Vendor Name *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder={t('tools.weddingPlanner.serviceEGPhotographerDj', 'Service (e.g., Photographer, DJ) *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={t('tools.weddingPlanner.contactName', 'Contact Name')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('tools.weddingPlanner.email2', 'Email')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t('tools.weddingPlanner.price', 'Price')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as VendorStatus)}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="contacted">{t('tools.weddingPlanner.contacted2', 'Contacted')}</option>
          <option value="booked">{t('tools.weddingPlanner.booked2', 'Booked')}</option>
          <option value="paid">{t('tools.weddingPlanner.paid2', 'Paid')}</option>
        </select>
        <input
          type="date"
          value={contractDate}
          onChange={(e) => setContractDate(e.target.value)}
          placeholder={t('tools.weddingPlanner.contractDate', 'Contract Date')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="date"
          value={paymentDueDate}
          onChange={(e) => setPaymentDueDate(e.target.value)}
          placeholder={t('tools.weddingPlanner.paymentDueDate', 'Payment Due Date')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('tools.weddingPlanner.notes', 'Notes')}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border mb-4 ${
          isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
        }`}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.weddingPlanner.cancel4', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? t('tools.weddingPlanner.saveChanges2', 'Save Changes') : t('tools.weddingPlanner.addVendor2', 'Add Vendor')}
        </button>
      </div>
    </form>
  );
};

interface TableFormProps {
  isDark: boolean;
  onSubmit: (table: Omit<SeatingTable, 'id'>) => void;
  onCancel: () => void;
}

const TableForm = ({ isDark, onSubmit, onCancel }: TableFormProps) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('8');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, capacity: parseInt(capacity) || 8, guests: [] });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tools.weddingPlanner.tableNameEGTable', 'Table Name (e.g., Table 1, Head Table) *')}
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder={t('tools.weddingPlanner.capacity', 'Capacity')}
          min="1"
          max="20"
          className={`px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {t('tools.weddingPlanner.cancel5', 'Cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
        >
          {t('tools.weddingPlanner.addTable2', 'Add Table')}
        </button>
      </div>
    </form>
  );
};

export default WeddingPlannerTool;
