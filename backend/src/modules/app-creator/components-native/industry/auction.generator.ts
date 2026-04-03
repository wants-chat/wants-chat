/**
 * Auction Component Generators (React Native)
 *
 * Generates React Native components for auction/bidding platforms
 */

export interface AuctionOptions {
  title?: string;
  componentName?: string;
}

/**
 * Generates AuctionFilters component for React Native
 */
export function generateAuctionFilters(options: AuctionOptions = {}): string {
  const { title = 'Filter Auctions', componentName = 'AuctionFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterState {
  search: string;
  category: string;
  status: string;
  priceRange: { min: number; max: number };
  sortBy: string;
}

interface ${componentName}Props {
  onFilterChange?: (filters: FilterState) => void;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'jewelry', label: 'Jewelry & Watches' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'antiques', label: 'Antiques' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'live', label: 'Live Now' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'ended', label: 'Ended' },
];

const sortOptions = [
  { value: 'ending-soonest', label: 'Ending Soonest' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'most-bids', label: 'Most Bids' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: '',
    priceRange: { min: 0, max: 100000 },
    sortBy: 'ending-soonest',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const renderDropdown = (
    options: { value: string; label: string }[],
    selectedValue: string,
    onSelect: (value: string) => void,
    dropdownKey: string
  ) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setActiveDropdown(activeDropdown === dropdownKey ? null : dropdownKey)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownButtonText}>
          {options.find(o => o.value === selectedValue)?.label || 'Select'}
        </Text>
        <Ionicons
          name={activeDropdown === dropdownKey ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#6B7280"
        />
      </TouchableOpacity>
      {activeDropdown === dropdownKey && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                selectedValue === option.value && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                onSelect(option.value);
                setActiveDropdown(null);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedValue === option.value && styles.dropdownItemTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search auctions..."
          placeholderTextColor="#9CA3AF"
          value={filters.search}
          onChangeText={(text) => updateFilter('search', text)}
        />
      </View>

      {/* Filter Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {renderDropdown(categories, filters.category, (v) => updateFilter('category', v), 'category')}
        {renderDropdown(statuses, filters.status, (v) => updateFilter('status', v), 'status')}
        {renderDropdown(sortOptions, filters.sortBy, (v) => updateFilter('sortBy', v), 'sort')}

        <TouchableOpacity
          style={styles.advancedButton}
          onPress={() => setShowAdvanced(!showAdvanced)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={18} color="#6B7280" />
          <Text style={styles.advancedButtonText}>Advanced</Text>
          <Ionicons
            name={showAdvanced ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Advanced Filters */}
      {showAdvanced && (
        <View style={styles.advancedContainer}>
          <Text style={styles.advancedLabel}>Price Range</Text>
          <View style={styles.priceRangeContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={filters.priceRange.min.toString()}
              onChangeText={(text) =>
                updateFilter('priceRange', { ...filters.priceRange, min: Number(text) || 0 })
              }
            />
            <Text style={styles.priceRangeSeparator}>to</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={filters.priceRange.max.toString()}
              onChangeText={(text) =>
                updateFilter('priceRange', { ...filters.priceRange, max: Number(text) || 0 })
              }
            />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: '#EBF5FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  advancedButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  advancedContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  advancedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  priceRangeSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates AuctionTimer component for React Native
 */
export function generateAuctionTimer(options: AuctionOptions = {}): string {
  const { componentName = 'AuctionTimer' } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  endTime: Date | string;
  onEnd?: () => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (endTime: Date): TimeLeft => {
  const difference = endTime.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
};

const ${componentName}: React.FC<${componentName}Props> = ({
  endTime,
  onEnd,
  showLabel = true,
  size = 'md',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(new Date(endTime))
  );
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(new Date(endTime));
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true);
        onEnd?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd, hasEnded]);

  const isEndingSoon = timeLeft.total > 0 && timeLeft.total < 60 * 60 * 1000;
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 5 * 60 * 1000;

  const sizeConfig = {
    sm: { box: 40, font: 14, label: 10 },
    md: { box: 56, font: 18, label: 11 },
    lg: { box: 72, font: 24, label: 12 },
  };

  const config = sizeConfig[size];

  if (hasEnded) {
    return (
      <View style={styles.endedContainer}>
        <Ionicons name="time-outline" size={18} color="#6B7280" />
        <Text style={styles.endedText}>Auction Ended</Text>
      </View>
    );
  }

  const renderTimeBox = (value: number, label: string) => (
    <View
      style={[
        styles.timeBox,
        { width: config.box, height: config.box },
        isUrgent && styles.timeBoxUrgent,
        isEndingSoon && !isUrgent && styles.timeBoxEndingSoon,
      ]}
    >
      <Text
        style={[
          styles.timeValue,
          { fontSize: config.font },
          isUrgent && styles.timeValueUrgent,
        ]}
      >
        {String(value).padStart(2, '0')}
      </Text>
      <Text style={[styles.timeLabel, { fontSize: config.label }]}>{label}</Text>
    </View>
  );

  return (
    <View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Ionicons
            name={isUrgent ? 'warning' : 'time-outline'}
            size={16}
            color={isUrgent ? '#DC2626' : isEndingSoon ? '#EA580C' : '#6B7280'}
          />
          <Text
            style={[
              styles.labelText,
              isUrgent && styles.labelTextUrgent,
              isEndingSoon && !isUrgent && styles.labelTextEndingSoon,
            ]}
          >
            {isUrgent ? 'Ending Very Soon!' : isEndingSoon ? 'Ending Soon' : 'Time Remaining'}
          </Text>
        </View>
      )}

      <View style={styles.timerContainer}>
        {timeLeft.days > 0 && (
          <>
            {renderTimeBox(timeLeft.days, 'Days')}
            <Text style={styles.separator}>:</Text>
          </>
        )}
        {renderTimeBox(timeLeft.hours, 'Hours')}
        <Text style={styles.separator}>:</Text>
        {renderTimeBox(timeLeft.minutes, 'Min')}
        <Text style={styles.separator}>:</Text>
        {renderTimeBox(timeLeft.seconds, 'Sec')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  endedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  endedText: {
    fontSize: 14,
    color: '#6B7280',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  labelTextUrgent: {
    color: '#DC2626',
  },
  labelTextEndingSoon: {
    color: '#EA580C',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBoxEndingSoon: {
    backgroundColor: '#FFF7ED',
  },
  timeBoxUrgent: {
    backgroundColor: '#FEF2F2',
  },
  timeValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  timeValueUrgent: {
    color: '#DC2626',
  },
  timeLabel: {
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    fontSize: 18,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

/**
 * Generates BidForm component for React Native
 */
export function generateBidForm(options: AuctionOptions = {}): string {
  const { title = 'Place a Bid', componentName = 'BidForm' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  auctionId: string;
  currentBid: number;
  minimumBid: number;
  bidIncrement?: number;
  onBidSubmit?: (amount: number) => Promise<void>;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  auctionId,
  currentBid,
  minimumBid,
  bidIncrement = 10,
  onBidSubmit,
}) => {
  const [bidAmount, setBidAmount] = useState(minimumBid.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const suggestedBids = [
    minimumBid,
    minimumBid + bidIncrement,
    minimumBid + bidIncrement * 2,
    minimumBid + bidIncrement * 5,
  ];

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(false);

    const amount = Number(bidAmount);
    if (amount < minimumBid) {
      setError(\`Minimum bid is $\${minimumBid.toLocaleString()}\`);
      return;
    }

    Alert.alert(
      'Confirm Bid',
      \`Place a bid of $\${amount.toLocaleString()}?\`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Bid',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await onBidSubmit?.(amount);
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
            } catch (err: any) {
              setError(err.message || 'Failed to place bid');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [bidAmount, minimumBid, onBidSubmit]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${title}</Text>

      {/* Current Bid Info */}
      <View style={styles.currentBidContainer}>
        <View>
          <Text style={styles.currentBidLabel}>Current Bid</Text>
          <Text style={styles.currentBidValue}>
            \${currentBid.toLocaleString()}
          </Text>
        </View>
        <Ionicons name="trending-up" size={32} color="#10B981" />
      </View>

      {/* Quick Bid Buttons */}
      <View style={styles.quickBidContainer}>
        <Text style={styles.quickBidLabel}>Quick Bid</Text>
        <View style={styles.quickBidButtons}>
          {suggestedBids.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.quickBidButton,
                Number(bidAmount) === amount && styles.quickBidButtonSelected,
              ]}
              onPress={() => setBidAmount(amount.toString())}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickBidButtonText,
                  Number(bidAmount) === amount && styles.quickBidButtonTextSelected,
                ]}
              >
                \${amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Bid Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Maximum Bid</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            value={bidAmount}
            onChangeText={setBidAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <Text style={styles.minimumBidText}>
          Minimum bid: \${minimumBid.toLocaleString()}
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Success Message */}
      {success && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.successText}>Bid placed successfully!</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (isSubmitting || Number(bidAmount) < minimumBid) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting || Number(bidAmount) < minimumBid}
        activeOpacity={0.7}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            Place Bid: \${Number(bidAmount).toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.termsText}>
        By placing a bid, you agree to the auction terms and conditions. All bids are binding.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  currentBidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentBidLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentBidValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  quickBidContainer: {
    marginBottom: 16,
  },
  quickBidLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  quickBidButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBidButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickBidButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quickBidButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  quickBidButtonTextSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#9CA3AF',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    paddingVertical: 14,
  },
  minimumBidText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#10B981',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ${componentName};
`;
}

/**
 * Generates BidHistory component for React Native
 */
export function generateBidHistory(options: AuctionOptions = {}): string {
  const { title = 'Bid History', componentName = 'BidHistory' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Bid {
  id: string;
  bidder: {
    id: string;
    name: string;
    avatar?: string;
  };
  amount: number;
  timestamp: string;
  isWinning?: boolean;
}

interface ${componentName}Props {
  bids: Bid[];
  maxItems?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ bids, maxItems = 10 }) => {
  const displayBids = bids.slice(0, maxItems);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return \`\${Math.floor(diff / 60000)}m ago\`;
    if (diff < 86400000) return \`\${Math.floor(diff / 3600000)}h ago\`;
    return date.toLocaleDateString();
  }, []);

  const getRankStyle = useCallback((index: number) => {
    if (index === 0) return styles.rankFirst;
    if (index === 1) return styles.rankSecond;
    if (index === 2) return styles.rankThird;
    return styles.rankDefault;
  }, []);

  const renderBidItem = useCallback(({ item, index }: { item: Bid; index: number }) => (
    <View style={[styles.bidItem, item.isWinning && styles.bidItemWinning]}>
      {/* Rank */}
      <View style={[styles.rankBadge, getRankStyle(index)]}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>

      {/* Bidder Info */}
      <View style={styles.bidderContainer}>
        {item.bidder.avatar ? (
          <Image source={{ uri: item.bidder.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.bidderInfo}>
          <Text style={styles.bidderName}>{item.bidder.name}</Text>
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      </View>

      {/* Bid Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, item.isWinning && styles.amountTextWinning]}>
          \${item.amount.toLocaleString()}
        </Text>
        {item.isWinning && (
          <Text style={styles.winningLabel}>Winning</Text>
        )}
      </View>
    </View>
  ), [formatTime, getRankStyle]);

  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trending-up-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No bids yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to place a bid!</Text>
    </View>
  ), []);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Ionicons name="trending-up" size={20} color="#3B82F6" />
        <Text style={styles.headerTitle}>${title}</Text>
      </View>
      <Text style={styles.headerSubtitle}>{bids.length} total bids</Text>
    </View>
  ), [bids.length]);

  const keyExtractor = useCallback((item: Bid) => item.id, []);

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={displayBids}
        renderItem={renderBidItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      {bids.length > maxItems && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>View All {bids.length} Bids</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    flexGrow: 1,
  },
  bidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bidItemWinning: {
    backgroundColor: '#ECFDF5',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankFirst: {
    backgroundColor: '#FEF3C7',
  },
  rankSecond: {
    backgroundColor: '#E5E7EB',
  },
  rankThird: {
    backgroundColor: '#FFEDD5',
  },
  rankDefault: {
    backgroundColor: '#F3F4F6',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  bidderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidderInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timestampText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  amountTextWinning: {
    color: '#10B981',
  },
  winningLabel: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});

export default ${componentName};
`;
}

/**
 * Generates AuctionCard component for React Native
 */
export function generateAuctionCard(options: AuctionOptions = {}): string {
  const { componentName = 'AuctionCard' } = options;

  return `import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  startingBid?: number;
  bidCount: number;
  endTime: Date | string;
  category?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onPress?: (id: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  id,
  title,
  image,
  currentBid,
  bidCount,
  endTime,
  category,
  isFavorite = false,
  onFavoriteToggle,
  onPress,
}) => {
  const { isEnded, isEndingSoon, timeString } = useMemo(() => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const ended = diff <= 0;
    const endingSoon = diff > 0 && diff < 60 * 60 * 1000;

    let timeStr = 'Ended';
    if (!ended) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      if (days > 0) timeStr = \`\${days}d \${hours}h left\`;
      else if (hours > 0) timeStr = \`\${hours}h \${minutes}m left\`;
      else timeStr = \`\${minutes}m left\`;
    }

    return { isEnded: ended, isEndingSoon: endingSoon, timeString: timeStr };
  }, [endTime]);

  const handleFavoritePress = useCallback(() => {
    onFavoriteToggle?.(id);
  }, [id, onFavoriteToggle]);

  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          </View>
        )}

        {/* Category Badge */}
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#FFFFFF' : '#6B7280'}
          />
        </TouchableOpacity>

        {/* Status Badge */}
        {isEnded ? (
          <View style={styles.statusBadgeEnded}>
            <Text style={styles.statusText}>Ended</Text>
          </View>
        ) : isEndingSoon ? (
          <View style={styles.statusBadgeUrgent}>
            <Text style={styles.statusText}>Ending Soon!</Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        <View style={styles.bidRow}>
          <Text style={styles.bidLabel}>Current Bid</Text>
          <Text style={styles.bidValue}>\${currentBid.toLocaleString()}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="hammer-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{bidCount} bids</Text>
          </View>
          <View style={[styles.stat, isEndingSoon && styles.statUrgent]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isEndingSoon ? '#DC2626' : '#6B7280'}
            />
            <Text style={[styles.statText, isEndingSoon && styles.statTextUrgent]}>
              {timeString}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#EF4444',
  },
  statusBadgeEnded: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#6B7280',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeUrgent: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  bidValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statUrgent: {},
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statTextUrgent: {
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}
