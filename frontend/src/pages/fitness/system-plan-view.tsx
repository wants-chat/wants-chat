import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Calendar,
  Clock,
  Target,
  Dumbbell,
  ArrowLeft,
  Check,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { systemWorkoutPlansApiService, SystemWorkoutPlanApiResponse } from '../../services/systemWorkoutPlansApi';
import { transformSystemPlanToUserPlan } from '../../services/workoutPlansApi';
import { useWorkoutPlans } from '../../hooks/fitness/useWorkoutPlansNew';
import { useExercises } from '../../hooks/fitness/useExercises';

const SystemPlanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SystemWorkoutPlanApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Get the workout plans hook for creating user plans
  const { createWorkoutPlan, refetch: refetchApiPlans } = useWorkoutPlans({ page: 1, limit: 10 });
  
  // Exercises database for transformations
  const { exercises: exerciseDB } = useExercises();

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) {
        setError('Plan ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const planData = await systemWorkoutPlansApiService.getSystemWorkoutPlanById(id);
        setPlan(planData);
      } catch (err) {
        console.error('Error fetching system workout plan:', err);
        setError('Failed to load workout plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleSelectPlan = async () => {
    if (!plan || !exerciseDB || exerciseDB.length === 0) {
      toast.error('Unable to select plan. Please try again.');
      return;
    }

    try {
      setIsSelecting(true);

      // Transform system plan to user plan format
      const userPlanData = transformSystemPlanToUserPlan(plan, exerciseDB);

      // Create the plan in user's account
      await createWorkoutPlan(userPlanData);

      // Refresh the plans list
      refetchApiPlans();

      // Show success and navigate back
      toast.success('Plan added to your workout plans successfully!');
      navigate('/fitness/workout-plans');

    } catch (error) {
      console.error('Failed to select system plan:', error);
      toast.error('Failed to add plan to your account. Please try again.');
    } finally {
      setIsSelecting(false);
    }
  };

  const getDifficultyBadgeColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner';
    if (difficulty <= 4) return 'Intermediate';
    return 'Advanced';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workout plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || 'Workout plan not found'}</p>
          <Button onClick={() => navigate('/fitness/workout-plans')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workout Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/fitness/workout-plans')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">System Plan</span>
        </div>
      </div>

      {/* Plan Overview */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{plan.name}</h1>
            <p className="text-muted-foreground mb-4">{plan.description}</p>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">{plan.duration} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">{plan.goal.replace('_', ' ')}</span>
              </div>
              <Badge className={getDifficultyBadgeColor(plan.difficulty)}>
                {getDifficultyText(plan.difficulty)}
              </Badge>
            </div>
          </div>
          
          <div className="lg:text-right">
            <Button 
              onClick={handleSelectPlan}
              disabled={isSelecting}
              className="w-full lg:w-auto"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSelecting ? 'Adding Plan...' : 'Select This Plan'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Workouts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Workout Schedule</h2>
        
        <div className="grid gap-4">
          {plan.workouts.map((workout) => (
            <Card key={workout.day} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Day {workout.day}: {workout.name}</h3>
                  <p className="text-sm text-muted-foreground">{workout.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{workout.estimated_duration} min</span>
                </div>
              </div>
              
              {/* Exercises */}
              {workout.exercises.length > 0 ? (
                <div className="space-y-3">
                  {workout.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.rest_time}s rest
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Rest day - No exercises scheduled</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemPlanView;