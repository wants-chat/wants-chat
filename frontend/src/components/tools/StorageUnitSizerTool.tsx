import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Home, Sofa, Box, Thermometer, DollarSign, Plus, Minus, Info, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface StorageUnitSizerToolProps {
  uiConfig?: UIConfig;
}

type RoomType = 'bedroom' | 'livingRoom' | 'kitchen' | 'bathroom' | 'garage' | 'office' | 'diningRoom';

interface FurnitureItem {
  id: string;
  name: string;
  cubicFeet: number;
  quantity: number;
}

interface RoomInventory {
  id: string;
  type: RoomType;
  furniture: FurnitureItem[];
  boxes: {
    small: number;
    medium: number;
    large: number;
  };
}

interface StorageUnit {
  name: string;
  dimensions: string;
  cubicFeet: number;
  description: string;
  monthlyPriceRange: { min: number; max: number };
}

const ROOM_CONFIG: Record<RoomType, { name: string; icon: string; defaultFurniture: Omit<FurnitureItem, 'id' | 'quantity'>[] }> = {
  bedroom: {
    name: 'Bedroom',
    icon: 'bed',
    defaultFurniture: [
      { name: 'King Bed', cubicFeet: 70 },
      { name: 'Queen Bed', cubicFeet: 55 },
      { name: 'Twin Bed', cubicFeet: 40 },
      { name: 'Dresser', cubicFeet: 30 },
      { name: 'Nightstand', cubicFeet: 5 },
      { name: 'Wardrobe', cubicFeet: 45 },
      { name: 'Mattress', cubicFeet: 35 },
    ],
  },
  livingRoom: {
    name: 'Living Room',
    icon: 'sofa',
    defaultFurniture: [
      { name: 'Sofa (3-seat)', cubicFeet: 60 },
      { name: 'Loveseat', cubicFeet: 40 },
      { name: 'Armchair', cubicFeet: 25 },
      { name: 'Coffee Table', cubicFeet: 15 },
      { name: 'TV Stand', cubicFeet: 20 },
      { name: 'Bookshelf', cubicFeet: 25 },
      { name: 'Entertainment Center', cubicFeet: 50 },
    ],
  },
  kitchen: {
    name: 'Kitchen',
    icon: 'cooking-pot',
    defaultFurniture: [
      { name: 'Refrigerator', cubicFeet: 45 },
      { name: 'Dining Table', cubicFeet: 35 },
      { name: 'Dining Chair', cubicFeet: 8 },
      { name: 'Microwave', cubicFeet: 3 },
      { name: 'Kitchen Island', cubicFeet: 25 },
      { name: 'Bar Stool', cubicFeet: 6 },
    ],
  },
  bathroom: {
    name: 'Bathroom',
    icon: 'bath',
    defaultFurniture: [
      { name: 'Bathroom Cabinet', cubicFeet: 10 },
      { name: 'Mirror', cubicFeet: 3 },
      { name: 'Towel Rack', cubicFeet: 2 },
      { name: 'Hamper', cubicFeet: 4 },
    ],
  },
  garage: {
    name: 'Garage',
    icon: 'wrench',
    defaultFurniture: [
      { name: 'Workbench', cubicFeet: 30 },
      { name: 'Tool Cabinet', cubicFeet: 20 },
      { name: 'Lawn Mower', cubicFeet: 15 },
      { name: 'Bicycle', cubicFeet: 10 },
      { name: 'Storage Shelf', cubicFeet: 25 },
      { name: 'Kayak/Canoe', cubicFeet: 35 },
    ],
  },
  office: {
    name: 'Office',
    icon: 'briefcase',
    defaultFurniture: [
      { name: 'Desk', cubicFeet: 25 },
      { name: 'Office Chair', cubicFeet: 12 },
      { name: 'Filing Cabinet', cubicFeet: 10 },
      { name: 'Bookcase', cubicFeet: 25 },
      { name: 'Printer Stand', cubicFeet: 8 },
    ],
  },
  diningRoom: {
    name: 'Dining Room',
    icon: 'utensils',
    defaultFurniture: [
      { name: 'Dining Table (6-seat)', cubicFeet: 45 },
      { name: 'Dining Chair', cubicFeet: 8 },
      { name: 'China Cabinet', cubicFeet: 40 },
      { name: 'Buffet/Sideboard', cubicFeet: 30 },
      { name: 'Bar Cart', cubicFeet: 10 },
    ],
  },
};

