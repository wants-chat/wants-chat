// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRecipes, useRecipeActions, type Recipe } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { RecipeHeader } from '../../components/recipe/RecipeHeader';
import { RecipeTabs } from '../../components/recipe/RecipeTabs';
import { RecipeDashboard } from '../../components/recipe/RecipeDashboard';
import { RecipeList } from '../../components/recipe/RecipeList';
import { AllRecipesList } from '../../components/recipe/AllRecipesList';
import { RecipeCategories } from '../../components/recipe/RecipeCategories';
import { MealPlanList } from '../../components/meal-plan/MealPlanList';
import { MealPlan } from '../../types/recipe';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

const RecipeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Only fetch user recipes if authenticated
  const { data: recipesData, loading: recipesLoading, error, refetch: refetchRecipes } = useRecipes();
  const recipes: Recipe[] = isAuthenticated ? (recipesData?.data || []) : [];
  const { toggleFavorite } = useRecipeActions(refetchRecipes);

  const loading = authLoading || (isAuthenticated && recipesLoading);

  // Get initial tab from URL params, default to 'dashboard' for auth users or 'all-recipes' for guests
  const getInitialTab = (): 'dashboard' | 'recipes' | 'all-recipes' | 'categories' | 'meal-plan' => {
    const tab = searchParams.get('tab');
    const validTabs = ['dashboard', 'recipes', 'all-recipes', 'categories', 'meal-plan'];

    if (validTabs.includes(tab || '')) {
      // If unauthenticated and trying to access protected tab, redirect to all-recipes
      if (!isAuthenticated && tab !== 'all-recipes') {
        return 'all-recipes';
      }
      return tab as any;
    }

    // Default: authenticated users see dashboard, guests see all-recipes
    return isAuthenticated ? 'dashboard' : 'all-recipes';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'recipes' | 'all-recipes' | 'categories' | 'meal-plan'>(getInitialTab());

  // Function to change tab and update URL
  const changeTab = (tab: 'dashboard' | 'recipes' | 'all-recipes' | 'categories' | 'meal-plan') => {
    // If not authenticated and trying to access protected tabs, redirect to login
    if (!isAuthenticated && tab !== 'all-recipes') {
      navigate('/login');
      return;
    }
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync tab with URL changes (browser back/forward)
  useEffect(() => {
    const currentTab = getInitialTab();
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  // Check authentication - only redirect if not loading, not authenticated, and not on all-recipes tab
  useEffect(() => {
    if (!authLoading && !isAuthenticated && activeTab !== 'all-recipes') {
      navigate('/login');
      return;
    }
  }, [authLoading, isAuthenticated, activeTab, navigate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  
  // Meal plan state
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {}
  });

  const handleToggleFavorite = async (recipeId: string, isCurrentlyFavorited: boolean) => {
    try {
      await toggleFavorite(recipeId, isCurrentlyFavorited, () => {
        // Force refetch of recipes to update the UI
        refetchRecipes();
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (recipe.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         (recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false);
    const matchesCuisine = filterCuisine === 'all' || recipe.cuisine === filterCuisine;
    const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
    return matchesSearch && matchesCuisine && matchesDifficulty;
  });

  // Get unique cuisines and difficulties
  const cuisines = Array.from(new Set(recipes.map(recipe => recipe.cuisine).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        <RecipeHeader
          title="Recipe Builder"
          subtitle="Create, manage and discover amazing recipes"
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <RecipeTabs
              activeTab={activeTab}
              onTabChange={changeTab}
            />
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <span className="ml-4 text-lg text-white">
                {authLoading ? 'Checking authentication...' : 'Loading recipes...'}
              </span>
            </div>
          )}

          {/* Error State - Only show for authenticated users on protected tabs */}
          {error && isAuthenticated && activeTab !== 'all-recipes' && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-xl">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">
                    Error loading recipes
                  </h3>
                  <div className="mt-2 text-sm text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Not Authenticated - Only show on protected tabs */}
          {!authLoading && !isAuthenticated && activeTab !== 'all-recipes' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Please log in to access Recipe Builder
              </h2>
            </div>
          )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && !authLoading && isAuthenticated && !recipesLoading && (
          <RecipeDashboard
            recipes={recipes}
            onNavigate={navigate}
          />
        )}

        {activeTab === 'recipes' && !authLoading && isAuthenticated && !recipesLoading && (
          <RecipeList
            recipes={filteredRecipes}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCuisine={filterCuisine}
            onCuisineChange={setFilterCuisine}
            filterDifficulty={filterDifficulty}
            onDifficultyChange={setFilterDifficulty}
            cuisines={cuisines}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={navigate}
          />
        )}

        {activeTab === 'all-recipes' && (
          <AllRecipesList />
        )}

        {activeTab === 'categories' && !authLoading && isAuthenticated && !recipesLoading && (
          <RecipeCategories
            recipes={recipes}
            onNavigate={navigate}
          />
        )}

        {activeTab === 'meal-plan' && !authLoading && isAuthenticated && !recipesLoading && (
          <div className="space-y-6">
            <MealPlanList
              onViewDetails={(mealPlan) => {
                // Handle view details - could open a dialog or navigate
                console.log('View meal plan:', mealPlan);
              }}
              onEdit={(mealPlan) => {
                // Handle edit - could open edit dialog
                console.log('Edit meal plan:', mealPlan);
              }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipeBuilder;