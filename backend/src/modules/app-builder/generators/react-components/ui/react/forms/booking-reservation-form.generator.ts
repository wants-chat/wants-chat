import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBookingReservationForm = (
  resolved: ResolvedComponent,
  variant?: 'restaurant' | 'hotel' | 'service' | 'class'
) => {
  const dataSource = resolved.dataSource;
  const fields = resolved.fieldMappings || [];

  // Determine variant from props or parameter
  // Check if this is a class booking (fitness gym style)
  const isClassBooking = variant === 'class' ||
    resolved.props?.bookingType === 'class' ||
    dataSource === 'class_bookings' ||
    resolved.data?.entity === 'class_bookings';

  // For class booking variant, generate a simple confirm booking form
  if (isClassBooking) {
    return generateClassBookingForm(dataSource);
  }

  // Identify form fields from entity structure
  const nameField = fields.find(f => f.targetField === 'name' || f.targetField === 'customer_name')?.targetField || 'customer_name';
  const emailField = fields.find(f => f.targetField.includes('email'))?.targetField || 'email';
  const phoneField = fields.find(f => f.targetField.includes('phone'))?.targetField || 'phone';
  const dateField = fields.find(f => f.targetField.includes('date'))?.targetField || 'date';
  const timeField = fields.find(f => f.targetField.includes('time'))?.targetField || 'time';
  const serviceField = fields.find(f => f.targetField === 'service' || f.targetField === 'service_name')?.targetField || 'service';
  const notesField = fields.find(f => f.targetField.includes('note'))?.targetField || 'notes';
  const statusField = fields.find(f => f.targetField === 'status')?.targetField || 'status';

  return `import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, User, Mail, Phone, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface BookingFormProps {
  [key: string]: any;
  entity?: string;
  serviceId?: string;
  onSuccess?: (data: any) => void;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  cancelButtonLink?: string;
  mode?: 'create' | 'edit';
  requiresSubscription?: boolean;
  subscriptionEntity?: string;
  subscriptionUserField?: string;
  subscriptionStatusField?: string;
  subscriptionRequiredStatus?: string;
  noSubscriptionMessage?: string;
  noSubscriptionActionText?: string;
  noSubscriptionActionLink?: string;
  data?: any;
}

export default function BookingForm({
  entity = '${dataSource}',
  serviceId,
  onSuccess,
  className,
  submitButtonText,
  cancelButtonText,
  cancelButtonLink,
  mode: modeProp
}: BookingFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = modeProp === 'edit' || !!id;

  const [formState, setFormState] = useState({
    ${nameField}: '',
    ${emailField}: '',
    ${phoneField}: '',
    ${dateField}: '',
    ${timeField}: '',
    ${serviceField}: serviceId || '',
    ${notesField}: '',
    ${statusField}: 'pending'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode && id) {
        const response = await api.put<any>(\`/\${entity}/\${id}\`, data);
        return response?.data || response;
      } else {
        const response = await api.post<any>(\`/\${entity}\`, data);
        return response?.data || response;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) onSuccess(data);
      setTimeout(() => {
        if (cancelButtonLink) {
          navigate(cancelButtonLink);
        } else if (!isEditMode) {
          setFormState({
            ${nameField}: '',
            ${emailField}: '',
            ${phoneField}: '',
            ${dateField}: '',
            ${timeField}: '',
            ${serviceField}: serviceId || '',
            ${notesField}: '',
            ${statusField}: 'pending'
          });
          setStatus('idle');
        }
      }, 2000);
    },
    onError: (err: any) => {
      setStatus('error');
      setError(err.response?.data?.message || err.message || \`Failed to \${isEditMode ? 'update' : 'submit'} booking\`);
      console.error('Booking submission error:', err);
    },
  });

  // Fetch existing data in edit mode
  const { data: existingData, isLoading: isFetching, error: fetchError } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<any>(\`/\${entity}/\${id}\`);
      return response.data || response;
    },
    enabled: isEditMode && !!id,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (existingData) {
      setFormState({
        ${nameField}: existingData.${nameField} || '',
        ${emailField}: existingData.${emailField} || '',
        ${phoneField}: existingData.${phoneField} || '',
        ${dateField}: existingData.${dateField} || '',
        ${timeField}: existingData.${timeField} || '',
        ${serviceField}: existingData.${serviceField} || serviceId || '',
        ${notesField}: existingData.${notesField} || '',
        ${statusField}: existingData.${statusField} || 'pending'
      });
    }
  }, [existingData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const submitData = isEditMode ? formState : { ...formState, ${statusField}: formState.${statusField} || 'pending' };
    submitMutation.mutate(submitData);
  };

  const minDate = new Date().toISOString().split('T')[0];

  // Generate time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [\`\${hour}:00\`, \`\${hour}:30\`];
  }).flat();

  // Show loading state while fetching data in edit mode
  if (isFetching) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-blue-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-800 py-8 px-4 flex items-center justify-center", className)}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  // Show error if data fetch failed
  if (fetchError) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-blue-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-800 py-8 px-4", className)}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Failed to Load Data</h3>
            <p className="text-red-700 dark:text-red-300">{(fetchError as any)?.message || 'Could not load appointment data'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-blue-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-800 py-8 px-4", className)}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {isEditMode ? 'Edit Appointment' : 'Book an Appointment'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update the appointment details below' : 'Fill out the form below to schedule your service'}
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-gradient-to-br from-green-50 via-green-100/50 to-green-50 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-2xl p-8 text-center shadow-xl animate-in fade-in">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 via-green-200/50 to-green-100 dark:from-green-900/50 dark:via-green-800/60 dark:to-green-900/50 rounded-full flex items-center justify-center shadow-lg border border-green-200/50 dark:border-green-700/50">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                {isEditMode ? 'Appointment Updated!' : 'Booking Confirmed!'}
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                {isEditMode ? 'Your appointment has been successfully updated.' : 'Your appointment has been successfully scheduled.'}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEditMode ? 'Redirecting you back...' : \`We'll send a confirmation email to \${formState.${emailField}}\`}
                </p>
              </div>
              {!isEditMode && (
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="mt-4"
                >
                  Back to Home
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="${nameField}" className="text-gray-700 dark:text-gray-300">
                  Full Name *
                </Label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    id="${nameField}"
                    name="${nameField}"
                    value={formState.${nameField}}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="${emailField}" className="text-gray-700 dark:text-gray-300">
                    Email *
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      id="${emailField}"
                      name="${emailField}"
                      value={formState.${emailField}}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="${phoneField}" className="text-gray-700 dark:text-gray-300">
                    Phone *
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      id="${phoneField}"
                      name="${phoneField}"
                      value={formState.${phoneField}}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="${dateField}" className="text-gray-700 dark:text-gray-300">
                    Date *
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="date"
                      id="${dateField}"
                      name="${dateField}"
                      value={formState.${dateField}}
                      onChange={handleChange}
                      required
                      min={minDate}
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="${timeField}" className="text-gray-700 dark:text-gray-300">
                    Time *
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="${timeField}"
                      name="${timeField}"
                      value={formState.${timeField}}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="${notesField}" className="text-gray-700 dark:text-gray-300">
                  Additional Notes
                </Label>
                <textarea
                  id="${notesField}"
                  name="${notesField}"
                  value={formState.${notesField}}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {isEditMode && (
                <div>
                  <Label htmlFor="${statusField}" className="text-gray-700 dark:text-gray-300">
                    Status *
                  </Label>
                  <select
                    id="${statusField}"
                    name="${statusField}"
                    value={formState.${statusField}}
                    onChange={handleChange}
                    required
                    className="mt-2 block w-full px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                {cancelButtonText && cancelButtonLink && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(cancelButtonLink)}
                    className="flex-1 h-12"
                    disabled={status === 'loading'}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className={\`\${cancelButtonText ? 'flex-1' : 'w-full'} h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed\`}
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {submitButtonText || (isEditMode ? 'Update Appointment' : 'Book Appointment')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
`;
};

