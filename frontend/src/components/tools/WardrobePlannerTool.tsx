import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Sun, Cloud, Snowflake, Umbrella, Palette, Sparkles, Info, Plus, X, Briefcase, PartyPopper, Dumbbell, Coffee, Heart, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type Occasion = 'work' | 'casual' | 'formal' | 'date' | 'workout' | 'party';
type Weather = 'hot' | 'warm' | 'cool' | 'cold' | 'rainy';
type ColorCategory = 'neutral' | 'warm' | 'cool' | 'earth' | 'pastel';

interface OccasionConfig {
  name: string;
  icon: React.ReactNode;
  essentials: string[];
  tips: string[];
}

interface WeatherConfig {
  name: string;
  icon: React.ReactNode;
  layers: string;
  fabrics: string[];
}

interface ColorPalette {
  name: string;
  colors: string[];
  hexColors: string[];
  pairsWith: ColorCategory[];
}

interface CapsuleItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory';
  color: string;
}

interface WardrobePlannerToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
];

// Default capsule items for new users
const DEFAULT_CAPSULE_ITEMS: CapsuleItem[] = [
  { id: '1', name: 'White T-Shirt', category: 'top', color: 'White' },
  { id: '2', name: 'Dark Jeans', category: 'bottom', color: 'Navy' },
  { id: '3', name: 'Blazer', category: 'outerwear', color: 'Black' },
];

