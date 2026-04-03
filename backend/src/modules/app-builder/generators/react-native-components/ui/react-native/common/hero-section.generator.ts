import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateHeroSection = (
  resolved: ResolvedComponent,
  variant: 'modern' | 'centered' | 'image-left' = 'modern'
) => {
  const dataSource = resolved.dataSource;

  // Extract entity name from dataSource for API endpoint
  const getEntityName = () => {
    if (!dataSource || dataSource.trim() === '') return 'hero';
    const parts = dataSource.split('.');
    return parts[0] || 'hero';
  };

  const entityName = getEntityName();

  const code = `
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { getVariantStyles, DesignVariant, ColorScheme } from '@/lib/design-variants';

interface HeroSectionProps {
  data?: any;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
  onCtaPress?: () => void;
  onCtaSecondaryPress?: () => void;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroSection({
  data: propData,
  title: propTitle = 'Welcome',
  subtitle: propSubtitle,
  description: propDescription,
  ctaText: propCtaText = 'Get Started',
  ctaSecondaryText: propCtaSecondaryText,
  backgroundImage: propBackgroundImage = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
  onCtaPress,
  onCtaSecondaryPress,
  variant = 'minimal',
  colorScheme = 'blue',
}: HeroSectionProps) {
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
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const title = propTitle || data?.title || 'Welcome';
  const subtitle = propSubtitle || data?.subtitle;
  const description = propDescription || data?.description;
  const ctaText = propCtaText || data?.ctaText || 'Get Started';
  const ctaSecondaryText = propCtaSecondaryText || data?.ctaSecondaryText;
  const backgroundImage = propBackgroundImage || data?.backgroundImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200';

  const { colors, modifiers } = getVariantStyles(variant, colorScheme);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginTop: 16,
      marginBottom: 24,
      marginHorizontal: 16,
      alignSelf: 'center',
      maxWidth: Dimensions.get('window').width - 32,
    },
    background: {
      borderRadius: modifiers.borderRadius,
      overflow: 'hidden',
      minHeight: 220,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.primary + 'B3', // 70% opacity
    },
    content: {
      padding: 20,
      paddingVertical: 24,
      zIndex: 1,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textOnPrimary,
      marginBottom: 12,
      lineHeight: 36,
    },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 20,
      lineHeight: 22,
    },
    ctaContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    ctaPrimary: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: modifiers.borderRadius,
      flex: 1,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: modifiers.shadowOffset },
      shadowOpacity: modifiers.shadowOpacity,
      shadowRadius: modifiers.shadowRadius,
      elevation: modifiers.shadowRadius,
    },
    ctaPrimaryText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    ctaSecondary: {
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: modifiers.borderRadius,
      borderWidth: 2,
      borderColor: colors.surface,
      flex: 1,
      alignItems: 'center',
    },
    ctaSecondaryText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textOnPrimary,
    },
    image: {
      width: '100%',
      height: 200,
      position: 'absolute',
      bottom: 0,
      opacity: 0.2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      minHeight: 220,
    },
  });

  if (loading && !propData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <View style={styles.ctaContainer}>
            {ctaText && (
              <TouchableOpacity
                style={styles.ctaPrimary}
                onPress={onCtaPress}
              >
                <Text style={styles.ctaPrimaryText}>{ctaText}</Text>
              </TouchableOpacity>
            )}
            {ctaSecondaryText && (
              <TouchableOpacity
                style={styles.ctaSecondary}
                onPress={onCtaSecondaryPress}
              >
                <Text style={styles.ctaSecondaryText}>{ctaSecondaryText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
`;

  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';",
      "import { getVariantStyles, DesignVariant, ColorScheme } from '@/lib/design-variants';",
    ],
  };
};

export const generateHeroCentered = (resolved: ResolvedComponent) => {
  return generateHeroSection(resolved, 'centered');
};
