/**
 * Education Component Generators Index (React Native)
 *
 * Exports all education-related component generators for:
 * - School/Academic management
 * - Tutoring platforms
 * - Music schools
 * - Driving schools
 * - Flight schools
 */

// Student Components
export {
  generateStudentProfile,
  generateStudentFilters,
  generateStudentAttendance,
  generateStudentGrades,
  generateStudentProgress,
  type StudentProfileOptions,
  type StudentFiltersOptions,
  type StudentAttendanceOptions,
  type StudentGradesOptions,
  type StudentProgressOptions,
} from './student.generator';

// Teacher Components
export {
  generateTeacherProfile,
  generateTeacherClasses,
  type TeacherProfileOptions,
  type TeacherClassesOptions,
} from './teacher.generator';

// Gradebook Components
export {
  generateGradebook,
  generateGradeFilters,
  generateReportCardGenerator,
  type GradebookOptions,
  type GradeFiltersOptions,
  type ReportCardGeneratorOptions,
} from './gradebook.generator';

// Attendance Components
export {
  generateAttendanceForm,
  generateAttendanceDatePicker,
  generateAttendanceSummary,
  generateAttendanceToday,
  type AttendanceFormOptions,
  type AttendanceDatePickerOptions,
  type AttendanceSummaryOptions,
  type AttendanceTodayOptions,
} from './attendance.generator';

// School Components
export {
  generateSchoolStats,
  generateSchoolEvents,
  generateExamCalendar,
  generateExamListToday,
  generateTestListUpcoming,
  type SchoolStatsOptions,
  type SchoolEventsOptions,
  type ExamCalendarOptions,
  type ExamListTodayOptions,
  type TestListUpcomingOptions,
} from './school.generator';

// Tutoring Components
export {
  generateTutorProfile,
  generateTutorFilters,
  generateTutorSchedule,
  generateTutoringStats,
  generateStudentProfileTutoring,
  type TutorProfileOptions,
  type TutorFiltersOptions,
  type TutorScheduleOptions,
  type TutoringStatsOptions,
  type StudentProfileTutoringOptions,
} from './tutoring.generator';

// Music School Components
export {
  generateInstructorProfileMusic,
  generateInstructorScheduleMusic,
  generateLessonCalendarMusic,
  generateStudentProfileMusic,
  generateStudentProgressMusic,
  generateMusicSchoolStats,
  generateSearchResultsMusic,
  type InstructorProfileMusicOptions,
  type InstructorScheduleMusicOptions,
  type LessonCalendarMusicOptions,
  type StudentProfileMusicOptions,
  type StudentProgressMusicOptions,
  type MusicSchoolStatsOptions,
  type SearchResultsMusicOptions,
} from './music.generator';

// Driving School Components
export {
  generateLessonCalendarDriving,
  generateLessonListTodayDriving,
  generateStudentProfileDriving,
  generateDrivingStats,
  type LessonCalendarDrivingOptions,
  type LessonListTodayDrivingOptions,
  type StudentProfileDrivingOptions,
  type DrivingStatsOptions,
} from './driving.generator';

// Flight School Components
export {
  generateFlightCalendar,
  generateFlightListToday,
  generateFlightStats,
  generateStudentProfileFlight,
  generateAircraftStatusOverview,
  type FlightCalendarOptions,
  type FlightListTodayOptions,
  type FlightStatsOptions,
  type StudentProfileFlightOptions,
  type AircraftStatusOverviewOptions,
} from './flight.generator';
