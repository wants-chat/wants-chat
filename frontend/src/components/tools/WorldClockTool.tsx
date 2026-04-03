import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Plus, X, Clock, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface City {
  name: string;
  timezone: string;
  country: string;
}

interface WorldClock {
  id: string;
  city: City;
}

// Storage format for backend sync
interface StoredClock {
  id: string;
  cityName: string;
  country: string;
  timezone: string;
}

interface WorldClockToolProps {
  uiConfig?: UIConfig;
}

const AVAILABLE_CITIES: City[] = [
  { name: 'New York', timezone: 'America/New_York', country: 'USA' },
  { name: 'London', timezone: 'Europe/London', country: 'UK' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
  { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
  { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
  { name: 'Paris', timezone: 'Europe/Paris', country: 'France' },
  { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' },
  { name: 'Chicago', timezone: 'America/Chicago', country: 'USA' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'China' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India' },
  { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
  { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
  { name: 'Shanghai', timezone: 'Asia/Shanghai', country: 'China' },
  { name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' },
];

// Column configuration for stored clock data
const STORAGE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'cityName', header: 'City', type: 'string' },
  { key: 'country', header: 'Country', type: 'string' },
  { key: 'timezone', header: 'Timezone', type: 'string' },
];

// Column configuration for exports (includes dynamic time data)
const EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'city', header: 'City', type: 'string' },
  { key: 'country', header: 'Country', type: 'string' },
  { key: 'timezone', header: 'Timezone', type: 'string' },
  { key: 'time', header: 'Current Time', type: 'string' },
  { key: 'date', header: 'Current Date', type: 'string' },
  { key: 'timeDifference', header: 'Time Difference', type: 'string' },
];

// Helper to convert WorldClock to StoredClock for persistence
const toStoredClock = (clock: WorldClock): StoredClock => ({
  id: clock.id,
  cityName: clock.city.name,
  country: clock.city.country,
  timezone: clock.city.timezone,
});

// Helper to convert StoredClock back to WorldClock
const fromStoredClock = (stored: StoredClock): WorldClock | null => {
  const city = AVAILABLE_CITIES.find(c => c.timezone === stored.timezone);
  if (!city) return null;
  return { id: stored.id, city };
};

export const WorldClockTool = ({ uiConfig }: WorldClockToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: storedClocks,
    addItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<StoredClock>('world-clock', [], STORAGE_COLUMNS);

  // Convert stored clocks to WorldClock format for display
  const clocks: WorldClock[] = storedClocks
    .map(fromStoredClock)
    .filter((c): c is WorldClock => c !== null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isLoading) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text) {
        // Try to find and add a city matching the text
        const cityName = params.text.toLowerCase();
        const matchingCity = AVAILABLE_CITIES.find(
          city => city.name.toLowerCase().includes(cityName) ||
                 city.country.toLowerCase().includes(cityName)
        );
        if (matchingCity && !storedClocks.some(c => c.timezone === matchingCity.timezone)) {
          const newClock: StoredClock = {
            id: `${matchingCity.timezone}-${Date.now()}`,
            cityName: matchingCity.name,
            country: matchingCity.country,
            timezone: matchingCity.timezone,
          };
          addItem(newClock);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isLoading]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Clocks are already synced via useToolData, just mark as editing
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timezone: string): string => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (timezone: string): string => {
    return currentTime.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeDifference = (timezone: string): string => {
    const localOffset = -currentTime.getTimezoneOffset() / 60;
    const targetDate = new Date(
      currentTime.toLocaleString('en-US', { timeZone: timezone })
    );
    const localDate = new Date(currentTime.toLocaleString('en-US'));

    const diffMs = targetDate.getTime() - localDate.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours === 0) return 'Same time';
    const sign = diffHours > 0 ? '+' : '';
    return `${sign}${diffHours}h`;
  };

  const addClock = (city: City) => {
    const newClock: StoredClock = {
      id: `${city.timezone}-${Date.now()}`,
      cityName: city.name,
      country: city.country,
      timezone: city.timezone,
    };
    addItem(newClock);
    setShowAddMenu(false);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const removeClock = (id: string) => {
    deleteItem(id);
  };

  const getLocalTime = (): string => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getLocalDate = (): string => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLocalTimezone = (): string => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone;
  };

  // Prepare data for export (with current time information)
  const getExportData = () => {
    return clocks.map((clock) => ({
      city: clock.city.name,
      country: clock.city.country,
      timezone: clock.city.timezone,
      time: formatTime(clock.city.timezone),
      date: formatDate(clock.city.timezone),
      timeDifference: getTimeDifference(clock.city.timezone),
    }));
  };

  // Export handlers using useToolData hook functions with export data
  const handleExportCSV = () => {
    // For exports, we want the dynamic time data, not just stored data
    const exportData = getExportData();
    // Use custom export with EXPORT_COLUMNS
    import('../../lib/toolDataUtils').then(({ exportToCSV }) => {
      exportToCSV(exportData, EXPORT_COLUMNS, { filename: 'world-clocks' });
    });
  };

  const handleExportExcel = () => {
    const exportData = getExportData();
    import('../../lib/toolDataUtils').then(({ exportToExcel }) => {
      exportToExcel(exportData, EXPORT_COLUMNS, { filename: 'world-clocks' });
    });
  };

  const handleExportJSON = () => {
    const exportData = getExportData();
    import('../../lib/toolDataUtils').then(({ exportToJSON }) => {
      exportToJSON(exportData, { filename: 'world-clocks' });
    });
  };

  const handleExportPDF = async () => {
    const exportData = getExportData();
    const { exportToPDF } = await import('../../lib/toolDataUtils');
    await exportToPDF(exportData, EXPORT_COLUMNS, {
      filename: 'world-clocks',
      title: 'World Clock',
      subtitle: `Exported on ${new Date().toLocaleDateString()}`,
    });
  };

  const handlePrint = () => {
    const exportData = getExportData();
    import('../../lib/toolDataUtils').then(({ printData }) => {
      printData(exportData, EXPORT_COLUMNS, { title: 'World Clock' });
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const exportData = getExportData();
    const { copyToClipboard: copyUtil } = await import('../../lib/toolDataUtils');
    return await copyUtil(exportData, EXPORT_COLUMNS);
  };

  const availableCities = AVAILABLE_CITIES.filter(
    (city) => !storedClocks.some((clock) => clock.timezone === city.timezone)
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.worldClock.worldClock', 'World Clock')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="world-clock" toolName="World Clock" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          {clocks.length > 0 && (
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

      <div className="space-y-6">
        {/* Local Time */}
        <div className={`p-6 rounded-lg ${isDark ? t('tools.worldClock.bgGradientToBrFrom', 'bg-gradient-to-br from-[#0D9488]/20 to-[#0D9488]/10 border border-[#0D9488]/30') : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className={`w-5 h-5 ${isDark ? t('tools.worldClock.text0d9488', 'text-[#0D9488]') : 'text-orange-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.worldClock.localTime', 'Local Time')}
            </h3>
          </div>
          <div className={`text-5xl font-mono font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {getLocalTime()}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {getLocalDate()}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {getLocalTimezone()}
          </div>
        </div>

        {/* Add Clock Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            {t('tools.worldClock.addCity', 'Add City')}
          </button>

          {/* Add City Menu */}
          {showAddMenu && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto ${
                isDark ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
              }`}
            >
              {availableCities.length === 0 ? (
                <div className={`text-center py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.worldClock.allCitiesHaveBeenAdded', 'All cities have been added')}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableCities.map((city) => (
                    <button
                      key={city.timezone}
                      onClick={() => addClock(city)}
                      className={`text-left px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'hover:bg-gray-600 text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {city.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* World Clocks */}
        {clocks.length > 0 ? (
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              World Clocks ({clocks.length})
            </h3>
            <div className="grid gap-3">
              {clocks.map((clock) => (
                <div
                  key={clock.id}
                  className={`p-4 rounded-lg relative ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => removeClock(clock.id)}
                    className={`absolute top-3 right-3 p-1 rounded-lg transition-colors ${
                      isDark
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="pr-8">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h4 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {clock.city.name}
                      </h4>
                      <span className={`text-sm px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {getTimeDifference(clock.city.timezone)}
                      </span>
                    </div>
                    <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {clock.city.country}
                    </div>
                    <div className={`text-3xl font-mono font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(clock.city.timezone)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(clock.city.timezone)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-lg border-2 border-dashed ${
              isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Globe className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.worldClock.noWorldClocksAddedYet', 'No world clocks added yet. Click "Add City" to get started.')}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.worldClock.aboutWorldClock', 'About World Clock')}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Add cities from around the world to see their current time. The time difference shown is relative to your local time.
            All times update in real-time every second. Your clocks are automatically synced across devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorldClockTool;
