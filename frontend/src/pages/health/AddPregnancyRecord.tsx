import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreatePregnancyRecord, useUpdatePregnancyRecord, usePregnancyRecordById } from '../../hooks/useServices';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import type { PregnancyFormData } from '../../types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { 
  ChevronLeft,
  ChildCare,
  CalendarMonth as Calendar,
  AccessTime as Clock,
  Save,
  Warning as AlertCircle,
  Check,
  Favorite as Heart,
  Scale,
  MonitorHeart,
  Medication as Pill,
  Add as Plus,
  Delete as Trash2,
  LocalHospital,
  PregnantWoman
} from '@mui/icons-material';


const AddPregnancyRecord: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const createPregnancyMutation = useCreatePregnancyRecord();
  const updatePregnancyMutation = useUpdatePregnancyRecord();
  const { data: existingRecord, loading: recordLoading, error: recordError } = usePregnancyRecordById(editId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentMedication, setCurrentMedication] = useState('');
  
  const [formData, setFormData] = useState<PregnancyFormData>({
    recordType: 'regular_checkup',
    recordDate: new Date().toISOString().split('T')[0],
    week: '',
    dueDate: '',
    provider: '',
    weight: '',
    weightUnit: 'kg',
    systolic: '',
    diastolic: '',
    babyHeartRate: '',
    nextAppointment: '',
    symptoms: [],
    medications: [],
    notes: '',
    recommendations: '',
    fundusHeight: '',
    fetalMovement: 'normal',
    edema: 'none',
    urineProtein: 'negative',
    urineGlucose: 'negative'
  });

  const [errors, setErrors] = useState<Partial<PregnancyFormData>>({});

  // Pre-populate form when editing existing pregnancy record
  useEffect(() => {
    if (isEditMode && existingRecord) {
      // Parse blood pressure if it exists
      let systolic = '';
      let diastolic = '';
      
      if (existingRecord.blood_pressure) {
        const bpMatch = existingRecord.blood_pressure.match(/^(\d+)\/(\d+)$/);
        if (bpMatch) {
          systolic = bpMatch[1];
          diastolic = bpMatch[2];
        }
      }

      setFormData({
        recordType: (existingRecord.record_type || existingRecord.recordType || 'regular_checkup') as any,
        recordDate: existingRecord.record_date || existingRecord.recordDate || '',
        week: existingRecord.week ? existingRecord.week.toString() : '',
        dueDate: existingRecord.due_date || existingRecord.dueDate || '',
        provider: existingRecord.provider || '',
        weight: existingRecord.weight ? existingRecord.weight.toString() : '',
        weightUnit: 'kg', // Default to kg, could be enhanced with user preference
        systolic: systolic,
        diastolic: diastolic,
        babyHeartRate: existingRecord.baby_heart_rate || existingRecord.babyHeartRate ? ((existingRecord.baby_heart_rate || existingRecord.babyHeartRate) ?? 0).toString() : '',
        nextAppointment: existingRecord.next_appointment || existingRecord.nextAppointment || '',
        symptoms: existingRecord.symptoms || [],
        medications: existingRecord.medications || [],
        notes: existingRecord.notes || '',
        recommendations: existingRecord.recommendations || '',
        fundusHeight: existingRecord.fundus_height || existingRecord.fundusHeight ? ((existingRecord.fundus_height || existingRecord.fundusHeight) ?? 0).toString() : '',
        fetalMovement: existingRecord.fetal_movement || existingRecord.fetalMovement || 'normal',
        edema: existingRecord.edema || 'none',
        urineProtein: existingRecord.urine_protein || existingRecord.urineProtein || 'negative',
        urineGlucose: existingRecord.urine_glucose || existingRecord.urineGlucose || 'negative'
      });
    }
  }, [isEditMode, existingRecord]);

  const handleInputChange = (field: keyof PregnancyFormData, value: string) => {
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

  const addSymptom = () => {
    if (currentSymptom.trim() && !formData.symptoms.includes(currentSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, currentSymptom.trim()]
      }));
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
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

  const validateForm = () => {
    const newErrors: Partial<PregnancyFormData> = {};
    
    // Required field validations
    if (!formData.recordDate) {
      newErrors.recordDate = 'Record date is required';
    } else {
      // Validate record date is not in the future
      const recordDate = new Date(formData.recordDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (recordDate > today) {
        newErrors.recordDate = 'Record date cannot be in the future';
      }
    }
    
    if (!formData.week) {
      newErrors.week = 'Pregnancy week is required';
    } else {
      const weekNum = parseInt(formData.week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 42) {
        newErrors.week = 'Week must be between 1 and 42';
      }
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      // Validate due date is in the future (or within reasonable range)
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      const tenMonthsFromNow = new Date();
      tenMonthsFromNow.setMonth(today.getMonth() + 10);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date should be in the future';
      } else if (dueDate > tenMonthsFromNow) {
        newErrors.dueDate = 'Due date seems too far in the future';
      }
    }
    
    // Validate weight (if provided)
    if (formData.weight && formData.weight.trim()) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0) {
        newErrors.weight = 'Weight must be a positive number';
      } else if (formData.weightUnit === 'kg' && (weight < 30 || weight > 200)) {
        newErrors.weight = 'Weight should be between 30-200 kg';
      } else if (formData.weightUnit === 'lbs' && (weight < 65 || weight > 440)) {
        newErrors.weight = 'Weight should be between 65-440 lbs';
      }
    }
    
    // Validate blood pressure (if provided)
    if (formData.systolic && formData.systolic.trim()) {
      const systolic = parseInt(formData.systolic);
      if (isNaN(systolic) || systolic < 60 || systolic > 250) {
        newErrors.systolic = 'Systolic pressure should be between 60-250 mmHg';
      }
    }
    
    if (formData.diastolic && formData.diastolic.trim()) {
      const diastolic = parseInt(formData.diastolic);
      if (isNaN(diastolic) || diastolic < 40 || diastolic > 150) {
        newErrors.diastolic = 'Diastolic pressure should be between 40-150 mmHg';
      }
    }
    
    // Validate baby heart rate (if provided)
    if (formData.babyHeartRate && formData.babyHeartRate.trim()) {
      const heartRate = parseInt(formData.babyHeartRate);
      if (isNaN(heartRate) || heartRate < 100 || heartRate > 200) {
        newErrors.babyHeartRate = 'Baby heart rate should be between 100-200 bpm';
      }
    }
    
    // Validate fundus height (if provided)
    if (formData.fundusHeight && formData.fundusHeight.trim()) {
      const height = parseFloat(formData.fundusHeight);
      if (isNaN(height) || height < 10 || height > 50) {
        newErrors.fundusHeight = 'Fundus height should be between 10-50 cm';
      }
    }
    
    // Validate next appointment date consistency
    if (formData.nextAppointment && formData.recordDate) {
      const nextAppointment = new Date(formData.nextAppointment);
      const recordDate = new Date(formData.recordDate);
      
      if (nextAppointment <= recordDate) {
        newErrors.nextAppointment = 'Next appointment should be after the record date';
      }
    }
    
    // Validate provider name (if provided)
    if (formData.provider && formData.provider.trim() && formData.provider.length < 2) {
      newErrors.provider = 'Provider name must be at least 2 characters';
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

      // Prepare data for API
      const pregnancyData: PregnancyFormData = formData;

      if (isEditMode && editId) {
        await updatePregnancyMutation.mutate({ id: editId, data: pregnancyData });
      } else {
        await createPregnancyMutation.mutate(pregnancyData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/mother-care');
      }, 2000);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} pregnancy record:`, error);
      setApiError(error?.message || `Failed to ${isEditMode ? 'update' : 'save'} pregnancy record. Please try again.`);
    }
  };

  const handleCancel = () => {
    navigate('/health/mother-care');
  };

  const commonSymptoms = [
    'Morning sickness', 'Fatigue', 'Heartburn', 'Back pain', 'Swollen feet',
    'Breast tenderness', 'Frequent urination', 'Constipation', 'Headaches',
    'Dizziness', 'Insomnia', 'Mood swings', 'Food cravings', 'Shortness of breath'
  ];

  const commonMedications = [
    'Prenatal vitamins', 'Folic acid', 'Iron supplements', 'Calcium supplements',
    'DHA supplements', 'Vitamin D', 'Acetaminophen', 'Antacids'
  ];

  const recordTypes = [
    { value: 'regular_checkup', label: 'Regular Checkup' },
    { value: 'ultrasound', label: 'Ultrasound Appointment' },
    { value: 'screening', label: 'Screening Test' },
    { value: 'emergency', label: 'Emergency Visit' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'postpartum', label: 'Postpartum Care' }
  ];

  const fetalMovementOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'increased', label: 'Increased' },
    { value: 'decreased', label: 'Decreased' },
    { value: 'not_felt', label: 'Not Felt Yet' }
  ];

  const edemaOptions = [
    { value: 'none', label: 'None' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
  ];

  const testResultOptions = [
    { value: 'negative', label: 'Negative' },
    { value: 'trace', label: 'Trace' },
    { value: 'positive', label: 'Positive' }
  ];

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Mother Care', href: '/health/mother-care' },
    { label: isEditMode ? 'Edit Pregnancy Record' : 'Add Pregnancy Record', icon: PregnantWoman }
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
        {isEditMode && recordLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Loading pregnancy record...</p>
            </div>
          </div>
        )}

        {/* Error state for edit mode */}
        {isEditMode && recordError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-400">Error Loading Record</h4>
                <p className="text-sm text-red-400/80">
                  {String(recordError) || 'Failed to load pregnancy record. Please try again.'}
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
                  Pregnancy record has been {isEditMode ? 'updated' : 'added'} successfully. Redirecting...
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
        {(!isEditMode || !recordLoading) && !recordError && (
          <>
            {/* Basic Information */}
            <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <PregnantWoman className="h-6 w-6 text-teal-400" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Record type and basic pregnancy details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recordType" className="text-sm font-semibold text-white/80">Record Type</Label>
                  <Select value={formData.recordType} onValueChange={(value) => handleInputChange('recordType', value as 'pregnancy' | 'prenatal' | 'postnatal')}>
                    <SelectTrigger id="recordType" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      {recordTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recordDate" className="text-sm font-semibold text-white/80">Record Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-teal-400 z-10" />
                    <Input
                      id="recordDate"
                      type="date"
                      value={formData.recordDate}
                      onChange={(e) => handleInputChange('recordDate', e.target.value)}
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.recordDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.recordDate && <p className="text-sm text-red-400">{errors.recordDate}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="week" className="text-sm font-semibold text-white/80">Pregnancy Week *</Label>
                    <Input
                      id="week"
                      type="number"
                      min="1"
                      max="42"
                      value={formData.week}
                      onChange={(e) => handleInputChange('week', e.target.value)}
                      placeholder="Enter week (1-42)"
                      className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.week ? 'border-red-500' : ''}`}
                    />
                    {errors.week && <p className="text-sm text-red-400">{errors.week}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-semibold text-white/80">Due Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-teal-400 z-10" />
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.dueDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.dueDate && <p className="text-sm text-red-400">{errors.dueDate}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-sm font-semibold text-white/80">Healthcare Provider</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => handleInputChange('provider', e.target.value)}
                    placeholder="Enter healthcare provider's name"
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextAppointment" className="text-sm font-semibold text-white/80">Next Appointment</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-teal-400 z-10" />
                    <Input
                      id="nextAppointment"
                      type="date"
                      value={formData.nextAppointment}
                      onChange={(e) => handleInputChange('nextAppointment', e.target.value)}
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.nextAppointment ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.nextAppointment && <p className="text-sm text-red-400">{errors.nextAppointment}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <MonitorHeart className="h-6 w-6 text-teal-400" />
              Vital Signs & Measurements
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Record vital signs and physical measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <Scale className="h-5 w-5 text-teal-400" />
                  Weight & Size
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-semibold text-white/80">Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="Enter weight"
                      className={`flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.weight ? 'border-red-500' : ''}`}
                    />
                    <Select value={formData.weightUnit} onValueChange={(value) => handleInputChange('weightUnit', value)}>
                      <SelectTrigger className="w-20 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-teal-800/90 border-teal-400/30">
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.weight && <p className="text-sm text-red-400">{errors.weight}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundusHeight" className="text-sm font-semibold text-white/80">Fundus Height</Label>
                  <Input
                    id="fundusHeight"
                    value={formData.fundusHeight}
                    onChange={(e) => handleInputChange('fundusHeight', e.target.value)}
                    placeholder="Enter height (e.g., 24 cm)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.fundusHeight ? 'border-red-500' : ''}`}
                  />
                  {errors.fundusHeight && <p className="text-sm text-red-400">{errors.fundusHeight}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <MonitorHeart className="h-5 w-5 text-teal-400" />
                  Blood Pressure & Heart Rate
                </h4>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-white/80">Blood Pressure</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={formData.systolic}
                      onChange={(e) => handleInputChange('systolic', e.target.value)}
                      placeholder="120"
                      className={`flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.systolic ? 'border-red-500' : ''}`}
                    />
                    <span className="text-white/50">/</span>
                    <Input
                      value={formData.diastolic}
                      onChange={(e) => handleInputChange('diastolic', e.target.value)}
                      placeholder="80"
                      className={`flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.diastolic ? 'border-red-500' : ''}`}
                    />
                    <span className="text-sm text-white/50">mmHg</span>
                  </div>
                  {(errors.systolic || errors.diastolic) && (
                    <p className="text-sm text-red-400">
                      {errors.systolic || errors.diastolic}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="babyHeartRate" className="text-sm font-semibold text-white/80">Baby Heart Rate</Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-3 h-5 w-5 text-teal-400 z-10" />
                    <Input
                      id="babyHeartRate"
                      value={formData.babyHeartRate}
                      onChange={(e) => handleInputChange('babyHeartRate', e.target.value)}
                      placeholder="Enter heart rate"
                      className={`pl-12 pr-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.babyHeartRate ? 'border-red-500' : ''}`}
                    />
                    <span className="absolute right-3 top-3 text-sm text-white/50">bpm</span>
                  </div>
                  {errors.babyHeartRate && <p className="text-sm text-red-400">{errors.babyHeartRate}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <ChildCare className="h-5 w-5 text-teal-400" />
                  Baby & Physical
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="fetalMovement" className="text-sm font-semibold text-white/80">Fetal Movement</Label>
                  <Select value={formData.fetalMovement} onValueChange={(value) => handleInputChange('fetalMovement', value)}>
                    <SelectTrigger id="fetalMovement" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      {fetalMovementOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edema" className="text-sm font-semibold text-white/80">Edema/Swelling</Label>
                  <Select value={formData.edema} onValueChange={(value) => handleInputChange('edema', value)}>
                    <SelectTrigger id="edema" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      {edemaOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Tests */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <Pill className="h-6 w-6 text-teal-400" />
              Lab Tests
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Urine and other test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="urineProtein" className="text-sm font-semibold text-white/80">Urine Protein</Label>
                <Select value={formData.urineProtein} onValueChange={(value) => handleInputChange('urineProtein', value)}>
                  <SelectTrigger id="urineProtein" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {testResultOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urineGlucose" className="text-sm font-semibold text-white/80">Urine Glucose</Label>
                <Select value={formData.urineGlucose} onValueChange={(value) => handleInputChange('urineGlucose', value)}>
                  <SelectTrigger id="urineGlucose" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {testResultOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <AlertCircle className="h-6 w-6 text-teal-400" />
              Symptoms
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Add any symptoms you're experiencing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="Enter symptom"
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Button onClick={addSymptom} className="h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(symptom => (
                <Badge 
                  key={symptom}
                  variant="outline" 
                  className="cursor-pointer hover:bg-white/10 border-white/20 text-white/60"
                  onClick={() => {
                    if (!formData.symptoms.includes(symptom)) {
                      setFormData(prev => ({
                        ...prev,
                        symptoms: [...prev.symptoms, symptom]
                      }));
                    }
                  }}
                >
                  {symptom}
                </Badge>
              ))}
            </div>

            {formData.symptoms.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Current Symptoms:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map(symptom => (
                    <Badge key={symptom} className="flex items-center gap-1 bg-teal-500/20 text-teal-400 border-teal-500/30">
                      {symptom}
                      <button onClick={() => removeSymptom(symptom)} className="hover:text-red-400 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <Pill className="h-6 w-6 text-teal-400" />
              Medications & Supplements
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Add medications and supplements you're taking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                placeholder="Enter medication"
                onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Button onClick={addMedication} className="h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {commonMedications.map(medication => (
                <Badge 
                  key={medication}
                  variant="outline" 
                  className="cursor-pointer hover:bg-white/10 border-white/20 text-white/60"
                  onClick={() => {
                    if (!formData.medications.includes(medication)) {
                      setFormData(prev => ({
                        ...prev,
                        medications: [...prev.medications, medication]
                      }));
                    }
                  }}
                >
                  <Pill className="h-3 w-3 mr-1 text-teal-400" />
                  {medication}
                </Badge>
              ))}
            </div>

            {formData.medications.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Current Medications:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.medications.map(medication => (
                    <Badge key={medication} className="flex items-center gap-1 bg-teal-500/20 text-teal-400 border-teal-500/30">
                      <Pill className="h-3 w-3 text-teal-400" />
                      {medication}
                      <button onClick={() => removeMedication(medication)} className="hover:text-red-400 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <Heart className="h-6 w-6 text-teal-400" />
              Additional Notes
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Add any additional notes about your pregnancy or health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes about your appointment, health status, or concerns..."
              className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={5}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-12 px-6 rounded-xl font-medium bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createPregnancyMutation.loading || updatePregnancyMutation.loading || (isEditMode && recordLoading)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(createPregnancyMutation.loading || updatePregnancyMutation.loading) ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {isEditMode ? 'Updating Record...' : 'Saving Record...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update Pregnancy Record' : 'Save Pregnancy Record'}
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
                    This record is for tracking purposes only. Always consult with your healthcare provider
                    for medical advice and emergency situations.
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

export default AddPregnancyRecord;