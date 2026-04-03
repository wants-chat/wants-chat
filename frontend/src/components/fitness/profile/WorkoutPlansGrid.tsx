import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiPlay,
  mdiPencil,
  mdiDelete,
  mdiEye,
  mdiHeart,
  mdiHeartOutline,
  mdiPlus,
  mdiFilter,
  mdiDumbbell,
  mdiProgressClock,
  mdiCheckCircle,
  mdiStar
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { WorkoutPlan, PlanDuration } from '../../../types/fitness';

interface ExtendedWorkoutPlan extends WorkoutPlan {
  duration: PlanDuration;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  daysCompleted: number;
  totalDays: number;
  lastWorkoutDate?: Date;
  nextWorkoutDate?: Date;
  isFavorite: boolean;
  isActive: boolean;
  isCompleted: boolean;
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  rating?: number;
  completionCertificate?: boolean;
}

interface WorkoutPlansGridProps {
  plans: ExtendedWorkoutPlan[];
  onViewPlan?: (planId: string) => void;
  onStartWorkout?: (planId: string) => void;
  onEditPlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
  onToggleFavorite?: (planId: string) => void;
  onCreatePlan?: () => void;
  loading?: boolean;
  error?: string | null;
}

const WorkoutPlansGrid: React.FC<WorkoutPlansGridProps> = ({
  plans,
  loading = false,
  error = null,
  onViewPlan,
  onStartWorkout,
  onEditPlan,
  onDeletePlan,
  onToggleFavorite,
  onCreatePlan
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'custom' | 'favorite'>('all');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Intermediate':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return mdiDumbbell;
      case 'cardio': return mdiProgressClock;
      case 'flexibility': return mdiStar;
      default: return mdiDumbbell;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'text-teal-400';
      case 'cardio': return 'text-red-400';
      case 'flexibility': return 'text-purple-400';
      case 'mixed': return 'text-teal-400';
      default: return 'text-white/60';
    }
  };

  const filteredPlans = plans.filter(plan => {
    switch (filter) {
      case 'active': return plan.isActive && !plan.isCompleted;
      case 'completed': return plan.isCompleted;
      case 'favorite': return plan.isFavorite;
      case 'custom': return plan.name.toLowerCase().includes('custom');
      default: return true;
    }
  });

  const getProgressPercentage = (daysCompleted: number, totalDays: number) => {
    return Math.round((daysCompleted / totalDays) * 100);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not scheduled';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">My Workout Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">My Workout Plans</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Icon path={mdiDumbbell} size={1.5} className="text-red-400" />
          </div>
          <h4 className="font-semibold mb-2">Unable to load workout plans</h4>
          <p className="text-white/60 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Icon path={mdiDumbbell} size={1} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold">My Workout Plans</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter */}
          <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <SelectTrigger className="w-[160px] bg-white/10">
              <div className="flex items-center gap-2">
                <Icon path={mdiFilter} size={0.7} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="active">Active Plans</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="favorite">Favorites</SelectItem>
              <SelectItem value="custom">Custom Plans</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Create New Plan */}
          <Button onClick={onCreatePlan} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <Icon path={mdiPlus} size={0.7} className="mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="p-5 bg-white/10 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 group overflow-hidden">
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${getCategoryColor(plan.category).replace('text-', 'bg-').replace('-500', '-500/10')}`}>
                  <Icon path={getCategoryIcon(plan.category)} size={1} className={getCategoryColor(plan.category)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg truncate">{plan.name}</h4>
                  <p className="text-sm text-white/60 line-clamp-2">{plan.description}</p>
                </div>
              </div>
              
              {/* Favorite Button */}
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onToggleFavorite?.(plan.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon 
                  path={plan.isFavorite ? mdiHeart : mdiHeartOutline} 
                  size={0.8} 
                  className={plan.isFavorite ? 'text-red-400' : 'text-white/60'} 
                />
              </Button>
            </div>

            {/* Plan Details */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={getDifficultyColor(plan.difficulty)}>
                {plan.difficulty}
              </Badge>
              <Badge className="text-teal-400 border border-teal-500/20 bg-teal-500/10">
                {plan.duration} days
              </Badge>
              {plan.isCompleted && (
                <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/20">
                  <Icon path={mdiCheckCircle} size={0.6} className="mr-1" />
                  Complete
                </Badge>
              )}
          
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-white/60">
                  {plan.daysCompleted}/{plan.totalDays} days
                </span>
              </div>
              <Progress 
                value={getProgressPercentage(plan.daysCompleted, plan.totalDays)} 
                className="h-2"
              />
              <div className="text-xs text-white/60 mt-1">
                {getProgressPercentage(plan.daysCompleted, plan.totalDays)}% complete
              </div>
            </div>

            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-white/60">Last workout</p>
                <p className="font-medium">{formatDate(plan.lastWorkoutDate)}</p>
              </div>
              <div>
                <p className="text-white/60">Next workout</p>
                <p className="font-medium">{formatDate(plan.nextWorkoutDate)}</p>
              </div>
            </div>

            {/* Rating (if completed) */}
            {plan.rating && (
              <div className="flex items-center gap-1 mb-4">
                <span className="text-sm text-white/60">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      path={mdiStar}
                      size={0.6}
                      className={star <= plan.rating! ? 'text-accent' : 'text-muted'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {!plan.isCompleted && (
                <Button 
                  size="sm" 
                  onClick={() => onStartWorkout?.(plan.id)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <Icon path={mdiPlay} size={0.7} className="mr-1" />
                  Start
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={() => onViewPlan?.(plan.id)}
                className="bg-white/10 border border-white/20 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/30"
              >
                <Icon path={mdiEye} size={0.7} className="mr-1" />
                View
              </Button>

              {!plan.isCompleted && (
                <Button
                  size="sm"
                  onClick={() => onEditPlan?.(plan.id)}
                  className="bg-white/10 border border-white/20 text-white hover:bg-cyan-500/20 hover:border-cyan-500/30 hover:text-cyan-400"
                >
                  <Icon path={mdiPencil} size={0.7} className="mr-1" />
                  Edit
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => onDeletePlan?.(plan.id)}
                className="bg-white/10 border border-white/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30"
              >
                <Icon path={mdiDelete} size={0.7} className="mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <Card className="p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
          <div className="p-4 bg-teal-500/20 rounded-full w-fit mx-auto mb-4">
            <Icon path={mdiDumbbell} size={2} className="text-teal-400/60" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workout plans found</h3>
          <p className="text-white/60 mb-6">
            {filter === 'all' 
              ? "You haven't created any workout plans yet. Create your first plan to get started!"
              : `No plans match the current filter: ${filter}`
            }
          </p>
          {filter === 'all' && (
            <Button onClick={onCreatePlan} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <Icon path={mdiPlus} size={0.7} className="mr-2" />
              Create Your First Plan
            </Button>
          )}
          {filter !== 'all' && (
            <Button onClick={() => setFilter('all')} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              Show All Plans
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default WorkoutPlansGrid;