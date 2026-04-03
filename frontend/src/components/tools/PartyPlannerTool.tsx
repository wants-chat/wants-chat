import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PartyPopper,
  Users,
  UtensilsCrossed,
  Wine,
  Armchair,
  Sparkles,
  Clock,
  DollarSign,
  UserCheck,
  Plus,
  Trash2,
  Check,
  X,
  Info,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface PartyPlannerToolProps {
  uiConfig?: UIConfig;
}

type PartyType = 'birthday' | 'wedding' | 'corporate' | 'casual' | 'dinner' | 'holiday';
type TabType = 'overview' | 'food' | 'seating' | 'decorations' | 'timeline' | 'budget' | 'rsvp';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'declined';
  dietaryRestrictions?: string;
}

interface TimelineItem {
  id: string;
  time: string;
  activity: string;
  completed: boolean;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimated: number;
  actual: number;
}

interface DecorationItem {
  id: string;
  item: string;
  quantity: number;
  checked: boolean;
}

interface PartyConfig {
  name: string;
  foodPerPerson: number; // grams
  drinksPerPerson: number; // ml
  seatingPerTable: number;
  suggestedDecorations: string[];
}

// Combined party data for sync
interface PartyData {
  id: string;
  partyType: PartyType;
  guestCount: string;
  partyDuration: string;
  guests: Guest[];
  timeline: TimelineItem[];
  budgetItems: BudgetItem[];
  decorations: DecorationItem[];
  updatedAt: string;
}

// Column definitions for export
const GUEST_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Guest Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'status', header: 'RSVP Status', type: 'string' },
  { key: 'dietaryRestrictions', header: 'Dietary Restrictions', type: 'string' },
];

const BUDGET_COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'estimated', header: 'Estimated ($)', type: 'currency' },
  { key: 'actual', header: 'Actual ($)', type: 'currency' },
];

const TIMELINE_COLUMNS: ColumnConfig[] = [
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'activity', header: 'Activity', type: 'string' },
  { key: 'completed', header: 'Completed', type: 'boolean' },
];

const DECORATION_COLUMNS: ColumnConfig[] = [
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'checked', header: 'Acquired', type: 'boolean' },
];

