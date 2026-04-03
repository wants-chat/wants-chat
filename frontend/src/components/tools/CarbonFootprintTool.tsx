import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Car, Home, Plane, ShoppingBag, Utensils, TrendingDown, Lightbulb, BarChart3, RefreshCw, Sparkles } from 'lucide-react';
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

// Types
interface TransportationData {
  carMilesPerWeek: number;
  carMPG: number;
  shortHaulFlights: number;
  longHaulFlights: number;
}

interface HomeEnergyData {
  electricityKWh: number;
  gasTherms: number;
  heatingType: 'electric' | 'gas' | 'oil' | 'renewable';
}

interface DietData {
  meatConsumption: 'high' | 'medium' | 'low' | 'none';
}

interface ShoppingData {
  spendingLevel: 'high' | 'medium' | 'low';
}

interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  savings: number;
  applied: boolean;
}

// Constants for calculations
const CO2_FACTORS = {
  gasoline: 0.00887, // tons CO2 per mile (assuming average car)
  shortHaulFlight: 0.255, // tons CO2 per short haul flight
  longHaulFlight: 1.5, // tons CO2 per long haul flight
  electricity: 0.000417, // tons CO2 per kWh (US average)
  naturalGas: 0.0053, // tons CO2 per therm
  heatingOil: 0.0073, // tons CO2 per gallon equivalent
  diet: {
    high: 3.3, // tons CO2 per year (heavy meat eater)
    medium: 2.5, // tons CO2 per year (moderate meat)
    low: 1.7, // tons CO2 per year (low meat)
    none: 1.5, // tons CO2 per year (vegetarian/vegan)
  },
  shopping: {
    high: 2.5, // tons CO2 per year
    medium: 1.5,
    low: 0.8,
  },
};

const US_AVERAGE = 16; // tons CO2 per year
const GLOBAL_AVERAGE = 4; // tons CO2 per year

// Column definitions for export functionality
const COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category' },
  { key: 'value', header: 'CO2 Emissions (tons/year)', type: 'number', format: (v) => (v as number).toFixed(1) },
  { key: 'percentage', header: 'Percentage (%)', type: 'number', format: (v) => (v as number).toFixed(0) },
];

const SCENARIO_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Scenario' },
  { key: 'description', header: 'Description' },
  { key: 'savings', header: 'Potential Savings (tons/year)', type: 'number', format: (v) => (v as number).toFixed(1) },
  { key: 'applied', header: 'Applied', type: 'boolean' },
];

interface CarbonFootprintToolProps {
  uiConfig?: UIConfig;
}

export const CarbonFootprintTool: React.FC<CarbonFootprintToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setTransportation(prev => ({ ...prev, carMilesPerWeek: Number(params.amount) }));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setTransportation(prev => ({ ...prev, carMilesPerWeek: Number(numMatch[0]) }));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // State for each category
  const [transportation, setTransportation] = useState<TransportationData>({
    carMilesPerWeek: 200,
    carMPG: 25,
    shortHaulFlights: 2,
    longHaulFlights: 1,
  });

  const [homeEnergy, setHomeEnergy] = useState<HomeEnergyData>({
    electricityKWh: 900,
    gasTherms: 50,
    heatingType: 'gas',
  });

  const [diet, setDiet] = useState<DietData>({
    meatConsumption: 'medium',
  });

  const [shopping, setShopping] = useState<ShoppingData>({
    spendingLevel: 'medium',
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'breakdown' | 'tips' | 'whatif'>('calculator');

  // What-if scenarios
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([
    { id: 'ev', name: 'Switch to Electric Vehicle', description: 'Replace gas car with EV', savings: 0, applied: false },
    { id: 'solar', name: 'Install Solar Panels', description: 'Generate clean electricity', savings: 0, applied: false },
    { id: 'reduceMeat', name: 'Reduce Meat by 50%', description: 'Eat less meat, more plants', savings: 0, applied: false },
    { id: 'noFlights', name: 'No Flights This Year', description: 'Choose alternative travel', savings: 0, applied: false },
    { id: 'efficient', name: 'Energy Efficient Home', description: 'LED, insulation, smart thermostat', savings: 0, applied: false },
  ]);

  // Calculate emissions for each category
  const emissions = useMemo(() => {
    // Transportation
    const carEmissions = (transportation.carMilesPerWeek * 52) / transportation.carMPG * CO2_FACTORS.gasoline * transportation.carMPG;
    const actualCarEmissions = (transportation.carMilesPerWeek * 52 * 0.00887); // simplified
    const flightEmissions =
      transportation.shortHaulFlights * CO2_FACTORS.shortHaulFlight +
      transportation.longHaulFlights * CO2_FACTORS.longHaulFlight;
    const transportTotal = actualCarEmissions + flightEmissions;

    // Home Energy
    const electricityEmissions = homeEnergy.electricityKWh * 12 * CO2_FACTORS.electricity;
    let heatingEmissions = homeEnergy.gasTherms * 12 * CO2_FACTORS.naturalGas;
    if (homeEnergy.heatingType === 'oil') {
      heatingEmissions *= 1.4;
    } else if (homeEnergy.heatingType === 'renewable') {
      heatingEmissions *= 0.1;
    } else if (homeEnergy.heatingType === 'electric') {
      heatingEmissions = homeEnergy.gasTherms * 12 * CO2_FACTORS.electricity * 29.3; // therms to kWh equivalent
    }
    const homeTotal = electricityEmissions + heatingEmissions;

    // Diet
    const dietTotal = CO2_FACTORS.diet[diet.meatConsumption];

    // Shopping
    const shoppingTotal = CO2_FACTORS.shopping[shopping.spendingLevel];

    const total = transportTotal + homeTotal + dietTotal + shoppingTotal;

    return {
      transportation: transportTotal,
      home: homeTotal,
      diet: dietTotal,
      shopping: shoppingTotal,
      total,
    };
  }, [transportation, homeEnergy, diet, shopping]);

  // Update scenario savings based on current emissions
  useMemo(() => {
    const updatedScenarios = scenarios.map(scenario => {
      let savings = 0;
      switch (scenario.id) {
        case 'ev':
          savings = emissions.transportation * 0.6; // EVs reduce car emissions by ~60%
          break;
        case 'solar':
          savings = emissions.home * 0.5; // Solar can offset ~50% of home energy
          break;
        case 'reduceMeat':
          savings = (CO2_FACTORS.diet[diet.meatConsumption] - CO2_FACTORS.diet.low) * 0.5;
          break;
        case 'noFlights':
          savings = transportation.shortHaulFlights * CO2_FACTORS.shortHaulFlight +
                   transportation.longHaulFlights * CO2_FACTORS.longHaulFlight;
          break;
        case 'efficient':
          savings = emissions.home * 0.25; // Efficiency improvements save ~25%
          break;
      }
      return { ...scenario, savings: Math.max(0, savings) };
    });
    if (JSON.stringify(updatedScenarios) !== JSON.stringify(scenarios)) {
      setScenarios(updatedScenarios);
    }
  }, [emissions, diet.meatConsumption, transportation.shortHaulFlights, transportation.longHaulFlights]);

  const appliedSavings = scenarios
    .filter(s => s.applied)
    .reduce((sum, s) => sum + s.savings, 0);

  const adjustedTotal = Math.max(0, emissions.total - appliedSavings);

  // Get comparison status
  const getComparisonStatus = (total: number) => {
    if (total <= GLOBAL_AVERAGE) return { label: 'Excellent', color: 'text-green-500' };
    if (total <= GLOBAL_AVERAGE * 2) return { label: 'Good', color: 'text-emerald-500' };
    if (total <= US_AVERAGE) return { label: 'Average', color: 'text-yellow-500' };
    return { label: 'High', color: 'text-red-500' };
  };

  const status = getComparisonStatus(adjustedTotal);

  // Calculate percentages for visual breakdown
  const getPercentage = (value: number) => {
    if (emissions.total === 0) return 0;
    return Math.round((value / emissions.total) * 100);
  };

  // Prepare data for export
  const getEmissionsData = () => [
    { category: 'Transportation', value: emissions.transportation, percentage: getPercentage(emissions.transportation) },
    { category: 'Home Energy', value: emissions.home, percentage: getPercentage(emissions.home) },
    { category: 'Diet', value: emissions.diet, percentage: getPercentage(emissions.diet) },
    { category: 'Shopping', value: emissions.shopping, percentage: getPercentage(emissions.shopping) },
    { category: 'Total', value: adjustedTotal, percentage: 100 },
  ];

  const getScenariosData = () => scenarios.map(s => ({
    name: s.name,
    description: s.description,
    savings: s.savings,
    applied: s.applied,
  }));

  // Export handlers
  const handleExportCSV = () => {
    const data = getEmissionsData();
    const result = exportToCSV(data, COLUMNS, { filename: 'carbon-footprint' });
    if (!result.success) console.error('CSV export failed:', result.error);
  };

  const handleExportExcel = () => {
    const data = getEmissionsData();
    const result = exportToExcel(data, COLUMNS, { filename: 'carbon-footprint' });
    if (!result.success) console.error('Excel export failed:', result.error);
  };

  const handleExportJSON = () => {
    const data = {
      emissions: getEmissionsData(),
      scenarios: getScenariosData(),
      inputs: {
        transportation,
        homeEnergy,
        diet,
        shopping,
      },
      summary: {
        totalEmissions: emissions.total,
        adjustedTotal,
        appliedSavings,
        status,
      },
    };
    const result = exportToJSON([data], { filename: 'carbon-footprint', pretty: true });
    if (!result.success) console.error('JSON export failed:', result.error);
  };

  const handleExportPDF = async () => {
    const data = getEmissionsData();
    const result = await exportToPDF(data, COLUMNS, {
      filename: 'carbon-footprint',
      title: 'Carbon Footprint Calculator Report',
      subtitle: `Total Annual Emissions: ${adjustedTotal.toFixed(1)} tons CO2/year`,
      orientation: 'portrait',
    });
    if (!result.success) console.error('PDF export failed:', result.error);
  };

  const handlePrint = () => {
    const data = getEmissionsData();
    printData(data, COLUMNS, { title: 'Carbon Footprint Report' });
  };

  const handleCopyToClipboard = async () => {
    const data = getEmissionsData();
    return await copyUtil(data, COLUMNS, 'tab');
  };

  const tips = [
    { category: 'Transportation', icon: Car, tips: [
      'Consider carpooling or public transit',
      'Switch to an electric or hybrid vehicle',
      'Combine errands to reduce trips',
      'Work from home when possible',
      'Choose video calls over business flights',
    ]},
    { category: 'Home Energy', icon: Home, tips: [
      'Switch to LED lighting',
      'Install a smart thermostat',
      'Improve home insulation',
      'Consider solar panels',
      'Use energy-efficient appliances',
    ]},
    { category: 'Diet', icon: Utensils, tips: [
      'Try meatless Mondays',
      'Choose local and seasonal produce',
      'Reduce food waste',
      'Grow your own vegetables',
      'Choose plant-based proteins more often',
    ]},
    { category: 'Shopping', icon: ShoppingBag, tips: [
      'Buy second-hand when possible',
      'Choose quality over quantity',
      'Support sustainable brands',
      'Repair instead of replace',
      'Avoid single-use plastics',
    ]},
  ];

  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    onChange: (value: number) => void
  ) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        style={{
          background: isDark
            ? `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
            : `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
        }}
      />
    </div>
  );

  const renderSelect = (
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (value: string) => void
  ) => (
    <div className="mb-4">
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderCategoryCard = (
    title: string,
    Icon: React.ElementType,
    value: number,
    percentage: number,
    color: string
  ) => (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value.toFixed(1)}
          </span>
          <span className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            tons CO2/year
          </span>
        </div>
        <span className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {percentage}%
        </span>
      </div>
      <div className={`mt-3 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <Leaf className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.carbonFootprint.carbonFootprintCalculator', 'Carbon Footprint Calculator')}
            </h1>
          </div>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.carbonFootprint.understandAndReduceYourEnvironmental', 'Understand and reduce your environmental impact')}
          </p>

          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {isPrefilled && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">{t('tools.carbonFootprint.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
              </div>
            )}
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
          </div>
        </div>

        {/* Total Display */}
        <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className={`text-sm uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.carbonFootprint.yourAnnualCarbonFootprint', 'Your Annual Carbon Footprint')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl md:text-6xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {adjustedTotal.toFixed(1)}
                </span>
                <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.carbonFootprint.tonsCo2Year', 'tons CO2/year')}
                </span>
              </div>
              <p className={`mt-2 font-medium ${status.color}`}>
                {status.label} - {adjustedTotal <= US_AVERAGE ? t('tools.carbonFootprint.below', 'Below') : t('tools.carbonFootprint.above', 'Above')} US Average
              </p>
            </div>

            {/* Comparison Bars */}
            <div className="w-full md:w-96">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.carbonFootprint.you', 'You')}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{adjustedTotal.toFixed(1)}t</span>
                  </div>
                  <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{ width: `${Math.min(100, (adjustedTotal / 20) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.carbonFootprint.usAverage', 'US Average')}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{US_AVERAGE}t</span>
                  </div>
                  <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                      style={{ width: `${(US_AVERAGE / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.carbonFootprint.globalAverage', 'Global Average')}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{GLOBAL_AVERAGE}t</span>
                  </div>
                  <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                      style={{ width: `${(GLOBAL_AVERAGE / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'calculator', label: 'Calculator', icon: BarChart3 },
            { id: 'breakdown', label: 'Breakdown', icon: Leaf },
            { id: 'tips', label: 'Tips', icon: Lightbulb },
            { id: 'whatif', label: 'What If?', icon: RefreshCw },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transportation */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carbonFootprint.transportation', 'Transportation')}
                </h2>
              </div>
              {renderSlider('Car Miles per Week', transportation.carMilesPerWeek, 0, 500, 10, 'miles',
                (v) => setTransportation(prev => ({ ...prev, carMilesPerWeek: v }))
              )}
              {renderSlider('Car Fuel Efficiency (MPG)', transportation.carMPG, 10, 60, 1, 'MPG',
                (v) => setTransportation(prev => ({ ...prev, carMPG: v }))
              )}
              {renderSlider('Short Haul Flights/Year', transportation.shortHaulFlights, 0, 20, 1, 'flights',
                (v) => setTransportation(prev => ({ ...prev, shortHaulFlights: v }))
              )}
              {renderSlider('Long Haul Flights/Year', transportation.longHaulFlights, 0, 10, 1, 'flights',
                (v) => setTransportation(prev => ({ ...prev, longHaulFlights: v }))
              )}
            </div>

            {/* Home Energy */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carbonFootprint.homeEnergy', 'Home Energy')}
                </h2>
              </div>
              {renderSlider('Electricity (kWh/month)', homeEnergy.electricityKWh, 0, 2000, 50, 'kWh',
                (v) => setHomeEnergy(prev => ({ ...prev, electricityKWh: v }))
              )}
              {renderSlider('Natural Gas (therms/month)', homeEnergy.gasTherms, 0, 200, 5, 'therms',
                (v) => setHomeEnergy(prev => ({ ...prev, gasTherms: v }))
              )}
              {renderSelect('Heating Type', homeEnergy.heatingType, [
                { value: 'gas', label: 'Natural Gas' },
                { value: 'electric', label: 'Electric' },
                { value: 'oil', label: 'Heating Oil' },
                { value: 'renewable', label: 'Renewable/Heat Pump' },
              ], (v) => setHomeEnergy(prev => ({ ...prev, heatingType: v as HomeEnergyData['heatingType'] })))}
            </div>

            {/* Diet */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carbonFootprint.diet', 'Diet')}
                </h2>
              </div>
              {renderSelect('Meat Consumption', diet.meatConsumption, [
                { value: 'high', label: 'High - Daily meat eater' },
                { value: 'medium', label: 'Medium - Meat a few times/week' },
                { value: 'low', label: 'Low - Occasional meat' },
                { value: 'none', label: 'None - Vegetarian/Vegan' },
              ], (v) => setDiet({ meatConsumption: v as DietData['meatConsumption'] }))}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Food production accounts for about 26% of global greenhouse gas emissions.
                  Reducing meat consumption, especially beef, can significantly lower your footprint.
                </p>
              </div>
            </div>

            {/* Shopping */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.carbonFootprint.shoppingConsumption', 'Shopping & Consumption')}
                </h2>
              </div>
              {renderSelect('Spending Level', shopping.spendingLevel, [
                { value: 'high', label: 'High - Frequent new purchases' },
                { value: 'medium', label: 'Medium - Average consumer' },
                { value: 'low', label: 'Low - Minimal, sustainable choices' },
              ], (v) => setShopping({ spendingLevel: v as ShoppingData['spendingLevel'] }))}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Everything we buy has a carbon footprint from manufacturing and shipping.
                  Buying less, choosing quality, and buying second-hand helps reduce emissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {renderCategoryCard('Transportation', Car, emissions.transportation, getPercentage(emissions.transportation), 'bg-blue-500')}
              {renderCategoryCard('Home Energy', Home, emissions.home, getPercentage(emissions.home), 'bg-amber-500')}
              {renderCategoryCard('Diet', Utensils, emissions.diet, getPercentage(emissions.diet), 'bg-green-500')}
              {renderCategoryCard('Shopping', ShoppingBag, emissions.shopping, getPercentage(emissions.shopping), 'bg-purple-500')}
            </div>

            {/* Visual Breakdown */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.carbonFootprint.emissionsBreakdown', 'Emissions Breakdown')}
              </h3>
              <div className="flex h-8 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${getPercentage(emissions.transportation)}%` }}
                  title={`Transportation: ${getPercentage(emissions.transportation)}%`}
                />
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${getPercentage(emissions.home)}%` }}
                  title={`Home: ${getPercentage(emissions.home)}%`}
                />
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${getPercentage(emissions.diet)}%` }}
                  title={`Diet: ${getPercentage(emissions.diet)}%`}
                />
                <div
                  className="bg-purple-500 transition-all duration-500"
                  style={{ width: `${getPercentage(emissions.shopping)}%` }}
                  title={`Shopping: ${getPercentage(emissions.shopping)}%`}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Transportation', color: 'bg-blue-500', value: emissions.transportation },
                  { label: 'Home Energy', color: 'bg-amber-500', value: emissions.home },
                  { label: 'Diet', color: 'bg-green-500', value: emissions.diet },
                  { label: 'Shopping', color: 'bg-purple-500', value: emissions.shopping },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.label}: {item.value.toFixed(1)}t ({getPercentage(item.value)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((category) => (
              <div
                key={category.category}
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    category.category === 'Transportation' ? 'bg-blue-500' :
                    category.category === 'Home Energy' ? 'bg-amber-500' :
                    category.category === 'Diet' ? 'bg-green-500' : 'bg-purple-500'
                  }`}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {category.category}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {category.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <TrendingDown className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* What If Tab */}
        {activeTab === 'whatif' && (
          <div>
            <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.carbonFootprint.whatIfScenarios', 'What If Scenarios')}
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.carbonFootprint.seeHowDifferentLifestyleChanges', 'See how different lifestyle changes could reduce your carbon footprint')}
              </p>

              {appliedSavings > 0 && (
                <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                  <p className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    With selected changes, you could save{' '}
                    <span className="text-xl font-bold">{appliedSavings.toFixed(1)} tons</span> CO2/year!
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
                    That's a {((appliedSavings / emissions.total) * 100).toFixed(0)}% reduction
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      scenario.applied
                        ? isDark
                          ? 'border-emerald-500 bg-emerald-900/20'
                          : 'border-emerald-500 bg-emerald-50'
                        : isDark
                          ? 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setScenarios(prev => prev.map(s =>
                        s.id === scenario.id ? { ...s, applied: !s.applied } : s
                      ));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          scenario.applied
                            ? 'border-emerald-500 bg-emerald-500'
                            : isDark ? 'border-gray-500' : 'border-gray-300'
                        }`}>
                          {scenario.applied && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {scenario.name}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {scenario.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          -{scenario.savings.toFixed(1)}t
                        </span>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('tools.carbonFootprint.co2Year', 'CO2/year')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Visualization */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.carbonFootprint.yourImpactPotential', 'Your Impact Potential')}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.carbonFootprint.current', 'Current')}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.carbonFootprint.withChanges', 'With Changes')}</span>
                  </div>
                  <div className={`relative h-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (emissions.total / 20) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (adjustedTotal / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {emissions.total.toFixed(1)}t
                    </span>
                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {adjustedTotal.toFixed(1)}t
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className={`mt-8 p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            These calculations are estimates based on average emissions factors.
            Your actual footprint may vary based on your location, specific habits, and energy sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintTool;
