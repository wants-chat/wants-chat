/**
 * Pet Profile Card Generator
 *
 * Generates pet profile display cards for pet care applications.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generatePetProfileCard = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'detailed' | 'compact' = 'grid'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'pet';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'pet';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'pets'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'pet';

  if (variant === 'detailed') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PetProfileCardProps {
  ${dataName}?: any;
  id?: string;
  name?: string;
  species?: string;
  breed?: string;
  age?: string;
  weight?: string;
  gender?: 'male' | 'female';
  photo?: string;
  ownerName?: string;
  ownerPhone?: string;
  microchipId?: string;
  vaccinations?: Array<{ name: string; date: string; nextDue?: string }>;
  allergies?: string[];
  specialNotes?: string;
  lastVisit?: string;
  onClick?: () => void;
  onSchedule?: () => void;
}

export const PetProfileCard: React.FC<PetProfileCardProps> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  species: propSpecies,
  breed: propBreed,
  age: propAge,
  weight: propWeight,
  gender: propGender,
  photo: propPhoto,
  ownerName: propOwnerName,
  ownerPhone: propOwnerPhone,
  microchipId: propMicrochipId,
  vaccinations: propVaccinations,
  allergies: propAllergies,
  specialNotes: propSpecialNotes,
  lastVisit: propLastVisit,
  onClick,
  onSchedule,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const petData = propData || fetchedData || {};
  const id = propId || petData.id || '';
  const name = propName || petData.name || 'Unknown';
  const species = propSpecies || petData.species || 'dog';
  const breed = propBreed || petData.breed || '';
  const age = propAge || petData.age || '';
  const weight = propWeight || petData.weight || '';
  const gender = propGender || petData.gender || 'male';
  const photo = propPhoto || petData.photo;
  const ownerName = propOwnerName || petData.ownerName || '';
  const ownerPhone = propOwnerPhone || petData.ownerPhone;
  const microchipId = propMicrochipId || petData.microchipId;
  const vaccinations = propVaccinations || petData.vaccinations || [];
  const allergies = propAllergies || petData.allergies || [];
  const specialNotes = propSpecialNotes || petData.specialNotes;
  const lastVisit = propLastVisit || petData.lastVisit;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const genderIcon = gender === 'male' ? '\u2642' : '\u2640';
  const genderColor = gender === 'male' ? 'text-blue-500' : 'text-pink-500';

  return (
    <div className="${styles.card} rounded-2xl overflow-hidden ${styles.cardShadow}">
      <div className="${styles.primary} p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden">
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {species === 'dog' ? '\ud83d\udc15' : species === 'cat' ? '\ud83d\udc08' : '\ud83d\udc3e'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {name}
              <span className={genderColor}>{genderIcon}</span>
            </h2>
            <p className="text-white/80">{breed}</p>
            <p className="text-white/60 text-sm">{age} {weight && \`\u2022 \${weight}\`}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Owner Info */}
        <div className="${styles.background} rounded-lg p-4">
          <h3 className="${styles.textSecondary} text-sm font-medium mb-2">Owner Information</h3>
          <p className="${styles.textPrimary} font-medium">{ownerName}</p>
          {ownerPhone && <p className="${styles.textMuted} text-sm">{ownerPhone}</p>}
        </div>

        {/* Pet Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="${styles.textMuted} text-xs uppercase tracking-wider">Species</p>
            <p className="${styles.textPrimary} font-medium capitalize">{species}</p>
          </div>
          {microchipId && (
            <div>
              <p className="${styles.textMuted} text-xs uppercase tracking-wider">Microchip ID</p>
              <p className="${styles.textPrimary} font-medium">{microchipId}</p>
            </div>
          )}
          {lastVisit && (
            <div>
              <p className="${styles.textMuted} text-xs uppercase tracking-wider">Last Visit</p>
              <p className="${styles.textPrimary} font-medium">{lastVisit}</p>
            </div>
          )}
        </div>

        {/* Allergies */}
        {allergies.length > 0 && (
          <div>
            <h3 className="${styles.textSecondary} text-sm font-medium mb-2">Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {vaccinations.length > 0 && (
          <div>
            <h3 className="${styles.textSecondary} text-sm font-medium mb-2">Vaccinations</h3>
            <div className="space-y-2">
              {vaccinations.map((vax, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="${styles.textPrimary}">{vax.name}</span>
                  <span className="${styles.textMuted}">
                    {vax.date}
                    {vax.nextDue && \` (Due: \${vax.nextDue})\`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Notes */}
        {specialNotes && (
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-amber-700 text-sm">
              <span className="font-medium">Special Notes:</span> {specialNotes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSchedule}
            className="${styles.button} text-white px-4 py-2.5 rounded-lg font-medium flex-1 hover:${styles.buttonHover} transition-colors"
          >
            Schedule Appointment
          </button>
          <button
            onClick={onClick}
            className="border ${styles.cardBorder} ${styles.textPrimary} px-4 py-2.5 rounded-lg font-medium flex-1 hover:${styles.background} transition-colors"
          >
            View Records
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetProfileCard;
`;
  }

  if (variant === 'compact') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PetProfileCardProps {
  ${dataName}?: any;
  id?: string;
  name?: string;
  species?: string;
  breed?: string;
  photo?: string;
  onClick?: () => void;
}

export const PetProfileCard: React.FC<PetProfileCardProps> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  species: propSpecies,
  breed: propBreed,
  photo: propPhoto,
  onClick,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const petData = propData || fetchedData || {};
  const id = propId || petData.id || '';
  const name = propName || petData.name || 'Unknown';
  const species = propSpecies || petData.species || 'dog';
  const breed = propBreed || petData.breed || '';
  const photo = propPhoto || petData.photo;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[60px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const speciesEmoji = species === 'dog' ? '\ud83d\udc15' : species === 'cat' ? '\ud83d\udc08' : '\ud83d\udc3e';

  return (
    <div
      onClick={onClick}
      className="${styles.card} p-3 rounded-lg cursor-pointer hover:${styles.cardHoverShadow} transition-all flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-full ${styles.background} overflow-hidden flex items-center justify-center">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">{speciesEmoji}</span>
        )}
      </div>
      <div>
        <p className="${styles.textPrimary} font-medium">{name}</p>
        <p className="${styles.textMuted} text-sm">{breed}</p>
      </div>
    </div>
  );
};

export default PetProfileCard;
`;
  }

  // Default grid variant
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PetProfileCardProps {
  ${dataName}?: any;
  id?: string;
  name?: string;
  species?: string;
  breed?: string;
  age?: string;
  gender?: 'male' | 'female';
  photo?: string;
  ownerName?: string;
  nextAppointment?: string;
  onClick?: () => void;
  onQuickBook?: () => void;
}

export const PetProfileCard: React.FC<PetProfileCardProps> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  species: propSpecies,
  breed: propBreed,
  age: propAge,
  gender: propGender,
  photo: propPhoto,
  ownerName: propOwnerName,
  nextAppointment: propNextAppointment,
  onClick,
  onQuickBook,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', propId],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData && !propId,
    retry: 1,
  });

  const petData = propData || fetchedData || {};
  const id = propId || petData.id || '';
  const name = propName || petData.name || 'Unknown';
  const species = propSpecies || petData.species || 'dog';
  const breed = propBreed || petData.breed || '';
  const age = propAge || petData.age || '';
  const gender = propGender || petData.gender || 'male';
  const photo = propPhoto || petData.photo;
  const ownerName = propOwnerName || petData.ownerName;
  const nextAppointment = propNextAppointment || petData.nextAppointment;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const speciesEmoji = species === 'dog' ? '\ud83d\udc15' : species === 'cat' ? '\ud83d\udc08' : species === 'bird' ? '\ud83d\udc26' : '\ud83d\udc3e';
  const genderIcon = gender === 'male' ? '\u2642' : '\u2640';
  const genderColor = gender === 'male' ? 'text-blue-500' : 'text-pink-500';

  return (
    <div
      className="${styles.card} rounded-xl overflow-hidden ${styles.cardShadow} hover:${styles.cardHoverShadow} transition-all"
    >
      <div
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="relative h-40 ${styles.background}">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
              {speciesEmoji}
            </div>
          )}
          <span className={\`absolute top-2 right-2 text-lg \${genderColor}\`}>
            {genderIcon}
          </span>
        </div>

        <div className="p-4">
          <h3 className="${styles.textPrimary} font-semibold text-lg">{name}</h3>
          <p className="${styles.textSecondary} text-sm">{breed}</p>
          <p className="${styles.textMuted} text-sm">{age}</p>

          {ownerName && (
            <p className="${styles.textMuted} text-sm mt-2">
              Owner: {ownerName}
            </p>
          )}

          {nextAppointment && (
            <div className="mt-3 px-3 py-2 ${styles.background} rounded-lg">
              <p className="${styles.textMuted} text-xs">Next Appointment</p>
              <p className="${styles.primary} text-sm font-medium">{nextAppointment}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); onQuickBook?.(); }}
          className="w-full ${styles.button} text-white py-2 rounded-lg text-sm font-medium hover:${styles.buttonHover} transition-colors"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default PetProfileCard;
`;
};
