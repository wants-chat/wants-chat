import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter, Dumbbell, Target, Clock, Info, Loader2, RefreshCw } from 'lucide-react';
import { Exercise } from '../../services/fitnessService';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  isLoading?: boolean;
  error?: Error | null;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  exercises, 
  isLoading = false, 
  error = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  // Extract unique values for filters
  const categories = ['all', ...new Set(exercises.map(e => e.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['all', ...new Set(exercises.flatMap(e => e.targetMuscleGroups || []))];

  // Filter exercises whenever filters or exercises change
  useEffect(() => {
    if (!exercises) {
      setFilteredExercises([]);
      return;
    }

    let filtered = exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.targetMuscleGroups || []).some(muscle => 
                            muscle.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
      
      const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
      
      const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
        (exercise.targetMuscleGroups || []).some(muscle => muscle === selectedMuscleGroup);
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscleGroup;
    });

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, selectedCategory, selectedDifficulty, selectedMuscleGroup]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'cardio':
        return <Clock className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedMuscleGroup('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || 
                          selectedDifficulty !== 'all' || selectedMuscleGroup !== 'all';

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <Dumbbell className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Error Loading Exercises</h3>
            <p className="text-sm text-muted-foreground">
              {error.message || 'Failed to load exercise library'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Dumbbell className="h-6 w-6 mr-2 text-primary" />
              Exercise Library
            </h2>
            <p className="text-sm text-muted-foreground">
              Discover exercises to build your perfect workout
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search exercises by name or muscle group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Muscle Group</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All Muscle Groups" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map(muscle => (
                  <SelectItem key={muscle} value={muscle}>
                    {muscle === 'all' ? 'All Muscle Groups' : muscle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count and active filters */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading exercises...
              </span>
            ) : (
              `Found ${filteredExercises.length} exercise${filteredExercises.length !== 1 ? 's' : ''}`
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <div className="flex items-center space-x-1">
                {searchTerm && <Badge variant="secondary">Search: {searchTerm}</Badge>}
                {selectedCategory !== 'all' && <Badge variant="secondary">{selectedCategory}</Badge>}
                {selectedDifficulty !== 'all' && <Badge variant="secondary">{selectedDifficulty}</Badge>}
                {selectedMuscleGroup !== 'all' && <Badge variant="secondary">{selectedMuscleGroup}</Badge>}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Exercise List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="space-y-4">
          {filteredExercises.map((exercise) => (
            <Card 
              key={exercise.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedExercise(
                  expandedExercise === exercise.id ? null : exercise.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(exercise.category)}
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {exercise.category}
                      </Badge>
                      {(exercise.equipment || []).slice(0, 2).map((equip, index) => (
                        <Badge key={index} variant="secondary">
                          {equip}
                        </Badge>
                      ))}
                      {(exercise.equipment || []).length > 2 && (
                        <Badge variant="secondary">
                          +{(exercise.equipment || []).length - 2} more
                        </Badge>
                      )}
                    </div>

                    {(exercise.targetMuscleGroups || []).length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Targets:</span> {(exercise.targetMuscleGroups || []).join(', ')}
                      </div>
                    )}
                  </div>

                  <Info className={`h-5 w-5 transition-transform ${
                    expandedExercise === exercise.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedExercise === exercise.id && (
                <div className="border-t bg-muted/20 p-4 space-y-4">
                  {(exercise.instructions || []).length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Instructions</h4>
                      <ol className="space-y-1">
                        {(exercise.instructions || []).map((instruction, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex">
                            <span className="font-medium mr-2 text-foreground">{index + 1}.</span>
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {exercise.imageUrl && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Exercise Image</h4>
                      <img 
                        src={exercise.imageUrl} 
                        alt={exercise.name}
                        className="rounded-lg max-w-xs h-48 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {exercise.videoUrl && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Exercise Video</h4>
                      <a 
                        href={exercise.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Watch demonstration video →
                      </a>
                    </div>
                  )}

                  {(exercise.equipment || []).length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Equipment Needed</h4>
                      <div className="flex flex-wrap gap-1">
                        {(exercise.equipment || []).map((equip, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {equip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-2">No exercises found</h3>
            <p className="text-sm">
              Try adjusting your search terms or filters to find more exercises
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExerciseLibrary;