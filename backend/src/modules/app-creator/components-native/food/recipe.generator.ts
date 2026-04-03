/**
 * Recipe Component Generators for React Native
 *
 * Generates recipe-specific components:
 * - RecipeHeader: Recipe title, image, and meta info
 * - RecipeSteps: Step-by-step cooking instructions
 * - IngredientList: Recipe ingredients list with quantities
 * - NutritionInfo: Nutritional information display
 */

export interface RecipeOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate recipe header component
 */
export function generateRecipeHeader(options: RecipeOptions = {}): string {
  const { componentName = 'RecipeHeader' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Author {
  name?: string;
  avatar_url?: string;
}

interface Recipe {
  id?: string;
  title?: string;
  name?: string;
  image_url?: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  rating?: number;
  reviews_count?: number;
  author?: Author;
  cuisine?: string;
  course?: string;
  tags?: string[];
}

interface ${componentName}Props {
  recipe: Recipe;
  onSave?: () => void;
  isSaved?: boolean;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#DCFCE7', text: '#16A34A' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  hard: { bg: '#FEE2E2', text: '#DC2626' },
};

function ${componentName}({ recipe, onSave, isSaved = false }: ${componentName}Props) {
  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return \`\${minutes} min\`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? \`\${hours}h \${mins}m\` : \`\${hours}h\`;
  };

  const totalTime = recipe.total_time || (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Check out this recipe: \${recipe.title || recipe.name}\`,
        title: recipe.title || recipe.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const difficultyStyle = DIFFICULTY_COLORS[recipe.difficulty?.toLowerCase() || 'easy'];

  return (
    <View style={styles.container}>
      {recipe.image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
          <View style={styles.imageOverlay} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title || recipe.name}</Text>

        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        {/* Rating & Badges */}
        <View style={styles.badgesRow}>
          {recipe.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{recipe.rating}</Text>
              {recipe.reviews_count && (
                <Text style={styles.reviewsText}>({recipe.reviews_count})</Text>
              )}
            </View>
          )}
          {recipe.difficulty && (
            <View style={[styles.badge, { backgroundColor: difficultyStyle?.bg }]}>
              <Text style={[styles.badgeText, { color: difficultyStyle?.text }]}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Text>
            </View>
          )}
          {recipe.cuisine && (
            <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.badgeText, { color: '#2563EB' }]}>{recipe.cuisine}</Text>
            </View>
          )}
        </View>

        {/* Time & Servings Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.statLabel}>Prep</Text>
            <Text style={styles.statValue}>{formatTime(recipe.prep_time)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={20} color="#6B7280" />
            <Text style={styles.statLabel}>Cook</Text>
            <Text style={styles.statValue}>{formatTime(recipe.cook_time)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={20} color="#6B7280" />
            <Text style={styles.statLabel}>Servings</Text>
            <Text style={styles.statValue}>{recipe.servings || '-'}</Text>
          </View>
        </View>

        {/* Author & Actions */}
        <View style={styles.footer}>
          {recipe.author && (
            <View style={styles.authorInfo}>
              {recipe.author.avatar_url ? (
                <Image source={{ uri: recipe.author.avatar_url }} style={styles.authorAvatar} />
              ) : (
                <View style={styles.authorAvatarPlaceholder}>
                  <Ionicons name="person" size={16} color="#9CA3AF" />
                </View>
              )}
              <View>
                <Text style={styles.authorLabel}>Recipe by</Text>
                <Text style={styles.authorName}>{recipe.author.name}</Text>
              </View>
            </View>
          )}
          <View style={styles.actions}>
            {onSave && (
              <TouchableOpacity
                style={[styles.actionButton, isSaved && styles.actionButtonActive]}
                onPress={onSave}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={isSaved ? '#F97316' : '#6B7280'}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#FFF7ED',
  },
  tagsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate recipe steps component
 */
export function generateRecipeSteps(options: RecipeOptions = {}): string {
  const { componentName = 'RecipeSteps' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecipeStep {
  id?: string;
  step_number?: number;
  title?: string;
  instruction: string;
  image_url?: string;
  duration_minutes?: number;
  tip?: string;
}

interface ${componentName}Props {
  steps: RecipeStep[];
}

function ${componentName}({ steps }: ${componentName}Props) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Instructions</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedSteps.size}/{steps.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const stepNumber = step.step_number || index + 1;

          return (
            <View key={step.id || index} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <TouchableOpacity
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                  ]}
                  onPress={() => toggleStep(index)}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.stepNumber}>{stepNumber}</Text>
                  )}
                </TouchableOpacity>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                  ]} />
                )}
              </View>

              <View style={[styles.stepContent, isCompleted && styles.stepContentCompleted]}>
                {step.title && (
                  <Text style={[styles.stepTitle, isCompleted && styles.textCompleted]}>
                    {step.title}
                  </Text>
                )}
                <Text style={[styles.stepInstruction, isCompleted && styles.textCompleted]}>
                  {step.instruction}
                </Text>

                {step.image_url && (
                  <Image source={{ uri: step.image_url }} style={styles.stepImage} />
                )}

                {step.duration_minutes && (
                  <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.durationText}>{step.duration_minutes} min</Text>
                  </View>
                )}

                {step.tip && (
                  <View style={styles.tipContainer}>
                    <Ionicons name="bulb" size={16} color="#D97706" />
                    <Text style={styles.tipText}>
                      <Text style={styles.tipLabel}>Tip: </Text>
                      {step.tip}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {completedSteps.size === steps.length && (
        <View style={styles.completeCard}>
          <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
          <Text style={styles.completeTitle}>Recipe Complete!</Text>
          <Text style={styles.completeSubtitle}>Enjoy your meal!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  stepsContainer: {
    maxHeight: 500,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 40,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#86EFAC',
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  stepContentCompleted: {
    opacity: 0.6,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepInstruction: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
  },
  stepImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  tipLabel: {
    fontWeight: '600',
  },
  completeCard: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 8,
  },
  completeSubtitle: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

/**
 * Generate ingredient list component
 */
export function generateIngredientList(options: RecipeOptions = {}): string {
  const { componentName = 'IngredientList' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ingredient {
  id?: string;
  name: string;
  amount?: number;
  unit?: string;
  notes?: string;
  optional?: boolean;
  category?: string;
}

interface ${componentName}Props {
  ingredients: Ingredient[];
  defaultServings?: number;
  onAddToShoppingList?: (ingredients: Ingredient[]) => void;
}

function ${componentName}({
  ingredients,
  defaultServings = 4,
  onAddToShoppingList,
}: ${componentName}Props) {
  const [servings, setServings] = useState(defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const multiplier = servings / defaultServings;

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    const adjusted = amount * multiplier;
    if (adjusted < 1) {
      if (adjusted === 0.25) return '1/4';
      if (adjusted >= 0.33 && adjusted <= 0.34) return '1/3';
      if (adjusted === 0.5) return '1/2';
      if (adjusted >= 0.66 && adjusted <= 0.67) return '2/3';
      if (adjusted === 0.75) return '3/4';
    }
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  // Group by category if available
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const category = ing.category || 'Ingredients';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const handleAddToShoppingList = () => {
    const adjustedIngredients = ingredients.map(ing => ({
      ...ing,
      amount: ing.amount ? ing.amount * multiplier : undefined,
    }));
    onAddToShoppingList?.(adjustedIngredients);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingredients</Text>
        <View style={styles.servingsControl}>
          <Ionicons name="people" size={18} color="#6B7280" />
          <TouchableOpacity
            style={styles.servingsButton}
            onPress={() => setServings(Math.max(1, servings - 1))}
            disabled={servings <= 1}
          >
            <Ionicons name="remove" size={16} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.servingsText}>{servings}</Text>
          <TouchableOpacity
            style={styles.servingsButton}
            onPress={() => setServings(servings + 1)}
          >
            <Ionicons name="add" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.ingredientsList} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedIngredients).map(([category, items]) => (
          <View key={category}>
            {Object.keys(groupedIngredients).length > 1 && (
              <Text style={styles.categoryTitle}>{category}</Text>
            )}
            {items.map((ingredient, idx) => {
              const id = ingredient.id || \`\${category}-\${idx}\`;
              const isChecked = checkedIngredients.has(id);

              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.ingredientRow, isChecked && styles.ingredientRowChecked]}
                  onPress={() => toggleIngredient(id)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <View style={styles.ingredientInfo}>
                    <Text style={[styles.ingredientText, isChecked && styles.ingredientTextChecked]}>
                      {formatAmount(ingredient.amount)} {ingredient.unit}{' '}
                      <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    </Text>
                    {ingredient.notes && (
                      <Text style={styles.ingredientNotes}>({ingredient.notes})</Text>
                    )}
                  </View>
                  {ingredient.optional && (
                    <Text style={styles.optionalBadge}>optional</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {onAddToShoppingList && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddToShoppingList}>
          <Ionicons name="cart" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add All to Shopping List</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servingsButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  ingredientsList: {
    maxHeight: 350,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 10,
  },
  ingredientRowChecked: {
    backgroundColor: '#F0FDF4',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 15,
    color: '#111827',
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  ingredientName: {
    fontWeight: '500',
  },
  ingredientNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  optionalBadge: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate nutrition info component
 */
export function generateNutritionInfo(options: RecipeOptions = {}): string {
  const { componentName = 'NutritionInfo' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface NutritionData {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface ${componentName}Props {
  nutrition: NutritionData;
  servingSize?: string;
  servingsPerRecipe?: number;
}

const DAILY_VALUES = {
  calories: 2000,
  protein: 50,
  carbohydrates: 300,
  fat: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300,
};

function ${componentName}({
  nutrition,
  servingSize = '1 serving',
  servingsPerRecipe,
}: ${componentName}Props) {
  const getPercentDV = (value: number | undefined, daily: number) => {
    if (!value) return 0;
    return Math.round((value / daily) * 100);
  };

  const nutrients = [
    { key: 'fat', label: 'Total Fat', unit: 'g' },
    { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'sugar', label: 'Sugar', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Facts</Text>
      {servingsPerRecipe && (
        <Text style={styles.subtitle}>{servingsPerRecipe} servings per recipe</Text>
      )}
      <Text style={styles.servingSize}>Serving size: {servingSize}</Text>

      <View style={styles.caloriesRow}>
        <Text style={styles.caloriesLabel}>Calories</Text>
        <Text style={styles.caloriesValue}>{nutrition.calories || 0}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.nutrientsList}>
        {nutrients.map((nutrient) => {
          const value = nutrition[nutrient.key as keyof NutritionData] as number | undefined;
          const dv = DAILY_VALUES[nutrient.key as keyof typeof DAILY_VALUES];
          const percent = dv ? getPercentDV(value, dv) : 0;

          return (
            <View key={nutrient.key} style={styles.nutrientRow}>
              <View style={styles.nutrientInfo}>
                <Text style={styles.nutrientLabel}>{nutrient.label}</Text>
                <Text style={styles.nutrientValue}>
                  {value !== undefined ? \`\${value}\${nutrient.unit}\` : '-'}
                </Text>
              </View>
              <View style={styles.dvContainer}>
                <View style={styles.dvBar}>
                  <View style={[styles.dvFill, { width: \`\${Math.min(percent, 100)}%\` }]} />
                </View>
                <Text style={styles.dvText}>{percent}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.disclaimer}>
        * Percent Daily Values are based on a 2,000 calorie diet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  servingSize: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  caloriesLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 4,
    backgroundColor: '#111827',
    marginBottom: 12,
  },
  nutrientsList: {
    gap: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nutrientInfo: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  nutrientValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  dvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  dvBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dvFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
  },
  dvText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    width: 32,
    textAlign: 'right',
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 16,
    lineHeight: 16,
  },
});

export default ${componentName};
`;
}
