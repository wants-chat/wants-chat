/**
 * Veterinary Component Generators
 *
 * Generates components for veterinary clinics:
 * - PetProfile: Complete pet medical profile for vet context
 * - OwnerProfile: Pet owner profile with their pets
 */

export interface PetProfileVetOptions {
  componentName?: string;
  endpoint?: string;
}

export interface OwnerProfileOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate PetProfile component for veterinary context
 */
export function generatePetProfile(options: PetProfileVetOptions = {}): string {
  const {
    componentName = 'PetProfile',
    endpoint = '/vet/pets',
  } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Dog,
  Cat,
  Phone,
  Mail,
  User,
  Calendar,
  AlertCircle,
  Heart,
  Pill,
  FileText,
  Syringe,
  Stethoscope,
  Weight,
  Ruler,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface VetPetData {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile' | 'other';
  breed: string;
  age: number;
  date_of_birth?: string;
  weight?: number;
  weight_history?: { date: string; weight: number }[];
  size?: 'small' | 'medium' | 'large';
  color: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  microchip_id?: string;
  is_neutered?: boolean;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: {
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    notes?: string;
  }[];
  vaccinations?: {
    id: string;
    name: string;
    date: string;
    expiry_date?: string;
    batch_number?: string;
    administered_by?: string;
  }[];
  medical_history?: {
    id: string;
    date: string;
    type: 'checkup' | 'surgery' | 'illness' | 'injury' | 'emergency' | 'dental' | 'lab_work';
    diagnosis: string;
    treatment: string;
    notes?: string;
    doctor_name: string;
    follow_up_date?: string;
  }[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  insurance?: {
    provider: string;
    policy_number: string;
    coverage_type?: string;
    expires_at?: string;
  };
  dietary_notes?: string;
  behavioral_notes?: string;
  special_handling?: string;
  last_visit?: string;
  next_appointment?: string;
}

interface ${componentName}Props {
  petId?: string;
  className?: string;
}

const visitTypeConfig: Record<string, { color: string; label: string }> = {
  checkup: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Checkup' },
  surgery: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Surgery' },
  illness: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Illness' },
  injury: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Injury' },
  emergency: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Emergency' },
  dental: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Dental' },
  lab_work: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Lab Work' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ petId: propPetId, className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const petId = propPetId || id;

  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [showAllVaccinations, setShowAllVaccinations] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const { data: pet, isLoading } = useQuery({
    queryKey: ['vet-pet', petId],
    queryFn: async () => {
      const response = await api.get<VetPetData>(\`${endpoint}/\${petId}\`);
      return response?.data || response;
    },
    enabled: !!petId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!pet) {
    return <div className="text-center py-12 text-gray-500">Pet not found</div>;
  }

  const PetIcon = pet.type === 'dog' ? Dog : Cat;

  const isVaccinationExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isVaccinationExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry > new Date();
  };

  const displayedVaccinations = showAllVaccinations
    ? pet.vaccinations
    : pet.vaccinations?.slice(0, 5);

  const displayedHistory = showAllHistory
    ? pet.medical_history
    : pet.medical_history?.slice(0, 5);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pet Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {pet.avatar_url ? (
            <img src={pet.avatar_url} alt={pet.name} className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <PetIcon className="w-16 h-16 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pet.name}</h1>
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                pet.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              )}>
                {pet.gender}
              </span>
              {pet.is_neutered && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {pet.gender === 'male' ? 'Neutered' : 'Spayed'}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{pet.breed}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {pet.age} years old
                {pet.date_of_birth && (
                  <span className="text-gray-500">
                    ({new Date(pet.date_of_birth).toLocaleDateString()})
                  </span>
                )}
              </span>
              {pet.weight && (
                <span className="flex items-center gap-1">
                  <Weight className="w-4 h-4" />
                  {pet.weight} lbs
                </span>
              )}
              {pet.blood_type && (
                <span>Blood Type: {pet.blood_type}</span>
              )}
            </div>
            {pet.microchip_id && (
              <p className="text-xs text-gray-500 mt-2">Microchip ID: {pet.microchip_id}</p>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => navigate(\`/vet/pets/\${petId}/appointment\`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
              <button
                onClick={() => navigate(\`/vet/pets/\${petId}/edit\`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="min-w-[250px] space-y-4">
            {pet.next_appointment && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Next Appointment
                </p>
                <p className="text-lg font-semibold text-green-800 dark:text-green-300 mt-1">
                  {new Date(pet.next_appointment).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            {pet.last_visit && (
              <div className="text-sm text-gray-500">
                Last visit: {new Date(pet.last_visit).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Info Bar */}
      {(pet.allergies?.length || pet.chronic_conditions?.length || pet.special_handling) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-6">
            {pet.allergies && pet.allergies.length > 0 && (
              <div>
                <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-medium text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Allergies:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pet.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-xs">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pet.chronic_conditions && pet.chronic_conditions.length > 0 && (
              <div>
                <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-medium text-sm">
                  <Heart className="w-4 h-4" />
                  Chronic Conditions:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pet.chronic_conditions.map((condition, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded text-xs">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pet.special_handling && (
              <div>
                <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-medium text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Special Handling:
                </span>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{pet.special_handling}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vaccinations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-500" />
              Vaccinations
            </h2>
            <button
              onClick={() => navigate(\`/vet/pets/\${petId}/vaccinations/new\`)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {pet.vaccinations && pet.vaccinations.length > 0 ? (
            <div className="space-y-3">
              {displayedVaccinations?.map((vax) => {
                const expired = isVaccinationExpired(vax.expiry_date);
                const expiringSoon = isVaccinationExpiringSoon(vax.expiry_date);
                return (
                  <div
                    key={vax.id}
                    className={cn(
                      'p-3 rounded-lg border',
                      expired
                        ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        : expiringSoon
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{vax.name}</p>
                        <p className="text-sm text-gray-500">
                          Given: {new Date(vax.date).toLocaleDateString()}
                        </p>
                      </div>
                      {vax.expiry_date && (
                        <div className={cn(
                          'text-xs font-medium px-2 py-1 rounded',
                          expired
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            : expiringSoon
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        )}>
                          {expired ? 'Expired' : expiringSoon ? 'Expiring Soon' : 'Valid'}
                        </div>
                      )}
                    </div>
                    {vax.expiry_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(vax.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
              {pet.vaccinations.length > 5 && (
                <button
                  onClick={() => setShowAllVaccinations(!showAllVaccinations)}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 py-2"
                >
                  {showAllVaccinations ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Show All ({pet.vaccinations.length})
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No vaccinations recorded</p>
          )}
        </div>

        {/* Current Medications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-500" />
              Current Medications
            </h2>
            <button
              onClick={() => navigate(\`/vet/pets/\${petId}/medications/new\`)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {pet.current_medications && pet.current_medications.length > 0 ? (
            <div className="space-y-3">
              {pet.current_medications.map((med, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {med.dosage} - {med.frequency}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started: {new Date(med.start_date).toLocaleDateString()}
                    {med.end_date && \` - Ends: \${new Date(med.end_date).toLocaleDateString()}\`}
                  </p>
                  {med.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{med.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No current medications</p>
          )}
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-500" />
            Medical History
          </h2>
          <button
            onClick={() => navigate(\`/vet/pets/\${petId}/records/new\`)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>

        {pet.medical_history && pet.medical_history.length > 0 ? (
          <div className="space-y-3">
            {displayedHistory?.map((record) => {
              const typeConfig = visitTypeConfig[record.type] || visitTypeConfig.checkup;
              const isExpanded = expandedHistory === record.id;
              return (
                <div
                  key={record.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => setExpandedHistory(isExpanded ? null : record.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn('px-2 py-1 text-xs font-medium rounded', typeConfig.color)}>
                          {typeConfig.label}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{record.diagnosis}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()} - Dr. {record.doctor_name}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Treatment</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{record.treatment}</p>
                        </div>
                        {record.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{record.notes}</p>
                          </div>
                        )}
                        {record.follow_up_date && (
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                              Follow-up: {new Date(record.follow_up_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {pet.medical_history.length > 5 && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 py-2"
              >
                {showAllHistory ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Show All ({pet.medical_history.length})
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No medical history recorded</p>
        )}
      </div>

      {/* Owner & Insurance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Owner Information
          </h2>
          <div className="space-y-3">
            <p className="font-medium text-gray-900 dark:text-white">{pet.owner.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              {pet.owner.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              {pet.owner.phone}
            </div>
            {pet.owner.address && (
              <p className="text-sm text-gray-500">{pet.owner.address}</p>
            )}
            <button
              onClick={() => navigate(\`/vet/owners/\${pet.owner.id}\`)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View owner profile
            </button>
          </div>
        </div>

        {pet.insurance && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Insurance Information
            </h2>
            <div className="space-y-3">
              <p className="font-medium text-gray-900 dark:text-white">{pet.insurance.provider}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Policy: {pet.insurance.policy_number}
              </p>
              {pet.insurance.coverage_type && (
                <p className="text-sm text-gray-500">Coverage: {pet.insurance.coverage_type}</p>
              )}
              {pet.insurance.expires_at && (
                <p className="text-sm text-gray-500">
                  Expires: {new Date(pet.insurance.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Notes */}
      {(pet.dietary_notes || pet.behavioral_notes) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {pet.dietary_notes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dietary Notes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.dietary_notes}</p>
            </div>
          )}
          {pet.behavioral_notes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Behavioral Notes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.behavioral_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate OwnerProfile component
 */
export function generateOwnerProfile(options: OwnerProfileOptions = {}): string {
  const {
    componentName = 'OwnerProfile',
    endpoint = '/vet/owners',
  } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Dog,
  Cat,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Plus,
  Edit,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface PetSummary {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  avatar_url?: string;
  last_visit?: string;
  next_appointment?: string;
  has_overdue_vaccinations?: boolean;
  active_conditions?: string[];
}

interface OwnerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  avatar_url?: string;
  date_joined?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  notes?: string;
  pets: PetSummary[];
  payment_method?: {
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
  };
  outstanding_balance?: number;
  total_spent?: number;
  visit_count?: number;
  recent_invoices?: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    pet_name: string;
  }[];
  upcoming_appointments?: {
    id: string;
    date: string;
    time: string;
    pet_name: string;
    type: string;
    doctor: string;
  }[];
}

interface ${componentName}Props {
  ownerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ ownerId: propOwnerId, className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ownerId = propOwnerId || id;

  const [activeTab, setActiveTab] = useState<'pets' | 'appointments' | 'billing'>('pets');

  const { data: owner, isLoading } = useQuery({
    queryKey: ['vet-owner', ownerId],
    queryFn: async () => {
      const response = await api.get<OwnerData>(\`${endpoint}/\${ownerId}\`);
      return response?.data || response;
    },
    enabled: !!ownerId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!owner) {
    return <div className="text-center py-12 text-gray-500">Owner not found</div>;
  }

  const getInvoiceStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Owner Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {owner.avatar_url ? (
            <img src={owner.avatar_url} alt={owner.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{owner.name}</h1>
              {owner.preferred_contact && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  Prefers {owner.preferred_contact}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                {owner.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                {owner.phone}
                {owner.alternate_phone && \` / \${owner.alternate_phone}\`}
              </div>
              {owner.address && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
                  <MapPin className="w-4 h-4" />
                  {owner.address}{owner.city && \`, \${owner.city}\`}{owner.state && \`, \${owner.state}\`} {owner.zip}
                </div>
              )}
            </div>

            {owner.date_joined && (
              <p className="text-xs text-gray-500 mt-3">
                Client since {new Date(owner.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 min-w-[300px]">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{owner.pets.length}</p>
              <p className="text-xs text-gray-500">Pets</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{owner.visit_count || 0}</p>
              <p className="text-xs text-gray-500">Visits</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${owner.total_spent ? \`$\${(owner.total_spent / 1000).toFixed(1)}k\` : '$0'}
              </p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Outstanding Balance Alert */}
        {owner.outstanding_balance && owner.outstanding_balance > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>Outstanding balance: <strong>\${owner.outstanding_balance.toFixed(2)}</strong></span>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
              Collect Payment
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate(\`/vet/appointments/new?owner=\${ownerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
          <button
            onClick={() => navigate(\`/vet/pets/new?owner=\${ownerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add Pet
          </button>
          <button
            onClick={() => navigate(\`/vet/owners/\${ownerId}/edit\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['pets', 'appointments', 'billing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 -mb-px capitalize',
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pets' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owner.pets.map((pet) => {
            const PetIcon = pet.type === 'dog' ? Dog : Cat;
            return (
              <div
                key={pet.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(\`/vet/pets/\${pet.id}\`)}
              >
                <div className="flex items-start gap-4">
                  {pet.avatar_url ? (
                    <img src={pet.avatar_url} alt={pet.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <PetIcon className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{pet.name}</h3>
                      {pet.has_overdue_vaccinations && (
                        <AlertCircle className="w-4 h-4 text-red-500" title="Overdue vaccinations" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{pet.breed}</p>
                    <p className="text-sm text-gray-500">{pet.age} years old</p>
                  </div>
                </div>

                {pet.active_conditions && pet.active_conditions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {pet.active_conditions.map((condition, i) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">
                        {condition}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                  {pet.last_visit && (
                    <p>Last visit: {new Date(pet.last_visit).toLocaleDateString()}</p>
                  )}
                  {pet.next_appointment && (
                    <p className="text-blue-600">Next: {new Date(pet.next_appointment).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
          </div>
          {owner.upcoming_appointments && owner.upcoming_appointments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {owner.upcoming_appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => navigate(\`/vet/appointments/\${apt.id}\`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{apt.pet_name}</p>
                      <p className="text-sm text-gray-500">{apt.type} with Dr. {apt.doctor}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">{apt.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No upcoming appointments
            </div>
          )}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Payment Method */}
          {owner.payment_method && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {owner.payment_method.brand || 'Card'} ending in {owner.payment_method.last4}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{owner.payment_method.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Invoices
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
            {owner.recent_invoices && owner.recent_invoices.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {owner.recent_invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center justify-between"
                    onClick={() => navigate(\`/vet/invoices/\${invoice.id}\`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">{invoice.pet_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {invoice.amount.toFixed(2)}
                      </p>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getInvoiceStatusColor(invoice.status))}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No invoices found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {owner.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{owner.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
