// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateEmergencyContact, useUpdateEmergencyContact, useEmergencyContact, useEmergencyContactForm } from '../../hooks/health/useEmergencyContacts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Person,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn,
  Description,
  AccessTime,
  Save,
  Check,
  Close,
  PersonAdd,
  LocalHospital,
  Emergency
} from '@mui/icons-material';

const AddEmergencyContact: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if we're in edit mode
  const editContactId = searchParams.get('edit');
  const isEditMode = !!editContactId;

  // Fetch contact data if in edit mode
  const { contact: existingContact, isLoading: contactLoading } = useEmergencyContact(editContactId || '');

  // Use the form hook for state management
  const { formData, errors, validateForm, updateField, setFormData } = useEmergencyContactForm();

  // Use mutation hooks
  const createContactMutation = useCreateEmergencyContact();
  const updateContactMutation = useUpdateEmergencyContact();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Populate form when editing existing contact
  useEffect(() => {
    if (isEditMode && existingContact) {
      setFormData({
        name: existingContact.name || '',
        relationship: existingContact.relationship || 'friend',
        phone: existingContact.phone || '',
        alternatePhone: existingContact.alternatePhone || '',
        email: existingContact.email || '',
        address: existingContact.address || '',
        isPrimary: existingContact.isPrimary || false,
        category: existingContact.category || 'personal',
        notes: existingContact.notes || '',
        availability: existingContact.availability || '',
        specialization: existingContact.specialization || '',
      });
    }
  }, [isEditMode, existingContact, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        if (isEditMode && editContactId) {
          // Update existing contact
          await updateContactMutation.mutate({ id: editContactId, data: formData });
        } else {
          // Create new contact
          await createContactMutation.mutate(formData);
        }
        setShowSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/health/emergency-contacts');
        }, 2000);
      } catch (error) {
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} emergency contact:`, error);
      }
    }
  };

  const handleCancel = () => {
    navigate('/health/emergency-contacts');
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Serious Care', href: '/health/serious-care' },
    { label: 'Emergency Contacts', href: '/health/emergency-contacts' },
    { label: isEditMode ? 'Edit Contact' : 'Add Contact', icon: Emergency }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-xl">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-300">
                Emergency contact {isEditMode ? 'updated' : 'added'} successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(createContactMutation.isError || updateContactMutation.isError) && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-xl">
            <div className="flex items-center">
              <Close className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-300">
                Failed to {isEditMode ? 'update' : 'add'} emergency contact. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Loading state for fetching existing contact */}
        {contactLoading && isEditMode ? (
          <div className="space-y-6">
            <GlassCard hover={false} className="animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded"></div>
              </div>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-white/20 rounded"></div>
                  <div className="h-10 bg-white/20 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-white/20 rounded"></div>
                  <div className="h-10 bg-white/20 rounded"></div>
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <GlassCard hover={false}>
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <PersonAdd className="h-5 w-5 text-teal-400" />
                Basic Information
              </h3>
              <p className="text-sm text-white/60 mt-1">
                Enter the contact person's basic details
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="John Doe"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.name ? 'border-red-500/50' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-white/80">
                    Relationship <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value: any) => updateField('relationship', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white/80">
                    Contact Category <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => updateField('category', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="emergency-service">Emergency Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isPrimary" className="text-white/80">
                    Primary Contact
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onChange={(e) => updateField('isPrimary', e.target.checked)}
                      className="h-4 w-4 text-teal-500 border-white/20 bg-white/10 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="isPrimary" className="text-sm text-white/80">
                      Mark as primary emergency contact
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Contact Information Card */}
          <GlassCard hover={false}>
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <PhoneIcon className="h-5 w-5 text-teal-400" />
                Contact Information
              </h3>
              <p className="text-sm text-white/60 mt-1">
                How to reach this person in case of emergency
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">
                    Primary Phone <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.phone ? 'border-red-500/50' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone" className="text-white/80">
                    Alternate Phone
                  </Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="alternatePhone"
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => updateField('alternatePhone', e.target.value)}
                      placeholder="+1 (555) 987-6543"
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.alternatePhone ? 'border-red-500/50' : ''}`}
                    />
                  </div>
                  {errors.alternatePhone && (
                    <p className="text-red-400 text-xs mt-1">{errors.alternatePhone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email Address
                </Label>
                <div className="relative">
                  <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.email ? 'border-red-500/50' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-white/80">
                  Address
                </Label>
                <div className="relative">
                  <LocationOn className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    className="pl-10 min-h-[80px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Additional Information Card */}
          <GlassCard hover={false}>
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <Description className="h-5 w-5 text-teal-400" />
                Additional Information
              </h3>
              <p className="text-sm text-white/60 mt-1">
                Optional details that might be helpful
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-white/80">
                    Availability
                  </Label>
                  <div className="relative">
                    <AccessTime className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => updateField('availability', e.target.value)}
                      placeholder="24/7, Weekdays 9-5, etc."
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                {formData.category === 'medical' && (
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-white/80">
                      Specialization
                    </Label>
                    <div className="relative">
                      <LocalHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => updateField('specialization', e.target.value)}
                        placeholder="Cardiologist, General Practitioner, etc."
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white/80">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any additional information about this contact..."
                  className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[120px] bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              disabled={createContactMutation.loading || updateContactMutation.loading || contactLoading}
            >
              <Close className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              disabled={createContactMutation.loading || updateContactMutation.loading || contactLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {(createContactMutation.loading || updateContactMutation.loading) ?
                (isEditMode ? 'Updating...' : 'Saving...') :
                (isEditMode ? 'Update Contact' : 'Save Contact')
              }
            </Button>
          </div>
        </form>
        )}
      </main>
    </div>
  );
};

export default AddEmergencyContact;