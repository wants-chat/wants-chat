import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, DollarSign, Plus, Trash2, Sparkles, Info, Clock, MapPin, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DrycleaningCostToolProps {
  uiConfig?: UIConfig;
}

interface GarmentType {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  premiumCost: number;
  category: string;
}

interface SelectedItem {
  garmentId: string;
  quantity: number;
  options: {
    premium: boolean;
    stainRemoval: boolean;
    express: boolean;
    pressing: boolean;
  };
}

const DrycleaningCostTool: React.FC<DrycleaningCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [location, setLocation] = useState<'standard' | 'urban' | 'premium'>('standard');
  const [membership, setMembership] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState(false);

  const garmentTypes: GarmentType[] = [
    // Tops
    { id: 'shirt', name: 'Dress Shirt', icon: '👔', baseCost: 3.50, premiumCost: 6.00, category: 'Tops' },
    { id: 'blouse', name: 'Blouse', icon: '👚', baseCost: 5.00, premiumCost: 8.00, category: 'Tops' },
    { id: 'sweater', name: 'Sweater', icon: '🧥', baseCost: 6.50, premiumCost: 12.00, category: 'Tops' },
    { id: 'jacket', name: 'Jacket/Blazer', icon: '🧥', baseCost: 8.00, premiumCost: 15.00, category: 'Tops' },
    // Bottoms
    { id: 'pants', name: 'Pants/Trousers', icon: '👖', baseCost: 6.00, premiumCost: 10.00, category: 'Bottoms' },
    { id: 'skirt', name: 'Skirt', icon: '👗', baseCost: 5.50, premiumCost: 9.00, category: 'Bottoms' },
    { id: 'jeans', name: 'Jeans', icon: '👖', baseCost: 7.00, premiumCost: 12.00, category: 'Bottoms' },
    // Dresses & Suits
    { id: 'dress', name: 'Dress', icon: '👗', baseCost: 10.00, premiumCost: 18.00, category: 'Dresses' },
    { id: 'eveningdress', name: 'Evening Gown', icon: '👗', baseCost: 25.00, premiumCost: 50.00, category: 'Dresses' },
    { id: 'suit2pc', name: '2-Piece Suit', icon: '🤵', baseCost: 15.00, premiumCost: 25.00, category: 'Suits' },
    { id: 'suit3pc', name: '3-Piece Suit', icon: '🤵', baseCost: 20.00, premiumCost: 35.00, category: 'Suits' },
    { id: 'tuxedo', name: 'Tuxedo', icon: '🤵', baseCost: 25.00, premiumCost: 45.00, category: 'Suits' },
    // Outerwear
    { id: 'coat', name: 'Coat', icon: '🧥', baseCost: 15.00, premiumCost: 30.00, category: 'Outerwear' },
    { id: 'downcoat', name: 'Down Jacket', icon: '🧥', baseCost: 20.00, premiumCost: 40.00, category: 'Outerwear' },
    { id: 'leather', name: 'Leather Jacket', icon: '🧥', baseCost: 45.00, premiumCost: 75.00, category: 'Outerwear' },
    // Special Items
    { id: 'wedding', name: 'Wedding Dress', icon: '👰', baseCost: 150.00, premiumCost: 300.00, category: 'Special' },
    { id: 'comforter', name: 'Comforter', icon: '🛏️', baseCost: 25.00, premiumCost: 45.00, category: 'Household' },
    { id: 'curtains', name: 'Curtains (pair)', icon: '🪟', baseCost: 20.00, premiumCost: 35.00, category: 'Household' },
  ];

  // Location multipliers
  const locationMultipliers = {
    standard: 1.0,
    urban: 1.3,
    premium: 1.6,
  };

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.garments && Array.isArray(params.garments)) {
        const items: SelectedItem[] = params.garments.map((g: any) => ({
          garmentId: g.id || 'shirt',
          quantity: g.quantity || 1,
          options: {
            premium: g.premium || false,
            stainRemoval: g.stainRemoval || false,
            express: g.express || false,
            pressing: g.pressing || false,
          },
        }));
        setSelectedItems(items);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addItem = (garmentId: string) => {
    const existingIndex = selectedItems.findIndex(item => item.garmentId === garmentId);
    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      setSelectedItems([...selectedItems, {
        garmentId,
        quantity: 1,
        options: { premium: false, stainRemoval: false, express: false, pressing: false },
      }]);
    }
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(index);
      return;
    }
    const newItems = [...selectedItems];
    newItems[index].quantity = quantity;
    setSelectedItems(newItems);
  };

  const updateItemOption = (index: number, option: keyof SelectedItem['options'], value: boolean) => {
    const newItems = [...selectedItems];
    newItems[index].options[option] = value;
    setSelectedItems(newItems);
  };

  const calculations = useMemo(() => {
    let subtotal = 0;
    let stainRemovalTotal = 0;
    let expressTotal = 0;
    let pressingTotal = 0;
    let itemCount = 0;

    selectedItems.forEach(item => {
      const garment = garmentTypes.find(g => g.id === item.garmentId);
      if (!garment) return;

      const baseCost = item.options.premium ? garment.premiumCost : garment.baseCost;
      const itemTotal = baseCost * item.quantity;
      subtotal += itemTotal;
      itemCount += item.quantity;

      if (item.options.stainRemoval) {
        stainRemovalTotal += 5.00 * item.quantity;
      }
      if (item.options.express) {
        expressTotal += itemTotal * 0.5; // 50% surcharge
      }
      if (item.options.pressing) {
        pressingTotal += 2.00 * item.quantity;
      }
    });

    const servicesTotal = stainRemovalTotal + expressTotal + pressingTotal;
    const preLocationTotal = subtotal + servicesTotal;
    const locationTotal = preLocationTotal * locationMultipliers[location];

    // Discounts
    let discountAmount = 0;
    if (membership) {
      discountAmount += locationTotal * 0.1; // 10% member discount
    }
    if (bulkDiscount && itemCount >= 5) {
      discountAmount += (locationTotal - discountAmount) * 0.15; // 15% bulk discount
    }

    const finalTotal = locationTotal - discountAmount;

    return {
      subtotal,
      stainRemovalTotal,
      expressTotal,
      pressingTotal,
      servicesTotal,
      locationMultiplier: locationMultipliers[location],
      locationTotal,
      discountAmount,
      finalTotal,
      itemCount,
    };
  }, [selectedItems, location, membership, bulkDiscount]);

  const categories = [...new Set(garmentTypes.map(g => g.category))];

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
              <h1 className="text-3xl font-bold">{t('tools.drycleaningCost.dryCleaningCostEstimator', 'Dry Cleaning Cost Estimator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.drycleaningCost.estimateYourDryCleaningCosts', 'Estimate your dry cleaning costs before you go')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.drycleaningCost.itemsLoadedFromAiResponse', 'Items loaded from AI response')}</span>
            </div>
          )}

          {/* Location & Options */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="w-4 h-4 text-teal-500" />
                {t('tools.drycleaningCost.locationType', 'Location Type')}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'standard', label: 'Suburban', mult: '1x' },
                  { value: 'urban', label: 'Urban', mult: '1.3x' },
                  { value: 'premium', label: 'Premium', mult: '1.6x' },
                ].map((loc) => (
                  <button
                    key={loc.value}
                    onClick={() => setLocation(loc.value as typeof location)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                      location === loc.value
                        ? 'bg-teal-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {loc.label}
                    <span className="block text-xs opacity-75">{loc.mult}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.drycleaningCost.discounts', 'Discounts')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={membership}
                    onChange={(e) => setMembership(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-teal-500"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.drycleaningCost.memberDiscount10Off', 'Member Discount (10% off)')}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-teal-500"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.drycleaningCost.bulkDiscount15Off5', 'Bulk Discount (15% off 5+ items)')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Garment Selection */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('tools.drycleaningCost.selectItems', 'Select Items')}
            </h3>
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {garmentTypes.filter(g => g.category === category).map((garment) => (
                    <button
                      key={garment.id}
                      onClick={() => addItem(garment.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>{garment.icon}</span>
                      <span>{garment.name}</span>
                      <span className="text-teal-500">${garment.baseCost.toFixed(2)}</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Your Items ({calculations.itemCount} total)
              </h3>
              <div className="space-y-3">
                {selectedItems.map((item, index) => {
                  const garment = garmentTypes.find(g => g.id === item.garmentId);
                  if (!garment) return null;

                  const itemCost = (item.options.premium ? garment.premiumCost : garment.baseCost) * item.quantity;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{garment.icon}</span>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {garment.name}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              ${(item.options.premium ? garment.premiumCost : garment.baseCost).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              -
                            </button>
                            <span className={`w-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-teal-500 w-20 text-right">
                            ${itemCost.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Options */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'premium', label: 'Premium Service', extra: `+$${(garment.premiumCost - garment.baseCost).toFixed(2)}` },
                          { key: 'stainRemoval', label: 'Stain Removal', extra: '+$5.00' },
                          { key: 'express', label: 'Express (24hr)', extra: '+50%' },
                          { key: 'pressing', label: 'Extra Pressing', extra: '+$2.00' },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => updateItemOption(index, opt.key as keyof SelectedItem['options'], !item.options[opt.key as keyof SelectedItem['options']])}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              item.options[opt.key as keyof SelectedItem['options']]
                                ? 'bg-teal-500 text-white'
                                : isDarkMode
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {item.options[opt.key as keyof SelectedItem['options']] && <Check className="w-3 h-3" />}
                            {opt.label} {opt.extra}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cost Summary */}
          {selectedItems.length > 0 && (
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                <DollarSign className="w-5 h-5 inline mr-2" />
                {t('tools.drycleaningCost.costEstimate', 'Cost Estimate')}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Subtotal ({calculations.itemCount} items)</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>${calculations.subtotal.toFixed(2)}</span>
                </div>
                {calculations.stainRemovalTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{t('tools.drycleaningCost.stainRemoval', 'Stain Removal')}</span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>+${calculations.stainRemovalTotal.toFixed(2)}</span>
                  </div>
                )}
                {calculations.expressTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{t('tools.drycleaningCost.expressService', 'Express Service')}</span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>+${calculations.expressTotal.toFixed(2)}</span>
                  </div>
                )}
                {calculations.pressingTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{t('tools.drycleaningCost.extraPressing', 'Extra Pressing')}</span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>+${calculations.pressingTotal.toFixed(2)}</span>
                  </div>
                )}
                {calculations.locationMultiplier !== 1 && (
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Location Adjustment ({((calculations.locationMultiplier - 1) * 100).toFixed(0)}%)
                    </span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      +${((calculations.locationTotal - (calculations.subtotal + calculations.servicesTotal))).toFixed(2)}
                    </span>
                  </div>
                )}
                {calculations.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>{t('tools.drycleaningCost.discountsApplied', 'Discounts Applied')}</span>
                    <span>-${calculations.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.drycleaningCost.estimatedTotal', 'Estimated Total')}
                  </span>
                  <span className="text-3xl font-bold text-teal-500">
                    ${calculations.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedItems.length === 0 && (
            <div className={`p-8 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Shirt className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.drycleaningCost.clickOnGarmentTypesAbove', 'Click on garment types above to add items to your estimate')}
              </p>
            </div>
          )}

          {/* Info */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-1">{t('tools.drycleaningCost.pricingNotes', 'Pricing Notes:')}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t('tools.drycleaningCost.pricesAreEstimatesAndMay', 'Prices are estimates and may vary by location and provider')}</li>
                <li>{t('tools.drycleaningCost.specialFabricsSilkCashmereEtc', 'Special fabrics (silk, cashmere, etc.) may incur additional charges')}</li>
                <li>{t('tools.drycleaningCost.heavilySoiledItemsMayRequire', 'Heavily soiled items may require additional treatment')}</li>
                <li>{t('tools.drycleaningCost.askAboutWeeklySpecialsAnd', 'Ask about weekly specials and loyalty programs')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrycleaningCostTool;
