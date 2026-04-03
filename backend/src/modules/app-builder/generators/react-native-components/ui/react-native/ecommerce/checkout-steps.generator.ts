/**
 * React Native Checkout Steps Generator
 * Generates a multi-step checkout component for React Native
 */

export const generateRNCheckoutSteps = () => {
  const code = `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: any;
}

interface CheckoutStepsProps {
  onComplete?: (orderId: string) => void;
  onCancel?: () => void;
  [key: string]: any;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ onComplete, onCancel }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'card', // 'card', 'paypal', 'apple_pay'
  });

  const steps = ['Shipping', 'Payment', 'Review'];

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiClient.post('/orders', orderData);
      return response;
    },
    onSuccess: async (response) => {
      const orderId = response.id || response._id;
      // Clear cart after successful order
      await AsyncStorage.removeItem('cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      Alert.alert(
        'Order Placed!',
        \`Your order #\${orderId} has been placed successfully.\`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onComplete) {
                onComplete(orderId);
              }
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      Alert.alert(
        'Order Failed',
        error?.message || 'Failed to place your order. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  // Load cart items on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const validateShipping = () => {
    if (!shippingInfo.fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }
    if (!shippingInfo.email.trim() || !shippingInfo.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!shippingInfo.address.trim()) {
      Alert.alert('Validation Error', 'Please enter your street address');
      return false;
    }
    if (!shippingInfo.city.trim() || !shippingInfo.state.trim() || !shippingInfo.zipCode.trim()) {
      Alert.alert('Validation Error', 'Please complete your address details');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!paymentInfo.cardholderName.trim()) {
      Alert.alert('Validation Error', 'Please enter the cardholder name');
      return false;
    }
    if (!paymentInfo.cardNumber.trim() || paymentInfo.cardNumber.length < 15) {
      Alert.alert('Validation Error', 'Please enter a valid card number');
      return false;
    }
    if (!paymentInfo.expiryDate.trim() || !paymentInfo.expiryDate.match(/^\\d{2}\\/\\d{2}$/)) {
      Alert.alert('Validation Error', 'Please enter expiry date in MM/YY format');
      return false;
    }
    if (!paymentInfo.cvv.trim() || paymentInfo.cvv.length < 3) {
      Alert.alert('Validation Error', 'Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateShipping()) {
      return;
    }
    if (currentStep === 1 && !validatePayment()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = () => {
    const { subtotal, shipping, tax, total } = calculateTotals();

    // Create order via API
    const orderData = {
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      })),
      shippingAddress: {
        fullName: shippingInfo.fullName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
      },
      paymentMethod: paymentInfo.paymentMethod,
      subtotal,
      shippingCost: shipping,
      tax,
      total,
      status: 'pending',
    };

    placeOrderMutation.mutate(orderData);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="cart-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add items to cart before checking out</Text>
        {onCancel && (
          <TouchableOpacity style={styles.backToShopButton} onPress={onCancel}>
            <Text style={styles.backToShopText}>Continue Shopping</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  index <= currentStep && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentStep && styles.stepLabelActive,
              ]}
            >
              {step}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Shipping Information */}
        {currentStep === 0 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Shipping Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={shippingInfo.fullName}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={shippingInfo.email}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={shippingInfo.phone}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              value={shippingInfo.address}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="City *"
                value={shippingInfo.city}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="State *"
                value={shippingInfo.state}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, state: text })}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="ZIP Code *"
              value={shippingInfo.zipCode}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, zipCode: text })}
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Step 2: Payment Information */}
        {currentStep === 1 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Payment Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Cardholder Name *"
              value={paymentInfo.cardholderName}
              onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cardholderName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Card Number *"
              value={paymentInfo.cardNumber}
              onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cardNumber: text })}
              keyboardType="number-pad"
              maxLength={16}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="MM/YY *"
                value={paymentInfo.expiryDate}
                onChangeText={(text) => setPaymentInfo({ ...paymentInfo, expiryDate: text })}
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="CVV *"
                value={paymentInfo.cvv}
                onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cvv: text })}
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
              />
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityText}>🔒 Your payment information is secure</Text>
            </View>
          </View>
        )}

        {/* Step 3: Review & Confirm */}
        {currentStep === 2 && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Review Your Order</Text>

            {/* Order Items */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Order Items ({cartItems.length})</Text>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Shipping Address */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Shipping Address</Text>
              <Text style={styles.reviewText}>{shippingInfo.fullName}</Text>
              <Text style={styles.reviewText}>{shippingInfo.address}</Text>
              <Text style={styles.reviewText}>
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
              </Text>
              <Text style={styles.reviewText}>{shippingInfo.country}</Text>
              <Text style={styles.reviewText}>{shippingInfo.email}</Text>
              {shippingInfo.phone && (
                <Text style={styles.reviewText}>{shippingInfo.phone}</Text>
              )}
            </View>

            {/* Payment Method */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Payment Method</Text>
              <Text style={styles.reviewText}>
                {paymentInfo.paymentMethod === 'card' ? 'Credit/Debit Card' : paymentInfo.paymentMethod}
              </Text>
              <Text style={styles.reviewText}>
                Card ending in {paymentInfo.cardNumber.slice(-4)}
              </Text>
            </View>

            {/* Order Summary */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(totals.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>{formatPrice(totals.tax)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
            disabled={placeOrderMutation.isPending}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            currentStep === 0 && styles.nextButtonFull,
            placeOrderMutation.isPending && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={placeOrderMutation.isPending}
        >
          {placeOrderMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
              </Text>
              {currentStep < steps.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToShopButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToShopText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#3B82F6',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '75%',
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: '#3B82F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  step: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  securityNote: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});

export default CheckoutSteps;`;

  return { code, imports: [] };
};
