import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flag, Trophy, Star, Volume2, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import HeartCounter from '../../components/language-learner/ui/HeartCounter';
import XPCounter from '../../components/language-learner/ui/XPCounter';
import LessonPlayer from '../../components/language-learner/lesson/LessonPlayer';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { toast } from '../../components/ui/sonner';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

import type { Exercise } from '../../components/language-learner/lesson/LessonPlayer';

// Import API hooks
import {
  useLessons,
  useLesson,
  useUpdateLesson,
  useCreateProgress,
  useUnitExercises,
  useUnitExerciseStats,
  useExercise,
  useSubmitExercise,
  // Temporarily disabled: useProgressTracker, useUnitSession,
  Exercise as APIExercise,
  UnitExercisesResponse,
  SubmitExerciseRequest,
  SubmitExerciseResponse
} from '../../hooks/language-learner';

// Firework particle component
const FireworkParticle: React.FC<{ delay: number }> = ({ delay }) => {
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-ping"
      style={{
        background: `hsl(${Math.random() * 360}, 70%, 60%)`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        animationDuration: '2s'
      }}
    />
  );
};

// Congratulations overlay component
const CongratulationsOverlay: React.FC<{
  isVisible: boolean;
  xpEarned: number;
  unitTitle: string;
  onContinue: () => void;
}> = ({ isVisible, xpEarned, unitTitle, onContinue }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Fireworks particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <FireworkParticle key={i} delay={i * 100} />
        ))}
      </div>

      {/* Congratulations card */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 mx-4 max-w-lg w-full text-center shadow-2xl border border-white/20">
        {/* Trophy icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl animate-bounce relative">
            <Trophy className="h-14 w-14 text-white" />
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
          </div>
        </div>

        {/* Congratulations text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            ¡Felicidades!
          </h1>
          <p className="text-xl text-white/70 font-medium">
            You completed {unitTitle}!
          </p>
        </div>

        {/* XP earned */}
        <div className="bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl p-6 mb-8 border border-teal-500/30 shadow-inner">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Star className="h-7 w-7 text-teal-400 animate-spin" />
            <span className="text-3xl font-bold text-white tracking-tight">
              +{xpEarned} XP
            </span>
            <Star className="h-7 w-7 text-cyan-400 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
          <p className="text-sm text-white/60 font-medium">Experience Points Earned</p>
        </div>

        {/* Motivational message */}
        <div className="mb-8">
          <p className="text-white/70 text-lg font-medium leading-relaxed">
            "Every step forward is progress."
          </p>
          <p className="text-teal-400 font-semibold mt-2">
            ¡Sigue así!
          </p>
        </div>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-none shadow-lg transform hover:scale-[1.02] transition-all duration-300 rounded-xl"
        >
          Continue Learning
          <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
        </Button>
      </div>

      {/* Floating stars animation */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <Star
            key={i}
            className="absolute h-4 w-4 text-teal-400 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 200}ms`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface LessonData {
  id: string;
  title: string;
  unit: string;
  exercises: Exercise[];
  xpReward: number;
  heartsRequired: number;
}

const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId: paramLessonId } = useParams<{ lessonId: string }>();
  const { lessonId: selectedLessonId } = useSelectedLesson();
  const { user } = useAuth();

  // Use the selected lesson ID from hook, fallback to param
  const currentLessonId = selectedLessonId || paramLessonId;

  // Get parameters from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const unitId = urlParams.get('unit_id');
  const exerciseId = urlParams.get('exercise_id');

  const [currentUnit, setCurrentUnit] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState<SubmitExerciseResponse | null>(null);

  // API Hooks
  const { lesson, loading: isLoadingLesson, error: lessonError, refetch } = useLesson(currentLessonId || '');
  // const { data: lessons } = useLessons({ language_code: 'es', difficulty_level: 'beginner' } as any);

  // Unit exercises (when loading a full unit)
  const { data: unitExercises, isLoading: isLoadingExercises, error: exercisesError } = useUnitExercises(
    unitId || '',
    { user_id: unitId ? undefined : undefined, include_answers: false }
  );
  const { stats: exerciseStats } = useUnitExerciseStats(unitId || '');

  // Specific exercise (when loading individual exercise)
  const { data: specificExercise, isLoading: isLoadingSpecificExercise, error: specificExerciseError } = useExercise(
    exerciseId || '',
    { include_answers: false }
  );

  const updateLessonMutation = useUpdateLesson();
  const createProgressMutation = useCreateProgress();
  const submitExerciseMutation = useSubmitExercise();
  
  // New progress tracking hooks (temporarily disabled until backend is ready)
  // const { trackActivity } = useProgressTracker(user?.id || '');
  // const unitSession = useUnitSession(user?.id || '', unitId || '');

  // Start unit session when entering a unit-based lesson (temporarily disabled)
  // useEffect(() => {
  //   if (unitId && user?.id && !unitSession.sessionId && !unitSession.isStarting) {
  //     unitSession.startSession({
  //       language_code: 'es', // Could be dynamic based on unit
  //       difficulty_level: 'beginner',
  //       estimated_duration: 30, // 30 minutes estimated
  //     }).catch(error => {
  //       console.error('Failed to start unit session:', error);
  //     });
  //   }
  // }, [unitId, user?.id, unitSession]);

  // Navigate to learning page if no lesson context and no unit context
  useEffect(() => {
    if (!paramLessonId && !selectedLessonId && !unitId && !exerciseId) {
      console.log('No lesson, unit, or exercise context found, redirecting to learning page');
      navigate('/language-learner/learning');
    }
  }, [navigate, paramLessonId, selectedLessonId, unitId, exerciseId]);

  // Study session functionality disabled - not needed
  // useEffect(() => {
  //   if (lesson && !currentStudySession) {
  //     startStudySessionMutation.mutate({
  //       language_code: 'es',
  //       session_type: 'lesson',
  //       lesson_id: lesson.id
  //     } as any, {
  //       onSuccess: (session) => {
  //         setCurrentStudySession(session.id);
  //       }
  //     });
  //   }
  // }, [lesson?.id, currentStudySession]);

  // Handle hearts running out
  useEffect(() => {
    if (hearts === 0) {
      const dashboardUrl = currentLessonId
        ? `/language-learner/dashboard?lesson_id=${currentLessonId}`
        : '/language-learner/dashboard';

      navigate(dashboardUrl, {
        state: {
          heartsEmpty: true
        }
      });
    }
  }, [hearts, navigate, currentLessonId]);

  // Convert API data to component format - NO MOCK DATA
  const getLessonData = (): LessonData | null => {
    // Debug logging
    console.log('getLessonData debug:', {
      unitId,
      exerciseId,
      currentLessonId,
      unitExercises: unitExercises ? {
        data: (unitExercises as any)?.data,
        dataLength: (unitExercises as any)?.data?.length,
        unit_info: unitExercises.unit_info
      } : null,
      specificExercise,
      lesson,
      isLoadingExercises,
      isLoadingSpecificExercise,
      isLoadingLesson
    });

    // Priority 1: If we have a specific exercise from API, use that
    if (specificExercise) {
      return {
        id: exerciseId || 'specific-exercise',
        title: specificExercise.title,
        unit: `Exercise ${specificExercise.order_index}`,
        xpReward: specificExercise.points,
        heartsRequired: 1,
        exercises: [convertAPIExerciseToComponent(specificExercise)]
      };
    }

    // Priority 2: If we have unit exercises from API, use those
    if (unitExercises && (unitExercises as any).data.length > 0) {
      return {
        id: unitId || 'unit-lesson',
        title: unitExercises.unit_info.title,
        unit: `Unit ${unitExercises.unit_info.title}`,
        xpReward: unitExercises.user_unit_progress.max_possible_points || 50,
        heartsRequired: 1,
        exercises: (unitExercises as any).data.map(convertAPIExerciseToComponent)
      };
    }

    // Priority 3: If we have an API lesson, convert it
    if (lesson && (lesson as any).content?.exercises) {
      return {
        id: lesson.id,
        title: lesson.title,
        unit: (lesson as any).category || 'Unit 1',
        xpReward: (lesson as any).xp_reward || 50,
        heartsRequired: 1,
        exercises: (lesson as any).content.exercises.map((ex: any, index: number): Exercise => ({
          id: ex.id || `${index + 1}`,
          type: ex.type || 'multiple-choice',
          question: ex.question || '',
          instruction: ex.instruction || 'Select the correct option',
          options: ex.options || [],
          correctAnswer: ex.correct_answer || ex.correctAnswer || '',
          explanation: ex.explanation || '',
          difficulty: ex.difficulty || 'easy',
          audioUrl: ex.audio_url || '',
          optionImages: ex.option_images || ex.optionImages || undefined
        }))
      };
    }

    // No data available - return null
    return null;
  };

  // Helper functions for API data conversion
  const getInstructionForType = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
        return 'Select the correct option';
      case 'translation':
        return 'Type the correct translation';
      case 'listening':
        return 'Listen and type what you hear';
      case 'fill_in_blank':
        return 'Fill in the blank';
      case 'true_false':
        return 'Select true or false';
      default:
        return 'Complete the exercise';
    }
  };

  const getCorrectAnswerFromAPI = (apiEx: APIExercise): string => {
    if (apiEx.type === 'multiple_choice' && apiEx.correct_answer?.option_index !== undefined) {
      return apiEx.options?.[apiEx.correct_answer.option_index] || '';
    }
    if (apiEx.correct_answer?.text) {
      return apiEx.correct_answer.text;
    }
    if (apiEx.correct_answer?.answer) {
      return apiEx.correct_answer.answer;
    }
    return '';
  };

  const mapDifficultyLevel = (level: number): 'easy' | 'medium' | 'hard' => {
    if (level <= 2) return 'easy';
    if (level <= 4) return 'medium';
    return 'hard';
  };

  const mapExerciseType = (apiType: string): Exercise['type'] => {
    switch (apiType) {
      case 'multiple_choice':
        return 'multiple-choice';
      case 'fill_in_blank':
        return 'fill-blank';
      case 'translation':
        return 'translation';
      case 'listening':
        return 'listening';
      case 'speaking':
        return 'speaking';
      case 'matching':
        return 'matching';
      default:
        return 'multiple-choice';
    }
  };

  const convertAPIExerciseToComponent = (apiEx: APIExercise): Exercise => ({
    id: apiEx.id,
    type: mapExerciseType(apiEx.type),
    question: apiEx.question,
    instruction: getInstructionForType(apiEx.type),
    options: apiEx.options || [],
    correctAnswer: getCorrectAnswerFromAPI(apiEx),
    explanation: apiEx.explanation || '',
    difficulty: mapDifficultyLevel(apiEx.difficulty_level),
    audioUrl: apiEx.audio_url || '',
    optionImages: apiEx.metadata?.option_images || undefined
  });


  const lessonData = getLessonData();

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = (answer: string, correct: boolean) => {
    if (showFeedback || !lessonData) return;

    const currentEx = lessonData.exercises[currentExercise];
    
    // Get the current exercise - either from specific exercise or unit exercises
    const apiExercise = specificExercise || ((unitExercises as any)?.data[currentExercise]);
    
    // If we have an API exercise (either specific or from unit), use the submit endpoint
    if (apiExercise) {
      const userId = user?.id || ''; // Get user ID from auth context
      
      // For multiple choice, convert string answer to option index
      let answerData: Record<string, any>;
      if (apiExercise.type === 'multiple_choice') {
        const optionIndex = apiExercise.options?.findIndex((option: any) => option === answer) ?? -1;
        answerData = { option_index: optionIndex };
      } else {
        answerData = { text: answer };
      }
      
      const submissionData: SubmitExerciseRequest = {
        user_id: userId,
        answer: answerData,
        time_spent: 30 // rough estimate in seconds
      };
      
      submitExerciseMutation.mutate(
        { exerciseId: apiExercise.id, submissionData } as any,
        {
          onSuccess: (response) => {
            setSubmissionResponse(response);
            setIsCorrect(response.is_correct);
            setShowFeedback(true);
            
            
            if (response.is_correct) {
              setScore(score + response.points_earned);
              setEarnedXP(earnedXP + response.points_earned);
              setCompletedExercises([...completedExercises, apiExercise.id]);
              
              // Track successful exercise completion (temporarily disabled)
              // trackActivity({
              //   type: 'exercise_completed',
              //   exercise_id: apiExercise.id,
              //   unit_id: unitId || undefined,
              //   xp_earned: response.points_earned,
              //   time_spent_minutes: submissionData.time_spent || 0,
              // });
              
              // Update unit session stats (temporarily disabled)
              // unitSession.updateSessionStats({
              //   exercisesCompleted: 1,
              //   xpEarned: response.points_earned,
              //   correctAnswer: true,
              // });
            } else {
              setHearts(Math.max(0, hearts - 1));
              
              // Update unit session stats for incorrect answer (temporarily disabled)
              // unitSession.updateSessionStats({
              //   correctAnswer: false,
              // });
            }
          },
          onError: (error) => {
            console.error('Failed to submit exercise:', error);
            // Show user-friendly error message
            toast.error('Unable to submit answer due to a server issue. Please try again.');
            // Fallback to local validation
            setIsCorrect(correct);
            setShowFeedback(true);
          }
        }
      );
      return;
    }
    
    // Fallback to original logic for mock exercises
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const xpGain = currentEx.difficulty === 'hard' ? 15 : currentEx.difficulty === 'medium' ? 10 : 5;
      setScore(score + xpGain);
      setEarnedXP(earnedXP + xpGain);
      setCompletedExercises([...completedExercises, currentEx.id]);
    } else {
      setHearts(Math.max(0, hearts - 1));
    }
  };

  const handleContinue = () => {
    if (!lessonData) return;

    setShowFeedback(false);

    // Handle specific exercise navigation (navigate to next exercise by ID)
    if (specificExercise) {
      // If API response has next exercise, use that
      if (submissionResponse?.next_exercise) {
        navigate(`/language-learner/lesson?exercise_id=${submissionResponse.next_exercise.id}`);
        return;
      }
      // Fallback to navigation data in exercise
      else if (specificExercise.navigation?.next_exercise_id) {
        navigate(`/language-learner/lesson?exercise_id=${specificExercise.navigation.next_exercise_id}`);
        return;
      } else {
        // No next exercise - show congratulations
        setShowCongratulations(true);
        return;
      }
    }

    // Handle unit exercises or regular lesson navigation
    const isLastExercise = currentExercise === lessonData.exercises.length - 1;

    if (isLastExercise) {
      // Show congratulations overlay
      setShowCongratulations(true);
    } else {
      // For unit exercises, just move to the next exercise in the sequence
      setCurrentExercise(currentExercise + 1);
    }
  };

  const handleCongratulationsContinue = () => {
    setShowCongratulations(false);

    // Study session API removed as requested by user

    // Navigate back appropriately
    if (exerciseId) {
      // If came from practice page (has exercise_id), go back to practice
      navigate('/language-learner/practice');
    } else if (specificExercise && specificExercise.unit_id) {
      // For specific exercises, go back to unit view
      navigate(`/language-learner/learning?lesson_id=${specificExercise.unit_id}`);
    } else if (unitId) {
      // For unit exercises, go back to learning page
      if (currentLessonId) {
        navigate(`/language-learner/learning?lesson_id=${currentLessonId}`);
      } else {
        navigate('/language-learner/learning');
      }
    } else {
      // For regular lessons, go to dashboard
      const dashboardUrl = currentLessonId
        ? `/language-learner/dashboard?lesson_id=${currentLessonId}`
        : '/language-learner/dashboard';

      navigate(dashboardUrl, {
        state: {
          lessonCompleted: true,
          xpEarned: earnedXP + (lessonData?.xpReward || 0),
          score: score,
          unitTitle: currentUnit?.title || lesson?.title || specificExercise?.title
        }
      });
    }
  };

  const handlePlayAudio = async (text: string) => {
    if (!text) return;

    setIsListening(true);

    // Extract just the text from URL if it's a full URL
    const cleanText = text.includes('translate_tts')
      ? decodeURIComponent(text.split('q=')[1] || text)
      : text;

    // Use browser's built-in speech synthesis (no CORS issues)
    useSpeechSynthesis(cleanText);
  };


  const useSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      utterance.onend = () => {
        setIsListening(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsListening(false);
    }
  };

  const handleExit = () => {
    // Show warning toast and navigate after delay to allow user to cancel if needed
    toast.error('Exiting lesson - progress will be lost!', {
      duration: 3000,
      action: {
        label: 'Cancel',
        onClick: () => {
          // User cancelled, do nothing
        }
      }
    });

    // Navigate after a short delay to allow cancellation
    setTimeout(() => {
      if (currentLessonId) {
        navigate(`/language-learner/learning?lesson_id=${currentLessonId}`);
      } else {
        navigate('/language-learner/learning');
      }
    }, 1000);
  };

  const canSubmit = () => {
    if (currentEx.type === 'translation' || currentEx.type === 'listening') {
      return userAnswer.trim().length > 0;
    }
    return selectedAnswer.length > 0;
  };

  const renderExercise = () => {
    switch (currentEx.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground text-center mb-8">
              {currentEx.instruction}
            </p>
            
            {/* Image-based options (Duolingo style) */}
            {currentEx.optionImages && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentEx.options?.map((option: any, index: number) => (
                  <div
                    key={option}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      showFeedback ? 'pointer-events-none' : ''
                    }`}
                    onClick={() => {
                      handleAnswerSelect(option);
                      handlePlayAudio(option);
                    }}
                  >
                    <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                      showFeedback
                        ? option === currentEx.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20 transform scale-105'
                          : option === selectedAnswer && !isCorrect
                          ? 'border-red-500 bg-red-50/60 dark:bg-red-900/20'
                          : 'border-gray-200 opacity-70'
                        : selectedAnswer === option
                        ? 'border-[#47bdff] bg-[#47bdff]/8 transform scale-102'
                        : 'border-gray-200 hover:border-[#47bdff]/60 hover:scale-102'
                    }`}>
                      {/* Image */}
                      <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-white">
                        <img 
                          src={currentEx.optionImages?.[option]} 
                          alt={option}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      
                      {/* Spanish text */}
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground mb-2 tracking-wide">
                          {option}
                        </p>
                      </div>
                      
                      {/* Number badge */}
                      <div className="absolute -top-2 -right-2">
                        <div className="w-9 h-9 rounded-full bg-[#47bdff] flex items-center justify-center border-2 border-white">
                          <span className="text-sm font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback to simple buttons if no images */}
            {!currentEx.optionImages && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentEx.options?.map((option: any) => (
                  <Button
                    key={option}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    size="lg"
                    className={`h-16 text-lg transition-all duration-200 ${
                      showFeedback
                        ? option === currentEx.correctAnswer
                          ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-500'
                          : option === selectedAnswer && !isCorrect
                          ? 'bg-destructive hover:bg-destructive text-white border-destructive'
                          : 'opacity-60'
                        : selectedAnswer === option
                        ? 'bg-[#47bdff] hover:bg-[#47bdff]/90 text-white border-[#47bdff]'
                        : 'hover:border-[#47bdff] hover:text-[#47bdff]'
                    }`}
                    onClick={() => {
                      handleAnswerSelect(option);
                      handlePlayAudio(option);
                    }}
                    disabled={showFeedback}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'translation':
      case 'listening':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground text-center mb-6">
              {currentEx.instruction}
            </p>
            {/* Audio button for question */}
            {currentEx.audioUrl && (
              <div className="flex justify-center mb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePlayAudio(currentEx.correctAnswer)}
                  disabled={isListening}
                  className={`h-18 w-18 rounded-full border-2 border-[#47bdff] transition-all duration-300 bg-[#47bdff]/5 hover:bg-[#47bdff] hover:text-white hover:scale-110 ${
                    isListening ? 'animate-pulse scale-110 bg-[#47bdff] text-white' : ''
                  }`}
                >
                  <Volume2 className={`h-6 w-6 ${isListening ? 'animate-bounce' : ''}`} />
                </Button>
              </div>
            )}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={showFeedback}
                  className={`w-full p-5 text-xl font-medium border-2 rounded-2xl transition-all duration-300 bg-background text-foreground ${
                    showFeedback
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/15'
                        : 'border-red-500 bg-red-50/40 dark:bg-red-900/15'
                      : 'border-gray-200 focus:border-[#47bdff] focus:outline-none focus:ring-3 focus:ring-[#47bdff]/15 hover:border-[#47bdff]/60'
                  }`}
                />
                {showFeedback && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isCorrect ? (
                      <Check className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <X className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground text-center mb-6">
              {currentEx.instruction}
            </p>
            <div className="text-center mb-8">
              <p className="text-3xl font-bold text-foreground tracking-wide">
                {currentEx.question.replace('____', `_____`)}
              </p>
            </div>
            
            {/* Image-based options (Duolingo style) */}
            {currentEx.optionImages && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentEx.options?.map((option: any, index: number) => (
                  <div
                    key={option}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      showFeedback ? 'pointer-events-none' : ''
                    }`}
                    onClick={() => {
                      handleAnswerSelect(option);
                      handlePlayAudio(option);
                    }}
                  >
                    <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                      showFeedback
                        ? option === currentEx.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20 transform scale-105'
                          : option === selectedAnswer && !isCorrect
                          ? 'border-red-500 bg-red-50/60 dark:bg-red-900/20'
                          : 'border-gray-200 opacity-70'
                        : selectedAnswer === option
                        ? 'border-[#47bdff] bg-[#47bdff]/8 transform scale-102'
                        : 'border-gray-200 hover:border-[#47bdff]/60 hover:scale-102'
                    }`}>
                      {/* Image */}
                      <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-white">
                        <img 
                          src={currentEx.optionImages?.[option]} 
                          alt={option}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Spanish text */}
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">
                          {option}
                        </p>
                      </div>
                      
                      {/* Number badge */}
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback to simple buttons if no images */}
            {!currentEx.optionImages && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentEx.options?.map((option: any) => (
                  <Button
                    key={option}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    size="lg"
                    className={`h-14 text-lg transition-all duration-200 ${
                      showFeedback
                        ? option === currentEx.correctAnswer
                          ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-500'
                          : option === selectedAnswer && !isCorrect
                          ? 'bg-destructive hover:bg-destructive text-white border-destructive'
                          : 'opacity-60'
                        : selectedAnswer === option
                        ? 'bg-[#47bdff] hover:bg-[#47bdff]/90 text-white border-[#47bdff]'
                        : 'hover:border-[#47bdff] hover:text-[#47bdff]'
                    }`}
                    onClick={() => {
                      handleAnswerSelect(option);
                      handlePlayAudio(option);
                    }}
                    disabled={showFeedback}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <div>Exercise type not implemented</div>;
    }
  };

  // Handle loading states - only show loading when API calls are actually in progress
  const isLoading = (unitId && isLoadingExercises) ||
                   (exerciseId && isLoadingSpecificExercise) ||
                   (isLoadingLesson && currentLessonId);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundEffects variant="default" />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white/60">
            {exerciseId ? 'Loading exercise...' : unitId ? 'Loading exercises...' : 'Loading lesson...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle error states
  const hasError = (exercisesError && unitId) ||
                   (specificExerciseError && exerciseId) ||
                   (lessonError && currentLessonId);

  if (hasError) {
    const error = exercisesError || specificExerciseError || lessonError;
    const errorType = exerciseId ? 'Exercise' : unitId ? 'Exercises' : 'Lesson';

    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundEffects variant="default" />
        <GlassCard className="max-w-md mx-auto text-center" hover={false}>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {errorType} Not Found
          </h2>
          <p className="text-white/60 mb-6">
            {(typeof error === 'string' ? error : error?.message) || `The ${errorType.toLowerCase()} you are looking for could not be loaded.`}
          </p>
          <div className="space-x-4">
            <Button onClick={() => refetch()} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Try Again
            </Button>
            <Button onClick={() => {
              if (currentLessonId) {
                navigate(`/language-learner/learning?lesson_id=${currentLessonId}`);
              } else {
                navigate('/language-learner/learning');
              }
            }} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              Back to Lessons
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }
  
  // Handle case where no lesson data is available - this could mean no exercises found
  if (!lessonData) {
    // If we have unitId but no exercises, show a specific message
    if (unitId && !isLoadingExercises) {
      return (
        <div className="min-h-screen relative flex items-center justify-center">
          <BackgroundEffects variant="default" />
          <GlassCard className="max-w-md mx-auto text-center" hover={false}>
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Exercises Found</h2>
            <p className="text-white/60 mb-6">This unit doesn't have any exercises available yet.</p>
            <div className="space-x-4">
              <Button onClick={() => {
                if (currentLessonId) {
                  navigate(`/language-learner/learning?lesson_id=${currentLessonId}`);
                } else {
                  navigate('/language-learner/learning');
                }
              }} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                Back to Units
              </Button>
            </div>
          </GlassCard>
        </div>
      );
    }

    // General case for no lesson data
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundEffects variant="default" />
        <GlassCard className="max-w-md mx-auto text-center" hover={false}>
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Lesson Selected</h2>
          <p className="text-white/60 mb-6">Please select a lesson to begin learning.</p>
          <Button onClick={() => {
            if (currentLessonId) {
              navigate(`/language-learner/learning?lesson_id=${currentLessonId}`);
            } else {
              navigate('/language-learner/learning');
            }
          }} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            Choose a Lesson
          </Button>
        </GlassCard>
      </div>
    );
  }

  const currentEx = lessonData.exercises[currentExercise];

  // For specific exercises, progress is either 0% or 100%
  const progress = specificExercise
    ? (showFeedback ? 100 : 0)
    : (currentExercise / lessonData.exercises.length) * 100;

  const isLastExercise = specificExercise
    ? !specificExercise.navigation?.next_exercise_id
    : currentExercise === lessonData.exercises.length - 1;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      <BackgroundEffects variant="default" />

      {/* Congratulations Overlay */}
      <CongratulationsOverlay
        isVisible={showCongratulations}
        xpEarned={earnedXP + (lessonData?.xpReward || 0)}
        unitTitle={currentUnit?.title || 'Lesson'}
        onContinue={handleCongratulationsContinue}
      />

      {/* Lesson Progress Bar */}
      <div className="w-full bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExit}
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-3 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {/* Previous exercise button for specific exercises */}
              {specificExercise?.navigation?.previous_exercise_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/language-learner/lesson?exercise_id=${specificExercise.navigation!.previous_exercise_id}`)}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-3 transition-all duration-200"
                  title="Previous Exercise"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 max-w-lg mx-6">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Show specific exercise info if from API */}
        {specificExercise && (
          <GlassCard className="mb-6" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{specificExercise.title}</h2>
                <p className="text-white/60">Exercise {specificExercise.order_index} • {specificExercise.type.replace('_', ' ')}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-white/10 text-white border-white/20 capitalize">
                    Difficulty {(specificExercise as any).difficulty_level}
                  </Badge>
                  <Badge className={specificExercise.user_progress.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white border-white/20'}>
                    {specificExercise.user_progress.status.replace('_', ' ')}
                  </Badge>
                  {specificExercise.user_progress.attempts_count > 0 && (
                    <span className="text-sm text-white/50">
                      {specificExercise.user_progress.attempts_count} attempts
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-teal-400">
                  {specificExercise.points} XP
                </div>
                <div className="text-sm text-white/50">
                  {specificExercise.user_progress.points_earned}/{specificExercise.points} earned
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Show unit/lesson info if from API */}
        {unitExercises && !specificExercise && (
          <GlassCard className="mb-6" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{unitExercises.unit_info.title}</h2>
                <p className="text-white/60">Unit Exercises • {(unitExercises as any).data.length} exercises total</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-white/10 text-white border-white/20">
                    {unitExercises.user_unit_progress.completed_exercises} completed
                  </Badge>
                  <span className="text-sm text-white/50">
                    {unitExercises.user_unit_progress.total_points}/{unitExercises.user_unit_progress.max_possible_points} points
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-teal-400">
                  {unitExercises.user_unit_progress.max_possible_points || 50} XP
                </div>
                <div className="text-sm text-white/50">Potential Reward</div>
              </div>
            </div>
          </GlassCard>
        )}

        
        <LessonPlayer
          exercises={lessonData.exercises}
          currentExercise={currentExercise}
          onAnswerSubmit={handleAnswerSubmit}
          onContinue={handleContinue}
          onPlayAudio={handlePlayAudio}
          isPlaying={isListening}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
        />
      </div>
    </div>
  );
};

export default LessonPage;