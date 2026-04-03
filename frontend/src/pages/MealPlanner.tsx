import React, { useState, useCallback } from 'react';
import { Calendar, List, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { WeeklyMealPlanner } from '../components/meal-plan/WeeklyMealPlanner';
import { MealPlanOverview } from '../components/meal-plan/MealPlanOverview';
import { CreateMealPlanDialog } from '../components/meal-plan/CreateMealPlanDialog';
import { useMealPlans, useMealPlansDashboard } from '../hooks/useMealPlans';

export const MealPlannerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('planner');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: allMealPlans, refetch: refetchAllPlans } = useMealPlans();
  const { refetch: refetchDashboard } = useMealPlansDashboard();

  const handleMealPlanSuccess = useCallback(() => {
    refetchAllPlans();
    refetchDashboard();
    setShowCreateDialog(false);
  }, [refetchAllPlans, refetchDashboard]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Meal Planner
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Plan your meals, organize recipes, and generate shopping lists
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="planner" className="gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Planner
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <List className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6">
            <WeeklyMealPlanner />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <MealPlanOverview
              onNavigateToPlanner={() => setActiveTab('planner')}
              onCreatePlan={() => setShowCreateDialog(true)}
              onRefetch={refetchDashboard}
            />

            {/* All Meal Plans List */}
            {allMealPlans && allMealPlans.data.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Meal Plans</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allMealPlans.data.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {plan.name || `Week of ${new Date(plan.startDate).toLocaleDateString()}`}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              Meal plan for the week
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                          </span>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-medium">
                            Weekly
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary">
                              {plan.meals ? plan.meals.length : 0}
                            </div>
                            <div className="text-xs text-gray-500">Meals</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">
                              7
                            </div>
                            <div className="text-xs text-gray-500">Days</div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Meal Plan Dialog */}
      <CreateMealPlanDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleMealPlanSuccess}
      />
    </div>
  );
};