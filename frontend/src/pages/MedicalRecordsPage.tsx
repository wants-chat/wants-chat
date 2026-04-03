import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Sparkles, AlertTriangle, TrendingUp, Activity as LucideActivity } from 'lucide-react';
import Header from '../components/landing/Header';
import { useAppointments, useTestResults, useDeleteTestResult, useDeleteAppointment, useInsurance, useDeleteInsurance, useVitalRecords, useDeleteVitalRecord } from '../hooks/useServices';
import { useHealthProfile } from '../hooks/health/useHealthProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent } from '../components/ui/tabs';
import {
  Upload as UploadIcon,
  Description as FileTextIcon,
  CalendarMonth as CalendarIcon,
  Warning as AlertCircleIcon,
  Security as ShieldIcon,
  MedicalServices as StethoscopeIcon,
  Assignment as ClipboardListIcon,
  Timeline as ActivityIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  Phone as PhoneIcon,
  CreditCard as CreditCardIcon,
  Business as BuildingIcon,
  Person as UserIcon,
  CalendarToday as CalendarDaysIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Bloodtype as BloodtypeIcon,
  MonitorHeart as MonitorHeartIcon,
  Science as ScienceIcon,
  FitnessCenter as FitnessCenterIcon,
  Thermostat as ThermostatIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import {
  type TestResult
} from '../types/medical';
import { notificationService } from '../services/notificationService';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';
import { useConfirm } from '../contexts/ConfirmDialogContext';

interface MedicalRecord {
  id: string;
  date: string;
  value: string;
  unit: string;
  notes?: string;
}

interface UserInfo {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bloodType: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
  emergencyPhone: string;
}


const MedicalRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodType: '',
    allergies: '',
    medications: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'vitals';
  });

  // Fetch appointments from API only if user is authenticated
  const { data: appointmentsData, loading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useAppointments();
  
  // Fetch test results from API
  const { data: testResultsData, loading: testResultsLoading, error: testResultsError, refetch: refetchTestResults } = useTestResults();
  const deleteTestResultMutation = useDeleteTestResult();
  const deleteAppointmentMutation = useDeleteAppointment();

  // Fetch insurance from API
  const { data: insuranceData, loading: insuranceLoading, error: insuranceError, refetch: refetchInsurance } = useInsurance();
  const deleteInsuranceMutation = useDeleteInsurance();

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, error: vitalRecordsError, refetch: refetchVitalRecords } = useVitalRecords();
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Notifications data from API
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
  }[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Vital records data (transformed from API)
  const [vitalRecords, setVitalRecords] = useState<{
    bloodSugar: MedicalRecord[];
    bloodPressure: MedicalRecord[];
    cholesterol: MedicalRecord[];
    weight: MedicalRecord[];
    heartRate: MedicalRecord[];
    temperature: MedicalRecord[];
  }>({
    bloodSugar: [],
    bloodPressure: [],
    cholesterol: [],
    weight: [],
    heartRate: [],
    temperature: []
  });

  // Transform API vital records data into categorized format
  useEffect(() => {
    // API returns array directly
    let records = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (records && Array.isArray(records)) {
      // Reverse array to show latest records first
      records = [...records].reverse();

      const categorized = {
        bloodSugar: [] as MedicalRecord[],
        bloodPressure: [] as MedicalRecord[],
        cholesterol: [] as MedicalRecord[],
        weight: [] as MedicalRecord[],
        heartRate: [] as MedicalRecord[],
        temperature: [] as MedicalRecord[]
      };

      records.forEach((record: any) => {
        const formattedDate = record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '';

        // Blood Sugar
        if (record.bloodSugar && parseFloat(record.bloodSugar) > 0) {
          categorized.bloodSugar.push({
            id: record.id,
            date: formattedDate,
            value: record.bloodSugar,
            unit: record.bloodSugarUnit || 'mg/dL',
            notes: record.bloodSugarType ? `${record.bloodSugarType.charAt(0).toUpperCase() + record.bloodSugarType.slice(1)}` : undefined
          });
        }

        // Blood Pressure
        if (record.systolic && record.diastolic) {
          categorized.bloodPressure.push({
            id: record.id,
            date: formattedDate,
            value: `${record.systolic}/${record.diastolic}`,
            unit: 'mmHg',
            notes: record.bpPosition ? `${record.bpPosition.charAt(0).toUpperCase() + record.bpPosition.slice(1)}` : undefined
          });
        }

        // Cholesterol
        if (record.totalCholesterol) {
          categorized.cholesterol.push({
            id: record.id + '-total',
            date: formattedDate,
            value: record.totalCholesterol.toString(),
            unit: 'mg/dL',
            notes: 'Total Cholesterol'
          });
        }
        if (record.ldlCholesterol) {
          categorized.cholesterol.push({
            id: record.id + '-ldl',
            date: formattedDate,
            value: record.ldlCholesterol.toString(),
            unit: 'mg/dL',
            notes: 'LDL'
          });
        }
        if (record.hdlCholesterol) {
          categorized.cholesterol.push({
            id: record.id + '-hdl',
            date: formattedDate,
            value: record.hdlCholesterol.toString(),
            unit: 'mg/dL',
            notes: 'HDL'
          });
        }

        // Weight
        if (record.weight) {
          categorized.weight.push({
            id: record.id,
            date: formattedDate,
            value: record.weight,
            unit: record.weightUnit || 'kg',
            notes: record.bmi ? `BMI: ${record.bmi}` : undefined
          });
        }

        // Heart Rate
        if (record.heartRate) {
          categorized.heartRate.push({
            id: record.id,
            date: formattedDate,
            value: record.heartRate.toString(),
            unit: 'bpm',
            notes: record.heartRhythm ? `${record.heartRhythm.charAt(0).toUpperCase() + record.heartRhythm.slice(1)} rhythm` : undefined
          });
        }

        // Temperature
        if (record.temperature) {
          categorized.temperature.push({
            id: record.id,
            date: formattedDate,
            value: record.temperature,
            unit: record.temperatureUnit === 'celsius' ? '°C' : '°F',
            notes: record.temperatureLocation ? `${record.temperatureLocation.charAt(0).toUpperCase() + record.temperatureLocation.slice(1)}` : undefined
          });
        }
      });

      setVitalRecords(categorized);
    }
  }, [vitalRecordsApiData]);

  // AI Analysis function for doctor recommendations
  const analyzeVitalsForRecommendations = () => {
    const recommendations = [];
    const concerns = [];
    let priority = 'low'; // low, medium, high
    
    // Analyze Blood Pressure
    if (vitalRecords.bloodPressure.length > 0) {
      const latestBP = vitalRecords.bloodPressure[0].value.split('/');
      const systolic = parseInt(latestBP[0]);
      const diastolic = parseInt(latestBP[1]);
      
      if (systolic >= 140 || diastolic >= 90) {
        concerns.push('High blood pressure detected');
        recommendations.push({
          doctor: 'Cardiologist',
          reason: 'Your blood pressure readings are elevated',
          urgency: 'Schedule within 2 weeks'
        });
        priority = 'high';
      } else if (systolic >= 130 || diastolic >= 80) {
        concerns.push('Borderline high blood pressure');
        recommendations.push({
          doctor: 'Primary Care Physician',
          reason: 'Blood pressure is slightly elevated',
          urgency: 'Schedule within a month'
        });
        if (priority === 'low') priority = 'medium';
      }
    }
    
    // Analyze Blood Sugar
    if (vitalRecords.bloodSugar.length > 0) {
      const fastingValues = vitalRecords.bloodSugar.filter(r => r.notes?.includes('Fasting'));
      if (fastingValues.length > 0) {
        const latestFasting = parseInt(fastingValues[0].value);
        if (latestFasting >= 126) {
          concerns.push('High fasting blood sugar');
          recommendations.push({
            doctor: 'Endocrinologist',
            reason: 'Blood sugar levels indicate possible diabetes',
            urgency: 'Schedule within 1 week'
          });
          priority = 'high';
        } else if (latestFasting >= 100) {
          concerns.push('Prediabetic blood sugar levels');
          if (!recommendations.find(r => r.doctor === 'Primary Care Physician')) {
            recommendations.push({
              doctor: 'Primary Care Physician',
              reason: 'Blood sugar levels are borderline high',
              urgency: 'Schedule within a month'
            });
          }
          if (priority === 'low') priority = 'medium';
        }
      }
    }
    
    // Analyze Cholesterol
    if (vitalRecords.cholesterol.length > 0) {
      const totalCholesterol = parseInt(vitalRecords.cholesterol.find(r => r.notes?.includes('Total'))?.value || '0');
      const ldl = parseInt(vitalRecords.cholesterol.find(r => r.notes === 'LDL')?.value || '0');
      
      if (totalCholesterol >= 240 || ldl >= 160) {
        concerns.push('High cholesterol levels');
        if (!recommendations.find(r => r.doctor === 'Cardiologist')) {
          recommendations.push({
            doctor: 'Cardiologist',
            reason: 'Cholesterol levels are concerning',
            urgency: 'Schedule within 2 weeks'
          });
        }
        priority = 'high';
      } else if (totalCholesterol >= 200 || ldl >= 130) {
        concerns.push('Borderline high cholesterol');
        if (!recommendations.find(r => r.doctor === 'Primary Care Physician')) {
          recommendations.push({
            doctor: 'Primary Care Physician',
            reason: 'Cholesterol needs monitoring',
            urgency: 'Schedule regular check-up'
          });
        }
        if (priority === 'low') priority = 'medium';
      }
    }
    
    // Analyze Heart Rate
    if (vitalRecords.heartRate.length > 0) {
      const restingRates = vitalRecords.heartRate.filter(r => r.notes?.includes('Resting'));
      if (restingRates.length > 0) {
        const avgResting = restingRates.reduce((sum, r) => sum + parseInt(r.value), 0) / restingRates.length;
        if (avgResting > 100 || avgResting < 50) {
          concerns.push('Irregular resting heart rate');
          if (!recommendations.find(r => r.doctor === 'Cardiologist')) {
            recommendations.push({
              doctor: 'Cardiologist',
              reason: 'Heart rate is outside normal range',
              urgency: 'Schedule within 2 weeks'
            });
          }
          if (priority !== 'high') priority = 'medium';
        }
      }
    }
    
    // Default recommendation if everything is normal
    if (recommendations.length === 0) {
      recommendations.push({
        doctor: 'Primary Care Physician',
        reason: 'Regular health check-up',
        urgency: 'Annual check-up recommended'
      });
    }
    
    return { recommendations, concerns, priority };
  };

  // Fetch health profile from API
  const { profile: healthProfile, isLoading: profileLoading, isError: profileError, hasProfile, error, refetch: refetchProfile, hasCompletedInitialLoad } = useHealthProfile();

  // Effect to handle initial load and refetch
  useEffect(() => {
    // Reset body overflow in case it was left hidden
    document.body.style.overflow = '';

    // If user just completed the form (localStorage flag is set), refetch profile once
    const justCompleted = localStorage.getItem('medicalInfoCompleted') === 'true';
    if (justCompleted && !profileLoading && !healthProfile) {
      localStorage.removeItem('medicalInfoCompleted'); // Remove flag immediately to prevent loop
      refetchProfile();
      return;
    }

    // Don't make redirect decisions until we've completed the initial load attempt
    if (!hasCompletedInitialLoad) {
      return;
    }

    // Don't redirect while loading
    if (profileLoading) {
      return;
    }

    // Check if user has skipped the medical info form
    const hasSkippedMedicalInfo = localStorage.getItem('medicalInfoSkipped') === 'true';

    // Redirect to form if no profile or error, BUT NOT if user has skipped
    if ((!hasProfile || profileError) && !hasSkippedMedicalInfo) {
      navigate('/health/medical-info-form?from=medical-records');
      return;
    }

    // Cleanup function to ensure overflow is reset when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [navigate, profileLoading, profileError, hasProfile, hasCompletedInitialLoad]);

  // Separate effect to update userInfo when healthProfile changes
  useEffect(() => {
    if (healthProfile && hasProfile) {
      // Transform API profile data to match the userInfo format
      setUserInfo({
        name: '', // HealthProfile doesn't have name property
        age: healthProfile.dateOfBirth ? (new Date().getFullYear() - new Date(healthProfile.dateOfBirth).getFullYear()).toString() : '',
        gender: healthProfile.gender || '',
        height: healthProfile.height?.toString() || '',
        weight: healthProfile.weight?.toString() || '',
        bloodType: healthProfile.bloodType || '',
        allergies: Array.isArray(healthProfile.allergies) ? healthProfile.allergies.join(', ') : (healthProfile.allergies || ''),
        medications: Array.isArray(healthProfile.medications) ? healthProfile.medications.join(', ') : (healthProfile.medications || ''),
        emergencyContact: healthProfile.emergencyContact?.name || '',
        emergencyPhone: healthProfile.emergencyContact?.phoneNumber?.replace(/^\+\d+(-\d+)?\s*/, '') || ''
      });
    }
  }, [healthProfile, hasProfile]);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const response = await notificationService.getNotifications({ type: 'health', limit: 10 });
        const mappedNotifications = (response.data || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
          isRead: n.status === 'read'
        }));
        setNotifications(mappedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Delete functions

  const deleteTestResult = async (id: string) => {
    try {
      await deleteTestResultMutation.mutate(id);
      // Refetch test results after deletion
      refetchTestResults();
    } catch (error) {
      console.error('Error deleting test result:', error);
      alert('Failed to delete test result. Please try again.');
    }
  };

  const deleteAppointment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteAppointmentMutation.mutate(id);
        // Refetch appointments after deletion
        refetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        await alert({
          title: 'Error',
          message: 'Failed to delete appointment. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const deleteInsurance = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Insurance Record',
      message: 'Are you sure you want to delete this insurance record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteInsuranceMutation.mutate(id);
        // Refetch insurance after deletion
        refetchInsurance();
      } catch (error) {
        console.error('Error deleting insurance:', error);
        await alert({
          title: 'Error',
          message: 'Failed to delete insurance record. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const deleteVitalRecord = async (type: keyof typeof vitalRecords, id: string) => {
    try {
      // Extract the actual vital record ID (remove suffixes like '-total', '-ldl', etc for cholesterol)
      const actualId = id.split('-')[0];

      await deleteVitalRecordMutation.mutate(actualId);

      // Refetch vital records after deletion
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete vital record:', error);
    }
  };

  // Edit functions - these will navigate to forms with prefilled data

  const editTestResult = (test: TestResult) => {
    // Store the test data in localStorage for prefilling
    localStorage.setItem('editingTest', JSON.stringify(test));
    navigate('/health/upload-results?edit=true');
  };

  const editInsurance = (insurance: any) => {
    // Store the insurance data in localStorage for prefilling
    localStorage.setItem('editingInsurance', JSON.stringify(insurance));
    navigate(`/health/add-insurance?edit=${insurance.id}`);
  };

  const editVitalRecord = (record: MedicalRecord, type: string) => {
    // Map vital type to section ID
    const typeToSection: { [key: string]: string } = {
      'Blood Sugar': 'sugar',
      'Blood Pressure': 'bp',
      'Heart Rate': 'heart',
      'Weight & BMI': 'weight',
      'Cholesterol': 'cholesterol',
      'Body Temperature': 'temp'
    };

    const section = typeToSection[type] || 'all';

    // Store the vital record data in localStorage for prefilling
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type }));
    navigate(`/health/add-vital-record?edit=true&section=${section}`);
  };

  // Notification functions
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle tab changes with URL updates
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Sync active tab with URL parameters when they change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['vitals', 'visits', 'tests', 'insurance'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);



  const vitalRecordsData = [
    {
      title: 'Blood Sugar',
      type: 'bloodSugar' as keyof typeof vitalRecords,
      Icon: BloodtypeIcon,
      description: 'Track glucose levels',
      value: vitalRecords.bloodSugar[0]?.value || '--',
      unit: 'mg/dL',
      normalRange: 'Normal: 70-100 mg/dL (fasting)',
      records: vitalRecords.bloodSugar
    },
    {
      title: 'Blood Pressure',
      type: 'bloodPressure' as keyof typeof vitalRecords,
      Icon: MonitorHeartIcon,
      description: 'Monitor cardiovascular health',
      value: vitalRecords.bloodPressure[0]?.value || '--',
      unit: 'mmHg',
      normalRange: 'Normal: <120/80 mmHg',
      records: vitalRecords.bloodPressure
    },
    {
      title: 'Cholesterol',
      type: 'cholesterol' as keyof typeof vitalRecords,
      Icon: ScienceIcon,
      description: 'Track your lipid profile',
      value: vitalRecords.cholesterol[0]?.value || '--',
      unit: 'mg/dL',
      normalRange: 'Total: <200 mg/dL',
      records: vitalRecords.cholesterol
    },
    {
      title: 'Weight & BMI',
      type: 'weight' as keyof typeof vitalRecords,
      Icon: FitnessCenterIcon,
      description: 'Track weight and body mass index',
      value: vitalRecords.weight[0]?.value || '--',
      unit: 'kg',
      normalRange: 'BMI: 18.5-24.9',
      records: vitalRecords.weight
    },
    {
      title: 'Heart Rate',
      type: 'heartRate' as keyof typeof vitalRecords,
      Icon: SpeedIcon,
      description: 'Monitor your pulse and heart rhythm',
      value: vitalRecords.heartRate[0]?.value || '--',
      unit: 'bpm',
      normalRange: 'Resting: 60-100 bpm',
      records: vitalRecords.heartRate
    },
    {
      title: 'Body Temperature',
      type: 'temperature' as keyof typeof vitalRecords,
      Icon: ThermostatIcon,
      description: 'Track your body temperature',
      value: vitalRecords.temperature[0]?.value || '--',
      unit: '°F',
      normalRange: 'Normal: 97.8-99.1°F',
      records: vitalRecords.temperature
    },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Greeting Section */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Good afternoon, {userInfo.name || 'Health Warrior'}! 💪
              </h1>
              <p className="text-lg text-white/60">
                Ready to check your health records today?
              </p>
            </div>
            <Button
              onClick={() => navigate('/health/medical-info-form?edit=true')}
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-md"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Edit Medical Info
            </Button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Track Vitals Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-teal-400/50 hover:bg-white/10"
            onClick={() => navigate('/health/add-vital-record')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-teal-500/20">
                  <ActivityIcon className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Track Vitals</h3>
                <p className="text-white/60 text-sm">Record new measurements</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>

          {/* Browse Records Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10"
            onClick={() => navigate('/health/upload-results')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-emerald-500/20">
                  <ClipboardListIcon className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Results</h3>
                <p className="text-white/60 text-sm">Add test reports</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>

          {/* Schedule Visit Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-red-400/50 hover:bg-white/10"
            onClick={() => navigate('/health/schedule-visit')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-red-500/20">
                  <CalendarIcon className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Schedule Visit</h3>
                <p className="text-white/60 text-sm">Book appointment</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>
          {/* Insurance Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10"
            onClick={() => navigate('/health/add-insurance')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-purple-500/20">
                  <ShieldIcon className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Insurance</h3>
                <p className="text-white/60 text-sm">Manage coverage</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 p-1 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex gap-1">
            {[
              { id: 'vitals', label: 'Vital Signs', icon: ActivityIcon },
              { id: 'visits', label: 'Doctor Visits', icon: StethoscopeIcon },
              { id: 'tests', label: 'Test Results', icon: ClipboardListIcon },
              { id: 'insurance', label: 'Insurance', icon: ShieldIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-1 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                      : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs for Medical Records */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">

          <TabsContent value="vitals" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Vital Signs</h2>
                <p className="text-sm text-white/60 mt-1">Monitor and track your health metrics</p>
              </div>
              <Button
                onClick={() => navigate('/health/add-vital-record')}
                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                <ActivityIcon className="h-4 w-4 mr-2" />
                Add Vital Record
              </Button>
            </div>
            
            {/* AI Doctor Recommendation Card */}
            {(() => {
              const analysis = analyzeVitalsForRecommendations();
              const priorityColors = {
                low: 'bg-green-500/10 border-green-500/30',
                medium: 'bg-yellow-500/10 border-yellow-500/30',
                high: 'bg-red-500/10 border-red-500/30'
              };
              const priorityTextColors = {
                low: 'text-green-400',
                medium: 'text-yellow-400',
                high: 'text-red-400'
              };
              const priorityIcons = {
                low: <TrendingUp className="h-5 w-5 text-green-400" />,
                medium: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
                high: <AlertTriangle className="h-5 w-5 text-red-400" />
              };
              
              return (
                <Card className={`mb-6 rounded-2xl border-2 ${priorityColors[analysis.priority as keyof typeof priorityColors]} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain className="h-32 w-32" />
                  </div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                          <Brain className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                            <span>AI Health Analysis</span>
                            <Sparkles className="h-5 w-5 text-purple-400" />
                          </CardTitle>
                          <CardDescription className="text-sm mt-1 text-white/60">
                            Personalized doctor recommendations based on your vitals
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {priorityIcons[analysis.priority as keyof typeof priorityIcons]}
                        <Badge variant={analysis.priority === 'high' ? 'destructive' : analysis.priority === 'medium' ? 'secondary' : 'default'}>
                          {analysis.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {analysis.concerns.length > 0 && (
                      <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-white">
                          <LucideActivity className="h-4 w-4" />
                          Health Concerns Detected:
                        </h4>
                        <ul className="space-y-1">
                          {analysis.concerns.map((concern, idx) => (
                            <li key={idx} className={`text-sm ${priorityTextColors[analysis.priority as keyof typeof priorityTextColors]} flex items-center gap-2`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-white">
                        <StethoscopeIcon className="h-4 w-4" />
                        Recommended Specialists:
                      </h4>
                      {analysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="h-5 w-5 text-teal-400" />
                                <span className="font-semibold text-white">
                                  {rec.doctor}
                                </span>
                              </div>
                              <p className="text-sm text-white/60 mb-2">
                                {rec.reason}
                              </p>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-white/40" />
                                <span className="text-xs font-medium text-white/70">
                                  {rec.urgency}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => navigate('/health/schedule-visit')}
                              className="ml-4 bg-white/10 border border-white/20 text-white hover:bg-white/20"
                            >
                              Schedule
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-xs text-blue-400 flex items-start gap-2">
                        <AlertCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          This AI analysis is based on your recorded vital signs and should not replace professional medical advice.
                          Always consult with healthcare providers for accurate diagnosis and treatment.
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vitalRecordsData.map((category, index) => {
                const IconComponent = category.Icon;
                return (
                  <Card
                    key={index}
                    className="rounded-xl hover:shadow-xl transition-all duration-300 bg-white/5 border border-white/10 hover:border-teal-400/30 overflow-hidden group relative"
                  >
                    {/* Card Header with Gradient Background */}
                    <div className="p-6 pb-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-teal-500/20">
                          <IconComponent className="h-6 w-6 text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-white">
                            {category.title}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      {category.normalRange && (
                        <div className="mt-3 p-2 rounded-full inline-flex items-center bg-teal-500/20">
                          <span className="text-xs font-medium px-2 text-teal-400">
                            {category.normalRange}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-2 space-y-3">
                      {/* Current Value Display */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-white/40 mb-1">Latest Reading</p>
                            <p className="text-3xl font-bold text-white">
                              {category.value}
                              <span className="text-sm font-normal text-white/40 ml-2">
                                {category.unit}
                              </span>
                            </p>
                            <p className="text-xs text-white/40 mt-2">
                              {category.records[0]?.date || 'No data'}
                              {category.records[0]?.notes && (
                                <span className="ml-2">• {category.records[0]?.notes}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="rounded-full px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Normal
                            </Badge>
                            {category.records[0] && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  onClick={() => editVitalRecord(category.records[0], category.title)}
                                  className="h-7 w-7 p-0 rounded-full bg-transparent hover:bg-teal-500/20 text-teal-400"
                                >
                                  <EditIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => deleteVitalRecord(category.type, category.records[0].id)}
                                  className="h-7 w-7 p-0 rounded-full bg-transparent hover:bg-red-500/20 text-red-400"
                                >
                                  <DeleteIcon className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recent Readings */}
                      {/* {category.records.length > 1 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <ClockIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                            <p className="text-xs font-semibold text-white/70">
                              Previous Readings
                            </p>
                          </div>
                          {category.records.slice(1, 3).map((record) => (
                            <div key={record.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 group">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white">
                                    {record.value} {record.unit}
                                  </span>
                                  {record.notes && (
                                    <span className="text-xs text-white/50">
                                      • {record.notes}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 mt-1">
                                  {record.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editVitalRecord(record, category.title)}
                                  className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
                                >
                                  <EditIcon className="h-3.5 w-3.5" style={{ color: 'rgb(71, 189, 255)' }} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteVitalRecord(category.type, record.id)}
                                  className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10"
                                >
                                  <DeleteIcon className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )} */}

                      {/* View All Button */}
                      <Button
                        className="w-full mt-3 rounded-xl border-2 border-teal-500/30 bg-transparent text-teal-400 hover:bg-teal-500/10 hover:border-teal-500"
                        size="sm"
                        onClick={() => {
                          const routeMap: { [key: string]: string } = {
                            'Blood Sugar': '/health/blood-sugar-records',
                            'Blood Pressure': '/health/blood-pressure-records',
                            'Heart Rate': '/health/heart-rate-records',
                            'Weight & BMI': '/health/weight-records',
                            'Cholesterol': '/health/cholesterol-records',
                            'Body Temperature': '/health/temperature-records'
                          };
                          const route = routeMap[category.title] || '/health/medical-records';
                          navigate(route);
                        }}
                      >
                        View All {category.title} Records →
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="visits" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Doctor Visits</h2>
                <p className="text-sm text-white/60 mt-1">Track your medical appointments and consultations</p>
              </div>
              <Button 
                onClick={() => navigate('/health/schedule-visit')} 
                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>
            </div>

            {appointmentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-white/60">Loading appointments...</span>
              </div>
            ) : appointmentsError ? (
              <Card className="rounded-xl p-8 text-center border border-red-500/30 bg-red-500/10">
                <div className="text-red-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Error loading appointments</p>
                  <p className="text-sm mt-1">Please try refreshing the page</p>
                </div>
              </Card>
            ) : appointmentsData && appointmentsData.data && appointmentsData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointmentsData.data.map((appointment) => (
                  <Card 
                    key={appointment.id} 
                    className="rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-white/10 bg-white/5 hover:border-teal-500/30 overflow-hidden group relative"
                  >
                    {/* Status Badge - Top Right Corner */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        variant={appointment.status === 'scheduled' ? 'default' : appointment.status === 'completed' ? 'secondary' : 'destructive'}
                        className="rounded-full px-3 py-1 text-xs font-semibold shadow-md"
                        style={{
                          backgroundColor: appointment.status === 'scheduled' ? 'rgb(71, 189, 255)' : 
                                         appointment.status === 'completed' ? 'rgb(34, 197, 94)' : 
                                         'rgb(239, 68, 68)',
                          color: 'white'
                        }}
                      >
                        {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Scheduled'}
                      </Badge>
                    </div>

                    {/* Card Header with Gradient Background */}
                    <div className="p-6 pb-4" style={{ 
                      background: `linear-gradient(135deg, rgb(71, 189, 255, 0.05) 0%, rgb(71, 189, 255, 0.1) 100%)`
                    }}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.15)' }}>
                          <StethoscopeIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-white line-clamp-1">
                            {appointment.provider_name || appointment.providerName}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            {appointment.provider_specialty || appointment.providerSpecialty || 'Medical Professional'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-2 space-y-3">
                      {/* Date and Time */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <CalendarDaysIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">
                            {appointment.status === 'scheduled' ? 'Scheduled for' : 'Visited on'}
                          </p>
                          <p className="font-semibold text-sm text-white">
                            {(() => {
                              const dateStr = appointment.appointment_date || appointment.appointmentDate;
                              return dateStr ? new Date(dateStr).toLocaleDateString() : 'Date not specified';
                            })()} at {(() => {
                              const dateStr = appointment.appointment_date || appointment.appointmentDate;
                              return dateStr ? new Date(dateStr).toLocaleTimeString() : 'Time not specified';
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Appointment Type */}
                      <div className="flex items-start gap-3">
                        <FileTextIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Appointment Type</p>
                          <p className="text-sm text-white/70 font-medium line-clamp-2">
                            {(appointment.appointment_type || appointment.appointmentType || 'consultation').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      {appointment.location && (
                        <div className="flex items-start gap-3">
                          <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                          <p className="text-sm text-white/60 line-clamp-2">
                            {appointment.location}
                          </p>
                        </div>
                      )}

                      {/* Reason */}
                      {appointment.reason && (
                        <div className="flex items-start gap-3">
                          <ClipboardListIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                          <div className="flex-1">
                            <p className="text-xs text-white/50">Reason</p>
                            <p className="text-sm text-white/70 font-medium line-clamp-2">
                              {appointment.reason}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Duration */}
                      {appointment.duration_minutes && (
                        <div className="flex items-start gap-3">
                          <ClockIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                          <div className="flex-1">
                            <p className="text-xs text-white/50">Duration</p>
                            <p className="text-sm text-white/70 font-medium">
                              {appointment.duration_minutes} minutes
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes (if available) */}
                      {appointment.notes && (
                        <div className="p-3 rounded-xl bg-yellow-500/10">
                          <p className="text-xs text-yellow-400 font-medium mb-1">Notes</p>
                          <p className="text-xs text-white/70 italic line-clamp-2">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      {/* Reminder */}
                      {appointment.reminder_minutes && (
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                          <div className="flex items-center gap-2">
                            <NotificationsIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                            <p className="text-xs font-medium" style={{ color: 'rgb(71, 189, 255)' }}>
                              Reminder: {appointment.reminder_minutes} minutes before
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Bottom */}
                    <div className="px-6 pb-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          size="sm"
                          onClick={() => navigate('/health/schedule-visit?edit=' + appointment.id)}
                          disabled={deleteAppointmentMutation.loading}
                          className="flex-1 rounded-xl border-2 border-teal-500/30 bg-transparent text-teal-400 hover:border-teal-500 hover:bg-teal-500/10"
                        >
                          <EditIcon className="h-4 w-4 mr-2 text-teal-400" />
                          <span className="text-teal-400">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteAppointment(appointment.id)}
                          disabled={deleteAppointmentMutation.loading}
                          className="flex-1 rounded-xl border-2 border-red-500/30 bg-transparent text-red-400 hover:border-red-500 hover:bg-red-500/10"
                        >
                          {deleteAppointmentMutation.loading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full mr-2" />
                          ) : (
                            <DeleteIcon className="h-4 w-4 mr-2 text-red-400" />
                          )}
                          <span className="text-red-400">
                            {deleteAppointmentMutation.loading ? 'Deleting...' : 'Delete'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-xl p-12 text-center bg-white/5 border border-white/10">
                <div className="max-w-md mx-auto">
                  <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6" 
                       style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                    <StethoscopeIcon className="h-10 w-10" style={{ color: 'rgb(71, 189, 255)' }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Doctor Visits Yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Start tracking your medical appointments to keep a comprehensive health record
                  </p>
                  <Button 
                    onClick={() => navigate('/health/schedule-visit')}
                    className="rounded-xl px-6"
                    style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Your First Visit
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Test Results</h2>
                <p className="text-sm text-white/60 mt-1">Store and track your medical test results</p>
              </div>
              <Button 
                onClick={() => navigate('/health/upload-results')} 
                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload Results
              </Button>
            </div>

            {testResultsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">Loading test results...</p>
                </div>
              </div>
            ) : testResultsError ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{String(testResultsError) || 'Failed to load test results'}</p>
                <Button 
                  onClick={() => refetchTestResults()}
                  className="rounded-xl"
                >
                  Try Again
                </Button>
              </div>
            ) : testResultsData?.data && testResultsData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testResultsData.data.map((test: any) => (
                  <Card 
                    key={test.id} 
                    className="rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-white/10 bg-white/5 hover:border-teal-500/30 overflow-hidden group relative"
                  >
                    {/* Status Badge - Top Right Corner */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className="rounded-full px-3 py-1 text-xs font-semibold shadow-md"
                        style={{
                          backgroundColor: test.status === 'completed' ? 'rgb(34, 197, 94)' : 
                                         test.status === 'abnormal' ? 'rgb(239, 68, 68)' : 
                                         test.status === 'pending' ? 'rgb(251, 146, 60)' :
                                         'rgb(71, 189, 255)',
                          color: 'white'
                        }}
                      >
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Card Header with Gradient Background */}
                    <div className="p-6 pb-4" style={{ 
                      background: `linear-gradient(135deg, rgb(71, 189, 255, 0.05) 0%, rgb(71, 189, 255, 0.1) 100%)`
                    }}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.15)' }}>
                          <ClipboardListIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-white line-clamp-1">
                            {test.test_name || test.testName}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            {test.test_type || test.testType}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-2 space-y-3">
                      {/* Test Dates */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <CalendarDaysIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-white/50">Test Date</p>
                              <p className="font-semibold text-sm text-white">
                                {test.test_date ? new Date(test.test_date).toLocaleDateString() : test.testDate}
                              </p>
                            </div>
                            {test.resultDate && (
                              <div className="text-right">
                                <p className="text-xs text-white/50">Result Date</p>
                                <p className="font-semibold text-sm text-white">
                                  {test.result_date ? new Date(test.result_date).toLocaleDateString() : test.resultDate}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ordered By */}
                      <div className="flex items-start gap-3">
                        <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Ordered by</p>
                          <p className="text-sm text-white/70 font-medium">
                            {test.ordered_by || test.orderedBy}
                          </p>
                        </div>
                      </div>

                      {/* Laboratory */}
                      <div className="flex items-start gap-3">
                        <BuildingIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Laboratory</p>
                          <p className="text-sm text-white/70 font-medium line-clamp-2">
                            {test.lab_name || test.laboratory}
                          </p>
                        </div>
                      </div>

                      {/* Test Results (if available) */}
                      {((test.test_parameters && test.test_parameters.length > 0) || (test.results && test.results.length > 0)) && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <ActivityIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                            <p className="text-xs font-semibold text-white/70">Key Results</p>
                          </div>
                          <div className="space-y-2">
                            {(test.test_parameters || test.results || []).slice(0, 3).map((result: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-xs text-white/60">
                                  {result.parameter}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${
                                    result.flag === 'high' ? 'text-red-400' :
                                    result.flag === 'low' ? 'text-blue-400' :
                                    'text-green-400'
                                  }`}>
                                    {result.value} {result.unit}
                                  </span>
                                  {result.flag && result.flag !== 'normal' && (
                                    <Badge 
                                      variant={result.flag === 'high' ? 'destructive' : 'default'}
                                      className="text-xs px-1.5 py-0 h-4"
                                    >
                                      {result.flag}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            {(test.test_parameters || test.results || []).length > 3 && (
                              <p className="text-xs text-center pt-1" style={{ color: 'rgb(71, 189, 255)' }}>
                                +{(test.test_parameters || test.results || []).length - 3} more results
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes (if available) */}
                      {test.notes && (
                        <div className="p-3 rounded-xl bg-yellow-500/10">
                          <p className="text-xs text-yellow-400 font-medium mb-1">Notes</p>
                          <p className="text-xs text-white/70 italic line-clamp-2">
                            {test.notes}
                          </p>
                        </div>
                      )}

                      {/* Status Indicator for Pending Results */}
                      {test.status === 'pending' && (
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(251, 146, 60, 0.1)' }}>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" style={{ color: 'rgb(251, 146, 60)' }} />
                            <p className="text-xs font-medium" style={{ color: 'rgb(251, 146, 60)' }}>
                              Results Pending
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Bottom */}
                    <div className="px-6 pb-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          size="sm"
                          onClick={() => editTestResult(test)}
                          className="flex-1 rounded-xl border-2 border-teal-500/30 bg-transparent text-teal-400 hover:border-teal-500 hover:bg-teal-500/10"
                        >
                          <EditIcon className="h-4 w-4 mr-2 text-teal-400" />
                          <span className="text-teal-400">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteTestResult(test.id)}
                          className="flex-1 rounded-xl border-2 border-red-500/30 bg-transparent text-red-400 hover:border-red-500 hover:bg-red-500/10"
                        >
                          <DeleteIcon className="h-4 w-4 mr-2 text-red-400" />
                          <span className="text-red-400">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-xl p-12 text-center bg-white/5 border border-white/10">
                <div className="max-w-md mx-auto">
                  <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6" 
                       style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                    <ClipboardListIcon className="h-10 w-10" style={{ color: 'rgb(71, 189, 255)' }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Test Results Yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Upload your lab reports and test results to keep track of your medical history
                  </p>
                  <Button 
                    onClick={() => navigate('/health/upload-results')}
                    className="rounded-xl px-6"
                    style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload Your First Result
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Medical Insurance</h2>
                <p className="text-sm text-white/60 mt-1">Manage your insurance policies and coverage details</p>
              </div>
              <Button 
                onClick={() => navigate('/health/add-insurance')} 
                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
              >
                <ShieldIcon className="h-4 w-4 mr-2" />
                Add Insurance
              </Button>
            </div>

            {insuranceLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">Loading insurance records...</p>
                </div>
              </div>
            ) : insuranceError ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{String(insuranceError) || 'Failed to load insurance records'}</p>
                <Button 
                  onClick={() => refetchInsurance()}
                  className="rounded-xl"
                >
                  Try Again
                </Button>
              </div>
            ) : insuranceData?.data && insuranceData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insuranceData.data.map((insurance) => (
                  <Card 
                    key={insurance.id} 
                    className="rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-white/10 bg-white/5 hover:border-teal-500/30 overflow-hidden group relative"
                  >
                    {/* Status Badge - Top Right Corner */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className="rounded-full px-3 py-1 text-xs font-semibold shadow-md"
                        style={{
                          backgroundColor: (insurance.status || 'active') === 'active' ? 'rgb(34, 197, 94)' : 
                                         (insurance.status || 'active') === 'expired' ? 'rgb(239, 68, 68)' : 
                                         'rgb(156, 163, 175)',
                          color: 'white'
                        }}
                      >
                        {(insurance.status || 'active').charAt(0).toUpperCase() + (insurance.status || 'active').slice(1)}
                      </Badge>
                    </div>

                    {/* Card Header with Gradient Background */}
                    <div className="p-6 pb-4" style={{ 
                      background: `linear-gradient(135deg, rgb(71, 189, 255, 0.05) 0%, rgb(71, 189, 255, 0.1) 100%)`
                    }}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.15)' }}>
                          <ShieldIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                        </div>
                        <div className="flex-1 pr-12">
                          <h4 className="font-bold text-lg text-white line-clamp-1">
                            {insurance.provider}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            {insurance.plan_type || insurance.planType}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-2 space-y-3">
                      {/* Policy Information */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCardIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                          <p className="text-xs font-semibold text-white/70">Policy Details</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-white/60">
                            <span className="text-xs text-white/50">Policy #:</span> <span className="font-medium text-white">{insurance.policy_number || insurance.policyNumber}</span>
                          </p>
                          {(insurance.group_number || insurance.groupNumber) && (
                            <p className="text-sm text-white/60">
                              <span className="text-xs text-white/50">Group #:</span> <span className="font-medium text-white">{insurance.group_number || insurance.groupNumber}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Member Information */}
                      <div className="flex items-start gap-3">
                        <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Member</p>
                          <p className="text-sm text-white/70 font-medium">
                            {insurance.member_name || insurance.memberName}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            ID: {insurance.member_id || insurance.memberId}
                          </p>
                        </div>
                      </div>

                      {/* Coverage Period */}
                      <div className="flex items-start gap-3">
                        <CalendarDaysIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(71, 189, 255)' }} />
                        <div className="flex-1">
                          <p className="text-xs text-white/50">Coverage Period</p>
                          <p className="text-sm text-white/70 font-medium">
                            {(() => {
                              const effectiveDate = insurance.effective_date || insurance.effectiveDate;
                              const expirationDate = insurance.expiration_date || insurance.expirationDate;
                              return `${effectiveDate ? new Date(effectiveDate).toLocaleDateString() : 'Not specified'} - ${expirationDate ? new Date(expirationDate).toLocaleDateString() : 'Ongoing'}`;
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Financial Details */}
                      {(insurance.copay_primary || insurance.deductible || insurance.out_of_pocket_max) && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-2">
                            {(insurance.copay_primary || insurance.copayPrimary) && (
                              <div className="p-2 rounded-lg bg-emerald-500/10">
                                <p className="text-xs text-emerald-400">Copay</p>
                                <p className="text-sm font-bold text-emerald-300">
                                  {insurance.copay_primary || insurance.copayPrimary}
                                </p>
                              </div>
                            )}
                            {insurance.deductible && (
                              <div className="p-2 rounded-lg bg-blue-500/10">
                                <p className="text-xs text-blue-400">Deductible</p>
                                <p className="text-sm font-bold text-blue-300">
                                  {insurance.deductible}
                                </p>
                              </div>
                            )}
                            {(insurance.out_of_pocket_max || insurance.outOfPocketMax) && (
                              <div className="p-2 rounded-lg bg-purple-500/10 col-span-2">
                                <p className="text-xs text-purple-400">Out-of-Pocket Max</p>
                                <p className="text-sm font-bold text-purple-300">
                                  {insurance.out_of_pocket_max || insurance.outOfPocketMax}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Coverage Details (if available) */}
                      {(() => {
                        const coverageDetails = insurance.coverage_details || insurance.coverageDetails;
                        return coverageDetails && coverageDetails.length > 0;
                      })() && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardListIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                            <p className="text-xs font-semibold text-white/70">Coverage</p>
                          </div>
                          <div className="space-y-1">
                            {(insurance.coverage_details || insurance.coverageDetails || []).slice(0, 2).map((coverage: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-xs text-white/60">
                                  {coverage.service}
                                </span>
                                <span className="text-xs font-bold text-white">
                                  {coverage.coverage}
                                </span>
                              </div>
                            ))}
                            {(insurance.coverage_details || insurance.coverageDetails || []).length > 2 && (
                              <p className="text-xs text-center pt-1" style={{ color: 'rgb(71, 189, 255)' }}>
                                +{(insurance.coverage_details || insurance.coverageDetails || []).length - 2} more services
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Information (if available) */}
                      {(insurance.insurance_phone || insurance.phone) && (
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                            <p className="text-xs font-medium" style={{ color: 'rgb(71, 189, 255)' }}>
                              {insurance.insurance_phone || insurance.phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Bottom */}
                    <div className="px-6 pb-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          size="sm"
                          onClick={() => editInsurance(insurance)}
                          className="flex-1 rounded-xl border-2 border-teal-500/30 bg-transparent text-teal-400 hover:border-teal-500 hover:bg-teal-500/10"
                        >
                          <EditIcon className="h-4 w-4 mr-2 text-teal-400" />
                          <span className="text-teal-400">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteInsurance(insurance.id)}
                          disabled={deleteInsuranceMutation.loading}
                          className="flex-1 rounded-xl border-2 border-red-500/30 bg-transparent text-red-400 hover:border-red-500 hover:bg-red-500/10"
                        >
                          {deleteInsuranceMutation.loading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full mr-2" />
                          ) : (
                            <DeleteIcon className="h-4 w-4 mr-2 text-red-400" />
                          )}
                          <span className="text-red-400">
                            {deleteInsuranceMutation.loading ? 'Deleting...' : 'Delete'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-xl p-12 text-center bg-white/5 border border-white/10">
                <div className="max-w-md mx-auto">
                  <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6" 
                       style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                    <ShieldIcon className="h-10 w-10" style={{ color: 'rgb(71, 189, 255)' }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Insurance Information Yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Add your insurance details for quick reference during medical visits
                  </p>
                  <Button 
                    onClick={() => navigate('/health/add-insurance')}
                    className="rounded-xl px-6"
                    style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
                  >
                    <ShieldIcon className="h-4 w-4 mr-2" />
                    Add Your First Insurance
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>


    </div>
  );
};

export default MedicalRecordsPage;