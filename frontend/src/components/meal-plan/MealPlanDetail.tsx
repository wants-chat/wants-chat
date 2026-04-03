import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Edit, Save, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MealPlan, MealPlanMeal, MealType } from '../../types/mealPlan';
import { useMealPlan, useUpdateMealPlan } from '../../hooks/useMealPlans';
import { useRecipes } from '../../hooks/useRecipes';
import { toast } from '../ui/use-toast';
import { MealSlot } from './MealSlot';
import { RecipePicker } from './RecipePicker';

interface MealPlanDetailProps {
  mealPlanId: string;
  onBack: () => void;
}

interface GroupedMeals {
  [date: string]: {
    [K in MealType]?: MealPlanMeal[];
  };
}

export const MealPlanDetail: React.FC<MealPlanDetailProps> = ({
  mealPlanId,
  onBack
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedPlan, setEditedPlan] = useState<Partial<MealPlan>>({});
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    mealType: MealType;
  } | null>(null);

  const { data: mealPlan, loading, error, refetch } = useMealPlan(mealPlanId);
  const { data: recipesData } = useRecipes();
  const updateMealPlan = useUpdateMealPlan();

  useEffect(() => {
    if (mealPlan && !isEditing) {
      setEditedPlan(mealPlan);
    }
  }, [mealPlan, isEditing]);

  const handleSave = async () => {
    if (!mealPlan || !editedPlan || isSaving) return;

    setIsSaving(true);

    // Show loading state
    toast({
      title: 'Saving...',
      description: 'Updating your meal plan',
    });

    try {
      // Format meals properly for the API
      const formattedMeals = (editedPlan.meals || []).map(meal => ({
        recipeId: meal.recipeId,
        mealType: meal.mealType,
        plannedDate: meal.plannedDate,
        servings: meal.servings || 1,
        notes: meal.notes || ''
      }));

      console.log('Saving meal plan with meals:', formattedMeals);
      console.log('Full editedPlan:', editedPlan);

      await updateMealPlan.mutateAsync({
        id: mealPlan.id,
        data: {
          name: editedPlan.name || mealPlan.name,
          description: editedPlan.description || mealPlan.description,
          planType: editedPlan.planType || mealPlan.planType,
          startDate: editedPlan.startDate || mealPlan.startDate,
          endDate: editedPlan.endDate || mealPlan.endDate,
          meals: formattedMeals,
          tags: editedPlan.tags || mealPlan.tags || [],
          metadata: editedPlan.metadata || mealPlan.metadata
        }
      });

      toast({
        title: '✅ Success',
        description: 'Your meal plan has been updated successfully!',
      });

      setIsEditing(false);
      
      // Refetch to get the latest data with proper structure
      await refetch();
      
      // The mealPlan will be updated by the refetch, and editedPlan will be 
      // updated by the useEffect when mealPlan changes
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update meal plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMeal = (date: string, mealType: MealType) => {
    setSelectedSlot({ date, mealType });
    setShowRecipePicker(true);
  };

  const handleRecipeSelect = (recipe: any) => {
    if (!selectedSlot) return;

    // Ensure date is in YYYY-MM-DD format
    const plannedDate = selectedSlot.date.split('T')[0];
    
    const newMeal: Omit<MealPlanMeal, 'id' | 'recipe'> = {
      recipeId: recipe.id,
      mealType: selectedSlot.mealType,
      plannedDate: plannedDate,
      servings: recipe.servings || 1,
      notes: ''
    };

    // Ensure editedPlan has all the required fields from mealPlan
    const currentMeals = editedPlan.meals || mealPlan?.meals || [];
    
    setEditedPlan({
      ...mealPlan, // Start with the full mealPlan data
      ...editedPlan, // Override with any edits
      meals: [...currentMeals, newMeal as MealPlanMeal]
    });

    setShowRecipePicker(false);
    setSelectedSlot(null);
  };

  const handleRemoveMeal = (mealIndex: number) => {
    console.log('handleRemoveMeal called with index:', mealIndex);
    console.log('Current editedPlan.meals:', editedPlan.meals);
    
    if (!editedPlan.meals) {
      console.log('No meals in editedPlan');
      return;
    }

    const updatedMeals = editedPlan.meals.filter((_, index) => index !== mealIndex);
    console.log('Updated meals after removal:', updatedMeals);
    
    setEditedPlan({
      ...editedPlan,
      meals: updatedMeals
    });
  };

  const groupMealsByDate = (meals: MealPlanMeal[]): GroupedMeals => {
    const grouped: GroupedMeals = {};
    
    meals.forEach(meal => {
      // Normalize the date to YYYY-MM-DD format
      const normalizedDate = meal.plannedDate.split('T')[0];
      
      if (!grouped[normalizedDate]) {
        grouped[normalizedDate] = {};
      }
      if (!grouped[normalizedDate][meal.mealType]) {
        grouped[normalizedDate][meal.mealType] = [];
      }
      grouped[normalizedDate][meal.mealType]!.push(meal);
    });

    return grouped;
  };

  const getDateRange = (startDate: string, endDate: string): string[] => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Normalize dates to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Use YYYY-MM-DD format consistently
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    return dates;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load meal plan</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Use editedPlan.meals when editing, otherwise use mealPlan.meals
  const currentMeals = isEditing ? (editedPlan.meals || []) : (mealPlan.meals || []);
  
  console.log('MealPlanDetail - isEditing:', isEditing);
  console.log('MealPlanDetail - mealPlan:', mealPlan);
  console.log('MealPlanDetail - editedPlan:', editedPlan);
  console.log('MealPlanDetail - currentMeals:', currentMeals);
  
  const groupedMeals = groupMealsByDate(currentMeals);
  console.log('MealPlanDetail - groupedMeals:', groupedMeals);
  
  const dateRange = getDateRange(mealPlan.startDate, mealPlan.endDate);
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {isEditing ? (
              <Input
                value={editedPlan.name || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                className="text-2xl font-bold border-none p-0 h-auto"
              />
            ) : (
              <h1 className="text-2xl font-bold">{mealPlan.name}</h1>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(mealPlan.startDate)} - {formatDate(mealPlan.endDate)}
              </span>
              <Badge variant="secondary">
                {mealPlan.planType}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                console.log('Canceling edit mode, resetting to:', mealPlan);
                setIsEditing(false);
                setEditedPlan({...mealPlan});
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || updateMealPlan.loading}
                className={isSaving ? 'opacity-75' : ''}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => {
              console.log('Entering edit mode with mealPlan:', mealPlan);
              setIsEditing(true);
              // Ensure editedPlan is initialized with current mealPlan data
              setEditedPlan({...mealPlan});
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {isEditing ? (
        <Textarea
          value={editedPlan.description || ''}
          onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
          placeholder="Add a description for your meal plan..."
          className="resize-none"
          rows={3}
        />
      ) : (
        mealPlan.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-400">{mealPlan.description}</p>
            </CardContent>
          </Card>
        )
      )}

      {/* Meal Plan Calendar */}
      <div className="space-y-4">
        {dateRange.map(date => (
          <Card key={date} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{formatDate(date)}</span>
                <span className="text-sm font-normal text-gray-500">
                  {groupedMeals[date] ? 
                    Object.values(groupedMeals[date]).flat().length : 0
                  } meals planned
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {mealTypes.map(mealType => (
                  <div key={mealType} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {mealType}
                    </h4>
                    <div className="space-y-2 min-h-[100px]">
                      {groupedMeals[date]?.[mealType]?.map((meal, index) => (
                        <MealSlot
                          key={`${date}-${mealType}-${index}`}
                          meal={meal}
                          isEditing={isEditing}
                          onRemove={isEditing ? () => {
                            // Find the meal in the current meals array
                            const mealsToSearch = isEditing ? (editedPlan.meals || []) : (mealPlan.meals || []);
                            const mealIndex = mealsToSearch.findIndex(m => {
                              // Normalize dates for comparison
                              const mealDate = m.plannedDate.split('T')[0];
                              const targetDate = date.split('T')[0];
                              return mealDate === targetDate && 
                                     m.mealType === mealType && 
                                     m.recipeId === meal.recipeId;
                            });
                            
                            console.log('Removing meal at index:', mealIndex, 'from meals:', mealsToSearch);
                            
                            if (mealIndex !== -1) {
                              handleRemoveMeal(mealIndex);
                            }
                          } : undefined}
                        />
                      )) || []}
                      
                      {isEditing && (
                        <Button
                          variant="outline"
                          className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600"
                          onClick={() => handleAddMeal(date, mealType)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {mealType}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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