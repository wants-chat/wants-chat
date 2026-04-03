import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { toast } from '../../components/ui/sonner';
import { usePregnancyRecords, useDeletePregnancyRecord } from '../../hooks/useServices';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ChevronLeft,
  ChildCare,
  CalendarToday as CalendarDays,
  Timeline as Activity,
  Favorite as Heart,
  Medication as Pill,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonitorWeight as WeightIcon,
  Bloodtype as BloodPressureIcon,
  EventAvailable as EventAvailableIcon,
  PregnantWoman as PregnantWomanIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const MotherCare: React.FC = () => {
  const navigate = useNavigate();
  const { data: pregnancyData, loading: pregnancyLoading, error: pregnancyError, refetch: refetchPregnancy } = usePregnancyRecords();
  const deletePregnancyMutation = useDeletePregnancyRecord();

  // Confirmation modal hook
  const confirmation = useConfirmation();

  const deletePregnancyRecord = async (id: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Pregnancy Record',
      message: 'Are you sure you want to delete this pregnancy record? This action cannot be undone and will remove all related data.',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deletePregnancyMutation.mutate(id);
        // Refetch pregnancy records after deletion
        refetchPregnancy();
        toast.success('Pregnancy record deleted successfully!');
      } catch (error) {
        console.error('Error deleting pregnancy record:', error);
        toast.error('Failed to delete pregnancy record. Please try again.');
      }
    }
  };

  const editPregnancyRecord = (record: any) => {
    // Store the record data in localStorage for prefilling
    localStorage.setItem('editingPregnancy', JSON.stringify(record));
    navigate(`/health/add-pregnancy-record?edit=${record.id}`);
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Mother Care', icon: ChildCare }
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
        {/* Greeting Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Hello, Future Mom!
          </h1>
          <p className="text-lg text-white/60">
            Let's track your beautiful pregnancy journey together
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Add Record Card */}
          <GlassCard
            hover={true}
            onClick={() => navigate('/health/add-pregnancy-record')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r from-pink-500 to-rose-500">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Add Record</h3>
                <p className="text-white/60 text-sm">Track checkup progress</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </GlassCard>

          {/* Schedule Checkup Card */}
          <GlassCard
            hover={true}
            onClick={() => navigate('/health/schedule-checkup')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r from-teal-500 to-cyan-500">
                  <CalendarDays className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Schedule Checkup</h3>
                <p className="text-white/60 text-sm">Book prenatal visits</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </GlassCard>

          {/* Baby Tracker Card */}
          <GlassCard
            hover={true}
            onClick={() => navigate('/health/baby-care')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r from-purple-500 to-pink-500">
                  <ChildCare className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Baby Tracker</h3>
                <p className="text-white/60 text-sm">Monitor baby growth</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </GlassCard>
        </div>

        {/* Your Pregnancy Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Pregnancy Progress</h2>

          {/* Progress Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Checkups */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Checkups</p>
                  <p className="text-3xl font-bold text-white">
                    {pregnancyData?.data?.filter(r => (r.record_type || r.recordType) === 'regular_checkup').length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                  <ChildCare className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            {/* Current Week */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Current Week</p>
                  <p className="text-3xl font-bold text-white">
                    {pregnancyData?.data?.find(r => r.week)?.week || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            {/* Ultrasounds */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Ultrasounds</p>
                  <p className="text-3xl font-bold text-white">
                    {pregnancyData?.data?.filter(r => (r.record_type || r.recordType) === 'ultrasound').length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            {/* Medications */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Medications</p>
                  <p className="text-3xl font-bold text-white">
                    {pregnancyData?.data?.reduce((total, r) => total + (r.medications?.length || 0), 0) || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Pill className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Pregnancy Records */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Pregnancy Records</h2>
              <p className="text-sm text-white/60 mt-1">Track your pregnancy milestones and checkups</p>
            </div>
            <Button
              onClick={() => navigate('/health/add-pregnancy-record')}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          {pregnancyLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white/60">Loading pregnancy records...</p>
              </div>
            </div>
          ) : pregnancyError ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{String(pregnancyError) || 'Failed to load pregnancy records'}</p>
              <Button
                onClick={() => refetchPregnancy()}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : pregnancyData?.data && pregnancyData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pregnancyData.data.map((record) => (
                <GlassCard
                  key={record.id}
                  hover={true}
                  glow={true}
                  className="overflow-hidden group relative"
                >
                  {/* Week Badge - Top Right Corner */}
                  {record.week && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className="rounded-full px-3 py-1 text-xs font-semibold shadow-md"
                        style={{
                          backgroundColor: 'rgb(139, 92, 246)',
                          color: 'white'
                        }}
                      >
                        Week {record.week}
                      </Badge>
                    </div>
                  )}

                  {/* Card Header with Gradient Background */}
                  <div className="p-6 pb-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                        <PregnantWomanIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 pr-12">
                        <h4 className="font-bold text-lg text-white capitalize">
                          {(record.record_type || record.recordType)?.replace(/_/g, ' ')} Record
                        </h4>
                        {(record.due_date || record.dueDate) && (
                          <p className="text-sm text-white/60 mt-1">
                            Due: {record.due_date || record.dueDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 pt-2 space-y-3">
                    {/* Vital Signs */}
                    {(record.weight || record.blood_pressure || record.baby_heart_rate || record.babyHeartRate) && (
                      <div className="p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <HealthAndSafetyIcon className="h-4 w-4 text-pink-400" />
                          <p className="text-xs font-semibold text-white/80">Vital Signs</p>
                        </div>
                        <div className="space-y-1">
                          {record.weight && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <WeightIcon className="h-3 w-3 text-teal-400" />
                                Weight
                              </span>
                              <span className="text-sm font-medium text-white">
                                {record.weight}
                              </span>
                            </div>
                          )}
                          {record.blood_pressure && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <BloodPressureIcon className="h-3 w-3 text-teal-400" />
                                BP
                              </span>
                              <span className="text-sm font-medium text-white">
                                {record.blood_pressure}
                              </span>
                            </div>
                          )}
                          {(record.baby_heart_rate || record.babyHeartRate) && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <Heart className="h-3 w-3 text-teal-400" />
                                Baby HR
                              </span>
                              <span className="text-sm font-medium text-white">
                                {record.baby_heart_rate || record.babyHeartRate}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                    {/* Symptoms */}
                    {record.symptoms && record.symptoms.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <ScheduleIcon className="h-4 w-4 text-teal-400" />
                          <p className="text-xs font-semibold text-white/80">Symptoms</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {record.symptoms.slice(0, 3).map((symptom, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs rounded-full px-2 py-0.5 border-teal-500/30 text-teal-400"
                            >
                              {symptom}
                            </Badge>
                          ))}
                          {record.symptoms.length > 3 && (
                            <span className="text-xs text-teal-400">
                              +{record.symptoms.length - 3}
                            </span>
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
                          {record.medications.slice(0, 2).map((med, idx) => (
                            <Badge
                              key={idx}
                              className="text-xs rounded-full px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30"
                            >
                              {med}
                            </Badge>
                          ))}
                          {record.medications.length > 2 && (
                            <span className="text-xs text-green-400">
                              +{record.medications.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Next Appointment */}
                    {record.next_appointment && (
                      <div className="p-3 rounded-xl bg-teal-500/10">
                        <div className="flex items-center gap-2">
                          <EventAvailableIcon className="h-4 w-4 text-teal-400" />
                          <p className="text-xs font-medium text-teal-400">
                            Next Appointment: {record.next_appointment}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <div className="p-3 rounded-xl bg-yellow-500/10">
                        <p className="text-xs text-yellow-400 font-medium mb-1">Notes</p>
                        <p className="text-xs text-white/70 italic line-clamp-2">
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
                        onClick={() => editPregnancyRecord(record)}
                        className="flex-1 rounded-xl bg-transparent border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePregnancyRecord(record.id)}
                        disabled={deletePregnancyMutation.loading}
                        className="flex-1 rounded-xl bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        {deletePregnancyMutation.loading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full mr-2" />
                        ) : (
                          <DeleteIcon className="h-4 w-4 mr-2" />
                        )}
                        {deletePregnancyMutation.loading ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="rounded-2xl p-12 text-center" hover={false}>
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6 bg-teal-500/10">
                  <PregnantWomanIcon className="h-10 w-10 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Pregnancy Records Yet
                </h3>
                <p className="text-white/60 mb-6">
                  Start tracking your beautiful pregnancy journey with regular checkups
                </p>
                <Button
                  onClick={() => navigate('/health/add-pregnancy-record')}
                  className="rounded-xl px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Record
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default MotherCare;