/**
 * Lesson Player Component Generator
 *
 * Generates video/content player, lesson sidebar, and quiz components.
 */

export interface LessonPlayerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLessonPlayer(options: LessonPlayerOptions = {}): string {
  const { componentName = 'LessonPlayer', endpoint = '/lessons' } = options;

  return `import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + lessonId);
      return response?.data || response;
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(\`/lessons/\${lessonId}/complete\`, {}),
    onSuccess: () => {
      toast.success('Lesson completed!');
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center py-12 text-gray-500">Lesson not found</div>;
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      if (progress >= 90 && !lesson.is_completed) {
        completeMutation.mutate();
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden">
      {lesson.video_url ? (
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={lesson.video_url}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="w-full bg-gray-600 rounded-full h-1 mb-4 cursor-pointer">
              <div
                className="bg-blue-600 h-1 rounded-full"
                style={{ width: \`\${progress}%\` }}
              />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-full">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleFullscreen} className="p-2 hover:bg-white/20 rounded-full">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gray-900 text-gray-500">
          No video available
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{lesson.title}</h1>
          {lesson.is_completed && (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-5 h-5" />
              Completed
            </span>
          )}
        </div>
        {lesson.description && (
          <p className="text-gray-600 dark:text-gray-400">{lesson.description}</p>
        )}
        {lesson.content && (
          <div className="mt-6 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateLessonSidebar(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'LessonSidebar', endpoint = '/lessons' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Loader2, PlayCircle, FileText, CheckCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const location = useLocation();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?course_id=' + courseId);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Course Content</h3>
      </div>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {lessons?.map((lesson: any, index: number) => {
          const isActive = lesson.id === lessonId;
          const isLocked = lesson.is_locked;

          return (
            <Link
              key={lesson.id}
              to={isLocked ? '#' : \`/courses/\${courseId}/lessons/\${lesson.id}\`}
              className={\`flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 \${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600'
                  : isLocked
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } transition-colors\`}
            >
              <span className="text-sm text-gray-400 w-6">{index + 1}</span>
              {lesson.is_completed ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : isLocked ? (
                <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : lesson.type === 'video' ? (
                <PlayCircle className={\`w-5 h-5 flex-shrink-0 \${isActive ? 'text-blue-600' : 'text-gray-400'}\`} />
              ) : (
                <FileText className={\`w-5 h-5 flex-shrink-0 \${isActive ? 'text-blue-600' : 'text-gray-400'}\`} />
              )}
              <div className="flex-1 min-w-0">
                <p className={\`text-sm truncate \${isActive ? 'text-blue-600 font-medium' : 'text-gray-900 dark:text-white'}\`}>
                  {lesson.title}
                </p>
                {lesson.duration && (
                  <span className="text-xs text-gray-500">{lesson.duration}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateQuizPlayer(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'QuizPlayer', endpoint = '/quizzes' } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + quizId);
      return response?.data || response;
    },
  });

  const submitMutation = useMutation({
    mutationFn: (answers: Record<string, string>) =>
      api.post(\`${endpoint}/\${quizId}/submit\`, { answers }),
    onSuccess: (data: any) => {
      setResults(data?.data || data);
      setShowResults(true);
    },
    onError: () => toast.error('Failed to submit quiz'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return <div className="text-center py-12 text-gray-500">Quiz not found</div>;
  }

  const questions = quiz.questions || [];
  const question = questions[currentQuestion];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [question.id]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitMutation.mutate(answers);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    const passed = results.score >= (quiz.passing_score || 70);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className={\`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 \${
          passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }\`}>
          {passed ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {passed ? 'Congratulations!' : 'Keep Practicing'}
        </h2>
        <p className="text-gray-500 mb-6">
          You scored {results.score}% ({results.correct}/{results.total} correct)
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleRetry}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retry Quiz
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{quiz.title}</h2>
        <span className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: \`\${((currentQuestion + 1) / questions.length) * 100}%\` }}
        />
      </div>
      {question && (
        <>
          <h3 className="text-xl text-gray-900 dark:text-white mb-6">{question.text}</h3>
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={\`w-full p-4 text-left rounded-lg border transition-colors \${
                  answers[question.id] === option
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }\`}
              >
                <span className={\`font-medium \${answers[question.id] === option ? 'text-blue-600' : 'text-gray-900 dark:text-white'}\`}>
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={handleNext}
              disabled={!answers[question.id] || submitMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentQuestion === questions.length - 1 ? (
                'Submit Quiz'
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
