/**
 * Medical Records Types
 * These interfaces define the structure for medical data from the API
 */

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  refillsRemaining?: number;
  pharmacy?: string;
  instructions?: string;
  uploadedFile?: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface DoctorVisit {
  id: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitTime: string;
  visitType: 'routine' | 'follow-up' | 'emergency' | 'consultation';
  location: string;
  reason: string;
  diagnosis?: string;
  notes?: string;
  nextAppointment?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TestResult {
  id: string;
  testName: string;
  testType: string;
  orderedBy: string;
  testDate: string;
  resultDate?: string;
  laboratory: string;
  status: 'pending' | 'completed' | 'abnormal';
  results?: {
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    flag?: 'high' | 'low' | 'normal';
  }[];
  reportUrl?: string;
  notes?: string;
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
