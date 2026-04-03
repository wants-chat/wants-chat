import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import caloriesApi from '../../services/caloriesApi';
import { toast } from 'sonner';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { useConfirmation } from '../../hooks/useConfirmation';
import DateNavigation from '../../components/calories-tracker/dashboard/DateNavigation';
import DailySummary from '../../components/calories-tracker/diary/DailySummary';
import QuickAdd from '../../components/calories-tracker/diary/QuickAdd';
import MealSection, { FoodEntry } from '../../components/calories-tracker/diary/MealSection';
import WaterTracker from '../../components/calories-tracker/diary/WaterTracker';
import { Food } from '../../components/calories-tracker/food-search/FoodItem';
import { DiaryPageSkeleton } from '../../components/calories-tracker/skeletons';

interface DailyGoals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  water: number;
}

const DiaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile: apiProfile, todaysFoodLogs, dashboardData, isLoading, profileCheckComplete, refreshFoodLogs } = useCalories();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | null>(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Don't check profile while loading or if profile check is not complete
    if (!profileCheckComplete) return;

    if (isAuthenticated && apiProfile) {
      // Use API data for authenticated users
      const { goals: g } = apiProfile;
      
      // Use macro goals from dashboard API response if available, otherwise calculate from percentages
      let targetProtein, targetCarbs, targetFat;
      
      if (dashboardData?.today?.macros) {
        // Use the macro goals directly from the dashboard API response
        targetProtein = dashboardData.today.macros.protein.goal;
        targetCarbs = dashboardData.today.macros.carbs.goal;
        targetFat = dashboardData.today.macros.fat.goal;
      } else if (g.daily_calories && g.daily_calories > 0) {
        // Calculate from percentages only if we have valid daily_calories
        targetProtein = Math.round((g.daily_calories * g.protein_percentage / 100) / 4);
        targetCarbs = Math.round((g.daily_calories * g.carbs_percentage / 100) / 4);
        targetFat = Math.round((g.daily_calories * g.fat_percentage / 100) / 9);
      } else {
        // Fallback to reasonable defaults if daily_calories is invalid
        targetProtein = 150;
        targetCarbs = 200;
        targetFat = 65;
      }
      
      // Ensure minimum reasonable values for goals
      const calorieGoal = Math.max(1200, dashboardData?.today?.calories?.goal || g.daily_calories || 2000);
      const proteinGoal = Math.max(50, targetProtein);
      const carbsGoal = Math.max(130, targetCarbs);
      const fatGoal = Math.max(40, targetFat);
      
      setDailyGoals({
        calories: calorieGoal,
        carbs: carbsGoal,
        protein: proteinGoal,
        fat: fatGoal,
        water: Math.max(1500, dashboardData?.today?.water?.goal || 2500)
      });
    } else if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      loadDailyGoals();
    } else if (isAuthenticated && profileCheckComplete && !apiProfile && !isLoading) {
      // Only redirect if user is coming from landing page, not when refreshing other pages
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/calories-tracker';
      
      // Check if user has completed onboarding before redirecting
      const hasOnboardingData = localStorage.getItem('caloriesTrackerOnboarding');
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      
      if ((!hasOnboardingData || onboardingCompleted !== 'true') && isOnLandingPage) {
        // If authenticated but no profile and no onboarding data, redirect to onboarding
        navigate('/calories-tracker/onboarding');
        return;
      }
      // If they have onboarding data or accessing directly, let them continue with localStorage data
      if (hasOnboardingData) {
        loadDailyGoals();
      }
    }

    loadFoodEntries();
    loadWaterIntake();
  }, [selectedDate, navigate, isAuthenticated, profileCheckComplete, apiProfile, todaysFoodLogs, dashboardData]);

  const loadDailyGoals = () => {
    const saved = localStorage.getItem('caloriesTrackerOnboarding');
    if (saved) {
      const data = JSON.parse(saved);
      setDailyGoals({
        calories: data.dailyCalories || 2000,
        carbs: data.finalMacros?.carbsGrams || 250,
        protein: data.finalMacros?.proteinGrams || 100,
        fat: data.finalMacros?.fatGrams || 67,
        water: 2500
      });
    } else {
      // Only redirect if user is coming from landing page, not when accessing diary directly
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/calories-tracker';
      
      if (isOnLandingPage) {
        // Redirect to onboarding if no data found and coming from landing
        navigate('/calories-tracker/onboarding');
      } else {
        // Set default daily goals for direct access
        setDailyGoals({
          calories: 2000,
          carbs: 250,
          protein: 100,
          fat: 67,
          water: 2500
        });
      }
    }
  };

  const loadFoodEntries = () => {
    // If authenticated and we have API data for today, use it
    if (isAuthenticated && todaysFoodLogs && selectedDate.toDateString() === new Date().toDateString()) {
      // Convert API food logs to diary entries format
      const apiEntries: FoodEntry[] = [];
      
      // Process each meal type
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        const mealData = todaysFoodLogs.meals[mealType as keyof typeof todaysFoodLogs.meals];
        if (mealData?.logs && mealData.logs.length > 0) {
          mealData.logs.forEach((log: any) => {
            apiEntries.push({
              id: log.id || `${mealType}_${log.food?.id || log.foodId || log.food_id}`,
              name: log.foodName || log.food_name || log.food?.name || 'Unknown Food',
              brand: log.food?.brand,
              calories: log.calories || 0,
              carbs: log.carbs || 0,
              protein: log.protein || 0,
              fat: log.fat || 0,
              fiber: log.fiber,
              sugar: log.sugar,
              sodium: log.sodium,
              quantity: log.quantity || 0,
              unit: log.unit || 'g',
              time: new Date(log.consumedAt || log.consumed_at || new Date()),
              mealType: mealType // Add the meal type from the parent meal category
            });
          });
        }
      });
      
      setEntries(apiEntries);
      return;
    }
    
    // Fallback to localStorage for non-authenticated users or non-today dates
    const savedEntries = JSON.parse(localStorage.getItem('foodEntries') || '[]') as FoodEntry[];
    
    // Convert time strings back to Date objects and filter entries for the selected date
    const dateKey = selectedDate.toDateString();
    const dayEntries = savedEntries
      .map(entry => ({
        ...entry,
        time: new Date(entry.time) // Ensure time is a Date object
      }))
      .filter(entry => {
        const entryDate = entry.time;
        return entryDate.toDateString() === dateKey;
      });

    setEntries(dayEntries);
  };

  const loadWaterIntake = () => {
    // If authenticated and we have dashboard data, use it
    if (isAuthenticated && dashboardData) {
      // Convert glasses to ml (assuming 250ml per glass)
      const waterInMl = dashboardData.today.water.current * 250;
      setWaterIntake(waterInMl);
    } else {
      // Default to 0 for non-authenticated users
      setWaterIntake(0);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const getMealEntries = (meal: string) => {
    // Filter entries by mealType if available, otherwise fall back to time-based filtering
    return entries.filter(entry => {
      // If entry has mealType, use it for filtering
      if (entry.mealType) {
        // Handle both 'snack' and 'snacks' variations
        const normalizedMealType = entry.mealType === 'snack' ? 'snacks' : entry.mealType;
        const normalizedMeal = meal === 'snack' ? 'snacks' : meal;
        return normalizedMealType === normalizedMeal;
      }
      
      // Fallback to time-based filtering for entries without mealType
      const mealTimeRanges = {
        breakfast: { start: 5, end: 11 },
        lunch: { start: 11, end: 15 },
        dinner: { start: 15, end: 21 },
        snack: { start: 0, end: 24 }
      };

      const range = mealTimeRanges[meal as keyof typeof mealTimeRanges];
      const hour = entry.time.getHours();
      
      if (meal === 'snack') {
        return hour < 5 || hour >= 21;
      }
      return hour >= range.start && hour < range.end;
    });
  };

  const getDailyTotals = () => {
    return entries.reduce(
      (totals, entry) => ({
        calories: totals.calories + entry.calories,
        carbs: totals.carbs + entry.carbs,
        protein: totals.protein + entry.protein,
        fat: totals.fat + entry.fat
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  const addWater = async (amount: number) => {
    // Update local state immediately for UI responsiveness
    const optimisticWaterIntake = waterIntake + amount;
    setWaterIntake(optimisticWaterIntake);
    
    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        // Convert amount to glasses for API (assuming 250ml per glass)
        const glassesToAdd = Math.round(amount / 250);
        const response = await caloriesApi.updateWaterIntake({
          glasses: glassesToAdd,
          date: new Date().toISOString()
        });
        
        // Update with actual backend data
        if (response && response.total_glasses !== undefined) {
          const actualWaterIntake = response.total_glasses * 250; // Convert glasses to ml
          setWaterIntake(actualWaterIntake);
        }
        
        // Refresh dashboard data to stay in sync
        await refreshFoodLogs();
      } catch (error) {
        console.error('Failed to update water intake:', error);
        // Revert local state on API error
        setWaterIntake(waterIntake);
      }
    }
  };

  const removeWater = async (amount: number) => {
    // Update local state optimistically (ensure we don't go below 0)
    const optimisticWaterIntake = Math.max(0, waterIntake - amount);
    setWaterIntake(optimisticWaterIntake);
    
    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        // Convert amount to glasses for decrement API (assuming 250ml per glass)
        const glassesToDecrement = Math.round(amount / 250);
        
        const response = await caloriesApi.decrementWaterIntake({
          glasses: glassesToDecrement,
          date: new Date().toISOString()
        });
        
        // Update with actual backend data
        if (response && response.total_glasses !== undefined) {
          const actualWaterIntake = response.total_glasses * 250; // Convert glasses to ml
          setWaterIntake(actualWaterIntake);
        }
        
        // Refresh dashboard data to stay in sync
        await refreshFoodLogs();
      } catch (error) {
        console.error('Failed to decrement water intake:', error);
        // Revert local state on API error
        setWaterIntake(waterIntake);
      }
    }
  };

  const handleAddFood = (meal: string) => {
    navigate('/calories-tracker/food-search', { state: { meal } });
  };

  const handleQuickAddFood = (food: Food, meal?: string) => {
    navigate('/calories-tracker/log-food', { state: { food, meal } });
  };

  const handleEditFood = (entry: FoodEntry) => {
    // Navigate to log-food page with edit data
    navigate('/calories-tracker/log-food', { 
      state: { 
        food: {
          id: entry.id,
          name: entry.name,
          brand: entry.brand,
          category: 'other', // Default category for logged foods
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          fiber: entry.fiber,
          sugar: entry.sugar,
          sodium: entry.sodium,
          servingSize: 100,
          servingUnit: 'g'
        },
        editEntry: entry
      } 
    });
  };

  const confirmation = useConfirmation();

  const handleDeleteFood = async (entryId: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Food Entry',
      message: 'Are you sure you want to remove this food from your diary? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    // If authenticated, try to delete from API first
    if (isAuthenticated) {
      try {
        await caloriesApi.deleteFoodLog(entryId);
        // Refresh food logs to get updated data
        await refreshFoodLogs();
        // Update local state
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        toast.success('Food entry deleted successfully');
      } catch (error) {
        console.error('Failed to delete food entry:', error);
        toast.error('Failed to delete food entry. Please try again.');
      }
    } else {
      // For non-authenticated users, use localStorage
      const savedEntries = JSON.parse(localStorage.getItem('foodEntries') || '[]') as FoodEntry[];
      const updatedEntries = savedEntries.filter((entry: FoodEntry) => entry.id !== entryId);
      localStorage.setItem('foodEntries', JSON.stringify(updatedEntries));
      
      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Food entry deleted successfully');
    }
  };

  const meals = [
    { id: 'breakfast', name: 'Breakfast', goalPercentage: 0.25 },
    { id: 'lunch', name: 'Lunch', goalPercentage: 0.30 },
    { id: 'dinner', name: 'Dinner', goalPercentage: 0.35 },
    { id: 'snack', name: 'Snacks', goalPercentage: 0.10 }
  ];

  const dailyTotals = getDailyTotals();

  // Show loading state while checking profile
  if (!profileCheckComplete || (isLoading && !dailyGoals)) {
    return (
      <div className="min-h-screen p-6">
        <DiaryPageSkeleton />
      </div>
    );
  }

  if (!dailyGoals) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <DateNavigation 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Daily Summary */}
      <DailySummary 
        dailyTotals={dailyTotals}
        dailyGoals={dailyGoals}
      />

      {/* Quick Add */}
      <QuickAdd
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={() => navigate('/calories-tracker/food-search')}
        onScan={() => console.log('Open scanner')}
        onSelectFood={handleQuickAddFood}
        selectedDate={selectedDate}
      />

      {/* Meals */}
      <div className="space-y-6">
        {meals.map((meal) => {
          const mealEntries = getMealEntries(meal.id);
          const goalCalories = Math.round(dailyGoals.calories * meal.goalPercentage);
          
          return (
            <MealSection
              key={meal.id}
              mealName={meal.name}
              mealId={meal.id}
              entries={mealEntries}
              goalCalories={goalCalories}
              onAddFood={() => handleAddFood(meal.id)}
              onEditFood={handleEditFood}
              onDeleteFood={handleDeleteFood}
            />
          );
        })}
      </div>

      {/* Water Tracking */}
      <WaterTracker
        waterIntake={waterIntake}
        waterGoal={dailyGoals.water}
        onAddWater={addWater}
        onRemoveWater={removeWater}
      />

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default DiaryPage;