// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateAppointment, useUpdateAppointment, useAppointment } from '../../hooks/useServices';
import type { AppointmentFormData, AppointmentType } from '../../types/health/appointments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  ChevronLeft, 
  CalendarToday as Calendar, 
  Person as User, 
  LocationOn as MapPin, 
  MedicalServices as Stethoscope, 
  Save, 
  Warning as AlertCircle, 
  Check,
  EventNote as AppointmentIcon,
  LocalHospital as HospitalIcon,
  Info as InfoIcon,
  ContactPhone as ContactIcon
} from '@mui/icons-material';
import { countryCodes } from '../../data/countryCodes';

interface DoctorVisitForm {
  doctorName: string;
  specialty: string;
  visitDate: string;
  visitTime: string;
  visitType: string;
  location: string;
  locationAddress: string;
  countryCode: string;
  phoneNumber: string;
  reason: string;
  symptoms: string;
  duration: string;
  referredBy: string;
  insuranceProvider: string;
  notes: string;
}

const ScheduleDoctorVisit: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const { isAuthenticated } = useAuth();
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const { data: existingAppointment, loading: appointmentLoading, error: appointmentError } = useAppointment(editId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<DoctorVisitForm>({
    doctorName: '',
    specialty: '',
    visitDate: '',
    visitTime: '',
    visitType: 'routine',
    location: '',
    locationAddress: '',
    countryCode: '+1',
    phoneNumber: '',
    reason: '',
    symptoms: '',
    duration: '30',
    referredBy: '',
    insuranceProvider: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<DoctorVisitForm>>({});
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.code.includes(countrySearchTerm)
  );

  const selectedCountry = countryCodes.find(country => country.code === formData.countryCode);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
        setCountrySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Populate form when editing existing appointment
  useEffect(() => {
    if (isEditMode && existingAppointment && !appointmentLoading) {
      const appointmentDate = new Date(existingAppointment.appointment_date);
      const date = appointmentDate.toISOString().split('T')[0];
      const time = appointmentDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Extract phone parts if available
      let countryCode = '+1';
      let phoneNumber = '';
      if (existingAppointment.metadata?.phone) {
        const phoneParts = existingAppointment.metadata.phone.split(' ');
        if (phoneParts.length >= 2) {
          countryCode = phoneParts[0];
          phoneNumber = phoneParts.slice(1).join(' ');
        }
      }

      // Reverse map visit type from API to form values
      const apiToFormTypeMap: { [key: string]: string } = {
        'routine_checkup': 'routine',
        'follow_up': 'follow-up',
        'consultation': 'consultation',
        'emergency': 'emergency',
        'specialist': 'specialist',
        'diagnostic': 'diagnostic',
        'preventive': 'preventive',
        'dental': 'dental',
        'vision': 'vision',
        'mental_health': 'mental_health',
        'physical_therapy': 'physical_therapy',
        'lab_work': 'lab_work'
      };

      setFormData({
        doctorName: existingAppointment.provider_name || '',
        specialty: existingAppointment.provider_specialty || '',
        visitDate: date,
        visitTime: time,
        visitType: apiToFormTypeMap[existingAppointment.appointment_type] || existingAppointment.appointment_type || 'consultation',
        location: existingAppointment.location || '',
        locationAddress: existingAppointment.metadata?.address || '',
        countryCode,
        phoneNumber,
        reason: existingAppointment.reason || '',
        symptoms: existingAppointment.metadata?.symptoms || '',
        duration: existingAppointment.duration_minutes?.toString() || '30',
        referredBy: existingAppointment.metadata?.referred_by || '',
        insuranceProvider: existingAppointment.metadata?.insurance_provider || '',
        notes: existingAppointment.notes || ''
      });
    }
  }, [isEditMode, existingAppointment, appointmentLoading]);

  const handleInputChange = (field: keyof DoctorVisitForm, value: string) => {
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
    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<DoctorVisitForm> = {};
    
    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }
    
    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }
    
    if (!formData.visitTime) {
      newErrors.visitTime = 'Visit time is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      setApiError('Please login to schedule an appointment');
      navigate('/login');
      return;
    }

    try {
      setApiError(null);
      
      // Map visit type to backend expected values
      const visitTypeMap: { [key: string]: string } = {
        'routine': 'routine_checkup',
        'follow-up': 'follow_up',
        'consultation': 'consultation',
        'emergency': 'emergency',
        'specialist': 'specialist',
        'diagnostic': 'diagnostic',
        'preventive': 'preventive',
        'dental': 'dental',
        'vision': 'vision',
        'mental_health': 'mental_health',
        'physical_therapy': 'physical_therapy',
        'lab_work': 'lab_work'
      };

      // Convert time from 12-hour format to 24-hour format
      const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        let hoursNum = parseInt(hours);
        
        if (modifier === 'PM' && hoursNum !== 12) {
          hoursNum += 12;
        }
        if (modifier === 'AM' && hoursNum === 12) {
          hoursNum = 0;
        }
        
        return `${hoursNum.toString().padStart(2, '0')}:${minutes}:00`;
      };

      // Create proper ISO date string
      const time24h = formData.visitTime ? convertTo24Hour(formData.visitTime) : '09:00:00';
      const appointmentDateTime = new Date(`${formData.visitDate}T${time24h}`);
      
      // Map the form data to API format
      const appointmentData = {
        appointment_type: visitTypeMap[formData.visitType] || 'consultation',
        provider_name: formData.doctorName,
        provider_specialty: formData.specialty || undefined,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: parseInt(formData.duration) || 30,
        location: formData.location || formData.locationAddress,
        reason: formData.reason,
        notes: formData.notes || undefined,
        status: 'scheduled',
        reminder_minutes: 1440, // 24 hours in minutes
        metadata: {
          phone: formData.phoneNumber ? `${formData.countryCode} ${formData.phoneNumber}` : undefined,
          symptoms: formData.symptoms || undefined,
          insurance_provider: formData.insuranceProvider || undefined,
          referred_by: formData.referredBy || undefined
        }
      };

      console.log(`${isEditMode ? 'Updating' : 'Creating'} appointment:`, appointmentData);
      
      if (isEditMode && editId) {
        // Convert appointment data back to form format for update
        const formUpdateData: Partial<AppointmentFormData> = {
          doctorName: formData.doctorName,
          hospitalClinic: formData.location,
          appointmentDate: `${formData.visitDate}T${time24h}`,
          appointmentTime: formData.visitTime,
          appointmentType: (visitTypeMap[formData.visitType] || 'consultation') as AppointmentType,
          reasonForVisit: formData.reason,
          phoneNumber: formData.phoneNumber ? `${formData.countryCode} ${formData.phoneNumber}` : undefined,
          notes: formData.notes || undefined
        };
        await updateAppointmentMutation.mutate({ id: editId, data: formUpdateData });
      } else {
        // Convert form data to AppointmentFormData format for creation
        const formCreateData: AppointmentFormData = {
          doctorName: formData.doctorName,
          hospitalClinic: formData.location,
          appointmentDate: `${formData.visitDate}T${time24h}`,
          appointmentTime: formData.visitTime,
          appointmentType: (visitTypeMap[formData.visitType] || 'consultation') as AppointmentType,
          reasonForVisit: formData.reason,
          phoneNumber: formData.phoneNumber ? `${formData.countryCode} ${formData.phoneNumber}` : undefined,
          reminderSet: true,
          notes: formData.notes || undefined
        };
        await createAppointmentMutation.mutate(formCreateData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/medical-records?tab=visits');
      }, 2000);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} appointment:`, error);
      setApiError(error?.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'schedule'} appointment. Please try again.`);
    }
  };

  const handleCancel = () => {
    navigate('/health/medical-records?tab=visits');
  };

  const specialties = [
    'Primary Care Physician',
    'Cardiologist',
    'Dermatologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Neurologist',
    'Oncologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'Psychiatrist',
    'Pulmonologist',
    'Rheumatologist',
    'Urologist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Dentist',
    'Other'
  ];

  const visitTypes = [
    { value: 'routine', label: 'Routine Check-up' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'emergency', label: 'Emergency Visit' },
    { value: 'specialist', label: 'Specialist Referral' },
    { value: 'diagnostic', label: 'Diagnostic Test' },
    { value: 'preventive', label: 'Preventive Care' },
    { value: 'dental', label: 'Dental' },
    { value: 'vision', label: 'Vision/Eye Exam' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'physical_therapy', label: 'Physical Therapy' },
    { value: 'lab_work', label: 'Lab Work' }
  ];

  const timeSlots = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Schedule Doctor Visit', icon: Stethoscope }
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h1>
          <p className="text-lg text-white/60">
            {isEditMode
              ? 'Update your existing appointment details and reschedule if needed'
              : 'Book an appointment with your healthcare provider for comprehensive medical care'
            }
          </p>
        </div>

        {/* Loading state for appointment data */}
        {isEditMode && appointmentLoading && (
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span className="text-blue-200">Loading appointment details...</span>
            </div>
          </div>
        )}

        {/* Error state for appointment data */}
        {isEditMode && appointmentError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-100">Error Loading Appointment</h4>
                <p className="text-sm text-red-200">
                  Unable to load appointment details. Please try again or contact support.
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
                  {isEditMode
                    ? 'Appointment has been updated successfully. Redirecting...'
                    : 'Doctor visit has been scheduled successfully. Redirecting...'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content - Only show when not loading appointment data */}
        {(!isEditMode || !appointmentLoading) && (
          <>
        {/* Doctor Information */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-teal-400" />
              Doctor Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Enter details about your healthcare provider and clinic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="doctorName" className="text-sm font-semibold text-white/80">
                    Doctor Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => handleInputChange('doctorName', e.target.value)}
                      placeholder="Dr. Sarah Johnson"
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.doctorName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.doctorName && <p className="text-sm text-red-500 mt-1">{errors.doctorName}</p>}
                </div>

                <div>
                  <Label htmlFor="specialty" className="text-sm font-semibold text-white/80">
                    Medical Specialty
                  </Label>
                  <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                    <SelectTrigger id="specialty" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty} className="text-white hover:bg-white/10">{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="referredBy" className="text-sm font-semibold text-white/80">
                    Referred By
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="referredBy"
                      value={formData.referredBy}
                      onChange={(e) => handleInputChange('referredBy', e.target.value)}
                      placeholder="Dr. John Smith (optional)"
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="location" className="text-sm font-semibold text-white/80">
                    Clinic/Hospital Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <HospitalIcon className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Health First Medical Center"
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.location ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                </div>

                <div>
                  <Label htmlFor="locationAddress" className="text-sm font-semibold text-white/80">
                    Address
                  </Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                    <Input
                      id="locationAddress"
                      value={formData.locationAddress}
                      onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold text-white/80">
                    Contact Phone
                  </Label>
                  <div className="flex gap-3 mt-1">
                    {/* Country Code Dropdown */}
                    <div className="relative w-36" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="w-full h-12 px-4 text-left border border-white/20 rounded-xl bg-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{selectedCountry?.flag}</span>
                          <span className="text-sm text-white">{selectedCountry?.code}</span>
                        </div>
                      </button>

                      {countryDropdownOpen && (
                        <div className="absolute z-50 w-80 mt-1 bg-teal-800/90 border border-teal-400/30 rounded-xl shadow-lg max-h-60 overflow-hidden">
                          <div className="p-3 border-b border-white/10">
                            <Input
                              type="text"
                              placeholder="Search country..."
                              value={countrySearchTerm}
                              onChange={(e) => setCountrySearchTerm(e.target.value)}
                              className="w-full text-sm h-10 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.iso}
                                type="button"
                                onClick={() => {
                                  handleInputChange('countryCode', country.code);
                                  setCountryDropdownOpen(false);
                                  setCountrySearchTerm('');
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3"
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-sm text-white">{country.name}</span>
                                <span className="text-sm text-white/50 ml-auto">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                      <ContactIcon className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="123-456-7890"
                        className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <AppointmentIcon className="h-5 w-5 text-teal-400" />
              Appointment Details
            </CardTitle>
            <CardDescription className="text-white/60">
              Schedule your visit date, time, and specify the type of appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visitDate" className="text-sm font-semibold text-white/80">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
                      <Input
                        id="visitDate"
                        type="date"
                        value={formData.visitDate}
                        onChange={(e) => handleInputChange('visitDate', e.target.value)}
                        min={minDate}
                        className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.visitDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.visitDate && <p className="text-sm text-red-500 mt-1">{errors.visitDate}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="visitTime" className="text-sm font-semibold text-white/80">
                      Time <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.visitTime} onValueChange={(value) => handleInputChange('visitTime', value)}>
                      <SelectTrigger id="visitTime" className={`mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.visitTime ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time} className="text-white hover:bg-white/10">{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.visitTime && <p className="text-sm text-red-500 mt-1">{errors.visitTime}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="visitType" className="text-sm font-semibold text-white/80">
                    Visit Type
                  </Label>
                  <Select value={formData.visitType} onValueChange={(value) => handleInputChange('visitType', value)}>
                    <SelectTrigger id="visitType" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                      {visitTypes.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-semibold text-white/80">
                    Appointment Duration
                  </Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger id="duration" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                      <SelectItem value="15" className="text-white hover:bg-white/10">15 minutes</SelectItem>
                      <SelectItem value="30" className="text-white hover:bg-white/10">30 minutes</SelectItem>
                      <SelectItem value="45" className="text-white hover:bg-white/10">45 minutes</SelectItem>
                      <SelectItem value="60" className="text-white hover:bg-white/10">1 hour</SelectItem>
                      <SelectItem value="90" className="text-white hover:bg-white/10">1.5 hours</SelectItem>
                      <SelectItem value="120" className="text-white hover:bg-white/10">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="reason" className="text-sm font-semibold text-white/80">
                    Reason for Visit <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="e.g., Annual check-up, Follow-up for diabetes"
                    className={`mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.reason ? 'border-red-500' : ''}`}
                  />
                  {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason}</p>}
                </div>

                <div>
                  <Label htmlFor="symptoms" className="text-sm font-semibold text-white/80">
                    Current Symptoms
                  </Label>
                  <textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    placeholder="Describe any symptoms you're experiencing"
                    className="w-full min-h-[120px] px-4 py-3 border rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1 resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="insuranceProvider" className="text-sm font-semibold text-white/80">
                    Insurance Provider
                  </Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                    placeholder="e.g., Blue Cross Blue Shield"
                    className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-semibold text-white/80">
                Additional Notes
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements or questions for the doctor"
                className="w-full min-h-[120px] px-4 py-3 border rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1 resize-none"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-200">
                  Error
                </p>
                <p className="text-sm text-red-300 mt-1">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border-l-4 border-green-500 rounded-xl">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-200">
                  Success!
                </p>
                <p className="text-sm text-green-300 mt-1">
                  Your appointment has been scheduled successfully. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={createAppointmentMutation.loading || updateAppointmentMutation.loading}
            className="h-12 px-8 rounded-xl border-2 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createAppointmentMutation.loading || updateAppointmentMutation.loading}
            className="h-12 px-8 rounded-xl text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            {(createAppointmentMutation.loading || updateAppointmentMutation.loading) ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                {isEditMode ? 'Updating...' : 'Scheduling...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {isEditMode ? 'Update Appointment' : 'Schedule Appointment'}
              </>
            )}
          </Button>
        </div>

        {/* Important Note */}
        <Card className="rounded-2xl border-2 border-teal-500/30 bg-teal-500/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-500/20"
              >
                <InfoIcon className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Appointment Reminders</h4>
                <p className="text-sm text-white/70">
                  We'll send you reminders before your appointment. Make sure to arrive 15 minutes early
                  for registration and bring your insurance card and photo ID.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default ScheduleDoctorVisit;