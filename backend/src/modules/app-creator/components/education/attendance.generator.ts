/**
 * Attendance Component Generators
 *
 * Generates attendance-related components for education/school applications.
 * Components: AttendanceForm, AttendanceDatePicker, AttendanceSummary, AttendanceToday
 */

export interface AttendanceFormOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAttendanceForm(options: AttendanceFormOptions = {}): string {
  const { componentName = 'AttendanceForm', endpoint = '/attendance' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, CheckCircle, XCircle, Clock, AlertCircle, Users, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  classId: string;
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId, date = new Date().toISOString().split('T')[0] }) => {
  const queryClient = useQueryClient();
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(date);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-form', classId, selectedDate],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?class_id=\${classId}&date=\${selectedDate}\`);
      const result = response?.data || response;
      // Initialize attendance data from existing records
      const existingAttendance: Record<string, string> = {};
      result?.records?.forEach((record: any) => {
        existingAttendance[record.student_id] = record.status;
      });
      setAttendanceData(existingAttendance);
      return result;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (records: Array<{ student_id: string; status: string; date: string }>) => {
      return api.post<any>(\`${endpoint}/bulk\`, { class_id: classId, records });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-form'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    },
  });

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    const records = Object.entries(attendanceData).map(([student_id, status]) => ({
      student_id,
      status,
      date: selectedDate,
    }));
    submitMutation.mutate(records);
  };

  const markAllPresent = () => {
    const allPresent: Record<string, string> = {};
    data?.students?.forEach((student: any) => {
      allPresent[student.id] = 'present';
    });
    setAttendanceData(allPresent);
  };

  const getStatusButton = (studentId: string, status: string, icon: React.ReactNode, label: string, color: string) => {
    const isSelected = attendanceData[studentId] === status;
    return (
      <button
        onClick={() => handleStatusChange(studentId, status)}
        className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
          isSelected
            ? color
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }\`}
      >
        {icon}
        {label}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const students = data?.students || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Take Attendance</h2>
          <p className="text-gray-500">{data?.class?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={markAllPresent}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Attendance
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Present</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {Object.values(attendanceData).filter(s => s === 'present').length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Absent</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {Object.values(attendanceData).filter(s => s === 'absent').length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Late</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {Object.values(attendanceData).filter(s => s === 'late').length}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Excused</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {Object.values(attendanceData).filter(s => s === 'excused').length}
          </p>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {students.length > 0 ? (
            students.map((student: any, index: number) => (
              <div key={student.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 w-8">{index + 1}.</span>
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-medium">
                      {student.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.student_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusButton(student.id, 'present', <CheckCircle className="w-4 h-4" />, 'Present', 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400')}
                  {getStatusButton(student.id, 'absent', <XCircle className="w-4 h-4" />, 'Absent', 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}
                  {getStatusButton(student.id, 'late', <Clock className="w-4 h-4" />, 'Late', 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400')}
                  {getStatusButton(student.id, 'excused', <AlertCircle className="w-4 h-4" />, 'Excused', 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No students in this class
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

export interface AttendanceDatePickerOptions {
  componentName?: string;
}

export function generateAttendanceDatePicker(options: AttendanceDatePickerOptions = {}): string {
  const componentName = options.componentName || 'AttendanceDatePicker';

  return `import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ${componentName}Props {
  selectedDate: string;
  onDateChange: (date: string) => void;
  attendanceData?: Record<string, { present: number; absent: number; total: number }>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({
  selectedDate,
  onDateChange,
  attendanceData = {},
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => formatDateKey(date) === selectedDate;

  const getAttendanceIndicator = (date: Date) => {
    const key = formatDateKey(date);
    const data = attendanceData[key];
    if (!data) return null;

    const rate = data.total > 0 ? (data.present / data.total) * 100 : 0;
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const indicator = getAttendanceIndicator(day.date);
          return (
            <button
              key={idx}
              onClick={() => onDateChange(formatDateKey(day.date))}
              disabled={!day.isCurrentMonth}
              className={\`
                relative p-2 text-center rounded-lg transition-colors
                \${!day.isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                \${isWeekend(day.date) && day.isCurrentMonth ? 'text-gray-400' : ''}
                \${isSelected(day.date) ? 'bg-blue-600 text-white' : ''}
                \${isToday(day.date) && !isSelected(day.date) ? 'ring-2 ring-blue-500' : ''}
                \${day.isCurrentMonth && !isSelected(day.date) ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
              \`}
            >
              <span className="text-sm">{day.date.getDate()}</span>
              {indicator && day.isCurrentMonth && (
                <div className={\`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full \${indicator}\`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          90%+ Present
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          70-89%
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          Below 70%
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface AttendanceSummaryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAttendanceSummary(options: AttendanceSummaryOptions = {}): string {
  const { componentName = 'AttendanceSummary', endpoint = '/attendance/summary' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  classId?: string;
  startDate?: string;
  endDate?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId, startDate, endDate }) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['attendance-summary', classId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classId) params.append('class_id', classId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const attendanceRate = summary?.attendance_rate || 0;
  const trend = summary?.trend || 0;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.total_students || 0}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.total_present || 0}</p>
              <p className="text-sm text-gray-500">Days Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.total_absent || 0}</p>
              <p className="text-sm text-gray-500">Days Absent</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.total_late || 0}</p>
              <p className="text-sm text-gray-500">Days Late</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.total_excused || 0}</p>
              <p className="text-sm text-gray-500">Excused</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Rate</h3>
          {trend !== 0 && (
            <div className={\`flex items-center gap-1 text-sm font-medium \${trend > 0 ? 'text-green-600' : 'text-red-600'}\`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(trend)}% vs last period
            </div>
          )}
        </div>
        <div className="flex items-end gap-4">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{attendanceRate}%</div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={\`h-4 rounded-full transition-all \${
                  attendanceRate >= 90 ? 'bg-green-500' :
                  attendanceRate >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }\`}
                style={{ width: \`\${attendanceRate}%\` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Absences */}
      {summary?.students_with_issues && summary.students_with_issues.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Students Requiring Attention</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {summary.students_with_issues.map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-medium">
                      {student.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.absences} absences this term</p>
                  </div>
                </div>
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
                  student.attendance_rate < 70
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }\`}>
                  {student.attendance_rate}%
                </span>
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

export interface AttendanceTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAttendanceToday(options: AttendanceTodayOptions = {}): string {
  const { componentName = 'AttendanceToday', endpoint = '/attendance/today' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, XCircle, Clock, Users, ChevronRight, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance-today', classId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (classId) url += \`?class_id=\${classId}\`;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Today's Attendance</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>
        <Link
          to="/attendance"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{data?.total || 0}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-600">{data?.present || 0}</p>
          <p className="text-xs text-gray-500">Present</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-600">{data?.absent || 0}</p>
          <p className="text-xs text-gray-500">Absent</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-xl font-bold text-yellow-600">{data?.late || 0}</p>
          <p className="text-xs text-gray-500">Late</p>
        </div>
      </div>

      {/* Absent Students List */}
      {data?.absent_students && data.absent_students.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Absent Today</h4>
          <div className="space-y-2">
            {data.absent_students.slice(0, 5).map((student: any) => (
              <div key={student.id} className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {student.avatar_url ? (
                  <img src={student.avatar_url} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-sm font-medium">
                    {student.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.class_name || student.grade}</p>
                </div>
                {student.reason && (
                  <span className="text-xs text-gray-500">{student.reason}</span>
                )}
              </div>
            ))}
            {data.absent_students.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                +{data.absent_students.length - 5} more absent students
              </p>
            )}
          </div>
        </div>
      )}

      {/* Attendance Rate Bar */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{data?.attendance_rate || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={\`h-2 rounded-full transition-all \${
              (data?.attendance_rate || 0) >= 90 ? 'bg-green-500' :
              (data?.attendance_rate || 0) >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }\`}
            style={{ width: \`\${data?.attendance_rate || 0}%\` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
