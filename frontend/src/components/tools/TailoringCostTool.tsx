import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, DollarSign, Plus, Trash2, Sparkles, Info, Clock, Check, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TailoringCostToolProps {
  uiConfig?: UIConfig;
}

interface Alteration {
  id: string;
  name: string;
  category: string;
  description: string;
  minCost: number;
  maxCost: number;
  complexity: 'simple' | 'moderate' | 'complex';
  timeEstimate: string;
}

interface SelectedAlteration {
  alterationId: string;
  quantity: number;
  rush: boolean;
}

const TailoringCostTool: React.FC<TailoringCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedAlterations, setSelectedAlterations] = useState<SelectedAlteration[]>([]);
  const [garmentQuality, setGarmentQuality] = useState<'standard' | 'designer' | 'luxury'>('standard');
  const [location, setLocation] = useState<'budget' | 'standard' | 'premium'>('standard');

  const alterations: Alteration[] = [
    // Pants/Trousers
    { id: 'hem-pants', name: 'Hem Pants', category: 'Pants', description: 'Shorten or lengthen pants', minCost: 10, maxCost: 25, complexity: 'simple', timeEstimate: '1-2 days' },
    { id: 'taper-pants', name: 'Taper Pants', category: 'Pants', description: 'Slim down the leg opening', minCost: 20, maxCost: 45, complexity: 'moderate', timeEstimate: '2-3 days' },
    { id: 'waist-pants', name: 'Waist In/Out', category: 'Pants', description: 'Take in or let out waist', minCost: 15, maxCost: 35, complexity: 'moderate', timeEstimate: '2-3 days' },
    { id: 'zipper-pants', name: 'Replace Zipper', category: 'Pants', description: 'Replace broken zipper', minCost: 15, maxCost: 30, complexity: 'simple', timeEstimate: '1-2 days' },
    { id: 'seat-pants', name: 'Seat Adjustment', category: 'Pants', description: 'Adjust seat area', minCost: 25, maxCost: 50, complexity: 'complex', timeEstimate: '3-5 days' },

    // Shirts/Tops
    { id: 'hem-shirt', name: 'Hem Shirt', category: 'Shirts', description: 'Shorten shirt length', minCost: 12, maxCost: 25, complexity: 'simple', timeEstimate: '1-2 days' },
    { id: 'sides-shirt', name: 'Take In Sides', category: 'Shirts', description: 'Slim the body', minCost: 15, maxCost: 35, complexity: 'moderate', timeEstimate: '2-3 days' },
    { id: 'sleeves-shirt', name: 'Shorten Sleeves', category: 'Shirts', description: 'Adjust sleeve length', minCost: 15, maxCost: 30, complexity: 'moderate', timeEstimate: '2-3 days' },
    { id: 'collar-shirt', name: 'Collar Adjustment', category: 'Shirts', description: 'Resize or reshape collar', minCost: 20, maxCost: 45, complexity: 'complex', timeEstimate: '3-5 days' },

    // Jackets/Blazers
    { id: 'sleeves-jacket', name: 'Shorten Sleeves', category: 'Jackets', description: 'Adjust jacket sleeves', minCost: 25, maxCost: 55, complexity: 'moderate', timeEstimate: '3-5 days' },
    { id: 'body-jacket', name: 'Take In Body', category: 'Jackets', description: 'Slim the jacket body', minCost: 40, maxCost: 85, complexity: 'complex', timeEstimate: '5-7 days' },
    { id: 'shoulders-jacket', name: 'Shoulder Adjustment', category: 'Jackets', description: 'Reshape shoulders (complex)', minCost: 75, maxCost: 150, complexity: 'complex', timeEstimate: '7-10 days' },
    { id: 'lining-jacket', name: 'Replace Lining', category: 'Jackets', description: 'Full lining replacement', minCost: 100, maxCost: 200, complexity: 'complex', timeEstimate: '7-10 days' },
    { id: 'buttons-jacket', name: 'Replace Buttons', category: 'Jackets', description: 'New buttons installed', minCost: 15, maxCost: 35, complexity: 'simple', timeEstimate: '1-2 days' },

    // Dresses
    { id: 'hem-dress', name: 'Hem Dress', category: 'Dresses', description: 'Adjust dress length', minCost: 20, maxCost: 50, complexity: 'moderate', timeEstimate: '2-4 days' },
    { id: 'sides-dress', name: 'Take In/Out', category: 'Dresses', description: 'Adjust dress fit', minCost: 25, maxCost: 60, complexity: 'moderate', timeEstimate: '3-5 days' },
    { id: 'straps-dress', name: 'Adjust Straps', category: 'Dresses', description: 'Shorten or add straps', minCost: 15, maxCost: 35, complexity: 'simple', timeEstimate: '1-2 days' },
    { id: 'bustle-dress', name: 'Add Bustle', category: 'Dresses', description: 'Wedding dress bustle', minCost: 50, maxCost: 100, complexity: 'complex', timeEstimate: '3-5 days' },
    { id: 'full-dress', name: 'Full Alteration', category: 'Dresses', description: 'Complete dress fitting', minCost: 75, maxCost: 200, complexity: 'complex', timeEstimate: '7-14 days' },

    // Suits
    { id: 'full-suit', name: 'Full Suit Alteration', category: 'Suits', description: 'Complete suit fitting', minCost: 100, maxCost: 250, complexity: 'complex', timeEstimate: '7-14 days' },

    // Other
    { id: 'patch', name: 'Patch/Repair', category: 'Repairs', description: 'Fix tears or holes', minCost: 10, maxCost: 30, complexity: 'simple', timeEstimate: '1-3 days' },
    { id: 'button', name: 'Replace Button', category: 'Repairs', description: 'Single button replacement', minCost: 3, maxCost: 8, complexity: 'simple', timeEstimate: '1 day' },
    { id: 'zipper', name: 'Replace Zipper', category: 'Repairs', description: 'General zipper replacement', minCost: 15, maxCost: 40, complexity: 'moderate', timeEstimate: '2-3 days' },
  ];

  // Multipliers
  const qualityMultipliers = {
    standard: 1.0,
    designer: 1.5,
    luxury: 2.0,
  };

  const locationMultipliers = {
    budget: 0.7,
    standard: 1.0,
    premium: 1.5,
  };

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.alterations && Array.isArray(params.alterations)) {
        const items: SelectedAlteration[] = params.alterations.map((a: any) => ({
          alterationId: a.id || 'hem-pants',
          quantity: a.quantity || 1,
          rush: a.rush || false,
        }));
        setSelectedAlterations(items);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const addAlteration = (alterationId: string) => {
    const existingIndex = selectedAlterations.findIndex(item => item.alterationId === alterationId);
    if (existingIndex >= 0) {
      const newItems = [...selectedAlterations];
      newItems[existingIndex].quantity += 1;
      setSelectedAlterations(newItems);
    } else {
      setSelectedAlterations([...selectedAlterations, {
        alterationId,
        quantity: 1,
        rush: false,
      }]);
    }
  };

  const removeAlteration = (index: number) => {
    setSelectedAlterations(selectedAlterations.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      removeAlteration(index);
      return;
    }
    const newItems = [...selectedAlterations];
    newItems[index].quantity = quantity;
    setSelectedAlterations(newItems);
  };

  const toggleRush = (index: number) => {
    const newItems = [...selectedAlterations];
    newItems[index].rush = !newItems[index].rush;
    setSelectedAlterations(newItems);
  };

  const calculations = useMemo(() => {
    let minTotal = 0;
    let maxTotal = 0;
    let rushFees = 0;

    selectedAlterations.forEach(item => {
      const alteration = alterations.find(a => a.id === item.alterationId);
      if (!alteration) return;

      const qualityMult = qualityMultipliers[garmentQuality];
      const locationMult = locationMultipliers[location];

      const itemMin = alteration.minCost * qualityMult * locationMult * item.quantity;
      const itemMax = alteration.maxCost * qualityMult * locationMult * item.quantity;

      minTotal += itemMin;
      maxTotal += itemMax;

      if (item.rush) {
        rushFees += (itemMax * 0.5); // 50% rush fee
      }
    });

    return {
      minTotal,
      maxTotal,
      rushFees,
      grandMinTotal: minTotal + rushFees,
      grandMaxTotal: maxTotal + rushFees,
      averageTotal: ((minTotal + maxTotal) / 2) + rushFees,
    };
  }, [selectedAlterations, garmentQuality, location]);

  const getComplexityColor = (complexity: Alteration['complexity']) => {
    switch (complexity) {
      case 'simple': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'complex': return 'text-orange-500';
    }
  };

  const categories = [...new Set(alterations.map(a => a.category))];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.tailoringCost.tailoringCostEstimator', 'Tailoring Cost Estimator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.tailoringCost.getAnEstimateForClothing', 'Get an estimate for clothing alterations')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.tailoringCost.alterationsLoadedFromAiResponse', 'Alterations loaded from AI response')}</span>
            </div>
          )}

          {/* Settings */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Star className="w-4 h-4 text-teal-500" />
                {t('tools.tailoringCost.garmentQuality', 'Garment Quality')}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'standard', label: 'Standard', mult: '1x' },
                  { value: 'designer', label: 'Designer', mult: '1.5x' },
                  { value: 'luxury', label: 'Luxury/Couture', mult: '2x' },
                ].map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setGarmentQuality(q.value as typeof garmentQuality)}
                    className={`flex-1 py-2 px-2 rounded-lg text-sm ${
                      garmentQuality === q.value
                        ? 'bg-teal-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {q.label}
                    <span className="block text-xs opacity-75">{q.mult}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 text-teal-500" />
                {t('tools.tailoringCost.tailorType', 'Tailor Type')}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'budget', label: 'Budget', mult: '0.7x' },
                  { value: 'standard', label: 'Standard', mult: '1x' },
                  { value: 'premium', label: 'Premium', mult: '1.5x' },
                ].map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLocation(l.value as typeof location)}
                    className={`flex-1 py-2 px-2 rounded-lg text-sm ${
                      location === l.value
                        ? 'bg-teal-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {l.label}
                    <span className="block text-xs opacity-75">{l.mult}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alteration Selection */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('tools.tailoringCost.selectAlterations', 'Select Alterations')}
            </h3>
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {alterations.filter(a => a.category === category).map((alteration) => (
                    <button
                      key={alteration.id}
                      onClick={() => addAlteration(alteration.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={alteration.description}
                    >
                      <span>{alteration.name}</span>
                      <span className="text-teal-500">${alteration.minCost}-${alteration.maxCost}</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Alterations */}
          {selectedAlterations.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {t('tools.tailoringCost.yourAlterations', 'Your Alterations')}
              </h3>
              <div className="space-y-3">
                {selectedAlterations.map((item, index) => {
                  const alteration = alterations.find(a => a.id === item.alterationId);
                  if (!alteration) return null;

                  const qualityMult = qualityMultipliers[garmentQuality];
                  const locationMult = locationMultipliers[location];
                  const minCost = alteration.minCost * qualityMult * locationMult * item.quantity;
                  const maxCost = alteration.maxCost * qualityMult * locationMult * item.quantity;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {alteration.name}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {alteration.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs ${getComplexityColor(alteration.complexity)}`}>
                              {alteration.complexity.charAt(0).toUpperCase() + alteration.complexity.slice(1)}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Clock className="w-3 h-3" />
                              {alteration.timeEstimate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
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
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-teal-500 w-28 text-right">
                            ${minCost.toFixed(0)}-${maxCost.toFixed(0)}
                          </span>
                          <button
                            onClick={() => removeAlteration(index)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Rush option */}
                      <button
                        onClick={() => toggleRush(index)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          item.rush
                            ? 'bg-orange-500 text-white'
                            : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {item.rush && <Check className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        {t('tools.tailoringCost.rushOrder50', 'Rush Order (+50%)')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cost Summary */}
          {selectedAlterations.length > 0 && (
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                <DollarSign className="w-5 h-5 inline mr-2" />
                {t('tools.tailoringCost.costEstimate', 'Cost Estimate')}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{t('tools.tailoringCost.baseCostRange', 'Base Cost Range')}</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    ${calculations.minTotal.toFixed(0)} - ${calculations.maxTotal.toFixed(0)}
                  </span>
                </div>
                {calculations.rushFees > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tailoringCost.rushFees', 'Rush Fees')}</span>
                    <span className="text-orange-500">+${calculations.rushFees.toFixed(0)}</span>
                  </div>
                )}
              </div>

              <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.tailoringCost.estimatedTotal', 'Estimated Total')}
                  </span>
                  <span className="text-2xl font-bold text-teal-500">
                    ${calculations.grandMinTotal.toFixed(0)} - ${calculations.grandMaxTotal.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.tailoringCost.averageEstimate', 'Average Estimate')}
                  </span>
                  <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ~${calculations.averageTotal.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedAlterations.length === 0 && (
            <div className={`p-8 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Scissors className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.tailoringCost.clickOnAlterationsAboveTo', 'Click on alterations above to add them to your estimate')}
              </p>
            </div>
          )}

          {/* Info */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-1">{t('tools.tailoringCost.tailoringTips', 'Tailoring Tips:')}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t('tools.tailoringCost.pricesVarySignificantlyByRegion', 'Prices vary significantly by region and tailor skill level')}</li>
                <li>{t('tools.tailoringCost.complexAlterationsLikeShouldersAre', 'Complex alterations like shoulders are expensive for a reason')}</li>
                <li>{t('tools.tailoringCost.alwaysGetAnInPerson', 'Always get an in-person quote before committing')}</li>
                <li>{t('tools.tailoringCost.someAlterationsMayNotBe', 'Some alterations may not be possible on certain garments')}</li>
                <li>{t('tools.tailoringCost.budgetExtraForDesignerLuxury', 'Budget extra for designer/luxury items due to special care needed')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailoringCostTool;
