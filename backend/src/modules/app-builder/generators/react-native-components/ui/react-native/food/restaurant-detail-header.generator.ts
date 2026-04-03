import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

/**
 * React Native Restaurant Detail Header Component Generator
 *
 * Generates a mobile-optimized restaurant header showing:
 * - Cover image with logo overlay
 * - Restaurant name, description, cuisine types
 * - Rating, reviews, delivery info
 * - Opening hours, contact info
 */

export function generateRNRestaurantDetailHeader(
  resolved: ResolvedComponent,
  variant: string = 'standard'
): { code: string; imports: string[] } {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'restaurants';

  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RestaurantDetailHeaderProps {
  restaurant?: any;
  restaurants?: any;
  data?: any;
  [key: string]: any;
}

export default function RestaurantDetailHeader({ restaurant, restaurants, data: propData, ...props }: RestaurantDetailHeaderProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || restaurant || restaurants) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entity}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use restaurant, restaurants, or data prop (support both singular and plural)
  const restaurantData = restaurant || restaurants || propData || fetchedData || {};

  // Helper to safely convert values
  const toDisplayString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.filter(v => v).join(', ');
    if (typeof value === 'object') {
      return value.name || value.text || value.value || JSON.stringify(value);
    }
    return fallback;
  };

  // Extract restaurant fields
  const name = toDisplayString(restaurantData.name, 'Restaurant Name');
  const description = toDisplayString(restaurantData.description, '');
  const logoUrl = toDisplayString(restaurantData.logo_url || restaurantData.logo, '');
  const coverImage = toDisplayString(
    restaurantData.cover_image || restaurantData.image,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
  );
  const cuisineTypes = toDisplayString(restaurantData.cuisine_types || restaurantData.cuisine, 'Various');
  const location = toDisplayString(restaurantData.location || restaurantData.address, '');
  const phone = toDisplayString(restaurantData.phone, '');
  const rating = Number(restaurantData.rating) || 0;
  const reviewCount = Number(restaurantData.review_count || restaurantData.reviews_count) || 0;
  const deliveryFee = Number(restaurantData.delivery_fee) || 0;
  const minimumOrder = Number(restaurantData.minimum_order || restaurantData.min_order) || 0;
  const estimatedDeliveryTime = Number(restaurantData.estimated_delivery_time || restaurantData.delivery_time) || 30;
  const isOpen = restaurantData.is_open !== undefined ? Boolean(restaurantData.is_open) :
                 restaurantData.open !== undefined ? Boolean(restaurantData.open) : true;
  const openingHours = toDisplayString(restaurantData.opening_hours || restaurantData.hours, 'Mon-Sun: 9:00 AM - 10:00 PM');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={\`star-\${i}\`} style={styles.starFull}>⭐</Text>);
    }
    if (hasHalf) {
      stars.push(<Text key="star-half" style={styles.starHalf}>⭐</Text>);
    }
    const emptyCount = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyCount; i++) {
      stars.push(<Text key={\`star-empty-\${i}\`} style={styles.starEmpty}>☆</Text>);
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handlePhonePress = () => {
    if (phone) {
      Linking.openURL(\`tel:\${phone}\`);
    }
  };

  const handleViewMenu = () => {
    // This button should navigate/scroll to menu section
    // The actual "Add to Cart" functionality will be on individual menu items
    Alert.alert('View Menu', 'Please scroll down to browse menu items and add them to your cart.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading restaurant...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Logo Overlay */}
        {logoUrl ? (
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Status Badge */}
        <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
          <Text style={styles.statusText}>{isOpen ? 'Open Now' : 'Closed'}</Text>
        </View>
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>🍽️ {cuisineTypes}</Text>
            {location ? (
              <>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>📍 {location}</Text>
              </>
            ) : null}
          </View>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>

        {/* Rating & Reviews */}
        {rating > 0 ? (
          <View style={styles.ratingContainer}>
            {renderStars(rating)}
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            {reviewCount > 0 ? (
              <Text style={styles.reviewCount}>({reviewCount.toLocaleString()} reviews)</Text>
            ) : null}
          </View>
        ) : null}

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {/* Delivery Fee */}
          <View style={styles.detailItem}>
            <View style={[styles.iconCircle, styles.iconBlue]}>
              <Text style={styles.iconText}>💵</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Fee</Text>
              <Text style={styles.detailValue}>
                {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
              </Text>
            </View>
          </View>

          {/* Minimum Order */}
          {minimumOrder > 0 ? (
            <View style={styles.detailItem}>
              <View style={[styles.iconCircle, styles.iconGreen]}>
                <Text style={styles.iconText}>💰</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Minimum Order</Text>
                <Text style={styles.detailValue}>{formatCurrency(minimumOrder)}</Text>
              </View>
            </View>
          ) : null}

          {/* Delivery Time */}
          <View style={styles.detailItem}>
            <View style={[styles.iconCircle, styles.iconOrange]}>
              <Text style={styles.iconText}>⏱️</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Time</Text>
              <Text style={styles.detailValue}>{estimatedDeliveryTime} min</Text>
            </View>
          </View>

          {/* Phone */}
          {phone ? (
            <TouchableOpacity style={styles.detailItem} onPress={handlePhonePress}>
              <View style={[styles.iconCircle, styles.iconPurple]}>
                <Text style={styles.iconText}>📞</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={[styles.detailValue, styles.phoneLink]}>{phone}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Opening Hours */}
        {openingHours ? (
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursLabel}>🕒 Opening Hours:</Text>
            <Text style={styles.hoursValue}>{openingHours}</Text>
          </View>
        ) : null}

        {/* View Menu Button */}
        <TouchableOpacity
          style={styles.viewMenuButton}
          onPress={handleViewMenu}
        >
          <Text style={styles.menuIcon}>🍽️</Text>
          <Text style={styles.viewMenuText}>View Menu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  coverContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: '#16a34a',
  },
  statusClosed: {
    backgroundColor: '#dc2626',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  metaSeparator: {
    marginHorizontal: 8,
    color: '#6b7280',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  starFull: {
    fontSize: 16,
  },
  starHalf: {
    fontSize: 16,
    opacity: 0.5,
  },
  starEmpty: {
    fontSize: 16,
    color: '#d1d5db',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '47%',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBlue: {
    backgroundColor: '#dbeafe',
  },
  iconGreen: {
    backgroundColor: '#dcfce7',
  },
  iconOrange: {
    backgroundColor: '#fed7aa',
  },
  iconPurple: {
    backgroundColor: '#e9d5ff',
  },
  iconText: {
    fontSize: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  phoneLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  hoursContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  hoursValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  viewMenuButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  viewMenuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});`;

  return {
    code,
    imports: []
  };
}
