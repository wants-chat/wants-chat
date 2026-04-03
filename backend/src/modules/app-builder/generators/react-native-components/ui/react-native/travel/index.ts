/**
 * Travel Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Flight Search Form
export function generateRNFlightSearchForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlightSearchFormProps {
  onSearch?: (data: any) => void;
}

export default function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<'roundTrip' | 'oneWay' | 'multiCity'>('roundTrip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');

  const handleSearch = () => {
    onSearch?.({ tripType, from, to, departDate, returnDate, passengers, cabinClass });
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.tripTypeRow}>
        {(['roundTrip', 'oneWay', 'multiCity'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tripTypeBtn, tripType === type && styles.tripTypeBtnActive]}
            onPress={() => setTripType(type)}
          >
            <Text style={[styles.tripTypeText, tripType === type && styles.tripTypeTextActive]}>
              {type === 'roundTrip' ? 'Round Trip' : type === 'oneWay' ? 'One Way' : 'Multi-City'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.locationRow}>
        <View style={styles.locationInput}>
          <Ionicons name="airplane" size={20} color="#6b7280" style={styles.icon} />
          <TextInput style={styles.input} placeholder="From" value={from} onChangeText={setFrom} />
        </View>
        <TouchableOpacity style={styles.swapBtn} onPress={swapLocations}>
          <Ionicons name="swap-horizontal" size={20} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.locationInput}>
          <Ionicons name="location" size={20} color="#6b7280" style={styles.icon} />
          <TextInput style={styles.input} placeholder="To" value={to} onChangeText={setTo} />
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateInput}>
          <Ionicons name="calendar" size={20} color="#6b7280" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Departure" value={departDate} onChangeText={setDepartDate} />
        </View>
        {tripType === 'roundTrip' && (
          <View style={styles.dateInput}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Return" value={returnDate} onChangeText={setReturnDate} />
          </View>
        )}
      </View>

      <View style={styles.optionsRow}>
        <View style={styles.passengerInput}>
          <Text style={styles.label}>Passengers</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setPassengers(Math.max(1, passengers - 1))} style={styles.counterBtn}>
              <Ionicons name="remove" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{passengers}</Text>
            <TouchableOpacity onPress={() => setPassengers(passengers + 1)} style={styles.counterBtn}>
              <Ionicons name="add" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Ionicons name="search" size={20} color="#fff" />
        <Text style={styles.searchBtnText}>Search Flights</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  tripTypeRow: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  tripTypeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  tripTypeBtnActive: { backgroundColor: '#3b82f6' },
  tripTypeText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  tripTypeTextActive: { color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  locationInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12 },
  swapBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12 },
  optionsRow: { marginBottom: 20 },
  passengerInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12 },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: 18, fontWeight: '600', color: '#111827', minWidth: 30, textAlign: 'center' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, gap: 8 },
  searchBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';"],
  };
}

// Hotel Search Form
export function generateRNHotelSearchForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HotelSearchFormProps {
  onSearch?: (data: any) => void;
}

export default function HotelSearchForm({ onSearch }: HotelSearchFormProps) {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    onSearch?.({ destination, checkIn, checkOut, rooms, guests });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.inputGroup}>
        <Ionicons name="location" size={20} color="#6b7280" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Where are you going?" value={destination} onChangeText={setDestination} />
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateInput}>
          <Ionicons name="calendar" size={20} color="#6b7280" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Check-in" value={checkIn} onChangeText={setCheckIn} />
        </View>
        <View style={styles.dateInput}>
          <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Check-out" value={checkOut} onChangeText={setCheckOut} />
        </View>
      </View>

      <View style={styles.guestRow}>
        <View style={styles.guestItem}>
          <Text style={styles.label}>Rooms</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setRooms(Math.max(1, rooms - 1))} style={styles.counterBtn}>
              <Ionicons name="remove" size={18} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{rooms}</Text>
            <TouchableOpacity onPress={() => setRooms(rooms + 1)} style={styles.counterBtn}>
              <Ionicons name="add" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.guestItem}>
          <Text style={styles.label}>Guests</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} style={styles.counterBtn}>
              <Ionicons name="remove" size={18} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{guests}</Text>
            <TouchableOpacity onPress={() => setGuests(guests + 1)} style={styles.counterBtn}>
              <Ionicons name="add" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Ionicons name="search" size={20} color="#fff" />
        <Text style={styles.searchBtnText}>Search Hotels</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12 },
  guestRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  guestItem: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12 },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  counterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: 16, fontWeight: '600', color: '#111827', minWidth: 24, textAlign: 'center' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, gap: 8 },
  searchBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';"],
  };
}

// Flight Results List
export function generateRNFlightResultsList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  departure: { time: string; airport: string; city: string };
  arrival: { time: string; airport: string; city: string };
  duration: string;
  stops: number;
  price: number;
  currency?: string;
}

interface FlightResultsListProps {
  flights: Flight[];
  onSelect?: (flight: Flight) => void;
}

export default function FlightResultsList({ flights, onSelect }: FlightResultsListProps) {
  const renderFlight = ({ item }: { item: Flight }) => (
    <TouchableOpacity style={styles.flightCard} onPress={() => onSelect?.(item)}>
      <View style={styles.airlineRow}>
        {item.airlineLogo ? (
          <Image source={{ uri: item.airlineLogo }} style={styles.airlineLogo} />
        ) : (
          <View style={styles.airlineLogoPlaceholder}>
            <Ionicons name="airplane" size={20} color="#6b7280" />
          </View>
        )}
        <View>
          <Text style={styles.airlineName}>{item.airline}</Text>
          <Text style={styles.flightNumber}>{item.flightNumber}</Text>
        </View>
      </View>

      <View style={styles.flightDetails}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{item.departure.time}</Text>
          <Text style={styles.airport}>{item.departure.airport}</Text>
        </View>

        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{item.duration}</Text>
          <View style={styles.flightLine}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <Ionicons name="airplane" size={16} color="#3b82f6" />
          </View>
          <Text style={styles.stops}>{item.stops === 0 ? 'Direct' : \`\${item.stops} stop\${item.stops > 1 ? 's' : ''}\`}</Text>
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.time}>{item.arrival.time}</Text>
          <Text style={styles.airport}>{item.arrival.airport}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.currency || '$'}{item.price}</Text>
        <TouchableOpacity style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>Select</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={flights}
      keyExtractor={(item) => item.id}
      renderItem={renderFlight}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  flightCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  airlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  airlineLogo: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  airlineLogoPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  airlineName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  flightNumber: { fontSize: 12, color: '#6b7280' },
  flightDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeBlock: { alignItems: 'center' },
  time: { fontSize: 18, fontWeight: '700', color: '#111827' },
  airport: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  durationBlock: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  duration: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  flightLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' },
  line: { flex: 1, height: 1, backgroundColor: '#e5e7eb', marginHorizontal: 4 },
  stops: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  price: { fontSize: 20, fontWeight: '700', color: '#111827' },
  selectBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  selectBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';"],
  };
}

// Hotel Results Grid
export function generateRNHotelResultsGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Hotel {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  price: number;
  currency?: string;
  amenities?: string[];
}

interface HotelResultsGridProps {
  hotels: Hotel[];
  onSelect?: (hotel: Hotel) => void;
}

export default function HotelResultsGrid({ hotels, onSelect }: HotelResultsGridProps) {
  const renderHotel = ({ item }: { item: Hotel }) => (
    <TouchableOpacity style={styles.hotelCard} onPress={() => onSelect?.(item)}>
      <Image source={{ uri: item.image }} style={styles.hotelImage} />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.currency || '$'}{item.price}</Text>
          <Text style={styles.perNight}>/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={hotels}
      keyExtractor={(item) => item.id}
      renderItem={renderHotel}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const cardWidth = (Dimensions.get('window').width - 48) / 2;

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  hotelCard: { width: cardWidth, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  hotelImage: { width: '100%', height: 120, backgroundColor: '#f3f4f6' },
  hotelInfo: { padding: 12 },
  hotelName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { fontSize: 12, fontWeight: '600', color: '#111827', marginLeft: 4 },
  reviewCount: { fontSize: 11, color: '#9ca3af', marginLeft: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  location: { fontSize: 12, color: '#6b7280', marginLeft: 4, flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 16, fontWeight: '700', color: '#111827' },
  perNight: { fontSize: 12, color: '#6b7280', marginLeft: 2 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions } from 'react-native';"],
  };
}

// Booking Summary Card
export function generateRNBookingSummaryCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingSummaryCardProps {
  type: 'flight' | 'hotel';
  title: string;
  subtitle?: string;
  image?: string;
  details: { label: string; value: string }[];
  price: number;
  currency?: string;
}

export default function BookingSummaryCard({ type, title, subtitle, image, details, price, currency = '$' }: BookingSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.iconContainer}>
            <Ionicons name={type === 'flight' ? 'airplane' : 'bed'} size={24} color="#3b82f6" />
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        {details.map((detail, index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Total Price</Text>
        <Text style={styles.price}>{currency}{price.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  iconContainer: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 },
  details: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  detailValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  price: { fontSize: 24, fontWeight: '700', color: '#111827' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, Image } from 'react-native';"],
  };
}

// Travel Itinerary Timeline
export function generateRNTravelItineraryTimeline(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ItineraryItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'transfer';
  title: string;
  time: string;
  location?: string;
  duration?: string;
  status?: 'upcoming' | 'active' | 'completed';
}

interface TravelItineraryTimelineProps {
  date: string;
  items: ItineraryItem[];
  onItemPress?: (item: ItineraryItem) => void;
}

export default function TravelItineraryTimeline({ date, items, onItemPress }: TravelItineraryTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return 'airplane';
      case 'hotel': return 'bed';
      case 'activity': return 'flag';
      case 'transfer': return 'car';
      default: return 'location';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'active': return '#3b82f6';
      default: return '#9ca3af';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.date}>{date}</Text>

      {items.map((item: any, index: number) => (
        <TouchableOpacity key={item.id} style={styles.item} onPress={() => onItemPress?.(item)}>
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]}>
              <Ionicons name={getIcon(item.type)} size={14} color="#fff" />
            </View>
            {index < items.length - 1 && <View style={styles.line} />}
          </View>

          <View style={styles.content}>
            <View style={styles.timeRow}>
              <Text style={styles.time}>{item.time}</Text>
              {item.duration && <Text style={styles.duration}>{item.duration}</Text>}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#6b7280" />
                <Text style={styles.location}>{item.location}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  date: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20 },
  item: { flexDirection: 'row', marginBottom: 4 },
  timeline: { alignItems: 'center', marginRight: 16 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  content: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  time: { fontSize: 14, fontWeight: '600', color: '#111827' },
  duration: { fontSize: 12, color: '#6b7280', marginLeft: 8 },
  title: { fontSize: 14, color: '#374151', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';"],
  };
}

// Destination Card
export function generateRNDestinationCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DestinationCardProps {
  image: string;
  name: string;
  country: string;
  rating?: number;
  price?: number;
  currency?: string;
  onPress?: () => void;
}

export default function DestinationCard({ image, name, country, rating, price, currency = '$', onPress }: DestinationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground source={{ uri: image }} style={styles.image} imageStyle={styles.imageStyle}>
        <View style={styles.overlay}>
          {rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.content}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#fff" />
              <Text style={styles.country}>{country}</Text>
            </View>
            {price && (
              <Text style={styles.price}>From {currency}{price}</Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', height: 200, marginBottom: 16 },
  image: { flex: 1 },
  imageStyle: { borderRadius: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 16, justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-end', gap: 4 },
  ratingText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  content: { },
  name: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  country: { color: '#fff', fontSize: 14, marginLeft: 4 },
  price: { fontSize: 14, color: '#fff', opacity: 0.9 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';"],
  };
}

// Travel Map View
export function generateRNTravelMapView(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'destination' | 'hotel' | 'attraction';
}

interface TravelMapViewProps {
  locations: Location[];
  onLocationPress?: (location: Location) => void;
}

export default function TravelMapView({ locations, onLocationPress }: TravelMapViewProps) {
  // Note: In production, use react-native-maps
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={48} color="#9ca3af" />
        <Text style={styles.placeholderText}>Map View</Text>
        <Text style={styles.placeholderSubtext}>Showing {locations.length} locations</Text>
      </View>

      <View style={styles.locationList}>
        {locations.slice(0, 3).map((location) => (
          <View key={location.id} style={styles.locationItem}>
            <View style={styles.locationIcon}>
              <Ionicons
                name={location.type === 'hotel' ? 'bed' : location.type === 'attraction' ? 'flag' : 'location'}
                size={16}
                color="#3b82f6"
              />
            </View>
            <Text style={styles.locationName}>{location.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', margin: 16, borderRadius: 16, minHeight: 200 },
  placeholderText: { fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 12 },
  placeholderSubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  locationList: { padding: 16, gap: 12 },
  locationItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  locationIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  locationName: { fontSize: 14, fontWeight: '500', color: '#111827' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, Dimensions } from 'react-native';"],
  };
}

// Trip Planner Form
export function generateRNTripPlannerForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TripPlannerFormProps {
  onSubmit?: (data: any) => void;
}

export default function TripPlannerForm({ onSubmit }: TripPlannerFormProps) {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [budget, setBudget] = useState('');
  const [tripType, setTripType] = useState<string[]>([]);

  const tripTypes = ['Adventure', 'Relaxation', 'Cultural', 'Business', 'Family', 'Romantic'];

  const toggleTripType = (type: string) => {
    setTripType(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = () => {
    onSubmit?.({ tripName, destination, startDate, endDate, travelers, budget, tripType });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Trip Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Trip Name</Text>
        <TextInput style={styles.input} placeholder="My Amazing Trip" value={tripName} onChangeText={setTripName} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Destination</Text>
        <View style={styles.inputWithIcon}>
          <Ionicons name="location" size={20} color="#6b7280" />
          <TextInput style={styles.iconInput} placeholder="Where to?" value={destination} onChangeText={setDestination} />
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput style={styles.input} placeholder="Start" value={startDate} onChangeText={setStartDate} />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>End Date</Text>
          <TextInput style={styles.input} placeholder="End" value={endDate} onChangeText={setEndDate} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Number of Travelers</Text>
        <View style={styles.counter}>
          <TouchableOpacity onPress={() => setTravelers(Math.max(1, travelers - 1))} style={styles.counterBtn}>
            <Ionicons name="remove" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{travelers}</Text>
          <TouchableOpacity onPress={() => setTravelers(travelers + 1)} style={styles.counterBtn}>
            <Ionicons name="add" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Trip Type</Text>
        <View style={styles.chipContainer}>
          {tripTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, tripType.includes(type) && styles.chipActive]}
              onPress={() => toggleTripType(type)}
            >
              <Text style={[styles.chipText, tripType.includes(type) && styles.chipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Create Trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  iconInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  dateRow: { flexDirection: 'row', gap: 12 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: 20, fontWeight: '600', color: '#111827', minWidth: 40, textAlign: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  chipActive: { backgroundColor: '#3b82f6' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';"],
  };
}

// Saved Trips List
export function generateRNSavedTripsList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Trip {
  id: string;
  name: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
}

interface SavedTripsListProps {
  trips: Trip[];
  onTripPress?: (trip: Trip) => void;
}

export default function SavedTripsList({ trips, onTripPress }: SavedTripsListProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'upcoming': return { bg: '#eff6ff', text: '#3b82f6' };
      case 'ongoing': return { bg: '#dcfce7', text: '#16a34a' };
      case 'completed': return { bg: '#f3f4f6', text: '#6b7280' };
      default: return { bg: '#fef3c7', text: '#d97706' };
    }
  };

  const renderTrip = ({ item }: { item: Trip }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.tripCard} onPress={() => onTripPress?.(item)}>
        <Image source={{ uri: item.image }} style={styles.tripImage} />
        <View style={styles.tripInfo}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.destinationRow}>
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text style={styles.destination}>{item.destination}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
            <Text style={styles.dates}>{item.startDate} - {item.endDate}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={renderTrip}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tripImage: { width: 80, height: 80, borderRadius: 12, marginRight: 12 },
  tripInfo: { flex: 1 },
  tripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  tripName: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  destinationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  destination: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dates: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';"],
  };
}

// Travel Reviews Section
export function generateRNTravelReviewsSection(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  helpful?: number;
}

interface TravelReviewsSectionProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export default function TravelReviewsSection({ reviews, averageRating = 0, totalReviews = 0 }: TravelReviewsSectionProps) {
  const renderStars = (rating: number) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
      ))}
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.author.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        {renderStars(item.rating)}
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      {item.helpful !== undefined && (
        <View style={styles.helpfulRow}>
          <Ionicons name="thumbs-up-outline" size={14} color="#6b7280" />
          <Text style={styles.helpfulText}>{item.helpful} found this helpful</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
        {renderStars(Math.round(averageRating))}
        <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },
  summary: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 16 },
  averageRating: { fontSize: 48, fontWeight: '700', color: '#111827' },
  stars: { flexDirection: 'row', gap: 4, marginVertical: 8 },
  totalReviews: { fontSize: 14, color: '#6b7280' },
  reviewCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reviewDate: { fontSize: 12, color: '#9ca3af' },
  comment: { fontSize: 14, color: '#374151', lineHeight: 20 },
  helpfulRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  helpfulText: { fontSize: 12, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, Image } from 'react-native';"],
  };
}

// Packing List Checklist
export function generateRNPackingListChecklist(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

interface PackingListChecklistProps {
  items: PackingItem[];
  onToggle?: (id: string) => void;
  onAdd?: (name: string, category: string) => void;
}

export default function PackingListChecklist({ items, onToggle, onAdd }: PackingListChecklistProps) {
  const [newItem, setNewItem] = useState('');
  const categories = [...new Set(items.map(i => i.category))];
  const packedCount = items.filter(i => i.packed).length;

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd?.(newItem.trim(), 'General');
      setNewItem('');
    }
  };

  const renderItem = ({ item }: { item: PackingItem }) => (
    <TouchableOpacity style={styles.item} onPress={() => onToggle?.(item.id)}>
      <View style={[styles.checkbox, item.packed && styles.checkboxChecked]}>
        {item.packed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={[styles.itemName, item.packed && styles.itemNamePacked]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Packing List</Text>
        <Text style={styles.progress}>{packedCount}/{items.length} packed</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: \`\${(packedCount / items.length) * 100}%\` }]} />
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add item..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {categories.map((category) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={items.filter(i => i.category === category)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  progress: { fontSize: 14, color: '#6b7280' },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginBottom: 20 },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
  addRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  addInput: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  addBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  categorySection: { marginBottom: 20 },
  categoryTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#10b981', borderColor: '#10b981' },
  itemName: { fontSize: 16, color: '#111827' },
  itemNamePacked: { color: '#9ca3af', textDecorationLine: 'line-through' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';"],
  };
}

// ============================================================================
// MISSING TRAVEL GENERATORS - Placeholders
// ============================================================================

// Travel Hero Generator
export function generateRNTravelHero(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface TravelHeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  onSearchPress?: () => void;
}

export default function TravelHero({
  title = 'Discover Your Next Adventure',
  subtitle = 'Explore amazing destinations worldwide',
  backgroundImage = 'https://via.placeholder.com/1200x800',
  onSearchPress,
}: TravelHeroProps) {
  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <TouchableOpacity style={styles.searchBtn} onPress={onSearchPress}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.searchText}>Search Destinations</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { width, height: height * 0.5 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8, textAlign: 'center' },
  searchBtn: { flexDirection: 'row', backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, marginTop: 24 },
  searchText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Destinations Grid
export function generateRNTravelDestinationsGrid(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating?: number;
}

interface TravelDestinationsGridProps {
  destinations?: Destination[];
  onDestinationPress?: (id: string) => void;
}

export default function TravelDestinationsGrid({ destinations = [], onDestinationPress }: TravelDestinationsGridProps) {
  const renderItem = ({ item }: { item: Destination }) => (
    <TouchableOpacity style={styles.card} onPress={() => onDestinationPress?.(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.country}>{item.country}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={destinations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { justifyContent: 'space-between' },
  card: { width: cardWidth, marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  image: { width: '100%', height: 120 },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  country: { fontSize: 14, color: '#6b7280', marginTop: 2 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';"],
  };
}

// Travel Destination Detail Page
export function generateRNTravelDestinationDetailPage(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TravelDestinationDetailPageProps {
  name?: string;
  country?: string;
  description?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  onBookPress?: () => void;
}

export default function TravelDestinationDetailPage({
  name = 'Paris',
  country = 'France',
  description = 'The City of Light awaits with its stunning architecture.',
  image = 'https://via.placeholder.com/800x400',
  rating = 4.8,
  reviews = 2450,
  onBookPress,
}: TravelDestinationDetailPageProps) {
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: image }} style={styles.heroImage} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.country}>{country}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.rating}>{rating}</Text>
          <Text style={styles.reviews}>({reviews} reviews)</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity style={styles.bookBtn} onPress={onBookPress}>
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroImage: { width, height: 280 },
  content: { padding: 20 },
  name: { fontSize: 28, fontWeight: '700', color: '#111827' },
  country: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  rating: { fontSize: 14, fontWeight: '600', color: '#111827', marginLeft: 4 },
  reviews: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24, marginTop: 16 },
  bookBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  bookText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Hotels Grid
export function generateRNTravelHotelsGrid(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Hotel {
  id: string;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
}

interface TravelHotelsGridProps {
  hotels?: Hotel[];
  onHotelPress?: (id: string) => void;
}

export default function TravelHotelsGrid({ hotels = [], onHotelPress }: TravelHotelsGridProps) {
  const renderItem = ({ item }: { item: Hotel }) => (
    <TouchableOpacity style={styles.card} onPress={() => onHotelPress?.(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>\${item.price}/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return <FlatList data={hotels} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.container} />;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  location: { fontSize: 14, color: '#6b7280' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '500', color: '#111827', marginLeft: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#3b82f6' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Hotel Detail Page
export function generateRNTravelHotelDetailPage(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TravelHotelDetailPageProps {
  name?: string;
  location?: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
  amenities?: string[];
  onBookPress?: () => void;
}

export default function TravelHotelDetailPage({
  name = 'Grand Hotel',
  location = 'Paris, France',
  description = 'A luxurious hotel in the heart of the city.',
  image = 'https://via.placeholder.com/800x400',
  price = 199,
  rating = 4.7,
  amenities = ['WiFi', 'Pool', 'Spa', 'Restaurant'],
  onBookPress,
}: TravelHotelDetailPageProps) {
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.location}>{location}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.rating}>{rating}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenities}>
          {amenities.map((a, i) => <View key={i} style={styles.amenity}><Text style={styles.amenityText}>{a}</Text></View>)}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>\${price}</Text>
          <Text style={styles.perNight}>/night</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={onBookPress}>
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width, height: 250 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: '700', color: '#111827' },
  location: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rating: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 20 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  amenity: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  amenityText: { fontSize: 14, color: '#374151' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 20 },
  price: { fontSize: 28, fontWeight: '700', color: '#3b82f6' },
  perNight: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  bookBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  bookText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Flights Grid
export function generateRNTravelFlightsGrid(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Flight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: string;
}

interface TravelFlightsGridProps {
  flights?: Flight[];
  onFlightPress?: (id: string) => void;
}

export default function TravelFlightsGrid({ flights = [], onFlightPress }: TravelFlightsGridProps) {
  const renderItem = ({ item }: { item: Flight }) => (
    <TouchableOpacity style={styles.card} onPress={() => onFlightPress?.(item.id)}>
      <Text style={styles.airline}>{item.airline}</Text>
      <View style={styles.route}>
        <View style={styles.airport}>
          <Text style={styles.time}>{item.departureTime}</Text>
          <Text style={styles.code}>{item.departure}</Text>
        </View>
        <View style={styles.middle}>
          <Text style={styles.duration}>{item.duration}</Text>
          <View style={styles.line}><Ionicons name="airplane" size={16} color="#3b82f6" /></View>
        </View>
        <View style={styles.airport}>
          <Text style={styles.time}>{item.arrivalTime}</Text>
          <Text style={styles.code}>{item.arrival}</Text>
        </View>
      </View>
      <Text style={styles.price}>\${item.price}</Text>
    </TouchableOpacity>
  );

  return <FlatList data={flights} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.container} />;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  airline: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  route: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  airport: { alignItems: 'center' },
  time: { fontSize: 18, fontWeight: '700', color: '#111827' },
  code: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  middle: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  duration: { fontSize: 12, color: '#6b7280' },
  line: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 20, fontWeight: '700', color: '#3b82f6', textAlign: 'right', marginTop: 12 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Flights List (alias)
export const generateRNTravelFlightsList = generateRNTravelFlightsGrid;

// Travel Flight Detail Page
export function generateRNTravelFlightDetailPage(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TravelFlightDetailPageProps {
  airline?: string;
  flightNumber?: string;
  departure?: string;
  arrival?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  price?: number;
  onBookPress?: () => void;
}

export default function TravelFlightDetailPage({
  airline = 'Air France',
  flightNumber = 'AF 123',
  departure = 'JFK',
  arrival = 'CDG',
  departureTime = '10:00 AM',
  arrivalTime = '11:30 PM',
  duration = '7h 30m',
  price = 599,
  onBookPress,
}: TravelFlightDetailPageProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.airline}>{airline}</Text>
        <Text style={styles.flightNumber}>{flightNumber}</Text>
      </View>
      <View style={styles.route}>
        <View style={styles.airport}>
          <Text style={styles.time}>{departureTime}</Text>
          <Text style={styles.code}>{departure}</Text>
        </View>
        <View style={styles.middle}>
          <Text style={styles.duration}>{duration}</Text>
          <Ionicons name="airplane" size={24} color="#3b82f6" />
        </View>
        <View style={styles.airport}>
          <Text style={styles.time}>{arrivalTime}</Text>
          <Text style={styles.code}>{arrival}</Text>
        </View>
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.price}>\${price}</Text>
        <Text style={styles.perPerson}>per person</Text>
      </View>
      <TouchableOpacity style={styles.bookBtn} onPress={onBookPress}>
        <Text style={styles.bookText}>Book Flight</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  airline: { fontSize: 20, fontWeight: '700', color: '#111827' },
  flightNumber: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  route: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#f9fafb', borderRadius: 12 },
  airport: { alignItems: 'center' },
  time: { fontSize: 24, fontWeight: '700', color: '#111827' },
  code: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  middle: { alignItems: 'center' },
  duration: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  priceSection: { alignItems: 'center', marginTop: 24 },
  price: { fontSize: 32, fontWeight: '700', color: '#3b82f6' },
  perPerson: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  bookBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  bookText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Tour Packages Grid
export function generateRNTravelTourPackagesGrid(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TourPackage {
  id: string;
  name: string;
  duration: string;
  image: string;
  price: number;
  rating: number;
}

interface TravelTourPackagesGridProps {
  packages?: TourPackage[];
  onPackagePress?: (id: string) => void;
}

export default function TravelTourPackagesGrid({ packages = [], onPackagePress }: TravelTourPackagesGridProps) {
  const renderItem = ({ item }: { item: TourPackage }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPackagePress?.(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.duration}>{item.duration}</Text>
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>From \${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return <FlatList data={packages} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.container} />;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  image: { width: '100%', height: 160 },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  duration: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '500', marginLeft: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#3b82f6' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Tour Detail Page
export function generateRNTravelTourDetailPage(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TravelTourDetailPageProps {
  name?: string;
  duration?: string;
  description?: string;
  image?: string;
  price?: number;
  includes?: string[];
  onBookPress?: () => void;
}

export default function TravelTourDetailPage({
  name = 'European Adventure',
  duration = '10 Days',
  description = 'Experience the best of Europe in this exciting tour.',
  image = 'https://via.placeholder.com/800x400',
  price = 2499,
  includes = ['Flights', 'Hotels', 'Tours', 'Meals'],
  onBookPress,
}: TravelTourDetailPageProps) {
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.duration}>{duration}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.sectionTitle}>Includes</Text>
        <View style={styles.includes}>
          {includes.map((item, i) => (
            <View key={i} style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>\${price}</Text>
          <Text style={styles.perPerson}>per person</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={onBookPress}>
          <Text style={styles.bookText}>Book Tour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width, height: 250 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: '700', color: '#111827' },
  duration: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 20 },
  includes: { marginTop: 12 },
  includeItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  includeText: { fontSize: 14, color: '#374151', marginLeft: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 20 },
  price: { fontSize: 28, fontWeight: '700', color: '#3b82f6' },
  perPerson: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  bookBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  bookText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Booking Confirmation Page
export function generateRNTravelBookingConfirmationPage(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TravelBookingConfirmationPageProps {
  bookingId?: string;
  destination?: string;
  dates?: string;
  totalPrice?: number;
  onViewDetailsPress?: () => void;
  onHomePress?: () => void;
}

export default function TravelBookingConfirmationPage({
  bookingId = 'BK123456',
  destination = 'Paris, France',
  dates = 'Jan 15 - Jan 22, 2024',
  totalPrice = 1299,
  onViewDetailsPress,
  onHomePress,
}: TravelBookingConfirmationPageProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color="#10b981" />
      </View>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Your trip is all set</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Booking ID</Text>
          <Text style={styles.value}>{bookingId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{destination}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dates</Text>
          <Text style={styles.value}>{dates}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>\${totalPrice}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={onViewDetailsPress}>
        <Text style={styles.primaryText}>View Booking Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={onHomePress}>
        <Text style={styles.secondaryText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  successIcon: { alignItems: 'center', marginTop: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 20, marginTop: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalRow: { borderBottomWidth: 0, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#3b82f6' },
  primaryBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  secondaryText: { color: '#3b82f6', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Dashboard Page
export function generateRNTravelDashboardPage(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TravelDashboardPageProps {
  userName?: string;
  upcomingTrips?: number;
  savedPlaces?: number;
  onSearchPress?: () => void;
}

export default function TravelDashboardPage({
  userName = 'Traveler',
  upcomingTrips = 2,
  savedPlaces = 15,
  onSearchPress,
}: TravelDashboardPageProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName}</Text>
        <Text style={styles.subtitle}>Where to next?</Text>
      </View>
      <TouchableOpacity style={styles.searchBar} onPress={onSearchPress}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <Text style={styles.searchText}>Search destinations...</Text>
      </TouchableOpacity>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="airplane" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{upcomingTrips}</Text>
          <Text style={styles.statLabel}>Upcoming Trips</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="heart" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{savedPlaces}</Text>
          <Text style={styles.statLabel}>Saved Places</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 40 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  searchText: { fontSize: 16, color: '#9ca3af', marginLeft: 10 },
  statsRow: { flexDirection: 'row', padding: 20, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111827', marginTop: 8 },
  statLabel: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}

// Travel Search Bar
export function generateRNTravelSearchBar(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TravelSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function TravelSearchBar({
  placeholder = 'Where do you want to go?',
  onSearch,
}: TravelSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch?.(query);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#6b7280" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity style={styles.filterBtn}>
        <Ionicons name="options-outline" size={20} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginHorizontal: 16 },
  input: { flex: 1, fontSize: 16, color: '#111827', marginLeft: 10 },
  filterBtn: { padding: 8 },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';", "import { Ionicons } from '@expo/vector-icons';"],
  };
}
