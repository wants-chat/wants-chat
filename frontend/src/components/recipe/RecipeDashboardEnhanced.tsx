import React, { useState, useEffect } from 'react';
import {
  Plus,
  Heart,
  Star,
  ChefHat,
  Calendar,
  ShoppingCart,
  TrendingUp,
  Clock,
  Users,
  Loader2,
  Eye,
  CheckCircle,
  Circle,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from '../ui/use-toast';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import recipeService from '../../services/recipeService';
import { cn } from '../../lib/utils';

interface RecipeDashboardEnhancedProps {
  onNavigate: (path: string) => void;
}

export const RecipeDashboardEnhanced: React.FC<RecipeDashboardEnhancedProps> = ({ onNavigate }) => {
  const { confirm } = useConfirm();
  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [activeShoppingLists, setActiveShoppingLists] = useState<any[]>([]);

  // Dialog states
  const [ratingDialog, setRatingDialog] = useState({ 
    open: false, 
    recipeId: '', 
    rating: 0, 
    review: '' 
  });
  
  const [shoppingListDialog, setShoppingListDialog] = useState({ 
    open: false, 
    list: null as any,
    newItem: { name: '', quantity: '', category: '' }
  });

  const [generateListDialog, setGenerateListDialog] = useState({
    open: false,
    mealPlanId: ''
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        recipesResponse,
        favoritesData,
        popularData,
        mealPlansResponse,
        shoppingListsResponse
      ] = await Promise.all([
        recipeService.getRecipeStats(),
        recipeService.getRecipes({ limit: 6, sort_by: 'created_at', sort_order: 'desc' }),
        recipeService.getFavoriteRecipes(),
        recipeService.getPopularRecipes(4),
        recipeService.getMealPlans({ limit: 3 }),
        recipeService.getShoppingLists({ limit: 5 })
      ]);

      setStats(statsData);
      setRecipes(recipesResponse.data || []);
      setFavoriteRecipes(favoritesData || []);
      setPopularRecipes(popularData || []);
      setMealPlans(mealPlansResponse.data || []);
      setShoppingLists(shoppingListsResponse.data || []);
      
      // Filter active shopping lists
      const activeLists = (shoppingListsResponse.data || []).filter(
        (list: any) => (list.completion_percentage || 0) < 100
      );
      setActiveShoppingLists(activeLists);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Recipe actions
  const handleToggleFavorite = async (recipeId: string, isCurrentlyFavorited: boolean) => {
    try {
      if (isCurrentlyFavorited) {
        await recipeService.removeFromFavorites(recipeId);
        setFavoriteRecipes(prev => prev.filter(r => r.id !== recipeId));
      } else {
        await recipeService.addToFavorites(recipeId);
        const recipe = recipes.find(r => r.id === recipeId) || 
                      popularRecipes.find(r => r.id === recipeId);
        if (recipe) {
          setFavoriteRecipes(prev => [...prev, recipe]);
        }
      }
      
      toast({
        title: isCurrentlyFavorited ? 'Removed from favorites' : 'Added to favorites',
        variant: 'default'
      });
      
      // Reload stats to update counts
      const newStats = await recipeService.getRecipeStats();
      setStats(newStats);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive'
      });
    }
  };

  const handleRateRecipe = async () => {
    try {
      await recipeService.rateRecipe(
        ratingDialog.recipeId,
        ratingDialog.rating,
        ratingDialog.review
      );
      
      toast({
        title: 'Rating submitted',
        description: 'Thank you for your feedback!',
      });
      
      setRatingDialog({ open: false, recipeId: '', rating: 0, review: '' });
      loadDashboardData(); // Reload to show updated ratings
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive'
      });
    }
  };

  // Shopping list actions
  const handleToggleShoppingItem = async (listId: string, itemId: string, completed: boolean) => {
    try {
      const updatedList = await recipeService.toggleShoppingListItem(listId, itemId, !completed);
      
      setShoppingLists(prev =>
        prev.map(list => list.id === listId ? updatedList : list)
      );
      
      if (shoppingListDialog.list?.id === listId) {
        setShoppingListDialog(prev => ({ ...prev, list: updatedList }));
      }
      
      // Update active lists
      if ((updatedList.completion_percentage || 0) >= 100) {
        setActiveShoppingLists(prev => prev.filter(list => list.id !== listId));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive'
      });
    }
  };

  const handleAddShoppingItem = async () => {
    if (!shoppingListDialog.list || !shoppingListDialog.newItem.name) return;
    
    try {
      const updatedList = await recipeService.addItemToShoppingList(
        shoppingListDialog.list.id,
        {
          name: shoppingListDialog.newItem.name,
          quantity: shoppingListDialog.newItem.quantity,
          category: shoppingListDialog.newItem.category
        }
      );
      
      setShoppingLists(prev =>
        prev.map(list => list.id === shoppingListDialog.list.id ? updatedList : list)
      );
      
      setShoppingListDialog(prev => ({
        ...prev,
        list: updatedList,
        newItem: { name: '', quantity: '', category: '' }
      }));
      
      toast({
        title: 'Item added',
        description: `Added ${shoppingListDialog.newItem.name} to the list`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveShoppingItem = async (listId: string, itemId: string) => {
    try {
      const updatedList = await recipeService.removeItemFromShoppingList(listId, itemId);
      
      setShoppingLists(prev =>
        prev.map(list => list.id === listId ? updatedList : list)
      );
      
      if (shoppingListDialog.list?.id === listId) {
        setShoppingListDialog(prev => ({ ...prev, list: updatedList }));
      }
      
      toast({
        title: 'Item removed',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteShoppingList = async (listId: string) => {
    try {
      await recipeService.deleteShoppingList(listId);
      
      setShoppingLists(prev => prev.filter(list => list.id !== listId));
      
      // Close dialog if this list is being viewed
      if (shoppingListDialog.list?.id === listId) {
        setShoppingListDialog({ open: false, list: null, newItem: { name: '', quantity: '', category: '' } });
      }
      
      toast({
        title: 'Shopping list deleted',
        description: 'The shopping list has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete shopping list',
        variant: 'destructive'
      });
    }
  };

  const handleGenerateShoppingList = async () => {
    try {
      const newList = await recipeService.generateShoppingListFromMealPlan(generateListDialog.mealPlanId);
      
      setShoppingLists(prev => [newList, ...prev]);
      setActiveShoppingLists(prev => [newList, ...prev]);
      
      toast({
        title: 'Shopping list generated',
        description: `Created "${newList.name}" from your meal plan`,
      });
      
      setGenerateListDialog({ open: false, mealPlanId: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate shopping list',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <ChefHat className="h-8 w-8 text-primary" />
            Recipe Management Hub
          </CardTitle>
          <CardDescription className="text-lg">
            Your complete recipe, meal planning, and shopping list manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onNavigate('/recipe-builder/add')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
            <Button
              onClick={() => onNavigate('/recipe-builder?tab=meal-plan')}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Meal Plans
            </Button>
            <Button
              onClick={() => onNavigate('/recipe-builder?tab=recipes')}
              variant="outline"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              All Recipes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Recipes</p>
                  <p className="text-3xl font-bold">{stats.total_recipes || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.public_recipes || 0} public, {stats.private_recipes || 0} private
                  </p>
                </div>
                <ChefHat className="h-12 w-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                  <p className="text-3xl font-bold text-red-500">{stats.total_favorites || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all recipes
                  </p>
                </div>
                <Heart className="h-12 w-12 text-red-500/20 fill-red-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meal Plans</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.total_meal_plans || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active plans
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shopping Lists</p>
                  <p className="text-3xl font-bold text-green-500">{stats.total_shopping_lists || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeShoppingLists.length} active
                  </p>
                </div>
                <ShoppingCart className="h-12 w-12 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Recent Recipes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Recipes
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/recipe-builder?tab=recipes')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recipes.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No recipes yet. Start by creating your first recipe!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipes.slice(0, 6).map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-1">
                          {recipe.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {recipe.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.category && (
                            <Badge variant="secondary" className="text-xs">
                              {recipe.category}
                            </Badge>
                          )}
                          {recipe.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {recipe.difficulty}
                            </Badge>
                          )}
                          {recipe.cuisine && (
                            <Badge variant="outline" className="text-xs">
                              {recipe.cuisine}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{recipe.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-muted-foreground">
                              ({recipe.rating_count || 0})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(
                                  recipe.id,
                                  favoriteRecipes.some(f => f.id === recipe.id)
                                );
                              }}
                            >
                              <Heart
                                className={cn(
                                  "h-4 w-4",
                                  favoriteRecipes.some(f => f.id === recipe.id)
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-400"
                                )}
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRatingDialog({
                                  open: true,
                                  recipeId: recipe.id,
                                  rating: 0,
                                  review: ''
                                });
                              }}
                            >
                              <Star className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                Favorite Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoriteRecipes.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No favorite recipes yet. Click the heart icon on recipes you love!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => onNavigate(`/recipe-builder/recipe/${recipe.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{recipe.title}</CardTitle>
                        <CardDescription>{recipe.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {recipe.prep_time && (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                {recipe.prep_time}min
                              </Badge>
                            )}
                            {recipe.servings && (
                              <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {recipe.servings}
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(recipe.id, true);
                            }}
                          >
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Tab */}
        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Popular Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularRecipes.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No popular recipes available at the moment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {popularRecipes.map((recipe, index) => (
                    <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900">
                              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{recipe.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {recipe.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  <span>{recipe.view_count || 0} views</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Heart className="h-4 w-4 text-muted-foreground" />
                                  <span>{recipe.favorite_count || 0} favorites</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span>{recipe.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate(`/recipe-builder/recipe/${recipe.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meal Plans Tab */}
        <TabsContent value="meal-plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Meal Plans
                </span>
                <Button
                  size="sm"
                  onClick={() => onNavigate('/recipe-builder?tab=meal-plan')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Plan
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mealPlans.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No meal plans yet. Create your first meal plan to get started!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {mealPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{plan.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {plan.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary">
                                <Calendar className="h-3 w-3 mr-1" />
                                {plan.start_date || 'No date'} - {plan.end_date || 'No date'}
                              </Badge>
                              <Badge variant="outline">
                                {plan.total_recipes || 0} recipes
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setGenerateListDialog({
                                  open: true,
                                  mealPlanId: plan.id
                                });
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Generate List
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNavigate(`/meal-plans/${plan.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopping Lists Tab */}
        <TabsContent value="shopping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  Shopping Lists
                </span>
                <Button
                  size="sm"
                  onClick={() => onNavigate('/shopping-lists/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New List
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shoppingLists.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No shopping lists yet. Generate one from a meal plan or create manually!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {shoppingLists.map((list) => (
                    <Card key={list.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{list.name}</h4>
                              {(list.completion_percentage || 0) >= 100 && (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Complete
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {list.description || `${list.total_items || 0} items`}
                            </p>
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {list.completed_items || 0} / {list.total_items || 0} items
                                </span>
                              </div>
                              <Progress value={list.completion_percentage || 0} className="h-2" />
                            </div>
                            {(list.estimated_total || 0) > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Estimated Total: </span>
                                <span className="font-semibold">
                                  ${(list.estimated_total || 0).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShoppingListDialog({
                                  open: true,
                                  list: list,
                                  newItem: { name: '', quantity: '', category: '' }
                                });
                              }}
                            >
                              Manage
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Shopping List',
                                  message: `Are you sure you want to delete "${list.name}"?`,
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'destructive'
                                });
                                if (confirmed) {
                                  handleDeleteShoppingList(list.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rating Dialog */}
      <Dialog
        open={ratingDialog.open}
        onOpenChange={(open) => !open && setRatingDialog({ ...ratingDialog, open: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Recipe</DialogTitle>
            <DialogDescription>
              Share your experience with this recipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingDialog({ ...ratingDialog, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= ratingDialog.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Review (optional)</Label>
              <Textarea
                id="review"
                value={ratingDialog.review}
                onChange={(e) => setRatingDialog({ ...ratingDialog, review: e.target.value })}
                placeholder="Share your thoughts about this recipe..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRatingDialog({ ...ratingDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRateRecipe}
              disabled={!ratingDialog.rating}
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shopping List Management Dialog */}
      <Dialog
        open={shoppingListDialog.open}
        onOpenChange={(open) => !open && setShoppingListDialog({ ...shoppingListDialog, open: false })}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{shoppingListDialog.list?.name}</DialogTitle>
            <DialogDescription>
              {shoppingListDialog.list?.description}
            </DialogDescription>
          </DialogHeader>
          
          {shoppingListDialog.list && (
            <>
              <div className="space-y-4">
                {/* Add new item form */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Item name"
                    value={shoppingListDialog.newItem.name}
                    onChange={(e) => setShoppingListDialog(prev => ({
                      ...prev,
                      newItem: { ...prev.newItem, name: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Quantity"
                    value={shoppingListDialog.newItem.quantity}
                    onChange={(e) => setShoppingListDialog(prev => ({
                      ...prev,
                      newItem: { ...prev.newItem, quantity: e.target.value }
                    }))}
                    className="w-32"
                  />
                  <Select
                    value={shoppingListDialog.newItem.category}
                    onValueChange={(value) => setShoppingListDialog(prev => ({
                      ...prev,
                      newItem: { ...prev.newItem, category: value }
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produce">Produce</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="pantry">Pantry</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddShoppingItem}
                    disabled={!shoppingListDialog.newItem.name}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                <hr className="border-t border-gray-200 dark:border-gray-700" />

                {/* Items list */}
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {shoppingListDialog.list.items?.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          No items in this list yet. Add your first item above!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      shoppingListDialog.list.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                        >
                          <button
                            onClick={() => handleToggleShoppingItem(
                              shoppingListDialog.list.id,
                              item.id,
                              item.completed
                            )}
                            className="focus:outline-none"
                          >
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                          <div className={cn(
                            "flex-1",
                            item.completed && "line-through text-muted-foreground"
                          )}>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity}
                              {item.category && ` • ${item.category}`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveShoppingItem(
                              shoppingListDialog.list.id,
                              item.id
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="flex justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {(shoppingListDialog.list?.completed_items || 0)} of{' '}
                      {(shoppingListDialog.list?.total_items || 0)} completed
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: 'Delete Shopping List',
                          message: `Are you sure you want to delete "${shoppingListDialog.list?.name}"?`,
                          confirmText: 'Delete',
                          cancelText: 'Cancel',
                          variant: 'destructive'
                        });
                        if (confirmed) {
                          handleDeleteShoppingList(shoppingListDialog.list.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete List
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShoppingListDialog({ ...shoppingListDialog, open: false })}
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Shopping List Dialog */}
      <Dialog
        open={generateListDialog.open}
        onOpenChange={(open) => !open && setGenerateListDialog({ open: false, mealPlanId: '' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Shopping List</DialogTitle>
            <DialogDescription>
              Create a shopping list from this meal plan with all required ingredients
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenerateListDialog({ open: false, mealPlanId: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateShoppingList}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Generate List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};