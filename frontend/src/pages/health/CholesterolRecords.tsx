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
  Science as ScienceIcon,
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
  Legend
} from 'recharts';

interface CholesterolRecord {
  id: string;
  date: string;
  time: string;
  total: number;
  ldl: number;
  hdl: number;
  triglycerides: number;
  unit: string;
  notes?: string;
}

const CholesterolRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CholesterolRecord[]>([]);

  // Fetch vital records from API
  const { data: vitalRecordsApiData, loading: vitalRecordsLoading, refetch: refetchVitalRecords } = useVitalRecords() as any;
  const deleteVitalRecordMutation = useDeleteVitalRecord();

  // Transform API data to cholesterol records
  useEffect(() => {
    const apiRecords = Array.isArray(vitalRecordsApiData?.data)
      ? vitalRecordsApiData.data
      : vitalRecordsApiData?.data?.data;

    if (apiRecords && Array.isArray(apiRecords)) {
      const cholesterolRecords: CholesterolRecord[] = apiRecords
        .filter((record: any) => record.totalCholesterol)
        .map((record: any) => ({
          id: record.id,
          date: record.recordDate ? new Date(record.recordDate).toLocaleDateString() : '',
          time: record.recordTime || '',
          total: record.totalCholesterol,
          ldl: record.ldlCholesterol || 0,
          hdl: record.hdlCholesterol || 0,
          triglycerides: record.triglycerides || 0,
          unit: 'mg/dL',
          notes: record.notes || ''
        }))
        .reverse(); // Show newest first

      setRecords(cholesterolRecords);
    }
  }, [vitalRecordsApiData]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteVitalRecordMutation.mutate(id);
      await refetchVitalRecords();
    } catch (error) {
      console.error('Failed to delete cholesterol record:', error);
    }
  };

  const editRecord = (record: CholesterolRecord) => {
    localStorage.setItem('editingVital', JSON.stringify({ ...record, type: 'cholesterol' }));
    navigate('/health/add-vital-record?edit=true&section=cholesterol');
  };

  const getStatusColor = (value: number, type: 'total' | 'ldl' | 'hdl' | 'triglycerides') => {
    switch (type) {
      case 'total':
        if (value < 200) return 'text-green-400';
        if (value <= 239) return 'text-yellow-400';
        return 'text-red-400';
      case 'ldl':
        if (value < 100) return 'text-green-400';
        if (value <= 159) return 'text-yellow-400';
        return 'text-red-400';
      case 'hdl':
        if (value >= 60) return 'text-green-400';
        if (value >= 40) return 'text-yellow-400';
        return 'text-red-400';
      case 'triglycerides':
        if (value < 150) return 'text-green-400';
        if (value <= 199) return 'text-yellow-400';
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  const averageTotal = records.length > 0
    ? Math.round(records.reduce((sum, record) => sum + record.total, 0) / records.length)
    : 0;

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Cholesterol Records', icon: ScienceIcon }
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
            Cholesterol Tracking
          </h1>
          <p className="text-lg text-white/60">
            Monitor your lipid profile and track trends over time
          </p>
        </div>

        {/* Add Reading Button */}
        <div className="mb-12">
          <Button
            onClick={() => navigate('/health/add-vital-record?section=cholesterol')}
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
                  {averageTotal}
                </p>
                <p className="text-sm font-medium text-white/60">Average Total</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-500/20">
                <ScienceIcon className="h-8 w-8 text-teal-400" />
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
            <ScienceIcon className="h-16 w-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No cholesterol records yet
            </h3>
            <p className="text-white/60 mb-6">
              Start tracking your lipid profile to monitor your cardiovascular health
            </p>
            <Button
              onClick={() => navigate('/health/add-vital-record?section=cholesterol')}
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
                        <ScienceIcon className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{record.date}</p>
                        <p className="text-sm text-white/50">{record.time}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Total</p>
                        <p className={`text-lg font-bold ${getStatusColor(record.total, 'total')}`}>
                          {record.total} {record.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">LDL</p>
                        <p className={`text-lg font-bold ${getStatusColor(record.ldl, 'ldl')}`}>
                          {record.ldl} {record.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">HDL</p>
                        <p className={`text-lg font-bold ${getStatusColor(record.hdl, 'hdl')}`}>
                          {record.hdl} {record.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Triglycerides</p>
                        <p className={`text-lg font-bold ${getStatusColor(record.triglycerides, 'triglycerides')}`}>
                          {record.triglycerides} {record.unit}
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

export default CholesterolRecords;
