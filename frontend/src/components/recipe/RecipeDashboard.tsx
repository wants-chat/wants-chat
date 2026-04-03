import React, { useState, useEffect } from 'react';
import { Plus, Heart, Star, ChefHat, ShoppingBag, TrendingUp, Package, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Recipe } from '../../types/recipe';
import { recipeService, Recipe as ServiceRecipe } from '../../services/recipeService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../ui/use-toast';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import { RecipeGrid } from './RecipeGrid';

interface RecipeDashboardProps {
  recipes: Recipe[];
  onNavigate: (path: string) => void;
}

// Helper function to transform service recipe to frontend recipe
const transformServiceRecipe = (serviceRecipe: any): Recipe => {
  // Backend now returns camelCase (CLAUDE.md Rule #2)
  const recipe: Recipe = {
    id: serviceRecipe.id,
    title: serviceRecipe.title,
    description: serviceRecipe.description || '',
    ingredients: Array.isArray(serviceRecipe.ingredients) ? serviceRecipe.ingredients.map(String) : [],
    instructions: Array.isArray(serviceRecipe.instructions) ? serviceRecipe.instructions.map(String) : [],
    prepTime: serviceRecipe.prepTimeMinutes || 0,
    cookTime: serviceRecipe.cookTimeMinutes || 0,
    servings: serviceRecipe.servings || 0,
    difficulty: (serviceRecipe.difficulty as 'easy' | 'medium' | 'hard') || 'easy',
    category: serviceRecipe.category || 'Other',
    cuisine: serviceRecipe.cuisine || '',
    imageUrl: serviceRecipe.imageUrl || '',
    videoUrl: serviceRecipe.videoUrl || '',
    userId: serviceRecipe.userId || '',
    isPublic: serviceRecipe.isPublic || false,
    isFavorited: serviceRecipe.isFavorited || false,
    rating: serviceRecipe.averageRating || 0,
    ratingsCount: serviceRecipe.ratingCount || 0,
    tags: serviceRecipe.tags || [],
    nutrition: serviceRecipe.nutrition || null,
    createdAt: serviceRecipe.createdAt || '',
    updatedAt: serviceRecipe.updatedAt || '',
    aiAnalyzed: false
  };

  return recipe;
};

