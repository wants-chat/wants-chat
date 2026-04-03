import React from 'react';
import { Calendar, ChefHat, Plus, Clock, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMealPlansDashboard } from '../../hooks/useMealPlans';

interface MealPlanOverviewProps {
  onNavigateToPlanner: () => void;
  onCreatePlan: () => void;
  onRefetch?: () => void;
}

export const MealPlanOverview: React.FC<MealPlanOverviewProps> = ({
  onNavigateToPlanner,
  onCreatePlan}) => {
  const { currentWeekPlan, recentPlans, isLoading } = useMealPlansDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate) {
      end.setDate(start.getDate() + 6);
    }
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getTotalMeals = (plan: any) => {
    if (!plan?.meals) return 0;
    // New structure: meals is an array
    if (Array.isArray(plan.meals)) {
      return plan.meals.length;
    }
    // Legacy structure: meals is an object
    return Object.values(plan.meals as Record<string, any[]>).flat().length;
  };

  const getMealsByType = (plan: any): Record<string, number> => {
    if (!plan?.meals) return {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    };
    
    const counts = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    };
    
    // New structure: meals is an array
    if (Array.isArray(plan.meals)) {
      plan.meals.forEach((meal: any) => {
        // Use camelCase mealType (should be transformed by service)
        const mealType = meal.mealType || meal.meal_type;
        if (counts.hasOwnProperty(mealType)) {
          counts[mealType as keyof typeof counts]++;
        }
      });
    } else {
      // Legacy structure: meals is an object
      Object.values(plan.meals as Record<string, any[]>).flat().forEach((meal: any) => {
        const mealType = meal.mealType || meal.meal_type;
        if (counts.hasOwnProperty(mealType)) {
          counts[mealType as keyof typeof counts]++;
        }
      });
    }
    
    return counts;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Your Meal Plans</h2>
        <Button
          onClick={onNavigateToPlanner}
          variant="outline"
          size="sm"
          className="gap-2 text-white border-white/20 hover:bg-white/10"
        >
          <Eye className="h-4 w-4" />
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Week Plan */}
        <Card className="border-primary/20 bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-white">This Week</CardTitle>
              </div>
              {currentWeekPlan && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Active
                </Badge>
              )}
            </div>
            {currentWeekPlan ? (
              <CardDescription className="text-white/60">
                {formatDateRange(currentWeekPlan.startDate, currentWeekPlan.endDate)}
              </CardDescription>
            ) : (
              <CardDescription className="text-white/60">
                No meal plan for this week
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentWeekPlan ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-medium text-white">{currentWeekPlan.name || `Week of ${new Date(currentWeekPlan.startDate).toLocaleDateString()}`}</h3>
                  <p className="text-sm text-white/60 line-clamp-2">
                    Your meal plan for this week
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getTotalMeals(currentWeekPlan)}
                    </div>
                    <div className="text-xs text-white/60">Total Meals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {Object.values(getMealsByType(currentWeekPlan)).filter(count => count > 0).length}
                    </div>
                    <div className="text-xs text-white/60">Meal Types</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={onNavigateToPlanner}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                  >
                    View Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-white border-white/20 hover:bg-white/10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Shop
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="font-medium mb-2 text-white">No Plan Yet</h3>
                <p className="text-sm text-white/60 mb-4">
                  Create a meal plan to organize your week
                </p>
                <Button
                  size="sm"
                  onClick={onCreatePlan}
                  className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Plans */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg text-white">Recent Plans</CardTitle>
            </div>
            <CardDescription className="text-white/60">
              Your latest meal plans
            </CardDescription>
          </CardHeader>

          <CardContent>
            {recentPlans.length > 0 ? (
              <div className="space-y-3">
                {recentPlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm line-clamp-1 text-white">
                        {plan.name || `Week of ${new Date(plan.startDate).toLocaleDateString()}`}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {formatDateRange(plan.startDate, plan.endDate)} • {getTotalMeals(plan)} meals
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        weekly
                      </Badge>
                    </div>
                  </div>
                ))}

                {recentPlans.length > 3 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNavigateToPlanner}
                      className="text-xs text-white hover:bg-white/10"
                    >
                      View all {recentPlans.length} plans
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="font-medium mb-2 text-white">No Plans Yet</h3>
                <p className="text-sm text-white/60 mb-4">
                  Start planning your meals to see them here
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCreatePlan}
                  className="gap-2 text-white border-white/20 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                  Create First Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/10 to-orange-500/10 border-primary/20 backdrop-blur-sm">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1 text-white">Ready to plan your meals?</h3>
              <p className="text-sm text-white/60">
                Create organized meal plans and generate shopping lists automatically
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onCreatePlan}
                className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              >
                <Plus className="h-4 w-4" />
                Create Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};