// Common Component Generators for React Native
export { generateRNButton } from './button.generator';
export { generateRNCard } from './card.generator';
export { generateHeroSection as generateRNHeroSection, generateHeroCentered as generateRNHeroCentered } from './hero-section.generator';
export { generateRNDetailPageHeader } from './detail-page-header.generator';

import { ResolvedComponent } from '../../../types/resolved-component.interface';

// Hero Split Generator
export function generateRNHeroSplit(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeroSplitProps {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  reversed?: boolean;
}

const { width } = Dimensions.get('window');

export default function HeroSplit({
  title = 'Transform Your Business',
  subtitle = 'Innovative Solutions',
  description = 'Discover powerful tools that help you grow and succeed in the digital age.',
  imageUrl = 'https://via.placeholder.com/400x300',
  primaryButtonText = 'Get Started',
  secondaryButtonText = 'Learn More',
  onPrimaryPress,
  onSecondaryPress,
  reversed = false,
}: HeroSplitProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.splitContainer, reversed && styles.reversed]}>
        <View style={styles.textSection}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
              <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>
            {secondaryButtonText && (
              <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryPress}>
                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.imageSection}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
  },
  splitContainer: {
    flex: 1,
    padding: 20,
  },
  reversed: {},
  textSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    flex: 1,
    minHeight: 250,
  },
  heroImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
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

// Hero Video Background Generator (adapted for mobile - shows poster image)
export function generateRNHeroVideoBg(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeroVideoBgProps {
  title?: string;
  subtitle?: string;
  description?: string;
  posterUrl?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  onPlayVideo?: () => void;
  overlayOpacity?: number;
}

const { width, height } = Dimensions.get('window');

export default function HeroVideoBg({
  title = 'Experience Excellence',
  subtitle = 'Video Showcase',
  description = 'Immerse yourself in our story through this cinematic experience.',
  posterUrl = 'https://via.placeholder.com/800x600',
  buttonText = 'Watch Video',
  onButtonPress,
  onPlayVideo,
  overlayOpacity = 0.5,
}: HeroVideoBgProps) {
  return (
    <ImageBackground source={{ uri: posterUrl }} style={styles.container} resizeMode="cover">
      <View style={[styles.overlay, { backgroundColor: \`rgba(0, 0, 0, \${overlayOpacity})\` }]}>
        <View style={styles.content}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.playButton} onPress={onPlayVideo}>
              <Ionicons name="play-circle" size={64} color="#fff" />
            </TouchableOpacity>
            {buttonText && (
              <TouchableOpacity style={styles.ctaButton} onPress={onButtonPress}>
                <Text style={styles.ctaButtonText}>{buttonText}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height * 0.7,
    minHeight: 400,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 600,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// CTA Block Generator
export function generateRNCtaBlock(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CtaBlockProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
  backgroundColor?: string;
  icon?: string;
}

export default function CtaBlock({
  title = 'Ready to Get Started?',
  description = 'Join thousands of satisfied customers who have transformed their workflow.',
  buttonText = 'Start Free Trial',
  onPress,
  backgroundColor = '#3b82f6',
  icon = 'rocket',
}: CtaBlockProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={40} color="rgba(255, 255, 255, 0.9)" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
        <Ionicons name="arrow-forward" size={18} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    margin: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  buttonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// CTA Section Centered Generator
export function generateRNCtaSectionCentered(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CtaSectionCenteredProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  badge?: string;
}

export default function CtaSectionCentered({
  title = 'Start Your Journey Today',
  description = 'Experience the difference with our premium features. No credit card required.',
  primaryButtonText = 'Get Started Free',
  secondaryButtonText = 'Contact Sales',
  onPrimaryPress,
  onSecondaryPress,
  badge = 'Limited Time Offer',
}: CtaSectionCenteredProps) {
  return (
    <View style={styles.container}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
          <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
        </TouchableOpacity>
        {secondaryButtonText && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryPress}>
            <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.trustIndicators}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text style={styles.trustText}>Secure</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="flash" size={16} color="#f59e0b" />
          <Text style={styles.trustText}>Fast Setup</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="heart" size={16} color="#ef4444" />
          <Text style={styles.trustText}>24/7 Support</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 400,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  trustIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// CTA Section With Image Generator
export function generateRNCtaSectionWithImage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CtaSectionWithImageProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  onPress?: () => void;
  features?: string[];
  reversed?: boolean;
}

export default function CtaSectionWithImage({
  title = 'Powerful Features Await',
  description = 'Unlock your potential with our comprehensive suite of tools designed for modern teams.',
  imageUrl = 'https://via.placeholder.com/400x300',
  buttonText = 'Explore Features',
  onPress,
  features = ['Easy Integration', 'Real-time Analytics', 'Team Collaboration'],
  reversed = false,
}: CtaSectionWithImageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        {features.length > 0 && (
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresList: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Feature Showcase Grid Generator
export function generateRNFeatureShowcaseGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

interface FeatureShowcaseGridProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: number;
}

const defaultFeatures: Feature[] = [
  { id: '1', title: 'Fast Performance', description: 'Optimized for speed and efficiency', icon: 'flash', color: '#f59e0b' },
  { id: '2', title: 'Secure', description: 'Enterprise-grade security measures', icon: 'shield-checkmark', color: '#10b981' },
  { id: '3', title: 'Analytics', description: 'Comprehensive data insights', icon: 'bar-chart', color: '#3b82f6' },
  { id: '4', title: 'Integration', description: 'Connect with your favorite tools', icon: 'git-network', color: '#8b5cf6' },
  { id: '5', title: 'Support', description: '24/7 dedicated support team', icon: 'headset', color: '#ec4899' },
  { id: '6', title: 'Scalable', description: 'Grow without limitations', icon: 'trending-up', color: '#06b6d4' },
];

export default function FeatureShowcaseGrid({
  title = 'Why Choose Us',
  subtitle = 'Discover the features that set us apart',
  features = defaultFeatures,
}: FeatureShowcaseGridProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.grid}>
        {features.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: \`\${feature.color || '#3b82f6'}20\` }]}>
              <Ionicons name={feature.icon as any} size={28} color={feature.color || '#3b82f6'} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, ScrollView } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Feature Showcase Alternating Generator
export function generateRNFeatureShowcaseAlternating(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  highlights?: string[];
}

interface FeatureShowcaseAlternatingProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    id: '1',
    title: 'Intuitive Dashboard',
    description: 'Get a bird\'s eye view of your entire operation with our powerful dashboard.',
    imageUrl: 'https://via.placeholder.com/400x250',
    highlights: ['Real-time updates', 'Customizable widgets', 'Data visualization'],
  },
  {
    id: '2',
    title: 'Team Collaboration',
    description: 'Work together seamlessly with built-in collaboration tools.',
    imageUrl: 'https://via.placeholder.com/400x250',
    highlights: ['Shared workspaces', 'Comment threads', 'Version control'],
  },
];

export default function FeatureShowcaseAlternating({
  title = 'Powerful Features',
  subtitle = 'Everything you need to succeed',
  features = defaultFeatures,
}: FeatureShowcaseAlternatingProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {features.map((feature, index) => (
        <View key={feature.id} style={styles.featureSection}>
          <Image source={{ uri: feature.imageUrl }} style={styles.featureImage} resizeMode="cover" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
            {feature.highlights && (
              <View style={styles.highlights}>
                {feature.highlights.map((highlight, hIndex) => (
                  <View key={hIndex} style={styles.highlightItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  featureSection: {
    marginBottom: 48,
  },
  featureImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  featureContent: {},
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  highlights: {
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    fontSize: 15,
    color: '#374151',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Testimonial Slider Generator
export function generateRNTestimonialSlider(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating?: number;
}

interface TestimonialSliderProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  autoPlay?: boolean;
}

const { width } = Dimensions.get('window');

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'This product transformed our workflow completely. Highly recommended!',
    author: 'Sarah Johnson',
    role: 'CEO',
    company: 'TechCorp',
    avatarUrl: 'https://via.placeholder.com/80',
    rating: 5,
  },
  {
    id: '2',
    quote: 'The best investment we\'ve made for our team\'s productivity.',
    author: 'Michael Chen',
    role: 'CTO',
    company: 'InnovateLabs',
    avatarUrl: 'https://via.placeholder.com/80',
    rating: 5,
  },
  {
    id: '3',
    quote: 'Outstanding support and excellent features. Couldn\'t ask for more.',
    author: 'Emily Davis',
    role: 'Director',
    company: 'Growth Inc',
    avatarUrl: 'https://via.placeholder.com/80',
    rating: 5,
  },
];

export default function TestimonialSlider({
  title = 'What Our Customers Say',
  subtitle = 'Trusted by thousands',
  testimonials = defaultTestimonials,
}: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const cardWidth = width - 40;

  const renderStars = (rating: number = 5) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={18} color="#f59e0b" />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Testimonial }) => (
    <View style={[styles.card, { width: cardWidth }]}>
      {renderStars(item.rating)}
      <Text style={styles.quote}>"{item.quote}"</Text>
      <View style={styles.authorSection}>
        {item.avatarUrl && (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        )}
        <View>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.authorRole}>{item.role}, {item.company}</Text>
        </View>
      </View>
    </View>
  );

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={testimonials}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        contentContainerStyle={styles.listContent}
        snapToInterval={cardWidth}
        decelerationRate="fast"
      />
      <View style={styles.pagination}>
        {testimonials.map((_, index) => (
          <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quote: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  authorRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
});
`,
    imports: [
      "import React, { useState, useRef } from 'react';",
      "import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Testimonial Grid Generator
export function generateRNTestimonialGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating?: number;
}

interface TestimonialGridProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  { id: '1', quote: 'Amazing product that changed how we work!', author: 'John Smith', role: 'CEO', company: 'ABC Corp', avatarUrl: 'https://via.placeholder.com/60', rating: 5 },
  { id: '2', quote: 'Best decision we ever made for our business.', author: 'Lisa Wang', role: 'COO', company: 'XYZ Inc', avatarUrl: 'https://via.placeholder.com/60', rating: 5 },
  { id: '3', quote: 'Incredible support team and features.', author: 'Mark Brown', role: 'CTO', company: 'Tech Ltd', avatarUrl: 'https://via.placeholder.com/60', rating: 5 },
  { id: '4', quote: 'Highly recommend to all businesses.', author: 'Sarah Lee', role: 'VP', company: 'Growth Co', avatarUrl: 'https://via.placeholder.com/60', rating: 5 },
];

export default function TestimonialGrid({
  title = 'Customer Stories',
  subtitle = 'See what our clients say',
  testimonials = defaultTestimonials,
}: TestimonialGridProps) {
  const renderStars = (rating: number = 5) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, i) => (
        <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.grid}>
        {testimonials.map((testimonial) => (
          <View key={testimonial.id} style={styles.card}>
            {renderStars(testimonial.rating)}
            <Text style={styles.quote}>"{testimonial.quote}"</Text>
            <View style={styles.authorSection}>
              {testimonial.avatarUrl && (
                <Image source={{ uri: testimonial.avatarUrl }} style={styles.avatar} />
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{testimonial.author}</Text>
                <Text style={styles.authorRole}>{testimonial.role}, {testimonial.company}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 2,
  },
  quote: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorInfo: {},
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  authorRole: {
    fontSize: 12,
    color: '#6b7280',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Partner/Client Logos Generator
export function generateRNPartnerClientLogos(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, FlatList } from 'react-native';

interface Logo {
  id: string;
  name: string;
  imageUrl: string;
}

interface PartnerClientLogosProps {
  title?: string;
  subtitle?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = [
  { id: '1', name: 'Company A', imageUrl: 'https://via.placeholder.com/120x60' },
  { id: '2', name: 'Company B', imageUrl: 'https://via.placeholder.com/120x60' },
  { id: '3', name: 'Company C', imageUrl: 'https://via.placeholder.com/120x60' },
  { id: '4', name: 'Company D', imageUrl: 'https://via.placeholder.com/120x60' },
  { id: '5', name: 'Company E', imageUrl: 'https://via.placeholder.com/120x60' },
  { id: '6', name: 'Company F', imageUrl: 'https://via.placeholder.com/120x60' },
];

export default function PartnerClientLogos({
  title = 'Trusted By',
  subtitle,
  logos = defaultLogos,
}: PartnerClientLogosProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <FlatList
        data={logos}
        renderItem={({ item }) => (
          <View style={styles.logoContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.logo} resizeMode="contain" />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 80,
  },
  logo: {
    width: 100,
    height: 50,
    opacity: 0.7,
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, ScrollView, FlatList } from 'react-native';",
    ],
  };
}

// Press Mentions Generator
export function generateRNPressMentions(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PressMention {
  id: string;
  publication: string;
  logoUrl: string;
  quote: string;
  articleUrl?: string;
  date?: string;
}

interface PressMentionsProps {
  title?: string;
  subtitle?: string;
  mentions?: PressMention[];
}

const defaultMentions: PressMention[] = [
  { id: '1', publication: 'TechCrunch', logoUrl: 'https://via.placeholder.com/100x40', quote: 'A game-changer in the industry...', date: 'Jan 2024' },
  { id: '2', publication: 'Forbes', logoUrl: 'https://via.placeholder.com/100x40', quote: 'The future of productivity...', date: 'Dec 2023' },
  { id: '3', publication: 'Wired', logoUrl: 'https://via.placeholder.com/100x40', quote: 'Innovation at its finest...', date: 'Nov 2023' },
];

export default function PressMentions({
  title = 'In The Press',
  subtitle = 'See what people are saying about us',
  mentions = defaultMentions,
}: PressMentionsProps) {
  const handlePress = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.mentionsList}>
        {mentions.map((mention) => (
          <TouchableOpacity
            key={mention.id}
            style={styles.mentionCard}
            onPress={() => handlePress(mention.articleUrl)}
            activeOpacity={mention.articleUrl ? 0.7 : 1}
          >
            <Image source={{ uri: mention.logoUrl }} style={styles.publicationLogo} resizeMode="contain" />
            <Text style={styles.quote}>"{mention.quote}"</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.publication}>{mention.publication}</Text>
              {mention.date && <Text style={styles.date}>{mention.date}</Text>}
            </View>
            {mention.articleUrl && (
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>Read Article</Text>
                <Ionicons name="arrow-forward" size={14} color="#3b82f6" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  mentionsList: {
    gap: 16,
  },
  mentionCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
  },
  publicationLogo: {
    width: 100,
    height: 30,
    marginBottom: 16,
    opacity: 0.8,
  },
  quote: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publication: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  readMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Awards Showcase Generator
export function generateRNAwardsShowcase(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  imageUrl?: string;
  category?: string;
}

interface AwardsShowcaseProps {
  title?: string;
  subtitle?: string;
  awards?: Award[];
}

const defaultAwards: Award[] = [
  { id: '1', title: 'Best Innovation', organization: 'Tech Awards', year: '2024', category: 'Technology' },
  { id: '2', title: 'Customer Choice', organization: 'User Awards', year: '2024', category: 'Service' },
  { id: '3', title: 'Top Startup', organization: 'Startup Weekly', year: '2023', category: 'Business' },
  { id: '4', title: 'Design Excellence', organization: 'Design Awards', year: '2023', category: 'Design' },
];

export default function AwardsShowcase({
  title = 'Awards & Recognition',
  subtitle = 'Excellence acknowledged',
  awards = defaultAwards,
}: AwardsShowcaseProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.awardsGrid}>
        {awards.map((award) => (
          <View key={award.id} style={styles.awardCard}>
            <View style={styles.trophyContainer}>
              <Ionicons name="trophy" size={32} color="#f59e0b" />
            </View>
            <Text style={styles.awardTitle}>{award.title}</Text>
            <Text style={styles.organization}>{award.organization}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{award.year}</Text>
              </View>
              {award.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{award.category}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  awardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  awardCard: {
    width: '47%',
    backgroundColor: '#fffbeb',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  trophyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  awardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  organization: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  yearBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Case Study Cards Generator
export function generateRNCaseStudyCards(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  imageUrl: string;
  summary: string;
  results?: { label: string; value: string }[];
}

interface CaseStudyCardsProps {
  title?: string;
  subtitle?: string;
  caseStudies?: CaseStudy[];
  onPress?: (caseStudy: CaseStudy) => void;
}

const defaultCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Digital Transformation Success',
    client: 'Global Corp',
    industry: 'Finance',
    imageUrl: 'https://via.placeholder.com/400x200',
    summary: 'How we helped Global Corp achieve 300% growth in digital engagement.',
    results: [{ label: 'Growth', value: '300%' }, { label: 'ROI', value: '5x' }],
  },
  {
    id: '2',
    title: 'E-commerce Revolution',
    client: 'RetailMax',
    industry: 'Retail',
    imageUrl: 'https://via.placeholder.com/400x200',
    summary: 'Transforming the shopping experience with AI-powered recommendations.',
    results: [{ label: 'Conversion', value: '+45%' }, { label: 'Revenue', value: '+2M' }],
  },
];

export default function CaseStudyCards({
  title = 'Case Studies',
  subtitle = 'Real results for real businesses',
  caseStudies = defaultCaseStudies,
  onPress,
}: CaseStudyCardsProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.cardsList}>
        {caseStudies.map((study) => (
          <TouchableOpacity
            key={study.id}
            style={styles.card}
            onPress={() => onPress?.(study)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: study.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardContent}>
              <View style={styles.tagRow}>
                <View style={styles.industryTag}>
                  <Text style={styles.industryText}>{study.industry}</Text>
                </View>
                <Text style={styles.clientName}>{study.client}</Text>
              </View>
              <Text style={styles.cardTitle}>{study.title}</Text>
              <Text style={styles.summary}>{study.summary}</Text>
              {study.results && (
                <View style={styles.resultsRow}>
                  {study.results.map((result, index) => (
                    <View key={index} style={styles.resultItem}>
                      <Text style={styles.resultValue}>{result.value}</Text>
                      <Text style={styles.resultLabel}>{result.label}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>Read Case Study</Text>
                <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  cardsList: {
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  industryTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  industryText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  summary: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  resultsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resultItem: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  resultLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
`,
    imports: [
      "import React from 'react';",
      "import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Promotional Banner Top Generator
export function generateRNPromotionalBannerTop(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PromotionalBannerTopProps {
  message?: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: string;
}

export default function PromotionalBannerTop({
  message = 'Special offer! Get 50% off your first month.',
  linkText = 'Claim Now',
  linkUrl,
  backgroundColor = '#3b82f6',
  dismissible = true,
  onDismiss,
  icon = 'gift',
}: PromotionalBannerTopProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const handleLinkPress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Ionicons name={icon as any} size={18} color="#fff" style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        {linkText && (
          <TouchableOpacity onPress={handleLinkPress} style={styles.linkButton}>
            <Text style={styles.linkText}>{linkText}</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {dismissible && (
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={18} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  linkText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
`,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// Announcement Bar Generator
export function generateRNAnnouncementBar(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

interface AnnouncementBarProps {
  announcements?: Announcement[];
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
}

const defaultAnnouncements: Announcement[] = [
  { id: '1', message: 'New features available! Check out our latest updates.', type: 'info', icon: 'information-circle' },
];

const typeStyles = {
  info: { bg: '#dbeafe', text: '#1d4ed8', icon: '#3b82f6' },
  success: { bg: '#d1fae5', text: '#065f46', icon: '#10b981' },
  warning: { bg: '#fef3c7', text: '#92400e', icon: '#f59e0b' },
  error: { bg: '#fee2e2', text: '#991b1b', icon: '#ef4444' },
};

export default function AnnouncementBar({
  announcements = defaultAnnouncements,
  dismissible = true,
  onDismiss,
}: AnnouncementBarProps) {
  const [visibleAnnouncements, setVisibleAnnouncements] = useState(announcements);

  const handleDismiss = (id: string) => {
    setVisibleAnnouncements((prev) => prev.filter((a) => a.id !== id));
    onDismiss?.(id);
  };

  if (visibleAnnouncements.length === 0) return null;

  return (
    <View style={styles.container}>
      {visibleAnnouncements.map((announcement) => {
        const style = typeStyles[announcement.type];
        return (
          <View key={announcement.id} style={[styles.announcement, { backgroundColor: style.bg }]}>
            <Ionicons
              name={(announcement.icon || 'information-circle') as any}
              size={20}
              color={style.icon}
              style={styles.icon}
            />
            <Text style={[styles.message, { color: style.text }]}>{announcement.message}</Text>
            {dismissible && (
              <TouchableOpacity onPress={() => handleDismiss(announcement.id)} style={styles.dismissButton}>
                <Ionicons name="close" size={18} color={style.text} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
`,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}
