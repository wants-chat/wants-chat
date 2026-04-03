import React, { useState } from 'react';
import { X, Calendar, Plus, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useCreateMealPlan } from '../../hooks/useMealPlans';
import { CreateMealPlanDto, MealPlanMeal, MealType } from '../../types/mealPlan';
import { toast } from '../ui/use-toast';

interface CreateMealPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: Date;
  onSuccess?: () => void;
}

interface WeeklyMeals {
  [key: string]: {
    [key in MealType]?: MealPlanMeal;
  };
}

export const CreateMealPlanDialog: React.FC<CreateMealPlanDialogProps> = ({
  isOpen,
  onClose,
  startDate,
  onSuccess
}) => {
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(
    startDate || new Date()
  );
  
  const createMealPlan = useCreateMealPlan(onSuccess);

  // Initialize weekly meals structure
  const getWeekDates = (start: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedStartDate);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeals>({});

  const handleCreateQuickPlan = async () => {
    // Validate required fields
    if (!planName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your meal plan',
        variant: 'destructive',
      });
      return;
    }

    if (!planDescription.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please enter a description for your meal plan',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Calculate end date (6 days after start date for a week)
      const endDate = new Date(selectedStartDate);
      endDate.setDate(endDate.getDate() + 6);

      const planData: CreateMealPlanDto = {
        name: planName.trim(),
        description: planDescription.trim(),
        planType: 'weekly',
        startDate: selectedStartDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        meals: [],
        tags: []
      };

      await createMealPlan.mutateAsync(planData);

      toast({
        title: 'Success',
        description: 'Meal plan created successfully!',
      });

      onClose();
      // Reset form
      setPlanName('');
      setPlanDescription('');
      setWeeklyMeals({});
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create meal plan',
        variant: 'destructive',
      });
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Create Meal Plan</h2>
            <p className="text-white/60 mt-1">
              Plan your meals for the week
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Meal Plan Name *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Healthy Week Plan"
                className="w-full px-3 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Description
              </label>
              <textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Add notes about this meal plan..."
                rows={3}
                className="w-full px-3 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Week Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="date"
                  value={selectedStartDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedStartDate(new Date(e.target.value))}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Week Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Week Overview
            </h3>

            <div className="grid grid-cols-7 gap-2 text-sm">
              {weekDates.map((date, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium text-white">{dayNames[date.getDay()]}</div>
                  <div className="text-white/60 text-xs">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Create Options</h3>

            <div className="flex justify-center">
              {/* Quick Plan Option */}
              <Card className="border-2 border-dashed border-white/20 hover:border-primary transition-colors max-w-md bg-white/5 backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Create Meal Plan</h4>
                    <p className="text-sm text-white/60 mb-4">
                      Create an empty meal plan and add recipes later
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateQuickPlan}
                    disabled={createMealPlan.loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                  >
                    {createMealPlan.loading ? 'Creating...' : 'Create Meal Plan'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-white border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};