/**
 * Leisure/Recreation Component Generators Index
 *
 * This module exports all leisure and recreation-focused component generators
 * for golf courses, ski resorts, and other recreational facilities.
 */

// Golf Components
export {
  generateGolfStats,
  generateTeeTimeCalendar,
  generateTeeTimeListToday,
  generateMemberProfileGolf,
  generateTournamentListUpcoming,
  generateLessonCalendarGolf,
  type GolfStatsOptions,
  type TeeTimeCalendarOptions,
  type TeeTimeListOptions,
  type MemberProfileGolfOptions,
  type TournamentListOptions,
  type LessonCalendarGolfOptions,
} from './golf.generator';

// Ski Resort Components
export {
  generateSkiResortStats,
  generateLessonCalendarSki,
  generateTrailStatusOverview,
  type SkiResortStatsOptions,
  type LessonCalendarSkiOptions,
  type TrailStatusOverviewOptions,
} from './ski.generator';