const STORAGE_UNITS: StorageUnit[] = [
  { name: '5x5', dimensions: '5\' x 5\' x 8\'', cubicFeet: 200, description: 'Small closet, seasonal items', monthlyPriceRange: { min: 40, max: 75 } },
  { name: '5x10', dimensions: '5\' x 10\' x 8\'', cubicFeet: 400, description: 'Large closet, studio apartment', monthlyPriceRange: { min: 60, max: 120 } },
  { name: '10x10', dimensions: '10\' x 10\' x 8\'', cubicFeet: 800, description: '1-2 bedroom apartment', monthlyPriceRange: { min: 100, max: 180 } },
  { name: '10x15', dimensions: '10\' x 15\' x 8\'', cubicFeet: 1200, description: '2-3 bedroom home', monthlyPriceRange: { min: 140, max: 250 } },
  { name: '10x20', dimensions: '10\' x 20\' x 8\'', cubicFeet: 1600, description: '3-4 bedroom home', monthlyPriceRange: { min: 180, max: 320 } },
  { name: '10x25', dimensions: '10\' x 25\' x 8\'', cubicFeet: 2000, description: '4-5 bedroom home + vehicles', monthlyPriceRange: { min: 220, max: 400 } },
  { name: '10x30', dimensions: '10\' x 30\' x 8\'', cubicFeet: 2400, description: 'Large home, multiple vehicles', monthlyPriceRange: { min: 260, max: 475 } },
];

const BOX_SIZES = {
  small: { name: 'Small', cubicFeet: 1.5, description: 'Books, heavy items' },
  medium: { name: 'Medium', cubicFeet: 3, description: 'Kitchen, clothes' },
  large: { name: 'Large', cubicFeet: 5, description: 'Linens, pillows' },
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'roomType', header: 'Room Type', type: 'string' },
  { key: 'roomNumber', header: 'Room #', type: 'number' },
  { key: 'itemType', header: 'Item Type', type: 'string' },
  { key: 'itemName', header: 'Item Name', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'cubicFeetEach', header: 'Cu. Ft. Each', type: 'number' },
  { key: 'totalCubicFeet', header: 'Total Cu. Ft.', type: 'number' },
];

