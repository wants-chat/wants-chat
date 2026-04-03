/**
 * Fitness Component Generators Index
 */

export { generateMembershipPlans, type MembershipPlansOptions } from './membership-plans.generator';
export { generateClassGrid, generateClassSchedule, generateClassDetail, generateClassFilters, type ClassGridOptions } from './class-grid.generator';
export { generateTrainerGrid, generateTrainerProfile, type TrainerGridOptions } from './trainer-grid.generator';
export { generateWorkoutStats, generateWorkoutList, generateWorkoutForm, generateProgressCharts, type WorkoutOptions } from './workout.generator';

// Yoga generators
export {
  generateClassCalendarYoga,
  generateClassListTodayYoga,
  generateInstructorProfileYoga,
  generateInstructorScheduleYoga,
  generateMemberProfileYoga,
  generatePublicScheduleYoga,
  generateYogaStats,
  type YogaOptions,
} from './yoga.generator';

// Dance studio generators
export {
  generateClassFiltersDance,
  generateInstructorProfileDance,
  generateScheduleCalendarDance,
  generateStudentProfileDance,
  generateDanceStudioStats,
  type DanceOptions,
} from './dance.generator';

// CrossFit generators
export {
  generateWodCalendar,
  generateWodToday,
  generatePublicWod,
  generateCrossfitStats,
  type CrossfitOptions,
} from './crossfit.generator';
