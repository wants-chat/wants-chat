import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Paintbrush, Square, Minus, Plus, Info, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  doors: number;
  windows: number;
}

interface PaintCalculatorToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Room Name', type: 'string' },
  { key: 'length', header: 'Length', type: 'number' },
  { key: 'width', header: 'Width', type: 'number' },
  { key: 'height', header: 'Height', type: 'number' },
  { key: 'doors', header: 'Doors', type: 'number' },
  { key: 'windows', header: 'Windows', type: 'number' },
];

// Default room data
const DEFAULT_ROOMS: Room[] = [
  { id: '1', name: 'Living Room', length: 15, width: 12, height: 9, doors: 2, windows: 2 }
];

export const PaintCalculatorTool: React.FC<PaintCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [coats, setCoats] = useState(2);
  const [coveragePerGallon, setCoveragePerGallon] = useState(350); // sq ft per gallon
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: rooms,
    setData: setRooms,
    addItem,
    updateItem,
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
  } = useToolData<Room>('paint-calculator', DEFAULT_ROOMS, COLUMNS);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 3) {
        setRooms([{
          id: '1',
          name: 'Room 1',
          length: params.numbers[0],
          width: params.numbers[1],
          height: params.numbers[2],
          doors: params.numbers[3] || 1,
          windows: params.numbers[4] || 1,
        }]);
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setCoats(Math.floor(params.amount));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, setRooms]);

  const DOOR_AREA = unit === 'feet' ? 21 : 2; // sq ft or sq m
  const WINDOW_AREA = unit === 'feet' ? 15 : 1.4;

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `Room ${rooms.length + 1}`,
      length: 12,
      width: 10,
      height: 9,
      doors: 1,
      windows: 1,
    };
    addItem(newRoom);
  };

  const removeRoom = (id: string) => {
    if (rooms.length > 1) {
      deleteItem(id);
    }
  };

  const handleUpdateRoom = (id: string, field: keyof Room, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const calculations = useMemo(() => {
    const roomResults = rooms.map(room => {
      // Calculate wall area (4 walls)
      const perimeterArea = 2 * (room.length + room.width) * room.height;
      // Subtract doors and windows
      const doorArea = room.doors * DOOR_AREA;
      const windowArea = room.windows * WINDOW_AREA;
      const paintableArea = perimeterArea - doorArea - windowArea;
      const totalArea = paintableArea * coats;
      const gallonsNeeded = totalArea / coveragePerGallon;

      return {
        ...room,
        wallArea: perimeterArea,
        paintableArea,
        totalArea,
        gallonsNeeded: Math.ceil(gallonsNeeded * 10) / 10,
      };
    });

    const totalPaintableArea = roomResults.reduce((sum, r) => sum + r.paintableArea, 0);
    const totalAreaWithCoats = totalPaintableArea * coats;
    const totalGallons = roomResults.reduce((sum, r) => sum + r.gallonsNeeded, 0);

    return {
      rooms: roomResults,
      totalPaintableArea,
      totalAreaWithCoats,
      totalGallons: Math.ceil(totalGallons),
      totalQuarts: Math.ceil(totalGallons * 4),
    };
  }, [rooms, coats, coveragePerGallon, unit, DOOR_AREA, WINDOW_AREA]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg"><Paintbrush className="w-5 h-5 text-amber-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paintCalculator.paintCalculator', 'Paint Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.paintCalculator.calculatePaintNeededForYour', 'Calculate paint needed for your rooms')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.paintCalculator.prefilled', 'Prefilled')}</span>
              </div>
            )}
            <WidgetEmbedButton toolSlug="paint-calculator" toolName="Paint Calculator" />

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
              onExportCSV={() => exportCSV({ filename: 'paint_calculator' })}
              onExportExcel={() => exportExcel({ filename: 'paint_calculator' })}
              onExportJSON={() => exportJSON({ filename: 'paint_calculator' })}
              onExportPDF={() => exportPDF({
                filename: 'paint_calculator',
                title: 'Paint Calculator Results',
                subtitle: `${coats} coat(s) | Coverage: ${coveragePerGallon} sq ft/gallon | Total: ${calculations.totalGallons} gallons`,
              })}
              onPrint={() => print('Paint Calculator Results')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.paintCalculator.units', 'Units')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('feet')}
                className={`flex-1 py-2 rounded-lg text-sm ${unit === 'feet' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.paintCalculator.feet', 'Feet')}
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`flex-1 py-2 rounded-lg text-sm ${unit === 'meters' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.paintCalculator.meters', 'Meters')}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.paintCalculator.coats', 'Coats')}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCoats(Math.max(1, coats - 1))}
                className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              ><Minus className="w-4 h-4" /></button>
              <span className={`flex-1 text-center text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{coats}</span>
              <button
                onClick={() => setCoats(coats + 1)}
                className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              ><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.paintCalculator.coverageGal', 'Coverage/gal')}</label>
            <input
              type="number"
              value={coveragePerGallon}
              onChange={(e) => setCoveragePerGallon(parseInt(e.target.value) || 350)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-4">
          {rooms.map((room, idx) => (
            <div key={room.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => handleUpdateRoom(room.id, 'name', e.target.value)}
                  className={`font-medium bg-transparent border-b ${isDark ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}
                />
                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="text-red-400 text-sm"
                  >{t('tools.paintCalculator.remove', 'Remove')}</button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.length', 'Length')}</label>
                  <input
                    type="number"
                    value={room.length}
                    onChange={(e) => handleUpdateRoom(room.id, 'length', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.width', 'Width')}</label>
                  <input
                    type="number"
                    value={room.width}
                    onChange={(e) => handleUpdateRoom(room.id, 'width', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.height', 'Height')}</label>
                  <input
                    type="number"
                    value={room.height}
                    onChange={(e) => handleUpdateRoom(room.id, 'height', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.doors', 'Doors')}</label>
                  <input
                    type="number"
                    value={room.doors}
                    onChange={(e) => handleUpdateRoom(room.id, 'doors', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.windows', 'Windows')}</label>
                  <input
                    type="number"
                    value={room.windows}
                    onChange={(e) => handleUpdateRoom(room.id, 'windows', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between text-sm`}>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Paintable area: {calculations.rooms[idx]?.paintableArea.toFixed(0)} {unit === 'feet' ? t('tools.paintCalculator.sqFt', 'sq ft') : t('tools.paintCalculator.sqM', 'sq m')}
                </span>
                <span className="text-amber-500 font-medium">
                  {calculations.rooms[idx]?.gallonsNeeded.toFixed(1)} gallons
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={addRoom}
            className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.totalPaintNeeded', 'Total Paint Needed')}</div>
          <div className="text-5xl font-bold text-amber-500 my-2">
            {calculations.totalGallons}
          </div>
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>gallons</div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            or {calculations.totalQuarts} quarts
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Square className="w-4 h-4 text-amber-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paintCalculator.totalWallArea', 'Total Wall Area')}</span>
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalPaintableArea.toFixed(0)} {unit === 'feet' ? t('tools.paintCalculator.sqFt2', 'sq ft') : t('tools.paintCalculator.sqM2', 'sq m')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Paintbrush className="w-4 h-4 text-amber-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>With {coats} Coats</span>
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalAreaWithCoats.toFixed(0)} {unit === 'feet' ? t('tools.paintCalculator.sqFt3', 'sq ft') : t('tools.paintCalculator.sqM3', 'sq m')}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.paintCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Buy 10% extra for touch-ups and waste</li>
                <li>• Standard door: 21 sq ft, window: 15 sq ft</li>
                <li>• Dark to light colors may need 3+ coats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintCalculatorTool;
