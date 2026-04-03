import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, Clock, Users, Sparkles, Info, Calculator, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type HomeSize = 'studio' | 'small' | 'medium' | 'large' | 'xlarge';
type CleaningType = 'standard' | 'deep' | 'moveInOut' | 'post-construction';
type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
type ServiceType = 'individual' | 'company';

interface HousekeepingCostToolProps {
  uiConfig?: UIConfig;
}

export const HousekeepingCostTool: React.FC<HousekeepingCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeSize, setHomeSize] = useState<HomeSize>('medium');
  const [sqft, setSqft] = useState('1500');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [cleaningType, setCleaningType] = useState<CleaningType>('standard');
  const [frequency, setFrequency] = useState<Frequency>('bi-weekly');
  const [serviceType, setServiceType] = useState<ServiceType>('company');
  const [hasPets, setHasPets] = useState(false);
  const [extraCluttered, setExtraCluttered] = useState(false);
  const [location, setLocation] = useState<'low' | 'average' | 'high'>('average');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Add-on services
  const [addOns, setAddOns] = useState<{
    insideOven: boolean;
    insideFridge: boolean;
    insideWindows: boolean;
    laundry: boolean;
    dishes: boolean;
    organizingClosets: boolean;
    insideCabinets: boolean;
  }>({
    insideOven: false,
    insideFridge: false,
    insideWindows: false,
    laundry: false,
    dishes: false,
    organizingClosets: false,
    insideCabinets: false,
  });

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.homeSize) {
        setHomeSize(params.homeSize as HomeSize);
        setIsPrefilled(true);
      }
      if (params.sqft !== undefined) {
        setSqft(String(params.sqft));
        setIsPrefilled(true);
      }
      if (params.bedrooms !== undefined) {
        setBedrooms(String(params.bedrooms));
        setIsPrefilled(true);
      }
      if (params.bathrooms !== undefined) {
        setBathrooms(String(params.bathrooms));
        setIsPrefilled(true);
      }
      if (params.cleaningType) {
        setCleaningType(params.cleaningType as CleaningType);
        setIsPrefilled(true);
      }
      if (params.frequency) {
        setFrequency(params.frequency as Frequency);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const homeSizes = {
    studio: { name: 'Studio', sqftRange: '400-600', baseCost: 80 },
    small: { name: '1-2 BR', sqftRange: '600-1000', baseCost: 120 },
    medium: { name: '3 BR', sqftRange: '1000-2000', baseCost: 175 },
    large: { name: '4 BR', sqftRange: '2000-3000', baseCost: 250 },
    xlarge: { name: '5+ BR', sqftRange: '3000+', baseCost: 350 },
  };

  const cleaningTypes = {
    standard: { name: 'Standard Clean', multiplier: 1, description: 'Regular maintenance cleaning' },
    deep: { name: 'Deep Clean', multiplier: 1.75, description: 'Thorough top-to-bottom cleaning' },
    moveInOut: { name: 'Move In/Out', multiplier: 2, description: 'Complete empty home cleaning' },
    'post-construction': { name: 'Post-Construction', multiplier: 2.5, description: 'Heavy duty cleaning after construction' },
  };

  const frequencies = {
    'one-time': { name: 'One-Time', discount: 0, description: 'Single visit' },
    'weekly': { name: 'Weekly', discount: 0.2, description: 'Save 20%' },
    'bi-weekly': { name: 'Bi-Weekly', discount: 0.15, description: 'Save 15%' },
    'monthly': { name: 'Monthly', discount: 0.1, description: 'Save 10%' },
  };

  const locationMultipliers = {
    low: { name: 'Low COL Area', multiplier: 0.75, description: 'Rural/low cost areas' },
    average: { name: 'Average', multiplier: 1, description: 'Typical suburban/urban' },
    high: { name: 'High COL Area', multiplier: 1.5, description: 'Major metro/expensive areas' },
  };

  const addOnServices = [
    { key: 'insideOven', name: 'Inside Oven', cost: 35 },
    { key: 'insideFridge', name: 'Inside Refrigerator', cost: 35 },
    { key: 'insideWindows', name: 'Interior Windows', cost: 5 },
    { key: 'laundry', name: 'Laundry (wash/fold)', cost: 25 },
    { key: 'dishes', name: 'Dishes', cost: 15 },
    { key: 'organizingClosets', name: 'Closet Organization', cost: 50 },
    { key: 'insideCabinets', name: 'Inside Cabinets', cost: 40 },
  ];

  const toggleAddOn = (key: string) => {
    setAddOns(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const calculations = useMemo(() => {
    const sqftNum = parseFloat(sqft) || 1500;
    const bedroomsNum = parseInt(bedrooms) || 3;
    const bathroomsNum = parseInt(bathrooms) || 2;

    // Base cost from home size
    const baseCost = homeSizes[homeSize].baseCost;

    // Adjust for actual square footage
    const sqftMultiplier = sqftNum <= 1000 ? 1 :
      sqftNum <= 2000 ? 1 + ((sqftNum - 1000) / 1000) * 0.3 :
      sqftNum <= 3000 ? 1.3 + ((sqftNum - 2000) / 1000) * 0.4 :
      1.7 + ((sqftNum - 3000) / 1000) * 0.5;

    // Bedroom and bathroom additions
    const bedroomCost = Math.max(0, bedroomsNum - 2) * 15;
    const bathroomCost = Math.max(0, bathroomsNum - 1) * 20;

    // Apply cleaning type multiplier
    const typeMultiplier = cleaningTypes[cleaningType].multiplier;

    // Apply service type (companies typically cost more)
    const serviceMultiplier = serviceType === 'company' ? 1 : 0.75;

    // Apply location multiplier
    const locationMult = locationMultipliers[location].multiplier;

    // Calculate add-ons
    const addOnCost = addOnServices.reduce((sum, service) => {
      if (addOns[service.key as keyof typeof addOns]) {
        return sum + service.cost;
      }
      return sum;
    }, 0);

    // Pet and clutter surcharges
    const petSurcharge = hasPets ? 20 : 0;
    const clutterSurcharge = extraCluttered ? 30 : 0;

    // Calculate base price before frequency discount
    const basePrice = (
      (baseCost * sqftMultiplier + bedroomCost + bathroomCost) *
      typeMultiplier *
      serviceMultiplier *
      locationMult +
      addOnCost +
      petSurcharge +
      clutterSurcharge
    );

    // Apply frequency discount
    const frequencyDiscount = frequencies[frequency].discount;
    const discountAmount = basePrice * frequencyDiscount;
    const pricePerVisit = basePrice - discountAmount;

    // Calculate time estimate
    const baseTime = 60 + (sqftNum / 500) * 30; // Base time plus 30 min per 500 sqft
    const timeMultiplier = cleaningTypes[cleaningType].multiplier;
    const estimatedMinutes = Math.round(baseTime * timeMultiplier);
    const estimatedHours = Math.round(estimatedMinutes / 60 * 10) / 10;

    // Calculate recurring costs
    let visitsPerMonth: number;
    switch (frequency) {
      case 'weekly': visitsPerMonth = 4; break;
      case 'bi-weekly': visitsPerMonth = 2; break;
      case 'monthly': visitsPerMonth = 1; break;
      default: visitsPerMonth = 0;
    }

    const monthlyTotal = pricePerVisit * visitsPerMonth;
    const yearlyTotal = monthlyTotal * 12;

    // Range calculation (typically +-20%)
    const lowEstimate = Math.round(pricePerVisit * 0.8);
    const highEstimate = Math.round(pricePerVisit * 1.2);

    return {
      pricePerVisit: Math.round(pricePerVisit),
      lowEstimate,
      highEstimate,
      discountAmount: Math.round(discountAmount),
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      estimatedHours,
      visitsPerMonth,
      addOnTotal: addOnCost,
      breakdownItems: [
        { label: 'Base cleaning', amount: Math.round(baseCost * sqftMultiplier * serviceMultiplier * locationMult) },
        { label: 'Bedroom surcharge', amount: Math.round(bedroomCost * locationMult) },
        { label: 'Bathroom surcharge', amount: Math.round(bathroomCost * locationMult) },
        { label: `${cleaningTypes[cleaningType].name} adjustment`, amount: Math.round((baseCost * sqftMultiplier * (typeMultiplier - 1) * serviceMultiplier * locationMult)) },
        ...(addOnCost > 0 ? [{ label: 'Add-on services', amount: addOnCost }] : []),
        ...(petSurcharge > 0 ? [{ label: 'Pet surcharge', amount: petSurcharge }] : []),
        ...(clutterSurcharge > 0 ? [{ label: 'Clutter surcharge', amount: clutterSurcharge }] : []),
        ...(discountAmount > 0 ? [{ label: `${frequencies[frequency].name} discount`, amount: -Math.round(discountAmount) }] : []),
      ].filter(item => item.amount !== 0),
    };
  }, [homeSize, sqft, bedrooms, bathrooms, cleaningType, frequency, serviceType, location, addOns, hasPets, extraCluttered]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Home className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.housekeepingCost.housekeepingCostEstimator', 'Housekeeping Cost Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.housekeepingCost.estimateProfessionalCleaningServiceCosts', 'Estimate professional cleaning service costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.housekeepingCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Home Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Home className="w-4 h-4 inline mr-1" />
              {t('tools.housekeepingCost.homeSize', 'Home Size')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(homeSizes) as HomeSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setHomeSize(size)}
                  className={`py-2 px-2 rounded-lg text-xs text-center ${
                    homeSize === size
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {homeSizes[size].name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.housekeepingCost.squareFeet', 'Square Feet')}
              </label>
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.housekeepingCost.bedrooms', 'Bedrooms')}
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.housekeepingCost.bathrooms', 'Bathrooms')}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Cleaning Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.housekeepingCost.cleaningType', 'Cleaning Type')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(cleaningTypes) as CleaningType[]).map((type) => (
              <button
                key={type}
                onClick={() => setCleaningType(type)}
                className={`py-2 px-2 rounded-lg text-xs text-center ${
                  cleaningType === type
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cleaningTypes[type].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {cleaningTypes[cleaningType].description}
          </p>
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.housekeepingCost.frequency', 'Frequency')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(frequencies) as Frequency[]).map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`py-3 px-2 rounded-lg text-sm flex flex-col items-center gap-0.5 ${
                  frequency === freq
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{frequencies[freq].name}</span>
                {frequencies[freq].discount > 0 && (
                  <span className={`text-xs ${frequency === freq ? 'text-white/80' : 'text-teal-500'}`}>
                    {frequencies[freq].description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Service & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.housekeepingCost.serviceType', 'Service Type')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setServiceType('company')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  serviceType === 'company'
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.housekeepingCost.company', 'Company')}
              </button>
              <button
                onClick={() => setServiceType('individual')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  serviceType === 'individual'
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.housekeepingCost.individual', 'Individual')}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.housekeepingCost.location', 'Location')}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as 'low' | 'average' | 'high')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {(Object.keys(locationMultipliers) as Array<keyof typeof locationMultipliers>).map((loc) => (
                <option key={loc} value={loc}>{locationMultipliers[loc].name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Extra Options */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setHasPets(!hasPets)}
            className={`py-2 rounded-lg text-sm ${hasPets ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.housekeepingCost.havePets20', 'Have Pets (+$20)')}
          </button>
          <button
            onClick={() => setExtraCluttered(!extraCluttered)}
            className={`py-2 rounded-lg text-sm ${extraCluttered ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.housekeepingCost.extraCluttered30', 'Extra Cluttered (+$30)')}
          </button>
        </div>

        {/* Add-on Services */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.housekeepingCost.addOnServices', 'Add-on Services')}
          </label>
          <div className="flex flex-wrap gap-2">
            {addOnServices.map((service) => (
              <button
                key={service.key}
                onClick={() => toggleAddOn(service.key)}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  addOns[service.key as keyof typeof addOns]
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {service.name} (+${service.cost})
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeepingCost.estimatedCostPerVisit', 'Estimated Cost Per Visit')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            ${calculations.pricePerVisit}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Range: ${calculations.lowEstimate} - ${calculations.highEstimate}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Estimated time: {calculations.estimatedHours} hours
          </div>
        </div>

        {/* Recurring Costs */}
        {frequency !== 'one-time' && (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeepingCost.monthly', 'Monthly')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.monthlyTotal}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {calculations.visitsPerMonth} visit{calculations.visitsPerMonth !== 1 ? 's' : ''}/mo
              </div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.housekeepingCost.annual', 'Annual')}</div>
              <div className="text-2xl font-bold text-teal-500">
                ${calculations.yearlyTotal.toLocaleString()}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {calculations.visitsPerMonth * 12} visits/yr
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.housekeepingCost.priceBreakdown', 'Price Breakdown')}
          </h4>
          <div className="space-y-2">
            {calculations.breakdownItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
              >
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                <span className={`font-medium ${item.amount < 0 ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle className="w-4 h-4 inline mr-2 text-teal-500" />
            Typically Included in {cleaningTypes[cleaningType].name}
          </h4>
          <div className={`text-sm grid grid-cols-2 gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div>- Dusting surfaces</div>
            <div>- Vacuuming floors</div>
            <div>- Mopping hard floors</div>
            <div>- Cleaning bathrooms</div>
            <div>- Cleaning kitchen</div>
            <div>- Making beds</div>
            <div>- Emptying trash</div>
            <div>- Wiping counters</div>
            {cleaningType !== 'standard' && (
              <>
                <div>- Cleaning baseboards</div>
                <div>- Cleaning door frames</div>
                <div>- Deep scrubbing</div>
                <div>- Light fixtures</div>
              </>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.housekeepingCost.hiringTips', 'Hiring Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Get quotes from multiple providers</li>
                <li>- Check reviews and references</li>
                <li>- Confirm insurance and bonding</li>
                <li>- Clarify what is/isn't included</li>
                <li>- Recurring service usually saves 10-20%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingCostTool;
