'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mountain,
  Users,
  CreditCard,
  Package,
  Award,
  Calendar,
  MapPin,
  Activity,
  Box,
  Baby,
  Trophy,
  UserCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Shield,
  Clipboard,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  membershipType: 'day_pass' | 'monthly' | 'annual' | 'none';
  membershipStart?: string;
  membershipEnd?: string;
  waiverSigned: boolean;
  waiverDate?: string;
  belayCertified: boolean;
  belayCertDate?: string;
  belayCertExpiry?: string;
  photo?: string;
  notes?: string;
  createdAt: string;
}

interface DayPass {
  id: string;
  memberId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  price: number;
  paymentMethod: 'cash' | 'card' | 'online';
}

interface EquipmentRental {
  id: string;
  memberId: string;
  equipment: 'shoes' | 'harness' | 'chalk' | 'belay_device' | 'helmet';
  size?: string;
  startTime: string;
  endTime?: string;
  price: number;
  condition: 'good' | 'fair' | 'needs_repair';
}

interface ClassSchedule {
  id: string;
  name: string;
  instructor: string;
  type: 'beginner' | 'intermediate' | 'advanced' | 'youth' | 'private';
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  enrolledMembers: string[];
  price: number;
  description?: string;
}

interface Route {
  id: string;
  name: string;
  location: string;
  grade: string;
  color: string;
  setter: string;
  dateSet: string;
  dateRetire?: string;
  style: 'boulder' | 'top_rope' | 'lead' | 'auto_belay';
  status: 'active' | 'retired' | 'maintenance';
}

interface RouteSetSchedule {
  id: string;
  date: string;
  area: string;
  setter: string;
  estimatedRoutes: number;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

interface GearStorage {
  id: string;
  memberId: string;
  lockerNumber: string;
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  items?: string;
}

interface YouthProgram {
  id: string;
  name: string;
  ageRange: string;
  schedule: string;
  instructor: string;
  maxParticipants: number;
  enrolledMembers: string[];
  price: number;
  description?: string;
}

interface Event {
  id: string;
  name: string;
  type: 'competition' | 'social' | 'clinic' | 'fundraiser';
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
  registeredMembers: string[];
  price?: number;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface StaffCertification {
  id: string;
  staffName: string;
  certification: string;
  issuedBy: string;
  dateObtained: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'expired';
}

interface SafetyIncident {
  id: string;
  date: string;
  time: string;
  location: string;
  memberId?: string;
  memberName?: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  injuryType?: string;
  firstAidProvided: boolean;
  emergencyServicesContacted: boolean;
  witnesses?: string;
  staffOnDuty: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

interface GymData {
  members: Member[];
  dayPasses: DayPass[];
  equipmentRentals: EquipmentRental[];
  classes: ClassSchedule[];
  routes: Route[];
  routeSetSchedules: RouteSetSchedule[];
  gearStorage: GearStorage[];
  youthPrograms: YouthProgram[];
  events: Event[];
  staffCertifications: StaffCertification[];
  safetyIncidents: SafetyIncident[];
}

type TabType = 'dashboard' | 'members' | 'day_passes' | 'equipment' | 'classes' | 'routes' | 'storage' | 'youth' | 'events' | 'staff' | 'incidents';

const CLIMBING_GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d'];

const ROUTE_COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'White', 'Black', 'Gray'];

const initialData: GymData = {
  members: [],
  dayPasses: [],
  equipmentRentals: [],
  classes: [],
  routes: [],
  routeSetSchedules: [],
  gearStorage: [],
  youthPrograms: [],
  events: [],
  staffCertifications: [],
  safetyIncidents: []
};

// Wrapper type for useToolData (requires id field)
interface GymDataWrapper {
  id: string;
  data: GymData;
}

// Column configuration for the gym data (used for export)
const gymDataColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'data', header: 'Data', type: 'string', format: (v) => JSON.stringify(v) },
];

interface ClimbingGymToolProps {
  uiConfig?: UIConfig;
}

export const ClimbingGymTool: React.FC<ClimbingGymToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize useToolData hook for backend sync with a wrapper structure
  const {
    data: gymData,
    setData: setGymData,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<GymDataWrapper>(
    'climbing-gym',
    [{ id: 'gym-data', data: initialData }],
    gymDataColumns,
    { autoSave: true }
  );

  // Extract the actual gym data from the wrapper
  const data: GymData = gymData[0]?.data || initialData;

  // Helper to update the gym data through the hook
  const setData = (updater: GymData | ((prev: GymData) => GymData)) => {
    const newData = typeof updater === 'function' ? updater(data) : updater;
    setGymData([{ id: 'gym-data', data: newData }]);
  };

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states for different entities
  const [memberForm, setMemberForm] = useState<Partial<Member>>({});
  const [dayPassForm, setDayPassForm] = useState<Partial<DayPass>>({});
  const [rentalForm, setRentalForm] = useState<Partial<EquipmentRental>>({});
  const [classForm, setClassForm] = useState<Partial<ClassSchedule>>({});
  const [routeForm, setRouteForm] = useState<Partial<Route>>({});
  const [routeSetForm, setRouteSetForm] = useState<Partial<RouteSetSchedule>>({});
  const [storageForm, setStorageForm] = useState<Partial<GearStorage>>({});
  const [youthForm, setYouthForm] = useState<Partial<YouthProgram>>({});
  const [eventForm, setEventForm] = useState<Partial<Event>>({});
  const [certForm, setCertForm] = useState<Partial<StaffCertification>>({});
  const [incidentForm, setIncidentForm] = useState<Partial<SafetyIncident>>({});

  // Dashboard stats
  const stats = useMemo(() => {
    const activeMembers = data.members.filter(m => m.membershipType !== 'none').length;
    const todayPasses = data.dayPasses.filter(p => p.date === new Date().toISOString().split('T')[0]).length;
    const activeRentals = data.equipmentRentals.filter(r => !r.endTime).length;
    const activeRoutes = data.routes.filter(r => r.status === 'active').length;
    const upcomingEvents = data.events.filter(e => e.status === 'upcoming').length;
    const openIncidents = data.safetyIncidents.filter(i => i.status !== 'resolved').length;
    const expiringCerts = data.staffCertifications.filter(c => c.status === 'expiring_soon').length;

    return { activeMembers, todayPasses, activeRentals, activeRoutes, upcomingEvents, openIncidents, expiringCerts };
  }, [data]);

  const resetForms = () => {
    setMemberForm({});
    setDayPassForm({});
    setRentalForm({});
    setClassForm({});
    setRouteForm({});
    setRouteSetForm({});
    setStorageForm({});
    setYouthForm({});
    setEventForm({});
    setCertForm({});
    setIncidentForm({});
    setShowForm(false);
    setEditingId(null);
  };

  // Member CRUD
  const saveMember = () => {
    if (!memberForm.firstName || !memberForm.lastName || !memberForm.email) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        members: prev.members.map(m =>
          m.id === editingId ? { ...m, ...memberForm } as Member : m
        )
      }));
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        firstName: memberForm.firstName || '',
        lastName: memberForm.lastName || '',
        email: memberForm.email || '',
        phone: memberForm.phone || '',
        dateOfBirth: memberForm.dateOfBirth || '',
        emergencyContact: memberForm.emergencyContact || '',
        emergencyPhone: memberForm.emergencyPhone || '',
        membershipType: memberForm.membershipType || 'none',
        membershipStart: memberForm.membershipStart,
        membershipEnd: memberForm.membershipEnd,
        waiverSigned: memberForm.waiverSigned || false,
        waiverDate: memberForm.waiverDate,
        belayCertified: memberForm.belayCertified || false,
        belayCertDate: memberForm.belayCertDate,
        belayCertExpiry: memberForm.belayCertExpiry,
        notes: memberForm.notes,
        createdAt: new Date().toISOString()
      };
      setData(prev => ({ ...prev, members: [...prev.members, newMember] }));
    }
    resetForms();
  };

  const deleteMember = (id: string) => {
    setData(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
  };

  // Day Pass CRUD
  const saveDayPass = () => {
    if (!dayPassForm.memberId || !dayPassForm.date) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        dayPasses: prev.dayPasses.map(p =>
          p.id === editingId ? { ...p, ...dayPassForm } as DayPass : p
        )
      }));
    } else {
      const newPass: DayPass = {
        id: Date.now().toString(),
        memberId: dayPassForm.memberId,
        date: dayPassForm.date,
        checkIn: dayPassForm.checkIn || new Date().toTimeString().slice(0, 5),
        checkOut: dayPassForm.checkOut,
        price: dayPassForm.price || 25,
        paymentMethod: dayPassForm.paymentMethod || 'card'
      };
      setData(prev => ({ ...prev, dayPasses: [...prev.dayPasses, newPass] }));
    }
    resetForms();
  };

  // Equipment Rental CRUD
  const saveRental = () => {
    if (!rentalForm.memberId || !rentalForm.equipment) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        equipmentRentals: prev.equipmentRentals.map(r =>
          r.id === editingId ? { ...r, ...rentalForm } as EquipmentRental : r
        )
      }));
    } else {
      const newRental: EquipmentRental = {
        id: Date.now().toString(),
        memberId: rentalForm.memberId,
        equipment: rentalForm.equipment,
        size: rentalForm.size,
        startTime: rentalForm.startTime || new Date().toISOString(),
        endTime: rentalForm.endTime,
        price: rentalForm.price || 5,
        condition: rentalForm.condition || 'good'
      };
      setData(prev => ({ ...prev, equipmentRentals: [...prev.equipmentRentals, newRental] }));
    }
    resetForms();
  };

  // Class CRUD
  const saveClass = () => {
    if (!classForm.name || !classForm.instructor) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        classes: prev.classes.map(c =>
          c.id === editingId ? { ...c, ...classForm } as ClassSchedule : c
        )
      }));
    } else {
      const newClass: ClassSchedule = {
        id: Date.now().toString(),
        name: classForm.name,
        instructor: classForm.instructor,
        type: classForm.type || 'beginner',
        dayOfWeek: classForm.dayOfWeek || 1,
        startTime: classForm.startTime || '10:00',
        endTime: classForm.endTime || '11:00',
        maxParticipants: classForm.maxParticipants || 10,
        enrolledMembers: classForm.enrolledMembers || [],
        price: classForm.price || 30,
        description: classForm.description
      };
      setData(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
    }
    resetForms();
  };

  // Route CRUD
  const saveRoute = () => {
    if (!routeForm.name || !routeForm.grade) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        routes: prev.routes.map(r =>
          r.id === editingId ? { ...r, ...routeForm } as Route : r
        )
      }));
    } else {
      const newRoute: Route = {
        id: Date.now().toString(),
        name: routeForm.name,
        location: routeForm.location || '',
        grade: routeForm.grade,
        color: routeForm.color || 'Red',
        setter: routeForm.setter || '',
        dateSet: routeForm.dateSet || new Date().toISOString().split('T')[0],
        dateRetire: routeForm.dateRetire,
        style: routeForm.style || 'boulder',
        status: routeForm.status || 'active'
      };
      setData(prev => ({ ...prev, routes: [...prev.routes, newRoute] }));
    }
    resetForms();
  };

  // Route Set Schedule CRUD
  const saveRouteSetSchedule = () => {
    if (!routeSetForm.date || !routeSetForm.area) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        routeSetSchedules: prev.routeSetSchedules.map(s =>
          s.id === editingId ? { ...s, ...routeSetForm } as RouteSetSchedule : s
        )
      }));
    } else {
      const newSchedule: RouteSetSchedule = {
        id: Date.now().toString(),
        date: routeSetForm.date,
        area: routeSetForm.area,
        setter: routeSetForm.setter || '',
        estimatedRoutes: routeSetForm.estimatedRoutes || 5,
        notes: routeSetForm.notes,
        status: routeSetForm.status || 'scheduled'
      };
      setData(prev => ({ ...prev, routeSetSchedules: [...prev.routeSetSchedules, newSchedule] }));
    }
    resetForms();
  };

  // Gear Storage CRUD
  const saveStorage = () => {
    if (!storageForm.memberId || !storageForm.lockerNumber) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        gearStorage: prev.gearStorage.map(s =>
          s.id === editingId ? { ...s, ...storageForm } as GearStorage : s
        )
      }));
    } else {
      const newStorage: GearStorage = {
        id: Date.now().toString(),
        memberId: storageForm.memberId,
        lockerNumber: storageForm.lockerNumber,
        startDate: storageForm.startDate || new Date().toISOString().split('T')[0],
        endDate: storageForm.endDate,
        monthlyFee: storageForm.monthlyFee || 20,
        items: storageForm.items
      };
      setData(prev => ({ ...prev, gearStorage: [...prev.gearStorage, newStorage] }));
    }
    resetForms();
  };

  // Youth Program CRUD
  const saveYouthProgram = () => {
    if (!youthForm.name) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        youthPrograms: prev.youthPrograms.map(p =>
          p.id === editingId ? { ...p, ...youthForm } as YouthProgram : p
        )
      }));
    } else {
      const newProgram: YouthProgram = {
        id: Date.now().toString(),
        name: youthForm.name,
        ageRange: youthForm.ageRange || '6-12',
        schedule: youthForm.schedule || '',
        instructor: youthForm.instructor || '',
        maxParticipants: youthForm.maxParticipants || 12,
        enrolledMembers: youthForm.enrolledMembers || [],
        price: youthForm.price || 150,
        description: youthForm.description
      };
      setData(prev => ({ ...prev, youthPrograms: [...prev.youthPrograms, newProgram] }));
    }
    resetForms();
  };

  // Event CRUD
  const saveEvent = () => {
    if (!eventForm.name || !eventForm.date) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        events: prev.events.map(e =>
          e.id === editingId ? { ...e, ...eventForm } as Event : e
        )
      }));
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        name: eventForm.name,
        type: eventForm.type || 'competition',
        date: eventForm.date,
        startTime: eventForm.startTime || '09:00',
        endTime: eventForm.endTime || '17:00',
        maxParticipants: eventForm.maxParticipants,
        registeredMembers: eventForm.registeredMembers || [],
        price: eventForm.price,
        description: eventForm.description,
        status: eventForm.status || 'upcoming'
      };
      setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    }
    resetForms();
  };

  // Staff Certification CRUD
  const saveCertification = () => {
    if (!certForm.staffName || !certForm.certification) return;

    const today = new Date();
    const expiry = certForm.expiryDate ? new Date(certForm.expiryDate) : null;
    let status: 'active' | 'expiring_soon' | 'expired' = 'active';

    if (expiry) {
      if (expiry < today) {
        status = 'expired';
      } else {
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30) {
          status = 'expiring_soon';
        }
      }
    }

    if (editingId) {
      setData(prev => ({
        ...prev,
        staffCertifications: prev.staffCertifications.map(c =>
          c.id === editingId ? { ...c, ...certForm, status } as StaffCertification : c
        )
      }));
    } else {
      const newCert: StaffCertification = {
        id: Date.now().toString(),
        staffName: certForm.staffName,
        certification: certForm.certification,
        issuedBy: certForm.issuedBy || '',
        dateObtained: certForm.dateObtained || new Date().toISOString().split('T')[0],
        expiryDate: certForm.expiryDate || '',
        status
      };
      setData(prev => ({ ...prev, staffCertifications: [...prev.staffCertifications, newCert] }));
    }
    resetForms();
  };

  // Safety Incident CRUD
  const saveIncident = () => {
    if (!incidentForm.date || !incidentForm.description) return;

    if (editingId) {
      setData(prev => ({
        ...prev,
        safetyIncidents: prev.safetyIncidents.map(i =>
          i.id === editingId ? { ...i, ...incidentForm } as SafetyIncident : i
        )
      }));
    } else {
      const newIncident: SafetyIncident = {
        id: Date.now().toString(),
        date: incidentForm.date,
        time: incidentForm.time || new Date().toTimeString().slice(0, 5),
        location: incidentForm.location || '',
        memberId: incidentForm.memberId,
        memberName: incidentForm.memberName,
        description: incidentForm.description,
        severity: incidentForm.severity || 'minor',
        injuryType: incidentForm.injuryType,
        firstAidProvided: incidentForm.firstAidProvided || false,
        emergencyServicesContacted: incidentForm.emergencyServicesContacted || false,
        witnesses: incidentForm.witnesses,
        staffOnDuty: incidentForm.staffOnDuty || '',
        followUpRequired: incidentForm.followUpRequired || false,
        followUpNotes: incidentForm.followUpNotes,
        status: incidentForm.status || 'open',
        createdAt: new Date().toISOString()
      };
      setData(prev => ({ ...prev, safetyIncidents: [...prev.safetyIncidents, newIncident] }));
    }
    resetForms();
  };

  const getMemberName = (memberId: string) => {
    const member = data.members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  };

  const getDayName = (day: number) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
  };

  // Filtered data based on search
  const filteredMembers = useMemo(() => {
    return data.members.filter(m =>
      `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.members, searchTerm]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'day_passes', label: 'Day Passes', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'equipment', label: 'Rentals', icon: <Package className="w-4 h-4" /> },
    { id: 'classes', label: 'Classes', icon: <Calendar className="w-4 h-4" /> },
    { id: 'routes', label: 'Routes', icon: <MapPin className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage', icon: <Box className="w-4 h-4" /> },
    { id: 'youth', label: 'Youth', icon: <Baby className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Trophy className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff Certs', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  const inputClass = `w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-orange-500`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`;

  const buttonClass = `px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors`;

  const secondaryButtonClass = `px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.climbingGym.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Mountain className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.climbingGym.climbingGymManager', 'Climbing Gym Manager')}
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.climbingGym.manageMembersPassesEquipmentClasses', 'Manage members, passes, equipment, classes, and more')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="climbing-gym" toolName="Climbing Gym" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = [
                    ...data.members.map(m => ({ type: 'Member', name: `${m.firstName} ${m.lastName}`, email: m.email, membershipType: m.membershipType, createdAt: m.createdAt })),
                    ...data.routes.map(r => ({ type: 'Route', name: r.name, grade: r.grade, style: r.style, status: r.status })),
                    ...data.events.map(e => ({ type: 'Event', name: e.name, date: e.date, status: e.status })),
                  ];
                  exportToCSV(exportData, [
                    { key: 'type', header: 'Type' },
                    { key: 'name', header: 'Name' },
                    { key: 'email', header: 'Email' },
                    { key: 'membershipType', header: 'Membership' },
                    { key: 'grade', header: 'Grade' },
                    { key: 'style', header: 'Style' },
                    { key: 'date', header: 'Date' },
                    { key: 'status', header: 'Status' },
                    { key: 'createdAt', header: 'Created At' },
                  ], { filename: 'climbing-gym-data' });
                }}
                onExportExcel={() => {
                  const exportData = [
                    ...data.members.map(m => ({ type: 'Member', name: `${m.firstName} ${m.lastName}`, email: m.email, membershipType: m.membershipType, createdAt: m.createdAt })),
                    ...data.routes.map(r => ({ type: 'Route', name: r.name, grade: r.grade, style: r.style, status: r.status })),
                    ...data.events.map(e => ({ type: 'Event', name: e.name, date: e.date, status: e.status })),
                  ];
                  exportToExcel(exportData, [
                    { key: 'type', header: 'Type' },
                    { key: 'name', header: 'Name' },
                    { key: 'email', header: 'Email' },
                    { key: 'membershipType', header: 'Membership' },
                    { key: 'grade', header: 'Grade' },
                    { key: 'style', header: 'Style' },
                    { key: 'date', header: 'Date' },
                    { key: 'status', header: 'Status' },
                    { key: 'createdAt', header: 'Created At' },
                  ], { filename: 'climbing-gym-data' });
                }}
                onExportPDF={async () => {
                  const exportData = [
                    ...data.members.map(m => ({ type: 'Member', name: `${m.firstName} ${m.lastName}`, email: m.email, membershipType: m.membershipType, createdAt: m.createdAt })),
                    ...data.routes.map(r => ({ type: 'Route', name: r.name, grade: r.grade, style: r.style, status: r.status })),
                    ...data.events.map(e => ({ type: 'Event', name: e.name, date: e.date, status: e.status })),
                  ];
                  await exportToPDF(exportData, [
                    { key: 'type', header: 'Type' },
                    { key: 'name', header: 'Name' },
                    { key: 'email', header: 'Email' },
                    { key: 'membershipType', header: 'Membership' },
                    { key: 'grade', header: 'Grade' },
                    { key: 'style', header: 'Style' },
                    { key: 'date', header: 'Date' },
                    { key: 'status', header: 'Status' },
                    { key: 'createdAt', header: 'Created At' },
                  ], { filename: 'climbing-gym-data', title: 'Climbing Gym Data' });
                }}
                onExportJSON={() => {
                  const exportData = [
                    ...data.members.map(m => ({ type: 'Member', ...m })),
                    ...data.routes.map(r => ({ type: 'Route', ...r })),
                    ...data.events.map(e => ({ type: 'Event', ...e })),
                  ];
                  exportToJSON(exportData, { filename: 'climbing-gym-data' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = [
                    ...data.members.map(m => ({ type: 'Member', name: `${m.firstName} ${m.lastName}`, email: m.email, membershipType: m.membershipType })),
                    ...data.routes.map(r => ({ type: 'Route', name: r.name, grade: r.grade, style: r.style, status: r.status })),
                  ];
                  return await copyUtil(exportData, [
                    { key: 'type', header: 'Type' },
                    { key: 'name', header: 'Name' },
                    { key: 'email', header: 'Email' },
                    { key: 'membershipType', header: 'Membership' },
                    { key: 'grade', header: 'Grade' },
                    { key: 'style', header: 'Style' },
                    { key: 'status', header: 'Status' },
                  ], 'tab');
                }}
                onPrint={() => {
                  const exportData = [
                    ...data.members.map(m => ({ type: 'Member', name: `${m.firstName} ${m.lastName}`, email: m.email, membershipType: m.membershipType })),
                    ...data.routes.map(r => ({ type: 'Route', name: r.name, grade: r.grade, style: r.style, status: r.status })),
                  ];
                  printData(exportData, [
                    { key: 'type', header: 'Type' },
                    { key: 'name', header: 'Name' },
                    { key: 'email', header: 'Email' },
                    { key: 'membershipType', header: 'Membership' },
                    { key: 'grade', header: 'Grade' },
                    { key: 'style', header: 'Style' },
                    { key: 'status', header: 'Status' },
                  ], { title: 'Climbing Gym Data' });
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-2 mb-6 overflow-x-auto`}>
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); resetForms(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.climbingGym.dashboardOverview', 'Dashboard Overview')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
                  <Users className="w-6 h-6 text-orange-500 mb-2" />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeMembers}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.activeMembers', 'Active Members')}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <CreditCard className="w-6 h-6 text-blue-500 mb-2" />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayPasses}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.todaySPasses', 'Today\'s Passes')}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <Package className="w-6 h-6 text-green-500 mb-2" />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeRentals}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.activeRentals', 'Active Rentals')}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <MapPin className="w-6 h-6 text-purple-500 mb-2" />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeRoutes}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.activeRoutes', 'Active Routes')}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-pink-50'}`}>
                  <Trophy className="w-6 h-6 text-pink-500 mb-2" />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.upcomingEvents}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.upcomingEvents', 'Upcoming Events')}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                  <Award className="w-6 h-6 text-yellow-500 mb-2" />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.expiringCerts}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.expiringCerts', 'Expiring Certs')}</div>
                </div>
                <div className={`p-4 rounded-lg ${stats.openIncidents > 0 ? (isDark ? 'bg-red-900/30' : 'bg-red-50') : (isDark ? 'bg-gray-700' : 'bg-gray-50')}`}>
                  <AlertTriangle className={`w-6 h-6 mb-2 ${stats.openIncidents > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.openIncidents}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.openIncidents', 'Open Incidents')}</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.recentMembers', 'Recent Members')}</h3>
                  {data.members.slice(-5).reverse().map(m => (
                    <div key={m.id} className={`py-2 border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.firstName} {m.lastName}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m.membershipType.replace('_', ' ')}</div>
                    </div>
                  ))}
                  {data.members.length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.climbingGym.noMembersYet', 'No members yet')}</p>
                  )}
                </div>
                <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.upcomingRouteSets', 'Upcoming Route Sets')}</h3>
                  {data.routeSetSchedules.filter(s => s.status !== 'completed').slice(0, 5).map(s => (
                    <div key={s.id} className={`py-2 border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.area}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.date} - {s.setter}</div>
                    </div>
                  ))}
                  {data.routeSetSchedules.filter(s => s.status !== 'completed').length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.climbingGym.noUpcomingRouteSets', 'No upcoming route sets')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.membersWaivers', 'Members & Waivers')}</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.climbingGym.searchMembers', 'Search members...')}
                      className={`pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                    <Plus className="w-4 h-4" /> Add Member
                  </button>
                </div>
              </div>

              {/* Member Form */}
              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? t('tools.climbingGym.editMember', 'Edit Member') : t('tools.climbingGym.newMember', 'New Member')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('tools.climbingGym.firstName', 'First Name *')} value={memberForm.firstName || ''} onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.lastName', 'Last Name *')} value={memberForm.lastName || ''} onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })} className={inputClass} />
                    <input type="email" placeholder={t('tools.climbingGym.email', 'Email *')} value={memberForm.email || ''} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className={inputClass} />
                    <input type="tel" placeholder={t('tools.climbingGym.phone', 'Phone')} value={memberForm.phone || ''} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} className={inputClass} />
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.dateOfBirth', 'Date of Birth')}</label>
                      <input type="date" value={memberForm.dateOfBirth || ''} onChange={(e) => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })} className={inputClass} />
                    </div>
                    <input type="text" placeholder={t('tools.climbingGym.emergencyContact', 'Emergency Contact')} value={memberForm.emergencyContact || ''} onChange={(e) => setMemberForm({ ...memberForm, emergencyContact: e.target.value })} className={inputClass} />
                    <input type="tel" placeholder={t('tools.climbingGym.emergencyPhone', 'Emergency Phone')} value={memberForm.emergencyPhone || ''} onChange={(e) => setMemberForm({ ...memberForm, emergencyPhone: e.target.value })} className={inputClass} />
                    <select value={memberForm.membershipType || 'none'} onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value as Member['membershipType'] })} className={selectClass}>
                      <option value="none">{t('tools.climbingGym.noMembership', 'No Membership')}</option>
                      <option value="day_pass">{t('tools.climbingGym.dayPassOnly', 'Day Pass Only')}</option>
                      <option value="monthly">{t('tools.climbingGym.monthly', 'Monthly')}</option>
                      <option value="annual">{t('tools.climbingGym.annual', 'Annual')}</option>
                    </select>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.membershipStart', 'Membership Start')}</label>
                      <input type="date" value={memberForm.membershipStart || ''} onChange={(e) => setMemberForm({ ...memberForm, membershipStart: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.membershipEnd', 'Membership End')}</label>
                      <input type="date" value={memberForm.membershipEnd || ''} onChange={(e) => setMemberForm({ ...memberForm, membershipEnd: e.target.value })} className={inputClass} />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={memberForm.waiverSigned || false} onChange={(e) => setMemberForm({ ...memberForm, waiverSigned: e.target.checked, waiverDate: e.target.checked ? new Date().toISOString().split('T')[0] : undefined })} className="w-4 h-4 rounded text-orange-500" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.climbingGym.waiverSigned', 'Waiver Signed')}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={memberForm.belayCertified || false} onChange={(e) => setMemberForm({ ...memberForm, belayCertified: e.target.checked })} className="w-4 h-4 rounded text-orange-500" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.climbingGym.belayCertified', 'Belay Certified')}</span>
                      </label>
                    </div>
                    {memberForm.belayCertified && (
                      <>
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.certDate', 'Cert Date')}</label>
                          <input type="date" value={memberForm.belayCertDate || ''} onChange={(e) => setMemberForm({ ...memberForm, belayCertDate: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.certExpiry', 'Cert Expiry')}</label>
                          <input type="date" value={memberForm.belayCertExpiry || ''} onChange={(e) => setMemberForm({ ...memberForm, belayCertExpiry: e.target.value })} className={inputClass} />
                        </div>
                      </>
                    )}
                    <textarea placeholder={t('tools.climbingGym.notes', 'Notes')} value={memberForm.notes || ''} onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })} className={`${inputClass} md:col-span-2 lg:col-span-3`} rows={2} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveMember} className={buttonClass}>
                      <Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update', 'Update') : t('tools.climbingGym.create', 'Create')}
                    </button>
                    <button onClick={resetForms} className={secondaryButtonClass}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                {filteredMembers.map(member => (
                  <div key={member.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {member.firstName} {member.lastName}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            member.membershipType === 'annual' ? 'bg-purple-500/20 text-purple-500' :
                            member.membershipType === 'monthly' ? 'bg-blue-500/20 text-blue-500' :
                            member.membershipType === 'day_pass' ? 'bg-green-500/20 text-green-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {member.membershipType.replace('_', ' ')}
                          </span>
                          {member.waiverSigned && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-500 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Waiver
                            </span>
                          )}
                          {member.belayCertified && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-500 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Belay
                            </span>
                          )}
                        </div>
                        <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {member.email} {member.phone && `| ${member.phone}`}
                        </div>
                        {member.membershipEnd && (
                          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Expires: {member.membershipEnd}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setMemberForm(member); setEditingId(member.id); setShowForm(true); }}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => deleteMember(member.id)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noMembersFoundAddYour', 'No members found. Add your first member to get started!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Day Passes Tab */}
          {activeTab === 'day_passes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.dayPassManagement', 'Day Pass Management')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Issue Day Pass
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.newDayPass', 'New Day Pass')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select value={dayPassForm.memberId || ''} onChange={(e) => setDayPassForm({ ...dayPassForm, memberId: e.target.value })} className={selectClass}>
                      <option value="">{t('tools.climbingGym.selectMember', 'Select Member *')}</option>
                      {data.members.map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    </select>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.date', 'Date')}</label>
                      <input type="date" value={dayPassForm.date || new Date().toISOString().split('T')[0]} onChange={(e) => setDayPassForm({ ...dayPassForm, date: e.target.value })} className={inputClass} />
                    </div>
                    <input type="number" placeholder={t('tools.climbingGym.price', 'Price ($)')} value={dayPassForm.price || 25} onChange={(e) => setDayPassForm({ ...dayPassForm, price: parseFloat(e.target.value) })} className={inputClass} />
                    <select value={dayPassForm.paymentMethod || 'card'} onChange={(e) => setDayPassForm({ ...dayPassForm, paymentMethod: e.target.value as DayPass['paymentMethod'] })} className={selectClass}>
                      <option value="card">{t('tools.climbingGym.card', 'Card')}</option>
                      <option value="cash">{t('tools.climbingGym.cash', 'Cash')}</option>
                      <option value="online">{t('tools.climbingGym.online', 'Online')}</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveDayPass} className={buttonClass}><Check className="w-4 h-4" /> {t('tools.climbingGym.issuePass', 'Issue Pass')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {data.dayPasses.slice().reverse().map(pass => (
                  <div key={pass.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getMemberName(pass.memberId)}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {pass.date} | Check-in: {pass.checkIn} {pass.checkOut && `| Check-out: ${pass.checkOut}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${pass.price}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {pass.paymentMethod}
                      </span>
                      {!pass.checkOut && (
                        <button
                          onClick={() => {
                            setData(prev => ({
                              ...prev,
                              dayPasses: prev.dayPasses.map(p =>
                                p.id === pass.id ? { ...p, checkOut: new Date().toTimeString().slice(0, 5) } : p
                              )
                            }));
                          }}
                          className={`px-3 py-1 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white`}
                        >
                          {t('tools.climbingGym.checkOut', 'Check Out')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {data.dayPasses.length === 0 && (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noDayPassesIssuedYet', 'No day passes issued yet.')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Rentals Tab */}
          {activeTab === 'equipment' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.equipmentRentals', 'Equipment Rentals')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> New Rental
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.newRental', 'New Rental')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select value={rentalForm.memberId || ''} onChange={(e) => setRentalForm({ ...rentalForm, memberId: e.target.value })} className={selectClass}>
                      <option value="">{t('tools.climbingGym.selectMember2', 'Select Member *')}</option>
                      {data.members.map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    </select>
                    <select value={rentalForm.equipment || ''} onChange={(e) => setRentalForm({ ...rentalForm, equipment: e.target.value as EquipmentRental['equipment'] })} className={selectClass}>
                      <option value="">{t('tools.climbingGym.selectEquipment', 'Select Equipment *')}</option>
                      <option value="shoes">{t('tools.climbingGym.climbingShoes', 'Climbing Shoes')}</option>
                      <option value="harness">{t('tools.climbingGym.harness', 'Harness')}</option>
                      <option value="chalk">{t('tools.climbingGym.chalkBag', 'Chalk Bag')}</option>
                      <option value="belay_device">{t('tools.climbingGym.belayDevice', 'Belay Device')}</option>
                      <option value="helmet">{t('tools.climbingGym.helmet', 'Helmet')}</option>
                    </select>
                    <input type="text" placeholder={t('tools.climbingGym.sizeEG42M', 'Size (e.g., 42, M)')} value={rentalForm.size || ''} onChange={(e) => setRentalForm({ ...rentalForm, size: e.target.value })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.price2', 'Price ($)')} value={rentalForm.price || 5} onChange={(e) => setRentalForm({ ...rentalForm, price: parseFloat(e.target.value) })} className={inputClass} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveRental} className={buttonClass}><Check className="w-4 h-4" /> {t('tools.climbingGym.startRental', 'Start Rental')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel2', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Active Rentals */}
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.activeRentals2', 'Active Rentals')}</h3>
                  <div className="space-y-2">
                    {data.equipmentRentals.filter(r => !r.endTime).map(rental => (
                      <div key={rental.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getMemberName(rental.memberId)}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {rental.equipment.replace('_', ' ')} {rental.size && `(${rental.size})`}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setData(prev => ({
                                ...prev,
                                equipmentRentals: prev.equipmentRentals.map(r =>
                                  r.id === rental.id ? { ...r, endTime: new Date().toISOString() } : r
                                )
                              }));
                            }}
                            className="px-3 py-1 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {t('tools.climbingGym.return', 'Return')}
                          </button>
                        </div>
                      </div>
                    ))}
                    {data.equipmentRentals.filter(r => !r.endTime).length === 0 && (
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.climbingGym.noActiveRentals', 'No active rentals')}</p>
                    )}
                  </div>
                </div>

                {/* Recent Returns */}
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.recentReturns', 'Recent Returns')}</h3>
                  <div className="space-y-2">
                    {data.equipmentRentals.filter(r => r.endTime).slice(-5).reverse().map(rental => (
                      <div key={rental.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getMemberName(rental.memberId)}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rental.equipment.replace('_', ' ')} - ${rental.price}
                        </div>
                      </div>
                    ))}
                    {data.equipmentRentals.filter(r => r.endTime).length === 0 && (
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.climbingGym.noReturnedRentals', 'No returned rentals')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.classLessonSchedule', 'Class & Lesson Schedule')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Add Class
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? t('tools.climbingGym.editClass', 'Edit Class') : t('tools.climbingGym.newClass', 'New Class')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('tools.climbingGym.className', 'Class Name *')} value={classForm.name || ''} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.instructor', 'Instructor *')} value={classForm.instructor || ''} onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })} className={inputClass} />
                    <select value={classForm.type || 'beginner'} onChange={(e) => setClassForm({ ...classForm, type: e.target.value as ClassSchedule['type'] })} className={selectClass}>
                      <option value="beginner">{t('tools.climbingGym.beginner', 'Beginner')}</option>
                      <option value="intermediate">{t('tools.climbingGym.intermediate', 'Intermediate')}</option>
                      <option value="advanced">{t('tools.climbingGym.advanced', 'Advanced')}</option>
                      <option value="youth">{t('tools.climbingGym.youth', 'Youth')}</option>
                      <option value="private">{t('tools.climbingGym.private', 'Private')}</option>
                    </select>
                    <select value={classForm.dayOfWeek ?? 1} onChange={(e) => setClassForm({ ...classForm, dayOfWeek: parseInt(e.target.value) })} className={selectClass}>
                      {[0, 1, 2, 3, 4, 5, 6].map(d => (
                        <option key={d} value={d}>{getDayName(d)}</option>
                      ))}
                    </select>
                    <input type="time" value={classForm.startTime || '10:00'} onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })} className={inputClass} />
                    <input type="time" value={classForm.endTime || '11:00'} onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.maxParticipants', 'Max Participants')} value={classForm.maxParticipants || 10} onChange={(e) => setClassForm({ ...classForm, maxParticipants: parseInt(e.target.value) })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.price3', 'Price ($)')} value={classForm.price || 30} onChange={(e) => setClassForm({ ...classForm, price: parseFloat(e.target.value) })} className={inputClass} />
                    <textarea placeholder={t('tools.climbingGym.description', 'Description')} value={classForm.description || ''} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} className={`${inputClass} lg:col-span-3`} rows={2} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveClass} className={buttonClass}><Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update2', 'Update') : t('tools.climbingGym.create2', 'Create')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel3', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.classes.map(cls => (
                  <div key={cls.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cls.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => { setClassForm(cls); setEditingId(cls.id); setShowForm(true); }} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setData(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== cls.id) }))} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      cls.type === 'beginner' ? 'bg-green-500/20 text-green-500' :
                      cls.type === 'intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                      cls.type === 'advanced' ? 'bg-red-500/20 text-red-500' :
                      cls.type === 'youth' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-purple-500/20 text-purple-500'
                    }`}>
                      {cls.type}
                    </span>
                    <div className={`mt-3 text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {getDayName(cls.dayOfWeek)} {cls.startTime} - {cls.endTime}</div>
                      <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {cls.enrolledMembers.length}/{cls.maxParticipants}</div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4" /> {cls.instructor}</div>
                      <div className="font-semibold text-orange-500">${cls.price}</div>
                    </div>
                  </div>
                ))}
                {data.classes.length === 0 && (
                  <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noClassesScheduledAddYour', 'No classes scheduled. Add your first class!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.routesWallRatings', 'Routes & Wall Ratings')}</h2>
                <div className="flex gap-2">
                  <button onClick={() => { resetForms(); setExpandedSection('route'); setShowForm(true); }} className={buttonClass}>
                    <Plus className="w-4 h-4" /> Add Route
                  </button>
                  <button onClick={() => { resetForms(); setExpandedSection('schedule'); setShowForm(true); }} className={secondaryButtonClass}>
                    <Calendar className="w-4 h-4" /> Schedule Set
                  </button>
                </div>
              </div>

              {showForm && expandedSection === 'route' && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? t('tools.climbingGym.editRoute', 'Edit Route') : t('tools.climbingGym.newRoute', 'New Route')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder={t('tools.climbingGym.routeName', 'Route Name *')} value={routeForm.name || ''} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.locationEGWallA', 'Location (e.g., Wall A)')} value={routeForm.location || ''} onChange={(e) => setRouteForm({ ...routeForm, location: e.target.value })} className={inputClass} />
                    <select value={routeForm.grade || ''} onChange={(e) => setRouteForm({ ...routeForm, grade: e.target.value })} className={selectClass}>
                      <option value="">{t('tools.climbingGym.selectGrade', 'Select Grade *')}</option>
                      {CLIMBING_GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <select value={routeForm.color || 'Red'} onChange={(e) => setRouteForm({ ...routeForm, color: e.target.value })} className={selectClass}>
                      {ROUTE_COLORS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input type="text" placeholder={t('tools.climbingGym.setter', 'Setter')} value={routeForm.setter || ''} onChange={(e) => setRouteForm({ ...routeForm, setter: e.target.value })} className={inputClass} />
                    <select value={routeForm.style || 'boulder'} onChange={(e) => setRouteForm({ ...routeForm, style: e.target.value as Route['style'] })} className={selectClass}>
                      <option value="boulder">{t('tools.climbingGym.boulder', 'Boulder')}</option>
                      <option value="top_rope">{t('tools.climbingGym.topRope', 'Top Rope')}</option>
                      <option value="lead">{t('tools.climbingGym.lead', 'Lead')}</option>
                      <option value="auto_belay">{t('tools.climbingGym.autoBelay', 'Auto Belay')}</option>
                    </select>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.dateSet', 'Date Set')}</label>
                      <input type="date" value={routeForm.dateSet || new Date().toISOString().split('T')[0]} onChange={(e) => setRouteForm({ ...routeForm, dateSet: e.target.value })} className={inputClass} />
                    </div>
                    <select value={routeForm.status || 'active'} onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as Route['status'] })} className={selectClass}>
                      <option value="active">{t('tools.climbingGym.active', 'Active')}</option>
                      <option value="maintenance">{t('tools.climbingGym.maintenance', 'Maintenance')}</option>
                      <option value="retired">{t('tools.climbingGym.retired', 'Retired')}</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveRoute} className={buttonClass}><Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update3', 'Update') : t('tools.climbingGym.create3', 'Create')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel4', 'Cancel')}</button>
                  </div>
                </div>
              )}

              {showForm && expandedSection === 'schedule' && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.scheduleRouteSetting', 'Schedule Route Setting')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.date2', 'Date *')}</label>
                      <input type="date" value={routeSetForm.date || ''} onChange={(e) => setRouteSetForm({ ...routeSetForm, date: e.target.value })} className={inputClass} />
                    </div>
                    <input type="text" placeholder={t('tools.climbingGym.areaEGBoulderCave', 'Area (e.g., Boulder Cave) *')} value={routeSetForm.area || ''} onChange={(e) => setRouteSetForm({ ...routeSetForm, area: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.setter2', 'Setter')} value={routeSetForm.setter || ''} onChange={(e) => setRouteSetForm({ ...routeSetForm, setter: e.target.value })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.estRoutes', 'Est. Routes')} value={routeSetForm.estimatedRoutes || 5} onChange={(e) => setRouteSetForm({ ...routeSetForm, estimatedRoutes: parseInt(e.target.value) })} className={inputClass} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveRouteSetSchedule} className={buttonClass}><Check className="w-4 h-4" /> {t('tools.climbingGym.schedule', 'Schedule')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel5', 'Cancel')}</button>
                  </div>
                </div>
              )}

              {/* Routes Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {data.routes.filter(r => r.status === 'active').map(route => (
                  <div key={route.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: route.color.toLowerCase() }} />
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{route.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 text-sm font-bold rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {route.grade}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {route.style.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setRouteForm(route); setEditingId(route.id); setExpandedSection('route'); setShowForm(true); }} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setData(prev => ({ ...prev, routes: prev.routes.filter(r => r.id !== route.id) }))} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div>{route.location}</div>
                      <div>Set by {route.setter} on {route.dateSet}</div>
                    </div>
                  </div>
                ))}
                {data.routes.filter(r => r.status === 'active').length === 0 && (
                  <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noActiveRoutesAddYour', 'No active routes. Add your first route!')}</p>
                  </div>
                )}
              </div>

              {/* Route Setting Schedule */}
              {data.routeSetSchedules.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.routeSettingSchedule', 'Route Setting Schedule')}</h3>
                  <div className="space-y-2">
                    {data.routeSetSchedules.map(schedule => (
                      <div key={schedule.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{schedule.area}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {schedule.date} | {schedule.setter || 'TBD'} | ~{schedule.estimatedRoutes} routes
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          schedule.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          schedule.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {schedule.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gear Storage Tab */}
          {activeTab === 'storage' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.personalGearStorage', 'Personal Gear Storage')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Assign Locker
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.assignStorage', 'Assign Storage')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select value={storageForm.memberId || ''} onChange={(e) => setStorageForm({ ...storageForm, memberId: e.target.value })} className={selectClass}>
                      <option value="">{t('tools.climbingGym.selectMember3', 'Select Member *')}</option>
                      {data.members.map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    </select>
                    <input type="text" placeholder={t('tools.climbingGym.lockerNumber', 'Locker Number *')} value={storageForm.lockerNumber || ''} onChange={(e) => setStorageForm({ ...storageForm, lockerNumber: e.target.value })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.monthlyFee', 'Monthly Fee ($)')} value={storageForm.monthlyFee || 20} onChange={(e) => setStorageForm({ ...storageForm, monthlyFee: parseFloat(e.target.value) })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.itemsStored', 'Items stored')} value={storageForm.items || ''} onChange={(e) => setStorageForm({ ...storageForm, items: e.target.value })} className={inputClass} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveStorage} className={buttonClass}><Check className="w-4 h-4" /> {t('tools.climbingGym.assign', 'Assign')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel6', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.gearStorage.map(storage => (
                  <div key={storage.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Box className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Locker #{storage.lockerNumber}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{getMemberName(storage.memberId)}</div>
                        </div>
                      </div>
                      <button onClick={() => setData(prev => ({ ...prev, gearStorage: prev.gearStorage.filter(s => s.id !== storage.id) }))} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div>${storage.monthlyFee}/month</div>
                      {storage.items && <div className="mt-1">Items: {storage.items}</div>}
                    </div>
                  </div>
                ))}
                {data.gearStorage.length === 0 && (
                  <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noStorageAssignmentsAssignA', 'No storage assignments. Assign a locker to get started!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Youth Programs Tab */}
          {activeTab === 'youth' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.youthPrograms', 'Youth Programs')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Add Program
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? t('tools.climbingGym.editProgram', 'Edit Program') : t('tools.climbingGym.newProgram', 'New Program')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('tools.climbingGym.programName', 'Program Name *')} value={youthForm.name || ''} onChange={(e) => setYouthForm({ ...youthForm, name: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.ageRangeEG6', 'Age Range (e.g., 6-12)')} value={youthForm.ageRange || ''} onChange={(e) => setYouthForm({ ...youthForm, ageRange: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.scheduleEGSat10am', 'Schedule (e.g., Sat 10am-12pm)')} value={youthForm.schedule || ''} onChange={(e) => setYouthForm({ ...youthForm, schedule: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.instructor2', 'Instructor')} value={youthForm.instructor || ''} onChange={(e) => setYouthForm({ ...youthForm, instructor: e.target.value })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.maxParticipants2', 'Max Participants')} value={youthForm.maxParticipants || 12} onChange={(e) => setYouthForm({ ...youthForm, maxParticipants: parseInt(e.target.value) })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.price4', 'Price ($)')} value={youthForm.price || 150} onChange={(e) => setYouthForm({ ...youthForm, price: parseFloat(e.target.value) })} className={inputClass} />
                    <textarea placeholder={t('tools.climbingGym.description2', 'Description')} value={youthForm.description || ''} onChange={(e) => setYouthForm({ ...youthForm, description: e.target.value })} className={`${inputClass} lg:col-span-3`} rows={2} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveYouthProgram} className={buttonClass}><Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update4', 'Update') : t('tools.climbingGym.create4', 'Create')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel7', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {data.youthPrograms.map(program => (
                  <div key={program.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{program.name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-500">
                          Ages {program.ageRange}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setYouthForm(program); setEditingId(program.id); setShowForm(true); }} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setData(prev => ({ ...prev, youthPrograms: prev.youthPrograms.filter(p => p.id !== program.id) }))} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {program.schedule}</div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4" /> {program.instructor}</div>
                      <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {program.enrolledMembers.length}/{program.maxParticipants} enrolled</div>
                      <div className="font-semibold text-orange-500">${program.price}</div>
                    </div>
                    {program.description && (
                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{program.description}</p>
                    )}
                  </div>
                ))}
                {data.youthPrograms.length === 0 && (
                  <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Baby className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noYouthProgramsCreateOne', 'No youth programs. Create one to get started!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.competitionsEvents', 'Competitions & Events')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? t('tools.climbingGym.editEvent', 'Edit Event') : t('tools.climbingGym.newEvent', 'New Event')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder={t('tools.climbingGym.eventName', 'Event Name *')} value={eventForm.name || ''} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} className={inputClass} />
                    <select value={eventForm.type || 'competition'} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as Event['type'] })} className={selectClass}>
                      <option value="competition">{t('tools.climbingGym.competition', 'Competition')}</option>
                      <option value="social">{t('tools.climbingGym.social', 'Social')}</option>
                      <option value="clinic">{t('tools.climbingGym.clinic', 'Clinic')}</option>
                      <option value="fundraiser">{t('tools.climbingGym.fundraiser', 'Fundraiser')}</option>
                    </select>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.date3', 'Date *')}</label>
                      <input type="date" value={eventForm.date || ''} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" value={eventForm.startTime || '09:00'} onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })} className={inputClass} />
                      <input type="time" value={eventForm.endTime || '17:00'} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} className={inputClass} />
                    </div>
                    <input type="number" placeholder={t('tools.climbingGym.maxParticipants3', 'Max Participants')} value={eventForm.maxParticipants || ''} onChange={(e) => setEventForm({ ...eventForm, maxParticipants: parseInt(e.target.value) || undefined })} className={inputClass} />
                    <input type="number" placeholder={t('tools.climbingGym.price5', 'Price ($)')} value={eventForm.price || ''} onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) || undefined })} className={inputClass} />
                    <select value={eventForm.status || 'upcoming'} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as Event['status'] })} className={selectClass}>
                      <option value="upcoming">{t('tools.climbingGym.upcoming', 'Upcoming')}</option>
                      <option value="ongoing">{t('tools.climbingGym.ongoing', 'Ongoing')}</option>
                      <option value="completed">{t('tools.climbingGym.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.climbingGym.cancelled', 'Cancelled')}</option>
                    </select>
                    <textarea placeholder={t('tools.climbingGym.description3', 'Description')} value={eventForm.description || ''} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className={`${inputClass} lg:col-span-4`} rows={2} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveEvent} className={buttonClass}><Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update5', 'Update') : t('tools.climbingGym.create5', 'Create')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel8', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.events.map(event => (
                  <div key={event.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            event.type === 'competition' ? 'bg-red-500/20 text-red-500' :
                            event.type === 'social' ? 'bg-green-500/20 text-green-500' :
                            event.type === 'clinic' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-purple-500/20 text-purple-500'
                          }`}>
                            {event.type}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-500' :
                            event.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
                            event.status === 'completed' ? 'bg-gray-500/20 text-gray-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {event.date} | {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        {event.maxParticipants && (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" /> {event.registeredMembers.length}/{event.maxParticipants} registered
                            </span>
                          </div>
                        )}
                        {event.price && (
                          <div className="text-orange-500 font-semibold mt-1">${event.price}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEventForm(event); setEditingId(event.id); setShowForm(true); }} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== event.id) }))} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{event.description}</p>
                    )}
                  </div>
                ))}
                {data.events.length === 0 && (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noEventsScheduledAddYour', 'No events scheduled. Add your first event!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staff Certifications Tab */}
          {activeTab === 'staff' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.staffCertifications', 'Staff Certifications')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Add Certification
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? t('tools.climbingGym.editCertification', 'Edit Certification') : t('tools.climbingGym.newCertification', 'New Certification')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('tools.climbingGym.staffName', 'Staff Name *')} value={certForm.staffName || ''} onChange={(e) => setCertForm({ ...certForm, staffName: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.certification', 'Certification *')} value={certForm.certification || ''} onChange={(e) => setCertForm({ ...certForm, certification: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.issuedBy', 'Issued By')} value={certForm.issuedBy || ''} onChange={(e) => setCertForm({ ...certForm, issuedBy: e.target.value })} className={inputClass} />
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.dateObtained', 'Date Obtained')}</label>
                      <input type="date" value={certForm.dateObtained || ''} onChange={(e) => setCertForm({ ...certForm, dateObtained: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.expiryDate', 'Expiry Date')}</label>
                      <input type="date" value={certForm.expiryDate || ''} onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveCertification} className={buttonClass}><Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update6', 'Update') : t('tools.climbingGym.add', 'Add')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel9', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {data.staffCertifications.map(cert => (
                  <div key={cert.id} className={`p-4 rounded-lg border ${
                    cert.status === 'expired' ? 'border-red-500/50' :
                    cert.status === 'expiring_soon' ? 'border-yellow-500/50' :
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cert.staffName}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            cert.status === 'active' ? 'bg-green-500/20 text-green-500' :
                            cert.status === 'expiring_soon' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {cert.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="flex items-center gap-2"><Award className="w-4 h-4" /> {cert.certification}</div>
                          <div>Issued by: {cert.issuedBy}</div>
                          <div>Obtained: {cert.dateObtained} | Expires: {cert.expiryDate}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setCertForm(cert); setEditingId(cert.id); setShowForm(true); }} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setData(prev => ({ ...prev, staffCertifications: prev.staffCertifications.filter(c => c.id !== cert.id) }))} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {data.staffCertifications.length === 0 && (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noStaffCertificationsAddYour', 'No staff certifications. Add your first certification!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.climbingGym.safetyIncidentReports', 'Safety Incident Reports')}</h2>
                <button onClick={() => { resetForms(); setShowForm(true); }} className={buttonClass}>
                  <Plus className="w-4 h-4" /> Report Incident
                </button>
              </div>

              {showForm && (
                <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? t('tools.climbingGym.editIncident', 'Edit Incident') : t('tools.climbingGym.newIncidentReport', 'New Incident Report')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.date4', 'Date *')}</label>
                      <input type="date" value={incidentForm.date || new Date().toISOString().split('T')[0]} onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.climbingGym.time', 'Time *')}</label>
                      <input type="time" value={incidentForm.time || ''} onChange={(e) => setIncidentForm({ ...incidentForm, time: e.target.value })} className={inputClass} />
                    </div>
                    <input type="text" placeholder={t('tools.climbingGym.location', 'Location *')} value={incidentForm.location || ''} onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })} className={inputClass} />
                    <select value={incidentForm.memberId || ''} onChange={(e) => {
                      const member = data.members.find(m => m.id === e.target.value);
                      setIncidentForm({ ...incidentForm, memberId: e.target.value, memberName: member ? `${member.firstName} ${member.lastName}` : '' });
                    }} className={selectClass}>
                      <option value="">{t('tools.climbingGym.selectMemberIfApplicable', 'Select Member (if applicable)')}</option>
                      {data.members.map(m => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    </select>
                    <input type="text" placeholder={t('tools.climbingGym.orEnterNameManually', 'Or enter name manually')} value={incidentForm.memberName || ''} onChange={(e) => setIncidentForm({ ...incidentForm, memberName: e.target.value })} className={inputClass} />
                    <select value={incidentForm.severity || 'minor'} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as SafetyIncident['severity'] })} className={selectClass}>
                      <option value="minor">{t('tools.climbingGym.minor', 'Minor')}</option>
                      <option value="moderate">{t('tools.climbingGym.moderate', 'Moderate')}</option>
                      <option value="severe">{t('tools.climbingGym.severe', 'Severe')}</option>
                    </select>
                    <input type="text" placeholder={t('tools.climbingGym.injuryType', 'Injury Type')} value={incidentForm.injuryType || ''} onChange={(e) => setIncidentForm({ ...incidentForm, injuryType: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.staffOnDuty', 'Staff on Duty *')} value={incidentForm.staffOnDuty || ''} onChange={(e) => setIncidentForm({ ...incidentForm, staffOnDuty: e.target.value })} className={inputClass} />
                    <input type="text" placeholder={t('tools.climbingGym.witnesses', 'Witnesses')} value={incidentForm.witnesses || ''} onChange={(e) => setIncidentForm({ ...incidentForm, witnesses: e.target.value })} className={inputClass} />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={incidentForm.firstAidProvided || false} onChange={(e) => setIncidentForm({ ...incidentForm, firstAidProvided: e.target.checked })} className="w-4 h-4 rounded text-orange-500" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.climbingGym.firstAidProvided', 'First Aid Provided')}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={incidentForm.emergencyServicesContacted || false} onChange={(e) => setIncidentForm({ ...incidentForm, emergencyServicesContacted: e.target.checked })} className="w-4 h-4 rounded text-orange-500" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.climbingGym.emergencyServices', 'Emergency Services')}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={incidentForm.followUpRequired || false} onChange={(e) => setIncidentForm({ ...incidentForm, followUpRequired: e.target.checked })} className="w-4 h-4 rounded text-orange-500" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.climbingGym.followUpRequired', 'Follow-up Required')}</span>
                      </label>
                    </div>
                    <textarea placeholder={t('tools.climbingGym.descriptionOfIncident', 'Description of incident *')} value={incidentForm.description || ''} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} className={`${inputClass} lg:col-span-3`} rows={3} />
                    {incidentForm.followUpRequired && (
                      <textarea placeholder={t('tools.climbingGym.followUpNotes', 'Follow-up Notes')} value={incidentForm.followUpNotes || ''} onChange={(e) => setIncidentForm({ ...incidentForm, followUpNotes: e.target.value })} className={`${inputClass} lg:col-span-3`} rows={2} />
                    )}
                    <select value={incidentForm.status || 'open'} onChange={(e) => setIncidentForm({ ...incidentForm, status: e.target.value as SafetyIncident['status'] })} className={selectClass}>
                      <option value="open">{t('tools.climbingGym.open', 'Open')}</option>
                      <option value="investigating">{t('tools.climbingGym.investigating', 'Investigating')}</option>
                      <option value="resolved">{t('tools.climbingGym.resolved', 'Resolved')}</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveIncident} className={buttonClass}><Check className="w-4 h-4" /> {editingId ? t('tools.climbingGym.update7', 'Update') : t('tools.climbingGym.submitReport', 'Submit Report')}</button>
                    <button onClick={resetForms} className={secondaryButtonClass}><X className="w-4 h-4" /> {t('tools.climbingGym.cancel10', 'Cancel')}</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.safetyIncidents.map(incident => (
                  <div key={incident.id} className={`p-4 rounded-lg border ${
                    incident.severity === 'severe' ? 'border-red-500/50' :
                    incident.severity === 'moderate' ? 'border-yellow-500/50' :
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <AlertTriangle className={`w-5 h-5 ${
                            incident.severity === 'severe' ? 'text-red-500' :
                            incident.severity === 'moderate' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            incident.severity === 'severe' ? 'bg-red-500/20 text-red-500' :
                            incident.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {incident.severity}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            incident.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                            incident.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {incident.status}
                          </span>
                          {incident.followUpRequired && incident.status !== 'resolved' && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-500">
                              {t('tools.climbingGym.followUpNeeded', 'Follow-up needed')}
                            </span>
                          )}
                        </div>
                        <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div>{incident.date} at {incident.time} | {incident.location}</div>
                          {incident.memberName && <div>Involved: {incident.memberName}</div>}
                          {incident.injuryType && <div>Injury: {incident.injuryType}</div>}
                          <div>Staff: {incident.staffOnDuty}</div>
                        </div>
                        <p className={`mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{incident.description}</p>
                        <div className={`mt-2 flex gap-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {incident.firstAidProvided && <span className="text-green-500">{t('tools.climbingGym.firstAidGiven', 'First Aid Given')}</span>}
                          {incident.emergencyServicesContacted && <span className="text-red-500">{t('tools.climbingGym.emergencyServicesCalled', 'Emergency Services Called')}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setIncidentForm(incident); setEditingId(incident.id); setShowForm(true); }} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setData(prev => ({ ...prev, safetyIncidents: prev.safetyIncidents.filter(i => i.id !== incident.id) }))} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {data.safetyIncidents.length === 0 && (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.climbingGym.noIncidentsReportedStaySafe', 'No incidents reported. Stay safe!')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.climbingGym.tip', 'Tip:')}</strong> Your data is automatically synced to the cloud when logged in. Use this tool to manage your climbing gym operations including member management, equipment rentals, class scheduling, route setting, and safety incident tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClimbingGymTool;
