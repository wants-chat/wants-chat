/**
 * Mixed Component Generators (React Native)
 *
 * Various component generators for different industries.
 * React Native versions using View, Text, FlatList, etc.
 */

export interface MixedComponentOptions {
  title?: string;
  entityType?: string;
  componentName?: string;
}

// Appointment Detail View Component
export function generateAppointmentDetailView(options: MixedComponentOptions = {}): string {
  const componentName = options.componentName || 'AppointmentDetail';

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentDetailData {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  duration: number;
  provider: string;
  service: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface ${componentName}Props {
  appointmentId?: string;
  onCheckIn?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'scheduled': { bg: '#DBEAFE', text: '#2563EB' },
  'confirmed': { bg: '#D1FAE5', text: '#059669' },
  'in-progress': { bg: '#FEF3C7', text: '#D97706' },
  'completed': { bg: '#F3F4F6', text: '#6B7280' },
  'cancelled': { bg: '#FEE2E2', text: '#DC2626' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  appointmentId,
  onCheckIn,
  onReschedule,
  onCancel,
}) => {
  const [appointment, setAppointment] = useState<AppointmentDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data fetch
    setTimeout(() => {
      setAppointment({
        id: '1',
        patientName: 'John Smith',
        phone: '555-0123',
        email: 'john@email.com',
        date: '2024-01-20',
        time: '10:00 AM',
        duration: 60,
        provider: 'Dr. Sarah Johnson',
        service: 'Consultation',
        status: 'scheduled',
        notes: 'First-time patient, bring medical records',
      });
      setLoading(false);
    }, 500);
  }, [appointmentId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Appointment not found</Text>
      </View>
    );
  }

  const statusStyle = STATUS_COLORS[appointment.status] || { bg: '#F3F4F6', text: '#6B7280' };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.patientName}>{appointment.patientName}</Text>
          <Text style={styles.contactInfo}>
            {appointment.phone} {appointment.email}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {appointment.status.replace('-', ' ')}
          </Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>
            {new Date(appointment.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{appointment.time}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{appointment.duration} min</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="medical-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Service</Text>
          <Text style={styles.infoValue}>{appointment.service}</Text>
        </View>
      </View>

      {/* Provider */}
      <View style={styles.providerCard}>
        <Ionicons name="person-outline" size={20} color="#6B7280" />
        <View style={styles.providerInfo}>
          <Text style={styles.providerLabel}>Provider</Text>
          <Text style={styles.providerName}>{appointment.provider}</Text>
        </View>
      </View>

      {/* Notes */}
      {appointment.notes && (
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text-outline" size={20} color="#D97706" />
            <Text style={styles.notesTitle}>Notes</Text>
          </View>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onCheckIn}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Check In</Text>
        </TouchableOpacity>
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onReschedule}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  contactInfo: {
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  infoCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  notesCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default ${componentName};
`;
}

// Contact Info Component
export function generateContactInfo(options: MixedComponentOptions = {}): string {
  const componentName = options.componentName || 'ContactInfo';

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BusinessHours {
  day: string;
  hours: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface ${componentName}Props {
  address?: string;
  phone?: string;
  email?: string;
  hours?: BusinessHours[];
  socialLinks?: SocialLink[];
}

const SOCIAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  facebook: 'logo-facebook',
  twitter: 'logo-twitter',
  instagram: 'logo-instagram',
  linkedin: 'logo-linkedin',
  youtube: 'logo-youtube',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  address = '123 Main Street, Suite 100, City, ST 12345',
  phone = '(555) 123-4567',
  email = 'contact@business.com',
  hours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ],
  socialLinks = [],
}) => {
  const handlePhonePress = () => {
    Linking.openURL(\`tel:\${phone.replace(/[^0-9]/g, '')}\`);
  };

  const handleEmailPress = () => {
    Linking.openURL(\`mailto:\${email}\`);
  };

  const handleAddressPress = () => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(\`https://maps.google.com/?q=\${encodedAddress}\`);
  };

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Information</Text>

      <View style={styles.infoList}>
        {/* Address */}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={handleAddressPress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{address}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Phone */}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={handlePhonePress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={[styles.infoValue, styles.linkText]}>{phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={handleEmailPress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={[styles.infoValue, styles.linkText]}>{email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Business Hours */}
      {hours.length > 0 && (
        <View style={styles.hoursSection}>
          <View style={styles.hoursTitleRow}>
            <Ionicons name="time-outline" size={20} color="#374151" />
            <Text style={styles.hoursTitle}>Business Hours</Text>
          </View>
          <View style={styles.hoursList}>
            {hours.map((h, index) => (
              <View key={index} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{h.day}</Text>
                <Text style={[
                  styles.hoursTime,
                  h.hours === 'Closed' && styles.closedText
                ]}>
                  {h.hours}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialLinks}>
            {socialLinks.map((link, index) => {
              const iconName = SOCIAL_ICONS[link.platform.toLowerCase()] || 'globe-outline';
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  onPress={() => handleSocialPress(link.url)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={iconName} size={24} color="#374151" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoList: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  linkText: {
    color: '#3B82F6',
  },
  hoursSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  hoursTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  hoursList: {
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursDay: {
    fontSize: 14,
    color: '#6B7280',
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  closedText: {
    color: '#DC2626',
  },
  socialSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ${componentName};
`;
}

// Client Logos Component
export function generateClientLogos(options: MixedComponentOptions = {}): string {
  const componentName = options.componentName || 'ClientLogos';
  const title = options.title || 'Trusted by Industry Leaders';

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface Client {
  name: string;
  logo: string;
}

interface ${componentName}Props {
  title?: string;
  clients?: Client[];
  numColumns?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  clients = [
    { name: 'Company A', logo: '' },
    { name: 'Company B', logo: '' },
    { name: 'Company C', logo: '' },
    { name: 'Company D', logo: '' },
    { name: 'Company E', logo: '' },
    { name: 'Company F', logo: '' },
  ],
  numColumns = 3,
}) => {
  const itemWidth = (SCREEN_WIDTH - 48 - (numColumns - 1) * 16) / numColumns;

  const renderClientItem = ({ item }: { item: Client }) => (
    <View style={[styles.clientItem, { width: itemWidth }]}>
      {item.logo ? (
        <Image
          source={{ uri: item.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholderLogo}>
          <Text style={styles.placeholderText}>{item.name}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(item, index) => \`client-\${index}\`}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    gap: 16,
  },
  row: {
    justifyContent: 'center',
    gap: 16,
  },
  clientItem: {
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

// Contract Renewal Due Component
export function generateContractRenewalDue(options: MixedComponentOptions = {}): string {
  const componentName = options.componentName || 'ContractRenewalDue';

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Contract {
  id: string;
  clientName: string;
  contractType: string;
  currentValue: number;
  renewalDate: string;
  daysUntilRenewal: number;
  autoRenew: boolean;
  status: 'active' | 'pending-review' | 'at-risk';
}

interface ${componentName}Props {
  onReviewContract?: (contract: Contract) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'active': { bg: '#D1FAE5', text: '#059669' },
  'pending-review': { bg: '#FEF3C7', text: '#D97706' },
  'at-risk': { bg: '#FEE2E2', text: '#DC2626' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  onReviewContract,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data fetch
    setTimeout(() => {
      setContracts([
        { id: '1', clientName: 'ABC Corporation', contractType: 'Annual Service', currentValue: 24000, renewalDate: '2024-02-01', daysUntilRenewal: 12, autoRenew: true, status: 'active' },
        { id: '2', clientName: 'XYZ Industries', contractType: 'Maintenance', currentValue: 18000, renewalDate: '2024-02-15', daysUntilRenewal: 26, autoRenew: false, status: 'pending-review' },
        { id: '3', clientName: 'Tech Solutions', contractType: 'Support Package', currentValue: 36000, renewalDate: '2024-01-25', daysUntilRenewal: 5, autoRenew: false, status: 'at-risk' },
        { id: '4', clientName: 'Global Enterprises', contractType: 'Full Service', currentValue: 48000, renewalDate: '2024-02-28', daysUntilRenewal: 39, autoRenew: true, status: 'active' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getUrgencyStyle = (days: number) => {
    if (days <= 7) return { color: '#DC2626', fontWeight: '700' as const };
    if (days <= 14) return { color: '#D97706', fontWeight: '600' as const };
    return { color: '#6B7280', fontWeight: '400' as const };
  };

  const renderContractItem = ({ item }: { item: Contract }) => {
    const statusStyle = STATUS_COLORS[item.status] || { bg: '#F3F4F6', text: '#6B7280' };
    const urgencyStyle = getUrgencyStyle(item.daysUntilRenewal);
    const isUrgent = item.daysUntilRenewal <= 7;

    return (
      <View style={[
        styles.contractCard,
        isUrgent && styles.urgentCard
      ]}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <Text style={styles.contractType}>{item.contractType}</Text>
            <Text style={styles.contractValue}>
              \${item.currentValue.toLocaleString()}/year
            </Text>
          </View>
          <View style={styles.cardRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status.replace('-', ' ')}
              </Text>
            </View>
            <Text style={[styles.daysLeft, urgencyStyle]}>
              {item.daysUntilRenewal} days left
            </Text>
            <Text style={styles.renewalDate}>
              {new Date(item.renewalDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.autoRenewStatus}>
            <Ionicons
              name={item.autoRenew ? 'checkmark-circle' : 'close-circle-outline'}
              size={16}
              color={item.autoRenew ? '#059669' : '#6B7280'}
            />
            <Text style={[
              styles.autoRenewText,
              { color: item.autoRenew ? '#059669' : '#6B7280' }
            ]}>
              {item.autoRenew ? 'Auto-renew enabled' : 'Manual renewal required'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => onReviewContract?.(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contracts Due for Renewal</Text>
        <Text style={styles.count}>{contracts.length} contracts</Text>
      </View>

      <FlatList
        data={contracts}
        renderItem={renderContractItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No contracts due for renewal</Text>
          </View>
        )}
      />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  urgentCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contractType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contractValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  daysLeft: {
    fontSize: 14,
    marginTop: 8,
  },
  renewalDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  autoRenewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoRenewText: {
    fontSize: 13,
  },
  reviewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

// Dentist Schedule Component
export function generateDentistSchedule(options: MixedComponentOptions = {}): string {
  const componentName = options.componentName || 'DentistSchedule';

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleSlot {
  id: string;
  time: string;
  patientName?: string;
  procedure?: string;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'in-progress' | 'completed';
}

interface Dentist {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  schedule: ScheduleSlot[];
}

interface ${componentName}Props {
  onBookSlot?: (dentistId: string, slotId: string) => void;
  onSlotPress?: (dentist: Dentist, slot: ScheduleSlot) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'available': { bg: '#D1FAE5', border: '#6EE7B7', text: '#059669' },
  'booked': { bg: '#DBEAFE', border: '#93C5FD', text: '#2563EB' },
  'blocked': { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280' },
  'in-progress': { bg: '#FEF3C7', border: '#FCD34D', text: '#D97706' },
  'completed': { bg: '#F9FAFB', border: '#E5E7EB', text: '#9CA3AF' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  onBookSlot,
  onSlotPress,
}) => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Simulated data fetch
    setTimeout(() => {
      setDentists([
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          specialty: 'General Dentistry',
          schedule: [
            { id: '1', time: '09:00', patientName: 'John Smith', procedure: 'Cleaning', duration: 30, status: 'completed' },
            { id: '2', time: '09:30', patientName: 'Emily Davis', procedure: 'Filling', duration: 60, status: 'in-progress' },
            { id: '3', time: '10:30', patientName: 'Mike Brown', procedure: 'Checkup', duration: 30, status: 'booked' },
            { id: '4', time: '11:00', duration: 30, status: 'available' },
            { id: '5', time: '11:30', duration: 30, status: 'blocked' },
          ],
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Orthodontics',
          schedule: [
            { id: '6', time: '09:00', patientName: 'Sarah Wilson', procedure: 'Braces Adjustment', duration: 45, status: 'completed' },
            { id: '7', time: '10:00', patientName: 'Alex Turner', procedure: 'Consultation', duration: 30, status: 'booked' },
            { id: '8', time: '10:30', duration: 30, status: 'available' },
          ],
        },
      ]);
      setLoading(false);
    }, 500);
  }, [selectedDate]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const renderSlot = (dentist: Dentist, slot: ScheduleSlot) => {
    const statusStyle = STATUS_COLORS[slot.status];

    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.slotCard,
          { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
        ]}
        onPress={() => {
          if (slot.status === 'available') {
            onBookSlot?.(dentist.id, slot.id);
          } else {
            onSlotPress?.(dentist, slot);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.slotHeader}>
          <Text style={[styles.slotTime, { color: statusStyle.text }]}>
            {slot.time}
          </Text>
          <Text style={styles.slotDuration}>{slot.duration}min</Text>
        </View>
        {slot.patientName && (
          <Text style={styles.patientName}>{slot.patientName}</Text>
        )}
        {slot.procedure && (
          <Text style={styles.procedure}>{slot.procedure}</Text>
        )}
        {slot.status === 'available' && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => onBookSlot?.(dentist.id, slot.id)}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dentist Schedule</Text>
        <TouchableOpacity style={styles.dateInput}>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.legendContainer}
        contentContainerStyle={styles.legendContent}
      >
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.bg, borderColor: colors.border }]} />
            <Text style={styles.legendText}>{status.replace('-', ' ')}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dentist Schedules */}
      <ScrollView
        style={styles.scheduleContainer}
        showsVerticalScrollIndicator={false}
      >
        {dentists.map((dentist) => (
          <View key={dentist.id} style={styles.dentistCard}>
            <View style={styles.dentistHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(dentist.name)}</Text>
              </View>
              <View style={styles.dentistInfo}>
                <Text style={styles.dentistName}>{dentist.name}</Text>
                <Text style={styles.dentistSpecialty}>{dentist.specialty}</Text>
              </View>
            </View>
            <View style={styles.slotsContainer}>
              {dentist.schedule.map((slot) => renderSlot(dentist, slot))}
            </View>
          </View>
        ))}
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  legendContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
  },
  dentistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dentistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  dentistInfo: {
    flex: 1,
  },
  dentistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dentistSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  slotsContainer: {
    gap: 8,
  },
  slotCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  patientName: {
    fontSize: 14,
    color: '#111827',
    marginTop: 4,
  },
  procedure: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bookButton: {
    marginTop: 8,
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

// Event Calendar View Component
export function generateEventCalendarView(options: MixedComponentOptions = {}): string {
  const componentName = options.componentName || 'EventCalendar';

  return `import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: 'meeting' | 'event' | 'deadline' | 'reminder';
  color?: string;
}

interface ${componentName}Props {
  events?: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onDayPress?: (date: Date) => void;
}

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  'meeting': { bg: '#DBEAFE', border: '#3B82F6' },
  'event': { bg: '#F3E8FF', border: '#9333EA' },
  'deadline': { bg: '#FEE2E2', border: '#DC2626' },
  'reminder': { bg: '#FEF3C7', border: '#F59E0B' },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ${componentName}: React.FC<${componentName}Props> = ({
  events: initialEvents,
  onEventPress,
  onDayPress,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    } else {
      // Demo data
      setEvents([
        { id: '1', title: 'Team Meeting', date: '2024-01-20', time: '10:00', endTime: '11:00', type: 'meeting' },
        { id: '2', title: 'Product Launch', date: '2024-01-22', time: '14:00', type: 'event' },
        { id: '3', title: 'Project Deadline', date: '2024-01-25', time: '17:00', type: 'deadline' },
        { id: '4', title: 'Client Call', date: '2024-01-20', time: '15:00', endTime: '15:30', type: 'meeting' },
      ]);
    }
  }, [initialEvents]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days: (number | null)[] = [];

    // Add padding for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [year, month]);

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter((e) => e.date === dateStr);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayPress = (day: number) => {
    const date = new Date(year, month, day);
    onDayPress?.(date);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthYear}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.dayNameCell}>
            <Text style={styles.dayName}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.weeksContainer}>
          {Array.from({ length: Math.ceil(calendarData.length / 7) }).map((_, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {calendarData.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    day && isToday(day) && styles.todayCell,
                  ]}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                  activeOpacity={0.7}
                >
                  {day && (
                    <>
                      <Text style={[
                        styles.dayNumber,
                        isToday(day) && styles.todayNumber,
                      ]}>
                        {day}
                      </Text>
                      <View style={styles.eventsContainer}>
                        {getEventsForDay(day).slice(0, 2).map((event) => {
                          const colors = TYPE_COLORS[event.type];
                          return (
                            <TouchableOpacity
                              key={event.id}
                              style={[
                                styles.eventPill,
                                { backgroundColor: colors.bg, borderLeftColor: colors.border },
                              ]}
                              onPress={() => onEventPress?.(event)}
                            >
                              <Text style={styles.eventTitle} numberOfLines={1}>
                                {event.title}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                        {getEventsForDay(day).length > 2 && (
                          <Text style={styles.moreEvents}>
                            +{getEventsForDay(day).length - 2} more
                          </Text>
                        )}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
            <Text style={styles.legendText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  todayButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayNamesRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayNameCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flex: 1,
  },
  weeksContainer: {
    padding: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    minHeight: 80,
    padding: 4,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  todayCell: {
    backgroundColor: '#EFF6FF',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
  },
  todayNumber: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  eventsContainer: {
    marginTop: 4,
    gap: 2,
  },
  eventPill: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderLeftWidth: 2,
  },
  eventTitle: {
    fontSize: 10,
    color: '#374151',
  },
  moreEvents: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});

export default ${componentName};
`;
}
