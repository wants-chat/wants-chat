/**
 * React Native Shopping List Component Generator
 *
 * Generates a smart shopping list showing:
 * - Progress bar showing completed items
 * - Items grouped by category (Produce, Dairy, Meat, etc.)
 * - Checkboxes to mark items as purchased
 * - Recipe tags showing which recipe needs each item
 * - Share functionality
 */

export function generateRNShoppingList(): { code: string; imports: string[] } {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ShoppingListProps {
  shoppingList?: any;
  shoppingLists?: any;
  data?: any;
  entity?: string;
  listId?: string;
  onItemToggle?: (itemId: string, checked: boolean) => void;
  onShare?: () => void;
  [key: string]: any;
}

export default function ShoppingList({ shoppingList, shoppingLists, data: propData, entity = 'shopping-lists', listId, onItemToggle, onShare, ...props }: ShoppingListProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      if (propData || shoppingList || shoppingLists) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData, shoppingList, shoppingLists]);

  const sourceData = propData || fetchedData || {};

  const toggleItemMutation = useMutation({
    mutationFn: async (data: { listId?: string; itemId: string; checked: boolean }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const endpoint = data.listId
        ? \`\${apiUrl}/\${entity}/\${data.listId}/items/\${data.itemId}\`
        : \`\${apiUrl}/\${entity}/items/\${data.itemId}\`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: data.checked }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
    onError: (error: any, variables) => {
      // Revert optimistic update on error
      setItems(items.map(item =>
        item.id === variables.itemId ? { ...item, checked: !variables.checked } : item
      ));
      Alert.alert('Error', error?.message || 'Failed to update item');
    },
  });

  if (loading && !propData && !shoppingList && !shoppingLists) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const listData = shoppingList || shoppingLists || sourceData || {};

  const toDisplayString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.filter(v => v).join(', ');
    if (typeof value === 'object') {
      return value.name || value.text || value.value || JSON.stringify(value);
    }
    return fallback;
  };

  // Mock data structure - in real app this comes from props
  const defaultItems = listData.items || [
    { id: '1', name: 'Tomatoes', quantity: '4', unit: 'pcs', category: 'Produce', recipes: ['Pasta Sauce', 'Salad'], checked: false },
    { id: '2', name: 'Milk', quantity: '1', unit: 'liter', category: 'Dairy', recipes: ['Pancakes'], checked: false },
    { id: '3', name: 'Chicken Breast', quantity: '500', unit: 'g', category: 'Meat', recipes: ['Grilled Chicken'], checked: true },
    { id: '4', name: 'Onions', quantity: '2', unit: 'pcs', category: 'Produce', recipes: ['Pasta Sauce'], checked: false },
    { id: '5', name: 'Garlic', quantity: '1', unit: 'bulb', category: 'Produce', recipes: ['Pasta Sauce', 'Grilled Chicken'], checked: false },
    { id: '6', name: 'Cheese', quantity: '200', unit: 'g', category: 'Dairy', recipes: ['Pasta'], checked: false },
  ];

  const [items, setItems] = useState(defaultItems);

  const handleToggleItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newChecked = !item.checked;

    // Optimistic update
    setItems(items.map(i =>
      i.id === itemId ? { ...i, checked: newChecked } : i
    ));

    // Send mutation
    const currentListId = listId || listData.id || listData._id;
    toggleItemMutation.mutate({ listId: currentListId, itemId, checked: newChecked });

    if (onItemToggle) {
      onItemToggle(itemId, newChecked);
    }
  };

  const handleShare = async () => {
    const itemsList = items
      .filter((item: any) => !item.checked)
      .map(item => \`□ \${item.name} - \${item.quantity} \${item.unit}\`)
      .join('\\n');

    try {
      await Share.share({
        message: \`Shopping List:\\n\\n\${itemsList}\`,
        title: 'My Shopping List'
      });
      if (onShare) {
        onShare();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Group items by category
  const groupedItems = items.reduce((groups: any, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Category icons
  const categoryIcons: any = {
    'Produce': '🥬',
    'Dairy': '🥛',
    'Meat': '🍖',
    'Bakery': '🍞',
    'Pantry': '🥫',
    'Frozen': '🧊',
    'Beverages': '🥤',
    'Snacks': '🍿',
    'Other': '🛒'
  };

  // Calculate progress
  const totalItems = items.length;
  const checkedItems = items.filter((item: any) => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <Text style={styles.headerSubtitle}>
            {checkedItems} of {totalItems} items completed
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Shopping List */}
      <ScrollView style={styles.scrollView}>
        {Object.keys(groupedItems).map((category) => (
          <View key={category} style={styles.categorySection}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{categoryIcons[category] || '🛒'}</Text>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {groupedItems[category].filter((i: any) => i.checked).length}/{groupedItems[category].length}
                </Text>
              </View>
            </View>

            {/* Category Items */}
            {groupedItems[category].map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, item.checked && styles.itemChecked]}
                onPress={() => handleToggleItem(item.id)}
                activeOpacity={0.7}
              >
                {/* Checkbox */}
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </View>

                {/* Item Info */}
                <View style={styles.itemContent}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </Text>

                  {/* Recipe Tags */}
                  {item.recipes && item.recipes.length > 0 && (
                    <View style={styles.recipeTags}>
                      {item.recipes.map((recipe: string, idx: number) => (
                        <View key={idx} style={styles.recipeTag}>
                          <Text style={styles.recipeTagText}>{recipe}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Empty State */}
        {totalItems === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
            <Text style={styles.emptyText}>Add items from your meal plan or recipes</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareIcon: {
    fontSize: 16,
  },
  shareText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    minWidth: 40,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  categoryBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemChecked: {
    backgroundColor: '#f9fafb',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemNameChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recipeTag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeTagText: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return {
    code,
    imports: ['@tanstack/react-query']
  };
}
