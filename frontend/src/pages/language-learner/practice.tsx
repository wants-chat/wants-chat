import React, { useState, useEffect } from 'react';
import { Target, Brain, Clock, CheckCircle2, X, Play, Trophy, TrendingUp, Filter, Zap, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import XPCounter from '../../components/language-learner/ui/XPCounter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useExercises, useSubmitExercise } from '../../hooks/language-learner';

interface PracticeSession {
  startTime: Date;
  completed: number;
  correct: number;
  streak: number;
  xpEarned: number;
}

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for filtering and practice
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStats, setSessionStats] = useState<PracticeSession>({
    startTime: new Date(),
    completed: 0,
    correct: 0,
    streak: 0,
    xpEarned: 0
  });

  // API hooks
  const queryParams = {
    user_id: user?.id,
    difficulty_level: difficultyFilter ? parseInt(difficultyFilter) : undefined,
    type: typeFilter || undefined,
    include_answers: false
  };

  console.log('useExercises query params:', queryParams); // Debug logging

  const { 
    data: exercisesData, 
    isLoading: exercisesLoading, 
    error: exercisesError,
    refetch: refetchExercises 
  } = useExercises(queryParams);

  const submitExerciseMutation = useSubmitExercise();

  const exercises = exercisesData?.data || [];
  const currentExercise = exercises[currentExerciseIndex];
  const userProgress = exercisesData?.user_unit_progress;

  // Debug logging
  console.log('Practice Page Debug:', {
    exercisesData,
    exercises,
    exercisesLoading,
    exercisesError,
    user: user?.id,
    difficultyFilter,
    typeFilter
  });

  const difficultyLevels = [
    { value: '1', label: 'Beginner (1)', color: 'text-green-600' },
    { value: '2', label: 'Easy (2)', color: 'text-blue-600' },
    { value: '3', label: 'Medium (3)', color: 'text-yellow-600' },
    { value: '4', label: 'Hard (4)', color: 'text-orange-600' },
    { value: '5', label: 'Expert (5)', color: 'text-red-600' }
  ];

  const exerciseTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'fill_blank', label: 'Fill in the Blank' },
    { value: 'translation', label: 'Translation' },
    { value: 'listening', label: 'Listening' }
  ];

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'text-green-400 bg-green-500/20 border-green-500/30',
      2: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      3: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      4: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      5: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return colors[level as keyof typeof colors] || 'text-white/60 bg-white/10';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'not_attempted':
        return 'text-white/60 bg-white/10 border-white/20';
      default:
        return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const handleFilterChange = () => {
    refetchExercises();
    setSessionStarted(false);
    setCurrentExerciseIndex(0);
  };

  useEffect(() => {
    handleFilterChange();
  }, [difficultyFilter, typeFilter]);

  const startPracticeSession = () => {
    setSessionStarted(true);
    setCurrentExerciseIndex(0);
    setSessionStats({
      startTime: new Date(),
      completed: 0,
      correct: 0,
      streak: 0,
      xpEarned: 0
    });
  };

  const handleAnswerSubmit = async () => {
    if (showFeedback || !currentExercise) return;

    const submissionData = {
      user_answer: { option_index: currentExercise.options?.indexOf(selectedAnswer) || 0 },
      time_spent_seconds: 30
    };

    try {
      const response = await submitExerciseMutation.mutateAsync({
        exerciseId: currentExercise.id,
        submissionData
      } as any);

      setIsCorrect(response.is_correct);
      setShowFeedback(true);
      
      const newStats = {
        ...sessionStats,
        completed: sessionStats.completed + 1,
        correct: response.is_correct ? sessionStats.correct + 1 : sessionStats.correct,
        streak: response.is_correct ? sessionStats.streak + 1 : 0,
        xpEarned: sessionStats.xpEarned + response.points_earned
      };
      
      setSessionStats(newStats);
    } catch (error) {
      console.error('Failed to submit exercise:', error);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Session completed
      setSessionStarted(false);
      refetchExercises(); // Refresh to get updated progress
    }
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    if (currentExercise.type === 'multiple_choice') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentExercise.options?.map((option: any) => (
              <Button
                key={option}
                variant={selectedAnswer === option ? "default" : "outline"}
                size="lg"
                className={`h-16 text-lg transition-all duration-200 ${
                  showFeedback
                    ? 'opacity-60'
                    : ''
                }`}
                onClick={() => setSelectedAnswer(option)}
                disabled={showFeedback}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return <div>Exercise type not implemented yet</div>;
  };

  if (exercisesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Practice Exercises
          </h1>
          <p className="text-white/60">
            Practice with real exercises from all units
          </p>
        </div>

        {sessionStarted && (
          <div className="flex items-center space-x-4">
            <XPCounter currentXP={sessionStats.xpEarned} targetXP={100} size="sm" animated={false} />
          </div>
        )}
      </div>

      <div>
        {!sessionStarted ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <GlassCard className="text-center" hover={false}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 w-fit mx-auto mb-2">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {exercises.length}
                </div>
                <div className="text-sm text-white/60">
                  Total Exercises
                </div>
              </GlassCard>

              <GlassCard className="text-center" hover={false}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 w-fit mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {userProgress?.completed_exercises || 0}
                </div>
                <div className="text-sm text-white/60">
                  Completed
                </div>
              </GlassCard>

              <GlassCard className="text-center" hover={false}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 w-fit mx-auto mb-2">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {userProgress?.total_points || 0}
                </div>
                <div className="text-sm text-white/60">
                  Points Earned
                </div>
              </GlassCard>

              <GlassCard className="text-center" hover={false}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 w-fit mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {userProgress?.max_possible_points ? Math.round((userProgress.total_points / userProgress.max_possible_points) * 100) : 0}%
                </div>
                <div className="text-sm text-white/60">
                  Overall Progress
                </div>
              </GlassCard>
            </div>

            {/* Filters */}
            <GlassCard hover={false}>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Filter Exercises</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">
                    Difficulty Level
                  </label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All difficulty levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <span className={level.color}>{level.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">
                    Exercise Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All exercise types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {exerciseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-white/60">
                  Showing {exercises.length} exercises
                </p>
                <Button onClick={startPracticeSession} disabled={exercises.length === 0} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Practice Session
                </Button>
              </div>
            </GlassCard>

            {/* Exercise List */}
            {exercises.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Available Exercises
                </h2>

                <div className="grid gap-4">
                  {exercises.map((exercise: any) => (
                    <GlassCard key={exercise.id} hover={true}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                            <h3 className="text-lg font-semibold text-white">
                              {exercise.title}
                            </h3>
                            <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                              Level {exercise.difficulty_level}
                            </Badge>
                            <Badge className="bg-white/10 text-white/70 border-white/20">
                              {exercise.type.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(exercise.user_progress?.status || 'not_attempted')}>
                              {exercise.user_progress?.status?.replace('_', ' ') || 'not attempted'}
                            </Badge>
                          </div>

                          <p className="text-white/60 mb-2">
                            {exercise.question}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-white/50">
                            <span>Unit: {exercise.unit_title}</span>
                            <span>•</span>
                            <span>{exercise.points} points</span>
                            {exercise.user_progress?.status === 'completed' && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400">
                                  {exercise.user_progress.points_earned} points earned
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {exercise.user_progress?.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={() => navigate(`/language-learner/lesson?exercise_id=${exercise.id}`)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Practice
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {exercises.length === 0 && !exercisesLoading && (
              <GlassCard className="text-center" hover={false}>
                <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No exercises found
                </h3>
                <p className="text-white/60 mb-4">
                  No exercises match your current filters. Try adjusting your difficulty level or exercise type filters.
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => {
                  setDifficultyFilter('');
                  setTypeFilter('');
                }}>
                  Clear Filters
                </Button>
              </GlassCard>
            )}
          </div>
        ) : (
          /* Practice Session */
          <div className="space-y-6">
            {/* Session Progress */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-white/60">
                    Exercise {currentExerciseIndex + 1} of {exercises.length}
                  </div>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-emerald-400">
                    ✓ {sessionStats.correct}
                  </div>
                  <div className="text-white/60">
                    Streak: {sessionStats.streak}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Current Exercise */}
            {currentExercise && (
              <GlassCard hover={false}>
                <div className="text-center mb-6">
                  <div className="flex justify-center space-x-2 mb-4 flex-wrap gap-2">
                    <Badge className={getDifficultyColor(currentExercise.difficulty_level)}>
                      Level {currentExercise.difficulty_level}
                    </Badge>
                    <Badge className="bg-white/10 text-white/70 border-white/20">
                      {currentExercise.type.replace('_', ' ')}
                    </Badge>
                    <Badge className="bg-white/10 text-white/70 border-white/20">
                      {currentExercise.points} points
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {currentExercise.question}
                  </h1>
                  <p className="text-white/60">
                    From unit: {currentExercise.unit_title}
                  </p>
                </div>

                {renderExercise()}

                {/* Feedback */}
                {showFeedback && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    isCorrect
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${
                        isCorrect ? 'bg-emerald-500/30' : 'bg-red-500/30'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <X className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          isCorrect ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </h3>
                        {currentExercise.explanation && (
                          <p className="text-white/60 mt-1">
                            {currentExercise.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="text-center mt-8">
                  {!showFeedback ? (
                    <Button
                      size="lg"
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer || submitExerciseMutation.isPending}
                      className="min-w-32 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      {submitExerciseMutation.isPending ? 'Checking...' : 'Check Answer'}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleContinue}
                      className={isCorrect ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'}
                    >
                      {currentExerciseIndex === exercises.length - 1 ? 'Finish Session' : 'Continue'}
                    </Button>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;