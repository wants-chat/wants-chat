import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { useUpdateIndividualMedication } from '../../hooks/useServices';
import { healthService } from '../../services/healthService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Save,
  Warning as AlertCircle,
  Check,
  Medication as Pill,
  Info as InfoIcon
} from '@mui/icons-material';

interface MedicationForm {
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  instructions: string;
  reason: string;
  sideEffects: string;
}

interface PrescriptionInfo {
  id: string;
  prescribedBy: string;
  prescriptionDate: string;
  startDate: string;
  endDate: string;
  pharmacy: string;
}

const EditMedication: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const updateMedicationMutation = useUpdateIndividualMedication();
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const prescriptionId = searchParams.get('prescriptionId');
  const medicationIndex = searchParams.get('medicationIndex');
  const medicationId = searchParams.get('medicationId');

  const [prescriptionInfo, setPrescriptionInfo] = useState<PrescriptionInfo>({
    id: '',
    prescribedBy: '',
    prescriptionDate: '',
    startDate: '',
    endDate: '',
    pharmacy: ''
  });

  const [medicationData, setMedicationData] = useState<MedicationForm>({
    name: '',
    dosage: '',
    dosageUnit: 'mg',
    frequency: '',
    instructions: '',
    reason: '',
    sideEffects: ''
  });

  const [originalMedicationName, setOriginalMedicationName] = useState<string>('');
  const [errors, setErrors] = useState<Partial<MedicationForm>>({});

  // Load medication data on component mount
  useEffect(() => {
    console.log('EditMedication - prescriptionId:', prescriptionId);
    console.log('EditMedication - medicationIndex:', medicationIndex);
    
    // Validate required params - only check for prescriptionId since medicationIndex can be any value
    if (!prescriptionId) {
      console.log('Missing prescriptionId, redirecting to medications');
      navigate('/health/medications');
      return;
    }

    console.log('Loading medication data...');
    // Load medication data from localStorage or API
    loadMedicationData();
  }, [navigate, prescriptionId, medicationIndex, medicationId]);

  const loadMedicationData = async () => {
    if (!prescriptionId) {
      setApiError('Prescription ID is required');
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    try {
      // Fetch prescription data from API
      const prescription = await healthService.getPrescriptionById(prescriptionId);

      if (!prescription) {
        setApiError('Prescription not found');
        setIsLoadingData(false);
        return;
      }

      // Set prescription info
      setPrescriptionInfo({
        id: prescription.id || prescriptionId,
        prescribedBy: prescription.prescribedBy || prescription.prescribed_by || '',
        prescriptionDate: prescription.prescriptionDate || prescription.prescription_date || '',
        startDate: prescription.startDate || prescription.start_date || '',
        endDate: prescription.endDate || prescription.end_date || '',
        pharmacy: prescription.pharmacy || ''
      });

      // Find the medication to edit
      const medications = prescription.medications || [];
      let medicationToEdit: any = null;

      // Try to find by medicationId first
      if (medicationId) {
        medicationToEdit = medications.find((m: any) => m.id === medicationId);
      }

      // Fall back to medicationIndex
      if (!medicationToEdit && medicationIndex !== null) {
        const index = parseInt(medicationIndex, 10);
        if (!isNaN(index) && index >= 0 && index < medications.length) {
          medicationToEdit = medications[index];
        }
      }

      // If still not found, use first medication
      if (!medicationToEdit && medications.length > 0) {
        medicationToEdit = medications[0];
      }

      if (medicationToEdit) {
        const medicationName = medicationToEdit.name || medicationToEdit.medication_name || '';

        setMedicationData({
          name: medicationName,
          dosage: medicationToEdit.dosage || '',
          dosageUnit: medicationToEdit.dosageUnit || medicationToEdit.dosage_unit || 'mg',
          frequency: medicationToEdit.frequency || '',
          instructions: medicationToEdit.instructions || '',
          reason: medicationToEdit.reason || '',
          sideEffects: medicationToEdit.sideEffects || medicationToEdit.side_effects || ''
        });

        setOriginalMedicationName(medicationName);
      } else {
        setApiError('No medication found in the prescription');
      }
    } catch (error: any) {
      console.error('Error loading medication data:', error);
      setApiError(error.message || 'Failed to load medication data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof MedicationForm, value: string) => {
    setMedicationData(prev => ({
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
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicationForm> = {};
    
    if (!medicationData.name.trim()) {
      newErrors.name = 'Medication name is required';
    }
    
    if (!medicationData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    
    if (!medicationData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!prescriptionId || !originalMedicationName) {
      setApiError('Missing prescription ID or medication name');
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      await updateMedicationMutation.mutate({
        prescriptionId: prescriptionId,
        medicationName: originalMedicationName,
        medicationData: {
          name: medicationData.name,
          dosage: medicationData.dosage,
          dosageUnit: medicationData.dosageUnit,
          frequency: medicationData.frequency,
          instructions: medicationData.instructions,
          reason: medicationData.reason,
          sideEffects: medicationData.sideEffects
        }
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/medications');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error updating medication:', error);
      setApiError(error?.response?.data?.message || error.message || 'Failed to update medication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/health/medications');
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
    { label: 'Medications', href: '/health/medications' },
    { label: 'Edit Medication', icon: Pill }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoadingData && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading medication data...</p>
          </div>
        )}

        {/* Success Message */}
        {!isLoadingData && showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">
                Medication updated successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {!isLoadingData && apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          </div>
        )}

        {/* Prescription Context */}
        {!isLoadingData && prescriptionInfo.prescribedBy && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                Prescription Information
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Prescribed by {prescriptionInfo.prescribedBy}
                {prescriptionInfo.startDate && ` on ${new Date(prescriptionInfo.startDate).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoadingData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Information Card */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Medication Information
              </CardTitle>
              <CardDescription>
                Update the medication details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Medication Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={medicationData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Lisinopril, Metformin"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">
                    Dosage <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dosage"
                    value={medicationData.dosage}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    placeholder="10"
                    className={errors.dosage ? 'border-red-500' : ''}
                  />
                  {errors.dosage && (
                    <p className="text-red-500 text-xs mt-1">{errors.dosage}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageUnit">Unit</Label>
                  <Select
                    value={medicationData.dosageUnit}
                    onValueChange={(value) => handleInputChange('dosageUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">
                  Frequency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={medicationData.frequency}
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(freq => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-red-500 text-xs mt-1">{errors.frequency}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-primary" />
                Additional Information
              </CardTitle>
              <CardDescription>
                Optional details about the medication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={medicationData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Special instructions (e.g., Take with food)"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Medication</Label>
                <Input
                  id="reason"
                  value={medicationData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="e.g., High blood pressure, Diabetes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideEffects">Side Effects</Label>
                <Textarea
                  id="sideEffects"
                  value={medicationData.sideEffects}
                  onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                  placeholder="Known or potential side effects"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[120px]"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Medication
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </main>
    </div>
  );
};

export default EditMedication;