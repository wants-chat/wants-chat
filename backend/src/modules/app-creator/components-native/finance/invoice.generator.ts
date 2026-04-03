/**
 * Invoice Component Generators (React Native)
 *
 * Generates invoice list, detail view, and creation form components.
 * Uses FlatList for lists and ScrollView for forms.
 */

export interface InvoiceOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInvoiceList(options: InvoiceOptions = {}): string {
  const { componentName = 'InvoiceList', endpoint = '/invoices' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Invoice {
  id: string;
  number?: string;
  client_name: string;
  amount: number;
  created_at: string;
  due_date: string;
  status: string;
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'overdue';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices', status],
    queryFn: async () => {
      const url = '${endpoint}' + (status !== 'all' ? '?status=' + status : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusStyle = (invoiceStatus: string) => {
    switch (invoiceStatus?.toLowerCase()) {
      case 'paid':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'overdue':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' },
  ];

  const renderInvoiceItem = useCallback(({ item }: { item: Invoice }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.invoiceItem}
        onPress={() => navigation.navigate('InvoiceDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.invoiceRow}>
          <View style={styles.invoiceInfo}>
            <View style={styles.invoiceHeader}>
              <Ionicons name="document-text-outline" size={18} color="#8B5CF6" />
              <Text style={styles.invoiceNumber}>
                {item.number || \`#\${item.id}\`}
              </Text>
            </View>
            <Text style={styles.clientName}>{item.client_name}</Text>
          </View>
          <View style={styles.invoiceAmountContainer}>
            <Text style={styles.invoiceAmount}>
              \${(item.amount || 0).toLocaleString()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.invoiceDates}>
          <Text style={styles.dateText}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.dateText}>
            Due: {new Date(item.due_date).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                status === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setStatus(filter.key)}
            >
              <Text style={[
                styles.filterTabText,
                status === filter.key && styles.filterTabTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('InvoiceForm' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Invoice List */}
      <FlatList
        data={invoices || []}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No invoices found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  invoiceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  clientName: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 24,
  },
  invoiceAmountContainer: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  invoiceDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateInvoiceDetail(options: InvoiceOptions = {}): string {
  const { componentName = 'InvoiceDetail', endpoint = '/invoices' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  created_at: string;
  due_date: string;
  from_name?: string;
  from_email?: string;
  from_address?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  items?: InvoiceItem[];
  subtotal: number;
  tax?: number;
  tax_rate?: number;
  amount: number;
  notes?: string;
}

type RouteParams = {
  InvoiceDetail: { id: string };
};

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'InvoiceDetail'>>();
  const { id } = route.params;

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'overdue':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  const handlePrint = useCallback(() => {
    Alert.alert('Print', 'Print functionality would be implemented here');
  }, []);

  const handleDownload = useCallback(() => {
    Alert.alert('Download', 'Download functionality would be implemented here');
  }, []);

  const handleSend = useCallback(() => {
    Alert.alert('Send Invoice', 'Send invoice to client?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => {} },
    ]);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Invoice not found</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(invoice.status);

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          {invoice.status !== 'paid' && (
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View>
            <Text style={styles.invoiceNumber}>Invoice {invoice.number}</Text>
            <Text style={styles.invoiceDate}>
              Issued: {new Date(invoice.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesContainer}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{invoice.from_name || 'Your Company'}</Text>
            {invoice.from_email && (
              <Text style={styles.partyDetail}>{invoice.from_email}</Text>
            )}
            {invoice.from_address && (
              <Text style={styles.partyDetail}>{invoice.from_address}</Text>
            )}
          </View>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>To</Text>
            <Text style={styles.partyName}>{invoice.client_name}</Text>
            {invoice.client_email && (
              <Text style={styles.partyDetail}>{invoice.client_email}</Text>
            )}
            {invoice.client_address && (
              <Text style={styles.partyDetail}>{invoice.client_address}</Text>
            )}
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemCol, { flex: 2 }]}>Description</Text>
            <Text style={styles.itemCol}>Qty</Text>
            <Text style={styles.itemCol}>Rate</Text>
            <Text style={styles.itemCol}>Amount</Text>
          </View>
          {invoice.items?.map((item: InvoiceItem, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={[styles.itemText, { flex: 2 }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.itemText}>{item.quantity}</Text>
              <Text style={styles.itemText}>\${item.rate?.toLocaleString()}</Text>
              <Text style={[styles.itemText, styles.itemAmount]}>
                \${item.amount?.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>\${invoice.subtotal?.toLocaleString()}</Text>
          </View>
          {invoice.tax && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text style={styles.totalValue}>\${invoice.tax?.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>\${invoice.amount?.toLocaleString()}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  partiesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  partyCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  partyLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  partyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    textAlign: 'right',
  },
  itemAmount: {
    fontWeight: '600',
  },
  totalsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    color: '#111827',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  notesContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}

export function generateInvoiceForm(options: InvoiceOptions = {}): string {
  const { componentName = 'InvoiceForm', endpoint = '/invoices' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0 },
  ]);
  const [notes, setNotes] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      showToast('success', 'Invoice created!');
      navigation.navigate('InvoiceDetail' as never, {
        id: response?.data?.id || response?.id,
      } as never);
    },
    onError: () => showToast('error', 'Failed to create invoice'),
  });

  const addItem = useCallback(() => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  }, [items]);

  const removeItem = useCallback((index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }, [items]);

  const updateItem = useCallback((
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }, [items]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  const handleSubmit = useCallback(() => {
    if (!clientName.trim()) {
      Alert.alert('Error', 'Please enter client name');
      return;
    }
    if (!clientEmail.trim()) {
      Alert.alert('Error', 'Please enter client email');
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert('Error', 'Please enter due date');
      return;
    }

    createMutation.mutate({
      client_name: clientName,
      client_email: clientEmail,
      due_date: dueDate,
      items: items.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
      subtotal,
      amount: subtotal,
      notes,
    });
  }, [clientName, clientEmail, dueDate, items, subtotal, notes, createMutation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Invoice</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Client Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Client Name *</Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Enter client name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Client Email *</Text>
            <TextInput
              style={styles.input}
              value={clientEmail}
              onChangeText={setClientEmail}
              placeholder="Enter client email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date *</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.input}
                    value={item.description}
                    onChangeText={(value) => updateItem(index, 'description', value)}
                    placeholder="Item description"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.itemNumbers}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Qty</Text>
                  <TextInput
                    style={styles.input}
                    value={String(item.quantity)}
                    onChangeText={(value) =>
                      updateItem(index, 'quantity', parseInt(value) || 1)
                    }
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Rate</Text>
                  <TextInput
                    style={styles.input}
                    value={String(item.rate)}
                    onChangeText={(value) =>
                      updateItem(index, 'rate', parseFloat(value) || 0)
                    }
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Amount</Text>
                  <View style={[styles.input, styles.amountDisplay]}>
                    <Text style={styles.amountText}>
                      \${(item.quantity * item.rate).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
            <Ionicons name="add" size={18} color="#8B5CF6" />
            <Text style={styles.addItemText}>Add Item</Text>
          </TouchableOpacity>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>\${subtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Payment terms, bank details, etc."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            createMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Invoice</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  itemCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  removeButton: {
    padding: 12,
    marginTop: 20,
  },
  amountDisplay: {
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 2,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
