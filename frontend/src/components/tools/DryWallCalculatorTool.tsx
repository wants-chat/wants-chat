import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Square, DoorOpen, Percent, Package, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

type SheetSize = '4x8' | '4x10' | '4x12';

interface SheetConfig {
  name: string;
  width: number; // feet
  height: number; // feet
  sqft: number;
}

interface Opening {
  id: string;
  type: 'door' | 'window';
  width: number; // inches
  height: number; // inches
}

interface DryWallCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DryWallCalculatorTool: React.FC<DryWallCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Room dimensions in feet
  const [roomLength, setRoomLength] = useState('12');
  const [roomWidth, setRoomWidth] = useState('10');
  const [roomHeight, setRoomHeight] = useState('8');
  const [sheetSize, setSheetSize] = useState<SheetSize>('4x8');
  const [wasteFactor, setWasteFactor] = useState('10');
  const [includeCeiling, setIncludeCeiling] = useState(true);

  // Openings (doors and windows)
  const [openings, setOpenings] = useState<Opening[]>([
    { id: '1', type: 'door', width: 36, height: 80 },
    { id: '2', type: 'window', width: 36, height: 48 },
  ]);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setRoomLength(params.numbers[0].toString());
        setRoomWidth(params.numbers[1].toString());
        if (params.numbers[2]) {
          setRoomHeight(params.numbers[2].toString());
        }
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setRoomLength(params.length.toString());
        setRoomWidth(params.width.toString());
        if (params.height) {
          setRoomHeight(params.height.toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sheetSizes: Record<SheetSize, SheetConfig> = {
    '4x8': { name: '4\' x 8\'', width: 4, height: 8, sqft: 32 },
    '4x10': { name: '4\' x 10\'', width: 4, height: 10, sqft: 40 },
    '4x12': { name: '4\' x 12\'', width: 4, height: 12, sqft: 48 },
  };

  const addOpening = (type: 'door' | 'window') => {
    const defaultSizes = {
      door: { width: 36, height: 80 },
      window: { width: 36, height: 48 },
    };
    setOpenings([
      ...openings,
      { id: Date.now().toString(), type, ...defaultSizes[type] },
    ]);
  };

  const removeOpening = (id: string) => {
    setOpenings(openings.filter((o) => o.id !== id));
  };

  const updateOpening = (id: string, field: 'width' | 'height', value: number) => {
    setOpenings(openings.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const calculations = useMemo(() => {
    const length = parseFloat(roomLength) || 0;
    const width = parseFloat(roomWidth) || 0;
    const height = parseFloat(roomHeight) || 0;
    const waste = parseFloat(wasteFactor) || 10;
    const sheet = sheetSizes[sheetSize];

    // Calculate wall area (perimeter * height)
    const perimeter = 2 * (length + width);
    const wallArea = perimeter * height;

    // Calculate ceiling area if included
    const ceilingArea = includeCeiling ? length * width : 0;

    // Calculate total openings area (convert from inches to sqft)
    const openingsArea = openings.reduce((total, opening) => {
      return total + (opening.width * opening.height) / 144; // 144 sq inches = 1 sq ft
    }, 0);

    // Net area = walls + ceiling - openings
    const netArea = wallArea + ceilingArea - openingsArea;

    // Apply waste factor
    const totalAreaWithWaste = netArea * (1 + waste / 100);

    // Number of sheets needed (round up)
    const sheetsNeeded = Math.ceil(totalAreaWithWaste / sheet.sqft);

    // Joint compound estimate: ~0.053 gallons per sqft (1 gallon covers ~18.75 sqft per coat, 3 coats)
    // Or about 1 box (4.5 gal) per 1000 sqft
    const jointCompoundGallons = (totalAreaWithWaste * 0.053).toFixed(1);

    // Tape estimate: approximately 1 foot of tape per 1 sqft of drywall (accounting for all seams)
    // More accurate: perimeter of each sheet * number of sheets / 2 (shared seams)
    const tapeRollsFeet = 500; // standard roll is 500 feet
    const estimatedTapeFeet = totalAreaWithWaste * 0.4; // ~0.4 ft tape per sqft
    const tapeRolls = Math.ceil(estimatedTapeFeet / tapeRollsFeet);

    // Screw count: approximately 1 screw per sqft (or 28-32 screws per 4x8 sheet)
    const screwsPerSheet = 32;
    const totalScrews = sheetsNeeded * screwsPerSheet;
    const screwBoxes = Math.ceil(totalScrews / 200); // screws typically come in boxes of 200

    return {
      wallArea: wallArea.toFixed(0),
      ceilingArea: ceilingArea.toFixed(0),
      openingsArea: openingsArea.toFixed(1),
      netArea: netArea.toFixed(0),
      totalAreaWithWaste: totalAreaWithWaste.toFixed(0),
      sheetsNeeded,
      sheetSqft: sheet.sqft,
      jointCompoundGallons,
      estimatedTapeFeet: estimatedTapeFeet.toFixed(0),
      tapeRolls,
      totalScrews,
      screwBoxes,
    };
  }, [roomLength, roomWidth, roomHeight, sheetSize, wasteFactor, includeCeiling, openings]);

  const COLUMNS = [
    { key: 'metric', header: 'Metric' },
    { key: 'value', header: 'Value' },
  ];

  const exportData = [
    { metric: 'Room Length', value: `${roomLength} ft` },
    { metric: 'Room Width', value: `${roomWidth} ft` },
    { metric: 'Room Height', value: `${roomHeight} ft` },
    { metric: 'Sheet Size', value: sheetSizes[sheetSize].name },
    { metric: 'Waste Factor', value: `${wasteFactor}%` },
    { metric: 'Include Ceiling', value: includeCeiling ? 'Yes' : 'No' },
    { metric: 'Wall Area', value: `${calculations.wallArea} sq ft` },
    { metric: 'Ceiling Area', value: `${calculations.ceilingArea} sq ft` },
    { metric: 'Openings Deduction', value: `${calculations.openingsArea} sq ft` },
    { metric: 'Net Area', value: `${calculations.netArea} sq ft` },
    { metric: 'Total Area with Waste', value: `${calculations.totalAreaWithWaste} sq ft` },
    { metric: 'Drywall Sheets Needed', value: calculations.sheetsNeeded },
    { metric: 'Joint Compound', value: `${calculations.jointCompoundGallons} gal` },
    { metric: 'Drywall Tape', value: `${calculations.tapeRolls} rolls (~${calculations.estimatedTapeFeet} ft)` },
    { metric: 'Drywall Screws', value: `${calculations.totalScrews} screws (${calculations.screwBoxes} boxes)` },
  ];

  const handleExportCSV = () => {
    const csv = [
      COLUMNS.map(col => col.header).join(','),
      ...exportData.map(row => `"${row.metric}","${row.value}"`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drywall-calculation-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      inputs: {
        roomLength: parseFloat(roomLength),
        roomWidth: parseFloat(roomWidth),
        roomHeight: parseFloat(roomHeight),
        sheetSize,
        wasteFactor: parseFloat(wasteFactor),
        includeCeiling,
        openings,
      },
      calculations,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drywall-calculation-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Square className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dryWallCalculator.drywallCalculator', 'Drywall Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dryWallCalculator.calculateSheetsTapeCompoundScrews', 'Calculate sheets, tape, compound & screws')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Room Dimensions */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 text-blue-500" />
            {t('tools.dryWallCalculator.roomDimensionsFeet', 'Room Dimensions (feet)')}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dryWallCalculator.length', 'Length')}</label>
              <input
                type="number"
                value={roomLength}
                onChange={(e) => setRoomLength(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="12"
              />
            </div>
            <div className="space-y-1">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dryWallCalculator.width', 'Width')}</label>
              <input
                type="number"
                value={roomWidth}
                onChange={(e) => setRoomWidth(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="10"
              />
            </div>
            <div className="space-y-1">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dryWallCalculator.height', 'Height')}</label>
              <input
                type="number"
                value={roomHeight}
                onChange={(e) => setRoomHeight(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="8"
              />
            </div>
          </div>
        </div>

        {/* Include Ceiling Toggle */}
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.dryWallCalculator.includeCeiling', 'Include Ceiling')}</span>
          <button
            onClick={() => setIncludeCeiling(!includeCeiling)}
            className={`w-12 h-6 rounded-full transition-colors ${includeCeiling ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${includeCeiling ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Sheet Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.dryWallCalculator.sheetSize', 'Sheet Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(sheetSizes) as SheetSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setSheetSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${sheetSize === size ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {sheetSizes[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Percent className="w-4 h-4" />
            {t('tools.dryWallCalculator.wasteFactor', 'Waste Factor')}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                onClick={() => setWasteFactor(pct.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(wasteFactor) === pct ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Openings (Doors & Windows) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <DoorOpen className="w-4 h-4 text-blue-500" />
              {t('tools.dryWallCalculator.doorsWindows', 'Doors & Windows')}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => addOpening('door')}
                className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.dryWallCalculator.door', '+ Door')}
              </button>
              <button
                onClick={() => addOpening('window')}
                className={`px-3 py-1 text-sm rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.dryWallCalculator.window', '+ Window')}
              </button>
            </div>
          </div>

          {openings.length > 0 && (
            <div className="space-y-2">
              {openings.map((opening) => (
                <div
                  key={opening.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <span className={`text-sm font-medium w-16 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {opening.type === 'door' ? t('tools.dryWallCalculator.door2', 'Door') : t('tools.dryWallCalculator.window2', 'Window')}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      value={opening.width}
                      onChange={(e) => updateOpening(opening.id, 'width', parseFloat(e.target.value) || 0)}
                      className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="W"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>x</span>
                    <input
                      type="number"
                      value={opening.height}
                      onChange={(e) => updateOpening(opening.id, 'height', parseFloat(e.target.value) || 0)}
                      className={`w-20 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="H"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>in</span>
                  </div>
                  <button
                    onClick={() => removeOpening(opening.id)}
                    className={`text-red-500 hover:text-red-600 text-sm`}
                  >
                    {t('tools.dryWallCalculator.remove', 'Remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Area Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dryWallCalculator.areaBreakdown', 'Area Breakdown')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dryWallCalculator.wallArea', 'Wall Area:')}</span>
              <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{calculations.wallArea} sq ft</span>
            </div>
            {includeCeiling && (
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dryWallCalculator.ceilingArea', 'Ceiling Area:')}</span>
                <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{calculations.ceilingArea} sq ft</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dryWallCalculator.openingsDeduction', 'Openings Deduction:')}</span>
              <span className="text-red-500">-{calculations.openingsArea} sq ft</span>
            </div>
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-blue-200'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dryWallCalculator.netArea', 'Net Area:')}</span>
              <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{calculations.netArea} sq ft</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>With {wasteFactor}% Waste:</span>
              <span className="font-medium text-blue-500">{calculations.totalAreaWithWaste} sq ft</span>
            </div>
          </div>
        </div>

        {/* Main Result - Sheets Needed */}
        <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dryWallCalculator.drywallSheetsNeeded', 'Drywall Sheets Needed')}</span>
          </div>
          <div className="text-5xl font-bold text-blue-500">{calculations.sheetsNeeded}</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {sheetSizes[sheetSize].name} sheets ({calculations.sheetSqft} sq ft each)
          </div>
        </div>

        {/* Materials Estimate */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dryWallCalculator.jointCompound', 'Joint Compound')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.jointCompoundGallons}</div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.dryWallCalculator.gallons3Coats', 'gallons (3 coats)')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dryWallCalculator.drywallTape', 'Drywall Tape')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.tapeRolls}</div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>rolls (~{calculations.estimatedTapeFeet} ft)</div>
          </div>
          <div className={`p-4 rounded-lg col-span-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dryWallCalculator.drywallScrews', 'Drywall Screws')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.totalScrews}</div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>screws ({calculations.screwBoxes} boxes of 200)</div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.dryWallCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.dryWallCalculator.use4x12SheetsFor9ft', 'Use 4x12 sheets for 9ft+ ceilings to minimize seams')}</li>
                <li>{t('tools.dryWallCalculator.hangSheetsHorizontallyToReduce', 'Hang sheets horizontally to reduce visible seams')}</li>
                <li>{t('tools.dryWallCalculator.use114Screws', 'Use 1-1/4" screws for 1/2" drywall')}</li>
                <li>{t('tools.dryWallCalculator.spaceScrews12ApartOn', 'Space screws 12" apart on ceilings, 16" on walls')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DryWallCalculatorTool;
