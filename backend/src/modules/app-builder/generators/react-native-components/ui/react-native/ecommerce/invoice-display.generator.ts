/**
 * React Native Invoice Display Generator
 * Generates an invoice display component
 */

export function generateRNInvoiceDisplay(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface InvoiceItem {
  id: string | number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceDisplayProps {
  invoiceData?: any;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  status?: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyEmail?: string;
  companyPhone?: string;
  clientName?: string;
  clientAddress?: string;
  clientCity?: string;
  clientEmail?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  paymentTerms?: string;
  notes?: string;
  downloadButton?: string;
  printButton?: string;
  sendButton?: string;
  payNowButton?: string;
  onDownload?: () => void;
  onPrint?: () => void;
  onSend?: () => void;
  onPayNow?: () => void;
  [key: string]: any;
}

export default function InvoiceDisplay({
  invoiceData: propData,
  invoiceNumber: propInvoiceNumber = 'INV-001',
  invoiceDate: propInvoiceDate = '',
  dueDate: propDueDate = '',
  status: propStatus = 'Unpaid',
  companyName: propCompanyName = 'Company Name',
  companyAddress: propCompanyAddress = '',
  companyCity: propCompanyCity = '',
  companyEmail: propCompanyEmail = '',
  companyPhone: propCompanyPhone = '',
  clientName: propClientName = 'Client Name',
  clientAddress: propClientAddress = '',
  clientCity: propClientCity = '',
  clientEmail: propClientEmail = '',
  items: propItems = [],
  subtotal: propSubtotal = 0,
  tax: propTax = 0,
  discount: propDiscount = 0,
  total: propTotal = 0,
  paymentTerms = '',
  notes = '',
  downloadButton = 'Download',
  printButton = 'Print',
  sendButton = 'Send',
  payNowButton = 'Pay Now',
  onDownload,
  onPrint,
  onSend,
  onPayNow
}: InvoiceDisplayProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/invoices\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch invoice data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const invoiceNumber = data.invoiceNumber || propInvoiceNumber;
  const invoiceDate = data.invoiceDate || propInvoiceDate;
  const dueDate = data.dueDate || propDueDate;
  const status = data.status || propStatus;
  const companyName = data.companyName || propCompanyName;
  const companyAddress = data.companyAddress || propCompanyAddress;
  const companyCity = data.companyCity || propCompanyCity;
  const companyEmail = data.companyEmail || propCompanyEmail;
  const companyPhone = data.companyPhone || propCompanyPhone;
  const clientName = data.clientName || propClientName;
  const clientAddress = data.clientAddress || propClientAddress;
  const clientCity = data.clientCity || propClientCity;
  const clientEmail = data.clientEmail || propClientEmail;
  const items = data.items || propItems;
  const subtotal = data.subtotal ?? propSubtotal;
  const tax = data.tax ?? propTax;
  const discount = data.discount ?? propDiscount;
  const total = data.total ?? propTotal;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleDownload = () => {
    onDownload ? onDownload() : Alert.alert('Download', 'Downloading invoice...');
  };

  const handlePrint = () => {
    onPrint ? onPrint() : Alert.alert('Print', 'Printing invoice...');
  };

  const handleSend = () => {
    onSend ? onSend() : Alert.alert('Send', \`Sending invoice to \${clientEmail}\`);
  };

  const handlePayNow = () => {
    onPayNow ? onPayNow() : Alert.alert('Pay Now', \`Redirecting to payment for $\${total.toFixed(2)}\`);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Paid': '#10b981',
      'Unpaid': '#ef4444',
      'Overdue': '#f97316',
      'Draft': '#6b7280'
    };
    return colors[status] || colors['Draft'];
  };

  const getStatusBgColor = (status: string) => {
    const colors: any = {
      'Paid': '#d1fae5',
      'Unpaid': '#fee2e2',
      'Overdue': '#fed7aa',
      'Draft': '#e5e7eb'
    };
    return colors[status] || colors['Draft'];
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {status}
          </Text>
        </View>
      </View>

      {/* From/To Section */}
      <View style={styles.partiesSection}>
        <View style={styles.party}>
          <Text style={styles.partyLabel}>From</Text>
          <Text style={styles.partyName}>{companyName}</Text>
          <Text style={styles.partyDetail}>{companyAddress}</Text>
          <Text style={styles.partyDetail}>{companyCity}</Text>
          <Text style={styles.partyDetail}>{companyEmail}</Text>
          <Text style={styles.partyDetail}>{companyPhone}</Text>
        </View>

        <View style={styles.party}>
          <Text style={styles.partyLabel}>Bill To</Text>
          <Text style={styles.partyName}>{clientName}</Text>
          <Text style={styles.partyDetail}>{clientAddress}</Text>
          <Text style={styles.partyDetail}>{clientCity}</Text>
          <Text style={styles.partyDetail}>{clientEmail}</Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.datesSection}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Invoice Date</Text>
          <Text style={styles.dateValue}>{invoiceDate}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Due Date</Text>
          <Text style={styles.dateValue}>{dueDate}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsSection}>
        <View style={styles.itemsHeader}>
          <Text style={[styles.itemsHeaderText, { flex: 2 }]}>Description</Text>
          <Text style={[styles.itemsHeaderText, { flex: 0.5, textAlign: 'center' }]}>Qty</Text>
          <Text style={[styles.itemsHeaderText, { flex: 1, textAlign: 'right' }]}>Rate</Text>
          <Text style={[styles.itemsHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
        </View>

        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={[styles.itemText, { flex: 2 }]} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={[styles.itemText, { flex: 0.5, textAlign: 'center' }]}>
              {item.quantity}
            </Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>
              \${item.rate.toFixed(2)}
            </Text>
            <Text style={[styles.itemAmount, { flex: 1, textAlign: 'right' }]}>
              \${item.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>\${subtotal.toFixed(2)}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={[styles.totalValue, styles.discountValue]}>-\${discount.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax (10%)</Text>
          <Text style={styles.totalValue}>\${tax.toFixed(2)}</Text>
        </View>

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>\${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Terms */}
      {paymentTerms && (
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Payment Terms</Text>
          <Text style={styles.termsText}>{paymentTerms}</Text>
        </View>
      )}

      {/* Notes */}
      {notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionButtonText}>{downloadButton}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionButtonText}>{printButton}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
          <Ionicons name="send-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionButtonText}>{sendButton}</Text>
        </TouchableOpacity>
      </View>

      {status === 'Unpaid' && (
        <TouchableOpacity style={styles.payNowButton} onPress={handlePayNow}>
          <Ionicons name="card-outline" size={20} color="#fff" />
          <Text style={styles.payNowButtonText}>{payNowButton}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#dbeafe',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  partiesSection: {
    padding: 24,
    backgroundColor: '#fff',
    gap: 24,
  },
  party: {
    marginBottom: 8,
  },
  partyLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  datesSection: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 24,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemsSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    marginBottom: 12,
  },
  itemsHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemText: {
    fontSize: 14,
    color: '#111827',
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalsSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  discountValue: {
    color: '#10b981',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  termsSection: {
    padding: 24,
    backgroundColor: '#f9fafb',
    marginTop: 16,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notesSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  payNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return { code, imports };
}
