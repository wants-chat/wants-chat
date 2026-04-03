import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChefHat, Plus, Search, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { MealPlan, MealPlanType } from '../../types/mealPlan';
import { useMealPlans, useDeleteMealPlan } from '../../hooks/useMealPlans';
import { MealPlanDetail } from './MealPlanDetail';
import { toast } from '../ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type ViewMode = 'list' | 'detail';

interface MealPlanListProps {
  onViewDetails?: (mealPlan: MealPlan) => void;
  onEdit?: (mealPlan: MealPlan) => void;
}

export const MealPlanList: React.FC<MealPlanListProps> = ({ 
  onViewDetails}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; mealPlan?: MealPlan }>({
    open: false
  });

  const { data: mealPlansData, loading, error, refetch } = useMealPlans({
    page: currentPage,
    limit: 20 // Load more items to allow for client-side filtering
  });

  const deleteMealPlan = useDeleteMealPlan();

  // Client-side filtering (similar to recipes)
  const allMealPlans = mealPlansData?.data || [];
  const filteredMealPlans = allMealPlans.filter(mealPlan => {
    const matchesSearch = mealPlan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (mealPlan.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (mealPlan.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || false);
    return matchesSearch;
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deleteConfirmation.mealPlan) return;
    
    try {
      await deleteMealPlan.mutateAsync(deleteConfirmation.mealPlan.id);
      toast({
        title: 'Success',
        description: 'Meal plan deleted successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete meal plan',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmation({ open: false });
    }
  };

  const handleViewDetails = (mealPlan: MealPlan) => {
    setSelectedMealPlan(mealPlan);
    setViewMode('detail');
    onViewDetails?.(mealPlan);
  };


  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMealPlan(null);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getPlanTypeColor = (type: MealPlanType) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'weekly':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'monthly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'custom':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // For client-side pagination of filtered results
  const itemsPerPage = 6;
  const totalFilteredItems = filteredMealPlans.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMealPlans = filteredMealPlans.slice(startIndex, endIndex);

  // Handle different view modes
  if (viewMode === 'detail' && selectedMealPlan) {
    return (
      <MealPlanDetail
        mealPlanId={selectedMealPlan.id}
        onBack={handleBackToList}
      />
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Meal Plans</h2>
          <p className="text-white/60 mt-1">
            Organize your meals for the week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/meal-planner/create')} className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Meal Plan
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          type="text"
          placeholder="Search meal plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-teal-400/50"
        />
      </div>

      {/* Meal Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="p-4 bg-teal-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
            </div>
            <p className="text-white/60">Loading meal plans...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load meal plans</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4 text-white border-white/20 hover:bg-white/10">
            Try Again
          </Button>
        </div>
      ) : paginatedMealPlans.length === 0 ? (
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold mb-2 text-white">
              {searchTerm ? 'No Meal Plans Found' : 'No Meal Plans Yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm
                ? `No meal plans match "${searchTerm}". Try a different search term.`
                : 'Start planning your meals by creating your first meal plan'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/meal-planner/create')} className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Meal Plan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMealPlans.map((mealPlan) => (
            <Card key={mealPlan.id} className="rounded-2xl hover:shadow-lg transition-shadow bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white">{mealPlan.name}</CardTitle>
                    <p className="text-sm text-white/60 mt-1">
                      {formatDateRange(mealPlan.startDate, mealPlan.endDate)}
                    </p>
                  </div>
                  <Badge className={getPlanTypeColor(mealPlan.planType)}>
                    {mealPlan.planType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mealPlan.description && (
                  <p className="text-sm text-white/60 line-clamp-2">
                    {mealPlan.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {mealPlan.meals?.length || 0} meals
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(mealPlan.createdAt || '').toLocaleDateString()}
                  </span>
                </div>

                {mealPlan.tags && mealPlan.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mealPlan.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80 border border-white/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    onClick={() => handleViewDetails(mealPlan)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmation({ open: true, mealPlan })}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-400/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="rounded-xl text-white border-white/20 hover:bg-white/10"
          >
            Previous
          </Button>

          <span className="px-4 py-2 font-medium text-white">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="rounded-xl text-white border-white/20 hover:bg-white/10"
          >
            Next
          </Button>

          <span className="text-sm text-white/60">
            ({totalFilteredItems} meal plans{searchTerm ? ' found' : ''})
          </span>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmation.open} onOpenChange={(open) => setDeleteConfirmation({ open })}>
        <AlertDialogContent className="bg-slate-900/95 backdrop-blur-xl border border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete "{deleteConfirmation.mealPlan?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Meal Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};