import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Fuel, CheckCircle2, AlertTriangle, Info, Power, Lightbulb } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Appliance {
  id: string;
  name: string;
  category: 'essential' | 'optional';
  runningWatts: number;
  startingWatts: number;
  description: string;
}

interface GeneratorSize {
  watts: number;
  name: string;
  fuelType: string;
  tankSize: number; // gallons
  runtime: number; // hours at 50% load
  priceRange: string;
  suitableFor: string;
}

interface GeneratorSizerToolProps {
  uiConfig?: UIConfig;
}

export const GeneratorSizerTool: React.FC<GeneratorSizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedAppliances, setSelectedAppliances] = useState<Set<string>>(new Set());
  const [showEssentialOnly, setShowEssentialOnly] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      // Generator sizer works with appliance selection, so minimal prefill
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const appliances: Appliance[] = [
    // Essential appliances
    { id: 'refrigerator', name: 'Refrigerator', category: 'essential', runningWatts: 200, startingWatts: 1200, description: 'Full-size fridge/freezer' },
    { id: 'freezer', name: 'Freezer (standalone)', category: 'essential', runningWatts: 100, startingWatts: 500, description: 'Chest or upright freezer' },
    { id: 'sump-pump', name: 'Sump Pump (1/3 HP)', category: 'essential', runningWatts: 800, startingWatts: 1300, description: 'Basement water pump' },
    { id: 'well-pump', name: 'Well Pump (1/2 HP)', category: 'essential', runningWatts: 1000, startingWatts: 2100, description: 'Residential well pump' },
    { id: 'furnace-fan', name: 'Furnace Fan', category: 'essential', runningWatts: 500, startingWatts: 750, description: 'Gas furnace blower' },
    { id: 'lights-led', name: 'LED Lights (10 bulbs)', category: 'essential', runningWatts: 100, startingWatts: 100, description: '10W each' },
    { id: 'phone-charger', name: 'Phone/Tablet Chargers', category: 'essential', runningWatts: 50, startingWatts: 50, description: 'Multiple devices' },
    { id: 'modem-router', name: 'Modem & Router', category: 'essential', runningWatts: 30, startingWatts: 30, description: 'Internet equipment' },
    { id: 'medical-equip', name: 'Medical Equipment', category: 'essential', runningWatts: 300, startingWatts: 300, description: 'CPAP, oxygen concentrator' },

    // Optional appliances
    { id: 'window-ac', name: 'Window AC (10,000 BTU)', category: 'optional', runningWatts: 1200, startingWatts: 3600, description: 'Room air conditioner' },
    { id: 'central-ac', name: 'Central AC (3 ton)', category: 'optional', runningWatts: 3500, startingWatts: 4500, description: 'Whole house cooling' },
    { id: 'space-heater', name: 'Space Heater', category: 'optional', runningWatts: 1500, startingWatts: 1500, description: 'Electric portable heater' },
    { id: 'microwave', name: 'Microwave', category: 'optional', runningWatts: 1000, startingWatts: 1000, description: 'Standard microwave' },
    { id: 'coffee-maker', name: 'Coffee Maker', category: 'optional', runningWatts: 1000, startingWatts: 1000, description: 'Drip coffee maker' },
    { id: 'toaster', name: 'Toaster', category: 'optional', runningWatts: 850, startingWatts: 850, description: '2-slice toaster' },
    { id: 'tv', name: 'Television (LED)', category: 'optional', runningWatts: 100, startingWatts: 100, description: '50-inch LED TV' },
    { id: 'computer', name: 'Desktop Computer', category: 'optional', runningWatts: 300, startingWatts: 300, description: 'PC with monitor' },
    { id: 'laptop', name: 'Laptop', category: 'optional', runningWatts: 75, startingWatts: 75, description: 'Standard laptop' },
    { id: 'washing-machine', name: 'Washing Machine', category: 'optional', runningWatts: 500, startingWatts: 1200, description: 'Top or front loader' },
    { id: 'dryer-electric', name: 'Electric Dryer', category: 'optional', runningWatts: 3000, startingWatts: 6000, description: 'Full-size electric dryer' },
    { id: 'dishwasher', name: 'Dishwasher', category: 'optional', runningWatts: 1500, startingWatts: 1800, description: 'Standard dishwasher' },
    { id: 'garage-door', name: 'Garage Door Opener', category: 'optional', runningWatts: 550, startingWatts: 1100, description: '1/2 HP opener' },
    { id: 'electric-stove', name: 'Electric Stove (1 burner)', category: 'optional', runningWatts: 1500, startingWatts: 1500, description: 'Single burner' },
    { id: 'hair-dryer', name: 'Hair Dryer', category: 'optional', runningWatts: 1500, startingWatts: 1500, description: 'High setting' },
  ];

  const generatorSizes: GeneratorSize[] = [
    { watts: 2000, name: 'Portable Inverter (2kW)', fuelType: 'Gasoline', tankSize: 1, runtime: 8, priceRange: '$400-$800', suitableFor: 'Essential devices, camping, small appliances' },
    { watts: 3500, name: 'Portable (3.5kW)', fuelType: 'Gasoline', tankSize: 4, runtime: 12, priceRange: '$500-$1,000', suitableFor: 'Essential home backup, RV' },
    { watts: 5000, name: 'Portable (5kW)', fuelType: 'Gasoline', tankSize: 6.6, runtime: 10, priceRange: '$700-$1,500', suitableFor: 'Partial home backup, job sites' },
    { watts: 7500, name: 'Portable (7.5kW)', fuelType: 'Gasoline', tankSize: 8, runtime: 11, priceRange: '$900-$2,000', suitableFor: 'Most home appliances' },
    { watts: 10000, name: 'Portable (10kW)', fuelType: 'Gasoline', tankSize: 8.5, runtime: 9, priceRange: '$1,200-$2,500', suitableFor: 'Full home backup (most homes)' },
    { watts: 12000, name: 'Standby (12kW)', fuelType: 'Natural Gas/Propane', tankSize: 0, runtime: 0, priceRange: '$3,000-$5,000', suitableFor: 'Automatic whole-home backup' },
    { watts: 22000, name: 'Standby (22kW)', fuelType: 'Natural Gas/Propane', tankSize: 0, runtime: 0, priceRange: '$5,000-$8,000', suitableFor: 'Large homes with central AC' },
  ];

  const toggleAppliance = (id: string) => {
    setSelectedAppliances((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllEssential = () => {
    const essentialIds = appliances.filter(a => a.category === 'essential').map(a => a.id);
    setSelectedAppliances(new Set(essentialIds));
  };

  const clearAll = () => {
    setSelectedAppliances(new Set());
  };

  const calculations = useMemo(() => {
    const selectedList = appliances.filter(a => selectedAppliances.has(a.id));

    const totalRunningWatts = selectedList.reduce((sum, a) => sum + a.runningWatts, 0);

    // Starting watts: largest starting wattage + all other running watts
    // This accounts for staggered startup
    const startingWatts = selectedList.map(a => a.startingWatts);
    const runningWatts = selectedList.map(a => a.runningWatts);

    let maxStartingWatts = 0;
    if (selectedList.length > 0) {
      // Find the appliance with the highest starting-to-running difference
      const startDiffs = selectedList.map(a => a.startingWatts - a.runningWatts);
      const maxDiffIndex = startDiffs.indexOf(Math.max(...startDiffs));
      maxStartingWatts = startingWatts[maxDiffIndex];
      const otherRunning = runningWatts.reduce((sum, w, i) => i === maxDiffIndex ? sum : sum + w, 0);
      maxStartingWatts += otherRunning;
    }

    const totalStartingWatts = Math.max(totalRunningWatts, maxStartingWatts);

    // Add 20% safety margin
    const recommendedWatts = Math.ceil(totalStartingWatts * 1.2);

    // Find appropriate generator
    const recommendedGenerator = generatorSizes.find(g => g.watts >= recommendedWatts) || generatorSizes[generatorSizes.length - 1];

    // Fuel consumption estimate (roughly 0.75 gal/hr per 3500W at 50% load)
    const fuelConsumptionPerHour = (recommendedGenerator.watts / 3500) * 0.75;

    // Essential vs optional breakdown
    const essentialWatts = selectedList
      .filter(a => a.category === 'essential')
      .reduce((sum, a) => sum + a.runningWatts, 0);
    const optionalWatts = selectedList
      .filter(a => a.category === 'optional')
      .reduce((sum, a) => sum + a.runningWatts, 0);

    return {
      totalRunningWatts,
      totalStartingWatts,
      recommendedWatts,
      recommendedGenerator,
      fuelConsumptionPerHour: fuelConsumptionPerHour.toFixed(2),
      essentialWatts,
      optionalWatts,
      selectedCount: selectedList.length,
    };
  }, [selectedAppliances, appliances, generatorSizes]);

  const displayedAppliances = showEssentialOnly
    ? appliances.filter(a => a.category === 'essential')
    : appliances;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.generatorSizer.generatorSizingCalculator', 'Generator Sizing Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.generatorSizer.calculateTheRightGeneratorSize', 'Calculate the right generator size for your needs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={selectAllEssential}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('tools.generatorSizer.selectEssential', 'Select Essential')}
          </button>
          <button
            onClick={clearAll}
            className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.generatorSizer.clearAll', 'Clear All')}
          </button>
          <button
            onClick={() => setShowEssentialOnly(!showEssentialOnly)}
            className={`px-4 py-2 rounded-lg text-sm ${showEssentialOnly ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {showEssentialOnly ? t('tools.generatorSizer.showAll', 'Show All') : t('tools.generatorSizer.essentialOnly', 'Essential Only')}
          </button>
        </div>

        {/* Appliance Checklist */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Select Your Appliances ({calculations.selectedCount} selected)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
            {displayedAppliances.map((appliance) => (
              <button
                key={appliance.id}
                onClick={() => toggleAppliance(appliance.id)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedAppliances.has(appliance.id)
                    ? appliance.category === 'essential'
                      ? 'bg-green-500/20 border-green-500'
                      : 'bg-yellow-500/20 border-yellow-500'
                    : isDark
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } border`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {appliance.name}
                      </span>
                      {appliance.category === 'essential' && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-500 rounded">
                          {t('tools.generatorSizer.essential', 'Essential')}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {appliance.description}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {appliance.runningWatts}W
                    </div>
                    {appliance.startingWatts > appliance.runningWatts && (
                      <div className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>
                        Start: {appliance.startingWatts}W
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wattage Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Power className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.generatorSizer.runningWatts', 'Running Watts')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.totalRunningWatts.toLocaleString()}W</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.generatorSizer.continuousPowerNeeded', 'Continuous power needed')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.generatorSizer.startingWatts', 'Starting Watts')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.totalStartingWatts.toLocaleString()}W</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.generatorSizer.peakPowerForStartup', 'Peak power for startup')}
            </div>
          </div>
        </div>

        {/* Load Breakdown */}
        {calculations.selectedCount > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.generatorSizer.loadBreakdown', 'Load Breakdown')}</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {t('tools.generatorSizer.essentialLoads', 'Essential Loads')}
                </span>
                <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {calculations.essentialWatts.toLocaleString()}W
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  {t('tools.generatorSizer.optionalLoads', 'Optional Loads')}
                </span>
                <span className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {calculations.optionalWatts.toLocaleString()}W
                </span>
              </div>
              <div className="pt-2 border-t border-dashed mt-2 flex justify-between items-center" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.generatorSizer.totalRunning', 'Total Running')}
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.totalRunningWatts.toLocaleString()}W
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Generator */}
        {calculations.selectedCount > 0 && (
          <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'}`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h4 className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                {t('tools.generatorSizer.recommendedGenerator', 'Recommended Generator')}
              </h4>
            </div>
            <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.recommendedGenerator.name}
            </div>
            <div className={`text-lg mb-3 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              Minimum {calculations.recommendedWatts.toLocaleString()}W needed (with 20% safety margin)
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">{t('tools.generatorSizer.fuelType', 'Fuel Type:')}</span> {calculations.recommendedGenerator.fuelType}
              </div>
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">{t('tools.generatorSizer.priceRange', 'Price Range:')}</span> {calculations.recommendedGenerator.priceRange}
              </div>
              {calculations.recommendedGenerator.tankSize > 0 && (
                <>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('tools.generatorSizer.tankSize', 'Tank Size:')}</span> {calculations.recommendedGenerator.tankSize} gal
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('tools.generatorSizer.runtime', 'Runtime:')}</span> ~{calculations.recommendedGenerator.runtime}h @ 50%
                  </div>
                </>
              )}
            </div>
            <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.generatorSizer.bestFor', 'Best for:')}</span> {calculations.recommendedGenerator.suitableFor}
            </div>
          </div>
        )}

        {/* Fuel Consumption Estimate */}
        {calculations.selectedCount > 0 && calculations.recommendedGenerator.tankSize > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-4 h-4 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.generatorSizer.fuelConsumptionEstimate', 'Fuel Consumption Estimate')}</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              At your load ({calculations.totalRunningWatts}W), expect approximately:
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                  {calculations.fuelConsumptionPerHour} gal/hr
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.generatorSizer.at50Load', 'At 50% load')}
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                  {(calculations.recommendedGenerator.tankSize / parseFloat(calculations.fuelConsumptionPerHour)).toFixed(1)} hrs
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.generatorSizer.perFullTank', 'Per full tank')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {calculations.selectedCount === 0 && (
          <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <Zap className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <div className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.generatorSizer.selectAppliancesAboveToCalculate', 'Select appliances above to calculate your generator needs')}
            </div>
            <button
              onClick={selectAllEssential}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
            >
              {t('tools.generatorSizer.startWithEssentialAppliances', 'Start with Essential Appliances')}
            </button>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.generatorSizer.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>* Starting watts are higher than running watts for motors (AC, pumps, refrigerators)</li>
                <li>* Stagger appliance startups to reduce peak demand</li>
                <li>* Add 20-25% buffer for safety and future needs</li>
                <li>* Consider a transfer switch for safe home connection</li>
                <li>* Store fuel properly and rotate stock every 3-6 months</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorSizerTool;
