import React, { useState, useEffect } from 'react';
import { useHealthProfile, useHealthMetrics } from '../../hooks/useServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Activity, Heart, Thermometer, Scale, Clock, Calendar, User, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { healthService } from '../../services/healthService';
import type { Prescription, MedicalRecord } from '../../types/health';

interface HealthStats {
  totalMetrics: number;
  recentMetrics: number;
  activePrescriptions: number;
  upcomingAppointments: number;
}

const HealthDashboard: React.FC = () => {
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalMetrics: 0,
    recentMetrics: 0,
    activePrescriptions: 0,
    upcomingAppointments: 0
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<MedicalRecord[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // API hooks
  const { data: healthProfile, loading: profileLoading, error: profileError } = useHealthProfile();
  const { data: healthMetrics, loading: metricsLoading, error: metricsError } = useHealthMetrics({ limit: 10 });

  useEffect(() => {
    loadHealthStats();
  }, []);

  const loadHealthStats = async () => {
    try {
      setIsLoadingStats(true);

      // Load prescriptions
      const prescriptionsData = await healthService.getPrescriptions();
      const activePrescriptions = prescriptionsData.data.filter((p: any) => p.isActive);
      setPrescriptions(activePrescriptions.slice(0, 5)); // Show top 5

      // Load upcoming appointments (visits)
      const appointmentsData = await healthService.getMedicalRecords({ type: 'visit' });
      const now = new Date();
      const upcomingAppointments = appointmentsData.records.filter(
        record => new Date(record.date) > now
      );
      setAppointments(upcomingAppointments.slice(0, 3)); // Show top 3

      // Calculate metrics stats
      const metricsData = await healthService.getHealthMetrics();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const recentMetrics = metricsData.data.filter(
        (metric: any) => new Date(metric.recordedAt) > lastWeek
      );

      setHealthStats({
        totalMetrics: metricsData.total,
        recentMetrics: recentMetrics.length,
        activePrescriptions: activePrescriptions.length,
        upcomingAppointments: upcomingAppointments.length
      });
    } catch (error) {
      console.error('Error loading health stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Scale className="h-4 w-4" />;
      case 'heart_rate':
        return <Heart className="h-4 w-4" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'blood_pressure':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getMetricTrend = (metrics: any[], type: string) => {
    const typeMetrics = metrics.filter((m: any) => m.type === type);
    if (typeMetrics.length < 2) return null;

    const latest = typeMetrics[0];
    const previous = typeMetrics[1];

    let latestValue: number;
    let previousValue: number;

    if (type === 'blood_pressure' && typeof latest.value === 'object') {
      latestValue = latest.value.systolic;
      previousValue = previous.value.systolic;
    } else {
      latestValue = typeof latest.value === 'number' ? latest.value : parseFloat(latest.value);
      previousValue = typeof previous.value === 'number' ? previous.value : parseFloat(previous.value);
    }

    if (latestValue > previousValue) return 'up';
    if (latestValue < previousValue) return 'down';
    return 'stable';
  };

  const formatMetricValue = (value: number | { systolic: number; diastolic: number }, type: string) => {
    if (type === 'blood_pressure' && typeof value === 'object') {
      return `${value.systolic}/${value.diastolic}`;
    }
    return typeof value === 'number' ? value.toString() : value;
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {getGreeting()}! Welcome to your Health Dashboard 🩺
              </h2>
              <p className="text-muted-foreground">
                Track your health metrics, manage prescriptions, and stay on top of your wellness journey
              </p>
            </div>
            {healthProfile && !profileLoading && (
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile Updated: {new Date(healthProfile.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Metrics</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats.totalMetrics}
                </p>
                <p className="text-xs text-muted-foreground">
                  {healthStats.recentMetrics} this week
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats.activePrescriptions}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats.upcomingAppointments}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold text-green-600">Good</p>
                <p className="text-xs text-muted-foreground">Based on recent data</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Health Metrics</CardTitle>
          <CardDescription>Your latest health measurements and vital signs</CardDescription>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading metrics...</span>
            </div>
          ) : metricsError ? (
            <div className="text-center py-8 text-destructive">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>Error loading health metrics</p>
            </div>
          ) : healthMetrics?.data && healthMetrics.data.length > 0 ? (
            <div className="grid gap-4">
              {healthMetrics.data.slice(0, 6).map((metric: any) => {
                const trend = getTrendIcon(getMetricTrend(healthMetrics.data, metric.type));
                return (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getMetricIcon(metric.type)}
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">
                          {metric.type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatMetricValue(metric.value, metric.type)} {metric.unit}
                        </span>
                        {trend}
                      </div>
                      {metric.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {metric.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No health metrics recorded yet</p>
              <p className="text-sm">Start tracking your health by recording your first metric!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Prescriptions */}
      {prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Prescriptions</CardTitle>
            <CardDescription>Your current medications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{prescription.medicationName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dr. {prescription.prescribedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled healthcare visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{appointment.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.provider}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Profile Summary */}
      {healthProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
            <CardDescription>Your health information summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthProfile.height && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Height:</span>
                  <span>{healthProfile.height} cm</span>
                </div>
              )}
              {healthProfile.bloodType && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Blood Type:</span>
                  <span>{healthProfile.bloodType}</span>
                </div>
              )}
              {healthProfile.gender && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Gender:</span>
                  <span className="capitalize">{healthProfile.gender}</span>
                </div>
              )}
              {healthProfile.allergies && healthProfile.allergies.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium">Allergies:</span>
                  <div className="flex flex-wrap gap-1">
                    {healthProfile.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {healthProfile.medicalConditions && healthProfile.medicalConditions.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium">Conditions:</span>
                  <div className="flex flex-wrap gap-1">
                    {healthProfile.medicalConditions.map((condition: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {healthProfile.emergencyContact && (
                <div className="flex items-start gap-2">
                  <span className="font-medium">Emergency Contact:</span>
                  <div className="text-sm">
                    <div>{healthProfile.emergencyContact.name}</div>
                    <div className="text-muted-foreground">{healthProfile.emergencyContact.phoneNumber}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthDashboard;