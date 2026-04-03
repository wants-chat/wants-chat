/**
 * React Native Receipt Generator
 * Generates a receipt/invoice component in thermal printer style
 */

export function generateRNReceiptGenerator(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface ReceiptItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptGeneratorProps {
  receiptData?: any;
  receiptNumber?: string;
  transactionDate?: string;
  transactionId?: string;
  merchantName?: string;
  merchantAddress?: string;
  merchantCity?: string;
  merchantPhone?: string;
  items?: ReceiptItem[];
  paymentMethod?: string;
  cardType?: string;
  cardLast4?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  thankYouMessage?: string;
  returnPolicy?: string;
  printButton?: string;
  downloadButton?: string;
  onPrint?: () => void;
  onDownload?: () => void;
  [key: string]: any;
}

export default function ReceiptGenerator({
  receiptData: propData,
  receiptNumber: propReceiptNumber = 'REC-001',
  transactionDate: propTransactionDate = '',
  transactionId: propTransactionId = '',
  merchantName: propMerchantName = 'Store Name',
  merchantAddress: propMerchantAddress = '',
  merchantCity: propMerchantCity = '',
  merchantPhone: propMerchantPhone = '',
  items: propItems = [],
  paymentMethod: propPaymentMethod = 'Credit Card',
  cardType: propCardType = 'Visa',
  cardLast4: propCardLast4 = '1234',
  subtotal: propSubtotal = 0,
  tax: propTax = 0,
  discount: propDiscount = 0,
  total: propTotal = 0,
  thankYouMessage = 'Thank you for your purchase!',
  returnPolicy = '',
  printButton = 'Print Receipt',
  downloadButton = 'Download',
  onPrint,
  onDownload
}: ReceiptGeneratorProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/receipts\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch receipt data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const receiptNumber = data.receiptNumber || propReceiptNumber;
  const transactionDate = data.transactionDate || propTransactionDate;
  const transactionId = data.transactionId || propTransactionId;
  const merchantName = data.merchantName || propMerchantName;
  const merchantAddress = data.merchantAddress || propMerchantAddress;
  const merchantCity = data.merchantCity || propMerchantCity;
  const merchantPhone = data.merchantPhone || propMerchantPhone;
  const items = data.items || propItems;
  const paymentMethod = data.paymentMethod || propPaymentMethod;
  const cardType = data.cardType || propCardType;
  const cardLast4 = data.cardLast4 || propCardLast4;
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

  const handlePrint = () => {
    onPrint ? onPrint() : Alert.alert('Print', 'Printing receipt...');
  };

  const handleDownload = () => {
    onDownload ? onDownload() : Alert.alert('Download', 'Downloading receipt...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Receipt */}
      <View style={styles.receipt}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.merchantName}>{merchantName}</Text>
          <Text style={styles.merchantDetail}>{merchantAddress}</Text>
          <Text style={styles.merchantDetail}>{merchantCity}</Text>
          <Text style={styles.merchantDetail}>{merchantPhone}</Text>
        </View>

        <View style={styles.divider} />

        {/* Receipt Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Receipt #</Text>
            <Text style={styles.infoValue}>{receiptNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{transactionDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID</Text>
            <Text style={styles.infoValue}>{transactionId}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.itemsSection}>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemTotal}>\${item.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemDetail}>
                {item.quantity} × \${item.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>\${subtotal.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.discountValue}>-\${discount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>\${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>\${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment Info */}
        <View style={styles.paymentSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method</Text>
            <Text style={styles.infoValue}>{paymentMethod}</Text>
          </View>
          {cardType && cardLast4 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Card</Text>
              <Text style={styles.infoValue}>
                {cardType} ****{cardLast4}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Thank You Message */}
        {thankYouMessage && (
          <View style={styles.messageSection}>
            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            <Text style={styles.thankYouText}>{thankYouMessage}</Text>
          </View>
        )}

        {/* Return Policy */}
        {returnPolicy && (
          <>
            <View style={styles.divider} />
            <View style={styles.policySection}>
              <Text style={styles.policyTitle}>Return Policy</Text>
              <Text style={styles.policyText}>{returnPolicy}</Text>
            </View>
          </>
        )}

        {/* Barcode Placeholder */}
        <View style={styles.barcodeSection}>
          <View style={styles.barcode}>
            {Array.from({ length: 40 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.barcodeLine,
                  { height: i % 3 === 0 ? 60 : i % 2 === 0 ? 40 : 50 }
                ]}
              />
            ))}
          </View>
          <Text style={styles.barcodeText}>{transactionId}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionButtonText}>{printButton}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color="#3b82f6" />
          <Text style={styles.actionButtonText}>{downloadButton}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  receipt: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  merchantDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  infoSection: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  itemsSection: {
    marginBottom: 8,
  },
  item: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  itemDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  totalsSection: {
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
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
    color: '#111827',
  },
  paymentSection: {
    marginBottom: 8,
  },
  messageSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  policySection: {
    paddingTop: 8,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  barcodeSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 8,
  },
  barcodeLine: {
    width: 2,
    backgroundColor: '#111827',
    marginHorizontal: 1,
  },
  barcodeText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
