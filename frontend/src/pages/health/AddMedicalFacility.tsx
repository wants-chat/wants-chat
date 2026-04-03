import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, X, MapPin, Phone, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { useCreateMedicalFacility, useUpdateMedicalFacility, useMedicalFacility, useMedicalFacilityForm } from '../../hooks/health/useMedicalFacilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  LocalHospital,
  Phone as PhoneIcon,
  LocationOn,
  AccessTime,
  Description,
  Save,
  Check,
  Close,
  Warning,
  Emergency,
  MedicalServices,
  HealthAndSafety,
  LocalPharmacy,
  Science,
  Speed
} from '@mui/icons-material';

import { MedicalFacilityFormData } from '../../types/health';

const AddMedicalFacility: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState('');
  const [currentInsurance, setCurrentInsurance] = useState('');
  
  // Check if we're in edit mode
  const editFacilityId = searchParams.get('edit');
  const isEditMode = !!editFacilityId;
  
  // Fetch facility data if in edit mode
  const { facility: existingFacility, isLoading: facilityLoading } = useMedicalFacility(editFacilityId || '');
  
  // Use the form hook for state management
  const { 
    formData, 
    errors, 
    validateForm, 
    updateField, 
    setFormData,
    addSpecialty,
    removeSpecialty,
    addInsurance,
    removeInsurance
  } = useMedicalFacilityForm();
  
  // Use mutation hooks
  const createFacilityMutation = useCreateMedicalFacility();
  const updateFacilityMutation = useUpdateMedicalFacility();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Populate form when editing existing facility
  useEffect(() => {
    if (isEditMode && existingFacility) {
      setFormData({
        name: existingFacility.name || '',
        type: existingFacility.type || 'hospital',
        phone: existingFacility.phone || '',
        address: existingFacility.address || '',
        hours: existingFacility.hours || '',
        emergencyAvailable: existingFacility.emergencyAvailable || false,
        distance: existingFacility.distance || '',
        specialties: existingFacility.specialties || [],
        notes: existingFacility.notes || '',
        website: existingFacility.website || '',
        insurance: existingFacility.insurance || [],
      });
    }
  }, [isEditMode, existingFacility, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        if (isEditMode && editFacilityId) {
          // Update existing facility
          await updateFacilityMutation.mutate({ id: editFacilityId, data: formData });
        } else {
          // Create new facility
          await createFacilityMutation.mutate(formData);
        }
        setShowSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/health/emergency-contacts');
        }, 2000);
      } catch (error) {
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} medical facility:`, error);
      }
    }
  };

  const handleCancel = () => {
    navigate('/health/emergency-contacts');
  };

  const handleAddSpecialty = () => {
    if (currentSpecialty) {
      addSpecialty(currentSpecialty);
      setCurrentSpecialty('');
    }
  };

  const handleAddInsurance = () => {
    if (currentInsurance) {
      addInsurance(currentInsurance);
      setCurrentInsurance('');
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <LocalHospital className="h-5 w-5" />;
      case 'clinic':
        return <MedicalServices className="h-5 w-5" />;
      case 'pharmacy':
        return <LocalPharmacy className="h-5 w-5" />;
      case 'lab':
        return <Science className="h-5 w-5" />;
      case 'urgent-care':
        return <Speed className="h-5 w-5" />;
      default:
        return <LocalHospital className="h-5 w-5" />;
    }
  };

  const getFacilityColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'clinic': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'pharmacy': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'lab': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'urgent-care': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: isEditMode ? 'Edit Facility' : 'Add Facility', icon: LocalHospital }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">
                Medical facility {isEditMode ? 'updated' : 'added'} successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(createFacilityMutation.isError || updateFacilityMutation.isError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <Close className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400">
                Failed to {isEditMode ? 'update' : 'add'} medical facility. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Loading state for fetching existing facility */}
        {facilityLoading && isEditMode ? (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getFacilityIcon(formData.type)}
                <span className="text-primary">Facility Information</span>
              </CardTitle>
              <CardDescription>
                Enter the medical facility's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Facility Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <LocalHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="City General Hospital"
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Facility Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => updateField('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="urgent-care">Urgent Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyAvailable">
                    Emergency Services
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="emergencyAvailable"
                      checked={formData.emergencyAvailable}
                      onChange={(e) => updateField('emergencyAvailable', e.target.checked)}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="emergencyAvailable" className="text-sm text-gray-700 dark:text-gray-300">
                      24/7 Emergency services available
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance">
                    Distance
                  </Label>
                  <div className="relative">
                    <LocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="distance"
                      value={formData.distance}
                      onChange={(e) => updateField('distance', e.target.value)}
                      placeholder="2.5 miles"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-primary" />
                Contact & Location
              </CardTitle>
              <CardDescription>
                How to reach and find this facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.hospital.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <LocationOn className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="789 Hospital Rd, City, State, ZIP"
                    className={`pl-10 min-h-[80px] ${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">
                  Operating Hours
                </Label>
                <div className="relative">
                  <AccessTime className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="hours"
                    value={formData.hours}
                    onChange={(e) => updateField('hours', e.target.value)}
                    placeholder="Mon-Fri 8AM-5PM, Sat 9AM-2PM"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services & Insurance Card */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HealthAndSafety className="h-5 w-5 text-primary" />
                Services & Insurance
              </CardTitle>
              <CardDescription>
                Specialties and insurance information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Specialties / Services</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentSpecialty}
                    onChange={(e) => setCurrentSpecialty(e.target.value)}
                    placeholder="e.g., Emergency Care, Cardiology"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSpecialty();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSpecialty}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.specialties || []).map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {specialty}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSpecialty(specialty)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accepted Insurance</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentInsurance}
                    onChange={(e) => setCurrentInsurance(e.target.value)}
                    placeholder="e.g., Blue Cross, Medicare"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInsurance();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddInsurance}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.insurance || []).map((ins) => (
                    <Badge
                      key={ins}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {ins}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeInsurance(ins)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any additional information about this facility..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[120px]"
              disabled={createFacilityMutation.loading || updateFacilityMutation.loading || facilityLoading}
            >
              <Close className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              disabled={createFacilityMutation.loading || updateFacilityMutation.loading || facilityLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {(createFacilityMutation.loading || updateFacilityMutation.loading) ? 
                (isEditMode ? 'Updating...' : 'Saving...') : 
                (isEditMode ? 'Update Facility' : 'Save Facility')
              }
            </Button>
          </div>
        </form>
        )}
      </main>
    </div>
  );
};

export default AddMedicalFacility;