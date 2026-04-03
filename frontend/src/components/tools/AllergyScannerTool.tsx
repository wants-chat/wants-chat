import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Search, Plus, X, Check, Info, ShieldAlert, Leaf } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type AllergenType = 'milk' | 'eggs' | 'peanuts' | 'treeNuts' | 'wheat' | 'soy' | 'fish' | 'shellfish' | 'sesame';

interface AllergenInfo {
  name: string;
  hiddenNames: string[];
  crossContamination: string[];
  safeAlternatives: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

const allergenDatabase: Record<AllergenType, AllergenInfo> = {
  milk: {
    name: 'Milk / Dairy',
    hiddenNames: [
      'casein', 'caseinate', 'whey', 'lactalbumin', 'lactoglobulin', 'lactose',
      'ghee', 'curds', 'rennet', 'recaldent', 'hydrolysates', 'lactulose',
      'nisin', 'simplesse', 'galactose', 'tagatose'
    ],
    crossContamination: [
      'Bakery products', 'Processed meats', 'Chocolate', 'Chips and snacks',
      'Restaurant grills', 'Shared fryers', 'Salad dressings'
    ],
    safeAlternatives: [
      'Oat milk', 'Almond milk', 'Coconut milk', 'Soy milk', 'Rice milk',
      'Cashew cheese', 'Coconut yogurt', 'Dairy-free butter'
    ],
    severity: 'moderate'
  },
  eggs: {
    name: 'Eggs',
    hiddenNames: [
      'albumin', 'globulin', 'lysozyme', 'mayonnaise', 'meringue', 'ovalbumin',
      'ovomucin', 'ovomucoid', 'ovovitellin', 'silici albuminate', 'vitellin',
      'livetin', 'lecithin (if egg-derived)', 'surimi'
    ],
    crossContamination: [
      'Pasta', 'Baked goods', 'Meatballs', 'Breaded foods', 'Ice cream',
      'Salad dressings', 'Foam toppings on drinks'
    ],
    safeAlternatives: [
      'Flax eggs (1 tbsp flax + 3 tbsp water)', 'Chia eggs', 'Applesauce',
      'Mashed banana', 'Commercial egg replacers', 'Aquafaba', 'Silken tofu'
    ],
    severity: 'moderate'
  },
  peanuts: {
    name: 'Peanuts',
    hiddenNames: [
      'arachis oil', 'arachis hypogaea', 'ground nuts', 'monkey nuts',
      'earth nuts', 'goober peas', 'mandelonas', 'hydrolyzed peanut protein',
      'peanut flour', 'peanut butter', 'cold pressed peanut oil'
    ],
    crossContamination: [
      'Tree nut products', 'Candy bars', 'Baked goods', 'Asian cuisine',
      'Ice cream shops', 'Buffets', 'Food trucks', 'Shared equipment'
    ],
    safeAlternatives: [
      'Sunflower seed butter', 'Soy nut butter', 'Tahini', 'Wow butter',
      'Coconut butter', 'Pumpkin seed butter', 'Almond butter (if not allergic)'
    ],
    severity: 'severe'
  },
  treeNuts: {
    name: 'Tree Nuts',
    hiddenNames: [
      'almonds', 'cashews', 'walnuts', 'pecans', 'pistachios', 'hazelnuts',
      'macadamia', 'brazil nuts', 'chestnuts', 'marzipan', 'nougat',
      'praline', 'gianduja', 'nut butters', 'nut oils', 'nut extracts'
    ],
    crossContamination: [
      'Peanut products', 'Bakeries', 'Chocolate factories', 'Ice cream',
      'Granola', 'Trail mix', 'Cereal production', 'Pesto'
    ],
    safeAlternatives: [
      'Seeds (sunflower, pumpkin)', 'Coconut (if safe)', 'Soy nuts',
      'Roasted chickpeas', 'Seed butters', 'Pretzels', 'Popcorn'
    ],
    severity: 'severe'
  },
  wheat: {
    name: 'Wheat / Gluten',
    hiddenNames: [
      'bulgur', 'couscous', 'durum', 'einkorn', 'emmer', 'farina',
      'kamut', 'semolina', 'spelt', 'triticale', 'modified food starch',
      'hydrolyzed wheat protein', 'seitan', 'fu', 'malt', 'brewer\'s yeast'
    ],
    crossContamination: [
      'Oats (unless certified GF)', 'Shared toasters', 'Fryers', 'Pasta water',
      'Cutting boards', 'Flour dust', 'Soy sauce', 'Buffet utensils'
    ],
    safeAlternatives: [
      'Rice', 'Quinoa', 'Buckwheat', 'Certified GF oats', 'Corn', 'Millet',
      'Sorghum', 'Tapioca', 'Almond flour', 'Coconut flour'
    ],
    severity: 'moderate'
  },
  soy: {
    name: 'Soy',
    hiddenNames: [
      'edamame', 'miso', 'tempeh', 'tofu', 'soya', 'soy lecithin',
      'soy protein isolate', 'textured vegetable protein', 'hydrolyzed soy',
      'shoyu', 'tamari', 'natto', 'kinako', 'yuba'
    ],
    crossContamination: [
      'Asian restaurants', 'Vegetarian products', 'Processed foods',
      'Baked goods', 'Canned tuna', 'Cereals', 'Infant formulas'
    ],
    safeAlternatives: [
      'Coconut aminos', 'Chickpea-based products', 'Hemp protein',
      'Pea protein', 'Rice protein', 'Sunflower lecithin', 'Fish sauce'
    ],
    severity: 'mild'
  },
  fish: {
    name: 'Fish',
    hiddenNames: [
      'anchovies', 'caesar dressing', 'worcestershire sauce', 'fish sauce',
      'omega-3 supplements', 'imitation crab', 'surimi', 'fish gelatin',
      'fish stock', 'nuoc mam', 'nam pla', 'bouillabaisse'
    ],
    crossContamination: [
      'Seafood restaurants', 'Shared fryers', 'Asian cuisine', 'Pizza',
      'Salads with anchovies', 'Grills', 'Ethnic cuisines'
    ],
    safeAlternatives: [
      'Poultry', 'Meat', 'Legumes', 'Algae-based omega-3', 'Hearts of palm',
      'Jackfruit', 'Banana blossom', 'Mushrooms'
    ],
    severity: 'severe'
  },
  shellfish: {
    name: 'Shellfish',
    hiddenNames: [
      'crab', 'lobster', 'shrimp', 'prawns', 'crayfish', 'scallops',
      'clams', 'mussels', 'oysters', 'squid', 'octopus', 'snails',
      'glucosamine', 'chitosan', 'tomalley'
    ],
    crossContamination: [
      'Seafood restaurants', 'Asian cuisine', 'Paella', 'Gumbo',
      'Shared fryers', 'Buffets', 'Food courts', 'Bouillabaisse'
    ],
    safeAlternatives: [
      'Fish (if not allergic)', 'Poultry', 'Meat', 'Legumes',
      'King oyster mushrooms', 'Hearts of palm', 'Artichoke hearts'
    ],
    severity: 'severe'
  },
  sesame: {
    name: 'Sesame',
    hiddenNames: [
      'tahini', 'halva', 'hummus', 'benne seeds', 'gingelly oil',
      'sesame oil', 'sesame flour', 'sesame paste', 'sesamol',
      'sesamum indicum', 'til', 'sim sim', 'gomasio'
    ],
    crossContamination: [
      'Bakeries (bread, buns)', 'Middle Eastern restaurants', 'Asian cuisine',
      'Sushi', 'Salads', 'Bagel shops', 'Mediterranean food'
    ],
    safeAlternatives: [
      'Sunflower seed butter', 'Pumpkin seed butter', 'Hemp seeds',
      'Chia seeds', 'Flax seeds', 'Poppy seeds', 'Other nut/seed oils'
    ],
    severity: 'moderate'
  }
};

interface AllergyScannerToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  {
    key: 'allergen',
    header: 'Allergen Name',
  },
  {
    key: 'severity',
    header: 'Severity',
  },
  {
    key: 'hiddenNames',
    header: 'Hidden Names',
    format: (value: string[]) => value ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') : '',
  },
  {
    key: 'crossContamination',
    header: 'Cross-Contamination Risks',
    format: (value: string[]) => value ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') : '',
  },
];

