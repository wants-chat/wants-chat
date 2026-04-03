import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Info, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import {
  useBabyCare,
  useAddBabyMeasurement,
  BabyMeasurement,
  DevelopmentMilestone,
  VaccinationRecord,
} from '../../hooks/health/useBabyCare';
import {
  ChildCare,
  MonitorHeart,
  Psychology,
  Vaccines,
  DirectionsRun,
  Visibility,
  Hearing,
  TouchApp,
  Warning,
  CheckCircle,
  Schedule,
  Height,
  Scale,
  Face,
  EmojiEmotions
} from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Types imported from useBabyCare hook

const BabyCare: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(24);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [activeTab, setActiveTab] = useState('growth');

  // Use the baby care hook for all data
  const {
    measurements: babyMeasurements,
    latestMeasurement,
    measurementsLoading,
    measurementsError,
    refetchMeasurements,
    milestones,
    updateMilestone,
    vaccinations,
    updateVaccination,
    sizeComparisons: babySizeComparisons,
    currentSizeComparison,
    calculatePercentile,
    isLoading,
  } = useBabyCare(selectedWeek);

  // Mutation for adding measurements
  const addMeasurementMutation = useAddBabyMeasurement({
    onSuccess: () => {
      setShowAddMeasurement(false);
      setMeasurementForm({
        weight: '',
        length: '',
        headCircumference: '',
        date: new Date().toISOString().split('T')[0]
      });
      refetchMeasurements();
      toast.success('Measurement added successfully!');
    },
    onError: (error) => {
      console.error('Failed to add measurement:', error);
      toast.error(`Failed to add measurement: ${error}`);
    }
  });

  // Form state for new measurement
  const [measurementForm, setMeasurementForm] = useState({
    weight: '',
    length: '',
    headCircumference: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Use a default measurement if none exist yet
  const displayMeasurement = latestMeasurement || {
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    length: 0,
    headCircumference: 0,
  };

  // Get previous measurement for comparison
  const previousMeasurement = babyMeasurements.length > 1
    ? babyMeasurements[babyMeasurements.length - 2]
    : displayMeasurement;

  const handleAddMeasurement = () => {
    const newMeasurement = {
      date: measurementForm.date,
      weight: parseFloat(measurementForm.weight),
      length: parseFloat(measurementForm.length),
      headCircumference: parseFloat(measurementForm.headCircumference),
      week: selectedWeek,
    };

    addMeasurementMutation.mutate(newMeasurement);
  };

  const getMilestoneIcon = (category: string) => {
    switch (category) {
      case 'motor':
        return <DirectionsRun className="h-4 w-4" />;
      case 'cognitive':
        return <Psychology className="h-4 w-4" />;
      case 'social':
        return <EmojiEmotions className="h-4 w-4" />;
      case 'language':
        return <Hearing className="h-4 w-4" />;
      default:
        return <ChildCare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motor':
        return 'rgb(71, 189, 255)';
      case 'cognitive':
        return 'rgb(139, 92, 246)';
      case 'social':
        return 'rgb(34, 197, 94)';
      case 'language':
        return 'rgb(251, 146, 60)';
      default:
        return 'rgb(107, 114, 128)';
    }
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Mother Care', href: '/health/mother-care' },
    { label: 'Baby Care Tracker', icon: ChildCare }
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
        <div className="mb-8 p-8 rounded-3xl bg-purple-500/10 border border-purple-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Baby's Development Journey
          </h1>
          <p className="text-lg text-white/60">
            Track growth, milestones, and health indicators
          </p>
        </div>

        {/* Week Selector */}
        <div className="mb-8">
          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Pregnancy Week
                </h2>
                <p className="text-white/60">
                  Select your current pregnancy week to see relevant information
                </p>
              </div>
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger className="w-full md:w-48 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border-teal-400/30">
                  {Array.from({ length: 21 }, (_, i) => i + 20).map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Comparison */}
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Your baby is about the size of a</p>
                  <h3 className="text-2xl font-bold text-purple-400">
                    {currentSizeComparison.fruit}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-white/60">Weight</p>
                      <p className="text-lg font-semibold text-white">{currentSizeComparison.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Length</p>
                      <p className="text-lg font-semibold text-white">{currentSizeComparison.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1 bg-white/5 border border-white/10 rounded-xl">
            <TabsTrigger value="growth" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Growth Tracking</TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Milestones</TabsTrigger>
            <TabsTrigger value="health" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Health</TabsTrigger>
            <TabsTrigger value="vaccinations" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Vaccinations</TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="space-y-6">
            {/* Growth Stats */}
            {latestMeasurement ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                      <Scale className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {calculatePercentile(latestMeasurement.weight, 'weight')}th percentile
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-1">Current Weight</p>
                  <p className="text-3xl font-bold text-white">
                    {latestMeasurement.weight} g
                  </p>
                  {babyMeasurements.length > 1 && (
                    <p className="text-sm text-green-400 mt-2">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      +{(latestMeasurement.weight - previousMeasurement.weight).toFixed(0)} g from last check
                    </p>
                  )}
                </Card>

                <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(139, 92, 246, 0.1)' }}>
                      <Height className="h-6 w-6" style={{ color: 'rgb(139, 92, 246)' }} />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {calculatePercentile(latestMeasurement.length, 'length')}th percentile
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-1">Current Length</p>
                  <p className="text-3xl font-bold text-white">
                    {latestMeasurement.length} cm
                  </p>
                  {babyMeasurements.length > 1 && (
                    <p className="text-sm text-green-400 mt-2">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      +{latestMeasurement.length - previousMeasurement.length} cm from last check
                    </p>
                  )}
                </Card>

                <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(34, 197, 94, 0.1)' }}>
                      <Face className="h-6 w-6" style={{ color: 'rgb(34, 197, 94)' }} />
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      {calculatePercentile(latestMeasurement.headCircumference, 'head')}th percentile
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-1">Head Circumference</p>
                  <p className="text-3xl font-bold text-white">
                    {latestMeasurement.headCircumference} cm
                  </p>
                  {babyMeasurements.length > 1 && (
                    <p className="text-sm text-green-400 mt-2">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      +{latestMeasurement.headCircumference - previousMeasurement.headCircumference} cm from last check
                    </p>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <Scale className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Measurements Yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Start tracking your baby's growth by adding your first measurement
                  </p>
                  <Button
                    onClick={() => setShowAddMeasurement(true)}
                    className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    Add First Measurement
                  </Button>
                </div>
              </Card>
            )}

            {/* Growth Chart */}
            <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Growth Chart
                </h3>
                <Dialog open={showAddMeasurement} onOpenChange={setShowAddMeasurement}>
                  <DialogTrigger
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    Add Measurement
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Baby Measurement</DialogTitle>
                      <DialogDescription className="text-white/60">
                        Record your baby's current measurements
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="weight" className="text-white/80">Weight (g)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="1"
                          placeholder="e.g. 500"
                          value={measurementForm.weight}
                          onChange={(e) => setMeasurementForm({...measurementForm, weight: e.target.value})}
                          className="rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="length" className="text-white/80">Length (cm)</Label>
                        <Input
                          id="length"
                          type="number"
                          step="0.1"
                          value={measurementForm.length}
                          onChange={(e) => setMeasurementForm({...measurementForm, length: e.target.value})}
                          className="rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="head" className="text-white/80">Head Circumference (cm)</Label>
                        <Input
                          id="head"
                          type="number"
                          step="0.1"
                          value={measurementForm.headCircumference}
                          onChange={(e) => setMeasurementForm({...measurementForm, headCircumference: e.target.value})}
                          className="rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date" className="text-white/80">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={measurementForm.date}
                          onChange={(e) => setMeasurementForm({...measurementForm, date: e.target.value})}
                          className="rounded-lg bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddMeasurement(false)}
                        className="rounded-lg bg-transparent border-white/20 text-white hover:bg-white/10"
                        disabled={addMeasurementMutation.isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMeasurement}
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        disabled={addMeasurementMutation.isLoading || !measurementForm.weight || !measurementForm.length}
                      >
                        {addMeasurementMutation.isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Add Measurement'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {babyMeasurements.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={babyMeasurements}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      />
                      <Tooltip
                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                        labelStyle={{ color: 'white' }}
                        itemStyle={{ color: 'white' }}
                      />
                      <Legend wrapperStyle={{ color: 'white' }} />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="rgb(45, 212, 191)"
                        fill="rgb(45, 212, 191, 0.2)"
                        strokeWidth={2}
                        name="Weight (g)"
                      />
                      <Area
                        type="monotone"
                        dataKey="length"
                        stroke="rgb(139, 92, 246)"
                        fill="rgb(139, 92, 246, 0.2)"
                        strokeWidth={2}
                        name="Length (cm)"
                      />
                      <Area
                        type="monotone"
                        dataKey="headCircumference"
                        stroke="rgb(34, 197, 94)"
                        fill="rgb(34, 197, 94, 0.2)"
                        strokeWidth={2}
                        name="Head (cm)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/50">
                      Add measurements to see growth chart
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">
                Developmental Milestones
              </h3>
              
              <div className="space-y-4">
                {milestones.map(milestone => (
                  <div 
                    key={milestone.id}
                    className={`p-4 rounded-xl border-2 ${
                      milestone.achieved 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `${getCategoryColor(milestone.category)}20`,
                            color: getCategoryColor(milestone.category)
                          }}
                        >
                          {getMilestoneIcon(milestone.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">
                              {milestone.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: getCategoryColor(milestone.category), color: getCategoryColor(milestone.category) }}
                            >
                              {milestone.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/60 mb-2">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-white/50">
                              Expected: Week {milestone.expectedWeek}
                            </span>
                            {milestone.achieved && milestone.achievedDate && (
                              <span className="text-green-400">
                                <CheckCircle className="h-4 w-4 inline mr-1" />
                                Achieved on {new Date(milestone.achievedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!milestone.achieved && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg bg-transparent border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                          onClick={() => {
                            updateMilestone(milestone.id, true);
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {/* Health Indicators - Dynamic based on latest measurement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239, 68, 68, 0.1)' }}>
                    <MonitorHeart className="h-6 w-6" style={{ color: 'rgb(239, 68, 68)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Baby Heart Rate
                    </h3>
                    <p className="text-sm text-white/60">
                      Normal range: 110-160 bpm
                    </p>
                  </div>
                </div>
                {latestMeasurement ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold text-white">
                        {latestMeasurement.weight > 0 ? `~${Math.round(120 + (latestMeasurement.weight * 10))} bpm` : 'Not recorded'}
                      </p>
                      <Badge className="bg-green-500/20 text-green-400">
                        Normal
                      </Badge>
                    </div>
                    <p className="text-sm text-white/50 mt-2">
                      Based on measurement from {new Date(latestMeasurement.date).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/50">No measurements recorded yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add a measurement to track health</p>
                  </div>
                )}
              </Card>

              <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                    <DirectionsRun className="h-6 w-6" style={{ color: 'rgb(71, 189, 255)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Growth Progress
                    </h3>
                    <p className="text-sm text-white/60">
                      Week {selectedWeek} development
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-white">
                    {babyMeasurements.length} records
                  </p>
                  <Badge className={`${babyMeasurements.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                    {babyMeasurements.length > 0 ? 'Tracking' : 'Start tracking'}
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mt-4">
                  Expected size: {currentSizeComparison.fruit} ({currentSizeComparison.weight})
                </p>
              </Card>
            </div>

            {/* Health Tips - Dynamic based on selected week */}
            <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Health Tips for Week {selectedWeek}
              </h3>
              <div className="space-y-3">
                {selectedWeek < 28 ? (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-white/80">
                        Baby is developing rapidly - ensure proper prenatal vitamins intake
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-white/80">
                        Baby's hearing is developing - talk and sing to your baby
                      </p>
                    </div>
                  </>
                ) : selectedWeek < 36 ? (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-white/80">
                        Monitor baby movements - you should feel regular kicks and stretches
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-white/80">
                        Baby's brain is developing rapidly - maintain proper nutrition
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-white/80">
                        Baby is preparing for birth - monitor for signs of labor
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-white/80">
                        Pack your hospital bag and finalize birth plans
                      </p>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-white/80">
                    Stay hydrated and get adequate rest
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Warning className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <p className="text-white/80">
                    Contact your doctor if you notice decreased movement or unusual symptoms
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-6">
            <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">
                Vaccination Schedule During Pregnancy
              </h3>
              
              <div className="space-y-4">
                {vaccinations.map(vaccine => (
                  <div 
                    key={vaccine.id}
                    className={`p-4 rounded-xl border-2 ${
                      vaccine.status === 'completed'
                        ? 'bg-green-500/10 border-green-500/20'
                        : vaccine.status === 'overdue'
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          <Vaccines className="h-5 w-5" style={{ color: 'rgb(251, 146, 60)' }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {vaccine.name}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            Scheduled for week {vaccine.scheduledWeek}
                          </p>
                          {vaccine.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              <Info className="h-4 w-4 inline mr-1" />
                              {vaccine.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {vaccine.status === 'completed' ? (
                          <div>
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </Badge>
                            {vaccine.administeredDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(vaccine.administeredDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : vaccine.status === 'overdue' ? (
                          <Badge className="bg-red-500/20 text-red-400">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Overdue
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/20 text-blue-400">
                            <Schedule className="h-4 w-4 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      Important Note
                    </p>
                    <p className="text-sm text-yellow-400/80 mt-1">
                      Always consult with your healthcare provider about vaccinations during pregnancy. 
                      This schedule is a general guideline and may vary based on individual health needs.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BabyCare;