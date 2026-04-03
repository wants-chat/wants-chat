'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Target,
  Users,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  FileText,
  User,
  DollarSign,
  Package,
  Eye,
  Glasses,
  Headphones,
  Wrench,
  Recycle,
  Award,
  ClipboardList,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Bell,
  BookOpen,
  UserCheck,
  Phone,
  Mail,
  Hash,
  Crosshair,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
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
  membershipType: 'basic' | 'premium' | 'vip' | 'instructor';
  membershipNumber: string;
  joinDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'suspended';
  waiverSigned: boolean;
  waiverSignedDate?: string;
  safetyBriefingCompleted: boolean;
  safetyBriefingDate?: string;
  certifications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

interface LaneReservation {
  id: string;
  laneNumber: number;
  memberId: string;
  guestName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'in-progress';
  laneType: 'pistol' | 'rifle' | 'multi-purpose';
  notes?: string;
}

interface FirearmRental {
  id: string;
  name: string;
  type: 'pistol' | 'rifle' | 'shotgun';
  caliber: string;
  serialNumber: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  rentalPrice: number;
  lastMaintenanceDate: string;
  maintenanceNotes?: string;
  rentedBy?: string;
  rentalStart?: string;
  rentalEnd?: string;
}

interface AmmunitionInventory {
  id: string;
  caliber: string;
  brand: string;
  type: 'fmj' | 'hollow-point' | 'match' | 'training';
  quantity: number;
  pricePerRound: number;
  pricePerBox: number;
  roundsPerBox: number;
  lowStockThreshold: number;
}

interface AmmunitionSale {
  id: string;
  memberId: string;
  date: string;
  items: {
    ammoId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'account';
}

interface RangeOfficer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  certifications: string[];
  hireDate: string;
  status: 'active' | 'inactive';
  hourlyRate: number;
}

interface OfficerSchedule {
  id: string;
  officerId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

interface InstructionClass {
  id: string;
  name: string;
  description: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: string[];
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  classType: 'safety' | 'pistol' | 'rifle' | 'shotgun' | 'concealed-carry' | 'competition';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface ProtectionRental {
  id: string;
  type: 'eye' | 'ear' | 'combo';
  name: string;
  quantity: number;
  availableQuantity: number;
  rentalPrice: number;
  lastSanitizedDate: string;
}

interface ProtectionRentalRecord {
  id: string;
  protectionId: string;
  memberId: string;
  date: string;
  returned: boolean;
  returnedAt?: string;
}

interface TargetInventory {
  id: string;
  name: string;
  type: 'paper' | 'steel' | 'reactive';
  description: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
}

interface TargetSale {
  id: string;
  memberId: string;
  date: string;
  items: {
    targetId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
}

interface MembershipProgram {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  yearlyFee: number;
  benefits: string[];
  laneDiscount: number;
  rentalDiscount: number;
  guestPasses: number;
  isActive: boolean;
}

interface LaneMaintenanceLog {
  id: string;
  laneNumber: number;
  date: string;
  maintenanceType: 'cleaning' | 'repair' | 'inspection' | 'replacement';
  description: string;
  performedBy: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  nextScheduledDate?: string;
  cost?: number;
}

interface IncidentReport {
  id: string;
  date: string;
  time: string;
  laneNumber?: number;
  involvedMemberId?: string;
  involvedGuestName?: string;
  type: 'negligent-discharge' | 'equipment-failure' | 'injury' | 'rules-violation' | 'medical' | 'other';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  description: string;
  actionTaken: string;
  reportedBy: string;
  witnessNames: string[];
  followUpRequired: boolean;
  followUpNotes?: string;
  resolved: boolean;
  resolvedDate?: string;
}

interface BrassRecycling {
  id: string;
  date: string;
  caliber: string;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  pricePerPound: number;
  totalValue: number;
  collectedBy: string;
  soldTo?: string;
  status: 'collected' | 'sorted' | 'sold';
}

interface ShootingRangeData {
  members: Member[];
  reservations: LaneReservation[];
  firearmRentals: FirearmRental[];
  ammunition: AmmunitionInventory[];
  ammunitionSales: AmmunitionSale[];
  rangeOfficers: RangeOfficer[];
  officerSchedules: OfficerSchedule[];
  classes: InstructionClass[];
  protectionEquipment: ProtectionRental[];
  protectionRentals: ProtectionRentalRecord[];
  targets: TargetInventory[];
  targetSales: TargetSale[];
  membershipPrograms: MembershipProgram[];
  maintenanceLogs: LaneMaintenanceLog[];
  incidents: IncidentReport[];
  brassRecycling: BrassRecycling[];
  lanes: { number: number; type: 'pistol' | 'rifle' | 'multi-purpose'; status: 'available' | 'occupied' | 'maintenance' }[];
}

// Column configurations for export
const memberColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'membershipType', header: 'Membership Type', type: 'string' },
  { key: 'membershipNumber', header: 'Membership #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'joinDate', header: 'Join Date', type: 'date' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
];

const reservationColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'laneNumber', header: 'Lane #', type: 'number' },
  { key: 'memberId', header: 'Member ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'laneType', header: 'Lane Type', type: 'string' },
];

const firearmColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'caliber', header: 'Caliber', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'rentalPrice', header: 'Rental Price', type: 'currency' },
];

const ammunitionColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'caliber', header: 'Caliber', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'pricePerRound', header: 'Price/Round', type: 'currency' },
  { key: 'pricePerBox', header: 'Price/Box', type: 'currency' },
];

const incidentColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'severity', header: 'Severity', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'resolved', header: 'Resolved', type: 'boolean' },
];

// Default data for each category
const defaultMembers: Member[] = [];

const defaultReservations: LaneReservation[] = [];

const defaultFirearmRentals: FirearmRental[] = [];

const defaultAmmunition: AmmunitionInventory[] = [];

const defaultProtectionEquipment: ProtectionRental[] = [
  { id: 'eye-1', type: 'eye', name: 'Safety Glasses', quantity: 50, availableQuantity: 50, rentalPrice: 2, lastSanitizedDate: new Date().toISOString().split('T')[0] },
  { id: 'ear-1', type: 'ear', name: 'Ear Muffs', quantity: 40, availableQuantity: 40, rentalPrice: 3, lastSanitizedDate: new Date().toISOString().split('T')[0] },
  { id: 'combo-1', type: 'combo', name: 'Eye & Ear Combo', quantity: 30, availableQuantity: 30, rentalPrice: 4, lastSanitizedDate: new Date().toISOString().split('T')[0] },
];

const defaultTargets: TargetInventory[] = [
  { id: 'target-1', name: 'Standard Bullseye', type: 'paper', description: '8.5x11 paper target', quantity: 500, price: 0.50, lowStockThreshold: 100 },
  { id: 'target-2', name: 'Silhouette', type: 'paper', description: '24x36 silhouette target', quantity: 300, price: 1.00, lowStockThreshold: 50 },
  { id: 'target-3', name: 'Steel Plate 8"', type: 'steel', description: '8 inch steel plate', quantity: 20, price: 0, lowStockThreshold: 5 },
];

const defaultMembershipPrograms: MembershipProgram[] = [
  { id: 'basic', name: 'Basic', description: 'Standard membership', monthlyFee: 29, yearlyFee: 299, benefits: ['Unlimited lane time', 'Member pricing'], laneDiscount: 0, rentalDiscount: 0, guestPasses: 2, isActive: true },
  { id: 'premium', name: 'Premium', description: 'Enhanced membership', monthlyFee: 49, yearlyFee: 499, benefits: ['Unlimited lane time', 'Priority reservations', '10% rental discount'], laneDiscount: 10, rentalDiscount: 10, guestPasses: 4, isActive: true },
  { id: 'vip', name: 'VIP', description: 'Elite membership', monthlyFee: 99, yearlyFee: 999, benefits: ['24/7 access', 'Private lane access', '20% all discounts', 'Free guests'], laneDiscount: 20, rentalDiscount: 20, guestPasses: 12, isActive: true },
];

const defaultLanes: { number: number; type: 'pistol' | 'rifle' | 'multi-purpose'; status: 'available' | 'occupied' | 'maintenance' }[] = [
  { number: 1, type: 'pistol', status: 'available' },
  { number: 2, type: 'pistol', status: 'available' },
  { number: 3, type: 'pistol', status: 'available' },
  { number: 4, type: 'pistol', status: 'available' },
  { number: 5, type: 'multi-purpose', status: 'available' },
  { number: 6, type: 'multi-purpose', status: 'available' },
  { number: 7, type: 'rifle', status: 'available' },
  { number: 8, type: 'rifle', status: 'available' },
];

const defaultIncidents: IncidentReport[] = [];

const defaultBrassRecycling: BrassRecycling[] = [];

type TabType = 'dashboard' | 'reservations' | 'members' | 'rentals' | 'ammunition' | 'officers' | 'classes' | 'protection' | 'targets' | 'memberships' | 'maintenance' | 'incidents' | 'brass';

interface ShootingRangeToolProps {
  uiConfig?: UIConfig;
}

export const ShootingRangeTool: React.FC<ShootingRangeToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize useToolData hooks for backend persistence
  const membersData = useToolData<Member>(
    'shooting-range-members',
    defaultMembers,
    memberColumns,
    { autoSave: true }
  );

  const reservationsData = useToolData<LaneReservation>(
    'shooting-range-reservations',
    defaultReservations,
    reservationColumns,
    { autoSave: true }
  );

  const firearmRentalsData = useToolData<FirearmRental>(
    'shooting-range-firearms',
    defaultFirearmRentals,
    firearmColumns,
    { autoSave: true }
  );

  const ammunitionData = useToolData<AmmunitionInventory>(
    'shooting-range-ammunition',
    defaultAmmunition,
    ammunitionColumns,
    { autoSave: true }
  );

  const incidentsData = useToolData<IncidentReport>(
    'shooting-range-incidents',
    defaultIncidents,
    incidentColumns,
    { autoSave: true }
  );

  const brassRecyclingData = useToolData<BrassRecycling>(
    'shooting-range-brass',
    defaultBrassRecycling,
    incidentColumns, // Reusing columns for simplicity
    { autoSave: true }
  );

  // Create a unified data object that mirrors the old structure for compatibility
  const data: ShootingRangeData = useMemo(() => ({
    members: membersData.data,
    reservations: reservationsData.data,
    firearmRentals: firearmRentalsData.data,
    ammunition: ammunitionData.data,
    ammunitionSales: [], // Not persisted with useToolData for now
    rangeOfficers: [], // Not persisted with useToolData for now
    officerSchedules: [], // Not persisted with useToolData for now
    classes: [], // Not persisted with useToolData for now
    protectionEquipment: defaultProtectionEquipment,
    protectionRentals: [],
    targets: defaultTargets,
    targetSales: [],
    membershipPrograms: defaultMembershipPrograms,
    maintenanceLogs: [],
    incidents: incidentsData.data,
    brassRecycling: brassRecyclingData.data,
    lanes: defaultLanes,
  }), [
    membersData.data,
    reservationsData.data,
    firearmRentalsData.data,
    ammunitionData.data,
    incidentsData.data,
    brassRecyclingData.data,
  ]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Modal states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showFirearmForm, setShowFirearmForm] = useState(false);
  const [showAmmoForm, setShowAmmoForm] = useState(false);
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showBrassForm, setShowBrassForm] = useState(false);

  // Selected items for editing
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<LaneReservation | null>(null);
  const [selectedFirearm, setSelectedFirearm] = useState<FirearmRental | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getMemberName = (memberId: string): string => {
    const member = data.members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  };

  const getOfficerName = (officerId: string): string => {
    const officer = data.rangeOfficers.find(o => o.id === officerId);
    return officer ? `${officer.firstName} ${officer.lastName}` : 'Unknown';
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Dashboard stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeMembers = data.members.filter(m => m.status === 'active').length;
    const todayReservations = data.reservations.filter(r => r.date === today && r.status !== 'cancelled').length;
    const occupiedLanes = data.lanes.filter(l => l.status === 'occupied').length;
    const availableLanes = data.lanes.filter(l => l.status === 'available').length;
    const pendingWaivers = data.members.filter(m => !m.waiverSigned).length;
    const upcomingClasses = data.classes.filter(c => c.date >= today && c.status === 'scheduled').length;
    const lowStockAmmo = data.ammunition.filter(a => a.quantity <= a.lowStockThreshold).length;
    const unresolvedIncidents = data.incidents.filter(i => !i.resolved).length;

    const todayRevenue = [
      ...data.ammunitionSales.filter(s => s.date === today),
      ...data.targetSales.filter(s => s.date === today),
    ].reduce((sum, sale) => sum + sale.totalAmount, 0);

    return {
      activeMembers,
      todayReservations,
      occupiedLanes,
      availableLanes,
      pendingWaivers,
      upcomingClasses,
      lowStockAmmo,
      unresolvedIncidents,
      todayRevenue,
      totalLanes: data.lanes.length,
    };
  }, [data]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return data.members.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data.members, searchTerm]);

  // Form states
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipType: 'basic',
    membershipNumber: '',
    joinDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    status: 'active',
    waiverSigned: false,
    safetyBriefingCompleted: false,
    certifications: [],
    emergencyContact: { name: '', phone: '', relationship: '' },
  });

  const [reservationForm, setReservationForm] = useState<Partial<LaneReservation>>({
    laneNumber: 1,
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    laneType: 'pistol',
  });

  const [incidentForm, setIncidentForm] = useState<Partial<IncidentReport>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'other',
    severity: 'minor',
    description: '',
    actionTaken: '',
    reportedBy: '',
    witnessNames: [],
    followUpRequired: false,
    resolved: false,
  });

  const [brassForm, setBrassForm] = useState<Partial<BrassRecycling>>({
    date: new Date().toISOString().split('T')[0],
    caliber: '',
    weight: 0,
    weightUnit: 'lbs',
    pricePerPound: 1.50,
    totalValue: 0,
    collectedBy: '',
    status: 'collected',
  });

  const resetMemberForm = () => {
    setMemberForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      membershipType: 'basic',
      membershipNumber: '',
      joinDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      status: 'active',
      waiverSigned: false,
      safetyBriefingCompleted: false,
      certifications: [],
      emergencyContact: { name: '', phone: '', relationship: '' },
    });
    setSelectedMember(null);
  };

  const handleSaveMember = () => {
    if (!memberForm.firstName || !memberForm.lastName || !memberForm.email) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (selectedMember) {
      membersData.updateItem(selectedMember.id, memberForm);
    } else {
      const newMember: Member = {
        ...memberForm,
        id: generateId(),
        membershipNumber: memberForm.membershipNumber || `MEM-${Date.now().toString(36).toUpperCase()}`,
        certifications: memberForm.certifications || [],
        emergencyContact: memberForm.emergencyContact || { name: '', phone: '', relationship: '' },
      } as Member;
      membersData.addItem(newMember);
    }

    setShowMemberForm(false);
    resetMemberForm();
  };

  const handleDeleteMember = async (memberId: string) => {
    const result = await confirm({ message: 'Are you sure you want to delete this member?' });
    if (result) {
      membersData.deleteItem(memberId);
    }
  };

  const handleSaveReservation = () => {
    if (!reservationForm.memberId || !reservationForm.date || !reservationForm.startTime) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (selectedReservation) {
      reservationsData.updateItem(selectedReservation.id, reservationForm);
    } else {
      const newReservation: LaneReservation = {
        ...reservationForm,
        id: generateId(),
      } as LaneReservation;
      reservationsData.addItem(newReservation);
    }

    setShowReservationForm(false);
    setSelectedReservation(null);
    setReservationForm({
      laneNumber: 1,
      memberId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
      laneType: 'pistol',
    });
  };

  const handleSignWaiver = (memberId: string) => {
    membersData.updateItem(memberId, {
      waiverSigned: true,
      waiverSignedDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleCompleteSafetyBriefing = (memberId: string) => {
    membersData.updateItem(memberId, {
      safetyBriefingCompleted: true,
      safetyBriefingDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSaveIncident = () => {
    if (!incidentForm.description || !incidentForm.reportedBy) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newIncident: IncidentReport = {
      ...incidentForm,
      id: generateId(),
      witnessNames: incidentForm.witnessNames || [],
    } as IncidentReport;
    incidentsData.addItem(newIncident);
    setShowIncidentForm(false);
    setIncidentForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: 'other',
      severity: 'minor',
      description: '',
      actionTaken: '',
      reportedBy: '',
      witnessNames: [],
      followUpRequired: false,
      resolved: false,
    });
  };

  const handleSaveBrassRecycling = () => {
    if (!brassForm.caliber || !brassForm.weight || !brassForm.collectedBy) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalValue = (brassForm.weight || 0) * (brassForm.pricePerPound || 0);
    const newBrass: BrassRecycling = {
      ...brassForm,
      id: generateId(),
      totalValue,
    } as BrassRecycling;
    brassRecyclingData.addItem(newBrass);
    setShowBrassForm(false);
    setBrassForm({
      date: new Date().toISOString().split('T')[0],
      caliber: '',
      weight: 0,
      weightUnit: 'lbs',
      pricePerPound: 1.50,
      totalValue: 0,
      collectedBy: '',
      status: 'collected',
    });
  };

  const handleExportData = () => {
    // Use the hook's export method for members data
    membersData.exportJSON({ filename: 'shooting-range-members' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired':
      case 'cancelled':
      case 'maintenance':
      case 'retired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'occupied':
      case 'rented':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'critical':
        return 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Render tab content
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Members</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Lanes Available</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.availableLanes}/{stats.totalLanes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Today's Reservations</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.todayReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Today's Revenue</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${stats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(stats.pendingWaivers > 0 || stats.lowStockAmmo > 0 || stats.unresolvedIncidents > 0) && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.pendingWaivers > 0 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <FileText className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {stats.pendingWaivers} member(s) need to sign waiver
                </span>
              </div>
            )}
            {stats.lowStockAmmo > 0 && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {stats.lowStockAmmo} ammunition type(s) low in stock
                </span>
              </div>
            )}
            {stats.unresolvedIncidents > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {stats.unresolvedIncidents} unresolved incident(s)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lane Status Grid */}
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Crosshair className="w-5 h-5" />
            Lane Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {data.lanes.map(lane => (
              <div
                key={lane.number}
                className={`p-3 rounded-lg text-center border ${
                  lane.status === 'available'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : lane.status === 'occupied'
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>#{lane.number}</p>
                <p className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{lane.type}</p>
                <p className={`text-xs mt-1 capitalize ${
                  lane.status === 'available' ? 'text-green-600 dark:text-green-400' :
                  lane.status === 'occupied' ? 'text-blue-600 dark:text-blue-400' :
                  'text-red-600 dark:text-red-400'
                }`}>{lane.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setShowReservationForm(true); setActiveTab('reservations'); }}
          className="p-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </button>
        <button
          onClick={() => { setShowMemberForm(true); setActiveTab('members'); }}
          className="p-4 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 transition-colors"
        >
          <User className="w-5 h-5" />
          Add Member
        </button>
        <button
          onClick={() => { setShowIncidentForm(true); setActiveTab('incidents'); }}
          className="p-4 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-colors"
        >
          <AlertTriangle className="w-5 h-5" />
          Report Incident
        </button>
        <button
          onClick={handleExportData}
          className="p-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <button
          onClick={() => setShowReservationForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Reservation
        </button>
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {data.reservations
          .filter(r => r.date === selectedDate)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map(reservation => (
            <Card key={reservation.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      reservation.laneType === 'pistol' ? 'bg-blue-100 dark:bg-blue-900' :
                      reservation.laneType === 'rifle' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      <Target className={`w-6 h-6 ${
                        reservation.laneType === 'pistol' ? 'text-blue-600 dark:text-blue-400' :
                        reservation.laneType === 'rifle' ? 'text-green-600 dark:text-green-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Lane #{reservation.laneNumber}
                        </p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getMemberName(reservation.memberId)}
                        {reservation.guestName && ` + Guest: ${reservation.guestName}`}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {reservation.startTime} - {reservation.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setReservationForm(reservation);
                        setShowReservationForm(true);
                      }}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={async () => {
                        const result = await confirm({ message: 'Cancel this reservation?' });
                        if (result) {
                          reservationsData.updateItem(reservation.id, { status: 'cancelled' });
                        }
                      }}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        {data.reservations.filter(r => r.date === selectedDate).length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No reservations for this date
          </div>
        )}
      </div>

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedReservation ? 'Edit Reservation' : 'New Reservation'}
              </h3>
              <button onClick={() => { setShowReservationForm(false); setSelectedReservation(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Member *
                </label>
                <select
                  value={reservationForm.memberId || ''}
                  onChange={(e) => setReservationForm({ ...reservationForm, memberId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select Member</option>
                  {data.members.filter(m => m.status === 'active').map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Lane Number *
                  </label>
                  <select
                    value={reservationForm.laneNumber || 1}
                    onChange={(e) => setReservationForm({ ...reservationForm, laneNumber: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {data.lanes.map(lane => (
                      <option key={lane.number} value={lane.number}>
                        Lane #{lane.number} ({lane.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Lane Type
                  </label>
                  <select
                    value={reservationForm.laneType || 'pistol'}
                    onChange={(e) => setReservationForm({ ...reservationForm, laneType: e.target.value as 'pistol' | 'rifle' | 'multi-purpose' })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="pistol">Pistol</option>
                    <option value="rifle">Rifle</option>
                    <option value="multi-purpose">Multi-Purpose</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date *
                </label>
                <input
                  type="date"
                  value={reservationForm.date || ''}
                  onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={reservationForm.startTime || ''}
                    onChange={(e) => setReservationForm({ ...reservationForm, startTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={reservationForm.endTime || ''}
                    onChange={(e) => setReservationForm({ ...reservationForm, endTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Guest Name (optional)
                </label>
                <input
                  type="text"
                  value={reservationForm.guestName || ''}
                  onChange={(e) => setReservationForm({ ...reservationForm, guestName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={reservationForm.status || 'confirmed'}
                  onChange={(e) => setReservationForm({ ...reservationForm, status: e.target.value as LaneReservation['status'] })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  value={reservationForm.notes || ''}
                  onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => { setShowReservationForm(false); setSelectedReservation(null); }}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReservation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <button
          onClick={() => setShowMemberForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.map(member => (
          <Card key={member.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    member.membershipType === 'vip' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    member.membershipType === 'premium' ? 'bg-purple-100 dark:bg-purple-900' :
                    member.membershipType === 'instructor' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    <User className={`w-6 h-6 ${
                      member.membershipType === 'vip' ? 'text-yellow-600 dark:text-yellow-400' :
                      member.membershipType === 'premium' ? 'text-purple-600 dark:text-purple-400' :
                      member.membershipType === 'instructor' ? 'text-green-600 dark:text-green-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {member.firstName} {member.lastName}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        member.membershipType === 'vip' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        member.membershipType === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {member.membershipType}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Hash className="w-3 h-3 inline mr-1" />
                      {member.membershipNumber}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Mail className="w-3 h-3 inline mr-1" />
                        {member.email}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Phone className="w-3 h-3 inline mr-1" />
                        {member.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {member.waiverSigned ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> Waiver Signed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSignWaiver(member.id)}
                          className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          <XCircle className="w-3 h-3" /> Sign Waiver
                        </button>
                      )}
                      {member.safetyBriefingCompleted ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> Safety Briefing
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteSafetyBriefing(member.id)}
                          className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          <Shield className="w-3 h-3" /> Complete Briefing
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberForm(member);
                      setShowMemberForm(true);
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredMembers.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No members found
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedMember ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button onClick={() => { setShowMemberForm(false); resetMemberForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={memberForm.firstName || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={memberForm.lastName || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={memberForm.email || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={memberForm.phone || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Membership Type
                  </label>
                  <select
                    value={memberForm.membershipType || 'basic'}
                    onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value as Member['membershipType'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={memberForm.status || 'active'}
                    onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value as Member['status'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={memberForm.joinDate || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, joinDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={memberForm.expirationDate || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, expirationDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Emergency Contact
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={memberForm.emergencyContact?.name || ''}
                    onChange={(e) => setMemberForm({
                      ...memberForm,
                      emergencyContact: { ...memberForm.emergencyContact!, name: e.target.value }
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={memberForm.emergencyContact?.phone || ''}
                      onChange={(e) => setMemberForm({
                        ...memberForm,
                        emergencyContact: { ...memberForm.emergencyContact!, phone: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={memberForm.emergencyContact?.relationship || ''}
                      onChange={(e) => setMemberForm({
                        ...memberForm,
                        emergencyContact: { ...memberForm.emergencyContact!, relationship: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  value={memberForm.notes || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={2}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => { setShowMemberForm(false); resetMemberForm(); }}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIncidents = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowIncidentForm(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {data.incidents
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(incident => (
            <Card key={incident.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      incident.severity === 'critical' ? 'bg-red-200 dark:bg-red-800' :
                      incident.severity === 'severe' ? 'bg-red-100 dark:bg-red-900' :
                      incident.severity === 'moderate' ? 'bg-orange-100 dark:bg-orange-900' :
                      'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <AlertCircle className={`w-6 h-6 ${
                        incident.severity === 'critical' ? 'text-red-700 dark:text-red-300' :
                        incident.severity === 'severe' ? 'text-red-600 dark:text-red-400' :
                        incident.severity === 'moderate' ? 'text-orange-600 dark:text-orange-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {incident.type.replace('-', ' ')}
                        </p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        {incident.resolved ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Resolved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Open
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {incident.date} at {incident.time}
                        {incident.laneNumber && ` - Lane #${incident.laneNumber}`}
                      </p>
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {incident.description}
                      </p>
                      {incident.actionTaken && (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Action:</strong> {incident.actionTaken}
                        </p>
                      )}
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Reported by: {incident.reportedBy}
                      </p>
                    </div>
                  </div>
                  {!incident.resolved && (
                    <button
                      onClick={() => {
                        incidentsData.updateItem(incident.id, {
                          resolved: true,
                          resolvedDate: new Date().toISOString().split('T')[0],
                        });
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        {data.incidents.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No incidents reported
          </div>
        )}
      </div>

      {/* Incident Form Modal */}
      {showIncidentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Report Incident
              </h3>
              <button onClick={() => setShowIncidentForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={incidentForm.date || ''}
                    onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time *
                  </label>
                  <input
                    type="time"
                    value={incidentForm.time || ''}
                    onChange={(e) => setIncidentForm({ ...incidentForm, time: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Incident Type *
                  </label>
                  <select
                    value={incidentForm.type || 'other'}
                    onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value as IncidentReport['type'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="negligent-discharge">Negligent Discharge</option>
                    <option value="equipment-failure">Equipment Failure</option>
                    <option value="injury">Injury</option>
                    <option value="rules-violation">Rules Violation</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Severity *
                  </label>
                  <select
                    value={incidentForm.severity || 'minor'}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as IncidentReport['severity'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Lane Number (if applicable)
                </label>
                <select
                  value={incidentForm.laneNumber || ''}
                  onChange={(e) => setIncidentForm({ ...incidentForm, laneNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">N/A</option>
                  {data.lanes.map(lane => (
                    <option key={lane.number} value={lane.number}>Lane #{lane.number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <textarea
                  value={incidentForm.description || ''}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Describe what happened..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Action Taken
                </label>
                <textarea
                  value={incidentForm.actionTaken || ''}
                  onChange={(e) => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={2}
                  placeholder="What actions were taken..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reported By *
                </label>
                <input
                  type="text"
                  value={incidentForm.reportedBy || ''}
                  onChange={(e) => setIncidentForm({ ...incidentForm, reportedBy: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Your name"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={incidentForm.followUpRequired || false}
                  onChange={(e) => setIncidentForm({ ...incidentForm, followUpRequired: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="followUpRequired" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Follow-up required
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowIncidentForm(false)}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIncident}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBrassRecycling = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Total collected: {data.brassRecycling.reduce((sum, b) => sum + b.weight, 0).toFixed(2)} lbs
          <span className="mx-2">|</span>
          Total value: ${data.brassRecycling.reduce((sum, b) => sum + b.totalValue, 0).toFixed(2)}
        </div>
        <button
          onClick={() => setShowBrassForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Collection
        </button>
      </div>

      {/* Brass Records List */}
      <div className="space-y-3">
        {data.brassRecycling
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(brass => (
            <Card key={brass.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                      <Recycle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {brass.caliber} Brass
                        </p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(brass.status)}`}>
                          {brass.status}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {brass.date} - Collected by {brass.collectedBy}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Weight: {brass.weight} {brass.weightUnit}
                        </p>
                        <p className={`text-sm font-medium text-green-600 dark:text-green-400`}>
                          Value: ${brass.totalValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {brass.status !== 'sold' && (
                    <button
                      onClick={() => {
                        brassRecyclingData.updateItem(brass.id, { status: 'sold' });
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Mark as Sold
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        {data.brassRecycling.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No brass recycling records
          </div>
        )}
      </div>

      {/* Brass Form Modal */}
      {showBrassForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Log Brass Collection
              </h3>
              <button onClick={() => setShowBrassForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date *
                </label>
                <input
                  type="date"
                  value={brassForm.date || ''}
                  onChange={(e) => setBrassForm({ ...brassForm, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Caliber *
                </label>
                <input
                  type="text"
                  value={brassForm.caliber || ''}
                  onChange={(e) => setBrassForm({ ...brassForm, caliber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., 9mm, .45 ACP, .223"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Weight *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={brassForm.weight || ''}
                    onChange={(e) => setBrassForm({ ...brassForm, weight: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unit
                  </label>
                  <select
                    value={brassForm.weightUnit || 'lbs'}
                    onChange={(e) => setBrassForm({ ...brassForm, weightUnit: e.target.value as 'lbs' | 'kg' })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="lbs">Pounds</option>
                    <option value="kg">Kilograms</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price per Pound ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={brassForm.pricePerPound || ''}
                  onChange={(e) => setBrassForm({ ...brassForm, pricePerPound: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Collected By *
                </label>
                <input
                  type="text"
                  value={brassForm.collectedBy || ''}
                  onChange={(e) => setBrassForm({ ...brassForm, collectedBy: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Staff name"
                />
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Estimated Value: <span className="font-bold text-green-600 dark:text-green-400">
                    ${((brassForm.weight || 0) * (brassForm.pricePerPound || 0)).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowBrassForm(false)}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBrassRecycling}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMemberships = () => (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Membership Programs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.membershipPrograms.filter(p => p.isActive).map(program => (
          <Card key={program.id} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${
            program.id === 'vip' ? 'ring-2 ring-yellow-500' : ''
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Award className={`w-5 h-5 ${
                  program.id === 'vip' ? 'text-yellow-500' :
                  program.id === 'premium' ? 'text-purple-500' :
                  'text-blue-500'
                }`} />
                {program.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {program.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${program.monthlyFee}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                or ${program.yearlyFee}/year
              </p>
              <ul className="space-y-2">
                {program.benefits.map((benefit, index) => (
                  <li key={index} className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
                {program.guestPasses > 0 && (
                  <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {program.guestPasses} guest passes/month
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, icon: React.ReactNode) => (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
      <CardContent className="p-8 text-center">
        <div className={`inline-flex p-4 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
          {icon}
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          This feature is coming soon. Use the dashboard to manage basic operations.
        </p>
      </CardContent>
    </Card>
  );

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Target className="w-4 h-4" /> },
    { id: 'reservations', label: 'Reservations', icon: <Calendar className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'rentals', label: 'Firearms', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'ammunition', label: 'Ammo', icon: <Package className="w-4 h-4" /> },
    { id: 'officers', label: 'Officers', icon: <Shield className="w-4 h-4" /> },
    { id: 'classes', label: 'Classes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'protection', label: 'Protection', icon: <Glasses className="w-4 h-4" /> },
    { id: 'targets', label: 'Targets', icon: <Target className="w-4 h-4" /> },
    { id: 'memberships', label: 'Memberships', icon: <Award className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'brass', label: 'Brass', icon: <Recycle className="w-4 h-4" /> },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.shootingRange.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-600">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shootingRange.shootingRangeManagement', 'Shooting Range Management')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.shootingRange.completeRangeOperationsManagementSystem', 'Complete range operations management system')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="shooting-range" toolName="Shooting Range" />

            <SyncStatus
              isSynced={membersData.isSynced && reservationsData.isSynced && firearmRentalsData.isSynced && ammunitionData.isSynced && incidentsData.isSynced && brassRecyclingData.isSynced}
              isSaving={membersData.isSaving || reservationsData.isSaving || firearmRentalsData.isSaving || ammunitionData.isSaving || incidentsData.isSaving || brassRecyclingData.isSaving}
              lastSaved={membersData.lastSaved || reservationsData.lastSaved || firearmRentalsData.lastSaved || ammunitionData.lastSaved || incidentsData.lastSaved || brassRecyclingData.lastSaved}
              syncError={membersData.syncError || reservationsData.syncError || firearmRentalsData.syncError || ammunitionData.syncError || incidentsData.syncError || brassRecyclingData.syncError}
              onForceSync={() => {
                membersData.forceSync();
                reservationsData.forceSync();
                firearmRentalsData.forceSync();
                ammunitionData.forceSync();
                incidentsData.forceSync();
                brassRecyclingData.forceSync();
              }}
              theme={theme}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => {
                if (activeTab === 'members') {
                  membersData.exportCSV({ filename: 'shooting-range-members' });
                } else if (activeTab === 'reservations') {
                  reservationsData.exportCSV({ filename: 'shooting-range-reservations' });
                } else if (activeTab === 'rentals') {
                  firearmRentalsData.exportCSV({ filename: 'shooting-range-firearms' });
                } else if (activeTab === 'ammunition') {
                  ammunitionData.exportCSV({ filename: 'shooting-range-ammunition' });
                } else if (activeTab === 'incidents') {
                  incidentsData.exportCSV({ filename: 'shooting-range-incidents' });
                } else if (activeTab === 'brass') {
                  brassRecyclingData.exportCSV({ filename: 'shooting-range-brass' });
                } else {
                  membersData.exportCSV({ filename: 'shooting-range-members' });
                }
              }}
              onExportExcel={() => {
                if (activeTab === 'members') {
                  membersData.exportExcel({ filename: 'shooting-range-members' });
                } else if (activeTab === 'reservations') {
                  reservationsData.exportExcel({ filename: 'shooting-range-reservations' });
                } else if (activeTab === 'rentals') {
                  firearmRentalsData.exportExcel({ filename: 'shooting-range-firearms' });
                } else if (activeTab === 'ammunition') {
                  ammunitionData.exportExcel({ filename: 'shooting-range-ammunition' });
                } else if (activeTab === 'incidents') {
                  incidentsData.exportExcel({ filename: 'shooting-range-incidents' });
                } else if (activeTab === 'brass') {
                  brassRecyclingData.exportExcel({ filename: 'shooting-range-brass' });
                } else {
                  membersData.exportExcel({ filename: 'shooting-range-members' });
                }
              }}
              onExportJSON={() => {
                if (activeTab === 'members') {
                  membersData.exportJSON({ filename: 'shooting-range-members' });
                } else if (activeTab === 'reservations') {
                  reservationsData.exportJSON({ filename: 'shooting-range-reservations' });
                } else if (activeTab === 'rentals') {
                  firearmRentalsData.exportJSON({ filename: 'shooting-range-firearms' });
                } else if (activeTab === 'ammunition') {
                  ammunitionData.exportJSON({ filename: 'shooting-range-ammunition' });
                } else if (activeTab === 'incidents') {
                  incidentsData.exportJSON({ filename: 'shooting-range-incidents' });
                } else if (activeTab === 'brass') {
                  brassRecyclingData.exportJSON({ filename: 'shooting-range-brass' });
                } else {
                  membersData.exportJSON({ filename: 'shooting-range-members' });
                }
              }}
              onExportPDF={() => {
                if (activeTab === 'members') {
                  membersData.exportPDF({
                    filename: 'shooting-range-members',
                    title: 'Shooting Range - Members Report',
                    subtitle: `Total Members: ${data.members.length} | Active: ${data.members.filter(m => m.status === 'active').length}`,
                    orientation: 'landscape',
                  });
                } else if (activeTab === 'reservations') {
                  reservationsData.exportPDF({
                    filename: 'shooting-range-reservations',
                    title: 'Shooting Range - Reservations Report',
                    subtitle: `Total Reservations: ${data.reservations.length}`,
                    orientation: 'landscape',
                  });
                } else if (activeTab === 'rentals') {
                  firearmRentalsData.exportPDF({
                    filename: 'shooting-range-firearms',
                    title: 'Shooting Range - Firearms Report',
                    subtitle: `Total Firearms: ${data.firearmRentals.length}`,
                    orientation: 'landscape',
                  });
                } else if (activeTab === 'ammunition') {
                  ammunitionData.exportPDF({
                    filename: 'shooting-range-ammunition',
                    title: 'Shooting Range - Ammunition Report',
                    subtitle: `Total Items: ${data.ammunition.length}`,
                    orientation: 'landscape',
                  });
                } else if (activeTab === 'incidents') {
                  incidentsData.exportPDF({
                    filename: 'shooting-range-incidents',
                    title: 'Shooting Range - Incidents Report',
                    subtitle: `Total Incidents: ${data.incidents.length} | Unresolved: ${data.incidents.filter(i => !i.resolved).length}`,
                    orientation: 'landscape',
                  });
                } else if (activeTab === 'brass') {
                  brassRecyclingData.exportPDF({
                    filename: 'shooting-range-brass',
                    title: 'Shooting Range - Brass Recycling Report',
                    subtitle: `Total Entries: ${data.brassRecycling.length}`,
                    orientation: 'landscape',
                  });
                } else {
                  membersData.exportPDF({
                    filename: 'shooting-range-members',
                    title: 'Shooting Range - Members Report',
                    subtitle: `Total Members: ${data.members.length}`,
                    orientation: 'landscape',
                  });
                }
              }}
              onPrint={() => {
                if (activeTab === 'members') {
                  membersData.print('Shooting Range - Members Report');
                } else if (activeTab === 'reservations') {
                  reservationsData.print('Shooting Range - Reservations Report');
                } else if (activeTab === 'rentals') {
                  firearmRentalsData.print('Shooting Range - Firearms Report');
                } else if (activeTab === 'ammunition') {
                  ammunitionData.print('Shooting Range - Ammunition Report');
                } else if (activeTab === 'incidents') {
                  incidentsData.print('Shooting Range - Incidents Report');
                } else if (activeTab === 'brass') {
                  brassRecyclingData.print('Shooting Range - Brass Recycling Report');
                } else {
                  membersData.print('Shooting Range - Members Report');
                }
              }}
              onCopyToClipboard={() => {
                if (activeTab === 'members') {
                  membersData.copyToClipboard();
                } else if (activeTab === 'reservations') {
                  reservationsData.copyToClipboard();
                } else if (activeTab === 'rentals') {
                  firearmRentalsData.copyToClipboard();
                } else if (activeTab === 'ammunition') {
                  ammunitionData.copyToClipboard();
                } else if (activeTab === 'incidents') {
                  incidentsData.copyToClipboard();
                } else if (activeTab === 'brass') {
                  brassRecyclingData.copyToClipboard();
                } else {
                  membersData.copyToClipboard();
                }
              }}
              theme={theme}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[60vh]">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'reservations' && renderReservations()}
          {activeTab === 'members' && renderMembers()}
          {activeTab === 'rentals' && renderPlaceholder('Firearm Rentals', <Crosshair className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'ammunition' && renderPlaceholder('Ammunition Inventory', <Package className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'officers' && renderPlaceholder('Range Officers', <Shield className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'classes' && renderPlaceholder('Classes & Instruction', <BookOpen className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'protection' && renderPlaceholder('Eye/Ear Protection', <Glasses className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'targets' && renderPlaceholder('Target Sales', <Target className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'memberships' && renderMemberships()}
          {activeTab === 'maintenance' && renderPlaceholder('Lane Maintenance', <Wrench className="w-8 h-8 text-gray-400" />)}
          {activeTab === 'incidents' && renderIncidents()}
          {activeTab === 'brass' && renderBrassRecycling()}
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg animate-in fade-in ${theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ShootingRangeTool;
