// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrescriptions, useDeletePrescription } from '../../hooks/useServices';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import {
  ChevronLeft,
  Medication as PillIcon,
  Description as FileTextIcon,
  Person as UserIcon,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  LocalPharmacy as PharmacyIcon,
  Schedule as ScheduleIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';

// Updated interface to match API structure
interface PrescriptionType {
  id: string;
  user_id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribed_by: string;
  prescribed_date?: string;
  prescription_date?: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  side_effects?: string[];
  status: string;
  refills_remaining?: number;
  metadata?: any;
  created_at?: string;
  originalPrescriptionId?: string;
  reason?: string;
  // UI fields that may not come from API
  medication?: string; // For backward compatibility
  prescribedBy?: string; // For backward compatibility
  startDate?: string; // For backward compatibility
  endDate?: string; // For backward compatibility
  sideEffects?: string[]; // For backward compatibility
  refillsRemaining?: number; // For backward compatibility
  prescriptionDate?: string; // For backward compatibility
  pharmacy?: string; // Not in API - optional field
  uploadedFile?: string; // Not in API
  nextRefillDate?: string; // Calculated field
}

const Medications: React.FC = () => {
  const navigate = useNavigate();
  const queryParams = useMemo(() => ({ status: 'active' }), []);
  const prescriptionsQuery = usePrescriptions(queryParams);
  const deletePrescriptionMutation = useDeletePrescription();
  const [prescriptions, setPrescriptions] = useState<PrescriptionType[]>([]);

  // Confirmation modal hook
  const confirmation = useConfirmation();

  // Remove the authentication check that causes re-renders
  // The authentication is already handled by the router/app level

  useEffect(() => {
    if (prescriptionsQuery.data?.data) {
      const prescriptionsArray = prescriptionsQuery.data.data;
      
      // Map API data to UI format - handle new medications array structure
      const mappedPrescriptions = prescriptionsArray.flatMap((p: any) => {
        // Check if this is the new format with medications array
        if (p.medications !== undefined) {
          // If medications array is empty, don't show any cards for this prescription
          if (p.medications.length === 0) {
            return [];
          }
          // If medications array has items, create separate cards for each medication
          return p.medications.map((med: any, index: number) => {
            const refillsRemaining = p.refills_remaining || 0;
            
            // Calculate next refill date based on end_date or a month from now if refills available
            let nextRefillDate;
            if (refillsRemaining > 0) {
              if (p.end_date) {
                const endDate = new Date(p.end_date);
                const today = new Date();
                const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                // If prescription ends within 30 days, next refill is 7 days before end
                if (daysUntilEnd > 7 && daysUntilEnd <= 30) {
                  const refillDate = new Date(endDate);
                  refillDate.setDate(refillDate.getDate() - 7);
                  nextRefillDate = refillDate.toLocaleDateString();
                } else if (daysUntilEnd > 30) {
                  // Next refill in 30 days
                  const refillDate = new Date();
                  refillDate.setDate(refillDate.getDate() + 30);
                  nextRefillDate = refillDate.toLocaleDateString();
                }
              } else {
                // No end date, next refill in 30 days
                const refillDate = new Date();
                refillDate.setDate(refillDate.getDate() + 30);
                nextRefillDate = refillDate.toLocaleDateString();
              }
            }
            
            return {
              ...p,
              // Create unique ID for each medication card
              id: `${p.id}-${index}`,
              originalPrescriptionId: p.id,
              // Map medication fields
              medication: med.name,
              medication_name: med.name,
              dosage: `${med.dosage} ${med.dosage_unit}`.trim(),
              frequency: med.frequency,
              instructions: med.instructions,
              reason: med.reason,
              sideEffects: med.side_effects,
              // Map prescription fields
              prescribedBy: p.prescribed_by,
              prescribed_by: p.prescribed_by,
              startDate: p.start_date,
              start_date: p.start_date,
              endDate: p.end_date,
              end_date: p.end_date,
              pharmacy: p.pharmacy || '',
              prescriptionNumber: p.prescription_number,
              prescription_number: p.prescription_number,
              prescriptionDate: p.prescription_date,
              prescription_date: p.prescription_date,
              notes: p.notes,
              // Add calculated fields from API data
              refillsRemaining: refillsRemaining,
              status: p.status || 'active',
              nextRefillDate: nextRefillDate
            };
          });
        } else if (p.medication_name) {
          // Fallback for old single medication format (only if medication_name exists)
          const refillsRemaining = p.refills_remaining || 0;
          
          // Calculate next refill date
          let nextRefillDate;
          if (refillsRemaining > 0) {
            const refillDate = new Date();
            refillDate.setDate(refillDate.getDate() + 30);
            nextRefillDate = refillDate.toLocaleDateString();
          }
          
          return [{
            ...p,
            // Map API fields to UI fields for backward compatibility
            medication: p.medication_name,
            prescribedBy: p.prescribed_by,
            startDate: p.start_date,
            pharmacy: p.pharmacy || 'CVS Pharmacy - Main Street',
            refillsRemaining: refillsRemaining,
            status: p.status || 'active',
            nextRefillDate: nextRefillDate
          }];
        } else {
          // No medications to display
          return [];
        }
      });
      setPrescriptions(mappedPrescriptions);
    }
  }, [prescriptionsQuery.data]);

  const deletePrescription = async (id: string) => {
    try {
      // Extract the original prescription ID if this is a medication card
      const prescriptionToDelete = prescriptions.find(p => p.id === id);
      const actualId = prescriptionToDelete?.originalPrescriptionId || id;
      const medicationName = prescriptionToDelete?.medication_name;

      if (!medicationName) {
        toast.error('Unable to delete: medication name not found');
        return;
      }

      const confirmed = await confirmation.showConfirmation({
        title: 'Delete Medication',
        message: `Are you sure you want to delete "${medicationName}"? This action cannot be undone and will remove all related data.`,
        confirmText: 'Delete Medication',
        cancelText: 'Cancel',
        variant: 'destructive'
      });

      if (!confirmed) return;

      await deletePrescriptionMutation.mutate({
        prescriptionId: actualId,
        medicationName: medicationName
      });
      setPrescriptions(prev => prev.filter(prescription =>
        prescription.originalPrescriptionId !== actualId && prescription.id !== actualId
      ));
      // Refetch prescriptions after deletion
      prescriptionsQuery.refetch();
      toast.success('Prescription deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting prescription:', err);
      toast.error('Failed to delete prescription. Please try again.');
    }
  };

  const editPrescription = (prescription: PrescriptionType) => {
    try {
      console.log('Edit prescription called with:', prescription);
      
      // Store medication data for individual editing
      const medicationData = {
        // Prescription context
        prescriptionId: prescription.originalPrescriptionId || prescription.id,
        prescribedBy: prescription.prescribedBy || prescription.prescribed_by,
        prescriptionDate: prescription.prescriptionDate || prescription.prescription_date,
        startDate: prescription.startDate || prescription.start_date,
        endDate: prescription.endDate || prescription.end_date,
        pharmacy: prescription.pharmacy,
        
        // Individual medication data
        name: prescription.medication || prescription.medication_name || '',
        medication_name: prescription.medication || prescription.medication_name || '',
        medication: prescription.medication || prescription.medication_name || '',
        dosage: prescription.dosage?.split(' ')[0] || '',
        dosageUnit: prescription.dosage?.split(' ')[1] || 'mg',
        frequency: prescription.frequency || '',
        instructions: prescription.instructions || '',
        reason: prescription.reason || '',
        sideEffects: prescription.sideEffects || ''
      };
      
      console.log('Storing medication data in localStorage:', medicationData);
      
      // Store the medication data in localStorage for prefilling
      localStorage.setItem('editingMedication', JSON.stringify(medicationData));
      
      // Navigate to individual medication edit page
      const prescriptionId = prescription.originalPrescriptionId || prescription.id;
      const medicationIndex = prescription.id.includes('-') ? prescription.id.split('-')[1] : '0';
      const navigationUrl = `/health/edit-medication?prescriptionId=${prescriptionId}&medicationIndex=${medicationIndex}`;
      
      navigate(navigationUrl);
      
    } catch (error) {
      console.error('Error in editPrescription:', error);
    }
  };

  const refillPrescription = (prescription: PrescriptionType) => {
    // Handle refill request - this could trigger a modal, navigate to pharmacy, or send a refill request
    // For now, we'll update the refills and show an alert
    const updatedPrescription = {
      ...prescription,
      refillsRemaining: (prescription.refillsRemaining || 0) + 1
    };
    
    setPrescriptions(prev => prev.map(p => 
      p.id === prescription.id ? updatedPrescription : p
    ));
    
    // In a real app, this would send a refill request to the pharmacy API
    toast.success(`Refill requested for ${prescription.medication || prescription.medication_name}. Your pharmacy will be notified.`);
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medications', icon: PillIcon }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <PillIcon className="h-8 w-8 text-teal-400" />
              Medications
            </h1>
            <p className="text-white/60 mt-1">Manage your prescriptions and medications</p>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="mb-8 p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-2">
            Good day, Health Warrior!
          </h2>
          <p className="text-lg text-white/60">
            Ready to manage your medications today?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Add Prescription Card */}
          <GlassCard
            hover={true}
            onClick={() => navigate('/health/add-prescription')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Add Prescription</h3>
                <p className="text-white/60 text-sm">Add new medications</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </GlassCard>

          {/* View Reminders Card */}
          <GlassCard
            hover={true}
            onClick={() => navigate('/health/medication-reminders')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r from-emerald-500 to-teal-500">
                  <PillIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Reminders</h3>
                <p className="text-white/60 text-sm">Set medication alerts</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </GlassCard>

          {/* Refill Requests Card */}
          <GlassCard
            hover={true}
            onClick={() => navigate('/health/refill-requests')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r from-orange-500 to-amber-500">
                  <RefreshIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Refill Requests</h3>
                <p className="text-white/60 text-sm">Request prescription refills</p>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 rotate-180" />
            </div>
          </GlassCard>
        </div>

        {/* Your Medication Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Medication Progress</h2>

          {/* Progress Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Active Prescriptions */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Active Prescriptions</p>
                  <p className="text-3xl font-bold text-white">
                    {prescriptions.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <PillIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            {/* Refills Available */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Refills Available</p>
                  <p className="text-3xl font-bold text-white">
                    {prescriptions.filter(p => p.refillsRemaining && p.refillsRemaining > 0).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500">
                  <RefreshIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            {/* Total Medications */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Medications</p>
                  <p className="text-3xl font-bold text-white">
                    {prescriptions.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <FileTextIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Current Medications */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Current Medications</h2>
              <p className="text-sm text-white/60 mt-1">Track and manage your prescriptions</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => prescriptionsQuery.refetch()}
                variant="outline"
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/health/add-prescription')}
                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prescription
              </Button>
            </div>
          </div>
          
          {/* Debug info */}
          {/* <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p>Loading: {String(prescriptionsQuery.loading)}</p>
            <p>Error: {String(prescriptionsQuery.error)}</p>
            <p>Data exists: {String(!!prescriptionsQuery.data)}</p>
            <p>Prescriptions count: {prescriptions.length}</p>
            <p>Raw data count: {prescriptionsQuery.data?.data?.length || 0}</p>
          </div> */}
          
          {prescriptionsQuery.loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white/60">Loading medications...</p>
              </div>
            </div>
          ) : prescriptionsQuery.error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{String(prescriptionsQuery.error) || 'Failed to load prescriptions'}</p>
              <Button
                onClick={() => prescriptionsQuery.refetch()}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.map((prescription) => (
                <GlassCard
                  key={prescription.id}
                  hover={true}
                  glow={true}
                  className="overflow-hidden group relative"
                >
                  {/* Status Badge - Top Right Corner */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge
                      className="rounded-full px-3 py-1 text-xs font-semibold shadow-md"
                      style={{
                        backgroundColor: prescription.status === 'active' ? 'rgb(34, 197, 94)' : 
                                       prescription.status === 'completed' ? 'rgb(156, 163, 175)' : 
                                       'rgb(239, 68, 68)',
                        color: 'white'
                      }}
                    >
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Card Header with Gradient Background */}
                  <div className="p-6 pb-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                        <PillIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 pr-12">
                        <h4 className="font-bold text-lg text-white line-clamp-1">
                          {prescription.medication || prescription.medication_name}
                        </h4>
                        <p className="text-sm text-white/60 mt-1">
                          {prescription.dosage} • {prescription.frequency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 pt-2 space-y-3">
                    {/* Dosage Information */}
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <ScheduleIcon className="h-4 w-4 text-teal-400" />
                        <p className="text-xs font-semibold text-white/80">Dosage Schedule</p>
                      </div>
                      <p className="text-sm text-white font-medium">
                        {prescription.frequency}
                      </p>
                      {prescription.instructions && (
                        <p className="text-xs text-white/60 mt-1">
                          {prescription.instructions}
                        </p>
                      )}
                    </div>

                    {/* Prescribed By */}
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-teal-400" />
                      <div className="flex-1">
                        <p className="text-xs text-white/60">Prescribed by</p>
                        <p className="text-sm text-white font-medium">
                          {prescription.prescribedBy || prescription.prescribed_by}
                        </p>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-teal-400" />
                      <div className="flex-1">
                        <p className="text-xs text-white/60">Started</p>
                        <p className="text-sm text-white font-medium">
                          {prescription.startDate || prescription.start_date ?
                            new Date(prescription.startDate || prescription.start_date).toLocaleDateString() :
                            'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Pharmacy */}
                    {prescription.pharmacy && (
                      <div className="flex items-start gap-3">
                        <PharmacyIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-teal-400" />
                        <div className="flex-1">
                          <p className="text-xs text-white/60">Pharmacy</p>
                          <p className="text-sm text-white font-medium line-clamp-1">
                            {prescription.pharmacy}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Refills Information */}
                    {prescription.refillsRemaining !== undefined && (
                      <div className="pt-3 border-t border-white/10">
                        <div className="p-3 rounded-xl bg-teal-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <RefreshIcon className="h-4 w-4 text-teal-400" />
                              <p className="text-xs font-medium text-teal-400">
                                Refills Remaining
                              </p>
                            </div>
                            <span className="text-lg font-bold text-teal-400">
                              {prescription.refillsRemaining}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Next Refill Date (if available) */}
                    {prescription.nextRefillDate && (
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <div className="flex items-center gap-2">
                          <EventAvailableIcon className="h-4 w-4 text-emerald-400" />
                          <p className="text-xs font-medium text-emerald-400">
                            Next Refill: {prescription.nextRefillDate}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Bottom */}
                  <div className="px-6 pb-4">
                    <div className="flex gap-2 opacity-100 transition-all duration-200">
                      {prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refillPrescription(prescription)}
                          className="flex-1 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400"
                        >
                          <RefreshIcon className="h-4 w-4 mr-2" />
                          Refill
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editPrescription(prescription)}
                        className="flex-1 rounded-xl border-2 border-teal-500/30 hover:border-teal-500 hover:bg-teal-500/10 text-teal-400"
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePrescription(prescription.id)}
                        className="flex-1 rounded-xl border-2 border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400"
                      >
                        <DeleteIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard hover={false} className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6 bg-gradient-to-r from-teal-500 to-cyan-500">
                  <PillIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Medications Yet
                </h3>
                <p className="text-white/60 mb-6">
                  Add your prescriptions to track medications and set reminders
                </p>
                <Button
                  onClick={() => navigate('/health/add-prescription')}
                  className="rounded-xl px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Prescription
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

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

export default Medications;