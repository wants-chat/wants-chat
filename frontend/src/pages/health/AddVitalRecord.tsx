// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../../components/ui/sonner';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useCreateVitalRecord } from '../../hooks/useServices';
import {
  ChevronLeft,
  FavoriteBorder as HeartIcon,
  Timeline as ActivityIcon,
  Thermostat,
  MonitorHeart,
  Opacity,
  MonitorWeight as Scale,
  CalendarToday as Calendar,
  Save,
  Warning as AlertCircle,
  Check,
  TrendingUp,
  TrendingDown,
  Bloodtype,
  Science,
  HealthAndSafety
} from '@mui/icons-material';
import VitalSectionSelector from '../../components/health/vital-records/VitalSectionSelector';
import BloodPressureSection from '../../components/health/vital-records/BloodPressureSection';
import HeartRateSection from '../../components/health/vital-records/HeartRateSection';
import TemperatureSection from '../../components/health/vital-records/TemperatureSection';
import BloodSugarSection from '../../components/health/vital-records/BloodSugarSection';
import WeightBMISection from '../../components/health/vital-records/WeightBMISection';
import RespiratorySection from '../../components/health/vital-records/RespiratorySection';
import CholesterolSection from '../../components/health/vital-records/CholesterolSection';
import AdditionalInfoSection from '../../components/health/vital-records/AdditionalInfoSection';

interface VitalSignForm {
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

const AddVitalRecord: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');
  const createVitalRecordMutation = useCreateVitalRecord();

