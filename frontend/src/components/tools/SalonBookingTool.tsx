'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { UIConfig } from '../ContextualUI'
import { ToolPrefillData } from '../../services/toolPrefillService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportDropdown } from '../ui/ExportDropdown'
import { SyncStatus } from '../ui/SyncStatus'
import { useToolData } from '../../hooks/useToolData'
import type { ColumnConfig } from '../../lib/toolDataUtils'
import {
  Scissors,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertCircle,
  Repeat,
  UserX,
  ListOrdered,
  TrendingUp,
  Sparkles,
  Palette,
  Droplets,
  Heart,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  History,
  Bell,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useConfirmDialog } from '../ui/ConfirmDialog'

// Types
interface Service {
  id: string
  name: string
  category: 'hair' | 'nails' | 'spa' | 'makeup' | 'skincare'
  duration: number // in minutes
  price: number
  description: string
  icon: string
}

interface Stylist {
  id: string
  name: string
  avatar: string
  specialties: string[]
  rating: number
  reviewCount: number
  bio: string
  workingDays: number[] // 0 = Sunday, 6 = Saturday
  workingHours: { start: string; end: string }
  breakTime?: { start: string; end: string }
}

interface Client {
  id: string
  name: string
  phone: string
  email: string
  preferences: string
  notes: string
  visitCount: number
  noShowCount: number
  totalSpent: number
  lastVisit: string | null
  createdAt: string
}

interface Appointment {
  id: string
  clientId: string
  stylistId: string
  services: string[]
  date: string
  startTime: string
  endTime: string
  status: 'booked' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes: string
  totalPrice: number
  totalDuration: number
  isRecurring: boolean
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly'
  recurringEndDate?: string
  createdAt: string
}

interface WaitlistEntry {
  id: string
  clientId: string
  serviceIds: string[]
  preferredStylistId?: string
  preferredDates: string[]
  preferredTimeRange: { start: string; end: string }
  notes: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  notified: boolean
}

type TabType = 'calendar' | 'services' | 'staff' | 'clients' | 'waitlist' | 'analytics'

// Combined data structure for sync
interface SalonData {
  id: string
  type: 'client' | 'appointment' | 'waitlist'
  data: Client | Appointment | WaitlistEntry
}

// Column configuration for exports/sync
const SALON_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'data', header: 'Data', type: 'string' },
]

// Default Data
const defaultServices: Service[] = [
  { id: '1', name: 'Haircut', category: 'hair', duration: 30, price: 35, description: 'Professional haircut and styling', icon: 'scissors' },
  { id: '2', name: 'Hair Coloring', category: 'hair', duration: 90, price: 85, description: 'Full hair coloring service', icon: 'palette' },
  { id: '3', name: 'Highlights', category: 'hair', duration: 120, price: 120, description: 'Partial or full highlights', icon: 'sparkles' },
  { id: '4', name: 'Blowout', category: 'hair', duration: 45, price: 45, description: 'Wash and blowdry styling', icon: 'droplets' },
  { id: '5', name: 'Deep Conditioning', category: 'hair', duration: 30, price: 35, description: 'Intensive hair treatment', icon: 'heart' },
  { id: '6', name: 'Manicure', category: 'nails', duration: 30, price: 25, description: 'Classic manicure service', icon: 'sparkles' },
  { id: '7', name: 'Pedicure', category: 'nails', duration: 45, price: 40, description: 'Relaxing pedicure treatment', icon: 'sparkles' },
  { id: '8', name: 'Gel Nails', category: 'nails', duration: 60, price: 55, description: 'Long-lasting gel polish', icon: 'sparkles' },
  { id: '9', name: 'Facial', category: 'skincare', duration: 60, price: 75, description: 'Rejuvenating facial treatment', icon: 'sparkles' },
  { id: '10', name: 'Massage', category: 'spa', duration: 60, price: 90, description: 'Relaxing body massage', icon: 'heart' },
  { id: '11', name: 'Makeup Application', category: 'makeup', duration: 45, price: 65, description: 'Professional makeup service', icon: 'palette' },
  { id: '12', name: 'Bridal Package', category: 'makeup', duration: 180, price: 250, description: 'Complete bridal beauty package', icon: 'heart' },
]

const defaultStylists: Stylist[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    specialties: ['Hair Coloring', 'Highlights', 'Balayage'],
    rating: 4.9,
    reviewCount: 156,
    bio: 'Master colorist with 10+ years experience',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '09:00', end: '18:00' },
    breakTime: { start: '12:00', end: '13:00' }
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'MC',
    specialties: ['Haircuts', 'Fades', 'Beard Trimming'],
    rating: 4.8,
    reviewCount: 203,
    bio: 'Precision cutting specialist',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '10:00', end: '19:00' },
    breakTime: { start: '14:00', end: '15:00' }
  },
  {
    id: '3',
    name: 'Emma Davis',
    avatar: 'ED',
    specialties: ['Nails', 'Nail Art', 'Spa Treatments'],
    rating: 4.7,
    reviewCount: 89,
    bio: 'Nail artist and spa specialist',
    workingDays: [2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '17:00' }
  },
  {
    id: '4',
    name: 'Lisa Park',
    avatar: 'LP',
    specialties: ['Skincare', 'Facials', 'Makeup'],
    rating: 4.9,
    reviewCount: 127,
    bio: 'Licensed esthetician and makeup artist',
    workingDays: [1, 3, 4, 5, 6],
    workingHours: { start: '11:00', end: '20:00' },
    breakTime: { start: '15:00', end: '16:00' }
  },
]

