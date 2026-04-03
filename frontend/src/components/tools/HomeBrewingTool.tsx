import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Beer, Wheat, Hop, FlaskConical, Thermometer, Calendar, Droplet, Info, Calculator, Clock, Loader2, Save, Plus, Trash2, FolderOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type BeerStyle = 'ipa' | 'pale-ale' | 'stout' | 'lager' | 'wheat' | 'porter';
type CalculatorTab = 'batch' | 'grain' | 'hops' | 'yeast' | 'gravity' | 'fermentation';

interface BeerStyleConfig {
  name: string;
  og: { min: number; max: number };
  fg: { min: number; max: number };
  ibu: { min: number; max: number };
  srm: { min: number; max: number };
  description: string;
}

interface GrainEntry {
  name: string;
  amount: number;
  ppg: number; // points per pound per gallon
}

interface HopEntry {
  name: string;
  amount: number;
  alphaAcid: number;
  boilTime: number;
}

// Recipe entry that will be synced to backend
interface BrewRecipe {
  id: string;
  name: string;
  beerStyle: BeerStyle;
  batchSize: number;
  batchUnit: 'gallons' | 'liters';
  mashEfficiency: number;
  grains: GrainEntry[];
  hops: HopEntry[];
  ogReading: string;
  fgReading: string;
  pitchRateType: 'ale' | 'lager' | 'high-gravity';
  fermentationTemp: number;
  brewDate: string;
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Recipe Name', type: 'string' },
  { key: 'beerStyle', header: 'Style', type: 'string' },
  { key: 'batchSize', header: 'Batch Size', type: 'number' },
  { key: 'batchUnit', header: 'Unit', type: 'string' },
  { key: 'mashEfficiency', header: 'Efficiency %', type: 'number' },
  { key: 'ogReading', header: 'OG', type: 'string' },
  { key: 'fgReading', header: 'FG', type: 'string' },
  { key: 'fermentationTemp', header: 'Fermentation Temp', type: 'number' },
  { key: 'brewDate', header: 'Brew Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

interface HomeBrewingToolProps {
  uiConfig?: UIConfig;
}

export const HomeBrewingTool: React.FC<HomeBrewingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: savedRecipes,
    setData: setSavedRecipes,
    addItem: addRecipe,
    updateItem: updateRecipe,
    deleteItem: deleteRecipe,
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
  } = useToolData<BrewRecipe>('home-brewing', [], COLUMNS);

  // Tab state
  const [activeTab, setActiveTab] = useState<CalculatorTab>('batch');

  // Current recipe being edited
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [recipeName, setRecipeName] = useState('My Brew Recipe');

  // Batch size state
  const [batchSize, setBatchSize] = useState('5');
  const [batchUnit, setBatchUnit] = useState<'gallons' | 'liters'>('gallons');

  // Beer style
  const [beerStyle, setBeerStyle] = useState<BeerStyle>('pale-ale');

  // Grain bill state
  const [grains, setGrains] = useState<GrainEntry[]>([
    { name: 'Pale Malt 2-Row', amount: 10, ppg: 37 },
    { name: 'Crystal 40L', amount: 1, ppg: 34 },
  ]);
  const [mashEfficiency, setMashEfficiency] = useState('72');

  // Hop schedule state
  const [hops, setHops] = useState<HopEntry[]>([
    { name: 'Cascade', amount: 1, alphaAcid: 5.5, boilTime: 60 },
    { name: 'Centennial', amount: 0.5, alphaAcid: 10, boilTime: 15 },
  ]);

  // Yeast pitching state
  const [yeastCellCount, setYeastCellCount] = useState('100'); // billion cells
  const [originalGravity, setOriginalGravity] = useState('1.050');
  const [pitchRateType, setPitchRateType] = useState<'ale' | 'lager' | 'high-gravity'>('ale');

  // Gravity readings state
  const [ogReading, setOgReading] = useState('1.050');
  const [fgReading, setFgReading] = useState('1.010');

  // Fermentation state
  const [fermentationTemp, setFermentationTemp] = useState('68');
  const [brewDate, setBrewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.batchSize) setBatchSize(String(data.batchSize));
      if (data.batchUnit) setBatchUnit(data.batchUnit as 'gallons' | 'liters');
      if (data.beerStyle) setBeerStyle(data.beerStyle as BeerStyle);
      if (data.mashEfficiency) setMashEfficiency(String(data.mashEfficiency));
      if (data.originalGravity) setOriginalGravity(String(data.originalGravity));
      if (data.ogReading) setOgReading(String(data.ogReading));
      if (data.fgReading) setFgReading(String(data.fgReading));
      if (data.fermentationTemp) setFermentationTemp(String(data.fermentationTemp));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const beerStyles: Record<BeerStyle, BeerStyleConfig> = {
    ipa: {
      name: 'IPA',
      og: { min: 1.056, max: 1.075 },
      fg: { min: 1.010, max: 1.018 },
      ibu: { min: 40, max: 70 },
      srm: { min: 6, max: 14 },
      description: 'Hoppy, bitter, citrus/pine notes',
    },
    'pale-ale': {
      name: 'Pale Ale',
      og: { min: 1.045, max: 1.060 },
      fg: { min: 1.010, max: 1.015 },
      ibu: { min: 30, max: 50 },
      srm: { min: 5, max: 14 },
      description: 'Balanced, moderate hop bitterness',
    },
    stout: {
      name: 'Stout',
      og: { min: 1.036, max: 1.075 },
      fg: { min: 1.010, max: 1.022 },
      ibu: { min: 25, max: 45 },
      srm: { min: 30, max: 40 },
      description: 'Roasted, coffee, chocolate notes',
    },
    lager: {
      name: 'Lager',
      og: { min: 1.040, max: 1.052 },
      fg: { min: 1.004, max: 1.010 },
      ibu: { min: 8, max: 25 },
      srm: { min: 2, max: 6 },
      description: 'Clean, crisp, malty balance',
    },
    wheat: {
      name: 'Wheat Beer',
      og: { min: 1.044, max: 1.052 },
      fg: { min: 1.010, max: 1.014 },
      ibu: { min: 10, max: 18 },
      srm: { min: 3, max: 6 },
      description: 'Light, refreshing, citrus/banana',
    },
    porter: {
      name: 'Porter',
      og: { min: 1.040, max: 1.060 },
      fg: { min: 1.008, max: 1.016 },
      ibu: { min: 18, max: 35 },
      srm: { min: 20, max: 30 },
      description: 'Medium-bodied, caramel, chocolate',
    },
  };

  const styleConfig = beerStyles[beerStyle];

  // Calculations
  const calculations = useMemo(() => {
    const batch = parseFloat(batchSize) || 5;
    const batchInGallons = batchUnit === 'liters' ? batch / 3.785 : batch;
    const batchInLiters = batchUnit === 'gallons' ? batch * 3.785 : batch;
    const efficiency = parseFloat(mashEfficiency) || 72;

    // Grain bill calculations
    const totalGrainWeight = grains.reduce((sum, g) => sum + g.amount, 0);
    const totalPoints = grains.reduce((sum, g) => sum + (g.amount * g.ppg * (efficiency / 100)), 0);
    const estimatedOG = 1 + (totalPoints / batchInGallons) / 1000;

    // IBU calculations (Tinseth formula simplified)
    const totalIBU = hops.reduce((sum, h) => {
      const utilization = (1.65 * Math.pow(0.000125, estimatedOG - 1)) *
        ((1 - Math.exp(-0.04 * h.boilTime)) / 4.15);
      return sum + ((h.amount * h.alphaAcid * utilization * 7489) / batchInGallons);
    }, 0);

    // ABV calculation
    const og = parseFloat(ogReading) || 1.050;
    const fg = parseFloat(fgReading) || 1.010;
    const abv = (og - fg) * 131.25;
    const abvAlternate = ((og - fg) / 0.75) * 100;

    // Attenuation
    const attenuation = ((og - fg) / (og - 1)) * 100;

    // Yeast pitching rate
    const pitchRates = { ale: 0.75, lager: 1.5, 'high-gravity': 1.0 };
    const pitchRate = pitchRates[pitchRateType];
    const millionsOfCellsNeeded = pitchRate * batchInLiters * ((og - 1) * 1000);
    const billionCellsNeeded = millionsOfCellsNeeded / 1000;
    const yeastPacketsNeeded = Math.ceil(billionCellsNeeded / 100); // 100 billion per packet

    // Fermentation timeline
    const fermentTemp = parseFloat(fermentationTemp) || 68;
    const primaryDays = fermentTemp > 65 ? 7 : 14; // Lagers ferment slower
    const secondaryDays = fermentTemp > 65 ? 7 : 14;
    const conditioningDays = fermentTemp > 65 ? 14 : 28;

    const startDate = new Date(brewDate);
    const primaryEnd = new Date(startDate);
    primaryEnd.setDate(primaryEnd.getDate() + primaryDays);
    const secondaryEnd = new Date(primaryEnd);
    secondaryEnd.setDate(secondaryEnd.getDate() + secondaryDays);
    const readyDate = new Date(secondaryEnd);
    readyDate.setDate(readyDate.getDate() + conditioningDays);

    // Bottle count (12oz bottles)
    const totalOz = batchInGallons * 128;
    const bottleCount12oz = Math.floor(totalOz / 12);
    const bottleCount22oz = Math.floor(totalOz / 22);
    const primingSugarOz = batchInGallons * 0.8; // oz of corn sugar for priming

    return {
      batchInGallons: batchInGallons.toFixed(2),
      batchInLiters: batchInLiters.toFixed(2),
      totalGrainWeight: totalGrainWeight.toFixed(2),
      estimatedOG: estimatedOG.toFixed(3),
      totalIBU: totalIBU.toFixed(1),
      abv: abv.toFixed(2),
      abvAlternate: abvAlternate.toFixed(2),
      attenuation: attenuation.toFixed(1),
      billionCellsNeeded: billionCellsNeeded.toFixed(1),
      yeastPacketsNeeded,
      primaryDays,
      secondaryDays,
      conditioningDays,
      primaryEnd: primaryEnd.toLocaleDateString(),
      secondaryEnd: secondaryEnd.toLocaleDateString(),
      readyDate: readyDate.toLocaleDateString(),
      bottleCount12oz,
      bottleCount22oz,
      primingSugarOz: primingSugarOz.toFixed(2),
    };
  }, [batchSize, batchUnit, grains, mashEfficiency, hops, ogReading, fgReading, pitchRateType, fermentationTemp, brewDate]);