export const RecipeDashboard: React.FC<RecipeDashboardProps> = ({ recipes, onNavigate }) => {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [recipeStats, setRecipeStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [selectedShoppingList, setSelectedShoppingList] = useState<any>(null);
  const [shoppingDialogOpen, setShoppingDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  useEffect(() => {
    if (activeTab === 'favorites') loadFavorites();
    else if (activeTab === 'popular') loadPopular();
    else if (activeTab === 'shopping') loadShoppingLists();
    else if (activeTab === 'overview') loadStats();
  }, [activeTab]);

  // Load stats on mount and when recipes change
  useEffect(() => {
    loadStats();
  }, [recipes.length]);

  const loadStats = async () => {
    try {
      const [stats, favs, shoppingResponse] = await Promise.all([
        recipeService.getRecipeStats(),
        recipeService.getFavoriteRecipes(),
        recipeService.getShoppingLists({ limit: 100 }) // Get more than 10 for accurate count
      ]);

      // Update shopping lists state
      setShoppingLists(shoppingResponse.data || []);

      // Also update favorites for accurate count
      const transformedFavs = favs.map((fav: any) => {
        if (fav.recipe) {
          return { ...transformServiceRecipe(fav.recipe), isFavorited: true };
        }
        return transformServiceRecipe(fav);
      });
      setFavoriteRecipes(transformedFavs);

      // Enhance stats with actual favorites and shopping lists count
      // Backend now returns camelCase (CLAUDE.md Rule #2)
      setRecipeStats({
        totalRecipes: stats?.totalRecipes ?? recipes.length,
        averageRating: stats?.averageRating ?? 0,
        totalRatings: stats?.totalRatings ?? 0,
        totalFavorites: transformedFavs.length,
        totalShoppingLists: shoppingResponse.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      // On error, still set stats from props
      setRecipeStats({
        totalRecipes: recipes.length,
        totalFavorites: 0,
        averageRating: 0,
        totalRatings: 0,
        totalShoppingLists: 0
      });
    }
  };

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favs = await recipeService.getFavoriteRecipes();

      // The API returns favorites with nested recipe object
      const transformedFavs = favs.map((fav: any) => {
        // Check if it has a nested recipe object (from backend FavoriteRecipeDto)
        if (fav.recipe) {
          return {
            ...transformServiceRecipe(fav.recipe),
            isFavorited: true
          };
        }
        // Otherwise it's already a recipe object
        return { ...transformServiceRecipe(fav), isFavorited: true };
      });

      setFavoriteRecipes(transformedFavs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopular = async () => {
    setLoading(true);
    try {
      const popular = await recipeService.getPopularRecipes(10);
      // Backend returns camelCase (CLAUDE.md Rule #2)
      const transformedPopular = popular.map((item: any) => ({
        id: item.id,
        title: item.title || 'Unknown Recipe',
        description: item.description || '',
        ingredients: item.ingredients || [],
        instructions: item.instructions || [],
        prepTime: item.prepTimeMinutes || 0,
        cookTime: item.cookTimeMinutes || 0,
        servings: item.servings || 0,
        difficulty: (item.difficulty as 'easy' | 'medium' | 'hard') || 'easy',
        category: item.category || item.mealType || 'Other',
        cuisine: item.cuisine || '',
        imageUrl: item.imageUrl || '',
        videoUrl: '',
        userId: '',
        isPublic: true,
        isFavorited: false,
        rating: item.averageRating || 0,
        ratingsCount: item.ratingCount || 0,
        tags: item.tags || [],
        nutrition: null,
        createdAt: item.createdAt || '',
        updatedAt: item.updatedAt || '',
        aiAnalyzed: false,
        favoriteCount: item.favoriteCount || 0
      } as Recipe));
      setPopularRecipes(transformedPopular);
    } catch (error) {
      console.error('Failed to load popular recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingLists = async () => {
    setLoading(true);
    try {
      const response = await recipeService.getShoppingLists({ limit: 10 });
      setShoppingLists(response.data || []);
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateRecipe = (recipe: Recipe) => {
    console.log('Selected recipe for rating:', recipe);
    if (!recipe.id) {
      console.error('Recipe has no ID:', recipe);
      toast({ title: 'Cannot rate this recipe - missing ID', variant: 'destructive' });
      return;
    }
    setSelectedRecipe(recipe);
    setRating(5);
    setReview('');
    setRatingDialogOpen(true);
  };

  const submitRating = async () => {
    if (!selectedRecipe) {
      console.error('No recipe selected for rating');
      toast({ title: 'No recipe selected', variant: 'destructive' });
      return;
    }
    
    if (!selectedRecipe.id) {
      console.error('Recipe has no ID:', selectedRecipe);
      toast({ title: 'Invalid recipe data', variant: 'destructive' });
      return;
    }
    
    try {
      console.log('Submitting rating for recipe:', selectedRecipe.id, selectedRecipe.title);
      await recipeService.rateRecipe(selectedRecipe.id, rating, review);
      toast({ title: 'Rating submitted successfully' });
      setRatingDialogOpen(false);
      setSelectedRecipe(null);
      // Refresh the appropriate tab
      if (activeTab === 'popular') loadPopular();
      else if (activeTab === 'favorites') loadFavorites();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast({ title: 'Failed to submit rating', variant: 'destructive' });
    }
  };

  const handleViewShoppingList = async (list: any) => {
    try {
      const fullList = await recipeService.getShoppingList(list.id);
      setSelectedShoppingList(fullList);
      setShoppingDialogOpen(true);
    } catch (error) {
      toast({ title: 'Failed to load shopping list', variant: 'destructive' });
    }
  };

  const handleAddItem = async () => {
    if (!selectedShoppingList || !newItemName || !newItemQuantity) return;
    try {
      const updated = await recipeService.addItemToShoppingList(selectedShoppingList.id, {
        name: newItemName,
        quantity: newItemQuantity,
        category: 'Other'
      });
      setSelectedShoppingList(updated);
      setNewItemName('');
      setNewItemQuantity('');
      toast({ title: 'Item added successfully' });
      loadShoppingLists();
    } catch (error) {
      toast({ title: 'Failed to add item', variant: 'destructive' });
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    if (!selectedShoppingList) return;
    try {
      const updated = await recipeService.toggleShoppingListItem(
        selectedShoppingList.id,
        itemId,
        !completed
      );
      setSelectedShoppingList(updated);
      loadShoppingLists();
    } catch (error) {
      toast({ title: 'Failed to update item', variant: 'destructive' });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedShoppingList) return;
    try {
      const updated = await recipeService.removeItemFromShoppingList(
        selectedShoppingList.id,
        itemId
      );
      setSelectedShoppingList(updated);
      loadShoppingLists();
      toast({ title: 'Item removed' });
    } catch (error) {
      toast({ title: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const handleDeleteShoppingList = async (listId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const confirmed = await confirm({
      title: 'Delete Shopping List',
      message: 'Are you sure you want to delete this shopping list?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      await recipeService.deleteShoppingList(listId);
      toast({ title: 'Shopping list deleted successfully' });
      loadShoppingLists();
      
      // Close dialog if this list is being viewed
      if (selectedShoppingList?.id === listId) {
        setShoppingDialogOpen(false);
        setSelectedShoppingList(null);
      }
    } catch (error) {
      toast({ title: 'Failed to delete shopping list', variant: 'destructive' });
    }
  };

  // Calculate stats - prioritize API stats but fallback to props/local data
  const stats = {
    totalRecipes: recipeStats?.totalRecipes ?? recipes.length,
    totalFavorites: recipeStats?.totalFavorites ?? favoriteRecipes.length,
    averageRating: recipeStats?.averageRating ?? (recipes.length > 0 ? recipes.reduce((acc, r) => acc + (r.rating || 0), 0) / recipes.length : 0),
    totalRatings: recipeStats?.totalRatings ?? recipes.reduce((acc, r) => acc + (r.ratingsCount || 0), 0),
    totalShoppingLists: recipeStats?.totalShoppingLists ?? shoppingLists.length
  };

  const recentRecipes = recipes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-4 py-3 text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white hover:bg-white/10 transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="rounded-lg px-4 py-3 text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white hover:bg-white/10 transition-all"
          >
            Favorites
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="rounded-lg px-4 py-3 text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white hover:bg-white/10 transition-all"
          >
            Popular
          </TabsTrigger>
          <TabsTrigger
            value="shopping"
            className="rounded-lg px-4 py-3 text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white hover:bg-white/10 transition-all"
          >
            Shopping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Welcome Section */}
          <div className="rounded-2xl bg-teal-500/10 border border-teal-500/20 border-l-4 border-l-teal-500 p-6">
            <div className="mb-4">
              <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                <ChefHat className="h-8 w-8 text-teal-400" />
                Welcome to Recipe Builder
              </h3>
              <p className="text-lg text-white/60 mt-2">
                Create, organize, and discover amazing recipes with AI assistance
              </p>
            </div>
            <Button
              onClick={() => onNavigate('/recipe-builder/add')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl h-12 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Recipe
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Total Recipes</p>
                <p className="text-3xl font-bold text-primary">{stats.totalRecipes}</p>
              </div>
              <ChefHat className="h-12 w-12 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Favorites</p>
                <p className="text-3xl font-bold text-red-500">{stats.totalFavorites}</p>
              </div>
              <Heart className="h-12 w-12 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Total Ratings</p>
                <p className="text-3xl font-bold text-purple-500">{stats.totalRatings}</p>
              </div>
              <Star className="h-12 w-12 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0'}
                </p>
              </div>
              <Star className="h-12 w-12 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Shopping Lists</p>
                <p className="text-3xl font-bold text-blue-500">{stats.totalShoppingLists}</p>
              </div>
              <ShoppingBag className="h-12 w-12 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Recent Recipes */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-teal-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-3 text-xl font-semibold text-white">
                <ChefHat className="h-6 w-6 text-teal-400" />
                Recent Recipes
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/recipe-builder?tab=recipes')}
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentRecipes.length > 0 ? (
                recentRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onNavigate(`/recipe-builder/recipe/${recipe.id}`)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-teal-500/10 flex items-center justify-center">
                          <ChefHat className="h-6 w-6 text-teal-400/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{recipe.title}</h4>
                      <p className="text-sm text-white/60 truncate">
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m • {recipe.servings} servings • {recipe.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {recipe.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-white/60">{recipe.rating}</span>
                        </div>
                      )}
                      {recipe.isFavorited && (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60 mb-4">No recipes yet</p>
                  <Button
                    onClick={() => onNavigate('/recipe-builder/add')}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Recipe
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">Your Favorite Recipes</h2>
            </div>
            <p className="text-white/80">
              {favoriteRecipes.length} favorite{favoriteRecipes.length !== 1 ? 's' : ''}
            </p>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading favorites...</div>
          ) : (
            <RecipeGrid
              recipes={favoriteRecipes}
              onToggleFavorite={async (recipeId) => {
                try {
                  await recipeService.removeFromFavorites(recipeId);
                  toast({
                    title: 'Recipe removed from favorites'
                  });
                  loadFavorites();
                  loadStats();
                } catch (error) {
                  toast({
                    title: 'Failed to remove from favorites',
                    variant: 'destructive'
                  });
                }
              }}
              emptyStateConfig={{
                title: 'No favorite recipes yet',
                description: 'Start adding recipes to your favorites to see them here',
                actionLabel: 'Browse Recipes',
                onAction: () => onNavigate('/recipe-builder?tab=recipes')
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6 mt-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-purple-500">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                <TrendingUp className="h-6 w-6 text-purple-400" />
                Popular Recipes
              </h3>
            </div>
            <div className="p-6 pt-4">
              {loading ? (
                <div className="text-center py-8 text-white/60">Loading popular recipes...</div>
              ) : popularRecipes.length > 0 ? (
                <div className="space-y-4">
                  {popularRecipes.map((recipe, idx) => (
                    <div key={recipe.id} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="text-2xl font-bold text-teal-400">#{idx + 1}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white cursor-pointer hover:text-teal-400"
                            onClick={() => onNavigate(`/recipe-builder/recipe/${recipe.id}`)}>
                          {recipe.title}
                        </h4>
                        <p className="text-sm text-white/60">
                          {recipe.cuisine} • {recipe.difficulty} • {recipe.servings} servings
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-white">{recipe.rating || 0}</span>
                        <span className="text-xs text-white/50">({recipe.ratingsCount || 0})</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60">No popular recipes yet</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-6 mt-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-blue-500">
            <div className="p-6 pb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                <ShoppingBag className="h-6 w-6 text-blue-400" />
                Shopping Lists
              </h3>
              <Button
                onClick={() => onNavigate('/recipe-builder/shopping')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </div>
            <div className="p-6 pt-4">
              {loading ? (
                <div className="text-center py-8 text-white/60">Loading shopping lists...</div>
              ) : shoppingLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shoppingLists.map(list => (
                    <div key={list.id}
                         className="cursor-pointer hover:border-teal-500/40 transition-all rounded-xl bg-white/5 border border-white/10 p-4"
                         onClick={() => handleViewShoppingList(list)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{list.name}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => handleDeleteShoppingList(list.id, e)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Items:</span>
                          <span className="text-white">{list.totalItems || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Completed:</span>
                          <span className="text-white">{list.completionPercentage || 0}%</span>
                        </div>
                        {list.store && list.store !== 'string' && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Store:</span>
                            <span className="text-white">{list.store}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2.5 rounded-full"
                               style={{width: `${list.completionPercentage || 0}%`}}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60 mb-4">No shopping lists yet</p>
                  <Button
                    onClick={() => onNavigate('/recipe-builder/shopping')}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First List
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Rate Recipe</DialogTitle>
            <DialogDescription className="text-white/60">
              Rate and review "{selectedRecipe?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/80">Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setRating(val)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Star className={`h-6 w-6 ${val <= rating ? 'text-yellow-400 fill-current' : 'text-white/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review" className="text-white/80">Review (optional)</Label>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this recipe..."
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialogOpen(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={submitRating} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shopping List Dialog */}
      <Dialog open={shoppingDialogOpen} onOpenChange={setShoppingDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedShoppingList?.name}</DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedShoppingList?.description || 'Manage your shopping list items'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Input
                placeholder="Quantity"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="w-32 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Button onClick={handleAddItem} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">Add</Button>
            </div>

            {/* Items list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedShoppingList?.items?.map((item: any, index: number) => (
                <div key={item.id || `item-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <Checkbox
                    checked={item.completed || false}
                    onCheckedChange={() => item.id && handleToggleItem(item.id, item.completed)}
                    disabled={!item.id}
                  />
                  <div className="flex-1">
                    <span className={item.completed ? 'line-through text-white/40' : 'text-white'}>
                      {item.name}
                    </span>
                    <span className="ml-2 text-sm text-white/50">{item.quantity}</span>
                    {item.category && (
                      <span className="ml-2 text-xs bg-white/10 px-2 py-1 rounded text-white/60">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => item.id && handleRemoveItem(item.id)}
                    disabled={!item.id}
                    className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Progress</span>
                <span className="text-white">{selectedShoppingList?.completionPercentage || 0}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2.5 rounded-full"
                     style={{width: `${selectedShoppingList?.completionPercentage || 0}%`}}></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShoppingDialogOpen(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};