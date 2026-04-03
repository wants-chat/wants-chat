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
  Bloodtype as DropletIcon,
  TrendingUp,
  TrendingDown,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Warning as AlertIcon,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ShowChartIcon,
  DonutLarge as DonutLargeIcon,
  BarChart as BarChartIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  ChevronRight as ChevronRightIcon
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

interface BloodSugarRecord {
  id: string;
  date: string;
  time: string;
  value: number;
  unit: string;
  type: 'fasting' | 'post-meal' | 'random' | 'bedtime';
  notes?: string;
}

const BloodSugarRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<BloodSugarRecord[]>([]);

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, refetch: refetchVitalRecords } = useVitalRecords();
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Transform API data to blood sugar records
  useEffect(() => {
    const apiRecords = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (apiRecords && Array.isArray(apiRecords)) {
      const bloodSugarRecords: BloodSugarRecord[] = apiRecords
        .filter((record: any) => record.bloodSugar && parseFloat(record.bloodSugar) > 0)
        .map((record: any) => ({
          id: record.id,
          date: record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '',
          time: record.recordTime || '',
          value: parseFloat(record.bloodSugar),
          unit: record.bloodSugarUnit || 'mg/dL',
          type: record.bloodSugarType || 'random',
          notes: record.notes || ''
        }))
        .reverse(); // Show newest first

      setRecords(bloodSugarRecords);
    }
  }, [vitalRecordsApiData]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteVitalRecordMutation.mutate(id);
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete blood sugar record:', error);
    }
  };

  const editRecord = (record: BloodSugarRecord) => {
    // Store the record data in localStorage for prefilling
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type: 'bloodSugar' }));
    navigate('/health/add-vital-record?edit=true');
  };

  const getStatusColor = (value: number, type: string) => {
    if (type === 'fasting') {
      if (value < 70) return 'text-blue-600'; // Low
      if (value <= 100) return 'text-green-600'; // Normal
      if (value <= 125) return 'text-yellow-600'; // Pre-diabetes
      return 'text-red-600'; // Diabetes
    } else {
      if (value < 140) return 'text-green-600'; // Normal
      if (value <= 199) return 'text-yellow-600'; // Pre-diabetes
      return 'text-red-600'; // Diabetes
    }
  };

  const getStatusText = (value: number, type: string) => {
    if (type === 'fasting') {
      if (value < 70) return 'Low';
      if (value <= 100) return 'Normal';
      if (value <= 125) return 'Pre-diabetes';
      return 'High';
    } else {
      if (value < 140) return 'Normal';
      if (value <= 199) return 'Pre-diabetes';
      return 'High';
    }
  };

  const averageValue = records.length > 0 
    ? Math.round(records.reduce((sum, record) => sum + record.value, 0) / records.length)
    : 0;

  const trendDirection = records.length >= 2
    ? records[0].value > records[1].value ? 'up' : 'down'
    : 'neutral';

  const highReadings = records.filter(r => r.value > (r.type === 'fasting' ? 100 : 140)).length;

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Blood Sugar Records', icon: DropletIcon }
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
            Blood Sugar Tracking 📊
          </h1>
          <p className="text-lg text-white/60">
            Monitor your glucose levels and track trends over time
          </p>
        </div>

        {/* Add Reading Button */}
        <div className="mb-12">
          <Button
            onClick={() => navigate('/health/add-vital-record')}
            className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Reading
          </Button>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {averageValue}
                </p>
                <p className="text-sm font-medium text-white/60">Average mg/dL</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-500/20">
                <DropletIcon className="h-8 w-8 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {records.length}
                </p>
                <p className="text-sm font-medium text-white/60">Total Readings</p>
              </div>
              <div className="p-4 rounded-2xl bg-green-500/20">
                <CalendarIcon className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Line Chart - Trends Over Time */}
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <ShowChartIcon className="h-5 w-5 text-teal-400" />
                Blood Sugar Trends
              </CardTitle>
              <CardDescription className="text-sm text-white/60">Daily glucose level variations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-teal-800/90 p-3 border border-white/20 rounded-lg shadow-lg">
                            <p className="font-medium text-white">{label}</p>
                            <p className="text-sm text-white/60">{data.time}</p>
                            <p className="font-bold text-teal-400">
                              {payload[0].value} mg/dL
                            </p>
                            <p className="text-xs text-white/50 capitalize">{data.type} reading</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Reference lines for normal ranges */}
                  <ReferenceLine y={70} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Normal Low (70)", position: "top", fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} />
                  <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Normal High (100)", position: "top", fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} />
                  <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Post-meal Target (140)", position: "top", fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="rgb(45, 212, 191)"
                    strokeWidth={3}
                    dot={{
                      fill: 'rgb(45, 212, 191)',
                      strokeWidth: 2,
                      r: 6,
                      stroke: 'rgba(255,255,255,0.8)'
                    }}
                    activeDot={{
                      r: 8,
                      fill: 'rgb(45, 212, 191)',
                      stroke: 'rgba(255,255,255,0.8)',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Bar Chart - Average by Time of Day */}
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <BarChartIcon className="h-5 w-5 text-teal-400" />
              Average by Time of Day
            </CardTitle>
            <CardDescription className="text-sm text-white/60">Compare readings by measurement type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Fasting', avg: records.filter(r => r.type === 'fasting').reduce((sum, r) => sum + r.value, 0) / (records.filter(r => r.type === 'fasting').length || 1), count: records.filter(r => r.type === 'fasting').length },
                    { name: 'Post-Meal', avg: records.filter(r => r.type === 'post-meal').reduce((sum, r) => sum + r.value, 0) / (records.filter(r => r.type === 'post-meal').length || 1), count: records.filter(r => r.type === 'post-meal').length },
                    { name: 'Random', avg: records.filter(r => r.type === 'random').reduce((sum, r) => sum + r.value, 0) / (records.filter(r => r.type === 'random').length || 1), count: records.filter(r => r.type === 'random').length },
                    { name: 'Bedtime', avg: records.filter(r => r.type === 'bedtime').reduce((sum, r) => sum + r.value, 0) / (records.filter(r => r.type === 'bedtime').length || 1), count: records.filter(r => r.type === 'bedtime').length }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-teal-800/90 p-3 border border-white/20 rounded-lg shadow-lg">
                            <p className="font-medium text-white">{data.name}</p>
                            <p className="text-sm text-teal-400">
                              Avg: {Math.round(data.avg)} mg/dL
                            </p>
                            <p className="text-xs text-white/50">
                              {data.count} readings
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avg" fill="rgb(45, 212, 191)" radius={[8, 8, 0, 0]} />
                </BarChart>
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
            <CardDescription className="text-sm text-white/60">Breakdown by glucose ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Normal (70-100)', value: records.filter(r => r.value >= 70 && r.value <= 100).length, color: 'rgb(34, 197, 94)', range: '70-100 mg/dL' },
                      { name: 'Pre-diabetes (101-125)', value: records.filter(r => r.value > 100 && r.value <= 125).length, color: 'rgb(251, 146, 60)', range: '101-125 mg/dL' },
                      { name: 'High (>125)', value: records.filter(r => r.value > 125).length, color: 'rgb(239, 68, 68)', range: '>125 mg/dL' },
                      { name: 'Low (<70)', value: records.filter(r => r.value < 70).length, color: 'rgb(59, 130, 246)', range: '<70 mg/dL' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="45%"
                    labelLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                    label={({ name, percent, value }) => {
                      const percentage = ((percent ?? 0) * 100).toFixed(1);
                      return `${percentage}%`;
                    }}
                    outerRadius={90}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {[
                      { color: 'rgb(34, 197, 94)' },
                      { color: 'rgb(251, 146, 60)' },
                      { color: 'rgb(239, 68, 68)' },
                      { color: 'rgb(59, 130, 246)' }
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => {
                      const total = records.length;
                      const percentage = ((value / total) * 100).toFixed(1);
                      return [`${value} readings (${percentage}%)`, props.payload.range];
                    }}
                    contentStyle={{
                      backgroundColor: 'rgb(30, 41, 59)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: 'white'
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value: any, entry: any) => {
                      const percentage = ((entry.payload.value / records.length) * 100).toFixed(1);
                      return <span style={{ color: 'rgba(255,255,255,0.8)' }}>{value}: {entry.payload.value} ({percentage}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Area Chart - Weekly Pattern */}
        <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <AnalyticsIcon className="h-5 w-5 text-teal-400" />
              Weekly Pattern Analysis
            </CardTitle>
            <CardDescription className="text-sm text-white/60">7-day glucose level patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={records.slice(0, 7).map(record => ({
                    date: new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    value: record.value,
                    normal: 100
                  })).reverse()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(30, 41, 59)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Area type="monotone" dataKey="normal" stroke="rgb(34, 197, 94)" fill="rgb(34, 197, 94, 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="value" stroke="rgb(45, 212, 191)" fill="rgb(45, 212, 191, 0.3)" strokeWidth={3} />
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
              <DropletIcon className="h-6 w-6 text-teal-400" />
              Recent Blood Sugar Readings
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Normal fasting: 70-100 mg/dL • Normal post-meal: &lt;140 mg/dL
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
                      backgroundColor: getStatusColor(record.value, record.type) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                                     getStatusColor(record.value, record.type) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                                     getStatusColor(record.value, record.type) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                                     'rgb(59, 130, 246)',
                      color: 'white'
                    }}
                  >
                    {getStatusText(record.value, record.type)}
                  </Badge>
                </div>

                {/* Card Header with Gradient Background */}
                <div className="p-6 pb-4" style={{ 
                  background: `linear-gradient(135deg, rgb(71, 189, 255, 0.05) 0%, rgb(71, 189, 255, 0.1) 100%)`
                }}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.15)' }}>
                      <DropletIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                    </div>
                    <div className="flex-1 pr-12">
                      <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {record.value}
                        <span className="text-sm font-normal text-gray-500 ml-2">{record.unit}</span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
                        {record.type.replace('-', ' ')} Reading
                      </p>
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
                        {getStatusColor(record.value, record.type) === 'text-green-600' ? 'Within normal range' :
                         getStatusColor(record.value, record.type) === 'text-yellow-600' ? 'Slightly elevated' :
                         getStatusColor(record.value, record.type) === 'text-red-600' ? 'Above normal range' :
                         'Below normal range'}
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
                <DropletIcon className="h-10 w-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Blood Sugar Readings Yet
              </h3>
              <p className="text-white/60 mb-6">
                Start tracking your glucose levels to monitor your health
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

export default BloodSugarRecords;