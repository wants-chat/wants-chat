import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateTabsNavigation = (
  resolved: ResolvedComponent,
  variant: 'horizontal' | 'bottom-tabs' = 'horizontal'
) => {
  const dataSource = resolved.dataSource;

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart || 'data';
  };

  const dataName = getDataPath();

  // Extract entity name from dataSource for API endpoint
  const getEntityName = () => {
    if (!dataSource || dataSource.trim() === '') return 'items';
    const parts = dataSource.split('.');
    return parts[0] || 'items';
  };

  const entityName = getEntityName();

  const code = `
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

interface TabsNavigationProps {
  data?: any;
  tabItems?: any[];
  defaultActiveTab?: string;
  itemsPerPage?: number;
  navigation?: any;
  [key: string]: any;
}

export default function TabsNavigation({
  data: propData,
  tabItems: propTabItems,
  defaultActiveTab: propDefaultTab,
  itemsPerPage = 12,
  navigation,
  ...props
}: TabsNavigationProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const componentData = propData || fetchedData;

  // Extract data array from response object if needed (handle both API response and plain array)
  const extractDataArray = (input: any): any[] => {
    if (!input) return [];
    // If it's an API response object with a 'data' property, extract it
    if (input.data && Array.isArray(input.data)) return input.data;
    // If it's already an array, use it
    if (Array.isArray(input)) return input;
    // If it has a nested data property that's an array (e.g., response.data.data)
    if (input.data?.data && Array.isArray(input.data.data)) return input.data.data;
    return [];
  };

  // Helper to get data from multiple sources, checking if array has items
  const getDataWithFallback = (...sources: any[]): any[] => {
    for (const source of sources) {
      const extracted = extractDataArray(source);
      if (extracted.length > 0) return extracted;
    }
    return [];
  };

  const data = componentData || {};

  // Get data from props or from data object - handle multiple fetch actions
  // Extract data arrays, handling both API response objects and plain arrays
  const tabItems = propTabItems || data?.tabItems || props.tabs || [];
  const tracks = getDataWithFallback(props.tracksData, data?.tracks, data);
  const albums = getDataWithFallback(props.albumsData, data?.albums);
  const artists = getDataWithFallback(props.artistsData, data?.artists);
  const playlists = getDataWithFallback(props.playlistsData, data?.playlists);
  const defaultActiveTab = propDefaultTab || data?.defaultActiveTab || (tabItems[0]?.id || 'tracks');

  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  // Get data for active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'tracks':
        return tracks;
      case 'albums':
        return albums;
      case 'artists':
        return artists;
      case 'playlists':
        return playlists;
      default:
        return tracks;
    }
  };

  const currentData = getCurrentData();

  // Pagination logic
  const totalPages = Math.ceil((currentData?.length || 0) / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentData.slice(startIndex, endIndex);
  }, [currentData, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  // Render item card based on type
  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'tracks') {
      return (
        <TouchableOpacity
          style={styles.trackCard}
          onPress={() => {
            const trackId = item.id || item._id;
            if (trackId && navigation) {
              (navigation as any).navigate('TrackDetail', { id: trackId });
            }
          }}
        >
          {item.cover_image && (
            <Image
              source={{ uri: item.cover_image }}
              style={styles.trackImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {item.title || item.name || 'Untitled'}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}
            </Text>
            {item.duration_seconds && (
              <Text style={styles.trackDuration}>
                {formatDuration(item.duration_seconds)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    } else if (activeTab === 'albums') {
      return (
        <TouchableOpacity style={styles.gridCard}>
          <Image
            source={{ uri: item.cover_image || 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.title || item.name || 'Untitled'}
          </Text>
          <Text style={styles.gridSubtitle} numberOfLines={1}>
            {item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}
          </Text>
        </TouchableOpacity>
      );
    } else if (activeTab === 'artists') {
      return (
        <TouchableOpacity style={styles.gridCard}>
          <Image
            source={{ uri: item.profile_image || 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.name || item.title || 'Unknown'}
          </Text>
          {item.follower_count !== undefined && (
            <Text style={styles.gridSubtitle} numberOfLines={1}>
              {item.follower_count.toLocaleString()} followers
            </Text>
          )}
        </TouchableOpacity>
      );
    } else if (activeTab === 'playlists') {
      return (
        <TouchableOpacity style={styles.gridCard}>
          <Image
            source={{ uri: item.cover_image || 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.name || item.title || 'Untitled'}
          </Text>
          <Text style={styles.gridSubtitle} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          {item.track_count !== undefined && (
            <Text style={styles.gridMeta}>
              {item.track_count} tracks
            </Text>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Debug: Log data to console
  console.log('TabsNavigation Data:', { tracks, albums, artists, playlists, activeTab, currentData });

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs Header */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabItems.map((tab: any) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => handleTabClick(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {paginatedData.length > 0 ? (
        <View style={styles.content}>
          <FlatList
            data={paginatedData}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id || item._id || index.toString()}
            numColumns={activeTab === 'tracks' ? 1 : 2}
            key={activeTab === 'tracks' ? 'list' : 'grid'}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.paginationInfo}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length}
              </Text>
              <View style={styles.paginationButtons}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === 1 && styles.paginationButtonDisabled
                  ]}
                  onPress={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <Text style={[
                    styles.paginationButtonText,
                    currentPage === 1 && styles.paginationButtonTextDisabled
                  ]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <View style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <TouchableOpacity
                        key={page}
                        style={[
                          styles.pageNumber,
                          currentPage === page && styles.pageNumberActive
                        ]}
                        onPress={() => goToPage(page)}
                      >
                        <Text style={[
                          styles.pageNumberText,
                          currentPage === page && styles.pageNumberTextActive
                        ]}>
                          {page}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === totalPages && styles.paginationButtonDisabled
                  ]}
                  onPress={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <Text style={[
                    styles.paginationButtonText,
                    currentPage === totalPages && styles.paginationButtonTextDisabled
                  ]}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No {activeTab} found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  tabsContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  trackCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trackArtist: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  trackDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  gridCard: {
    width: (Dimensions.get('window').width - 48) / 2,
    marginBottom: 16,
    marginRight: 16,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  gridSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  gridMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  pagination: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  paginationButtonTextDisabled: {
    color: '#9ca3af',
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumber: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  pageNumberActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
});
`;

  return {
    code,
    imports: [
      "import React, { useState, useMemo, useEffect } from 'react';",
      "import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';",
    ],
  };
};
