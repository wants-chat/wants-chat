/**
 * Checkout Component Generator for React Native
 *
 * Generates checkout components with:
 * - Multi-step checkout with ScrollView
 * - Form inputs for shipping/payment
 * - Order summary
 */

export interface CheckoutOptions {
  componentName?: string;
  successScreen?: string;
  showPaymentOptions?: boolean;
  paymentMethods?: Array<{ value: string; label: string; icon?: string }>;
  steps?: Array<{ key: string; title: string }>;
}

export function generateCheckout(options: CheckoutOptions = {}): string {
  const {
    componentName = 'Checkout',
    successScreen = 'OrderSuccess',
    showPaymentOptions = true,
    paymentMethods = [
      { value: 'card', label: 'Credit Card', icon: 'card-outline' },
      { value: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
      { value: 'applepay', label: 'Apple Pay', icon: 'logo-apple' },
    ],
    steps = [
      { key: 'shipping', title: 'Shipping' },
      { key: 'payment', title: 'Payment' },
      { key: 'review', title: 'Review' },
    ],
  } = options;

  const paymentMethodsJson = JSON.stringify(paymentMethods);

  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/lib/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface PaymentMethod {
  value: string;
  label: string;
  icon?: string;
}

const STEPS = ${JSON.stringify(steps)};
const PAYMENT_METHODS: PaymentMethod[] = ${paymentMethodsJson};

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { items, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]?.value || 'card');

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = (): boolean => {
    const required = ['firstName', 'lastName', 'address', 'city', 'postalCode'];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]?.trim()) {
        showToast('error', \`Please enter your \${field.replace(/([A-Z])/g, ' $1').toLowerCase()}\`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateShipping()) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearCart();
      showToast('success', 'Order placed successfully!');
      navigation.navigate('${successScreen}' as never);
    } catch (error) {
      showToast('error', 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.key}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted,
              ]}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index <= currentStep && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepTitle,
                index <= currentStep && styles.stepTitleActive,
              ]}
            >
              {step.title}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderShippingForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>First Name *</Text>
          <TextInput
            style={styles.textInput}
            value={shippingInfo.firstName}
            onChangeText={(v) => handleInputChange('firstName', v)}
            placeholder="John"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Last Name *</Text>
          <TextInput
            style={styles.textInput}
            value={shippingInfo.lastName}
            onChangeText={(v) => handleInputChange('lastName', v)}
            placeholder="Doe"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput
          style={styles.textInput}
          value={shippingInfo.address}
          onChangeText={(v) => handleInputChange('address', v)}
          placeholder="123 Main Street"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={shippingInfo.city}
            onChangeText={(v) => handleInputChange('city', v)}
            placeholder="New York"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Postal Code *</Text>
          <TextInput
            style={styles.textInput}
            value={shippingInfo.postalCode}
            onChangeText={(v) => handleInputChange('postalCode', v)}
            placeholder="10001"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone (optional)</Text>
        <TextInput
          style={styles.textInput}
          value={shippingInfo.phone}
          onChangeText={(v) => handleInputChange('phone', v)}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderPaymentForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      <View style={styles.paymentOptions}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.paymentOption,
              selectedPayment === method.value && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment(method.value)}
          >
            <View style={styles.paymentOptionContent}>
              {method.icon && (
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={selectedPayment === method.value ? '#3B82F6' : '#6B7280'}
                />
              )}
              <Text
                style={[
                  styles.paymentOptionLabel,
                  selectedPayment === method.value && styles.paymentOptionLabelSelected,
                ]}
              >
                {method.label}
              </Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedPayment === method.value && styles.radioOuterSelected,
              ]}
            >
              {selectedPayment === method.value && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedPayment === 'card' && (
        <View style={styles.cardForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="4242 4242 4242 4242"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiry</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={styles.textInput}
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderReview = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Order Review</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Shipping To</Text>
        <Text style={styles.reviewCardText}>
          {shippingInfo.firstName} {shippingInfo.lastName}
        </Text>
        <Text style={styles.reviewCardText}>{shippingInfo.address}</Text>
        <Text style={styles.reviewCardText}>
          {shippingInfo.city}, {shippingInfo.postalCode}
        </Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Payment Method</Text>
        <Text style={styles.reviewCardText}>
          {PAYMENT_METHODS.find(m => m.value === selectedPayment)?.label}
        </Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Order Items</Text>
        {items.map((item) => (
          <View key={item.productId} style={styles.reviewItem}>
            <Text style={styles.reviewItemName} numberOfLines={1}>
              {item.name} x {item.quantity}
            </Text>
            <Text style={styles.reviewItemPrice}>
              \${((item.price || 0) * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>\${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Free' : \`\$\${shipping.toFixed(2)}\`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>\${total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderShippingForm();
      case 1:
        return ${showPaymentOptions ? 'renderPaymentForm()' : 'renderReview()'};
      case 2:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {renderStepIndicator()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextButton, currentStep === 0 && styles.fullWidthButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Place Order</Text>
                  <Text style={styles.submitButtonPrice}>\${total.toFixed(2)}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  stepTitleActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  paymentOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  paymentOptionLabelSelected: {
    color: '#3B82F6',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  cardForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  reviewCardText: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 2,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  reviewItemName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  reviewItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  orderSummary: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    gap: 6,
  },
  fullWidthButton: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default ${componentName};
`;
}

export function generateOrderSummary(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'OrderSummary';

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const ${componentName}: React.FC = () => {
  const { items } = useCart();

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.item}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>
        \${((item.price || 0) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        scrollEnabled={false}
        style={styles.itemsList}
      />

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>\${subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={styles.value}>
          {shipping === 0 ? 'Free' : \`\$\${shipping.toFixed(2)}\`}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>\${total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  itemsList: {
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});

export default ${componentName};
`;
}
