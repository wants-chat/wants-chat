/**
 * React Native LMS Component Generators Index
 *
 * Provides generators for React Native LMS (Learning Management System) components:
 * - Course Grid with FlatList
 * - Course Filters with category chips
 * - Enrolled Courses with progress bars
 * - Course Header with enroll button
 * - Curriculum List with expandable modules
 * - Progress Tracker
 * - Lesson Player with expo-av video
 * - Lesson Sidebar navigation
 * - Quiz Player with questions and answers
 */

// Course Grid components
export {
  generateCourseGrid,
  generateCourseFilters,
  generateEnrolledCourses,
  type CourseGridOptions,
  type CourseFiltersOptions,
  type EnrolledCoursesOptions,
} from './course-grid.generator';

// Course Header components
export {
  generateCourseHeader,
  generateCurriculumList,
  generateProgressTracker,
  type CourseHeaderOptions,
  type CurriculumListOptions,
  type ProgressTrackerOptions,
} from './course-header.generator';

// Lesson Player components
export {
  generateLessonPlayer,
  generateLessonSidebar,
  generateQuizPlayer,
  type LessonPlayerOptions,
  type LessonSidebarOptions,
  type QuizPlayerOptions,
} from './lesson-player.generator';
