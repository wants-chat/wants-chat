/**
 * Health Service
 * Handles all health-related API calls including metrics, medical records, and health tracking
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';
import type { 
  HealthProfile, 
  HealthMetric, 
  VitalSigns, 
  MedicalRecord,
  Appointment, 
  AppointmentFormData,
  Prescription, 
  Medication,
  TestResult,
  Insurance,
  InsuranceFormData,
  PregnancyRecord,
  PregnancyFormData,
  PaternalCheckupAppointment,
  PaternalCheckupAppointmentFormData,
  EmergencyContact,
  EmergencyContactFormData,
  EmergencyContactQueryParams,
  MedicalFacility,
  MedicalFacilityFormData,
  MedicalFacilityQueryParams,
  Treatment,
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
  TreatmentQueryParams,
  TreatmentResponse,
  QueryParams
} from '../types/health';

import type {
  SeriousCondition,
  SeriousConditionFormData,
  QueryParams as SeriousConditionQueryParams
} from '../types/health/serious-conditions';

class HealthService {
  /**
   * Get user's health profile
   */
  async getHealthProfile(): Promise<HealthProfile> {
    try {
      return await api.getHealthProfile();
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_PROFILE_FETCH_FAILED'
      );
    }
  }

  /**
   * Update user's health profile
   */
  async updateHealthProfile(profile: Partial<HealthProfile>): Promise<HealthProfile> {
    try {
      return await api.updateHealthProfile(profile);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_PROFILE_UPDATE_FAILED'
      );
    }
  }

  /**
   * Create health profile
   */
  async createHealthProfile(profileData: Omit<HealthProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<HealthProfile> {
    try {
      return await api.request('/health/profile', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_PROFILE_CREATE_FAILED'
      );
    }
  }

  /**
   * Get health metrics with optional filtering
   */
  async getHealthMetrics(params?: QueryParams): Promise<{ data: HealthMetric[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getHealthMetrics(params);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.metrics) {
        return {
          data: response.metrics,
          total: response.total || response.metrics.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Fallback: wrap response in data field
      return {
        data: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_METRICS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create a new health metric
   */
  async createHealthMetric(metric: Omit<HealthMetric, 'id' | 'userId' | 'createdAt'>): Promise<HealthMetric> {
    try {
      return await api.createHealthMetric(metric);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_METRIC_CREATE_FAILED'
      );
    }
  }

  /**
   * Update a health metric
   */
  async updateHealthMetric(id: string, metric: Partial<HealthMetric>): Promise<HealthMetric> {
    try {
      return await api.request(`/health/metrics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(metric),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_METRIC_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete a health metric
   */
  async deleteHealthMetric(id: string): Promise<void> {
    try {
      await api.request(`/health/metrics/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_METRIC_DELETE_FAILED'
      );
    }
  }

  /**
   * Get medical records
   */
  async getMedicalRecords(params?: QueryParams): Promise<{ records: MedicalRecord[]; total: number }> {
    try {
      return await api.request(`/health/medical-records${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_RECORDS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create a medical record
   */
  async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> {
    try {
      return await api.request('/health/medical-records', {
        method: 'POST',
        body: JSON.stringify(record),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_RECORD_CREATE_FAILED'
      );
    }
  }

  /**
   * Update a medical record
   */
  async updateMedicalRecord(id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord> {
    try {
      return await api.request(`/health/medical-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(record),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_RECORD_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete a medical record
   */
  async deleteMedicalRecord(id: string): Promise<void> {
    try {
      await api.request(`/health/medical-records/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_RECORD_DELETE_FAILED'
      );
    }
  }

  // Prescription methods
  async getPrescriptions(params?: QueryParams): Promise<{ data: Prescription[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/prescriptions${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTIONS_FETCH_FAILED'
      );
    }
  }

  async getPrescriptionById(id: string): Promise<Prescription> {
    try {
      const response = await api.request(`/health/prescriptions/${id}`);
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTION_FETCH_FAILED'
      );
    }
  }

  async createPrescription(prescriptionData: Omit<Prescription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {
        prescribed_by: prescriptionData.prescribedBy,
        prescription_date: prescriptionData.prescriptionDate || new Date().toISOString(),
        start_date: prescriptionData.startDate ? new Date(prescriptionData.startDate).toISOString() : new Date().toISOString(),
        end_date: prescriptionData.endDate ? new Date(prescriptionData.endDate).toISOString() : undefined,
        prescription_number: prescriptionData.prescriptionNumber,
        pharmacy: prescriptionData.pharmacy,
        notes: prescriptionData.notes,
        status: prescriptionData.status || 'active',
        medications: prescriptionData.medications?.map(med => ({
          name: med.name,
          dosage: med.dosage,
          dosage_unit: med.dosageUnit || 'mg',
          frequency: med.frequency,
          instructions: med.instructions,
          reason: med.reason,
          side_effects: med.sideEffects || ''
        }))
      };

      return await api.request('/health/prescriptions', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTION_CREATE_FAILED'
      );
    }
  }

  async updatePrescription(id: string, prescriptionData: Partial<Prescription>): Promise<Prescription> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (prescriptionData.prescribedBy !== undefined) transformedData.prescribed_by = prescriptionData.prescribedBy;
      if (prescriptionData.prescriptionDate !== undefined) transformedData.prescription_date = prescriptionData.prescriptionDate;
      if (prescriptionData.startDate !== undefined) transformedData.start_date = new Date(prescriptionData.startDate).toISOString();
      if (prescriptionData.endDate !== undefined) transformedData.end_date = prescriptionData.endDate ? new Date(prescriptionData.endDate).toISOString() : null;
      if (prescriptionData.prescriptionNumber !== undefined) transformedData.prescription_number = prescriptionData.prescriptionNumber;
      if (prescriptionData.pharmacy !== undefined) transformedData.pharmacy = prescriptionData.pharmacy;
      if (prescriptionData.notes !== undefined) transformedData.notes = prescriptionData.notes;
      if (prescriptionData.status !== undefined) transformedData.status = prescriptionData.status;
      if (prescriptionData.medications !== undefined) {
        transformedData.medications = prescriptionData.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          dosage_unit: med.dosageUnit || 'mg',
          frequency: med.frequency,
          instructions: med.instructions,
          reason: med.reason,
          side_effects: med.sideEffects || ''
        }));
      }
      
      return await api.request(`/health/prescriptions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTION_UPDATE_FAILED'
      );
    }
  }

  async deletePrescription(prescriptionId: string, medicationName: string): Promise<void> {
    try {
      await api.request(`/health/prescriptions/${prescriptionId}/medications`, {
        method: 'DELETE',
        body: JSON.stringify({ medication_name: medicationName }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTION_DELETE_FAILED'
      );
    }
  }

  async deleteIndividualMedication(prescriptionId: string, medicationName: string): Promise<void> {
    try {
      await api.request(`/health/prescriptions/${prescriptionId}/medications/${encodeURIComponent(medicationName)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTION_DELETE_FAILED'
      );
    }
  }

  async updateIndividualMedication(
    prescriptionId: string, 
    medicationName: string, 
    medicationData: Partial<Medication>
  ): Promise<void> {
    try {
      // Transform medication data to API format
      const transformedData = {
        medication_name: medicationName,
        medication_data: {
          name: medicationData.name,
          dosage: medicationData.dosage,
          dosage_unit: medicationData.dosageUnit || 'mg',
          frequency: medicationData.frequency,
          instructions: medicationData.instructions,
          reason: medicationData.reason,
          side_effects: medicationData.sideEffects || ''
        }
      };

      await api.request(
        `/health/prescriptions/${prescriptionId}/medications`, 
        {
          method: 'PUT',
          body: JSON.stringify(transformedData),
        }
      );
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PRESCRIPTION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Get vital signs
   */
  async getVitalSigns(params?: QueryParams): Promise<{ vitals: VitalSigns[]; total: number }> {
    try {
      return await api.request(`/health/vital-signs${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_SIGNS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create vital signs record
   */
  async createVitalSigns(vitalsData: Omit<VitalSigns, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<VitalSigns> {
    try {
      return await api.request('/health/vital-signs', {
        method: 'POST',
        body: JSON.stringify(vitalsData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_SIGNS_CREATE_FAILED'
      );
    }
  }

  /**
   * Get health summary/dashboard data
   */
  async getHealthSummary(): Promise<{
    recentMetrics: HealthMetric[];
    activePrescriptions: Prescription[];
    upcomingAppointments: MedicalRecord[];
    healthStats: any;
  }> {
    try {
      return await api.request('/health/summary');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_SUMMARY_FETCH_FAILED'
      );
    }
  }

  // Appointment methods
  async getAppointments(params?: QueryParams): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/health/appointments${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
        };
      }
      
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APPOINTMENTS_FETCH_FAILED'
      );
    }
  }

  async createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
    try {
      // Transform form data to match API schema
      const transformedData: any = {
        appointment_type: appointmentData.appointmentType || 'consultation',
        provider_name: appointmentData.doctorName,
        provider_specialty: 'General',
        appointment_date: appointmentData.appointmentDate,
        duration_minutes: 30,
        location: appointmentData.hospitalClinic,
        reason: appointmentData.reasonForVisit,
        notes: appointmentData.notes,
        status: 'scheduled',
      };

      return await api.request('/health/appointments', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APPOINTMENT_CREATE_FAILED'
      );
    }
  }

  async getAppointment(id: string): Promise<Appointment> {
    try {
      return await api.request(`/health/appointments/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APPOINTMENT_FETCH_FAILED'
      );
    }
  }

  async updateAppointment(id: string, appointmentData: Partial<AppointmentFormData>): Promise<Appointment> {
    try {
      const transformedData: any = {};
      
      if (appointmentData.doctorName !== undefined) transformedData.provider_name = appointmentData.doctorName;
      if (appointmentData.hospitalClinic !== undefined) transformedData.location = appointmentData.hospitalClinic;
      if (appointmentData.appointmentDate !== undefined) transformedData.appointment_date = new Date(appointmentData.appointmentDate).toISOString();
      if (appointmentData.appointmentTime !== undefined) transformedData.appointment_time = appointmentData.appointmentTime;
      if (appointmentData.appointmentType !== undefined) transformedData.appointment_type = appointmentData.appointmentType;
      if (appointmentData.reasonForVisit !== undefined) transformedData.reason = appointmentData.reasonForVisit;
      if (appointmentData.phoneNumber !== undefined) transformedData.phone_number = appointmentData.phoneNumber;
      if (appointmentData.reminderSet !== undefined) transformedData.reminder_set = appointmentData.reminderSet;
      if (appointmentData.notes !== undefined) transformedData.notes = appointmentData.notes;

      return await api.request(`/health/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APPOINTMENT_UPDATE_FAILED'
      );
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      await api.request(`/health/appointments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'APPOINTMENT_DELETE_FAILED'
      );
    }
  }

  // Test Results methods
  async getTestResults(params?: QueryParams): Promise<{ data: TestResult[]; total: number; page: number; limit: number; total_pages?: number }> {
    try {
      const response = await api.request(`/health/test-results${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEST_RESULTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create test result
   */
  async createTestResult(testResultData: any): Promise<TestResult> {
    try {
      return await api.request('/health/test-results', {
        method: 'POST',
        body: JSON.stringify(testResultData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEST_RESULT_CREATE_FAILED'
      );
    }
  }

  /**
   * Get test result by ID
   */
  async getTestResultById(id: string): Promise<TestResult> {
    try {
      const result = await api.request(`/health/test-results/${id}`);
      return result;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEST_RESULT_FETCH_FAILED'
      );
    }
  }

  /**
   * Update test result
   */
  async updateTestResult(id: string, testResultData: any): Promise<TestResult> {
    try {
      return await api.request(`/health/test-results/${id}`, {
        method: 'PUT',
        body: JSON.stringify(testResultData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEST_RESULT_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete test result
   */
  async deleteTestResult(id: string): Promise<void> {
    try {
      await api.request(`/health/test-results/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEST_RESULT_DELETE_FAILED'
      );
    }
  }

  // Insurance methods
  /**
   * Get user's insurance records with optional filtering
   */
  async getInsurance(params?: QueryParams): Promise<{ data: Insurance[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/insurance${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INSURANCE_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new insurance record
   */
  async createInsurance(insuranceData: InsuranceFormData): Promise<Insurance> {
    try {
      // Transform frontend data to API format, excluding undefined values
      const transformedData: any = {};
      
      if (insuranceData.provider) transformedData.provider = insuranceData.provider;
      if (insuranceData.policyNumber) transformedData.policy_number = insuranceData.policyNumber;
      if (insuranceData.groupNumber) transformedData.group_number = insuranceData.groupNumber;
      if (insuranceData.planType) transformedData.plan_type = insuranceData.planType;
      if (insuranceData.planName) transformedData.plan_name = insuranceData.planName;
      if (insuranceData.employerName) transformedData.employer_name = insuranceData.employerName;
      if (insuranceData.memberName) transformedData.member_name = insuranceData.memberName;
      if (insuranceData.memberId) transformedData.member_id = insuranceData.memberId;
      if (insuranceData.relationship) transformedData.relationship = insuranceData.relationship;
      if (insuranceData.effectiveDate) transformedData.effective_date = insuranceData.effectiveDate;
      if (insuranceData.expirationDate) transformedData.expiration_date = insuranceData.expirationDate;
      if (insuranceData.insuranceCountryCode && insuranceData.insurancePhoneNumber) {
        transformedData.insurance_phone = `${insuranceData.insuranceCountryCode} ${insuranceData.insurancePhoneNumber}`;
      }
      if (insuranceData.insuranceWebsite) transformedData.insurance_website = insuranceData.insuranceWebsite;
      if (insuranceData.copayPrimary) transformedData.copay_primary = insuranceData.copayPrimary;
      if (insuranceData.copaySpecialist) transformedData.copay_specialist = insuranceData.copaySpecialist;
      if (insuranceData.copayER) transformedData.copay_er = insuranceData.copayER;
      if (insuranceData.deductible) transformedData.deductible = insuranceData.deductible;
      if (insuranceData.deductibleMet) transformedData.deductible_met = insuranceData.deductibleMet;
      if (insuranceData.outOfPocketMax) transformedData.out_of_pocket_max = insuranceData.outOfPocketMax;
      if (insuranceData.outOfPocketMet) transformedData.out_of_pocket_met = insuranceData.outOfPocketMet;
      if (insuranceData.coverageDetails?.length) {
        const filteredCoverage = insuranceData.coverageDetails.filter(item => item.coverage);
        if (filteredCoverage.length) transformedData.coverage_details = filteredCoverage;
      }
      if (insuranceData.notes) transformedData.notes = insuranceData.notes;
      if (insuranceData.cardFrontFile?.name) transformedData.card_image_front = insuranceData.cardFrontFile.name;
      if (insuranceData.cardBackFile?.name) transformedData.card_image_back = insuranceData.cardBackFile.name;
      
      // Always include status
      transformedData.status = 'active';
      
      return await api.request('/health/insurance', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INSURANCE_CREATE_FAILED'
      );
    }
  }

  /**
   * Get insurance record by ID
   */
  async getInsuranceById(id: string): Promise<Insurance> {
    try {
      return await api.request(`/health/insurance/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INSURANCE_FETCH_FAILED'
      );
    }
  }

  /**
   * Update insurance record
   */
  async updateInsurance(id: string, insuranceData: Partial<InsuranceFormData>): Promise<Insurance> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (insuranceData.provider) transformedData.provider = insuranceData.provider;
      if (insuranceData.policyNumber) transformedData.policy_number = insuranceData.policyNumber;
      if (insuranceData.groupNumber) transformedData.group_number = insuranceData.groupNumber;
      if (insuranceData.planType) transformedData.plan_type = insuranceData.planType;
      if (insuranceData.planName) transformedData.plan_name = insuranceData.planName;
      if (insuranceData.memberName) transformedData.member_name = insuranceData.memberName;
      if (insuranceData.memberId) transformedData.member_id = insuranceData.memberId;
      if (insuranceData.relationship) transformedData.relationship = insuranceData.relationship;
      if (insuranceData.effectiveDate) transformedData.effective_date = insuranceData.effectiveDate;
      if (insuranceData.expirationDate) transformedData.expiration_date = insuranceData.expirationDate;
      if (insuranceData.copayPrimary) transformedData.copay_primary = insuranceData.copayPrimary;
      if (insuranceData.copaySpecialist) transformedData.copay_specialist = insuranceData.copaySpecialist;
      if (insuranceData.copayER) transformedData.copay_er = insuranceData.copayER;
      if (insuranceData.deductible) transformedData.deductible = insuranceData.deductible;
      if (insuranceData.deductibleMet) transformedData.deductible_met = insuranceData.deductibleMet;
      if (insuranceData.outOfPocketMax) transformedData.out_of_pocket_max = insuranceData.outOfPocketMax;
      if (insuranceData.outOfPocketMet) transformedData.out_of_pocket_met = insuranceData.outOfPocketMet;
      if (insuranceData.insuranceCountryCode && insuranceData.insurancePhoneNumber) {
        transformedData.insurance_phone = `${insuranceData.insuranceCountryCode} ${insuranceData.insurancePhoneNumber}`;
      }
      if (insuranceData.insuranceWebsite) transformedData.insurance_website = insuranceData.insuranceWebsite;
      if (insuranceData.employerName) transformedData.employer_name = insuranceData.employerName;
      if (insuranceData.notes) transformedData.notes = insuranceData.notes;
      if (insuranceData.coverageDetails) transformedData.coverage_details = insuranceData.coverageDetails.filter(item => item.coverage);
      
      return await api.request(`/health/insurance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INSURANCE_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete insurance record
   */
  async deleteInsurance(id: string): Promise<void> {
    try {
      await api.request(`/health/insurance/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INSURANCE_DELETE_FAILED'
      );
    }
  }

  // Pregnancy methods
  /**
   * Get user's pregnancy records with optional filtering
   */
  async getPregnancyRecords(params?: QueryParams): Promise<{ data: PregnancyRecord[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/pregnancy${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PREGNANCY_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new pregnancy record
   */
  async createPregnancyRecord(pregnancyData: PregnancyFormData): Promise<PregnancyRecord> {
    try {
      // Transform frontend data to API format (only include fields that exist in API schema)
      const transformedData: any = {
        record_type: pregnancyData.recordType,
        record_date: pregnancyData.recordDate,
        week: pregnancyData.week ? parseInt(pregnancyData.week) : undefined,
        due_date: pregnancyData.dueDate,
        provider: pregnancyData.provider,
        weight: pregnancyData.weight ? parseFloat(pregnancyData.weight) : undefined,
        blood_pressure: pregnancyData.systolic && pregnancyData.diastolic 
          ? `${pregnancyData.systolic}/${pregnancyData.diastolic}` 
          : undefined,
        fundus_height: pregnancyData.fundusHeight ? parseFloat(pregnancyData.fundusHeight) : undefined,
        baby_heart_rate: pregnancyData.babyHeartRate ? parseInt(pregnancyData.babyHeartRate) : undefined,
        fetal_movement: pregnancyData.fetalMovement,
        edema: pregnancyData.edema,
        urine_protein: pregnancyData.urineProtein,
        urine_glucose: pregnancyData.urineGlucose,
        next_appointment: pregnancyData.nextAppointment,
        symptoms: pregnancyData.symptoms.length > 0 ? pregnancyData.symptoms : undefined,
        medications: pregnancyData.medications.length > 0 ? pregnancyData.medications : undefined,
        notes: pregnancyData.notes,
        recommendations: pregnancyData.recommendations,
        attachments: [], // Empty array for now
        metadata: {}
      };
      
      // Remove undefined values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });
      
      return await api.request('/health/pregnancy', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PREGNANCY_CREATE_FAILED'
      );
    }
  }

  /**
   * Get pregnancy record by ID
   */
  async getPregnancyRecordById(id: string): Promise<PregnancyRecord> {
    try {
      return await api.request(`/health/pregnancy/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PREGNANCY_FETCH_FAILED'
      );
    }
  }

  /**
   * Update pregnancy record
   */
  async updatePregnancyRecord(id: string, pregnancyData: Partial<PregnancyFormData>): Promise<PregnancyRecord> {
    try {
      // Transform frontend data to API format (only include fields that exist in API schema)
      const transformedData: any = {};
      
      if (pregnancyData.recordType) transformedData.record_type = pregnancyData.recordType;
      if (pregnancyData.recordDate) transformedData.record_date = pregnancyData.recordDate;
      if (pregnancyData.week) transformedData.week = parseInt(pregnancyData.week);
      if (pregnancyData.dueDate) transformedData.due_date = pregnancyData.dueDate;
      if (pregnancyData.provider) transformedData.provider = pregnancyData.provider;
      if (pregnancyData.weight) transformedData.weight = parseFloat(pregnancyData.weight);
      if (pregnancyData.systolic && pregnancyData.diastolic) {
        transformedData.blood_pressure = `${pregnancyData.systolic}/${pregnancyData.diastolic}`;
      }
      if (pregnancyData.babyHeartRate) transformedData.baby_heart_rate = parseInt(pregnancyData.babyHeartRate);
      if (pregnancyData.fundusHeight) transformedData.fundus_height = parseFloat(pregnancyData.fundusHeight);
      if (pregnancyData.fetalMovement) transformedData.fetal_movement = pregnancyData.fetalMovement;
      if (pregnancyData.edema) transformedData.edema = pregnancyData.edema;
      if (pregnancyData.urineProtein) transformedData.urine_protein = pregnancyData.urineProtein;
      if (pregnancyData.urineGlucose) transformedData.urine_glucose = pregnancyData.urineGlucose;
      if (pregnancyData.nextAppointment) transformedData.next_appointment = pregnancyData.nextAppointment;
      if (pregnancyData.symptoms && pregnancyData.symptoms.length > 0) transformedData.symptoms = pregnancyData.symptoms;
      if (pregnancyData.medications && pregnancyData.medications.length > 0) transformedData.medications = pregnancyData.medications;
      if (pregnancyData.notes) transformedData.notes = pregnancyData.notes;
      if (pregnancyData.recommendations) transformedData.recommendations = pregnancyData.recommendations;
      
      // Add required empty fields if they don't exist
      if (!transformedData.attachments) transformedData.attachments = [];
      if (!transformedData.metadata) transformedData.metadata = {};
      
      return await api.request(`/health/pregnancy/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PREGNANCY_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete pregnancy record
   */
  async deletePregnancyRecord(id: string): Promise<void> {
    try {
      await api.request(`/health/pregnancy/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PREGNANCY_DELETE_FAILED'
      );
    }
  }

  // Paternal Checkup Appointment methods
  /**
   * Get paternal checkup appointments with optional filtering
   */
  async getPaternalCheckupAppointments(params?: QueryParams): Promise<{ data: PaternalCheckupAppointment[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/paternal-checkup-appointments${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PATERNAL_CHECKUP_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new paternal checkup appointment
   */
  async createPaternalCheckupAppointment(appointmentData: PaternalCheckupAppointmentFormData): Promise<PaternalCheckupAppointment> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {
        title: appointmentData.title,
        type: appointmentData.type,
        doctor: appointmentData.doctor,
        location: appointmentData.location,
        date: appointmentData.date,
        time: appointmentData.time,
        week: appointmentData.week ? parseInt(appointmentData.week) : undefined,
        phone: appointmentData.phone,
        email: appointmentData.email,
        notes: appointmentData.notes,
        reminder: appointmentData.reminder,
        reminder_time: appointmentData.reminderTime,
        status: 'scheduled'
      };
      
      // Remove undefined values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || transformedData[key] === '') {
          delete transformedData[key];
        }
      });
      
      return await api.request('/health/paternal-checkup-appointments', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PATERNAL_CHECKUP_CREATE_FAILED'
      );
    }
  }

  /**
   * Get paternal checkup appointment by ID
   */
  async getPaternalCheckupAppointmentById(id: string): Promise<PaternalCheckupAppointment> {
    try {
      return await api.request(`/health/paternal-checkup-appointments/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PATERNAL_CHECKUP_FETCH_FAILED'
      );
    }
  }

  /**
   * Update paternal checkup appointment
   */
  async updatePaternalCheckupAppointment(id: string, appointmentData: Partial<PaternalCheckupAppointmentFormData>): Promise<PaternalCheckupAppointment> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (appointmentData.title) transformedData.title = appointmentData.title;
      if (appointmentData.type) transformedData.type = appointmentData.type;
      if (appointmentData.doctor) transformedData.doctor = appointmentData.doctor;
      if (appointmentData.location) transformedData.location = appointmentData.location;
      if (appointmentData.date) transformedData.date = appointmentData.date;
      if (appointmentData.time) transformedData.time = appointmentData.time;
      if (appointmentData.week) transformedData.week = parseInt(appointmentData.week);
      if (appointmentData.phone) transformedData.phone = appointmentData.phone;
      if (appointmentData.email) transformedData.email = appointmentData.email;
      if (appointmentData.notes) transformedData.notes = appointmentData.notes;
      if (appointmentData.reminder !== undefined) transformedData.reminder = appointmentData.reminder;
      if (appointmentData.reminderTime) transformedData.reminder_time = appointmentData.reminderTime;
      
      return await api.request(`/health/paternal-checkup-appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PATERNAL_CHECKUP_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete paternal checkup appointment
   */
  async deletePaternalCheckupAppointment(id: string): Promise<void> {
    try {
      await api.request(`/health/paternal-checkup-appointments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PATERNAL_CHECKUP_DELETE_FAILED'
      );
    }
  }

  // Serious Conditions methods
  /**
   * Get user's serious conditions with optional filtering
   */
  async getSeriousConditions(params?: SeriousConditionQueryParams): Promise<{ data: SeriousCondition[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/serious-conditions${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SERIOUS_CONDITIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new serious condition
   */
  async createSeriousCondition(conditionData: SeriousConditionFormData): Promise<SeriousCondition> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {
        condition: conditionData.condition,
        diagnosis_date: conditionData.diagnosis_date,
        severity: conditionData.severity,
        status: conditionData.status,
        treating_doctor: conditionData.treating_doctor,
        hospital: conditionData.hospital,
        last_checkup: conditionData.last_checkup,
        next_checkup: conditionData.next_checkup,
        emergency_contact: conditionData.emergency_contact,
        treatments: conditionData.treatments,
        medications: conditionData.medications,
        notes: conditionData.notes
      };
      
      // Remove undefined/empty values (but keep empty arrays)
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || (typeof transformedData[key] === 'string' && transformedData[key] === '')) {
          delete transformedData[key];
        }
      });
      
      // Debug log to check what's being sent to API
      console.log('Sending to API:', transformedData);
      
      return await api.request('/health/serious-conditions', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SERIOUS_CONDITION_CREATE_FAILED'
      );
    }
  }

  /**
   * Get serious condition by ID
   */
  async getSeriousConditionById(id: string): Promise<SeriousCondition> {
    try {
      return await api.request(`/health/serious-conditions/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SERIOUS_CONDITION_FETCH_FAILED'
      );
    }
  }

  /**
   * Update serious condition
   */
  async updateSeriousCondition(id: string, conditionData: Partial<SeriousConditionFormData>): Promise<SeriousCondition> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (conditionData.condition) transformedData.condition = conditionData.condition;
      if (conditionData.diagnosis_date) transformedData.diagnosis_date = conditionData.diagnosis_date;
      if (conditionData.severity) transformedData.severity = conditionData.severity;
      if (conditionData.status) transformedData.status = conditionData.status;
      if (conditionData.treating_doctor) transformedData.treating_doctor = conditionData.treating_doctor;
      if (conditionData.hospital) transformedData.hospital = conditionData.hospital;
      if (conditionData.last_checkup) transformedData.last_checkup = conditionData.last_checkup;
      if (conditionData.next_checkup) transformedData.next_checkup = conditionData.next_checkup;
      if (conditionData.emergency_contact) transformedData.emergency_contact = conditionData.emergency_contact;
      if (conditionData.treatments !== undefined) transformedData.treatments = conditionData.treatments;
      if (conditionData.medications !== undefined) transformedData.medications = conditionData.medications;
      if (conditionData.notes) transformedData.notes = conditionData.notes;
      
      return await api.request(`/health/serious-conditions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SERIOUS_CONDITION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete serious condition
   */
  async deleteSeriousCondition(id: string): Promise<void> {
    try {
      await api.request(`/health/serious-conditions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SERIOUS_CONDITION_DELETE_FAILED'
      );
    }
  }

  // Emergency Contacts methods
  /**
   * Get user's emergency contacts with optional filtering
   */
  async getEmergencyContacts(params?: EmergencyContactQueryParams): Promise<{ data: EmergencyContact[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/emergency-contacts${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMERGENCY_CONTACTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new emergency contact
   */
  async createEmergencyContact(contactData: EmergencyContactFormData): Promise<EmergencyContact> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {
        name: contactData.name,
        relationship: contactData.relationship,
        phone: contactData.phone,
        alternate_phone: contactData.alternatePhone,
        email: contactData.email,
        address: contactData.address,
        is_primary: contactData.isPrimary,
        category: contactData.category,
        notes: contactData.notes,
        availability: contactData.availability,
        specialization: contactData.specialization
      };
      
      // Remove undefined/empty values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || (typeof transformedData[key] === 'string' && transformedData[key] === '')) {
          delete transformedData[key];
        }
      });
      
      return await api.request('/health/emergency-contacts', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMERGENCY_CONTACT_CREATE_FAILED'
      );
    }
  }

  /**
   * Get emergency contact by ID
   */
  async getEmergencyContactById(id: string): Promise<EmergencyContact> {
    try {
      return await api.request(`/health/emergency-contacts/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMERGENCY_CONTACT_FETCH_FAILED'
      );
    }
  }

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(id: string, contactData: Partial<EmergencyContactFormData>): Promise<EmergencyContact> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (contactData.name) transformedData.name = contactData.name;
      if (contactData.relationship) transformedData.relationship = contactData.relationship;
      if (contactData.phone) transformedData.phone = contactData.phone;
      if (contactData.alternatePhone !== undefined) transformedData.alternate_phone = contactData.alternatePhone;
      if (contactData.email !== undefined) transformedData.email = contactData.email;
      if (contactData.address !== undefined) transformedData.address = contactData.address;
      if (contactData.isPrimary !== undefined) transformedData.is_primary = contactData.isPrimary;
      if (contactData.category) transformedData.category = contactData.category;
      if (contactData.notes !== undefined) transformedData.notes = contactData.notes;
      if (contactData.availability !== undefined) transformedData.availability = contactData.availability;
      if (contactData.specialization !== undefined) transformedData.specialization = contactData.specialization;
      
      return await api.request(`/health/emergency-contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMERGENCY_CONTACT_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete emergency contact
   */
  async deleteEmergencyContact(id: string): Promise<void> {
    try {
      await api.request(`/health/emergency-contacts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMERGENCY_CONTACT_DELETE_FAILED'
      );
    }
  }

  /**
   * Set emergency contact as primary (unsets others)
   */
  async setPrimaryEmergencyContact(id: string): Promise<EmergencyContact> {
    try {
      return await api.request(`/health/emergency-contacts/${id}/set-primary`, {
        method: 'PUT',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EMERGENCY_CONTACT_SET_PRIMARY_FAILED'
      );
    }
  }

  // Medical Facilities methods
  /**
   * Get user's medical facilities with optional filtering
   */
  async getMedicalFacilities(params?: MedicalFacilityQueryParams): Promise<{ data: MedicalFacility[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/medical-facilities${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_FACILITIES_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new medical facility
   */
  async createMedicalFacility(facilityData: MedicalFacilityFormData): Promise<MedicalFacility> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {
        name: facilityData.name,
        type: facilityData.type,
        phone: facilityData.phone,
        address: facilityData.address,
        hours: facilityData.hours,
        emergency_available: facilityData.emergencyAvailable,
        distance: facilityData.distance,
        specialties: facilityData.specialties,
        notes: facilityData.notes,
        website: facilityData.website,
        insurance: facilityData.insurance
      };
      
      // Remove undefined/empty values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || (typeof transformedData[key] === 'string' && transformedData[key] === '')) {
          delete transformedData[key];
        }
        // Keep empty arrays for specialties and insurance
        if ((key === 'specialties' || key === 'insurance') && Array.isArray(transformedData[key]) && transformedData[key].length === 0) {
          transformedData[key] = [];
        }
      });
      
      return await api.request('/health/medical-facilities', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_FACILITY_CREATE_FAILED'
      );
    }
  }

  /**
   * Get medical facility by ID
   */
  async getMedicalFacilityById(id: string): Promise<MedicalFacility> {
    try {
      return await api.request(`/health/medical-facilities/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_FACILITY_FETCH_FAILED'
      );
    }
  }

  /**
   * Update medical facility
   */
  async updateMedicalFacility(id: string, facilityData: Partial<MedicalFacilityFormData>): Promise<MedicalFacility> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (facilityData.name) transformedData.name = facilityData.name;
      if (facilityData.type) transformedData.type = facilityData.type;
      if (facilityData.phone) transformedData.phone = facilityData.phone;
      if (facilityData.address) transformedData.address = facilityData.address;
      if (facilityData.hours !== undefined) transformedData.hours = facilityData.hours;
      if (facilityData.emergencyAvailable !== undefined) transformedData.emergency_available = facilityData.emergencyAvailable;
      if (facilityData.distance !== undefined) transformedData.distance = facilityData.distance;
      if (facilityData.specialties !== undefined) transformedData.specialties = facilityData.specialties;
      if (facilityData.notes !== undefined) transformedData.notes = facilityData.notes;
      if (facilityData.website !== undefined) transformedData.website = facilityData.website;
      if (facilityData.insurance !== undefined) transformedData.insurance = facilityData.insurance;
      
      return await api.request(`/health/medical-facilities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_FACILITY_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete medical facility
   */
  async deleteMedicalFacility(id: string): Promise<void> {
    try {
      await api.request(`/health/medical-facilities/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDICAL_FACILITY_DELETE_FAILED'
      );
    }
  }

  // Treatment methods
  /**
   * Get user's treatments with optional filtering
   */
  async getTreatments(params?: TreatmentQueryParams): Promise<{ data: Treatment[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      const response = await api.request(`/health/treatments${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Handle different response formats
      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20,
          total_pages: response.total_pages || Math.ceil((response.total || response.data.length) / (response.limit || 20))
        };
      }
      
      // Fallback for array response
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
          total_pages: 1
        };
      }
      
      // Fallback for no data
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TREATMENTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new treatment
   */
  async createTreatment(treatmentData: CreateTreatmentRequest): Promise<Treatment> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {
        name: treatmentData.name,
        type: treatmentData.type,
        frequency: treatmentData.frequency,
        start_date: treatmentData.startDate,
        end_date: treatmentData.endDate,
        doctor: treatmentData.doctor,
        location: treatmentData.location,
        duration: treatmentData.duration,
        dosage: treatmentData.dosage,
        instructions: treatmentData.instructions,
        priority: treatmentData.priority,
        reminder: treatmentData.reminder,
        reminder_time: treatmentData.reminderTime,
        notes: treatmentData.notes,
        side_effects: treatmentData.sideEffects,
        cost: treatmentData.cost,
        insurance: treatmentData.insurance
      };
      
      // Remove undefined/empty values but keep empty arrays and false booleans
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined || (typeof transformedData[key] === 'string' && transformedData[key] === '')) {
          delete transformedData[key];
        }
        // Keep empty arrays for side_effects
        if (key === 'side_effects' && Array.isArray(transformedData[key]) && transformedData[key].length === 0) {
          transformedData[key] = [];
        }
      });
      
      return await api.request('/health/treatments', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TREATMENT_CREATE_FAILED'
      );
    }
  }

  /**
   * Get treatment by ID
   */
  async getTreatmentById(id: string): Promise<Treatment> {
    try {
      return await api.request(`/health/treatments/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TREATMENT_FETCH_FAILED'
      );
    }
  }

  /**
   * Update treatment
   */
  async updateTreatment(id: string, treatmentData: UpdateTreatmentRequest): Promise<Treatment> {
    try {
      // Transform frontend data to API format
      const transformedData: any = {};
      
      if (treatmentData.name !== undefined) transformedData.name = treatmentData.name;
      if (treatmentData.type !== undefined) transformedData.type = treatmentData.type;
      if (treatmentData.frequency !== undefined) transformedData.frequency = treatmentData.frequency;
      if (treatmentData.startDate !== undefined) transformedData.start_date = treatmentData.startDate;
      if (treatmentData.endDate !== undefined) transformedData.end_date = treatmentData.endDate;
      if (treatmentData.doctor !== undefined) transformedData.doctor = treatmentData.doctor;
      if (treatmentData.location !== undefined) transformedData.location = treatmentData.location;
      if (treatmentData.duration !== undefined) transformedData.duration = treatmentData.duration;
      if (treatmentData.dosage !== undefined) transformedData.dosage = treatmentData.dosage;
      if (treatmentData.instructions !== undefined) transformedData.instructions = treatmentData.instructions;
      if (treatmentData.priority !== undefined) transformedData.priority = treatmentData.priority;
      if (treatmentData.reminder !== undefined) transformedData.reminder = treatmentData.reminder;
      if (treatmentData.reminderTime !== undefined) transformedData.reminder_time = treatmentData.reminderTime;
      if (treatmentData.notes !== undefined) transformedData.notes = treatmentData.notes;
      if (treatmentData.sideEffects !== undefined) transformedData.side_effects = treatmentData.sideEffects;
      if (treatmentData.cost !== undefined) transformedData.cost = treatmentData.cost;
      if (treatmentData.insurance !== undefined) transformedData.insurance = treatmentData.insurance;
      if (treatmentData.status !== undefined) transformedData.status = treatmentData.status;
      
      return await api.request(`/health/treatments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TREATMENT_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete treatment
   */
  async deleteTreatment(id: string): Promise<void> {
    try {
      await api.request(`/health/treatments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TREATMENT_DELETE_FAILED'
      );
    }
  }

  /**
   * Update treatment status
   */
  async updateTreatmentStatus(id: string, status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'paused'): Promise<Treatment> {
    try {
      return await api.request(`/health/treatments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TREATMENT_STATUS_UPDATE_FAILED'
      );
    }
  }

  /**
   * Get upcoming treatments
   */
  async getUpcomingTreatments(limit: number = 5): Promise<Treatment[]> {
    try {
      const params = new URLSearchParams({
        status: 'scheduled',
        sort: 'startDate',
        order: 'asc',
        limit: limit.toString()
      });
      
      const response = await api.request(`/health/treatments?${params.toString()}`);
      
      if (response && response.data) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response.slice(0, limit);
      }
      
      return [];
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'UPCOMING_TREATMENTS_FETCH_FAILED'
      );
    }
  }

  // Vital Records methods
  /**
   * Get user's vital records with optional filtering
   */
  async getVitalRecords(params?: QueryParams): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/health/vital-records${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);

      if (response && response.data) {
        return {
          data: response.data,
          total: response.total || response.data.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }

      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length
        };
      }

      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_RECORDS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get a single vital record by ID
   */
  async getVitalRecordById(id: string): Promise<any> {
    try {
      return await api.request(`/health/vital-records/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_RECORD_FETCH_FAILED'
      );
    }
  }

  /**
   * Create a new vital record
   */
  async createVitalRecord(data: any): Promise<any> {
    try {
      return await api.request('/health/vital-records', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_RECORD_CREATE_FAILED'
      );
    }
  }

  /**
   * Update a vital record
   */
  async updateVitalRecord(id: string, data: any): Promise<any> {
    try {
      return await api.request(`/health/vital-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_RECORD_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete a vital record
   */
  async deleteVitalRecord(id: string): Promise<void> {
    try {
      await api.request(`/health/vital-records/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'VITAL_RECORD_DELETE_FAILED'
      );
    }
  }
}

export const healthService = new HealthService();