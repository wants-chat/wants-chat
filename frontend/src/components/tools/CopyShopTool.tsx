'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { UIConfig } from '../ContextualUI'
import { ToolPrefillData } from '../../services/toolPrefillService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Printer,
  FileText,
  Users,
  Clock,
  DollarSign,
  Phone,
  Mail,
  User,
  Plus,
  X,
  Check,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  Zap,
  ScanLine,
  Layers,
  CreditCard,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Maximize,
  BookOpen,
  Wrench,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Calendar,
  Hash,
  Folder,
  Sparkles,
  Loader2
} from 'lucide-react'

// Types
interface PrintOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  orderType: 'walk-in' | 'pickup' | 'delivery'
  status: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled'
  priority: 'normal' | 'rush' | 'same-day'
  items: PrintItem[]
  totalPrice: number
  deposit: number
  paidAmount: number
  notes: string
  dueDate: string
  createdAt: string
  completedAt?: string
}

interface PrintItem {
  id: string
  serviceType: 'copy' | 'print' | 'scan' | 'laminate' | 'bind' | 'large-format' | 'business-cards' | 'stationery' | 'mount'
  fileName: string
  copies: number
  paperSize: 'letter' | 'legal' | 'tabloid' | 'a4' | 'a3' | '24x36' | '36x48' | 'custom'
  paperType: 'standard' | 'cardstock' | 'glossy' | 'matte' | 'resume' | 'photo' | 'canvas'
  colorMode: 'bw' | 'color'
  doubleSided: boolean
  collated: boolean
  bindingType?: 'none' | 'staple' | 'comb' | 'spiral' | 'perfect' | 'saddle-stitch'
  finishingOptions: string[]
  pages: number
  unitPrice: number
  totalPrice: number
}

interface CustomerFile {
  id: string
  customerId: string
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: string
  expiryDate: string
  notes: string
  ordersUsed: string[]
}

interface SupplyItem {
  id: string
  name: string
  category: 'paper' | 'ink' | 'toner' | 'binding' | 'laminating' | 'other'
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  unitCost: number
  supplier: string
  lastRestocked: string
  reorderPoint: number
}

interface MaintenanceLog {
  id: string
  machineId: string
  machineName: string
  type: 'routine' | 'repair' | 'jam-clear' | 'toner-change' | 'paper-load' | 'calibration'
  description: string
  technicianName: string
  date: string
  cost: number
  status: 'scheduled' | 'completed' | 'needs-parts'
  nextMaintenanceDate?: string
}

interface PricingRule {
  id: string
  serviceType: string
  paperSize: string
  colorMode: string
  basePrice: number
  volumeDiscounts: { minQty: number; discount: number }[]
}

type TabType = 'orders' | 'new-order' | 'files' | 'inventory' | 'maintenance' | 'pricing'

// Default Data
const defaultPricingRules: PricingRule[] = [
  { id: '1', serviceType: 'copy', paperSize: 'letter', colorMode: 'bw', basePrice: 0.10, volumeDiscounts: [{ minQty: 100, discount: 0.10 }, { minQty: 500, discount: 0.15 }] },
  { id: '2', serviceType: 'copy', paperSize: 'letter', colorMode: 'color', basePrice: 0.49, volumeDiscounts: [{ minQty: 100, discount: 0.10 }, { minQty: 500, discount: 0.15 }] },
  { id: '3', serviceType: 'copy', paperSize: 'legal', colorMode: 'bw', basePrice: 0.15, volumeDiscounts: [{ minQty: 100, discount: 0.10 }] },
  { id: '4', serviceType: 'copy', paperSize: 'legal', colorMode: 'color', basePrice: 0.59, volumeDiscounts: [{ minQty: 100, discount: 0.10 }] },
  { id: '5', serviceType: 'print', paperSize: 'letter', colorMode: 'bw', basePrice: 0.12, volumeDiscounts: [{ minQty: 100, discount: 0.10 }] },
  { id: '6', serviceType: 'print', paperSize: 'letter', colorMode: 'color', basePrice: 0.55, volumeDiscounts: [{ minQty: 100, discount: 0.10 }] },
  { id: '7', serviceType: 'large-format', paperSize: '24x36', colorMode: 'color', basePrice: 8.99, volumeDiscounts: [{ minQty: 10, discount: 0.10 }] },
  { id: '8', serviceType: 'large-format', paperSize: '36x48', colorMode: 'color', basePrice: 14.99, volumeDiscounts: [{ minQty: 10, discount: 0.10 }] },
  { id: '9', serviceType: 'scan', paperSize: 'letter', colorMode: 'color', basePrice: 0.50, volumeDiscounts: [] },
  { id: '10', serviceType: 'laminate', paperSize: 'letter', colorMode: 'color', basePrice: 2.50, volumeDiscounts: [{ minQty: 10, discount: 0.15 }] },
  { id: '11', serviceType: 'business-cards', paperSize: 'custom', colorMode: 'color', basePrice: 0.10, volumeDiscounts: [{ minQty: 500, discount: 0.20 }] },
]

const defaultSupplyItems: SupplyItem[] = [
  { id: '1', name: 'Letter Paper (20lb)', category: 'paper', currentStock: 25, minStock: 10, maxStock: 50, unit: 'ream', unitCost: 8.99, supplier: 'Office Depot', lastRestocked: '2024-01-10', reorderPoint: 15 },
  { id: '2', name: 'Letter Paper (24lb)', category: 'paper', currentStock: 15, minStock: 5, maxStock: 30, unit: 'ream', unitCost: 12.99, supplier: 'Office Depot', lastRestocked: '2024-01-08', reorderPoint: 8 },
  { id: '3', name: 'Cardstock (65lb)', category: 'paper', currentStock: 8, minStock: 3, maxStock: 20, unit: 'ream', unitCost: 18.99, supplier: 'Staples', lastRestocked: '2024-01-05', reorderPoint: 5 },
  { id: '4', name: 'Glossy Photo Paper', category: 'paper', currentStock: 12, minStock: 5, maxStock: 25, unit: 'pack', unitCost: 24.99, supplier: 'Amazon', lastRestocked: '2024-01-12', reorderPoint: 7 },
  { id: '5', name: 'Black Toner (HP)', category: 'toner', currentStock: 4, minStock: 2, maxStock: 10, unit: 'cartridge', unitCost: 89.99, supplier: 'HP Direct', lastRestocked: '2024-01-01', reorderPoint: 3 },
  { id: '6', name: 'Color Toner Set (HP)', category: 'toner', currentStock: 2, minStock: 1, maxStock: 6, unit: 'set', unitCost: 249.99, supplier: 'HP Direct', lastRestocked: '2023-12-20', reorderPoint: 2 },
  { id: '7', name: 'Comb Bindings (1")', category: 'binding', currentStock: 100, minStock: 50, maxStock: 300, unit: 'piece', unitCost: 0.35, supplier: 'Binding101', lastRestocked: '2024-01-08', reorderPoint: 75 },
  { id: '8', name: 'Spiral Coils (12mm)', category: 'binding', currentStock: 75, minStock: 25, maxStock: 200, unit: 'piece', unitCost: 0.50, supplier: 'Binding101', lastRestocked: '2024-01-06', reorderPoint: 50 },
  { id: '9', name: 'Laminating Pouches (Letter)', category: 'laminating', currentStock: 200, minStock: 100, maxStock: 500, unit: 'piece', unitCost: 0.15, supplier: 'Uline', lastRestocked: '2024-01-10', reorderPoint: 150 },
  { id: '10', name: 'Wide Format Ink (Cyan)', category: 'ink', currentStock: 2, minStock: 1, maxStock: 5, unit: 'cartridge', unitCost: 45.99, supplier: 'Canon', lastRestocked: '2024-01-03', reorderPoint: 2 },
]

