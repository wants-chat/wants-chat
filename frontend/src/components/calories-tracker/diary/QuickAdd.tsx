import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { mdiMagnify, mdiBarcode, mdiStar, mdiStarOutline, mdiPlus, mdiHeart } from '@mdi/js';
import { Food } from '../food-search/FoodItem';
import { useAuth } from '../../../contexts/AuthContext';
import caloriesApi from '../../../services/caloriesApi';

interface QuickAddProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onScan: () => void;
  onSelectFood: (food: Food, meal?: string) => void;
  selectedDate: Date;
}

const QuickAdd: React.FC<QuickAddProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  onScan,
  onSelectFood
}) => {
  const { isAuthenticated } = useAuth();
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);


  const meals = [
    { id: 'breakfast', name: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', name: 'Lunch', emoji: '☀️' },
    { id: 'dinner', name: 'Dinner', emoji: '🌙' },
    { id: 'snack', name: 'Snacks', emoji: '🍎' }
  ];

  useEffect(() => {
    loadFavoriteFoods();
    loadCustomFoods();
  }, [isAuthenticated]);

  const loadFavoriteFoods = async () => {
    if (isAuthenticated) {
      try {
        const apiResults = await caloriesApi.getFavoriteFoods();
        const convertedResults: Food[] = apiResults.foods.map((apiFood: any) => ({
          id: apiFood.id,
          name: apiFood.name,
          brand: apiFood.brand,
          category: apiFood.category || 'other',
          calories: Math.round(apiFood.calories_per_100g),
          protein: apiFood.protein_per_100g,
          carbs: apiFood.carbs_per_100g,
          fat: apiFood.fat_per_100g,
          fiber: apiFood.fiber_per_100g,
          sugar: apiFood.sugar_per_100g,
          sodium: apiFood.sodium_per_100g,
          servingSize: 100,
          servingUnit: 'g',
          barcode: apiFood.barcode,
          isCustom: apiFood.is_custom,
          isFavorite: true
        }));
        setFavoriteFoods(convertedResults);
      } catch (error) {
        console.error('Failed to load favorite foods:', error);
        setFavoriteFoods([]);
      }
    } else {
      const savedFavorites = JSON.parse(localStorage.getItem('favoriteFoods') || '[]');
      setFavoriteFoods(savedFavorites);
    }
  };

  const loadCustomFoods = async () => {
    if (isAuthenticated) {
      try {
        const apiResults = await caloriesApi.getAllFoods(50);
        const convertedResults: Food[] = apiResults.foods
          .filter((apiFood: any) => apiFood.is_custom)
          .map((apiFood: any) => ({
            id: apiFood.id,
            name: apiFood.name,
            brand: apiFood.brand,
            category: apiFood.category || 'other',
            calories: Math.round(apiFood.calories_per_100g),
            protein: apiFood.protein_per_100g,
            carbs: apiFood.carbs_per_100g,
            fat: apiFood.fat_per_100g,
            fiber: apiFood.fiber_per_100g,
            sugar: apiFood.sugar_per_100g,
            sodium: apiFood.sodium_per_100g,
            servingSize: 100,
            servingUnit: 'g',
            barcode: apiFood.barcode,
            isCustom: true
          }));
        setCustomFoods(convertedResults);
      } catch (error) {
        console.error('Failed to load custom foods:', error);
        setCustomFoods([]);
      }
    } else {
      const savedCustomFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
      setCustomFoods(savedCustomFoods);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowMealSelector(false);
        setShowFavorites(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = () => {
    setIsSearching(true);
    setShowResults(true);
    
    setTimeout(() => {
      // For QuickAdd, we'll just search in favorites and custom foods
      // The full search is available in the food-search page
      const allFoods = [...favoriteFoods, ...customFoods];
      
      const results = allFoods.filter(food => {
        const matchesQuery = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesQuery;
      });
      
      // Remove duplicates by ID
      const uniqueResults = results.filter((food, index, self) => 
        index === self.findIndex(f => f.id === food.id)
      );
      
      // Sort results by name
      uniqueResults.sort((a, b) => a.name.localeCompare(b.name));
      
      setSearchResults(uniqueResults.slice(0, 8)); // Limit to 8 results for quick add
      setIsSearching(false);
    }, 300);
  };

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
    setShowMealSelector(true);
  };

  const handleMealSelect = (mealId: string) => {
    if (selectedFood) {
      onSelectFood(selectedFood, mealId);
      onSearchChange('');
      setShowResults(false);
      setShowMealSelector(false);
      setSelectedFood(null);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    
    const isFavorite = favoriteFoods.some(f => f.id === foodId);
    
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        if (isFavorite) {
          await caloriesApi.removeFromFavorites(foodId);
          setFavoriteFoods(prev => prev.filter(f => f.id !== foodId));
        } else {
          await caloriesApi.addToFavorites(foodId);
          // Find the food and add it to favorites
          const food = [...searchResults, ...customFoods].find(f => f.id === foodId);
          if (food) {
            setFavoriteFoods(prev => [...prev, { ...food, isFavorite: true }]);
          }
        }
      } else {
        // Use localStorage for non-authenticated users
        setFavoriteFoods(prev => {
          let newFavorites;
          
          if (isFavorite) {
            newFavorites = prev.filter(f => f.id !== foodId);
          } else {
            // Find the food in search results or custom foods
            const food = [...searchResults, ...customFoods].find(f => f.id === foodId);
            if (food) {
              newFavorites = [...prev, { ...food, isFavorite: true }];
            } else {
              return prev;
            }
          }
          
          // Save to localStorage
          localStorage.setItem('favoriteFoods', JSON.stringify(newFavorites));
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const isFavorite = (foodId: string) => {
    return favoriteFoods.some(f => f.id === foodId);
  };

  const handleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setShowResults(false);
    onSearchChange('');
  };

  const getAutoDetectedMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 21) return 'dinner';
    return 'snack';
  };

  return (
    <Card className="p-4 relative bg-white/5 border border-white/10">
      <div className="space-y-4" ref={searchRef}>
        <h3 className="font-semibold text-white">Quick Add</h3>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <Input
              type="text"
              placeholder="Search foods to add..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleFoodClick(searchResults[0]);
                }
              }}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <Button
            onClick={handleShowFavorites}
            className={`relative ${showFavorites
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
            }`}
          >
            <Icon path={mdiHeart} size={0.8} className="mr-2" />
            <span className="sr-only sm:not-sr-only">Favs</span>
            {favoriteFoods.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0">
                {favoriteFoods.length}
              </Badge>
            )}
          </Button>
          <Button onClick={onSearch} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
            <Icon path={mdiMagnify} size={0.8} className="mr-2" />
            <span className="sr-only sm:not-sr-only">More</span>
          </Button>
          <Button onClick={onScan} className="hidden sm:flex bg-white/10 border border-white/20 text-white hover:bg-white/20">
            <Icon path={mdiBarcode} size={0.8} className="mr-2" />
            Scan
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute z-50 mt-1 w-full max-w-[calc(100%-2rem)] bg-teal-800/90 border border-white/20 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-white/60">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors"
                    onClick={() => handleFoodClick(food)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate text-white">{food.name}</p>
                        {food.brand && (
                          <Badge className="text-xs bg-white/10 text-white/80 border border-white/20">
                            {food.brand}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/60">
                          {food.calories} cal
                        </span>
                        <span className="text-xs text-white/60">
                          P: {food.protein}g
                        </span>
                        <span className="text-xs text-white/60">
                          C: {food.carbs}g
                        </span>
                        <span className="text-xs text-white/60">
                          F: {food.fat}g
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-transparent hover:bg-white/10"
                        onClick={(e) => toggleFavorite(e, food.id)}
                      >
                        <Icon
                          path={isFavorite(food.id) ? mdiStar : mdiStarOutline}
                          size={0.8}
                          className={isFavorite(food.id) ? "text-yellow-500" : "text-white/40"}
                        />
                      </Button>
                      <Icon path={mdiPlus} size={0.8} className="text-white/40" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Icon path={mdiMagnify} size={1.2} className="text-white/40 mx-auto mb-2" />
                  <p className="text-sm text-white/60">No foods found</p>
                  <p className="text-xs text-white/40 mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {searchResults.length === 8 && (
              <div className="p-2 border-t border-white/10 bg-white/5">
                <Button
                  className="w-full text-xs bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={onSearch}
                >
                  View all results
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Favorites Display */}
        {showFavorites && favoriteFoods.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-w-[calc(100%-2rem)] bg-teal-800/90 border border-white/20 rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 border-b border-white/10 bg-white/5">
              <h4 className="font-medium text-sm flex items-center gap-2 text-white">
                <Icon path={mdiHeart} size={0.7} className="text-red-500" />
                Favorite Foods ({favoriteFoods.length})
              </h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {favoriteFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors"
                  onClick={() => handleFoodClick(food)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate text-white">{food.name}</p>
                      {food.brand && (
                        <Badge className="text-xs bg-white/10 text-white/80 border border-white/20">
                          {food.brand}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/60">
                        {food.calories} cal
                      </span>
                      <span className="text-xs text-white/60">
                        P: {food.protein}g
                      </span>
                      <span className="text-xs text-white/60">
                        C: {food.carbs}g
                      </span>
                      <span className="text-xs text-white/60">
                        F: {food.fat}g
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      size="icon"
                      className="h-8 w-8 bg-transparent hover:bg-white/10"
                      onClick={(e) => toggleFavorite(e, food.id)}
                    >
                      <Icon
                        path={mdiStar}
                        size={0.8}
                        className="text-yellow-500"
                      />
                    </Button>
                    <Icon path={mdiPlus} size={0.8} className="text-white/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showFavorites && favoriteFoods.length === 0 && (
          <div className="absolute z-50 mt-1 w-full max-w-[calc(100%-2rem)] bg-teal-800/90 border border-white/20 rounded-lg shadow-lg p-6 text-center">
            <Icon path={mdiHeart} size={1.5} className="text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/60">No favorite foods yet</p>
            <p className="text-xs text-white/40 mt-1">Star foods from search results to add them here</p>
          </div>
        )}

        {/* Meal Selector Modal */}
        {showMealSelector && selectedFood && (
          <div className="absolute z-50 mt-1 w-full max-w-[calc(100%-2rem)] bg-teal-800/90 border border-white/20 rounded-lg shadow-lg p-4">
            <h4 className="font-medium mb-3 text-white">Add "{selectedFood.name}" to:</h4>
            <div className="grid grid-cols-2 gap-2">
              {meals.map((meal) => (
                <Button
                  key={meal.id}
                  onClick={() => handleMealSelect(meal.id)}
                  className={`justify-start ${
                    meal.id === getAutoDetectedMeal()
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                      : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <span className="mr-2">{meal.emoji}</span>
                  {meal.name}
                  {meal.id === getAutoDetectedMeal() && (
                    <Badge className="ml-2 text-xs bg-white/20 text-white border-0">Auto</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuickAdd;