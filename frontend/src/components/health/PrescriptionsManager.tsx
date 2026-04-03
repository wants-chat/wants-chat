import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Loader2, Plus, Pill, Calendar, User, Clock, AlertCircle, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '../ui/toast';
import { healthService } from '../../services/healthService';
import type { Prescription } from '../../types/health/medications';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface PrescriptionFormData {
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
}

const PrescriptionsManager: React.FC = () => {
  const { confirm } = useConfirm();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<PrescriptionFormData>({
    defaultValues: {
      isActive: true
    }
  });

  const isActive = watch('isActive');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await healthService.getPrescriptions();
      setPrescriptions(data.data);
    } catch (error) {
      setError('Failed to load prescriptions');
      console.error('Error loading prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      setIsSubmitting(true);
      
      const prescriptionData = {
        medicationName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        prescribedBy: data.prescribedBy,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        status: data.isActive ? 'active' as const : 'completed' as const
      };

      if (editingPrescription) {
        await healthService.updatePrescription(editingPrescription.id, prescriptionData);
        toast.success('Prescription updated successfully!');
      } else {
        await healthService.createPrescription(prescriptionData);
        toast.success('Prescription added successfully!');
      }

      await loadPrescriptions();
      handleDialogClose();
    } catch (error) {
      toast.error('Failed to save prescription. Please try again.');
      console.error('Error saving prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prescription: Prescription) => {
    const confirmed = await confirm({
      title: 'Delete Prescription',
      message: 'Are you sure you want to delete this prescription?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) {
      return;
    }

    try {
      await healthService.deletePrescription(prescription.id, prescription.medicationName || 'Unknown');
      toast.success('Prescription deleted successfully!');
      await loadPrescriptions();
    } catch (error) {
      toast.error('Failed to delete prescription. Please try again.');
      console.error('Error deleting prescription:', error);
    }
  };

  const handleToggleActive = async (prescription: Prescription) => {
    try {
      await healthService.updatePrescription(prescription.id, {
        status: prescription.status === 'active' ? 'completed' as const : 'active' as const
      });
      toast.success(`Prescription ${prescription.status === 'active' ? 'deactivated' : 'activated'} successfully!`);
      await loadPrescriptions();
    } catch (error) {
      toast.error('Failed to update prescription status. Please try again.');
      console.error('Error updating prescription:', error);
    }
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setValue('medicationName', prescription.medicationName || '');
    setValue('dosage', prescription.dosage || '');
    setValue('frequency', prescription.frequency || '');
    setValue('prescribedBy', prescription.prescribedBy || '');
    setValue('startDate', prescription.startDate ? new Date(prescription.startDate).toISOString().split('T')[0] : '');
    setValue('endDate', prescription.endDate ? new Date(prescription.endDate).toISOString().split('T')[0] : '');
    setValue('notes', prescription.notes || '');
    setValue('isActive', prescription.status === 'active');
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPrescription(null);
    reset({ isActive: true });
  };

  const isExpiringSoon = (endDate: string | undefined) => {
    if (!endDate) return false;
    const now = new Date();
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string | undefined) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'active') return prescription.status === 'active';
    if (filter === 'inactive') return prescription.status !== 'active';
    return true;
  });

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const expiringPrescriptions = prescriptions.filter(p => p.status === 'active' && isExpiringSoon(p.endDate)).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading prescriptions...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadPrescriptions} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescriptions
              </CardTitle>
              <CardDescription>
                Manage your medications and track prescription details
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) setEditingPrescription(null);
            }}>
              <DialogTrigger>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingPrescription ? 'Edit Prescription' : 'Add New Prescription'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPrescription ? 'Update the prescription information.' : 'Add a new prescription to your medication list.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name</Label>
                    <Input
                      id="medicationName"
                      placeholder="e.g., Lisinopril, Metformin"
                      {...register('medicationName', { required: 'Medication name is required' })}
                    />
                    {errors.medicationName && (
                      <p className="text-sm text-destructive">{errors.medicationName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 10mg, 500mg"
                        {...register('dosage', { required: 'Dosage is required' })}
                      />
                      {errors.dosage && (
                        <p className="text-sm text-destructive">{errors.dosage.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        placeholder="e.g., Once daily, Twice daily"
                        {...register('frequency', { required: 'Frequency is required' })}
                      />
                      {errors.frequency && (
                        <p className="text-sm text-destructive">{errors.frequency.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescribedBy">Prescribed By</Label>
                    <Input
                      id="prescribedBy"
                      placeholder="e.g., Dr. Smith, Dr. Johnson"
                      {...register('prescribedBy', { required: 'Prescribing doctor is required' })}
                    />
                    {errors.prescribedBy && (
                      <p className="text-sm text-destructive">{errors.prescribedBy.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('startDate', { required: 'Start date is required' })}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('endDate')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Special instructions, side effects to monitor, etc."
                      rows={3}
                      {...register('notes')}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active Prescription</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingPrescription ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          {editingPrescription ? 'Update Prescription' : 'Add Prescription'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                <p className="text-2xl font-bold">{activePrescriptions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{expiringPrescriptions}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                <p className="text-2xl font-bold">{prescriptions.length}</p>
              </div>
              <Pill className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({prescriptions.length})
            </Button>
            <Button 
              variant={filter === 'active' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active ({activePrescriptions})
            </Button>
            <Button 
              variant={filter === 'inactive' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('inactive')}
            >
              Inactive ({prescriptions.length - activePrescriptions})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">
              {filter === 'all' 
                ? 'No prescriptions yet' 
                : `No ${filter} prescriptions`}
            </p>
            <p className="text-sm text-muted-foreground">
              Add your first prescription to start tracking your medications
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPrescriptions.map((prescription) => {
            const expiringSoon = isExpiringSoon(prescription.endDate);
            const expired = isExpired(prescription.endDate);
            
            return (
              <Card key={prescription.id} className={`
                ${prescription.status === 'active'
                  ? expiringSoon ? 'border-l-4 border-l-orange-500'
                    : expired ? 'border-l-4 border-l-red-500'
                    : 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-gray-400 opacity-70'
                }
              `}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{prescription.medicationName}</h3>
                        <div className="flex gap-2">
                          <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                            {prescription.status === 'active' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                          {prescription.status === 'active' && expiringSoon && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          )}
                          {prescription.status === 'active' && expired && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Dosage:</span> {prescription.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {prescription.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Started:</span> {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">
                            {prescription.endDate ? 'Ends:' : 'Duration:'}
                          </span>{' '}
                          {prescription.endDate
                            ? new Date(prescription.endDate).toLocaleDateString()
                            : 'Ongoing'
                          }
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {prescription.prescribedBy}
                        </span>
                      </div>
                      
                      {prescription.notes && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          <strong>Notes:</strong> {prescription.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(prescription)}
                        className={prescription.status === 'active' ? "text-red-600" : "text-green-600"}
                      >
                        {prescription.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(prescription)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(prescription)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrescriptionsManager;