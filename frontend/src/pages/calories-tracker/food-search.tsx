// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import caloriesApi from '../../services/caloriesApi';
import SearchBar from '../../components/calories-tracker/food-search/SearchBar';
import CategoryFilter from '../../components/calories-tracker/food-search/CategoryFilter';
import SearchResults from '../../components/calories-tracker/food-search/SearchResults';
import FoodSection from '../../components/calories-tracker/food-search/FoodSection';
import CreateCustomFood from '../../components/calories-tracker/food-search/CreateCustomFood';
import { Food } from '../../components/calories-tracker/food-search/FoodItem';
import { mdiHistory, mdiStar, mdiFoodApple } from '@mdi/js';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { FoodSearchSkeleton } from '../../components/calories-tracker/skeletons';

interface RecentFood extends Food {
  lastUsed: Date;
}

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { meal, message, newFoodId } = (location.state as { meal?: string; message?: string; newFoodId?: string }) || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [successMessage, setSuccessMessage] = useState(message || '');
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All', icon: mdiFoodApple },
    { id: 'fruits', name: 'Fruits' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'proteins', name: 'Proteins' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'grains', name: 'Grains' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'beverages', name: 'Beverages' }
  ];

  const [commonFoods, setCommonFoods] = useState<Food[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([
        loadRecentFoods(),
        loadFavoriteFoods(),
        loadCustomFoods(),
        loadCommonFoods()
      ]);
      setIsInitialLoading(false);
    };
    loadInitialData();
    
    // Clear success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, isAuthenticated]);

  useEffect(() => {
    // Clear existing timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    
    if (searchQuery.length > 0) {
      // Debounce search to avoid too many API calls
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      setSearchTimer(timer);
    } else {
      setSearchResults([]);
    }
    
    // Cleanup
    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    };
  }, [searchQuery, selectedCategory]);

  const loadRecentFoods = async () => {
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        const apiRecentFoods = await caloriesApi.getRecentFoods(10);
        
        if (apiRecentFoods.foods && apiRecentFoods.foods.length > 0) {
          const convertedRecent: RecentFood[] = apiRecentFoods.foods.map((apiFood: any) => ({
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
            lastUsed: new Date(apiFood.last_used || new Date())
          }));
          
          setRecentFoods(convertedRecent);
        } else {
          // No recent foods from API
          setRecentFoods([]);
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        const savedRecent = JSON.parse(localStorage.getItem('recentFoods') || '[]') as Food[];
        const recent: RecentFood[] = savedRecent.map((food, index) => ({
          ...food,
          lastUsed: new Date(Date.now() - 1000 * 60 * 60 * (index + 1))
        }));
        
        setRecentFoods(recent);
      }
    } catch (error) {
      console.error('Failed to load recent foods:', error);
      // Fallback to localStorage on error
      const savedRecent = JSON.parse(localStorage.getItem('recentFoods') || '[]') as Food[];
      const recent: RecentFood[] = savedRecent.map((food, index) => ({
        ...food,
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * (index + 1))
      }));
      setRecentFoods(recent.length > 0 ? recent : []);
    }
  };

  const loadFavoriteFoods = async () => {
    if (isAuthenticated) {
      try {
        const apiResults = await caloriesApi.getFavoriteFoods();
        
        // Convert API response to our Food interface
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
      // Fallback to localStorage for non-authenticated users
      const savedFavorites = JSON.parse(localStorage.getItem('favoriteFoods') || '[]') as Food[];
      setFavoriteFoods(savedFavorites.map(f => ({ ...f, isFavorite: true })));
    }
  };

  const loadCustomFoods = async () => {
    if (isAuthenticated) {
      try {
        // Use the getAllFoods endpoint to get custom foods
        const apiResults = await caloriesApi.getAllFoods(50);
        
        // Filter to only show custom foods created by the user
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
      // Fallback to localStorage for non-authenticated users
      const savedCustomFoods = JSON.parse(localStorage.getItem('customFoods') || '[]') as Food[];
      setCustomFoods(savedCustomFoods);
    }
  };

  const loadCommonFoods = async () => {
    if (isAuthenticated) {
      try {
        // Use the new getAllFoods endpoint to get common foods
        const apiResults = await caloriesApi.getAllFoods(20);
        
        // Filter to only show non-custom (public) foods and convert to our Food interface
        const convertedResults: Food[] = apiResults.foods
          .filter((apiFood: any) => !apiFood.is_custom)
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
            isCustom: apiFood.is_custom,
            isCommon: true
          }))
          .slice(0, 10); // Limit to 10 common foods
        
        setCommonFoods(convertedResults);
      } catch (error) {
        console.error('Failed to load common foods:', error);
        setCommonFoods([]);
      }
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        const searchParams: any = {
          q: searchQuery,
          limit: 20
        };
        
        // Only add category if it's not 'all'
        if (selectedCategory !== 'all') {
          searchParams.category = selectedCategory;
        }
        
        const apiResults = await caloriesApi.searchFoods(searchParams);
        
        // Convert API response to our Food interface
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
          isCustom: apiFood.is_custom
        }));
        
        setSearchResults(convertedResults);
      } else {
        // Non-authenticated users should sign in to use the app
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    navigate('/calories-tracker/log-food', { state: { food, meal } });
  };

  const toggleFavorite = async (foodId: string) => {
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
          const food = [...searchResults, ...recentFoods, ...commonFoods, ...customFoods].find(f => f.id === foodId);
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
            // Find food from search results or recent foods
            const food = [...searchResults, ...recentFoods, ...commonFoods, ...customFoods].find(f => f.id === foodId);
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
      // Show error message to user if needed
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    // Search for the barcode in the database
    setSearchQuery(barcode);
    setShowScanner(false);
    // The search will automatically trigger via the useEffect
  };

  const handleCreateCustomFood = () => {
    navigate('/calories-tracker/add-food');
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <FoodSearchSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-emerald-500/10 border border-emerald-500/20">
          <AlertDescription className="text-emerald-400">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBarcodeClick={() => setShowScanner(true)}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Search Results */}
      <SearchResults
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        favoriteFoods={favoriteFoods}
        onSelectFood={handleSelectFood}
        onToggleFavorite={toggleFavorite}
        onCreateCustomFood={handleCreateCustomFood}
      />

      {/* Quick Access Sections */}
      {!searchQuery && (
        <>
          {/* Recent Foods */}
          <FoodSection
            title="Recent Foods"
            icon={mdiHistory}
            foods={recentFoods}
            favoriteFoods={favoriteFoods}
            emptyMessage="No recent foods"
            onSelectFood={handleSelectFood}
            onToggleFavorite={toggleFavorite}
            showTime={true}
          />

          {/* Favorite Foods */}
          <FoodSection
            title="Favorite Foods"
            icon={mdiStar}
            iconColor="text-yellow-500"
            foods={favoriteFoods}
            favoriteFoods={favoriteFoods}
            emptyMessage="No favorite foods yet"
            onSelectFood={handleSelectFood}
            onToggleFavorite={toggleFavorite}
          />

          {/* Common Foods */}
          <FoodSection
            title="Common Foods"
            icon={mdiFoodApple}
            foods={commonFoods}
            favoriteFoods={favoriteFoods}
            emptyMessage="No common foods"
            onSelectFood={handleSelectFood}
            onToggleFavorite={toggleFavorite}
          />

          {/* Custom Foods */}
          {customFoods.length > 0 && (
            <FoodSection
              title="My Custom Foods"
              icon={mdiFoodApple}
              iconColor="text-purple-500"
              foods={customFoods}
              favoriteFoods={favoriteFoods}
              emptyMessage="No custom foods yet"
              onSelectFood={handleSelectFood}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </>
      )}

      {/* Create Custom Food */}
      <CreateCustomFood onCreateClick={handleCreateCustomFood} />
    </div>
  );
};

export default FoodSearchPage;