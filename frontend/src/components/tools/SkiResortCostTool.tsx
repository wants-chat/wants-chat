import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, Users, Calendar, DollarSign, Car, Home, Utensils, Ticket, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface SkiResortCostToolProps {
  uiConfig?: UIConfig;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type LodgingType = 'budget' | 'mid-range' | 'luxury' | 'airbnb';
type RentalOption = 'none' | 'basic' | 'premium' | 'demo';

export const SkiResortCostTool: React.FC<SkiResortCostToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [groupSize, setGroupSize] = useState('2');
  const [days, setDays] = useState('3');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [lodgingType, setLodgingType] = useState<LodgingType>('mid-range');
  const [rentalOption, setRentalOption] = useState<RentalOption>('basic');
  const [needLessons, setNeedLessons] = useState(false);
  const [drivingDistance, setDrivingDistance] = useState('200');
  const [liftTicketPrice, setLiftTicketPrice] = useState('150');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      if (params.groupSize !== undefined) {
        setGroupSize(String(params.groupSize));
      }
      if (params.days !== undefined) {
        setDays(String(params.days));
      }
    }
  }, [uiConfig?.params]);

  const lodgingPrices = {
    budget: { name: 'Budget Hotel/Hostel', pricePerNight: 80, description: 'Basic accommodations, may be off-mountain' },
    'mid-range': { name: 'Mid-Range Hotel', pricePerNight: 180, description: 'Comfortable hotels near resort' },
    luxury: { name: 'Luxury Resort', pricePerNight: 400, description: 'Ski-in/ski-out, premium amenities' },
    airbnb: { name: 'Vacation Rental', pricePerNight: 250, description: 'Condo or house with kitchen' },
  };

  const rentalPrices = {
    none: { name: 'Own Equipment', daily: 0, description: 'Bring your own gear' },
    basic: { name: 'Basic Rental', daily: 45, description: 'Standard skis/snowboard, boots, poles' },
    premium: { name: 'Premium Rental', daily: 75, description: 'Higher-end equipment' },
    demo: { name: 'Demo Equipment', daily: 100, description: 'Latest high-performance gear' },
  };

  const skillLevels = {
    beginner: { name: 'Beginner', lessonPrice: 150, description: 'First time or few days experience' },
    intermediate: { name: 'Intermediate', lessonPrice: 120, description: 'Can ski blue runs confidently' },
    advanced: { name: 'Advanced', lessonPrice: 100, description: 'Comfortable on black runs' },
    expert: { name: 'Expert', lessonPrice: 0, description: 'Double blacks and off-piste' },
  };

  const resortPresets = [
    { name: 'Vail, CO', liftPrice: 220, distance: 100 },
    { name: 'Park City, UT', liftPrice: 185, distance: 35 },
    { name: 'Whistler, BC', liftPrice: 195, distance: 75 },
    { name: 'Jackson Hole, WY', liftPrice: 175, distance: 275 },
    { name: 'Big Sky, MT', liftPrice: 160, distance: 45 },
  ];

  const calculation = useMemo(() => {
    const people = parseInt(groupSize) || 1;
    const numDays = parseInt(days) || 1;
    const distance = parseFloat(drivingDistance) || 0;
    const liftPrice = parseFloat(liftTicketPrice) || 0;

    // Lift tickets (total for all people, all days)
    const liftTicketsCost = liftPrice * people * numDays;

    // Lodging (per night, shared among group)
    const nights = numDays - 1 > 0 ? numDays - 1 : numDays;
    const lodgingPerNight = lodgingPrices[lodgingType].pricePerNight;
    const lodgingCost = lodgingPerNight * nights;

    // Equipment rental (per person per day)
    const rentalPerDay = rentalPrices[rentalOption].daily;
    const rentalCost = rentalPerDay * people * numDays;

    // Lessons (per person if needed)
    const lessonCost = needLessons ? skillLevels[skillLevel].lessonPrice * people : 0;

    // Transportation (round trip, gas estimate ~$0.15/mile)
    const gasPrice = 0.15;
    const transportCost = distance * 2 * gasPrice;

    // Food estimate ($50-100 per person per day on mountain)
    const foodPerDay = lodgingType === 'luxury' ? 100 : lodgingType === 'mid-range' ? 75 : 50;
    const foodCost = foodPerDay * people * numDays;

    // Extras (parking, tips, etc. ~10% of base costs)
    const baseCost = liftTicketsCost + lodgingCost + rentalCost + lessonCost + transportCost + foodCost;
    const extrasCost = baseCost * 0.1;

    const totalCost = baseCost + extrasCost;
    const costPerPerson = totalCost / people;
    const costPerDay = totalCost / numDays;

    return {
      liftTicketsCost,
      lodgingCost,
      rentalCost,
      lessonCost,
      transportCost,
      foodCost,
      extrasCost,
      totalCost,
      costPerPerson,
      costPerDay,
    };
  }, [groupSize, days, lodgingType, rentalOption, needLessons, skillLevel, drivingDistance, liftTicketPrice]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const costBreakdown = [
    { label: 'Lift Tickets', value: calculation.liftTicketsCost, icon: <Ticket className="w-4 h-4" />, color: 'text-teal-500' },
    { label: 'Lodging', value: calculation.lodgingCost, icon: <Home className="w-4 h-4" />, color: 'text-blue-500' },
    { label: 'Equipment Rental', value: calculation.rentalCost, icon: <Mountain className="w-4 h-4" />, color: 'text-purple-500' },
    { label: 'Food & Drinks', value: calculation.foodCost, icon: <Utensils className="w-4 h-4" />, color: 'text-orange-500' },
    { label: 'Transportation', value: calculation.transportCost, icon: <Car className="w-4 h-4" />, color: 'text-green-500' },
    { label: 'Lessons', value: calculation.lessonCost, icon: <Users className="w-4 h-4" />, color: 'text-pink-500' },
    { label: 'Extras (tips, parking)', value: calculation.extrasCost, icon: <DollarSign className="w-4 h-4" />, color: 'text-gray-500' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Mountain className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiResortCost.skiTripCostCalculator', 'Ski Trip Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiResortCost.estimateYourTotalSkiVacation', 'Estimate your total ski vacation budget')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Group Size & Days */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" /> Group Size
            </label>
            <div className="flex gap-2">
              {[1, 2, 4, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setGroupSize(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseInt(groupSize) === n ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" /> Trip Duration (days)
            </label>
            <div className="flex gap-2">
              {[2, 3, 5, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setDays(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseInt(days) === n ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Resort Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.skiResortCost.popularResortsClickToSet', 'Popular Resorts (click to set prices)')}
          </label>
          <div className="flex flex-wrap gap-2">
            {resortPresets.map((resort) => (
              <button
                key={resort.name}
                onClick={() => {
                  setLiftTicketPrice(resort.liftPrice.toString());
                  setDrivingDistance(resort.distance.toString());
                }}
                className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {resort.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lift Ticket & Distance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ticket className="w-4 h-4 inline mr-1" /> Lift Ticket Price/Day
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={liftTicketPrice}
                onChange={(e) => setLiftTicketPrice(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Car className="w-4 h-4 inline mr-1" /> Distance to Resort (miles)
            </label>
            <input
              type="number"
              value={drivingDistance}
              onChange={(e) => setDrivingDistance(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Lodging Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" /> Lodging Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(lodgingPrices) as LodgingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setLodgingType(type)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  lodgingType === type
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{lodgingPrices[type].name}</span>
                <span className="text-xs opacity-75">{formatCurrency(lodgingPrices[type].pricePerNight)}/night</span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Rental */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.skiResortCost.equipmentRental', 'Equipment Rental')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(rentalPrices) as RentalOption[]).map((option) => (
              <button
                key={option}
                onClick={() => setRentalOption(option)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  rentalOption === option
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{rentalPrices[option].name}</span>
                <span className="text-xs opacity-75">
                  {rentalPrices[option].daily === 0 ? 'Free' : `${formatCurrency(rentalPrices[option].daily)}/day`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Skill Level & Lessons */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.skiResortCost.skillLevel', 'Skill Level')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(skillLevels) as SkillLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`py-2 px-3 rounded-lg text-sm ${
                    skillLevel === level
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {skillLevels[level].name}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={needLessons}
                onChange={(e) => setNeedLessons(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.skiResortCost.includeSkiSnowboardLessons', 'Include Ski/Snowboard Lessons')}
                </span>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Group lesson: ~{formatCurrency(skillLevels[skillLevel].lessonPrice)} per person
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Total Cost */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {groupSize} {parseInt(groupSize) === 1 ? 'person' : 'people'} x {days} days
          </div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {formatCurrency(calculation.totalCost)}
          </div>
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.skiResortCost.totalEstimatedCost', 'total estimated cost')}</div>
          <div className="flex justify-center gap-6 mt-3">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="font-medium text-teal-500">{formatCurrency(calculation.costPerPerson)}</span> per person
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="font-medium text-teal-500">{formatCurrency(calculation.costPerDay)}</span> per day
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiResortCost.costBreakdown', 'Cost Breakdown')}</h4>
          <div className="space-y-3">
            {costBreakdown.filter(item => item.value > 0).map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={item.color}>{item.icon}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiResortCost.total', 'Total')}</span>
              <span className="font-bold text-teal-500 text-lg">{formatCurrency(calculation.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Money Saving Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.skiResortCost.moneySavingTips', 'Money-Saving Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Buy multi-day lift tickets for significant discounts</li>
                <li>- Book lodging with kitchen to save on food costs</li>
                <li>- Rent equipment in town instead of at the resort</li>
                <li>- Ski midweek for lower prices and fewer crowds</li>
                <li>- Look for early season or spring deals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkiResortCostTool;
