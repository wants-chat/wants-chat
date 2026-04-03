/**
 * Health-related type definitions
 */

import React from 'react';

export interface HealthProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'temperature' | 'bmi' | 'body_fat';
  value: number | { systolic: number; diastolic: number }; // For blood pressure
  unit: string;
  recordedAt: Date;
  notes?: string;
  createdAt: Date;
}

export interface VitalSigns {
  id: string;
  userId: string;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Vital Sign Form Interface
export interface VitalSignFormData {
  recordDate: string;
  recordTime: string;
  // Blood Pressure
  systolic: string;
  diastolic: string;
  bpPosition: string;
  bpArm: string;
  // Heart Rate
  heartRate: string;
  heartRhythm: string;
  // Temperature
  temperature: string;
  temperatureUnit: string;
  temperatureLocation: string;
  // Blood Sugar
  bloodSugar: string;
  bloodSugarType: string;
  bloodSugarUnit: string;
  // Weight & BMI
  weight: string;
  weightUnit: string;
  height: string;
  heightUnit: string;
  bmi: string;
  // Respiratory
  respiratoryRate: string;
  oxygenSaturation: string;
  onOxygen: boolean;
  oxygenFlow: string;
  // Cholesterol
  totalCholesterol: string;
  ldlCholesterol: string;
  hdlCholesterol: string;
  triglycerides: string;
  // Additional
  painLevel: string;
  location: string;
  recordedBy: string;
  notes: string;
}

// Vital Section Interface
export interface VitalSection {
  id: string;
  label: string;
  icon: any;
}

// Form Field Props
export interface VitalFormFieldProps {
  formData: VitalSignFormData;
  handleInputChange: (field: keyof VitalSignFormData, value: string | boolean) => void;
  errors: Record<string, string>;
  getStatusBadge: (field: string, value: string) => JSX.Element | null;
}

// Test Results Form Interfaces
export interface TestParameter {
  id: string;
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
}

export interface TestResultFormData {
  testName: string;
  testType: string;
  testDate: string;
  resultDate: string;
  orderedBy: string;
  orderingDoctorSpecialty: string;
  laboratory: string;
  labAddress: string;
  labCountryCode: string;
  labPhoneNumber: string;
  collectionMethod: string;
  fastingRequired: boolean;
  urgency: string;
  status: string;
  reportNumber: string;
  notes: string;
  interpretation: string;
  followUpRequired: boolean;
  followUpDate: string;
  nextTestDate: string;
}

export interface TestResultFormProps {
  formData: TestResultFormData;
  handleInputChange: (field: keyof TestResultFormData, value: string | boolean) => void;
  errors: Record<string, string>;
}

export interface TestParametersProps extends TestResultFormProps {
  testParameters: TestParameter[];
  handleParameterChange: (id: string, field: keyof TestParameter, value: string) => void;
  addParameter: () => void;
  removeParameter: (id: string) => void;
}

// Serious Condition Interfaces
export interface TreatmentItem {
  type: string;
  startDate: string;
  endDate?: string;
  frequency?: string;
  notes?: string;

  // Legacy
  start_date?: string;
  end_date?: string;
}

export interface ReportFile {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
}

export interface SeriousConditionForm {
  condition: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  treatingDoctor: string;
  hospital: string;
  treatments: TreatmentItem[];
  medications: string[];
  lastCheckup: string;
  nextCheckup: string;
  status: 'active' | 'remission' | 'monitoring' | 'resolved';
  emergencyCountryCode: string;
  emergencyPhoneNumber: string;
  notes: string;

  // Legacy
  diagnosis_date?: string;
  treating_doctor?: string;
  last_checkup?: string;
  next_checkup?: string;
}

export interface SeriousConditionFormProps {
  formData: SeriousConditionForm;
  handleInputChange: (field: keyof SeriousConditionForm, value: string) => void;
  errors: Partial<SeriousConditionForm>;
}

// Re-export from sub-modules
export * from './appointments';
export * from './medications';
export * from './medical-records';
export * from './test-results';
export * from './insurance';
export * from './pregnancy';
export * from './paternal-checkup';
export * from './emergency-contacts';
export * from './medical-facilities';
export * from './treatments';
export * from './sleep';