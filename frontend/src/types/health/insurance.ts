/**
 * Insurance-related types
 */

export interface CoverageItem {
  service: string;
  coverage: string;
  notes?: string;
}

export interface Insurance {
  id: string;
  userId: string;

  // Basic Insurance Information
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  planType?: string;
  planName?: string;

  // Member Information
  memberName: string;
  memberId: string;
  relationship?: 'self' | 'spouse' | 'child' | 'parent' | 'other';

  // Dates
  effectiveDate: string;
  expirationDate?: string;

  // Financial Information
  copayPrimary?: string;
  copaySpecialist?: string;
  copayER?: string;
  deductible?: string;
  deductibleMet?: string;
  outOfPocketMax?: string;
  outOfPocketMet?: string;

  // Contact Information
  insurancePhone?: string;
  phone?: string; // For backward compatibility
  insuranceWebsite?: string;

  // Additional Information
  employerName?: string;
  notes?: string;

  // Coverage Details
  coverageDetails?: CoverageItem[];

  // File Attachments
  cardImageFront?: string;
  cardImageBack?: string;

  // Status
  status?: 'active' | 'inactive' | 'expired';

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  policy_number?: string;
  group_number?: string;
  plan_type?: string;
  plan_name?: string;
  member_name?: string;
  member_id?: string;
  effective_date?: string;
  expiration_date?: string;
  copay_primary?: string;
  copay_specialist?: string;
  copay_er?: string;
  deductible_met?: string;
  out_of_pocket_max?: string;
  out_of_pocket_met?: string;
  insurance_phone?: string;
  insurance_website?: string;
  employer_name?: string;
  coverage_details?: CoverageItem[];
  card_image_front?: string;
  card_image_back?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceFormData {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  planType?: string;
  planName?: string;
  memberName: string;
  memberId: string;
  relationship?: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  effectiveDate: string;
  expirationDate?: string;
  copayPrimary?: string;
  copaySpecialist?: string;
  copayER?: string;
  deductible?: string;
  deductibleMet?: string;
  outOfPocketMax?: string;
  outOfPocketMet?: string;
  insuranceCountryCode?: string;
  insurancePhoneNumber?: string;
  insuranceWebsite?: string;
  employerName?: string;
  notes?: string;
  coverageDetails?: CoverageItem[];
  cardFrontFile?: File;
  cardBackFile?: File;
}