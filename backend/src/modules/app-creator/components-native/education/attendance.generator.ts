/**
 * React Native Attendance Component Generators
 *
 * Generates attendance-related components for education/school mobile applications.
 * Components: AttendanceForm, AttendanceDatePicker, AttendanceSummary, AttendanceToday
 */

export interface AttendanceFormOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAttendanceForm(options: AttendanceFormOptions = {}): string {
  const { componentName = 'AttendanceForm', endpoint = '/attendance' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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

  const getStatusButtonStyle = (studentId: string, status: string, activeColor: string, inactiveColor: string) => {
    const isSelected = attendanceData[studentId] === status;
    return {
      backgroundColor: isSelected ? activeColor : '#F3F4F6',
    };
  };

  const getStatusTextStyle = (studentId: string, status: string, activeColor: string) => {
    const isSelected = attendanceData[studentId] === status;
    return {
      color: isSelected ? '#FFFFFF' : '#6B7280',
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const students = data?.students || [];
  const presentCount = Object.values(attendanceData).filter(s => s === 'present').length;
  const absentCount = Object.values(attendanceData).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendanceData).filter(s => s === 'late').length;
  const excusedCount = Object.values(attendanceData).filter(s => s === 'excused').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Take Attendance</Text>
          <Text style={styles.subtitle}>{data?.class?.name}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllPresent}>
          <Text style={styles.markAllText}>Mark All Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, submitMutation.isPending && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#F3F4F6' }]}>
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.summaryValue}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#DCFCE7' }]}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#16A34A" />
          <Text style={[styles.summaryValue, { color: '#16A34A' }]}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
          <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="time-outline" size={16} color="#D97706" />
          <Text style={[styles.summaryValue, { color: '#D97706' }]}>{lateCount}</Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
      </View>

      {/* Student List */}
      <View style={styles.studentList}>
        {students.length > 0 ? (
          students.map((student: any, index: number) => (
            <View key={student.id} style={styles.studentItem}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentIndex}>{index + 1}.</Text>
                {student.avatar_url ? (
                  <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{student.name?.charAt(0)}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentId}>{student.student_id}</Text>
                </View>
              </View>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, getStatusButtonStyle(student.id, 'present', '#16A34A', '#F3F4F6')]}
                  onPress={() => handleStatusChange(student.id, 'present')}
                >
                  <Ionicons name="checkmark" size={14} color={attendanceData[student.id] === 'present' ? '#FFFFFF' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, getStatusButtonStyle(student.id, 'absent', '#DC2626', '#F3F4F6')]}
                  onPress={() => handleStatusChange(student.id, 'absent')}
                >
                  <Ionicons name="close" size={14} color={attendanceData[student.id] === 'absent' ? '#FFFFFF' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, getStatusButtonStyle(student.id, 'late', '#D97706', '#F3F4F6')]}
                  onPress={() => handleStatusChange(student.id, 'late')}
                >
                  <Ionicons name="time" size={14} color={attendanceData[student.id] === 'late' ? '#FFFFFF' : '#6B7280'} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No students in this class</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  markAllButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  markAllText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  studentList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentIndex: {
    width: 24,
    fontSize: 14,
    color: '#9CA3AF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  studentId: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface AttendanceDatePickerOptions {
  componentName?: string;
}

export function generateAttendanceDatePicker(options: AttendanceDatePickerOptions = {}): string {
  const componentName = options.componentName || 'AttendanceDatePicker';

  return `import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    if (rate >= 90) return '#22C55E';
    if (rate >= 70) return '#EAB308';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={20} color="#111827" />
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date())} style={styles.todayButton}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((day, idx) => {
          const indicator = getAttendanceIndicator(day.date);
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => day.isCurrentMonth && onDateChange(formatDateKey(day.date))}
              disabled={!day.isCurrentMonth}
              style={[
                styles.dayCell,
                isSelected(day.date) && styles.selectedDay,
                isToday(day.date) && !isSelected(day.date) && styles.todayDay,
              ]}
            >
              <Text style={[
                styles.dayText,
                !day.isCurrentMonth && styles.disabledDayText,
                isSelected(day.date) && styles.selectedDayText,
              ]}>
                {day.date.getDate()}
              </Text>
              {indicator && day.isCurrentMonth && (
                <View style={[styles.indicator, { backgroundColor: indicator }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>90%+ Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
          <Text style={styles.legendText}>70-89%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Below 70%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  todayText: {
    fontSize: 14,
    color: '#374151',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  disabledDayText: {
    color: '#D1D5DB',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
});

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
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const attendanceRate = summary?.attendance_rate || 0;
  const trend = summary?.trend || 0;

  const getProgressColor = () => {
    if (attendanceRate >= 90) return '#22C55E';
    if (attendanceRate >= 70) return '#EAB308';
    return '#EF4444';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{summary?.total_students || 0}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>{summary?.total_present || 0}</Text>
          <Text style={styles.statLabel}>Days Present</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle-outline" size={24} color="#DC2626" />
          </View>
          <Text style={styles.statValue}>{summary?.total_absent || 0}</Text>
          <Text style={styles.statLabel}>Days Absent</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{summary?.total_late || 0}</Text>
          <Text style={styles.statLabel}>Days Late</Text>
        </View>
      </View>

      {/* Attendance Rate */}
      <View style={styles.rateCard}>
        <View style={styles.rateHeader}>
          <Text style={styles.rateTitle}>Attendance Rate</Text>
          {trend !== 0 && (
            <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#DCFCE7' : '#FEE2E2' }]}>
              <Ionicons
                name={trend > 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={trend > 0 ? '#16A34A' : '#DC2626'}
              />
              <Text style={[styles.trendText, { color: trend > 0 ? '#16A34A' : '#DC2626' }]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.rateValue}>{attendanceRate}%</Text>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: \`\${attendanceRate}%\`, backgroundColor: getProgressColor() }]} />
        </View>
      </View>

      {/* Students Requiring Attention */}
      {summary?.students_with_issues && summary.students_with_issues.length > 0 && (
        <View style={styles.issuesCard}>
          <Text style={styles.issuesTitle}>Students Requiring Attention</Text>
          {summary.students_with_issues.map((student: any) => (
            <View key={student.id} style={styles.issueItem}>
              {student.avatar_url ? (
                <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{student.name?.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.issueInfo}>
                <Text style={styles.issueName}>{student.name}</Text>
                <Text style={styles.issueAbsences}>{student.absences} absences this term</Text>
              </View>
              <View style={[
                styles.rateBadge,
                { backgroundColor: student.attendance_rate < 70 ? '#FEE2E2' : '#FEF3C7' }
              ]}>
                <Text style={[
                  styles.rateBadgeText,
                  { color: student.attendance_rate < 70 ? '#DC2626' : '#D97706' }
                ]}>
                  {student.attendance_rate}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rateValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  progressBackground: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  issuesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  issueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  issueName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  issueAbsences: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

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
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  classId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ classId }) => {
  const navigation = useNavigation();

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
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const getProgressColor = () => {
    const rate = data?.attendance_rate || 0;
    if (rate >= 90) return '#22C55E';
    if (rate >= 70) return '#EAB308';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today's Attendance</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{today}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Attendance' as never)}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{data?.total || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
          </View>
          <Text style={[styles.statValue, { color: '#16A34A' }]}>{data?.present || 0}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
          </View>
          <Text style={[styles.statValue, { color: '#DC2626' }]}>{data?.absent || 0}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={20} color="#D97706" />
          </View>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{data?.late || 0}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
      </View>

      {/* Absent Students */}
      {data?.absent_students && data.absent_students.length > 0 && (
        <View style={styles.absentSection}>
          <Text style={styles.absentTitle}>Absent Today</Text>
          {data.absent_students.slice(0, 5).map((student: any) => (
            <View key={student.id} style={styles.absentItem}>
              {student.avatar_url ? (
                <Image source={{ uri: student.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{student.name?.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.absentInfo}>
                <Text style={styles.absentName}>{student.name}</Text>
                <Text style={styles.absentGrade}>{student.class_name || student.grade}</Text>
              </View>
              {student.reason && (
                <Text style={styles.absentReason}>{student.reason}</Text>
              )}
            </View>
          ))}
          {data.absent_students.length > 5 && (
            <Text style={styles.moreText}>+{data.absent_students.length - 5} more absent students</Text>
          )}
        </View>
      )}

      {/* Rate Bar */}
      <View style={styles.rateSection}>
        <View style={styles.rateHeader}>
          <Text style={styles.rateLabel}>Attendance Rate</Text>
          <Text style={styles.rateValue}>{data?.attendance_rate || 0}%</Text>
        </View>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: \`\${data?.attendance_rate || 0}%\`, backgroundColor: getProgressColor() }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  absentSection: {
    padding: 16,
  },
  absentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  absentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  absentInfo: {
    flex: 1,
    marginLeft: 8,
  },
  absentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  absentGrade: {
    fontSize: 12,
    color: '#6B7280',
  },
  absentReason: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  rateSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ${componentName};
`;
}
