import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../../components/ui/sonner';
import { useCreateSeriousCondition, useUpdateSeriousCondition, useSeriousConditionById } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import {
  ChevronLeft,
  Warning as AlertCircle,
  Save,
  Check
} from '@mui/icons-material';
import { countryCodes } from '../../data/countryCodes';
import MedicalReportsUploadSection from '../../components/health/serious-condition/MedicalReportsUploadSection';
import ConditionInformationSection from '../../components/health/serious-condition/ConditionInformationSection';
import TreatmentsSection from '../../components/health/serious-condition/TreatmentsSection';
import MedicationsSection from '../../components/health/serious-condition/MedicationsSection';
import NotesSection from '../../components/health/serious-condition/NotesSection';

import type { SeriousConditionFormData, Treatment } from '../../types/health/serious-conditions';
import type { TreatmentItem, ReportFile, SeriousConditionForm } from '../../types/health';

const AddSeriousCondition: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = editId === 'true';

  const createSeriousConditionMutation = useCreateSeriousCondition();
  const updateSeriousConditionMutation = useUpdateSeriousCondition();
  
  // For edit mode, get the ID from localStorage for now
  const conditionId = isEditMode ? JSON.parse(localStorage.getItem('editingCondition') || '{}').id : null;
  const { data: existingCondition, loading: conditionLoading, error: conditionError } = useSeriousConditionById(conditionId);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentMedication, setCurrentMedication] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reports, setReports] = useState<ReportFile[]>([]);
  
  const [formData, setFormData] = useState<SeriousConditionForm>({
    condition: '',
    diagnosis_date: '',
    severity: 'moderate',
    treating_doctor: '',
    hospital: '',
    treatments: [],
    medications: [],
    last_checkup: '',
    next_checkup: '',
    status: 'active',
    emergencyCountryCode: '+1',
    emergencyPhoneNumber: '',
    notes: ''
  });

  const [currentTreatment, setCurrentTreatment] = useState<TreatmentItem>({
    type: '',
    start_date: '',
    end_date: '',
    frequency: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<SeriousConditionForm>>({});
  const [emergencyCountryDropdownOpen, setEmergencyCountryDropdownOpen] = useState(false);
  const [emergencyCountrySearchTerm, setEmergencyCountrySearchTerm] = useState('');
  const emergencyDropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof SeriousConditionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTreatmentChange = (field: keyof TreatmentItem, value: string) => {
    setCurrentTreatment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredEmergencyCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(emergencyCountrySearchTerm.toLowerCase()) ||
    country.code.includes(emergencyCountrySearchTerm)
  );

  const selectedEmergencyCountry = countryCodes.find(country => country.code === formData.emergencyCountryCode);

  // Handle click outside to close emergency dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emergencyDropdownRef.current && !emergencyDropdownRef.current.contains(event.target as Node)) {
        setEmergencyCountryDropdownOpen(false);
        setEmergencyCountrySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pre-populate form when editing existing condition
  useEffect(() => {
    if (isEditMode && existingCondition) {
      // Parse emergency contact to extract country code and phone number
      let extractedCountryCode = '+1';
      let extractedPhoneNumber = '';
      
      if (existingCondition.emergency_contact) {
        const phoneMatch = existingCondition.emergency_contact.match(/^(\+\d{1,3})\s*(.+)$/);
        if (phoneMatch) {
          extractedCountryCode = phoneMatch[1];
          extractedPhoneNumber = phoneMatch[2];
        } else {
          extractedPhoneNumber = existingCondition.emergency_contact;
        }
      }

      setFormData({
        condition: existingCondition.condition || '',
        diagnosis_date: existingCondition.diagnosis_date || '',
        severity: existingCondition.severity || 'moderate',
        treating_doctor: existingCondition.treating_doctor || '',
        hospital: existingCondition.hospital || '',
        treatments: existingCondition.treatments?.map(t => ({
          type: t.type,
          start_date: t.start_date,
          end_date: t.end_date,
          frequency: t.frequency,
          notes: t.notes
        })) || [],
        medications: existingCondition.medications || [],
        last_checkup: existingCondition.last_checkup || '',
        next_checkup: existingCondition.next_checkup || '',
        status: existingCondition.status || 'active',
        emergencyCountryCode: extractedCountryCode,
        emergencyPhoneNumber: extractedPhoneNumber,
        notes: existingCondition.notes || ''
      });
    }
  }, [isEditMode, existingCondition]);

  const addTreatment = () => {
    if (currentTreatment.type.trim()) {
      setFormData(prev => ({
        ...prev,
        treatments: [...prev.treatments, { ...currentTreatment }]
      }));
      setCurrentTreatment({
        type: '',
        start_date: '',
        end_date: '',
        frequency: '',
        notes: ''
      });
    }
  };

  const removeTreatment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (currentMedication.trim() && !formData.medications.includes(currentMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, currentMedication.trim()]
      }));
      setCurrentMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m !== medication)
    }));
  };

  // File handling functions for reports
  const processFiles = (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB for medical reports

    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type. Please upload images or PDFs only.`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newReport: ReportFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file: file,
          preview: e.target?.result as string,
          uploading: false
        };
        setReports(prev => [...prev, newReport]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors: Partial<SeriousConditionForm> = {};
    
    if (!formData.condition.trim()) {
      newErrors.condition = 'Condition name is required';
    }
    
    if (!formData.diagnosis_date) {
      newErrors.diagnosis_date = 'Diagnosis date is required';
    }
    
    if (!formData.treating_doctor.trim()) {
      newErrors.treating_doctor = 'Treating doctor is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setApiError(null);

      // Prepare data for API - filter out empty strings for optional date fields
      const conditionData: SeriousConditionFormData = {
        condition: formData.condition,
        diagnosis_date: formData.diagnosis_date,
        severity: formData.severity,
        status: formData.status,
        treating_doctor: formData.treating_doctor,
        hospital: formData.hospital || undefined,
        last_checkup: formData.last_checkup || undefined,
        next_checkup: formData.next_checkup || undefined,
        emergency_contact: formData.emergencyPhoneNumber
          ? `${formData.emergencyCountryCode} ${formData.emergencyPhoneNumber}`
          : undefined,
        treatments: formData.treatments.map(t => ({
          type: t.type,
          start_date: t.start_date || undefined,
          end_date: t.end_date || undefined,
          frequency: t.frequency || undefined,
          notes: t.notes || undefined
        })),
        medications: formData.medications,
        reports: reports.map(r => r.file), // For file upload
        notes: formData.notes || undefined
      };

      // Debug log to check what's being sent
      console.log('Submitting condition data:', conditionData);
      console.log('Treatments:', conditionData.treatments);
      console.log('Medications:', conditionData.medications);
      console.log('Reports:', conditionData.reports);

      if (isEditMode && conditionId) {
        await updateSeriousConditionMutation.mutate({ id: conditionId, data: conditionData });
      } else {
        await createSeriousConditionMutation.mutate(conditionData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/serious-care');
      }, 2000);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} serious condition:`, error);
      setApiError(error?.message || `Failed to ${isEditMode ? 'update' : 'save'} condition. Please try again.`);
    }
  };

  const handleCancel = () => {
    navigate('/health/serious-care');
  };

  const commonConditions = [
    'Type 2 Diabetes', 'Hypertension', 'Heart Disease', 'Cancer', 'COPD', 
    'Asthma', 'Arthritis', 'Depression', 'Anxiety', 'Kidney Disease',
    'Liver Disease', 'Stroke', 'Epilepsy', 'Multiple Sclerosis', 'Parkinson\'s Disease',
    'Alzheimer\'s Disease', 'Crohn\'s Disease', 'Ulcerative Colitis', 'Lupus', 'Fibromyalgia'
  ];

  const treatmentTypes = [
    'Medication Management', 'Surgery', 'Chemotherapy', 'Radiation Therapy',
    'Physical Therapy', 'Lifestyle Modification', 'Dietary Changes', 'Regular Monitoring',
    'Specialist Consultation', 'Laboratory Tests', 'Imaging Studies', 'Counseling'
  ];

  const frequencies = [
    'Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'Bi-weekly',
    'Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'As Needed'
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild', color: 'text-green-600' },
    { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
    { value: 'severe', label: 'Severe', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-red-600' },
    { value: 'monitoring', label: 'Monitoring', color: 'text-blue-600' },
    { value: 'remission', label: 'Remission', color: 'text-green-600' },
    { value: 'resolved', label: 'Resolved', color: 'text-gray-600' }
  ];

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Serious Care', href: '/health/serious-care' },
    { label: isEditMode ? 'Edit Condition' : 'Add Condition', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Loading state for edit mode */}
        {isEditMode && conditionLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Loading condition data...</p>
            </div>
          </div>
        )}

        {/* Error state for edit mode */}
        {isEditMode && conditionError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-400">Error Loading Condition</h4>
                <p className="text-sm text-red-400/80">
                  {String(conditionError) || 'Failed to load condition data. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <div>
                <h4 className="text-sm font-semibold text-green-400">Success!</h4>
                <p className="text-sm text-green-400/80">
                  Serious condition has been {isEditMode ? 'updated' : 'added'} successfully. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {apiError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-400">Error</h4>
                <p className="text-sm text-red-400/80">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Only show form if not loading in edit mode */}
        {(!isEditMode || !conditionLoading) && !conditionError && (
          <>
        {/* Page Header */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isEditMode ? 'Edit Serious Condition' : 'Add Serious Condition'}
          </h1>
          <p className="mt-2 text-white/60">
            {isEditMode
              ? 'Update the details of your medical condition below.'
              : 'Document your serious medical condition for better health management and emergency preparedness.'}
          </p>
        </div>

        <MedicalReportsUploadSection
          reports={reports}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onRemoveReport={removeReport}
          formatFileSize={formatFileSize}
        />

        <ConditionInformationSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          commonConditions={commonConditions}
          severityOptions={severityOptions}
          statusOptions={statusOptions}
          emergencyCountryDropdownOpen={emergencyCountryDropdownOpen}
          emergencyCountrySearchTerm={emergencyCountrySearchTerm}
          filteredEmergencyCountries={filteredEmergencyCountries}
          selectedEmergencyCountry={selectedEmergencyCountry}
          emergencyDropdownRef={emergencyDropdownRef}
          onEmergencyCountryDropdownToggle={() => setEmergencyCountryDropdownOpen(!emergencyCountryDropdownOpen)}
          onEmergencyCountrySearchChange={setEmergencyCountrySearchTerm}
          onEmergencyCountrySelect={(code) => {
            handleInputChange('emergencyCountryCode', code);
            setEmergencyCountryDropdownOpen(false);
            setEmergencyCountrySearchTerm('');
          }}
        />

        <TreatmentsSection
          formData={formData}
          handleInputChange={handleInputChange}
          currentTreatment={currentTreatment}
          treatmentTypes={treatmentTypes}
          frequencies={frequencies}
          onTreatmentChange={handleTreatmentChange}
          onAddTreatment={addTreatment}
          onRemoveTreatment={removeTreatment}
        />

        <MedicationsSection
          formData={formData}
          handleInputChange={handleInputChange}
          currentMedication={currentMedication}
          onCurrentMedicationChange={setCurrentMedication}
          onAddMedication={addMedication}
          onRemoveMedication={removeMedication}
        />

        <NotesSection
          formData={formData}
          handleInputChange={handleInputChange}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto h-12 px-8 rounded-xl font-medium bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSeriousConditionMutation.loading || updateSeriousConditionMutation.loading || (isEditMode && conditionLoading)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {(createSeriousConditionMutation.loading || updateSeriousConditionMutation.loading) ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update Condition' : 'Save Condition'}
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 p-5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-teal-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Important</h4>
              <p className="text-sm text-white/70 mt-1">
                This information is for tracking purposes only. Always follow your healthcare provider's
                treatment plan and seek immediate medical attention in emergencies.
              </p>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AddSeriousCondition;