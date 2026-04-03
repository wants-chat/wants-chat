import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Calendar, Plus, Trash2, Download, Clock, Sun, Leaf, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface SeedStartingToolProps {
  uiConfig?: UIConfig;
}

interface PlantData {
  id: string;
  name: string;
  category: string;
  indoorWeeksBefore: number;
  transplantWeeksAfter: number;
  directSowWeeksBefore: number | null;
  daysToMaturity: number;
  notes?: string;
}

// Storable version of TrackedPlant with serializable dates
interface StorableTrackedPlant {
  id: string;
  plantId: string;
  name: string;
  category: string;
  indoorWeeksBefore: number;
  transplantWeeksAfter: number;
  directSowWeeksBefore: number | null;
  daysToMaturity: number;
  notes?: string;
  indoorStartDate: string | null;
  transplantDate: string | null;
  directSowDate: string | null;
  harvestDate: string | null;
  createdAt: string;
}

interface TrackedPlant extends PlantData {
  trackingId: string;
  indoorStartDate: Date | null;
  transplantDate: Date | null;
  directSowDate: Date | null;
  harvestDate: Date | null;
}

const PLANTS_DATABASE: PlantData[] = [
  // Vegetables
  { id: 'tomato', name: 'Tomato', category: 'Vegetables', indoorWeeksBefore: 6, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 75, notes: 'Start indoors for best results' },
  { id: 'pepper', name: 'Pepper', category: 'Vegetables', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 70, notes: 'Peppers need warm soil to transplant' },
  { id: 'eggplant', name: 'Eggplant', category: 'Vegetables', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 80, notes: 'Start early, needs long growing season' },
  { id: 'cucumber', name: 'Cucumber', category: 'Vegetables', indoorWeeksBefore: 3, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 55, notes: 'Can direct sow after frost' },
  { id: 'squash', name: 'Squash', category: 'Vegetables', indoorWeeksBefore: 3, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 50, notes: 'Direct sow preferred' },
  { id: 'zucchini', name: 'Zucchini', category: 'Vegetables', indoorWeeksBefore: 3, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 45, notes: 'Fast grower, direct sow possible' },
  { id: 'pumpkin', name: 'Pumpkin', category: 'Vegetables', indoorWeeksBefore: 3, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 100, notes: 'Needs long growing season' },
  { id: 'lettuce', name: 'Lettuce', category: 'Vegetables', indoorWeeksBefore: 4, transplantWeeksAfter: 2, directSowWeeksBefore: 2, daysToMaturity: 45, notes: 'Cool season crop' },
  { id: 'spinach', name: 'Spinach', category: 'Vegetables', indoorWeeksBefore: 4, transplantWeeksAfter: 0, directSowWeeksBefore: 4, daysToMaturity: 40, notes: 'Prefers cool weather' },
  { id: 'kale', name: 'Kale', category: 'Vegetables', indoorWeeksBefore: 4, transplantWeeksAfter: 2, directSowWeeksBefore: 2, daysToMaturity: 55, notes: 'Frost tolerant' },
  { id: 'broccoli', name: 'Broccoli', category: 'Vegetables', indoorWeeksBefore: 6, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 70, notes: 'Start indoors for spring crop' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'Vegetables', indoorWeeksBefore: 6, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 75, notes: 'Needs consistent conditions' },
  { id: 'cabbage', name: 'Cabbage', category: 'Vegetables', indoorWeeksBefore: 6, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 70, notes: 'Cool season crop' },
  { id: 'carrot', name: 'Carrot', category: 'Vegetables', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 2, daysToMaturity: 70, notes: 'Direct sow only' },
  { id: 'beet', name: 'Beet', category: 'Vegetables', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 2, daysToMaturity: 55, notes: 'Direct sow only' },
  { id: 'radish', name: 'Radish', category: 'Vegetables', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 4, daysToMaturity: 25, notes: 'Fast growing, direct sow' },
  { id: 'onion', name: 'Onion', category: 'Vegetables', indoorWeeksBefore: 10, transplantWeeksAfter: 4, directSowWeeksBefore: null, daysToMaturity: 100, notes: 'Start very early indoors' },
  { id: 'beans', name: 'Green Beans', category: 'Vegetables', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 0, daysToMaturity: 55, notes: 'Direct sow after frost' },
  { id: 'peas', name: 'Peas', category: 'Vegetables', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 4, daysToMaturity: 60, notes: 'Cool season, direct sow early' },
  { id: 'corn', name: 'Corn', category: 'Vegetables', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 0, daysToMaturity: 80, notes: 'Direct sow after frost' },
  // Herbs
  { id: 'basil', name: 'Basil', category: 'Herbs', indoorWeeksBefore: 6, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 70, notes: 'Frost sensitive' },
  { id: 'parsley', name: 'Parsley', category: 'Herbs', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: 2, daysToMaturity: 75, notes: 'Slow to germinate' },
  { id: 'cilantro', name: 'Cilantro', category: 'Herbs', indoorWeeksBefore: 4, transplantWeeksAfter: 0, directSowWeeksBefore: 2, daysToMaturity: 50, notes: 'Bolts in heat' },
  { id: 'dill', name: 'Dill', category: 'Herbs', indoorWeeksBefore: 0, transplantWeeksAfter: 0, directSowWeeksBefore: 0, daysToMaturity: 60, notes: 'Direct sow preferred' },
  { id: 'oregano', name: 'Oregano', category: 'Herbs', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 80, notes: 'Perennial herb' },
  { id: 'thyme', name: 'Thyme', category: 'Herbs', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 90, notes: 'Slow to start' },
  { id: 'rosemary', name: 'Rosemary', category: 'Herbs', indoorWeeksBefore: 10, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 90, notes: 'Perennial, slow germination' },
  { id: 'mint', name: 'Mint', category: 'Herbs', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 90, notes: 'Spreads aggressively' },
  { id: 'chives', name: 'Chives', category: 'Herbs', indoorWeeksBefore: 8, transplantWeeksAfter: 2, directSowWeeksBefore: 2, daysToMaturity: 80, notes: 'Perennial herb' },
  // Flowers
  { id: 'marigold', name: 'Marigold', category: 'Flowers', indoorWeeksBefore: 6, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 50, notes: 'Good companion plant' },
  { id: 'zinnia', name: 'Zinnia', category: 'Flowers', indoorWeeksBefore: 4, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 60, notes: 'Direct sow works well' },
  { id: 'sunflower', name: 'Sunflower', category: 'Flowers', indoorWeeksBefore: 2, transplantWeeksAfter: 0, directSowWeeksBefore: 0, daysToMaturity: 70, notes: 'Direct sow preferred' },
  { id: 'cosmos', name: 'Cosmos', category: 'Flowers', indoorWeeksBefore: 4, transplantWeeksAfter: 2, directSowWeeksBefore: 0, daysToMaturity: 60, notes: 'Easy to grow' },
  { id: 'petunia', name: 'Petunia', category: 'Flowers', indoorWeeksBefore: 10, transplantWeeksAfter: 2, directSowWeeksBefore: null, daysToMaturity: 75, notes: 'Start early indoors' },
];

const CATEGORIES = ['All', 'Vegetables', 'Herbs', 'Flowers'];

// Column configuration for exports and sync
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Plant Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'indoorStartDate', header: 'Indoor Start Date', type: 'date' },
  { key: 'transplantDate', header: 'Transplant Date', type: 'date' },
  { key: 'directSowDate', header: 'Direct Sow Date', type: 'date' },
  { key: 'harvestDate', header: 'Expected Harvest Date', type: 'date' },
  { key: 'daysToMaturity', header: 'Days to Maturity', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Helper function to convert StorableTrackedPlant to TrackedPlant
const storableToTracked = (storable: StorableTrackedPlant): TrackedPlant => ({
  id: storable.plantId,
  name: storable.name,
  category: storable.category,
  indoorWeeksBefore: storable.indoorWeeksBefore,
  transplantWeeksAfter: storable.transplantWeeksAfter,
  directSowWeeksBefore: storable.directSowWeeksBefore,
  daysToMaturity: storable.daysToMaturity,
  notes: storable.notes,
  trackingId: storable.id,
  indoorStartDate: storable.indoorStartDate ? new Date(storable.indoorStartDate) : null,
  transplantDate: storable.transplantDate ? new Date(storable.transplantDate) : null,
  directSowDate: storable.directSowDate ? new Date(storable.directSowDate) : null,
  harvestDate: storable.harvestDate ? new Date(storable.harvestDate) : null,
});

// Helper function to convert TrackedPlant to StorableTrackedPlant
const trackedToStorable = (tracked: TrackedPlant): StorableTrackedPlant => ({
  id: tracked.trackingId,
  plantId: tracked.id,
  name: tracked.name,
  category: tracked.category,
  indoorWeeksBefore: tracked.indoorWeeksBefore,
  transplantWeeksAfter: tracked.transplantWeeksAfter,
  directSowWeeksBefore: tracked.directSowWeeksBefore,
  daysToMaturity: tracked.daysToMaturity,
  notes: tracked.notes,
  indoorStartDate: tracked.indoorStartDate?.toISOString() || null,
  transplantDate: tracked.transplantDate?.toISOString() || null,
  directSowDate: tracked.directSowDate?.toISOString() || null,
  harvestDate: tracked.harvestDate?.toISOString() || null,
  createdAt: new Date().toISOString(),
});

export const SeedStartingTool: React.FC<SeedStartingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [lastFrostDate, setLastFrostDate] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: storablePlants,
    setData: setStorablePlants,
    addItem,
    deleteItem,
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
  } = useToolData<StorableTrackedPlant>('seed-starting', [], COLUMNS);

  // Convert storable plants to tracked plants with Date objects
  const trackedPlants = useMemo(() =>
    storablePlants.map(storableToTracked),
    [storablePlants]
  );

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.lastFrostDate) setLastFrostDate(String(prefillData.lastFrostDate));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);

  const filteredPlants = useMemo(() => {
    return PLANTS_DATABASE.filter((plant) => {
      const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
      const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const calculateDates = (plant: PlantData, frostDate: Date): Omit<TrackedPlant, 'trackingId'> => {
    const frostDateMs = frostDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    let indoorStartDate: Date | null = null;
    let transplantDate: Date | null = null;
    let directSowDate: Date | null = null;
    let harvestDate: Date | null = null;

    if (plant.indoorWeeksBefore > 0) {
      indoorStartDate = new Date(frostDateMs - plant.indoorWeeksBefore * weekMs);
      transplantDate = new Date(frostDateMs + plant.transplantWeeksAfter * weekMs);
      harvestDate = new Date(transplantDate.getTime() + plant.daysToMaturity * dayMs);
    }

    if (plant.directSowWeeksBefore !== null) {
      directSowDate = new Date(frostDateMs - plant.directSowWeeksBefore * weekMs);
      if (!harvestDate && directSowDate) {
        harvestDate = new Date(directSowDate.getTime() + plant.daysToMaturity * dayMs);
      }
    }

    return {
      ...plant,
      indoorStartDate,
      transplantDate,
      directSowDate,
      harvestDate,
    };
  };

  const addPlant = (plant: PlantData) => {
    if (!lastFrostDate) {
      setValidationMessage('Please set your last frost date first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const frostDate = new Date(lastFrostDate);
    const calculatedPlant = calculateDates(plant, frostDate);
    const trackedPlant: TrackedPlant = {
      ...calculatedPlant,
      trackingId: `${plant.id}-${Date.now()}`,
    };

    // Convert to storable format and add via hook
    const storablePlant = trackedToStorable(trackedPlant);
    addItem(storablePlant);
  };

  const removePlant = (trackingId: string) => {
    deleteItem(trackingId);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimelinePosition = (date: Date | null): number => {
    if (!date || !lastFrostDate) return 0;
    const frostDate = new Date(lastFrostDate);
    const startDate = new Date(frostDate);
    startDate.setMonth(startDate.getMonth() - 3);
    const endDate = new Date(frostDate);
    endDate.setMonth(endDate.getMonth() + 6);

    const totalRange = endDate.getTime() - startDate.getTime();
    const position = date.getTime() - startDate.getTime();
    return Math.max(0, Math.min(100, (position / totalRange) * 100));
  };

  const getDaysUntil = (date: Date | null): string => {
    if (!date) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const exportToCalendar = () => {
    if (trackedPlants.length === 0) {
      setValidationMessage('Add some plants to track first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Seed Starting Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    trackedPlants.forEach((plant) => {
      const formatIcsDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      if (plant.indoorStartDate) {
        icsContent += `BEGIN:VEVENT
UID:indoor-${plant.trackingId}@seedplanner
DTSTART:${formatIcsDate(plant.indoorStartDate)}
SUMMARY:Start ${plant.name} Seeds Indoors
DESCRIPTION:Time to start your ${plant.name} seeds indoors!
END:VEVENT
`;
      }

      if (plant.transplantDate) {
        icsContent += `BEGIN:VEVENT
UID:transplant-${plant.trackingId}@seedplanner
DTSTART:${formatIcsDate(plant.transplantDate)}
SUMMARY:Transplant ${plant.name} Outdoors
DESCRIPTION:Time to transplant your ${plant.name} seedlings outdoors!
END:VEVENT
`;
      }

      if (plant.directSowDate) {
        icsContent += `BEGIN:VEVENT
UID:directsow-${plant.trackingId}@seedplanner
DTSTART:${formatIcsDate(plant.directSowDate)}
SUMMARY:Direct Sow ${plant.name}
DESCRIPTION:Time to direct sow your ${plant.name} seeds outdoors!
END:VEVENT
`;
      }

      if (plant.harvestDate) {
        icsContent += `BEGIN:VEVENT
UID:harvest-${plant.trackingId}@seedplanner
DTSTART:${formatIcsDate(plant.harvestDate)}
SUMMARY:Harvest ${plant.name}
DESCRIPTION:Your ${plant.name} should be ready to harvest!
END:VEVENT
`;
      }
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seed-starting-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sortedTrackedPlants = useMemo(() => {
    return [...trackedPlants].sort((a, b) => {
      const dateA = a.indoorStartDate || a.directSowDate || new Date(0);
      const dateB = b.indoorStartDate || b.directSowDate || new Date(0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [trackedPlants]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('tools.seedStarting.seedStartingPlanner', 'Seed Starting Planner')}
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.seedStarting.planYourGardenByCalculating', 'Plan your garden by calculating optimal seed starting dates')}
                  </CardDescription>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="seed-starting" toolName="Seed Starting" />

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
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Last Frost Date Input */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <label className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.seedStarting.lastFrostDate2', 'Last Frost Date:')}
                  </label>
                </div>
                <input
                  type="date"
                  value={lastFrostDate}
                  onChange={(e) => {
                    setLastFrostDate(e.target.value);
                    if (storablePlants.length > 0 && e.target.value) {
                      const frostDate = new Date(e.target.value);
                      // Recalculate dates for all tracked plants
                      setStorablePlants((prev) =>
                        prev.map((storable) => {
                          const tracked = storableToTracked(storable);
                          const recalculated = calculateDates(tracked, frostDate);
                          return {
                            ...storable,
                            indoorStartDate: recalculated.indoorStartDate?.toISOString() || null,
                            transplantDate: recalculated.transplantDate?.toISOString() || null,
                            directSowDate: recalculated.directSowDate?.toISOString() || null,
                            harvestDate: recalculated.harvestDate?.toISOString() || null,
                          };
                        })
                      );
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.seedStarting.enterYourAreaSAverage', 'Enter your area\'s average last spring frost date')}
                </span>
              </div>
            </div>

            {/* Plant Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Plants */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.seedStarting.selectPlants', 'Select Plants')}
                </h3>
                <div className="space-y-3">
                  {/* Search and Filter */}
                  <input
                    type="text"
                    placeholder={t('tools.seedStarting.searchPlants', 'Search plants...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Plant List */}
                  <div className={`max-h-80 overflow-y-auto rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    {filteredPlants.map((plant) => (
                      <div
                        key={plant.id}
                        className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                          theme === 'dark'
                            ? 'border-gray-700 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {plant.name}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {plant.category} | {plant.daysToMaturity} days to maturity
                          </div>
                        </div>
                        <button
                          onClick={() => addPlant(plant)}
                          disabled={!lastFrostDate}
                          className={`p-2 rounded-lg transition-colors ${
                            !lastFrostDate
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : t('tools.seedStarting.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracked Plants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Your Garden Plan ({trackedPlants.length})
                  </h3>
                  {trackedPlants.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportToCalendar}
                        className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        {t('tools.seedStarting.exportCalendar', 'Export Calendar')}
                      </button>
                      <ExportDropdown
                        onExportCSV={() => exportCSV({ filename: 'seed-starting-plan' })}
                        onExportExcel={() => exportExcel({ filename: 'seed-starting-plan' })}
                        onExportJSON={() => exportJSON({ filename: 'seed-starting-plan' })}
                        onExportPDF={() => exportPDF({
                          filename: 'seed-starting-plan',
                          title: 'Seed Starting Plan',
                          subtitle: lastFrostDate ? `Last Frost Date: ${new Date(lastFrostDate).toLocaleDateString()}` : undefined,
                        })}
                        onPrint={() => print('Seed Starting Plan')}
                        onCopyToClipboard={() => copyToClipboard('tab')}
                        onImportCSV={async (file) => { await importCSV(file); }}
                        onImportJSON={async (file) => { await importJSON(file); }}
                        theme={isDark ? 'dark' : 'light'}
                      />
                    </div>
                  )}
                </div>

                {trackedPlants.length === 0 ? (
                  <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
                    theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                  }`}>
                    <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.seedStarting.noPlantsAddedYet', 'No plants added yet')}</p>
                    <p className="text-sm mt-1">{t('tools.seedStarting.selectPlantsFromTheList', 'Select plants from the list to start planning')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sortedTrackedPlants.map((plant) => (
                      <div
                        key={plant.trackingId}
                        className={`rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer"
                          onClick={() => setExpandedPlant(
                            expandedPlant === plant.trackingId ? null : plant.trackingId
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#0D9488]/20 rounded-lg">
                              <Sprout className="w-4 h-4 text-[#0D9488]" />
                            </div>
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {plant.name}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {plant.indoorStartDate && (
                                  <span>Start indoors: {formatDateShort(plant.indoorStartDate)}</span>
                                )}
                                {plant.directSowDate && !plant.indoorStartDate && (
                                  <span>Direct sow: {formatDateShort(plant.directSowDate)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlant(plant.trackingId);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-600 text-gray-400'
                                  : 'hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedPlant === plant.trackingId ? (
                              <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            )}
                          </div>
                        </div>

                        {expandedPlant === plant.trackingId && (
                          <div className={`px-3 pb-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="pt-3 space-y-2">
                              {plant.indoorStartDate && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {t('tools.seedStarting.startIndoors2', 'Start Indoors')}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {formatDate(plant.indoorStartDate)}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {getDaysUntil(plant.indoorStartDate)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {plant.transplantDate && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {t('tools.seedStarting.transplantOutdoors', 'Transplant Outdoors')}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {formatDate(plant.transplantDate)}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {getDaysUntil(plant.transplantDate)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {plant.directSowDate && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {t('tools.seedStarting.directSow2', 'Direct Sow')}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {formatDate(plant.directSowDate)}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {getDaysUntil(plant.directSowDate)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {plant.harvestDate && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {t('tools.seedStarting.expectedHarvest', 'Expected Harvest')}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {formatDate(plant.harvestDate)}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {getDaysUntil(plant.harvestDate)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className={`text-xs mt-2 pt-2 border-t ${
                                theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {plant.daysToMaturity} days to maturity
                                {plant.notes && ` | ${plant.notes}`}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline View */}
            {trackedPlants.length > 0 && lastFrostDate && (
              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.seedStarting.gardenTimeline', 'Garden Timeline')}
                </h3>

                {/* Timeline Header */}
                <div className="relative mb-6">
                  <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    {/* Frost Date Marker */}
                    <div
                      className="absolute top-0 w-1 h-6 bg-red-500 -translate-x-1/2 rounded"
                      style={{ left: `${getTimelinePosition(new Date(lastFrostDate))}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-xs">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {new Date(new Date(lastFrostDate).setMonth(new Date(lastFrostDate).getMonth() - 3)).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="text-red-500 font-medium">{t('tools.seedStarting.lastFrost', 'Last Frost')}</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {new Date(lastFrostDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {new Date(new Date(lastFrostDate).setMonth(new Date(lastFrostDate).getMonth() + 6)).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Plant Timelines */}
                <div className="space-y-3">
                  {sortedTrackedPlants.map((plant) => (
                    <div key={plant.trackingId} className="relative">
                      <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {plant.name}
                      </div>
                      <div className={`h-6 rounded-full relative ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        {/* Indoor Start */}
                        {plant.indoorStartDate && (
                          <div
                            className="absolute top-1 w-4 h-4 bg-yellow-500 rounded-full -translate-x-1/2 flex items-center justify-center"
                            style={{ left: `${getTimelinePosition(plant.indoorStartDate)}%` }}
                            title={`Start Indoors: ${formatDate(plant.indoorStartDate)}`}
                          >
                            <Sun className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {/* Transplant */}
                        {plant.transplantDate && (
                          <div
                            className="absolute top-1 w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 flex items-center justify-center"
                            style={{ left: `${getTimelinePosition(plant.transplantDate)}%` }}
                            title={`Transplant: ${formatDate(plant.transplantDate)}`}
                          >
                            <Leaf className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {/* Direct Sow */}
                        {plant.directSowDate && (
                          <div
                            className="absolute top-1 w-4 h-4 bg-green-500 rounded-full -translate-x-1/2 flex items-center justify-center"
                            style={{ left: `${getTimelinePosition(plant.directSowDate)}%` }}
                            title={`Direct Sow: ${formatDate(plant.directSowDate)}`}
                          >
                            <Sprout className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {/* Harvest */}
                        {plant.harvestDate && (
                          <div
                            className="absolute top-1 w-4 h-4 bg-orange-500 rounded-full -translate-x-1/2"
                            style={{ left: `${getTimelinePosition(plant.harvestDate)}%` }}
                            title={`Harvest: ${formatDate(plant.harvestDate)}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dashed ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedStarting.startIndoors', 'Start Indoors')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedStarting.directSow', 'Direct Sow')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedStarting.transplant', 'Transplant')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedStarting.harvest', 'Harvest')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-red-500 rounded" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedStarting.lastFrostDate', 'Last Frost Date')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.seedStarting.howToUseThisTool', 'How to Use This Tool')}
              </h3>
              <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  {t('tools.seedStarting.1EnterYourAreaS', '1. Enter your area\'s average last spring frost date (check local gardening resources)')}
                </p>
                <p>
                  {t('tools.seedStarting.2SelectPlantsFromThe', '2. Select plants from the list to add them to your garden plan')}
                </p>
                <p>
                  {t('tools.seedStarting.3ViewCalculatedDatesFor', '3. View calculated dates for indoor starting, transplanting, direct sowing, and harvest')}
                </p>
                <p>
                  {t('tools.seedStarting.4UseTheTimelineView', '4. Use the timeline view to visualize your planting schedule')}
                </p>
                <p>
                  {t('tools.seedStarting.5ExportYourPlanTo', '5. Export your plan to a calendar file (.ics) for reminders')}
                </p>
              </div>
            </div>

            {/* Validation Toast */}
            {validationMessage && (
              <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white bg-amber-500 animate-pulse max-w-xs`}>
                {validationMessage}
              </div>
            )}

            <ConfirmDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedStartingTool;
