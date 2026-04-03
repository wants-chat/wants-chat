/**
 * Student Component Generators
 *
 * Generates student-related components for education/school applications.
 * Components: StudentProfile, StudentFilters, StudentAttendance, StudentGrades, StudentProgress
 */

export interface StudentProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProfile(options: StudentProfileOptions = {}): string {
  const { componentName = 'StudentProfile', endpoint = '/students' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Calendar, MapPin, GraduationCap, BookOpen, Award } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-12 text-gray-500">Student not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          {student.avatar_url ? (
            <img src={student.avatar_url} alt={student.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            <p className="text-gray-500">Student ID: {student.student_id || student.id}</p>
            {student.grade_level && (
              <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                <GraduationCap className="w-4 h-4" />
                <span>Grade {student.grade_level}</span>
              </div>
            )}
            {student.class_name && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                {student.class_name}
              </span>
            )}
          </div>
          {student.status && (
            <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
              student.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }\`}>
              {student.status}
            </span>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {student.email && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Mail className="w-5 h-5" />
              <span>{student.email}</span>
            </div>
          )}
          {student.phone && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Phone className="w-5 h-5" />
              <span>{student.phone}</span>
            </div>
          )}
          {student.date_of_birth && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar className="w-5 h-5" />
              <span>DOB: {new Date(student.date_of_birth).toLocaleDateString()}</span>
            </div>
          )}
          {student.address && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 sm:col-span-2">
              <MapPin className="w-5 h-5" />
              <span>{student.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Guardian Information */}
      {student.guardian && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guardian Information</h2>
          <div className="space-y-3">
            <p className="text-gray-900 dark:text-white font-medium">{student.guardian.name}</p>
            <p className="text-gray-500 text-sm">{student.guardian.relationship}</p>
            {student.guardian.phone && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{student.guardian.phone}</span>
              </div>
            )}
            {student.guardian.email && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{student.guardian.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Academic Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.courses_count || 0}</p>
          <p className="text-sm text-gray-500">Enrolled Courses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.gpa || 'N/A'}</p>
          <p className="text-sm text-gray-500">Current GPA</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-3">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.attendance_rate || 0}%</p>
          <p className="text-sm text-gray-500">Attendance Rate</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentFiltersOptions {
  componentName?: string;
}

export function generateStudentFilters(options: StudentFiltersOptions = {}): string {
  const componentName = options.componentName || 'StudentFilters';

  return `import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  gradeLevel: string;
  onGradeLevelChange: (value: string) => void;
  className?: string;
  onClassChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  gradeLevels?: string[];
  classes?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  gradeLevel,
  onGradeLevelChange,
  className,
  onClassChange,
  status,
  onStatusChange,
  gradeLevels = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  classes = [],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Grade Level Filter */}
        <div className="relative">
          <select
            value={gradeLevel}
            onChange={(e) => onGradeLevelChange(e.target.value)}
            className="appearance-none w-full lg:w-40 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {gradeLevels.map((level) => (
              <option key={level} value={level === 'All' ? '' : level}>
                {level === 'All' ? 'All Grades' : \`Grade \${level}\`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Class Filter */}
        {classes.length > 0 && (
          <div className="relative">
            <select
              value={className}
              onChange={(e) => onClassChange(e.target.value)}
              className="appearance-none w-full lg:w-40 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none w-full lg:w-36 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentAttendanceOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentAttendance(options: StudentAttendanceOptions = {}): string {
  const { componentName = 'StudentAttendance', endpoint = '/attendance' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['student-attendance', id, currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await api.get<any>(\`${endpoint}?student_id=\${id}&month=\${month}&year=\${year}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'absent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'excused':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  // Calculate summary stats
  const summary = attendance?.reduce(
    (acc: any, record: any) => {
      const status = record.status?.toLowerCase();
      if (status === 'present') acc.present++;
      else if (status === 'absent') acc.absent++;
      else if (status === 'late') acc.late++;
      else if (status === 'excused') acc.excused++;
      acc.total++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  ) || { present: 0, absent: 0, late: 0, excused: 0, total: 0 };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Record</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-900 dark:text-white font-medium min-w-[140px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{summary.present}</p>
          <p className="text-sm text-green-600 dark:text-green-500">Present</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.absent}</p>
          <p className="text-sm text-red-600 dark:text-red-500">Absent</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{summary.late}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-500">Late</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{summary.excused}</p>
          <p className="text-sm text-blue-600 dark:text-blue-500">Excused</p>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {attendance && attendance.length > 0 ? (
            attendance.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  {record.class_name && (
                    <span className="text-sm text-gray-500">{record.class_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getStatusColor(record.status)}\`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No attendance records for this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentGradesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentGrades(options: StudentGradesOptions = {}): string {
  const { componentName = 'StudentGrades', endpoint = '/grades' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTerm, setSelectedTerm] = useState('current');

  const { data: grades, isLoading } = useQuery({
    queryKey: ['student-grades', id, selectedTerm],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?student_id=\${id}&term=\${selectedTerm}\`);
      return response?.data || response;
    },
  });

  const getGradeColor = (grade: string | number) => {
    const numGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
    if (numGrade >= 90) return 'text-green-600 dark:text-green-400';
    if (numGrade >= 80) return 'text-blue-600 dark:text-blue-400';
    if (numGrade >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (numGrade >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const courses = grades?.courses || grades || [];
  const overallGpa = grades?.gpa;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Grades & Performance</h2>
        <div className="relative">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current">Current Term</option>
            <option value="fall2024">Fall 2024</option>
            <option value="spring2024">Spring 2024</option>
            <option value="fall2023">Fall 2023</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Overall GPA */}
      {overallGpa && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm">Overall GPA</p>
          <p className="text-4xl font-bold">{overallGpa}</p>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Letter
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Credits
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses && courses.length > 0 ? (
              courses.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                        <p className="text-sm text-gray-500">{course.teacher}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={\`text-lg font-bold \${getGradeColor(course.grade)}\`}>
                      {course.grade}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
                      getLetterGrade(course.grade) === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      getLetterGrade(course.grade) === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      getLetterGrade(course.grade) === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      getLetterGrade(course.grade) === 'D' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }\`}>
                      {getLetterGrade(course.grade)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getTrendIcon(course.trend)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                    {course.credits || 3}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No grade records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface StudentProgressOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateStudentProgress(options: StudentProgressOptions = {}): string {
  const { componentName = 'StudentProgress', endpoint = '/progress' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Target, BookOpen, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['student-progress', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?student_id=\${id}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Academic Year Completion</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress?.overall_completion || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: \`\${progress?.overall_completion || 0}%\` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progress?.courses_completed || 0}</p>
              <p className="text-sm text-gray-500">Courses Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progress?.assignments_completed || 0}</p>
              <p className="text-sm text-gray-500">Assignments Done</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progress?.achievements || 0}</p>
              <p className="text-sm text-gray-500">Achievements</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progress?.study_hours || 0}h</p>
              <p className="text-sm text-gray-500">Study Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Course Progress</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {progress?.courses && progress.courses.length > 0 ? (
            progress.courses.map((course: any) => (
              <div key={course.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{course.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{course.progress}%</span>
                </div>
                <div className="ml-11 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={\`h-2 rounded-full transition-all \${
                      course.progress >= 100 ? 'bg-green-600' :
                      course.progress >= 50 ? 'bg-blue-600' :
                      'bg-yellow-500'
                    }\`}
                    style={{ width: \`\${Math.min(course.progress, 100)}%\` }}
                  />
                </div>
                <div className="ml-11 mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>{course.completed_lessons || 0}/{course.total_lessons || 0} lessons</span>
                  {course.next_deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {new Date(course.next_deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No course progress data available</div>
          )}
        </div>
      </div>

      {/* Goals */}
      {progress?.goals && progress.goals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Learning Goals</h3>
          </div>
          <div className="p-4 space-y-4">
            {progress.goals.map((goal: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                  goal.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }\`}>
                  {goal.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Target className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={\`font-medium \${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}\`}>
                    {goal.title}
                  </p>
                  {goal.deadline && !goal.completed && (
                    <p className="text-sm text-gray-500">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