export const AllergyScannerTool: React.FC<AllergyScannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'checker' | 'info'>('profile');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prepare data for export
  const exportData = useMemo(() => {
    return selectedAllergens.map(allergenKey => ({
      allergen: allergenDatabase[allergenKey].name,
      severity: allergenDatabase[allergenKey].severity,
      hiddenNames: allergenDatabase[allergenKey].hiddenNames,
      crossContamination: allergenDatabase[allergenKey].crossContamination,
    }));
  }, [selectedAllergens]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Allergens can be prefilled from text content
      if (params.texts && params.texts.length > 0) {
        const validAllergens: AllergenType[] = ['milk', 'eggs', 'peanuts', 'treeNuts', 'wheat', 'soy', 'fish', 'shellfish', 'sesame'];
        const prefillAllergens: AllergenType[] = [];
        params.texts.forEach(text => {
          const lowerText = text.toLowerCase();
          validAllergens.forEach(allergen => {
            if (lowerText.includes(allergen.toLowerCase())) {
              prefillAllergens.push(allergen);
            }
          });
        });
        if (prefillAllergens.length > 0) {
          setSelectedAllergens(prefillAllergens);
          setIsPrefilled(true);
        }
      }
      // Ingredient input can be prefilled from notes
      if (params.notes) {
        setIngredientInput(params.notes);
        setActiveTab('checker');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const toggleAllergen = (allergen: AllergenType) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const scanResults = useMemo(() => {
    if (!ingredientInput.trim() || selectedAllergens.length === 0) {
      return { detected: [], warnings: [], safe: true };
    }

    const input = ingredientInput.toLowerCase();
    const detected: { allergen: AllergenType; matchedTerms: string[] }[] = [];
    const warnings: string[] = [];

    selectedAllergens.forEach(allergenKey => {
      const allergen = allergenDatabase[allergenKey];
      const matchedTerms: string[] = [];

      // Check allergen name
      if (input.includes(allergen.name.toLowerCase().split(' ')[0])) {
        matchedTerms.push(allergen.name);
      }

      // Check hidden names
      allergen.hiddenNames.forEach(hiddenName => {
        if (input.includes(hiddenName.toLowerCase())) {
          matchedTerms.push(hiddenName);
        }
      });

      if (matchedTerms.length > 0) {
        detected.push({ allergen: allergenKey, matchedTerms });
      }

      // Check cross-contamination warnings
      allergen.crossContamination.forEach(risk => {
        if (input.includes(risk.toLowerCase().split(' ')[0])) {
          warnings.push(`${allergen.name}: Possible cross-contamination from ${risk}`);
        }
      });
    });

    return {
      detected,
      warnings,
      safe: detected.length === 0
    };
  }, [ingredientInput, selectedAllergens]);

  const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe': return 'text-red-500';
      case 'moderate': return 'text-orange-500';
      case 'mild': return 'text-yellow-500';
    }
  };

  const getSeverityBg = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe': return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
      case 'moderate': return isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200';
      case 'mild': return isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'allergen-profile' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'allergen-profile' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'allergen-profile' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'allergen-profile',
      title: 'Allergy Profile',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, { title: 'Allergy Profile' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(exportData, COLUMNS, 'tab');
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.allergyScanner.allergyScanner', 'Allergy Scanner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.allergyScanner.identifyAllergensInIngredients', 'Identify allergens in ingredients')}</p>
            </div>
          </div>
          {selectedAllergens.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-red-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            {t('tools.allergyScanner.myAllergies', 'My Allergies')}
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'checker'
                ? 'bg-red-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            {t('tools.allergyScanner.checkIngredients', 'Check Ingredients')}
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-red-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            {t('tools.allergyScanner.allergenInfo', 'Allergen Info')}
          </button>
        </div>

        {/* Profile Tab - Allergen Selection */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.allergyScanner.selectYourAllergens', 'Select Your Allergens')}
              </h4>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.allergyScanner.chooseAllAllergensYouNeed', 'Choose all allergens you need to avoid. We\'ll scan ingredients for these.')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(allergenDatabase) as AllergenType[]).map(allergenKey => {
                const allergen = allergenDatabase[allergenKey];
                const isSelected = selectedAllergens.includes(allergenKey);
                return (
                  <button
                    key={allergenKey}
                    onClick={() => toggleAllergen(allergenKey)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-red-500 border-red-500 text-white'
                        : isDark
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{allergen.name}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs ${isSelected ? 'text-red-100' : getSeverityColor(allergen.severity)}`}>
                      {allergen.severity} severity
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedAllergens.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.allergyScanner.yourAllergenProfile', 'Your Allergen Profile')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAllergens.map(allergenKey => (
                    <span
                      key={allergenKey}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {allergenDatabase[allergenKey].name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:opacity-70"
                        onClick={() => toggleAllergen(allergenKey)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checker Tab - Ingredient Scanner */}
        {activeTab === 'checker' && (
          <div className="space-y-4">
            {selectedAllergens.length === 0 ? (
              <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Shield className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.allergyScanner.setUpYourProfileFirst', 'Set Up Your Profile First')}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.allergyScanner.goToMyAllergiesTab', 'Go to "My Allergies" tab to select your allergens')}
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  {t('tools.allergyScanner.setUpProfile', 'Set Up Profile')}
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.allergyScanner.pasteIngredientsList', 'Paste Ingredients List')}
                  </label>
                  <textarea
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    placeholder={t('tools.allergyScanner.pasteTheIngredientListHere', 'Paste the ingredient list here (e.g., from food packaging)...')}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border resize-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {ingredientInput.trim() && (
                  <div className="space-y-4">
                    {/* Scan Results */}
                    {scanResults.safe ? (
                      <div className={`p-4 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-full">
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                              {t('tools.allergyScanner.noAllergensDetected', 'No Allergens Detected')}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-green-500/70' : 'text-green-600'}`}>
                              {t('tools.allergyScanner.basedOnYourSelectedAllergens', 'Based on your selected allergens, this appears safe.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-500/20 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                              {t('tools.allergyScanner.allergensDetected', 'Allergens Detected!')}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-red-500/70' : 'text-red-600'}`}>
                              Found {scanResults.detected.length} allergen(s) in ingredients
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {scanResults.detected.map(({ allergen, matchedTerms }) => (
                            <div key={allergen} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {allergenDatabase[allergen].name}
                              </p>
                              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Matched: {matchedTerms.join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cross-contamination Warnings */}
                    {scanResults.warnings.length > 0 && (
                      <div className={`p-4 rounded-lg border ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className={`font-medium ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                            {t('tools.allergyScanner.crossContaminationWarnings', 'Cross-Contamination Warnings')}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {scanResults.warnings.map((warning, idx) => (
                            <li key={idx} className={`text-sm ${isDark ? 'text-orange-300/70' : 'text-orange-600'}`}>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Info Tab - Allergen Details */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {selectedAllergens.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.allergyScanner.selectAllergensInMyAllergies', 'Select allergens in "My Allergies" tab to see detailed information.')}
              </p>
            ) : (
              selectedAllergens.map(allergenKey => {
                const allergen = allergenDatabase[allergenKey];
                return (
                  <div
                    key={allergenKey}
                    className={`rounded-lg border overflow-hidden ${getSeverityBg(allergen.severity)}`}
                  >
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {allergen.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(allergen.severity)} ${
                          isDark ? 'bg-gray-800' : 'bg-white'
                        }`}>
                          {allergen.severity}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Hidden Names */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Search className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.allergyScanner.hiddenNamesToWatchFor', 'Hidden Names to Watch For')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {allergen.hiddenNames.slice(0, 8).map((name, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-xs ${
                                isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                              }`}
                            >
                              {name}
                            </span>
                          ))}
                          {allergen.hiddenNames.length > 8 && (
                            <span className={`px-2 py-0.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              +{allergen.hiddenNames.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cross-Contamination */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.allergyScanner.crossContaminationRisks', 'Cross-Contamination Risks')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {allergen.crossContamination.slice(0, 5).map((risk, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-xs ${
                                isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Safe Alternatives */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.allergyScanner.safeAlternatives', 'Safe Alternatives')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {allergen.safeAlternatives.slice(0, 5).map((alt, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-xs ${
                                isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.allergyScanner.important', 'Important:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.allergyScanner.thisToolIsForInformational', 'This tool is for informational purposes only')}</li>
                <li>{t('tools.allergyScanner.alwaysReadLabelsCarefullyAnd', 'Always read labels carefully and consult with your doctor')}</li>
                <li>{t('tools.allergyScanner.whenInDoubtContactThe', 'When in doubt, contact the manufacturer directly')}</li>
                <li>{t('tools.allergyScanner.thisDoesNotReplaceProfessional', 'This does not replace professional medical advice')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergyScannerTool;
