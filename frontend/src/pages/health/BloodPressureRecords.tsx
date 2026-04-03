import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useVitalRecords, useDeleteVitalRecord } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import {
  Favorite as HeartIcon,
  TrendingUp,
  TrendingDown,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Warning as AlertIcon,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonitorHeart as MonitorHeartIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ShowChartIcon,
  DonutLarge as DonutLargeIcon,
  BarChart as BarChartIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  ChevronRight as ChevronRightIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';

interface BloodPressureRecord {
  id: string;
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  unit: string;
  notes?: string;
}

const BloodPressureRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, refetch: refetchVitalRecords } = useVitalRecords();
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Transform API data to blood pressure records
  useEffect(() => {
    const apiRecords = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (apiRecords && Array.isArray(apiRecords)) {
      const bloodPressureRecords: BloodPressureRecord[] = apiRecords
        .filter((record: any) => record.systolic && record.diastolic)
        .map((record: any) => ({
          id: record.id,
          date: record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '',
          time: record.recordTime || '',
          systolic: record.systolic,
          diastolic: record.diastolic,
          pulse: record.heartRate,
          unit: 'mmHg',
          notes: record.notes || ''
        }))
        .reverse(); // Show newest first

      setRecords(bloodPressureRecords);
    }
  }, [vitalRecordsApiData]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteVitalRecordMutation.mutate(id);
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete blood pressure record:', error);
    }
  };

  const editRecord = (record: BloodPressureRecord) => {
    // Store the record data in localStorage for prefilling
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type: 'bloodPressure' }));
    navigate('/health/add-vital-record?edit=true');
  };

  const getStatusColor = (systolic: number, diastolic: number) => {
    if (systolic < 90 || diastolic < 60) return 'text-blue-600'; // Hypotension
    if (systolic < 120 && diastolic < 80) return 'text-green-600'; // Normal
    if (systolic < 130 && diastolic < 80) return 'text-yellow-600'; // Elevated
    if (systolic < 140 || diastolic < 90) return 'text-orange-600'; // Stage 1 Hypertension
    return 'text-red-600'; // Stage 2 Hypertension
  };

  const getStatusText = (systolic: number, diastolic: number) => {
    if (systolic < 90 || diastolic < 60) return 'Low';
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic < 140 || diastolic < 90) return 'High Stage 1';
    return 'High Stage 2';
  };

  const averageSystolic = records.length > 0 
    ? Math.round(records.reduce((sum, record) => sum + record.systolic, 0) / records.length)
    : 0;

  const averageDiastolic = records.length > 0 
    ? Math.round(records.reduce((sum, record) => sum + record.diastolic, 0) / records.length)
    : 0;

  const averagePulse = records.length > 0 
    ? Math.round(records.filter(r => r.pulse).reduce((sum, record) => sum + (record.pulse || 0), 0) / records.filter(r => r.pulse).length)
    : 0;

  const trendDirection = records.length >= 2
    ? records[0].systolic > records[1].systolic ? 'up' : 'down'
    : 'neutral';

  const highReadings = records.filter(r => r.systolic >= 130 || r.diastolic >= 80).length;

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Blood Pressure Records', icon: MonitorHeartIcon }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/20 border border-teal-400/30">
          <h1 className="text-3xl font-bold text-white mb-2">
            Blood Pressure Monitoring 💓
          </h1>
          <p className="text-lg text-white/60">
            Track your cardiovascular health and monitor blood pressure trends
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Add Reading Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-400/50"
            onClick={() => navigate('/health/add-vital-record')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-teal-500/20">
                  <Plus className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Add Reading</h3>
                <p className="text-white/60 text-sm">Record BP levels</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>

          {/* View Trends Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-400/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-teal-500/20">
                  <TrendingUp className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">View Trends</h3>
                <p className="text-white/60 text-sm">Analyze patterns</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>

          {/* Set Reminders Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-400/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-teal-500/20">
                  <CalendarIcon className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Set Reminders</h3>
                <p className="text-white/60 text-sm">Check-up schedule</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/40" />
            </div>
          </Card>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {averageSystolic}/{averageDiastolic}
                </p>
                <p className="text-sm font-medium text-white/60">Average BP</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-500/20">
                <MonitorHeartIcon className="h-8 w-8 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {averagePulse}
                </p>
                <p className="text-sm font-medium text-white/60">Avg Pulse</p>
              </div>
              <div className="p-4 rounded-2xl bg-green-500/20">
                <HeartIcon className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-white">
                    {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
                  </p>
                  {trendDirection === 'up' && <TrendingUp className="h-6 w-6 text-red-400" />}
                  {trendDirection === 'down' && <TrendingDown className="h-6 w-6 text-green-400" />}
                </div>
                <p className="text-sm font-medium text-white/60">Trend</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-500/20">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {highReadings}
                </p>
                <p className="text-sm font-medium text-white/60">High Readings</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-500/20">
                <AlertIcon className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Line Chart - BP Trends Over Time */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <ShowChartIcon className="h-5 w-5 text-teal-400" />
                Blood Pressure Trends
              </CardTitle>
              <CardDescription className="text-sm text-white/60">Systolic and diastolic variations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={records.map(record => ({
                      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      systolic: record.systolic,
                      diastolic: record.diastolic,
                      fullDate: record.date,
                      time: record.time
                    })).reverse()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[60, 160]} tick={{ fontSize: 12 }} label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
                                Systolic: {payload[0]?.value} mmHg
                              </p>
                              <p className="text-sm" style={{ color: 'rgb(71, 189, 255)' }}>
                                Diastolic: {payload[1]?.value} mmHg
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={120} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Normal Systolic", position: "left", fontSize: 10 }} />
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Normal Diastolic", position: "left", fontSize: 10 }} />
                    <Line type="monotone" dataKey="systolic" stroke="rgb(239, 68, 68)" strokeWidth={3} dot={{ fill: 'rgb(239, 68, 68)', r: 4 }} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="rgb(71, 189, 255)" strokeWidth={3} dot={{ fill: 'rgb(71, 189, 255)', r: 4 }} name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        
          {/* Scatter Plot - Systolic vs Diastolic */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <TimelineIcon className="h-5 w-5 text-teal-400" />
                BP Correlation Analysis
              </CardTitle>
              <CardDescription className="text-sm text-white/60">Systolic vs Diastolic relationship</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="systolic" name="Systolic" tick={{ fontSize: 12 }} label={{ value: 'Systolic (mmHg)', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="diastolic" name="Diastolic" tick={{ fontSize: 12 }} label={{ value: 'Diastolic (mmHg)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="BP Readings" data={records} fill="rgb(71, 189, 255)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribution by Range */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <DonutLargeIcon className="h-5 w-5 text-teal-400" />
                Reading Distribution
              </CardTitle>
              <CardDescription className="text-sm text-white/60">Breakdown by BP categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Normal', value: records.filter(r => r.systolic < 120 && r.diastolic < 80).length, color: 'rgb(34, 197, 94)' },
                        { name: 'Elevated', value: records.filter(r => (r.systolic >= 120 && r.systolic < 130) && r.diastolic < 80).length, color: 'rgb(251, 146, 60)' },
                        { name: 'Stage 1', value: records.filter(r => (r.systolic >= 130 && r.systolic < 140) || (r.diastolic >= 80 && r.diastolic < 90)).length, color: 'rgb(239, 68, 68)' },
                        { name: 'Stage 2', value: records.filter(r => r.systolic >= 140 || r.diastolic >= 90).length, color: 'rgb(127, 29, 29)' },
                        { name: 'Low', value: records.filter(r => r.systolic < 90 || r.diastolic < 60).length, color: 'rgb(59, 130, 246)' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { color: 'rgb(34, 197, 94)' },
                        { color: 'rgb(251, 146, 60)' },
                        { color: 'rgb(239, 68, 68)' },
                        { color: 'rgb(127, 29, 29)' },
                        { color: 'rgb(59, 130, 246)' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Area Chart - Pulse Rate Pattern */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <SpeedIcon className="h-5 w-5 text-teal-400" />
                Pulse Rate Analysis
              </CardTitle>
              <CardDescription className="text-sm text-white/60">Heart rate patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={records.filter(r => r.pulse).map(record => ({
                      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      pulse: record.pulse,
                      normal: 75
                    })).reverse()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="normal" stroke="rgb(34, 197, 94)" fill="rgb(34, 197, 94, 0.1)" strokeWidth={2} name="Normal Range" />
                    <Area type="monotone" dataKey="pulse" stroke="rgb(71, 189, 255)" fill="rgb(71, 189, 255, 0.3)" strokeWidth={3} name="Your Pulse" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MonitorHeartIcon className="h-6 w-6 text-teal-400" />
              Recent Blood Pressure Readings
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Normal: &lt;120/80 mmHg • Elevated: 120-129/&lt;80 • High: ≥130/80
            </p>
          </div>
          <Button
            onClick={() => navigate('/health/add-vital-record')}
            className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
        </div>

        {/* Records Grid - 3 Cards per Row */}
        {records.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
              <Card 
                key={record.id} 
                className="rounded-2xl hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden group relative"
              >
                {/* Status Badge - Top Right Corner */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    className="rounded-full px-3 py-1 text-xs font-semibold shadow-md"
                    style={{
                      backgroundColor: getStatusColor(record.systolic, record.diastolic) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                                     getStatusColor(record.systolic, record.diastolic) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                                     getStatusColor(record.systolic, record.diastolic) === 'text-orange-600' ? 'rgb(251, 146, 60)' :
                                     getStatusColor(record.systolic, record.diastolic) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                                     'rgb(59, 130, 246)',
                      color: 'white'
                    }}
                  >
                    {getStatusText(record.systolic, record.diastolic)}
                  </Badge>
                </div>

                {/* Card Header with Gradient Background */}
                <div className="p-6 pb-4" style={{ 
                  background: `linear-gradient(135deg, rgb(71, 189, 255, 0.05) 0%, rgb(71, 189, 255, 0.1) 100%)`
                }}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.15)' }}>
                      <MonitorHeartIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                    </div>
                    <div className="flex-1 pr-12">
                      <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {record.systolic}/{record.diastolic}
                        <span className="text-sm font-normal text-gray-500 ml-2">{record.unit}</span>
                      </h4>
                      {record.pulse && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <HeartIcon className="h-4 w-4" style={{ color: 'rgb(239, 68, 68)' }} />
                          Pulse: {record.pulse} bpm
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 pt-2 space-y-3">
                  {/* Time Information */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <ScheduleIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Measurement Time</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" style={{ color: 'rgb(71, 189, 255)' }} />
                          Date
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" style={{ color: 'rgb(71, 189, 255)' }} />
                          Time
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="p-3 rounded-xl" style={{ 
                    backgroundColor: getStatusColor(record.systolic, record.diastolic) === 'text-green-600' ? 'rgb(34, 197, 94, 0.1)' :
                                   getStatusColor(record.systolic, record.diastolic) === 'text-yellow-600' ? 'rgb(251, 146, 60, 0.1)' :
                                   getStatusColor(record.systolic, record.diastolic) === 'text-orange-600' ? 'rgb(251, 146, 60, 0.1)' :
                                   getStatusColor(record.systolic, record.diastolic) === 'text-red-600' ? 'rgb(239, 68, 68, 0.1)' :
                                   'rgb(59, 130, 246, 0.1)'
                  }}>
                    <div className="flex items-center gap-2">
                      <AssessmentIcon className="h-4 w-4" style={{ 
                        color: getStatusColor(record.systolic, record.diastolic) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                               getStatusColor(record.systolic, record.diastolic) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                               getStatusColor(record.systolic, record.diastolic) === 'text-orange-600' ? 'rgb(251, 146, 60)' :
                               getStatusColor(record.systolic, record.diastolic) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                               'rgb(59, 130, 246)'
                      }} />
                      <p className="text-xs font-medium" style={{ 
                        color: getStatusColor(record.systolic, record.diastolic) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                               getStatusColor(record.systolic, record.diastolic) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                               getStatusColor(record.systolic, record.diastolic) === 'text-orange-600' ? 'rgb(251, 146, 60)' :
                               getStatusColor(record.systolic, record.diastolic) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                               'rgb(59, 130, 246)'
                      }}>
                        {getStatusColor(record.systolic, record.diastolic) === 'text-green-600' ? 'Within normal range' :
                         getStatusColor(record.systolic, record.diastolic) === 'text-yellow-600' ? 'Slightly elevated' :
                         getStatusColor(record.systolic, record.diastolic) === 'text-orange-600' ? 'Stage 1 Hypertension' :
                         getStatusColor(record.systolic, record.diastolic) === 'text-red-600' ? 'Stage 2 Hypertension' :
                         'Hypotension - Low BP'}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="text-xs text-yellow-800 dark:text-yellow-400 font-medium mb-1">Notes</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Bottom */}
                <div className="px-6 pb-4">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editRecord(record)}
                      className="flex-1 rounded-xl border-2 hover:border-primary hover:bg-primary/10"
                      style={{ borderColor: 'rgb(71, 189, 255, 0.3)' }}
                    >
                      <EditIcon className="h-4 w-4 mr-2" style={{ color: 'rgb(71, 189, 255)' }} />
                      <span style={{ color: 'rgb(71, 189, 255)' }}>Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                      className="flex-1 rounded-xl border-2 hover:border-destructive hover:bg-destructive/10"
                    >
                      <DeleteIcon className="h-4 w-4 mr-2 text-destructive" />
                      <span className="text-destructive">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6 bg-teal-500/20">
                <MonitorHeartIcon className="h-10 w-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Blood Pressure Readings Yet
              </h3>
              <p className="text-white/60 mb-6">
                Start tracking your blood pressure to monitor cardiovascular health
              </p>
              <Button
                onClick={() => navigate('/health/add-vital-record')}
                className="rounded-xl px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Reading
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default BloodPressureRecords;