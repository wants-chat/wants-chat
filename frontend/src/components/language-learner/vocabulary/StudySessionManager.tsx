import React, { useState, useEffect } from 'react';
import { Brain, Check, X, ArrowLeft, Trophy } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { VocabularyWord } from './VocabularyFlashcard';

export interface StudySession {
  id: string;
  type: 'flashcards' | 'matching' | 'spelling' | 'listening';
  words: VocabularyWord[];
  startTime: Date;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  word: VocabularyWord;
  audioText?: string;
}

interface StudySessionManagerProps {
  mode: 'matching' | 'spelling' | 'listening';
  words: VocabularyWord[];
  onExit: () => void;
  onPlayAudio?: (text: string) => void;
  isPlaying?: boolean;
}

const StudySessionManager: React.FC<StudySessionManagerProps> = ({
  mode,
  words,
  onExit,
  onPlayAudio,
  isPlaying = false
}) => {
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    const questions = generatePracticeQuestions(words, mode);
    setPracticeQuestions(questions);
  }, [words, mode]);

  const generatePracticeQuestions = (words: VocabularyWord[], mode: string): PracticeQuestion[] => {
    return words.map(word => {
      switch (mode) {
        case 'matching':
          const otherWords = words.filter(w => w.id !== word.id).slice(0, 3);
          const allOptions = [word.translation, ...otherWords.map(w => w.translation)]
            .sort(() => Math.random() - 0.5);
          return {
            id: word.id,
            question: word.word,
            options: allOptions,
            correctAnswer: word.translation,
            word: word
          };
        
        case 'spelling':
          return {
            id: word.id,
            question: `How do you spell "${word.translation}" in the target language?`,
            correctAnswer: word.word,
            word: word
          };
        
        case 'listening':
          return {
            id: word.id,
            question: 'Listen and select the correct translation',
            options: [word.translation, ...words.filter(w => w.id !== word.id).slice(0, 3).map(w => w.translation)]
              .sort(() => Math.random() - 0.5),
            correctAnswer: word.translation,
            audioText: word.word,
            word: word
          };
        
        default:
          return {
            id: word.id,
            question: word.word,
            correctAnswer: word.translation,
            word: word
          };
      }
    });
  };

  const handleAnswerSubmit = () => {
    if (showFeedback) return;
    
    const answer = mode === 'spelling' ? userAnswer.trim() : selectedAnswer;
    const correct = answer.toLowerCase() === practiceQuestions[currentQuestion].correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setPracticeScore(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    setUserAnswer('');
    
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  if (sessionComplete) {
    const percentage = Math.round((practiceScore.correct / practiceScore.total) * 100);
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <Trophy className={`h-20 w-20 mx-auto mb-6 ${
            percentage >= 80 ? 'text-yellow-500' : percentage >= 60 ? 'text-gray-400' : 'text-orange-500'
          }`} />
          
          <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
          
          <div className="text-5xl font-bold mb-6">
            {percentage}%
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            You got {practiceScore.correct} out of {practiceScore.total} questions correct
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={onExit}
            >
              Back to Vocabulary
            </Button>
            <Button
              onClick={() => {
                setCurrentQuestion(0);
                setPracticeScore({ correct: 0, total: 0 });
                setSessionComplete(false);
                setShowFeedback(false);
                setPracticeQuestions(generatePracticeQuestions(words, mode));
              }}
            >
              Practice Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (practiceQuestions.length === 0) {
    return null;
  }

  const currentQ = practiceQuestions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Practice Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vocabulary
              </Button>
              <Badge variant="outline" className="capitalize">
                {mode} Practice
              </Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Score: {practiceScore.correct}/{practiceScore.total} 
              ({practiceScore.total > 0 ? Math.round((practiceScore.correct / practiceScore.total) * 100) : 0}%)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {practiceQuestions.length}
            </div>
            <Progress 
              value={((currentQuestion + 1) / practiceQuestions.length) * 100} 
              className="w-32 h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Practice Question */}
      <Card className="border-0 bg-card/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentQ.question}
            </h2>
            
            {mode === 'listening' && onPlayAudio && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => onPlayAudio(currentQ.audioText || '')}
                disabled={isPlaying}
                className="h-16 w-16 rounded-full border-2 border-[#47bdff]/20 hover:border-[#47bdff] hover:bg-[#47bdff] hover:text-white transition-all duration-300"
              >
                <Brain className={`h-6 w-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
            )}
          </div>

          {/* Answer Options */}
          {mode === 'matching' || mode === 'listening' ? (
            <div className="grid grid-cols-2 gap-4">
              {currentQ.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  size="lg"
                  className={`h-16 text-lg ${
                    showFeedback
                      ? option === currentQ.correctAnswer
                        ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                        : option === selectedAnswer && !isCorrect
                        ? 'bg-red-500 hover:bg-red-500 text-white'
                        : ''
                      : selectedAnswer === option
                      ? 'bg-[#47bdff] hover:bg-[#47bdff]/90 text-white'
                      : ''
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={showFeedback}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : mode === 'spelling' ? (
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={showFeedback}
                className={`w-full p-4 text-xl border-2 rounded-lg ${
                  showFeedback
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                } bg-background text-foreground`}
              />
            </div>
          ) : null}

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg ${
              isCorrect 
                ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {isCorrect ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-600">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-600">Incorrect</span>
                  </>
                )}
              </div>
              {!isCorrect && (
                <p className="text-center text-gray-700 dark:text-gray-300">
                  The correct answer is: <strong>{currentQ.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center">
        {!showFeedback ? (
          <Button
            size="lg"
            onClick={handleAnswerSubmit}
            disabled={mode === 'spelling' ? !userAnswer.trim() : !selectedAnswer}
            className="px-8"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleContinue}
            className="px-8"
          >
            {currentQuestion < practiceQuestions.length - 1 ? 'Next Question' : 'See Results'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudySessionManager;