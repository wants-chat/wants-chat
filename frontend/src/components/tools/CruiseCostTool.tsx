import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ship, Users, Calendar, DollarSign, Utensils, Wifi, Wine, Camera, Sparkles, Info, Anchor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type CabinType = 'interior' | 'oceanview' | 'balcony' | 'suite';
type CruiseLine = 'budget' | 'mainstream' | 'premium' | 'luxury';

interface AddOn {
  id: string;
  name: string;
  description: string;
  pricePerPersonPerDay: number;
  pricePerPerson?: number;
  icon: React.ReactNode;
  selected: boolean;
}

const CABIN_MULTIPLIERS: Record<CabinType, number> = {
  interior: 1.0,
  oceanview: 1.25,
  balcony: 1.6,
  suite: 2.5,
};

const CRUISE_LINE_BASE_RATES: Record<CruiseLine, number> = {
  budget: 75,
  mainstream: 125,
  premium: 200,
  luxury: 400,
};

interface CruiseCostToolProps {
  uiConfig?: UIConfig;
}

export const CruiseCostTool: React.FC<CruiseCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [nights, setNights] = useState<string>('7');
  const [passengers, setPassengers] = useState<string>('2');
  const [cabinType, setCabinType] = useState<CabinType>('balcony');
  const [cruiseLine, setCruiseLine] = useState<CruiseLine>('mainstream');
  const [portFees, setPortFees] = useState<string>('150');
  const [gratuities, setGratuities] = useState<string>('15');
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: 'drinks', name: 'Drink Package', description: 'Unlimited beverages including alcohol', pricePerPersonPerDay: 65, icon: <Wine className="w-4 h-4" />, selected: false },
    { id: 'wifi', name: 'WiFi Package', description: 'Internet access throughout voyage', pricePerPersonPerDay: 20, icon: <Wifi className="w-4 h-4" />, selected: false },
    { id: 'dining', name: 'Specialty Dining', description: 'Premium restaurant experiences', pricePerPerson: 150, pricePerPersonPerDay: 0, icon: <Utensils className="w-4 h-4" />, selected: false },
    { id: 'excursions', name: 'Shore Excursions', description: 'Guided tours at ports', pricePerPerson: 400, pricePerPersonPerDay: 0, icon: <Camera className="w-4 h-4" />, selected: false },
    { id: 'spa', name: 'Spa Package', description: 'Relaxation and wellness treatments', pricePerPerson: 250, pricePerPersonPerDay: 0, icon: <Anchor className="w-4 h-4" />, selected: false },
  ]);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.nights || params.duration) {
        setNights(String(params.nights || params.duration));
        hasChanges = true;
      }
      if (params.passengers || params.travelers) {
        setPassengers(String(params.passengers || params.travelers));
        hasChanges = true;
      }
      if (params.cabinType) {
        setCabinType(params.cabinType as CabinType);
        hasChanges = true;
      }
      if (params.cruiseLine) {
        setCruiseLine(params.cruiseLine as CruiseLine);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const toggleAddOn = (id: string) => {
    setAddOns(prev =>
      prev.map(addon =>
        addon.id === id ? { ...addon, selected: !addon.selected } : addon
      )
    );
  };

  const calculations = useMemo(() => {
    const numNights = parseInt(nights) || 0;
    const numPassengers = parseInt(passengers) || 0;
    const portFeesPerPerson = parseFloat(portFees) || 0;
    const gratuitiesPerDay = parseFloat(gratuities) || 0;

    // Base cruise fare
    const baseRatePerNight = CRUISE_LINE_BASE_RATES[cruiseLine];
    const cabinMultiplier = CABIN_MULTIPLIERS[cabinType];
    const cruiseFarePerPerson = baseRatePerNight * numNights * cabinMultiplier;
    const totalCruiseFare = cruiseFarePerPerson * numPassengers;

    // Port fees and taxes
    const totalPortFees = portFeesPerPerson * numPassengers;

    // Gratuities
    const totalGratuities = gratuitiesPerDay * numNights * numPassengers;

    // Add-ons
    let totalAddOns = 0;
    addOns.forEach(addon => {
      if (addon.selected) {
        if (addon.pricePerPersonPerDay > 0) {
          totalAddOns += addon.pricePerPersonPerDay * numNights * numPassengers;
        } else if (addon.pricePerPerson) {
          totalAddOns += addon.pricePerPerson * numPassengers;
        }
      }
    });

    // Subtotals
    const subtotal = totalCruiseFare + totalPortFees + totalGratuities;
    const grandTotal = subtotal + totalAddOns;

    const perPerson = numPassengers > 0 ? grandTotal / numPassengers : 0;
    const perNight = numNights > 0 ? grandTotal / numNights : 0;
    const perPersonPerNight = numPassengers > 0 && numNights > 0 ? grandTotal / numPassengers / numNights : 0;

    return {
      cruiseFarePerPerson,
      totalCruiseFare,
      totalPortFees,
      totalGratuities,
      totalAddOns,
      subtotal,
      grandTotal,
      perPerson,
      perNight,
      perPersonPerNight,
    };
  }, [nights, passengers, cabinType, cruiseLine, portFees, gratuities, addOns]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cruiseCost.cruiseCostCalculator', 'Cruise Cost Calculator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.cruiseCost.estimateTheTotalCostOf', 'Estimate the total cost of your cruise vacation')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.cruiseCost.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('tools.cruiseCost.numberOfNights', 'Number of Nights')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('tools.cruiseCost.numberOfPassengers', 'Number of Passengers')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Cruise Line Type */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Ship className="w-4 h-4 inline mr-1" />
                {t('tools.cruiseCost.cruiseLineType', 'Cruise Line Type')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'budget', name: 'Budget', desc: 'Carnival, MSC' },
                  { id: 'mainstream', name: 'Mainstream', desc: 'Royal Caribbean, NCL' },
                  { id: 'premium', name: 'Premium', desc: 'Celebrity, Princess' },
                  { id: 'luxury', name: 'Luxury', desc: 'Viking, Regent' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCruiseLine(type.id as CruiseLine)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      cruiseLine === type.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.name}</div>
                    <div className={`text-xs ${cruiseLine === type.id ? 'text-teal-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cabin Type */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.cruiseCost.cabinType', 'Cabin Type')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'interior', name: 'Interior', desc: 'No window' },
                  { id: 'oceanview', name: 'Oceanview', desc: 'Window/Porthole' },
                  { id: 'balcony', name: 'Balcony', desc: 'Private balcony' },
                  { id: 'suite', name: 'Suite', desc: 'Premium space' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCabinType(type.id as CabinType)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      cabinType === type.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.name}</div>
                    <div className={`text-xs ${cabinType === type.id ? 'text-teal-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Port Fees & Gratuities */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.cruiseCost.portFeesTaxesPerPerson', 'Port Fees & Taxes (per person)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={portFees}
                  onChange={(e) => setPortFees(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.cruiseCost.gratuitiesPerPersonDay', 'Gratuities (per person/day)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={gratuities}
                  onChange={(e) => setGratuities(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Add-Ons */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.cruiseCost.optionalAddOns', 'Optional Add-Ons')}
              </label>
              <div className="space-y-2">
                {addOns.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      addon.selected
                        ? isDark ? 'bg-teal-900/30 border border-teal-700' : 'bg-teal-50 border border-teal-200'
                        : isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={addon.selected}
                      onChange={() => toggleAddOn(addon.id)}
                      className="w-4 h-4 rounded text-[#0D9488]"
                    />
                    <div className={`p-2 rounded ${addon.selected ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      {addon.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {addon.name}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {addon.description}
                      </div>
                    </div>
                    <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {addon.pricePerPersonPerDay > 0 ? (
                        <div className="font-medium">${addon.pricePerPersonPerDay}/person/day</div>
                      ) : (
                        <div className="font-medium">${addon.pricePerPerson}/person total</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <DollarSign className="w-5 h-5 text-[#0D9488]" />
                {t('tools.cruiseCost.costBreakdown', 'Cost Breakdown')}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Cruise Fare ({formatCurrency(calculations.cruiseFarePerPerson)}/person)
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formatCurrency(calculations.totalCruiseFare)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cruiseCost.portFeesTaxes', 'Port Fees & Taxes')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formatCurrency(calculations.totalPortFees)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cruiseCost.gratuities', 'Gratuities')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formatCurrency(calculations.totalGratuities)}
                  </span>
                </div>

                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-teal-700' : 'border-teal-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cruiseCost.subtotal', 'Subtotal')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formatCurrency(calculations.subtotal)}
                  </span>
                </div>

                {calculations.totalAddOns > 0 && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cruiseCost.addOns', 'Add-Ons')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(calculations.totalAddOns)}
                    </span>
                  </div>
                )}

                <div className={`flex justify-between pt-3 border-t ${isDark ? 'border-teal-700' : 'border-teal-200'}`}>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cruiseCost.grandTotal', 'Grand Total')}</span>
                  <span className="text-2xl font-bold text-[#0D9488]">
                    {formatCurrency(calculations.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cruiseCost.perPerson', 'Per Person')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.perPerson)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cruiseCost.perNightTotal', 'Per Night (Total)')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.perNight)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cruiseCost.perPersonNight', 'Per Person/Night')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.perPersonPerNight)}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start gap-3`}>
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-medium mb-1">{t('tools.cruiseCost.moneySavingTips', 'Money-Saving Tips:')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('tools.cruiseCost.bookDuringWaveSeasonJanuary', 'Book during wave season (January-March) for best deals')}</li>
                  <li>{t('tools.cruiseCost.considerRepositioningCruisesForLower', 'Consider repositioning cruises for lower fares')}</li>
                  <li>{t('tools.cruiseCost.lookForDrinkPackagePromotions', 'Look for drink package promotions before sailing')}</li>
                  <li>{t('tools.cruiseCost.bookShoreExcursionsIndependentlyFor', 'Book shore excursions independently for savings')}</li>
                  <li>{t('tools.cruiseCost.interiorCabinsOfferTheSame', 'Interior cabins offer the same experience at lower cost')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CruiseCostTool;
