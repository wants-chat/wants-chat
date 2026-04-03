import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Loader2, Plus, FileText, Calendar, User, Building, Tag, AlertCircle, Trash2, Edit } from 'lucide-react';
import { toast } from '../ui/toast';
import { healthService } from '../../services/healthService';
import type { MedicalRecord } from '../../types/health/medical-records';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface MedicalRecordFormData {
  type: 'visit' | 'prescription' | 'test_result' | 'vaccination' | 'surgery' | 'injury';
  title: string;
  description?: string;
  provider?: string;
  date: string;
  tags?: string[];
}

const MedicalRecordsManager: React.FC = () => {
  const { confirm } = useConfirm();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<MedicalRecordFormData>();

  const recordTypes = [
    { value: 'visit', label: 'Doctor Visit', icon: '👨‍⚕️', color: 'bg-blue-100 text-blue-800' },
    { value: 'prescription', label: 'Prescription', icon: '💊', color: 'bg-green-100 text-green-800' },
    { value: 'test_result', label: 'Test Result', icon: '🔬', color: 'bg-purple-100 text-purple-800' },
    { value: 'vaccination', label: 'Vaccination', icon: '💉', color: 'bg-orange-100 text-orange-800' },
    { value: 'surgery', label: 'Surgery', icon: '🏥', color: 'bg-red-100 text-red-800' },
    { value: 'injury', label: 'Injury', icon: '🩹', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await healthService.getMedicalRecords();
      setRecords(data.records);
    } catch (error) {
      setError('Failed to load medical records');
      console.error('Error loading medical records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MedicalRecordFormData) => {
    try {
      setIsSubmitting(true);
      
      const tags = tagInput ? tagInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      const recordData = {
        ...data,
        date: new Date(data.date),
        metadata: tags.length > 0 ? { tags } : undefined
      };

      if (editingRecord) {
        await healthService.updateMedicalRecord(editingRecord.id, recordData);
        toast.success('Medical record updated successfully!');
      } else {
        await healthService.createMedicalRecord(recordData);
        toast.success('Medical record created successfully!');
      }

      await loadMedicalRecords();
      handleDialogClose();
    } catch (error) {
      toast.error('Failed to save medical record. Please try again.');
      console.error('Error saving medical record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Medical Record',
      message: 'Are you sure you want to delete this medical record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) {
      return;
    }

    try {
      await healthService.deleteMedicalRecord(id);
      toast.success('Medical record deleted successfully!');
      await loadMedicalRecords();
    } catch (error) {
      toast.error('Failed to delete medical record. Please try again.');
      console.error('Error deleting medical record:', error);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setValue('type', record.type);
    setValue('title', record.title);
    setValue('description', record.description || '');
    setValue('provider', record.provider || '');
    setValue('date', new Date(record.date).toISOString().slice(0, 10));
    setTagInput(record.metadata?.tags?.join(', ') || '');
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRecord(null);
    reset();
    setTagInput('');
  };

  const getRecordTypeInfo = (type: string) => {
    return recordTypes.find(t => t.value === type) || recordTypes[0];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading medical records...</span>
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
          <Button onClick={loadMedicalRecords} variant="outline">
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
                <FileText className="h-5 w-5" />
                Medical Records
              </CardTitle>
              <CardDescription>
                Manage your medical history, doctor visits, and health documents
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) setEditingRecord(null);
            }}>
              <DialogTrigger>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Edit Medical Record' : 'Add New Medical Record'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRecord ? 'Update the medical record information.' : 'Record a new medical appointment, test, or health event.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Record Type</Label>
                    <Select onValueChange={(value) => setValue('type', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-destructive">Please select a record type</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Annual Physical Exam, Blood Test Results"
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional details about this record..."
                      rows={3}
                      {...register('description')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Healthcare Provider (Optional)</Label>
                    <Input
                      id="provider"
                      placeholder="e.g., Dr. Smith, City Hospital"
                      {...register('provider')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                    />
                    {errors.date && (
                      <p className="text-sm text-destructive">{errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., routine, urgent, follow-up (comma separated)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingRecord ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {editingRecord ? 'Update Record' : 'Create Record'}
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

      {/* Records List */}
      {records.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No medical records yet</p>
            <p className="text-sm text-muted-foreground">
              Start by adding your first medical record to track your health history
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => {
            const typeInfo = getRecordTypeInfo(record.type);
            return (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={typeInfo.color}>
                          <span className="mr-1">{typeInfo.icon}</span>
                          {typeInfo.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{record.title}</h3>
                      
                      {record.description && (
                        <p className="text-muted-foreground mb-3">{record.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {record.provider && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {record.provider}
                          </span>
                        )}
                      </div>
                      
                      {record.metadata?.tags && record.metadata.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          {record.metadata.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(record.id)}
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

export default MedicalRecordsManager;