/**
 * React Native Product 3D Viewer Generator
 * Generates a 3D product viewer component
 * Note: This is a placeholder/mockup. For real 3D functionality, consider using:
 * - expo-three (Three.js for Expo)
 * - react-native-3d-model-view
 * - WebGL-based solutions
 */

export function generateRNProduct3DViewer(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface Product3DViewerProps {
  viewerData?: any;
  productName?: string;
  modelUrl?: string;
  previewImage?: string;
  instructionText?: string;
  viewIn3DText?: string;
  viewInARText?: string;
  features?: string[];
  onViewIn3D?: () => void;
  onViewInAR?: () => void;
  [key: string]: any;
}

export default function Product3DViewer({
  viewerData: propData,
  productName: propProductName = 'Product',
  modelUrl: propModelUrl = '',
  previewImage: propPreviewImage = 'https://via.placeholder.com/400',
  instructionText = '3D Model Viewer',
  viewIn3DText = 'View in 3D',
  viewInARText = 'View in AR',
  features: propFeatures = ['Rotate 360°', 'Zoom In/Out', 'View in AR'],
  onViewIn3D,
  onViewInAR
}: Product3DViewerProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/products\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch product data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const productName = data.productName || data.name || propProductName;
  const modelUrl = data.modelUrl || propModelUrl;
  const previewImage = data.previewImage || data.image || propPreviewImage;
  const features = data.features || propFeatures;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleView3D = () => {
    setIsLoading(true);
    onViewIn3D?.();
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleViewAR = () => {
    onViewInAR?.();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.productName}>{productName}</Text>
        <View style={styles.badge}>
          <Ionicons name="cube-outline" size={16} color="#3b82f6" />
          <Text style={styles.badgeText}>3D Model</Text>
        </View>
      </View>

      {/* 3D Viewer Placeholder */}
      <View style={styles.viewerContainer}>
        <Image
          source={{ uri: previewImage }}
          style={styles.previewImage}
          resizeMode="contain"
        />

        {/* 3D Indicator Overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Ionicons name="cube" size={64} color="#fff" />
            <Text style={styles.overlayTitle}>{instructionText}</Text>
            <Text style={styles.overlaySubtitle}>Tap to interact</Text>
          </View>
        </View>

        {/* Controls Hint */}
        <View style={styles.controlsHint}>
          <View style={styles.controlItem}>
            <Ionicons name="hand-left-outline" size={20} color="#fff" />
            <Text style={styles.controlText}>Rotate</Text>
          </View>
          <View style={styles.controlItem}>
            <Ionicons name="expand-outline" size={20} color="#fff" />
            <Text style={styles.controlText}>Zoom</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>3D Features</Text>
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleView3D}
          disabled={isLoading}
        >
          <Ionicons name="cube-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Loading...' : viewIn3DText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleViewAR}
        >
          <Ionicons name="camera-outline" size={20} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>{viewInARText}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCards}>
        <View style={styles.infoCard}>
          <Ionicons name="phone-portrait-outline" size={32} color="#3b82f6" />
          <Text style={styles.infoCardTitle}>Mobile Optimized</Text>
          <Text style={styles.infoCardText}>
            Experience smooth 3D rendering on your device
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="eye-outline" size={32} color="#8b5cf6" />
          <Text style={styles.infoCardTitle}>Augmented Reality</Text>
          <Text style={styles.infoCardText}>
            See the product in your space with AR
          </Text>
        </View>
      </View>

      {/* Note */}
      <View style={styles.noteSection}>
        <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
        <Text style={styles.noteText}>
          This is a 3D model viewer placeholder. Integrate with libraries like expo-three or react-native-3d-model-view for full 3D functionality.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  viewerContainer: {
    height: 400,
    backgroundColor: '#1f2937',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  overlaySubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 8,
  },
  controlsHint: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  infoCards: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoCardText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fef3c7',
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return { code, imports };
}
