import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building2,
  MapPin,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  country?: string;
  type: 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor';
  status: 'active' | 'inactive' | 'archived';
  total_spent: number;
  notes?: string;
  created_at: string;
}

interface CustomerDatabaseToolProps {
  uiConfig?: UIConfig;
}

const customerTypes = [
  { value: 'lead', label: 'Lead', color: 'blue' },
  { value: 'prospect', label: 'Prospect', color: 'purple' },
  { value: 'customer', label: 'Customer', color: 'green' },
  { value: 'partner', label: 'Partner', color: 'orange' },
  { value: 'vendor', label: 'Vendor', color: 'gray' },
];

const customerStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

// Column configuration for export
const customerExportColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'address_line1', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'country', header: 'Country', type: 'string' },
  { key: 'total_spent', header: 'Total Spent', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'created_at', header: 'Created At', type: 'date' },
];

export const CustomerDatabaseTool: React.FC<CustomerDatabaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address_line1: '',
    city: '',
    state: '',
    country: '',
    type: 'customer' as Customer['type'],
    status: 'active' as Customer['status'],
    notes: '',
  });

  // Use the useToolData hook for backend sync
  const {
    data: customers,
    isLoading,
    isSaving,
    isSynced,
    syncError,
    lastSaved,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<Customer>('customer-database', [], customerExportColumns);

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filterType || customer.type === filterType;
    const matchesStatus = !filterStatus || customer.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats from filtered data
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    leads: customers.filter(c => c.type === 'lead').length,
  };

  // Open modal for new customer
  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address_line1: '',
      city: '',
      state: '',
      country: '',
      type: 'customer',
      status: 'active',
      notes: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      address_line1: customer.address_line1 || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || '',
      type: customer.type,
      status: customer.status,
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  // Save customer
  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingCustomer) {
      // Update existing customer
      updateItem(editingCustomer.id, {
        ...formData,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Add new customer
      addItem({
        id: `customer_${Date.now()}`,
        ...formData,
        total_spent: 0,
        created_at: new Date().toISOString(),
      });
    }

    setShowModal(false);
  };

  // Delete customer
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getTypeColor = (type: string) => {
    const typeObj = customerTypes.find(t => t.value === type);
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[typeObj?.color || 'gray'];
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : t('tools.customerDatabase.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5 border-gray-100')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerDatabase.customerDatabase', 'Customer Database')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.customerDatabase.manageYourCustomersAndContacts', 'Manage your customers and contacts')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="customer-database" toolName="Customer Database" />

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
              onExportCSV={() => exportCSV({ filename: 'customers' })}
              onExportExcel={() => exportExcel({ filename: 'customers' })}
              onExportJSON={() => exportJSON({ filename: 'customers' })}
              onExportPDF={() => exportPDF({ filename: 'customers', title: 'Customer Database' })}
              onPrint={() => print('Customer Database')}
              onCopyToClipboard={() => copyToClipboard()}
              disabled={customers.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t('tools.customerDatabase.addCustomer', 'Add Customer')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerDatabase.totalCustomers', 'Total Customers')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold text-green-500`}>{stats.active}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerDatabase.active', 'Active')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold text-blue-500`}>{stats.leads}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerDatabase.leads', 'Leads')}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.customerDatabase.searchCustomers', 'Search customers...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.customerDatabase.allTypes', 'All Types')}</option>
              {customerTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.customerDatabase.allStatuses', 'All Statuses')}</option>
              {customerStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sync Error */}
      {syncError && (
        <div className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4" />
          {syncError}
        </div>
      )}

      {/* Customer List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{customers.length === 0 ? t('tools.customerDatabase.noCustomersFound', 'No customers found') : t('tools.customerDatabase.noMatchingCustomers', 'No matching customers')}</p>
            <button onClick={handleAddNew} className="mt-2 text-[#0D9488] hover:underline">
              {customers.length === 0 ? t('tools.customerDatabase.addYourFirstCustomer', 'Add your first customer') : t('tools.customerDatabase.clearFiltersAndTryAgain', 'Clear filters and try again')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {customer.name}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(customer.type)}`}>
                        {customerTypes.find(t => t.value === customer.type)?.label}
                      </span>
                    </div>
                    <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                      )}
                      {customer.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {customer.company}
                        </span>
                      )}
                      {customer.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {customer.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingCustomer ? t('tools.customerDatabase.editCustomer', 'Edit Customer') : t('tools.customerDatabase.addCustomer2', 'Add Customer')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerDatabase.name', 'Name *')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder={t('tools.customerDatabase.customerName', 'Customer name')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerDatabase.company', 'Company')}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.type', 'Type')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Customer['type'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {customerTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.status', 'Status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {customerStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerDatabase.address', 'Address')}
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.city', 'City')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.state', 'State')}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerDatabase.country', 'Country')}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.customerDatabase.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.customerDatabase.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? t('tools.customerDatabase.saving', 'Saving...') : t('tools.customerDatabase.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default CustomerDatabaseTool;
