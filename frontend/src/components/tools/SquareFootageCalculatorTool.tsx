import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Square, Plus, Trash2, Info, Sparkles, Calculator, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Room {
  id: string;
  name: string;
  shape: 'rectangle' | 'triangle' | 'circle';
  length: string;
  width: string;
  radius: string;
  base: string;
  height: string;
}

interface SquareFootageCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SquareFootageCalculatorTool: React.FC<SquareFootageCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [unit, setUnit] = useState<'feet' | 'meters' | 'inches'>('feet');
  const [pricePerSqFt, setPricePerSqFt] = useState('');
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Living Room', shape: 'rectangle', length: '20', width: '15', radius: '', base: '', height: '' },
    { id: '2', name: 'Bedroom', shape: 'rectangle', length: '12', width: '10', radius: '', base: '', height: '' },
  ]);

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.length !== undefined && params.width !== undefined) {
        setRooms([{
          id: '1',
          name: 'Room 1',
          shape: 'rectangle',
          length: String(params.length),
          width: String(params.width),
          radius: '',
          base: '',
          height: '',
        }]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addRoom = () => {
    const newId = Date.now().toString();
    setRooms([...rooms, {
      id: newId,
      name: `Room ${rooms.length + 1}`,
      shape: 'rectangle',
      length: '',
      width: '',
      radius: '',
      base: '',
      height: '',
    }]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const updateRoom = (id: string, field: keyof Room, value: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const calculations = useMemo(() => {
    const conversionFactor = unit === 'meters' ? 10.764 : unit === 'inches' ? 0.00694444 : 1;

    const roomCalculations = rooms.map(room => {
      let sqFt = 0;
      let dimensions = '';

      if (room.shape === 'rectangle') {
        const length = parseFloat(room.length) || 0;
        const width = parseFloat(room.width) || 0;
        sqFt = length * width * conversionFactor;
        dimensions = `${room.length || 0} x ${room.width || 0} ${unit}`;
      } else if (room.shape === 'circle') {
        const radius = parseFloat(room.radius) || 0;
        sqFt = Math.PI * radius * radius * conversionFactor;
        dimensions = `radius: ${room.radius || 0} ${unit}`;
      } else if (room.shape === 'triangle') {
        const base = parseFloat(room.base) || 0;
        const height = parseFloat(room.height) || 0;
        sqFt = (base * height / 2) * conversionFactor;
        dimensions = `base: ${room.base || 0}, height: ${room.height || 0} ${unit}`;
      }

      return {
        ...room,
        sqFt,
        dimensions,
      };
    });

    const totalSqFt = roomCalculations.reduce((sum, r) => sum + r.sqFt, 0);
    const totalSqMeters = totalSqFt / 10.764;
    const totalAcres = totalSqFt / 43560;
    const price = parseFloat(pricePerSqFt) || 0;
    const totalCost = totalSqFt * price;

    return {
      rooms: roomCalculations,
      totalSqFt,
      totalSqMeters,
      totalAcres,
      totalCost,
      hasPrice: price > 0,
    };
  }, [rooms, unit, pricePerSqFt]);

  const formatNumber = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const shapeOptions = [
    { value: 'rectangle', label: 'Rectangle/Square' },
    { value: 'circle', label: 'Circle' },
    { value: 'triangle', label: 'Triangle' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Square className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.squareFootageCalculator.squareFootageCalculator', 'Square Footage Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.calculateAreaForRoomsAnd', 'Calculate area for rooms and properties')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.squareFootageCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Unit Selector */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.squareFootageCalculator.measurementUnit', 'Measurement Unit')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'feet', label: 'Feet' },
                { value: 'meters', label: 'Meters' },
                { value: 'inches', label: 'Inches' },
              ].map((u) => (
                <button
                  key={u.value}
                  onClick={() => setUnit(u.value as any)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    unit === u.value
                      ? 'bg-[#0D9488] text-white'
                      : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-48 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.squareFootageCalculator.pricePerSqFtOptional', 'Price per Sq Ft (optional)')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={pricePerSqFt}
                onChange={(e) => setPricePerSqFt(e.target.value)}
                placeholder="0"
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Home className="w-4 h-4 inline mr-2" />
              {t('tools.squareFootageCalculator.roomsAreas', 'Rooms / Areas')}
            </h4>
            <button
              onClick={addRoom}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg text-sm hover:bg-[#0D9488]/90"
            >
              <Plus className="w-4 h-4" />
              {t('tools.squareFootageCalculator.addRoom', 'Add Room')}
            </button>
          </div>

          {rooms.map((room, index) => (
            <div
              key={room.id}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Room Name */}
                  <div className="space-y-2">
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.roomName', 'Room Name')}</label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  {/* Shape */}
                  <div className="space-y-2">
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.shape', 'Shape')}</label>
                    <select
                      value={room.shape}
                      onChange={(e) => updateRoom(room.id, 'shape', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {shapeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dimensions based on shape */}
                  {room.shape === 'rectangle' && (
                    <>
                      <div className="space-y-2">
                        <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Length ({unit})</label>
                        <input
                          type="number"
                          value={room.length}
                          onChange={(e) => updateRoom(room.id, 'length', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Width ({unit})</label>
                        <input
                          type="number"
                          value={room.width}
                          onChange={(e) => updateRoom(room.id, 'width', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </>
                  )}

                  {room.shape === 'circle' && (
                    <div className="space-y-2 md:col-span-2">
                      <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Radius ({unit})</label>
                      <input
                        type="number"
                        value={room.radius}
                        onChange={(e) => updateRoom(room.id, 'radius', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  )}

                  {room.shape === 'triangle' && (
                    <>
                      <div className="space-y-2">
                        <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Base ({unit})</label>
                        <input
                          type="number"
                          value={room.base}
                          onChange={(e) => updateRoom(room.id, 'base', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Height ({unit})</label>
                        <input
                          type="number"
                          value={room.height}
                          onChange={(e) => updateRoom(room.id, 'height', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Room Area & Delete */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.area', 'Area')}</div>
                    <div className="text-lg font-bold text-[#0D9488]">
                      {formatNumber(calculations.rooms[index]?.sqFt || 0)} sq ft
                    </div>
                  </div>
                  {rooms.length > 1 && (
                    <button
                      onClick={() => removeRoom(room.id)}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className={`p-6 rounded-xl ${isDark ? t('tools.squareFootageCalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.squareFootageCalculator.totalSquareFootage', 'Total Square Footage')}</div>
            <div className="text-5xl font-bold text-[#0D9488]">
              {formatNumber(calculations.totalSqFt)} sq ft
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.squareMeters', 'Square Meters')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(calculations.totalSqMeters)} m²
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.acres', 'Acres')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(calculations.totalAcres, 4)} acres
              </div>
            </div>
            {calculations.hasPrice && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.squareFootageCalculator.totalValue', 'Total Value')}</div>
                <div className="text-lg font-bold text-[#0D9488]">
                  {formatCurrency(calculations.totalCost)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Room Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4 inline mr-2" />
            {t('tools.squareFootageCalculator.roomBreakdown', 'Room Breakdown')}
          </h4>
          <div className="space-y-2">
            {calculations.rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between">
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{room.name}</span>
                  <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({room.dimensions})
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D9488] rounded-full"
                      style={{ width: `${calculations.totalSqFt > 0 ? (room.sqFt / calculations.totalSqFt) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-24 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(room.sqFt)} sq ft
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulas */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.squareFootageCalculator.formulas', 'Formulas')}</h4>
          <div className={`text-sm font-mono space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div><strong>{t('tools.squareFootageCalculator.rectangle', 'Rectangle:')}</strong> Area = Length x Width</div>
            <div><strong>{t('tools.squareFootageCalculator.circle', 'Circle:')}</strong> Area = π x Radius²</div>
            <div><strong>{t('tools.squareFootageCalculator.triangle', 'Triangle:')}</strong> Area = (Base x Height) / 2</div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.squareFootageCalculator.tip', 'Tip:')}</strong> For irregularly shaped rooms, break them into multiple simple shapes and add them together. Common conversions: 1 sq meter = 10.764 sq ft, 1 acre = 43,560 sq ft.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquareFootageCalculatorTool;
