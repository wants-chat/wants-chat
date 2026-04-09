// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthProfile, useCreateHealthProfile, useUpdateHealthProfile, useHealthProfileForm, transformApiToForm, transformFormToApi } from '../../hooks/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { countryCodes } from '../../data/countryCodes';
import { ChevronLeft, UserCog, Phone, Search, Activity, Check } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';


const PersonalMedicalInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isEditMode = searchParams.get('edit') === 'true';
  const fromMedicalRecords = searchParams.get('from') === 'medical-records';
  const hasSetUserName = useRef(false);
  const hasPopulatedEditData = useRef(false);

  // Fetch existing health profile if in edit mode
  const { profile: healthProfile, isLoading: profileLoading } = useHealthProfile();

  // Form management
  const {
    formData: userInfo,
    errors,
    validateForm,
    updateField: handleInputChange,
    setFormData: setUserInfo,
    setErrors
  } = useHealthProfileForm();

  // Mutation for creating profile
  const createProfileMutation = useCreateHealthProfile({
    onSuccess: () => {
      console.log('Profile created successfully, setting localStorage flag');
      localStorage.setItem('medicalInfoCompleted', 'true');
      setShowSuccess(true);

      // Navigate immediately and force refresh to avoid caching issues
      setTimeout(() => {
        console.log('Navigating to medical records after successful creation');
        // Use window.location to force a fresh load and avoid caching issues
        window.location.href = '/health/medical-records';
      }, 1000); // Reduced timeout
    },
    onError: (error) => {
      console.error('Failed to create health profile:', error);
    }
  });

  // Mutation for updating profile
  const updateProfileMutation = useUpdateHealthProfile({
    onSuccess: () => {
      console.log('Profile updated successfully');
      setShowSuccess(true);
      setTimeout(() => {
        console.log('Navigating to medical records after successful update');
        window.location.href = '/health/medical-records';
      }, 1000);
    },
    onError: (error) => {
      console.error('Failed to update health profile:', error);
    }
  });

  useEffect(() => {
    // Reset body overflow in case it was left hidden
    document.body.style.overflow = '';


    // In edit mode, don't check localStorage flags
    // In create mode, only redirect if they have completed/skipped AND not coming from medical-records
    if (!isEditMode && !fromMedicalRecords) {
      const hasCompleted = localStorage.getItem('medicalInfoCompleted') === 'true';
      const hasSkipped = localStorage.getItem('medicalInfoSkipped') === 'true';

      // Only redirect if user has completed/skipped and is not coming from medical-records
      if (hasCompleted || hasSkipped) {
        navigate('/health/medical-records');
        return;
      }
    }

    // If coming from medical-records due to missing profile, clear the localStorage flags
    // so they can fill out the form again
    if (fromMedicalRecords && !isEditMode) {
      console.log('PersonalMedicalInfoForm: Coming from medical-records, clearing localStorage flags to allow form completion');
      localStorage.removeItem('medicalInfoCompleted');
      localStorage.removeItem('medicalInfoSkipped');
    }

  }, [navigate, isEditMode, fromMedicalRecords]);

  // Load existing profile data in edit mode or set user name from auth
  useEffect(() => {
    if (isEditMode && healthProfile && !profileLoading && !hasPopulatedEditData.current) {
      const formData = transformApiToForm(healthProfile);
      // Override name with the authenticated user's name
      if (user?.name) {
        formData.name = user.name;
      }
      setUserInfo(formData);
      hasPopulatedEditData.current = true;
    }
  }, [isEditMode, healthProfile, profileLoading, setUserInfo, user?.name]);

  // Separate effect for setting user name (only run once when user is available)
  useEffect(() => {
    if (user?.name && !isEditMode && !hasSetUserName.current) {
      handleInputChange('name', user.name);
      hasSetUserName.current = true;
    }
  }, [user?.name, handleInputChange, isEditMode]);

  // Reset refs when edit mode changes
  useEffect(() => {
    hasSetUserName.current = false;
    hasPopulatedEditData.current = false;
  }, [isEditMode]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);


  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const profileData = transformFormToApi(userInfo);
    console.log('PersonalMedicalInfoForm: Saving profile data:', profileData);

    if (isEditMode) {
      updateProfileMutation.mutate(profileData);
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  const handleSkip = () => {
    console.log('Skip button clicked - navigating to medical records');
    localStorage.setItem('medicalInfoSkipped', 'true');
    navigate('/health/medical-records');
  };

  const selectedCountry = countryCodes.find(country => country.code === userInfo.emergencyCountryCode);

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.code.includes(searchValue)
  );

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: 'Personal Info', icon: UserCog }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-emerald-400 mr-2" />
              <p className="text-emerald-400">
                Medical profile saved successfully!
              </p>
            </div>
          </div>
        )}

        <Card className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                <UserCog className="h-5 w-5 text-white" />
              </div>
              {isEditMode ? 'Edit Your Medical Profile' : 'Complete Your Medical Profile'}
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              {isEditMode
                ? 'Update your medical information to keep your health profile current.'
                : 'This information helps us personalize your health tracking experience and ensures emergency contacts are readily available when needed.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <UserCog className="h-5 w-5 text-teal-400" />
                  Personal Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-white/70">Full Name *</Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={!!user?.name}
                    className={`h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40 ${!!user?.name ? 'opacity-60 cursor-not-allowed' : ''} ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {!!user?.name && (
                    <p className="text-xs text-white/40">Name is automatically pulled from your account</p>
                  )}
                  {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-white/70">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userInfo.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Enter age"
                      className={`h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40 ${errors.age ? 'border-red-500' : ''}`}
                    />
                    {errors.age && <p className="text-sm text-red-400">{errors.age}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-white/70">Gender *</Label>
                    <Select value={userInfo.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger id="gender" className={`h-12 rounded-md bg-white/5 border-white/20 text-white ${errors.gender ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-red-400">{errors.gender}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm font-medium text-white/70">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userInfo.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="Enter height"
                      className="h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium text-white/70">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userInfo.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="Enter weight"
                      className="h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-sm font-medium text-white/70">Blood Type</Label>
                  <Select value={userInfo.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                    <SelectTrigger id="bloodType" className="h-12 rounded-md bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Medical & Emergency Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Phone className="h-5 w-5 text-teal-400" />
                  Medical & Emergency Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-medium text-white/70">Allergies</Label>
                  <Input
                    id="allergies"
                    value={userInfo.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="e.g., Peanuts, Penicillin, None"
                    className="h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="text-sm font-medium text-white/70">Current Medications</Label>
                  <Input
                    id="medications"
                    value={userInfo.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    placeholder="e.g., Aspirin, Metformin, None"
                    className="h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium text-white/70">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    value={userInfo.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Enter emergency contact name"
                    className={`h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40 ${errors.emergencyContact ? 'border-red-500' : ''}`}
                  />
                  {errors.emergencyContact && <p className="text-sm text-red-400">{errors.emergencyContact}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="text-sm font-medium text-white/70">Emergency Contact Phone *</Label>
                  <div className="flex gap-2">
                    <div className="relative country-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-2 px-3 py-3 h-12 border border-white/20 rounded-md bg-white/5 hover:bg-white/10 transition-colors min-w-[140px] text-white"
                      >
                        {selectedCountry ? (
                          <>
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span className="text-sm">{selectedCountry.code}</span>
                          </>
                        ) : (
                          <span className="text-sm text-white/40">Select...</span>
                        )}
                        <Search className="ml-auto h-4 w-4 text-white/40" />
                      </button>

                      {showCountryDropdown && (
                        <div className="absolute top-full mt-1 w-[300px] bg-slate-800 border border-white/20 rounded-md shadow-lg z-50 max-h-[300px] overflow-hidden">
                          <div className="p-2 border-b border-white/10">
                            <Input
                              type="text"
                              placeholder="Search country..."
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                              className="h-10 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-[240px] overflow-y-auto">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <button
                                  key={country.iso}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange('emergencyCountryCode', country.code);
                                    setShowCountryDropdown(false);
                                    setSearchValue('');
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-left text-white"
                                >
                                  <span className="text-xl">{country.flag}</span>
                                  <span className="flex-1 text-sm">{country.name}</span>
                                  <span className="text-xs text-white/40">{country.code}</span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-sm text-white/40">
                                No country found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={userInfo.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      placeholder="Enter phone number"
                      className={`flex-1 h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40 ${errors.emergencyPhone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.emergencyPhone && <p className="text-sm text-red-400">{errors.emergencyPhone}</p>}
                  <p className="text-xs text-white/40">Include area code, no need to repeat country code</p>
                </div>
              </div>
            </div>

            {/* Fitness Information Section */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-teal-400" />
                Fitness Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel" className="text-sm font-medium text-white/70">Activity Level</Label>
                  <Select value={userInfo.fitnessLevel} onValueChange={(value) => handleInputChange('fitnessLevel', value)}>
                    <SelectTrigger id="fitnessLevel" className="h-12 rounded-md bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="extra_active">Extra Active (very hard exercise & physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitnessGoals" className="text-sm font-medium text-white/70">Fitness Goals</Label>
                  <Input
                    id="fitnessGoals"
                    value={userInfo.fitnessGoals}
                    onChange={(e) => handleInputChange('fitnessGoals', e.target.value)}
                    placeholder="e.g., Weight loss, Muscle gain, Endurance"
                    className="h-12 rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/40">Separate multiple goals with commas</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-6 border-t border-white/10">
              {!isEditMode && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="h-12 px-6 rounded-md font-medium border-white/20 text-white hover:bg-white/10"
                >
                  Skip for Now
                </Button>
              )}
              <Button
                onClick={handleSave}
                className={`h-12 px-6 rounded-md font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white ${isEditMode ? 'ml-auto' : ''}`}
                disabled={createProfileMutation.loading || updateProfileMutation.loading}
              >
                {(createProfileMutation.loading || updateProfileMutation.loading)
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Information'
                    : 'Save Information'
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-5 bg-teal-500/10 border border-teal-500/30 rounded-xl">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Phone className="h-6 w-6 text-teal-400 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Why we need emergency contact</h4>
              <p className="text-sm text-white/60 mt-1">
                Your emergency contact information is stored locally and will only be displayed when accessing your medical records.
                This ensures that in case of an emergency, healthcare providers can quickly reach your designated contact person.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalMedicalInfoForm;