/**
 * Pregnancy-related types
 */

export type PregnancyRecordType = 'regular_checkup' | 'ultrasound' | 'screening' | 'emergency' | 'delivery' | 'postpartum';

export type FetalMovement = 'normal' | 'reduced' | 'increased' | 'none';

export type EdemaLevel = 'none' | 'mild' | 'moderate' | 'severe';

export type UrineTestResult = 'negative' | 'trace' | 'positive' | 'high';

export interface PregnancyRecord {
  id: string;
  userId: string;

  // Basic Record Information
  recordType: PregnancyRecordType;
  recordDate: string;

  // Pregnancy Details
  week?: number;
  dueDate?: string;
  provider?: string; // Healthcare provider name

  // Vital Signs
  weight?: number;
  bloodPressure?: string; // Combined systolic/diastolic (e.g., "120/80")
  babyHeartRate?: number;

  // Clinical Measurements
  fundusHeight?: number;
  fetalMovement?: string;
  edema?: string;
  urineProtein?: string;
  urineGlucose?: string;

  // Appointments and Follow-up
  nextAppointment?: string;

  // Lists
  symptoms?: string[];
  medications?: string[];
  notes?: string;
  recommendations?: string;
  attachments?: string[];

  // Metadata
  metadata?: Record<string, any>;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  record_type?: PregnancyRecordType;
  record_date?: string;
  due_date?: string;
  blood_pressure?: string;
  baby_heart_rate?: number;
  fundus_height?: number;
  fetal_movement?: string;
  urine_protein?: string;
  urine_glucose?: string;
  next_appointment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PregnancyFormData {
  recordType: PregnancyRecordType;
  recordDate: string;
  week: string;
  dueDate: string;
  provider: string; // Healthcare provider name
  weight: string;
  weightUnit: 'kg' | 'lbs'; // For UI only, will be converted to just weight number
  systolic: string;
  diastolic: string;
  babyHeartRate: string;
  nextAppointment: string;
  symptoms: string[];
  medications: string[];
  notes: string;
  recommendations: string;
  fundusHeight: string;
  fetalMovement: string;
  edema: string;
  urineProtein: string;
  urineGlucose: string;
}