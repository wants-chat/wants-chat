/**
 * React Native Data Table Generator
 * Generates a data table using FlatList
 */

export function generateRNDataTable(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';`,
    `import { useNavigation } from '@react-navigation/native';`,
    `import Ionicons from '@expo/vector-icons/Ionicons';`,
  ];

  const code = `${imports.join('\n')}

interface DataTableProps {
  data?: any[];
  columns?: string[];
  entity?: string;
  onRowPress?: (item: any) => void;
  loading?: boolean;
  createRoute?: string;
  createLabel?: string;
  [key: string]: any;
}

export default function DataTable({
  data,
  columns = [],
  entity = 'items',
  onRowPress,
  loading: propLoading = false,
  createRoute,
  createLabel = 'Create'
}: DataTableProps) {
  const navigation = useNavigation();
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propData = data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData;
  const displayColumns = columns.length > 0 ? columns : (sourceData.length > 0 ? Object.keys(sourceData[0]) : []);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {displayColumns.map((column, index) => (
        <Text key={index} style={styles.headerCell} numberOfLines={1}>
          {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onRowPress?.(item)}
      disabled={!onRowPress}
    >
      {displayColumns.map((column, index) => (
        <Text key={index} style={styles.cell} numberOfLines={1}>
          {item[column]?.toString() || '-'}
        </Text>
      ))}
    </TouchableOpacity>
  );

  if (loading || propLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleCreatePress = () => {
    if (createRoute) {
      // Extract screen name from route (e.g., '/artist/tracks/create' -> 'CreateTrack')
      const screenName = createRoute.split('/').pop()?.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('') || 'Create';

      (navigation as any).navigate(screenName);
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={sourceData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || item._id?.toString() || index.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      {createRoute && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});`;

  return { code, imports };
}
