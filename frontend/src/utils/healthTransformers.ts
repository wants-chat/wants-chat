/**
 * Health module data transformers
 * Converts between backend (snake_case) and frontend (camelCase) formats
 */

import {
  transformKeysToCamel,
  transformKeysToSnake,
  transformPaginatedResponse,
  transformSingleResponse,
  prepareForBackend,
} from './caseTransformers';

import type {
  HealthProfile,
  HealthMetric,
  VitalSigns,
} from '../types/health';

// ==========================================
// HEALTH PROFILE TRANSFORMERS
// ==========================================

/**
 * Transform health profile from backend to frontend format
 */
export function transformHealthProfileFromBackend(profile: any): HealthProfile {
  if (!profile) return profile;

  return {
    id: profile.id,
    userId: profile.user_id,
    dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
    gender: profile.gender,
    height: profile.height_cm || profile.height,
    weight: profile.weight_kg || profile.weight,
    bloodType: profile.blood_type,
    allergies: profile.allergies || [],
    medications: profile.medications || [],
    medicalConditions: profile.medical_conditions || [],
    emergencyContact: profile.emergency_contact
      ? transformKeysToCamel(profile.emergency_contact)
      : undefined,
    insuranceInfo: profile.insurance_info
      ? transformKeysToCamel(profile.insurance_info)
      : undefined,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  };
}

/**
 * Transform health profile from frontend to backend format
 */
export function transformHealthProfileToBackend(profile: Partial<HealthProfile>): any {
  const data: any = {};

  if (profile.dateOfBirth !== undefined) data.date_of_birth = profile.dateOfBirth;
  if (profile.gender !== undefined) data.gender = profile.gender;
  if (profile.height !== undefined) data.height_cm = profile.height;
  if (profile.weight !== undefined) data.weight_kg = profile.weight;
  if (profile.bloodType !== undefined) data.blood_type = profile.bloodType;
  if (profile.allergies !== undefined) data.allergies = profile.allergies;
  if (profile.medications !== undefined) data.medications = profile.medications;
  if (profile.medicalConditions !== undefined) data.medical_conditions = profile.medicalConditions;
  if (profile.emergencyContact !== undefined) {
    data.emergency_contact = transformKeysToSnake(profile.emergencyContact);
  }
  if (profile.insuranceInfo !== undefined) {
    data.insurance_info = transformKeysToSnake(profile.insuranceInfo);
  }

  return data;
}

// ==========================================
// HEALTH METRIC TRANSFORMERS
// ==========================================

/**
 * Transform health metric from backend to frontend format
 */
export function transformHealthMetricFromBackend(metric: any): HealthMetric {
  if (!metric) return metric;

  return {
    id: metric.id,
    userId: metric.user_id,
    type: metric.metric_type || metric.type,
    value: metric.value,
    unit: metric.unit || '',
    recordedAt: new Date(metric.recorded_at),
    notes: metric.notes,
    createdAt: new Date(metric.created_at),
  };
}

/**
 * Transform health metric from frontend to backend format
 */
export function transformHealthMetricToBackend(metric: Partial<HealthMetric>): any {
  const data: any = {};

  if (metric.type !== undefined) data.metric_type = metric.type;
  if (metric.value !== undefined) data.value = metric.value;
  if (metric.unit !== undefined) data.unit = metric.unit;
  if (metric.recordedAt !== undefined) {
    data.recorded_at = metric.recordedAt instanceof Date
      ? metric.recordedAt.toISOString()
      : metric.recordedAt;
  }
  if (metric.notes !== undefined) data.notes = metric.notes;

  return data;
}

// ==========================================
// VITAL SIGNS TRANSFORMERS
// ==========================================

/**
 * Transform vital signs from backend to frontend format
 */
export function transformVitalSignsFromBackend(vitals: any): VitalSigns {
  if (!vitals) return vitals;

  return {
    id: vitals.id,
    userId: vitals.user_id,
    bloodPressure: vitals.blood_pressure || vitals.bloodPressure,
    heartRate: vitals.heart_rate || vitals.heartRate,
    temperature: vitals.temperature,
    weight: vitals.weight,
    height: vitals.height,
    bmi: vitals.bmi,
    recordedAt: new Date(vitals.recorded_at || vitals.recordedAt),
    notes: vitals.notes,
    createdAt: new Date(vitals.created_at || vitals.createdAt),
    updatedAt: new Date(vitals.updated_at || vitals.updatedAt),
  };
}

