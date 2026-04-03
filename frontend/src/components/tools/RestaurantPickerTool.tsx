import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, Shuffle, DollarSign, MapPin, Clock, Star, RefreshCw, Heart, Plus, Trash2, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface RestaurantPickerToolProps {
  uiConfig?: UIConfig;
}

type CuisineType = 'american' | 'italian' | 'mexican' | 'chinese' | 'japanese' | 'indian' | 'thai' | 'mediterranean' | 'fast-food' | 'other';
type PriceRange = '$' | '$$' | '$$$' | '$$$$';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'any';

interface Restaurant {
  id: string;
  name: string;
  cuisine: CuisineType;
  priceRange: PriceRange;
  rating: number;
  distance: string;
  isUserAdded?: boolean;
}

const defaultRestaurants: Restaurant[] = [
  { id: '1', name: 'The Cozy Corner Cafe', cuisine: 'american', priceRange: '$$', rating: 4.5, distance: '0.5 mi' },
  { id: '2', name: 'Bella Italia', cuisine: 'italian', priceRange: '$$$', rating: 4.7, distance: '1.2 mi' },
  { id: '3', name: 'Taco Fiesta', cuisine: 'mexican', priceRange: '$', rating: 4.2, distance: '0.8 mi' },
  { id: '4', name: 'Golden Dragon', cuisine: 'chinese', priceRange: '$$', rating: 4.3, distance: '1.5 mi' },
  { id: '5', name: 'Sakura Sushi', cuisine: 'japanese', priceRange: '$$$', rating: 4.8, distance: '2.0 mi' },
  { id: '6', name: 'Taj Palace', cuisine: 'indian', priceRange: '$$', rating: 4.4, distance: '1.8 mi' },
  { id: '7', name: 'Thai Orchid', cuisine: 'thai', priceRange: '$$', rating: 4.6, distance: '1.3 mi' },
  { id: '8', name: 'Mediterranean Grill', cuisine: 'mediterranean', priceRange: '$$$', rating: 4.5, distance: '0.9 mi' },
  { id: '9', name: 'Quick Bites', cuisine: 'fast-food', priceRange: '$', rating: 3.8, distance: '0.3 mi' },
  { id: '10', name: 'Burger Palace', cuisine: 'american', priceRange: '$', rating: 4.0, distance: '0.6 mi' },
  { id: '11', name: 'Pasta Paradise', cuisine: 'italian', priceRange: '$$', rating: 4.4, distance: '1.1 mi' },
  { id: '12', name: 'El Mariachi', cuisine: 'mexican', priceRange: '$$', rating: 4.6, distance: '1.4 mi' },
  { id: '13', name: 'Panda Express', cuisine: 'chinese', priceRange: '$', rating: 3.9, distance: '0.4 mi' },
  { id: '14', name: 'Ramen House', cuisine: 'japanese', priceRange: '$$', rating: 4.5, distance: '1.7 mi' },
  { id: '15', name: 'Curry House', cuisine: 'indian', priceRange: '$$', rating: 4.3, distance: '2.2 mi' },
];

export const RestaurantPickerTool: React.FC<RestaurantPickerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [restaurants, setRestaurants] = useState<Restaurant[]>(defaultRestaurants);
  const [selectedCuisines, setSelectedCuisines] = useState<Set<CuisineType>>(new Set());
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<Set<PriceRange>>(new Set());
  const [mealType, setMealType] = useState<MealType>('any');
  const [minRating, setMinRating] = useState(0);
  const [pickedRestaurant, setPickedRestaurant] = useState<Restaurant | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: 'other' as CuisineType, priceRange: '$$' as PriceRange });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      if (params.cuisine) {
        setSelectedCuisines(new Set([params.cuisine as CuisineType]));
      }
      if (params.mealType) {
        setMealType(params.mealType as MealType);
      }
    }
  }, [uiConfig?.params]);

  const cuisines: { id: CuisineType; name: string; emoji: string }[] = [
    { id: 'american', name: 'American', emoji: '🍔' },
    { id: 'italian', name: 'Italian', emoji: '🍝' },
    { id: 'mexican', name: 'Mexican', emoji: '🌮' },
    { id: 'chinese', name: 'Chinese', emoji: '🥡' },
    { id: 'japanese', name: 'Japanese', emoji: '🍣' },
    { id: 'indian', name: 'Indian', emoji: '🍛' },
    { id: 'thai', name: 'Thai', emoji: '🍜' },
    { id: 'mediterranean', name: 'Mediterranean', emoji: '🥙' },
    { id: 'fast-food', name: 'Fast Food', emoji: '🍟' },
    { id: 'other', name: 'Other', emoji: '🍽️' },
  ];

  const priceRanges: PriceRange[] = ['$', '$$', '$$$', '$$$$'];

  const mealTypes: { id: MealType; name: string }[] = [
    { id: 'any', name: 'Any Meal' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
  ];

  const toggleCuisine = (cuisine: CuisineType) => {
    setSelectedCuisines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cuisine)) {
        newSet.delete(cuisine);
      } else {
        newSet.add(cuisine);
      }
      return newSet;
    });
  };

  const togglePriceRange = (price: PriceRange) => {
    setSelectedPriceRanges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(price)) {
        newSet.delete(price);
      } else {
        newSet.add(price);
      }
      return newSet;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addRestaurant = () => {
    if (!newRestaurant.name.trim()) return;

    const restaurant: Restaurant = {
      id: `user-${Date.now()}`,
      name: newRestaurant.name,
      cuisine: newRestaurant.cuisine,
      priceRange: newRestaurant.priceRange,
      rating: 4.0,
      distance: 'Nearby',
      isUserAdded: true,
    };

    setRestaurants((prev) => [...prev, restaurant]);
    setNewRestaurant({ name: '', cuisine: 'other', priceRange: '$$' });
    setShowAddForm(false);
  };

  const removeRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // Cuisine filter
      if (selectedCuisines.size > 0 && !selectedCuisines.has(restaurant.cuisine)) {
        return false;
      }

      // Price range filter
      if (selectedPriceRanges.size > 0 && !selectedPriceRanges.has(restaurant.priceRange)) {
        return false;
      }

      // Rating filter
      if (restaurant.rating < minRating) {
        return false;
      }

      return true;
    });
  }, [restaurants, selectedCuisines, selectedPriceRanges, minRating]);

  const pickRandomRestaurant = useCallback(() => {
    if (filteredRestaurants.length === 0) return;

    setIsSpinning(true);
    setPickedRestaurant(null);

    let spins = 0;
    const maxSpins = 15;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
      setPickedRestaurant(filteredRestaurants[randomIndex]);
      spins++;

      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
      }
    }, 100);
  }, [filteredRestaurants]);

  const clearFilters = () => {
    setSelectedCuisines(new Set());
    setSelectedPriceRanges(new Set());
    setMealType('any');
    setMinRating(0);
  };

  const getCuisineEmoji = (cuisine: CuisineType) => {
    return cuisines.find((c) => c.id === cuisine)?.emoji || '🍽️';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Utensils className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.restaurantPicker.randomRestaurantPicker', 'Random Restaurant Picker')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.restaurantPicker.endTheWhereShouldWe', 'End the "where should we eat?" debate')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cuisine Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.restaurantPicker.cuisineTypes', 'Cuisine Types')}
          </label>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => toggleCuisine(cuisine.id)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${
                  selectedCuisines.has(cuisine.id)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{cuisine.emoji}</span>
                <span>{cuisine.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" /> Price Range
          </label>
          <div className="flex gap-2">
            {priceRanges.map((price) => (
              <button
                key={price}
                onClick={() => togglePriceRange(price)}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  selectedPriceRanges.has(price)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" /> Meal Type
          </label>
          <div className="flex gap-2">
            {mealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setMealType(meal.id)}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  mealType === meal.id
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {meal.name}
              </button>
            ))}
          </div>
        </div>

        {/* Min Rating */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Star className="w-4 h-4 inline mr-1" /> Minimum Rating: {minRating}+
          </label>
          <input
            type="range"
            min="0"
            max="4.5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        {/* Add Custom Restaurant */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {showAddForm ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t('tools.restaurantPicker.restaurantName', 'Restaurant name')}
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newRestaurant.cuisine}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value as CuisineType })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {cuisines.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={newRestaurant.priceRange}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, priceRange: e.target.value as PriceRange })}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {priceRanges.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addRestaurant}
                  className="flex-1 py-2 rounded-lg bg-teal-500 text-white font-medium"
                >
                  {t('tools.restaurantPicker.addRestaurant', 'Add Restaurant')}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {t('tools.restaurantPicker.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.restaurantPicker.addCustomRestaurant', 'Add Custom Restaurant')}
            </button>
          )}
        </div>

        {/* Clear Filters & Pick Button */}
        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.restaurantPicker.clearFilters', 'Clear Filters')}
          </button>
          <button
            onClick={pickRandomRestaurant}
            disabled={filteredRestaurants.length === 0 || isSpinning}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              filteredRestaurants.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            } ${isSpinning ? 'animate-pulse' : ''}`}
          >
            {isSpinning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Shuffle className="w-5 h-5" />
            )}
            {isSpinning ? 'Picking...' : `Pick from ${filteredRestaurants.length} restaurants`}
          </button>
        </div>

        {/* Picked Restaurant Result */}
        {pickedRestaurant && (
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCuisineEmoji(pickedRestaurant.cuisine)}</span>
                <div>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {pickedRestaurant.name}
                  </h4>
                  <p className={`text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {pickedRestaurant.cuisine.replace('-', ' ')} Cuisine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pickedRestaurant.isUserAdded && (
                  <button
                    onClick={() => removeRestaurant(pickedRestaurant.id)}
                    className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-400'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => toggleFavorite(pickedRestaurant.id)}
                  className={`p-2 rounded-lg ${
                    favorites.has(pickedRestaurant.id)
                      ? 'text-red-500'
                      : isDark
                      ? 'text-gray-400 hover:text-red-400'
                      : 'text-gray-500 hover:text-red-400'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={favorites.has(pickedRestaurant.id) ? t('tools.restaurantPicker.currentcolor', 'currentColor') : 'none'} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{pickedRestaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-teal-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{pickedRestaurant.distance}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                {pickedRestaurant.priceRange}
              </span>
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.size > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              Favorite Spots ({favorites.size})
            </h4>
            <div className="flex flex-wrap gap-2">
              {restaurants
                .filter((r) => favorites.has(r.id))
                .map((restaurant) => (
                  <span
                    key={restaurant.id}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {getCuisineEmoji(restaurant.cuisine)} {restaurant.name}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* User Added Restaurants */}
        {restaurants.some((r) => r.isUserAdded) && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.restaurantPicker.yourCustomRestaurants', 'Your Custom Restaurants')}
            </h4>
            <div className="space-y-2">
              {restaurants
                .filter((r) => r.isUserAdded)
                .map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getCuisineEmoji(restaurant.cuisine)}</span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{restaurant.name}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{restaurant.priceRange}</span>
                    </div>
                    <button
                      onClick={() => removeRestaurant(restaurant.id)}
                      className={`p-1 rounded ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-400'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.restaurantPicker.tip', 'Tip:')}</strong> Add your favorite local restaurants to personalize your picks.
              Use filters to narrow down options, or leave them empty for maximum variety!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPickerTool;
