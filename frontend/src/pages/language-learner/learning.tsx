// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { useLessonProgress, useUnitProgress, useLessonUnits, useLessons } from '../../hooks/language-learner';
import {
  Trophy,
  Star,
  Lock,
  Play,
  CheckCircle2,
  Circle,
  BookOpen,
  Target,
  Award,
  GraduationCap,
  Clock,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { GlassCard } from '../../components/ui/GlassCard';
import LanguageFlag from '../../components/language-learner/ui/LanguageFlag';

interface Unit {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  unlock_criteria: any;
  estimated_duration_minutes: number;
  exercises_count: number;
  user_progress: {
    status: string;
    progress_percentage: number;
    completed_exercises: number;
    total_exercises: number;
    started_at?: string;
    completed_at?: string;
    total_time_spent?: number;
  };
  metadata: any;
  created_at: string;
  updated_at: string;
  exercises?: any[];
}

interface UnitsResponse {
  data: Unit[];
  total: number;
  lesson_info: {
    id: string;
    title: string;
    total_units: number;
  };
}

interface LearningPageProps {}

const LearningPage: React.FC<LearningPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lessonId, selectLesson } = useSelectedLesson();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Fetch all lessons when no lesson is selected
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useLessons({ limit: 20 });

  const lessons = lessonsData?.data || [];

  // Use the API hook to fetch lesson units
  const {
    data: unitsResponse,
    isLoading: loading,
    error: apiError,
    refetch: refetchUnits
  } = useLessonUnits(lessonId || '', {
    user_id: user?.id,
    include_exercises: false
  });

  const units = unitsResponse?.data || [];
  const lessonInfo = unitsResponse?.lesson_info || null;
  const error = apiError ? String(apiError) : null;

  // Fetch lesson progress from API
  const { 
    data: lessonProgress, 
    isLoading: isProgressLoading, 
    error: progressError 
  } = useLessonProgress(user?.id || '', lessonId || '');

  // Fetch unit progress from API (only when a unit is selected)
  const { 
    data: unitProgress, 
    isLoading: isUnitProgressLoading, 
    error: unitProgressError 
  } = useUnitProgress(user?.id || '', selectedUnit?.id || '');

  const handleStartUnit = (unit: Unit) => {
    console.log('handleStartUnit called with unit:', unit.id, 'is_locked:', unit.is_locked);
    if (!unit.is_locked) {
      const lessonUrl = `/language-learner/lesson?unit_id=${unit.id}`;
      console.log('Navigating to lesson page:', lessonUrl);
      console.log('Current location:', window.location.href);

      // Also preserve lesson_id parameter if needed
      if (lessonId) {
        const urlWithLesson = `/language-learner/lesson?unit_id=${unit.id}&lesson_id=${lessonId}`;
        console.log('Navigating with lesson_id preserved:', urlWithLesson);
        navigate(urlWithLesson);
      } else {
        navigate(lessonUrl);
      }

    } else {
      console.log('Unit is locked, cannot start');
    }
  };


  // Calculate position for units in a linear path
  const getUnitPosition = (index: number, total: number) => {
    const cols = 3;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = (col + 0.5) * (100 / cols);
    const y = 15 + row * 25;
    return { x, y };
  };

  // Calculate stats from lesson progress API or fallback to units data
  const lessonStats = {
    language: lessonInfo?.title || 'Spanish',
    languageCode: 'es',
    // Calculate actual completed units from units_progress array (more accurate than API's units_completed field)
    unitsCompleted: lessonProgress?.units_progress?.filter((unit: any) => unit.status === 'completed').length || units.filter(u => u.user_progress.status === 'completed').length,
    totalUnits: lessonProgress?.lesson_progress?.total_units || units.length,
    exercisesCompleted: lessonProgress?.lesson_progress?.exercises_completed || 0,
    totalExercises: lessonProgress?.lesson_progress?.total_exercises || 0,
  };

  // Calculate overall progress based on actual completed units (after lessonStats definition)
  const actualUnitsCompleted = lessonStats.unitsCompleted;
  const actualTotalUnits = lessonStats.totalUnits;
  (lessonStats as any).overallProgress = actualTotalUnits > 0 ? Math.round((actualUnitsCompleted / actualTotalUnits) * 100) : 0;

  const getDifficultyColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'not_started':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const isUnitCompleted = (unit: Unit) => {
    // Use real unit progress data if available, otherwise fallback to local data
    if (selectedUnit?.id === unit.id && unitProgress) {
      return (unitProgress as any).status === 'completed';
    }
    return unit.user_progress.status === 'completed';
  };
  
  const isUnitCurrent = (unit: Unit) => {
    // Use real unit progress data if available, otherwise fallback to local data
    if (selectedUnit?.id === unit.id && unitProgress) {
      return (unitProgress as any).status === 'in_progress';
    }
    return unit.user_progress.status === 'in_progress';
  };
  
  const isUnitUnlocked = (unit: Unit) => !unit.is_locked;

  const getUnitIcon = (unit: Unit) => {
    if (isUnitCompleted(unit)) {
      return <Trophy className="h-8 w-8 text-yellow-500" />;
    }
    if (isUnitCurrent(unit)) {
      return <Star className="h-8 w-8 text-[#47bdff]" />;
    }
    if (isUnitUnlocked(unit)) {
      return <Circle className="h-8 w-8 text-muted-foreground" />;
    }
    return <Lock className="h-8 w-8 text-muted-foreground/60" />;
  };

  const getUnitCardStyle = (unit: Unit) => {
    let baseStyle = 'transition-all duration-300 cursor-pointer hover:shadow-lg bg-white/10 backdrop-blur-xl border ';

    if (isUnitCompleted(unit)) {
      baseStyle +=
        'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 shadow-md';
    } else if (isUnitCurrent(unit)) {
      baseStyle +=
        'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/50 shadow-md ring-2 ring-teal-500/30';
    } else if (isUnitUnlocked(unit)) {
      baseStyle += 'border-white/20 hover:border-teal-400/50';
    } else {
      baseStyle += 'border-white/10 opacity-60';
    }

    return baseStyle;
  };

  // Handler to select a lesson
  const handleSelectLesson = (lesson: any) => {
    selectLesson(lesson.id);
    navigate(`/language-learner/learning?lesson_id=${lesson.id}`);
  };

  // Show lessons list if no lesson is selected
  if (!lessonId) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <GraduationCap className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Browse Lessons</h1>
              <p className="text-white/60">
                Choose a lesson to start learning
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {lessonsLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-teal-400 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error State */}
        {lessonsError && (
          <GlassCard className="text-center">
            <div className="text-red-400 mb-4">Failed to load lessons</div>
          </GlassCard>
        )}

        {/* Empty State */}
        {!lessonsLoading && !lessonsError && lessons.length === 0 && (
          <GlassCard className="text-center py-16">
            <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Lessons Available</h3>
            <p className="text-white/60">
              Check back later for new language lessons.
            </p>
          </GlassCard>
        )}

        {/* Lessons Grid */}
        {!lessonsLoading && !lessonsError && lessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson: any) => (
              <GlassCard
                key={lesson.id}
                className="cursor-pointer"
                hover={true}
                onClick={() => handleSelectLesson(lesson)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-teal-500/20">
                      <BookOpen className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">
                        {lesson.title}
                      </h3>
                      <Badge className="mt-1 bg-white/10 text-white/70 border-white/20">
                        {lesson.languageCode?.toUpperCase() || 'ES'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/40" />
                </div>

                {lesson.description && (
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-white/50">
                  <div className="flex items-center space-x-4">
                    {lesson.totalUnits > 0 && (
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {lesson.totalUnits} units
                      </span>
                    )}
                    {lesson.estimatedDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {lesson.estimatedDuration} min
                      </span>
                    )}
                  </div>
                  <Badge
                    className={
                      lesson.difficultyLevel === 'beginner'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : lesson.difficultyLevel === 'intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {lesson.difficultyLevel || 'beginner'}
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <LanguageFlag languageCode={lessonStats.languageCode} size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {lessonInfo?.title || 'Language Course'}
              </h1>
              <p className="text-white/60">
                {lessonStats.unitsCompleted} of {lessonStats.totalUnits} units completed
              </p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <GlassCard className="mb-6" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <BookOpen className="h-5 w-5 text-teal-400" />
              </div>
              <span className="text-lg font-semibold text-white">Course Progress</span>
            </div>
            <Badge className={getDifficultyColor('in_progress')}>
              {(lessonStats as any).overallProgress}% Complete
            </Badge>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${(lessonStats as any).overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-white/60 mt-2">
            <span>{lessonStats.unitsCompleted} units completed</span>
            <span>{lessonStats.totalUnits - lessonStats.unitsCompleted} units remaining</span>
          </div>
        </GlassCard>
      </div>

      {/* Skill Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Tree Visualization */}
        <div className="lg:col-span-2">
          <GlassCard hover={false}>
            <div className="relative h-[600px] overflow-hidden">
                  <svg
                    width="100%"
                    height="100%"
                    className="absolute inset-0"
                    style={{ zIndex: 0 }}
                  >
                    {/* Connection lines */}
                    {units.slice(0, -1).map((unit, index) => {
                      const nextUnit = units[index + 1];
                      const unitPos = getUnitPosition(index, units.length);
                      const nextPos = getUnitPosition(index + 1, units.length);
                      return (
                        <line
                          key={`connection-${unit.id}`}
                          x1={`${unitPos.x}%`}
                          y1={`${unitPos.y + 8}%`}
                          x2={`${nextPos.x}%`}
                          y2={`${nextPos.y}%`}
                          stroke={isUnitCompleted(unit) ? '#10b981' : 'hsl(var(--border))'}
                          strokeWidth="3"
                          strokeDasharray={isUnitCompleted(unit) ? '0' : '5,5'}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>

                  {/* Unit Cards */}
                  {units.map((unit, index) => {
                    const position = getUnitPosition(index, units.length);
                    return (
                    <div
                      key={unit.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        zIndex: 10,
                      }}
                      onClick={() => {
                        console.log('Unit card clicked:', unit.id, 'unlocked:', isUnitUnlocked(unit));
                        if (isUnitUnlocked(unit)) {
                          setSelectedUnit(unit);
                          console.log('Selected unit set to:', unit.id);
                        }
                      }}
                    >
                      <div className={`rounded-lg p-3 text-center h-full flex flex-col justify-between ${getUnitCardStyle(unit)}`}>
                        <div className="flex justify-center mb-2">{getUnitIcon(unit)}</div>
                        <div>
                          <h3 className="font-semibold text-sm text-white mb-1">
                            {unit.title}
                          </h3>
                          <div className="text-xs text-white/60">
                            {(() => {
                              // Find unit progress from lesson progress API data
                              const unitProgressData = lessonProgress?.units_progress?.find(up => up.unit_id === unit.id);
                              const completedExercises = (unitProgressData as any)?.exercises_progress?.filter((ex: any) => ex.status === 'completed').length || unit.user_progress.completed_exercises;
                              const totalExercises = (unitProgressData as any)?.exercises_progress?.length || unit.exercises_count;
                              return `${completedExercises}/${totalExercises}`;
                            })()}
                          </div>
                          {(() => {
                            // Calculate progress for progress bar
                            const unitProgressData = lessonProgress?.units_progress?.find(up => up.unit_id === unit.id);
                            const completedExercises = (unitProgressData as any)?.exercises_progress?.filter((ex: any) => ex.status === 'completed').length || unit.user_progress.completed_exercises;
                            const totalExercises = (unitProgressData as any)?.exercises_progress?.length || unit.exercises_count;
                            const progressPercentage = unitProgressData?.progress_percentage || unit.user_progress.progress_percentage;

                            return completedExercises > 0 && completedExercises < totalExercises && (
                              <div className="h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )})}
            </div>
          </GlassCard>
        </div>

        {/* Unit Details Panel */}
        <div>
          <GlassCard className="sticky top-4" hover={false}>
            {selectedUnit ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getUnitIcon(selectedUnit)}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedUnit.title}
                    </h2>
                    <Badge className={getDifficultyColor((unitProgress as any)?.status || selectedUnit.user_progress.status)}>
                      {((unitProgress as any)?.status || selectedUnit.user_progress.status).replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <p className="text-white/60">{selectedUnit.description}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="font-medium text-white">
                      {(unitProgress as any)?.exercises_progress?.filter((ex: any) => ex.status === 'completed').length || selectedUnit.user_progress.completed_exercises}/{(unitProgress as any)?.exercises_progress?.length || selectedUnit.exercises_count} exercises
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${unitProgress?.progress_percentage || selectedUnit.user_progress.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <Award className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">
                      {selectedUnit.exercises_count * 10} XP
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <Target className="h-5 w-5 text-teal-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">
                      {selectedUnit.estimated_duration_minutes} min
                    </div>
                  </div>
                </div>

                {/* Exercises */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Exercise Progress:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-white/60">
                        {(unitProgress as any)?.exercises_progress?.filter((ex: any) => ex.status === 'completed').length || selectedUnit.user_progress.completed_exercises} of {(unitProgress as any)?.exercises_progress?.length || selectedUnit.exercises_count} exercises completed
                      </span>
                    </div>
                    {selectedUnit.user_progress.total_time_spent && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Target className="h-4 w-4 text-teal-400" />
                        <span className="text-white/60">
                          Time spent: {Math.floor(selectedUnit.user_progress.total_time_spent / 60)} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  disabled={selectedUnit.is_locked}
                  size="lg"
                  onClick={() => {
                    console.log('Continue button clicked for unit:', selectedUnit?.id);
                    if (selectedUnit) {
                      handleStartUnit(selectedUnit);
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isUnitCompleted(selectedUnit)
                    ? 'Review Unit'
                    : isUnitCurrent(selectedUnit)
                    ? 'Continue'
                    : isUnitUnlocked(selectedUnit)
                    ? 'Start Unit'
                    : 'Locked'}
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white/60 text-sm">Loading units...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-4">{error}</div>
                <Button onClick={() => refetchUnits()} size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Unit</h3>
                <p className="text-white/60 text-sm">
                  Click on a unit from the skill tree to view details and start learning.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;