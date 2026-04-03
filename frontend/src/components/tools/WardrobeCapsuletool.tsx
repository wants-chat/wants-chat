import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Check, Plus, Minus, Sparkles, Info, Palette, Sun, Snowflake, Leaf, Flower2, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WardrobeCapsuletoolProps {
  uiConfig?: UIConfig;
}

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  essential: boolean;
  versatility: number; // 1-5
  seasonality: ('spring' | 'summer' | 'fall' | 'winter')[];
}

interface WardrobeSelection {
  itemId: string;
  quantity: number;
  color: string;
}

const WardrobeCapsuletool: React.FC<WardrobeCapsuletoolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [style, setStyle] = useState<'minimal' | 'casual' | 'professional' | 'versatile'>('versatile');
  const [season, setSeason] = useState<'all' | 'spring' | 'summer' | 'fall' | 'winter'>('all');
  const [targetCount, setTargetCount] = useState(37);
  const [selectedItems, setSelectedItems] = useState<WardrobeSelection[]>([]);

  const neutralColors = ['Black', 'White', 'Navy', 'Gray', 'Beige', 'Cream', 'Brown'];
  const accentColors = ['Burgundy', 'Forest Green', 'Mustard', 'Dusty Rose', 'Terracotta', 'Olive', 'Cobalt Blue'];

  const clothingItems: ClothingItem[] = [
    // Tops
    { id: 'tshirt-white', name: 'White T-Shirt', category: 'Tops', icon: '👕', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'tshirt-black', name: 'Black T-Shirt', category: 'Tops', icon: '👕', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'tshirt-stripe', name: 'Striped T-Shirt', category: 'Tops', icon: '👕', essential: false, versatility: 4, seasonality: ['spring', 'summer'] },
    { id: 'button-white', name: 'White Button-Down', category: 'Tops', icon: '👔', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'button-blue', name: 'Blue Button-Down', category: 'Tops', icon: '👔', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'blouse', name: 'Silk Blouse', category: 'Tops', icon: '👚', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'sweater-crew', name: 'Crewneck Sweater', category: 'Tops', icon: '🧥', essential: true, versatility: 4, seasonality: ['fall', 'winter'] },
    { id: 'sweater-vneck', name: 'V-Neck Sweater', category: 'Tops', icon: '🧥', essential: false, versatility: 4, seasonality: ['fall', 'winter'] },
    { id: 'cardigan', name: 'Cardigan', category: 'Tops', icon: '🧥', essential: true, versatility: 5, seasonality: ['spring', 'fall', 'winter'] },
    { id: 'turtleneck', name: 'Turtleneck', category: 'Tops', icon: '🧥', essential: false, versatility: 3, seasonality: ['fall', 'winter'] },

    // Bottoms
    { id: 'jeans-dark', name: 'Dark Wash Jeans', category: 'Bottoms', icon: '👖', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'jeans-light', name: 'Light Wash Jeans', category: 'Bottoms', icon: '👖', essential: false, versatility: 4, seasonality: ['spring', 'summer'] },
    { id: 'chinos-khaki', name: 'Khaki Chinos', category: 'Bottoms', icon: '👖', essential: true, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'chinos-navy', name: 'Navy Chinos', category: 'Bottoms', icon: '👖', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'trousers-black', name: 'Black Trousers', category: 'Bottoms', icon: '👖', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'shorts', name: 'Neutral Shorts', category: 'Bottoms', icon: '🩳', essential: false, versatility: 3, seasonality: ['summer'] },
    { id: 'skirt-midi', name: 'Midi Skirt', category: 'Bottoms', icon: '👗', essential: false, versatility: 3, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'skirt-pencil', name: 'Pencil Skirt', category: 'Bottoms', icon: '👗', essential: false, versatility: 3, seasonality: ['spring', 'summer', 'fall', 'winter'] },

    // Dresses
    { id: 'dress-lbd', name: 'Little Black Dress', category: 'Dresses', icon: '👗', essential: true, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'dress-casual', name: 'Casual Day Dress', category: 'Dresses', icon: '👗', essential: false, versatility: 3, seasonality: ['spring', 'summer'] },
    { id: 'dress-shirt', name: 'Shirt Dress', category: 'Dresses', icon: '👗', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },

    // Outerwear
    { id: 'blazer-navy', name: 'Navy Blazer', category: 'Outerwear', icon: '🧥', essential: true, versatility: 5, seasonality: ['spring', 'fall', 'winter'] },
    { id: 'blazer-black', name: 'Black Blazer', category: 'Outerwear', icon: '🧥', essential: false, versatility: 4, seasonality: ['spring', 'fall', 'winter'] },
    { id: 'denim-jacket', name: 'Denim Jacket', category: 'Outerwear', icon: '🧥', essential: true, versatility: 4, seasonality: ['spring', 'fall'] },
    { id: 'trench', name: 'Trench Coat', category: 'Outerwear', icon: '🧥', essential: true, versatility: 4, seasonality: ['spring', 'fall'] },
    { id: 'wool-coat', name: 'Wool Coat', category: 'Outerwear', icon: '🧥', essential: true, versatility: 4, seasonality: ['fall', 'winter'] },
    { id: 'puffer', name: 'Puffer Jacket', category: 'Outerwear', icon: '🧥', essential: false, versatility: 3, seasonality: ['winter'] },
    { id: 'leather-jacket', name: 'Leather Jacket', category: 'Outerwear', icon: '🧥', essential: false, versatility: 4, seasonality: ['spring', 'fall'] },

    // Shoes
    { id: 'sneakers-white', name: 'White Sneakers', category: 'Shoes', icon: '👟', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'loafers', name: 'Leather Loafers', category: 'Shoes', icon: '👞', essential: true, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'boots-ankle', name: 'Ankle Boots', category: 'Shoes', icon: '👢', essential: true, versatility: 4, seasonality: ['fall', 'winter'] },
    { id: 'boots-knee', name: 'Knee-High Boots', category: 'Shoes', icon: '👢', essential: false, versatility: 3, seasonality: ['fall', 'winter'] },
    { id: 'heels-nude', name: 'Nude Heels', category: 'Shoes', icon: '👠', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'heels-black', name: 'Black Heels', category: 'Shoes', icon: '👠', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'sandals', name: 'Strappy Sandals', category: 'Shoes', icon: '👡', essential: false, versatility: 3, seasonality: ['summer'] },
    { id: 'flats', name: 'Ballet Flats', category: 'Shoes', icon: '🥿', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },

    // Accessories
    { id: 'belt-leather', name: 'Leather Belt', category: 'Accessories', icon: '🪢', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'scarf-silk', name: 'Silk Scarf', category: 'Accessories', icon: '🧣', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall'] },
    { id: 'scarf-wool', name: 'Wool Scarf', category: 'Accessories', icon: '🧣', essential: false, versatility: 3, seasonality: ['fall', 'winter'] },
    { id: 'bag-tote', name: 'Tote Bag', category: 'Accessories', icon: '👜', essential: true, versatility: 5, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'bag-crossbody', name: 'Crossbody Bag', category: 'Accessories', icon: '👜', essential: false, versatility: 4, seasonality: ['spring', 'summer', 'fall', 'winter'] },
    { id: 'watch', name: 'Classic Watch', category: 'Accessories', icon: '⌚', essential: false, versatility: 5, seasonality: ['spring', 'summer', 'fall', 'winter'] },
  ];

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.style) {
        setStyle(params.style as typeof style);
        hasChanges = true;
      }
      if (params.season) {
        setSeason(params.season as typeof season);
        hasChanges = true;
      }
      if (params.targetCount) {
        setTargetCount(Number(params.targetCount));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredItems = useMemo(() => {
    return clothingItems.filter(item => {
      if (season === 'all') return true;
      return item.seasonality.includes(season);
    });
  }, [season]);

  const totalItemCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const addItem = (itemId: string) => {
    const existingIndex = selectedItems.findIndex(item => item.itemId === itemId);
    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      setSelectedItems([...selectedItems, {
        itemId,
        quantity: 1,
        color: neutralColors[0],
      }]);
    }
  };

  const removeItem = (itemId: string) => {
    const existingIndex = selectedItems.findIndex(item => item.itemId === itemId);
    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      if (newItems[existingIndex].quantity > 1) {
        newItems[existingIndex].quantity -= 1;
      } else {
        newItems.splice(existingIndex, 1);
      }
      setSelectedItems(newItems);
    }
  };

  const getItemQuantity = (itemId: string): number => {
    const item = selectedItems.find(i => i.itemId === itemId);
    return item?.quantity || 0;
  };

  const buildStarterWardrobe = () => {
    const essentials = clothingItems.filter(item => {
      if (season !== 'all' && !item.seasonality.includes(season)) return false;
      return item.essential;
    });

    const newItems: WardrobeSelection[] = essentials.map(item => ({
      itemId: item.id,
      quantity: 1,
      color: neutralColors[0],
    }));

    setSelectedItems(newItems);
  };

  const resetWardrobe = () => {
    setSelectedItems([]);
  };

  const outfitCombinations = useMemo(() => {
    const tops = selectedItems.filter(s => {
      const item = clothingItems.find(i => i.id === s.itemId);
      return item?.category === 'Tops';
    }).reduce((sum, s) => sum + s.quantity, 0);

    const bottoms = selectedItems.filter(s => {
      const item = clothingItems.find(i => i.id === s.itemId);
      return item?.category === 'Bottoms';
    }).reduce((sum, s) => sum + s.quantity, 0);

    const outerwear = selectedItems.filter(s => {
      const item = clothingItems.find(i => i.id === s.itemId);
      return item?.category === 'Outerwear';
    }).reduce((sum, s) => sum + s.quantity, 0);

    const baseOutfits = tops * bottoms;
    const withOuterwear = baseOutfits * (outerwear + 1); // +1 for no outerwear option

    return { tops, bottoms, outerwear, baseOutfits, withOuterwear };
  }, [selectedItems]);

  const categories = [...new Set(clothingItems.map(i => i.category))];

  const seasonIcon = {
    spring: <Flower2 className="w-4 h-4" />,
    summer: <Sun className="w-4 h-4" />,
    fall: <Leaf className="w-4 h-4" />,
    winter: <Snowflake className="w-4 h-4" />,
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Capsule Wardrobe Planner</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Build a versatile, minimal wardrobe
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">Settings loaded from AI response</span>
            </div>
          )}

          {/* Settings */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Palette className="w-4 h-4 text-teal-500" />
                Style Focus
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'casual', label: 'Casual' },
                  { value: 'professional', label: 'Professional' },
                  { value: 'versatile', label: 'Versatile' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value as typeof style)}
                    className={`py-2 px-3 rounded-lg text-sm ${
                      style === s.value
                        ? 'bg-teal-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Season Filter
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Year' },
                  { value: 'spring', label: 'Spring' },
                  { value: 'summer', label: 'Summer' },
                  { value: 'fall', label: 'Fall' },
                  { value: 'winter', label: 'Winter' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSeason(s.value as typeof season)}
                    className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm ${
                      season === s.value
                        ? 'bg-teal-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {s.value !== 'all' && seasonIcon[s.value as keyof typeof seasonIcon]}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Count */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Target Capsule Size: {targetCount} items
            </label>
            <input
              type="range"
              min="15"
              max="50"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>15 (Ultra Minimal)</span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>37 (Classic)</span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>50 (Extended)</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={buildStarterWardrobe}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              <Sparkles className="w-4 h-4" />
              Build Essential Wardrobe
            </button>
            <button
              onClick={resetWardrobe}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Progress: {totalItemCount} / {targetCount} items
              </span>
              <span className={`text-sm ${totalItemCount === targetCount ? 'text-green-500' : totalItemCount > targetCount ? 'text-orange-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {totalItemCount === targetCount ? 'Perfect!' : totalItemCount > targetCount ? 'Over target' : `${targetCount - totalItemCount} more needed`}
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full transition-all ${
                  totalItemCount > targetCount ? 'bg-orange-500' : totalItemCount === targetCount ? 'bg-green-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, (totalItemCount / targetCount) * 100)}%` }}
              />
            </div>
          </div>

          {/* Outfit Combinations */}
          {outfitCombinations.baseOutfits > 0 && (
            <div className={`p-4 rounded-xl mb-6 ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                Outfit Potential
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-teal-500">{outfitCombinations.tops}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tops</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-500">{outfitCombinations.bottoms}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bottoms</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-500">{outfitCombinations.baseOutfits}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Base Outfits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-500">{outfitCombinations.withOuterwear}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>With Outerwear</p>
                </div>
              </div>
            </div>
          )}

          {/* Clothing Selection */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Build Your Capsule
            </h3>
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredItems.filter(i => i.category === category).map((item) => {
                    const quantity = getItemQuantity(item.id);
                    const isSelected = quantity > 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          isSelected
                            ? isDarkMode ? 'bg-teal-900/30 border-teal-700' : 'bg-teal-50 border-teal-200'
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        } border ${isSelected ? 'border-teal-500' : isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                              {item.essential && (
                                <span className="ml-2 text-xs text-teal-500">Essential</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {'★'.repeat(item.versatility)}{'☆'.repeat(5 - item.versatility)}
                              </span>
                              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                                {item.seasonality.map(s => seasonIcon[s])}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={!isSelected}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                                : 'opacity-50 cursor-not-allowed bg-gray-300'
                            }`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`w-6 text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => addItem(item.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-500 hover:bg-teal-600'
                            } text-white`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Color Palette Suggestion */}
          <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Palette className="w-4 h-4 inline mr-2" />
              Suggested Color Palette
            </h4>
            <div className="space-y-2">
              <div>
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Neutrals (70%)</p>
                <div className="flex gap-2">
                  {neutralColors.map((color) => (
                    <span
                      key={color}
                      className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'}`}
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accents (30%)</p>
                <div className="flex flex-wrap gap-2">
                  {accentColors.map((color) => (
                    <span
                      key={color}
                      className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'}`}
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-1">Capsule Wardrobe Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Stick to a cohesive color palette for maximum outfit combinations</li>
                <li>Invest in quality basics that will last years</li>
                <li>Every item should work with at least 3 other items</li>
                <li>37 items is the classic capsule size (including shoes)</li>
                <li>Reassess seasonally and update 2-3 items as needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardrobeCapsuletool;
