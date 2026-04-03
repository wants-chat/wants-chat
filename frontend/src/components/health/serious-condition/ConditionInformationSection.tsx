import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  MedicalInformation,
  CalendarMonth as Calendar,
  Person as User,
  LocalHospital,
  Phone,
  Event,
  Speed,
  Circle
} from '@mui/icons-material';
import { SeriousConditionFormProps } from '../../../types/health';

interface ConditionInformationSectionProps extends SeriousConditionFormProps {
  commonConditions: string[];
  severityOptions: Array<{ value: string; label: string; color: string }>;
  statusOptions: Array<{ value: string; label: string; color: string }>;
  emergencyCountryDropdownOpen: boolean;
  emergencyCountrySearchTerm: string;
  emergencyDropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedEmergencyCountry: { flag: string; code: string; name: string; iso: string } | undefined;
  filteredEmergencyCountries: Array<{ flag: string; code: string; name: string; iso: string }>;
  onEmergencyCountryDropdownToggle: () => void;
  onEmergencyCountrySearchChange: (value: string) => void;
  onEmergencyCountrySelect: (code: string) => void;
}

const ConditionInformationSection: React.FC<ConditionInformationSectionProps> = ({
  formData,
  handleInputChange,
  errors,
  commonConditions,
  severityOptions,
  statusOptions,
  emergencyCountryDropdownOpen,
  emergencyCountrySearchTerm,
  emergencyDropdownRef,
  selectedEmergencyCountry,
  filteredEmergencyCountries,
  onEmergencyCountryDropdownToggle,
  onEmergencyCountrySearchChange,
  onEmergencyCountrySelect
}) => {
  // Get severity color for badge
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-500/20 text-green-400';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      case 'severe': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  // Get status color for badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-400';
      case 'monitoring': return 'bg-blue-500/20 text-blue-400';
      case 'remission': return 'bg-green-500/20 text-green-400';
      case 'resolved': return 'bg-white/10 text-white/60';
      default: return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <div className="p-6 pb-2">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white">
          <MedicalInformation className="h-6 w-6 text-teal-400" />
          Condition Information
        </h3>
        <p className="text-base text-white/60 mt-1">
          Enter the basic details about the serious condition
        </p>
      </div>
      <div className="p-6 pt-4 space-y-8">
        {/* Section 1: Condition Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
            <MedicalInformation className="h-4 w-4" />
            Condition Details
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 bg-white/5 rounded-xl">
            {/* Condition Name */}
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium text-white/80">
                Condition Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                placeholder="Enter condition name (e.g., Type 2 Diabetes)"
                className={`h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.condition ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.condition && <p className="text-xs text-red-400">{errors.condition}</p>}
              <div className="pt-2">
                <p className="text-xs text-white/50 mb-2">Quick select common conditions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {commonConditions.slice(0, 8).map(condition => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => handleInputChange('condition', condition)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                        formData.condition === condition
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent'
                          : 'bg-white/5 border-white/20 text-white/60 hover:border-teal-500 hover:text-teal-400'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnosis Date */}
            <div className="space-y-2">
              <Label htmlFor="diagnosisDate" className="text-sm font-medium text-white/80">
                Diagnosis Date <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  id="diagnosisDate"
                  type="date"
                  value={formData.diagnosis_date}
                  onChange={(e) => handleInputChange('diagnosis_date', e.target.value)}
                  className={`pl-11 h-11 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert ${errors.diagnosis_date ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.diagnosis_date && <p className="text-xs text-red-400">{errors.diagnosis_date}</p>}
            </div>

            {/* Severity & Status Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="severity" className="text-sm font-medium text-white/80 flex items-center gap-1.5">
                  <Speed className="h-4 w-4 text-white/40" />
                  Severity
                </Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => handleInputChange('severity', value as 'mild' | 'moderate' | 'severe' | 'critical')}
                >
                  <SelectTrigger id="severity" className="h-11 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getSeverityColor(formData.severity)}`}>
                        {severityOptions.find(o => o.value === formData.severity)?.label || 'Select'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {severityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getSeverityColor(option.value)}`}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-white/80 flex items-center gap-1.5">
                  <Circle className="h-4 w-4 text-white/40" />
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value as 'active' | 'remission' | 'monitoring' | 'resolved')}
                >
                  <SelectTrigger id="status" className="h-11 rounded-xl bg-white/10 border-white/20 text-white">
                    <SelectValue>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(formData.status)}`}>
                        {statusOptions.find(o => o.value === formData.status)?.label || 'Select'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(option.value)}`}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Healthcare Provider */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4" />
            Healthcare Provider
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 bg-white/5 rounded-xl">
            {/* Treating Doctor */}
            <div className="space-y-2">
              <Label htmlFor="treatingDoctor" className="text-sm font-medium text-white/80">
                Treating Doctor <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  id="treatingDoctor"
                  value={formData.treating_doctor}
                  onChange={(e) => handleInputChange('treating_doctor', e.target.value)}
                  placeholder="Dr. John Smith"
                  className={`pl-11 h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.treating_doctor ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.treating_doctor && <p className="text-xs text-red-400">{errors.treating_doctor}</p>}
            </div>

            {/* Hospital/Clinic */}
            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-sm font-medium text-white/80">
                Hospital/Clinic
              </Label>
              <div className="relative">
                <LocalHospital className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  id="hospital"
                  value={formData.hospital}
                  onChange={(e) => handleInputChange('hospital', e.target.value)}
                  placeholder="City General Hospital"
                  className="pl-11 h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="emergencyPhoneNumber" className="text-sm font-medium text-white/80">
                Emergency Contact Number
              </Label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative w-28" ref={emergencyDropdownRef}>
                  <button
                    type="button"
                    onClick={onEmergencyCountryDropdownToggle}
                    className="w-full px-3 py-2.5 text-left border border-white/20 rounded-xl bg-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-500 h-11 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{selectedEmergencyCountry?.flag}</span>
                      <span className="text-sm text-white">{selectedEmergencyCountry?.code}</span>
                    </div>
                  </button>

                  {emergencyCountryDropdownOpen && (
                    <div className="absolute z-50 w-72 mt-1 bg-teal-800/90 border border-teal-400/30 rounded-xl shadow-xl max-h-64 overflow-hidden">
                      <div className="p-2 border-b border-white/10">
                        <Input
                          type="text"
                          placeholder="Search country..."
                          value={emergencyCountrySearchTerm}
                          onChange={(e) => onEmergencyCountrySearchChange(e.target.value)}
                          className="w-full text-sm h-9 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredEmergencyCountries.map((country) => (
                          <button
                            key={country.iso}
                            type="button"
                            onClick={() => onEmergencyCountrySelect(country.code)}
                            className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                          >
                            <span className="text-base">{country.flag}</span>
                            <span className="text-sm text-white truncate">{country.name}</span>
                            <span className="text-xs text-white/50 ml-auto">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="emergencyPhoneNumber"
                    type="tel"
                    value={formData.emergencyPhoneNumber}
                    onChange={(e) => handleInputChange('emergencyPhoneNumber', e.target.value)}
                    placeholder="555-123-4567"
                    className="pl-11 h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Checkup Schedule */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
            <Event className="h-4 w-4" />
            Checkup Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-white/5 rounded-xl">
            {/* Last Checkup */}
            <div className="space-y-2">
              <Label htmlFor="lastCheckup" className="text-sm font-medium text-white/80">
                Last Checkup
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  id="lastCheckup"
                  type="date"
                  value={formData.last_checkup}
                  onChange={(e) => handleInputChange('last_checkup', e.target.value)}
                  className="pl-11 h-11 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Next Checkup */}
            <div className="space-y-2">
              <Label htmlFor="nextCheckup" className="text-sm font-medium text-white/80">
                Next Checkup
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-400" />
                <Input
                  id="nextCheckup"
                  type="date"
                  value={formData.next_checkup}
                  onChange={(e) => handleInputChange('next_checkup', e.target.value)}
                  className="pl-11 h-11 rounded-xl bg-white/10 border-teal-500/30 text-white [&::-webkit-calendar-picker-indicator]:invert"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="text-xs text-white/50">Schedule your upcoming appointment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionInformationSection;
