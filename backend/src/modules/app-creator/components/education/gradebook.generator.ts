/**
 * Gradebook Component Generators
 *
 * Generates gradebook-related components for education/school applications.
 * Components: Gradebook, GradeFilters, ReportCardGenerator
 */

export interface GradebookOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateGradebook(options: GradebookOptions = {}): string {
  const { componentName = 'Gradebook', endpoint = '/gradebook' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, ChevronDown, Users, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId }) => {
  const queryClient = useQueryClient();
  const [editingGrade, setEditingGrade] = useState<{ studentId: string; assignmentId: string; value: string } | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['gradebook', classId, selectedAssignment],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (classId) params.append('class_id', classId);
      if (selectedAssignment !== 'all') params.append('assignment_id', selectedAssignment);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: async (gradeData: { studentId: string; assignmentId: string; grade: number }) => {
      return api.post<any>('${endpoint}/grades', gradeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradebook'] });
      setEditingGrade(null);
    },
  });

  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    setEditingGrade({ studentId, assignmentId, value });
  };

  const handleGradeSave = () => {
    if (!editingGrade) return;
    const numValue = parseFloat(editingGrade.value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      updateGradeMutation.mutate({
        studentId: editingGrade.studentId,
        assignmentId: editingGrade.assignmentId,
        grade: numValue,
      });
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (grade >= 80) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    if (grade >= 60) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const students = data?.students || [];
  const assignments = data?.assignments || [];
  const classInfo = data?.class;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gradebook</h2>
          {classInfo && (
            <p className="text-gray-500">{classInfo.name} - {classInfo.term}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignments</option>
              {assignments.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
              <p className="text-xs text-gray-500">Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.class_average || 'N/A'}%</p>
              <p className="text-xs text-gray-500">Class Avg</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.highest_grade || 'N/A'}%</p>
              <p className="text-xs text-gray-500">Highest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900/50">
                  Student
                </th>
                {assignments.map((a: any) => (
                  <th key={a.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="min-w-[80px]">
                      <p className="truncate">{a.name}</p>
                      <p className="text-gray-400 font-normal">{a.max_points} pts</p>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.length > 0 ? (
                students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-sm font-medium">
                            {student.name?.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                      </div>
                    </td>
                    {assignments.map((a: any) => {
                      const grade = student.grades?.[a.id];
                      const isEditing = editingGrade?.studentId === student.id && editingGrade?.assignmentId === a.id;
                      return (
                        <td key={a.id} className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingGrade.value}
                                onChange={(e) => setEditingGrade({ ...editingGrade, value: e.target.value })}
                                className="w-16 px-2 py-1 text-center border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                autoFocus
                                onBlur={handleGradeSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleGradeSave()}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGradeChange(student.id, a.id, grade?.toString() || '')}
                              className={\`px-3 py-1 rounded font-medium \${
                                grade !== undefined ? getGradeColor(grade) : 'text-gray-400 bg-gray-100 dark:bg-gray-700'
                              }\`}
                            >
                              {grade !== undefined ? grade : '-'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <span className={\`px-3 py-1 rounded font-medium \${getGradeColor(student.average || 0)}\`}>
                        {student.average !== undefined ? \`\${student.average}%\` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={\`px-3 py-1 rounded-full text-sm font-bold \${getGradeColor(student.average || 0)}\`}>
                        {student.average !== undefined ? getLetterGrade(student.average) : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={assignments.length + 3} className="px-4 py-12 text-center text-gray-500">
                    No students in this class
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface GradeFiltersOptions {
  componentName?: string;
}

export function generateGradeFilters(options: GradeFiltersOptions = {}): string {
  const componentName = options.componentName || 'GradeFilters';

  return `import React from 'react';
import { Search, ChevronDown, Calendar } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  classId: string;
  onClassChange: (value: string) => void;
  term: string;
  onTermChange: (value: string) => void;
  gradeRange: string;
  onGradeRangeChange: (value: string) => void;
  classes?: Array<{ id: string; name: string }>;
  terms?: Array<{ id: string; name: string }>;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  classId,
  onClassChange,
  term,
  onTermChange,
  gradeRange,
  onGradeRangeChange,
  classes = [],
  terms = [],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Class Filter */}
        {classes.length > 0 && (
          <div className="relative">
            <select
              value={classId}
              onChange={(e) => onClassChange(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Term Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={term}
            onChange={(e) => onTermChange(e.target.value)}
            className="appearance-none w-full lg:w-40 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current">Current Term</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Grade Range Filter */}
        <div className="relative">
          <select
            value={gradeRange}
            onChange={(e) => onGradeRangeChange(e.target.value)}
            className="appearance-none w-full lg:w-36 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Grades</option>
            <option value="A">A (90-100)</option>
            <option value="B">B (80-89)</option>
            <option value="C">C (70-79)</option>
            <option value="D">D (60-69)</option>
            <option value="F">F (0-59)</option>
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

export interface ReportCardGeneratorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateReportCardGenerator(options: ReportCardGeneratorOptions = {}): string {
  const { componentName = 'ReportCardGenerator', endpoint = '/report-cards' } = options;

  return `import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Download, Printer, ChevronDown, User, BookOpen, Award, Calendar, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  studentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ studentId }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedTerm, setSelectedTerm] = useState('current');

  const { data: reportCard, isLoading } = useQuery({
    queryKey: ['report-card', studentId, selectedTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId);
      params.append('term', selectedTerm);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
    enabled: !!studentId,
  });

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(\`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Report Card - \${reportCard?.student?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f5f5f5; }
              .header { text-align: center; margin-bottom: 30px; }
              .grade-a { color: green; }
              .grade-b { color: blue; }
              .grade-c { color: orange; }
              .grade-d, .grade-f { color: red; }
            </style>
          </head>
          <body>
            \${reportRef.current?.innerHTML}
          </body>
          </html>
        \`);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = async () => {
    // In a real app, this would call an API endpoint to generate PDF
    alert('Download functionality would generate a PDF report');
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!reportCard) {
    return (
      <div className="text-center py-12 text-gray-500">
        No report card data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">Current Term</option>
            <option value="fall2024">Fall 2024</option>
            <option value="spring2024">Spring 2024</option>
            <option value="fall2023">Fall 2023</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Report Card */}
      <div ref={reportRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{reportCard.school?.name || 'School Name'}</h1>
              <p className="text-blue-100">Academic Report Card</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Term: {reportCard.term}</p>
              <p className="text-blue-100">Year: {reportCard.year}</p>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {reportCard.student?.avatar_url ? (
              <img src={reportCard.student.avatar_url} alt={reportCard.student.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            )}
            <div className="flex-1 grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">{reportCard.student?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-semibold text-gray-900 dark:text-white">{reportCard.student?.student_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Grade Level</p>
                <p className="font-semibold text-gray-900 dark:text-white">Grade {reportCard.student?.grade_level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Performance</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Subject</th>
                <th className="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                <th className="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Teacher</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reportCard.subjects?.map((subject: any, index: number) => (
                <tr key={index}>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{subject.name}</td>
                  <td className="py-3 text-center">
                    <span className={\`font-bold \${getGradeColor(subject.score)}\`}>
                      {subject.score}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={\`px-3 py-1 rounded-full text-sm font-bold \${getGradeColor(subject.score)}\`}>
                      {getLetterGrade(subject.score)}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{subject.teacher}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{subject.comments || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportCard.gpa}</p>
              <p className="text-sm text-gray-500">GPA</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportCard.class_rank || '-'}</p>
              <p className="text-sm text-gray-500">Class Rank</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportCard.attendance_rate || 0}%</p>
              <p className="text-sm text-gray-500">Attendance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportCard.credits_earned || 0}</p>
              <p className="text-sm text-gray-500">Credits Earned</p>
            </div>
          </div>
        </div>

        {/* Teacher Comments */}
        {reportCard.overall_comments && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Overall Comments</h3>
            <p className="text-gray-600 dark:text-gray-400">{reportCard.overall_comments}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
