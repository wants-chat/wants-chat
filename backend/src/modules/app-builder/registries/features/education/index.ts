/**
 * Education Features Registry - Index
 *
 * Comprehensive education industry features for LMS, schools,
 * universities, coding bootcamps, and all educational platforms.
 * 11 features covering the complete education lifecycle.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

// ─────────────────────────────────────────────────────────────
// EDUCATION FEATURE EXPORTS
// ─────────────────────────────────────────────────────────────

export { COURSE_MANAGEMENT_FEATURE } from './course-management';
export { STUDENT_RECORDS_FEATURE } from './student-records';
export { GRADING_FEATURE } from './grading';
export { ASSIGNMENTS_FEATURE } from './assignments';
export { LMS_FEATURE } from './lms';
export { ATTENDANCE_FEATURE } from './attendance';
export { PARENT_PORTAL_FEATURE } from './parent-portal';
export { TRANSCRIPTS_FEATURE } from './transcripts';
export { CERTIFICATES_FEATURE } from './certificates';
export { ENROLLMENT_FEATURE } from './enrollment';
export { CLASS_ROSTER_FEATURE } from './class-roster';

// ─────────────────────────────────────────────────────────────
// IMPORTS FOR COLLECTION
// ─────────────────────────────────────────────────────────────

import { COURSE_MANAGEMENT_FEATURE } from './course-management';
import { STUDENT_RECORDS_FEATURE } from './student-records';
import { GRADING_FEATURE } from './grading';
import { ASSIGNMENTS_FEATURE } from './assignments';
import { LMS_FEATURE } from './lms';
import { ATTENDANCE_FEATURE } from './attendance';
import { PARENT_PORTAL_FEATURE } from './parent-portal';
import { TRANSCRIPTS_FEATURE } from './transcripts';
import { CERTIFICATES_FEATURE } from './certificates';
import { ENROLLMENT_FEATURE } from './enrollment';
import { CLASS_ROSTER_FEATURE } from './class-roster';

// ─────────────────────────────────────────────────────────────
// ALL EDUCATION FEATURES
// ─────────────────────────────────────────────────────────────

/**
 * All education features - 11 comprehensive features
 *
 * Core Features:
 * - Course Management: Course creation, modules, lessons, curriculum
 * - Student Records: Student profiles, academic history, enrollment
 * - LMS: Learning management, progress tracking, quizzes
 * - Enrollment: Registration, waitlists, schedule building
 *
 * Assessment Features:
 * - Grading: Gradebook, rubrics, GPA calculation
 * - Assignments: Assignment creation, submission, peer review
 *
 * Administrative Features:
 * - Attendance: Check-in, absence management
 * - Class Roster: Roster management, seating, groups
 *
 * Documentation Features:
 * - Transcripts: Academic transcript generation
 * - Certificates: Digital certificates and badges
 *
 * Communication Features:
 * - Parent Portal: Parent access, progress monitoring
 */
export const EDUCATION_FEATURES: FeatureDefinition[] = [
  // Core (4)
  COURSE_MANAGEMENT_FEATURE,
  STUDENT_RECORDS_FEATURE,
  LMS_FEATURE,
  ENROLLMENT_FEATURE,

  // Assessment (2)
  GRADING_FEATURE,
  ASSIGNMENTS_FEATURE,

  // Administrative (2)
  ATTENDANCE_FEATURE,
  CLASS_ROSTER_FEATURE,

  // Documentation (2)
  TRANSCRIPTS_FEATURE,
  CERTIFICATES_FEATURE,

  // Communication (1)
  PARENT_PORTAL_FEATURE,
];

// ─────────────────────────────────────────────────────────────
// LOOKUP UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Education features map by ID for quick lookup
 */
export const EDUCATION_FEATURES_BY_ID: Map<string, FeatureDefinition> = new Map(
  EDUCATION_FEATURES.map((f) => [f.id, f])
);

/**
 * Get education feature by ID
 */
export function getEducationFeatureById(
  id: string
): FeatureDefinition | undefined {
  return EDUCATION_FEATURES_BY_ID.get(id);
}

/**
 * Get all education feature IDs
 */
export function getEducationFeatureIds(): string[] {
  return EDUCATION_FEATURES.map((f) => f.id);
}

/**
 * Get core education features (required for most educational apps)
 */
export function getCoreEducationFeatures(): FeatureDefinition[] {
  return EDUCATION_FEATURES.filter((f) => !f.optional);
}

/**
 * Get optional education features
 */
export function getOptionalEducationFeatures(): FeatureDefinition[] {
  return EDUCATION_FEATURES.filter((f) => f.optional);
}

/**
 * Education app types supported
 */
export const EDUCATION_APP_TYPES = [
  'lms',
  'online-academy',
  'school',
  'university',
  'tutoring',
  'coding-bootcamp',
  'language-school',
  'trade-school',
  'preschool',
];

/**
 * Check if an app type is an education app type
 */
export function isEducationAppType(appType: string): boolean {
  return EDUCATION_APP_TYPES.includes(appType);
}

/**
 * Get education features suitable for a specific app type
 * (All education features are available for all education app types)
 */
export function getEducationFeaturesForAppType(
  appType: string
): FeatureDefinition[] {
  if (!isEducationAppType(appType)) {
    return [];
  }
  return EDUCATION_FEATURES;
}

// ─────────────────────────────────────────────────────────────
// FEATURE BUNDLES
// ─────────────────────────────────────────────────────────────

/**
 * Minimal education bundle - essential features only
 */
export const MINIMAL_EDUCATION_BUNDLE = [
  'course-management',
  'student-records',
  'enrollment',
];

/**
 * Standard education bundle - typical LMS features
 */
export const STANDARD_EDUCATION_BUNDLE = [
  ...MINIMAL_EDUCATION_BUNDLE,
  'lms',
  'grading',
  'assignments',
  'certificates',
];

/**
 * Full education bundle - all features
 */
export const FULL_EDUCATION_BUNDLE = getEducationFeatureIds();

/**
 * K-12 education bundle - features for K-12 schools
 */
export const K12_EDUCATION_BUNDLE = [
  'course-management',
  'student-records',
  'enrollment',
  'grading',
  'assignments',
  'attendance',
  'parent-portal',
  'class-roster',
  'transcripts',
];

/**
 * Higher education bundle - features for universities
 */
export const HIGHER_EDUCATION_BUNDLE = [
  'course-management',
  'student-records',
  'enrollment',
  'lms',
  'grading',
  'assignments',
  'transcripts',
  'certificates',
];

/**
 * Online course bundle - features for online academies
 */
export const ONLINE_COURSE_BUNDLE = [
  'course-management',
  'lms',
  'assignments',
  'certificates',
  'enrollment',
];
