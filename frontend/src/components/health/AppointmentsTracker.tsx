import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Loader2, Plus, Calendar, Clock, MapPin, User, Phone, AlertCircle, Trash2, Edit } from 'lucide-react';
import { toast } from '../ui/toast';
import { healthService } from '../../services/healthService';
import type { MedicalRecord } from '../../types/health';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface AppointmentFormData {
  title: string;
  description?: string;
  provider?: string;
  date: string;
  time: string;
  location?: string;
  phone?: string;
  notes?: string;
}

const AppointmentsTracker: React.FC = () => {
  const { confirm } = useConfirm();
  const [appointments, setAppointments] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<MedicalRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<AppointmentFormData>();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load medical records of type 'visit' to show as appointments
      const data = await healthService.getMedicalRecords({ type: 'visit' });
      
      // Filter to show future appointments and recent past ones
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const relevantAppointments = data.records.filter(record => {
        const appointmentDate = new Date(record.date);
        return appointmentDate >= oneMonthAgo; // Show appointments from last month onwards
      });
      
      // Sort by date (upcoming first)
      relevantAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setAppointments(relevantAppointments);
    } catch (error) {
      setError('Failed to load appointments');
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const appointmentDateTime = new Date(`${data.date}T${data.time}`);
      
      // Create description with appointment details
      let description = data.description || '';
      if (data.location || data.phone) {
        const details = [];
        if (data.location) details.push(`Location: ${data.location}`);
        if (data.phone) details.push(`Phone: ${data.phone}`);
        description += (description ? '\n\n' : '') + details.join('\n');
      }
      if (data.notes) {
        description += (description ? '\n\nNotes: ' : 'Notes: ') + data.notes;
      }

      const appointmentData = {
        type: 'visit' as const,
        title: data.title,
        description,
        provider: data.provider,
        date: appointmentDateTime,
        tags: ['appointment']
      };

      if (editingAppointment) {
        await healthService.updateMedicalRecord(editingAppointment.id, appointmentData);
        toast.success('Appointment updated successfully!');
      } else {
        await healthService.createMedicalRecord(appointmentData);
        toast.success('Appointment scheduled successfully!');
      }

      await loadAppointments();
      handleDialogClose();
    } catch (error) {
      toast.error('Failed to save appointment. Please try again.');
      console.error('Error saving appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) {
      return;
    }

    try {
      await healthService.deleteMedicalRecord(id);
      toast.success('Appointment deleted successfully!');
      await loadAppointments();
    } catch (error) {
      toast.error('Failed to delete appointment. Please try again.');
      console.error('Error deleting appointment:', error);
    }
  };

  const handleEdit = (appointment: MedicalRecord) => {
    setEditingAppointment(appointment);
    const appointmentDate = new Date(appointment.date);
    
    setValue('title', appointment.title);
    setValue('provider', appointment.provider || '');
    setValue('date', appointmentDate.toISOString().split('T')[0]);
    setValue('time', appointmentDate.toTimeString().slice(0, 5));
    
    // Parse description to extract details
    const description = appointment.description || '';
    const locationMatch = description.match(/Location: ([^\n]+)/);
    const phoneMatch = description.match(/Phone: ([^\n]+)/);
    const notesMatch = description.match(/Notes: ([^\n]+)$/);
    
    setValue('location', locationMatch ? locationMatch[1] : '');
    setValue('phone', phoneMatch ? phoneMatch[1] : '');
    setValue('notes', notesMatch ? notesMatch[1] : '');
    
    // Clean description (remove extracted details)
    let cleanDescription = description
      .replace(/Location: [^\n]+\n?/g, '')
      .replace(/Phone: [^\n]+\n?/g, '')
      .replace(/Notes: [^\n]+$/g, '')
      .trim();
    
    setValue('description', cleanDescription);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    reset();
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const formatAppointmentDateTime = (date: Date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateStr = appointmentDate.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    
    let dayLabel = '';
    if (dateStr === todayStr) {
      dayLabel = 'Today';
    } else if (dateStr === tomorrowStr) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = appointmentDate.toLocaleDateString();
    }
    
    const time = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dayLabel} at ${time}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading appointments...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadAppointments} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = appointments.filter(apt => isUpcoming(new Date(apt.date)));
  const pastAppointments = appointments.filter(apt => !isUpcoming(new Date(apt.date)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointments
              </CardTitle>
              <CardDescription>
                Schedule and track your medical appointments
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open && !editingAppointment) {
                setEditingAppointment(null);
              }
            }}>
              <DialogTrigger>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAppointment ? 'Update the appointment details.' : 'Schedule a new medical appointment.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Appointment Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Annual Physical, Cardiology Consultation"
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Healthcare Provider</Label>
                    <Input
                      id="provider"
                      placeholder="e.g., Dr. Smith, City Hospital"
                      {...register('provider')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        {...register('date', { required: 'Date is required' })}
                      />
                      {errors.date && (
                        <p className="text-sm text-destructive">{errors.date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        {...register('time', { required: 'Time is required' })}
                      />
                      {errors.time && (
                        <p className="text-sm text-destructive">{errors.time.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., 123 Medical Center Dr, Suite 200"
                      {...register('location')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="e.g., (555) 123-4567"
                      {...register('phone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Purpose of visit, symptoms to discuss, etc."
                      rows={3}
                      {...register('description')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Insurance info, things to remember, etc."
                      rows={2}
                      {...register('notes')}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingAppointment ? 'Updating...' : 'Scheduling...'}
                        </>
                      ) : (
                        <>
                          {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{appointment.title}</h3>
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {formatAppointmentDateTime(new Date(appointment.date))}
                      </p>
                      
                      {appointment.provider && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <User className="h-4 w-4 inline mr-1" />
                          {appointment.provider}
                        </p>
                      )}
                      
                      {appointment.description && (
                        <div className="text-sm text-muted-foreground mt-2">
                          {appointment.description.split('\n').map((line: string, index: number) => (
                            <div key={index} className="flex items-start gap-1">
                              {line.startsWith('Location:') && <MapPin className="h-4 w-4 mt-0.5 text-green-600" />}
                              {line.startsWith('Phone:') && <Phone className="h-4 w-4 mt-0.5 text-blue-600" />}
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(appointment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-gray-300">
                <CardContent className="p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{appointment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {formatAppointmentDateTime(new Date(appointment.date))}
                      </p>
                      
                      {appointment.provider && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <User className="h-4 w-4 inline mr-1" />
                          {appointment.provider}
                        </p>
                      )}
                      
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(appointment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Appointments */}
      {appointments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No appointments scheduled</p>
            <p className="text-sm text-muted-foreground">
              Schedule your first appointment to start tracking your healthcare visits
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentsTracker;