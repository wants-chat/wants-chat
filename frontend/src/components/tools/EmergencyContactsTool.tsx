import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, User, Heart, Briefcase, Users, AlertTriangle, Shield, Plus, Trash2, Edit2, Save, X, CreditCard, Activity, Info } from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ContactCategory = 'medical' | 'family' | 'work' | 'other';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  category: ContactCategory;
  isICE: boolean; // In Case of Emergency
  notes?: string;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  insuranceProvider: string;
  insuranceNumber: string;
  primaryDoctor: string;
  doctorPhone: string;
}

interface EmergencyNumber {
  name: string;
  number: string;
  description: string;
}

const CATEGORY_CONFIG: Record<ContactCategory, { name: string; icon: React.ReactNode; color: string }> = {
  medical: { name: 'Medical', icon: <Heart className="w-4 h-4" />, color: 'red' },
  family: { name: 'Family', icon: <Users className="w-4 h-4" />, color: 'blue' },
  work: { name: 'Work', icon: <Briefcase className="w-4 h-4" />, color: 'purple' },
  other: { name: 'Other', icon: <User className="w-4 h-4" />, color: 'gray' },
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { name: 'Emergency Services', number: '911', description: 'Police, Fire, Ambulance' },
  { name: 'Poison Control', number: '1-800-222-1222', description: 'Poison emergencies' },
  { name: 'Suicide Prevention', number: '988', description: 'Mental health crisis' },
  { name: 'Domestic Violence', number: '1-800-799-7233', description: 'National hotline' },
  { name: 'FEMA', number: '1-800-621-3362', description: 'Disaster assistance' },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'relationship', header: 'Relationship', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'isICE', header: 'ICE Contact', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface EmergencyContactsToolProps {
  uiConfig?: UIConfig;
}

export const EmergencyContactsTool: React.FC<EmergencyContactsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'contacts' | 'medical' | 'ice' | 'numbers'>('contacts');
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'all'>('all');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'John Smith', phone: '555-123-4567', relationship: 'Spouse', category: 'family', isICE: true },
    { id: '2', name: 'Dr. Sarah Johnson', phone: '555-987-6543', relationship: 'Primary Physician', category: 'medical', isICE: true },
    { id: '3', name: 'HR Department', phone: '555-456-7890', relationship: 'Work Emergency', category: 'work', isICE: false },
  ]);

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: ['Lisinopril 10mg'],
    conditions: ['Hypertension'],
    insuranceProvider: 'Blue Cross',
    insuranceNumber: 'BC123456789',
    primaryDoctor: 'Dr. Sarah Johnson',
    doctorPhone: '555-987-6543',
  });

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    relationship: '',
    category: 'family',
    isICE: false,
    notes: '',
  });

  const [newItem, setNewItem] = useState('');
  const [addingItemType, setAddingItemType] = useState<'allergies' | 'medications' | 'conditions' | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Prefill new contact form with name and phone
      if (params.texts && params.texts.length > 0) {
        setNewContact(prev => ({ ...prev, name: params.texts![0] }));
        setIsAddingContact(true);
        setIsPrefilled(true);
      }
      if (params.phones && params.phones.length > 0) {
        setNewContact(prev => ({ ...prev, phone: params.phones![0] }));
        setIsAddingContact(true);
        setIsPrefilled(true);
      }
      // Notes can be used for relationship
      if (params.notes) {
        setNewContact(prev => ({ ...prev, relationship: params.notes! }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredContacts = useMemo(() => {
    if (selectedCategory === 'all') return contacts;
    return contacts.filter((c) => c.category === selectedCategory);
  }, [contacts, selectedCategory]);

  const iceContacts = useMemo(() => {
    return contacts.filter((c) => c.isICE);
  }, [contacts]);

  // Prepare export data with formatted category
  const exportData = useMemo(() => {
    return contacts.map((contact) => ({
      ...contact,
      category: CATEGORY_CONFIG[contact.category]?.name || contact.category,
    }));
  }, [contacts]);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship || '',
        category: newContact.category || 'other',
        isICE: newContact.isICE || false,
        notes: newContact.notes,
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', phone: '', relationship: '', category: 'family', isICE: false, notes: '' });
      setIsAddingContact(false);
    }
  };

  const handleUpdateContact = (id: string) => {
    setContacts(
      contacts.map((c) =>
        c.id === id
          ? {
              ...c,
              name: newContact.name || c.name,
              phone: newContact.phone || c.phone,
              relationship: newContact.relationship || c.relationship,
              category: newContact.category || c.category,
              isICE: newContact.isICE ?? c.isICE,
              notes: newContact.notes,
            }
          : c
      )
    );
    setEditingContactId(null);
    setNewContact({ name: '', phone: '', relationship: '', category: 'family', isICE: false, notes: '' });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleStartEdit = (contact: EmergencyContact) => {
    setEditingContactId(contact.id);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      category: contact.category,
      isICE: contact.isICE,
      notes: contact.notes,
    });
  };

  const handleAddMedicalItem = (type: 'allergies' | 'medications' | 'conditions') => {
    if (newItem.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        [type]: [...medicalInfo[type], newItem.trim()],
      });
      setNewItem('');
      setAddingItemType(null);
    }
  };

  const handleRemoveMedicalItem = (type: 'allergies' | 'medications' | 'conditions', index: number) => {
    setMedicalInfo({
      ...medicalInfo,
      [type]: medicalInfo[type].filter((_, i) => i !== index),
    });
  };

  const getCategoryColor = (category: ContactCategory, type: 'bg' | 'text' | 'border') => {
    const colors: Record<ContactCategory, Record<string, string>> = {
      medical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
      family: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
      work: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
      other: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' },
    };
    return colors[category][type];
  };

  const renderContactCard = (contact: EmergencyContact) => {
    const isEditing = editingContactId === contact.id;
    const config = CATEGORY_CONFIG[contact.category];

    if (isEditing) {
      return (
        <div key={contact.id} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t('tools.emergencyContacts.name', 'Name')}
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <input
              type="tel"
              placeholder={t('tools.emergencyContacts.phone', 'Phone')}
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <input
              type="text"
              placeholder={t('tools.emergencyContacts.relationship', 'Relationship')}
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={newContact.category}
              onChange={(e) => setNewContact({ ...newContact, category: e.target.value as ContactCategory })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newContact.isICE}
                onChange={(e) => setNewContact({ ...newContact, isICE: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.emergencyContacts.iceContact', 'ICE Contact')}</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateContact(contact.id)}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={() => {
                  setEditingContactId(null);
                  setNewContact({ name: '', phone: '', relationship: '', category: 'family', isICE: false, notes: '' });
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={contact.id} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(contact.category, 'bg')}`}>
              <span className={getCategoryColor(contact.category, 'text')}>{config.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.name}</h4>
                {contact.isICE && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-500 rounded-full">{t('tools.emergencyContacts.ice', 'ICE')}</span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{contact.relationship}</p>
              <a href={`tel:${contact.phone}`} className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> {contact.phone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartEdit(contact)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <button
              onClick={() => handleDeleteContact(contact.id)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.emergencyContacts.emergencyContacts', 'Emergency Contacts')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.storeAndManageEmergencyInformation', 'Store and manage emergency information')}</p>
            </div>
          </div>
          {contacts.length > 0 && (
            <ExportDropdown
              onExportCSV={() => exportToCSV(exportData, COLUMNS, { filename: 'emergency-contacts' })}
              onExportExcel={() => exportToExcel(exportData, COLUMNS, { filename: 'emergency-contacts' })}
              onExportJSON={() => exportToJSON(exportData, { filename: 'emergency-contacts' })}
              onExportPDF={async () => {
                await exportToPDF(exportData, COLUMNS, {
                  filename: 'emergency-contacts',
                  title: 'Emergency Contacts',
                  subtitle: `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} saved`,
                });
              }}
              onPrint={() => printData(exportData, COLUMNS, { title: 'Emergency Contacts' })}
              onCopyToClipboard={() => copyUtil(exportData, COLUMNS, 'tab')}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'contacts', label: 'Contacts', icon: <Users className="w-4 h-4" /> },
            { key: 'medical', label: 'Medical Info', icon: <Activity className="w-4 h-4" /> },
            { key: 'ice', label: 'ICE Card', icon: <CreditCard className="w-4 h-4" /> },
            { key: 'numbers', label: 'Emergency #', icon: <Phone className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-red-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-red-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.emergencyContacts.all', 'All')}
              </button>
              {(Object.keys(CATEGORY_CONFIG) as ContactCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-red-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {CATEGORY_CONFIG[cat].icon}
                  {CATEGORY_CONFIG[cat].name}
                </button>
              ))}
            </div>

            {/* Add Contact Form */}
            {isAddingContact ? (
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.emergencyContacts.addNewContact', 'Add New Contact')}</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('tools.emergencyContacts.name2', 'Name *')}
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.emergencyContacts.phoneNumber', 'Phone Number *')}
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.emergencyContacts.relationshipEGSpouseDoctor', 'Relationship (e.g., Spouse, Doctor)')}
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <select
                    value={newContact.category}
                    onChange={(e) => setNewContact({ ...newContact, category: e.target.value as ContactCategory })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.name}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newContact.isICE}
                      onChange={(e) => setNewContact({ ...newContact, isICE: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.emergencyContacts.markAsIceInCase', 'Mark as ICE (In Case of Emergency)')}</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddContact}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Contact
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingContact(false);
                        setNewContact({ name: '', phone: '', relationship: '', category: 'family', isICE: false, notes: '' });
                      }}
                      className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tools.emergencyContacts.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingContact(true)}
                className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${
                  isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                <Plus className="w-5 h-5" /> Add New Contact
              </button>
            )}

            {/* Contact List */}
            <div className="space-y-3">
              {filteredContacts.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.emergencyContacts.noContactsFoundAddYour', 'No contacts found. Add your first emergency contact above.')}
                </div>
              ) : (
                filteredContacts.map((contact) => renderContactCard(contact))
              )}
            </div>
          </div>
        )}

        {/* Medical Info Tab */}
        {activeTab === 'medical' && (
          <div className="space-y-4">
            {/* Blood Type */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.emergencyContacts.bloodType2', 'Blood Type')}
              </label>
              <div className="flex flex-wrap gap-2">
                {BLOOD_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setMedicalInfo({ ...medicalInfo, bloodType: type })}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      medicalInfo.bloodType === type
                        ? 'bg-red-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.emergencyContacts.allergies2', 'Allergies')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {medicalInfo.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm flex items-center gap-1"
                  >
                    {allergy}
                    <button onClick={() => handleRemoveMedicalItem('allergies', index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {addingItemType === 'allergies' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('tools.emergencyContacts.addAllergy', 'Add allergy')}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => handleAddMedicalItem('allergies')}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg"
                  >
                    {t('tools.emergencyContacts.add', 'Add')}
                  </button>
                  <button
                    onClick={() => {
                      setAddingItemType(null);
                      setNewItem('');
                    }}
                    className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.emergencyContacts.cancel2', 'Cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingItemType('allergies')}
                  className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <Plus className="w-4 h-4" /> Add allergy
                </button>
              )}
            </div>

            {/* Medications */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.emergencyContacts.currentMedications2', 'Current Medications')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {medicalInfo.medications.map((med, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm flex items-center gap-1"
                  >
                    {med}
                    <button onClick={() => handleRemoveMedicalItem('medications', index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {addingItemType === 'medications' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('tools.emergencyContacts.addMedication', 'Add medication')}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => handleAddMedicalItem('medications')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    {t('tools.emergencyContacts.add2', 'Add')}
                  </button>
                  <button
                    onClick={() => {
                      setAddingItemType(null);
                      setNewItem('');
                    }}
                    className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.emergencyContacts.cancel3', 'Cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingItemType('medications')}
                  className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <Plus className="w-4 h-4" /> Add medication
                </button>
              )}
            </div>

            {/* Medical Conditions */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.emergencyContacts.medicalConditions', 'Medical Conditions')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {medicalInfo.conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm flex items-center gap-1"
                  >
                    {condition}
                    <button onClick={() => handleRemoveMedicalItem('conditions', index)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {addingItemType === 'conditions' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('tools.emergencyContacts.addCondition', 'Add condition')}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => handleAddMedicalItem('conditions')}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg"
                  >
                    {t('tools.emergencyContacts.add3', 'Add')}
                  </button>
                  <button
                    onClick={() => {
                      setAddingItemType(null);
                      setNewItem('');
                    }}
                    className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.emergencyContacts.cancel4', 'Cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingItemType('conditions')}
                  className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <Plus className="w-4 h-4" /> Add condition
                </button>
              )}
            </div>

            {/* Insurance & Doctor Info */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.emergencyContacts.insuranceDoctorInformation', 'Insurance & Doctor Information')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.insuranceProvider', 'Insurance Provider')}</label>
                  <input
                    type="text"
                    value={medicalInfo.insuranceProvider}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, insuranceProvider: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.policyNumber', 'Policy Number')}</label>
                  <input
                    type="text"
                    value={medicalInfo.insuranceNumber}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, insuranceNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.primaryDoctor', 'Primary Doctor')}</label>
                  <input
                    type="text"
                    value={medicalInfo.primaryDoctor}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, primaryDoctor: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.doctorPhone', 'Doctor Phone')}</label>
                  <input
                    type="tel"
                    value={medicalInfo.doctorPhone}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, doctorPhone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ICE Card Tab */}
        {activeTab === 'ice' && (
          <div className="space-y-4">
            <div className={`p-6 rounded-xl border-2 ${isDark ? 'bg-gradient-to-br from-red-900/30 to-gray-800 border-red-800' : 'bg-gradient-to-br from-red-50 to-white border-red-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-500" />
                  <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.emergencyContacts.iceInCaseOfEmergency', 'ICE - In Case of Emergency')}</h4>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  {t('tools.emergencyContacts.medicalId', 'Medical ID')}
                </span>
              </div>

              {/* Blood Type Badge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-bold">
                    {medicalInfo.bloodType}
                  </div>
                  <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.bloodType', 'Blood Type')}</span>
                </div>
                <div className="flex-1">
                  {medicalInfo.allergies.length > 0 && (
                    <div className="mb-2">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.allergies', 'ALLERGIES:')}</span>
                      <p className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {medicalInfo.allergies.join(', ')}
                      </p>
                    </div>
                  )}
                  {medicalInfo.conditions.length > 0 && (
                    <div>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.conditions', 'CONDITIONS:')}</span>
                      <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {medicalInfo.conditions.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medications */}
              {medicalInfo.medications.length > 0 && (
                <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.currentMedications', 'CURRENT MEDICATIONS:')}</span>
                  <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {medicalInfo.medications.join(', ')}
                  </p>
                </div>
              )}

              {/* Emergency Contacts */}
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.emergencyContacts2', 'EMERGENCY CONTACTS:')}</span>
                <div className="mt-2 space-y-2">
                  {iceContacts.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.emergencyContacts.noIceContactsSetMark', 'No ICE contacts set. Mark contacts as ICE to show them here.')}
                    </p>
                  ) : (
                    iceContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between">
                        <div>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.name}</span>
                          <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({contact.relationship})</span>
                        </div>
                        <a href={`tel:${contact.phone}`} className="text-blue-500 font-medium">
                          {contact.phone}
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Doctor Info */}
              {medicalInfo.primaryDoctor && (
                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.primaryPhysician', 'PRIMARY PHYSICIAN:')}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{medicalInfo.primaryDoctor}</span>
                    <a href={`tel:${medicalInfo.doctorPhone}`} className="text-blue-500">
                      {medicalInfo.doctorPhone}
                    </a>
                  </div>
                </div>
              )}

              {/* Insurance */}
              {medicalInfo.insuranceProvider && (
                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emergencyContacts.insurance', 'INSURANCE:')}</span>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>
                    {medicalInfo.insuranceProvider} - {medicalInfo.insuranceNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.emergencyContacts.tips', 'Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Keep a screenshot of this ICE card on your phone lock screen</li>
                    <li>- Share this information with family members</li>
                    <li>- Update medical info regularly</li>
                    <li>- Mark your most important contacts as ICE</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Numbers Tab */}
        {activeTab === 'numbers' && (
          <div className="space-y-3">
            {EMERGENCY_NUMBERS.map((num, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{num.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{num.description}</p>
                  </div>
                  <a
                    href={`tel:${num.number.replace(/-/g, '')}`}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {num.number}
                  </a>
                </div>
              </div>
            ))}

            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.emergencyContacts.inAnEmergency', 'In an Emergency')}</h4>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.emergencyContacts.ifYouAreInImmediate', 'If you are in immediate danger, call 911 first. Stay calm, provide your location, and describe the emergency clearly.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsTool;
