'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Square,
  DollarSign,
  Camera,
  Eye,
  Calendar,
  Tag,
  Building,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface PropertyListing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse' | 'commercial' | 'land';
  listingType: 'sale' | 'rent';
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  yearBuilt?: number;
  description: string;
  features: string[];
  images: string[];
  status: 'active' | 'pending' | 'sold' | 'rented' | 'withdrawn';
  mlsNumber?: string;
  agentName?: string;
  agentPhone?: string;
  listDate: string;
  views: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'listingType', header: 'Listing Type', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'bedrooms', header: 'Bedrooms', type: 'number' },
  { key: 'bathrooms', header: 'Bathrooms', type: 'number' },
  { key: 'sqft', header: 'Square Feet', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'listDate', header: 'List Date', type: 'date' },
  { key: 'views', header: 'Views', type: 'number' },
];

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const LISTING_STATUSES = [
  { value: 'active', label: 'Active', color: 'text-green-500 bg-green-500/10' },
  { value: 'pending', label: 'Pending', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'sold', label: 'Sold', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'rented', label: 'Rented', color: 'text-purple-500 bg-purple-500/10' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'text-gray-500 bg-gray-500/10' },
];

export const PropertyListingTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: listings,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<PropertyListing>('property-listing', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [form, setForm] = useState<Partial<PropertyListing>>({
    title: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'house',
    listingType: 'sale',
    price: 0,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 0,
    description: '',
    features: [],
    images: [],
    status: 'active',
    views: 0,
    inquiries: 0,
  });

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      const matchesType = typeFilter === 'all' || listing.propertyType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [listings, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const active = listings.filter(l => l.status === 'active').length;
    const pending = listings.filter(l => l.status === 'pending').length;
    const sold = listings.filter(l => l.status === 'sold' || l.status === 'rented').length;
    const totalValue = listings.filter(l => l.status === 'active').reduce((sum, l) => sum + l.price, 0);
    return { active, pending, sold, totalValue };
  }, [listings]);

  const handleSubmit = () => {
    if (!form.title || !form.address || !form.price) return;

    const now = new Date().toISOString();
    if (editingListing) {
      updateItem(editingListing.id, {
        ...form,
        updatedAt: now,
      });
    } else {
      const newListing: PropertyListing = {
        id: `listing-${Date.now()}`,
        title: form.title || '',
        address: form.address || '',
        city: form.city || '',
        state: form.state || '',
        zipCode: form.zipCode || '',
        propertyType: form.propertyType || 'house',
        listingType: form.listingType || 'sale',
        price: form.price || 0,
        bedrooms: form.bedrooms || 0,
        bathrooms: form.bathrooms || 0,
        sqft: form.sqft || 0,
        lotSize: form.lotSize,
        yearBuilt: form.yearBuilt,
        description: form.description || '',
        features: form.features || [],
        images: form.images || [],
        status: form.status || 'active',
        mlsNumber: form.mlsNumber,
        agentName: form.agentName,
        agentPhone: form.agentPhone,
        listDate: new Date().toISOString().split('T')[0],
        views: 0,
        inquiries: 0,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newListing);
    }
    resetForm();
    setShowModal(false);
    setEditingListing(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Listing',
      message: 'Are you sure you want to delete this listing?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: 'house',
      listingType: 'sale',
      price: 0,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 0,
      description: '',
      features: [],
      images: [],
      status: 'active',
      views: 0,
      inquiries: 0,
    });
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-lg">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.propertyListing.propertyListing', 'Property Listing')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.propertyListing.manageYourPropertyListings', 'Manage your property listings')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="property-listing" toolName="Property Listing" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <Tag className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyListing.active', 'Active')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.active}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyListing.pending', 'Pending')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Building className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyListing.soldRented', 'Sold/Rented')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.sold}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyListing.totalValue', 'Total Value')}</p>
                <p className={`text-xl font-bold text-teal-500`}>${(stats.totalValue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.propertyListing.searchListings', 'Search listings...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClass} pl-10 w-64`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">{t('tools.propertyListing.allStatus', 'All Status')}</option>
                {LISTING_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">{t('tools.propertyListing.allTypes', 'All Types')}</option>
                {PROPERTY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'property-listings' })}
                onExportExcel={() => exportExcel({ filename: 'property-listings' })}
                onExportJSON={() => exportJSON({ filename: 'property-listings' })}
                onExportPDF={async () => { await exportPDF({ filename: 'property-listings', title: 'Property Listings' }); }}
                onPrint={() => print('Property Listings')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={listings.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.propertyListing.addListing', 'Add Listing')}
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(listing => {
            const statusInfo = LISTING_STATUSES.find(s => s.value === listing.status);
            return (
              <div key={listing.id} className={`${cardClass} overflow-hidden hover:shadow-lg transition-shadow`}>
                <div className={`h-40 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                  <Camera className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {listing.title}
                      </h3>
                      <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="w-3.5 h-3.5" />
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                      {statusInfo?.label}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-teal-500 mb-3">
                    ${listing.price.toLocaleString()}
                    {listing.listingType === 'rent' && <span className="text-sm font-normal">/mo</span>}
                  </p>

                  <div className="flex items-center gap-4 mb-3">
                    <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <BedDouble className="w-4 h-4" />
                      {listing.bedrooms}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Bath className="w-4 h-4" />
                      {listing.bathrooms}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Square className="w-4 h-4" />
                      {listing.sqft.toLocaleString()} sqft
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.views} views
                    </span>
                    <span className="capitalize">{listing.propertyType}</span>
                  </div>

                  <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button
                      onClick={() => {
                        setEditingListing(listing);
                        setForm(listing);
                        setShowModal(true);
                      }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm ${buttonSecondary}`}
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('tools.propertyListing.edit', 'Edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <Home className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyListing.noListingsFound', 'No listings found')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.propertyListing.addYourFirstPropertyListing', 'Add your first property listing')}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingListing ? t('tools.propertyListing.editListing', 'Edit Listing') : t('tools.propertyListing.addNewListing', 'Add New Listing')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingListing(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.propertyListing.title', 'Title *')}</label>
                  <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('tools.propertyListing.beautifulFamilyHome', 'Beautiful Family Home')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.propertyListing.address', 'Address *')}</label>
                  <input type="text" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t('tools.propertyListing.123MainStreet', '123 Main Street')} className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.city', 'City')}</label>
                    <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.state', 'State')}</label>
                    <input type="text" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.zipCode', 'Zip Code')}</label>
                    <input type="text" value={form.zipCode || ''} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.propertyType', 'Property Type')}</label>
                    <select value={form.propertyType || 'house'} onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyListing['propertyType'] })} className={inputClass}>
                      {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.listingType', 'Listing Type')}</label>
                    <select value={form.listingType || 'sale'} onChange={(e) => setForm({ ...form, listingType: e.target.value as 'sale' | 'rent' })} className={inputClass}>
                      <option value="sale">{t('tools.propertyListing.forSale', 'For Sale')}</option>
                      <option value="rent">{t('tools.propertyListing.forRent', 'For Rent')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.price', 'Price *')}</label>
                    <input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.status', 'Status')}</label>
                    <select value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value as PropertyListing['status'] })} className={inputClass}>
                      {LISTING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.bedrooms', 'Bedrooms')}</label>
                    <input type="number" value={form.bedrooms || ''} onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.bathrooms', 'Bathrooms')}</label>
                    <input type="number" value={form.bathrooms || ''} onChange={(e) => setForm({ ...form, bathrooms: parseFloat(e.target.value) || 0 })} min="0" step="0.5" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.squareFeet', 'Square Feet')}</label>
                    <input type="number" value={form.sqft || ''} onChange={(e) => setForm({ ...form, sqft: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.yearBuilt', 'Year Built')}</label>
                    <input type="number" value={form.yearBuilt || ''} onChange={(e) => setForm({ ...form, yearBuilt: parseInt(e.target.value) || undefined })} min="1800" max="2030" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.propertyListing.mlsNumber', 'MLS Number')}</label>
                    <input type="text" value={form.mlsNumber || ''} onChange={(e) => setForm({ ...form, mlsNumber: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.propertyListing.description', 'Description')}</label>
                  <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingListing(null); resetForm(); }} className={buttonSecondary}>{t('tools.propertyListing.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.title || !form.address || !form.price} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingListing ? t('tools.propertyListing.update', 'Update') : t('tools.propertyListing.add', 'Add')} Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default PropertyListingTool;
