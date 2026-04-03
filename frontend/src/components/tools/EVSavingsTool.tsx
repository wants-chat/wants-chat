import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Fuel, DollarSign, Car, TrendingUp, Info, Sparkles, Leaf } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface EVSavingsToolProps {
  uiConfig?: UIConfig;
}

export const EVSavingsTool: React.FC<EVSavingsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Current vehicle (gas)
  const [gasMPG, setGasMPG] = useState('28');
  const [gasPrice, setGasPrice] = useState('3.50');

  // EV vehicle
  const [evEfficiency, setEvEfficiency] = useState('3.5'); // miles per kWh
  const [electricityRate, setElectricityRate] = useState('0.12'); // $/kWh
  const [homeChargingPercent, setHomeChargingPercent] = useState('80');
  const [publicChargingRate, setPublicChargingRate] = useState('0.35');

  // Driving habits
  const [annualMiles, setAnnualMiles] = useState('12000');
  const [yearsToCompare, setYearsToCompare] = useState('5');

  // Vehicle costs
  const [evPurchasePrice, setEvPurchasePrice] = useState('45000');
  const [gasPurchasePrice, setGasPurchasePrice] = useState('35000');
  const [evTaxCredit, setEvTaxCredit] = useState('7500');

  // Maintenance
  const [gasMaintenancePerYear, setGasMaintenancePerYear] = useState('1200');
  const [evMaintenancePerYear, setEvMaintenancePerYear] = useState('500');

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.mpg !== undefined) {
        setGasMPG(String(params.mpg));
        setIsPrefilled(true);
      }
      if (params.gasPrice !== undefined) {
        setGasPrice(String(params.gasPrice));
        setIsPrefilled(true);
      }
      if (params.mileage !== undefined || params.annualMiles !== undefined) {
        setAnnualMiles(String(params.mileage || params.annualMiles));
        setIsPrefilled(true);
      }
      if (params.electricityRate !== undefined) {
        setElectricityRate(String(params.electricityRate));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const mpg = parseFloat(gasMPG) || 1;
    const gasPriceVal = parseFloat(gasPrice) || 0;
    const evEff = parseFloat(evEfficiency) || 1;
    const elecRate = parseFloat(electricityRate) || 0;
    const homePercent = parseFloat(homeChargingPercent) || 0;
    const publicRate = parseFloat(publicChargingRate) || 0;
    const miles = parseFloat(annualMiles) || 0;
    const years = parseInt(yearsToCompare) || 1;
    const evPrice = parseFloat(evPurchasePrice) || 0;
    const gasVehiclePrice = parseFloat(gasPurchasePrice) || 0;
    const taxCredit = parseFloat(evTaxCredit) || 0;
    const gasMaint = parseFloat(gasMaintenancePerYear) || 0;
    const evMaint = parseFloat(evMaintenancePerYear) || 0;

    // Annual fuel costs - Gas
    const annualGallons = miles / mpg;
    const annualGasCost = annualGallons * gasPriceVal;

    // Annual fuel costs - EV
    const annualKWh = miles / evEff;
    const homeKWh = annualKWh * (homePercent / 100);
    const publicKWh = annualKWh * ((100 - homePercent) / 100);
    const annualHomeCost = homeKWh * elecRate;
    const annualPublicCost = publicKWh * publicRate;
    const annualEvCost = annualHomeCost + annualPublicCost;

    // Annual savings
    const annualFuelSavings = annualGasCost - annualEvCost;
    const annualMaintenanceSavings = gasMaint - evMaint;
    const totalAnnualSavings = annualFuelSavings + annualMaintenanceSavings;

    // Multi-year projections
    const totalGasFuelCost = annualGasCost * years;
    const totalEvFuelCost = annualEvCost * years;
    const totalGasMaintenanceCost = gasMaint * years;
    const totalEvMaintenanceCost = evMaint * years;

    // Total cost of ownership
    const totalGasCost = gasVehiclePrice + totalGasFuelCost + totalGasMaintenanceCost;
    const totalEvCost = (evPrice - taxCredit) + totalEvFuelCost + totalEvMaintenanceCost;

    // Cumulative savings
    const totalFuelSavings = annualFuelSavings * years;
    const totalMaintenanceSavings = annualMaintenanceSavings * years;
    const totalSavings = totalAnnualSavings * years;

    // Break-even point
    const priceDifference = evPrice - taxCredit - gasVehiclePrice;
    const breakEvenYears = totalAnnualSavings > 0 ? priceDifference / totalAnnualSavings : Infinity;

    // Environmental impact (avg 19.6 lbs CO2 per gallon)
    const annualCO2Avoided = annualGallons * 19.6; // lbs
    const totalCO2Avoided = annualCO2Avoided * years;
    const treesEquivalent = totalCO2Avoided / 48; // Avg tree absorbs 48 lbs CO2/year

    // Cost per mile
    const gasCostPerMile = (annualGasCost + gasMaint) / miles;
    const evCostPerMile = (annualEvCost + evMaint) / miles;

    return {
      annualGasCost,
      annualEvCost,
      annualFuelSavings,
      annualMaintenanceSavings,
      totalAnnualSavings,
      totalGasCost,
      totalEvCost,
      totalFuelSavings,
      totalMaintenanceSavings,
      totalSavings,
      breakEvenYears,
      annualCO2Avoided,
      totalCO2Avoided,
      treesEquivalent,
      gasCostPerMile,
      evCostPerMile,
      annualGallons,
      annualKWh,
    };
  }, [gasMPG, gasPrice, evEfficiency, electricityRate, homeChargingPercent, publicChargingRate, annualMiles, yearsToCompare, evPurchasePrice, gasPurchasePrice, evTaxCredit, gasMaintenancePerYear, evMaintenancePerYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Zap className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVSavings.evVsGasSavingsCalculator', 'EV vs Gas Savings Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eVSavings.compareElectricVsGasolineVehicle', 'Compare electric vs gasoline vehicle costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.eVSavings.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Gas Vehicle Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Fuel className="w-4 h-4 text-orange-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVSavings.gasVehicle', 'Gas Vehicle')}</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.fuelEconomyMpg', 'Fuel Economy (MPG)')}
              </label>
              <input
                type="number"
                value={gasMPG}
                onChange={(e) => setGasMPG(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.gasPriceGal', 'Gas Price ($/gal)')}
              </label>
              <input
                type="number"
                step="0.01"
                value={gasPrice}
                onChange={(e) => setGasPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.vehiclePrice', 'Vehicle Price ($)')}
              </label>
              <input
                type="number"
                value={gasPurchasePrice}
                onChange={(e) => setGasPurchasePrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* EV Vehicle Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-teal-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVSavings.electricVehicle', 'Electric Vehicle')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.efficiencyMilesKwh', 'Efficiency (miles/kWh)')}
              </label>
              <input
                type="number"
                step="0.1"
                value={evEfficiency}
                onChange={(e) => setEvEfficiency(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.vehiclePrice2', 'Vehicle Price ($)')}
              </label>
              <input
                type="number"
                value={evPurchasePrice}
                onChange={(e) => setEvPurchasePrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.homeRateKwh', 'Home Rate ($/kWh)')}
              </label>
              <input
                type="number"
                step="0.01"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.homeCharging', 'Home Charging %')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={homeChargingPercent}
                onChange={(e) => setHomeChargingPercent(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.publicRateKwh', 'Public Rate ($/kWh)')}
              </label>
              <input
                type="number"
                step="0.01"
                value={publicChargingRate}
                onChange={(e) => setPublicChargingRate(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.eVSavings.taxCredit', 'Tax Credit ($)')}
              </label>
              <input
                type="number"
                value={evTaxCredit}
                onChange={(e) => setEvTaxCredit(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Driving & Maintenance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVSavings.annualMiles', 'Annual Miles')}
            </label>
            <input
              type="number"
              value={annualMiles}
              onChange={(e) => setAnnualMiles(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVSavings.yearsToCompare', 'Years to Compare')}
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={yearsToCompare}
              onChange={(e) => setYearsToCompare(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVSavings.gasMaintenanceYear', 'Gas Maintenance/Year')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={gasMaintenancePerYear}
                onChange={(e) => setGasMaintenancePerYear(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eVSavings.evMaintenanceYear', 'EV Maintenance/Year')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={evMaintenancePerYear}
                onChange={(e) => setEvMaintenancePerYear(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Annual Savings Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVSavings.annualEvSavings', 'Annual EV Savings')}</div>
          <div className="text-4xl font-bold text-teal-500 my-2">
            {formatCurrency(calculations.totalAnnualSavings)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {formatCurrency(calculations.annualFuelSavings)} fuel + {formatCurrency(calculations.annualMaintenanceSavings)} maintenance
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVSavings.gasVehicle2', 'Gas Vehicle')}</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(calculations.annualGasCost)}/yr</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ${calculations.gasCostPerMile.toFixed(3)}/mile
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-teal-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVSavings.electricVehicle2', 'Electric Vehicle')}</span>
            </div>
            <div className="text-2xl font-bold text-teal-500">{formatCurrency(calculations.annualEvCost)}/yr</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ${calculations.evCostPerMile.toFixed(3)}/mile
            </div>
          </div>
        </div>

        {/* Long-term Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {yearsToCompare}-Year Comparison
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVSavings.totalFuelSavings', 'Total Fuel Savings')}</div>
              <div className="text-xl font-bold text-teal-500">{formatCurrency(calculations.totalFuelSavings)}</div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVSavings.totalMaintSavings', 'Total Maint. Savings')}</div>
              <div className="text-xl font-bold text-teal-500">{formatCurrency(calculations.totalMaintenanceSavings)}</div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVSavings.breakEven', 'Break-Even')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.breakEvenYears === Infinity ? 'N/A' : `${calculations.breakEvenYears.toFixed(1)} yrs`}
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eVSavings.environmentalImpact', 'Environmental Impact')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>CO2 Avoided ({yearsToCompare} years)</div>
              <div className="text-xl font-bold text-green-500">{Math.round(calculations.totalCO2Avoided).toLocaleString()} lbs</div>
            </div>
            <div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eVSavings.treesEquivalent', 'Trees Equivalent')}</div>
              <div className="text-xl font-bold text-green-500">{Math.round(calculations.treesEquivalent)} trees</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.eVSavings.maximizeEvSavings', 'Maximize EV Savings:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.eVSavings.chargeAtHomeDuringOff', 'Charge at home during off-peak hours for lowest rates')}</li>
                <li>{t('tools.eVSavings.takeAdvantageOfFederalAnd', 'Take advantage of federal and state EV tax credits')}</li>
                <li>{t('tools.eVSavings.evsRequireNoOilChanges', 'EVs require no oil changes, fewer brake replacements')}</li>
                <li>{t('tools.eVSavings.considerSolarPanelsToFurther', 'Consider solar panels to further reduce charging costs')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVSavingsTool;
