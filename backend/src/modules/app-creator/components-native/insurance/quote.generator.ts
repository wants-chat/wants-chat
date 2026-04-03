/**
 * Insurance Quote Component Generators (React Native)
 *
 * Generates quote list and quote wizard components.
 * Uses View, Text, FlatList, ScrollView, and TouchableOpacity for layouts.
 */

export interface QuoteOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateQuoteList(options: QuoteOptions = {}): string {
  const { componentName = 'QuoteList', endpoint = '/quotes' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Quote {
  id: string;
  quote_number: string;
  type: string;
  status: string;
  applicant_name: string;
  coverage_amount: number;
  estimated_premium: number;
  valid_until: string;
  created_at: string;
}

type StatusFilter = 'all' | 'draft' | 'pending' | 'approved' | 'expired' | 'converted';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: quotes, isLoading, refetch } = useQuery({
    queryKey: ['quotes', status, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusConfig = (quoteStatus: string) => {
    switch (quoteStatus?.toLowerCase()) {
      case 'draft':
        return { icon: 'document-text', color: '#6B7280', bgColor: '#F3F4F6' };
      case 'pending':
        return { icon: 'time', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'approved':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' };
      case 'expired':
        return { icon: 'close-circle', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'converted':
        return { icon: 'checkmark-done-circle', color: '#8B5CF6', bgColor: '#EDE9FE' };
      default:
        return { icon: 'document-text', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'expired', label: 'Expired' },
    { key: 'converted', label: 'Converted' },
  ];

  const renderQuote = useCallback(({ item }: { item: Quote }) => {
    const statusConfig = getStatusConfig(item.status);
    const expiringSoon = item.status === 'approved' && isExpiringSoon(item.valid_until);

    return (
      <TouchableOpacity
        style={styles.quoteCard}
        onPress={() => navigation.navigate('QuoteDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.quoteHeader}>
          <View>
            <Text style={styles.quoteNumber}>#{item.quote_number}</Text>
            <Text style={styles.applicantName}>{item.applicant_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.quoteDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{item.type}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Coverage</Text>
            <Text style={styles.detailValue}>\${item.coverage_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Premium</Text>
            <Text style={styles.premiumValue}>\${item.estimated_premium?.toLocaleString()}/mo</Text>
          </View>
        </View>

        <View style={styles.quoteFooter}>
          <View style={styles.validUntilRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.validUntilText}>Valid until {formatDate(item.valid_until)}</Text>
          </View>
          <View style={styles.footerRight}>
            {expiringSoon && (
              <View style={styles.expiringBadge}>
                <Text style={styles.expiringText}>Expiring soon</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('QuoteWizard' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                status === item.key && styles.filterTabActive,
              ]}
              onPress={() => setStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  status === item.key && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Quotes List */}
      <FlatList
        data={quotes || []}
        renderItem={renderQuote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No quotes found</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('QuoteWizard' as never)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Get Your First Quote</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quoteNumber: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  quoteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textTransform: 'capitalize',
  },
  premiumValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validUntilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validUntilText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiringBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  expiringText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F59E0B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateQuoteWizard(options: QuoteOptions = {}): string {
  const { componentName = 'QuoteWizard', endpoint = '/quotes' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface PolicyType {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const { width: screenWidth } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Policy Type
    type: '',
    // Step 2: Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    // Step 3: Coverage Details
    coverage_amount: 100000,
    deductible: 500,
    start_date: '',
    // Step 4: Additional Info
    property_address: '',
    property_type: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    health_conditions: [] as string[],
    smoker: false,
    occupation: '',
  });

  const steps: WizardStep[] = [
    { id: 'type', title: 'Insurance Type', description: 'Select the type of insurance you need' },
    { id: 'personal', title: 'Personal Information', description: 'Tell us about yourself' },
    { id: 'coverage', title: 'Coverage Details', description: 'Customize your coverage' },
    { id: 'additional', title: 'Additional Details', description: 'Provide specific information' },
    { id: 'review', title: 'Review & Submit', description: 'Review your quote request' },
  ];

  const policyTypes: PolicyType[] = [
    { id: 'health', label: 'Health', icon: 'heart', color: '#EF4444', bgColor: '#FEE2E2' },
    { id: 'auto', label: 'Auto', icon: 'car', color: '#3B82F6', bgColor: '#DBEAFE' },
    { id: 'home', label: 'Home', icon: 'home', color: '#8B5CF6', bgColor: '#EDE9FE' },
    { id: 'life', label: 'Life', icon: 'person', color: '#10B981', bgColor: '#D1FAE5' },
    { id: 'business', label: 'Business', icon: 'briefcase', color: '#F97316', bgColor: '#FED7AA' },
    { id: 'travel', label: 'Travel', icon: 'airplane', color: '#06B6D4', bgColor: '#CFFAFE' },
  ];

  const coverageOptions = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
  const deductibleOptions = [250, 500, 1000, 2500];

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      Alert.alert('Success', 'Quote request submitted successfully!', [
        {
          text: 'View Quote',
          onPress: () => navigation.navigate('QuoteDetail' as never, { id: response?.data?.id || response?.id } as never),
        },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit quote request');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.type;
      case 1:
        return formData.first_name && formData.last_name && formData.email && formData.date_of_birth;
      case 2:
        return formData.coverage_amount > 0 && formData.start_date;
      case 3:
        if (formData.type === 'auto') return formData.vehicle_make && formData.vehicle_model && formData.vehicle_year;
        if (formData.type === 'home') return formData.property_address && formData.property_type;
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View
            style={[
              styles.stepDot,
              index < currentStep && styles.stepDotCompleted,
              index === currentStep && styles.stepDotActive,
            ]}
          >
            {index < currentStep ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  (index < currentStep || index === currentStep) && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            )}
          </View>
          {index < steps.length - 1 && (
            <View
              style={[styles.stepLine, index < currentStep && styles.stepLineCompleted]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.typeGrid}>
            {policyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  formData.type === type.id && styles.typeCardSelected,
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <View style={[styles.typeIconContainer, { backgroundColor: type.bgColor }]}>
                  <Ionicons name={type.icon} size={24} color={type.color} />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
                {formData.type === type.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 1:
        return (
          <View style={styles.formContainer}>
            <View style={styles.nameRow}>
              <View style={styles.halfField}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.first_name}
                  onChangeText={(value) => handleInputChange('first_name', value)}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.last_name}
                  onChangeText={(value) => handleInputChange('last_name', value)}
                />
              </View>
            </View>

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="(000) 000-0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
            />

            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={formData.date_of_birth}
              onChangeText={(value) => handleInputChange('date_of_birth', value)}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Coverage Amount *</Text>
            <Text style={styles.coverageValue}>\${formData.coverage_amount.toLocaleString()}</Text>
            <View style={styles.optionsGrid}>
              {coverageOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.optionButton,
                    formData.coverage_amount === amount && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleInputChange('coverage_amount', amount)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.coverage_amount === amount && styles.optionTextSelected,
                    ]}
                  >
                    \${amount >= 1000000 ? (amount / 1000000) + 'M' : (amount / 1000) + 'K'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>Deductible</Text>
            <View style={styles.deductibleRow}>
              {deductibleOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.deductibleButton,
                    formData.deductible === amount && styles.deductibleButtonSelected,
                  ]}
                  onPress={() => handleInputChange('deductible', amount)}
                >
                  <Text
                    style={[
                      styles.deductibleText,
                      formData.deductible === amount && styles.deductibleTextSelected,
                    ]}
                  >
                    \${amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>Coverage Start Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={formData.start_date}
              onChangeText={(value) => handleInputChange('start_date', value)}
            />
          </View>
        );

      case 3:
        if (formData.type === 'auto') {
          return (
            <View style={styles.formContainer}>
              <View style={styles.nameRow}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Vehicle Make *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Toyota"
                    placeholderTextColor="#9CA3AF"
                    value={formData.vehicle_make}
                    onChangeText={(value) => handleInputChange('vehicle_make', value)}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Vehicle Model *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Camry"
                    placeholderTextColor="#9CA3AF"
                    value={formData.vehicle_model}
                    onChangeText={(value) => handleInputChange('vehicle_model', value)}
                  />
                </View>
              </View>

              <Text style={styles.label}>Vehicle Year *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2022"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={formData.vehicle_year}
                onChangeText={(value) => handleInputChange('vehicle_year', value)}
              />
            </View>
          );
        }

        if (formData.type === 'home') {
          const propertyTypes = ['single_family', 'condo', 'townhouse', 'apartment', 'mobile_home'];
          return (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Property Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full address"
                placeholderTextColor="#9CA3AF"
                value={formData.property_address}
                onChangeText={(value) => handleInputChange('property_address', value)}
              />

              <Text style={styles.label}>Property Type *</Text>
              <View style={styles.propertyTypeGrid}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.propertyTypeButton,
                      formData.property_type === type && styles.propertyTypeButtonSelected,
                    ]}
                    onPress={() => handleInputChange('property_type', type)}
                  >
                    <Text
                      style={[
                        styles.propertyTypeText,
                        formData.property_type === type && styles.propertyTypeTextSelected,
                      ]}
                    >
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }

        if (formData.type === 'health' || formData.type === 'life') {
          const healthConditions = ['Diabetes', 'Heart Disease', 'High Blood Pressure', 'Asthma', 'Cancer', 'None'];
          return (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Pre-existing Conditions</Text>
              <View style={styles.conditionsGrid}>
                {healthConditions.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.conditionButton,
                      formData.health_conditions.includes(condition) && styles.conditionButtonSelected,
                    ]}
                    onPress={() => {
                      const conditions = formData.health_conditions.includes(condition)
                        ? formData.health_conditions.filter((c) => c !== condition)
                        : [...formData.health_conditions, condition];
                      handleInputChange('health_conditions', conditions);
                    }}
                  >
                    <Text
                      style={[
                        styles.conditionText,
                        formData.health_conditions.includes(condition) && styles.conditionTextSelected,
                      ]}
                    >
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.smokerToggle}
                onPress={() => handleInputChange('smoker', !formData.smoker)}
              >
                <View
                  style={[styles.checkbox, formData.smoker && styles.checkboxChecked]}
                >
                  {formData.smoker && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.smokerText}>I am a smoker</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Occupation</Text>
              <TextInput
                style={styles.input}
                placeholder="Your current occupation"
                placeholderTextColor="#9CA3AF"
                value={formData.occupation}
                onChangeText={(value) => handleInputChange('occupation', value)}
              />
            </View>
          );
        }

        return (
          <View style={styles.noAdditionalContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.noAdditionalText}>
              No additional information required for this insurance type.
            </Text>
          </View>
        );

      case 4:
        const selectedType = policyTypes.find((t) => t.id === formData.type);
        return (
          <View style={styles.reviewContainer}>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                {selectedType && (
                  <View style={[styles.reviewTypeIcon, { backgroundColor: selectedType.bgColor }]}>
                    <Ionicons name={selectedType.icon} size={20} color={selectedType.color} />
                  </View>
                )}
                <View>
                  <Text style={styles.reviewTitle}>{selectedType?.label} Insurance Quote</Text>
                  <Text style={styles.reviewSubtitle}>Review your information</Text>
                </View>
              </View>

              <View style={styles.reviewDetails}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Full Name</Text>
                  <Text style={styles.reviewValue}>{formData.first_name} {formData.last_name}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Email</Text>
                  <Text style={styles.reviewValue}>{formData.email}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Coverage</Text>
                  <Text style={styles.reviewValue}>\${formData.coverage_amount.toLocaleString()}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Deductible</Text>
                  <Text style={styles.reviewValue}>\${formData.deductible.toLocaleString()}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Start Date</Text>
                  <Text style={styles.reviewValue}>{formData.start_date}</Text>
                </View>
              </View>
            </View>

            <View style={styles.disclaimerCard}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <View style={styles.disclaimerContent}>
                <Text style={styles.disclaimerTitle}>Disclaimer</Text>
                <Text style={styles.disclaimerText}>
                  This quote is an estimate based on the information provided. Final premium may vary after underwriting review.
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
        </View>

        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.backButton, currentStep === 0 && styles.backButtonDisabled]}
          onPress={handleBack}
          disabled={currentStep === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? '#9CA3AF' : '#374151'} />
          <Text style={[styles.backButtonText, currentStep === 0 && styles.backButtonTextDisabled]}>
            Back
          </Text>
        </TouchableOpacity>

        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Get Quote</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: '#8B5CF6',
  },
  stepDotActive: {
    backgroundColor: '#8B5CF6',
    borderWidth: 3,
    borderColor: '#EDE9FE',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: (screenWidth - 200) / 4,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  typeCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  coverageValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  deductibleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  deductibleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  deductibleButtonSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  deductibleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  deductibleTextSelected: {
    color: '#8B5CF6',
  },
  propertyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  propertyTypeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyTypeButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  propertyTypeText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  propertyTypeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  conditionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  conditionButtonSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  conditionText: {
    fontSize: 14,
    color: '#374151',
  },
  conditionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  smokerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  smokerText: {
    fontSize: 14,
    color: '#374151',
  },
  noAdditionalContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  noAdditionalText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  reviewContainer: {
    paddingHorizontal: 24,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  reviewTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  reviewSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  reviewDetails: {
    gap: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  backButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 4,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
