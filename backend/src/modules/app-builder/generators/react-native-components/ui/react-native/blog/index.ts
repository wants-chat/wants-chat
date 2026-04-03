// Blog Component Generators for React Native

export { generateRNBlogCard } from './blog-card.generator';
export { generateRNBlogList } from './blog-list.generator';
export { generateRNBlogPostContent } from './blog-post-content.generator';
export { generateRNBlogPostHeader } from './blog-post-header.generator';
export { generateRNBlogSidebar } from './blog-sidebar.generator';
export { generateRNCommentSection } from './comment-section.generator';
import { generateRNCommentForm as _generateRNCommentForm } from './comment-form.generator';
import { generateRNRichTextEditor as _generateRNRichTextEditor } from './rich-text-editor.generator';
export { generateRNRelatedArticles } from './related-articles.generator';
export { generateRNCategoriesWidget } from './categories-widget.generator';
export { _generateRNCommentForm as generateRNCommentForm };
export { _generateRNRichTextEditor as generateRNRichTextEditor };

import { ResolvedComponent } from '../../../types/resolved-component.interface';

// Aliases for comment form and rich text editor
export const generateRNCommentReplyForm = _generateRNCommentForm;
export const generateRNForumPostEditor = _generateRNRichTextEditor;

// Featured Blog Post Generator
export function generateRNFeaturedBlogPost(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturedBlogPostProps {
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
  date?: string;
  category?: string;
  readTime?: string;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export default function FeaturedBlogPost({
  title = 'Discover the Future of Technology',
  excerpt = 'Explore the latest innovations and trends that are shaping our digital landscape.',
  imageUrl = 'https://via.placeholder.com/800x400',
  author = { name: 'John Doe', avatarUrl: 'https://via.placeholder.com/40' },
  date = 'Jan 15, 2024',
  category = 'Technology',
  readTime = '5 min read',
  onPress,
}: FeaturedBlogPostProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.excerpt}>{excerpt}</Text>
          <View style={styles.meta}>
            <View style={styles.authorSection}>
              {author.avatarUrl && (
                <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
              )}
              <Text style={styles.authorName}>{author.name}</Text>
            </View>
            <View style={styles.metaRight}>
              <Text style={styles.date}>{date}</Text>
              <View style={styles.divider} />
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.readTime}>{readTime}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 32,
  },
  excerpt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  authorName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  readTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Blog Grid Generator
export function generateRNBlogGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl: string;
  category?: string;
  date: string;
  readTime?: string;
}

interface BlogGridProps {
  posts?: BlogPost[];
  numColumns?: number;
  onPostPress?: (post: BlogPost) => void;
}

const { width } = Dimensions.get('window');

const defaultPosts: BlogPost[] = [
  { id: '1', title: 'Getting Started with React Native', excerpt: 'Learn the basics', imageUrl: 'https://via.placeholder.com/300x200', category: 'Tutorial', date: 'Jan 15', readTime: '5 min' },
  { id: '2', title: 'State Management Best Practices', excerpt: 'Manage your app state', imageUrl: 'https://via.placeholder.com/300x200', category: 'Guide', date: 'Jan 14', readTime: '8 min' },
  { id: '3', title: 'Building Beautiful UIs', excerpt: 'Design tips and tricks', imageUrl: 'https://via.placeholder.com/300x200', category: 'Design', date: 'Jan 13', readTime: '6 min' },
  { id: '4', title: 'Performance Optimization', excerpt: 'Speed up your app', imageUrl: 'https://via.placeholder.com/300x200', category: 'Performance', date: 'Jan 12', readTime: '10 min' },
];

export default function BlogGrid({
  posts = defaultPosts,
  numColumns = 2,
  onPostPress,
}: BlogGridProps) {
  const cardWidth = (width - 48 - (numColumns - 1) * 12) / numColumns;

  const renderPost = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      {item.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.excerpt && <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text>}
        <View style={styles.meta}>
          <Text style={styles.date}>{item.date}</Text>
          {item.readTime && (
            <>
              <View style={styles.dot} />
              <Text style={styles.readTime}>{item.readTime}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  excerpt: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#d1d5db',
    marginHorizontal: 6,
  },
  readTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Blog Grid Layout (alias)
export const generateRNBlogGridLayout = generateRNBlogGrid;

// Blog List Layout Generator
export function generateRNBlogListLayout(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl: string;
  author?: { name: string; avatarUrl?: string };
  category?: string;
  date: string;
  readTime?: string;
}

interface BlogListLayoutProps {
  posts?: BlogPost[];
  onPostPress?: (post: BlogPost) => void;
}

const defaultPosts: BlogPost[] = [
  { id: '1', title: 'Complete Guide to Mobile Development', excerpt: 'Everything you need to know about building mobile apps', imageUrl: 'https://via.placeholder.com/120x90', author: { name: 'Jane Smith' }, category: 'Development', date: 'Jan 15, 2024', readTime: '8 min' },
  { id: '2', title: 'Design Systems at Scale', excerpt: 'How to create and maintain design systems for large teams', imageUrl: 'https://via.placeholder.com/120x90', author: { name: 'Mike Johnson' }, category: 'Design', date: 'Jan 14, 2024', readTime: '6 min' },
  { id: '3', title: 'The Future of AI in Apps', excerpt: 'Exploring the impact of AI on mobile applications', imageUrl: 'https://via.placeholder.com/120x90', author: { name: 'Sarah Lee' }, category: 'AI', date: 'Jan 13, 2024', readTime: '10 min' },
];

export default function BlogListLayout({
  posts = defaultPosts,
  onPostPress,
}: BlogListLayoutProps) {
  const renderPost = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.excerpt && <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text>}
        <View style={styles.meta}>
          {item.author && <Text style={styles.author}>{item.author.name}</Text>}
          <View style={styles.dot} />
          <Text style={styles.date}>{item.date}</Text>
          {item.readTime && (
            <>
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={12} color="#9ca3af" />
              <Text style={styles.readTime}>{item.readTime}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 110,
    height: 110,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    color: '#1d4ed8',
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  excerpt: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  author: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  readTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#d1d5db',
  },
  separator: {
    height: 12,
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Blog Masonry Layout Generator
export function generateRNBlogMasonryLayout(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl: string;
  category?: string;
  date: string;
  featured?: boolean;
}

interface BlogMasonryLayoutProps {
  posts?: BlogPost[];
  onPostPress?: (post: BlogPost) => void;
}

const { width } = Dimensions.get('window');
const columnWidth = (width - 48) / 2;

const defaultPosts: BlogPost[] = [
  { id: '1', title: 'The Art of Minimalism in Design', imageUrl: 'https://via.placeholder.com/300x400', category: 'Design', date: 'Jan 15', featured: true },
  { id: '2', title: 'Quick Tips for Better Code', imageUrl: 'https://via.placeholder.com/300x200', category: 'Dev', date: 'Jan 14' },
  { id: '3', title: 'Building User-Centric Products', imageUrl: 'https://via.placeholder.com/300x350', category: 'UX', date: 'Jan 13' },
  { id: '4', title: 'Mobile First Approach', imageUrl: 'https://via.placeholder.com/300x250', category: 'Mobile', date: 'Jan 12' },
  { id: '5', title: 'Future of Web Development', imageUrl: 'https://via.placeholder.com/300x300', category: 'Web', date: 'Jan 11' },
];

export default function BlogMasonryLayout({
  posts = defaultPosts,
  onPostPress,
}: BlogMasonryLayoutProps) {
  // Split posts into two columns
  const leftColumn = posts.filter((_, i) => i % 2 === 0);
  const rightColumn = posts.filter((_, i) => i % 2 === 1);

  const getImageHeight = (post: BlogPost) => {
    return post.featured ? 200 : 140;
  };

  const renderPost = (post: BlogPost) => (
    <TouchableOpacity
      key={post.id}
      style={styles.card}
      onPress={() => onPostPress?.(post)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: post.imageUrl }}
        style={[styles.cardImage, { height: getImageHeight(post) }]}
        resizeMode="cover"
      />
      {post.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={3}>{post.title}</Text>
        <Text style={styles.date}>{post.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.masonry}>
        <View style={[styles.column, { width: columnWidth }]}>
          {leftColumn.map(renderPost)}
        </View>
        <View style={[styles.column, { width: columnWidth }]}>
          {rightColumn.map(renderPost)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  masonry: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  column: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Blog Search Bar Generator
export function generateRNBlogSearchBar(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
  suggestions?: string[];
  showFilters?: boolean;
  recentSearches?: string[];
}

export default function BlogSearchBar({
  placeholder = 'Search articles...',
  onSearch,
  onFilterPress,
  suggestions = [],
  showFilters = true,
  recentSearches = ['React Native', 'TypeScript', 'Design Patterns'],
}: BlogSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    onSearch?.(suggestion);
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
        {showFilters && (
          <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {isFocused && query.length === 0 && recentSearches.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(search)}
            >
              <Ionicons name="time-outline" size={16} color="#9ca3af" />
              <Text style={styles.suggestionText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isFocused && query.length > 0 && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons name="search" size={16} color="#9ca3af" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    backgroundColor: '#fff',
    borderColor: '#3b82f6',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  suggestionText: {
    fontSize: 15,
    color: '#374151',
  },
});
`,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Blog Table of Contents Generator
export function generateRNBlogTableOfContents(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface BlogTableOfContentsProps {
  title?: string;
  items?: TocItem[];
  activeId?: string;
  onItemPress?: (item: TocItem) => void;
  collapsible?: boolean;
}

const defaultItems: TocItem[] = [
  { id: '1', title: 'Introduction', level: 1 },
  { id: '2', title: 'Getting Started', level: 1 },
  { id: '2.1', title: 'Prerequisites', level: 2 },
  { id: '2.2', title: 'Installation', level: 2 },
  { id: '3', title: 'Core Concepts', level: 1 },
  { id: '3.1', title: 'Components', level: 2 },
  { id: '3.2', title: 'State Management', level: 2 },
  { id: '3.3', title: 'Navigation', level: 2 },
  { id: '4', title: 'Advanced Topics', level: 1 },
  { id: '5', title: 'Conclusion', level: 1 },
];

export default function BlogTableOfContents({
  title = 'Table of Contents',
  items = defaultItems,
  activeId,
  onItemPress,
  collapsible = true,
}: BlogTableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getItemStyle = (item: TocItem) => {
    const isActive = item.id === activeId;
    return {
      paddingLeft: (item.level - 1) * 16 + 12,
      backgroundColor: isActive ? '#dbeafe' : 'transparent',
      borderLeftColor: isActive ? '#3b82f6' : 'transparent',
    };
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => collapsible && setIsExpanded(!isExpanded)}
        activeOpacity={collapsible ? 0.7 : 1}
      >
        <Ionicons name="list" size={18} color="#3b82f6" />
        <Text style={styles.title}>{title}</Text>
        {collapsible && (
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#6b7280"
          />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, getItemStyle(item)]}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.itemText,
                  item.level === 1 && styles.itemTextLevel1,
                  item.id === activeId && styles.itemTextActive,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemsContainer: {
    paddingVertical: 8,
  },
  item: {
    paddingVertical: 10,
    paddingRight: 12,
    borderLeftWidth: 3,
  },
  itemText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  itemTextLevel1: {
    fontWeight: '500',
    color: '#374151',
  },
  itemTextActive: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
`,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// MISSING GENERATORS - Placeholders
// ============================================================================

// Comment Thread Generator
export function generateRNCommentThread(resolved: ResolvedComponent, variant: string = 'flat') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

interface Comment {
  id: string;
  author: { name: string; avatarUrl?: string };
  content: string;
  date: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments?: Comment[];
  variant?: 'flat' | 'threaded';
}

export default function CommentThread({ comments = [], variant = 'flat' }: CommentThreadProps) {
  const renderComment = (comment: Comment, depth = 0) => (
    <View key={comment.id} style={[styles.comment, { marginLeft: depth * 20 }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: comment.author.avatarUrl || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.meta}>
          <Text style={styles.authorName}>{comment.author.name}</Text>
          <Text style={styles.date}>{comment.date}</Text>
        </View>
      </View>
      <Text style={styles.content}>{comment.content}</Text>
      {variant === 'threaded' && comment.replies?.map(reply => renderComment(reply, depth + 1))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {comments.map(comment => renderComment(comment))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  comment: { marginBottom: 16, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  meta: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  date: { fontSize: 12, color: '#9ca3af' },
  content: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';",
    ],
  };
}

// Author Bio Generator
export function generateRNAuthorBio(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthorBioProps {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  socialLinks?: { platform: string; url: string }[];
  onFollow?: () => void;
}

export default function AuthorBio({
  name = 'John Doe',
  bio = 'A passionate writer exploring technology and creativity.',
  avatarUrl = 'https://via.placeholder.com/80',
  role = 'Senior Writer',
  socialLinks = [],
  onFollow,
}: AuthorBioProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.bio}>{bio}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.followBtn} onPress={onFollow}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  info: { alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  role: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  bio: { fontSize: 14, color: '#4b5563', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  actions: { flexDirection: 'row', marginTop: 12 },
  followBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  followText: { color: '#fff', fontWeight: '600' },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Article Pagination Generator
export function generateRNArticlePagination(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArticlePaginationProps {
  prevArticle?: { title: string; onPress: () => void };
  nextArticle?: { title: string; onPress: () => void };
}

export default function ArticlePagination({ prevArticle, nextArticle }: ArticlePaginationProps) {
  return (
    <View style={styles.container}>
      {prevArticle && (
        <TouchableOpacity style={styles.navBtn} onPress={prevArticle.onPress}>
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <View style={styles.navText}>
            <Text style={styles.label}>Previous</Text>
            <Text style={styles.title} numberOfLines={1}>{prevArticle.title}</Text>
          </View>
        </TouchableOpacity>
      )}
      {nextArticle && (
        <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={nextArticle.onPress}>
          <View style={[styles.navText, { alignItems: 'flex-end' }]}>
            <Text style={styles.label}>Next</Text>
            <Text style={styles.title} numberOfLines={1}>{nextArticle.title}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  navBtn: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  navBtnRight: { justifyContent: 'flex-end' },
  navText: { marginHorizontal: 8 },
  label: { fontSize: 12, color: '#6b7280' },
  title: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Tag Cloud Widget Generator
export function generateRNTagCloudWidget(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface TagCloudWidgetProps {
  tags?: { name: string; count?: number }[];
  onTagPress?: (tag: string) => void;
}

export default function TagCloudWidget({
  tags = [{ name: 'Technology', count: 12 }, { name: 'Design', count: 8 }, { name: 'Lifestyle', count: 5 }],
  onTagPress,
}: TagCloudWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Tags</Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag, idx) => (
          <TouchableOpacity key={idx} style={styles.tag} onPress={() => onTagPress?.(tag.name)}>
            <Text style={styles.tagText}>{tag.name}</Text>
            {tag.count && <Text style={styles.count}>({tag.count})</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 14, color: '#374151' },
  count: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';",
    ],
  };
}

// Popular Posts Widget Generator
export function generateRNPopularPostsWidget(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface Post {
  id: string;
  title: string;
  thumbnail?: string;
  views?: number;
}

interface PopularPostsWidgetProps {
  posts?: Post[];
  onPostPress?: (id: string) => void;
}

export default function PopularPostsWidget({
  posts = [],
  onPostPress,
}: PopularPostsWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Posts</Text>
      {posts.map((post, idx) => (
        <TouchableOpacity key={post.id} style={styles.postItem} onPress={() => onPostPress?.(post.id)}>
          <Text style={styles.rank}>{idx + 1}</Text>
          {post.thumbnail && <Image source={{ uri: post.thumbnail }} style={styles.thumbnail} />}
          <View style={styles.postInfo}>
            <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
            {post.views && <Text style={styles.views}>{post.views} views</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  postItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rank: { fontSize: 18, fontWeight: '700', color: '#d1d5db', width: 24 },
  thumbnail: { width: 48, height: 48, borderRadius: 6, marginRight: 10 },
  postInfo: { flex: 1 },
  postTitle: { fontSize: 14, fontWeight: '500', color: '#374151' },
  views: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';",
    ],
  };
}

// Reading Progress Bar Generator
export function generateRNReadingProgressBar(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ReadingProgressBarProps {
  progress?: number; // 0 to 1
  color?: string;
}

export default function ReadingProgressBar({
  progress = 0.5,
  color = '#3b82f6',
}: ReadingProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: \`\${progress * 100}%\`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 3, backgroundColor: '#e5e7eb', width: '100%' },
  progress: { height: '100%', borderRadius: 1.5 },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, StyleSheet, Animated } from 'react-native';",
    ],
  };
}

// Archive Widget Generator
export function generateRNArchiveWidget(resolved: ResolvedComponent, variant: string = 'standard') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArchiveItem {
  label: string;
  count: number;
  onPress?: () => void;
}

interface ArchiveWidgetProps {
  items?: ArchiveItem[];
}

export default function ArchiveWidget({
  items = [
    { label: 'January 2024', count: 5 },
    { label: 'December 2023', count: 8 },
    { label: 'November 2023', count: 3 },
  ],
}: ArchiveWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Archives</Text>
      {items.map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.item} onPress={item.onPress}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.count}>({item.count})</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  label: { flex: 1, fontSize: 14, color: '#374151', marginLeft: 8 },
  count: { fontSize: 12, color: '#9ca3af' },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}
