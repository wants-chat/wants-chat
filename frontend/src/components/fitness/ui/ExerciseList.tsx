import React, { useState } from 'react';
import { Search, Filter, Info, Plus, Clock, Dumbbell } from 'lucide-react';
import { ExerciseDBEntry } from '../../../types/fitness';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface ExerciseListProps {
  exercises: ExerciseDBEntry[];
  onAddExercise?: (exercise: ExerciseDBEntry) => void;
  showAddButton?: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  onAddExercise,
  showAddButton = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Get unique values for filters
  const categories = ['all', ...new Set(exercises.map(e => e.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['all', ...new Set(exercises.flatMap(e => e.targetMuscles))];

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    const matchesMuscle = selectedMuscle === 'all' || 
      exercise.targetMuscles.some(muscle => muscle === selectedMuscle);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscle;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'cardio':
        return <Clock className="h-4 w-4" />;
      default:
        return <Dumbbell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="p-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            {muscleGroups.map(muscle => (
              <option key={muscle} value={muscle}>
                {muscle === 'all' ? 'All Muscles' : muscle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredExercises.length} exercises
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => setExpandedExercise(
                expandedExercise === exercise.id ? null : exercise.id
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(exercise.category)}
                    <h4 className="font-semibold">{exercise.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exercise.targetMuscles.join(', ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      getDifficultyColor(exercise.difficulty)
                    )}>
                      {exercise.difficulty}
                    </span>
                    {exercise.equipment && exercise.equipment !== 'None' && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {exercise.equipment}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {showAddButton && onAddExercise && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddExercise(exercise);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  <Info className={cn(
                    "h-5 w-5 transition-transform",
                    expandedExercise === exercise.id ? "rotate-180" : ""
                  )} />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedExercise === exercise.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Secondary Muscles</h5>
                    <p className="text-sm text-muted-foreground">
                      {exercise.secondaryMuscles.join(', ')}
                    </p>
                  </div>
                )}

                {exercise.steps && exercise.steps.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">How to Perform</h5>
                    <ol className="space-y-1">
                      {exercise.steps.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex">
                          <span className="font-medium mr-2">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {exercise.tips && exercise.tips.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Tips</h5>
                    <ul className="space-y-1">
                      {exercise.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex">
                          <span className="mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No exercises found matching your criteria</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Try adjusting your filters or search term
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;