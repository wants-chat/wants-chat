import React, { useState } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'translation' | 'listening' | 'speaking' | 'matching' | 'fill-blank';
  question: string;
  instruction: string;
  options?: string[];
  correctAnswer: string;
  audioUrl?: string;
  optionImages?: { [key: string]: string };
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LessonPlayerProps {
  exercises: Exercise[];
  currentExercise: number;
  onAnswerSubmit: (answer: string, isCorrect: boolean) => void;
  onContinue: () => void;
  onPlayAudio?: (text: string) => void;
  isPlaying?: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  className?: string;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({
  exercises,
  currentExercise,
  onAnswerSubmit,
  onContinue,
  onPlayAudio,
  isPlaying = false,
  showFeedback,
  isCorrect,
  className = ''
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');

  const currentEx = exercises[currentExercise];
  const progress = ((currentExercise + (showFeedback ? 1 : 0)) / exercises.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const answer = currentEx.type === 'translation' || currentEx.type === 'listening'
      ? userAnswer.trim()
      : selectedAnswer;

    // For multiple choice exercises, use exact match without spelling checks
    // For text input exercises (translation, listening), allow case-insensitive comparison
    const correct = currentEx.type === 'multiple-choice' || currentEx.type === 'fill-blank'
      ? answer === currentEx.correctAnswer
      : answer.toLowerCase() === currentEx.correctAnswer.toLowerCase();

    onAnswerSubmit(answer, correct);
  };

  const handleContinue = () => {
    setSelectedAnswer('');
    setUserAnswer('');
    onContinue();
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
      case 'fill-blank':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground text-center mb-8">
              {currentEx.instruction}
            </p>
            
            {/* Image-based options */}
            {currentEx.optionImages && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentEx.options?.map((option, index) => (
                  <div
                    key={option}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      showFeedback ? 'pointer-events-none' : ''
                    }`}
                    onClick={() => {
                      handleAnswerSelect(option);
                      onPlayAudio?.(option);
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
                          src={currentEx.optionImages?.[option] || ''}
                          alt={option}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      
                      {/* Text */}
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
            
            {/* Text-only options */}
            {!currentEx.optionImages && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentEx.options?.map((option) => (
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
                      onPlayAudio?.(option);
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
            
            {/* Audio button */}
            {currentEx.audioUrl && onPlayAudio && (
              <div className="flex justify-center mb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onPlayAudio(currentEx.correctAnswer)}
                  disabled={isPlaying}
                  className={`h-18 w-18 rounded-full border-2 border-[#47bdff] transition-all duration-300 bg-[#47bdff]/5 hover:bg-[#47bdff] hover:text-white hover:scale-110 ${
                    isPlaying ? 'animate-pulse scale-110 bg-[#47bdff] text-white' : ''
                  }`}
                >
                  <Volume2 className={`h-6 w-6 ${isPlaying ? 'animate-bounce' : ''}`} />
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

      default:
        return <div>Exercise type not implemented</div>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Question {currentExercise + 1} of {exercises.length}
            </div>
            <Progress value={progress} className="w-32 h-2" />
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-0 bg-card/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              {currentEx.question}
            </h1>
            
            {currentEx.audioUrl && currentEx.type !== 'listening' && onPlayAudio && (
              <Button
                variant="ghost"
                size="default"
                onClick={() => onPlayAudio(currentEx.correctAnswer)}
                className="text-[#47bdff] hover:text-white bg-[#47bdff]/5 hover:bg-[#47bdff] rounded-xl px-8 py-4 text-sm font-semibold transition-all duration-300 border-2 border-[#47bdff]/20 hover:border-[#47bdff] hover:scale-105"
              >
                <Volume2 className="h-5 w-5 mr-3" />
                Listen to pronunciation
              </Button>
            )}
          </div>

          {renderExercise()}
        </CardContent>
      </Card>

      {/* Feedback */}
      {showFeedback && (
        <Card className={`border-0 ${
          isCorrect 
            ? 'bg-emerald-50/60 dark:bg-emerald-900/15' 
            : 'bg-red-50/60 dark:bg-red-900/15'
        } backdrop-blur-sm`}>
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className={`p-3 rounded-2xl ${
                isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/25' : 'bg-red-100 dark:bg-red-900/25'
              }`}>
                {isCorrect ? (
                  <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="h-7 w-7 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-3 ${
                  isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {isCorrect ? '¡Correcto! 🎉' : 'Not quite right'}
                </h3>
                {!isCorrect && (
                  <div className="mb-4 p-4 bg-card/60 rounded-xl border border-border/50">
                    <p className="text-muted-foreground text-sm font-medium mb-1">
                      Correct answer:
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      {currentEx.correctAnswer}
                    </p>
                  </div>
                )}
                <p className="text-muted-foreground text-base leading-relaxed">
                  {currentEx.explanation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!showFeedback ? (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="min-w-40 h-14 text-lg font-semibold bg-gradient-to-r from-[#47bdff] to-[#47bdff]/90 hover:from-[#47bdff]/90 hover:to-[#47bdff]/80 text-white border-0 transform hover:scale-[1.02] transition-all duration-300 rounded-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleContinue}
            className={`min-w-40 h-14 text-lg font-semibold border-0 transform hover:scale-[1.02] transition-all duration-300 rounded-xl ${
              isCorrect 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white' 
                : 'bg-gradient-to-r from-[#47bdff] to-[#47bdff]/90 hover:from-[#47bdff]/90 hover:to-[#47bdff]/80 text-white'
            }`}
          >
            {currentExercise === exercises.length - 1 ? '🎯 Complete Lesson' : 'Continue →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;