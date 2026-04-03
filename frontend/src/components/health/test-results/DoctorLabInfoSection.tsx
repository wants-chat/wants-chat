import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { LocalHospital, Person as User, Business as Building, ContactPhone as ContactIcon } from '@mui/icons-material';
import { TestResultFormProps } from '../../../types/health';
import { countryCodes } from '../../../data/countryCodes';

interface DoctorLabInfoSectionProps extends TestResultFormProps {
  labCountryDropdownOpen: boolean;
  labCountrySearchTerm: string;
  onLabCountryDropdownToggle: () => void;
  onLabCountrySearchChange: (value: string) => void;
  onLabCountrySelect: (code: string) => void;
}

const DoctorLabInfoSection: React.FC<DoctorLabInfoSectionProps> = ({
  formData,
  handleInputChange,
  errors,
  labCountryDropdownOpen,
  labCountrySearchTerm,
  onLabCountryDropdownToggle,
  onLabCountrySearchChange,
  onLabCountrySelect
}) => {
  const labDropdownRef = useRef<HTMLDivElement>(null);

  const filteredLabCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(labCountrySearchTerm.toLowerCase()) ||
    country.code.includes(labCountrySearchTerm)
  );

  const selectedLabCountry = countryCodes.find(country => country.code === formData.labCountryCode);

  // Handle click outside to close lab dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labDropdownRef.current && !labDropdownRef.current.contains(event.target as Node)) {
        if (labCountryDropdownOpen) {
          onLabCountryDropdownToggle();
          onLabCountrySearchChange('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [labCountryDropdownOpen, onLabCountryDropdownToggle, onLabCountrySearchChange]);

  return (
    <Card className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <LocalHospital className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
          Doctor & Laboratory Information
        </CardTitle>
        <CardDescription>
          Details about the ordering physician and testing laboratory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="orderedBy" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ordered By (Doctor) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="orderedBy"
                  placeholder="Dr. John Smith"
                  value={formData.orderedBy}
                  onChange={(e) => handleInputChange('orderedBy', e.target.value)}
                  className={`pl-12 h-12 rounded-xl ${errors.orderedBy ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.orderedBy && (
                <p className="text-sm text-red-500 mt-1">{errors.orderedBy}</p>
              )}
            </div>

            <div>
              <Label htmlFor="orderingDoctorSpecialty" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Doctor's Specialty
              </Label>
              <Input
                id="orderingDoctorSpecialty"
                placeholder="e.g., Cardiologist"
                value={formData.orderingDoctorSpecialty}
                onChange={(e) => handleInputChange('orderingDoctorSpecialty', e.target.value)}
                className="mt-1 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="laboratory" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Laboratory <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Building className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="laboratory"
                  placeholder="Quest Diagnostics"
                  value={formData.laboratory}
                  onChange={(e) => handleInputChange('laboratory', e.target.value)}
                  className={`pl-12 h-12 rounded-xl ${errors.laboratory ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.laboratory && (
                <p className="text-sm text-red-500 mt-1">{errors.laboratory}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="labAddress" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Lab Address
              </Label>
              <Input
                id="labAddress"
                placeholder="123 Medical Center Dr, City, State 12345"
                value={formData.labAddress}
                onChange={(e) => handleInputChange('labAddress', e.target.value)}
                className="mt-1 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="labPhoneNumber" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Lab Phone
              </Label>
              <div className="flex gap-3 mt-1">
                {/* Country Code Dropdown */}
                <div className="relative w-36" ref={labDropdownRef}>
                  <button
                    type="button"
                    onClick={onLabCountryDropdownToggle}
                    className="w-full h-12 px-4 text-left border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedLabCountry?.flag}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedLabCountry?.code}</span>
                    </div>
                  </button>

                  {labCountryDropdownOpen && (
                    <div className="absolute z-50 w-80 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-hidden">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <Input
                          type="text"
                          placeholder="Search country..."
                          value={labCountrySearchTerm}
                          onChange={(e) => onLabCountrySearchChange(e.target.value)}
                          className="w-full text-sm h-10 rounded-lg"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredLabCountries.map((country) => (
                          <button
                            key={country.iso}
                            type="button"
                            onClick={() => onLabCountrySelect(country.code)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{country.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1 relative">
                  <ContactIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="labPhoneNumber"
                    type="tel"
                    value={formData.labPhoneNumber}
                    onChange={(e) => handleInputChange('labPhoneNumber', e.target.value)}
                    placeholder="123-456-7890"
                    className="pl-12 h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorLabInfoSection;
