import React, { useState, useCallback } from 'react';
import { WeeklyMealPlanner } from '../meal-plan/WeeklyMealPlanner';
import { MealPlanOverview } from '../meal-plan/MealPlanOverview';
import { CreateMealPlanDialog } from '../meal-plan/CreateMealPlanDialog';
import { useMealPlansDashboard } from '../../hooks/useMealPlans';

interface RecipeMealPlanProps {}

export const RecipeMealPlan: React.FC<RecipeMealPlanProps> = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { refetch } = useMealPlansDashboard();

  const handleMealPlanSuccess = useCallback(() => {
    refetch();
    setShowCreateDialog(false);
  }, [refetch]);

  return (
    <div className="space-y-6">
      {/* Meal Plan Overview */}
      <MealPlanOverview
        onNavigateToPlanner={() => {
          // In the context of the recipe builder, we'll just show the planner below
        }}
        onCreatePlan={() => setShowCreateDialog(true)}
        onRefetch={refetch}
      />

      {/* Weekly Meal Planner */}
      <WeeklyMealPlanner />

      {/* Create Meal Plan Dialog */}
      <CreateMealPlanDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleMealPlanSuccess}
      />
    </div>
  );
};