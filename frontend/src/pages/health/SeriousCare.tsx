// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useSeriousConditions, useDeleteSeriousCondition } from '../../hooks/useServices';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  ChevronLeft,
  Warning as AlertCircle,
  CalendarToday as CalendarDays,
  Person as User,
  Medication as Pill,
  Phone,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalServicesIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Emergency as EmergencyIcon,
  EventAvailable as EventAvailableIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import type { SeriousCondition } from '../../types/health/serious-conditions';

const SeriousCare: React.FC = () => {
  const navigate = useNavigate();

  // Fetch serious conditions data
  const { data: seriousConditionsData, loading, error, refetch } = useSeriousConditions();
  const deleteConditionMutation = useDeleteSeriousCondition();

  const seriousCareRecords = seriousConditionsData?.data || [];

  const deleteSeriousCondition = async (id: string) => {
    try {
      await deleteConditionMutation.mutate(id);
      // Refetch the data after successful deletion
      refetch();
    } catch (error) {
      console.error('Error deleting serious condition:', error);
      // You could add a toast notification here for better UX
    }
  };

  const editSeriousCondition = (condition: SeriousCondition) => {
    // Store the condition data in localStorage for prefilling
    localStorage.setItem('editingCondition', JSON.stringify(condition));
    navigate('/health/add-serious-condition?edit=true');
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Serious Care', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Loading your serious conditions...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-200">Error Loading Conditions</h4>
                <p className="text-sm text-red-300">
                  {String(error) || 'Failed to load serious conditions. Please try again.'}
                </p>
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Greeting Section */}
            <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
              <h1 className="text-3xl font-bold text-white mb-2">
                Stay Strong, Health Warrior!
              </h1>
              <p className="text-lg text-white/60">
                Managing your serious conditions with care and dedication
              </p>
            </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Add Condition Card */}
          <div
            className="bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-200 p-6"
            onClick={() => navigate('/health/add-serious-condition')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-teal-500/10">
                  <Plus className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Add Condition</h3>
                <p className="text-white/60 text-sm">Track new conditions</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div
            className="bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-200 p-6"
            onClick={() => navigate('/health/emergency-contacts')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-orange-500/10">
                  <Phone className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Emergency Contacts</h3>
                <p className="text-white/60 text-sm">Quick access to help</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </div>

          {/* Treatment Schedule Card */}
          <div
            className="bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-200 p-6"
            onClick={() => navigate('/health/treatment-schedule')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-teal-500/10">
                  <CalendarDays className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Treatment Schedule</h3>
                <p className="text-white/60 text-sm">Manage appointments</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </div>
        </div>

        {/* Your Care Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Care Progress</h2>

          {/* Progress Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Active Conditions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Active Conditions</p>
                  <p className="text-3xl font-bold text-white">
                    {seriousCareRecords.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-teal-500/20">
                  <AlertCircle className="h-6 w-6 text-teal-400" />
                </div>
              </div>
            </div>

            {/* Under Monitoring */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Under Monitoring</p>
                  <p className="text-3xl font-bold text-white">
                    {seriousCareRecords.filter(r => r.status === 'monitoring').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* High Priority */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">High Priority</p>
                  <p className="text-3xl font-bold text-white">
                    {seriousCareRecords.filter(r => r.severity === 'critical' || r.severity === 'severe').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/20">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Total Medications */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Medications</p>
                  <p className="text-3xl font-bold text-white">
                    {seriousCareRecords.reduce((total, r) => total + (r.medications?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <Pill className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alert */}
        {seriousCareRecords.some(r => r.severity === 'critical') && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">
                  Critical Conditions Require Attention
                </h3>
                <p className="text-red-400/80">
                  You have conditions marked as critical. Please ensure regular monitoring and follow-up with your healthcare team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Conditions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Current Conditions</h2>
              <p className="text-sm text-white/60 mt-1">Monitor and manage your serious health conditions</p>
            </div>
            <Button
              onClick={() => navigate('/health/add-serious-condition')}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
          
          {seriousCareRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seriousCareRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all duration-300 overflow-hidden group relative"
                >
                  {/* Status Badges - Top Right Corner */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Badge
                      className={`rounded-full px-2 py-1 text-xs font-semibold shadow-md ${
                        record.severity === 'critical' || record.severity === 'severe' ? 'bg-red-500 text-white' :
                        record.severity === 'moderate' ? 'bg-orange-500 text-white' :
                        'bg-green-500 text-white'
                      }`}
                    >
                      {record.severity}
                    </Badge>
                    <Badge
                      className={`rounded-full px-2 py-1 text-xs font-semibold shadow-md ${
                        record.status === 'active' ? 'bg-red-500 text-white' :
                        record.status === 'monitoring' ? 'bg-teal-500 text-white' :
                        record.status === 'remission' ? 'bg-green-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}
                    >
                      {record.status}
                    </Badge>
                  </div>

                  {/* Card Header with Gradient Background */}
                  <div className="p-6 pb-4 bg-gradient-to-br from-teal-500/5 to-teal-500/10">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-teal-500/20">
                        <HealthAndSafetyIcon className="h-6 w-6 text-teal-400" />
                      </div>
                      <div className="flex-1 pr-20">
                        <h4 className="font-bold text-lg text-white line-clamp-1">
                          {record.condition}
                        </h4>
                        <p className="text-sm text-white/60 mt-1">
                          Since {record.diagnosis_date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 pt-2 space-y-3">
                    {/* Medical Team */}
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MedicalServicesIcon className="h-4 w-4 text-teal-400" />
                        <p className="text-xs font-semibold text-white/80">Medical Team</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/50 flex items-center gap-1">
                            <User className="h-3 w-3 text-teal-400" />
                            Doctor
                          </span>
                          <span className="text-sm font-medium text-white text-right line-clamp-1">
                            {record.treating_doctor}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/50 flex items-center gap-1">
                            <HospitalIcon className="h-3 w-3 text-teal-400" />
                            Hospital
                          </span>
                          <span className="text-sm font-medium text-white text-right line-clamp-1">
                            {record.hospital}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Treatments */}
                    {record.treatments && record.treatments.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <HealingIcon className="h-4 w-4 text-teal-400" />
                          <p className="text-xs font-semibold text-white/80">Treatments</p>
                        </div>
                        <div className="space-y-1">
                          {record.treatments.slice(0, 2).map((treatment, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-white/5">
                              <p className="text-xs font-medium text-white">
                                {treatment.type}
                              </p>
                              {treatment.frequency && (
                                <p className="text-xs text-white/50">
                                  {treatment.frequency}
                                </p>
                              )}
                            </div>
                          ))}
                          {record.treatments.length > 2 && (
                            <p className="text-xs text-center text-teal-400">
                              +{record.treatments.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    {record.medications && record.medications.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-green-400" />
                          <p className="text-xs font-semibold text-white/80">Medications</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {record.medications.slice(0, 3).map((med, idx) => (
                            <Badge
                              key={idx}
                              className="text-xs rounded-full px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30"
                            >
                              {med}
                            </Badge>
                          ))}
                          {record.medications.length > 3 && (
                            <span className="text-xs text-green-400">
                              +{record.medications.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Checkup Schedule */}
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="h-4 w-4 text-teal-400" />
                        <p className="text-xs font-semibold text-white/80">Checkup Schedule</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/50">Last Visit</span>
                          <span className="text-xs font-medium text-white">
                            {record.last_checkup}
                          </span>
                        </div>
                        {record.next_checkup && (
                          <div className="p-2 rounded-lg bg-teal-500/10">
                            <div className="flex items-center gap-2">
                              <EventAvailableIcon className="h-3.5 w-3.5 text-teal-400" />
                              <p className="text-xs font-medium text-teal-400">
                                Next: {record.next_checkup}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {record.emergency_contact && (
                      <div className="p-3 rounded-xl bg-red-500/10">
                        <div className="flex items-center gap-2">
                          <EmergencyIcon className="h-4 w-4 text-red-400" />
                          <p className="text-xs font-medium text-red-400">
                            Emergency: {record.emergency_contact}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Bottom */}
                  <div className="px-6 pb-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editSeriousCondition(record)}
                        className="flex-1 rounded-xl bg-transparent border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSeriousCondition(record.id)}
                        disabled={deleteConditionMutation.loading}
                        className="flex-1 rounded-xl bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteConditionMutation.loading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <DeleteIcon className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-12 text-center bg-white/5 border border-white/10">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6 bg-teal-500/10">
                  <HealthAndSafetyIcon className="h-10 w-10 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Conditions Tracked Yet
                </h3>
                <p className="text-white/60 mb-6">
                  Add any chronic or serious health conditions for specialized tracking and monitoring
                </p>
                <Button
                  onClick={() => navigate('/health/add-serious-condition')}
                  className="rounded-xl px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Condition
                </Button>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SeriousCare;