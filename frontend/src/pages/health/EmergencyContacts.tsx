import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, User, AlertCircle, Plus, Edit2, Trash2, Star, Search, Filter, Shield, Heart } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { useEmergencyContacts, useDeleteEmergencyContact } from '../../hooks/health/useEmergencyContacts';
import { useMedicalFacilities, useDeleteMedicalFacility } from '../../hooks/health/useMedicalFacilities';
import { MedicalFacility } from '../../types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  ChevronLeft,
  Emergency,
  LocalHospital,
  Person,
  LocationOn,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MedicalServices,
  Favorite,
  Home,
  Work,
  Warning,
  ContactPhone,
  PersonAdd,
  Speed,
  HealthAndSafety,
  Groups,
  SupportAgent
} from '@mui/icons-material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

import { EmergencyContact } from '../../types/health';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

const EmergencyContacts: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingFacility, setEditingFacility] = useState<MedicalFacility | null>(null);
  const [activeTab, setActiveTab] = useState('contacts');

  // Use API hooks to fetch emergency contacts and medical facilities
  const { contacts, isLoading, isError, error, refetch } = useEmergencyContacts();
  const deleteContactMutation = useDeleteEmergencyContact();

  const {
    facilities: medicalFacilities,
    isLoading: facilitiesLoading,
    isError: facilitiesError,
    error: facilitiesErrorMessage,
    refetch: refetchFacilities
  } = useMedicalFacilities();
  const deleteFacilityMutation = useDeleteMedicalFacility();

  const emergencyNumbers = [
    { service: 'Emergency Services', number: '911', description: 'Police, Fire, Medical Emergency' },
    { service: 'Poison Control', number: '1-800-222-1222', description: '24/7 Poison Emergency Hotline' },
    { service: 'Suicide Prevention', number: '988', description: 'Suicide & Crisis Lifeline' },
    { service: 'Domestic Violence', number: '1-800-799-7233', description: 'National Domestic Violence Hotline' }
  ];

  const handleDeleteContact = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: 'Are you sure you want to delete this contact?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await deleteContactMutation.mutate(id);
        refetch(); // Refresh the contacts list
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const handleDeleteFacility = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Facility',
      message: 'Are you sure you want to delete this facility?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await deleteFacilityMutation.mutate(id);
        refetchFacilities(); // Refresh the facilities list
      } catch (error) {
        console.error('Failed to delete facility:', error);
      }
    }
  };



  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'spouse':
      case 'parent':
      case 'child':
      case 'sibling':
        return <Home className="h-5 w-5" />;
      case 'doctor':
        return <MedicalServices className="h-5 w-5" />;
      case 'caregiver':
        return <HealthAndSafety className="h-5 w-5" />;
      default:
        return <Person className="h-5 w-5" />;
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <LocalHospital className="h-5 w-5" />;
      case 'clinic':
        return <MedicalServices className="h-5 w-5" />;
      case 'pharmacy':
        return <Icon path={mdiHeartPulse} size={0.8} />;
      case 'urgent-care':
        return <Emergency className="h-5 w-5" />;
      default:
        return <HealthAndSafety className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal':
        return 'rgb(139, 92, 246)';
      case 'medical':
        return 'rgb(34, 197, 94)';
      case 'emergency-service':
        return 'rgb(239, 68, 68)';
      default:
        return 'rgb(107, 114, 128)';
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFacilities = medicalFacilities.filter(facility =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Serious Care', href: '/health/serious-care' },
    { label: 'Emergency Contacts', icon: Emergency }
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
        {/* Welcome Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Emergency Contact Management
          </h1>
          <p className="text-lg text-white/60">
            Keep your emergency contacts and medical facilities readily accessible
          </p>
        </div>

        {/* Emergency Numbers - Always Visible */}
        <GlassCard hover={false} className="mb-8 border-red-500/30">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Emergency className="h-6 w-6 text-red-400" />
              Emergency Hotlines
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyNumbers.map(service => (
              <div key={service.number} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <h4 className="font-semibold text-lg text-white">
                  {service.service}
                </h4>
                <p className="text-2xl font-bold text-red-400 my-1">
                  {service.number}
                </p>
                <p className="text-xs text-white/60">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search contacts or facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>

        {/* Tabs for Contacts and Facilities */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 gap-2 h-auto p-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
            <TabsTrigger value="contacts" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
              <Groups className="h-5 w-5 mr-2" />
              Personal Contacts
            </TabsTrigger>
            <TabsTrigger value="facilities" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
              <LocalHospital className="h-5 w-5 mr-2" />
              Medical Facilities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            {/* Add Contact Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Emergency Contacts ({!isLoading && !isError ? filteredContacts.length : '...'})
              </h2>
              <Button
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                onClick={() => navigate('/health/add-emergency-contact')}
              >
                <PersonAdd className="h-5 w-5 mr-2" />
                Add Contact
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <GlassCard key={i} hover={false} className="animate-pulse">
                    <div className="h-6 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded"></div>
                      <div className="h-4 bg-white/20 rounded"></div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <GlassCard hover={false} className="p-12 text-center border-red-500/30">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Error Loading Contacts
                </h3>
                <p className="text-white/60 mb-6">
                  {error || 'Failed to load emergency contacts. Please try again.'}
                </p>
                <Button onClick={() => refetch()} className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                  Try Again
                </Button>
              </GlassCard>
            )}

            {/* Contacts Grid */}
            {!isLoading && !isError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map(contact => (
                <GlassCard key={contact.id} hover={true}>
                  <div>
                    {contact.isPrimary && (
                      <Badge className="mb-3 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        Primary Contact
                      </Badge>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ 
                            backgroundColor: `${getCategoryColor(contact.category)}20`,
                            color: getCategoryColor(contact.category)
                          }}
                        >
                          {getRelationshipIcon(contact.relationship)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white">
                            {contact.name}
                          </h3>
                          <p className="text-sm text-white/60 capitalize">
                            {contact.relationship}
                            {contact.specialization && ` - ${contact.specialization}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-teal-400" />
                        <span className="text-white/80">{contact.phone}</span>
                      </div>

                      {contact.alternatePhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <PhoneIcon className="h-4 w-4 text-teal-400" />
                          <span className="text-white/80">{contact.alternatePhone}</span>
                          <Badge variant="outline" className="text-xs border-white/20 text-white/60">Alt</Badge>
                        </div>
                      )}

                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <EmailIcon className="h-4 w-4 text-teal-400" />
                          <span className="text-white/80 truncate">{contact.email}</span>
                        </div>
                      )}

                      {contact.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <LocationOn className="h-4 w-4 text-teal-400" />
                          <span className="text-white/80">{contact.address}</span>
                        </div>
                      )}

                      {contact.availability && (
                        <div className="flex items-center gap-2 text-sm">
                          <Speed className="h-4 w-4 text-teal-400" />
                          <span className="text-white/80">{contact.availability}</span>
                        </div>
                      )}

                      {contact.notes && (
                        <p className="text-sm text-white/60 italic mt-2">
                          {contact.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <Button
                        size="sm"
                        onClick={() => window.location.href = `tel:${contact.phone}`}
                        className="rounded-lg flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/health/add-emergency-contact?edit=${contact.id}`)}
                        className="rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredContacts.length === 0 && (
              <GlassCard hover={false} className="p-12 text-center">
                <Groups className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No contacts found
                </h3>
                <p className="text-white/60 mb-6">
                  {searchQuery ? 'Try adjusting your search' : 'Add your first emergency contact'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/health/add-emergency-contact')}
                    className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                  >
                    <PersonAdd className="h-5 w-5 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6">
            {/* Add Facility Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Medical Facilities ({!facilitiesLoading && !facilitiesError ? filteredFacilities.length : '...'})
              </h2>
              <Button
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                onClick={() => navigate('/health/add-medical-facility')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Facility
              </Button>
            </div>

            {/* Loading State */}
            {facilitiesLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <GlassCard key={i} hover={false} className="animate-pulse">
                    <div className="h-6 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded"></div>
                      <div className="h-4 bg-white/20 rounded"></div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Error State */}
            {facilitiesError && (
              <GlassCard hover={false} className="p-12 text-center border-red-500/30">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Error Loading Facilities
                </h3>
                <p className="text-white/60 mb-6">
                  {facilitiesErrorMessage || 'Failed to load medical facilities. Please try again.'}
                </p>
                <Button onClick={() => refetchFacilities()} className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                  Try Again
                </Button>
              </GlassCard>
            )}

            {/* Facilities Grid */}
            {!facilitiesLoading && !facilitiesError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFacilities.map(facility => (
                <GlassCard key={facility.id} hover={true}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ 
                            backgroundColor: facility.emergencyAvailable ? 'rgb(239, 68, 68, 0.1)' : 'rgb(71, 189, 255, 0.1)',
                            color: facility.emergencyAvailable ? 'rgb(239, 68, 68)' : 'rgb(71, 189, 255)'
                          }}
                        >
                          {getFacilityIcon(facility.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white">
                            {facility.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize border-white/20 text-white/60"
                            >
                              {facility.type.replace('-', ' ')}
                            </Badge>
                            {facility.emergencyAvailable && (
                              <Badge className="text-xs bg-red-500/20 text-red-300 border-red-500/30">
                                Emergency
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {facility.distance && (
                        <span className="text-sm text-white/60">
                          {facility.distance}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-teal-400" />
                        <span className="text-white/80">{facility.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <LocationOn className="h-4 w-4 text-teal-400" />
                        <span className="text-white/80">{facility.address}</span>
                      </div>

                      {facility.hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Speed className="h-4 w-4 text-teal-400" />
                          <span className="text-white/80">{facility.hours}</span>
                        </div>
                      )}

                      {facility.specialties && facility.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {facility.specialties.map(specialty => (
                            <Badge key={specialty} variant="outline" className="text-xs border-white/20 text-white/60">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {facility.notes && (
                        <p className="text-sm text-white/60 italic mt-2">
                          {facility.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <Button
                        size="sm"
                        onClick={() => window.location.href = `tel:${facility.phone}`}
                        className="rounded-lg flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://maps.google.com/?q=${facility.address}`, '_blank')}
                        className="rounded-lg flex-1 bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/health/add-medical-facility?edit=${facility.id}`)}
                        className="rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFacility(facility.id)}
                        className="rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
              </div>
            )}

            {/* Empty State */}
            {!facilitiesLoading && !facilitiesError && filteredFacilities.length === 0 && (
              <GlassCard hover={false} className="p-12 text-center">
                <LocalHospital className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No facilities found
                </h3>
                <p className="text-white/60 mb-6">
                  {searchQuery ? 'Try adjusting your search' : 'Add your first medical facility'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/health/add-medical-facility')}
                    className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Facility
                  </Button>
                )}
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmergencyContacts;