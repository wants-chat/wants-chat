import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Scale, Info, Clock, Thermometer } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type PizzaSize = 'personal' | 'medium' | 'large';
type CrustStyle = 'thin' | 'regular' | 'thick' | 'neapolitan';
type FlourType = 'tipo00' | 'bread' | 'allPurpose';
type YeastType = 'instant' | 'active';

interface DoughResult {
  numberOfPizzas: number;
  pizzaSize: PizzaSize;
  crustStyle: CrustStyle;
  doughBallWeight: number;
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  oliveOil: number;
  hydrationPercent: number;
  flourType: FlourType;
  yeastType: YeastType;
  totalDoughWeight: number;
  riseTime: string;
  coldFermentDays: number;
  bakingTemp: string;
}

interface SizeConfig {
  weight: number;
  label: string;
}

interface CrustConfig {
  hydration: number;
  weightMultiplier: number;
  label: string;
}

const PIZZA_SIZES: Record<PizzaSize, SizeConfig> = {
  personal: { weight: 180, label: 'Personal (8-10")' },
  medium: { weight: 250, label: 'Medium (12")' },
  large: { weight: 320, label: 'Large (14-16")' },
};

const CRUST_STYLES: Record<CrustStyle, CrustConfig> = {
  thin: { hydration: 58, weightMultiplier: 0.85, label: 'Thin & Crispy' },
  regular: { hydration: 62, weightMultiplier: 1.0, label: 'Regular' },
  thick: { hydration: 65, weightMultiplier: 1.2, label: 'Thick & Fluffy' },
  neapolitan: { hydration: 65, weightMultiplier: 1.0, label: 'Neapolitan' },
};

const FLOUR_TYPES: Record<FlourType, string> = {
  tipo00: 'Tipo 00 (Italian)',
  bread: 'Bread Flour',
  allPurpose: 'All-Purpose',
};

const YEAST_TYPES: Record<YeastType, { label: string; multiplier: number }> = {
  instant: { label: 'Instant Yeast', multiplier: 1 },
  active: { label: 'Active Dry Yeast', multiplier: 1.25 },
};

interface PizzaDoughCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const PizzaDoughCalculatorTool: React.FC<PizzaDoughCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [numberOfPizzas, setNumberOfPizzas] = useState('4');
  const [pizzaSize, setPizzaSize] = useState<PizzaSize>('medium');
  const [crustStyle, setCrustStyle] = useState<CrustStyle>('regular');
  const [flourType, setFlourType] = useState<FlourType>('tipo00');
  const [yeastType, setYeastType] = useState<YeastType>('instant');
  const [roomTemp, setRoomTemp] = useState('72');
  const [coldFermentDays, setColdFermentDays] = useState('0');
  const [result, setResult] = useState<DoughResult | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.numberOfPizzas) setNumberOfPizzas(String(data.numberOfPizzas));
      if (data.pizzaSize) setPizzaSize(data.pizzaSize as PizzaSize);
      if (data.crustStyle) setCrustStyle(data.crustStyle as CrustStyle);
      if (data.flourType) setFlourType(data.flourType as FlourType);
      if (data.yeastType) setYeastType(data.yeastType as YeastType);
      if (data.roomTemp) setRoomTemp(String(data.roomTemp));
      if (data.coldFermentDays) setColdFermentDays(String(data.coldFermentDays));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const calculateDough = () => {
    const pizzas = parseInt(numberOfPizzas);
    const temp = parseInt(roomTemp);
    const fermentDays = parseInt(coldFermentDays);

    if (isNaN(pizzas) || pizzas < 1) {
      setValidationMessage('Please enter at least 1 pizza');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (isNaN(temp) || temp < 50 || temp > 100) {
      setValidationMessage('Please enter a valid room temperature (50-100°F)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate base dough ball weight
    const baseWeight = PIZZA_SIZES[pizzaSize].weight;
    const crustMultiplier = CRUST_STYLES[crustStyle].weightMultiplier;
    const doughBallWeight = Math.round(baseWeight * crustMultiplier);

    // Total dough needed
    const totalDoughWeight = doughBallWeight * pizzas;

    // Hydration percentage based on crust style
    const hydrationPercent = CRUST_STYLES[crustStyle].hydration;

    // Baker's percentages calculation
    // Total weight = flour + water + salt + yeast + oil
    // Using baker's percentages: flour = 100%, water = hydration%, salt = 2.5%, yeast = 0.3-0.5%, oil = 3%
    const saltPercent = 2.5;
    const yeastPercent = fermentDays > 0 ? 0.15 : 0.4; // Less yeast for cold ferment
    const oilPercent = crustStyle === 'neapolitan' ? 0 : 3; // No oil in traditional Neapolitan

    // Calculate flour amount
    // totalWeight = flour * (1 + hydration/100 + salt/100 + yeast/100 + oil/100)
    const totalPercent = 100 + hydrationPercent + saltPercent + yeastPercent + oilPercent;
    const flour = Math.round((totalDoughWeight / totalPercent) * 100);
    const water = Math.round(flour * (hydrationPercent / 100));
    const salt = Math.round(flour * (saltPercent / 100) * 10) / 10;
    const baseYeast = flour * (yeastPercent / 100);
    const yeast = Math.round(baseYeast * YEAST_TYPES[yeastType].multiplier * 10) / 10;
    const oliveOil = crustStyle === 'neapolitan' ? 0 : Math.round(flour * (oilPercent / 100));

    // Calculate rise time based on temperature
    let riseTime: string;
    if (fermentDays > 0) {
      riseTime = `${fermentDays} day${fermentDays > 1 ? 's' : ''} cold ferment + 2-3 hours at room temp`;
    } else if (temp < 65) {
      riseTime = '3-4 hours';
    } else if (temp < 75) {
      riseTime = '2-3 hours';
    } else if (temp < 85) {
      riseTime = '1.5-2 hours';
    } else {
      riseTime = '1-1.5 hours';
    }

    // Baking temperature guide
    let bakingTemp: string;
    switch (crustStyle) {
      case 'neapolitan':
        bakingTemp = '800-900°F (425-480°C) - 60-90 seconds';
        break;
      case 'thin':
        bakingTemp = '500-550°F (260-290°C) - 8-10 minutes';
        break;
      case 'thick':
        bakingTemp = '425-450°F (220-230°C) - 15-20 minutes';
        break;
      default:
        bakingTemp = '475-500°F (245-260°C) - 10-12 minutes';
    }

    setResult({
      numberOfPizzas: pizzas,
      pizzaSize,
      crustStyle,
      doughBallWeight,
      flour,
      water,
      salt,
      yeast,
      oliveOil,
      hydrationPercent,
      flourType,
      yeastType,
      totalDoughWeight,
      riseTime,
      coldFermentDays: fermentDays,
      bakingTemp,
    });
  };

  const reset = () => {
    setNumberOfPizzas('4');
    setPizzaSize('medium');
    setCrustStyle('regular');
    setFlourType('tipo00');
    setYeastType('instant');
    setRoomTemp('72');
    setColdFermentDays('0');
    setResult(null);
    setShowTips(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pizzaDoughCalculator.pizzaDoughCalculator', 'Pizza Dough Calculator')}
            </h1>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Number of Pizzas */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.numberOfPizzas', 'Number of Pizzas')}
                </label>
                <input
                  type="number"
                  value={numberOfPizzas}
                  onChange={(e) => setNumberOfPizzas(e.target.value)}
                  min="1"
                  max="20"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Pizza Size */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.pizzaSize', 'Pizza Size')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(PIZZA_SIZES) as [PizzaSize, SizeConfig][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setPizzaSize(key)}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        pizzaSize === key
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {config.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crust Style */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.crustStyle', 'Crust Style')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(CRUST_STYLES) as [CrustStyle, CrustConfig][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCrustStyle(key)}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        crustStyle === key
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Flour Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.flourType', 'Flour Type')}
                </label>
                <select
                  value={flourType}
                  onChange={(e) => setFlourType(e.target.value as FlourType)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {(Object.entries(FLOUR_TYPES) as [FlourType, string][]).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Yeast Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.yeastType', 'Yeast Type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(YEAST_TYPES) as [YeastType, { label: string; multiplier: number }][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setYeastType(key)}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        yeastType === key
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Temperature */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.roomTemperatureF', 'Room Temperature (°F)')}
                </label>
                <div className="relative">
                  <Thermometer className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={roomTemp}
                    onChange={(e) => setRoomTemp(e.target.value)}
                    min="50"
                    max="100"
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Cold Ferment Option */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.pizzaDoughCalculator.coldFermentDaysInFridge', 'Cold Ferment (Days in Fridge)')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((days) => (
                    <button
                      key={days}
                      onClick={() => setColdFermentDays(days.toString())}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                        coldFermentDays === days.toString()
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {days === 0 ? 'None' : `${days} Day${days > 1 ? 's' : ''}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateDough}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.pizzaDoughCalculator.calculateRecipe', 'Calculate Recipe')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.pizzaDoughCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Main Recipe Card */}
              <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Recipe for {result.numberOfPizzas} {PIZZA_SIZES[result.pizzaSize].label} Pizza{result.numberOfPizzas > 1 ? 's' : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Flour */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-amber-50'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-amber-700'}`}>
                        {FLOUR_TYPES[result.flourType]}
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>
                        {result.flour}g
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-600'}`}>
                        ({(result.flour / 28.35).toFixed(1)} oz)
                      </div>
                    </div>

                    {/* Water */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-50'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                        Water ({result.hydrationPercent}%)
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                        {result.water}g
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`}>
                        ({(result.water / 29.57).toFixed(1)} fl oz)
                      </div>
                    </div>

                    {/* Salt */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.pizzaDoughCalculator.salt', 'Salt')}
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {result.salt}g
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({(result.salt / 6).toFixed(1)} tsp)
                      </div>
                    </div>

                    {/* Yeast */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-yellow-50'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-yellow-700'}`}>
                        {YEAST_TYPES[result.yeastType].label}
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-yellow-900'}`}>
                        {result.yeast}g
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-yellow-600'}`}>
                        ({(result.yeast / 3).toFixed(1)} tsp)
                      </div>
                    </div>

                    {/* Olive Oil */}
                    {result.oliveOil > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-green-50'}`}>
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-green-700'}`}>
                          {t('tools.pizzaDoughCalculator.oliveOil', 'Olive Oil')}
                        </div>
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>
                          {result.oliveOil}g
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-green-600'}`}>
                          ({(result.oliveOil / 14).toFixed(1)} tbsp)
                        </div>
                      </div>
                    )}

                    {/* Dough Ball Weight */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-purple-50'}`}>
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-purple-700'}`}>
                        {t('tools.pizzaDoughCalculator.perDoughBall', 'Per Dough Ball')}
                      </div>
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>
                        {result.doughBallWeight}g
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-purple-600'}`}>
                        ({(result.doughBallWeight / 28.35).toFixed(1)} oz)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing & Temperature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${theme === 'dark' ? 'bg-gray-700' : 'bg-teal-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-[#0D9488]" />
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.pizzaDoughCalculator.riseTime', 'Rise Time')}
                    </span>
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.riseTime}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.pizzaDoughCalculator.bakingTemperature', 'Baking Temperature')}
                    </span>
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.bakingTemp}
                  </div>
                </div>
              </div>

              {/* Total Dough Weight */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pizzaDoughCalculator.totalDoughWeight', 'Total Dough Weight:')}
                  </span>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.totalDoughWeight}g ({(result.totalDoughWeight / 453.592).toFixed(2)} lbs)
                  </span>
                </div>
              </div>

              {/* Tips Toggle */}
              <button
                onClick={() => setShowTips(!showTips)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.pizzaDoughCalculator.stretchShapeTips', 'Stretch & Shape Tips')}
                  </span>
                </div>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {showTips ? '-' : '+'}
                </span>
              </button>

              {showTips && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`space-y-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div>
                      <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.pizzaDoughCalculator.mixingKneading', 'Mixing & Kneading')}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('tools.pizzaDoughCalculator.combineFlourAndSaltFirst', 'Combine flour and salt first, then add water with yeast dissolved')}</li>
                        <li>{t('tools.pizzaDoughCalculator.kneadFor810Minutes', 'Knead for 8-10 minutes until smooth and elastic')}</li>
                        <li>{t('tools.pizzaDoughCalculator.theDoughShouldPassThe', 'The dough should pass the "windowpane test"')}</li>
                        <li>{t('tools.pizzaDoughCalculator.addOilAtTheEnd', 'Add oil at the end of kneading (if using)')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.pizzaDoughCalculator.fermentation', 'Fermentation')}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('tools.pizzaDoughCalculator.letDoughBulkFermentUntil', 'Let dough bulk ferment until doubled in size')}</li>
                        <li>Divide into {result.numberOfPizzas} equal portions of {result.doughBallWeight}g each</li>
                        <li>{t('tools.pizzaDoughCalculator.shapeIntoTightBallsBy', 'Shape into tight balls by tucking edges underneath')}</li>
                        {result.coldFermentDays > 0 && (
                          <li>{t('tools.pizzaDoughCalculator.refrigerateInOiledContainersTightly', 'Refrigerate in oiled containers, tightly sealed')}</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.pizzaDoughCalculator.shapingThePizza', 'Shaping the Pizza')}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('tools.pizzaDoughCalculator.letColdDoughComeTo', 'Let cold dough come to room temperature (1-2 hours)')}</li>
                        <li>{t('tools.pizzaDoughCalculator.pressCenterFirstLeavingA', 'Press center first, leaving a thicker edge for crust')}</li>
                        <li>{t('tools.pizzaDoughCalculator.useYourKnucklesToStretch', 'Use your knuckles to stretch, rotating as you go')}</li>
                        <li>{t('tools.pizzaDoughCalculator.neverUseARollingPin', 'Never use a rolling pin - it removes air bubbles')}</li>
                        <li>{t('tools.pizzaDoughCalculator.workQuicklyToPreventSticking', 'Work quickly to prevent sticking')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Baking Tips for {CRUST_STYLES[result.crustStyle].label}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.crustStyle === 'neapolitan' && (
                          <>
                            <li>{t('tools.pizzaDoughCalculator.preheatPizzaStoneForAt', 'Preheat pizza stone for at least 1 hour')}</li>
                            <li>{t('tools.pizzaDoughCalculator.useMinimalToppingsLessIs', 'Use minimal toppings - less is more')}</li>
                            <li>{t('tools.pizzaDoughCalculator.rotatePizzaHalfwayThroughFor', 'Rotate pizza halfway through for even baking')}</li>
                          </>
                        )}
                        {result.crustStyle === 'thin' && (
                          <>
                            <li>{t('tools.pizzaDoughCalculator.rollOrStretchAsThin', 'Roll or stretch as thin as possible')}</li>
                            <li>{t('tools.pizzaDoughCalculator.useAPizzaScreenFor', 'Use a pizza screen for extra crispiness')}</li>
                            <li>{t('tools.pizzaDoughCalculator.preBakeCrustFor3', 'Pre-bake crust for 3-4 minutes before adding toppings')}</li>
                          </>
                        )}
                        {result.crustStyle === 'thick' && (
                          <>
                            <li>{t('tools.pizzaDoughCalculator.letDoughRiseInThe', 'Let dough rise in the pan for 30 minutes')}</li>
                            <li>{t('tools.pizzaDoughCalculator.dimpleTheDoughWithYour', 'Dimple the dough with your fingers')}</li>
                            <li>{t('tools.pizzaDoughCalculator.lowerTemperatureEnsuresCenterCooks', 'Lower temperature ensures center cooks through')}</li>
                          </>
                        )}
                        {result.crustStyle === 'regular' && (
                          <>
                            <li>{t('tools.pizzaDoughCalculator.preheatOvenWithStoneSteel', 'Preheat oven with stone/steel for 45+ minutes')}</li>
                            <li>{t('tools.pizzaDoughCalculator.useSemolinaOrCornmealOn', 'Use semolina or cornmeal on peel to prevent sticking')}</li>
                            <li>{t('tools.pizzaDoughCalculator.toppingsShouldBeRoomTemperature', 'Toppings should be room temperature')}</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pizzaDoughCalculator.aboutThisCalculator', 'About This Calculator')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                This calculator uses baker's percentages to ensure consistent results every time.
                All ingredients are calculated relative to the flour weight.
              </p>
              <p>
                Cold fermentation develops more complex flavors and improves texture.
                For best results with Neapolitan style, use a 24-72 hour cold ferment.
              </p>
              <p className="text-xs mt-2 italic">
                {t('tools.pizzaDoughCalculator.tipWeighIngredientsUsingA', 'Tip: Weigh ingredients using a kitchen scale for the most accurate results.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDoughCalculatorTool;
