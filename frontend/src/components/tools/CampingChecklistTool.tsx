import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tent, CloudSun, Users, Clock, Package, Utensils, Heart, Info, Flame, Compass } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type TripType = 'car-camping' | 'backpacking' | 'glamping';
type WeatherCondition = 'sunny' | 'rainy' | 'cold' | 'hot' | 'mixed';

interface ChecklistItem {
  id: string;
  name: string;
  essential: boolean;
  quantity?: number;
}

interface ChecklistCategory {
  name: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

interface CampingChecklistToolProps {
  uiConfig?: UIConfig;
}

export const CampingChecklistTool: React.FC<CampingChecklistToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tripType, setTripType] = useState<TripType>('car-camping');
  const [duration, setDuration] = useState('2');
  const [groupSize, setGroupSize] = useState('2');
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('shelter');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      if (params.tripType) {
        setTripType(params.tripType as TripType);
      }
      if (params.duration !== undefined) {
        setDuration(String(params.duration));
      }
      if (params.groupSize !== undefined) {
        setGroupSize(String(params.groupSize));
      }
      if (params.weather) {
        setWeather(params.weather as WeatherCondition);
      }
    }
  }, [uiConfig?.params]);

  const tripTypes = {
    'car-camping': {
      name: 'Car Camping',
      description: 'Drive to campsite, more gear flexibility',
      icon: <Tent className="w-4 h-4" />,
    },
    'backpacking': {
      name: 'Backpacking',
      description: 'Lightweight, carry everything on your back',
      icon: <Compass className="w-4 h-4" />,
    },
    'glamping': {
      name: 'Glamping',
      description: 'Glamorous camping, comfort-focused',
      icon: <Flame className="w-4 h-4" />,
    },
  };

  const weatherConditions = {
    sunny: { name: 'Sunny', emoji: '☀️' },
    rainy: { name: 'Rainy', emoji: '🌧️' },
    cold: { name: 'Cold', emoji: '❄️' },
    hot: { name: 'Hot', emoji: '🔥' },
    mixed: { name: 'Mixed', emoji: '⛅' },
  };

  const generateChecklist = useMemo((): Record<string, ChecklistCategory> => {
    const days = parseInt(duration) || 1;
    const people = parseInt(groupSize) || 1;
    const isBackpacking = tripType === 'backpacking';
    const isGlamping = tripType === 'glamping';

    const baseChecklist: Record<string, ChecklistCategory> = {
      shelter: {
        name: 'Shelter & Sleep',
        icon: <Tent className="w-4 h-4" />,
        items: [
          { id: 'tent', name: `Tent (${people}-person or larger)`, essential: true },
          { id: 'sleeping-bag', name: 'Sleeping bag', essential: true, quantity: people },
          { id: 'sleeping-pad', name: 'Sleeping pad/mattress', essential: true, quantity: people },
          { id: 'pillow', name: 'Camping pillow', essential: false, quantity: people },
          { id: 'tent-footprint', name: 'Tent footprint/ground cloth', essential: false },
          { id: 'stakes', name: 'Extra tent stakes', essential: false },
          { id: 'repair-kit', name: 'Tent repair kit', essential: false },
        ],
      },
      cooking: {
        name: 'Cooking & Food',
        icon: <Utensils className="w-4 h-4" />,
        items: [
          { id: 'stove', name: isBackpacking ? 'Backpacking stove' : 'Camp stove', essential: true },
          { id: 'fuel', name: 'Stove fuel', essential: true },
          { id: 'cookware', name: isBackpacking ? 'Lightweight pot/pan' : 'Cookware set', essential: true },
          { id: 'utensils', name: 'Cooking utensils', essential: true },
          { id: 'plates', name: 'Plates/bowls', essential: true, quantity: people },
          { id: 'cups', name: 'Cups/mugs', essential: true, quantity: people },
          { id: 'cutlery', name: 'Eating utensils', essential: true, quantity: people },
          { id: 'cooler', name: 'Cooler with ice', essential: !isBackpacking },
          { id: 'water-container', name: 'Water container/bottles', essential: true },
          { id: 'water-filter', name: 'Water filter/purification', essential: isBackpacking },
          { id: 'food-storage', name: 'Bear canister/food bag', essential: true },
          { id: 'trash-bags', name: 'Trash bags', essential: true },
          { id: 'dish-soap', name: 'Biodegradable dish soap', essential: true },
          { id: 'sponge', name: 'Scrub sponge', essential: false },
        ],
      },
      clothing: {
        name: 'Clothing',
        icon: <Package className="w-4 h-4" />,
        items: [
          { id: 'base-layers', name: 'Base layers', essential: weather === 'cold', quantity: days },
          { id: 'hiking-pants', name: 'Hiking pants/shorts', essential: true, quantity: Math.ceil(days / 2) },
          { id: 't-shirts', name: 'T-shirts/tops', essential: true, quantity: days },
          { id: 'warm-layer', name: 'Warm layer (fleece/down)', essential: weather !== 'hot' },
          { id: 'rain-jacket', name: 'Rain jacket', essential: weather === 'rainy' || weather === 'mixed' },
          { id: 'rain-pants', name: 'Rain pants', essential: weather === 'rainy' },
          { id: 'hiking-boots', name: 'Hiking boots/shoes', essential: true },
          { id: 'camp-shoes', name: 'Camp shoes/sandals', essential: false },
          { id: 'socks', name: 'Hiking socks', essential: true, quantity: days + 1 },
          { id: 'underwear', name: 'Underwear', essential: true, quantity: days + 1 },
          { id: 'hat', name: weather === 'cold' ? 'Warm beanie' : 'Sun hat', essential: true },
          { id: 'gloves', name: 'Gloves', essential: weather === 'cold' },
          { id: 'sunglasses', name: 'Sunglasses', essential: weather === 'sunny' || weather === 'hot' },
          { id: 'sleepwear', name: 'Sleepwear', essential: true },
        ],
      },
      firstAid: {
        name: 'First Aid & Safety',
        icon: <Heart className="w-4 h-4" />,
        items: [
          { id: 'first-aid-kit', name: 'First aid kit', essential: true },
          { id: 'medications', name: 'Personal medications', essential: true },
          { id: 'pain-relievers', name: 'Pain relievers (ibuprofen/acetaminophen)', essential: true },
          { id: 'antihistamines', name: 'Antihistamines', essential: true },
          { id: 'bandages', name: 'Bandages & gauze', essential: true },
          { id: 'antiseptic', name: 'Antiseptic wipes/spray', essential: true },
          { id: 'sunscreen', name: 'Sunscreen (SPF 30+)', essential: true },
          { id: 'bug-spray', name: 'Insect repellent', essential: true },
          { id: 'blister-kit', name: 'Blister treatment', essential: isBackpacking },
          { id: 'emergency-blanket', name: 'Emergency blanket', essential: true },
          { id: 'whistle', name: 'Emergency whistle', essential: true },
          { id: 'knife', name: 'Multi-tool/knife', essential: true },
          { id: 'fire-starter', name: 'Fire starter/matches', essential: true },
          { id: 'headlamp', name: 'Headlamp/flashlight', essential: true, quantity: people },
          { id: 'extra-batteries', name: 'Extra batteries', essential: true },
        ],
      },
      navigation: {
        name: 'Navigation & Tools',
        icon: <Compass className="w-4 h-4" />,
        items: [
          { id: 'map', name: 'Trail map', essential: isBackpacking },
          { id: 'compass', name: 'Compass', essential: isBackpacking },
          { id: 'gps', name: 'GPS device/phone with offline maps', essential: true },
          { id: 'power-bank', name: 'Portable power bank', essential: true },
          { id: 'trekking-poles', name: 'Trekking poles', essential: false, quantity: people },
          { id: 'rope', name: 'Paracord/rope', essential: false },
          { id: 'duct-tape', name: 'Duct tape', essential: true },
          { id: 'carabiners', name: 'Carabiners', essential: false },
        ],
      },
      hygiene: {
        name: 'Hygiene & Personal',
        icon: <Package className="w-4 h-4" />,
        items: [
          { id: 'toothbrush', name: 'Toothbrush & toothpaste', essential: true },
          { id: 'toilet-paper', name: 'Toilet paper', essential: true },
          { id: 'hand-sanitizer', name: 'Hand sanitizer', essential: true },
          { id: 'trowel', name: 'Trowel (for cat holes)', essential: isBackpacking },
          { id: 'camp-towel', name: 'Quick-dry towel', essential: true },
          { id: 'soap', name: 'Biodegradable soap', essential: true },
          { id: 'deodorant', name: 'Deodorant', essential: false },
          { id: 'lip-balm', name: 'Lip balm with SPF', essential: true },
          { id: 'wet-wipes', name: 'Wet wipes', essential: !isBackpacking },
        ],
      },
      food: {
        name: 'Food Planning',
        icon: <Utensils className="w-4 h-4" />,
        items: [
          { id: 'breakfast', name: `Breakfast items (${days} days)`, essential: true },
          { id: 'lunch', name: `Lunch items (${days} days)`, essential: true },
          { id: 'dinner', name: `Dinner items (${days} days)`, essential: true },
          { id: 'snacks', name: 'Trail snacks (nuts, bars, dried fruit)', essential: true },
          { id: 'coffee-tea', name: 'Coffee/tea', essential: false },
          { id: 'condiments', name: 'Salt, pepper, spices', essential: false },
          { id: 'cooking-oil', name: 'Cooking oil', essential: false },
          { id: 'emergency-food', name: 'Emergency food (extra day)', essential: isBackpacking },
        ],
      },
    };

    // Add glamping-specific items
    if (isGlamping) {
      baseChecklist.comfort = {
        name: 'Comfort & Luxury',
        icon: <Flame className="w-4 h-4" />,
        items: [
          { id: 'air-mattress', name: 'Air mattress', essential: false },
          { id: 'camp-chairs', name: 'Comfortable camp chairs', essential: false, quantity: people },
          { id: 'camp-table', name: 'Camp table', essential: false },
          { id: 'string-lights', name: 'String lights/lanterns', essential: false },
          { id: 'bluetooth-speaker', name: 'Bluetooth speaker', essential: false },
          { id: 'camp-rug', name: 'Camp rug', essential: false },
          { id: 'wine-opener', name: 'Wine opener', essential: false },
          { id: 'hammock', name: 'Hammock', essential: false },
          { id: 'books-games', name: 'Books/games', essential: false },
        ],
      };
    }

    // Add weather-specific items
    if (weather === 'rainy' || weather === 'mixed') {
      baseChecklist.shelter.items.push(
        { id: 'tarp', name: 'Tarp/rain fly', essential: true },
        { id: 'dry-bags', name: 'Dry bags', essential: true }
      );
    }

    if (weather === 'cold') {
      baseChecklist.shelter.items.push(
        { id: 'hot-water-bottle', name: 'Hot water bottle', essential: false },
        { id: 'hand-warmers', name: 'Hand/toe warmers', essential: false }
      );
    }

    return baseChecklist;
  }, [tripType, duration, groupSize, weather]);

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const categories = Object.keys(generateChecklist);
  const currentCategory = generateChecklist[activeCategory];

  const totalItems = useMemo(() => {
    return Object.values(generateChecklist).reduce((sum, cat) => sum + cat.items.length, 0);
  }, [generateChecklist]);

  const essentialItems = useMemo(() => {
    return Object.values(generateChecklist).reduce(
      (sum, cat) => sum + cat.items.filter((item) => item.essential).length,
      0
    );
  }, [generateChecklist]);

  const checkedCount = checkedItems.size;
  const progressPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const checkAllInCategory = () => {
    const newChecked = new Set(checkedItems);
    currentCategory.items.forEach((item) => newChecked.add(item.id));
    setCheckedItems(newChecked);
  };

  const uncheckAllInCategory = () => {
    const newChecked = new Set(checkedItems);
    currentCategory.items.forEach((item) => newChecked.delete(item.id));
    setCheckedItems(newChecked);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Tent className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.campingChecklist.campingChecklistGenerator', 'Camping Checklist Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.campingChecklist.neverForgetEssentialGearAgain', 'Never forget essential gear again')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Trip Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.campingChecklist.tripType', 'Trip Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(tripTypes) as TripType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTripType(type)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  tripType === type
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tripTypes[type].icon}
                <span className="font-medium">{tripTypes[type].name}</span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {tripTypes[tripType].description}
          </p>
        </div>

        {/* Duration & Group Size */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.campingChecklist.durationNights', 'Duration (nights)')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setDuration(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    parseInt(duration) === n
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.campingChecklist.groupSize', 'Group Size')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 4, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setGroupSize(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    parseInt(groupSize) === n
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
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
        </div>

        {/* Weather Conditions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <CloudSun className="w-4 h-4 inline mr-1" />
            {t('tools.campingChecklist.expectedWeather', 'Expected Weather')}
          </label>
          <div className="flex gap-2">
            {(Object.keys(weatherConditions) as WeatherCondition[]).map((w) => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={`flex-1 py-2 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  weather === w
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{weatherConditions[w].emoji}</span>
                <span>{weatherConditions[w].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.campingChecklist.packingProgress', 'Packing Progress')}</span>
            <span className="text-teal-500 font-bold">{progressPercentage}%</span>
          </div>
          <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-2 rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {checkedCount} of {totalItems} items checked ({essentialItems} essential)
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map((cat) => {
              const category = generateChecklist[cat];
              const catChecked = category.items.filter((item) => checkedItems.has(item.id)).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat
                      ? 'bg-white/20'
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}>
                    {catChecked}/{category.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Checklist Items */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentCategory.icon}
              {currentCategory.name}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={checkAllInCategory}
                className={`text-xs px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.campingChecklist.checkAll', 'Check All')}
              </button>
              <button
                onClick={uncheckAllInCategory}
                className={`text-xs px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.campingChecklist.uncheckAll', 'Uncheck All')}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {currentCategory.items.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  checkedItems.has(item.id)
                    ? isDark
                      ? 'bg-teal-900/30'
                      : 'bg-teal-100'
                    : isDark
                    ? 'bg-gray-700/50 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <span className={`${checkedItems.has(item.id) ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  {item.quantity && item.quantity > 1 && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      x{item.quantity}
                    </span>
                  )}
                </div>
                {item.essential && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-500">
                    {t('tools.campingChecklist.essential', 'Essential')}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Trip Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.campingChecklist.tripSummary', 'Trip Summary')}</div>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {tripTypes[tripType].name} - {duration} night{parseInt(duration) !== 1 ? 's' : ''} - {groupSize} {parseInt(groupSize) === 1 ? 'person' : 'people'}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {weatherConditions[weather].emoji} {weatherConditions[weather].name} conditions
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.campingChecklist.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Pack essential items first, then add comfort items</li>
                <li>- Test all gear before your trip</li>
                <li>- Layer clothing for temperature changes</li>
                <li>- Always tell someone your itinerary</li>
                <li>- Leave no trace - pack out all trash</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampingChecklistTool;
