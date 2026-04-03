import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3X3, Ruler, Leaf, Calculator, Info, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface SeedSpacingToolProps {
  uiConfig?: UIConfig;
}

interface PlantSpacing {
  name: string;
  category: 'vegetable' | 'fruit' | 'herb' | 'flower';
  inRowSpacing: number; // inches
  rowSpacing: number; // inches
  squareFootSpacing: number; // plants per square foot
  depth: number; // planting depth in inches
  germDays: string; // days to germination
  notes: string;
}

const plantDatabase: PlantSpacing[] = [
  { name: 'Tomatoes (Determinate)', category: 'vegetable', inRowSpacing: 24, rowSpacing: 36, squareFootSpacing: 1, depth: 0.25, germDays: '5-10', notes: 'Cage or stake for support' },
  { name: 'Tomatoes (Indeterminate)', category: 'vegetable', inRowSpacing: 36, rowSpacing: 48, squareFootSpacing: 1, depth: 0.25, germDays: '5-10', notes: 'Need tall stakes or cages' },
  { name: 'Peppers (Bell)', category: 'vegetable', inRowSpacing: 18, rowSpacing: 24, squareFootSpacing: 1, depth: 0.25, germDays: '10-14', notes: 'May need staking when fruiting' },
  { name: 'Peppers (Hot)', category: 'vegetable', inRowSpacing: 15, rowSpacing: 24, squareFootSpacing: 1, depth: 0.25, germDays: '10-14', notes: 'Smaller plants than bell peppers' },
  { name: 'Lettuce (Leaf)', category: 'vegetable', inRowSpacing: 4, rowSpacing: 12, squareFootSpacing: 4, depth: 0.125, germDays: '7-10', notes: 'Harvest outer leaves for continuous supply' },
  { name: 'Lettuce (Head)', category: 'vegetable', inRowSpacing: 10, rowSpacing: 18, squareFootSpacing: 1, depth: 0.125, germDays: '7-10', notes: 'Needs room to form heads' },
  { name: 'Carrots', category: 'vegetable', inRowSpacing: 2, rowSpacing: 12, squareFootSpacing: 16, depth: 0.25, germDays: '14-21', notes: 'Thin seedlings to proper spacing' },
  { name: 'Radishes', category: 'vegetable', inRowSpacing: 2, rowSpacing: 6, squareFootSpacing: 16, depth: 0.5, germDays: '3-7', notes: 'Fast growing, good companion' },
  { name: 'Beans (Bush)', category: 'vegetable', inRowSpacing: 4, rowSpacing: 18, squareFootSpacing: 9, depth: 1, germDays: '7-14', notes: 'Do not transplant, direct sow' },
  { name: 'Beans (Pole)', category: 'vegetable', inRowSpacing: 6, rowSpacing: 36, squareFootSpacing: 8, depth: 1, germDays: '7-14', notes: 'Need trellis or pole support' },
  { name: 'Peas', category: 'vegetable', inRowSpacing: 2, rowSpacing: 24, squareFootSpacing: 8, depth: 1, germDays: '7-14', notes: 'Provide support for climbing' },
  { name: 'Cucumbers', category: 'vegetable', inRowSpacing: 12, rowSpacing: 48, squareFootSpacing: 2, depth: 0.5, germDays: '7-10', notes: 'Can trellis to save space' },
  { name: 'Squash (Summer)', category: 'vegetable', inRowSpacing: 24, rowSpacing: 36, squareFootSpacing: 1, depth: 1, germDays: '7-10', notes: 'Bush varieties need less space' },
  { name: 'Squash (Winter)', category: 'vegetable', inRowSpacing: 36, rowSpacing: 60, squareFootSpacing: 1, depth: 1, germDays: '7-10', notes: 'Vining varieties need lots of room' },
  { name: 'Zucchini', category: 'vegetable', inRowSpacing: 24, rowSpacing: 36, squareFootSpacing: 1, depth: 1, germDays: '7-10', notes: '1-2 plants usually enough for family' },
  { name: 'Corn', category: 'vegetable', inRowSpacing: 12, rowSpacing: 30, squareFootSpacing: 1, depth: 1.5, germDays: '7-10', notes: 'Plant in blocks for pollination' },
  { name: 'Onions', category: 'vegetable', inRowSpacing: 4, rowSpacing: 12, squareFootSpacing: 9, depth: 0.5, germDays: '7-14', notes: 'From sets, transplants or seed' },
  { name: 'Garlic', category: 'vegetable', inRowSpacing: 6, rowSpacing: 12, squareFootSpacing: 4, depth: 2, germDays: '7-14', notes: 'Plant cloves pointy side up' },
  { name: 'Spinach', category: 'vegetable', inRowSpacing: 4, rowSpacing: 12, squareFootSpacing: 9, depth: 0.5, germDays: '7-14', notes: 'Succession plant for continuous harvest' },
  { name: 'Kale', category: 'vegetable', inRowSpacing: 18, rowSpacing: 24, squareFootSpacing: 1, depth: 0.5, germDays: '5-10', notes: 'Harvest outer leaves first' },
  { name: 'Broccoli', category: 'vegetable', inRowSpacing: 18, rowSpacing: 24, squareFootSpacing: 1, depth: 0.5, germDays: '5-10', notes: 'Side shoots after main head' },
  { name: 'Cabbage', category: 'vegetable', inRowSpacing: 18, rowSpacing: 24, squareFootSpacing: 1, depth: 0.5, germDays: '5-10', notes: 'Heads need room to develop' },
  { name: 'Cauliflower', category: 'vegetable', inRowSpacing: 18, rowSpacing: 24, squareFootSpacing: 1, depth: 0.5, germDays: '5-10', notes: 'Blanch heads for white color' },
  { name: 'Basil', category: 'herb', inRowSpacing: 12, rowSpacing: 18, squareFootSpacing: 4, depth: 0.25, germDays: '5-10', notes: 'Pinch flowers to encourage leaves' },
  { name: 'Cilantro', category: 'herb', inRowSpacing: 6, rowSpacing: 12, squareFootSpacing: 4, depth: 0.25, germDays: '7-10', notes: 'Succession plant to avoid bolting' },
  { name: 'Parsley', category: 'herb', inRowSpacing: 8, rowSpacing: 12, squareFootSpacing: 4, depth: 0.25, germDays: '14-21', notes: 'Slow to germinate, be patient' },
  { name: 'Dill', category: 'herb', inRowSpacing: 12, rowSpacing: 12, squareFootSpacing: 4, depth: 0.25, germDays: '10-14', notes: 'Attracts beneficial insects' },
  { name: 'Mint', category: 'herb', inRowSpacing: 18, rowSpacing: 24, squareFootSpacing: 1, depth: 0.25, germDays: '10-14', notes: 'Grow in container - spreads aggressively' },
  { name: 'Strawberries', category: 'fruit', inRowSpacing: 12, rowSpacing: 36, squareFootSpacing: 4, depth: 0, germDays: 'N/A', notes: 'Plant crown at soil level' },
  { name: 'Marigolds', category: 'flower', inRowSpacing: 8, rowSpacing: 12, squareFootSpacing: 4, depth: 0.25, germDays: '5-7', notes: 'Great companion plant' },
  { name: 'Zinnias', category: 'flower', inRowSpacing: 6, rowSpacing: 12, squareFootSpacing: 4, depth: 0.25, germDays: '5-7', notes: 'Cut and come again flower' },
  { name: 'Sunflowers', category: 'flower', inRowSpacing: 12, rowSpacing: 24, squareFootSpacing: 1, depth: 1, germDays: '7-10', notes: 'Stagger plantings for succession' },
];

export const SeedSpacingTool: React.FC<SeedSpacingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [rowLength, setRowLength] = useState('10');
  const [bedWidth, setBedWidth] = useState('4');
  const [bedLength, setBedLength] = useState('8');
  const [calculationMode, setCalculationMode] = useState<'row' | 'squarefoot' | 'bed'>('row');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.plant) setSelectedPlant(String(prefillData.plant));
      if (prefillData.rowLength) setRowLength(String(prefillData.rowLength));
      if (prefillData.bedWidth) setBedWidth(String(prefillData.bedWidth));
      if (prefillData.bedLength) setBedLength(String(prefillData.bedLength));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const filteredPlants = useMemo(() => {
    if (categoryFilter === 'all') return plantDatabase;
    return plantDatabase.filter(p => p.category === categoryFilter);
  }, [categoryFilter]);

  const selectedPlantData = plantDatabase.find(p => p.name === selectedPlant);

  const calculations = useMemo(() => {
    if (!selectedPlantData) return null;

    const rowLen = parseFloat(rowLength) || 0;
    const bedW = parseFloat(bedWidth) || 0;
    const bedL = parseFloat(bedLength) || 0;

    // Row planting calculation
    const rowLengthInches = rowLen * 12;
    const plantsPerRow = Math.floor(rowLengthInches / selectedPlantData.inRowSpacing) + 1;
    const rowsInBed = Math.floor((bedW * 12) / selectedPlantData.rowSpacing);
    const totalPlantsRow = plantsPerRow * Math.max(1, rowsInBed);

    // Square foot gardening calculation
    const sqftArea = bedW * bedL;
    const plantsSqFt = Math.floor(sqftArea * selectedPlantData.squareFootSpacing);

    // Traditional bed calculation
    const bedWidthInches = bedW * 12;
    const bedLengthInches = bedL * 12;
    const rowsAcross = Math.floor(bedWidthInches / selectedPlantData.rowSpacing) + 1;
    const plantsPerBedRow = Math.floor(bedLengthInches / selectedPlantData.inRowSpacing) + 1;
    const totalPlantsBed = rowsAcross * plantsPerBedRow;

    return {
      plantsPerRow,
      rowsInBed,
      totalPlantsRow,
      plantsSqFt,
      sqftArea,
      rowsAcross,
      plantsPerBedRow,
      totalPlantsBed,
    };
  }, [selectedPlantData, rowLength, bedWidth, bedLength]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vegetable': return 'bg-green-500';
      case 'fruit': return 'bg-red-500';
      case 'herb': return 'bg-purple-500';
      case 'flower': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Grid3X3 className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.seedSpacing.seedSpacingCalculator', 'Seed Spacing Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.seedSpacing.calculateOptimalPlantSpacingAnd', 'Calculate optimal plant spacing and quantities')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'vegetable', 'fruit', 'herb', 'flower'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Plants' : cat + 's'}
            </button>
          ))}
        </div>

        {/* Plant Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Leaf className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.seedSpacing.selectPlant', 'Select Plant')}
          </label>
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
          >
            <option value="">{t('tools.seedSpacing.chooseAPlant', 'Choose a plant...')}</option>
            {filteredPlants.map(plant => (
              <option key={plant.name} value={plant.name}>{plant.name}</option>
            ))}
          </select>
        </div>

        {/* Selected Plant Info */}
        {selectedPlantData && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(selectedPlantData.category)}`}></div>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded capitalize ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                {selectedPlantData.category}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.inRowSpacing', 'In-Row Spacing')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.inRowSpacing}"</div>
              </div>
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.rowSpacing', 'Row Spacing')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.rowSpacing}"</div>
              </div>
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.plantingDepth', 'Planting Depth')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.depth}"</div>
              </div>
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.germination', 'Germination')}</div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPlantData.germDays} days</div>
              </div>
            </div>
            <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedPlantData.notes}
            </p>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.seedSpacing.calculationMethod', 'Calculation Method')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'row', label: 'Single Row' },
              { value: 'squarefoot', label: 'Square Foot' },
              { value: 'bed', label: 'Full Bed' },
            ].map(mode => (
              <button
                key={mode.value}
                onClick={() => setCalculationMode(mode.value as any)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  calculationMode === mode.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Inputs */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 text-teal-500" />
            {t('tools.seedSpacing.gardenDimensionsFeet', 'Garden Dimensions (feet)')}
          </h4>

          {calculationMode === 'row' && (
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.rowLength', 'Row Length')}</label>
              <input
                type="number"
                value={rowLength}
                onChange={(e) => setRowLength(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}

          {(calculationMode === 'squarefoot' || calculationMode === 'bed') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.bedWidth', 'Bed Width')}</label>
                <input
                  type="number"
                  value={bedWidth}
                  onChange={(e) => setBedWidth(e.target.value)}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.bedLength', 'Bed Length')}</label>
                <input
                  type="number"
                  value={bedLength}
                  onChange={(e) => setBedLength(e.target.value)}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {selectedPlantData && calculations && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Planting Results for {selectedPlantData.name}
            </h4>

            {calculationMode === 'row' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.rowLength2', 'Row Length')}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{rowLength} feet</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-teal-500">{calculations.plantsPerRow}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.plantsPerRow', 'plants per row')}</div>
                  </div>
                </div>
                <div className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Space plants {selectedPlantData.inRowSpacing}" apart in row
                </div>
              </div>
            )}

            {calculationMode === 'squarefoot' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.bedArea', 'Bed Area')}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.sqftArea} sq ft</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-teal-500">{calculations.plantsSqFt}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.totalPlants', 'total plants')}</div>
                  </div>
                </div>
                <div className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedPlantData.squareFootSpacing} plant(s) per square foot
                </div>

                {/* Visual Grid */}
                <div className="mt-4">
                  <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.seedSpacing.1SquareFootLayout', '1 Square Foot Layout:')}
                  </div>
                  <div className="inline-block border-2 border-teal-500 rounded p-2">
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(selectedPlantData.squareFootSpacing))}, 1fr)`,
                        width: '80px',
                        height: '80px'
                      }}
                    >
                      {Array.from({ length: selectedPlantData.squareFootSpacing }).map((_, i) => (
                        <div key={i} className="bg-teal-500 rounded-full aspect-square"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {calculationMode === 'bed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.seedSpacing.bedSize', 'Bed Size')}</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bedWidth}' x {bedLength}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.seedSpacing.rows', 'Rows')}</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.rowsAcross}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.seedSpacing.plantsRow', 'Plants/Row')}</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.plantsPerBedRow}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-teal-500">{calculations.totalPlantsBed}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.seedSpacing.totalPlantsNeeded', 'total plants needed')}</div>
                  </div>
                </div>
                <div className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>{selectedPlantData.inRowSpacing}" in-row</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>{selectedPlantData.rowSpacing}" between rows</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Reference Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.seedSpacing.quickSpacingReference', 'Quick Spacing Reference')}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2 px-2">{t('tools.seedSpacing.plant', 'Plant')}</th>
                  <th className="text-center py-2 px-2">{t('tools.seedSpacing.inRow', 'In-Row')}</th>
                  <th className="text-center py-2 px-2">{t('tools.seedSpacing.rows2', 'Rows')}</th>
                  <th className="text-center py-2 px-2">{t('tools.seedSpacing.perSqft', 'Per SqFt')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.slice(0, 8).map((plant, idx) => (
                  <tr
                    key={plant.name}
                    className={`${idx % 2 === 0 ? '' : isDark ? 'bg-gray-700/50' : 'bg-white'} cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedPlant(plant.name)}
                  >
                    <td className={`py-2 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plant.name}</td>
                    <td className="text-center py-2 px-2">{plant.inRowSpacing}"</td>
                    <td className="text-center py-2 px-2">{plant.rowSpacing}"</td>
                    <td className="text-center py-2 px-2">{plant.squareFootSpacing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.seedSpacing.spacingTips', 'Spacing Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>Closer spacing = more plants but smaller yields per plant</li>
                <li>{t('tools.seedSpacing.squareFootGardeningIsIntensive', 'Square foot gardening is intensive but requires good soil')}</li>
                <li>{t('tools.seedSpacing.allowExtraSpaceForAir', 'Allow extra space for air circulation to prevent disease')}</li>
                <li>{t('tools.seedSpacing.considerMaturePlantSizeNot', 'Consider mature plant size, not seedling size')}</li>
                <li>{t('tools.seedSpacing.trellisingCanReduceGroundSpace', 'Trellising can reduce ground space for vining crops')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedSpacingTool;
