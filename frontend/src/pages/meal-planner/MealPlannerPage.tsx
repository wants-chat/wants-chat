import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { MealPlanList } from '../../components/meal-plan/MealPlanList';
import { MealPlan } from '../../types/mealPlan';
import { useTheme } from '../../contexts/ThemeContext';

const MealPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleViewDetails = (mealPlan: MealPlan) => {
    // Navigate to meal plan detail page
    navigate(`/meal-planner/${mealPlan.id}`);
  };

  const handleEdit = (mealPlan: MealPlan) => {
    // Navigate to edit page
    navigate(`/meal-planner/edit/${mealPlan.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Meal Planner</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Organize your meals for the week</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MealPlanList 
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      </main>
    </div>
  );
};

export default MealPlannerPage;