import React from 'react';
import { HabitCard } from './HabitCard';
import { Target } from 'lucide-react';
import type { Habit } from '../../types/habits';

interface HabitGridProps {
  habits: Habit[];
  completedHabitIds?: string[];
  onToggleComplete: (habitId: string, isCompleted: boolean) => void;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  completedHabitIds = [],
  onToggleComplete,
  onEdit,
  onDelete,
  emptyMessage = 'No habits found',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-white/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompleted={completedHabitIds.includes(habit.id)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};