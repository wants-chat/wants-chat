import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Edit2, Trash2, Search, Plus } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { usePaternalCheckupAppointments, useDeletePaternalCheckupAppointment } from '../../hooks/useServices';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  ChevronLeft,
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  Warning,
  EventAvailable,
  Schedule,
  MedicalServices,
  PregnantWoman,
  ChildCare,
  Vaccines,
  MonitorHeart,
  Bloodtype,
  Psychology
} from '@mui/icons-material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';


const ScheduleCheckup: React.FC = () => {
  const navigate = useNavigate();
  const { data: appointmentsData, loading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = usePaternalCheckupAppointments();
  const deleteAppointmentMutation = useDeletePaternalCheckupAppointment();

  // Confirmation modal hook
  const confirmation = useConfirmation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter appointments based on search and filters
  const appointments = appointmentsData?.data || [];
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || apt.type === filterType;
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group appointments by status
  const upcomingAppointments = filteredAppointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  );
  const pastAppointments = filteredAppointments.filter(apt => 
    apt.status === 'completed' || (apt.status === 'scheduled' && new Date(apt.date) < new Date())
  );

  const handleDeleteAppointment = async (id: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment? This action cannot be undone.',
      confirmText: 'Delete Appointment',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteAppointmentMutation.mutate(id);
        // Refetch appointments after deletion
        refetchAppointments();
        toast.success('Appointment deleted successfully!');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment. Please try again.');
      }
    }
  };

  const handleCancelAppointment = async (id: string) => {
    // This would need an update API call - for now just delete
    handleDeleteAppointment(id);
  };

  const handleEditAppointment = (appointment: any) => {
    // Store appointment data in localStorage for the edit page
    localStorage.setItem('editingAppointment', JSON.stringify(appointment));
    navigate('/health/add-checkup-appointment?edit=true');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prenatal':
        return <PregnantWoman className="h-5 w-5" />;
      case 'ultrasound':
        return <MonitorHeart className="h-5 w-5" />;
      case 'blood-test':
        return <Bloodtype className="h-5 w-5" />;
      case 'consultation':
        return <Psychology className="h-5 w-5" />;
      case 'vaccination':
        return <Vaccines className="h-5 w-5" />;
      case 'postnatal':
        return <ChildCare className="h-5 w-5" />;
      default:
        return <MedicalServices className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prenatal':
        return 'rgb(71, 189, 255)';
      case 'ultrasound':
        return 'rgb(139, 92, 246)';
      case 'blood-test':
        return 'rgb(239, 68, 68)';
      case 'consultation':
        return 'rgb(34, 197, 94)';
      case 'vaccination':
        return 'rgb(251, 146, 60)';
      case 'postnatal':
        return 'rgb(236, 72, 153)';
      default:
        return 'rgb(107, 114, 128)';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-400">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Rescheduled</Badge>;
      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Mother Care', href: '/health/mother-care' },
    { label: 'Schedule Checkup', icon: CalendarToday }
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Your Appointments
          </h1>
          <p className="text-lg text-white/60">
            Schedule and track all your prenatal checkups in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-white">{appointments.length}</p>
              </div>
              <div className="p-3 rounded-full bg-teal-500/20">
                <CalendarToday className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-green-400">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <EventAvailable className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Completed</p>
                <p className="text-3xl font-bold text-purple-400">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <Check className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">This Month</p>
                <p className="text-3xl font-bold text-orange-400">
                  {appointments.filter(a => {
                    const aptDate = new Date(a.date);
                    const now = new Date();
                    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20">
                <Schedule className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48 rounded-xl bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="prenatal">Prenatal</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="blood-test">Blood Test</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="vaccination">Vaccination</SelectItem>
              <SelectItem value="postnatal">Postnatal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 rounded-xl bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            onClick={() => navigate('/health/add-checkup-appointment')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Appointment
          </Button>
        </div>

        {/* Loading State */}
        {appointmentsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Loading appointments...</p>
            </div>
          </div>
        ) : appointmentsError ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{String(appointmentsError) || 'Failed to load appointments'}</p>
            <Button
              onClick={() => refetchAppointments()}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Upcoming Appointments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingAppointments.map(appointment => (
                <Card key={appointment.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${getTypeColor(appointment.type)}20` }}
                      >
                        <div style={{ color: getTypeColor(appointment.type) }}>
                          {getTypeIcon(appointment.type)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {appointment.title}
                        </h3>
                        <p className="text-sm text-white/60">
                          {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status || 'scheduled')}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Person className="h-4 w-4 text-white/50" />
                      <span className="text-white/80">{appointment.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <LocationOn className="h-4 w-4 text-white/50" />
                      <span className="text-white/80">{appointment.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarToday className="h-4 w-4 text-white/50" />
                      <span className="text-white/80">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AccessTime className="h-4 w-4 text-white/50" />
                      <span className="text-white/80">{appointment.time}</span>
                    </div>

                    {appointment.notes && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-400">
                          <Warning className="h-4 w-4 inline mr-1" />
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                        className="rounded-lg bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="rounded-lg bg-transparent border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        disabled={deleteAppointmentMutation.loading}
                        className="rounded-lg bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deleteAppointmentMutation.loading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {deleteAppointmentMutation.loading ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Past Appointments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastAppointments.map(appointment => (
                <Card key={appointment.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${getTypeColor(appointment.type)}20` }}
                      >
                        <div style={{ color: getTypeColor(appointment.type) }}>
                          {getTypeIcon(appointment.type)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {appointment.title}
                        </h3>
                        <p className="text-sm text-white/60">
                          {appointment.doctor}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status || 'scheduled')}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarToday className="h-4 w-4 text-white/50" />
                      <span className="text-white/60">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <LocationOn className="h-4 w-4 text-white/50" />
                      <span className="text-white/60">{appointment.location}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

            {/* Empty State */}
            {filteredAppointments.length === 0 && (
          <Card className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
            <CalendarToday className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No appointments found
            </h3>
            <p className="text-white/60 mb-6">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Schedule your first prenatal checkup to get started'}
            </p>
            <Button
              onClick={() => navigate('/health/add-checkup-appointment')}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Schedule Appointment
            </Button>
          </Card>
            )}
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default ScheduleCheckup;