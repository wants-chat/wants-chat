import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useVitalRecords, useDeleteVitalRecord } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Thermostat as ThermostatIcon,
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
  DonutLarge as DonutLargeIcon
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface TemperatureRecord {
  id: string;
  date: string;
  time: string;
  value: number;
  unit: string;
  location: string;
  notes?: string;
}

const TemperatureRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<TemperatureRecord[]>([]);

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, refetch: refetchVitalRecords } = useVitalRecords() as any;
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Transform API data to temperature records
  useEffect(() => {
    const apiRecords = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (apiRecords && Array.isArray(apiRecords)) {
      const temperatureRecords: TemperatureRecord[] = apiRecords
        .filter((record: any) => record.temperature)
        .map((record: any) => ({
          id: record.id,
          date: record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '',
          time: record.recordTime || '',
          value: parseFloat(record.temperature),
          unit: record.temperatureUnit === 'celsius' ? '°C' : '°F',
          location: record.temperatureLocation || 'oral',
          notes: record.notes || ''
        }))
        .reverse(); // Show newest first

      setRecords(temperatureRecords);
    }
  }, [vitalRecordsApiData]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteVitalRecordMutation.mutate(id);
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete temperature record:', error);
    }
  };

  const editRecord = (record: TemperatureRecord) => {
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type: 'temperature' }));
    navigate('/health/add-vital-record?edit=true&section=temp');
  };

  const getStatusColor = (value: number, unit: string) => {
    // Convert to Fahrenheit for comparison
    const tempF = unit === '°C' ? (value * 9/5) + 32 : value;

    if (tempF < 97) return 'text-blue-400'; // Low
    if (tempF <= 99) return 'text-green-400'; // Normal
    if (tempF <= 100.4) return 'text-yellow-400'; // Slight fever
    return 'text-red-400'; // Fever
  };

  const getStatusText = (value: number, unit: string) => {
    const tempF = unit === '°C' ? (value * 9/5) + 32 : value;

    if (tempF < 97) return 'Low';
    if (tempF <= 99) return 'Normal';
    if (tempF <= 100.4) return 'Slight Fever';
    return 'Fever';
  };

  const averageTemp = records.length > 0
    ? (records.reduce((sum, record) => sum + record.value, 0) / records.length).toFixed(1)
    : '0';

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Temperature Records', icon: ThermostatIcon }
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
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Temperature Tracking
          </h1>
          <p className="text-lg text-white/60">
            Monitor your body temperature and track trends over time
          </p>
        </div>

        {/* Add Reading Button */}
        <div className="mb-12">
          <Button
            onClick={() => navigate('/health/add-vital-record?section=temp')}
            className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Reading
          </Button>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {averageTemp} {records.length > 0 ? records[0].unit : '°F'}
                </p>
                <p className="text-sm font-medium text-white/60">Average Temperature</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-500/20">
                <ThermostatIcon className="h-8 w-8 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
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

        {/* Records List */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Records</h2>
            <p className="text-sm text-white/60 mt-1">
              {records.length} total {records.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>

        {records.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
            <ThermostatIcon className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No temperature records yet
            </h3>
            <p className="text-white/60 mb-6">
              Start tracking your body temperature to monitor your health
            </p>
            <Button
              onClick={() => navigate('/health/add-vital-record?section=temp')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Reading
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all duration-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-teal-500/20">
                        <ThermostatIcon className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{record.date}</p>
                        <p className="text-sm text-white/50">{record.time}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Temperature</p>
                        <p className={`text-2xl font-bold ${getStatusColor(record.value, record.unit)}`}>
                          {record.value} {record.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Status</p>
                        <Badge
                          className={`${
                            getStatusText(record.value, record.unit) === 'Normal'
                              ? 'bg-green-500/20 text-green-400'
                              : getStatusText(record.value, record.unit) === 'Low'
                              ? 'bg-blue-500/20 text-blue-400'
                              : getStatusText(record.value, record.unit) === 'Slight Fever'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {getStatusText(record.value, record.unit)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Location</p>
                        <p className="text-sm font-medium text-white capitalize">
                          {record.location}
                        </p>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-white/60">{record.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editRecord(record)}
                      className="flex-1 md:flex-none bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <EditIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                      className="flex-1 md:flex-none bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <DeleteIcon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TemperatureRecords;
