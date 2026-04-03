import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useVitalRecords, useDeleteVitalRecord } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  MonitorWeight as ScaleIcon,
  TrendingUp,
  TrendingDown,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Warning as AlertIcon,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessIcon,
  ShowChart as ChartIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
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
  Legend
} from 'recharts';

interface WeightRecord {
  id: string;
  date: string;
  time: string;
  weight: number;
  unit: string;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}

const WeightRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<WeightRecord[]>([]);

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, refetch: refetchVitalRecords } = useVitalRecords();
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Transform API data to weight records
  useEffect(() => {
    const apiRecords = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (apiRecords && Array.isArray(apiRecords)) {
      const weightRecords: WeightRecord[] = apiRecords
        .filter((record: any) => record.weight)
        .map((record: any) => ({
          id: record.id,
          date: record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '',
          time: record.recordTime || '',
          weight: parseFloat(record.weight),
          unit: record.weightUnit || 'kg',
          bmi: record.bmi ? parseFloat(record.bmi) : undefined,
          notes: record.notes || ''
        }))
        .reverse(); // Show newest first

      setRecords(weightRecords);
    }
  }, [vitalRecordsApiData]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteVitalRecordMutation.mutate(id);
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete weight record:', error);
    }
  };

  const editRecord = (record: WeightRecord) => {
    // Store the record data in localStorage for prefilling
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type: 'weight' }));
    navigate('/health/add-vital-record?edit=true');
  };

  const getBMIStatusColor = (bmi?: number) => {
    if (!bmi) return 'text-gray-600';
    if (bmi < 18.5) return 'text-blue-600'; // Underweight
    if (bmi < 25) return 'text-green-600'; // Normal
    if (bmi < 30) return 'text-yellow-600'; // Overweight
    return 'text-red-600'; // Obese
  };

  const getBMIStatusText = (bmi?: number) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const averageWeight = records.length > 0 
    ? (records.reduce((sum, record) => sum + record.weight, 0) / records.length).toFixed(1)
    : '0';

  const averageBMI = records.filter(r => r.bmi).length > 0 
    ? (records.filter(r => r.bmi).reduce((sum, record) => sum + (record.bmi || 0), 0) / records.filter(r => r.bmi).length).toFixed(1)
    : '0';

  const weightChange = records.length >= 2
    ? (records[0].weight - records[records.length - 1].weight).toFixed(1)
    : '0';

  const trendDirection = records.length >= 2
    ? records[0].weight > records[1].weight ? 'up' : 'down'
    : 'neutral';

  const goalWeight = 70; // This could be user-configurable
  const weightToGoal = (parseFloat(averageWeight) - goalWeight).toFixed(1);

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Weight Records', icon: ScaleIcon }
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
            Weight & Body Composition ⚖️
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your weight, BMI, and body composition changes over time
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Record weight & BMI</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ background: 'linear-gradient(to right, rgb(71, 189, 255), rgb(51, 169, 235))' }} />
          </Card>

          {/* Body Analysis Card */}
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <FitnessIcon className="h-7 w-7" style={{ color: 'rgb(71, 189, 255)' }} />
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Body Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Composition insights</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" style={{ background: 'linear-gradient(to right, rgb(71, 189, 255), rgb(51, 169, 235))' }} />
          </Card>

          {/* Goal Setting Card */}
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <AlertIcon className="h-7 w-7" style={{ color: 'rgb(71, 189, 255)' }} />
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Goal Setting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target weight</p>
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
                  {averageWeight}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Weight kg</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                <ScaleIcon className="h-8 w-8" style={{ color: 'rgb(71, 189, 255)' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {averageBMI}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average BMI</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(34, 197, 94, 0.1)' }}>
                <FitnessIcon className="h-8 w-8" style={{ color: 'rgb(34, 197, 94)' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange}
                  </p>
                  {parseFloat(weightChange) > 0 && <TrendingUp className="h-6 w-6 text-red-500" />}
                  {parseFloat(weightChange) < 0 && <TrendingDown className="h-6 w-6 text-green-500" />}
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Change kg</p>
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
                  {parseFloat(weightToGoal) > 0 ? '+' : ''}{weightToGoal}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To Goal kg</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgb(251, 146, 60, 0.1)' }}>
                <AlertIcon className="h-8 w-8" style={{ color: 'rgb(251, 146, 60)' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Weight & BMI Trends Chart */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <TrendingUp className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Weight & BMI Trends
              </CardTitle>
              <CardDescription>Visual representation of your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={records.map(record => ({
                      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: record.weight,
                      bmi: record.bmi,
                      bodyFat: record.bodyFat,
                      muscleMass: record.muscleMass,
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
                      yAxisId="weight"
                      domain={['dataMin - 2', 'dataMax + 2']}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="bmi"
                      orientation="right"
                      domain={['dataMin - 1', 'dataMax + 1']}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'BMI', angle: 90, position: 'insideRight' }}
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
                                Weight: {data.weight} kg
                              </p>
                              {data.bmi && (
                                <p className="text-sm text-gray-600">
                                  BMI: {data.bmi}
                                </p>
                              )}
                              {data.bodyFat && (
                                <p className="text-sm text-gray-600">
                                  Body Fat: {data.bodyFat}%
                                </p>
                              )}
                              {data.muscleMass && (
                                <p className="text-sm text-gray-600">
                                  Muscle: {data.muscleMass}kg
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Reference lines for BMI ranges */}
                    <ReferenceLine yAxisId="bmi" y={18.5} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: "Underweight (18.5)", position: "top", fontSize: 10 }} />
                    <ReferenceLine yAxisId="bmi" y={25} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Normal (25)", position: "top", fontSize: 10 }} />
                    <ReferenceLine yAxisId="bmi" y={30} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Overweight (30)", position: "top", fontSize: 10 }} />
                    
                    <Line 
                      yAxisId="weight"
                      type="monotone" 
                      dataKey="weight" 
                      stroke="rgb(71, 189, 255)"
                      strokeWidth={3}
                      name="Weight"
                      dot={{ 
                        fill: 'rgb(71, 189, 255)', 
                        strokeWidth: 2, 
                        r: 6,
                        stroke: '#fff'
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: 'rgb(71, 189, 255)',
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    />
                    <Line 
                      yAxisId="bmi"
                      type="monotone" 
                      dataKey="bmi" 
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      name="BMI"
                      dot={{ 
                        fill: '#10b981', 
                        strokeWidth: 2, 
                        r: 4,
                        stroke: '#fff'
                      }}
                      activeDot={{ 
                        r: 6, 
                        fill: '#10b981',
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Monthly Averages */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <BarChartIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Monthly Averages
              </CardTitle>
              <CardDescription>Average weight by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { month: 'Dec', weight: 74.1, bmi: 22.9, bodyFat: 19.4 },
                      { month: 'Jan', weight: 73.3, bmi: 22.6, bodyFat: 18.8 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="weight" fill="rgb(71, 189, 255)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="bmi" fill="rgb(34, 197, 94)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="bodyFat" fill="rgb(168, 85, 247)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - BMI Distribution */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ChartIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                BMI Category Distribution
              </CardTitle>
              <CardDescription>Time spent in each BMI category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Normal (18.5-24.9)', value: 83, color: 'rgb(34, 197, 94)' },
                        { name: 'Overweight (25-29.9)', value: 17, color: 'rgb(251, 146, 60)' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Normal (18.5-24.9)', value: 83, color: 'rgb(34, 197, 94)' },
                        { name: 'Overweight (25-29.9)', value: 17, color: 'rgb(251, 146, 60)' },
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

          {/* Area Chart - Body Composition */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <TimelineIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                Body Composition Trends
              </CardTitle>
              <CardDescription>Body fat and muscle mass over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={records.map(record => ({
                      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      bodyFat: record.bodyFat,
                      muscleMass: record.muscleMass,
                    })).reverse()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stackId="1" 
                      stroke="rgb(251, 146, 60)" 
                      fill="rgb(251, 146, 60)" 
                      fillOpacity={0.6}
                      name="Body Fat %"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="muscleMass" 
                      stackId="2" 
                      stroke="rgb(71, 189, 255)" 
                      fill="rgb(71, 189, 255)" 
                      fillOpacity={0.6}
                      name="Muscle Mass kg"
                    />
                  </AreaChart>
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
                <ScaleIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                Recent Weight & BMI Readings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Normal BMI: 18.5-24.9 • Overweight: 25.0-29.9 • Obese: ≥30.0
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
                          <ScaleIcon className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold" style={{ color: 'rgb(71, 189, 255)' }}>
                            {record.weight}
                            <span className="text-sm font-normal text-gray-500 ml-2">{record.unit}</span>
                          </h4>
                          {record.bmi && (
                            <Badge 
                              variant="outline" 
                              className={`${getBMIStatusColor(record.bmi)} border-current mt-1`}
                            >
                              BMI {record.bmi} - {getBMIStatusText(record.bmi)}
                            </Badge>
                          )}
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

                    {/* Body Composition */}
                    {(record.bodyFat || record.muscleMass) && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <FitnessIcon className="h-4 w-4" style={{ color: 'rgb(71, 189, 255)' }} />
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Body Composition</p>
                        </div>
                        <div className="space-y-1">
                          {record.bodyFat && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Body Fat</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{record.bodyFat}%</span>
                            </div>
                          )}
                          {record.muscleMass && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Muscle Mass</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{record.muscleMass}kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* BMI Analysis */}
                    {record.bmi && (
                      <div className="p-3 rounded-xl" style={{ 
                        backgroundColor: getBMIStatusColor(record.bmi) === 'text-green-600' ? 'rgb(34, 197, 94, 0.1)' :
                                       getBMIStatusColor(record.bmi) === 'text-yellow-600' ? 'rgb(251, 146, 60, 0.1)' :
                                       getBMIStatusColor(record.bmi) === 'text-red-600' ? 'rgb(239, 68, 68, 0.1)' :
                                       'rgb(59, 130, 246, 0.1)'
                      }}>
                        <div className="flex items-center gap-2">
                          <AnalyticsIcon className="h-4 w-4" style={{ 
                            color: getBMIStatusColor(record.bmi) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                                   getBMIStatusColor(record.bmi) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                                   getBMIStatusColor(record.bmi) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                                   'rgb(59, 130, 246)'
                          }} />
                          <p className="text-xs font-medium" style={{ 
                            color: getBMIStatusColor(record.bmi) === 'text-green-600' ? 'rgb(34, 197, 94)' :
                                   getBMIStatusColor(record.bmi) === 'text-yellow-600' ? 'rgb(251, 146, 60)' :
                                   getBMIStatusColor(record.bmi) === 'text-red-600' ? 'rgb(239, 68, 68)' :
                                   'rgb(59, 130, 246)'
                          }}>
                            {getBMIStatusColor(record.bmi) === 'text-green-600' ? 'Healthy weight range' :
                             getBMIStatusColor(record.bmi) === 'text-yellow-600' ? 'Overweight - Consider lifestyle changes' :
                             getBMIStatusColor(record.bmi) === 'text-red-600' ? 'Obese - Consult healthcare provider' :
                             'Underweight - Monitor nutrition'}
                          </p>
                        </div>
                      </div>
                    )}

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
                  <ScaleIcon className="h-16 w-16" style={{ color: 'rgb(71, 189, 255, 0.3)' }} />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No weight recordings</h3>
                <p className="text-sm mt-2 mb-6 text-gray-600 dark:text-gray-400">Start tracking your weight and body composition</p>
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

export default WeightRecords;