/**
 * Transform vital signs from frontend to backend format
 */
export function transformVitalSignsToBackend(vitals: Partial<VitalSigns>): any {
  const data: any = {};

  if (vitals.bloodPressure !== undefined) data.blood_pressure = vitals.bloodPressure;
  if (vitals.heartRate !== undefined) data.heart_rate = vitals.heartRate;
  if (vitals.temperature !== undefined) data.temperature = vitals.temperature;
  if (vitals.weight !== undefined) data.weight = vitals.weight;
  if (vitals.height !== undefined) data.height = vitals.height;
  if (vitals.bmi !== undefined) data.bmi = vitals.bmi;
  if (vitals.recordedAt !== undefined) {
    data.recorded_at = vitals.recordedAt instanceof Date
      ? vitals.recordedAt.toISOString()
      : vitals.recordedAt;
  }
  if (vitals.notes !== undefined) data.notes = vitals.notes;

  return data;
}

// ==========================================
// APPOINTMENT TRANSFORMERS
// ==========================================

export interface Appointment {
  id: string;
  userId: string;
  appointmentType: string;
  providerName: string;
  providerSpecialty?: string;
  appointmentDate: Date;
  durationMinutes?: number;
  location?: string;
  status: string;
  reminderMinutes?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform appointment from backend to frontend format
 */
export function transformAppointmentFromBackend(appointment: any): Appointment {
  if (!appointment) return appointment;

  return {
    id: appointment.id,
    userId: appointment.user_id,
    appointmentType: appointment.appointment_type,
    providerName: appointment.provider_name,
    providerSpecialty: appointment.provider_specialty,
    appointmentDate: new Date(appointment.appointment_date),
    durationMinutes: appointment.duration_minutes,
    location: appointment.location,
    status: appointment.status,
    reminderMinutes: appointment.reminder_minutes,
    notes: appointment.notes,
    createdAt: new Date(appointment.created_at),
    updatedAt: new Date(appointment.updated_at),
  };
}

/**
 * Transform appointment from frontend to backend format
 */
export function transformAppointmentToBackend(appointment: Partial<Appointment>): any {
  const data: any = {};

  if (appointment.appointmentType !== undefined) data.appointment_type = appointment.appointmentType;
  if (appointment.providerName !== undefined) data.provider_name = appointment.providerName;
  if (appointment.providerSpecialty !== undefined) data.provider_specialty = appointment.providerSpecialty;
  if (appointment.appointmentDate !== undefined) {
    data.appointment_date = appointment.appointmentDate instanceof Date
      ? appointment.appointmentDate.toISOString()
      : appointment.appointmentDate;
  }
  if (appointment.durationMinutes !== undefined) data.duration_minutes = appointment.durationMinutes;
  if (appointment.location !== undefined) data.location = appointment.location;
  if (appointment.status !== undefined) data.status = appointment.status;
  if (appointment.reminderMinutes !== undefined) data.reminder_minutes = appointment.reminderMinutes;
  if (appointment.notes !== undefined) data.notes = appointment.notes;

  return data;
}

// ==========================================
// PRESCRIPTION/MEDICATION TRANSFORMERS
// ==========================================

export interface Prescription {
  id: string;
  userId: string;
  medicationName: string;
  dosage: string;
  dosageUnit?: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  prescriptionDate?: Date;
  prescriptionNumber?: string;
  sideEffects?: string[];
  instructions?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform prescription from backend to frontend format
 */
export function transformPrescriptionFromBackend(prescription: any): Prescription {
  if (!prescription) return prescription;

  return {
    id: prescription.id,
    userId: prescription.user_id,
    medicationName: prescription.medication_name || prescription.name,
    dosage: prescription.dosage,
    dosageUnit: prescription.dosage_unit,
    frequency: prescription.frequency,
    startDate: new Date(prescription.start_date),
    endDate: prescription.end_date ? new Date(prescription.end_date) : undefined,
    prescribedBy: prescription.prescribed_by,
    prescriptionDate: prescription.prescription_date ? new Date(prescription.prescription_date) : undefined,
    prescriptionNumber: prescription.prescription_number,
    sideEffects: prescription.side_effects || [],
    instructions: prescription.instructions,
    isActive: prescription.is_active ?? true,
    notes: prescription.notes,
    createdAt: new Date(prescription.created_at),
    updatedAt: new Date(prescription.updated_at),
  };
}

/**
 * Transform prescription from frontend to backend format
 */
export function transformPrescriptionToBackend(prescription: Partial<Prescription>): any {
  const data: any = {};

  if (prescription.medicationName !== undefined) data.medication_name = prescription.medicationName;
  if (prescription.dosage !== undefined) data.dosage = prescription.dosage;
  if (prescription.dosageUnit !== undefined) data.dosage_unit = prescription.dosageUnit;
  if (prescription.frequency !== undefined) data.frequency = prescription.frequency;
  if (prescription.startDate !== undefined) {
    data.start_date = prescription.startDate instanceof Date
      ? prescription.startDate.toISOString()
      : prescription.startDate;
  }
  if (prescription.endDate !== undefined) {
    data.end_date = prescription.endDate instanceof Date
      ? prescription.endDate.toISOString()
      : prescription.endDate;
  }
  if (prescription.prescribedBy !== undefined) data.prescribed_by = prescription.prescribedBy;
  if (prescription.prescriptionDate !== undefined) {
    data.prescription_date = prescription.prescriptionDate instanceof Date
      ? prescription.prescriptionDate.toISOString()
      : prescription.prescriptionDate;
  }
  if (prescription.prescriptionNumber !== undefined) data.prescription_number = prescription.prescriptionNumber;
  if (prescription.sideEffects !== undefined) data.side_effects = prescription.sideEffects;
  if (prescription.instructions !== undefined) data.instructions = prescription.instructions;
  if (prescription.isActive !== undefined) data.is_active = prescription.isActive;
  if (prescription.notes !== undefined) data.notes = prescription.notes;

  return data;
}

// ==========================================
// TEST RESULT TRANSFORMERS
// ==========================================

export interface TestResult {
  id: string;
  userId: string;
  testType: string;
  testName: string;
  testDate: Date;
  resultDate?: Date;
  labName?: string;
  orderedBy?: string;
  reportNumber?: string;
  collectionMethod?: string;
  fastingRequired?: boolean;
  urgency?: string;
  status: string;
  testParameters?: any[];
  notes?: string;
  interpretation?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  nextTestDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform test result from backend to frontend format
 */
export function transformTestResultFromBackend(result: any): TestResult {
  if (!result) return result;

  return {
    id: result.id,
    userId: result.user_id,
    testType: result.test_type,
    testName: result.test_name,
    testDate: new Date(result.test_date),
    resultDate: result.result_date ? new Date(result.result_date) : undefined,
    labName: result.lab_name,
    orderedBy: result.ordered_by,
    reportNumber: result.report_number,
    collectionMethod: result.collection_method,
    fastingRequired: result.fasting_required,
    urgency: result.urgency,
    status: result.status,
    testParameters: result.test_parameters ? transformKeysToCamel(result.test_parameters) : undefined,
    notes: result.notes,
    interpretation: result.interpretation,
    followUpRequired: result.follow_up_required,
    followUpDate: result.follow_up_date ? new Date(result.follow_up_date) : undefined,
    nextTestDate: result.next_test_date ? new Date(result.next_test_date) : undefined,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  };
}

/**
 * Transform test result from frontend to backend format
 */
export function transformTestResultToBackend(result: Partial<TestResult>): any {
  const data: any = {};

  if (result.testType !== undefined) data.test_type = result.testType;
  if (result.testName !== undefined) data.test_name = result.testName;
  if (result.testDate !== undefined) {
    data.test_date = result.testDate instanceof Date
      ? result.testDate.toISOString()
      : result.testDate;
  }
  if (result.resultDate !== undefined) {
    data.result_date = result.resultDate instanceof Date
      ? result.resultDate.toISOString()
      : result.resultDate;
  }
  if (result.labName !== undefined) data.lab_name = result.labName;
  if (result.orderedBy !== undefined) data.ordered_by = result.orderedBy;
  if (result.reportNumber !== undefined) data.report_number = result.reportNumber;
  if (result.collectionMethod !== undefined) data.collection_method = result.collectionMethod;
  if (result.fastingRequired !== undefined) data.fasting_required = result.fastingRequired;
  if (result.urgency !== undefined) data.urgency = result.urgency;
  if (result.status !== undefined) data.status = result.status;
  if (result.testParameters !== undefined) data.test_parameters = transformKeysToSnake(result.testParameters);
  if (result.notes !== undefined) data.notes = result.notes;
  if (result.interpretation !== undefined) data.interpretation = result.interpretation;
  if (result.followUpRequired !== undefined) data.follow_up_required = result.followUpRequired;
  if (result.followUpDate !== undefined) {
    data.follow_up_date = result.followUpDate instanceof Date
      ? result.followUpDate.toISOString()
      : result.followUpDate;
  }
  if (result.nextTestDate !== undefined) {
    data.next_test_date = result.nextTestDate instanceof Date
      ? result.nextTestDate.toISOString()
      : result.nextTestDate;
  }

  return data;
}

// ==========================================
// LIST RESPONSE TRANSFORMERS
// ==========================================

/**
 * Transform health metrics list response
 */
export function transformHealthMetricsListResponse(response: any): {
  data: HealthMetric[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  if (!response) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  // Handle array response
  if (Array.isArray(response)) {
    return {
      data: response.map(transformHealthMetricFromBackend),
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }

  // Handle paginated response
  const data = Array.isArray(response.data)
    ? response.data.map(transformHealthMetricFromBackend)
    : [];

  return {
    data,
    total: response.total || data.length,
    page: response.page || 1,
    limit: response.limit || data.length,
    totalPages: response.total_pages || response.totalPages || 1,
  };
}

/**
 * Transform appointments list response
 */
export function transformAppointmentsListResponse(response: any): {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  if (!response) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  if (Array.isArray(response)) {
    return {
      data: response.map(transformAppointmentFromBackend),
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }

  const data = Array.isArray(response.data)
    ? response.data.map(transformAppointmentFromBackend)
    : [];

  return {
    data,
    total: response.total || data.length,
    page: response.page || 1,
    limit: response.limit || data.length,
    totalPages: response.total_pages || response.totalPages || 1,
  };
}

/**
 * Transform prescriptions list response
 */
export function transformPrescriptionsListResponse(response: any): {
  data: Prescription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  if (!response) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  if (Array.isArray(response)) {
    return {
      data: response.map(transformPrescriptionFromBackend),
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }

  const data = Array.isArray(response.data)
    ? response.data.map(transformPrescriptionFromBackend)
    : [];

  return {
    data,
    total: response.total || data.length,
    page: response.page || 1,
    limit: response.limit || data.length,
    totalPages: response.total_pages || response.totalPages || 1,
  };
}

/**
 * Transform test results list response
 */
export function transformTestResultsListResponse(response: any): {
  data: TestResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  if (!response) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  if (Array.isArray(response)) {
    return {
      data: response.map(transformTestResultFromBackend),
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }

  const data = Array.isArray(response.data)
    ? response.data.map(transformTestResultFromBackend)
    : [];

  return {
    data,
    total: response.total || data.length,
    page: response.page || 1,
    limit: response.limit || data.length,
    totalPages: response.total_pages || response.totalPages || 1,
  };
}

// ==========================================
// QUERY PARAMS TRANSFORMER
// ==========================================

/**
 * Transform query params from frontend to backend format
 */
export function transformHealthQueryParams(params: any): any {
  const transformed: any = {};

  if (params.page !== undefined) transformed.page = params.page;
  if (params.limit !== undefined) transformed.limit = params.limit;
  if (params.startDate !== undefined) transformed.start_date = params.startDate;
  if (params.endDate !== undefined) transformed.end_date = params.endDate;
  if (params.type !== undefined) transformed.type = params.type;
  if (params.status !== undefined) transformed.status = params.status;
  if (params.sortBy !== undefined) {
    // Map common sort fields
    const sortMapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      recordedAt: 'recorded_at',
      appointmentDate: 'appointment_date',
      testDate: 'test_date',
      startDate: 'start_date',
    };
    transformed.sort_by = sortMapping[params.sortBy] || params.sortBy;
  }
  if (params.sortOrder !== undefined) transformed.sort_order = params.sortOrder;

  return transformed;
}
