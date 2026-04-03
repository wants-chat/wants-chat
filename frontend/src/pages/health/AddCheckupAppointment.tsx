import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useCreatePaternalCheckupAppointment, useUpdatePaternalCheckupAppointment, usePaternalCheckupAppointmentById } from '../../hooks/useServices';
import type { PaternalCheckupAppointmentFormData } from '../../types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { 
  ChevronLeft,
  CalendarMonth as Calendar,
  AccessTime as Clock,
  Save,
  Warning as AlertCircle,
  Check,
  Person,
  LocationOn,
  Phone as PhoneIcon,
  Email,
  EventAvailable,
  PregnantWoman,
  MonitorHeart,
  Bloodtype,
  Psychology,
  Vaccines,
  ChildCare,
  MedicalServices,
  NotificationAdd,
  Cancel
} from '@mui/icons-material';
import { countryCodes } from '../../data/countryCodes';


const AddCheckupAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = editId === 'true'; // For now, using boolean edit mode
  const createAppointmentMutation = useCreatePaternalCheckupAppointment();
  const updateAppointmentMutation = useUpdatePaternalCheckupAppointment();
  // Note: For edit mode, we'll need to get the actual ID from localStorage for now
  const appointmentId = isEditMode ? JSON.parse(localStorage.getItem('editingAppointment') || '{}').id : null;
  const { data: existingAppointment, loading: appointmentLoading, error: appointmentError } = usePaternalCheckupAppointmentById(appointmentId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<PaternalCheckupAppointmentFormData>({
    title: '',
    type: 'prenatal',
    doctor: '',
    location: '',
    date: '',
    time: '',
    week: '',
    phone: '',
    email: '',
    notes: '',
    reminder: true,
    reminderTime: '1-day'
  });

  const [errors, setErrors] = useState<Partial<PaternalCheckupAppointmentFormData>>({});

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.code.includes(countrySearchTerm)
  );

  const selectedCountry = countryCodes.find(country => country.code === countryCode);

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

  // Pre-populate form when editing existing appointment
  useEffect(() => {
    if (isEditMode && existingAppointment) {
      // Parse phone number to extract country code and number
      let extractedCountryCode = '+1';
      let extractedPhoneNumber = '';
      
      if (existingAppointment.phone) {
        const phoneMatch = existingAppointment.phone.match(/^(\+\d{1,3})\s*(.+)$/);
        if (phoneMatch) {
          extractedCountryCode = phoneMatch[1];
          extractedPhoneNumber = phoneMatch[2];
        } else {
          extractedPhoneNumber = existingAppointment.phone;
        }
      }

      setCountryCode(extractedCountryCode);
      setPhoneNumber(extractedPhoneNumber);

      setFormData({
        title: existingAppointment.title || '',
        type: existingAppointment.type || 'prenatal',
        doctor: existingAppointment.doctor || '',
        location: existingAppointment.location || '',
        date: existingAppointment.date || '',
        time: existingAppointment.time || '',
        week: existingAppointment.week ? existingAppointment.week.toString() : '',
        phone: existingAppointment.phone || '',
        email: existingAppointment.email || '',
        notes: existingAppointment.notes || '',
        reminder: existingAppointment.reminder ?? true,
        reminderTime: existingAppointment.reminder_time || existingAppointment.reminderTime || '1-day'
      });
    }
  }, [isEditMode, existingAppointment]);

  const handleInputChange = (field: keyof PaternalCheckupAppointmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<PaternalCheckupAppointmentFormData> = {};
    
    // Required field validations
    if (!formData.title.trim()) {
      newErrors.title = 'Appointment title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.doctor.trim()) {
      newErrors.doctor = 'Doctor name is required';
    } else if (formData.doctor.length < 2) {
      newErrors.doctor = 'Doctor name must be at least 2 characters';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }
    
    if (!formData.date) {
      newErrors.date = 'Appointment date is required';
    } else {
      // Check if date is in the past
      const appointmentDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        newErrors.date = 'Appointment date cannot be in the past';
      }
      
      // Check if date is too far in the future (1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      if (appointmentDate > oneYearFromNow) {
        newErrors.date = 'Appointment date cannot be more than 1 year in the future';
      }
    }
    
    if (!formData.time.trim()) {
      newErrors.time = 'Appointment time is required';
    }
    
    // Validate week if provided
    if (formData.week && formData.week.trim()) {
      const weekNum = parseInt(formData.week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 42) {
        newErrors.week = 'Week must be between 1 and 42';
      }
    }
    
    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Validate phone format if provided
    if (phoneNumber && phoneNumber.trim()) {
      const phoneRegex = /^[\d\s\-\(\)\.]{7,15}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
      }
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
      const appointmentData: PaternalCheckupAppointmentFormData = {
        ...formData,
        phone: phoneNumber ? `${countryCode} ${phoneNumber}` : undefined
      };

      if (isEditMode && appointmentId) {
        await updateAppointmentMutation.mutate({ id: appointmentId, data: appointmentData });
      } else {
        await createAppointmentMutation.mutate(appointmentData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/schedule-checkup');
      }, 2000);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} paternal checkup appointment:`, error);
      setApiError(error?.message || `Failed to ${isEditMode ? 'update' : 'schedule'} appointment. Please try again.`);
    }
  };

  const handleCancel = () => {
    navigate('/health/schedule-checkup');
  };

  const appointmentTypes = [
    { value: 'prenatal', label: 'Prenatal Checkup', icon: <PregnantWoman className="h-4 w-4" /> },
    { value: 'ultrasound', label: 'Ultrasound', icon: <MonitorHeart className="h-4 w-4" /> },
    { value: 'blood-test', label: 'Blood Test', icon: <Bloodtype className="h-4 w-4" /> },
    { value: 'consultation', label: 'Consultation', icon: <Psychology className="h-4 w-4" /> },
    { value: 'vaccination', label: 'Vaccination', icon: <Vaccines className="h-4 w-4" /> },
    { value: 'postnatal', label: 'Postnatal Care', icon: <ChildCare className="h-4 w-4" /> }
  ];

  const reminderOptions = [
    { value: '1-hour', label: '1 hour before' },
    { value: '2-hours', label: '2 hours before' },
    { value: '1-day', label: '1 day before' },
    { value: '2-days', label: '2 days before' },
    { value: '1-week', label: '1 week before' }
  ];

  // Generate time options in 30-minute intervals from 6:00 AM to 8:00 PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        times.push({ value: timeString, label: timeString });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prenatal': return 'rgb(71, 189, 255)';
      case 'ultrasound': return 'rgb(139, 92, 246)';
      case 'blood-test': return 'rgb(239, 68, 68)';
      case 'consultation': return 'rgb(34, 197, 94)';
      case 'vaccination': return 'rgb(251, 146, 60)';
      case 'postnatal': return 'rgb(236, 72, 153)';
      default: return 'rgb(107, 114, 128)';
    }
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Mother Care', href: '/health/mother-care' },
    { label: 'Add Appointment', icon: EventAvailable }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state for edit mode */}
        {isEditMode && appointmentLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading appointment data...</p>
            </div>
          </div>
        )}

        {/* Error state for edit mode */}
        {isEditMode && appointmentError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Error Loading Appointment</h4>
                <p className="text-sm text-red-700 dark:text-red-200">
                  {String(appointmentError) || 'Failed to load appointment data. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">Success!</h4>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Appointment has been {isEditMode ? 'updated' : 'scheduled'} successfully. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-200">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Only show form if not loading in edit mode */}
        {(!isEditMode || !appointmentLoading) && !appointmentError && (
          <>
            {/* Basic Appointment Information */}
            <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
              <EventAvailable className="h-6 w-6 text-primary" />
              Appointment Details
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Fill in the appointment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Appointment Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., 20-Week Ultrasound"
                    className={`h-12 rounded-xl ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Appointment Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                    <SelectTrigger id="type" className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div style={{ color: getTypeColor(type.value) }}>
                              {type.icon}
                            </div>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="week" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Pregnancy Week
                  </Label>
                  <Input
                    id="week"
                    type="number"
                    min="1"
                    max="42"
                    value={formData.week}
                    onChange={(e) => handleInputChange('week', e.target.value)}
                    placeholder="Enter week (1-42)"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-primary" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className={`pl-12 h-12 rounded-xl ${errors.date ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Time *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-primary z-10" />
                      <Select value={formData.time} onValueChange={(value: any) => handleInputChange('time', value)}>
                        <SelectTrigger id="time" className={`pl-12 h-12 rounded-xl ${errors.time ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {timeOptions.map(time => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Doctor Name *
                  </Label>
                  <div className="relative">
                    <Person className="absolute left-3 top-3 h-5 w-5 text-primary" />
                    <Input
                      id="doctor"
                      value={formData.doctor}
                      onChange={(e) => handleInputChange('doctor', e.target.value)}
                      placeholder="Dr. Sarah Johnson"
                      className={`pl-12 h-12 rounded-xl ${errors.doctor ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.doctor && <p className="text-sm text-red-500">{errors.doctor}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Location *
                  </Label>
                  <div className="relative">
                    <LocationOn className="absolute left-3 top-3 h-5 w-5 text-primary" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City Medical Center, Room 203"
                      className={`pl-12 h-12 rounded-xl ${errors.location ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/10 border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
              <PhoneIcon className="h-6 w-6 text-blue-500" />
              Contact Information
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Optional contact details for the appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contact Phone
                </Label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative w-32" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full px-3 py-3 text-left border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedCountry?.flag}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedCountry?.code}</span>
                      </div>
                    </button>
                    
                    {countryDropdownOpen && (
                      <div className="absolute z-50 w-80 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <Input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="w-full text-sm h-10 rounded-lg"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.iso}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.code);
                                setCountryDropdownOpen(false);
                                setCountrySearchTerm('');
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="text-sm text-gray-900 dark:text-gray-100">{country.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{country.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className="flex-1 relative">
                    <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className={`pl-12 h-12 rounded-xl ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contact Email
                </Label>
                <div className="relative">
                  <Email className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="appointments@clinic.com"
                    className={`pl-12 h-12 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Reminders */}
        <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/10 border-l-4 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
              <MedicalServices className="h-6 w-6 text-purple-500" />
              Additional Information
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Notes and reminder preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions, preparation required, or things to remember..."
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <NotificationAdd className="h-5 w-5 text-purple-500" />
                  <div>
                    <Label htmlFor="reminder" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Enable Appointment Reminders
                    </Label>
                    <p className="text-xs text-gray-500">Get notified before your appointment</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.reminder}
                  onChange={(e) => handleInputChange('reminder', e.target.checked)}
                  className="h-5 w-5 rounded text-primary focus:ring-primary"
                />
              </div>

              {formData.reminder && (
                <div className="space-y-2 pl-4">
                  <Label htmlFor="reminderTime" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Remind me
                  </Label>
                  <Select value={formData.reminderTime} onValueChange={(value: any) => handleInputChange('reminderTime', value)}>
                    <SelectTrigger id="reminderTime" className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 sticky bottom-0 bg-gray-50 dark:bg-gray-900 py-6 px-6 -mx-4 border-t border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm">
          <Button
            variant="outline"
            size="lg"
            onClick={handleCancel}
            className="rounded-2xl flex-1 md:flex-none md:w-48 h-14 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Cancel className="h-5 w-5 mr-2" />
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={createAppointmentMutation.loading || updateAppointmentMutation.loading || (isEditMode && appointmentLoading)}
            className="rounded-2xl flex-1 md:flex-none md:w-48 h-14 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-white border-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgb(71, 189, 255)' }}
          >
            {(createAppointmentMutation.loading || updateAppointmentMutation.loading) ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-white font-bold text-sm truncate">
                  {isEditMode ? 'Updating...' : 'Scheduling...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="h-4 w-4 flex-shrink-0" />
                <span className="text-white font-bold text-sm truncate">
                  {isEditMode ? 'Update Appointment' : 'Schedule Appointment'}
                </span>
              </div>
            )}
          </Button>
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AddCheckupAppointment;