// Helper Functions
const generateId = () => Math.random().toString(36).substring(2, 11)

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + minutes
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`
}

const getTimeSlots = (start: string, end: string, interval: number = 30): string[] => {
  const slots: string[] = []
  let current = start
  while (current < end) {
    slots.push(current)
    current = addMinutesToTime(current, interval)
  }
  return slots
}

const isTimeSlotAvailable = (
  stylistId: string,
  date: string,
  startTime: string,
  duration: number,
  appointments: Appointment[],
  excludeAppointmentId?: string
): boolean => {
  const endTime = addMinutesToTime(startTime, duration)
  const dayAppointments = appointments.filter(
    a => a.stylistId === stylistId &&
    a.date === date &&
    a.status !== 'cancelled' &&
    a.status !== 'no-show' &&
    a.id !== excludeAppointmentId
  )

  for (const apt of dayAppointments) {
    if (
      (startTime >= apt.startTime && startTime < apt.endTime) ||
      (endTime > apt.startTime && endTime <= apt.endTime) ||
      (startTime <= apt.startTime && endTime >= apt.endTime)
    ) {
      return false
    }
  }
  return true
}

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'booked': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'no-show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getCategoryIcon = (category: Service['category']) => {
  switch (category) {
    case 'hair': return <Scissors className="w-4 h-4" />
    case 'nails': return <Sparkles className="w-4 h-4" />
    case 'spa': return <Heart className="w-4 h-4" />
    case 'makeup': return <Palette className="w-4 h-4" />
    case 'skincare': return <Droplets className="w-4 h-4" />
    default: return <Scissors className="w-4 h-4" />
  }
}

const getCategoryColor = (category: Service['category']) => {
  switch (category) {
    case 'hair': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'nails': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    case 'spa': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'makeup': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
    case 'skincare': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

// Export Columns Configuration
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Appointment ID', type: 'string' },
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientPhone', header: 'Client Phone', type: 'string' },
  { key: 'clientEmail', header: 'Client Email', type: 'string' },
  { key: 'stylistName', header: 'Stylist', type: 'string' },
  { key: 'serviceNames', header: 'Services', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'totalDuration', header: 'Duration (min)', type: 'number' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'isRecurring', header: 'Recurring', type: 'boolean' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
]

// Props interface
interface SalonBookingToolProps {
  uiConfig?: UIConfig;
}

// Main Component
export function SalonBookingTool({
  uiConfig }: SalonBookingToolProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isPrefilled, setIsPrefilled] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const { confirm, ConfirmDialog } = useConfirmDialog()

  // Use the useToolData hook for backend persistence
  const {
    data: salonData,
    setData: setSalonData,
    addItem: addSalonItem,
    updateItem: updateSalonItem,
    deleteItem: deleteSalonItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<SalonData>('salon-booking', [], SALON_COLUMNS)

  // Derive clients, appointments, and waitlist from salonData
  const clients = useMemo(() =>
    salonData
      .filter(item => item.type === 'client')
      .map(item => item.data as Client),
    [salonData]
  )

  const appointments = useMemo(() =>
    salonData
      .filter(item => item.type === 'appointment')
      .map(item => item.data as Appointment),
    [salonData]
  )

  const waitlist = useMemo(() =>
    salonData
      .filter(item => item.type === 'waitlist')
      .map(item => item.data as WaitlistEntry),
    [salonData]
  )

  // Helper functions to update data
  const setClients = (updater: Client[] | ((prev: Client[]) => Client[])) => {
    setSalonData(prev => {
      const nonClients = prev.filter(item => item.type !== 'client')
      const currentClients = prev.filter(item => item.type === 'client').map(item => item.data as Client)
      const newClients = typeof updater === 'function' ? updater(currentClients) : updater
      const clientItems: SalonData[] = newClients.map(c => ({ id: c.id, type: 'client' as const, data: c }))
      return [...nonClients, ...clientItems]
    })
  }

  const setAppointments = (updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    setSalonData(prev => {
      const nonAppointments = prev.filter(item => item.type !== 'appointment')
      const currentAppointments = prev.filter(item => item.type === 'appointment').map(item => item.data as Appointment)
      const newAppointments = typeof updater === 'function' ? updater(currentAppointments) : updater
      const appointmentItems: SalonData[] = newAppointments.map(a => ({ id: a.id, type: 'appointment' as const, data: a }))
      return [...nonAppointments, ...appointmentItems]
    })
  }

  const setWaitlist = (updater: WaitlistEntry[] | ((prev: WaitlistEntry[]) => WaitlistEntry[])) => {
    setSalonData(prev => {
      const nonWaitlist = prev.filter(item => item.type !== 'waitlist')
      const currentWaitlist = prev.filter(item => item.type === 'waitlist').map(item => item.data as WaitlistEntry)
      const newWaitlist = typeof updater === 'function' ? updater(currentWaitlist) : updater
      const waitlistItems: SalonData[] = newWaitlist.map(w => ({ id: w.id, type: 'waitlist' as const, data: w }))
      return [...nonWaitlist, ...waitlistItems]
    })
  }

  // State
  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [services] = useState<Service[]>(defaultServices)
  const [stylists] = useState<Stylist[]>(defaultStylists)

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedStylistFilter, setSelectedStylistFilter] = useState<string>('all')

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [showAppointmentDetails, setShowAppointmentDetails] = useState<Appointment | null>(null)
  const [showClientHistory, setShowClientHistory] = useState<Client | null>(null)

  // Form States
  const [bookingForm, setBookingForm] = useState({
    clientId: '',
    stylistId: '',
    services: [] as string[],
    date: selectedDate,
    startTime: '09:00',
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    recurringEndDate: ''
  })

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferences: '',
    notes: ''
  })

  const [waitlistForm, setWaitlistForm] = useState({
    clientId: '',
    serviceIds: [] as string[],
    preferredStylistId: '',
    preferredDates: [] as string[],
    preferredTimeStart: '09:00',
    preferredTimeEnd: '18:00',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  // Search States
  const [clientSearch, setClientSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData
      let hasChanges = false

      if (params.clientName) {
        setClientForm(prev => ({ ...prev, name: params.clientName as string }))
        hasChanges = true
      }
      if (params.phone) {
        setClientForm(prev => ({ ...prev, phone: params.phone as string }))
        hasChanges = true
      }
      if (params.email) {
        setClientForm(prev => ({ ...prev, email: params.email as string }))
        hasChanges = true
      }
      if (params.date) {
        setSelectedDate(params.date as string)
        setBookingForm(prev => ({ ...prev, date: params.date as string }))
        hasChanges = true
      }
      if (params.time) {
        setBookingForm(prev => ({ ...prev, startTime: params.time as string }))
        hasChanges = true
      }

      if (hasChanges) {
        setIsPrefilled(true)
      }
    }
  }, [uiConfig?.params])

  // Computed Values
  const selectedServices = useMemo(() => {
    return services.filter(s => bookingForm.services.includes(s.id))
  }, [services, bookingForm.services])

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.duration, 0)
  }, [selectedServices])

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0)
  }, [selectedServices])

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const search = clientSearch.toLowerCase()
    return clients.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.phone.includes(search)
    )
  }, [clients, clientSearch])

  const filteredServices = useMemo(() => {
    if (serviceFilter === 'all') return services
    return services.filter(s => s.category === serviceFilter)
  }, [services, serviceFilter])

  const dayAppointments = useMemo(() => {
    let filtered = appointments.filter(a => a.date === selectedDate)
    if (selectedStylistFilter !== 'all') {
      filtered = filtered.filter(a => a.stylistId === selectedStylistFilter)
    }
    return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [appointments, selectedDate, selectedStylistFilter])

  const todayRevenue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments
      .filter(a => a.date === today && a.status === 'completed')
      .reduce((sum, a) => sum + a.totalPrice, 0)
  }, [appointments])

  const monthRevenue = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    return appointments
      .filter(a => a.date >= monthStart && a.date <= monthEnd && a.status === 'completed')
      .reduce((sum, a) => sum + a.totalPrice, 0)
  }, [appointments])

  const noShowRate = useMemo(() => {
    const total = appointments.filter(a => ['completed', 'no-show'].includes(a.status)).length
    const noShows = appointments.filter(a => a.status === 'no-show').length
    return total > 0 ? ((noShows / total) * 100).toFixed(1) : '0'
  }, [appointments])

  // Export Data Preparation
  const exportData = useMemo(() => {
    return appointments.map(apt => {
      const client = clients.find(c => c.id === apt.clientId)
      const stylist = stylists.find(s => s.id === apt.stylistId)
      const aptServices = apt.services.map(id => services.find(s => s.id === id)?.name || '').filter(Boolean)
      return {
        id: apt.id,
        clientName: client?.name || 'Unknown',
        clientPhone: client?.phone || '',
        clientEmail: client?.email || '',
        stylistName: stylist?.name || 'Unknown',
        serviceNames: aptServices.join(', '),
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        totalDuration: apt.totalDuration,
        totalPrice: apt.totalPrice,
        status: apt.status,
        notes: apt.notes,
        isRecurring: apt.isRecurring,
        createdAt: apt.createdAt,
      }
    })
  }, [appointments, clients, stylists, services])

  // Calendar Helpers
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }, [currentMonth])

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(a => a.date === dateStr && a.status !== 'cancelled')
  }

  // Event Handlers
  const handleAddClient = () => {
    if (!clientForm.name || !clientForm.phone) return

    const newClient: Client = {
      id: generateId(),
      name: clientForm.name,
      phone: clientForm.phone,
      email: clientForm.email,
      preferences: clientForm.preferences,
      notes: clientForm.notes,
      visitCount: 0,
      noShowCount: 0,
      totalSpent: 0,
      lastVisit: null,
      createdAt: new Date().toISOString()
    }

    setClients(prev => [...prev, newClient])
    setClientForm({ name: '', phone: '', email: '', preferences: '', notes: '' })
    setShowClientModal(false)
  }

  const handleBookAppointment = () => {
    if (!bookingForm.clientId || !bookingForm.stylistId || bookingForm.services.length === 0) return

    const endTime = addMinutesToTime(bookingForm.startTime, totalDuration)

    if (!isTimeSlotAvailable(bookingForm.stylistId, bookingForm.date, bookingForm.startTime, totalDuration, appointments)) {
      setValidationMessage('This time slot is not available. Please choose another time.')
      setTimeout(() => setValidationMessage(null), 3000)
      return
    }

    const newAppointment: Appointment = {
      id: generateId(),
      clientId: bookingForm.clientId,
      stylistId: bookingForm.stylistId,
      services: bookingForm.services,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime,
      status: 'booked',
      notes: bookingForm.notes,
      totalPrice,
      totalDuration,
      isRecurring: bookingForm.isRecurring,
      recurringFrequency: bookingForm.isRecurring ? bookingForm.recurringFrequency : undefined,
      recurringEndDate: bookingForm.isRecurring ? bookingForm.recurringEndDate : undefined,
      createdAt: new Date().toISOString()
    }

    const newAppointments = [newAppointment]

    // Create recurring appointments
    if (bookingForm.isRecurring && bookingForm.recurringEndDate) {
      let nextDate = new Date(bookingForm.date)
      const endDate = new Date(bookingForm.recurringEndDate)
      const interval = bookingForm.recurringFrequency === 'weekly' ? 7 :
                       bookingForm.recurringFrequency === 'biweekly' ? 14 : 30

      while (true) {
        nextDate.setDate(nextDate.getDate() + interval)
        if (nextDate > endDate) break

        const recurringAppointment: Appointment = {
          ...newAppointment,
          id: generateId(),
          date: nextDate.toISOString().split('T')[0]
        }
        newAppointments.push(recurringAppointment)
      }
    }

    setAppointments(prev => [...prev, ...newAppointments])
    setBookingForm({
      clientId: '',
      stylistId: '',
      services: [],
      date: selectedDate,
      startTime: '09:00',
      notes: '',
      isRecurring: false,
      recurringFrequency: 'monthly',
      recurringEndDate: ''
    })
    setShowBookingModal(false)
  }

  const handleUpdateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== appointmentId) return a

      const updated = { ...a, status }

      // Update client stats
      if (status === 'completed' || status === 'no-show') {
        setClients(prevClients => prevClients.map(c => {
          if (c.id !== a.clientId) return c
          return {
            ...c,
            visitCount: status === 'completed' ? c.visitCount + 1 : c.visitCount,
            noShowCount: status === 'no-show' ? c.noShowCount + 1 : c.noShowCount,
            totalSpent: status === 'completed' ? c.totalSpent + a.totalPrice : c.totalSpent,
            lastVisit: status === 'completed' ? a.date : c.lastVisit
          }
        }))
      }

      return updated
    }))
    setShowAppointmentDetails(null)
  }

  const handleAddToWaitlist = () => {
    if (!waitlistForm.clientId || waitlistForm.serviceIds.length === 0) return

    const newEntry: WaitlistEntry = {
      id: generateId(),
      clientId: waitlistForm.clientId,
      serviceIds: waitlistForm.serviceIds,
      preferredStylistId: waitlistForm.preferredStylistId || undefined,
      preferredDates: waitlistForm.preferredDates,
      preferredTimeRange: { start: waitlistForm.preferredTimeStart, end: waitlistForm.preferredTimeEnd },
      notes: waitlistForm.notes,
      priority: waitlistForm.priority,
      createdAt: new Date().toISOString(),
      notified: false
    }

    setWaitlist(prev => [...prev, newEntry])
    setWaitlistForm({
      clientId: '',
      serviceIds: [],
      preferredStylistId: '',
      preferredDates: [],
      preferredTimeStart: '09:00',
      preferredTimeEnd: '18:00',
      notes: '',
      priority: 'medium'
    })
    setShowWaitlistModal(false)
  }

  const handleRemoveFromWaitlist = (id: string) => {
    setWaitlist(prev => prev.filter(w => w.id !== id))
  }

  const handleDeleteAppointment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this appointment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return
    setAppointments(prev => prev.filter(a => a.id !== id))
    setShowAppointmentDetails(null)
  }

  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this client? All their appointments will be cancelled.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return
    setClients(prev => prev.filter(c => c.id !== id))
    setAppointments(prev => prev.map(a =>
      a.clientId === id ? { ...a, status: 'cancelled' } : a
    ))
  }

  // Get client/stylist by ID
  const getClient = (id: string) => clients.find(c => c.id === id)
  const getStylist = (id: string) => stylists.find(s => s.id === id)
  const getService = (id: string) => services.find(s => s.id === id)

  // Analytics Data
  const analyticsData = useMemo(() => {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentAppointments = appointments.filter(a => new Date(a.date) >= last30Days)

    const servicePopularity: Record<string, number> = {}
    const stylistRevenue: Record<string, number> = {}
    const dailyRevenue: Record<string, number> = {}

    recentAppointments.forEach(a => {
      if (a.status === 'completed') {
        a.services.forEach(sId => {
          servicePopularity[sId] = (servicePopularity[sId] || 0) + 1
        })
        stylistRevenue[a.stylistId] = (stylistRevenue[a.stylistId] || 0) + a.totalPrice
        dailyRevenue[a.date] = (dailyRevenue[a.date] || 0) + a.totalPrice
      }
    })

    const topServices = Object.entries(servicePopularity)
      .map(([id, count]) => ({ service: getService(id), count }))
      .filter(s => s.service)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const stylistStats = stylists.map(s => ({
      stylist: s,
      revenue: stylistRevenue[s.id] || 0,
      appointments: recentAppointments.filter(a => a.stylistId === s.id && a.status === 'completed').length
    })).sort((a, b) => b.revenue - a.revenue)

    return { topServices, stylistStats, dailyRevenue }
  }, [appointments, services, stylists])

  // Render Methods
  const renderCalendarView = () => (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStylistFilter}
            onChange={(e) => setSelectedStylistFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">All Stylists</option>
            {stylists.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setBookingForm(prev => ({ ...prev, date: selectedDate }))
              setShowBookingModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Booking</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24" />
              }

              const dateStr = day.toISOString().split('T')[0]
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              const isSelected = dateStr === selectedDate
              const dayAppts = getAppointmentsForDate(day)

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 sm:h-24 p-1 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                      : ''
                  }`}>
                    {day.getDate()}
                  </div>
                  {dayAppts.length > 0 && (
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 2).map(a => (
                        <div
                          key={a.id}
                          className={`text-xs truncate px-1 py-0.5 rounded ${getStatusColor(a.status)}`}
                        >
                          {formatTime(a.startTime)}
                        </div>
                      ))}
                      {dayAppts.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                          +{dayAppts.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{formatDate(selectedDate)}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {dayAppointments.length} appointments
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.salonBooking.noAppointmentsScheduledForThis', 'No appointments scheduled for this day')}</p>
              <button
                onClick={() => {
                  setBookingForm(prev => ({ ...prev, date: selectedDate }))
                  setShowBookingModal(true)
                }}
                className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
              >
                {t('tools.salonBooking.bookAnAppointment', 'Book an appointment')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map(apt => {
                const client = getClient(apt.clientId)
                const stylist = getStylist(apt.stylistId)
                const aptServices = apt.services.map(id => getService(id)).filter(Boolean)

                return (
                  <div
                    key={apt.id}
                    onClick={() => setShowAppointmentDetails(apt)}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors"
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-semibold">{formatTime(apt.startTime)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {apt.totalDuration}m
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{client?.name || 'Unknown'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.isRecurring && (
                          <Repeat className="w-3 h-3 text-purple-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {aptServices.map(s => s?.name).join(' + ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        with {stylist?.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(apt.totalPrice)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderServicesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('tools.salonBooking.serviceMenu', 'Service Menu')}</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">{t('tools.salonBooking.allCategories', 'All Categories')}</option>
            <option value="hair">{t('tools.salonBooking.hair', 'Hair')}</option>
            <option value="nails">{t('tools.salonBooking.nails', 'Nails')}</option>
            <option value="spa">{t('tools.salonBooking.spa', 'Spa')}</option>
            <option value="makeup">{t('tools.salonBooking.makeup', 'Makeup')}</option>
            <option value="skincare">{t('tools.salonBooking.skincare', 'Skincare')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(service.category)}`}>
                  {getCategoryIcon(service.category)}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(service.category)}`}>
                  {service.category}
                </span>
              </div>

              <h3 className="font-semibold mb-1">{service.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {service.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {service.duration} min
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(service.price)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Combinations Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {t('tools.salonBooking.popularCombinations', 'Popular Combinations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { services: ['1', '2'], name: 'Haircut + Color', savings: 10 },
              { services: ['6', '7'], name: 'Mani + Pedi', savings: 5 },
              { services: ['9', '10'], name: 'Facial + Massage', savings: 15 },
              { services: ['1', '4'], name: 'Haircut + Blowout', savings: 5 },
            ].map((combo, idx) => {
              const comboServices = combo.services.map(id => getService(id)).filter(Boolean)
              const totalTime = comboServices.reduce((sum, s) => sum + (s?.duration || 0), 0)
              const totalCost = comboServices.reduce((sum, s) => sum + (s?.price || 0), 0)

              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{combo.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {totalTime} min total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(totalCost - combo.savings)}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Save {formatCurrency(combo.savings)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStaffView = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('tools.salonBooking.ourTeam', 'Our Team')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stylists.map(stylist => {
          const stylistAppts = appointments.filter(
            a => a.stylistId === stylist.id &&
            a.date === new Date().toISOString().split('T')[0] &&
            a.status !== 'cancelled'
          )

          return (
            <Card key={stylist.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                    {stylist.avatar}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{stylist.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      {stylist.rating} ({stylist.reviewCount} reviews)
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {stylist.bio}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {stylist.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(stylist.workingHours.start)} - {formatTime(stylist.workingHours.end)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {stylist.workingDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-sm font-medium mb-2">{t('tools.salonBooking.todaySSchedule', 'Today\'s Schedule')}</div>
                  {stylistAppts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.salonBooking.noAppointmentsToday', 'No appointments today')}</p>
                  ) : (
                    <div className="space-y-1">
                      {stylistAppts.slice(0, 3).map(apt => {
                        const client = getClient(apt.clientId)
                        return (
                          <div key={apt.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatTime(apt.startTime)} - {client?.name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                          </div>
                        )
                      })}
                      {stylistAppts.length > 3 && (
                        <p className="text-xs text-gray-500">+{stylistAppts.length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderClientsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">{t('tools.salonBooking.clients', 'Clients')}</h2>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.salonBooking.searchClients', 'Search clients...')}
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('tools.salonBooking.addClient', 'Add Client')}</span>
          </button>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-medium mb-1">{t('tools.salonBooking.noClientsYet', 'No clients yet')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('tools.salonBooking.addYourFirstClientTo', 'Add your first client to start booking appointments')}
            </p>
            <button
              onClick={() => setShowClientModal(true)}
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              {t('tools.salonBooking.addAClient', 'Add a client')}
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowClientHistory(client)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title={t('tools.salonBooking.viewHistory', 'View history')}
                    >
                      <History className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <div className="font-semibold">{client.visitCount}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('tools.salonBooking.visits', 'Visits')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(client.totalSpent)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('tools.salonBooking.spent', 'Spent')}</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${client.noShowCount > 0 ? 'text-orange-500' : ''}`}>
                        {client.noShowCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('tools.salonBooking.noShows', 'No-shows')}</div>
                    </div>
                  </div>

                  {client.preferences && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tools.salonBooking.preferences', 'Preferences:')}</div>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{client.preferences}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderWaitlistView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('tools.salonBooking.waitlist', 'Waitlist')}</h2>
        <button
          onClick={() => setShowWaitlistModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.salonBooking.addToWaitlist2', 'Add to Waitlist')}
        </button>
      </div>

      {waitlist.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListOrdered className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-medium mb-1">{t('tools.salonBooking.waitlistIsEmpty', 'Waitlist is empty')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.salonBooking.addClientsWhoWantTo', 'Add clients who want to be notified when slots open up')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {waitlist.map(entry => {
            const client = getClient(entry.clientId)
            const entryServices = entry.serviceIds.map(id => getService(id)).filter(Boolean)
            const preferredStylist = entry.preferredStylistId ? getStylist(entry.preferredStylistId) : null

            return (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        entry.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : entry.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {entry.priority}
                      </div>

                      <div>
                        <h3 className="font-semibold">{client?.name || 'Unknown'}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {entryServices.map(s => s?.name).join(', ')}
                        </div>
                        {preferredStylist && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Prefers: {preferredStylist.name}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Time: {formatTime(entry.preferredTimeRange.start)} - {formatTime(entry.preferredTimeRange.end)}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Note: {entry.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.notified && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Notified
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setBookingForm({
                            clientId: entry.clientId,
                            stylistId: entry.preferredStylistId || '',
                            services: entry.serviceIds,
                            date: entry.preferredDates[0] || selectedDate,
                            startTime: entry.preferredTimeRange.start,
                            notes: entry.notes,
                            isRecurring: false,
                            recurringFrequency: 'monthly',
                            recurringEndDate: ''
                          })
                          setShowBookingModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={t('tools.salonBooking.bookAppointment2', 'Book appointment')}
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWaitlist(entry.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                        title={t('tools.salonBooking.removeFromWaitlist', 'Remove from waitlist')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('tools.salonBooking.analyticsReports', 'Analytics & Reports')}</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.salonBooking.today', 'Today')}</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(todayRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.salonBooking.thisMonth', 'This Month')}</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(monthRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.salonBooking.totalClients', 'Total Clients')}</p>
                <p className="text-xl font-bold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <UserX className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.salonBooking.noShowRate', 'No-show Rate')}</p>
                <p className="text-xl font-bold">{noShowRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('tools.salonBooking.topServicesLast30Days', 'Top Services (Last 30 Days)')}</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData.topServices.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {t('tools.salonBooking.noCompletedAppointmentsYet', 'No completed appointments yet')}
            </p>
          ) : (
            <div className="space-y-3">
              {analyticsData.topServices.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.service?.name}</div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(item.count / analyticsData.topServices[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.count} bookings
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stylist Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('tools.salonBooking.stylistPerformanceLast30Days', 'Stylist Performance (Last 30 Days)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.stylistStats.map(item => (
              <div key={item.stylist.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                  {item.stylist.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.stylist.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.appointments} appointments completed
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(item.revenue)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Modals
  const renderBookingModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('tools.salonBooking.newAppointment', 'New Appointment')}</h2>
          <button
            onClick={() => setShowBookingModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.client', 'Client *')}</label>
            <select
              value={bookingForm.clientId}
              onChange={(e) => setBookingForm(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="">{t('tools.salonBooking.selectAClient', 'Select a client')}</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
              ))}
            </select>
            <button
              onClick={() => setShowClientModal(true)}
              className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              {t('tools.salonBooking.addNewClient2', '+ Add new client')}
            </button>
          </div>

          {/* Stylist Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.stylist', 'Stylist *')}</label>
            <div className="grid grid-cols-2 gap-3">
              {stylists.map(s => (
                <button
                  key={s.id}
                  onClick={() => setBookingForm(prev => ({ ...prev, stylistId: s.id }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    bookingForm.stylistId === s.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                      {s.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.specialties[0]}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Services Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.services', 'Services *')}</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {services.map(s => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    bookingForm.services.includes(s.id)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={bookingForm.services.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBookingForm(prev => ({ ...prev, services: [...prev.services, s.id] }))
                      } else {
                        setBookingForm(prev => ({ ...prev, services: prev.services.filter(id => id !== s.id) }))
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.duration}m - {formatCurrency(s.price)}</div>
                  </div>
                  {bookingForm.services.includes(s.id) && (
                    <Check className="w-4 h-4 text-purple-600" />
                  )}
                </label>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>{t('tools.salonBooking.totalDuration', 'Total Duration:')}</span>
                  <span className="font-medium">{totalDuration} minutes</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>{t('tools.salonBooking.totalPrice', 'Total Price:')}</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.date', 'Date *')}</label>
              <input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.startTime', 'Start Time *')}</label>
              <select
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                {getTimeSlots('08:00', '20:00', 30).map(slot => (
                  <option key={slot} value={slot}>{formatTime(slot)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bookingForm.isRecurring}
                onChange={(e) => setBookingForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium">{t('tools.salonBooking.recurringAppointment', 'Recurring appointment')}</span>
            </label>

            {bookingForm.isRecurring && (
              <div className="mt-3 grid grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('tools.salonBooking.frequency', 'Frequency')}
                  </label>
                  <select
                    value={bookingForm.recurringFrequency}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      recurringFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly'
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="weekly">{t('tools.salonBooking.weekly', 'Weekly')}</option>
                    <option value="biweekly">{t('tools.salonBooking.biWeekly', 'Bi-weekly')}</option>
                    <option value="monthly">{t('tools.salonBooking.monthly', 'Monthly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('tools.salonBooking.endDate', 'End Date')}
                  </label>
                  <input
                    type="date"
                    value={bookingForm.recurringEndDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                    min={bookingForm.date}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.notes', 'Notes')}</label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder={t('tools.salonBooking.anySpecialRequestsOrNotes', 'Any special requests or notes...')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => setShowBookingModal(false)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('tools.salonBooking.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleBookAppointment}
            disabled={!bookingForm.clientId || !bookingForm.stylistId || bookingForm.services.length === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tools.salonBooking.bookAppointment', 'Book Appointment')}
          </button>
        </div>
      </div>
    </div>
  )

  const renderClientModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('tools.salonBooking.addNewClient', 'Add New Client')}</h2>
          <button
            onClick={() => setShowClientModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.name', 'Name *')}</label>
            <input
              type="text"
              value={clientForm.name}
              onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('tools.salonBooking.fullName', 'Full name')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.phone', 'Phone *')}</label>
            <input
              type="tel"
              value={clientForm.phone}
              onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder={t('tools.salonBooking.phoneNumber', 'Phone number')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.email', 'Email')}</label>
            <input
              type="email"
              value={clientForm.email}
              onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder={t('tools.salonBooking.emailAddress', 'Email address')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.preferences2', 'Preferences')}</label>
            <textarea
              value={clientForm.preferences}
              onChange={(e) => setClientForm(prev => ({ ...prev, preferences: e.target.value }))}
              rows={2}
              placeholder={t('tools.salonBooking.hairTypeAllergiesStylePreferences', 'Hair type, allergies, style preferences...')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.notes2', 'Notes')}</label>
            <textarea
              value={clientForm.notes}
              onChange={(e) => setClientForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder={t('tools.salonBooking.anyAdditionalNotes', 'Any additional notes...')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => setShowClientModal(false)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('tools.salonBooking.cancel2', 'Cancel')}
          </button>
          <button
            onClick={handleAddClient}
            disabled={!clientForm.name || !clientForm.phone}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tools.salonBooking.addClient2', 'Add Client')}
          </button>
        </div>
      </div>
    </div>
  )

  const renderWaitlistModalContent = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('tools.salonBooking.addToWaitlist', 'Add to Waitlist')}</h2>
          <button
            onClick={() => setShowWaitlistModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.client2', 'Client *')}</label>
            <select
              value={waitlistForm.clientId}
              onChange={(e) => setWaitlistForm(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="">{t('tools.salonBooking.selectAClient2', 'Select a client')}</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.services2', 'Services *')}</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {services.map(s => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waitlistForm.serviceIds.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWaitlistForm(prev => ({ ...prev, serviceIds: [...prev.serviceIds, s.id] }))
                      } else {
                        setWaitlistForm(prev => ({ ...prev, serviceIds: prev.serviceIds.filter(id => id !== s.id) }))
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600"
                  />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.preferredStylist', 'Preferred Stylist')}</label>
            <select
              value={waitlistForm.preferredStylistId}
              onChange={(e) => setWaitlistForm(prev => ({ ...prev, preferredStylistId: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="">{t('tools.salonBooking.noPreference', 'No preference')}</option>
              {stylists.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.preferredTimeFrom', 'Preferred Time (From)')}</label>
              <select
                value={waitlistForm.preferredTimeStart}
                onChange={(e) => setWaitlistForm(prev => ({ ...prev, preferredTimeStart: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {getTimeSlots('08:00', '20:00', 30).map(slot => (
                  <option key={slot} value={slot}>{formatTime(slot)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.preferredTimeTo', 'Preferred Time (To)')}</label>
              <select
                value={waitlistForm.preferredTimeEnd}
                onChange={(e) => setWaitlistForm(prev => ({ ...prev, preferredTimeEnd: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              >
                {getTimeSlots('08:00', '20:00', 30).map(slot => (
                  <option key={slot} value={slot}>{formatTime(slot)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.priority', 'Priority')}</label>
            <select
              value={waitlistForm.priority}
              onChange={(e) => setWaitlistForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="low">{t('tools.salonBooking.low', 'Low')}</option>
              <option value="medium">{t('tools.salonBooking.medium', 'Medium')}</option>
              <option value="high">{t('tools.salonBooking.high', 'High')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('tools.salonBooking.notes3', 'Notes')}</label>
            <textarea
              value={waitlistForm.notes}
              onChange={(e) => setWaitlistForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder={t('tools.salonBooking.anyAdditionalNotes2', 'Any additional notes...')}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => setShowWaitlistModal(false)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('tools.salonBooking.cancel3', 'Cancel')}
          </button>
          <button
            onClick={handleAddToWaitlist}
            disabled={!waitlistForm.clientId || waitlistForm.serviceIds.length === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tools.salonBooking.addToWaitlist3', 'Add to Waitlist')}
          </button>
        </div>
      </div>
    </div>
  )

  const renderAppointmentDetailsModal = () => {
    if (!showAppointmentDetails) return null

    const apt = showAppointmentDetails
    const client = getClient(apt.clientId)
    const stylist = getStylist(apt.stylistId)
    const aptServices = apt.services.map(id => getService(id)).filter(Boolean)

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('tools.salonBooking.appointmentDetails', 'Appointment Details')}</h2>
            <button
              onClick={() => setShowAppointmentDetails(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                {apt.status}
              </span>
              {apt.isRecurring && (
                <span className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                  <Repeat className="w-4 h-4" />
                  {apt.recurringFrequency}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{client?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{client?.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Scissors className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{stylist?.name}</div>
                  <div className="text-sm text-gray-500">{t('tools.salonBooking.stylist2', 'Stylist')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{formatDate(apt.date)}</div>
                  <div className="text-sm text-gray-500">
                    {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium mb-2">{t('tools.salonBooking.services3', 'Services')}</div>
              <div className="space-y-2">
                {aptServices.map(s => (
                  <div key={s?.id} className="flex items-center justify-between text-sm">
                    <span>{s?.name}</span>
                    <span className="text-gray-500">{formatCurrency(s?.price || 0)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 font-semibold">
                <span>{t('tools.salonBooking.total', 'Total')}</span>
                <span className="text-green-600 dark:text-green-400">{formatCurrency(apt.totalPrice)}</span>
              </div>
            </div>

            {apt.notes && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium mb-1">{t('tools.salonBooking.notes4', 'Notes')}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{apt.notes}</p>
              </div>
            )}

            {/* Status Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium mb-2">{t('tools.salonBooking.updateStatus', 'Update Status')}</div>
              <div className="flex flex-wrap gap-2">
                {apt.status === 'booked' && (
                  <button
                    onClick={() => handleUpdateAppointmentStatus(apt.id, 'confirmed')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                  >
                    {t('tools.salonBooking.confirm', 'Confirm')}
                  </button>
                )}
                {['booked', 'confirmed'].includes(apt.status) && (
                  <button
                    onClick={() => handleUpdateAppointmentStatus(apt.id, 'in-progress')}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                  >
                    {t('tools.salonBooking.start', 'Start')}
                  </button>
                )}
                {apt.status === 'in-progress' && (
                  <button
                    onClick={() => handleUpdateAppointmentStatus(apt.id, 'completed')}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('tools.salonBooking.complete', 'Complete')}
                  </button>
                )}
                {['booked', 'confirmed'].includes(apt.status) && (
                  <>
                    <button
                      onClick={() => handleUpdateAppointmentStatus(apt.id, 'no-show')}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50"
                    >
                      {t('tools.salonBooking.noShow', 'No-show')}
                    </button>
                    <button
                      onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelled')}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      {t('tools.salonBooking.cancel4', 'Cancel')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={() => handleDeleteAppointment(apt.id)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={() => setShowAppointmentDetails(null)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('tools.salonBooking.close', 'Close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderClientHistoryModal = () => {
    if (!showClientHistory) return null

    const client = showClientHistory
    const clientAppointments = appointments
      .filter(a => a.clientId === client.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('tools.salonBooking.clientHistory', 'Client History')}</h2>
            <button
              onClick={() => setShowClientHistory(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {/* Client Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.phone}</p>
                {client.email && (
                  <p className="text-sm text-gray-500">{client.email}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold">{client.visitCount}</div>
                <div className="text-xs text-gray-500">{t('tools.salonBooking.visits2', 'Visits')}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(client.totalSpent)}</div>
                <div className="text-xs text-gray-500">{t('tools.salonBooking.totalSpent', 'Total Spent')}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className={`text-2xl font-bold ${client.noShowCount > 0 ? 'text-orange-500' : ''}`}>
                  {client.noShowCount}
                </div>
                <div className="text-xs text-gray-500">{t('tools.salonBooking.noShows2', 'No-shows')}</div>
              </div>
            </div>

            {client.preferences && (
              <div className="mb-6">
                <div className="text-sm font-medium mb-1">{t('tools.salonBooking.preferences3', 'Preferences')}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {client.preferences}
                </p>
              </div>
            )}

            {/* Appointment History */}
            <div>
              <div className="text-sm font-medium mb-3">{t('tools.salonBooking.appointmentHistory', 'Appointment History')}</div>
              {clientAppointments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">{t('tools.salonBooking.noAppointmentsYet', 'No appointments yet')}</p>
              ) : (
                <div className="space-y-3">
                  {clientAppointments.map(apt => {
                    const stylist = getStylist(apt.stylistId)
                    const aptServices = apt.services.map(id => getService(id)).filter(Boolean)

                    return (
                      <div key={apt.id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{formatDate(apt.date)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {aptServices.map(s => s?.name).join(', ')}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-gray-500">with {stylist?.name}</span>
                          <span className="font-medium text-green-600">{formatCurrency(apt.totalPrice)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={() => setShowClientHistory(null)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('tools.salonBooking.close2', 'Close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.salonBooking.loadingSalonData', 'Loading salon data...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t('tools.salonBooking.salonBooking', 'Salon Booking')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.salonBooking.appointmentManagement', 'Appointment Management')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Today: {formatCurrency(todayRevenue)}
                </div>
              </div>

              <WidgetEmbedButton toolSlug="salon-booking" toolName="Salon Booking" />


              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />

              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'salon-appointments' })}
                onExportExcel={() => exportExcel({ filename: 'salon-appointments' })}
                onExportJSON={() => exportJSON({ filename: 'salon-appointments' })}
                onExportPDF={() => exportPDF({ filename: 'salon-appointments', title: 'Salon Appointments Report' })}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onPrint={() => print('Salon Appointments')}
                onImportCSV={async (file) => { await importCSV(file) }}
                onImportJSON={async (file) => { await importJSON(file) }}
                disabled={appointments.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />

              <button
                onClick={() => setShowBookingModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tools.salonBooking.bookNow', 'Book Now')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'services', label: 'Services', icon: Scissors },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'clients', label: 'Clients', icon: User },
              { id: 'waitlist', label: 'Waitlist', icon: ListOrdered },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'waitlist' && waitlist.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                    {waitlist.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'calendar' && renderCalendarView()}
        {activeTab === 'services' && renderServicesView()}
        {activeTab === 'staff' && renderStaffView()}
        {activeTab === 'clients' && renderClientsView()}
        {activeTab === 'waitlist' && renderWaitlistView()}
        {activeTab === 'analytics' && renderAnalyticsView()}
      </main>

      {/* Modals */}
      {showBookingModal && renderBookingModal()}
      {showClientModal && renderClientModal()}
      {showWaitlistModal && renderWaitlistModalContent()}
      {showAppointmentDetails && renderAppointmentDetailsModal()}
      {showClientHistory && renderClientHistoryModal()}
    </div>
  )
}

export default SalonBookingTool
