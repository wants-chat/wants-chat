'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { UIConfig } from '../ContextualUI'
import { ToolPrefillData } from '../../services/toolPrefillService'
import { ExportDropdown } from '../ui/ExportDropdown'
import { SyncStatus } from '../ui/SyncStatus'
import { useConfirmDialog } from '../ui/ConfirmDialog'
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton'
import { useToolData } from '../../hooks/useToolData'
import type { ColumnConfig } from '../../lib/toolDataUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Store,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  MessageSquare,
  Heart,
  BarChart3,
  Users,
  Camera,
  Music,
  Flower2,
  Lightbulb,
  Package,
  UtensilsCrossed,
  Check,
  X,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

// Types
type VendorCategory = 'catering' | 'photography' | 'dj_music' | 'florist' | 'rentals' | 'lighting'

type ContractStatus = 'pending' | 'sent' | 'negotiating' | 'signed' | 'expired' | 'cancelled'

type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial'

type VerificationStatus = 'verified' | 'pending' | 'expired' | 'not_submitted'

interface PaymentSchedule {
  id: string
  type: 'deposit' | 'milestone' | 'balance' | 'final'
  amount: number
  dueDate: string
  status: PaymentStatus
  paidDate?: string
  notes?: string
}

interface Review {
  id: string
  eventName: string
  eventDate: string
  rating: number
  comment: string
  createdAt: string
}

interface CommunicationLog {
  id: string
  date: string
  type: 'email' | 'phone' | 'meeting' | 'text'
  subject: string
  notes: string
  followUpDate?: string
}

interface AvailabilitySlot {
  date: string
  available: boolean
  notes?: string
}

