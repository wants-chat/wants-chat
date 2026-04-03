// E-commerce Component Generators for React Native

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// ===========================
// PRODUCT COMPONENTS
// ===========================
export { generateRNProductGrid } from './product-grid.generator';
export { generateRNProductGridThreeColumn } from './product-grid-three-column.generator';
export { generateRNProductGridTwoColumn } from './product-grid-two-column.generator';
export { generateRNProductGridFourColumn } from './product-grid-four-column.generator';
export { generateRNProductCard } from './product-card.generator';
export { generateRNProductCardCompact } from './product-card-compact.generator';
export { generateRNProductCardDetailed } from './product-card-detailed.generator';
export { generateRNProductDetailPage } from './product-detail-page.generator';

// ===========================
// CATEGORY COMPONENTS
// ===========================
export { generateRNCategoryGrid } from './category-grid.generator';

// ===========================
// CART COMPONENTS
// ===========================
export { generateRNCartFullPage } from './cart-full-page.generator';
export { generateRNCartSummarySidebar } from './cart-summary-sidebar.generator';
export { generateRNShoppingCart } from './shopping-cart.generator';
export { generateRNEmptyCartState } from './empty-cart-state.generator';

// ===========================
// CHECKOUT COMPONENTS
// ===========================
export { generateRNCheckoutSteps } from './checkout-steps.generator';
export { generateRNPaymentMethod } from './payment-method.generator';
export { generateRNOrderReview } from './order-review.generator';

// ===========================
// ORDER COMPONENTS
// ===========================
export { generateRNOrderSummary } from './order-summary.generator';
export { generateRNOrderDetailsView } from './order-details-view.generator';
export { generateRNOrderConfirmation } from './order-confirmation.generator';

// ===========================
// PRODUCT FEATURES
// ===========================
export { generateRNRecentlyViewed } from './recently-viewed.generator';
export { generateRNRelatedProductsSection } from './related-products-section.generator';
export { generateRNReviewSummary } from './review-summary.generator';
export { generateRNTrustBadgesSection } from './trust-badges-section.generator';
export { generateRNProductConfigurator } from './product-configurator.generator';
export { generateRNProductCarousel } from './product-carousel.generator';
export { generateRNProductImageGallery } from './product-image-gallery.generator';
export { generateRNProductQuickView } from './product-quick-view.generator';
export { generateRNProduct360Viewer } from './product-360-viewer.generator';
export { generateRNProduct3DViewer } from './product-3d-viewer.generator';

// ===========================
// TRACKING & HISTORY
// ===========================
export { generateRNOrderTracking } from './order-tracking.generator';
export { generateRNPaymentHistory } from './payment-history.generator';

// ===========================
// RECEIPTS & INVOICES
// ===========================
export { generateRNReceiptGenerator } from './receipt-generator.generator';
export { generateRNInvoiceDisplay } from './invoice-display.generator';

// ===========================
// INVENTORY & STATUS
// ===========================
export { generateRNInventoryStatus } from './inventory-status.generator';

// ===========================
// AR & PREVIEW
// ===========================
export { generateRNARPreviewInterface } from './ar-preview-interface.generator';
export { generateRNARPreviewInterface as generateRNArPreviewInterface } from './ar-preview-interface.generator';

// ===========================
// ADDITIONAL E-COMMERCE COMPONENTS
// ===========================

// Order History List
export function generateRNOrderHistoryList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: { name: string; quantity: number; image?: string }[];
}

interface OrderHistoryListProps {
  orders: Order[];
  onOrderPress?: (order: Order) => void;
  onReorder?: (order: Order) => void;
}