// Columns for the main party data (for sync purposes)
const PARTY_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'partyType', header: 'Party Type', type: 'string' },
  { key: 'guestCount', header: 'Guest Count', type: 'string' },
  { key: 'partyDuration', header: 'Duration', type: 'string' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

// Default timeline items
const DEFAULT_TIMELINE: TimelineItem[] = [
  { id: '1', time: '18:00', activity: 'Setup and decorations', completed: false },
  { id: '2', time: '19:00', activity: 'Guests arrive', completed: false },
  { id: '3', time: '19:30', activity: 'Welcome drinks', completed: false },
  { id: '4', time: '20:00', activity: 'Dinner served', completed: false },
  { id: '5', time: '21:30', activity: 'Cake cutting', completed: false },
  { id: '6', time: '22:00', activity: 'Dancing and music', completed: false },
  { id: '7', time: '23:00', activity: 'Party ends', completed: false },
];

// Default budget items
const DEFAULT_BUDGET: BudgetItem[] = [
  { id: '1', category: 'Venue', description: 'Venue rental', estimated: 500, actual: 0 },
  { id: '2', category: 'Food', description: 'Catering', estimated: 400, actual: 0 },
  { id: '3', category: 'Drinks', description: 'Beverages', estimated: 200, actual: 0 },
  { id: '4', category: 'Decorations', description: 'Balloons, banners, etc.', estimated: 100, actual: 0 },
  { id: '5', category: 'Entertainment', description: 'DJ/Music', estimated: 300, actual: 0 },
];

// Default decorations
const DEFAULT_DECORATIONS: DecorationItem[] = [
  { id: '1', item: 'Balloons', quantity: 50, checked: false },
  { id: '2', item: 'Streamers', quantity: 10, checked: false },
  { id: '3', item: 'Table cloths', quantity: 5, checked: false },
  { id: '4', item: 'Centerpieces', quantity: 5, checked: false },
  { id: '5', item: 'Banner', quantity: 1, checked: false },
  { id: '6', item: 'Candles', quantity: 20, checked: false },
];

// Default party data
const DEFAULT_PARTY_DATA: PartyData[] = [{
  id: 'main-party',
  partyType: 'birthday',
  guestCount: '20',
  partyDuration: '4',
  guests: [],
  timeline: DEFAULT_TIMELINE,
  budgetItems: DEFAULT_BUDGET,
  decorations: DEFAULT_DECORATIONS,
  updatedAt: new Date().toISOString(),
}];

export const PartyPlannerTool: React.FC<PartyPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: partyDataArray,
    updateItem: updatePartyData,
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
  } = useToolData<PartyData>('party-planner', DEFAULT_PARTY_DATA, PARTY_COLUMNS);

  // Get the current party data (we use a single party for now)
  const partyData = partyDataArray[0] || DEFAULT_PARTY_DATA[0];

  // Derived state from partyData
  const partyType = partyData.partyType;
  const guestCount = partyData.guestCount;
  const partyDuration = partyData.partyDuration;
  const guests = partyData.guests;
  const timeline = partyData.timeline;
  const budgetItems = partyData.budgetItems;
  const decorations = partyData.decorations;

  // Local UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newTimelineTime, setNewTimelineTime] = useState('');
  const [newTimelineActivity, setNewTimelineActivity] = useState('');
  const [newDecorationItem, setNewDecorationItem] = useState('');
  const [newDecorationQuantity, setNewDecorationQuantity] = useState('1');

  // Helper function to update party data
  const updateParty = (updates: Partial<PartyData>) => {
    updatePartyData('main-party', {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  // Setters that update the synced data
  const setPartyType = (type: PartyType) => updateParty({ partyType: type });
  const setGuestCount = (count: string) => updateParty({ guestCount: count });
  const setPartyDuration = (duration: string) => updateParty({ partyDuration: duration });
  const setGuests = (newGuests: Guest[] | ((prev: Guest[]) => Guest[])) => {
    const updated = typeof newGuests === 'function' ? newGuests(guests) : newGuests;
    updateParty({ guests: updated });
  };
  const setTimeline = (newTimeline: TimelineItem[] | ((prev: TimelineItem[]) => TimelineItem[])) => {
    const updated = typeof newTimeline === 'function' ? newTimeline(timeline) : newTimeline;
    updateParty({ timeline: updated });
  };
  const setBudgetItems = (newBudget: BudgetItem[] | ((prev: BudgetItem[]) => BudgetItem[])) => {
    const updated = typeof newBudget === 'function' ? newBudget(budgetItems) : newBudget;
    updateParty({ budgetItems: updated });
  };
  const setDecorations = (newDecorations: DecorationItem[] | ((prev: DecorationItem[]) => DecorationItem[])) => {
    const updated = typeof newDecorations === 'function' ? newDecorations(decorations) : newDecorations;
    updateParty({ decorations: updated });
  };

  const partyConfigs: Record<PartyType, PartyConfig> = {
    birthday: {
      name: 'Birthday Party',
      foodPerPerson: 400,
      drinksPerPerson: 500,
      seatingPerTable: 8,
      suggestedDecorations: ['Balloons', 'Birthday banner', 'Cake stand', 'Party hats', 'Confetti'],
    },
    wedding: {
      name: 'Wedding Reception',
      foodPerPerson: 600,
      drinksPerPerson: 750,
      seatingPerTable: 10,
      suggestedDecorations: ['Floral arrangements', 'Table runners', 'Candles', 'Photo booth', 'Fairy lights'],
    },
    corporate: {
      name: 'Corporate Event',
      foodPerPerson: 350,
      drinksPerPerson: 400,
      seatingPerTable: 8,
      suggestedDecorations: ['Company banner', 'Branded items', 'Professional centerpieces', 'Name tags'],
    },
    casual: {
      name: 'Casual Gathering',
      foodPerPerson: 300,
      drinksPerPerson: 600,
      seatingPerTable: 6,
      suggestedDecorations: ['Simple decorations', 'Outdoor lights', 'Cushions', 'Blankets'],
    },
    dinner: {
      name: 'Dinner Party',
      foodPerPerson: 500,
      drinksPerPerson: 400,
      seatingPerTable: 6,
      suggestedDecorations: ['Elegant tablecloth', 'Candles', 'Wine glasses', 'Place cards', 'Napkin rings'],
    },
    holiday: {
      name: 'Holiday Party',
      foodPerPerson: 450,
      drinksPerPerson: 550,
      seatingPerTable: 8,
      suggestedDecorations: ['Themed decorations', 'Lights', 'Garlands', 'Themed tableware', 'Music playlist'],
    },
  };

  const config = partyConfigs[partyType];
  const numGuests = parseInt(guestCount) || 0;
  const duration = parseInt(partyDuration) || 4;

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.partyType && ['birthday', 'wedding', 'corporate', 'casual', 'dinner', 'holiday'].includes(params.partyType)) {
        setPartyType(params.partyType as PartyType);
        hasChanges = true;
      }
      if (params.guestCount !== undefined) {
        setGuestCount(String(params.guestCount));
        hasChanges = true;
      }
      if (params.duration !== undefined) {
        setPartyDuration(String(params.duration));
        hasChanges = true;
      }
      if (params.tab && ['overview', 'food', 'seating', 'decorations', 'timeline', 'budget', 'rsvp'].includes(params.tab)) {
        setActiveTab(params.tab as TabType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const totalFood = (numGuests * config.foodPerPerson) / 1000; // kg
    const totalDrinks = (numGuests * config.drinksPerPerson * (duration / 4)) / 1000; // liters
    const tablesNeeded = Math.ceil(numGuests / config.seatingPerTable);

    // Food breakdown
    const appetizersPortion = totalFood * 0.2;
    const mainCoursePortion = totalFood * 0.5;
    const dessertPortion = totalFood * 0.15;
    const sidesPortion = totalFood * 0.15;

    // Drinks breakdown
    const softDrinks = totalDrinks * 0.4;
    const alcoholicDrinks = totalDrinks * 0.4;
    const water = totalDrinks * 0.2;

    return {
      totalFood: totalFood.toFixed(1),
      totalDrinks: totalDrinks.toFixed(1),
      tablesNeeded,
      appetizers: appetizersPortion.toFixed(1),
      mainCourse: mainCoursePortion.toFixed(1),
      dessert: dessertPortion.toFixed(1),
      sides: sidesPortion.toFixed(1),
      softDrinks: softDrinks.toFixed(1),
      alcoholicDrinks: alcoholicDrinks.toFixed(1),
      water: water.toFixed(1),
    };
  }, [numGuests, config, duration]);

  const rsvpStats = useMemo(() => {
    const confirmed = guests.filter(g => g.status === 'confirmed').length;
    const declined = guests.filter(g => g.status === 'declined').length;
    const pending = guests.filter(g => g.status === 'pending').length;
    return { confirmed, declined, pending, total: guests.length };
  }, [guests]);

  const budgetStats = useMemo(() => {
    const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimated, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actual, 0);
    const remaining = totalEstimated - totalActual;
    return { totalEstimated, totalActual, remaining };
  }, [budgetItems]);

  const decorationStats = useMemo(() => {
    const total = decorations.length;
    const checked = decorations.filter(d => d.checked).length;
    return { total, checked, remaining: total - checked };
  }, [decorations]);

  // Get export data based on active tab - uses the tab-specific columns for exports
  const getExportConfig = () => {
    switch (activeTab) {
      case 'rsvp':
        return { data: guests, columns: GUEST_COLUMNS, name: 'party_guests' };
      case 'budget':
        return { data: budgetItems, columns: BUDGET_COLUMNS, name: 'party_budget' };
      case 'timeline':
        return { data: timeline, columns: TIMELINE_COLUMNS, name: 'party_timeline' };
      case 'decorations':
        return { data: decorations, columns: DECORATION_COLUMNS, name: 'party_decorations' };
      default:
        // For overview and other tabs, export guests as default
        return { data: guests, columns: GUEST_COLUMNS, name: 'party_guests' };
    }
  };

  // Guest Management
  const addGuest = () => {
    if (newGuestName.trim()) {
      setGuests([...guests, {
        id: Date.now().toString(),
        name: newGuestName,
        email: newGuestEmail,
        status: 'pending',
      }]);
      setNewGuestName('');
      setNewGuestEmail('');
    }
  };

  const updateGuestStatus = (id: string, status: Guest['status']) => {
    setGuests(guests.map(g => g.id === id ? { ...g, status } : g));
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  // Timeline Management
  const addTimelineItem = () => {
    if (newTimelineTime && newTimelineActivity.trim()) {
      setTimeline([...timeline, {
        id: Date.now().toString(),
        time: newTimelineTime,
        activity: newTimelineActivity,
        completed: false,
      }].sort((a, b) => a.time.localeCompare(b.time)));
      setNewTimelineTime('');
      setNewTimelineActivity('');
    }
  };

  const toggleTimelineItem = (id: string) => {
    setTimeline(timeline.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTimelineItem = (id: string) => {
    setTimeline(timeline.filter(t => t.id !== id));
  };

  // Budget Management
  const updateBudgetActual = (id: string, actual: number) => {
    setBudgetItems(budgetItems.map(b => b.id === id ? { ...b, actual } : b));
  };

  // Decoration Management
  const addDecoration = () => {
    if (newDecorationItem.trim()) {
      setDecorations([...decorations, {
        id: Date.now().toString(),
        item: newDecorationItem,
        quantity: parseInt(newDecorationQuantity) || 1,
        checked: false,
      }]);
      setNewDecorationItem('');
      setNewDecorationQuantity('1');
    }
  };

  const toggleDecoration = (id: string) => {
    setDecorations(decorations.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  const removeDecoration = (id: string) => {
    setDecorations(decorations.filter(d => d.id !== id));
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'food', label: 'Food & Drinks', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'seating', label: 'Seating', icon: <Armchair className="w-4 h-4" /> },
    { id: 'decorations', label: 'Decorations', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'rsvp', label: 'RSVP', icon: <UserCheck className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><PartyPopper className="w-5 h-5 text-pink-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.partyPlanner', 'Party Planner')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.partyPlanner.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.partyPlanner.planThePerfectPartyWith', 'Plan the perfect party with ease')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="party-planner" toolName="Party Planner" />

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
              onExportCSV={() => {
                const { name } = getExportConfig();
                exportCSV({ filename: name });
              }}
              onExportExcel={() => {
                const { name } = getExportConfig();
                exportExcel({ filename: name });
              }}
              onExportJSON={() => {
                const { name } = getExportConfig();
                exportJSON({ filename: name });
              }}
              onExportPDF={async () => {
                const { name } = getExportConfig();
                await exportPDF({
                  filename: name,
                  title: `Party Planner - ${config.name}`,
                  subtitle: `${numGuests} guests | ${duration} hours`,
                });
              }}
              onPrint={() => print(`Party Planner - ${config.name}`)}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Party Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(partyConfigs) as PartyType[]).map((type) => (
            <button
              key={type}
              onClick={() => setPartyType(type)}
              className={`py-2 px-3 rounded-lg text-sm ${partyType === type ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {partyConfigs[type].name}
            </button>
          ))}
        </div>

        {/* Guest Count and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.partyPlanner.expectedGuests', 'Expected Guests')}
            </label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.partyPlanner.durationHours', 'Duration (hours)')}
            </label>
            <input
              type="number"
              value={partyDuration}
              onChange={(e) => setPartyDuration(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Planning for <strong>{numGuests} guests</strong> over <strong>{duration} hours</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.totalFood', 'Total Food')}</span>
                </div>
                <div className="text-3xl font-bold text-orange-500">{calculations.totalFood}kg</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wine className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.totalDrinks', 'Total Drinks')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.totalDrinks}L</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Armchair className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.tablesNeeded', 'Tables Needed')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{calculations.tablesNeeded}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {config.seatingPerTable} per table
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.rsvps', 'RSVPs')}</span>
                </div>
                <div className="text-3xl font-bold text-green-500">{rsvpStats.confirmed}/{rsvpStats.total}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  confirmed
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.budgetSummary', 'Budget Summary')}</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.estimated', 'Estimated')}</div>
                  <div className="text-xl font-bold text-green-500">${budgetStats.totalEstimated}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.spent', 'Spent')}</div>
                  <div className="text-xl font-bold text-orange-500">${budgetStats.totalActual}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.remaining', 'Remaining')}</div>
                  <div className={`text-xl font-bold ${budgetStats.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${budgetStats.remaining}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Food & Drinks Tab */}
        {activeTab === 'food' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.foodBreakdown', 'Food Breakdown')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.appetizers', 'Appetizers')}</div>
                  <div className="text-xl font-bold text-orange-500">{calculations.appetizers}kg</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.mainCourse', 'Main Course')}</div>
                  <div className="text-xl font-bold text-orange-500">{calculations.mainCourse}kg</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.sides', 'Sides')}</div>
                  <div className="text-xl font-bold text-orange-500">{calculations.sides}kg</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.dessert', 'Dessert')}</div>
                  <div className="text-xl font-bold text-orange-500">{calculations.dessert}kg</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.drinksBreakdown', 'Drinks Breakdown')}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.softDrinks', 'Soft Drinks')}</div>
                  <div className="text-xl font-bold text-purple-500">{calculations.softDrinks}L</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.alcoholic', 'Alcoholic')}</div>
                  <div className="text-xl font-bold text-purple-500">{calculations.alcoholicDrinks}L</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.water', 'Water')}</div>
                  <div className="text-xl font-bold text-purple-500">{calculations.water}L</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.partyPlanner.tips', 'Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Order 10-15% extra food for safety</li>
                    <li>• Consider dietary restrictions and allergies</li>
                    <li>• Have vegetarian/vegan options available</li>
                    <li>• Keep drinks chilled and accessible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seating Tab */}
        {activeTab === 'seating' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.seatingArrangement', 'Seating Arrangement')}</h4>
                <span className="text-blue-500 font-bold">{calculations.tablesNeeded} tables</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.guestsPerTable', 'Guests per table')}</div>
                  <div className="text-2xl font-bold text-blue-500">{config.seatingPerTable}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.totalCapacity', 'Total capacity')}</div>
                  <div className="text-2xl font-bold text-blue-500">{calculations.tablesNeeded * config.seatingPerTable}</div>
                </div>
              </div>
            </div>

            {/* Visual Table Layout */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.tableLayoutPreview', 'Table Layout Preview')}</h5>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: calculations.tablesNeeded }).map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}
                  >
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      T{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.partyPlanner.seatingTips', 'Seating Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Mix different groups to encourage mingling</li>
                    <li>• Keep families with kids near exits</li>
                    <li>• Reserve a table near the host for close family</li>
                    <li>• Consider mobility needs for accessible seating</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decorations Tab */}
        {activeTab === 'decorations' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.partyPlanner.decorationChecklist', 'Decoration Checklist')}</h4>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {decorationStats.checked}/{decorationStats.total} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(decorationStats.checked / decorationStats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Add new decoration */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDecorationItem}
                onChange={(e) => setNewDecorationItem(e.target.value)}
                placeholder={t('tools.partyPlanner.addDecorationItem', 'Add decoration item')}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`}
              />
              <input
                type="number"
                value={newDecorationQuantity}
                onChange={(e) => setNewDecorationQuantity(e.target.value)}
                placeholder={t('tools.partyPlanner.qty', 'Qty')}
                className={`w-20 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={addDecoration}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Decoration list */}
            <div className="space-y-2">
              {decorations.map((decoration) => (
                <div
                  key={decoration.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <button
                    onClick={() => toggleDecoration(decoration.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${decoration.checked ? 'bg-pink-500 border-pink-500' : isDark ? 'border-gray-600' : 'border-gray-300'}`}
                  >
                    {decoration.checked && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 ${decoration.checked ? 'line-through' : ''} ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {decoration.item}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    x{decoration.quantity}
                  </span>
                  <button
                    onClick={() => removeDecoration(decoration.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Suggested decorations */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Suggested for {config.name}</h5>
              <div className="flex flex-wrap gap-2">
                {config.suggestedDecorations.map((suggestion, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Add new timeline item */}
            <div className="flex gap-2">
              <input
                type="time"
                value={newTimelineTime}
                onChange={(e) => setNewTimelineTime(e.target.value)}
                className={`w-32 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="text"
                value={newTimelineActivity}
                onChange={(e) => setNewTimelineActivity(e.target.value)}
                placeholder={t('tools.partyPlanner.addActivity', 'Add activity')}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={addTimelineItem}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline list */}
            <div className="relative">
              <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 relative">
                    <button
                      onClick={() => toggleTimelineItem(item.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${item.completed ? 'bg-green-500 border-green-500' : isDark ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      {item.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${item.completed ? 'line-through text-gray-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.time} - {item.activity}
                        </span>
                        <button
                          onClick={() => removeTimelineItem(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            {/* Budget summary */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.estimated2', 'Estimated')}</div>
                  <div className="text-2xl font-bold text-green-500">${budgetStats.totalEstimated}</div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.spent2', 'Spent')}</div>
                  <div className="text-2xl font-bold text-orange-500">${budgetStats.totalActual}</div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.remaining2', 'Remaining')}</div>
                  <div className={`text-2xl font-bold ${budgetStats.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${budgetStats.remaining}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${budgetStats.totalActual > budgetStats.totalEstimated ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((budgetStats.totalActual / budgetStats.totalEstimated) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Budget items */}
            <div className="space-y-3">
              {budgetItems.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.category}</span>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Est: ${item.estimated}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.actual', 'Actual:')}</span>
                    <input
                      type="number"
                      value={item.actual}
                      onChange={(e) => updateBudgetActual(item.id, parseFloat(e.target.value) || 0)}
                      className={`flex-1 px-3 py-1 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Tab */}
        {activeTab === 'rsvp' && (
          <div className="space-y-4">
            {/* RSVP summary */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.total', 'Total')}</div>
                  <div className="text-2xl font-bold text-blue-500">{rsvpStats.total}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.confirmed', 'Confirmed')}</div>
                  <div className="text-2xl font-bold text-green-500">{rsvpStats.confirmed}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.pending', 'Pending')}</div>
                  <div className="text-2xl font-bold text-yellow-500">{rsvpStats.pending}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.partyPlanner.declined', 'Declined')}</div>
                  <div className="text-2xl font-bold text-red-500">{rsvpStats.declined}</div>
                </div>
              </div>
            </div>

            {/* Add guest form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder={t('tools.partyPlanner.guestName', 'Guest name')}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`}
              />
              <input
                type="email"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                placeholder={t('tools.partyPlanner.emailOptional', 'Email (optional)')}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={addGuest}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Guest list */}
            <div className="space-y-2">
              {guests.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <Users className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.partyPlanner.noGuestsAddedYet', 'No guests added yet')}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.partyPlanner.addGuestsToTrackRsvps', 'Add guests to track RSVPs')}</p>
                </div>
              ) : (
                guests.map((guest) => (
                  <div
                    key={guest.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex-1">
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</div>
                      {guest.email && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{guest.email}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateGuestStatus(guest.id, 'confirmed')}
                        className={`p-2 rounded-lg ${guest.status === 'confirmed' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        title={t('tools.partyPlanner.confirmed2', 'Confirmed')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateGuestStatus(guest.id, 'pending')}
                        className={`p-2 rounded-lg ${guest.status === 'pending' ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        title={t('tools.partyPlanner.pending2', 'Pending')}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateGuestStatus(guest.id, 'declined')}
                        className={`p-2 rounded-lg ${guest.status === 'declined' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        title={t('tools.partyPlanner.declined2', 'Declined')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeGuest(guest.id)}
                        className="p-2 text-red-500 hover:text-red-600"
                        title={t('tools.partyPlanner.remove', 'Remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyPlannerTool;