// Column configuration for exports
const ORDER_COLUMNS: ColumnConfig[] = [
  { key: 'orderNumber', header: 'Order #', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'orderType', header: 'Order Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'itemCount', header: 'Items', type: 'number' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'deposit', header: 'Deposit', type: 'currency' },
  { key: 'paidAmount', header: 'Paid Amount', type: 'currency' },
  { key: 'balance', header: 'Balance Due', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Helper Functions
const generateId = () => Math.random().toString(36).substring(2, 11)

const generateOrderNumber = () => {
  const prefix = 'CS'
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${date}${random}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getStatusColor = (status: PrintOrder['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getPriorityColor = (priority: PrintOrder['priority']) => {
  switch (priority) {
    case 'rush': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'same-day': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

const getServiceIcon = (serviceType: PrintItem['serviceType']) => {
  switch (serviceType) {
    case 'copy': return <Copy className="w-4 h-4" />
    case 'print': return <Printer className="w-4 h-4" />
    case 'scan': return <ScanLine className="w-4 h-4" />
    case 'laminate': return <Layers className="w-4 h-4" />
    case 'bind': return <BookOpen className="w-4 h-4" />
    case 'large-format': return <Maximize className="w-4 h-4" />
    case 'business-cards': return <CreditCard className="w-4 h-4" />
    case 'stationery': return <FileText className="w-4 h-4" />
    case 'mount': return <Package className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

const getStockStatus = (item: SupplyItem) => {
  const percentage = (item.currentStock / item.maxStock) * 100
  if (item.currentStock <= item.minStock) return { status: 'critical', color: 'text-red-500', bgColor: 'bg-red-500' }
  if (item.currentStock <= item.reorderPoint) return { status: 'low', color: 'text-orange-500', bgColor: 'bg-orange-500' }
  if (percentage > 75) return { status: 'good', color: 'text-green-500', bgColor: 'bg-green-500' }
  return { status: 'normal', color: 'text-blue-500', bgColor: 'bg-blue-500' }
}

// Main Component
interface CopyShopToolProps {
  uiConfig?: UIConfig
}

export function CopyShopTool({
  uiConfig }: CopyShopToolProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [isPrefilled, setIsPrefilled] = useState(false)
  const [isEditFromGallery, setIsEditFromGallery] = useState(false)

  // Use the useToolData hook for backend persistence of orders
  const {
    data: orders,
    setData: setOrders,
    addItem: addOrder,
    updateItem: updateOrder,
    deleteItem: deleteOrder,
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
  } = useToolData<PrintOrder>('copy-shop', [], ORDER_COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>
      let hasChanges = false

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true)
        hasChanges = true
        // Data is managed by useToolData hook automatically
      }

      if (params.text || params.content || params.name) {
        hasChanges = true
      }

      if (hasChanges) {
        setIsPrefilled(true)
      }
    }
  }, [uiConfig?.params])

  // State
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [customerFiles, setCustomerFiles] = useState<CustomerFile[]>([])
  const [supplies, setSupplies] = useState<SupplyItem[]>(defaultSupplyItems)
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([])
  const [pricingRules] = useState<PricingRule[]>(defaultPricingRules)

  // Filter State
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // New Order Form State
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    orderType: 'walk-in' as 'walk-in' | 'pickup' | 'delivery',
    priority: 'normal' as 'normal' | 'rush' | 'same-day',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    notes: '',
    deposit: 0
  })

  const [orderItems, setOrderItems] = useState<PrintItem[]>([])
  const [currentItem, setCurrentItem] = useState<Partial<PrintItem>>({
    serviceType: 'copy',
    fileName: '',
    copies: 1,
    paperSize: 'letter',
    paperType: 'standard',
    colorMode: 'bw',
    doubleSided: false,
    collated: true,
    bindingType: 'none',
    finishingOptions: [],
    pages: 1
  })

  // Modal States
  const [showOrderDetails, setShowOrderDetails] = useState<PrintOrder | null>(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showSupplyModal, setShowSupplyModal] = useState(false)
  const [editingSupply, setEditingSupply] = useState<SupplyItem | null>(null)
  const [showFileUploadModal, setShowFileUploadModal] = useState(false)

  // Maintenance Form
  const [maintenanceForm, setMaintenanceForm] = useState({
    machineId: '',
    machineName: '',
    type: 'routine' as MaintenanceLog['type'],
    description: '',
    technicianName: '',
    cost: 0,
    status: 'completed' as MaintenanceLog['status']
  })

  // Load auxiliary data from localStorage (customerFiles, supplies, maintenanceLogs)
  // Orders are now handled by useToolData hook with backend sync
  useEffect(() => {
    const saved = localStorage.getItem('copy-shop-aux-data')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.customerFiles) setCustomerFiles(data.customerFiles)
        if (data.supplies) setSupplies(data.supplies)
        if (data.maintenanceLogs) setMaintenanceLogs(data.maintenanceLogs)
      } catch (e) {
        console.error('Failed to parse saved data:', e)
      }
    }
  }, [])

  // Save auxiliary data to localStorage
  useEffect(() => {
    const data = { customerFiles, supplies, maintenanceLogs }
    localStorage.setItem('copy-shop-aux-data', JSON.stringify(data))
  }, [customerFiles, supplies, maintenanceLogs])

  // Computed Values
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, orderSearch, statusFilter, priorityFilter])

  const lowStockItems = useMemo(() => {
    return supplies.filter(item => item.currentStock <= item.reorderPoint)
  }, [supplies])

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === today)
    const completedToday = orders.filter(o => o.completedAt?.slice(0, 10) === today)
    const revenue = completedToday.reduce((sum, o) => sum + o.paidAmount, 0)
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in-progress')
    const rushOrders = pendingOrders.filter(o => o.priority === 'rush' || o.priority === 'same-day')

    return {
      newOrders: todayOrders.length,
      completed: completedToday.length,
      revenue,
      pending: pendingOrders.length,
      rushCount: rushOrders.length
    }
  }, [orders])

  // Calculate item price
  const calculateItemPrice = (item: Partial<PrintItem>): number => {
    const rule = pricingRules.find(r =>
      r.serviceType === item.serviceType &&
      r.paperSize === item.paperSize &&
      r.colorMode === item.colorMode
    ) || pricingRules.find(r => r.serviceType === item.serviceType)

    if (!rule) return 0

    let basePrice = rule.basePrice
    const quantity = (item.copies || 1) * (item.pages || 1)

    // Apply volume discount
    const applicableDiscount = rule.volumeDiscounts
      .filter(d => quantity >= d.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0]

    if (applicableDiscount) {
      basePrice = basePrice * (1 - applicableDiscount.discount)
    }

    // Adjustments
    if (item.doubleSided) basePrice *= 0.9 // 10% discount for double-sided
    if (item.paperType === 'cardstock') basePrice *= 1.5
    if (item.paperType === 'glossy' || item.paperType === 'photo') basePrice *= 1.3

    // Binding costs
    const bindingCosts: Record<string, number> = {
      'none': 0,
      'staple': 0.25,
      'comb': 3.50,
      'spiral': 4.50,
      'perfect': 8.00,
      'saddle-stitch': 5.00
    }
    const bindingCost = bindingCosts[item.bindingType || 'none'] || 0

    return (basePrice * quantity) + (bindingCost * (item.copies || 1))
  }

  // Add item to order
  const addItemToOrder = () => {
    if (!currentItem.fileName) return

    const unitPrice = calculateItemPrice(currentItem) / ((currentItem.copies || 1) * (currentItem.pages || 1))
    const totalPrice = calculateItemPrice(currentItem)

    const newItem: PrintItem = {
      id: generateId(),
      serviceType: currentItem.serviceType || 'copy',
      fileName: currentItem.fileName,
      copies: currentItem.copies || 1,
      paperSize: currentItem.paperSize || 'letter',
      paperType: currentItem.paperType || 'standard',
      colorMode: currentItem.colorMode || 'bw',
      doubleSided: currentItem.doubleSided || false,
      collated: currentItem.collated ?? true,
      bindingType: currentItem.bindingType,
      finishingOptions: currentItem.finishingOptions || [],
      pages: currentItem.pages || 1,
      unitPrice,
      totalPrice
    }

    setOrderItems([...orderItems, newItem])
    setCurrentItem({
      serviceType: 'copy',
      fileName: '',
      copies: 1,
      paperSize: 'letter',
      paperType: 'standard',
      colorMode: 'bw',
      doubleSided: false,
      collated: true,
      bindingType: 'none',
      finishingOptions: [],
      pages: 1
    })
  }

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  // Submit new order
  const submitOrder = () => {
    if (!orderForm.customerName || orderItems.length === 0) return

    const totalPrice = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const rushMultiplier = orderForm.priority === 'rush' ? 1.5 : orderForm.priority === 'same-day' ? 1.25 : 1

    const newOrder: PrintOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerName: orderForm.customerName,
      customerPhone: orderForm.customerPhone,
      customerEmail: orderForm.customerEmail,
      orderType: orderForm.orderType,
      status: 'pending',
      priority: orderForm.priority,
      items: orderItems,
      totalPrice: totalPrice * rushMultiplier,
      deposit: orderForm.deposit,
      paidAmount: orderForm.deposit,
      notes: orderForm.notes,
      dueDate: orderForm.dueDate,
      createdAt: new Date().toISOString()
    }

    addOrder(newOrder)

    // Reset form
    setOrderForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      orderType: 'walk-in',
      priority: 'normal',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      notes: '',
      deposit: 0
    })
    setOrderItems([])
    setActiveTab('orders')
  }

  // Update order status
  const updateOrderStatus = (orderId: string, status: PrintOrder['status']) => {
    updateOrder(orderId, {
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined
    })
  }

  // Mark order as paid
  const markOrderPaid = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      updateOrder(orderId, { paidAmount: order.totalPrice })
    }
  }

  // Update supply stock
  const updateSupplyStock = (supplyId: string, newStock: number) => {
    setSupplies(supplies.map(item => {
      if (item.id === supplyId) {
        return { ...item, currentStock: newStock, lastRestocked: new Date().toISOString().slice(0, 10) }
      }
      return item
    }))
  }

  // Add maintenance log
  const addMaintenanceLog = () => {
    const newLog: MaintenanceLog = {
      id: generateId(),
      ...maintenanceForm,
      date: new Date().toISOString()
    }

    setMaintenanceLogs([...maintenanceLogs, newLog])
    setMaintenanceForm({
      machineId: '',
      machineName: '',
      type: 'routine',
      description: '',
      technicianName: '',
      cost: 0,
      status: 'completed'
    })
    setShowMaintenanceModal(false)
  }

  // Calculate order total
  const orderTotal = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const rushMultiplier = orderForm.priority === 'rush' ? 1.5 : orderForm.priority === 'same-day' ? 1.25 : 1
    return subtotal * rushMultiplier
  }, [orderItems, orderForm.priority])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  // Tab Content Rendering
  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.copyShop.newToday', 'New Today')}</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{todayStats.newOrders}</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.copyShop.completed', 'Completed')}</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{todayStats.completed}</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.copyShop.pending', 'Pending')}</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{todayStats.pending}</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-red-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.copyShop.rushOrders', 'Rush Orders')}</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{todayStats.rushCount}</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-emerald-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.copyShop.revenue', 'Revenue')}</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(todayStats.revenue)}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>{t('tools.copyShop.lowStockAlert', 'Low Stock Alert')}</span>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
            {lowStockItems.map(item => item.name).join(', ')} need restocking
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={t('tools.copyShop.searchOrders', 'Search orders...')}
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
        >
          <option value="all">{t('tools.copyShop.allStatus', 'All Status')}</option>
          <option value="pending">{t('tools.copyShop.pending2', 'Pending')}</option>
          <option value="in-progress">{t('tools.copyShop.inProgress', 'In Progress')}</option>
          <option value="ready">{t('tools.copyShop.ready', 'Ready')}</option>
          <option value="completed">{t('tools.copyShop.completed2', 'Completed')}</option>
          <option value="cancelled">{t('tools.copyShop.cancelled', 'Cancelled')}</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
        >
          <option value="all">{t('tools.copyShop.allPriority', 'All Priority')}</option>
          <option value="normal">{t('tools.copyShop.normal', 'Normal')}</option>
          <option value="rush">{t('tools.copyShop.rush', 'Rush')}</option>
          <option value="same-day">{t('tools.copyShop.sameDay', 'Same Day')}</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <Printer className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.copyShop.noOrdersFound', 'No orders found')}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              } hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setShowOrderDetails(order)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                    <Printer className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        #{order.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.priority !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(order.priority)}`}>
                          <Zap className="w-3 h-3" />
                          {order.priority === 'rush' ? t('tools.copyShop.rush2', 'RUSH') : t('tools.copyShop.sameDay2', 'SAME DAY')}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.customerName} - {order.items.length} item(s)
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Due: {formatDateTime(order.dueDate)}
                      </span>
                      <span className={`text-xs ${
                        order.orderType === 'walk-in'
                          ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          : order.orderType === 'pickup'
                          ? theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                          : theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <p className={`text-xs ${
                      order.paidAmount >= order.totalPrice
                        ? 'text-green-500'
                        : order.paidAmount > 0
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}>
                      {order.paidAmount >= order.totalPrice ? 'Paid' : order.paidAmount > 0 ? `${formatCurrency(order.paidAmount)} paid` : 'Unpaid'}
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderNewOrderTab = () => (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <User className="w-5 h-5" />
          {t('tools.copyShop.customerInformation', 'Customer Information')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.customerName', 'Customer Name *')}
            </label>
            <input
              type="text"
              value={orderForm.customerName}
              onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
              placeholder={t('tools.copyShop.johnDoe', 'John Doe')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.phone', 'Phone')}
            </label>
            <input
              type="tel"
              value={orderForm.customerPhone}
              onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
              placeholder="(555) 123-4567"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.email', 'Email')}
            </label>
            <input
              type="email"
              value={orderForm.customerEmail}
              onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
              placeholder={t('tools.copyShop.johnExampleCom', 'john@example.com')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Settings className="w-5 h-5" />
          {t('tools.copyShop.orderDetails', 'Order Details')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.orderType', 'Order Type')}
            </label>
            <select
              value={orderForm.orderType}
              onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as typeof orderForm.orderType })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="walk-in">{t('tools.copyShop.walkInWait', 'Walk-in (Wait)')}</option>
              <option value="pickup">{t('tools.copyShop.pickupLater', 'Pickup Later')}</option>
              <option value="delivery">{t('tools.copyShop.delivery', 'Delivery')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.priority', 'Priority')}
            </label>
            <select
              value={orderForm.priority}
              onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value as typeof orderForm.priority })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="normal">{t('tools.copyShop.normal2', 'Normal')}</option>
              <option value="same-day">{t('tools.copyShop.sameDay25', 'Same Day (+25%)')}</option>
              <option value="rush">{t('tools.copyShop.rush50', 'Rush (+50%)')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.dueDateTime', 'Due Date/Time')}
            </label>
            <input
              type="datetime-local"
              value={orderForm.dueDate}
              onChange={(e) => setOrderForm({ ...orderForm, dueDate: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.deposit', 'Deposit')}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={orderForm.deposit}
              onChange={(e) => setOrderForm({ ...orderForm, deposit: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.copyShop.notes', 'Notes')}
          </label>
          <textarea
            value={orderForm.notes}
            onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
            placeholder={t('tools.copyShop.specialInstructions', 'Special instructions...')}
            rows={2}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none`}
          />
        </div>
      </div>

      {/* Add Print Item */}
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <FileText className="w-5 h-5" />
          {t('tools.copyShop.addPrintItem', 'Add Print Item')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.serviceType', 'Service Type')}
            </label>
            <select
              value={currentItem.serviceType}
              onChange={(e) => setCurrentItem({ ...currentItem, serviceType: e.target.value as PrintItem['serviceType'] })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="copy">{t('tools.copyShop.copy', 'Copy')}</option>
              <option value="print">{t('tools.copyShop.print', 'Print')}</option>
              <option value="scan">{t('tools.copyShop.scan', 'Scan')}</option>
              <option value="laminate">{t('tools.copyShop.laminate', 'Laminate')}</option>
              <option value="bind">{t('tools.copyShop.bind', 'Bind')}</option>
              <option value="large-format">{t('tools.copyShop.largeFormat', 'Large Format')}</option>
              <option value="business-cards">{t('tools.copyShop.businessCards', 'Business Cards')}</option>
              <option value="stationery">{t('tools.copyShop.stationery', 'Stationery')}</option>
              <option value="mount">{t('tools.copyShop.mount', 'Mount')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.fileDocumentName', 'File/Document Name')}
            </label>
            <input
              type="text"
              value={currentItem.fileName}
              onChange={(e) => setCurrentItem({ ...currentItem, fileName: e.target.value })}
              placeholder={t('tools.copyShop.documentPdf', 'document.pdf')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.pages', 'Pages')}
            </label>
            <input
              type="number"
              min="1"
              value={currentItem.pages}
              onChange={(e) => setCurrentItem({ ...currentItem, pages: parseInt(e.target.value) || 1 })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.copies', 'Copies')}
            </label>
            <input
              type="number"
              min="1"
              value={currentItem.copies}
              onChange={(e) => setCurrentItem({ ...currentItem, copies: parseInt(e.target.value) || 1 })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.paperSize', 'Paper Size')}
            </label>
            <select
              value={currentItem.paperSize}
              onChange={(e) => setCurrentItem({ ...currentItem, paperSize: e.target.value as PrintItem['paperSize'] })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="letter">{t('tools.copyShop.letter85X11', 'Letter (8.5" x 11")')}</option>
              <option value="legal">{t('tools.copyShop.legal85X14', 'Legal (8.5" x 14")')}</option>
              <option value="tabloid">{t('tools.copyShop.tabloid11X17', 'Tabloid (11" x 17")')}</option>
              <option value="a4">A4</option>
              <option value="a3">A3</option>
              <option value="24x36">24" x 36" (Poster)</option>
              <option value="36x48">36" x 48" (Large Poster)</option>
              <option value="custom">{t('tools.copyShop.customSize', 'Custom Size')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.paperType', 'Paper Type')}
            </label>
            <select
              value={currentItem.paperType}
              onChange={(e) => setCurrentItem({ ...currentItem, paperType: e.target.value as PrintItem['paperType'] })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="standard">{t('tools.copyShop.standard20lb', 'Standard (20lb)')}</option>
              <option value="cardstock">{t('tools.copyShop.cardstock65lb', 'Cardstock (65lb)')}</option>
              <option value="glossy">{t('tools.copyShop.glossy', 'Glossy')}</option>
              <option value="matte">{t('tools.copyShop.matte', 'Matte')}</option>
              <option value="resume">{t('tools.copyShop.resume24lb', 'Resume (24lb)')}</option>
              <option value="photo">{t('tools.copyShop.photoPaper', 'Photo Paper')}</option>
              <option value="canvas">{t('tools.copyShop.canvas', 'Canvas')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.color', 'Color')}
            </label>
            <select
              value={currentItem.colorMode}
              onChange={(e) => setCurrentItem({ ...currentItem, colorMode: e.target.value as PrintItem['colorMode'] })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="bw">{t('tools.copyShop.blackWhite', 'Black & White')}</option>
              <option value="color">{t('tools.copyShop.fullColor', 'Full Color')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.copyShop.binding', 'Binding')}
            </label>
            <select
              value={currentItem.bindingType}
              onChange={(e) => setCurrentItem({ ...currentItem, bindingType: e.target.value as PrintItem['bindingType'] })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
            >
              <option value="none">None</option>
              <option value="staple">{t('tools.copyShop.staple025', 'Staple (+$0.25)')}</option>
              <option value="comb">{t('tools.copyShop.combBinding350', 'Comb Binding (+$3.50)')}</option>
              <option value="spiral">{t('tools.copyShop.spiralBinding450', 'Spiral Binding (+$4.50)')}</option>
              <option value="perfect">{t('tools.copyShop.perfectBinding800', 'Perfect Binding (+$8.00)')}</option>
              <option value="saddle-stitch">{t('tools.copyShop.saddleStitch500', 'Saddle Stitch (+$5.00)')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={currentItem.doubleSided}
              onChange={(e) => setCurrentItem({ ...currentItem, doubleSided: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
            />
            {t('tools.copyShop.doubleSided10Off', 'Double-sided (10% off)')}
          </label>
          <label className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={currentItem.collated}
              onChange={(e) => setCurrentItem({ ...currentItem, collated: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
            />
            {t('tools.copyShop.collated', 'Collated')}
          </label>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Item Total: {formatCurrency(calculateItemPrice(currentItem))}
          </p>
          <button
            onClick={addItemToOrder}
            disabled={!currentItem.fileName}
            className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0B7C71] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.copyShop.addItem', 'Add Item')}
          </button>
        </div>
      </div>

      {/* Order Items */}
      {orderItems.length > 0 && (
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-5 h-5" />
            Order Items ({orderItems.length})
          </h3>
          <div className="space-y-3">
            {orderItems.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-500' : 'bg-white'}`}>
                      {getServiceIcon(item.serviceType)}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.fileName}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.copies}x {item.pages} pages | {item.paperSize.toUpperCase()} | {item.colorMode === 'color' ? t('tools.copyShop.color3', 'Color') : 'B&W'} | {item.paperType}
                        {item.bindingType && item.bindingType !== 'none' && ` | ${item.bindingType}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(item.totalPrice)}
                    </p>
                    <button
                      onClick={() => removeItemFromOrder(item.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.copyShop.subtotal', 'Subtotal')}</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {formatCurrency(orderItems.reduce((sum, item) => sum + item.totalPrice, 0))}
              </span>
            </div>
            {orderForm.priority !== 'normal' && (
              <div className="flex items-center justify-between mb-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {orderForm.priority === 'rush' ? t('tools.copyShop.rushFee50', 'Rush Fee (+50%)') : t('tools.copyShop.sameDayFee25', 'Same Day Fee (+25%)')}
                </span>
                <span className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}>
                  +{formatCurrency(orderTotal - orderItems.reduce((sum, item) => sum + item.totalPrice, 0))}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg font-bold">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.copyShop.total', 'Total')}</span>
              <span className="text-[#0D9488]">{formatCurrency(orderTotal)}</span>
            </div>
          </div>

          <button
            onClick={submitOrder}
            disabled={!orderForm.customerName || orderItems.length === 0}
            className="w-full mt-4 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#0B7C71] hover:to-[#0D9488] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {t('tools.copyShop.createOrder', 'Create Order')}
          </button>
        </div>
      )}
    </div>
  )

  const renderFilesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.copyShop.customerFiles', 'Customer Files')}
        </h3>
        <button
          onClick={() => setShowFileUploadModal(true)}
          className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C71] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {t('tools.copyShop.uploadFile', 'Upload File')}
        </button>
      </div>

      {customerFiles.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.copyShop.noCustomerFilesUploadedYet', 'No customer files uploaded yet')}</p>
          <p className="text-sm mt-1">{t('tools.copyShop.uploadFilesFromCustomersFor', 'Upload files from customers for future orders')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerFiles.map(file => (
            <div
              key={file.id}
              className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                  <FileText className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {file.fileName}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatFileSize(file.fileSize)} - {file.fileType}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    Uploaded: {formatDate(file.uploadDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderInventoryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.copyShop.supplyInventory', 'Supply Inventory')}
        </h3>
        <button
          onClick={() => setShowSupplyModal(true)}
          className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C71] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('tools.copyShop.addSupply', 'Add Supply')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplies.map(item => {
          const stockStatus = getStockStatus(item)
          const percentage = (item.currentStock / item.maxStock) * 100

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  stockStatus.status === 'critical'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : stockStatus.status === 'low'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {stockStatus.status === 'critical' ? 'Critical' : stockStatus.status === 'low' ? 'Low' : 'OK'}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.copyShop.stockLevel', 'Stock Level')}
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.currentStock} / {item.maxStock} {item.unit}s
                  </span>
                </div>
                <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full ${stockStatus.bgColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Unit Cost: {formatCurrency(item.unitCost)}
                </span>
                <button
                  onClick={() => {
                    const newStock = prompt(`Update stock for ${item.name}:`, item.currentStock.toString())
                    if (newStock && !isNaN(parseInt(newStock))) {
                      updateSupplyStock(item.id, parseInt(newStock))
                    }
                  }}
                  className="text-[#0D9488] hover:text-[#0B7C71] font-medium"
                >
                  {t('tools.copyShop.update', 'Update')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.copyShop.machineMaintenanceLog', 'Machine Maintenance Log')}
        </h3>
        <button
          onClick={() => setShowMaintenanceModal(true)}
          className="px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C71] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('tools.copyShop.logMaintenance', 'Log Maintenance')}
        </button>
      </div>

      {maintenanceLogs.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('tools.copyShop.noMaintenanceRecordsYet', 'No maintenance records yet')}</p>
          <p className="text-sm mt-1">{t('tools.copyShop.logMaintenanceActivitiesForYour', 'Log maintenance activities for your machines')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenanceLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
            <div
              key={log.id}
              className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    log.type === 'repair'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : log.type === 'routine'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <Wrench className={`w-5 h-5 ${
                      log.type === 'repair'
                        ? 'text-red-600 dark:text-red-400'
                        : log.type === 'routine'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {log.machineName}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {log.type.charAt(0).toUpperCase() + log.type.slice(1).replace('-', ' ')} - {log.description}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      {formatDate(log.date)} - {log.technicianName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(log.cost)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    log.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : log.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderPricingTab = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.copyShop.pricingGuide', 'Pricing Guide')}
      </h3>

      <div className={`overflow-x-auto rounded-xl border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.copyShop.service', 'Service')}
              </th>
              <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.copyShop.size', 'Size')}
              </th>
              <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.copyShop.color2', 'Color')}
              </th>
              <th className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.copyShop.basePrice', 'Base Price')}
              </th>
              <th className={`px-4 py-3 text-left text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.copyShop.volumeDiscounts', 'Volume Discounts')}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
            {pricingRules.map(rule => (
              <tr key={rule.id} className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                <td className={`px-4 py-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {rule.serviceType.charAt(0).toUpperCase() + rule.serviceType.slice(1).replace('-', ' ')}
                </td>
                <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {rule.paperSize.toUpperCase()}
                </td>
                <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {rule.colorMode === 'bw' ? 'B&W' : t('tools.copyShop.color4', 'Color')}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(rule.basePrice)}
                </td>
                <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {rule.volumeDiscounts.length > 0
                    ? rule.volumeDiscounts.map(d => `${d.minQty}+: ${(d.discount * 100).toFixed(0)}% off`).join(', ')
                    : '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.copyShop.additionalFees', 'Additional Fees')}
        </h4>
        <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <li>{t('tools.copyShop.doubleSidedPrinting10Discount', 'Double-sided printing: 10% discount per page')}</li>
          <li>{t('tools.copyShop.cardstockPaper50PerPage', 'Cardstock paper: +50% per page')}</li>
          <li>{t('tools.copyShop.glossyPhotoPaper30Per', 'Glossy/Photo paper: +30% per page')}</li>
          <li>{t('tools.copyShop.sameDayService25Total', 'Same-day service: +25% total')}</li>
          <li>{t('tools.copyShop.rushService50Total', 'Rush service: +50% total')}</li>
        </ul>
      </div>
    </div>
  )

  // Order Details Modal
  const OrderDetailsModal = () => {
    if (!showOrderDetails) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order #{showOrderDetails.orderNumber}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Created {formatDateTime(showOrderDetails.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowOrderDetails(null)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status and Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(showOrderDetails.status)}`}>
                {showOrderDetails.status.charAt(0).toUpperCase() + showOrderDetails.status.slice(1)}
              </span>
              {showOrderDetails.priority !== 'normal' && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getPriorityColor(showOrderDetails.priority)}`}>
                  <Zap className="w-3 h-3" />
                  {showOrderDetails.priority.toUpperCase()}
                </span>
              )}
              {showOrderDetails.status !== 'completed' && showOrderDetails.status !== 'cancelled' && (
                <select
                  value={showOrderDetails.status}
                  onChange={(e) => {
                    updateOrderStatus(showOrderDetails.id, e.target.value as PrintOrder['status'])
                    setShowOrderDetails({ ...showOrderDetails, status: e.target.value as PrintOrder['status'] })
                  }}
                  className={`px-3 py-1 rounded-lg text-sm border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="pending">{t('tools.copyShop.pending3', 'Pending')}</option>
                  <option value="in-progress">{t('tools.copyShop.inProgress2', 'In Progress')}</option>
                  <option value="ready">{t('tools.copyShop.readyForPickup', 'Ready for Pickup')}</option>
                  <option value="completed">{t('tools.copyShop.completed3', 'Completed')}</option>
                  <option value="cancelled">{t('tools.copyShop.cancelled2', 'Cancelled')}</option>
                </select>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.copyShop.customerInformation2', 'Customer Information')}
              </h3>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {showOrderDetails.customerName}
                </p>
                {showOrderDetails.customerPhone && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Phone className="w-3 h-3 inline mr-1" /> {showOrderDetails.customerPhone}
                  </p>
                )}
                {showOrderDetails.customerEmail && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Mail className="w-3 h-3 inline mr-1" /> {showOrderDetails.customerEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Items ({showOrderDetails.items.length})
              </h3>
              <div className="space-y-2">
                {showOrderDetails.items.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(item.serviceType)}
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {item.fileName}
                        </span>
                      </div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {item.copies}x {item.pages} pages | {item.paperSize.toUpperCase()} | {item.colorMode === 'color' ? t('tools.copyShop.color5', 'Color') : 'B&W'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.copyShop.total2', 'Total')}</span>
                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(showOrderDetails.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.copyShop.paid', 'Paid')}</span>
                <span className={`font-medium ${
                  showOrderDetails.paidAmount >= showOrderDetails.totalPrice
                    ? 'text-green-500'
                    : 'text-yellow-500'
                }`}>
                  {formatCurrency(showOrderDetails.paidAmount)}
                </span>
              </div>
              {showOrderDetails.paidAmount < showOrderDetails.totalPrice && (
                <button
                  onClick={() => {
                    markOrderPaid(showOrderDetails.id)
                    setShowOrderDetails({ ...showOrderDetails, paidAmount: showOrderDetails.totalPrice })
                  }}
                  className="w-full mt-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                  {t('tools.copyShop.markAsPaid', 'Mark as Paid')}
                </button>
              )}
            </div>

            {showOrderDetails.notes && (
              <div>
                <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.copyShop.notes2', 'Notes')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {showOrderDetails.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Maintenance Modal
  const MaintenanceModal = () => {
    if (!showMaintenanceModal) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-md rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.copyShop.logMaintenance2', 'Log Maintenance')}
              </h2>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.copyShop.machineName', 'Machine Name')}
              </label>
              <input
                type="text"
                value={maintenanceForm.machineName}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, machineName: e.target.value })}
                placeholder={t('tools.copyShop.eGCanonC5535i', 'e.g., Canon C5535i')}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.copyShop.maintenanceType', 'Maintenance Type')}
              </label>
              <select
                value={maintenanceForm.type}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value as MaintenanceLog['type'] })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
              >
                <option value="routine">{t('tools.copyShop.routineMaintenance', 'Routine Maintenance')}</option>
                <option value="repair">{t('tools.copyShop.repair', 'Repair')}</option>
                <option value="jam-clear">{t('tools.copyShop.paperJamClear', 'Paper Jam Clear')}</option>
                <option value="toner-change">{t('tools.copyShop.tonerChange', 'Toner Change')}</option>
                <option value="paper-load">{t('tools.copyShop.paperLoad', 'Paper Load')}</option>
                <option value="calibration">{t('tools.copyShop.calibration', 'Calibration')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.copyShop.description', 'Description')}
              </label>
              <textarea
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                placeholder={t('tools.copyShop.describeTheMaintenancePerformed', 'Describe the maintenance performed...')}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.copyShop.technician', 'Technician')}
                </label>
                <input
                  type="text"
                  value={maintenanceForm.technicianName}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technicianName: e.target.value })}
                  placeholder={t('tools.copyShop.name', 'Name')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.copyShop.cost', 'Cost')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maintenanceForm.cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none`}
                />
              </div>
            </div>

            <button
              onClick={addMaintenanceLog}
              disabled={!maintenanceForm.machineName || !maintenanceForm.description}
              className="w-full py-3 bg-[#0D9488] hover:bg-[#0B7C71] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('tools.copyShop.saveMaintenanceLog', 'Save Maintenance Log')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm`}>
        <CardHeader className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Printer className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.copyShop.copyShopManager', 'Copy Shop Manager')}
                </CardTitle>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.copyShop.managePrintOrdersInventoryAnd', 'Manage print orders, inventory, and maintenance')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="copy-shop" toolName="Copy Shop" />

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
                onExportCSV={() => exportCSV({ filename: 'copy-shop-orders' })}
                onExportExcel={() => exportExcel({ filename: 'copy-shop-orders' })}
                onExportJSON={() => exportJSON({ filename: 'copy-shop-orders' })}
                onExportPDF={() => exportPDF({
                  filename: 'copy-shop-orders',
                  title: 'Copy Shop Orders Report',
                  subtitle: `${filteredOrders.length} orders | Generated from Copy Shop Manager`,
                  orientation: 'landscape',
                })}
                onPrint={() => print('Copy Shop Orders Report')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                disabled={filteredOrders.length === 0}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.copyShop.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
            </div>
          )}

          {/* Tabs */}
          <div className={`flex flex-wrap gap-2 mb-6 p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {[
              { id: 'orders', label: 'Orders', icon: FileText },
              { id: 'new-order', label: 'New Order', icon: Plus },
              { id: 'files', label: 'Files', icon: Folder },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'pricing', label: 'Pricing', icon: DollarSign },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'new-order' && renderNewOrderTab()}
          {activeTab === 'files' && renderFilesTab()}
          {activeTab === 'inventory' && renderInventoryTab()}
          {activeTab === 'maintenance' && renderMaintenanceTab()}
          {activeTab === 'pricing' && renderPricingTab()}
        </CardContent>
      </Card>

      {/* Modals */}
      <OrderDetailsModal />
      <MaintenanceModal />
    </div>
  )
}

export default CopyShopTool
