/**
 * React Native Recipe Card Component Generator
 *
 * Generates a mobile-optimized recipe card showing:
 * - Recipe image with gradient overlay
 * - Title, description, category, cuisine
 * - Prep time, cook time, servings, calories
 * - Difficulty level, rating
 * - Favorite button
 */

export function generateRNRecipeCard(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RecipeCardProps {
  recipe?: any;
  recipes?: any;
  data?: any;
  entity?: string;
  recipeId?: string;
  onPress?: () => void;
  onFavoriteChange?: (isFavorite: boolean) => void;
  [key: string]: any;
}

export default function RecipeCard({ recipe, recipes, data, entity = 'recipes', recipeId, onPress, onFavoriteChange, ...props }: RecipeCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const propData = recipe || recipes || data;

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      if (!recipeId) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}/\${recipeId}\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, recipeId, propData]);

  // Use recipe, recipes, or data prop (support both singular and plural)
  const recipeData = propData || fetchedData || {};
  const [isFavorite, setIsFavorite] = useState(recipeData.is_favorite || recipeData.isFavorite || false);

  const favoriteMutation = useMutation({
    mutationFn: async (data: { recipeId: string; action: 'favorite' | 'unfavorite' }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/\${entity}/\${data.recipeId}/\${data.action}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(\`Failed to \${data.action} recipe\`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      // Revert optimistic update on error
      setIsFavorite(!isFavorite);
      Alert.alert('Error', error?.message || 'Failed to update favorite');
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
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

  // Extract recipe fields
  const title = toDisplayString(recipeData.title || recipeData.name, 'Delicious Recipe');
  const description = toDisplayString(recipeData.description, '');
  const imageUrl = toDisplayString(
    recipeData.image_url || recipeData.image || recipeData.imageUrl,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
  );
  const prepTime = Number(recipeData.prep_time || recipeData.prepTime) || 0;
  const cookTime = Number(recipeData.cook_time || recipeData.cookTime) || 0;
  const servings = Number(recipeData.servings) || 4;
  const difficulty = toDisplayString(recipeData.difficulty, '');
  const category = toDisplayString(recipeData.category, '');
  const cuisine = toDisplayString(recipeData.cuisine, '');
  const calories = Number(recipeData.calories) || 0;
  const rating = Number(recipeData.rating) || 0;

  const totalTime = prepTime + cookTime;

  const handleFavoritePress = () => {
    // Optimistic update
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);

    const id = recipeId || recipeData.id || recipeData._id;
    if (id) {
      favoriteMutation.mutate({ recipeId: id, action: newFavorite ? 'favorite' : 'unfavorite' });
    }
    if (onFavoriteChange) {
      onFavoriteChange(newFavorite);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              {/* Favorite Button */}
              <Pressable
                onPress={handleFavoritePress}
                style={styles.favoriteButton}
              >
                <Text style={styles.favoriteIcon}>
                  {isFavorite ? '❤️' : '🤍'}
                </Text>
              </Pressable>

              {/* Category Badge */}
              {category ? (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ) : null}

              {/* Rating */}
              {rating > 0 ? (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              ) : null}

              {/* Title Overlay */}
              <View style={styles.titleOverlay}>
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                {cuisine ? (
                  <Text style={styles.cuisine}>{cuisine}</Text>
                ) : null}
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Description */}
          {description ? (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          ) : null}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={styles.statText}>{totalTime} min</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statText}>{servings}</Text>
            </View>

            {calories > 0 ? (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statText}>{calories} cal</Text>
              </View>
            ) : null}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {difficulty ? (
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyIcon}>👨‍🍳</Text>
                <Text style={styles.difficultyText}>{difficulty}</Text>
              </View>
            ) : <View />}

            <TouchableOpacity
              style={styles.viewButton}
              onPress={onPress}
            >
              <Text style={styles.viewButtonText}>View Recipe</Text>
              <Text style={styles.viewButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    height: 224,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 72,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  titleOverlay: {
    paddingBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cuisine: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  difficultyIcon: {
    fontSize: 14,
  },
  difficultyText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButtonArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
});`;

  return {
    code,
    imports: ['expo-linear-gradient', '@tanstack/react-query']
  };
}
