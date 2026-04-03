import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ShoppingCart,
  Calendar,
  Clock,
  Users,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useCurrentWeekMealPlan, useDeleteMealPlan, useGenerateShoppingList, useUpdateMealPlan } from '../../hooks/useMealPlans';
import { useRecipes } from '../../hooks/useRecipes';
import { useNavigate } from 'react-router-dom';
import { RecipeSelector } from './RecipeSelector';
import { toast } from '../ui/use-toast';
import { Recipe } from '../../types/recipe';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Define MealPlanItem interface locally since it's not exported
interface MealPlanItem {
  recipe_id: string;
  meal_type: MealType;
  planned_date: string;
  servings: number;
}

// Define meals structure
interface MealsMap {
  [date: string]: MealPlanItem[];
}

interface WeeklyMealPlannerProps {
  className?: string;
}

interface MealSlot {
  date: string;
  mealType: MealType;
  meal?: MealPlanItem;
  recipe?: any;
}

export const WeeklyMealPlanner: React.FC<WeeklyMealPlannerProps> = ({ className }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });
  const navigate = useNavigate();
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{ date: string; mealType: MealType } | null>(null);

  // Get current week meal plan
  const { data: currentWeekPlan, loading: isLoadingCurrentWeek, refetch } = useCurrentWeekMealPlan();
  
  const deleteMP = useDeleteMealPlan(refetch);
  const generateSL = useGenerateShoppingList();
  const updateMP = useUpdateMealPlan(refetch);
  
  // Get recipes for populating meal slots
  const { data: recipesData } = useRecipes();
  const recipes = recipesData?.data || [];

  // Calculate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes: { type: MealType; label: string; icon: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { type: 'lunch', label: 'Lunch', icon: '☀️' },
    { type: 'dinner', label: 'Dinner', icon: '🌙' },
    { type: 'snack', label: 'Snack', icon: '🍎' },
  ];

  // Convert meals array to map by date
  const mealsMap = useMemo(() => {
    const map: MealsMap = {};
    if (currentWeekPlan?.meals && Array.isArray(currentWeekPlan.meals)) {
      currentWeekPlan.meals.forEach((meal: any) => {
        const date = meal.planned_date || meal.plannedDate;
        if (!map[date]) {
          map[date] = [];
        }
        map[date].push({
          recipe_id: meal.recipe_id || meal.recipeId,
          meal_type: meal.meal_type || meal.mealType,
          planned_date: date,
          servings: meal.servings
        });
      });
    }
    return map;
  }, [currentWeekPlan]);

  // Organize meals by date and type
  const mealSlots = useMemo(() => {
    const slots: MealSlot[] = [];
    
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      
      mealTypes.forEach(({ type }) => {
        const dayMeals = mealsMap[dateStr] || [];
        const meal = dayMeals.find(m => m.meal_type === type);
        
        const recipe = meal ? recipes.find(r => r.id === meal.recipe_id) : undefined;
        
        slots.push({
          date: dateStr,
          mealType: type,
          meal,
          recipe
        });
      });
    });
    
    return slots;
  }, [weekDates, currentWeekPlan, recipes]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const handleDeleteMealPlan = async () => {
    if (!currentWeekPlan) return;

    try {
      await deleteMP.mutateAsync(currentWeekPlan.id);
      toast({
        title: 'Success',
        description: 'Meal plan deleted successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete meal plan',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!currentWeekPlan) return;

    try {
      await generateSL.mutateAsync(currentWeekPlan.id);
      toast({
        title: 'Success',
        description: 'Shopping list generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate shopping list',
        variant: 'destructive',
      });
    }
  };

  const handleMealSlotClick = (date: string, mealType: MealType) => {
    setSelectedMealSlot({ date, mealType });
    setShowRecipeSelector(true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!selectedMealSlot || !currentWeekPlan) return;

    // Work with array format
    const currentMeals = Array.isArray(currentWeekPlan.meals) ? [...currentWeekPlan.meals] : [];
    
    // Remove existing meal of the same type for this date
    const filteredMeals = currentMeals.filter((m: any) => {
      const mealDate = m.planned_date || m.plannedDate;
      const mealType = m.meal_type || m.mealType;
      return !(mealDate === selectedMealSlot.date && mealType === selectedMealSlot.mealType);
    });

    // Add new meal
    const newMeal = {
      recipeId: recipe.id,
      mealType: selectedMealSlot.mealType,
      plannedDate: selectedMealSlot.date,
      servings: recipe.servings,
      notes: ''
    };

    filteredMeals.push(newMeal);

    try {
      await updateMP.mutateAsync({
        id: currentWeekPlan.id,
        data: { meals: filteredMeals }
      });

      toast({
        title: 'Success',
        description: `Added ${recipe.title} to your meal plan!`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add recipe to meal plan',
        variant: 'destructive',
      });
    }

    setShowRecipeSelector(false);
    setSelectedMealSlot(null);
  };

  const handleRemoveRecipe = async (date: string, mealType: MealType) => {
    if (!currentWeekPlan) return;

    // Work with array format
    const currentMeals = Array.isArray(currentWeekPlan.meals) ? [...currentWeekPlan.meals] : [];
    
    // Filter out the meal for this date and type
    const filteredMeals = currentMeals.filter((m: any) => {
      const mealDate = m.planned_date || m.plannedDate;
      const mType = m.meal_type || m.mealType;
      return !(mealDate === date && mType === mealType);
    });

    try {
      await updateMP.mutateAsync({
        id: currentWeekPlan.id,
        data: { meals: filteredMeals }
      });

      toast({
        title: 'Success',
        description: 'Recipe removed from meal plan',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove recipe from meal plan',
        variant: 'destructive',
      });
    }
  };

  const formatDateRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: currentWeekStart.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    };
    
    return `${formatDate(currentWeekStart)} - ${formatDate(endDate)}`;
  };

  if (isLoadingCurrentWeek) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Weekly Meal Planner</h2>
          <p className="text-white/60">
            {formatDateRange()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Week Navigation */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('prev')}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeekStart(new Date())}
              className="text-xs px-2 text-white hover:bg-white/10"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('next')}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Plan Actions */}
          {currentWeekPlan && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGenerateShoppingList}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Generate Shopping List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteMealPlan}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Create Plan Button */}
          <Button
            onClick={() => navigate('/meal-planner/create')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Meal Plan Grid */}
      <div className="grid grid-cols-8 gap-4">
        {/* Header row */}
        <div></div>
        {weekDates.map((date, index) => (
          <div key={index} className="text-center">
            <div className="font-semibold text-sm text-white">{dayNames[date.getDay()]}</div>
            <div className="text-xs text-white/60">
              {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
            </div>
          </div>
        ))}

        {/* Meal rows */}
        {mealTypes.map(({ type, label, icon }) => (
          <React.Fragment key={type}>
            {/* Meal type label */}
            <div className="flex items-center gap-2 py-2">
              <span className="text-lg">{icon}</span>
              <div>
                <div className="font-medium text-sm text-white">{label}</div>
              </div>
            </div>

            {/* Meal slots for each day */}
            {weekDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const slot = mealSlots.find(
                s => s.date === dateStr && s.mealType === type
              );

              return (
                <Card
                  key={`${dateStr}-${type}`}
                  className="min-h-[100px] border-dashed border-2 border-white/20 hover:border-primary transition-colors cursor-pointer group bg-white/5 backdrop-blur-sm"
                  onClick={() => handleMealSlotClick(dateStr, type)}
                >
                  <CardContent className="p-3 h-full">
                    {slot?.recipe ? (
                      <div className="space-y-2 relative">
                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/30 text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRecipe(dateStr, type);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>

                        <div className="font-medium text-sm line-clamp-2 pr-6 text-white">
                          {slot.recipe.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Clock className="h-3 w-3" />
                          {(slot.recipe.prepTime || 0) + (slot.recipe.cookTime || 0)}m
                          {slot.meal?.servings && (
                            <>
                              <Users className="h-3 w-3 ml-1" />
                              {slot.meal.servings}
                            </>
                          )}
                        </div>
                        {slot.recipe.cuisine && (
                          <Badge variant="secondary" className="text-xs">
                            {slot.recipe.cuisine}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/40">
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="text-xs">Add meal</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Empty State */}
      {!currentWeekPlan && (
        <Card className="border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Meal Plan for This Week</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Create a meal plan to organize your weekly meals and generate shopping lists automatically.
            </p>
            <Button onClick={() => navigate('/meal-planner/create')} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              Create Your First Meal Plan
            </Button>
          </CardContent>
        </Card>
      )}


      {/* Recipe Selector Dialog */}
      <RecipeSelector
        isOpen={showRecipeSelector}
        onClose={() => {
          setShowRecipeSelector(false);
          setSelectedMealSlot(null);
        }}
        onSelectRecipe={handleSelectRecipe}
        mealType={selectedMealSlot?.mealType}
        selectedDate={selectedMealSlot?.date}
      />
    </div>
  );
};