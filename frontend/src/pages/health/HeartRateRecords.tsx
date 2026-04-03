import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useVitalRecords, useDeleteVitalRecord } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  FavoriteBorder as HeartRateIcon,
  TrendingUp,
  TrendingDown,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Warning as AlertIcon,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsRun as ActivityIcon,
  ShowChart as ChartIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon
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

interface HeartRateRecord {
  id: string;
  date: string;
  time: string;
  value: number;
  unit: string;
  type: 'resting' | 'active' | 'exercise' | 'recovery';
  notes?: string;
}

const HeartRateRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HeartRateRecord[]>([]);

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, refetch: refetchVitalRecords } = useVitalRecords();
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Transform API data to heart rate records
  useEffect(() => {
    const apiRecords = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (apiRecords && Array.isArray(apiRecords)) {
      const heartRateRecords: HeartRateRecord[] = apiRecords
        .filter((record: any) => record.heartRate)
        .map((record: any) => ({
          id: record.id,
          date: record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '',
          time: record.recordTime || '',
          value: record.heartRate,
          unit: 'bpm',
          type: 'resting', // Default to resting, can be enhanced based on context
          notes: record.notes || ''
        }))
        .reverse(); // Show newest first

      setRecords(heartRateRecords);
    }
  }, [vitalRecordsApiData]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteVitalRecordMutation.mutate(id);
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete heart rate record:', error);
    }
  };

  const editRecord = (record: HeartRateRecord) => {
    // Store the record data in localStorage for prefilling
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type: 'heartRate' }));
    navigate('/health/add-vital-record?edit=true');
  };

  const getStatusColor = (value: number, type: string) => {
    if (type === 'resting') {
      if (value < 60) return 'text-blue-600'; // Bradycardia
      if (value <= 100) return 'text-green-600'; // Normal
      return 'text-red-600'; // Tachycardia
    } else if (type === 'exercise') {
      if (value < 100) return 'text-blue-600'; // Low intensity
      if (value <= 150) return 'text-green-600'; // Moderate
      if (value <= 180) return 'text-yellow-600'; // High
      return 'text-red-600'; // Very high
    }
    return 'text-gray-600';
  };

  const getStatusText = (value: number, type: string) => {
    if (type === 'resting') {
      if (value < 60) return 'Low';
      if (value <= 100) return 'Normal';
      return 'High';
    } else if (type === 'exercise') {
      if (value < 100) return 'Light';
      if (value <= 150) return 'Moderate';
      if (value <= 180) return 'Vigorous';
      return 'Maximum';
    }
    return 'Normal';
  };

  const averageResting = records.filter(r => r.type === 'resting').length > 0 
    ? Math.round(records.filter(r => r.type === 'resting').reduce((sum, record) => sum + record.value, 0) / records.filter(r => r.type === 'resting').length)
    : 0;

  const averageExercise = records.filter(r => r.type === 'exercise').length > 0 
    ? Math.round(records.filter(r => r.type === 'exercise').reduce((sum, record) => sum + record.value, 0) / records.filter(r => r.type === 'exercise').length)
    : 0;

  const trendDirection = records.length >= 2
    ? records[0].value > records[1].value ? 'up' : 'down'
    : 'neutral';

  const irregularReadings = records.filter(r => (r.type === 'resting' && (r.value < 60 || r.value > 100))).length;

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Heart Rate Records', icon: HeartRateIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <div className="mb-8 p-8 rounded-3xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Heart Rate Monitoring ♥️
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your heart rate across different activities and monitor cardiac health
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Add Reading Card */}
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            onClick={() => navigate('/health/add-vital-record')}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <Plus className="h-7 w-7" style={{ color: 'rgb(71, 189, 255)' }} />
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Add Reading</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Record heart rate</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ background: 'linear-gradient(to right, rgb(71, 189, 255), rgb(51, 169, 235))' }} />
          </Card>

          {/* Activity Zones Card */}
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <ActivityIcon className="h-7 w-7" style={{ color: 'rgb(71, 189, 255)' }} />
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Activity Zones</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target HR ranges</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ background: 'linear-gradient(to right, rgb(71, 189, 255), rgb(51, 169, 235))' }} />
          </Card>

          {/* Heart Health Card */}
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <HeartRateIcon className="h-7 w-7" style={{ color: 'rgb(71, 189, 255)' }} />
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Heart Health</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wellness insights</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ background: 'linear-gradient(to right, rgb(71, 189, 255), rgb(51, 169, 235))' }} />
          </Card>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {averageResting}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resting BPM</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                <HeartRateIcon className="h-8 w-8" style={{ color: 'rgb(71, 189, 255)' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {averageExercise || '--'}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Exercise BPM</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(251, 146, 60, 0.1)' }}>
                <ActivityIcon className="h-8 w-8" style={{ color: 'rgb(251, 146, 60)' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
                  </p>
                  {trendDirection === 'up' && <TrendingUp className="h-6 w-6 text-red-500" />}
                  {trendDirection === 'down' && <TrendingDown className="h-6 w-6 text-green-500" />}
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trend</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(168, 85, 247, 0.1)' }}>
                <TrendingUp className="h-8 w-8" style={{ color: 'rgb(168, 85, 247)' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {irregularReadings}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Irregular Readings</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(239, 68, 68, 0.1)' }}>
                <AlertIcon className="h-8 w-8" style={{ color: 'rgb(239, 68, 68)' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Heart Rate Trends Chart */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <TrendingUp className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Heart Rate Trends
              </CardTitle>
              <CardDescription>Visual representation of your heart rate patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={records.map(record => ({
                      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      value: record.value,
                      type: record.type,
                      fullDate: record.date,
                      time: record.time
                    })).reverse()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 10', 'dataMax + 10']}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'bpm', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{data.time}</p>
                              <p className="font-bold" style={{ color: 'rgb(71, 189, 255)' }}>
                                {payload[0].value} bpm
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{data.type} heart rate</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Reference lines for normal ranges */}
                    <ReferenceLine y={60} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Resting Low (60)", position: "top", fontSize: 10 }} />
                    <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Resting High (100)", position: "top", fontSize: 10 }} />
                    <ReferenceLine y={150} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Moderate Exercise (150)", position: "top", fontSize: 10 }} />
                    
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="rgb(71, 189, 255)"
                      strokeWidth={3}
                      dot={(props) => {
                        const { payload } = props;
                        if (!payload) return <circle cx={props.cx} cy={props.cy} r={0} fill="transparent" />;
                        
                        const colors = {
                          resting: 'rgb(71, 189, 255)',
                          active: '#f59e0b',
                          exercise: '#ef4444',
                          recovery: '#10b981'
                        };
                        
                        const dotColor = colors[payload.type as keyof typeof colors] || 'rgb(71, 189, 255)';
                        
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={6}
                            fill={dotColor}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: 'rgb(71, 189, 255)',
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Type Distribution */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ChartIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Activity Type Distribution
              </CardTitle>
              <CardDescription>Heart rate measurements by activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Resting', value: records.filter(r => r.type === 'resting').length, color: 'rgb(71, 189, 255)' },
                        { name: 'Active', value: records.filter(r => r.type === 'active').length, color: 'rgb(251, 146, 60)' },
                        { name: 'Exercise', value: records.filter(r => r.type === 'exercise').length, color: 'rgb(239, 68, 68)' },
                        { name: 'Recovery', value: records.filter(r => r.type === 'recovery').length, color: 'rgb(34, 197, 94)' },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Resting', value: records.filter(r => r.type === 'resting').length, color: 'rgb(71, 189, 255)' },
                        { name: 'Active', value: records.filter(r => r.type === 'active').length, color: 'rgb(251, 146, 60)' },
                        { name: 'Exercise', value: records.filter(r => r.type === 'exercise').length, color: 'rgb(239, 68, 68)' },
                        { name: 'Recovery', value: records.filter(r => r.type === 'recovery').length, color: 'rgb(34, 197, 94)' },
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Daily Averages */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <BarChartIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Daily Averages
              </CardTitle>
              <CardDescription>Average heart rate by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Jan 12', resting: 68, exercise: 155 },
                      { day: 'Jan 13', resting: 65, exercise: 0 },
                      { day: 'Jan 14', resting: 72, exercise: 0 },
                      { day: 'Jan 15', resting: 68, exercise: 145 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="resting" fill="rgb(71, 189, 255)" radius={[4, 4, 0, 0]} name="Resting HR" />
                    <Bar dataKey="exercise" fill="rgb(239, 68, 68)" radius={[4, 4, 0, 0]} name="Exercise HR" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Scatter Plot - Heart Rate vs Time */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <TimelineIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Heart Rate vs Time of Day
              </CardTitle>
              <CardDescription>Correlation between time and heart rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={records.map(record => ({
                      timeOfDay: parseInt(record.time.split(':')[0]) + parseInt(record.time.split(':')[1]) / 60,
                      value: record.value,
                      type: record.type
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="timeOfDay" 
                      domain={[0, 24]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="value"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} bpm`,
                        `${props.payload.type} HR`
                      ]}
                      labelFormatter={(value) => `${Math.floor(value)}:${Math.round((value % 1) * 60).toString().padStart(2, '0')}`}
                    />
                    <Scatter 
                      dataKey="value" 
                      fill="rgb(71, 189, 255)"
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HeartRateIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                Recent Heart Rate Readings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Normal resting: 60-100 bpm • Target exercise: 50-85% of max heart rate
              </p>
            </div>
            <Button 
              onClick={() => navigate('/health/add-vital-record')}
              className="rounded-xl"
              style={{ backgroundColor: 'rgb(71, 189, 255)' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
          </div>

          {records.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((record) => (
                <Card key={record.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  {/* Card Header */}
                  <div className="p-6 pb-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                          <HeartRateIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold" style={{ color: 'rgb(71, 189, 255)' }}>
                            {record.value}
                            <span className="text-sm font-normal text-gray-500 ml-2">{record.unit}</span>
                          </h4>
                          <div className="flex gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(record.value, record.type)} border-current`}
                            >
                              {getStatusText(record.value, record.type)}
                            </Badge>
                            <Badge 
                              variant="secondary"
                              style={{ 
                                backgroundColor: record.type === 'resting' ? 'rgb(71, 189, 255, 0.1)' : 
                                                record.type === 'exercise' ? 'rgb(239, 68, 68, 0.1)' :
                                                record.type === 'active' ? 'rgb(251, 146, 60, 0.1)' :
                                                'rgb(34, 197, 94, 0.1)',
                                color: record.type === 'resting' ? 'rgb(71, 189, 255)' : 
                                       record.type === 'exercise' ? 'rgb(239, 68, 68)' :
                                       record.type === 'active' ? 'rgb(251, 146, 60)' :
                                       'rgb(34, 197, 94)'
                              }}
                            >
                              {record.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 pt-2 space-y-3">
                    {/* Time Information */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
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

                    {/* Heart Rate Analysis */}
                    <div className="p-3 rounded-xl" style={{ 
                      backgroundColor: getStatusColor(record.value, record.type) === 'text-green-600' ? 'rgb(34, 197, 94, 0.1)' :
                                     getStatusColor(record.value, record.type) === 'text-yellow-600' ? 'rgb(251, 146, 60, 0.1)' :
                                     getStatusColor(record.value, record.type) === 'text-red-600' ? 'rgb(239, 68, 68, 0.1)' :
                                     'rgb(59, 130, 246, 0.1)'
                    }}>
                      <div className="flex items-center gap-2">
                        <AssessmentIcon className="h-4 w-4" style={{ 
                          color: getStatusColor(record.value, record.type) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                                 getStatusColor(record.value, record.type) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                                 getStatusColor(record.value, record.type) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                                 'rgb(59, 130, 246)'
                        }} />
                        <p className="text-xs font-medium" style={{ 
                          color: getStatusColor(record.value, record.type) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                                 getStatusColor(record.value, record.type) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                                 getStatusColor(record.value, record.type) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                                 'rgb(59, 130, 246)'
                        }}>
                          {record.type === 'resting' ? (
                            getStatusColor(record.value, record.type) === 'text-green-600' ? 'Normal resting heart rate' :
                            getStatusColor(record.value, record.type) === 'text-blue-600' ? 'Low resting heart rate' :
                            'Elevated resting heart rate'
                          ) : (
                            getStatusColor(record.value, record.type) === 'text-green-600' ? 'Good exercise intensity' :
                            getStatusColor(record.value, record.type) === 'text-yellow-600' ? 'High intensity workout' :
                            getStatusColor(record.value, record.type) === 'text-red-600' ? 'Maximum effort zone' :
                            'Light activity level'
                          )}
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
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <div className="p-6 rounded-2xl mx-auto mb-6 w-fit" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <HeartRateIcon className="h-16 w-16" style={{ color: 'rgb(71, 189, 255, 0.3)' }} />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No heart rate readings</h3>
                <p className="text-sm mt-2 mb-6 text-gray-600 dark:text-gray-400">Start monitoring your cardiac health</p>
                <Button 
                  onClick={() => navigate('/health/add-vital-record')}
                  className="rounded-xl px-8 py-3 text-lg font-semibold"
                  style={{ backgroundColor: 'rgb(71, 189, 255)', borderColor: 'rgb(71, 189, 255)' }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Reading
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default HeartRateRecords;