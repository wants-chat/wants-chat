import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useCreatePrescription, useUpdatePrescription } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  ChevronLeft, 
  Medication as Pill, 
  Person as User, 
  CalendarToday as Calendar, 
  Description as FileText, 
  Upload, 
  Save, 
  Warning as AlertCircle, 
  Check,
  Add as Plus, 
  Delete as Trash2, 
  Close as X,
  LocalPharmacy as PharmacyIcon,
  Assignment as PrescriptionIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface MedicationItem {
  id: string;
  medication: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  instructions: string;
  reason: string;
  sideEffects: string;
}

interface PrescriptionForm {
  prescribedBy: string;
  prescriptionDate: string;
  startDate: string;
  endDate: string;
  pharmacy: string;
  prescriptionNumber: string;
  notes: string;
}

const AddPrescription: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const { isAuthenticated } = useAuth();
  const createPrescriptionMutation = useCreatePrescription();
  const updatePrescriptionMutation = useUpdatePrescription();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [prescriptionData, setPrescriptionData] = useState<PrescriptionForm>({
    prescribedBy: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    pharmacy: '',
    prescriptionNumber: '',
    notes: ''
  });

  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: '1',
      medication: '',
      dosage: '',
      dosageUnit: 'mg',
      frequency: '',
      instructions: '',
      reason: '',
      sideEffects: ''
    }
  ]);

  const [errors, setErrors] = useState<{
    prescription: Partial<PrescriptionForm>;
    medications: { [key: string]: Partial<MedicationItem> };
  }>({
    prescription: {},
    medications: {}
  });

  // Load prescription data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const storedPrescription = localStorage.getItem('editingPrescription');
      if (storedPrescription) {
        try {
          const prescription = JSON.parse(storedPrescription);
          console.log('Loading prescription for edit:', prescription);
          
          // Set the prescription ID for updating
          setEditingPrescriptionId(prescription.id);
          
          // Map the API fields to form fields
          setPrescriptionData({
            prescribedBy: prescription.prescribed_by || prescription.prescribedBy || '',
            prescriptionDate: prescription.prescribed_date || prescription.prescriptionDate || new Date().toISOString().split('T')[0],
            startDate: prescription.start_date || prescription.startDate || '',
            endDate: prescription.end_date || prescription.endDate || '',
            pharmacy: prescription.pharmacy || '',
            prescriptionNumber: prescription.prescription_number || prescription.prescriptionNumber || '',
            notes: prescription.notes || ''
          });
          
          // Set medications
          if (prescription.medication_name || prescription.medication) {
            setMedications([{
              id: '1',
              medication: prescription.medication_name || prescription.medication || '',
              dosage: prescription.dosage ? prescription.dosage.split(' ')[0] : '',
              dosageUnit: prescription.dosage ? prescription.dosage.split(' ')[1] || 'mg' : 'mg',
              frequency: prescription.frequency || '',
              instructions: prescription.instructions || '',
              reason: prescription.reason || '',
              sideEffects: prescription.side_effects ? prescription.side_effects.join(', ') : ''
            }]);
          } else if (prescription.medications && Array.isArray(prescription.medications)) {
            // Handle multiple medications if they exist
            setMedications(prescription.medications.map((med: any, index: number) => ({
              id: (index + 1).toString(),
              medication: med.name || '',
              dosage: med.dosage || '',
              dosageUnit: med.dosageUnit || 'mg',
              frequency: med.frequency || '',
              instructions: med.instructions || '',
              reason: med.reason || '',
              sideEffects: med.sideEffects || ''
            })));
          }
          
          // Clear localStorage after loading
          localStorage.removeItem('editingPrescription');
        } catch (error) {
          console.error('Error loading prescription for edit:', error);
        }
      }
    }
  }, [isEditMode]);

  const handlePrescriptionChange = (field: keyof PrescriptionForm, value: string) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors.prescription[field]) {
      setErrors(prev => ({
        ...prev,
        prescription: {
          ...prev.prescription,
          [field]: ''
        }
      }));
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
  };

  const handleMedicationChange = (id: string, field: keyof MedicationItem, value: string) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
    // Clear error for this medication field
    if (errors.medications[id]?.[field]) {
      setErrors(prev => ({
        ...prev,
        medications: {
          ...prev.medications,
          [id]: {
            ...prev.medications[id],
            [field]: ''
          }
        }
      }));
    }
  };

  const addMedication = () => {
    const newMedication: MedicationItem = {
      id: Date.now().toString(),
      medication: '',
      dosage: '',
      dosageUnit: 'mg',
      frequency: '',
      instructions: '',
      reason: '',
      sideEffects: ''
    };
    setMedications(prev => [...prev, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter(med => med.id !== id));
      // Remove errors for this medication
      setErrors(prev => {
        const newMedErrors = { ...prev.medications };
        delete newMedErrors[id];
        return {
          ...prev,
          medications: newMedErrors
        };
      });
    }
  };

  const validateForm = () => {
    const prescriptionErrors: Partial<PrescriptionForm> = {};
    const medicationErrors: { [key: string]: Partial<MedicationItem> } = {};
    
    // Validate prescription data
    if (!prescriptionData.prescribedBy.trim()) {
      prescriptionErrors.prescribedBy = 'Prescriber name is required';
    }
    
    if (!prescriptionData.startDate) {
      prescriptionErrors.startDate = 'Start date is required';
    }
    
    // Validate each medication
    let hasValidMedication = false;
    medications.forEach(med => {
      const medErrors: Partial<MedicationItem> = {};
      
      if (!med.medication.trim()) {
        medErrors.medication = 'Medication name is required';
      } else {
        hasValidMedication = true;
      }
      
      if (med.medication.trim() && !med.dosage.trim()) {
        medErrors.dosage = 'Dosage is required';
      }
      
      if (med.medication.trim() && !med.frequency.trim()) {
        medErrors.frequency = 'Frequency is required';
      }
      
      if (Object.keys(medErrors).length > 0) {
        medicationErrors[med.id] = medErrors;
      }
    });
    
    if (!hasValidMedication) {
      medicationErrors[medications[0].id] = {
        ...medicationErrors[medications[0].id],
        medication: 'At least one medication is required'
      };
    }
    
    setErrors({
      prescription: prescriptionErrors,
      medications: medicationErrors
    });
    
    return Object.keys(prescriptionErrors).length === 0 && 
           Object.keys(medicationErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      setApiError('Please login to add a prescription');
      navigate('/login');
      return;
    }

    try {
      setApiError(null);
      
      // Filter out empty medications
      const validMedications = medications.filter(
        med => med.medication && med.dosage && med.frequency
      );

      if (validMedications.length === 0) {
        setApiError('At least one medication is required');
        return;
      }
      
      if (isEditMode && editingPrescriptionId) {
        // Update existing prescription with all fields and medications
        const updatePayload = {
          prescribedBy: prescriptionData.prescribedBy,
          prescriptionDate: prescriptionData.prescriptionDate,
          prescriptionNumber: prescriptionData.prescriptionNumber,
          startDate: prescriptionData.startDate,
          endDate: prescriptionData.endDate || undefined,
          pharmacy: prescriptionData.pharmacy,
          notes: prescriptionData.notes,
          medications: validMedications.map(med => ({
            name: med.medication,
            dosage: med.dosage,
            dosageUnit: med.dosageUnit,
            frequency: med.frequency,
            instructions: med.instructions,
            reason: med.reason,
            sideEffects: med.sideEffects || ''
          })),
          status: 'active' as const
        };
        
        console.log('Updating prescription:', editingPrescriptionId, updatePayload);
        await updatePrescriptionMutation.mutate({ 
          id: editingPrescriptionId, 
          data: updatePayload 
        });
        
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/health/medications');
        }, 2000);
      } else {
        // Create new prescription with all medications in a single request
        const prescriptionPayload = {
          prescribedBy: prescriptionData.prescribedBy,
          prescriptionDate: prescriptionData.prescriptionDate,
          prescriptionNumber: prescriptionData.prescriptionNumber,
          startDate: prescriptionData.startDate,
          endDate: prescriptionData.endDate || undefined,
          pharmacy: prescriptionData.pharmacy,
          notes: prescriptionData.notes,
          // Send all medications in a single array
          medications: validMedications.map(med => ({
            name: med.medication,
            dosage: med.dosage,
            dosageUnit: med.dosageUnit,
            frequency: med.frequency,
            instructions: med.instructions,
            reason: med.reason,
            sideEffects: med.sideEffects || ''
          })),
          isActive: true,
          status: 'active' as const
        };
        
        console.log('Submitting prescription with all medications:', prescriptionPayload);
        await createPrescriptionMutation.mutate(prescriptionPayload);
        
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/health/medications');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      setApiError(error?.response?.data?.message || error.message || 'Failed to create prescription. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/health/medical-records');
  };

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Once weekly',
    'Twice weekly',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  const dosageUnits = ['mg', 'mcg', 'g', 'mL', 'units', 'tablets', 'capsules', 'drops', 'puffs'];

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: isEditMode ? 'Edit Prescription' : 'Add Prescription', icon: Pill }
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
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? 'Edit Prescription' : 'Add New Prescription'}
          </h1>
          <p className="text-lg text-white/60">
            Record prescription details and medications for comprehensive health tracking
          </p>
        </div>

        {apiError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-100">Error</h4>
                <p className="text-sm text-red-200">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <div>
                <h4 className="text-sm font-semibold text-green-100">Success!</h4>
                <p className="text-sm text-green-200">
                  Prescription has been added successfully. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prescription Information */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <PrescriptionIcon className="h-5 w-5 text-teal-400" />
              Prescription Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Enter the prescription details and upload a photo if available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-teal-500/20">
                  <Upload className="h-8 w-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Upload Prescription Photo
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  Upload a photo of your prescription (optional)
                </p>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="prescription-upload"
                />
                <Label htmlFor="prescription-upload" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                    Choose File
                  </div>
                </Label>
                {uploadedFile && (
                  <div className="mt-4 flex items-center justify-center gap-3 p-3 bg-teal-500/10 rounded-xl">
                    <FileText className="h-5 w-5 text-teal-400" />
                    <span className="text-sm font-medium text-white">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedFile(null)}
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prescribedBy" className="text-sm font-semibold text-white/80">
                    Prescribed By <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="prescribedBy"
                      value={prescriptionData.prescribedBy}
                      onChange={(e) => handlePrescriptionChange('prescribedBy', e.target.value)}
                      placeholder="Dr. John Smith"
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.prescription.prescribedBy ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.prescription.prescribedBy && (
                    <p className="text-sm text-red-500 mt-1">{errors.prescription.prescribedBy}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prescriptionNumber" className="text-sm font-semibold text-white/80">
                    Prescription Number
                  </Label>
                  <div className="relative mt-1">
                    <PrescriptionIcon className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="prescriptionNumber"
                      value={prescriptionData.prescriptionNumber}
                      onChange={(e) => handlePrescriptionChange('prescriptionNumber', e.target.value)}
                      placeholder="RX-123456"
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prescriptionDate" className="text-sm font-semibold text-white/80">
                    Prescription Date
                  </Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="prescriptionDate"
                      type="date"
                      value={prescriptionData.prescriptionDate}
                      onChange={(e) => handlePrescriptionChange('prescriptionDate', e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-semibold text-white/80">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                      <Input
                        id="startDate"
                        type="date"
                        value={prescriptionData.startDate}
                        onChange={(e) => handlePrescriptionChange('startDate', e.target.value)}
                        className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.prescription.startDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.prescription.startDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.prescription.startDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate" className="text-sm font-semibold text-white/80">
                      End Date
                    </Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                      <Input
                        id="endDate"
                        type="date"
                        value={prescriptionData.endDate}
                        onChange={(e) => handlePrescriptionChange('endDate', e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                        min={prescriptionData.startDate}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pharmacy" className="text-sm font-semibold text-white/80">
                    Pharmacy
                  </Label>
                  <div className="relative mt-1">
                    <PharmacyIcon className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="pharmacy"
                      value={prescriptionData.pharmacy}
                      onChange={(e) => handlePrescriptionChange('pharmacy', e.target.value)}
                      placeholder="e.g., CVS Pharmacy - Main Street"
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-white/80">
                    Additional Notes
                  </Label>
                  <textarea
                    id="notes"
                    value={prescriptionData.notes}
                    onChange={(e) => handlePrescriptionChange('notes', e.target.value)}
                    placeholder="Any additional notes about this prescription"
                    className="w-full min-h-[120px] px-4 py-3 border rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medications Section */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Pill className="h-5 w-5 text-teal-400" />
                  Medications
                </CardTitle>
                <CardDescription className="text-white/60">
                  Add all medications included in this prescription
                </CardDescription>
              </div>
              <Button
                onClick={addMedication}
                className="h-12 px-6 rounded-xl text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Medication
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {medications.map((medication, index) => (
              <Card key={medication.id} className="border-2 border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/20">
                        <Pill className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Medication {index + 1}
                        </h4>
                        <p className="text-sm text-white/60">
                          Enter medication details below
                        </p>
                      </div>
                    </div>
                    {medications.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeMedication(medication.id)}
                        className="h-10 w-10 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 bg-transparent hover:bg-red-500/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Label htmlFor={`medication-${medication.id}`} className="text-sm font-semibold text-white/80">
                        Medication Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`medication-${medication.id}`}
                        value={medication.medication}
                        onChange={(e) => handleMedicationChange(medication.id, 'medication', e.target.value)}
                        placeholder="e.g., Lisinopril"
                        className={`mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.medications[medication.id]?.medication ? 'border-red-500' : ''}`}
                      />
                      {errors.medications[medication.id]?.medication && (
                        <p className="text-sm text-red-500 mt-1">{errors.medications[medication.id].medication}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`frequency-${medication.id}`} className="text-sm font-semibold text-white/80">
                        Frequency <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={medication.frequency}
                        onValueChange={(value) => handleMedicationChange(medication.id, 'frequency', value)}
                      >
                        <SelectTrigger
                          id={`frequency-${medication.id}`}
                          className={`mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.medications[medication.id]?.frequency ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                          {frequencyOptions.map(option => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-white/10">{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.medications[medication.id]?.frequency && (
                        <p className="text-sm text-red-500 mt-1">{errors.medications[medication.id].frequency}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`dosage-${medication.id}`} className="text-sm font-semibold text-white/80">
                          Dosage <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`dosage-${medication.id}`}
                          type="number"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(medication.id, 'dosage', e.target.value)}
                          placeholder="10"
                          className={`mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.medications[medication.id]?.dosage ? 'border-red-500' : ''}`}
                        />
                        {errors.medications[medication.id]?.dosage && (
                          <p className="text-sm text-red-500 mt-1">{errors.medications[medication.id].dosage}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor={`dosageUnit-${medication.id}`} className="text-sm font-semibold text-white/80">
                          Unit
                        </Label>
                        <Select
                          value={medication.dosageUnit}
                          onValueChange={(value) => handleMedicationChange(medication.id, 'dosageUnit', value)}
                        >
                          <SelectTrigger id={`dosageUnit-${medication.id}`} className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                            {dosageUnits.map(unit => (
                              <SelectItem key={unit} value={unit} className="text-white hover:bg-white/10">{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`reason-${medication.id}`} className="text-sm font-semibold text-white/80">
                        Reason for Medication
                      </Label>
                      <Input
                        id={`reason-${medication.id}`}
                        value={medication.reason}
                        onChange={(e) => handleMedicationChange(medication.id, 'reason', e.target.value)}
                        placeholder="e.g., High blood pressure"
                        className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`instructions-${medication.id}`} className="text-sm font-semibold text-white/80">
                        Special Instructions
                      </Label>
                      <Input
                        id={`instructions-${medication.id}`}
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(medication.id, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food"
                        className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`sideEffects-${medication.id}`} className="text-sm font-semibold text-white/80">
                        Known Side Effects
                      </Label>
                      <Input
                        id={`sideEffects-${medication.id}`}
                        value={medication.sideEffects}
                        onChange={(e) => handleMedicationChange(medication.id, 'sideEffects', e.target.value)}
                        placeholder="e.g., Dizziness, dry cough"
                        className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-12 px-8 rounded-xl border-2 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="h-12 px-8 rounded-xl text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            disabled={createPrescriptionMutation.loading}
          >
            {createPrescriptionMutation.loading ? (
              <>
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {isEditMode ? 'Update Prescription' : 'Save Prescription'}
              </>
            )}
          </Button>
        </div>

        {/* Important Note */}
        <Card className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/20">
                <InfoIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Important Note</h4>
                <p className="text-sm text-white/70">
                  Always consult with your healthcare provider before making changes to your medications.
                  This app is for tracking purposes only and does not replace professional medical advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddPrescription;