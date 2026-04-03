import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Calendar, Users, DollarSign, AlertTriangle, Check, Info, Sparkles, Plane, Heart, Briefcase } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type CoverageLevel = 'basic' | 'standard' | 'comprehensive';
type TripType = 'domestic' | 'international' | 'adventure' | 'cruise';
type AgeGroup = '0-17' | '18-34' | '35-49' | '50-64' | '65-74' | '75+';

interface CoverageDetails {
  tripCancellation: number;
  medicalExpenses: number;
  medicalEvacuation: number;
  baggageLoss: number;
  tripDelay: number;
  flightAccident: number;
}

const COVERAGE_LEVELS: Record<CoverageLevel, CoverageDetails> = {
  basic: {
    tripCancellation: 5000,
    medicalExpenses: 25000,
    medicalEvacuation: 100000,
    baggageLoss: 500,
    tripDelay: 500,
    flightAccident: 25000,
  },
  standard: {
    tripCancellation: 10000,
    medicalExpenses: 100000,
    medicalEvacuation: 500000,
    baggageLoss: 1500,
    tripDelay: 1000,
    flightAccident: 100000,
  },
  comprehensive: {
    tripCancellation: 25000,
    medicalExpenses: 500000,
    medicalEvacuation: 1000000,
    baggageLoss: 3000,
    tripDelay: 2000,
    flightAccident: 500000,
  },
};

interface TravelInsuranceToolProps {
  uiConfig?: UIConfig;
}

export const TravelInsuranceTool: React.FC<TravelInsuranceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tripCost, setTripCost] = useState<string>('3000');
  const [tripDuration, setTripDuration] = useState<string>('7');
  const [travelers, setTravelers] = useState<string>('2');
  const [tripType, setTripType] = useState<TripType>('international');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('35-49');
  const [coverageLevel, setCoverageLevel] = useState<CoverageLevel>('standard');
  const [hasPreexisting, setHasPreexisting] = useState<boolean>(false);
  const [wantsCancelForAnyReason, setWantsCancelForAnyReason] = useState<boolean>(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.tripCost || params.cost) {
        setTripCost(String(params.tripCost || params.cost));
        hasChanges = true;
      }
      if (params.duration || params.days) {
        setTripDuration(String(params.duration || params.days));
        hasChanges = true;
      }
      if (params.travelers) {
        setTravelers(String(params.travelers));
        hasChanges = true;
      }
      if (params.tripType) {
        setTripType(params.tripType as TripType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const cost = parseFloat(tripCost) || 0;
    const duration = parseInt(tripDuration) || 1;
    const numTravelers = parseInt(travelers) || 1;

    // Base rate per $1000 of trip cost
    let baseRatePerThousand = 0;
    switch (coverageLevel) {
      case 'basic': baseRatePerThousand = 25; break;
      case 'standard': baseRatePerThousand = 45; break;
      case 'comprehensive': baseRatePerThousand = 75; break;
    }

    // Trip type multiplier
    let tripTypeMultiplier = 1;
    switch (tripType) {
      case 'domestic': tripTypeMultiplier = 0.7; break;
      case 'international': tripTypeMultiplier = 1; break;
      case 'adventure': tripTypeMultiplier = 1.5; break;
      case 'cruise': tripTypeMultiplier = 1.2; break;
    }

    // Age multiplier
    let ageMultiplier = 1;
    switch (ageGroup) {
      case '0-17': ageMultiplier = 0.8; break;
      case '18-34': ageMultiplier = 0.9; break;
      case '35-49': ageMultiplier = 1; break;
      case '50-64': ageMultiplier = 1.3; break;
      case '65-74': ageMultiplier = 1.8; break;
      case '75+': ageMultiplier = 2.5; break;
    }

    // Duration multiplier (longer trips cost more)
    const durationMultiplier = duration <= 7 ? 1 : duration <= 14 ? 1.15 : duration <= 30 ? 1.3 : 1.5;

    // Calculate base premium
    let premium = (cost / 1000) * baseRatePerThousand * tripTypeMultiplier * ageMultiplier * durationMultiplier;

    // Add pre-existing condition coverage
    const preexistingCost = hasPreexisting ? premium * 0.25 : 0;

    // Add cancel for any reason (typically 40-50% more)
    const cancelForAnyReasonCost = wantsCancelForAnyReason ? premium * 0.45 : 0;

    // Per traveler total
    const perTravelerPremium = premium + preexistingCost + cancelForAnyReasonCost;

    // Total for all travelers
    const totalPremium = perTravelerPremium * numTravelers;

    // Cost as percentage of trip
    const percentageOfTrip = cost > 0 ? (totalPremium / cost) * 100 : 0;

    return {
      basePremium: premium,
      preexistingCost,
      cancelForAnyReasonCost,
      perTravelerPremium,
      totalPremium,
      percentageOfTrip,
      coverage: COVERAGE_LEVELS[coverageLevel],
    };
  }, [tripCost, tripDuration, travelers, tripType, ageGroup, coverageLevel, hasPreexisting, wantsCancelForAnyReason]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLimit = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.travelInsurance.travelInsuranceEstimator', 'Travel Insurance Estimator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.travelInsurance.getAnEstimateForTravel', 'Get an estimate for travel insurance coverage')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.travelInsurance.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Trip Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.travelInsurance.totalTripCost', 'Total Trip Cost ($)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={tripCost}
                  onChange={(e) => setTripCost(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('tools.travelInsurance.tripDurationDays', 'Trip Duration (days)')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={tripDuration}
                  onChange={(e) => setTripDuration(e.target.value)}
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
                  {t('tools.travelInsurance.numberOfTravelers', 'Number of Travelers')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Trip Type */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.travelInsurance.tripType', 'Trip Type')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'domestic', name: 'Domestic', icon: <Plane className="w-4 h-4" /> },
                  { id: 'international', name: 'International', icon: <Plane className="w-4 h-4" /> },
                  { id: 'adventure', name: 'Adventure', icon: <Briefcase className="w-4 h-4" /> },
                  { id: 'cruise', name: 'Cruise', icon: <Plane className="w-4 h-4" /> },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setTripType(type.id as TripType)}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      tripType === type.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.icon}
                    <span className="text-sm">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.travelInsurance.ageGroupOldestTraveler', 'Age Group (oldest traveler)')}
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(['0-17', '18-34', '35-49', '50-64', '65-74', '75+'] as AgeGroup[]).map((age) => (
                  <button
                    key={age}
                    onClick={() => setAgeGroup(age)}
                    className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                      ageGroup === age
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage Level */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.travelInsurance.coverageLevel', 'Coverage Level')}
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'basic', name: 'Basic', desc: 'Essential coverage' },
                  { id: 'standard', name: 'Standard', desc: 'Recommended coverage' },
                  { id: 'comprehensive', name: 'Comprehensive', desc: 'Maximum protection' },
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setCoverageLevel(level.id as CoverageLevel)}
                    className={`p-4 rounded-lg text-left transition-colors ${
                      coverageLevel === level.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{level.name}</div>
                    <div className={`text-sm ${coverageLevel === level.id ? 'text-teal-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {level.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Add-ons */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.travelInsurance.optionalAddOns', 'Optional Add-ons')}
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={hasPreexisting}
                  onChange={(e) => setHasPreexisting(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D9488]"
                />
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Heart className="w-4 h-4 inline mr-1" />
                    {t('tools.travelInsurance.preExistingConditionCoverage', 'Pre-existing Condition Coverage')}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.travelInsurance.coverMedicalConditionsThatExisted', 'Cover medical conditions that existed before booking')}
                  </div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={wantsCancelForAnyReason}
                  onChange={(e) => setWantsCancelForAnyReason(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D9488]"
                />
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {t('tools.travelInsurance.cancelForAnyReasonCfar', 'Cancel for Any Reason (CFAR)')}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.travelInsurance.cancelYourTripForAny', 'Cancel your trip for any reason and get 50-75% refund')}
                  </div>
                </div>
              </label>
            </div>

            {/* Premium Estimate */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
              <div className="text-center mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.travelInsurance.estimatedPremium', 'Estimated Premium')}</div>
                <div className="text-5xl font-bold text-[#0D9488] my-2">
                  {formatCurrency(calculations.totalPremium)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {calculations.percentageOfTrip.toFixed(1)}% of trip cost | {formatCurrency(calculations.perTravelerPremium)} per traveler
                </div>
              </div>

              {(calculations.preexistingCost > 0 || calculations.cancelForAnyReasonCost > 0) && (
                <div className={`pt-4 mt-4 border-t ${isDark ? 'border-teal-700' : 'border-teal-200'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                    <div className="flex justify-between">
                      <span>{t('tools.travelInsurance.basePremiumPerPerson', 'Base Premium (per person)')}</span>
                      <span>{formatCurrency(calculations.basePremium)}</span>
                    </div>
                    {calculations.preexistingCost > 0 && (
                      <div className="flex justify-between">
                        <span>{t('tools.travelInsurance.preExistingConditionAddOn', 'Pre-existing Condition Add-on')}</span>
                        <span>+{formatCurrency(calculations.preexistingCost)}</span>
                      </div>
                    )}
                    {calculations.cancelForAnyReasonCost > 0 && (
                      <div className="flex justify-between">
                        <span>{t('tools.travelInsurance.cancelForAnyReasonAdd', 'Cancel for Any Reason Add-on')}</span>
                        <span>+{formatCurrency(calculations.cancelForAnyReasonCost)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Coverage Details */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Coverage Limits ({coverageLevel.charAt(0).toUpperCase() + coverageLevel.slice(1)} Plan)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className="w-4 h-4 text-green-500" /> Trip Cancellation
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatLimit(calculations.coverage.tripCancellation)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className="w-4 h-4 text-green-500" /> Medical Expenses
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatLimit(calculations.coverage.medicalExpenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className="w-4 h-4 text-green-500" /> Medical Evacuation
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatLimit(calculations.coverage.medicalEvacuation)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className="w-4 h-4 text-green-500" /> Baggage Loss
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatLimit(calculations.coverage.baggageLoss)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className="w-4 h-4 text-green-500" /> Trip Delay
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatLimit(calculations.coverage.tripDelay)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className="w-4 h-4 text-green-500" /> Flight Accident
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatLimit(calculations.coverage.flightAccident)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'} flex items-start gap-3`}>
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                This is an estimate for educational purposes only. Actual premiums vary by provider and specific policy terms.
                Always read policy documents carefully and compare quotes from multiple insurers before purchasing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInsuranceTool;
