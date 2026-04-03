/**
 * Course Header Component Generator
 *
 * Generates course detail header, curriculum list, and progress tracking.
 */

export interface CourseHeaderOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCourseHeader(options: CourseHeaderOptions = {}): string {
  const { componentName = 'CourseHeader', endpoint = '/courses' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Clock, BookOpen, Users, Star, Play, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments', { course_id: id }),
    onSuccess: () => {
      toast.success('Successfully enrolled!');
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
    onError: () => toast.error('Failed to enroll'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12 text-gray-500">Course not found</div>;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
      <div className="max-w-3xl">
        {course.category && (
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
            {course.category}
          </span>
        )}
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        {course.description && (
          <p className="text-lg opacity-90 mb-6">{course.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {course.instructor_name && (
            <span>by <strong>{course.instructor_name}</strong></span>
          )}
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{course.rating}</span>
              {course.reviews_count && <span>({course.reviews_count} reviews)</span>}
            </div>
          )}
          {course.students_count && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.students_count} students
            </span>
          )}
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
          )}
          {course.lessons_count && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.lessons_count} lessons
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-8">
          {course.is_enrolled ? (
            <a
              href={\`/courses/\${course.id}/learn\`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Play className="w-5 h-5" />
              Continue Learning
            </a>
          ) : (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {enrollMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {course.price === 0 ? 'Enroll for Free' : \`Enroll - $\${course.price}\`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCurriculumList(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'CurriculumList', endpoint = '/lessons' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ChevronDown, ChevronRight, PlayCircle, FileText, Lock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const { data: curriculum, isLoading } = useQuery({
    queryKey: ['curriculum', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?course_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  // Group lessons by module if available
  const modules = curriculum?.reduce((acc: any[], lesson: any) => {
    const moduleName = lesson.module_name || 'Course Content';
    let module = acc.find((m) => m.name === moduleName);
    if (!module) {
      module = { id: moduleName, name: moduleName, lessons: [] };
      acc.push(module);
    }
    module.lessons.push(lesson);
    return acc;
  }, []) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Course Curriculum</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {modules.map((module: any) => (
          <div key={module.id}>
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedModules.includes(module.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">{module.name}</span>
              </div>
              <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
            </button>
            {expandedModules.includes(module.id) && (
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 pb-4">
                {module.lessons.map((lesson: any) => (
                  <Link
                    key={lesson.id}
                    to={lesson.is_locked ? '#' : \`/courses/\${id}/lessons/\${lesson.id}\`}
                    className={\`flex items-center gap-3 p-3 rounded-lg mt-2 \${
                      lesson.is_locked
                        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } transition-colors\`}
                  >
                    {lesson.is_completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : lesson.is_locked ? (
                      <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : lesson.type === 'video' ? (
                      <PlayCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={\`text-sm \${lesson.is_locked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}\`}>
                        {lesson.title}
                      </p>
                    </div>
                    {lesson.duration && (
                      <span className="text-sm text-gray-500">{lesson.duration}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProgressTracker(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'ProgressTracker', endpoint = '/enrollments' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Trophy, Target, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?course_id=' + id);
      const data = Array.isArray(response) ? response[0] : (response?.data?.[0] || response);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!enrollment) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Your Progress</h2>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Course Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{enrollment.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: \`\${enrollment.progress || 0}%\` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {enrollment.completed_lessons || 0}
            <span className="text-sm font-normal text-gray-500"> / {enrollment.total_lessons || 0}</span>
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            Time Spent
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{enrollment.time_spent || '0h'}</p>
        </div>
      </div>

      {enrollment.progress === 100 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">Congratulations!</p>
              <p className="text-sm text-green-600 dark:text-green-500">You've completed this course</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
