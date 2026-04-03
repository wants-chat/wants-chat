import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Recipe } from '../../types/recipe';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipeHeader } from '../../components/recipe/RecipeHeader';
import { CategoryStats } from '../../components/recipe/CategoryStats';
import { RecipeSearchAndFilter } from '../../components/recipe/RecipeSearchAndFilter';
import { RecipeGrid } from '../../components/recipe/RecipeGrid';
import { recipeService } from '../../services/recipeService';
import { toast } from 'sonner';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

const CategoryRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category || '');
  
  // Fetch all recipes and filter by cuisine
  const { data: recipesData, loading, error } = useRecipes({
    cuisine: decodedCategory,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'time' | 'date'>('rating');
  
  // Get recipes from the fetched data
  const recipes = recipesData?.data || [];
  
  // Filter and sort recipes
  const filteredAndSortedRecipes = React.useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesSearch = !searchQuery || 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false);
      
      const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
      
      return matchesSearch && matchesDifficulty;
    });
    
    // Sort recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'time':
          const timeA = (a.prepTime || 0) + (a.cookTime || 0);
          const timeB = (b.prepTime || 0) + (b.cookTime || 0);
          return timeA - timeB;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [recipes, searchQuery, filterDifficulty, sortBy]);
  
  const handleToggleFavorite = useCallback(async (recipeId: string) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      const isCurrentlyFavorited = recipe?.isFavorited;

      if (isCurrentlyFavorited) {
        await recipeService.removeFromFavorites(recipeId);
        toast.success('Removed from favorites');
      } else {
        await recipeService.addToFavorites(recipeId);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  }, [recipes]);
  
  // Calculate stats for the category
  const categoryStats = React.useMemo(() => {
    if (recipes.length === 0) return null;
    
    const avgRating = recipes.reduce((acc, r) => acc + (r.rating || 0), 0) / recipes.length;
    const avgTime = recipes.reduce((acc, r) => acc + (r.prepTime || 0) + (r.cookTime || 0), 0) / recipes.length;
    const favorites = recipes.filter(r => r.isFavorited).length;
    
    return {
      total: recipes.length,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place as number
      avgTime: Math.round(avgTime),
      favorites
    };
  }, [recipes]);
  
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="relative z-10">
          <RecipeHeader
            title={decodedCategory}
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => navigate('/recipe-builder?tab=categories')}
          />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
              <h2 className="text-xl font-semibold mb-2 text-white">Loading {decodedCategory} recipes...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="relative z-10">
          <RecipeHeader
            title={decodedCategory}
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => navigate('/recipe-builder?tab=categories')}
          />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Failed to load recipes</h2>
              <p className="text-white/60">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        <RecipeHeader
          title={decodedCategory}
          theme={theme}
          toggleTheme={toggleTheme}
          onBack={() => navigate('/recipe-builder?tab=categories')}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Stats */}
        {categoryStats && (
          <CategoryStats 
            stats={categoryStats}
          />
        )}

        {/* Search and Filter */}
        <RecipeSearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={(query) => setSearchQuery(query)}
          filterDifficulty={filterDifficulty}
          onFilterChange={(difficulty) => setFilterDifficulty(difficulty as 'all' | 'easy' | 'medium' | 'hard')}
          sortBy={sortBy}
          onSortChange={(sort) => setSortBy(sort)}
          filteredCount={filteredAndSortedRecipes.length}
          totalCount={recipes.length}
        />

          {/* Recipe Grid */}
          <RecipeGrid
            recipes={filteredAndSortedRecipes}
            onToggleFavorite={handleToggleFavorite}
            emptyStateConfig={{
              title: `No ${decodedCategory} recipes found`,
              description: searchQuery
                ? `Try adjusting your search criteria`
                : `Be the first to add a ${decodedCategory} recipe!`,
              actionLabel: 'Add Recipe',
              onAction: () => navigate('/recipe-builder/add')
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default CategoryRecipes;