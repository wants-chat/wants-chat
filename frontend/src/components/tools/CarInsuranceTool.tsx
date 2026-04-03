import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Car, User, MapPin, DollarSign, Info, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CarInsuranceToolProps {
  uiConfig?: UIConfig;
}

export const CarInsuranceTool: React.FC<CarInsuranceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Driver info
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [creditScore, setCreditScore] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [drivingRecord, setDrivingRecord] = useState<'clean' | 'minor' | 'major'>('clean');
  const [yearsLicensed, setYearsLicensed] = useState('10');

  // Vehicle info
  const [vehicleYear, setVehicleYear] = useState('2022');
  const [vehicleType, setVehicleType] = useState<'sedan' | 'suv' | 'truck' | 'sports' | 'luxury' | 'economy'>('sedan');
  const [vehicleValue, setVehicleValue] = useState('30000');
  const [annualMileage, setAnnualMileage] = useState('12000');
  const [safetyFeatures, setSafetyFeatures] = useState(true);
  const [antiTheft, setAntiTheft] = useState(false);

  // Location
  const [zipCode, setZipCode] = useState('');
  const [areaType, setAreaType] = useState<'urban' | 'suburban' | 'rural'>('suburban');
  const [garageParking, setGarageParking] = useState(true);

  // Coverage options
  const [coverageLevel, setCoverageLevel] = useState<'liability' | 'standard' | 'full'>('standard');
  const [deductible, setDeductible] = useState('500');

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.age !== undefined) {
        setAge(String(params.age));
        setIsPrefilled(true);
      }
      if (params.vehicleValue !== undefined || params.carValue !== undefined) {
        setVehicleValue(String(params.vehicleValue || params.carValue));
        setIsPrefilled(true);
      }
      if (params.vehicleYear !== undefined) {
        setVehicleYear(String(params.vehicleYear));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Base rates by coverage level (monthly)
  const baseRates: Record<string, number> = {
    liability: 50,
    standard: 100,
    full: 150,
  };

  // Calculate premium
  const calculations = useMemo(() => {
    let basePremium = baseRates[coverageLevel];

    // Age factors
    const ageNum = parseInt(age) || 35;
    let ageFactor = 1.0;
    if (ageNum < 21) ageFactor = 1.8;
    else if (ageNum < 25) ageFactor = 1.4;
    else if (ageNum < 30) ageFactor = 1.1;
    else if (ageNum >= 65) ageFactor = 1.15;

    // Gender factor (slight statistical difference)
    const genderFactor = gender === 'male' && ageNum < 25 ? 1.1 : 1.0;

    // Marital status
    const maritalFactor = maritalStatus === 'married' ? 0.95 : 1.0;

    // Credit score factors
    const creditFactors: Record<string, number> = {
      excellent: 0.85,
      good: 1.0,
      fair: 1.2,
      poor: 1.5,
    };

    // Driving record factors
    const recordFactors: Record<string, number> = {
      clean: 0.9,
      minor: 1.15,
      major: 1.5,
    };

    // Experience factor
    const yearsExp = parseInt(yearsLicensed) || 0;
    let experienceFactor = 1.0;
    if (yearsExp < 3) experienceFactor = 1.3;
    else if (yearsExp < 5) experienceFactor = 1.1;
    else if (yearsExp >= 10) experienceFactor = 0.95;

    // Vehicle type factors
    const vehicleFactors: Record<string, number> = {
      economy: 0.85,
      sedan: 1.0,
      suv: 1.1,
      truck: 1.05,
      sports: 1.4,
      luxury: 1.3,
    };

    // Vehicle age factor
    const currentYear = new Date().getFullYear();
    const vehYear = parseInt(vehicleYear) || currentYear;
    const vehicleAge = currentYear - vehYear;
    let vehicleAgeFactor = 1.0;
    if (vehicleAge <= 2) vehicleAgeFactor = 1.15;
    else if (vehicleAge >= 10) vehicleAgeFactor = 0.85;

    // Vehicle value factor (for comprehensive/collision)
    const vehValue = parseFloat(vehicleValue) || 0;
    let valueFactor = 1.0;
    if (coverageLevel === 'full' || coverageLevel === 'standard') {
      valueFactor = 1 + (vehValue / 100000) * 0.3;
    }

    // Mileage factor
    const miles = parseFloat(annualMileage) || 12000;
    let mileageFactor = 1.0;
    if (miles < 7500) mileageFactor = 0.9;
    else if (miles > 15000) mileageFactor = 1.15;
    else if (miles > 20000) mileageFactor = 1.25;

    // Location factors
    const areaFactors: Record<string, number> = {
      urban: 1.25,
      suburban: 1.0,
      rural: 0.85,
    };

    // Discount factors
    let discountFactor = 1.0;
    if (safetyFeatures) discountFactor *= 0.95;
    if (antiTheft) discountFactor *= 0.97;
    if (garageParking) discountFactor *= 0.97;

    // Deductible factor
    const deductibleNum = parseFloat(deductible) || 500;
    let deductibleFactor = 1.0;
    if (deductibleNum >= 1000) deductibleFactor = 0.85;
    else if (deductibleNum >= 750) deductibleFactor = 0.92;
    else if (deductibleNum <= 250) deductibleFactor = 1.15;

    // Calculate final monthly premium
    const monthlyPremium = basePremium
      * ageFactor
      * genderFactor
      * maritalFactor
      * creditFactors[creditScore]
      * recordFactors[drivingRecord]
      * experienceFactor
      * vehicleFactors[vehicleType]
      * vehicleAgeFactor
      * valueFactor
      * mileageFactor
      * areaFactors[areaType]
      * discountFactor
      * deductibleFactor;

    const sixMonthPremium = monthlyPremium * 6;
    const annualPremium = monthlyPremium * 12;

    // Calculate potential savings
    const potentialSavings: { item: string; savings: number }[] = [];
    if (!safetyFeatures) potentialSavings.push({ item: 'Safety features discount', savings: monthlyPremium * 0.05 * 12 });
    if (!antiTheft) potentialSavings.push({ item: 'Anti-theft device', savings: monthlyPremium * 0.03 * 12 });
    if (!garageParking) potentialSavings.push({ item: 'Garage parking', savings: monthlyPremium * 0.03 * 12 });
    if (deductibleNum < 1000) potentialSavings.push({ item: 'Higher deductible ($1000)', savings: monthlyPremium * 0.15 * 12 });
    if (drivingRecord !== 'clean') potentialSavings.push({ item: 'Clean driving record', savings: monthlyPremium * 0.2 * 12 });

    // Risk assessment
    let riskLevel = 'medium';
    const totalFactor = ageFactor * recordFactors[drivingRecord] * vehicleFactors[vehicleType];
    if (totalFactor > 1.5) riskLevel = 'high';
    else if (totalFactor < 1.1) riskLevel = 'low';

    return {
      monthlyPremium,
      sixMonthPremium,
      annualPremium,
      potentialSavings,
      riskLevel,
      appliedDiscounts: [
        safetyFeatures && 'Safety features',
        antiTheft && 'Anti-theft device',
        garageParking && 'Garage parking',
        maritalStatus === 'married' && 'Married discount',
        parseInt(yearsLicensed) >= 10 && 'Experienced driver',
      ].filter(Boolean) as string[],
    };
  }, [age, gender, maritalStatus, creditScore, drivingRecord, yearsLicensed, vehicleYear, vehicleType, vehicleValue, annualMileage, safetyFeatures, antiTheft, areaType, garageParking, coverageLevel, deductible]);

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
          <div className="p-2 bg-teal-500/10 rounded-lg"><Shield className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carInsurance.carInsuranceEstimator', 'Car Insurance Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.carInsurance.estimateYourAutoInsurancePremium', 'Estimate your auto insurance premium')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.carInsurance.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Driver Information */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-teal-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carInsurance.driverInformation', 'Driver Information')}</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.age', 'Age')}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.gender', 'Gender')}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="male">{t('tools.carInsurance.male', 'Male')}</option>
                <option value="female">{t('tools.carInsurance.female', 'Female')}</option>
                <option value="other">{t('tools.carInsurance.other', 'Other')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.maritalStatus', 'Marital Status')}</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as typeof maritalStatus)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="single">{t('tools.carInsurance.single', 'Single')}</option>
                <option value="married">{t('tools.carInsurance.married', 'Married')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.creditScore', 'Credit Score')}</label>
              <select
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value as typeof creditScore)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="excellent">{t('tools.carInsurance.excellent750', 'Excellent (750+)')}</option>
                <option value="good">{t('tools.carInsurance.good700749', 'Good (700-749)')}</option>
                <option value="fair">{t('tools.carInsurance.fair650699', 'Fair (650-699)')}</option>
                <option value="poor">{t('tools.carInsurance.poorBelow650', 'Poor (below 650)')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.drivingRecord', 'Driving Record')}</label>
              <select
                value={drivingRecord}
                onChange={(e) => setDrivingRecord(e.target.value as typeof drivingRecord)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="clean">{t('tools.carInsurance.clean', 'Clean')}</option>
                <option value="minor">{t('tools.carInsurance.minorViolations', 'Minor violations')}</option>
                <option value="major">{t('tools.carInsurance.majorViolationsAccidents', 'Major violations/accidents')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.yearsLicensed', 'Years Licensed')}</label>
              <input
                type="number"
                value={yearsLicensed}
                onChange={(e) => setYearsLicensed(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-teal-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carInsurance.vehicleInformation', 'Vehicle Information')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.vehicleYear', 'Vehicle Year')}</label>
              <input
                type="number"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.vehicleType', 'Vehicle Type')}</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as typeof vehicleType)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="economy">{t('tools.carInsurance.economy', 'Economy')}</option>
                <option value="sedan">{t('tools.carInsurance.sedan', 'Sedan')}</option>
                <option value="suv">{t('tools.carInsurance.suvCrossover', 'SUV/Crossover')}</option>
                <option value="truck">{t('tools.carInsurance.truck', 'Truck')}</option>
                <option value="sports">{t('tools.carInsurance.sportsCar', 'Sports Car')}</option>
                <option value="luxury">{t('tools.carInsurance.luxury', 'Luxury')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.vehicleValue', 'Vehicle Value ($)')}</label>
              <input
                type="number"
                value={vehicleValue}
                onChange={(e) => setVehicleValue(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.annualMileage', 'Annual Mileage')}</label>
              <input
                type="number"
                value={annualMileage}
                onChange={(e) => setAnnualMileage(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safetyFeatures}
                onChange={(e) => setSafetyFeatures(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.carInsurance.safetyFeaturesAbsAirbags', 'Safety features (ABS, airbags)')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={antiTheft}
                onChange={(e) => setAntiTheft(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.carInsurance.antiTheftDevice', 'Anti-theft device')}</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tools.carInsurance.areaType', 'Area Type')}
            </label>
            <select
              value={areaType}
              onChange={(e) => setAreaType(e.target.value as typeof areaType)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="urban">{t('tools.carInsurance.urban', 'Urban')}</option>
              <option value="suburban">{t('tools.carInsurance.suburban', 'Suburban')}</option>
              <option value="rural">{t('tools.carInsurance.rural', 'Rural')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carInsurance.parking', 'Parking')}
            </label>
            <div className="flex gap-2 h-10 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={garageParking}
                  onChange={(e) => setGarageParking(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.carInsurance.garageCoveredParking', 'Garage/Covered parking')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Coverage Options */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Shield className="w-4 h-4 inline mr-1" />
            {t('tools.carInsurance.coverageLevel', 'Coverage Level')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'liability', label: 'Liability Only', desc: 'State minimum' },
              { value: 'standard', label: 'Standard', desc: 'Liability + Collision' },
              { value: 'full', label: 'Full Coverage', desc: 'Comprehensive' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCoverageLevel(opt.value as typeof coverageLevel)}
                className={`p-3 rounded-lg text-left transition-all ${
                  coverageLevel === opt.value
                    ? 'bg-teal-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className={`text-xs ${coverageLevel === opt.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carInsurance.deductible', 'Deductible')}
            </label>
            <div className="flex gap-2">
              {['250', '500', '750', '1000'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDeductible(d)}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    deductible === d
                      ? 'bg-teal-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  ${d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Estimate */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carInsurance.estimatedMonthlyPremium', 'Estimated Monthly Premium')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {formatCurrency(calculations.monthlyPremium)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            6-month: {formatCurrency(calculations.sixMonthPremium)} | Annual: {formatCurrency(calculations.annualPremium)}
          </div>
        </div>

        {/* Applied Discounts */}
        {calculations.appliedDiscounts.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>{t('tools.carInsurance.appliedDiscounts', 'Applied Discounts')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {calculations.appliedDiscounts.map((discount, idx) => (
                <span key={idx} className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                  {discount}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Potential Savings */}
        {calculations.potentialSavings.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-teal-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carInsurance.potentialAnnualSavings', 'Potential Annual Savings')}</h4>
            </div>
            <div className="space-y-2">
              {calculations.potentialSavings.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.item}</span>
                  <span className="text-sm font-medium text-green-500">Save ~{formatCurrency(item.savings)}/yr</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          calculations.riskLevel === 'high'
            ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            : calculations.riskLevel === 'low'
            ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            : isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
        } border`}>
          <AlertTriangle className={`w-5 h-5 ${
            calculations.riskLevel === 'high' ? 'text-red-500'
            : calculations.riskLevel === 'low' ? 'text-green-500'
            : 'text-yellow-500'
          }`} />
          <div>
            <div className={`font-medium ${
              calculations.riskLevel === 'high' ? 'text-red-500'
              : calculations.riskLevel === 'low' ? 'text-green-500'
              : 'text-yellow-500'
            }`}>
              {calculations.riskLevel === 'high' ? 'Higher Risk Profile'
              : calculations.riskLevel === 'low' ? t('tools.carInsurance.lowerRiskProfile', 'Lower Risk Profile') : t('tools.carInsurance.averageRiskProfile', 'Average Risk Profile')}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.riskLevel === 'high'
                ? 'Based on age, driving record, or vehicle type'
                : calculations.riskLevel === 'low'
                ? t('tools.carInsurance.cleanRecordAndFavorableFactors', 'Clean record and favorable factors') : t('tools.carInsurance.standardPremiumCalculationApplies', 'Standard premium calculation applies')}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.carInsurance.saveOnInsurance', 'Save on Insurance:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.carInsurance.bundleHomeAndAutoInsurance', 'Bundle home and auto insurance for multi-policy discount')}</li>
                <li>{t('tools.carInsurance.askAboutGoodStudentDiscounts', 'Ask about good student discounts (under 25)')}</li>
                <li>{t('tools.carInsurance.completeDefensiveDrivingCoursesFor', 'Complete defensive driving courses for additional savings')}</li>
                <li>{t('tools.carInsurance.compareQuotesFromMultipleInsurers', 'Compare quotes from multiple insurers')}</li>
                <li>{t('tools.carInsurance.reviewAndUpdateYourCoverage', 'Review and update your coverage annually')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarInsuranceTool;
