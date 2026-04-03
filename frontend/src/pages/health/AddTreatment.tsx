import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, X, Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useCreateTreatment, useUpdateTreatment, useTreatment, useTreatmentForm } from '../../hooks/health';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Person,
  LocationOn,
  Category,
  Description,
  AccessTime,
  NotificationsActive,
  Flag,
  Save,
  Check,
  Close,
  Warning,
  MedicalServices,
  LocalHospital,
  Medication,
  Healing,
  Schedule,
  CalendarToday,
  MonitorHeart,
  Vaccines,
  Science,
  Psychology,
  DirectionsRun,
  AttachMoney,
  HealthAndSafety
} from '@mui/icons-material';

const AddTreatment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editTreatmentId = searchParams.get('edit');
  const isEditMode = !!editTreatmentId;

  const { isAuthenticated, user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentSideEffect, setCurrentSideEffect] = useState('');

  // Fetch existing treatment data if in edit mode
  const { treatment: existingTreatment, isLoading: loadingTreatment } = useTreatment(editTreatmentId || '');

  // Use the treatment form hook
  const {
    formData,
    errors,
    validateForm,
    updateField,
    addSideEffect,
    removeSideEffect,
    resetForm,
    setFormData
  } = useTreatmentForm();

  // Use the mutations
  const createTreatmentMutation = useCreateTreatment({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/treatment-schedule');
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Failed to create treatment:', error);
    }
  });

  const updateTreatmentMutation = useUpdateTreatment();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Populate form with existing treatment data in edit mode
  useEffect(() => {
    if (isEditMode && existingTreatment && !loadingTreatment) {
      setFormData({
        name: existingTreatment.name,
        type: existingTreatment.type,
        frequency: existingTreatment.frequency,
        startDate: existingTreatment.startDate,
        endDate: existingTreatment.endDate || '',
        doctor: existingTreatment.doctor,
        location: existingTreatment.location,
        duration: existingTreatment.duration || '',
        dosage: existingTreatment.dosage || '',
        instructions: existingTreatment.instructions || '',
        priority: existingTreatment.priority,
        reminder: existingTreatment.reminder,
        reminderTime: existingTreatment.reminderTime || '30',
        notes: existingTreatment.notes || '',
        sideEffects: existingTreatment.sideEffects || [],
        cost: existingTreatment.cost || '',
        insurance: existingTreatment.insurance || ''
      });
    }
  }, [isEditMode, existingTreatment, loadingTreatment, setFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const treatmentData = {
        name: formData.name,
        type: formData.type,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        doctor: formData.doctor,
        location: formData.location,
        duration: formData.duration || undefined,
        dosage: formData.dosage || undefined,
        instructions: formData.instructions || undefined,
        priority: formData.priority,
        reminder: formData.reminder,
        reminderTime: formData.reminderTime || undefined,
        notes: formData.notes || undefined,
        sideEffects: formData.sideEffects,
        cost: formData.cost || undefined,
        insurance: formData.insurance || undefined,
      };

      if (isEditMode && editTreatmentId) {
        updateTreatmentMutation.mutate({
          id: editTreatmentId,
          data: treatmentData
        });
      } else {
        createTreatmentMutation.mutate(treatmentData);
      }
    }
  };

  const handleCancel = () => {
    navigate('/health/treatment-schedule');
  };

  const handleAddSideEffect = () => {
    if (currentSideEffect && !formData.sideEffects.includes(currentSideEffect)) {
      addSideEffect(currentSideEffect);
      setCurrentSideEffect('');
    }
  };

  const handleRemoveSideEffect = (effect: string) => {
    removeSideEffect(effect);
  };

  // Show loading state while fetching treatment data in edit mode
  if (isEditMode && loadingTreatment) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundEffects />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading treatment data...</p>
        </div>
      </div>
    );
  }

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Medication className="h-5 w-5" />;
      case 'therapy': return <Healing className="h-5 w-5" />;
      case 'procedure': return <MedicalServices className="h-5 w-5" />;
      case 'test': return <Science className="h-5 w-5" />;
      case 'consultation': return <Person className="h-5 w-5" />;
      case 'surgery': return <LocalHospital className="h-5 w-5" />;
      case 'chemotherapy': return <Vaccines className="h-5 w-5" />;
      case 'dialysis': return <MonitorHeart className="h-5 w-5" />;
      case 'rehabilitation': return <DirectionsRun className="h-5 w-5" />;
      default: return <MedicalServices className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Serious Care', href: '/health/serious-care' },
    { label: isEditMode ? 'Edit Treatment' : 'Add Treatment', icon: MedicalServices }
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
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-400">
                {isEditMode ? 'Treatment updated successfully!' : 'Treatment added successfully!'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Treatment Information Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <MedicalServices className="h-5 w-5 text-teal-400" />
                Treatment Information
              </h3>
              <p className="text-white/60 mt-1">
                Enter the basic details of your treatment
              </p>
            </div>
            <div className="p-6 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">
                    Treatment Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., Chemotherapy, Physical Therapy, Insulin"
                    className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-white/80">
                    Treatment Type <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => updateField('type', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select treatment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="medication" className="text-white hover:bg-white/10 focus:bg-white/10">Medication</SelectItem>
                      <SelectItem value="therapy" className="text-white hover:bg-white/10 focus:bg-white/10">Therapy</SelectItem>
                      <SelectItem value="procedure" className="text-white hover:bg-white/10 focus:bg-white/10">Procedure</SelectItem>
                      <SelectItem value="test" className="text-white hover:bg-white/10 focus:bg-white/10">Test/Lab Work</SelectItem>
                      <SelectItem value="consultation" className="text-white hover:bg-white/10 focus:bg-white/10">Consultation</SelectItem>
                      <SelectItem value="surgery" className="text-white hover:bg-white/10 focus:bg-white/10">Surgery</SelectItem>
                      <SelectItem value="chemotherapy" className="text-white hover:bg-white/10 focus:bg-white/10">Chemotherapy</SelectItem>
                      <SelectItem value="dialysis" className="text-white hover:bg-white/10 focus:bg-white/10">Dialysis</SelectItem>
                      <SelectItem value="rehabilitation" className="text-white hover:bg-white/10 focus:bg-white/10">Rehabilitation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-white/80">
                    Frequency <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: any) => updateField('frequency', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="once" className="text-white hover:bg-white/10 focus:bg-white/10">One Time</SelectItem>
                      <SelectItem value="daily" className="text-white hover:bg-white/10 focus:bg-white/10">Daily</SelectItem>
                      <SelectItem value="weekly" className="text-white hover:bg-white/10 focus:bg-white/10">Weekly</SelectItem>
                      <SelectItem value="biweekly" className="text-white hover:bg-white/10 focus:bg-white/10">Bi-weekly</SelectItem>
                      <SelectItem value="monthly" className="text-white hover:bg-white/10 focus:bg-white/10">Monthly</SelectItem>
                      <SelectItem value="as-needed" className="text-white hover:bg-white/10 focus:bg-white/10">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-white/80">
                    Priority <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => updateField('priority', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      <SelectItem value="low" className="text-white hover:bg-white/10 focus:bg-white/10">Low</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-white/10 focus:bg-white/10">Medium</SelectItem>
                      <SelectItem value="high" className="text-white hover:bg-white/10 focus:bg-white/10">High</SelectItem>
                      <SelectItem value="critical" className="text-white hover:bg-white/10 focus:bg-white/10">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'medication' && (
                <div className="space-y-2">
                  <Label htmlFor="dosage" className="text-white/80">
                    Dosage <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Medication className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => updateField('dosage', e.target.value)}
                      placeholder="e.g., 500mg twice daily"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.dosage ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.dosage && (
                    <p className="text-red-400 text-xs mt-1">{errors.dosage}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Location Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <Schedule className="h-5 w-5 text-teal-400" />
                Schedule & Location
              </h3>
              <p className="text-white/60 mt-1">
                When and where will the treatment take place
              </p>
            </div>
            <div className="p-6 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white/80">
                    Start Date <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className={`pl-10 bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert ${errors.startDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white/80">
                    End Date (if applicable)
                  </Label>
                  <div className="relative">
                    <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      className={`pl-10 bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert ${errors.endDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-white/80">
                    Doctor/Provider <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="doctor"
                      value={formData.doctor}
                      onChange={(e) => updateField('doctor', e.target.value)}
                      placeholder="Dr. Jane Smith"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.doctor ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.doctor && (
                    <p className="text-red-400 text-xs mt-1">{errors.doctor}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white/80">
                    Duration
                  </Label>
                  <div className="relative">
                    <AccessTime className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => updateField('duration', e.target.value)}
                      placeholder="e.g., 1 hour, 30 minutes"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white/80">
                  Location <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <LocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Hospital name, room number, or home"
                    className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.location ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.location && (
                  <p className="text-red-400 text-xs mt-1">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Instructions & Reminders Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <NotificationsActive className="h-5 w-5 text-teal-400" />
                Instructions & Reminders
              </h3>
              <p className="text-white/60 mt-1">
                Special instructions and reminder settings
              </p>
            </div>
            <div className="p-6 pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-white/80">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => updateField('instructions', e.target.value)}
                  placeholder="Special preparation, dietary restrictions, or other instructions..."
                  className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder" className="text-white/80">
                    Set Reminder
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="reminder"
                      checked={formData.reminder}
                      onChange={(e) => updateField('reminder', e.target.checked)}
                      className="h-4 w-4 text-teal-500 border-white/20 rounded focus:ring-teal-500 bg-white/10"
                    />
                    <label htmlFor="reminder" className="text-sm text-white/80">
                      Enable reminders for this treatment
                    </label>
                  </div>
                </div>

                {formData.reminder && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderTime" className="text-white/80">
                      Reminder Time
                    </Label>
                    <Select
                      value={formData.reminderTime}
                      onValueChange={(value) => updateField('reminderTime', value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select reminder time" />
                      </SelectTrigger>
                      <SelectContent className="bg-teal-800/90 border-teal-400/30">
                        <SelectItem value="0" className="text-white hover:bg-white/10 focus:bg-white/10">At time of treatment</SelectItem>
                        <SelectItem value="15" className="text-white hover:bg-white/10 focus:bg-white/10">15 minutes before</SelectItem>
                        <SelectItem value="30" className="text-white hover:bg-white/10 focus:bg-white/10">30 minutes before</SelectItem>
                        <SelectItem value="60" className="text-white hover:bg-white/10 focus:bg-white/10">1 hour before</SelectItem>
                        <SelectItem value="120" className="text-white hover:bg-white/10 focus:bg-white/10">2 hours before</SelectItem>
                        <SelectItem value="1440" className="text-white hover:bg-white/10 focus:bg-white/10">1 day before</SelectItem>
                        <SelectItem value="2880" className="text-white hover:bg-white/10 focus:bg-white/10">2 days before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
            <div className="p-6 pb-2">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <Description className="h-5 w-5 text-teal-400" />
                Additional Information
              </h3>
              <p className="text-white/60 mt-1">
                Side effects, costs, and other notes
              </p>
            </div>
            <div className="p-6 pt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Side Effects</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentSideEffect}
                    onChange={(e) => setCurrentSideEffect(e.target.value)}
                    placeholder="e.g., Nausea, Fatigue"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSideEffect();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSideEffect}
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sideEffects.map((effect) => (
                    <Badge
                      key={effect}
                      className="flex items-center gap-1 bg-white/10 text-white border-white/20"
                    >
                      {effect}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-400"
                        onClick={() => handleRemoveSideEffect(effect)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost" className="text-white/80">
                    Estimated Cost
                  </Label>
                  <div className="relative">
                    <AttachMoney className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="cost"
                      value={formData.cost}
                      onChange={(e) => updateField('cost', e.target.value)}
                      placeholder="e.g., $500 per session"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance" className="text-white/80">
                    Insurance Coverage
                  </Label>
                  <div className="relative">
                    <HealthAndSafety className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="insurance"
                      value={formData.insurance}
                      onChange={(e) => updateField('insurance', e.target.value)}
                      placeholder="e.g., Covered by insurance"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white/80">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any other relevant information about this treatment..."
                  className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[120px] bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <Close className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              disabled={createTreatmentMutation.loading || updateTreatmentMutation.loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {(createTreatmentMutation.loading || updateTreatmentMutation.loading)
                ? 'Saving...'
                : isEditMode ? 'Update Treatment' : 'Save Treatment'
              }
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddTreatment;
