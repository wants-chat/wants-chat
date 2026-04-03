import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, ChevronRight, Utensils, Target, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import caloriesApi from '../../services/caloriesApi';
import CaloriesSummary from '../../components/calories-tracker/dashboard/CaloriesSummary';
import MacroBreakdown from '../../components/calories-tracker/dashboard/MacroBreakdown';
import WaterIntake from '../../components/calories-tracker/dashboard/WaterIntake';
import WeightProgress from '../../components/calories-tracker/dashboard/WeightProgress';
import QuickActions from '../../components/calories-tracker/dashboard/QuickActions';
import ActiveFasting from '../../components/calories-tracker/dashboard/ActiveFasting';
import { NutritionAI, MealPlanGenerator } from '../../components/calories-tracker/ai';
import { DashboardSkeleton } from '../../components/calories-tracker/skeletons';

interface UserProfile {
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: string;
  gender: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  dietPlan?: {
    name: string;
    description: string;
  };
}

interface DailyStats {
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  waterConsumed: number;
  waterTarget: number;
  currentStreak: number;
  longestStreak: number;
  mealsLogged: number;
  exerciseMinutes: number;
}

const CaloriesTrackerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile: apiProfile, dashboardData, isLoading, error, profileCheckComplete, refreshDashboard, refreshProfile } = useCalories();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatConsumed: 0,
    waterConsumed: 0,
    waterTarget: 8,
    currentStreak: 0,
    longestStreak: 0,
    mealsLogged: 0,
    exerciseMinutes: 0
  });
  const [todaysMeals, setTodaysMeals] = useState<any[]>([]);
  const { todaysFoodLogs } = useCalories();
  const [activeFasting, setActiveFasting] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMealPlanGenerator, setShowMealPlanGenerator] = useState(false);

  useEffect(() => {
    // Don't check profile while auth is loading or if profile check is not complete
    if (authLoading || !profileCheckComplete) return;

    // If authenticated and have API data, use it
    if (isAuthenticated && dashboardData) {
      setDailyStats({
        caloriesConsumed: dashboardData.today.calories.consumed,
        caloriesBurned: dashboardData.today.calories.burned,
        proteinConsumed: dashboardData.today.macros.protein.current,
        carbsConsumed: dashboardData.today.macros.carbs.current,
        fatConsumed: dashboardData.today.macros.fat.current,
        waterConsumed: dashboardData.today.water.current,
        waterTarget: dashboardData.today.water.goal,
        currentStreak: dashboardData.user.streak.current,
        longestStreak: dashboardData.user.streak.record,
        mealsLogged: dashboardData.today.meals_logged,
        exerciseMinutes: dashboardData.today.exercise_minutes
      });
    }
    
    // Set profile from API or localStorage
    if (apiProfile) {
      const { profile: p, goals: g } = apiProfile;
      
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
      
      // Ensure minimum reasonable values for all goals
      const calorieGoal = Math.max(1200, dashboardData?.today?.calories?.goal || g.daily_calories || 2000);
      const proteinGoal = Math.max(50, targetProtein);
      const carbsGoal = Math.max(130, targetCarbs);
      const fatGoal = Math.max(40, targetFat);
      
      setProfile({
        name: dashboardData?.user.name || 'Health Warrior',
        age: p.age,
        height: p.height_cm,
        currentWeight: p.current_weight_kg,
        targetWeight: p.target_weight_kg,
        activityLevel: p.activity_level,
        gender: p.gender,
        bmr: 0, // Calculate from profile
        tdee: 0, // Calculate from profile
        targetCalories: calorieGoal,
        targetProtein: proteinGoal,
        targetCarbs: carbsGoal,
        targetFat: fatGoal
      });
      setInitialCheckDone(true);
    } else if (!isAuthenticated) {
      // Fallback to localStorage for non-authenticated users
      const savedProfile = localStorage.getItem('caloriesTrackerOnboarding');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setProfile({
          ...profileData,
          name: 'Health Warrior',
          targetCalories: profileData.dailyCalories || profileData.tdee - 500,
          targetProtein: profileData.targetProtein || 150,
          targetCarbs: profileData.targetCarbs || 200,
          targetFat: profileData.targetFat || 65
        });
        setInitialCheckDone(true);
      } else if (initialCheckDone) {
        // Only redirect after we've done the initial check
        navigate('/calories-tracker/onboarding');
      }
    } else if (isAuthenticated && profileCheckComplete && !apiProfile && !isLoading && initialCheckDone) {
      // If authenticated but no profile, redirect to onboarding
      navigate('/calories-tracker/onboarding');
    }
    
    // Mark initial check as done
    if (!initialCheckDone) {
      setInitialCheckDone(true);
    }

    // Initialize with empty stats if not authenticated
    if (!isAuthenticated) {
      setDailyStats({
        caloriesConsumed: 0,
        caloriesBurned: 0,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatConsumed: 0,
        waterConsumed: 0,
        waterTarget: 8,
        currentStreak: 0,
        longestStreak: 0,
        mealsLogged: 0,
        exerciseMinutes: 0
      });
    }

    // Load today's meals from API
    if (isAuthenticated && todaysFoodLogs?.meals) {
      // Convert API food logs to meals format
      const apiMeals: any[] = [];
      
      // Process each meal type
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        const mealData = todaysFoodLogs.meals[mealType as keyof typeof todaysFoodLogs.meals];
        if (mealData?.logs && mealData.logs.length > 0) {
          mealData.logs.forEach((log: any, index: number) => {
            apiMeals.push({
              id: `${mealType}_${index}`,
              type: mealType,
              name: log.foodName || log.food_name || log.food?.name || 'Unknown Food',
              calories: log.calories || 0,
              protein: log.protein || 0,
              carbs: log.carbs || 0,
              fat: log.fat || 0,
              time: new Date(log.consumedAt || log.consumed_at || new Date()).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            });
          });
        }
      });
      
      setTodaysMeals(apiMeals);
    } else if (!isAuthenticated) {
      // Initialize with empty meals for non-authenticated users
      setTodaysMeals([]);
    }

    // Check for active fasting
    const fastingData = localStorage.getItem('activeFasting');
    if (fastingData) {
      try {
        const parsed = JSON.parse(fastingData);
        // Validate structure - must have name, duration, and startTime
        if (parsed && typeof parsed.name === 'string' && typeof parsed.duration === 'number' && parsed.startTime) {
          setActiveFasting(parsed);
        } else {
          // Invalid data structure, clear it
          console.warn('Invalid fasting data in localStorage, clearing...');
          localStorage.removeItem('activeFasting');
        }
      } catch (error) {
        console.error('Failed to parse activeFasting from localStorage:', error);
        localStorage.removeItem('activeFasting');
      }
    }
  }, [navigate, isAuthenticated, authLoading, profileCheckComplete, apiProfile, dashboardData, todaysFoodLogs, initialCheckDone]);

  // Show loading state while checking auth or profile
  if (authLoading || !profileCheckComplete || (isLoading && !profile)) {
    return (
      <div className="min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // Don't render if no profile is loaded yet
  if (!profile) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRemainingCalories = () => {
    return profile.targetCalories - dailyStats.caloriesConsumed + dailyStats.caloriesBurned;
  };

  const getCalorieStatus = () => {
    const remaining = getRemainingCalories();
    if (remaining > 500) return { text: 'Great job! Plenty of calories left', color: 'text-emerald-600' };
    if (remaining > 200) return { text: 'On track! Watch your portions', color: 'text-primary' };
    if (remaining > 0) return { text: 'Almost there! Choose wisely', color: 'text-orange-600' };
    return { text: 'Goal reached! Consider stopping', color: 'text-red-600' };
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Compact Welcome Section */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {getGreeting()}, {profile.name || 'Health Warrior'}! 🥗
            </h1>
            <p className="text-sm text-white/60">
              {getRemainingCalories() > 0
                ? `${getRemainingCalories()} calories remaining for today`
                : "Great job! You've reached your calorie goal"}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{dailyStats.currentStreak}</div>
              <div className="text-xs text-white/60">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{dailyStats.mealsLogged}</div>
              <div className="text-xs text-white/60">Meals Today</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Date Navigation */}
      <GlassCard className="flex items-center justify-between p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>


        <div className="text-center">
          <p className="font-semibold text-white">{formatDate(selectedDate)}</p>
          <p className="text-xs text-white/60">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
          disabled={selectedDate.toDateString() === new Date().toDateString()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </GlassCard>

      {/* Primary Section - Today's Nutrition & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Nutrition - Most Important */}
        <GlassCard className="p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
            Today's Nutrition
          </h3>
          
          <div className="space-y-4">
            {/* Calorie Overview */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-bold text-white">Calories</h4>
                <span className="text-sm font-medium text-teal-400">
                  {getRemainingCalories()} left
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Consumed</span>
                  <span className="font-medium text-white">{dailyStats.caloriesConsumed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Burned</span>
                  <span className="font-medium text-cyan-400">-{dailyStats.caloriesBurned}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/20">
                  <span className="text-white">Net</span>
                  <span className="text-white">{dailyStats.caloriesConsumed - dailyStats.caloriesBurned}</span>
                </div>
              </div>


              <div className="mt-3">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
                    style={{
                      width: `${Math.min((dailyStats.caloriesConsumed / profile.targetCalories) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Goal: {profile.targetCalories} cal
                </p>
              </div>
            </div>

            {/* Recent Meals */}
            <div>
              <h5 className="text-sm font-medium text-white mb-2">Recent Meals</h5>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                {todaysMeals.slice(0, 4).map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{meal.name}</p>
                      <p className="text-xs text-white/60">{meal.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{meal.calories} cal</p>
                      <p className="text-xs text-white/60">
                        P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{dailyStats.proteinConsumed}g</p>
                <p className="text-xs text-white/60">Protein</p>
              </div>
              <div className="text-center border-x border-white/20">
                <p className="text-lg font-bold text-white">{dailyStats.carbsConsumed}g</p>
                <p className="text-xs text-white/60">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{dailyStats.fatConsumed}g</p>
                <p className="text-xs text-white/60">Fat</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-10"
                onClick={() => navigate('/calories-tracker/food-search')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Food
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/calories-tracker/diary')}
              >
                <Utensils className="h-4 w-4 mr-1" />
                Food Diary
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Calories & Macros Progress */}
        <div className="lg:col-span-2 space-y-6">
          <CaloriesSummary 
            consumed={dailyStats.caloriesConsumed}
            burned={dailyStats.caloriesBurned}
            goal={profile.targetCalories}
            remaining={getRemainingCalories()}
          />
          
          <MacroBreakdown 
            protein={{ current: dailyStats.proteinConsumed, target: profile.targetProtein }}
            carbs={{ current: dailyStats.carbsConsumed, target: profile.targetCarbs }}
            fat={{ current: dailyStats.fatConsumed, target: profile.targetFat }}
          />
        </div>
      </div>

      {/* Secondary Section - Water & Weight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterIntake 
          current={dailyStats.waterConsumed}
          target={dailyStats.waterTarget}
          onUpdate={async (glasses) => {
            // Calculate the difference
            const currentGlasses = dailyStats.waterConsumed;
            const difference = glasses - currentGlasses;
            
            // Update local state immediately for UI responsiveness
            setDailyStats(prev => ({ ...prev, waterConsumed: glasses }));
            
            // If authenticated, sync with backend
            if (isAuthenticated && difference !== 0) {
              try {
                if (difference > 0) {
                  // Increment water intake
                  await caloriesApi.updateWaterIntake({
                    glasses: difference, // Send only the increment amount
                    date: new Date().toISOString().split('T')[0]
                  });
                } else {
                  // Decrement water intake
                  await caloriesApi.decrementWaterIntake({
                    glasses: Math.abs(difference), // Send only the decrement amount as positive
                    date: new Date().toISOString().split('T')[0]
                  });
                }
                // Refresh dashboard data to stay in sync
                await refreshDashboard();
              } catch (error) {
                console.error('Failed to update water intake:', error);
                // Revert local state on API error
                setDailyStats(prev => ({ 
                  ...prev, 
                  waterConsumed: dashboardData?.today.water.current || prev.waterConsumed 
                }));
              }
            }
          }}
        />
        <WeightProgress 
          currentWeight={profile.currentWeight}
          targetWeight={profile.targetWeight}
          startWeight={dashboardData?.weight?.start || profile.currentWeight} // Use actual start weight from API
          onWeightLogged={async () => {
            // Refresh dashboard data if authenticated
            if (isAuthenticated) {
              await refreshProfile(); // Refresh profile to get updated weight
              await refreshDashboard();
            } else {
              // For non-authenticated users, update from localStorage
              const savedProfile = localStorage.getItem('caloriesTrackerOnboarding');
              if (savedProfile) {
                const profileData = JSON.parse(savedProfile);
                setProfile(prev => prev ? { ...prev, currentWeight: profileData.currentWeight } : prev);
              }
            }
          }}
        />
      </div>

      {/* Active Fasting Section */}
      {activeFasting && (
        <ActiveFasting 
          fastingPlan={activeFasting}
          onEndFast={() => {
            localStorage.removeItem('activeFasting');
            setActiveFasting(null);
          }}
        />
      )}

      {/* Quick Actions */}
      <QuickActions 
        onQuickAdd={async (action) => {
          switch(action) {
            case 'water':
              const newWaterAmount = Math.min(dailyStats.waterConsumed + 1, dailyStats.waterTarget);
              // Update local state immediately for UI responsiveness
              setDailyStats(prev => ({ 
                ...prev, 
                waterConsumed: newWaterAmount 
              }));
              
              // If authenticated, sync with backend
              if (isAuthenticated && newWaterAmount > dailyStats.waterConsumed) {
                try {
                  await caloriesApi.updateWaterIntake({
                    glasses: 1, // Always increment by 1 glass
                    date: new Date().toISOString().split('T')[0]
                  });
                  // Refresh dashboard data to stay in sync
                  await refreshDashboard();
                } catch (error) {
                  console.error('Failed to update water intake:', error);
                  // Revert local state on API error
                  setDailyStats(prev => ({ 
                    ...prev, 
                    waterConsumed: dashboardData?.today.water.current || prev.waterConsumed 
                  }));
                }
              }
              break;
            case 'exercise':
              navigate('/fitness/dashboard');
              break;
            case 'weight':
              navigate('/calories-tracker/progress');
              break;
            case 'meal':
              navigate('/calories-tracker/food-search');
              break;
          }
        }}
      />

      {/* AI Components Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Assistant Toggle Button */}
        <GlassCard className="p-4 cursor-pointer" onClick={() => setShowAIAssistant(!showAIAssistant)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">AI Nutrition Assistant</h3>
                <p className="text-xs text-white/60">Get personalized recommendations</p>
              </div>
            </div>
            <ChevronRight className={`h-5 w-5 text-white/60 transition-transform ${showAIAssistant ? 'rotate-90' : ''}`} />
          </div>
        </GlassCard>

        {/* Meal Plan Generator Toggle Button */}
        <GlassCard className="p-4 cursor-pointer" onClick={() => setShowMealPlanGenerator(!showMealPlanGenerator)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">AI Meal Plan Generator</h3>
                <p className="text-xs text-white/60">Create custom meal plans</p>
              </div>
            </div>
            <ChevronRight className={`h-5 w-5 text-white/60 transition-transform ${showMealPlanGenerator ? 'rotate-90' : ''}`} />
          </div>
        </GlassCard>
      </div>

      {/* AI Components */}
      {showAIAssistant && (
        <NutritionAI 
          onActionClick={(action) => {
            switch(action) {
              case 'search-protein':
                navigate('/calories-tracker/food-search?category=protein');
                break;
              case 'log-water':
                const newWaterAmount = Math.min(dailyStats.waterConsumed + 1, dailyStats.waterTarget);
                setDailyStats(prev => ({ ...prev, waterConsumed: newWaterAmount }));
                if (isAuthenticated) {
                  caloriesApi.updateWaterIntake({
                    glasses: 1,
                    date: new Date().toISOString().split('T')[0]
                  }).then(() => refreshDashboard());
                }
                break;
            }
          }}
        />
      )}

      {showMealPlanGenerator && (
        <MealPlanGenerator 
          onPlanGenerated={(plan) => {
            console.log('Meal plan generated:', plan);
            // Could navigate to a meal plan view or show a success message
          }}
        />
      )}

      {/* Motivational Footer */}
      <GlassCard className="p-4" gradient>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg">
              <Target className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Keep Going!</h3>
              <p className="text-xs text-white/60">
                You're on a {dailyStats.currentStreak}-day streak. {dailyStats.longestStreak - dailyStats.currentStreak} days to beat your record!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => navigate('/calories-tracker/profile')}>
              Update Goals
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-8 text-xs" onClick={() => navigate('/calories-tracker/progress')}>
              View Progress
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CaloriesTrackerDashboard;