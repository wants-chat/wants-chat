'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Save,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Star,
  Phone,
  Mail,
  Wifi,
  Car,
  Music,
  Utensils,
  Camera,
  Mic,
  Wind,
  Tv,
  Coffee,
  BarChart3,
  Image,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface VenueBookingToolProps {
  uiConfig?: UIConfig;
}

// TypeScript interfaces
interface Venue {
  id: string;
  name: string;
  type: VenueType;
  address: string;
  city: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  amenities: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  rating: number;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  venueId: string;
  eventName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  eventType: string;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  specialRequests: string;
  createdAt: string;
}

type VenueType = 'banquet-hall' | 'hotel' | 'conference-center' | 'outdoor' | 'restaurant' | 'studio' | 'theater' | 'rooftop' | 'garden' | 'other';
type BookingStatus = 'inquiry' | 'pending' | 'confirmed' | 'deposit-paid' | 'completed' | 'cancelled';
type TabType = 'venues' | 'bookings' | 'calendar' | 'analytics';

const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: 'banquet-hall', label: 'Banquet Hall' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'conference-center', label: 'Conference Center' },
  { value: 'outdoor', label: 'Outdoor Venue' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'studio', label: 'Studio' },
  { value: 'theater', label: 'Theater' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'garden', label: 'Garden' },
  { value: 'other', label: 'Other' },
];

const BOOKING_STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'inquiry', label: 'Inquiry', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'deposit-paid', label: 'Deposit Paid', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'catering', label: 'Catering', icon: Utensils },
  { id: 'av-equipment', label: 'AV Equipment', icon: Tv },
  { id: 'sound-system', label: 'Sound System', icon: Music },
  { id: 'stage', label: 'Stage', icon: Mic },
  { id: 'air-conditioning', label: 'A/C', icon: Wind },
  { id: 'outdoor-space', label: 'Outdoor Space', icon: Building2 },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'bar-service', label: 'Bar Service', icon: Coffee },
];

// Column configurations for export
const venueColumns: ColumnConfig[] = [
  { key: 'id', header: 'Venue ID', type: 'string' },
  { key: 'name', header: 'Venue Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'pricePerHour', header: 'Price/Hour', type: 'currency' },
  { key: 'pricePerDay', header: 'Price/Day', type: 'currency' },
  { key: 'contactName', header: 'Contact', type: 'string' },
  { key: 'contactPhone', header: 'Phone', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
];

const bookingColumns: ColumnConfig[] = [
  { key: 'id', header: 'Booking ID', type: 'string' },
  { key: 'eventName', header: 'Event', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'eventDate', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start', type: 'string' },
  { key: 'endTime', header: 'End', type: 'string' },
  { key: 'guestCount', header: 'Guests', type: 'number' },
  { key: 'totalAmount', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Generate sample data
const generateSampleVenues = (): Venue[] => [
  {
    id: 'venue-1',
    name: 'Grand Ballroom',
    type: 'banquet-hall',
    address: '123 Event Plaza',
    city: 'New York',
    capacity: 500,
    pricePerHour: 500,
    pricePerDay: 3500,
    amenities: ['wifi', 'parking', 'catering', 'av-equipment', 'sound-system', 'stage', 'air-conditioning'],
    contactName: 'John Manager',
    contactEmail: 'john@grandballroom.com',
    contactPhone: '+1 555-0101',
    rating: 4.8,
    description: 'Elegant ballroom with crystal chandeliers and marble floors',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'venue-2',
    name: 'Skyline Rooftop',
    type: 'rooftop',
    address: '456 Tower Ave',
    city: 'New York',
    capacity: 150,
    pricePerHour: 300,
    pricePerDay: 2000,
    amenities: ['wifi', 'bar-service', 'sound-system', 'photography'],
    contactName: 'Sarah Events',
    contactEmail: 'sarah@skylinerooftop.com',
    contactPhone: '+1 555-0102',
    rating: 4.6,
    description: 'Stunning rooftop venue with panoramic city views',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'venue-3',
    name: 'Garden Paradise',
    type: 'garden',
    address: '789 Park Lane',
    city: 'Brooklyn',
    capacity: 200,
    pricePerHour: 250,
    pricePerDay: 1800,
    amenities: ['parking', 'outdoor-space', 'photography', 'catering'],
    contactName: 'Mike Gardens',
    contactEmail: 'mike@gardenparadise.com',
    contactPhone: '+1 555-0103',
    rating: 4.9,
    description: 'Beautiful outdoor garden venue perfect for weddings',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'venue-4',
    name: 'Tech Conference Center',
    type: 'conference-center',
    address: '321 Innovation Way',
    city: 'Manhattan',
    capacity: 300,
    pricePerHour: 400,
    pricePerDay: 2800,
    amenities: ['wifi', 'av-equipment', 'sound-system', 'air-conditioning', 'parking'],
    contactName: 'Lisa Tech',
    contactEmail: 'lisa@techconf.com',
    contactPhone: '+1 555-0104',
    rating: 4.7,
    description: 'State-of-the-art conference facility with cutting-edge technology',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const generateSampleBookings = (): Booking[] => {
  const today = new Date();
  return [
    {
      id: 'booking-1',
      venueId: 'venue-1',
      eventName: 'Smith Wedding Reception',
      clientName: 'Emily Smith',
      clientEmail: 'emily@email.com',
      clientPhone: '+1 555-0201',
      eventDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '23:00',
      guestCount: 200,
      eventType: 'Wedding',
      status: 'deposit-paid',
      totalAmount: 12500,
      depositAmount: 5000,
      depositPaid: true,
      specialRequests: 'Need vegetarian options for 30 guests',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-2',
      venueId: 'venue-4',
      eventName: 'Annual Tech Summit',
      clientName: 'TechCorp Inc',
      clientEmail: 'events@techcorp.com',
      clientPhone: '+1 555-0202',
      eventDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      guestCount: 250,
      eventType: 'Conference',
      status: 'confirmed',
      totalAmount: 8400,
      depositAmount: 2500,
      depositPaid: true,
      specialRequests: 'Need breakout rooms for workshops',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-3',
      venueId: 'venue-2',
      eventName: 'Corporate Anniversary',
      clientName: 'ABC Company',
      clientEmail: 'hr@abccompany.com',
      clientPhone: '+1 555-0203',
      eventDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '19:00',
      endTime: '22:00',
      guestCount: 100,
      eventType: 'Corporate',
      status: 'pending',
      totalAmount: 4500,
      depositAmount: 1500,
      depositPaid: false,
      specialRequests: 'DJ setup required',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const VenueBookingTool: React.FC<VenueBookingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize hooks for venues and bookings with backend sync
  const venuesData = useToolData<Venue>(
    'venue-booking-venues',
    generateSampleVenues(),
    venueColumns,
    { autoSave: true }
  );

  const bookingsData = useToolData<Booking>(
    'venue-booking-bookings',
    generateSampleBookings(),
    bookingColumns,
    { autoSave: true }
  );

  const venues = venuesData.data;
  const bookings = bookingsData.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('venues');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<VenueType | ''>('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | ''>('');
  const [filterCity, setFilterCity] = useState('');

  // New venue form
  const [newVenue, setNewVenue] = useState<Partial<Venue>>({
    name: '',
    type: 'banquet-hall',
    address: '',
    city: '',
    capacity: 100,
    pricePerHour: 0,
    pricePerDay: 0,
    amenities: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    rating: 0,
    description: '',
    isActive: true,
  });

  // New booking form
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    venueId: '',
    eventName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    guestCount: 50,
    eventType: '',
    status: 'inquiry',
    totalAmount: 0,
    depositAmount: 0,
    depositPaid: false,
    specialRequests: '',
  });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.venueName || params.title) {
        setNewVenue(prev => ({
          ...prev,
          name: params.venueName || params.title || prev.name,
          address: params.address || prev.address,
          city: params.city || prev.city,
          capacity: params.capacity || prev.capacity,
        }));
        setShowVenueForm(true);
        setActiveTab('venues');
        setIsPrefilled(true);
      } else if (params.eventName || params.clientName) {
        setNewBooking(prev => ({
          ...prev,
          eventName: params.eventName || prev.eventName,
          clientName: params.clientName || prev.clientName,
          clientEmail: params.email || prev.clientEmail,
          eventDate: params.date || prev.eventDate,
          guestCount: params.guestCount || prev.guestCount,
        }));
        setShowBookingForm(true);
        setActiveTab('bookings');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Get unique cities
  const cities = useMemo(() => {
    return [...new Set(venues.map(v => v.city))].sort();
  }, [venues]);

  // Filtered venues
  const filteredVenues = useMemo(() => {
    return venues.filter(venue => {
      const matchesSearch = searchQuery === '' ||
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || venue.type === filterType;
      const matchesCity = filterCity === '' || venue.city === filterCity;
      return matchesSearch && matchesType && matchesCity && venue.isActive;
    });
  }, [venues, searchQuery, filterType, filterCity]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const venue = venues.find(v => v.id === booking.venueId);
      const matchesSearch = searchQuery === '' ||
        booking.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (venue?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || booking.status === filterStatus;
      const matchesVenue = selectedVenueId === '' || booking.venueId === selectedVenueId;
      return matchesSearch && matchesStatus && matchesVenue;
    });
  }, [bookings, venues, searchQuery, filterStatus, selectedVenueId]);

  // Analytics
  const analytics = useMemo(() => {
    const totalVenues = venues.filter(v => v.isActive).length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => ['confirmed', 'deposit-paid', 'completed'].includes(b.status)).length;
    const pendingBookings = bookings.filter(b => ['inquiry', 'pending'].includes(b.status)).length;
    const totalRevenue = bookings
      .filter(b => ['deposit-paid', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const totalDeposits = bookings
      .filter(b => b.depositPaid)
      .reduce((sum, b) => sum + b.depositAmount, 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / confirmedBookings : 0;
    const occupancyRate = Math.round((confirmedBookings / (totalVenues * 30)) * 100);

    return {
      totalVenues,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue,
      totalDeposits,
      averageBookingValue,
      occupancyRate: Math.min(occupancyRate, 100),
    };
  }, [venues, bookings]);

  // Calculate booking total
  const calculateTotal = (venueId: string, startTime: string, endTime: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return 0;

    const start = parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1]) / 60;
    const end = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;
    const hours = Math.max(0, end - start);

    if (hours >= 8) {
      return venue.pricePerDay;
    }
    return Math.round(venue.pricePerHour * hours);
  };

  // CRUD handlers for Venues
  const handleAddVenue = () => {
    if (!newVenue.name) return;

    const venue: Venue = {
      id: `venue-${Date.now()}`,
      name: newVenue.name || '',
      type: (newVenue.type as VenueType) || 'other',
      address: newVenue.address || '',
      city: newVenue.city || '',
      capacity: newVenue.capacity || 0,
      pricePerHour: newVenue.pricePerHour || 0,
      pricePerDay: newVenue.pricePerDay || 0,
      amenities: newVenue.amenities || [],
      contactName: newVenue.contactName || '',
      contactEmail: newVenue.contactEmail || '',
      contactPhone: newVenue.contactPhone || '',
      rating: newVenue.rating || 0,
      description: newVenue.description || '',
      imageUrl: newVenue.imageUrl,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    venuesData.addItem(venue);
    setNewVenue({
      name: '',
      type: 'banquet-hall',
      address: '',
      city: '',
      capacity: 100,
      pricePerHour: 0,
      pricePerDay: 0,
      amenities: [],
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      rating: 0,
      description: '',
      isActive: true,
    });
    setShowVenueForm(false);
    setIsPrefilled(false);
  };

  const handleUpdateVenue = () => {
    if (!editingVenue) return;
    venuesData.updateItem(editingVenue.id, editingVenue);
    setEditingVenue(null);
  };

  const handleDeleteVenue = async (id: string) => {
    const hasBookings = bookings.some(b => b.venueId === id);
    if (hasBookings) {
      const confirmed = await confirm({
        title: 'Deactivate Venue',
        message: 'This venue has bookings. Are you sure you want to deactivate it?',
        confirmText: 'Yes, Deactivate',
        cancelText: 'Cancel',
        variant: 'danger'
      });
      if (confirmed) {
        venuesData.updateItem(id, { isActive: false });
      }
    } else {
      const confirmed = await confirm({
        title: 'Delete Venue',
        message: 'Are you sure you want to delete this venue?',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      });
      if (confirmed) {
        venuesData.deleteItem(id);
      }
    }
  };

  // CRUD handlers for Bookings
  const handleAddBooking = () => {
    if (!newBooking.venueId || !newBooking.eventName || !newBooking.clientName) return;

    const total = calculateTotal(newBooking.venueId, newBooking.startTime!, newBooking.endTime!);

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      venueId: newBooking.venueId,
      eventName: newBooking.eventName || '',
      clientName: newBooking.clientName || '',
      clientEmail: newBooking.clientEmail || '',
      clientPhone: newBooking.clientPhone || '',
      eventDate: newBooking.eventDate || new Date().toISOString().split('T')[0],
      startTime: newBooking.startTime || '10:00',
      endTime: newBooking.endTime || '18:00',
      guestCount: newBooking.guestCount || 0,
      eventType: newBooking.eventType || '',
      status: (newBooking.status as BookingStatus) || 'inquiry',
      totalAmount: total,
      depositAmount: Math.round(total * 0.3),
      depositPaid: false,
      specialRequests: newBooking.specialRequests || '',
      createdAt: new Date().toISOString(),
    };

    bookingsData.addItem(booking);
    setNewBooking({
      venueId: '',
      eventName: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      eventDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '18:00',
      guestCount: 50,
      eventType: '',
      status: 'inquiry',
      totalAmount: 0,
      depositAmount: 0,
      depositPaid: false,
      specialRequests: '',
    });
    setShowBookingForm(false);
    setIsPrefilled(false);
  };

  const handleUpdateBooking = () => {
    if (!editingBooking) return;
    const total = calculateTotal(editingBooking.venueId, editingBooking.startTime, editingBooking.endTime);
    bookingsData.updateItem(editingBooking.id, { ...editingBooking, totalAmount: total });
    setEditingBooking(null);
  };

  const handleDeleteBooking = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Booking',
      message: 'Are you sure you want to delete this booking?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      bookingsData.deleteItem(id);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      inquiry: isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-800',
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      confirmed: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      'deposit-paid': isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      completed: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800',
      cancelled: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.inquiry;
  };

  const toggleAmenity = (amenityId: string, isEditing: boolean) => {
    if (isEditing && editingVenue) {
      const amenities = editingVenue.amenities.includes(amenityId)
        ? editingVenue.amenities.filter(a => a !== amenityId)
        : [...editingVenue.amenities, amenityId];
      setEditingVenue({ ...editingVenue, amenities });
    } else {
      const amenities = (newVenue.amenities || []).includes(amenityId)
        ? (newVenue.amenities || []).filter(a => a !== amenityId)
        : [...(newVenue.amenities || []), amenityId];
      setNewVenue({ ...newVenue, amenities });
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.venueBooking.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.venueBooking.venueBooking', 'Venue Booking')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.venueBooking.manageVenuesAndEventBookings', 'Manage venues and event bookings')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="venue-booking" toolName="Venue Booking" />

              <SyncStatus
                isSynced={venuesData.isSynced && bookingsData.isSynced}
                isSaving={venuesData.isSaving || bookingsData.isSaving}
                lastSaved={venuesData.lastSaved || bookingsData.lastSaved}
                syncError={venuesData.syncError || bookingsData.syncError}
                onForceSync={async () => {
                  await venuesData.forceSync();
                  await bookingsData.forceSync();
                  return true;
                }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => activeTab === 'venues'
                  ? venuesData.exportCSV({ filename: 'venues' })
                  : bookingsData.exportCSV({ filename: 'venue-bookings' })
                }
                onExportExcel={() => activeTab === 'venues'
                  ? venuesData.exportExcel({ filename: 'venues' })
                  : bookingsData.exportExcel({ filename: 'venue-bookings' })
                }
                onExportJSON={() => activeTab === 'venues'
                  ? venuesData.exportJSON({ filename: 'venues' })
                  : bookingsData.exportJSON({ filename: 'venue-bookings' })
                }
                onExportPDF={() => activeTab === 'venues'
                  ? venuesData.exportPDF({ filename: 'venues', title: 'Venues Report' })
                  : bookingsData.exportPDF({ filename: 'venue-bookings', title: 'Bookings Report' })
                }
                onPrint={() => activeTab === 'venues'
                  ? venuesData.print('Venues')
                  : bookingsData.print('Venue Bookings')
                }
                onCopyToClipboard={() => activeTab === 'venues'
                  ? venuesData.copyToClipboard('tab')
                  : bookingsData.copyToClipboard('tab')
                }
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'venues', label: 'Venues', icon: <Building2 className="w-4 h-4" /> },
              { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Venues Tab */}
        {activeTab === 'venues' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.venueBooking.searchVenues', 'Search venues...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as VenueType | '')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.venueBooking.allTypes', 'All Types')}</option>
                  {VENUE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.venueBooking.allCities', 'All Cities')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowVenueForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.venueBooking.addVenue', 'Add Venue')}
                </button>
              </div>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVenues.map(venue => (
                <div
                  key={venue.id}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}
                >
                  <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                    <Image className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {venue.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {VENUE_TYPES.find(t => t.value === venue.type)?.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {venue.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className={`space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{venue.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Up to {venue.capacity} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${venue.pricePerHour}/hr | ${venue.pricePerDay}/day</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {venue.amenities.slice(0, 4).map(amenityId => {
                        const amenity = AMENITIES.find(a => a.id === amenityId);
                        if (!amenity) return null;
                        const Icon = amenity.icon;
                        return (
                          <span
                            key={amenityId}
                            className={`p-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            title={amenity.label}
                          >
                            <Icon className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </span>
                        );
                      })}
                      {venue.amenities.length > 4 && (
                        <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          +{venue.amenities.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedVenueId(venue.id);
                          setNewBooking(prev => ({ ...prev, venueId: venue.id }));
                          setShowBookingForm(true);
                        }}
                        className="flex-1 px-3 py-1.5 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0D9488]/90"
                      >
                        {t('tools.venueBooking.bookNow', 'Book Now')}
                      </button>
                      <button
                        onClick={() => setEditingVenue(venue)}
                        className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteVenue(venue.id)}
                        className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVenues.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.venueBooking.noVenuesFoundAddYour', 'No venues found. Add your first venue!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.venueBooking.searchBookings', 'Search bookings...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as BookingStatus | '')}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.venueBooking.allStatus', 'All Status')}</option>
                  {BOOKING_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.venueBooking.allVenues', 'All Venues')}</option>
                  {venues.filter(v => v.isActive).map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.venueBooking.newBooking', 'New Booking')}
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.map(booking => {
                const venue = venues.find(v => v.id === booking.venueId);
                return (
                  <div
                    key={booking.id}
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.eventName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                            {BOOKING_STATUSES.find(s => s.value === booking.status)?.label}
                          </span>
                        </div>
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div>
                            <span className="block text-xs opacity-70">{t('tools.venueBooking.venue', 'Venue')}</span>
                            <span className="font-medium">{venue?.name || 'Unknown'}</span>
                          </div>
                          <div>
                            <span className="block text-xs opacity-70">{t('tools.venueBooking.client', 'Client')}</span>
                            <span className="font-medium">{booking.clientName}</span>
                          </div>
                          <div>
                            <span className="block text-xs opacity-70">{t('tools.venueBooking.date', 'Date')}</span>
                            <span className="font-medium">
                              {new Date(booking.eventDate).toLocaleDateString()} | {booking.startTime}-{booking.endTime}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs opacity-70">{t('tools.venueBooking.guests', 'Guests')}</span>
                            <span className="font-medium">{booking.guestCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${booking.totalAmount.toLocaleString()}
                        </p>
                        <p className={`text-xs ${booking.depositPaid ? 'text-green-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {booking.depositPaid ? 'Deposit Paid' : `Deposit: $${booking.depositAmount}`}
                        </p>
                        <div className="flex gap-1 mt-2 justify-end">
                          <button
                            onClick={() => setEditingBooking(booking)}
                            className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBookings.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.venueBooking.noBookingsFoundCreateYour', 'No bookings found. Create your first booking!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-[#0D9488]" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.venueBooking.activeVenues', 'Active Venues')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalVenues}
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.venueBooking.totalBookings', 'Total Bookings')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalBookings}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {analytics.confirmedBookings} confirmed | {analytics.pendingBookings} pending
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.venueBooking.totalRevenue', 'Total Revenue')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${analytics.totalRevenue.toLocaleString()}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                ${analytics.totalDeposits.toLocaleString()} in deposits
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.venueBooking.avgBookingValue', 'Avg. Booking Value')}</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${Math.round(analytics.averageBookingValue).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Venue Form Modal */}
        {(showVenueForm || editingVenue) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingVenue ? t('tools.venueBooking.editVenue', 'Edit Venue') : t('tools.venueBooking.addNewVenue', 'Add New Venue')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowVenueForm(false);
                      setEditingVenue(null);
                      setIsPrefilled(false);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.venueName', 'Venue Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingVenue?.name || newVenue.name}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, name: e.target.value })
                        : setNewVenue({ ...newVenue, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.venueType', 'Venue Type')}
                    </label>
                    <select
                      value={editingVenue?.type || newVenue.type}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, type: e.target.value as VenueType })
                        : setNewVenue({ ...newVenue, type: e.target.value as VenueType })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {VENUE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.capacity', 'Capacity')}
                    </label>
                    <input
                      type="number"
                      value={editingVenue?.capacity || newVenue.capacity}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, capacity: parseInt(e.target.value) || 0 })
                        : setNewVenue({ ...newVenue, capacity: parseInt(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.address', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={editingVenue?.address || newVenue.address}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, address: e.target.value })
                        : setNewVenue({ ...newVenue, address: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={editingVenue?.city || newVenue.city}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, city: e.target.value })
                        : setNewVenue({ ...newVenue, city: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.pricePerHour', 'Price per Hour ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingVenue?.pricePerHour || newVenue.pricePerHour}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, pricePerHour: parseFloat(e.target.value) || 0 })
                        : setNewVenue({ ...newVenue, pricePerHour: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.pricePerDay', 'Price per Day ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingVenue?.pricePerDay || newVenue.pricePerDay}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, pricePerDay: parseFloat(e.target.value) || 0 })
                        : setNewVenue({ ...newVenue, pricePerDay: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.contactName', 'Contact Name')}
                    </label>
                    <input
                      type="text"
                      value={editingVenue?.contactName || newVenue.contactName}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, contactName: e.target.value })
                        : setNewVenue({ ...newVenue, contactName: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.contactEmail', 'Contact Email')}
                    </label>
                    <input
                      type="email"
                      value={editingVenue?.contactEmail || newVenue.contactEmail}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, contactEmail: e.target.value })
                        : setNewVenue({ ...newVenue, contactEmail: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.contactPhone', 'Contact Phone')}
                    </label>
                    <input
                      type="tel"
                      value={editingVenue?.contactPhone || newVenue.contactPhone}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, contactPhone: e.target.value })
                        : setNewVenue({ ...newVenue, contactPhone: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.amenities', 'Amenities')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map(amenity => {
                        const isSelected = (editingVenue?.amenities || newVenue.amenities || []).includes(amenity.id);
                        const Icon = amenity.icon;
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id, !!editingVenue)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isSelected
                                ? 'bg-[#0D9488] text-white'
                                : isDark
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {amenity.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.description', 'Description')}
                    </label>
                    <textarea
                      value={editingVenue?.description || newVenue.description}
                      onChange={(e) => editingVenue
                        ? setEditingVenue({ ...editingVenue, description: e.target.value })
                        : setNewVenue({ ...newVenue, description: e.target.value })
                      }
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowVenueForm(false);
                      setEditingVenue(null);
                      setIsPrefilled(false);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.venueBooking.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={editingVenue ? handleUpdateVenue : handleAddVenue}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingVenue ? t('tools.venueBooking.saveChanges', 'Save Changes') : t('tools.venueBooking.addVenue2', 'Add Venue')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form Modal */}
        {(showBookingForm || editingBooking) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingBooking ? t('tools.venueBooking.editBooking', 'Edit Booking') : t('tools.venueBooking.newBooking2', 'New Booking')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowBookingForm(false);
                      setEditingBooking(null);
                      setIsPrefilled(false);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.venue2', 'Venue *')}
                    </label>
                    <select
                      value={editingBooking?.venueId || newBooking.venueId}
                      onChange={(e) => editingBooking
                        ? setEditingBooking({ ...editingBooking, venueId: e.target.value })
                        : setNewBooking({ ...newBooking, venueId: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('tools.venueBooking.selectVenue', 'Select Venue')}</option>
                      {venues.filter(v => v.isActive).map(venue => (
                        <option key={venue.id} value={venue.id}>{venue.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.eventName', 'Event Name *')}
                    </label>
                    <input
                      type="text"
                      value={editingBooking?.eventName || newBooking.eventName}
                      onChange={(e) => editingBooking
                        ? setEditingBooking({ ...editingBooking, eventName: e.target.value })
                        : setNewBooking({ ...newBooking, eventName: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.venueBooking.clientName', 'Client Name *')}
                      </label>
                      <input
                        type="text"
                        value={editingBooking?.clientName || newBooking.clientName}
                        onChange={(e) => editingBooking
                          ? setEditingBooking({ ...editingBooking, clientName: e.target.value })
                          : setNewBooking({ ...newBooking, clientName: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.venueBooking.clientEmail', 'Client Email')}
                      </label>
                      <input
                        type="email"
                        value={editingBooking?.clientEmail || newBooking.clientEmail}
                        onChange={(e) => editingBooking
                          ? setEditingBooking({ ...editingBooking, clientEmail: e.target.value })
                          : setNewBooking({ ...newBooking, clientEmail: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.eventDate', 'Event Date')}
                    </label>
                    <input
                      type="date"
                      value={editingBooking?.eventDate || newBooking.eventDate}
                      onChange={(e) => editingBooking
                        ? setEditingBooking({ ...editingBooking, eventDate: e.target.value })
                        : setNewBooking({ ...newBooking, eventDate: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.venueBooking.startTime', 'Start Time')}
                      </label>
                      <input
                        type="time"
                        value={editingBooking?.startTime || newBooking.startTime}
                        onChange={(e) => editingBooking
                          ? setEditingBooking({ ...editingBooking, startTime: e.target.value })
                          : setNewBooking({ ...newBooking, startTime: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.venueBooking.endTime', 'End Time')}
                      </label>
                      <input
                        type="time"
                        value={editingBooking?.endTime || newBooking.endTime}
                        onChange={(e) => editingBooking
                          ? setEditingBooking({ ...editingBooking, endTime: e.target.value })
                          : setNewBooking({ ...newBooking, endTime: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.venueBooking.guestCount', 'Guest Count')}
                      </label>
                      <input
                        type="number"
                        value={editingBooking?.guestCount || newBooking.guestCount}
                        onChange={(e) => editingBooking
                          ? setEditingBooking({ ...editingBooking, guestCount: parseInt(e.target.value) || 0 })
                          : setNewBooking({ ...newBooking, guestCount: parseInt(e.target.value) || 0 })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.venueBooking.status', 'Status')}
                      </label>
                      <select
                        value={editingBooking?.status || newBooking.status}
                        onChange={(e) => editingBooking
                          ? setEditingBooking({ ...editingBooking, status: e.target.value as BookingStatus })
                          : setNewBooking({ ...newBooking, status: e.target.value as BookingStatus })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {BOOKING_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.venueBooking.specialRequests', 'Special Requests')}
                    </label>
                    <textarea
                      value={editingBooking?.specialRequests || newBooking.specialRequests}
                      onChange={(e) => editingBooking
                        ? setEditingBooking({ ...editingBooking, specialRequests: e.target.value })
                        : setNewBooking({ ...newBooking, specialRequests: e.target.value })
                      }
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowBookingForm(false);
                      setEditingBooking(null);
                      setIsPrefilled(false);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.venueBooking.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={editingBooking ? handleUpdateBooking : handleAddBooking}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {editingBooking ? t('tools.venueBooking.saveChanges2', 'Save Changes') : t('tools.venueBooking.createBooking', 'Create Booking')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default VenueBookingTool;