  // Export columns configuration for recipe summary (PDF/Print)
  const RECIPE_SUMMARY_COLUMNS: ColumnConfig[] = [
    { key: 'parameter', header: 'Parameter', type: 'string' },
    { key: 'value', header: 'Value', type: 'string' },
    { key: 'unit', header: 'Unit', type: 'string' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  // Save current recipe
  const saveCurrentRecipe = () => {
    const now = new Date().toISOString();
    const recipe: BrewRecipe = {
      id: currentRecipeId || Date.now().toString(),
      name: recipeName,
      beerStyle,
      batchSize: parseFloat(batchSize) || 5,
      batchUnit,
      mashEfficiency: parseFloat(mashEfficiency) || 72,
      grains,
      hops,
      ogReading,
      fgReading,
      pitchRateType,
      fermentationTemp: parseFloat(fermentationTemp) || 68,
      brewDate,
      createdAt: currentRecipeId ? savedRecipes.find(r => r.id === currentRecipeId)?.createdAt || now : now,
      updatedAt: now,
    };

    if (currentRecipeId) {
      updateRecipe(currentRecipeId, recipe);
    } else {
      addRecipe(recipe);
      setCurrentRecipeId(recipe.id);
    }
  };

  // Load a saved recipe
  const loadRecipe = (recipe: BrewRecipe) => {
    setCurrentRecipeId(recipe.id);
    setRecipeName(recipe.name);
    setBeerStyle(recipe.beerStyle);
    setBatchSize(recipe.batchSize.toString());
    setBatchUnit(recipe.batchUnit);
    setMashEfficiency(recipe.mashEfficiency.toString());
    setGrains(recipe.grains);
    setHops(recipe.hops);
    setOgReading(recipe.ogReading);
    setFgReading(recipe.fgReading);
    setPitchRateType(recipe.pitchRateType);
    setFermentationTemp(recipe.fermentationTemp.toString());
    setBrewDate(recipe.brewDate);
  };

  // Create new recipe
  const newRecipe = () => {
    setCurrentRecipeId(null);
    setRecipeName('My Brew Recipe');
    setBeerStyle('pale-ale');
    setBatchSize('5');
    setBatchUnit('gallons');
    setMashEfficiency('72');
    setGrains([
      { name: 'Pale Malt 2-Row', amount: 10, ppg: 37 },
      { name: 'Crystal 40L', amount: 1, ppg: 34 },
    ]);
    setHops([
      { name: 'Cascade', amount: 1, alphaAcid: 5.5, boilTime: 60 },
      { name: 'Centennial', amount: 0.5, alphaAcid: 10, boilTime: 15 },
    ]);
    setOgReading('1.050');
    setFgReading('1.010');
    setPitchRateType('ale');
    setFermentationTemp('68');
    setBrewDate(new Date().toISOString().split('T')[0]);
  };

  // Delete a saved recipe
  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    if (currentRecipeId === id) {
      newRecipe();
    }
  };

  // Prepare recipe summary data for export
  const recipeExportData = useMemo(() => {
    return [
      { parameter: 'Beer Style', value: styleConfig.name, unit: '', notes: styleConfig.description },
      { parameter: 'Batch Size', value: calculations.batchInGallons, unit: 'gallons', notes: `${calculations.batchInLiters} liters` },
      { parameter: 'Mash Efficiency', value: mashEfficiency, unit: '%', notes: '' },
      { parameter: 'Total Grain Weight', value: calculations.totalGrainWeight, unit: 'lbs', notes: '' },
      { parameter: 'Estimated OG', value: calculations.estimatedOG, unit: '', notes: `Target: ${styleConfig.og.min.toFixed(3)}-${styleConfig.og.max.toFixed(3)}` },
      { parameter: 'Estimated IBU', value: calculations.totalIBU, unit: 'IBU', notes: `Target: ${styleConfig.ibu.min}-${styleConfig.ibu.max}` },
      { parameter: 'Original Gravity (OG)', value: ogReading, unit: '', notes: '' },
      { parameter: 'Final Gravity (FG)', value: fgReading, unit: '', notes: '' },
      { parameter: 'ABV', value: calculations.abv, unit: '%', notes: 'Standard formula' },
      { parameter: 'Attenuation', value: calculations.attenuation, unit: '%', notes: 'Apparent attenuation' },
      { parameter: 'Pitch Rate Type', value: pitchRateType, unit: '', notes: '' },
      { parameter: 'Yeast Cells Needed', value: calculations.billionCellsNeeded, unit: 'billion cells', notes: `${calculations.yeastPacketsNeeded} packets` },
      { parameter: 'Fermentation Temp', value: fermentationTemp, unit: 'F', notes: '' },
      { parameter: 'Brew Date', value: brewDate, unit: '', notes: '' },
      { parameter: 'Primary Fermentation End', value: calculations.primaryEnd, unit: '', notes: `${calculations.primaryDays} days` },
      { parameter: 'Secondary End', value: calculations.secondaryEnd, unit: '', notes: `${calculations.secondaryDays} days` },
      { parameter: 'Ready Date', value: calculations.readyDate, unit: '', notes: `${calculations.conditioningDays} days conditioning` },
      { parameter: 'Bottle Count (12oz)', value: calculations.bottleCount12oz, unit: 'bottles', notes: '' },
      { parameter: 'Priming Sugar', value: calculations.primingSugarOz, unit: 'oz', notes: 'Corn sugar for 2.5 vol CO2' },
      // Add grain bill
      ...grains.map((g, i) => ({
        parameter: `Grain ${i + 1}`,
        value: g.name,
        unit: `${g.amount} lbs`,
        notes: `PPG: ${g.ppg}`,
      })),
      // Add hop schedule
      ...hops.map((h, i) => ({
        parameter: `Hop ${i + 1}`,
        value: h.name,
        unit: `${h.amount} oz`,
        notes: `AA: ${h.alphaAcid}%, Boil: ${h.boilTime} min`,
      })),
    ];
  }, [
    styleConfig, calculations, mashEfficiency, ogReading, fgReading,
    pitchRateType, fermentationTemp, brewDate, grains, hops
  ]);

  // Export handlers using hook's export functions
  const handleExportCSV = () => {
    exportCSV({ filename: `homebrew-recipes` });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: `homebrew-recipes` });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: `homebrew-recipes` });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: `homebrew-recipes`,
      title: 'Home Brewing Recipes',
      subtitle: `${savedRecipes.length} saved recipes`,
      orientation: 'landscape',
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  const handlePrint = () => {
    print('Home Brewing Recipes');
  };

  const handleImportCSV = async (file: File) => {
    await importCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    await importJSON(file);
  };

  const addGrain = () => {
    setGrains([...grains, { name: 'New Grain', amount: 1, ppg: 35 }]);
  };

  const updateGrain = (index: number, field: keyof GrainEntry, value: string | number) => {
    const updated = [...grains];
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : parseFloat(value as string) || 0 };
    setGrains(updated);
  };

  const removeGrain = (index: number) => {
    setGrains(grains.filter((_, i) => i !== index));
  };

  const addHop = () => {
    setHops([...hops, { name: 'New Hop', amount: 1, alphaAcid: 5, boilTime: 60 }]);
  };

  const updateHop = (index: number, field: keyof HopEntry, value: string | number) => {
    const updated = [...hops];
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : parseFloat(value as string) || 0 };
    setHops(updated);
  };

  const removeHop = (index: number) => {
    setHops(hops.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'batch', label: 'Batch', icon: Beer },
    { id: 'grain', label: 'Grain', icon: Wheat },
    { id: 'hops', label: 'Hops', icon: Hop },
    { id: 'yeast', label: 'Yeast', icon: FlaskConical },
    { id: 'gravity', label: 'ABV', icon: Calculator },
    { id: 'fermentation', label: 'Timeline', icon: Calendar },
  ];

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
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Beer className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.homeBrewingCalculator', 'Home Brewing Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeBrewing.completeBeerBrewingToolkit', 'Complete beer brewing toolkit')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="home-brewing" toolName="Home Brewing" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
              onImportCSV={handleImportCSV}
              onImportJSON={handleImportJSON}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Recipe Management */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder={t('tools.homeBrewing.recipeName', 'Recipe Name')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <button
              onClick={saveCurrentRecipe}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {currentRecipeId ? t('tools.homeBrewing.update', 'Update') : t('tools.homeBrewing.save', 'Save')}
            </button>
            <button
              onClick={newRecipe}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.homeBrewing.new', 'New')}
            </button>
          </div>

          {/* Saved Recipes List */}
          {savedRecipes.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Saved Recipes ({savedRecipes.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                      currentRecipeId === recipe.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <button
                      onClick={() => loadRecipe(recipe)}
                      className="text-sm"
                    >
                      {recipe.name}
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className={`p-1 rounded hover:bg-red-500/20 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Beer Style Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(beerStyles) as BeerStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setBeerStyle(s)}
              className={`py-2 px-3 rounded-lg text-sm ${beerStyle === s ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {beerStyles[s].name}
            </button>
          ))}
        </div>

        {/* Style Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{styleConfig.name}</h4>
            <span className="text-amber-500 font-bold">ABV {((styleConfig.og.min - styleConfig.fg.min) * 131.25).toFixed(1)}-{((styleConfig.og.max - styleConfig.fg.max) * 131.25).toFixed(1)}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.homeBrewing.og', 'OG:')}</span> {styleConfig.og.min.toFixed(3)}-{styleConfig.og.max.toFixed(3)}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.homeBrewing.ibu', 'IBU:')}</span> {styleConfig.ibu.min}-{styleConfig.ibu.max}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.homeBrewing.fg', 'FG:')}</span> {styleConfig.fg.min.toFixed(3)}-{styleConfig.fg.max.toFixed(3)}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.homeBrewing.srm', 'SRM:')}</span> {styleConfig.srm.min}-{styleConfig.srm.max}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {styleConfig.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CalculatorTab)}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Batch Size Tab */}
        {activeTab === 'batch' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.homeBrewing.batchSize', 'Batch Size')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={() => setBatchUnit('gallons')}
                  className={`px-4 py-2 rounded-lg ${batchUnit === 'gallons' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.homeBrewing.gallons', 'Gallons')}
                </button>
                <button
                  onClick={() => setBatchUnit('liters')}
                  className={`px-4 py-2 rounded-lg ${batchUnit === 'liters' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.homeBrewing.liters', 'Liters')}
                </button>
              </div>
            </div>

            {/* Quick Batch Sizes */}
            <div className="flex gap-2">
              {[1, 2.5, 5, 10, 15].map((size) => (
                <button
                  key={size}
                  onClick={() => setBatchSize(size.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseFloat(batchSize) === size ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {size} gal
                </button>
              ))}
            </div>

            {/* Batch Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.volume', 'Volume')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{calculations.batchInGallons} gal</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {calculations.batchInLiters} liters
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Beer className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.bottles', 'Bottles')}</span>
                </div>
                <div className="text-3xl font-bold text-amber-500">{calculations.bottleCount12oz}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  12oz bottles ({calculations.bottleCount22oz} bombers)
                </div>
              </div>
            </div>

            {/* Priming Sugar */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeBrewing.primingSugarCornSugar', 'Priming Sugar (corn sugar)')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.primingSugarOz} oz
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.homeBrewing.for25VolumesCo2', 'For ~2.5 volumes CO2 carbonation')}
              </div>
            </div>
          </div>
        )}

        {/* Grain Bill Tab */}
        {activeTab === 'grain' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.homeBrewing.mashEfficiency', 'Mash Efficiency (%)')}
              </label>
              <input
                type="number"
                value={mashEfficiency}
                onChange={(e) => setMashEfficiency(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* Grain List */}
            <div className="space-y-3">
              {grains.map((grain, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={grain.name}
                      onChange={(e) => updateGrain(index, 'name', e.target.value)}
                      placeholder={t('tools.homeBrewing.grainName', 'Grain name')}
                      className={`flex-1 px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => removeGrain(index)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-sm"
                    >
                      {t('tools.homeBrewing.remove', 'Remove')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeBrewing.weightLbs', 'Weight (lbs)')}</label>
                      <input
                        type="number"
                        value={grain.amount}
                        onChange={(e) => updateGrain(index, 'amount', e.target.value)}
                        step="0.25"
                        className={`w-full px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeBrewing.ppg', 'PPG')}</label>
                      <input
                        type="number"
                        value={grain.ppg}
                        onChange={(e) => updateGrain(index, 'ppg', e.target.value)}
                        className={`w-full px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addGrain}
                className={`w-full py-2 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}
              >
                {t('tools.homeBrewing.addGrain', '+ Add Grain')}
              </button>
            </div>

            {/* Grain Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wheat className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.totalGrain', 'Total Grain')}</span>
                </div>
                <div className="text-3xl font-bold text-amber-500">{calculations.totalGrainWeight} lbs</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.estOg', 'Est. OG')}</span>
                </div>
                <div className="text-3xl font-bold text-green-500">{calculations.estimatedOG}</div>
              </div>
            </div>
          </div>
        )}

        {/* Hop Schedule Tab */}
        {activeTab === 'hops' && (
          <div className="space-y-4">
            {/* Hop List */}
            <div className="space-y-3">
              {hops.map((hop, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hop.name}
                      onChange={(e) => updateHop(index, 'name', e.target.value)}
                      placeholder={t('tools.homeBrewing.hopName', 'Hop name')}
                      className={`flex-1 px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => removeHop(index)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-sm"
                    >
                      {t('tools.homeBrewing.remove2', 'Remove')}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeBrewing.amountOz', 'Amount (oz)')}</label>
                      <input
                        type="number"
                        value={hop.amount}
                        onChange={(e) => updateHop(index, 'amount', e.target.value)}
                        step="0.25"
                        className={`w-full px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeBrewing.alphaAcid', 'Alpha Acid %')}</label>
                      <input
                        type="number"
                        value={hop.alphaAcid}
                        onChange={(e) => updateHop(index, 'alphaAcid', e.target.value)}
                        step="0.1"
                        className={`w-full px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeBrewing.boilTimeMin', 'Boil Time (min)')}</label>
                      <input
                        type="number"
                        value={hop.boilTime}
                        onChange={(e) => updateHop(index, 'boilTime', e.target.value)}
                        className={`w-full px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addHop}
                className={`w-full py-2 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}
              >
                {t('tools.homeBrewing.addHop', '+ Add Hop')}
              </button>
            </div>

            {/* IBU Result */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Hop className="w-4 h-4 text-green-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.estimatedIbu', 'Estimated IBU')}</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{calculations.totalIBU}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Target for {styleConfig.name}: {styleConfig.ibu.min}-{styleConfig.ibu.max} IBU
              </div>
            </div>
          </div>
        )}

        {/* Yeast Pitching Tab */}
        {activeTab === 'yeast' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.homeBrewing.originalGravity', 'Original Gravity')}
              </label>
              <input
                type="text"
                value={originalGravity}
                onChange={(e) => setOriginalGravity(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.homeBrewing.beerTypePitchRate', 'Beer Type (Pitch Rate)')}
              </label>
              <div className="flex gap-2">
                {(['ale', 'lager', 'high-gravity'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPitchRateType(type)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize ${pitchRateType === type ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Yeast Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.cellsNeeded', 'Cells Needed')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.billionCellsNeeded}B</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.homeBrewing.billionCells', 'billion cells')}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.packets', 'Packets')}</span>
                </div>
                <div className="text-3xl font-bold text-amber-500">{calculations.yeastPacketsNeeded}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.homeBrewing.freshYeastPacks', 'fresh yeast packs')}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.homeBrewing.pitchRates', 'Pitch Rates:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>{t('tools.homeBrewing.ale075MillionCells', 'Ale: 0.75 million cells/mL/degree Plato')}</li>
                    <li>{t('tools.homeBrewing.lager15MillionCells', 'Lager: 1.5 million cells/mL/degree Plato')}</li>
                    <li>{t('tools.homeBrewing.highGravity10Million', 'High Gravity: 1.0 million cells/mL/degree Plato')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gravity/ABV Tab */}
        {activeTab === 'gravity' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.homeBrewing.originalGravityOg', 'Original Gravity (OG)')}
                </label>
                <input
                  type="text"
                  value={ogReading}
                  onChange={(e) => setOgReading(e.target.value)}
                  placeholder="1.050"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.homeBrewing.finalGravityFg', 'Final Gravity (FG)')}
                </label>
                <input
                  type="text"
                  value={fgReading}
                  onChange={(e) => setFgReading(e.target.value)}
                  placeholder="1.010"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Quick OG presets */}
            <div className="flex gap-2">
              {['1.040', '1.050', '1.060', '1.070', '1.080'].map((og) => (
                <button
                  key={og}
                  onClick={() => setOgReading(og)}
                  className={`flex-1 py-2 rounded-lg text-sm ${ogReading === og ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {og}
                </button>
              ))}
            </div>

            {/* ABV Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Beer className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.abv', 'ABV')}</span>
                </div>
                <div className="text-3xl font-bold text-amber-500">{calculations.abv}%</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.homeBrewing.standardFormula', 'Standard formula')}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.attenuation', 'Attenuation')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{calculations.attenuation}%</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.homeBrewing.apparentAttenuation', 'Apparent attenuation')}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.homeBrewing.abvFormula', 'ABV Formula:')}</strong> (OG - FG) x 131.25
                  <br />
                  <strong>Target for {styleConfig.name}:</strong> {((styleConfig.og.min - styleConfig.fg.min) * 131.25).toFixed(1)}-{((styleConfig.og.max - styleConfig.fg.max) * 131.25).toFixed(1)}% ABV
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fermentation Timeline Tab */}
        {activeTab === 'fermentation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('tools.homeBrewing.brewDate', 'Brew Date')}
                </label>
                <input
                  type="date"
                  value={brewDate}
                  onChange={(e) => setBrewDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Thermometer className="w-4 h-4 inline mr-1" />
                  {t('tools.homeBrewing.fermentationTempF', 'Fermentation Temp (F)')}
                </label>
                <input
                  type="number"
                  value={fermentationTemp}
                  onChange={(e) => setFermentationTemp(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.primaryFermentation', 'Primary Fermentation')}</span>
                  </div>
                  <span className="text-green-500 font-bold">{calculations.primaryDays} days</span>
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Until: {calculations.primaryEnd}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.secondaryConditioning', 'Secondary/Conditioning')}</span>
                  </div>
                  <span className="text-blue-500 font-bold">{calculations.secondaryDays} days</span>
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Until: {calculations.secondaryEnd}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Beer className="w-4 h-4 text-purple-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeBrewing.bottleConditioning', 'Bottle Conditioning')}</span>
                  </div>
                  <span className="text-purple-500 font-bold">{calculations.conditioningDays} days</span>
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Until: {calculations.readyDate}
                </div>
              </div>
            </div>

            {/* Ready Date */}
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeBrewing.yourBeerWillBeReady', 'Your beer will be ready by')}</div>
              <div className="text-2xl font-bold text-amber-500">{calculations.readyDate}</div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Total: {calculations.primaryDays + calculations.secondaryDays + calculations.conditioningDays} days
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.homeBrewing.brewingTips', 'Brewing Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.homeBrewing.sanitizeEverythingThatTouchesYour', 'Sanitize everything that touches your beer')}</li>
                <li>{t('tools.homeBrewing.controlFermentationTemperatureForBest', 'Control fermentation temperature for best results')}</li>
                <li>{t('tools.homeBrewing.takeGravityReadingsToTrack', 'Take gravity readings to track fermentation progress')}</li>
                <li>{t('tools.homeBrewing.patienceImprovesFlavorLetIt', 'Patience improves flavor - let it condition fully')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBrewingTool;
