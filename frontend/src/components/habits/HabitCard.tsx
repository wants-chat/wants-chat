import React, { useState, useEffect } from 'react';
import { Edit, Trash2, MoreVertical, Check } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Habit, HabitCompletion } from '../../hooks/habits/useHabits';

interface HabitCardProps {
  habit: Habit;
  isCompleted?: boolean;
  currentProgress?: number;
  todayCompletion?: HabitCompletion | null;
  onToggleComplete: (habitId: string, isCompleted: boolean) => void;
  onUpdateProgress?: (habitId: string, value: number) => Promise<void>;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  onQuickUpdate?: (habitId: string, data: { name?: string }) => Promise<void>;
  showActions?: boolean;
  compact?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCompleted = false,
  currentProgress = 0,
  todayCompletion,
  onToggleComplete,
  onUpdateProgress,
  onEdit,
  onDelete,
  onQuickUpdate,
  showActions = true,
  compact = false
}) => {
  const [editedProgress, setEditedProgress] = useState(currentProgress);
  const [isSaving, setIsSaving] = useState(false);

  // Use camelCase (API response) with fallback to snake_case (legacy)
  const habitTargetValue = habit.targetValue ?? habit.target_value;
  const habitTargetUnit = habit.targetUnit ?? habit.target_unit;
  const habitFrequencyType = habit.frequencyType ?? habit.frequency_type;

  const isMeasurable = !!(habitTargetValue && habitTargetUnit);
  const targetValue = habitTargetValue || 1;
  const targetUnit = habitTargetUnit || 'times';

  const effectiveProgress = isMeasurable ? currentProgress : (isCompleted ? 1 : 0);
  const progressPercentage = Math.min((effectiveProgress / targetValue) * 100, 100);

  useEffect(() => {
    setEditedProgress(currentProgress);
  }, [currentProgress]);

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'fitness': return '💪';
      case 'health': return '❤️';
      case 'learning': return '📚';
      case 'work': return '💼';
      case 'personal': return '🌟';
      case 'social': return '👥';
      case 'wellness': return '🧘';
      case 'finance': return '💰';
      case 'creativity': return '🎨';
      case 'mindfulness': return '🧠';
      default: return '📌';
    }
  };

  const handleSaveProgress = async () => {
    if (!onUpdateProgress || editedProgress === currentProgress) return;
    setIsSaving(true);
    try {
      await onUpdateProgress(habit.id, editedProgress);
    } finally {
      setIsSaving(false);
    }
  };

  const getQuickIncrementValue = () => {
    switch (targetUnit.toLowerCase()) {
      case 'ml': case 'milliliters': return 250;
      case 'l': case 'liters': return 0.5;
      case 'km': case 'kilometers': return 1;
      case 'min': case 'minutes': return 15;
      case 'steps': return 1000;
      default: return 1;
    }
  };

  const handleQuickProgressChange = async (delta: number) => {
    if (!onUpdateProgress) return;
    const newValue = Math.max(0, Math.min(targetValue, currentProgress + delta));
    if (newValue !== currentProgress) {
      setIsSaving(true);
      try {
        await onUpdateProgress(habit.id, newValue);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // =============================================
  // COMPACT LIST VIEW - Habitify Style
  // =============================================
  if (compact) {
    return (
      <div className={`flex items-center gap-4 px-4 py-4 bg-white/10 backdrop-blur-xl border-b border-white/20 hover:bg-white/20 transition-colors ${
        progressPercentage >= 100 ? 'bg-green-500/20' : ''
      }`}>
        {/* Left: Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${habit.color || '#47bdff'}20` }}
        >
          <span className="text-lg">{getCategoryIcon(habit.category)}</span>
        </div>

        {/* Middle: Info + Progress Bar */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-white ${
            progressPercentage >= 100 ? 'text-green-400' : ''
          }`}>
            {habit.name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-white/60">
              {effectiveProgress} / {targetValue} {targetUnit}
            </span>
            {/* Progress bar */}
            <div className="flex-1 max-w-[120px]">
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Right: Habitify style input - Always show for all habits */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs text-white/60">Add ({targetUnit})</span>
            <input
              type="number"
              value={editedProgress || ''}
              onChange={(e) => setEditedProgress(Math.max(0, Math.min(targetValue, Number(e.target.value))))}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveProgress()}
              placeholder="0"
              max={targetValue}
              className="w-16 text-right text-primary font-semibold text-lg bg-transparent border-0 border-b-2 border-dashed border-white/30 focus:border-primary focus:outline-none"
              disabled={isSaving || progressPercentage >= 100}
            />
          </div>
          <button
            onClick={handleSaveProgress}
            disabled={isSaving || editedProgress === currentProgress || progressPercentage >= 100}
            className={`p-1 transition-all ${
              progressPercentage >= 100
                ? 'text-green-500'
                : editedProgress !== currentProgress
                ? 'text-primary hover:text-primary/80'
                : 'text-gray-300'
            }`}
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(habit.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  // =============================================
  // GRID CARD VIEW - With Progress & Input
  // =============================================
  return (
    <Card className={`rounded-2xl transition-all hover:shadow-lg overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 ${
      progressPercentage >= 100
        ? 'border-l-4 border-green-500 bg-green-500/20'
        : 'border-l-4 border-primary'
    }`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${habit.color || '#47bdff'}20` }}
            >
              <span className="text-lg">{getCategoryIcon(habit.category)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-white truncate ${
                progressPercentage >= 100 ? 'text-green-400' : ''
              }`}>
                {habit.name}
              </h3>
              <p className="text-xs text-white/60">{habit.category} • {habitFrequencyType}</p>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(habit.id)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Progress Section - Always show for all habits */}
        <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
          {/* Progress text and bar */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${progressPercentage >= 100 ? 'text-green-400' : 'text-primary'}`}>
              {effectiveProgress} / {targetValue} {targetUnit}
            </span>
            <span className="text-xs text-white/60">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-3" />

          {/* Habitify style input */}
          <div className="flex items-center justify-end gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs text-white/60">Add ({targetUnit})</span>
              <input
                type="number"
                value={editedProgress || ''}
                onChange={(e) => setEditedProgress(Math.max(0, Math.min(targetValue, Number(e.target.value))))}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProgress()}
                placeholder="0"
                max={targetValue}
                className="w-16 text-right text-primary font-semibold text-lg bg-transparent border-0 border-b-2 border-dashed border-white/30 focus:border-primary focus:outline-none"
                disabled={isSaving || progressPercentage >= 100}
              />
            </div>
            <button
              onClick={handleSaveProgress}
              disabled={isSaving || editedProgress === currentProgress || progressPercentage >= 100}
              className={`p-1.5 rounded transition-all ${
                progressPercentage >= 100
                  ? 'text-green-500'
                  : editedProgress !== currentProgress
                  ? 'text-primary hover:bg-primary/10'
                  : 'text-gray-300'
              }`}
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
