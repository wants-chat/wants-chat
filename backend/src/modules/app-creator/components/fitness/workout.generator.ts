/**
 * Workout Component Generator
 */

export interface WorkoutOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWorkoutStats(options: WorkoutOptions = {}): string {
  const { componentName = 'WorkoutStats', endpoint = '/workout-stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Flame, Clock, Target, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['workout-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statItems = [
    { icon: Flame, label: 'Calories Burned', value: stats?.calories_burned || 0, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { icon: Clock, label: 'Total Time', value: stats?.total_time || '0h', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Target, label: 'Workouts', value: stats?.workouts_count || 0, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { icon: TrendingUp, label: 'Current Streak', value: \`\${stats?.streak || 0} days\`, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className={\`w-10 h-10 rounded-lg flex items-center justify-center mb-3 \${stat.color}\`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWorkoutList(options: WorkoutOptions = {}): string {
  const { componentName = 'WorkoutList', endpoint = '/workouts' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Dumbbell, Clock, Flame, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Workouts</h2>
        <Link to="/workouts/new" className="text-sm text-blue-600 hover:text-blue-700">+ Add Workout</Link>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {workouts && workouts.length > 0 ? (
          workouts.map((workout: any) => (
            <Link
              key={workout.id}
              to={\`/workouts/\${workout.id}\`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{workout.name || workout.type}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(workout.date || workout.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  {workout.duration && (
                    <p className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {workout.duration} min
                    </p>
                  )}
                  {workout.calories_burned && (
                    <p className="flex items-center gap-1 text-orange-600">
                      <Flame className="w-4 h-4" />
                      {workout.calories_burned} cal
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No workouts logged yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWorkoutForm(options: WorkoutOptions = {}): string {
  const { componentName = 'WorkoutForm', endpoint = '/workouts' } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, Dumbbell, Clock, Flame, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    duration: '',
    calories_burned: '',
    notes: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '' }],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      toast.success('Workout logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      navigate('${endpoint}');
    },
    onError: () => toast.error('Failed to log workout'),
  });

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: '', reps: '', weight: '' }],
    });
  };

  const removeExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const updated = [...formData.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, exercises: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const workoutTypes = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'CrossFit', 'Swimming', 'Running', 'Cycling', 'Other'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Log Workout</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workout Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Strength Training"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">Select type...</option>
              {workoutTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" /> Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="60"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Flame className="w-4 h-4 inline mr-1" /> Calories Burned
            </label>
            <input
              type="number"
              value={formData.calories_burned}
              onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
              placeholder="500"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises</label>
            <button type="button" onClick={addExercise} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Exercise
            </button>
          </div>
          <div className="space-y-3">
            {formData.exercises.map((exercise, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                  placeholder="Exercise name"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                  placeholder="Sets"
                  className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                  placeholder="Reps"
                  className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                <input
                  type="text"
                  value={exercise.weight}
                  onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                  placeholder="Weight"
                  className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                {formData.exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(index)} className="p-2 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="How did the workout feel?"
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Dumbbell className="w-5 h-5" />
              Log Workout
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProgressCharts(options: WorkoutOptions = {}): string {
  const { componentName = 'ProgressCharts', endpoint = '/progress' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const metrics = [
    { label: 'Weight', current: progress?.weight, previous: progress?.previous_weight, unit: 'lbs', goal: progress?.weight_goal },
    { label: 'Body Fat', current: progress?.body_fat, previous: progress?.previous_body_fat, unit: '%', goal: progress?.body_fat_goal },
    { label: 'Muscle Mass', current: progress?.muscle_mass, previous: progress?.previous_muscle_mass, unit: 'lbs', goal: progress?.muscle_goal },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Progress Tracking</h2>
      <div className="space-y-6">
        {metrics.map((metric, i) => {
          const change = metric.current && metric.previous ? metric.current - metric.previous : 0;
          const percentToGoal = metric.current && metric.goal ? (metric.current / metric.goal) * 100 : 0;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {metric.current || '-'} {metric.unit}
                  </span>
                  {change !== 0 && (
                    <span className={\`flex items-center text-sm \${change > 0 ? 'text-red-600' : 'text-green-600'}\`}>
                      {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(change).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              {metric.goal && (
                <>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: \`\${Math.min(percentToGoal, 100)}%\` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {metric.current} {metric.unit}</span>
                    <span>Goal: {metric.goal} {metric.unit}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