  // Set active section from URL parameter
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);
  
  const [formData, setFormData] = useState<VitalSignForm>({
    recordDate: new Date().toISOString().split('T')[0],
    recordTime: new Date().toTimeString().slice(0, 5),
    // Blood Pressure
    systolic: '',
    diastolic: '',
    bpPosition: 'sitting',
    bpArm: 'left',
    // Heart Rate
    heartRate: '',
    heartRhythm: 'regular',
    // Temperature
    temperature: '',
    temperatureUnit: 'fahrenheit',
    temperatureLocation: 'oral',
    // Blood Sugar
    bloodSugar: '',
    bloodSugarType: 'fasting',
    bloodSugarUnit: 'mg/dL',
    // Weight & BMI
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    bmi: '',
    // Respiratory
    respiratoryRate: '',
    oxygenSaturation: '',
    onOxygen: false,
    oxygenFlow: '',
    // Cholesterol
    totalCholesterol: '',
    ldlCholesterol: '',
    hdlCholesterol: '',
    triglycerides: '',
    // Additional
    painLevel: '',
    location: 'home',
    recordedBy: 'self',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const vitalSections = [
    { id: 'all', label: 'All Vitals', icon: HealthAndSafety },
    { id: 'bp', label: 'Blood Pressure', icon: HeartIcon },
    { id: 'heart', label: 'Heart Rate', icon: ActivityIcon },
    { id: 'temp', label: 'Temperature', icon: Thermostat },
    { id: 'sugar', label: 'Blood Sugar', icon: Bloodtype },
    { id: 'weight', label: 'Weight & BMI', icon: Scale },
    { id: 'respiratory', label: 'Respiratory', icon: Opacity },
    { id: 'cholesterol', label: 'Cholesterol', icon: Science }
  ];

  const locations = [
    { value: 'home', label: 'Home' },
    { value: 'clinic', label: 'Doctor\'s Office/Clinic' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'work', label: 'Work' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: keyof VitalSignForm, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate BMI if weight and height are provided
      if ((field === 'weight' || field === 'height') && newData.weight && newData.height) {
        let weightInKg = parseFloat(newData.weight);
        let heightInM = parseFloat(newData.height);
        
        // Convert to kg if needed
        if (newData.weightUnit === 'lbs') {
          weightInKg = weightInKg * 0.453592;
        }
        
        // Convert to meters if needed
        if (newData.heightUnit === 'cm') {
          heightInM = heightInM / 100;
        } else if (newData.heightUnit === 'ft') {
          heightInM = heightInM * 0.3048;
        }
        
        const bmi = weightInKg / (heightInM * heightInM);
        newData.bmi = bmi.toFixed(1);
      }
      
      return newData;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // At least one vital sign should be recorded
    const hasAnyVital = 
      formData.systolic || formData.diastolic ||
      formData.heartRate ||
      formData.temperature ||
      formData.bloodSugar ||
      formData.weight ||
      formData.respiratoryRate ||
      formData.oxygenSaturation ||
      formData.totalCholesterol;
    
    if (!hasAnyVital) {
      newErrors.general = 'Please record at least one vital sign';
    }
    
    // Validate blood pressure (both values needed if one is entered)
    if (formData.systolic && !formData.diastolic) {
      newErrors.diastolic = 'Diastolic pressure is required when systolic is entered';
    }
    if (formData.diastolic && !formData.systolic) {
      newErrors.systolic = 'Systolic pressure is required when diastolic is entered';
    }
    
    // Validate oxygen flow rate if on oxygen
    if (formData.onOxygen && !formData.oxygenFlow) {
      newErrors.oxygenFlow = 'Oxygen flow rate is required when on oxygen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getNormalRange = (vital: string): { min: number, max: number, unit: string } | null => {
    switch (vital) {
      case 'systolic':
        return { min: 90, max: 120, unit: 'mmHg' };
      case 'diastolic':
        return { min: 60, max: 80, unit: 'mmHg' };
      case 'heartRate':
        return { min: 60, max: 100, unit: 'bpm' };
      case 'temperature':
        return formData.temperatureUnit === 'fahrenheit' 
          ? { min: 97.8, max: 99.1, unit: '°F' }
          : { min: 36.5, max: 37.3, unit: '°C' };
      case 'bloodSugar':
        return formData.bloodSugarType === 'fasting'
          ? { min: 70, max: 100, unit: 'mg/dL' }
          : { min: 80, max: 140, unit: 'mg/dL' };
      case 'oxygenSaturation':
        return { min: 95, max: 100, unit: '%' };
      case 'respiratoryRate':
        return { min: 12, max: 20, unit: 'breaths/min' };
      case 'bmi':
        return { min: 18.5, max: 24.9, unit: 'kg/m²' };
      default:
        return null;
    }
  };

  const getValueStatus = (field: string, value: string) => {
    if (!value) return null;
    const numValue = parseFloat(value);
    const range = getNormalRange(field);
    if (!range) return null;
    
    if (numValue < range.min) return 'low';
    if (numValue > range.max) return 'high';
    return 'normal';
  };

  const getStatusBadge = (field: string, value: string) => {
    const status = getValueStatus(field, value);
    if (!status) return null;
    
    switch (status) {
      case 'low':
        return (
          <Badge className="ml-2 text-blue-400 border border-blue-400/50 bg-blue-500/20">
            <TrendingDown className="h-3 w-3 mr-1" /> Low
          </Badge>
        );
      case 'high':
        return (
          <Badge className="ml-2 text-red-400 border border-red-400/50 bg-red-500/20">
            <TrendingUp className="h-3 w-3 mr-1" /> High
          </Badge>
        );
      case 'normal':
        return (
          <Badge className="ml-2 text-green-400 border border-green-400/50 bg-green-500/20">
            <Check className="h-3 w-3 mr-1" /> Normal
          </Badge>
        );
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await createVitalRecordMutation.mutate(formData);

        setShowSuccess(true);
        toast.success('Vital signs recorded successfully! 📊');
        setTimeout(() => {
          navigate('/health/medical-records?tab=vitals');
        }, 2000);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to save vital signs. Please try again.');
        console.error('Error saving vital signs:', error);
      }
    }
  };

  const handleCancel = () => {
    navigate('/health/medical-records');
  };

  const shouldShowSection = (sectionId: string) => {
    return activeSection === 'all' || activeSection === sectionId;
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Add Vital Record', icon: MonitorHeart }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Add Vital Signs
          </h1>
          <p className="text-lg text-white/60">
            Record your vital signs and health metrics for comprehensive tracking
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center backdrop-blur-xl">
            <Check className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-300">
              Vital signs recorded successfully! Redirecting...
            </span>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">
              {errors.general}
            </span>
          </div>
        )}

        {/* Section Selector */}
        <VitalSectionSelector
          sections={vitalSections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Date and Time */}
        <GlassCard hover={false} className="mt-8 mb-8 border-l-4 border-teal-500">
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <Calendar className="h-5 w-5 text-teal-400" />
              Recording Information
            </h3>
            <p className="text-sm text-white/60 mt-1">When and where were these measurements taken?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="recordDate" className="text-sm font-semibold text-white/80">Date</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) => handleInputChange('recordDate', e.target.value)}
                className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
            </div>
            <div>
              <Label htmlFor="recordTime" className="text-sm font-semibold text-white/80">Time</Label>
              <Input
                id="recordTime"
                type="time"
                value={formData.recordTime}
                onChange={(e) => handleInputChange('recordTime', e.target.value)}
                className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-sm font-semibold text-white/80">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange('location', value)}
              >
                <SelectTrigger id="location" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Blood Pressure */}
        {shouldShowSection('bp') && (
          <BloodPressureSection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Heart Rate */}
        {shouldShowSection('heart') && (
          <HeartRateSection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Temperature */}
        {shouldShowSection('temp') && (
          <TemperatureSection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Blood Sugar */}
        {shouldShowSection('sugar') && (
          <BloodSugarSection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Weight & BMI */}
        {shouldShowSection('weight') && (
          <WeightBMISection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Respiratory */}
        {shouldShowSection('respiratory') && (
          <RespiratorySection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Cholesterol */}
        {shouldShowSection('cholesterol') && (
          <CholesterolSection
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Additional Information */}
        <AdditionalInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          getStatusBadge={getStatusBadge}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button
            onClick={handleCancel}
            className="h-12 px-8 rounded-xl border-2 border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:border-white/40 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createVitalRecordMutation.loading}
            className="h-12 px-8 rounded-xl text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            {createVitalRecordMutation.loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Vital Signs
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AddVitalRecord;