/**
 * Generate a simple class booking confirmation form for fitness/gym apps
 * This variant just shows a confirm button that books the class with the logged-in user
 */
function generateClassBookingForm(dataSource: string): string {
  return `import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Loader2, Calendar, Clock, MapPin, User, Users, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ClassBookingFormProps {
  [key: string]: any;
  entity?: string;
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  cancelButtonLink?: string;
  requiresSubscription?: boolean;
  subscriptionEntity?: string;
  noSubscriptionMessage?: string;
  noSubscriptionActionText?: string;
  noSubscriptionActionLink?: string;
  data?: any;
}

export default function ClassBookingForm({
  entity = '${dataSource}',
  className,
  submitButtonText = 'Book Class',
  cancelButtonText,
  cancelButtonLink,
  requiresSubscription = true,
  subscriptionEntity = 'member_subscriptions',
  noSubscriptionMessage = 'You need an active membership to book classes.',
  noSubscriptionActionText = 'Get a Membership',
  noSubscriptionActionLink = '/member/membership',
  data
}: ClassBookingFormProps) {
  const navigate = useNavigate();
  const { id: classId } = useParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  // Book class mutation
  const bookMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await api.post<any>(\`/\${entity}\`, bookingData);
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setStatus('success');
      setTimeout(() => {
        navigate('/member/bookings');
      }, 2000);
    },
    onError: (err: any) => {
      setStatus('error');
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to book class';
      setError(errorMessage);
      console.error('Class booking error:', err);
    },
  });

  // Fetch class details
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['classes', classId],
    queryFn: async () => {
      const response = await api.get<any>(\`/classes/\${classId}\`);
      return response.data?.data || response.data || response;
    },
    enabled: !!classId,
  });

  // Check if user has active subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: [subscriptionEntity, 'my'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`/\${subscriptionEntity}/my\`);
        return response.data?.data || response.data || response;
      } catch (err) {
        return null;
      }
    },
    enabled: requiresSubscription,
  });

  const hasActiveSubscription = !requiresSubscription ||
    (subscriptionData && subscriptionData.status === 'active');

  // Format date and time
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return { date: '', time: '', day: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  };

  const handleBookClass = async () => {
    if (!classId) return;
    setStatus('loading');
    setError('');
    const now = new Date().toISOString();
    bookMutation.mutate({
      class_id: classId,
      status: 'booked',
      booked_at: now,
    });
  };

  if (classLoading || subscriptionLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { date, time, day } = formatDateTime(classData?.scheduled_at);
  const trainerName = \`\${classData?.trainer_first_name || ''} \${classData?.trainer_last_name || ''}\`.trim();
  const spotsLeft = (classData?.capacity || 20) - (classData?.enrolled_count || 0);
  const isFull = spotsLeft <= 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Success Message */}
      {status === 'success' && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                Class Booked Successfully!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                You're all set for {classData?.name}. Redirecting to your bookings...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Subscription Warning */}
      {!hasActiveSubscription && status !== 'success' && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Membership Required
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                {noSubscriptionMessage}
              </p>
              <Button
                onClick={() => navigate(noSubscriptionActionLink)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {noSubscriptionActionText}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Card */}
      {status !== 'success' && hasActiveSubscription && (
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              Confirm Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {classData?.name || 'Fitness Class'}
              </h3>

              {classData?.class_type && (
                <Badge variant="secondary">{classData.class_type}</Badge>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>{day}, {date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>{time}</span>
                </div>
                {classData?.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span>{classData.location}</span>
                  </div>
                )}
                {trainerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>{trainerName}</span>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {classData?.enrolled_count || 0}/{classData?.capacity || 20} enrolled
                  </span>
                </div>
                <Badge className={cn(
                  isFull ? 'bg-red-500' : spotsLeft <= 3 ? 'bg-amber-500' : 'bg-green-500',
                  'text-white'
                )}>
                  {isFull ? 'Class Full' : \`\${spotsLeft} spots left\`}
                </Badge>
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {cancelButtonText && cancelButtonLink && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(cancelButtonLink)}
                  className="flex-1"
                  disabled={status === 'loading'}
                >
                  {cancelButtonText}
                </Button>
              )}
              <Button
                onClick={handleBookClass}
                disabled={status === 'loading' || isFull}
                className={cn(
                  "flex-1 h-12 font-semibold rounded-xl transition-all",
                  isFull
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                )}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : isFull ? (
                  'Class Full'
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {submitButtonText}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
`;
}
