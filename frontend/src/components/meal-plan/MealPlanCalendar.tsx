import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Grid, List, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MealPlan, MealPlanMeal, MealType } from '../../types/mealPlan';
import { MealSlot } from './MealSlot';
import { RecipePicker } from './RecipePicker';
import { useRecipes } from '../../hooks/useRecipes';

interface MealPlanCalendarProps {
  selectedMealPlan?: MealPlan;
  onMealPlanChange?: (mealPlan: MealPlan) => void;
  onViewDetails?: (mealPlan: MealPlan) => void;
}

type ViewMode = 'week' | 'day';

interface GroupedMeals {
  [date: string]: {
    [K in MealType]?: MealPlanMeal[];
  };
}

export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  selectedMealPlan,
  onViewDetails
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    mealType: MealType;
  } | null>(null);

  const { data: recipesData } = useRecipes();
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  // Get start of current week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  };

  // Get week dates
  const getWeekDates = (weekStart: Date): Date[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDates = getWeekDates(weekStart);

  // Group meals by date
  const groupedMeals = useMemo(() => {
    if (!selectedMealPlan?.meals) return {};
    
    const grouped: GroupedMeals = {};
    selectedMealPlan.meals.forEach(meal => {
      if (!grouped[meal.plannedDate]) {
        grouped[meal.plannedDate] = {};
      }
      if (!grouped[meal.plannedDate][meal.mealType]) {
        grouped[meal.plannedDate][meal.mealType] = [];
      }
      grouped[meal.plannedDate][meal.mealType]!.push(meal);
    });
    
    return grouped;
  }, [selectedMealPlan?.meals]);

  const formatDate = (date: Date, format: 'short' | 'long' = 'short') => {
    if (format === 'long') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };


  const handleAddMeal = (date: string, mealType: MealType) => {
    setSelectedSlot({ date, mealType });
    setShowRecipePicker(true);
  };

  const handleRecipeSelect = (recipe: any) => {
    // This would normally update the meal plan through a service
    console.log('Selected recipe for meal plan:', recipe, selectedSlot);
    setShowRecipePicker(false);
    setSelectedSlot(null);
  };

  const getMealCountForDate = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = groupedMeals[dateStr];
    if (!dayMeals) return 0;
    
    return Object.values(dayMeals).flat().length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {weekStart.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {selectedMealPlan && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedMealPlan.name}</Badge>
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(selectedMealPlan)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            <List className="h-4 w-4 mr-2" />
            Day
          </Button>
        </div>
      </div>

      {!selectedMealPlan ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">No Meal Plan Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select or create a meal plan to start planning your meals
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'week' ? (
        /* Week View */
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-8 gap-4">
              {/* Meal Type Labels */}
              <div className="space-y-4">
                <div className="h-16 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">Meal Type</span>
                </div>
                {mealTypes.map(mealType => (
                  <div key={mealType} className="h-24 flex items-center">
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300 -rotate-0">
                      {mealType}
                    </span>
                  </div>
                ))}
              </div>

              {/* Week Days */}
              {weekDates.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayMeals = groupedMeals[dateStr] || {};
                
                return (
                  <div key={dayIndex} className="space-y-4">
                    {/* Day Header */}
                    <div className={`h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center ${
                      isToday(date) ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <span className={`text-sm font-medium ${
                        isToday(date) ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {formatDate(date, 'short')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getMealCountForDate(date)} meals
                      </span>
                    </div>

                    {/* Meal Slots */}
                    {mealTypes.map(mealType => {
                      const meals = dayMeals[mealType] || [];
                      
                      return (
                        <div key={mealType} className="h-24 space-y-2">
                          {meals.length > 0 ? (
                            <div className="space-y-1">
                              {meals.slice(0, 1).map((meal, index) => (
                                <div key={index} className="scale-90 origin-top">
                                  <MealSlot meal={meal} />
                                </div>
                              ))}
                              {meals.length > 1 && (
                                <div className="text-xs text-center text-gray-500">
                                  +{meals.length - 1} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              className="w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary"
                              onClick={() => handleAddMeal(dateStr, mealType)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Day View */
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{formatDate(selectedDate, 'long')}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    prev.setDate(selectedDate.getDate() - 1);
                    setSelectedDate(prev);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = new Date(selectedDate);
                    next.setDate(selectedDate.getDate() + 1);
                    setSelectedDate(next);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {mealTypes.map(mealType => {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const meals = groupedMeals[dateStr]?.[mealType] || [];
                
                return (
                  <div key={mealType} className="space-y-4">
                    <h3 className="font-semibold capitalize text-lg">{mealType}</h3>
                    <div className="space-y-3 min-h-[200px]">
                      {meals.map((meal, index) => (
                        <MealSlot key={index} meal={meal} />
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600"
                        onClick={() => handleAddMeal(dateStr, mealType)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add {mealType}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
        <RecipePicker
          isOpen={showRecipePicker}
          onClose={() => {
            setShowRecipePicker(false);
            setSelectedSlot(null);
          }}
          onSelectRecipe={handleRecipeSelect}
          recipes={recipesData?.data || []}
          mealType={selectedSlot?.mealType}
        />
      )}
    </div>
  );
};