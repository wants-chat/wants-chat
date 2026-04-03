import React from 'react';
import { Calendar, Clock, Dumbbell, Target, ArrowRight } from 'lucide-react';
import { WorkoutPlan } from '../../../types/fitness';
import { Button } from '../../ui/button';

interface WorkoutCardProps {
  plan: WorkoutPlan;
  duration: number;
  isRecommended?: boolean;
  onClick: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  plan, 
  duration, 
  isRecommended = false,
  onClick 
}) => {
  const getWorkoutStats = () => {
    const totalExercises = plan.workouts.reduce((acc, workout) => 
      acc + workout.exercises.length, 0
    );
    const avgDuration = plan.workouts.length > 0
      ? Math.round(plan.workouts.reduce((acc, workout) => 
          acc + workout.duration, 0) / plan.workouts.length)
      : 45; // Default duration
    
    return { totalExercises, avgDuration };
  };

  const { totalExercises, avgDuration } = getWorkoutStats();

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          {isRecommended && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
              Recommended
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {plan.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{duration} days</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{avgDuration} min/day</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{plan.workouts.length} workouts</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>{totalExercises} exercises</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between">
          <Button 
            size="sm" 
            variant="ghost" 
            className="group-hover:bg-primary group-hover:text-white transition-colors"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;