export const StorageUnitSizerTool: React.FC<StorageUnitSizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
  } = useToolData<RoomInventory>('storage-unit-sizer', [], COLUMNS);

  const [selectedRoom, setSelectedRoom] = useState<RoomType>('bedroom');
  const [needsClimateControl, setNeedsClimateControl] = useState(false);
  const [hasElectronics, setHasElectronics] = useState(false);
  const [hasWoodenFurniture, setHasWoodenFurniture] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.roomType && ['bedroom', 'livingRoom', 'kitchen', 'bathroom', 'garage', 'office', 'diningRoom'].includes(params.roomType)) {
        setSelectedRoom(params.roomType as RoomType);
        hasChanges = true;
      }
      if (params.needsClimateControl !== undefined) {
        setNeedsClimateControl(params.needsClimateControl);
        hasChanges = true;
      }
      if (params.hasElectronics !== undefined) {
        setHasElectronics(params.hasElectronics);
        hasChanges = true;
      }
      if (params.hasWoodenFurniture !== undefined) {
        setHasWoodenFurniture(params.hasWoodenFurniture);
        hasChanges = true;
      }
      if (params.hasDocuments !== undefined) {
        setHasDocuments(params.hasDocuments);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addRoom = () => {
    const newRoom: RoomInventory = {
      id: Date.now().toString(),
      type: selectedRoom,
      furniture: [],
      boxes: { small: 0, medium: 0, large: 0 },
    };
    addItem(newRoom);
  };

  const removeRoom = (roomId: string) => {
    deleteItem(roomId);
  };

  const addFurnitureToRoom = (roomId: string, furnitureName: string, cubicFeet: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const existingItem = room.furniture.find(f => f.name === furnitureName);
    let updatedFurniture: FurnitureItem[];

    if (existingItem) {
      updatedFurniture = room.furniture.map(f =>
        f.name === furnitureName ? { ...f, quantity: f.quantity + 1 } : f
      );
    } else {
      updatedFurniture = [...room.furniture, {
        id: `${Date.now()}-${Math.random()}`,
        name: furnitureName,
        cubicFeet,
        quantity: 1,
      }];
    }
    updateItem(roomId, { furniture: updatedFurniture });
  };

  const updateFurnitureQuantity = (roomId: string, furnitureId: string, delta: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const item = room.furniture.find(f => f.id === furnitureId);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + delta);
      if (newQuantity === 0) {
        updateItem(roomId, {
          furniture: room.furniture.filter(f => f.id !== furnitureId)
        });
      } else {
        updateItem(roomId, {
          furniture: room.furniture.map(f =>
            f.id === furnitureId ? { ...f, quantity: newQuantity } : f
          )
        });
      }
    }
  };

  const updateBoxCount = (roomId: string, size: 'small' | 'medium' | 'large', delta: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    updateItem(roomId, {
      boxes: {
        ...room.boxes,
        [size]: Math.max(0, room.boxes[size] + delta)
      }
    });
  };

  const calculations = useMemo(() => {
    let totalCubicFeet = 0;
    let totalBoxes = 0;

    rooms.forEach(room => {
      room.furniture.forEach(item => {
        totalCubicFeet += item.cubicFeet * item.quantity;
      });
      totalCubicFeet += room.boxes.small * BOX_SIZES.small.cubicFeet;
      totalCubicFeet += room.boxes.medium * BOX_SIZES.medium.cubicFeet;
      totalCubicFeet += room.boxes.large * BOX_SIZES.large.cubicFeet;
      totalBoxes += room.boxes.small + room.boxes.medium + room.boxes.large;
    });

    // Add 20% buffer for packing inefficiency and aisle space
    const recommendedCubicFeet = totalCubicFeet * 1.2;

    // Find recommended unit
    const recommendedUnit = STORAGE_UNITS.find(unit => unit.cubicFeet >= recommendedCubicFeet) || STORAGE_UNITS[STORAGE_UNITS.length - 1];

    // Calculate if climate control is recommended
    const climateControlRecommended = hasElectronics || hasWoodenFurniture || hasDocuments;

    // Climate control typically adds 25-50% to cost
    const climateControlMultiplier = needsClimateControl || climateControlRecommended ? 1.35 : 1;

    return {
      totalCubicFeet: Math.round(totalCubicFeet),
      recommendedCubicFeet: Math.round(recommendedCubicFeet),
      totalBoxes,
      recommendedUnit,
      climateControlRecommended,
      estimatedMonthlyMin: Math.round(recommendedUnit.monthlyPriceRange.min * climateControlMultiplier),
      estimatedMonthlyMax: Math.round(recommendedUnit.monthlyPriceRange.max * climateControlMultiplier),
    };
  }, [rooms, needsClimateControl, hasElectronics, hasWoodenFurniture, hasDocuments]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Package className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.title')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.storageUnitSizer.autoFilled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.storageUnitSizer.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="storage-unit-sizer" toolName="Storage Unit Sizer" />

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
              onExportCSV={() => exportCSV({ filename: 'storage-unit-inventory' })}
              onExportExcel={() => exportExcel({ filename: 'storage-unit-inventory' })}
              onExportJSON={() => exportJSON({ filename: 'storage-unit-inventory' })}
              onExportPDF={() => exportPDF({
                filename: 'storage-unit-inventory',
                title: 'Storage Unit Inventory',
                subtitle: `Recommended: ${calculations.recommendedUnit.name} | Est. Cost: $${calculations.estimatedMonthlyMin}-$${calculations.estimatedMonthlyMax}/mo`
              })}
              onPrint={() => print('Storage Unit Inventory')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={rooms.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Room Section */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.storageUnitSizer.addRoomToInventory')}
          </label>
          <div className="flex gap-2">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value as RoomType)}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {(Object.keys(ROOM_CONFIG) as RoomType[]).map((room) => (
                <option key={room} value={room}>{ROOM_CONFIG[room].name}</option>
              ))}
            </select>
            <button
              onClick={addRoom}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.storageUnitSizer.add')}
            </button>
          </div>
        </div>

        {/* Room Inventories */}
        {rooms.length > 0 && (
          <div className="space-y-4">
            {rooms.map((room, roomIndex) => (
              <div
                key={room.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {ROOM_CONFIG[room.type].name} #{rooms.filter((r, i) => i <= roomIndex && r.type === room.type).length}
                  </h4>
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Furniture Selection */}
                <div className="mb-4">
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Sofa className="w-4 h-4 inline mr-1" />
                    {t('tools.storageUnitSizer.addFurniture')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_CONFIG[room.type].defaultFurniture.map((furniture) => (
                      <button
                        key={furniture.name}
                        onClick={() => addFurnitureToRoom(room.id, furniture.name, furniture.cubicFeet)}
                        className={`px-3 py-1 text-sm rounded-full ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        + {furniture.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Furniture */}
                {room.furniture.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {room.furniture.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                      >
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.name} <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>({item.cubicFeet} cu ft each)</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateFurnitureQuantity(room.id, item.id, -1)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`w-8 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateFurnitureQuantity(room.id, item.id, 1)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Box Estimator */}
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Box className="w-4 h-4 inline mr-1" />
                    {t('tools.storageUnitSizer.boxes')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(BOX_SIZES) as (keyof typeof BOX_SIZES)[]).map((size) => (
                      <div
                        key={size}
                        className={`p-2 rounded ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                      >
                        <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{BOX_SIZES[size].name}</div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateBoxCount(room.id, size, -1)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{room.boxes[size]}</span>
                          <button
                            onClick={() => updateBoxCount(room.id, size, 1)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Climate Control Assessment */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-5 h-5 text-blue-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.climateControlAssessment')}</h4>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasElectronics}
                onChange={(e) => setHasElectronics(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.storageUnitSizer.electronics')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWoodenFurniture}
                onChange={(e) => setHasWoodenFurniture(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.storageUnitSizer.woodenFurniture')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDocuments}
                onChange={(e) => setHasDocuments(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.storageUnitSizer.importantDocuments')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={needsClimateControl}
                onChange={(e) => setNeedsClimateControl(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{t('tools.storageUnitSizer.wantClimateControl')}</span>
            </label>
          </div>
        </div>

        {/* Results */}
        {rooms.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.totalVolume')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{calculations.totalCubicFeet}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.storageUnitSizer.cubicFeet')}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.totalBoxes')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.totalBoxes}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.storageUnitSizer.boxesLabel')}
                </div>
              </div>
            </div>

            {/* Recommended Unit */}
            <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'}`}>
              <div className={`text-sm mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.storageUnitSizer.recommendedUnitSize')}</div>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.recommendedUnit.name}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {calculations.recommendedUnit.dimensions} ({calculations.recommendedUnit.cubicFeet} cu ft)
              </div>
              <div className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {calculations.recommendedUnit.description}
              </div>
            </div>

            {/* Climate Control Recommendation */}
            {calculations.climateControlRecommended && !needsClimateControl && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-300'} border`}>
                <div className="flex items-start gap-2">
                  <Thermometer className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('tools.storageUnitSizer.climateControlRecommended')}</div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.storageUnitSizer.climateControlRecommendedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Estimate */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.estimatedMonthlyCost')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.estimatedMonthlyMin} - ${calculations.estimatedMonthlyMax}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {needsClimateControl || calculations.climateControlRecommended ? t('tools.storageUnitSizer.withClimateControl') : t('tools.storageUnitSizer.standardUnit')}
              </div>
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                * {t('tools.storageUnitSizer.pricesVary')}
              </p>
            </div>

            {/* All Unit Sizes */}
            <div className="space-y-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.allAvailableUnitSizes')}</h4>
              <div className="space-y-2">
                {STORAGE_UNITS.map((unit) => {
                  const isRecommended = unit.name === calculations.recommendedUnit.name;
                  const isTooSmall = unit.cubicFeet < calculations.recommendedCubicFeet;
                  return (
                    <div
                      key={unit.name}
                      className={`p-3 rounded-lg border ${
                        isRecommended
                          ? isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                          : isTooSmall
                          ? isDark ? 'bg-gray-800/50 border-gray-700 opacity-50' : 'bg-gray-100 border-gray-200 opacity-50'
                          : isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{unit.name}</span>
                          {isRecommended && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">{t('tools.storageUnitSizer.recommended')}</span>
                          )}
                          {isTooSmall && (
                            <span className={`ml-2 text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>{t('tools.storageUnitSizer.tooSmall')}</span>
                          )}
                        </div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{unit.cubicFeet} cu ft</span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{unit.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {rooms.length === 0 && (
          <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <Package className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.storageUnitSizer.startBuildingInventory')}</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.storageUnitSizer.addRoomsDescription')}
            </p>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.storageUnitSizer.tips')}:</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.storageUnitSizer.tipsList.disassemble')}</li>
                <li>{t('tools.storageUnitSizer.tipsList.uniformBoxes')}</li>
                <li>{t('tools.storageUnitSizer.tipsList.labelBoxes')}</li>
                <li>{t('tools.storageUnitSizer.tipsList.createAisle')}</li>
                <li>{t('tools.storageUnitSizer.tipsList.frequentlyNeeded')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUnitSizerTool;
