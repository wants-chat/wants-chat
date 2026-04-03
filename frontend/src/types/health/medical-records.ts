/**
 * Medical records related types
 */

export type MedicalRecordType = 
  | 'visit' 
  | 'prescription' 
  | 'test_result' 
  | 'vaccination' 
  | 'surgery' 
  | 'injury';

export interface MedicalRecord {
  id: string;
  userId: string;
  type: MedicalRecordType;
  title: string;
  description?: string;
  date: Date;
  provider?: string;
  location?: string;
  attachments?: {
    filename: string;
    url: string;
    uploadedAt: Date;
  }[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceRecord {
  id: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  planType: string;
  memberName: string;
  memberId: string;
  effectiveDate: string;
  expirationDate?: string;
  copay?: string;
  deductible?: string;
  outOfPocketMax?: string;
  coverageDetails?: {
    service: string;
    coverage: string;
    notes?: string;
  }[];
  cardImageFront?: string;
  cardImageBack?: string;
  status: 'active' | 'expired' | 'pending';
}

export interface MotherCareRecord {
  id: string;
  recordType: 'pregnancy' | 'prenatal' | 'postnatal';
  week?: number;
  dueDate?: string;
  weight?: string;
  bloodPressure?: string;
  babyHeartRate?: string;
  ultrasoundDate?: string;
  nextCheckup?: string;
  symptoms?: string[];
  medications?: string[];
  notes?: string;
}

export interface SeriousCareRecord {
  id: string;
  condition: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  treatingDoctor: string;
  hospital: string;
  treatments: {
    type: string;
    startDate: string;
    endDate?: string;
    frequency?: string;
    notes?: string;
  }[];
  medications: string[];
  lastCheckup: string;
  nextCheckup?: string;
  status: 'active' | 'remission' | 'monitoring' | 'resolved';
  emergencyContact?: string;
}