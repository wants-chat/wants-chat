import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, User, AlertTriangle, Check, Search, Filter, ChevronRight } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiCalendarClock, mdiMedication, mdiHospitalBox, mdiMedicalBag } from '@mdi/js';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useTreatments, useDeleteTreatment, useUpdateTreatmentStatus } from '../../hooks/health';
import { Treatment } from '../../types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';
import {
  ChevronLeft,
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  MedicalServices,
  LocalHospital,
  Medication,
  Healing,
  Schedule,
  EventAvailable,
  EventBusy,
  Warning,
  CheckCircle,
  Notifications,
  TrendingUp,
  Assignment,
  MonitorHeart,
  Vaccines,
  Science,
  Psychology,
  DirectionsRun
} from '@mui/icons-material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';


interface TreatmentSession {
  id: string;
  treatmentId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
  };
  outcome?: string;
}

const TreatmentSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  // API hooks
  const { treatments, isLoading, error, refetch } = useTreatments();
  const deleteTreatmentMutation = useDeleteTreatment();
  const updateStatusMutation = useUpdateTreatmentStatus();


  const [sessions, setSessions] = useState<TreatmentSession[]>([
    {
      id: '1',
      treatmentId: '1',
      date: '2024-12-21',
      time: '09:00',
      status: 'completed',
      notes: 'Treatment went well, minimal side effects',
      vitals: {
        bloodPressure: '125/80',
        heartRate: 72,
        temperature: 98.6,
        weight: 68
      },
      outcome: 'Good tolerance, continue as planned'
    }
  ]);

  // Filter treatments with memoization for better performance
  const filteredTreatments = useMemo(() => {
    if (!treatments) return [];
    return treatments.filter(treatment => {
      const matchesSearch =
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || treatment.status === filterStatus;
      const matchesType = filterType === 'all' || treatment.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [treatments, searchQuery, filterStatus, filterType]);

  // Active treatments (non-completed)
  const activeTreatments = useMemo(() => {
    if (!treatments) return [];
    return treatments.filter(treatment => {
      const isActive = treatment.status !== 'completed';
      const matchesSearch =
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || treatment.type === filterType;

      return isActive && matchesSearch && matchesType;
    });
  }, [treatments, searchQuery, filterType]);

  // Completed treatments
  const completedTreatments = useMemo(() => {
    if (!treatments) return [];
    return treatments.filter(treatment => {
      const isCompleted = treatment.status === 'completed';
      const matchesSearch =
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || treatment.type === filterType;

      return isCompleted && matchesSearch && matchesType;
    });
  }, [treatments, searchQuery, filterType]);

  const handleDeleteTreatment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Treatment',
      message: 'Are you sure you want to delete this treatment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      deleteTreatmentMutation.mutate(id);
    }
  };

  const markAsCompleted = async (id: string, treatmentName: string) => {
    try {
      await updateStatusMutation.mutate({ id, status: 'completed' });
      // Refetch treatments after marking as complete
      refetch();
      toast({
        title: 'Treatment Completed',
        description: `"${treatmentName}" has been marked as completed.`,
      });
    } catch (error) {
      console.error('Failed to mark treatment as completed:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark treatment as completed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Medication className="h-5 w-5" />;
      case 'therapy':
        return <Healing className="h-5 w-5" />;
      case 'procedure':
        return <MedicalServices className="h-5 w-5" />;
      case 'test':
        return <Science className="h-5 w-5" />;
      case 'consultation':
        return <Psychology className="h-5 w-5" />;
      case 'surgery':
        return <LocalHospital className="h-5 w-5" />;
      case 'chemotherapy':
        return <Icon path={mdiMedicalBag} size={0.8} />;
      case 'dialysis':
        return <MonitorHeart className="h-5 w-5" />;
      case 'rehabilitation':
        return <DirectionsRun className="h-5 w-5" />;
      default:
        return <MedicalServices className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'rgb(239, 68, 68)';
      case 'high':
        return 'rgb(251, 146, 60)';
      case 'medium':
        return 'rgb(71, 189, 255)';
      case 'low':
        return 'rgb(34, 197, 94)';
      default:
        return 'rgb(107, 114, 128)';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'scheduled':
        return <Badge className="bg-teal-500/20 text-teal-400 border border-teal-400/30">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border border-green-400/30">Completed</Badge>;
      default:
        return <Badge className="bg-teal-500/20 text-teal-400 border border-teal-400/30">Active</Badge>;
    }
  };

  const calculateProgress = (treatment: Treatment) => {
    if (!treatment.startDate || !treatment.endDate) return 0;
    const start = new Date(treatment.startDate);
    const end = new Date(treatment.endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundEffects />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading treatments...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BackgroundEffects />
        <div className="text-center relative z-10">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Failed to load treatments
          </h3>
          <p className="text-white/60 mb-4">{error}</p>
          <Button onClick={refetch} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">Try Again</Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Serious Care', href: '/health/serious-care' },
    { label: 'Treatment Schedule', icon: CalendarToday }
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
            Treatment Management
          </h1>
          <p className="text-lg text-white/60">
            Stay on track with your treatment plan and medical appointments
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-teal-500/30 transition-all" onClick={() => setActiveTab('schedule')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Active Treatments</p>
                <p className="text-3xl font-bold text-white">
                  {treatments?.filter(t => t.status !== 'completed').length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-teal-500/20">
                <Assignment className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">High Priority</p>
                <p className="text-3xl font-bold text-white">
                  {treatments?.filter(t => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'completed').length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <Warning className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-green-500/30 transition-all" onClick={() => setActiveTab('completed')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">
                  {treatments?.filter(t => t.status === 'completed').length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 z-10" />
            <Input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 rounded-xl bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">All Status</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Active</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48 rounded-xl bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">All Types</SelectItem>
              <SelectItem value="medication" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Medication</SelectItem>
              <SelectItem value="therapy" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Therapy</SelectItem>
              <SelectItem value="procedure" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Procedure</SelectItem>
              <SelectItem value="test" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Test</SelectItem>
              <SelectItem value="consultation" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Consultation</SelectItem>
              <SelectItem value="chemotherapy" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Chemotherapy</SelectItem>
              <SelectItem value="dialysis" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Dialysis</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            onClick={() => navigate('/health/add-treatment')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Treatment
          </Button>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 gap-2 h-auto p-1 bg-white/10 border border-white/20 rounded-xl">
            <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
              <Schedule className="h-5 w-5 mr-2" />
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
              <CheckCircle className="h-5 w-5 mr-2" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTreatments.map(treatment => (
                <div key={treatment.id} className="rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ 
                            backgroundColor: `${getPriorityColor(treatment.priority)}20`,
                            color: getPriorityColor(treatment.priority)
                          }}
                        >
                          {getTreatmentIcon(treatment.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white">
                            {treatment.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {treatment.type.replace('-', ' ')}
                            </Badge>
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getPriorityColor(treatment.priority)}20`,
                                color: getPriorityColor(treatment.priority),
                                border: `1px solid ${getPriorityColor(treatment.priority)}40`
                              }}
                            >
                              {treatment.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(treatment.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Person className="h-4 w-4 text-white/40" />
                        <span className="text-white/80">{treatment.doctor}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <LocationOn className="h-4 w-4 text-white/40" />
                        <span className="text-white/80">{treatment.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Schedule className="h-4 w-4 text-white/40" />
                        <span className="text-white/80 capitalize">
                          {treatment.frequency}
                          {treatment.startDate && ` - Starts: ${new Date(treatment.startDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      
                      {treatment.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <AccessTime className="h-4 w-4 text-white/40" />
                          <span className="text-white/80">{treatment.duration}</span>
                        </div>
                      )}
                      
                      {treatment.dosage && (
                        <div className="flex items-center gap-2 text-sm">
                          <Medication className="h-4 w-4 text-white/40" />
                          <span className="text-white/80">{treatment.dosage}</span>
                        </div>
                      )}
                      
                      {treatment.endDate && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-white/60">Treatment Progress</span>
                            <span className="text-white/80">{calculateProgress(treatment)}%</span>
                          </div>
                          <Progress value={calculateProgress(treatment)} className="h-2" />
                        </div>
                      )}
                      
                      {treatment.instructions && (
                        <div className="p-3 bg-blue-500/10 rounded-lg mt-3">
                          <p className="text-sm text-blue-400">
                            <Assignment className="h-4 w-4 inline mr-1" />
                            {treatment.instructions}
                          </p>
                        </div>
                      )}
                      
                      {treatment.notes && (
                        <p className="text-sm text-white/60 italic mt-2">
                          {treatment.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      {treatment.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => markAsCompleted(treatment.id, treatment.name)}
                          className="rounded-lg bg-green-500/20 border border-green-400/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/health/add-treatment?edit=${treatment.id}`)}
                        className="rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTreatment(treatment.id)}
                        className="rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeTreatments.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
                <Assignment className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No active treatments
                </h3>
                <p className="text-white/60 mb-6">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first treatment to get started'}
                </p>
                <Button
                  onClick={() => navigate('/health/add-treatment')}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Treatment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedTreatments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedTreatments.map(treatment => (
                  <div key={treatment.id} className="rounded-2xl bg-white/5 border border-green-500/20 hover:border-green-500/40 transition-all">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-green-500/20">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-white">
                              {treatment.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize border-white/20 text-white/60">
                                {treatment.type.replace('-', ' ')}
                              </Badge>
                              <Badge className="text-xs bg-green-500/20 text-green-400 border border-green-400/30">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Person className="h-4 w-4 text-white/40" />
                          <span className="text-white/80">{treatment.doctor}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <LocationOn className="h-4 w-4 text-white/40" />
                          <span className="text-white/80">{treatment.location}</span>
                        </div>

                        {treatment.startDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-white/40" />
                            <span className="text-white/80">
                              {new Date(treatment.startDate).toLocaleDateString()}
                              {treatment.endDate && ` - ${new Date(treatment.endDate).toLocaleDateString()}`}
                            </span>
                          </div>
                        )}

                        {treatment.notes && (
                          <p className="text-sm text-white/60 italic mt-2">
                            {treatment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/health/add-treatment?edit=${treatment.id}`)}
                          className="rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTreatment(treatment.id)}
                          className="rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No completed treatments
                </h3>
                <p className="text-white/60">
                  Completed treatments will appear here after you mark them as complete
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TreatmentSchedule;