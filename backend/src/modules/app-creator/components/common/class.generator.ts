/**
 * Class Generator
 *
 * Generates class-related components:
 * - ClassHeader: Display class info with enrollment actions
 * - ClassStudents: List of students enrolled in a class
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface ClassHeaderOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showEnrollButton?: boolean;
  showProgress?: boolean;
  showInstructor?: boolean;
  showSchedule?: boolean;
}

export interface ClassStudentsOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showActions?: boolean;
  showProgress?: boolean;
  showAttendance?: boolean;
  showGrade?: boolean;
}

/**
 * Generate a ClassHeader component
 */
export function generateClassHeader(options: ClassHeaderOptions = {}): string {
  const {
    componentName = 'ClassHeader',
    entity = 'class',
    showEnrollButton = true,
    showProgress = true,
    showInstructor = true,
    showSchedule = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Calendar,
  BookOpen,
  Award,
  Star,
  Play,
  CheckCircle,
  Loader2,
  Share2,
  MoreVertical,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ClassData {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  instructorId?: string;
  instructorName?: string;
  instructorAvatar?: string;
  instructorTitle?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  totalLessons?: number;
  completedLessons?: number;
  enrolledCount?: number;
  maxEnrollment?: number;
  rating?: number;
  reviewCount?: number;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  isEnrolled?: boolean;
  enrolledAt?: string;
  progress?: number;
  price?: number;
  isFree?: boolean;
}

interface ${componentName}Props {
  classData?: ClassData;
  classId?: string;
  className?: string;
  onEnroll?: () => void;
  onContinue?: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  classData: propClassData,
  classId: propClassId,
  className,
  onEnroll,
  onContinue,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const classId = propClassId || paramId;

  const { data: fetchedClassData, isLoading } = useQuery({
    queryKey: ['${queryKey}', classId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${classId}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch class:', err);
        return null;
      }
    },
    enabled: !propClassData && !!classId,
  });

  const classData = propClassData || fetchedClassData;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await api.post(\`${endpoint}/\${classId}/enroll\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', classId] });
      onEnroll?.();
    },
  });

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return \`\${mins} min\`;
    if (mins === 0) return \`\${hours}h\`;
    return \`\${hours}h \${mins}min\`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6" />
        <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className={cn('text-center py-12', className)}>
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Class not found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cover Image */}
      {classData.coverImage ? (
        <div className="relative h-64 rounded-xl overflow-hidden">
          <img
            src={classData.coverImage}
            alt={classData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {classData.category && (
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full mb-2">
                {classData.category}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl" />
      )}

      {/* Header Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {/* Title & Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {classData.title}
            </h1>
            {classData.level && (
              <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', LEVEL_COLORS[classData.level])}>
                {classData.level}
              </span>
            )}
          </div>

          {/* Rating */}
          {classData.rating !== undefined && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900 dark:text-white">{classData.rating.toFixed(1)}</span>
              </div>
              {classData.reviewCount !== undefined && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({classData.reviewCount.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {classData.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {classData.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {classData.duration !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(classData.duration)}
              </span>
            )}
            {classData.totalLessons !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {classData.totalLessons} lessons
              </span>
            )}
            {classData.enrolledCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {classData.enrolledCount.toLocaleString()} enrolled
              </span>
            )}
            ${showSchedule ? `{classData.schedule && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {classData.schedule}
              </span>
            )}` : ''}
          </div>

          ${showInstructor ? `{/* Instructor */}
          {classData.instructorName && (
            <div className="flex items-center gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {classData.instructorAvatar ? (
                <img
                  src={classData.instructorAvatar}
                  alt={classData.instructorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {classData.instructorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{classData.instructorName}</p>
                {classData.instructorTitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{classData.instructorTitle}</p>
                )}
              </div>
            </div>
          )}` : ''}
        </div>

        {/* Enrollment Card */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            ${showProgress ? `{/* Progress (if enrolled) */}
            {classData.isEnrolled && classData.progress !== undefined && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
                  <span className="text-sm font-medium text-blue-600">{classData.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: \`\${classData.progress}%\` }}
                  />
                </div>
                {classData.completedLessons !== undefined && classData.totalLessons !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {classData.completedLessons} of {classData.totalLessons} lessons completed
                  </p>
                )}
              </div>
            )}` : ''}

            {/* Price */}
            <div className="mb-4">
              {classData.isFree ? (
                <span className="text-2xl font-bold text-green-600">Free</span>
              ) : classData.price !== undefined ? (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  \${classData.price}
                </span>
              ) : null}
            </div>

            ${showEnrollButton ? `{/* Action Button */}
            {classData.isEnrolled ? (
              <button
                onClick={onContinue || (() => navigate(\`/${tableName}/\${classId}/learn\`))}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                {classData.progress && classData.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
            ) : (
              <button
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {enrollMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Enroll Now
              </button>
            )}` : ''}

            {/* Secondary Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Enrollment Info */}
            {classData.maxEnrollment && classData.enrolledCount !== undefined && (
              <p className="text-sm text-gray-500 text-center mt-4">
                {classData.maxEnrollment - classData.enrolledCount} spots left
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a ClassStudents component
 */
export function generateClassStudents(options: ClassStudentsOptions = {}): string {
  const {
    componentName = 'ClassStudents',
    entity = 'student',
    showActions = true,
    showProgress = true,
    showAttendance = true,
    showGrade = false,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/classes`;
  const queryKey = options.queryKey || 'class-students';

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Mail,
  MoreVertical,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Student {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped' | 'pending';
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  attendanceRate?: number;
  lastActiveAt?: string;
  grade?: string;
  score?: number;
}

interface ${componentName}Props {
  students?: Student[];
  classId?: string;
  className?: string;
  onStudentClick?: (student: Student) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dropped: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  students: propStudents,
  classId: propClassId,
  className,
  onStudentClick,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const classId = propClassId || paramId;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: fetchedStudents, isLoading } = useQuery({
    queryKey: ['${queryKey}', classId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${classId}/students\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        return [];
      }
    },
    enabled: !propStudents && !!classId,
  });

  const students = propStudents || fetchedStudents || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      await api.put(\`${endpoint}/\${classId}/students/\${studentId}\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', classId] });
    },
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student: Student) => {
      const matchesSearch = !searchQuery ||
        student.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s: Student) => s.status === 'active').length;
    const completed = students.filter((s: Student) => s.status === 'completed').length;
    const avgProgress = students.length > 0
      ? Math.round(students.reduce((sum: number, s: Student) => sum + (s.progress || 0), 0) / students.length)
      : 0;
    return { total, active, completed, avgProgress };
  }, [students]);

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Status', 'Progress', 'Enrolled At'],
      ...filteredStudents.map((s: Student) => [
        s.userName,
        s.userEmail,
        s.status,
        \`\${s.progress || 0}%\`,
        new Date(s.enrolledAt).toLocaleDateString(),
      ]),
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Students</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
            <option value="pending">Pending</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No students found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.map((student: Student) => (
              <div
                key={student.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    onClick={() => onStudentClick?.(student)}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    {student.userAvatar ? (
                      <img
                        src={student.userAvatar}
                        alt={student.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => onStudentClick?.(student)}
                        className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                      >
                        {student.userName}
                      </h4>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', STATUS_STYLES[student.status])}>
                        {student.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.userEmail}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Enrolled {formatDate(student.enrolledAt)}
                      </span>
                      {student.lastActiveAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Active {formatDate(student.lastActiveAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  ${showProgress ? `{/* Progress */}
                  <div className="flex-shrink-0 w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{student.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: \`\${student.progress || 0}%\` }}
                      />
                    </div>
                  </div>` : ''}

                  ${showAttendance ? `{/* Attendance */}
                  {student.attendanceRate !== undefined && (
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.attendanceRate}%</div>
                      <div className="text-xs text-gray-500">Attendance</div>
                    </div>
                  )}` : ''}

                  ${showGrade ? `{/* Grade */}
                  {student.grade && (
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.grade}</div>
                      <div className="text-xs text-gray-500">Grade</div>
                    </div>
                  )}` : ''}

                  ${showActions ? `{/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.location.href = \`mailto:\${student.userEmail}\`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Send email"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {openMenu === student.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                            <button
                              onClick={() => { updateStatusMutation.mutate({ studentId: student.id, status: 'completed' }); setOpenMenu(null); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Mark Complete
                            </button>
                            <button
                              onClick={() => { updateStatusMutation.mutate({ studentId: student.id, status: 'dropped' }); setOpenMenu(null); }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Mark Dropped
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate class components for a specific domain
 */
export function generateClassComponents(domain: string): { header: string; students: string } {
  const pascalDomain = pascalCase(domain);

  return {
    header: generateClassHeader({
      componentName: `${pascalDomain}ClassHeader`,
      entity: `${domain}Class`,
    }),
    students: generateClassStudents({
      componentName: `${pascalDomain}ClassStudents`,
      entity: `${domain}Student`,
    }),
  };
}