interface Vendor {
  id: string
  name: string
  category: VendorCategory
  email: string
  phone: string
  website?: string
  address?: string
  services: string[]
  priceRange: {
    min: number
    max: number
  }
  rating: number
  reviewCount: number
  reviews: Review[]
  contractStatus: ContractStatus
  contractSignedDate?: string
  contractExpiryDate?: string
  paymentSchedule: PaymentSchedule[]
  insuranceVerification: VerificationStatus
  insuranceExpiryDate?: string
  licenseVerification: VerificationStatus
  licenseExpiryDate?: string
  availability: AvailabilitySlot[]
  communicationLog: CommunicationLog[]
  isPreferred: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

interface BudgetAllocation {
  category: VendorCategory
  allocated: number
  spent: number
}

interface EventVendorManagerState {
  vendors: Vendor[]
  budgetAllocations: BudgetAllocation[]
  totalBudget: number
}

const BUDGET_STORAGE_KEY = 'event-vendor-manager-budget'

const CATEGORY_INFO: Record<VendorCategory, { label: string; icon: React.ElementType; color: string }> = {
  catering: { label: 'Catering', icon: UtensilsCrossed, color: 'text-orange-500' },
  photography: { label: 'Photography', icon: Camera, color: 'text-blue-500' },
  dj_music: { label: 'DJ/Music', icon: Music, color: 'text-purple-500' },
  florist: { label: 'Florist', icon: Flower2, color: 'text-pink-500' },
  rentals: { label: 'Rentals', icon: Package, color: 'text-green-500' },
  lighting: { label: 'Lighting', icon: Lightbulb, color: 'text-yellow-500' }
}

const CONTRACT_STATUS_INFO: Record<ContractStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  sent: { label: 'Sent', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  negotiating: { label: 'Negotiating', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  signed: { label: 'Signed', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  expired: { label: 'Expired', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' }
}

const PAYMENT_STATUS_INFO: Record<PaymentStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', icon: Clock },
  paid: { label: 'Paid', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'text-red-600 dark:text-red-400', icon: AlertCircle },
  partial: { label: 'Partial', color: 'text-blue-600 dark:text-blue-400', icon: AlertTriangle }
}

const VERIFICATION_STATUS_INFO: Record<VerificationStatus, { label: string; color: string; icon: React.ElementType }> = {
  verified: { label: 'Verified', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', icon: Clock },
  expired: { label: 'Expired', color: 'text-red-600 dark:text-red-400', icon: XCircle },
  not_submitted: { label: 'Not Submitted', color: 'text-gray-600 dark:text-gray-400', icon: AlertCircle }
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Column configuration for export
const VENDOR_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Vendor Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string', format: (v) => CATEGORY_INFO[v as VendorCategory]?.label || v },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'website', header: 'Website', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'services', header: 'Services', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : v },
  { key: 'priceRange', header: 'Price Range', type: 'string', format: (v) => v ? `$${v.min} - $${v.max}` : '-' },
  { key: 'rating', header: 'Rating', type: 'number', format: (v) => v ? `${v}/5` : 'N/A' },
  { key: 'reviewCount', header: 'Reviews', type: 'number' },
  { key: 'contractStatus', header: 'Contract Status', type: 'string', format: (v) => CONTRACT_STATUS_INFO[v as ContractStatus]?.label || v },
  { key: 'insuranceVerification', header: 'Insurance', type: 'string', format: (v) => VERIFICATION_STATUS_INFO[v as VerificationStatus]?.label || v },
  { key: 'licenseVerification', header: 'License', type: 'string', format: (v) => VERIFICATION_STATUS_INFO[v as VerificationStatus]?.label || v },
  { key: 'isPreferred', header: 'Preferred', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
]

interface BudgetState {
  budgetAllocations: BudgetAllocation[]
  totalBudget: number
}

const getInitialBudgetState = (): BudgetState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved budget data:', e)
      }
    }
  }
  return {
    budgetAllocations: Object.keys(CATEGORY_INFO).map(cat => ({
      category: cat as VendorCategory,
      allocated: 0,
      spent: 0
    })),
    totalBudget: 0
  }
}

interface EventVendorManagerToolProps {
  uiConfig?: UIConfig;
}

export function EventVendorManagerTool({ uiConfig }: EventVendorManagerToolProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [isPrefilled, setIsPrefilled] = useState(false)

  // Use the useToolData hook for vendors with backend sync
  const {
    data: vendors,
    setData: setVendors,
    addItem: addVendor,
    updateItem: updateVendorItem,
    deleteItem: deleteVendorItem,
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
  } = useToolData<Vendor>('event-vendor-manager', [], VENDOR_COLUMNS)

  // Budget state is kept separate (localStorage only)
  const [budgetState, setBudgetState] = useState<BudgetState>(getInitialBudgetState)

  const [activeTab, setActiveTab] = useState<'vendors' | 'budget' | 'compare' | 'preferred' | 'performance'>('vendors')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'all'>('all')
  const [contractFilter, setContractFilter] = useState<ContractStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'price' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [compareVendors, setCompareVendors] = useState<string[]>([])
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  // Form states
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'catering' as VendorCategory,
    email: '',
    phone: '',
    website: '',
    address: '',
    services: '',
    priceMin: '',
    priceMax: '',
    notes: ''
  })

  const [communicationForm, setCommunicationForm] = useState({
    type: 'email' as 'email' | 'phone' | 'meeting' | 'text',
    subject: '',
    notes: '',
    followUpDate: ''
  })

  const [reviewForm, setReviewForm] = useState({
    eventName: '',
    eventDate: '',
    rating: 5,
    comment: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    type: 'deposit' as 'deposit' | 'milestone' | 'balance' | 'final',
    amount: '',
    dueDate: '',
    notes: ''
  })

  // Save budget state to localStorage
  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetState))
  }, [budgetState])

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData
      let hasChanges = false

      if (params.vendorName) {
        setVendorForm(prev => ({ ...prev, name: params.vendorName as string }))
        hasChanges = true
      }
      if (params.category) {
        hasChanges = true
      }

      if (hasChanges) {
        setIsPrefilled(true)
      }
    }
  }, [uiConfig?.params])

  // Filtered and sorted vendors
  const filteredVendors = useMemo(() => {
    let result = [...vendors]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.services.some(s => s.toLowerCase().includes(query)) ||
        v.email.toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter(v => v.category === categoryFilter)
    }

    if (contractFilter !== 'all') {
      result = result.filter(v => v.contractStatus === contractFilter)
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rating':
          comparison = b.rating - a.rating
          break
        case 'price':
          comparison = a.priceRange.min - b.priceRange.min
          break
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [vendors, searchQuery, categoryFilter, contractFilter, sortBy, sortOrder])

  // Preferred vendors
  const preferredVendors = useMemo(() => {
    return vendors.filter(v => v.isPreferred)
  }, [vendors])

  // Vendors for comparison
  const vendorsToCompare = useMemo(() => {
    return vendors.filter(v => compareVendors.includes(v.id))
  }, [vendors, compareVendors])

  // Budget statistics
  const budgetStats = useMemo(() => {
    const totalAllocated = budgetState.budgetAllocations.reduce((sum, b) => sum + b.allocated, 0)
    const totalSpent = budgetState.budgetAllocations.reduce((sum, b) => sum + b.spent, 0)
    const remaining = budgetState.totalBudget - totalSpent

    return {
      totalBudget: budgetState.totalBudget,
      totalAllocated,
      totalSpent,
      remaining,
      unallocated: budgetState.totalBudget - totalAllocated
    }
  }, [budgetState.budgetAllocations, budgetState.totalBudget])

  // Performance metrics per vendor
  const getVendorPerformance = (vendor: Vendor) => {
    const avgRating = vendor.rating
    const completedPayments = vendor.paymentSchedule.filter(p => p.status === 'paid').length
    const totalPayments = vendor.paymentSchedule.length
    const paymentScore = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0
    const responseRate = vendor.communicationLog.length > 0 ? 85 + Math.random() * 15 : 0

    return {
      rating: avgRating,
      paymentScore,
      responseRate: Math.round(responseRate),
      totalEvents: vendor.reviews.length,
      isVerified: vendor.insuranceVerification === 'verified' && vendor.licenseVerification === 'verified'
    }
  }

  // Handlers
  const handleAddVendor = () => {
    const newVendor: Vendor = {
      id: generateId(),
      name: vendorForm.name,
      category: vendorForm.category,
      email: vendorForm.email,
      phone: vendorForm.phone,
      website: vendorForm.website || undefined,
      address: vendorForm.address || undefined,
      services: vendorForm.services.split(',').map(s => s.trim()).filter(Boolean),
      priceRange: {
        min: parseFloat(vendorForm.priceMin) || 0,
        max: parseFloat(vendorForm.priceMax) || 0
      },
      rating: 0,
      reviewCount: 0,
      reviews: [],
      contractStatus: 'pending',
      paymentSchedule: [],
      insuranceVerification: 'not_submitted',
      licenseVerification: 'not_submitted',
      availability: [],
      communicationLog: [],
      isPreferred: false,
      notes: vendorForm.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addVendor(newVendor)

    resetVendorForm()
    setShowAddVendor(false)
  }

  const handleUpdateVendor = () => {
    if (!editingVendor) return

    updateVendorItem(editingVendor.id, {
      name: vendorForm.name,
      category: vendorForm.category,
      email: vendorForm.email,
      phone: vendorForm.phone,
      website: vendorForm.website || undefined,
      address: vendorForm.address || undefined,
      services: vendorForm.services.split(',').map(s => s.trim()).filter(Boolean),
      priceRange: {
        min: parseFloat(vendorForm.priceMin) || 0,
        max: parseFloat(vendorForm.priceMax) || 0
      },
      notes: vendorForm.notes || undefined,
      updatedAt: new Date().toISOString()
    })

    resetVendorForm()
    setEditingVendor(null)
  }

  const handleDeleteVendor = async (vendorId: string) => {
    const confirmed = await confirm({
      title: 'Delete Vendor',
      message: 'Are you sure you want to delete this vendor?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })
    if (confirmed) {
      deleteVendorItem(vendorId)
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor(null)
      }
    }
  }

  const handleTogglePreferred = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (vendor) {
      updateVendorItem(vendorId, {
        isPreferred: !vendor.isPreferred,
        updatedAt: new Date().toISOString()
      })
    }
  }

  const handleUpdateContractStatus = (vendorId: string, status: ContractStatus) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (vendor) {
      updateVendorItem(vendorId, {
        contractStatus: status,
        contractSignedDate: status === 'signed' ? new Date().toISOString() : vendor.contractSignedDate,
        updatedAt: new Date().toISOString()
      })
    }
  }

  const handleAddCommunication = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (!vendor) return

    const newLog: CommunicationLog = {
      id: generateId(),
      date: new Date().toISOString(),
      type: communicationForm.type,
      subject: communicationForm.subject,
      notes: communicationForm.notes,
      followUpDate: communicationForm.followUpDate || undefined
    }

    updateVendorItem(vendorId, {
      communicationLog: [...vendor.communicationLog, newLog],
      updatedAt: new Date().toISOString()
    })

    setCommunicationForm({ type: 'email', subject: '', notes: '', followUpDate: '' })
  }

  const handleAddReview = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (!vendor) return

    const newReview: Review = {
      id: generateId(),
      eventName: reviewForm.eventName,
      eventDate: reviewForm.eventDate,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString()
    }

    const updatedReviews = [...vendor.reviews, newReview]
    const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length

    updateVendorItem(vendorId, {
      reviews: updatedReviews,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: updatedReviews.length,
      updatedAt: new Date().toISOString()
    })

    setReviewForm({ eventName: '', eventDate: '', rating: 5, comment: '' })
  }

  const handleAddPayment = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (!vendor) return

    const newPayment: PaymentSchedule = {
      id: generateId(),
      type: paymentForm.type,
      amount: parseFloat(paymentForm.amount) || 0,
      dueDate: paymentForm.dueDate,
      status: 'pending',
      notes: paymentForm.notes || undefined
    }

    updateVendorItem(vendorId, {
      paymentSchedule: [...vendor.paymentSchedule, newPayment],
      updatedAt: new Date().toISOString()
    })

    setPaymentForm({ type: 'deposit', amount: '', dueDate: '', notes: '' })
  }

  const handleUpdatePaymentStatus = (vendorId: string, paymentId: string, status: PaymentStatus) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (!vendor) return

    const updatedPaymentSchedule = vendor.paymentSchedule.map(p =>
      p.id === paymentId
        ? {
            ...p,
            status,
            paidDate: status === 'paid' ? new Date().toISOString() : p.paidDate
          }
        : p
    )

    updateVendorItem(vendorId, {
      paymentSchedule: updatedPaymentSchedule,
      updatedAt: new Date().toISOString()
    })

    // Update spent budget
    if (status === 'paid') {
      const payment = vendor.paymentSchedule.find(p => p.id === paymentId)
      if (payment) {
        setBudgetState(prev => ({
          ...prev,
          budgetAllocations: prev.budgetAllocations.map(b =>
            b.category === vendor.category ? { ...b, spent: b.spent + payment.amount } : b
          )
        }))
      }
    }
  }

  const handleUpdateVerification = (vendorId: string, type: 'insurance' | 'license', status: VerificationStatus) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (!vendor) return

    const updates: Partial<Vendor> = {
      updatedAt: new Date().toISOString()
    }

    if (type === 'insurance') {
      updates.insuranceVerification = status
      updates.insuranceExpiryDate = status === 'verified' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : vendor.insuranceExpiryDate
    } else {
      updates.licenseVerification = status
      updates.licenseExpiryDate = status === 'verified' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : vendor.licenseExpiryDate
    }

    updateVendorItem(vendorId, updates)
  }

  const handleUpdateBudget = (category: VendorCategory, allocated: number) => {
    setBudgetState(prev => ({
      ...prev,
      budgetAllocations: prev.budgetAllocations.map(b =>
        b.category === category ? { ...b, allocated } : b
      )
    }))
  }

  const handleSetTotalBudget = (amount: number) => {
    setBudgetState(prev => ({ ...prev, totalBudget: amount }))
  }

  const handleToggleCompare = (vendorId: string) => {
    setCompareVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : prev.length < 4 ? [...prev, vendorId] : prev
    )
  }

  const resetVendorForm = () => {
    setVendorForm({
      name: '',
      category: 'catering',
      email: '',
      phone: '',
      website: '',
      address: '',
      services: '',
      priceMin: '',
      priceMax: '',
      notes: ''
    })
  }

  const startEditing = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setVendorForm({
      name: vendor.name,
      category: vendor.category,
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.website || '',
      address: vendor.address || '',
      services: vendor.services.join(', '),
      priceMin: vendor.priceRange.min.toString(),
      priceMax: vendor.priceRange.max.toString(),
      notes: vendor.notes || ''
    })
  }

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
      </div>
    )
  }

  // Render vendor card
  const renderVendorCard = (vendor: Vendor) => {
    const CategoryIcon = CATEGORY_INFO[vendor.category].icon
    const contractInfo = CONTRACT_STATUS_INFO[vendor.contractStatus]

    return (
      <Card
        key={vendor.id}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setSelectedVendor(vendor)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${CATEGORY_INFO[vendor.category].color}`}>
                <CategoryIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{vendor.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{CATEGORY_INFO[vendor.category].label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleTogglePreferred(vendor.id) }}
                className={`p-1.5 rounded-lg transition-colors ${vendor.isPreferred ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500'}`}
              >
                <Heart className={`w-4 h-4 ${vendor.isPreferred ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleCompare(vendor.id) }}
                className={`p-1.5 rounded-lg transition-colors ${compareVendors.includes(vendor.id) ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-500'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {renderStars(vendor.rating, 'sm')}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({vendor.reviewCount} reviews)
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span>{formatCurrency(vendor.priceRange.min)} - {formatCurrency(vendor.priceRange.max)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${contractInfo.bgColor} ${contractInfo.color}`}>
                {contractInfo.label}
              </span>
              {vendor.insuranceVerification === 'verified' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  {t('tools.eventVendorManager.insured', 'Insured')}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); startEditing(vendor) }}
                className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteVendor(vendor.id) }}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render vendor detail modal
  const renderVendorDetail = () => {
    if (!selectedVendor) return null

    const CategoryIcon = CATEGORY_INFO[selectedVendor.category].icon
    const performance = getVendorPerformance(selectedVendor)
    const [detailTab, setDetailTab] = useState<'overview' | 'payments' | 'communication' | 'reviews' | 'availability'>('overview')

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-700 ${CATEGORY_INFO[selectedVendor.category].color}`}>
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedVendor.name}</h2>
                    {selectedVendor.isPreferred && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" /> Preferred
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{CATEGORY_INFO[selectedVendor.category].label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <a href={`mailto:${selectedVendor.email}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500">
                <Mail className="w-4 h-4" />
                {selectedVendor.email}
              </a>
              <a href={`tel:${selectedVendor.phone}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500">
                <Phone className="w-4 h-4" />
                {selectedVendor.phone}
              </a>
              {selectedVendor.website && (
                <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500">
                  <Globe className="w-4 h-4" />
                  {t('tools.eventVendorManager.website2', 'Website')}
                </a>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto">
              {(['overview', 'payments', 'communication', 'reviews', 'availability'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    detailTab === tab
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {detailTab === 'overview' && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.rating', 'Rating')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{performance.rating.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.paymentScore', 'Payment Score')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{performance.paymentScore.toFixed(0)}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.responseRate', 'Response Rate')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{performance.responseRate}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.events', 'Events')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{performance.totalEvents}</p>
                  </div>
                </div>

                {/* Contract & Verification */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.eventVendorManager.contractStatus', 'Contract Status')}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${CONTRACT_STATUS_INFO[selectedVendor.contractStatus].bgColor} ${CONTRACT_STATUS_INFO[selectedVendor.contractStatus].color}`}>
                        {CONTRACT_STATUS_INFO[selectedVendor.contractStatus].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['pending', 'sent', 'negotiating', 'signed'] as ContractStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateContractStatus(selectedVendor.id, status)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            selectedVendor.contractStatus === status
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                          }`}
                        >
                          {CONTRACT_STATUS_INFO[status].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.eventVendorManager.verification', 'Verification')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.eventVendorManager.insurance', 'Insurance')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {React.createElement(VERIFICATION_STATUS_INFO[selectedVendor.insuranceVerification].icon, {
                            className: `w-4 h-4 ${VERIFICATION_STATUS_INFO[selectedVendor.insuranceVerification].color}`
                          })}
                          <select
                            value={selectedVendor.insuranceVerification}
                            onChange={(e) => handleUpdateVerification(selectedVendor.id, 'insurance', e.target.value as VerificationStatus)}
                            className="text-sm border-0 bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0"
                          >
                            {Object.entries(VERIFICATION_STATUS_INFO).map(([key, info]) => (
                              <option key={key} value={key}>{info.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.eventVendorManager.license', 'License')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {React.createElement(VERIFICATION_STATUS_INFO[selectedVendor.licenseVerification].icon, {
                            className: `w-4 h-4 ${VERIFICATION_STATUS_INFO[selectedVendor.licenseVerification].color}`
                          })}
                          <select
                            value={selectedVendor.licenseVerification}
                            onChange={(e) => handleUpdateVerification(selectedVendor.id, 'license', e.target.value as VerificationStatus)}
                            className="text-sm border-0 bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0"
                          >
                            {Object.entries(VERIFICATION_STATUS_INFO).map(([key, info]) => (
                              <option key={key} value={key}>{info.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services & Pricing */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('tools.eventVendorManager.services', 'Services')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.services.map((service, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.priceRange', 'Price Range')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedVendor.priceRange.min)} - {formatCurrency(selectedVendor.priceRange.max)}
                    </p>
                  </div>
                </div>

                {selectedVendor.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('tools.eventVendorManager.notes', 'Notes')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedVendor.notes}</p>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'payments' && (
              <div className="space-y-6">
                {/* Add Payment Form */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('tools.eventVendorManager.addPayment', 'Add Payment')}</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <select
                      value={paymentForm.type}
                      onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as PaymentSchedule['type'] })}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="deposit">{t('tools.eventVendorManager.deposit', 'Deposit')}</option>
                      <option value="milestone">{t('tools.eventVendorManager.milestone', 'Milestone')}</option>
                      <option value="balance">{t('tools.eventVendorManager.balance', 'Balance')}</option>
                      <option value="final">{t('tools.eventVendorManager.final', 'Final')}</option>
                    </select>
                    <input
                      type="number"
                      placeholder={t('tools.eventVendorManager.amount', 'Amount')}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={paymentForm.dueDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddPayment(selectedVendor.id)}
                      disabled={!paymentForm.amount || !paymentForm.dueDate}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('tools.eventVendorManager.add', 'Add')}
                    </button>
                  </div>
                </div>

                {/* Payment List */}
                <div className="space-y-3">
                  {selectedVendor.paymentSchedule.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('tools.eventVendorManager.noPaymentsScheduled', 'No payments scheduled')}</p>
                  ) : (
                    selectedVendor.paymentSchedule.map(payment => {
                      const StatusIcon = PAYMENT_STATUS_INFO[payment.status].icon
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <StatusIcon className={`w-5 h-5 ${PAYMENT_STATUS_INFO[payment.status].color}`} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white capitalize">{payment.type}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Due: {formatDate(payment.dueDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <select
                              value={payment.status}
                              onChange={(e) => handleUpdatePaymentStatus(selectedVendor.id, payment.id, e.target.value as PaymentStatus)}
                              className={`px-3 py-1 rounded-lg text-sm border-0 ${PAYMENT_STATUS_INFO[payment.status].color} bg-gray-100 dark:bg-gray-700`}
                            >
                              {Object.entries(PAYMENT_STATUS_INFO).map(([key, info]) => (
                                <option key={key} value={key}>{info.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Payment Summary */}
                {selectedVendor.paymentSchedule.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.total', 'Total')}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(selectedVendor.paymentSchedule.reduce((sum, p) => sum + p.amount, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.paid', 'Paid')}</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(selectedVendor.paymentSchedule.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.remaining', 'Remaining')}</p>
                        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {formatCurrency(selectedVendor.paymentSchedule.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'communication' && (
              <div className="space-y-6">
                {/* Add Communication Form */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('tools.eventVendorManager.logCommunication', 'Log Communication')}</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <select
                        value={communicationForm.type}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, type: e.target.value as CommunicationLog['type'] })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="email">{t('tools.eventVendorManager.email', 'Email')}</option>
                        <option value="phone">{t('tools.eventVendorManager.phone', 'Phone')}</option>
                        <option value="meeting">{t('tools.eventVendorManager.meeting', 'Meeting')}</option>
                        <option value="text">{t('tools.eventVendorManager.text', 'Text')}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.eventVendorManager.subject', 'Subject')}
                        value={communicationForm.subject}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <textarea
                      placeholder={t('tools.eventVendorManager.notes3', 'Notes')}
                      value={communicationForm.notes}
                      onChange={(e) => setCommunicationForm({ ...communicationForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <div className="flex items-center gap-4">
                      <input
                        type="date"
                        placeholder={t('tools.eventVendorManager.followUpDate', 'Follow-up Date')}
                        value={communicationForm.followUpDate}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, followUpDate: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddCommunication(selectedVendor.id)}
                        disabled={!communicationForm.subject}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {t('tools.eventVendorManager.log', 'Log')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Communication Log */}
                <div className="space-y-3">
                  {selectedVendor.communicationLog.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('tools.eventVendorManager.noCommunicationLogged', 'No communication logged')}</p>
                  ) : (
                    [...selectedVendor.communicationLog].reverse().map(log => (
                      <div key={log.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs capitalize">
                              {log.type}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">{log.subject}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(log.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.notes}</p>
                        {log.followUpDate && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Follow-up: {formatDate(log.followUpDate)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-6">
                {/* Add Review Form */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('tools.eventVendorManager.addReview', 'Add Review')}</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.eventVendorManager.eventName', 'Event Name')}
                        value={reviewForm.eventName}
                        onChange={(e) => setReviewForm({ ...reviewForm, eventName: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="date"
                        value={reviewForm.eventDate}
                        onChange={(e) => setReviewForm({ ...reviewForm, eventDate: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('tools.eventVendorManager.rating2', 'Rating:')}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="p-1"
                          >
                            <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder={t('tools.eventVendorManager.reviewComment', 'Review comment')}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddReview(selectedVendor.id)}
                      disabled={!reviewForm.eventName || !reviewForm.comment}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('tools.eventVendorManager.submitReview', 'Submit Review')}
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {selectedVendor.reviews.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('tools.eventVendorManager.noReviewsYet', 'No reviews yet')}</p>
                  ) : (
                    [...selectedVendor.reviews].reverse().map(review => (
                      <div key={review.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{review.eventName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(review.eventDate)}</p>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {detailTab === 'availability' && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('tools.eventVendorManager.availabilityCalendarComingSoonContact', 'Availability calendar coming soon. Contact vendor directly for booking availability.')}
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <a
                      href={`mailto:${selectedVendor.email}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {t('tools.eventVendorManager.emailVendor', 'Email Vendor')}
                    </a>
                    <a
                      href={`tel:${selectedVendor.phone}`}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {t('tools.eventVendorManager.callVendor', 'Call Vendor')}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render comparison matrix
  const renderComparisonMatrix = () => {
    if (vendorsToCompare.length < 2) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('tools.eventVendorManager.compareVendors', 'Compare Vendors')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('tools.eventVendorManager.selectAtLeast2Vendors', 'Select at least 2 vendors to compare (max 4)')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t('tools.eventVendorManager.clickTheChartIconOn', 'Click the chart icon on vendor cards to add them for comparison')}
          </p>
        </div>
      )
    }

    const comparisonFields = [
      { label: 'Category', getValue: (v: Vendor) => CATEGORY_INFO[v.category].label },
      { label: 'Rating', getValue: (v: Vendor) => `${v.rating.toFixed(1)} (${v.reviewCount} reviews)` },
      { label: 'Price Range', getValue: (v: Vendor) => `${formatCurrency(v.priceRange.min)} - ${formatCurrency(v.priceRange.max)}` },
      { label: 'Contract Status', getValue: (v: Vendor) => CONTRACT_STATUS_INFO[v.contractStatus].label },
      { label: 'Insurance', getValue: (v: Vendor) => VERIFICATION_STATUS_INFO[v.insuranceVerification].label },
      { label: 'License', getValue: (v: Vendor) => VERIFICATION_STATUS_INFO[v.licenseVerification].label },
      { label: 'Services', getValue: (v: Vendor) => v.services.join(', ') || '-' },
      { label: 'Preferred', getValue: (v: Vendor) => v.isPreferred ? 'Yes' : 'No' }
    ]

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">{t('tools.eventVendorManager.criteria', 'Criteria')}</th>
              {vendorsToCompare.map(v => (
                <th key={v.id} className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {v.name}
                    <button
                      onClick={() => handleToggleCompare(v.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field, idx) => (
              <tr key={field.label} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                <td className="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</td>
                {vendorsToCompare.map(v => (
                  <td key={v.id} className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {field.getValue(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Render budget tab
  const renderBudgetTab = () => {
    return (
      <div className="space-y-6">
        {/* Budget Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.totalBudget', 'Total Budget')}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(budgetStats.totalBudget)}</p>
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.allocated', 'Allocated')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(budgetStats.totalAllocated)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.spent', 'Spent')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(budgetStats.totalSpent)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.remaining2', 'Remaining')}</p>
              <p className={`text-2xl font-bold mt-1 ${budgetStats.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(budgetStats.remaining)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Allocations */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">{t('tools.eventVendorManager.budgetAllocationByCategory', 'Budget Allocation by Category')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetState.budgetAllocations.map(allocation => {
                const CategoryIcon = CATEGORY_INFO[allocation.category].icon
                const percentage = budgetStats.totalBudget > 0 ? (allocation.allocated / budgetStats.totalBudget) * 100 : 0
                const spentPercentage = allocation.allocated > 0 ? (allocation.spent / allocation.allocated) * 100 : 0

                return (
                  <div key={allocation.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className={`w-5 h-5 ${CATEGORY_INFO[allocation.category].color}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {CATEGORY_INFO[allocation.category].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={allocation.allocated || ''}
                          onChange={(e) => handleUpdateBudget(allocation.category, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-32 px-3 py-1.5 text-right border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Spent: {formatCurrency(allocation.spent)}</span>
                      <span>{spentPercentage.toFixed(0)}% used</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Budget Modal */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.eventVendorManager.setTotalBudget', 'Set Total Budget')}</h3>
              <input
                type="number"
                value={budgetState.totalBudget || ''}
                onChange={(e) => handleSetTotalBudget(parseFloat(e.target.value) || 0)}
                placeholder={t('tools.eventVendorManager.enterTotalBudget', 'Enter total budget')}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('tools.eventVendorManager.cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.eventVendorManager.save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render performance tab
  const renderPerformanceTab = () => {
    const vendorsByCategory = Object.keys(CATEGORY_INFO).map(cat => ({
      category: cat as VendorCategory,
      vendors: vendors.filter(v => v.category === cat)
    }))

    return (
      <div className="space-y-6">
        {vendorsByCategory.map(({ category, vendors: catVendors }) => {
          if (catVendors.length === 0) return null
          const CategoryIcon = CATEGORY_INFO[category].icon

          return (
            <Card key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <CategoryIcon className={`w-5 h-5 ${CATEGORY_INFO[category].color}`} />
                  {CATEGORY_INFO[category].label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.vendor', 'Vendor')}</th>
                        <th className="py-2 px-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.rating3', 'Rating')}</th>
                        <th className="py-2 px-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.events2', 'Events')}</th>
                        <th className="py-2 px-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.paymentScore2', 'Payment Score')}</th>
                        <th className="py-2 px-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.verified', 'Verified')}</th>
                        <th className="py-2 px-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.preferred', 'Preferred')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catVendors.map(vendor => {
                        const perf = getVendorPerformance(vendor)
                        return (
                          <tr key={vendor.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="py-3 px-3">
                              <p className="font-medium text-gray-900 dark:text-white">{vendor.name}</p>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-gray-900 dark:text-white">{perf.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                              {perf.totalEvents}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={perf.paymentScore >= 80 ? 'text-green-600 dark:text-green-400' : perf.paymentScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}>
                                {perf.paymentScore.toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {perf.isVerified ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {vendor.isPreferred ? (
                                <Heart className="w-5 h-5 text-red-500 fill-red-500 mx-auto" />
                              ) : (
                                <Heart className="w-5 h-5 text-gray-400 mx-auto" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {vendors.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.noVendorsToShowPerformance', 'No vendors to show performance data')}</p>
          </div>
        )}
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tools.eventVendorManager.eventVendorManager', 'Event Vendor Manager')}</h1>
              <p className="text-gray-500 dark:text-gray-400">{t('tools.eventVendorManager.manageVendorsContractsAndPayments', 'Manage vendors, contracts, and payments')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="event-vendor-manager" toolName="Event Vendor Manager" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme === 'dark' ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'event-vendors' })}
              onExportExcel={() => exportExcel({ filename: 'event-vendors' })}
              onExportJSON={() => exportJSON({ filename: 'event-vendors' })}
              onExportPDF={() => exportPDF({
                filename: 'event-vendors',
                title: 'Event Vendors',
                subtitle: `Total: ${filteredVendors.length} vendors`,
              })}
              onPrint={() => print('Event Vendors')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
            <button
              onClick={() => setShowAddVendor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('tools.eventVendorManager.addVendor', 'Add Vendor')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'vendors', label: 'All Vendors', icon: Users },
            { id: 'preferred', label: 'Preferred', icon: Heart },
            { id: 'compare', label: 'Compare', icon: BarChart3 },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: Star }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'preferred' && preferredVendors.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">{preferredVendors.length}</span>
              )}
              {tab.id === 'compare' && compareVendors.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">{compareVendors.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'vendors' && (
          <>
            {/* Filters */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.eventVendorManager.searchVendors', 'Search vendors...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as VendorCategory | 'all')}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">{t('tools.eventVendorManager.allCategories', 'All Categories')}</option>
                      {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                        <option key={key} value={key}>{info.label}</option>
                      ))}
                    </select>
                    <select
                      value={contractFilter}
                      onChange={(e) => setContractFilter(e.target.value as ContractStatus | 'all')}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">{t('tools.eventVendorManager.allStatus', 'All Status')}</option>
                      {Object.entries(CONTRACT_STATUS_INFO).map(([key, info]) => (
                        <option key={key} value={key}>{info.label}</option>
                      ))}
                    </select>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-')
                        setSortBy(field as typeof sortBy)
                        setSortOrder(order as typeof sortOrder)
                      }}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="name-asc">{t('tools.eventVendorManager.nameAZ', 'Name A-Z')}</option>
                      <option value="name-desc">{t('tools.eventVendorManager.nameZA', 'Name Z-A')}</option>
                      <option value="rating-desc">{t('tools.eventVendorManager.highestRated', 'Highest Rated')}</option>
                      <option value="rating-asc">{t('tools.eventVendorManager.lowestRated', 'Lowest Rated')}</option>
                      <option value="price-asc">{t('tools.eventVendorManager.priceLowToHigh', 'Price: Low to High')}</option>
                      <option value="price-desc">{t('tools.eventVendorManager.priceHighToLow', 'Price: High to Low')}</option>
                      <option value="date-desc">{t('tools.eventVendorManager.newestFirst', 'Newest First')}</option>
                      <option value="date-asc">{t('tools.eventVendorManager.oldestFirst', 'Oldest First')}</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Grid */}
            {filteredVendors.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('tools.eventVendorManager.noVendorsFound', 'No vendors found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {state.vendors.length === 0
                    ? t('tools.eventVendorManager.addYourFirstVendorTo', 'Add your first vendor to get started') : t('tools.eventVendorManager.tryAdjustingYourFilters', 'Try adjusting your filters')}
                </p>
                {state.vendors.length === 0 && (
                  <button
                    onClick={() => setShowAddVendor(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.eventVendorManager.addVendor2', 'Add Vendor')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.map(vendor => renderVendorCard(vendor))}
              </div>
            )}
          </>
        )}

        {activeTab === 'preferred' && (
          <>
            {preferredVendors.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('tools.eventVendorManager.noPreferredVendors', 'No preferred vendors')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('tools.eventVendorManager.markVendorsAsPreferredBy', 'Mark vendors as preferred by clicking the heart icon')}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preferredVendors.map(vendor => renderVendorCard(vendor))}
              </div>
            )}
          </>
        )}

        {activeTab === 'compare' && renderComparisonMatrix()}

        {activeTab === 'budget' && renderBudgetTab()}

        {activeTab === 'performance' && renderPerformanceTab()}

        {/* Add/Edit Vendor Modal */}
        {(showAddVendor || editingVendor) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingVendor ? t('tools.eventVendorManager.editVendor', 'Edit Vendor') : t('tools.eventVendorManager.addNewVendor', 'Add New Vendor')}
                  </h2>
                  <button
                    onClick={() => { setShowAddVendor(false); setEditingVendor(null); resetVendorForm() }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.vendorName', 'Vendor Name *')}</label>
                    <input
                      type="text"
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.eventVendorManager.enterVendorName', 'Enter vendor name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.category', 'Category *')}</label>
                    <select
                      value={vendorForm.category}
                      onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value as VendorCategory })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                        <option key={key} value={key}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.email2', 'Email *')}</label>
                    <input
                      type="email"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.eventVendorManager.vendorExampleCom', 'vendor@example.com')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.phone2', 'Phone *')}</label>
                    <input
                      type="tel"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.website', 'Website')}</label>
                    <input
                      type="url"
                      value={vendorForm.website}
                      onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.eventVendorManager.httpsExampleCom', 'https://example.com')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.address', 'Address')}</label>
                    <input
                      type="text"
                      value={vendorForm.address}
                      onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.eventVendorManager.123MainStCity', '123 Main St, City')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.servicesCommaSeparated', 'Services (comma separated)')}</label>
                  <input
                    type="text"
                    value={vendorForm.services}
                    onChange={(e) => setVendorForm({ ...vendorForm, services: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.eventVendorManager.weddingPhotographyPortraitEventCoverage', 'Wedding photography, Portrait, Event coverage')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.minPrice', 'Min Price ($)')}</label>
                    <input
                      type="number"
                      value={vendorForm.priceMin}
                      onChange={(e) => setVendorForm({ ...vendorForm, priceMin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.maxPrice', 'Max Price ($)')}</label>
                    <input
                      type="number"
                      value={vendorForm.priceMax}
                      onChange={(e) => setVendorForm({ ...vendorForm, priceMax: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.eventVendorManager.notes2', 'Notes')}</label>
                  <textarea
                    value={vendorForm.notes}
                    onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.eventVendorManager.additionalNotesAboutThisVendor', 'Additional notes about this vendor...')}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => { setShowAddVendor(false); setEditingVendor(null); resetVendorForm() }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('tools.eventVendorManager.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={editingVendor ? handleUpdateVendor : handleAddVendor}
                  disabled={!vendorForm.name || !vendorForm.email || !vendorForm.phone}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingVendor ? t('tools.eventVendorManager.updateVendor', 'Update Vendor') : t('tools.eventVendorManager.addVendor3', 'Add Vendor')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Detail Modal */}
        {selectedVendor && renderVendorDetail()}
      </div>
      <ConfirmDialog />
    </div>
  )
}

export default EventVendorManagerTool