export default function OrderHistoryList({ orders, onOrderPress, onReorder }: OrderHistoryListProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => onOrderPress?.(item)}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.itemsPreview}>
        {item.items.slice(0, 3).map((product, idx) => (
          <View key={idx} style={styles.itemPreview}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.itemImage} />
            ) : (
              <View style={styles.itemPlaceholder}>
                <Ionicons name="cube-outline" size={20} color="#9ca3af" />
              </View>
            )}
          </View>
        ))}
        {item.items.length > 3 && (
          <View style={styles.moreItems}>
            <Text style={styles.moreItemsText}>+{item.items.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total: <Text style={styles.totalAmount}>\${item.total.toFixed(2)}</Text></Text>
        <TouchableOpacity style={styles.reorderButton} onPress={() => onReorder?.(item)}>
          <Ionicons name="refresh-outline" size={16} color="#3b82f6" />
          <Text style={styles.reorderText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={orders}
      renderItem={renderOrder}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNumber: { fontSize: 16, fontWeight: '600', color: '#111827' },
  orderDate: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  itemsPreview: { flexDirection: 'row', marginBottom: 12 },
  itemPreview: { marginRight: 8 },
  itemImage: { width: 48, height: 48, borderRadius: 8 },
  itemPlaceholder: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  moreItems: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  moreItemsText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalAmount: { fontSize: 16, fontWeight: '700', color: '#111827' },
  reorderButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reorderText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Checkout Form
export function generateRNCheckoutForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutFormProps {
  onSubmit?: (data: any) => void;
  onBack?: () => void;
  subtotal?: number;
  shipping?: number;
  tax?: number;
}

export default function CheckoutForm({ onSubmit, onBack, subtotal = 0, shipping = 0, tax = 0 }: CheckoutFormProps) {
  const [step, setStep] = useState(1);
  const [saveInfo, setSaveInfo] = useState(false);
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '', state: '', zip: '', phone: '',
    cardNumber: '', expiry: '', cvv: '', cardName: ''
  });

  const total = subtotal + shipping + tax;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.steps}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
              {step > s ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>}
            </View>
            <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>
              {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}
            </Text>
          </View>
        ))}
      </View>

      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.halfInput]} placeholder="First Name" value={formData.firstName} onChangeText={(v) => updateField('firstName', v)} />
            <TextInput style={[styles.input, styles.halfInput]} placeholder="Last Name" value={formData.lastName} onChangeText={(v) => updateField('lastName', v)} />
          </View>
          <TextInput style={styles.input} placeholder="Address" value={formData.address} onChangeText={(v) => updateField('address', v)} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.thirdInput]} placeholder="City" value={formData.city} onChangeText={(v) => updateField('city', v)} />
            <TextInput style={[styles.input, styles.thirdInput]} placeholder="State" value={formData.state} onChangeText={(v) => updateField('state', v)} />
            <TextInput style={[styles.input, styles.thirdInput]} placeholder="ZIP" value={formData.zip} onChangeText={(v) => updateField('zip', v)} keyboardType="numeric" />
          </View>
          <TextInput style={styles.input} placeholder="Phone" value={formData.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
        </View>
      )}

      {step === 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.cardIcons}>
            <Ionicons name="card-outline" size={32} color="#3b82f6" />
          </View>
          <TextInput style={styles.input} placeholder="Card Number" value={formData.cardNumber} onChangeText={(v) => updateField('cardNumber', v)} keyboardType="numeric" maxLength={19} />
          <TextInput style={styles.input} placeholder="Name on Card" value={formData.cardName} onChangeText={(v) => updateField('cardName', v)} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.halfInput]} placeholder="MM/YY" value={formData.expiry} onChangeText={(v) => updateField('expiry', v)} maxLength={5} />
            <TextInput style={[styles.input, styles.halfInput]} placeholder="CVV" value={formData.cvv} onChangeText={(v) => updateField('cvv', v)} keyboardType="numeric" maxLength={4} secureTextEntry />
          </View>
          <View style={styles.saveRow}>
            <Text style={styles.saveLabel}>Save payment info</Text>
            <Switch value={saveInfo} onValueChange={setSaveInfo} trackColor={{ true: '#3b82f6' }} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Review</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>\${subtotal.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>\${shipping.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax</Text><Text style={styles.summaryValue}>\${tax.toFixed(2)}</Text></View>
          <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>\${total.toFixed(2)}</Text></View>
        </View>
      )}

      <View style={styles.buttons}>
        {step > 1 && <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}><Text style={styles.backButtonText}>Back</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.nextButton} onPress={() => step < 3 ? setStep(step + 1) : onSubmit?.(formData)}>
          <Text style={styles.nextButtonText}>{step === 3 ? 'Place Order' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  steps: { flexDirection: 'row', justifyContent: 'center', padding: 20, gap: 24 },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: '#3b82f6' },
  stepNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  stepNumberActive: { color: '#fff' },
  stepLabel: { fontSize: 12, color: '#6b7280' },
  stepLabelActive: { color: '#3b82f6', fontWeight: '600' },
  section: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  thirdInput: { flex: 1 },
  cardIcons: { alignItems: 'center', marginBottom: 16 },
  saveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  saveLabel: { fontSize: 14, color: '#374151' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryValue: { fontSize: 14, color: '#111827' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#3b82f6' },
  buttons: { flexDirection: 'row', padding: 16, gap: 12 },
  backButton: { flex: 1, padding: 16, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  nextButton: { flex: 2, padding: 16, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';"],
  };
}

// Product Comparison Table
export function generateRNProductComparisonTable(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  features: Record<string, string | boolean>;
}

interface ProductComparisonTableProps {
  products: Product[];
  features: { key: string; label: string }[];
  onRemove?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductComparisonTable({ products, features, onRemove, onAddToCart }: ProductComparisonTableProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View>
        <View style={styles.headerRow}>
          <View style={styles.labelCell} />
          {products.map((product) => (
            <View key={product.id} style={styles.productCell}>
              <TouchableOpacity style={styles.removeButton} onPress={() => onRemove?.(product.id)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.productPrice}>\${product.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => onAddToCart?.(product)}>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {features.map((feature, idx) => (
          <View key={feature.key} style={[styles.featureRow, idx % 2 === 0 && styles.featureRowAlt]}>
            <View style={styles.labelCell}>
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
            {products.map((product) => (
              <View key={product.id} style={styles.valueCell}>
                {typeof product.features[feature.key] === 'boolean' ? (
                  <Ionicons name={product.features[feature.key] ? 'checkmark-circle' : 'close-circle'} size={22} color={product.features[feature.key] ? '#10b981' : '#ef4444'} />
                ) : (
                  <Text style={styles.featureValue}>{product.features[feature.key] || '-'}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e5e7eb', paddingBottom: 16 },
  labelCell: { width: 120, padding: 12 },
  productCell: { width: 140, padding: 12, alignItems: 'center' },
  removeButton: { position: 'absolute', top: 4, right: 4, zIndex: 1 },
  productImage: { width: 80, height: 80, borderRadius: 8, marginBottom: 8 },
  productName: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 4 },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#3b82f6', marginBottom: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 4 },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  featureRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  featureRowAlt: { backgroundColor: '#f9fafb' },
  featureLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  valueCell: { width: 140, padding: 12, alignItems: 'center', justifyContent: 'center' },
  featureValue: { fontSize: 13, color: '#111827', textAlign: 'center' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';"],
  };
}

// Product Filter
export function generateRNProductFilter(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  type: 'single' | 'multiple';
}

interface ProductFilterProps {
  visible: boolean;
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onApply?: (filters: Record<string, string[]>) => void;
  onClose?: () => void;
  onClear?: () => void;
}

export default function ProductFilter({ visible, filters, selectedFilters, onApply, onClose, onClear }: ProductFilterProps) {
  const [localFilters, setLocalFilters] = useState(selectedFilters);

  const toggleFilter = (groupId: string, optionId: string, type: 'single' | 'multiple') => {
    setLocalFilters(prev => {
      const current = prev[groupId] || [];
      if (type === 'single') {
        return { ...prev, [groupId]: current.includes(optionId) ? [] : [optionId] };
      }
      return { ...prev, [groupId]: current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId] };
    });
  };

  const activeCount = Object.values(localFilters).flat().length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#111827" /></TouchableOpacity>
          <Text style={styles.title}>Filters {activeCount > 0 && <Text style={styles.count}>({activeCount})</Text>}</Text>
          <TouchableOpacity onPress={() => { setLocalFilters({}); onClear?.(); }}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {filters.map((group) => (
            <View key={group.id} style={styles.filterGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.options}>
                {group.options.map((option) => {
                  const isSelected = (localFilters[group.id] || []).includes(option.id);
                  return (
                    <TouchableOpacity key={option.id} style={[styles.option, isSelected && styles.optionSelected]} onPress={() => toggleFilter(group.id, option.id, group.type)}>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
                      {option.count !== undefined && <Text style={[styles.optionCount, isSelected && styles.optionCountSelected]}>({option.count})</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={() => { onApply?.(localFilters); onClose?.(); }}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  count: { color: '#3b82f6' },
  clearText: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  filterGroup: { marginBottom: 24 },
  groupTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', gap: 4 },
  optionSelected: { backgroundColor: '#3b82f6' },
  optionText: { fontSize: 14, color: '#374151' },
  optionTextSelected: { color: '#fff' },
  optionCount: { fontSize: 12, color: '#6b7280' },
  optionCountSelected: { color: '#dbeafe' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  applyButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center' },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';"],
  };
}

// Product Filter Sidebar (alias)
export const generateRNProductFilterSidebar = generateRNProductFilter;

// Cart Mini Dropdown
export function generateRNCartMiniDropdown(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartMiniDropdownProps {
  visible: boolean;
  items: CartItem[];
  onClose?: () => void;
  onViewCart?: () => void;
  onCheckout?: () => void;
  onRemoveItem?: (id: string) => void;
}

export default function CartMiniDropdown({ visible, items, onClose, onViewCart, onCheckout, onRemoveItem }: CartMiniDropdownProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.dropdown}>
          <View style={styles.header}>
            <Text style={styles.title}>Cart ({itemCount})</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color="#6b7280" /></TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {items.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.item}>
                    {item.image ? <Image source={{ uri: item.image }} style={styles.itemImage} /> : <View style={styles.imagePlaceholder}><Ionicons name="cube-outline" size={20} color="#9ca3af" /></View>}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.quantity} x \${item.price.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => onRemoveItem?.(item.id)}><Ionicons name="trash-outline" size={18} color="#ef4444" /></TouchableOpacity>
                  </View>
                ))}
                {items.length > 3 && <Text style={styles.moreItems}>+{items.length - 3} more items</Text>}
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal:</Text><Text style={styles.totalValue}>\${total.toFixed(2)}</Text></View>
                <TouchableOpacity style={styles.viewCartButton} onPress={onViewCart}><Text style={styles.viewCartText}>View Cart</Text></TouchableOpacity>
                <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}><Text style={styles.checkoutText}>Checkout</Text></TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 },
  dropdown: { backgroundColor: '#fff', borderRadius: 12, width: 300, maxHeight: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  itemsList: { maxHeight: 180 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  itemImage: { width: 48, height: 48, borderRadius: 6 },
  imagePlaceholder: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  itemPrice: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  moreItems: { textAlign: 'center', padding: 8, fontSize: 13, color: '#3b82f6' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  viewCartButton: { padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', marginBottom: 8 },
  viewCartText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  checkoutButton: { padding: 12, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center' },
  checkoutText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Modal } from 'react-native';"],
  };
}

// Cart Item Row
export function generateRNCartItemRow(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItemRowProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

export default function CartItemRow({ id, name, price, quantity, image, variant, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <View style={styles.container}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Ionicons name="cube-outline" size={28} color="#9ca3af" /></View>}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {variant && <Text style={styles.variant}>{variant}</Text>}
        <Text style={styles.price}>\${price.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => onQuantityChange?.(id, Math.max(1, quantity - 1))}><Ionicons name="remove" size={18} color="#374151" /></TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => onQuantityChange?.(id, quantity + 1)}><Ionicons name="add" size={18} color="#374151" /></TouchableOpacity>
        </View>
        <Text style={styles.subtotal}>\${(price * quantity).toFixed(2)}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={() => onRemove?.(id)}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  image: { width: 80, height: 80, borderRadius: 8 },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '500', color: '#111827', marginBottom: 4 },
  variant: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 6 },
  quantityButton: { padding: 8 },
  quantity: { paddingHorizontal: 12, fontSize: 14, fontWeight: '600', color: '#111827' },
  subtotal: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  removeButton: { marginTop: 8, padding: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Wishlist
export function generateRNWishlist(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  inStock: boolean;
}

interface WishlistProps {
  items: WishlistItem[];
  onRemove?: (id: string) => void;
  onAddToCart?: (item: WishlistItem) => void;
  onItemPress?: (item: WishlistItem) => void;
}

export default function Wishlist({ items, onRemove, onAddToCart, onItemPress }: WishlistProps) {
  const renderItem = ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => onItemPress?.(item)}>
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove?.(item.id)}><Ionicons name="heart" size={22} color="#ef4444" /></TouchableOpacity>
      {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={40} color="#d1d5db" /></View>}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>\${item.price.toFixed(2)}</Text>
          {item.originalPrice && <Text style={styles.originalPrice}>\${item.originalPrice.toFixed(2)}</Text>}
        </View>
        <TouchableOpacity style={[styles.addButton, !item.inStock && styles.addButtonDisabled]} onPress={() => item.inStock && onAddToCart?.(item)} disabled={!item.inStock}>
          <Ionicons name={item.inStock ? 'cart-outline' : 'alert-circle-outline'} size={16} color={item.inStock ? '#fff' : '#9ca3af'} />
          <Text style={[styles.addButtonText, !item.inStock && styles.addButtonTextDisabled]}>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>Save items you love by tapping the heart icon</Text>
        </View>
      ) : (
        <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 8 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  removeButton: { position: 'absolute', top: 8, right: 8, zIndex: 1, padding: 4 },
  image: { width: '100%', height: 140 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  price: { fontSize: 16, fontWeight: '700', color: '#111827' },
  originalPrice: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 8, borderRadius: 6, gap: 6 },
  addButtonDisabled: { backgroundColor: '#f3f4f6' },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  addButtonTextDisabled: { color: '#9ca3af' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Pricing Tables
export function generateRNPricingTableTwo(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular?: boolean;
}

interface PricingTableTwoProps {
  plans: PricingPlan[];
  onSelect?: (plan: PricingPlan) => void;
}

export default function PricingTableTwo({ plans, onSelect }: PricingTableTwoProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {plans.map((plan) => (
        <View key={plan.id} style={[styles.card, plan.isPopular && styles.cardPopular]}>
          {plan.isPopular && <View style={styles.popularBadge}><Text style={styles.popularText}>Most Popular</Text></View>}
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.period}>/{plan.period}</Text>
          </View>
          <View style={styles.features}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.selectButton, plan.isPopular && styles.selectButtonPopular]} onPress={() => onSelect?.(plan)}>
            <Text style={[styles.selectButtonText, plan.isPopular && styles.selectButtonTextPopular]}>Get Started</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: { width: 280, backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#e5e7eb' },
  cardPopular: { borderColor: '#3b82f6', borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  popularText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  planName: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  currency: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 4 },
  price: { fontSize: 48, fontWeight: '800', color: '#111827' },
  period: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  features: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  featureText: { fontSize: 14, color: '#374151' },
  selectButton: { padding: 14, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  selectButtonPopular: { backgroundColor: '#3b82f6' },
  selectButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  selectButtonTextPopular: { color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

export function generateRNPricingTableThree(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNPricingTableTwo(resolved, variant);
}

export function generateRNPricingTableMulti(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNPricingTableTwo(resolved, variant);
}

// Company & Job
export function generateRNCompanyCardGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  location: string;
  jobCount: number;
  rating?: number;
}

interface CompanyCardGridProps {
  companies: Company[];
  onCompanyPress?: (company: Company) => void;
}

export default function CompanyCardGrid({ companies, onCompanyPress }: CompanyCardGridProps) {
  const renderCompany = ({ item }: { item: Company }) => (
    <TouchableOpacity style={styles.card} onPress={() => onCompanyPress?.(item)}>
      <View style={styles.logoContainer}>
        {item.logo ? <Image source={{ uri: item.logo }} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Ionicons name="business-outline" size={32} color="#9ca3af" /></View>}
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.industry}>{item.industry}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text style={styles.metaText}>{item.location}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.jobBadge}><Text style={styles.jobCount}>{item.jobCount} jobs</Text></View>
        {item.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return <FlatList data={companies} renderItem={renderCompany} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.container} />;
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  logoContainer: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 56, height: 56, borderRadius: 12 },
  logoPlaceholder: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  industry: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  metaText: { fontSize: 12, color: '#6b7280' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  jobCount: { fontSize: 11, fontWeight: '600', color: '#3b82f6' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 13, fontWeight: '600', color: '#111827' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

export function generateRNCompanyDetailPage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CompanyDetailPageProps {
  company: { id: string; name: string; logo?: string; cover?: string; industry: string; location: string; size: string; founded: string; website: string; description: string; benefits: string[]; };
  jobCount?: number;
  onViewJobs?: () => void;
  onFollow?: () => void;
}

export default function CompanyDetailPage({ company, jobCount = 0, onViewJobs, onFollow }: CompanyDetailPageProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.coverContainer}>
        {company.cover ? <Image source={{ uri: company.cover }} style={styles.cover} /> : <View style={styles.coverPlaceholder} />}
        <View style={styles.logoWrapper}>{company.logo ? <Image source={{ uri: company.logo }} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Ionicons name="business" size={40} color="#9ca3af" /></View>}</View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{company.name}</Text>
        <Text style={styles.industry}>{company.industry}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.followButton} onPress={onFollow}><Ionicons name="add" size={20} color="#3b82f6" /><Text style={styles.followText}>Follow</Text></TouchableOpacity>
          <TouchableOpacity style={styles.jobsButton} onPress={onViewJobs}><Text style={styles.jobsButtonText}>View {jobCount} Jobs</Text></TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}><Ionicons name="location-outline" size={20} color="#6b7280" /><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{company.location}</Text></View>
          <View style={styles.infoItem}><Ionicons name="people-outline" size={20} color="#6b7280" /><Text style={styles.infoLabel}>Company Size</Text><Text style={styles.infoValue}>{company.size}</Text></View>
          <View style={styles.infoItem}><Ionicons name="calendar-outline" size={20} color="#6b7280" /><Text style={styles.infoLabel}>Founded</Text><Text style={styles.infoValue}>{company.founded}</Text></View>
          <View style={styles.infoItem}><Ionicons name="globe-outline" size={20} color="#6b7280" /><Text style={styles.infoLabel}>Website</Text><Text style={styles.infoValue}>{company.website}</Text></View>
        </View>

        <View style={styles.section}><Text style={styles.sectionTitle}>About</Text><Text style={styles.description}>{company.description}</Text></View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefits}>{company.benefits.map((benefit, idx) => (<View key={idx} style={styles.benefitItem}><Ionicons name="checkmark-circle" size={18} color="#10b981" /><Text style={styles.benefitText}>{benefit}</Text></View>))}</View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  coverContainer: { height: 180, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', backgroundColor: '#dbeafe' },
  logoWrapper: { position: 'absolute', bottom: -40, left: 20, borderWidth: 4, borderColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  logo: { width: 80, height: 80 },
  logoPlaceholder: { width: 80, height: 80, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 50 },
  name: { fontSize: 24, fontWeight: '700', color: '#111827' },
  industry: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 24 },
  followButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#3b82f6' },
  followText: { color: '#3b82f6', fontWeight: '600' },
  jobsButton: { flex: 2, padding: 12, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center' },
  jobsButtonText: { color: '#fff', fontWeight: '600' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  infoItem: { width: '45%', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  infoLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  description: { fontSize: 14, color: '#374151', lineHeight: 22 },
  benefits: { gap: 8 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitText: { fontSize: 14, color: '#374151' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';"],
  };
}

export function generateRNJobDetailPage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JobDetailPageProps {
  job: { id: string; title: string; company: string; companyLogo?: string; location: string; type: string; salary: string; posted: string; description: string; requirements: string[]; benefits: string[]; };
  onApply?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function JobDetailPage({ job, onApply, onSave, isSaved = false }: JobDetailPageProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.companyRow}>
            {job.companyLogo ? <Image source={{ uri: job.companyLogo }} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Ionicons name="business-outline" size={24} color="#9ca3af" /></View>}
            <Text style={styles.company}>{job.company}</Text>
          </View>
          <Text style={styles.title}>{job.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}><Ionicons name="location-outline" size={16} color="#6b7280" /><Text style={styles.metaText}>{job.location}</Text></View>
            <View style={styles.metaItem}><Ionicons name="briefcase-outline" size={16} color="#6b7280" /><Text style={styles.metaText}>{job.type}</Text></View>
          </View>
          <View style={styles.salaryBadge}><Text style={styles.salaryText}>{job.salary}</Text></View>
          <Text style={styles.posted}>Posted {job.posted}</Text>
        </View>

        <View style={styles.section}><Text style={styles.sectionTitle}>Description</Text><Text style={styles.description}>{job.description}</Text></View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {job.requirements.map((req, idx) => (<View key={idx} style={styles.listItem}><Text style={styles.bullet}>•</Text><Text style={styles.listText}>{req}</Text></View>))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          {job.benefits.map((benefit, idx) => (<View key={idx} style={styles.benefitItem}><Ionicons name="checkmark-circle" size={18} color="#10b981" /><Text style={styles.benefitText}>{benefit}</Text></View>))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}><Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={24} color={isSaved ? '#ef4444' : '#6b7280'} /></TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={onApply}><Text style={styles.applyButtonText}>Apply Now</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logo: { width: 48, height: 48, borderRadius: 12 },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  company: { fontSize: 16, color: '#6b7280' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 14, color: '#6b7280' },
  salaryBadge: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 8 },
  salaryText: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  posted: { fontSize: 13, color: '#9ca3af' },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  description: { fontSize: 14, color: '#374151', lineHeight: 22 },
  listItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bullet: { color: '#6b7280' },
  listText: { flex: 1, fontSize: 14, color: '#374151' },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  benefitText: { fontSize: 14, color: '#374151' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  saveButton: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  applyButton: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';"],
  };
}

// Product Reviews List
export function generateRNProductReviewsList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title?: string;
  content: string;
  helpful: number;
  images?: string[];
}

interface ProductReviewsListProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
  onHelpful?: (reviewId: string) => void;
  onWriteReview?: () => void;
}

export default function ProductReviewsList({ reviews, averageRating = 0, totalReviews = 0, onHelpful, onWriteReview }: ProductReviewsListProps) {
  const renderStars = (rating: number) => (
    <View style={styles.starsRow}>{[1, 2, 3, 4, 5].map((star) => (<Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={16} color="#f59e0b" />))}</View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{item.author[0]}</Text></View>}
        <View style={styles.headerInfo}>
          <Text style={styles.author}>{item.author}</Text>
          <View style={styles.ratingDate}>{renderStars(item.rating)}<Text style={styles.date}>{item.date}</Text></View>
        </View>
      </View>
      {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
      <Text style={styles.reviewContent}>{item.content}</Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.imageRow}>{item.images.slice(0, 4).map((img, idx) => (<Image key={idx} source={{ uri: img }} style={styles.reviewImage} />))}</View>
      )}
      <TouchableOpacity style={styles.helpfulButton} onPress={() => onHelpful?.(item.id)}>
        <Ionicons name="thumbs-up-outline" size={16} color="#6b7280" />
        <Text style={styles.helpfulText}>Helpful ({item.helpful})</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.ratingBig}><Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>{renderStars(Math.round(averageRating))}<Text style={styles.totalReviews}>{totalReviews} reviews</Text></View>
        <TouchableOpacity style={styles.writeButton} onPress={onWriteReview}><Ionicons name="create-outline" size={18} color="#fff" /><Text style={styles.writeButtonText}>Write a Review</Text></TouchableOpacity>
      </View>
      <FlatList data={reviews} renderItem={renderReview} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  summaryCard: { backgroundColor: '#fff', padding: 20, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingBig: { alignItems: 'center' },
  ratingNumber: { fontSize: 40, fontWeight: '800', color: '#111827' },
  totalReviews: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: 2 },
  writeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  writeButtonText: { color: '#fff', fontWeight: '600' },
  list: { padding: 8 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 16, fontWeight: '600', color: '#3b82f6' },
  headerInfo: { marginLeft: 12 },
  author: { fontSize: 15, fontWeight: '600', color: '#111827' },
  ratingDate: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af' },
  reviewTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 6 },
  reviewContent: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 12 },
  imageRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  reviewImage: { width: 60, height: 60, borderRadius: 6 },
  helpfulButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpfulText: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';"],
  };
}
