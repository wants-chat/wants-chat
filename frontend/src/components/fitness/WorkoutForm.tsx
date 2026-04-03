import React, { useState } from 'react';
import { useLogWorkout, useExercises } from '../../hooks/useServices';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Clock, Target, Weight, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '../ui/toast';

interface ExerciseSet {
  reps?: number;
  weight?: number;
  duration?: number; // seconds
  distance?: number; // meters
  restTime?: number; // seconds
  completed: boolean;
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
}

const WorkoutForm: React.FC = () => {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  // API hooks
  const { mutate: logWorkout, loading: isLoggingWorkout } = useLogWorkout();
  const { data: exerciseLibrary, loading: exercisesLoading } = useExercises();

  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      exerciseId: '',
      exerciseName: '',
      sets: [{ reps: 0, weight: 0, completed: false }],
      notes: ''
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updatedExercises = [...exercises];
    if (field === 'exerciseId') {
      const selectedExercise = exerciseLibrary?.exercises.find(ex => ex.id === value);
      if (selectedExercise) {
        updatedExercises[index] = {
          ...updatedExercises[index],
          exerciseId: value,
          exerciseName: selectedExercise.name
        };
      }
    } else {
      updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    }
    setExercises(updatedExercises);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      reps: 0,
      weight: 0,
      completed: false
    });
    setExercises(updatedExercises);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutName.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    // Validate exercises
    for (const exercise of exercises) {
      if (!exercise.exerciseId) {
        toast.error('Please select an exercise for all entries');
        return;
      }
      if (exercise.sets.length === 0) {
        toast.error(`Please add at least one set for ${exercise.exerciseName}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const workoutData = {
        name: workoutName,
        startTime,
        endTime: new Date(),
        exercises: exercises.map(exercise => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map(set => ({
            reps: set.reps || undefined,
            weight: set.weight || undefined,
            duration: set.duration || undefined,
            distance: set.distance || undefined,
            restTime: set.restTime || undefined,
            completed: set.completed
          })),
          notes: exercise.notes || undefined
        })),
        notes: notes.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
        totalCaloriesBurned: calculateEstimatedCalories()
      };

      await logWorkout(workoutData);
      
      toast.success('Workout logged successfully! 🎉');
      
      // Reset form
      setWorkoutName('');
      setExercises([]);
      setNotes('');
      setRating(0);
      
    } catch (error: any) {
      toast.error(`Failed to log workout: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedCalories = (): number => {
    // Simple calorie estimation based on exercise duration and intensity
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const avgIntensity = exercises.reduce((sum, ex) => {
      const avgWeight = ex.sets.reduce((s, set) => s + (set.weight || 0), 0) / ex.sets.length;
      return sum + (avgWeight > 0 ? avgWeight * 0.5 : 3); // Basic intensity calculation
    }, 0) / exercises.length;
    
    return Math.round(totalSets * avgIntensity * 1.5);
  };

  const getRatingEmojis = () => {
    const emojis = ['', '😫', '😐', '🙂', '😊', '🔥'];
    return emojis[rating] || '';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Plus className="h-6 w-6 mr-2 text-primary" />
          Log New Workout
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Workout Name *</label>
            <Input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Push Day, Full Body, Cardio Session"
              required
            />
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Exercises</label>
              <Button 
                type="button" 
                onClick={addExercise}
                variant="outline"
                size="sm"
                disabled={exercisesLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Exercise Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Exercise *</label>
                        <Select 
                          value={exercise.exerciseId} 
                          onValueChange={(value) => updateExercise(exerciseIndex, 'exerciseId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={exercisesLoading ? "Loading exercises..." : "Select exercise"} />
                          </SelectTrigger>
                          <SelectContent>
                            {exerciseLibrary?.exercises.map((ex) => (
                              <SelectItem key={ex.id} value={ex.id}>
                                {ex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Input
                          type="text"
                          value={exercise.notes || ''}
                          onChange={(e) => updateExercise(exerciseIndex, 'notes', e.target.value)}
                          placeholder="Form cues, modifications, etc."
                        />
                      </div>
                    </div>

                    {/* Sets */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Sets</label>
                        <Button 
                          type="button" 
                          onClick={() => addSet(exerciseIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Set
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline" className="min-w-[3rem]">
                              Set {setIndex + 1}
                            </Badge>

                            <div className="flex items-center space-x-2 flex-1">
                              <div className="flex items-center space-x-1">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={set.reps || ''}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                  placeholder="Reps"
                                  className="w-20"
                                  min="0"
                                />
                              </div>

                              <div className="flex items-center space-x-1">
                                <Weight className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={set.weight || ''}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                  placeholder="Weight"
                                  className="w-20"
                                  min="0"
                                  step="0.5"
                                />
                                <span className="text-xs text-muted-foreground">kg</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={set.restTime || ''}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'restTime', parseInt(e.target.value) || 0)}
                                  placeholder="Rest"
                                  className="w-20"
                                  min="0"
                                />
                                <span className="text-xs text-muted-foreground">sec</span>
                              </div>

                              <Button
                                type="button"
                                variant={set.completed ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              disabled={exercise.sets.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exerciseIndex)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}

            {exercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No exercises added yet</p>
                <p className="text-sm">Click "Add Exercise" to get started</p>
              </div>
            )}
          </div>

          {/* Workout Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Workout Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations or improvements?"
              rows={3}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate This Workout {getRatingEmojis()}</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant={rating >= star ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRating(star)}
                >
                  ★
                </Button>
              ))}
              {rating > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating(0)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Estimated Calories */}
          {exercises.length > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Calories Burned: 
                <span className="font-medium text-foreground ml-1">
                  {calculateEstimatedCalories()} cal
                </span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoggingWorkout}
              className="min-w-[120px]"
            >
              {isSubmitting || isLoggingWorkout ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Log Workout
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default WorkoutForm;