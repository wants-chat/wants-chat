/**
 * Patient Card Generator
 *
 * Generates a patient info card component with avatar, details, and quick actions.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generatePatientCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'minimal' = 'compact'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;
  const entityName = dataSource || 'Patient';

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
    if (!dataSource || dataSource.trim() === '') return 'patient';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'patient';
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
    return `/${dataSource || 'patients'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'patient';

  if (variant === 'minimal') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ${entityName}Props {
  ${dataName}?: any;
  id?: string;
  name?: string;
  avatar?: string;
  dateOfBirth?: string;
  phone?: string;
  onClick?: () => void;
}

export const ${entityName}Card: React.FC<${entityName}Props> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  avatar: propAvatar,
  dateOfBirth: propDateOfBirth,
  phone: propPhone,
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

  const patientData = propData || fetchedData || {};
  const id = propId || patientData.id || '';
  const name = propName || patientData.name || 'Unknown';
  const avatar = propAvatar || patientData.avatar;
  const phone = propPhone || patientData.phone;

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[80px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="${styles.card} p-4 rounded-lg cursor-pointer hover:${styles.cardHoverShadow} transition-all flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-full ${styles.background} flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="${styles.textPrimary} font-medium text-lg">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="${styles.textPrimary} font-medium truncate">{name}</h3>
        {phone && <p className="${styles.textMuted} text-sm">{phone}</p>}
      </div>
    </div>
  );
};

export default ${entityName}Card;
`;
  }

  if (variant === 'detailed') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ${entityName}Props {
  ${dataName}?: any;
  id?: string;
  name?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContact?: string;
  lastVisit?: string;
  nextAppointment?: string;
  allergies?: string[];
  conditions?: string[];
  onClick?: () => void;
  onSchedule?: () => void;
  onViewRecords?: () => void;
}

export const ${entityName}Card: React.FC<${entityName}Props> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  avatar: propAvatar,
  dateOfBirth: propDateOfBirth,
  gender: propGender,
  phone: propPhone,
  email: propEmail,
  address: propAddress,
  insuranceProvider: propInsuranceProvider,
  insuranceNumber: propInsuranceNumber,
  emergencyContact: propEmergencyContact,
  lastVisit: propLastVisit,
  nextAppointment: propNextAppointment,
  allergies: propAllergies,
  conditions: propConditions,
  onClick,
  onSchedule,
  onViewRecords,
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

  const patientData = propData || fetchedData || {};
  const id = propId || patientData.id || '';
  const name = propName || patientData.name || 'Unknown';
  const avatar = propAvatar || patientData.avatar;
  const dateOfBirth = propDateOfBirth || patientData.dateOfBirth;
  const gender = propGender || patientData.gender;
  const phone = propPhone || patientData.phone;
  const email = propEmail || patientData.email;
  const address = propAddress || patientData.address;
  const insuranceProvider = propInsuranceProvider || patientData.insuranceProvider;
  const insuranceNumber = propInsuranceNumber || patientData.insuranceNumber;
  const emergencyContact = propEmergencyContact || patientData.emergencyContact;
  const lastVisit = propLastVisit || patientData.lastVisit;
  const nextAppointment = propNextAppointment || patientData.nextAppointment;
  const allergies = propAllergies || patientData.allergies || [];
  const conditions = propConditions || patientData.conditions || [];

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="${styles.card} rounded-xl overflow-hidden ${styles.cardShadow}">
      {/* Header */}
      <div className="${styles.primary} p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-white/80">
              {dateOfBirth && \`\${calculateAge(dateOfBirth)} years old\`}
              {gender && \` \${gender}\`}
            </p>
            <p className="text-white/60 text-sm mt-1">ID: {id}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="${styles.textMuted} text-xs uppercase tracking-wider">Phone</label>
            <p className="${styles.textPrimary} font-medium">{phone || 'N/A'}</p>
          </div>
          <div>
            <label className="${styles.textMuted} text-xs uppercase tracking-wider">Email</label>
            <p className="${styles.textPrimary} font-medium truncate">{email || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="${styles.textMuted} text-xs uppercase tracking-wider">Address</label>
            <p className="${styles.textPrimary}">{address || 'N/A'}</p>
          </div>
        </div>

        {/* Insurance */}
        <div className="${styles.background} rounded-lg p-4">
          <h4 className="${styles.textPrimary} font-medium mb-2">Insurance Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="${styles.textMuted} text-xs">Provider</label>
              <p className="${styles.textPrimary}">{insuranceProvider || 'N/A'}</p>
            </div>
            <div>
              <label className="${styles.textMuted} text-xs">Policy Number</label>
              <p className="${styles.textPrimary}">{insuranceNumber || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allergies.length > 0 && (
            <div>
              <h4 className="${styles.textPrimary} font-medium mb-2">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
          {conditions.length > 0 && (
            <div>
              <h4 className="${styles.textPrimary} font-medium mb-2">Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition, idx) => (
                  <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="flex items-center justify-between pt-4 border-t ${styles.cardBorder}">
          <div>
            <p className="${styles.textMuted} text-sm">Last Visit</p>
            <p className="${styles.textPrimary} font-medium">{lastVisit || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="${styles.textMuted} text-sm">Next Appointment</p>
            <p className="${styles.primary} font-medium">{nextAppointment || 'Not scheduled'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSchedule}
            className="${styles.button} ${styles.buttonHover} text-white px-4 py-2 rounded-lg flex-1 transition-colors"
          >
            Schedule Appointment
          </button>
          <button
            onClick={onViewRecords}
            className="border ${styles.cardBorder} ${styles.textPrimary} px-4 py-2 rounded-lg flex-1 hover:${styles.background} transition-colors"
          >
            View Records
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${entityName}Card;
`;
  }

  // Default compact variant
  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ${entityName}Props {
  ${dataName}?: any;
  id?: string;
  name?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  lastVisit?: string;
  status?: 'active' | 'inactive' | 'new';
  onClick?: () => void;
}

export const ${entityName}Card: React.FC<${entityName}Props> = ({
  ${dataName}: propData,
  id: propId,
  name: propName,
  avatar: propAvatar,
  dateOfBirth: propDateOfBirth,
  gender: propGender,
  phone: propPhone,
  email: propEmail,
  lastVisit: propLastVisit,
  status: propStatus,
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

  const patientData = propData || fetchedData || {};
  const id = propId || patientData.id || '';
  const name = propName || patientData.name || 'Unknown';
  const avatar = propAvatar || patientData.avatar;
  const dateOfBirth = propDateOfBirth || patientData.dateOfBirth;
  const gender = propGender || patientData.gender;
  const phone = propPhone || patientData.phone;
  const lastVisit = propLastVisit || patientData.lastVisit;
  const status = propStatus || patientData.status || 'active';

  if (isLoading && !propData && !propId) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    new: 'bg-blue-100 text-blue-700',
  };

  return (
    <div
      onClick={onClick}
      className="${styles.card} p-4 rounded-xl cursor-pointer hover:${styles.cardHoverShadow} transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full ${styles.background} flex items-center justify-center overflow-hidden shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="${styles.textPrimary} font-semibold text-lg">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="${styles.textPrimary} font-semibold truncate">{name}</h3>
            <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[status]}\`}>
              {status}
            </span>
          </div>
          <p className="${styles.textMuted} text-sm">
            {dateOfBirth && new Date(dateOfBirth).toLocaleDateString()}
            {gender && \` \${gender}\`}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            {phone && (
              <span className="${styles.textSecondary} flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phone}
              </span>
            )}
          </div>
        </div>
        {lastVisit && (
          <div className="text-right shrink-0">
            <p className="${styles.textMuted} text-xs">Last Visit</p>
            <p className="${styles.textSecondary} text-sm font-medium">{lastVisit}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${entityName}Card;
`;
};
