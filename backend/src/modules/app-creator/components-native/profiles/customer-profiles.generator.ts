/**
 * Customer Profile Component Generators (React Native)
 *
 * Industry-specific customer profile components for React Native.
 * Features: Profile cards, loyalty points, order history, and industry-specific data.
 */

export interface CustomerProfileOptions {
  componentName?: string;
  endpoint?: string;
  industry?: string;
}

// Bakery Customer Profile
export function generateCustomerProfileBakery(options: CustomerProfileOptions = {}): string {
  const { componentName = 'CustomerProfileBakery', endpoint = '/customers' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface BakeryCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  member_since: string;
  loyalty_points: number;
  favorite_items: string[];
  allergies: string[];
  order_count: number;
  total_spent: number;
  recent_orders: { id: string; date: string; items: string[]; total: number }[];
}

interface ${componentName}Props {
  customerId?: string;
  onEdit?: (customer: BakeryCustomer) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const customerId = propId || route.params?.id;

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['bakery-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + customerId);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && customer) {
      onEdit(customer);
    } else {
      navigation.navigate('CustomerEdit', { id: customerId });
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL('tel:' + customer.phone);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL('mailto:' + customer.email);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Customer not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#F59E0B" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {customer.avatar_url ? (
            <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(customer.name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.memberSince}>
          Customer since {formatDate(customer.member_since)}
        </Text>

        {/* Loyalty Points Badge */}
        <View style={styles.loyaltyBadge}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={styles.loyaltyPoints}>{customer.loyalty_points}</Text>
          <Text style={styles.loyaltyLabel}>Loyalty Points</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, !customer.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!customer.phone}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="call" size={20} color="#15803D" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !customer.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!customer.email}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="mail" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{customer.order_count}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>\${customer.total_spent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Favorite Items */}
      {customer.favorite_items && customer.favorite_items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Items</Text>
          <View style={styles.tagsContainer}>
            {customer.favorite_items.map((item, index) => (
              <View key={index} style={styles.favoriteTag}>
                <Ionicons name="heart" size={12} color="#F59E0B" />
                <Text style={styles.favoriteTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Allergies Alert */}
      {customer.allergies && customer.allergies.length > 0 && (
        <View style={styles.allergiesSection}>
          <View style={styles.allergiesHeader}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.allergiesTitle}>Allergies</Text>
          </View>
          <View style={styles.tagsContainer}>
            {customer.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyTag}>
                <Text style={styles.allergyTagText}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Orders */}
      {customer.recent_orders && customer.recent_orders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {customer.recent_orders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderItems} numberOfLines={1}>
                  {order.items.join(', ')}
                </Text>
                <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
              </View>
              <Text style={styles.orderTotal}>\${order.total}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#F59E0B',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F59E0B',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  loyaltyPoints: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
  },
  loyaltyLabel: {
    fontSize: 14,
    color: '#92400E',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  favoriteTagText: {
    fontSize: 14,
    color: '#92400E',
  },
  allergiesSection: {
    backgroundColor: '#FEF2F2',
    marginTop: 12,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  allergiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyTagText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItems: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

// Florist Customer Profile
export function generateCustomerProfileFlorist(options: CustomerProfileOptions = {}): string {
  const { componentName = 'CustomerProfileFlorist', endpoint = '/customers' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface OccasionReminder {
  date: string;
  occasion: string;
  recipient: string;
}

interface DeliveryAddress {
  label: string;
  address: string;
}

interface FloristCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  member_since: string;
  occasion_reminders: OccasionReminder[];
  favorite_flowers: string[];
  delivery_addresses: DeliveryAddress[];
  order_count: number;
  total_spent: number;
}

interface ${componentName}Props {
  customerId?: string;
  onEdit?: (customer: FloristCustomer) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const customerId = propId || route.params?.id;

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['florist-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + customerId);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && customer) {
      onEdit(customer);
    } else {
      navigation.navigate('CustomerEdit', { id: customerId });
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL('tel:' + customer.phone);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL('mailto:' + customer.email);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Customer not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EC4899" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#EC4899" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {customer.avatar_url ? (
            <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(customer.name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.contactInfo}>{customer.email}</Text>
        <Text style={styles.contactInfo}>{customer.phone}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="cart-outline" size={20} color="#EC4899" />
          </View>
          <Text style={styles.statValue}>{customer.order_count}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>\${customer.total_spent}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, !customer.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!customer.phone}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonOutline, !customer.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!customer.email}
        >
          <Ionicons name="mail" size={20} color="#EC4899" />
          <Text style={styles.actionButtonOutlineText}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Occasion Reminders */}
      {customer.occasion_reminders && customer.occasion_reminders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Occasion Reminders</Text>
          </View>
          {customer.occasion_reminders.map((reminder, index) => {
            const daysUntil = getDaysUntil(reminder.date);
            const isUpcoming = daysUntil >= 0 && daysUntil <= 14;
            return (
              <View
                key={index}
                style={[styles.reminderItem, isUpcoming && styles.reminderItemUpcoming]}
              >
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderOccasion}>{reminder.occasion}</Text>
                  <Text style={styles.reminderRecipient}>For: {reminder.recipient}</Text>
                </View>
                <View style={styles.reminderDateContainer}>
                  <Text style={styles.reminderDate}>{formatDate(reminder.date)}</Text>
                  {isUpcoming && (
                    <Text style={styles.reminderDays}>
                      {daysUntil === 0 ? 'Today!' : daysUntil + ' days'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Favorite Flowers */}
      {customer.favorite_flowers && customer.favorite_flowers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Flowers</Text>
          <View style={styles.tagsContainer}>
            {customer.favorite_flowers.map((flower, index) => (
              <View key={index} style={styles.flowerTag}>
                <Text style={styles.flowerEmoji}>&#127800;</Text>
                <Text style={styles.flowerTagText}>{flower}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Delivery Addresses */}
      {customer.delivery_addresses && customer.delivery_addresses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Addresses</Text>
          {customer.delivery_addresses.map((addr, index) => (
            <View key={index} style={styles.addressItem}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={16} color="#6B7280" />
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>{addr.label}</Text>
                <Text style={styles.addressText}>{addr.address}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EC4899',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FCE7F3',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#EC4899',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#EC4899',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EC4899',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: '#EC4899',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flowerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  flowerEmoji: {
    fontSize: 14,
  },
  flowerTagText: {
    fontSize: 14,
    color: '#BE185D',
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  reminderItemUpcoming: {
    backgroundColor: '#FEF9C3',
    borderLeftColor: '#F59E0B',
  },
  reminderContent: {
    flex: 1,
  },
  reminderOccasion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  reminderRecipient: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  reminderDateContainer: {
    alignItems: 'flex-end',
  },
  reminderDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reminderDays: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  addressItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

// Optician Customer Profile
export function generateCustomerProfileOptician(options: CustomerProfileOptions = {}): string {
  const { componentName = 'CustomerProfileOptician', endpoint = '/customers' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Prescription {
  sphere: string;
  cylinder: string;
  axis: string;
  add?: string;
}

interface Purchase {
  date: string;
  item: string;
  price: number;
}

interface FramePreferences {
  bridge: number;
  lens: number;
  temple: number;
}

interface OpticianCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  date_of_birth: string;
  insurance_provider?: string;
  last_exam_date: string;
  prescription: Prescription[];
  purchase_history: Purchase[];
  frame_size_preferences: FramePreferences;
}

interface ${componentName}Props {
  customerId?: string;
  onEdit?: (customer: OpticianCustomer) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const customerId = propId || route.params?.id;

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['optician-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + customerId);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && customer) {
      onEdit(customer);
    } else {
      navigation.navigate('CustomerEdit', { id: customerId });
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL('tel:' + customer.phone);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL('mailto:' + customer.email);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Customer not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#3B82F6" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {customer.avatar_url ? (
            <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(customer.name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.contactInfo}>{customer.email}</Text>
        <Text style={styles.contactInfo}>{customer.phone}</Text>
        <Text style={styles.dob}>DOB: {formatDate(customer.date_of_birth)}</Text>

        {customer.insurance_provider && (
          <View style={styles.insuranceBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
            <Text style={styles.insuranceText}>{customer.insurance_provider}</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, !customer.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!customer.phone}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonOutline, !customer.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!customer.email}
        >
          <Ionicons name="mail" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonOutlineText}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Current Prescription */}
      {customer.prescription && customer.prescription.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Current Prescription</Text>
          </View>
          <Text style={styles.examDate}>
            Last exam: {formatDate(customer.last_exam_date)}
          </Text>

          <View style={styles.prescriptionTable}>
            <View style={styles.prescriptionHeader}>
              <Text style={[styles.prescriptionCell, styles.prescriptionHeaderText]}>Eye</Text>
              <Text style={[styles.prescriptionCell, styles.prescriptionHeaderText]}>Sphere</Text>
              <Text style={[styles.prescriptionCell, styles.prescriptionHeaderText]}>Cylinder</Text>
              <Text style={[styles.prescriptionCell, styles.prescriptionHeaderText]}>Axis</Text>
              <Text style={[styles.prescriptionCell, styles.prescriptionHeaderText]}>Add</Text>
            </View>
            {customer.prescription.map((rx, index) => (
              <View key={index} style={styles.prescriptionRow}>
                <Text style={[styles.prescriptionCell, styles.prescriptionEye]}>
                  {index === 0 ? 'OD (R)' : 'OS (L)'}
                </Text>
                <Text style={styles.prescriptionCell}>{rx.sphere}</Text>
                <Text style={styles.prescriptionCell}>{rx.cylinder}</Text>
                <Text style={styles.prescriptionCell}>{rx.axis}&#176;</Text>
                <Text style={styles.prescriptionCell}>{rx.add || '-'}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Frame Preferences */}
      {customer.frame_size_preferences && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frame Preferences</Text>
          <View style={styles.framePrefsGrid}>
            <View style={styles.framePrefItem}>
              <Text style={styles.framePrefValue}>{customer.frame_size_preferences.bridge}</Text>
              <Text style={styles.framePrefLabel}>Bridge</Text>
            </View>
            <View style={styles.framePrefItem}>
              <Text style={styles.framePrefValue}>{customer.frame_size_preferences.lens}</Text>
              <Text style={styles.framePrefLabel}>Lens</Text>
            </View>
            <View style={styles.framePrefItem}>
              <Text style={styles.framePrefValue}>{customer.frame_size_preferences.temple}</Text>
              <Text style={styles.framePrefLabel}>Temple</Text>
            </View>
          </View>
        </View>
      )}

      {/* Purchase History */}
      {customer.purchase_history && customer.purchase_history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase History</Text>
          {customer.purchase_history.map((purchase, index) => (
            <View key={index} style={styles.purchaseItem}>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseName}>{purchase.item}</Text>
                <Text style={styles.purchaseDate}>{formatDate(purchase.date)}</Text>
              </View>
              <Text style={styles.purchasePrice}>\${purchase.price}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dob: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  insuranceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  insuranceText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  examDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  prescriptionTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  prescriptionHeaderText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  prescriptionRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  prescriptionCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  prescriptionEye: {
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'left',
  },
  framePrefsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  framePrefItem: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  framePrefValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  framePrefLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  purchaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  purchaseInfo: {
    flex: 1,
    marginRight: 12,
  },
  purchaseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  purchaseDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  purchasePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

// Pharmacy Customer Profile
export function generateCustomerProfilePharmacy(options: CustomerProfileOptions = {}): string {
  const { componentName = 'CustomerProfilePharmacy', endpoint = '/customers' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface InsuranceInfo {
  provider: string;
  member_id: string;
  group_id: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  refill_date: string;
  auto_refill: boolean;
}

interface PharmacyCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  date_of_birth: string;
  insurance_info: InsuranceInfo;
  medications: Medication[];
  allergies: string[];
  preferred_pharmacist?: string;
}

interface ${componentName}Props {
  customerId?: string;
  onEdit?: (customer: PharmacyCustomer) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const customerId = propId || route.params?.id;

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['pharmacy-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + customerId);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const refillMutation = useMutation({
    mutationFn: async (medicationId: string) => {
      return api.post('/refills', { medication_id: medicationId, customer_id: customerId });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Refill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['pharmacy-customer', customerId] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit refill request');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && customer) {
      onEdit(customer);
    } else {
      navigation.navigate('CustomerEdit', { id: customerId });
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL('tel:' + customer.phone);
    }
  };

  const handleRefill = (medication: Medication) => {
    Alert.alert(
      'Request Refill',
      'Submit refill request for ' + medication.name + ' ' + medication.dosage + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => refillMutation.mutate(medication.id) },
      ]
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isRefillDue = (refillDate: string): boolean => {
    const date = new Date(refillDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Customer not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#10B981" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {customer.avatar_url ? (
            <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(customer.name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.contactInfo}>{customer.email}</Text>
        <Text style={styles.contactInfo}>{customer.phone}</Text>
        <Text style={styles.dob}>DOB: {formatDate(customer.date_of_birth)}</Text>
      </View>

      {/* Insurance Info */}
      {customer.insurance_info && (
        <View style={styles.insuranceCard}>
          <View style={styles.insuranceHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={styles.insuranceTitle}>{customer.insurance_info.provider}</Text>
          </View>
          <View style={styles.insuranceDetails}>
            <View style={styles.insuranceRow}>
              <Text style={styles.insuranceLabel}>Member ID</Text>
              <Text style={styles.insuranceValue}>{customer.insurance_info.member_id}</Text>
            </View>
            <View style={styles.insuranceRow}>
              <Text style={styles.insuranceLabel}>Group ID</Text>
              <Text style={styles.insuranceValue}>{customer.insurance_info.group_id}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Allergies Alert */}
      {customer.allergies && customer.allergies.length > 0 && (
        <View style={styles.allergiesSection}>
          <View style={styles.allergiesHeader}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.allergiesTitle}>Drug Allergies</Text>
          </View>
          <View style={styles.tagsContainer}>
            {customer.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyTag}>
                <Text style={styles.allergyTagText}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Active Medications */}
      {customer.medications && customer.medications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Medications</Text>
          {customer.medications.map((med) => {
            const refillDue = isRefillDue(med.refill_date);
            return (
              <View key={med.id} style={[styles.medicationItem, refillDue && styles.medicationItemDue]}>
                <View style={styles.medicationInfo}>
                  <View style={styles.medicationNameRow}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  </View>
                  <Text style={styles.medicationRefill}>
                    Next refill: {formatDate(med.refill_date)}
                  </Text>
                  {med.auto_refill && (
                    <View style={styles.autoRefillBadge}>
                      <Ionicons name="repeat" size={12} color="#059669" />
                      <Text style={styles.autoRefillText}>Auto-Refill</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.refillButton}
                  onPress={() => handleRefill(med)}
                  disabled={refillMutation.isPending}
                >
                  <Text style={styles.refillButtonText}>Refill</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Preferred Pharmacist */}
      {customer.preferred_pharmacist && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Pharmacist</Text>
          <View style={styles.pharmacistCard}>
            <View style={styles.pharmacistIcon}>
              <Ionicons name="person" size={24} color="#6B7280" />
            </View>
            <Text style={styles.pharmacistName}>{customer.preferred_pharmacist}</Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, !customer.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!customer.phone}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call Customer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#10B981',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dob: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  insuranceCard: {
    backgroundColor: '#DBEAFE',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insuranceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  insuranceDetails: {
    gap: 8,
  },
  insuranceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insuranceLabel: {
    fontSize: 13,
    color: '#3B82F6',
  },
  insuranceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  allergiesSection: {
    backgroundColor: '#FEF2F2',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  allergiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyTagText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  medicationItemDue: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  medicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  medicationDosage: {
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  medicationRefill: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  autoRefillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  autoRefillText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  refillButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refillButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pharmacistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  pharmacistIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacistName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  actionsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ${componentName};
`;
}

// Rental Customer Profile
export function generateCustomerProfileRental(options: CustomerProfileOptions = {}): string {
  const { componentName = 'CustomerProfileRental', endpoint = '/customers' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface DriversLicense {
  number: string;
  expiry: string;
  state: string;
}

interface RentalHistory {
  date: string;
  item: string;
  duration: string;
  total: number;
}

interface ActiveRental {
  id: string;
  item: string;
  start_date: string;
  end_date: string;
}

interface RentalCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  member_since: string;
  membership_type: 'basic' | 'premium' | 'vip';
  drivers_license?: DriversLicense;
  rental_history: RentalHistory[];
  active_rentals: ActiveRental[];
  credit_on_file: boolean;
}

interface ${componentName}Props {
  customerId?: string;
  onEdit?: (customer: RentalCustomer) => void;
  onBack?: () => void;
  onExtendRental?: (rental: ActiveRental) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, onEdit, onBack, onExtendRental }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const customerId = propId || route.params?.id;

  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['rental-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + customerId);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && customer) {
      onEdit(customer);
    } else {
      navigation.navigate('CustomerEdit', { id: customerId });
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL('tel:' + customer.phone);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL('mailto:' + customer.email);
    }
  };

  const handleExtend = (rental: ActiveRental) => {
    if (onExtendRental) {
      onExtendRental(rental);
    } else {
      navigation.navigate('ExtendRental', { rentalId: rental.id });
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMembershipColors = (type: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      basic: { bg: '#F3F4F6', text: '#4B5563' },
      premium: { bg: '#EDE9FE', text: '#7C3AED' },
      vip: { bg: '#FEF3C7', text: '#B45309' },
    };
    return colors[type] || colors.basic;
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Customer not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const membershipColors = getMembershipColors(customer.membership_type);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#7C3AED" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {customer.avatar_url ? (
            <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(customer.name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.memberSince}>
          Member since {formatDate(customer.member_since)}
        </Text>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          <View style={[styles.membershipBadge, { backgroundColor: membershipColors.bg }]}>
            <Ionicons
              name={customer.membership_type === 'vip' ? 'star' : 'ribbon'}
              size={14}
              color={membershipColors.text}
            />
            <Text style={[styles.membershipText, { color: membershipColors.text }]}>
              {customer.membership_type.toUpperCase()}
            </Text>
          </View>
          {customer.credit_on_file && (
            <View style={styles.creditBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.creditText}>Card on File</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, !customer.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!customer.phone}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonOutline, !customer.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!customer.email}
        >
          <Ionicons name="mail" size={20} color="#7C3AED" />
          <Text style={styles.actionButtonOutlineText}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Driver's License */}
      {customer.drivers_license && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver's License</Text>
          <View style={styles.licenseCard}>
            <View style={styles.licenseRow}>
              <View style={styles.licenseField}>
                <Text style={styles.licenseLabel}>License Number</Text>
                <Text style={styles.licenseValue}>{customer.drivers_license.number}</Text>
              </View>
              <View style={styles.licenseField}>
                <Text style={styles.licenseLabel}>State</Text>
                <Text style={styles.licenseValue}>{customer.drivers_license.state}</Text>
              </View>
            </View>
            <View style={styles.licenseField}>
              <Text style={styles.licenseLabel}>Expiry Date</Text>
              <Text style={styles.licenseValue}>
                {formatDate(customer.drivers_license.expiry)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Active Rentals */}
      {customer.active_rentals && customer.active_rentals.length > 0 && (
        <View style={styles.activeRentalsSection}>
          <View style={styles.activeRentalsHeader}>
            <Ionicons name="time" size={20} color="#3B82F6" />
            <Text style={styles.activeRentalsTitle}>Active Rentals</Text>
          </View>
          {customer.active_rentals.map((rental) => (
            <View key={rental.id} style={styles.activeRentalItem}>
              <View style={styles.rentalInfo}>
                <Text style={styles.rentalItem}>{rental.item}</Text>
                <Text style={styles.rentalDates}>
                  {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.extendButton}
                onPress={() => handleExtend(rental)}
              >
                <Text style={styles.extendButtonText}>Extend</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Rental History */}
      {customer.rental_history && customer.rental_history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental History</Text>
          {customer.rental_history.map((rental, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyItemName}>{rental.item}</Text>
                <Text style={styles.historyMeta}>
                  {formatDate(rental.date)} &#8226; {rental.duration}
                </Text>
              </View>
              <Text style={styles.historyTotal}>\${rental.total}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EDE9FE',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#7C3AED',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7C3AED',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  membershipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  creditText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7C3AED',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  licenseCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  licenseRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  licenseField: {
    flex: 1,
  },
  licenseLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  licenseValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  activeRentalsSection: {
    backgroundColor: '#EFF6FF',
    margin: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activeRentalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activeRentalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  activeRentalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rentalInfo: {
    flex: 1,
  },
  rentalItem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rentalDates: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  extendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  extendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  historyMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  historyTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

// Client Profile for Accounting
export function generateClientProfileAccounting(options: CustomerProfileOptions = {}): string {
  const { componentName = 'ClientProfileAccounting', endpoint = '/clients' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TaxDeadline {
  type: string;
  deadline: string;
  status: 'pending' | 'filed' | 'extended';
}

interface AccountingClient {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  logo_url?: string;
  client_since: string;
  entity_type: 'individual' | 'llc' | 'corporation' | 's-corp' | 'partnership';
  services: string[];
  tax_deadlines: TaxDeadline[];
  outstanding_balance: number;
  yearly_revenue: number;
}

interface ${componentName}Props {
  clientId?: string;
  onEdit?: (client: AccountingClient) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const clientId = propId || route.params?.id;

  const { data: client, isLoading, refetch } = useQuery({
    queryKey: ['accounting-client', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit && client) {
      onEdit(client);
    } else {
      navigation.navigate('ClientEdit', { id: clientId });
    }
  };

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL('tel:' + client.phone);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL('mailto:' + client.email);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return '\$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '\$' + (value / 1000).toFixed(0) + 'K';
    }
    return '\$' + value.toLocaleString();
  };

  const getStatusColors = (status: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: '#FEF3C7', text: '#B45309' },
      filed: { bg: '#D1FAE5', text: '#059669' },
      extended: { bg: '#DBEAFE', text: '#1D4ED8' },
    };
    return colors[status] || colors.pending;
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="business-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Client not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D4ED8" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#1D4ED8" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.logoContainer}>
          {client.logo_url ? (
            <Image source={{ uri: client.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitials}>{getInitials(client.company_name)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.companyName}>{client.company_name}</Text>
        <Text style={styles.contactName}>{client.contact_name}</Text>
        <Text style={styles.contactInfo}>{client.email}</Text>
        <Text style={styles.contactInfo}>{client.phone}</Text>

        {/* Entity Type Badge */}
        <View style={styles.entityBadge}>
          <Text style={styles.entityText}>{client.entity_type.toUpperCase()}</Text>
        </View>

        <Text style={styles.clientSince}>
          Client since {formatDate(client.client_since)}
        </Text>
      </View>

      {/* Financial Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Annual Revenue</Text>
          <Text style={styles.statValue}>{formatCurrency(client.yearly_revenue)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Outstanding</Text>
          <Text style={[styles.statValue, client.outstanding_balance > 0 && styles.statValueRed]}>
            {formatCurrency(client.outstanding_balance)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, !client.phone && styles.actionButtonDisabled]}
          onPress={handleCall}
          disabled={!client.phone}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonOutline, !client.email && styles.actionButtonDisabled]}
          onPress={handleEmail}
          disabled={!client.email}
        >
          <Ionicons name="mail" size={20} color="#1D4ED8" />
          <Text style={styles.actionButtonOutlineText}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Services */}
      {client.services && client.services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesContainer}>
            {client.services.map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tax Deadlines */}
      {client.tax_deadlines && client.tax_deadlines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Deadlines</Text>
          {client.tax_deadlines.map((deadline, index) => {
            const statusColors = getStatusColors(deadline.status);
            return (
              <View key={index} style={styles.deadlineItem}>
                <View style={styles.deadlineInfo}>
                  <Text style={styles.deadlineType}>{deadline.type}</Text>
                  <Text style={styles.deadlineDate}>
                    Due: {formatDate(deadline.deadline)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.statusText, { color: statusColors.text }]}>
                    {deadline.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  contactName: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 4,
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  entityBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  entityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  clientSince: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statValueRed: {
    color: '#DC2626',
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceTagText: {
    fontSize: 14,
    color: '#1D4ED8',
  },
  deadlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineType: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  deadlineDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}
