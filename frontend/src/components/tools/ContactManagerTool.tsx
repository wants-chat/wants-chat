'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { ColumnConfig } from '../../lib/toolDataUtils';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  createdAt: string;
}

const CONTACT_COLUMNS: ColumnConfig[] = [
  { header: 'Name', key: 'name', type: 'string' },
  { header: 'Email', key: 'email', type: 'string' },
  { header: 'Phone', key: 'phone', type: 'string' },
  { header: 'Company', key: 'company', type: 'string' },
  { header: 'Notes', key: 'notes', type: 'string' },
];

interface ContactManagerToolProps {
  uiConfig?: UIConfig;
}

export const ContactManagerTool: React.FC<ContactManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const {
    data: contacts,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    isLoading,
  } = useToolData<Contact>('contact-manager', [], CONTACT_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.formData) setFormData(params.formData);
      if (params.searchQuery) setSearchQuery(params.searchQuery);
      if (params.editingId) setEditingId(params.editingId);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setValidationMessage('Please fill in at least name and email');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingId) {
      // Update existing contact
      updateItem(editingId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        notes: formData.notes || '',
      });
      setEditingId(null);
    } else {
      // Add new contact
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
      };
      addItem(newContact);
    }

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    });

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  // Handle edit button
  const handleEdit = (contact: Contact) => {
    setFormData(contact);
    setEditingId(contact.id);
  };

  // Handle delete button
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: 'Are you sure you want to delete this contact? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    const result = exportCSV();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export CSV');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportExcel = () => {
    const result = exportExcel();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export Excel');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportJSON = () => {
    const result = exportJSON();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export JSON');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportPDF = async () => {
    const result = await exportPDF();
    if (!result.success) {
      setValidationMessage(result.error || 'Failed to export PDF');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImportCSV = async (file: File) => {
    const result = await importCSV(file);
    if (result.success) {
      setValidationMessage(`Successfully imported ${result.rowCount} contacts`);
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage(result.errors?.join(', ') || 'Failed to import CSV');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImportJSON = async (file: File) => {
    const result = await importJSON(file);
    if (result.success) {
      setValidationMessage(`Successfully imported ${result.rowCount} contacts`);
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage(result.errors?.join(', ') || 'Failed to import JSON');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard('csv');
    if (success) {
      setValidationMessage('Contacts copied to clipboard');
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage('Failed to copy to clipboard');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handlePrint = () => {
    print('Contact Manager');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('tools.contactManager.contactManager', 'Contact Manager')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('tools.contactManager.manageAndOrganizeYourContacts', 'Manage and organize your contacts')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="contact-manager" toolName="Contact Manager" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme="light"
                showLabel={true}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Error message if sync failed */}
        {syncError && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{syncError}</p>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">{validationMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingId ? t('tools.contactManager.editContact', 'Edit Contact') : t('tools.contactManager.addNewContact', 'Add New Contact')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.contactManager.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('tools.contactManager.johnDoe', 'John Doe')}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.contactManager.email', 'Email *')}
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('tools.contactManager.johnExampleCom', 'john@example.com')}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.contactManager.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.contactManager.company', 'Company')}
                  </label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('tools.contactManager.acmeCorp', 'Acme Corp')}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.contactManager.notes', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('tools.contactManager.addAnyAdditionalNotes', 'Add any additional notes...')}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="inline-block w-4 h-4 mr-2" />
                    {editingId ? t('tools.contactManager.update', 'Update') : t('tools.contactManager.addContact', 'Add Contact')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <X className="inline-block w-4 h-4 mr-2" />
                      {t('tools.contactManager.cancel', 'Cancel')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Contacts List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {/* Search and Export */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.contactManager.searchByNameEmailOr', 'Search by name, email or phone...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Export Dropdown */}
                  <ExportDropdown
                    onExportCSV={handleExportCSV}
                    onExportExcel={handleExportExcel}
                    onExportJSON={handleExportJSON}
                    onExportPDF={handleExportPDF}
                    onPrint={handlePrint}
                    onCopyToClipboard={handleCopyToClipboard}
                    onImportCSV={handleImportCSV}
                    onImportJSON={handleImportJSON}
                    showImport={true}
                    theme="light"
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="overflow-x-auto">
                {filteredContacts.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('tools.contactManager.name2', 'Name')}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('tools.contactManager.email2', 'Email')}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('tools.contactManager.phone2', 'Phone')}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('tools.contactManager.company2', 'Company')}
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('tools.contactManager.actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr
                          key={contact.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {contact.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {contact.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {contact.phone || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {contact.company || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(contact)}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title={t('tools.contactManager.editContact2', 'Edit contact')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(contact.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t('tools.contactManager.deleteContact', 'Delete contact')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? t('tools.contactManager.noContactsFoundMatchingYour', 'No contacts found matching your search') : t('tools.contactManager.noContactsYetAddOne', 'No contacts yet. Add one to get started!')}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with count */}
              {filteredContacts.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredContacts.length} of {contacts.length} contacts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ContactManagerTool;