export const WardrobePlannerTool: React.FC<WardrobePlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<'occasion' | 'weather' | 'colors' | 'capsule' | 'ideas'>('occasion');
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('casual');
  const [selectedWeather, setSelectedWeather] = useState<Weather>('warm');
  const [selectedColorCategory, setSelectedColorCategory] = useState<ColorCategory>('neutral');

  // Use the useToolData hook for backend persistence
  const {
    data: capsuleItems,
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
  } = useToolData<CapsuleItem>('wardrobe-planner', DEFAULT_CAPSULE_ITEMS, COLUMNS);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['occasion', 'weather', 'colors', 'capsule', 'ideas'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }
      if (params.occasion && ['work', 'casual', 'formal', 'date', 'workout', 'party'].includes(params.occasion)) {
        setSelectedOccasion(params.occasion as Occasion);
        hasChanges = true;
      }
      if (params.weather && ['hot', 'warm', 'cool', 'cold', 'rainy'].includes(params.weather)) {
        setSelectedWeather(params.weather as Weather);
        hasChanges = true;
      }
      if (params.colorCategory && ['neutral', 'warm', 'cool', 'earth', 'pastel'].includes(params.colorCategory)) {
        setSelectedColorCategory(params.colorCategory as ColorCategory);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CapsuleItem['category']>('top');
  const [newItemColor, setNewItemColor] = useState('');

  const occasions: Record<Occasion, OccasionConfig> = {
    work: {
      name: 'Work / Office',
      icon: <Briefcase className="w-4 h-4" />,
      essentials: ['Tailored pants or skirt', 'Button-down shirts', 'Blazer', 'Closed-toe shoes', 'Minimal accessories'],
      tips: ['Stick to neutral colors for versatility', 'Ensure clothes are wrinkle-free', 'Keep jewelry simple and professional'],
    },
    casual: {
      name: 'Casual Day Out',
      icon: <Coffee className="w-4 h-4" />,
      essentials: ['Well-fitted jeans', 'T-shirts or casual tops', 'Comfortable sneakers', 'Light jacket or cardigan', 'Crossbody bag'],
      tips: ['Mix textures for visual interest', 'Layer for adaptability', 'Express personality with accessories'],
    },
    formal: {
      name: 'Formal Event',
      icon: <Sparkles className="w-4 h-4" />,
      essentials: ['Suit or evening dress', 'Dress shoes or heels', 'Statement jewelry', 'Clutch or small bag', 'Elegant watch'],
      tips: ['Choose quality over quantity', 'Ensure perfect fit', 'Coordinate accessories with outfit'],
    },
    date: {
      name: 'Date Night',
      icon: <Heart className="w-4 h-4" />,
      essentials: ['Flattering top', 'Nice jeans or dress', 'Stylish shoes', 'Light fragrance', 'Confidence-boosting piece'],
      tips: ['Wear something that makes you feel great', 'Consider the venue', 'Add one statement piece'],
    },
    workout: {
      name: 'Workout / Active',
      icon: <Dumbbell className="w-4 h-4" />,
      essentials: ['Moisture-wicking top', 'Athletic leggings or shorts', 'Supportive sports bra', 'Training shoes', 'Sweatband or headband'],
      tips: ['Choose breathable fabrics', 'Ensure freedom of movement', 'Match shoes to activity type'],
    },
    party: {
      name: 'Party / Night Out',
      icon: <PartyPopper className="w-4 h-4" />,
      essentials: ['Statement dress or stylish separates', 'Eye-catching shoes', 'Bold accessories', 'Evening bag', 'Fun makeup elements'],
      tips: ['Don\'t be afraid of color or sparkle', 'Comfort matters for dancing', 'Coordinate with friends if desired'],
    },
  };

  const weatherConfigs: Record<Weather, WeatherConfig> = {
    hot: {
      name: 'Hot (85°F+)',
      icon: <Sun className="w-4 h-4 text-orange-500" />,
      layers: 'Single light layer',
      fabrics: ['Linen', 'Cotton', 'Chambray', 'Rayon', 'Bamboo'],
    },
    warm: {
      name: 'Warm (70-84°F)',
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
      layers: 'Light layers optional',
      fabrics: ['Cotton', 'Light denim', 'Jersey', 'Silk blend'],
    },
    cool: {
      name: 'Cool (50-69°F)',
      icon: <Cloud className="w-4 h-4 text-blue-400" />,
      layers: '2-3 light layers',
      fabrics: ['Flannel', 'Light wool', 'Denim', 'Corduroy', 'Fleece'],
    },
    cold: {
      name: 'Cold (Below 50°F)',
      icon: <Snowflake className="w-4 h-4 text-blue-300" />,
      layers: '3-4 layers with insulation',
      fabrics: ['Wool', 'Cashmere', 'Down', 'Fleece', 'Thermal knits'],
    },
    rainy: {
      name: 'Rainy',
      icon: <Umbrella className="w-4 h-4 text-blue-500" />,
      layers: 'Waterproof outer layer',
      fabrics: ['Gore-Tex', 'Nylon', 'Polyester', 'Water-resistant cotton'],
    },
  };

  const colorPalettes: Record<ColorCategory, ColorPalette> = {
    neutral: {
      name: 'Neutrals',
      colors: ['Black', 'White', 'Gray', 'Navy', 'Beige', 'Cream'],
      hexColors: ['#1a1a1a', '#ffffff', '#6b7280', '#1e3a5f', '#d4b896', '#fffdd0'],
      pairsWith: ['warm', 'cool', 'earth', 'pastel'],
    },
    warm: {
      name: 'Warm Tones',
      colors: ['Red', 'Orange', 'Yellow', 'Coral', 'Terracotta', 'Gold'],
      hexColors: ['#dc2626', '#ea580c', '#eab308', '#f97316', '#c2410c', '#d4af37'],
      pairsWith: ['neutral', 'earth'],
    },
    cool: {
      name: 'Cool Tones',
      colors: ['Blue', 'Purple', 'Teal', 'Lavender', 'Mint', 'Silver'],
      hexColors: ['#2563eb', '#7c3aed', '#0d9488', '#c4b5fd', '#86efac', '#c0c0c0'],
      pairsWith: ['neutral', 'pastel'],
    },
    earth: {
      name: 'Earth Tones',
      colors: ['Brown', 'Olive', 'Rust', 'Mustard', 'Forest Green', 'Tan'],
      hexColors: ['#78350f', '#4d7c0f', '#b45309', '#ca8a04', '#166534', '#d2b48c'],
      pairsWith: ['neutral', 'warm'],
    },
    pastel: {
      name: 'Pastels',
      colors: ['Blush Pink', 'Baby Blue', 'Soft Lilac', 'Mint Green', 'Peach', 'Butter Yellow'],
      hexColors: ['#fecdd3', '#bfdbfe', '#ddd6fe', '#bbf7d0', '#fed7aa', '#fef3c7'],
      pairsWith: ['neutral', 'cool'],
    },
  };

  const currentOccasion = occasions[selectedOccasion];
  const currentWeather = weatherConfigs[selectedWeather];
  const currentPalette = colorPalettes[selectedColorCategory];

  const generatedOutfits = useMemo(() => {
    const tops = capsuleItems.filter(i => i.category === 'top');
    const bottoms = capsuleItems.filter(i => i.category === 'bottom');
    const outerwear = capsuleItems.filter(i => i.category === 'outerwear');
    const shoes = capsuleItems.filter(i => i.category === 'shoes');

    const outfits: string[] = [];

    tops.forEach(top => {
      bottoms.forEach(bottom => {
        let outfit = `${top.name} + ${bottom.name}`;
        if (outerwear.length > 0) {
          outfit += ` + ${outerwear[0].name}`;
        }
        if (shoes.length > 0) {
          outfit += ` with ${shoes[0].name}`;
        }
        outfits.push(outfit);
      });
    });

    return outfits.slice(0, 6); // Limit to 6 combinations
  }, [capsuleItems]);

  const addCapsuleItem = () => {
    if (newItemName.trim() && newItemColor.trim()) {
      const newItem: CapsuleItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        category: newItemCategory,
        color: newItemColor.trim(),
      };
      addItem(newItem);
      setNewItemName('');
      setNewItemColor('');
    }
  };

  const removeCapsuleItem = (id: string) => {
    deleteItem(id);
  };

  const getCategoryColor = (category: CapsuleItem['category']) => {
    const colors = {
      top: 'text-blue-500',
      bottom: 'text-green-500',
      outerwear: 'text-purple-500',
      shoes: 'text-orange-500',
      accessory: 'text-pink-500',
    };
    return colors[category];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Shirt className="w-5 h-5 text-purple-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wardrobePlanner.wardrobePlanner', 'Wardrobe Planner')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.wardrobePlanner.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wardrobePlanner.planOutfitsForAnyOccasion', 'Plan outfits for any occasion')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="wardrobe-planner" toolName="Wardrobe Planner" />

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
              onExportCSV={() => exportCSV({ filename: 'wardrobe-capsule' })}
              onExportExcel={() => exportExcel({ filename: 'wardrobe-capsule' })}
              onExportJSON={() => exportJSON({ filename: 'wardrobe-capsule' })}
              onExportPDF={() => exportPDF({ filename: 'wardrobe-capsule', title: 'Wardrobe Capsule' })}
              onPrint={() => print('Wardrobe Capsule')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={capsuleItems.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {(['occasion', 'weather', 'colors', 'capsule', 'ideas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap capitalize ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'ideas' ? 'Outfit Ideas' : tab}
            </button>
          ))}
        </div>

        {/* Occasion Tab */}
        {activeTab === 'occasion' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(occasions) as Occasion[]).map((occ) => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`flex items-center gap-2 py-3 px-4 rounded-lg text-sm ${
                    selectedOccasion === occ
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {occasions[occ].icon}
                  <span>{occasions[occ].name}</span>
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentOccasion.name} Essentials
              </h4>
              <ul className="space-y-2">
                {currentOccasion.essentials.map((item, index) => (
                  <li key={index} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.wardrobePlanner.styleTips', 'Style Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    {currentOccasion.tips.map((tip, index) => (
                      <li key={index}>- {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(weatherConfigs) as Weather[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeather(w)}
                  className={`flex items-center gap-2 py-3 px-4 rounded-lg text-sm ${
                    selectedWeather === w
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {weatherConfigs[w].icon}
                  <span>{weatherConfigs[w].name}</span>
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center gap-2 mb-3">
                {currentWeather.icon}
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentWeather.name}</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wardrobePlanner.layering', 'Layering:')}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentWeather.layers}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wardrobePlanner.recommendedFabrics', 'Recommended Fabrics:')}</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentWeather.fabrics.map((fabric, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}
                      >
                        {fabric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(colorPalettes) as ColorCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedColorCategory(cat)}
                  className={`py-3 px-4 rounded-lg text-sm capitalize ${
                    selectedColorCategory === cat
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {colorPalettes[cat].name}
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-purple-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentPalette.name}</h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentPalette.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: currentPalette.hexColors[index] }}
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{color}</span>
                  </div>
                ))}
              </div>
              <div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wardrobePlanner.pairsWellWith', 'Pairs well with:')}</span>
                <div className="flex gap-2 mt-1">
                  {currentPalette.pairsWith.map((pair, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColorCategory(pair)}
                      className={`px-3 py-1 rounded text-xs capitalize ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      {colorPalettes[pair].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wardrobePlanner.colorCoordinationTips', 'Color Coordination Tips')}</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>- Use the 60-30-10 rule: 60% dominant, 30% secondary, 10% accent</li>
                <li>- Neutrals are your best friends for building a versatile wardrobe</li>
                <li>- Complementary colors create bold, eye-catching looks</li>
                <li>- Monochromatic outfits are elegant and elongating</li>
              </ul>
            </div>
          </div>
        )}

        {/* Capsule Wardrobe Tab */}
        {activeTab === 'capsule' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wardrobePlanner.addToYourCapsule', 'Add to Your Capsule')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t('tools.wardrobePlanner.itemName', 'Item name')}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
                />
                <input
                  type="text"
                  value={newItemColor}
                  onChange={(e) => setNewItemColor(e.target.value)}
                  placeholder={t('tools.wardrobePlanner.color', 'Color')}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as CapsuleItem['category'])}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="top">{t('tools.wardrobePlanner.top', 'Top')}</option>
                  <option value="bottom">{t('tools.wardrobePlanner.bottom', 'Bottom')}</option>
                  <option value="outerwear">{t('tools.wardrobePlanner.outerwear', 'Outerwear')}</option>
                  <option value="shoes">{t('tools.wardrobePlanner.shoes', 'Shoes')}</option>
                  <option value="accessory">{t('tools.wardrobePlanner.accessory', 'Accessory')}</option>
                </select>
                <button
                  onClick={addCapsuleItem}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.wardrobePlanner.add', 'Add')}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Capsule ({capsuleItems.length} items)
              </h4>
              {capsuleItems.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.wardrobePlanner.addItemsToBuildYour', 'Add items to build your capsule wardrobe')}
                </p>
              ) : (
                <div className="grid gap-2">
                  {capsuleItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs uppercase font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({item.color})</span>
                      </div>
                      <button
                        onClick={() => removeCapsuleItem(item.id)}
                        className={`p-1 rounded hover:bg-red-500/10 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.wardrobePlanner.capsuleWardrobeTips', 'Capsule Wardrobe Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Aim for 30-40 versatile pieces</li>
                    <li>- Focus on quality over quantity</li>
                    <li>- Choose pieces that mix and match easily</li>
                    <li>- Stick to a cohesive color palette</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outfit Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wardrobePlanner.generatedOutfitCombinations', 'Generated Outfit Combinations')}</h4>
              </div>
              {generatedOutfits.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.wardrobePlanner.addTopsAndBottomsTo', 'Add tops and bottoms to your capsule to generate outfit ideas')}
                </p>
              ) : (
                <div className="space-y-2">
                  {generatedOutfits.map((outfit, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                          {index + 1}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{outfit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wardrobePlanner.quickOutfitFormulas', 'Quick Outfit Formulas')}</h4>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.wardrobePlanner.classicCasual', 'Classic Casual:')}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.wardrobePlanner.whiteTeeJeansSneakersDenim', 'White tee + Jeans + Sneakers + Denim jacket')}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.wardrobePlanner.smartCasual', 'Smart Casual:')}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.wardrobePlanner.buttonDownChinosLoafersWatch', 'Button-down + Chinos + Loafers + Watch')}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.wardrobePlanner.weekendRelaxed', 'Weekend Relaxed:')}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.wardrobePlanner.hoodieJoggersComfortableSneakers', 'Hoodie + Joggers + Comfortable sneakers')}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.wardrobePlanner.dateNight', 'Date Night:')}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.wardrobePlanner.blazerFittedTopDarkJeans', 'Blazer + Fitted top + Dark jeans + Statement accessory')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobePlannerTool;
