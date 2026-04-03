/**
 * Test results related types
 */

export type TestType = 
  | 'blood_test'
  | 'urine_test' 
  | 'imaging'
  | 'cardiac'
  | 'pulmonary'
  | 'neurological'
  | 'endocrine'
  | 'genetic'
  | 'allergy'
  | 'cancer_screening'
  | 'infectious_disease'
  | 'vitamin_mineral';

export type TestStatus = 'pending' | 'processing' | 'completed' | 'abnormal' | 'critical';

export type CollectionMethod = 
  | 'venipuncture'
  | 'fingerstick' 
  | 'urine'
  | 'swab'
  | 'biopsy'
  | 'imaging'
  | 'other';

export type UrgencyLevel = 'stat' | 'urgent' | 'routine' | 'scheduled';

export type TestFlag = 'normal' | 'high' | 'low' | 'critical';

export interface TestParameter {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: TestFlag;

  // Legacy
  reference_range?: string;
}

export interface TestResult {
  id: string;
  userId: string;
  testType: TestType;
  testName: string;
  testDate: string;
  resultDate?: string;
  labName: string;
  orderedBy: string;
  reportNumber?: string;
  collectionMethod: CollectionMethod;
  fastingRequired?: boolean;
  urgency: UrgencyLevel;
  status: TestStatus;
  interpretation?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  nextTestDate?: string;
  testParameters?: TestParameter[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  test_type?: TestType;
  test_name?: string;
  test_date?: string;
  result_date?: string;
  lab_name?: string;
  ordered_by?: string;
  report_number?: string;
  collection_method?: CollectionMethod;
  fasting_required?: boolean;
  follow_up_required?: boolean;
  follow_up_date?: string;
  next_test_date?: string;
  test_parameters?: TestParameter[];
  created_at?: string;
  updated_at?: string;
}

export interface TestResultFormData {
  testName: string;
  testType: TestType;
  testDate: string;
  resultDate: string;
  orderedBy: string;
  orderingDoctorSpecialty: string;
  laboratory: string;
  labAddress: string;
  labCountryCode: string;
  labPhoneNumber: string;
  collectionMethod: CollectionMethod;
  fastingRequired: boolean;
  urgency: UrgencyLevel;
  status: TestStatus;
  reportNumber: string;
  notes: string;
  interpretation: string;
  followUpRequired: boolean;
  followUpDate: string;
  nextTestDate: string;
}