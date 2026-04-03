/**
 * React Native AR Preview Interface Generator
 * Generates an AR preview interface component for product visualization
 */

export function generateRNARPreviewInterface(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, TextInput, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface ARFeature {
  id: string;
  feature: string;
}

interface Product {
  name: string;
  dimensions: {
    width: string;
    depth: string;
    height: string;
  };
}

interface ARPreviewProps {
  productData?: any;
  product?: Product;
  arFeatures?: ARFeature[];
  subtitle?: string;
  activateARText?: string;
  takePhotoText?: string;
  shareText?: string;
  placeObjectText?: string;
  instructionsText?: string;
  instructions?: {
    camera: string[];
  };
  onARActivate?: () => void;
  onPhotoTaken?: (photo: any) => void;
  onShare?: () => void;
  [key: string]: any;
}

export default function ARPreviewInterface({
  productData: propData,
  product: propProduct = { name: 'Product', dimensions: { width: '100cm', depth: '80cm', height: '90cm' } },
  arFeatures: propArFeatures = [],
  subtitle = 'Visualize in your space',
  activateARText = 'Start AR View',
  takePhotoText = 'Take Photo',
  shareText = 'Share',
  placeObjectText = 'Place Object',
  instructionsText = 'Instructions',
  instructions = { camera: ['Move your device to scan the surface', 'Tap to place the object'] },
  onARActivate,
  onPhotoTaken,
  onShare
}: ARPreviewProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isARActive, setIsARActive] = useState(false);

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
  const product = data.product || propProduct;
  const arFeatures = data.arFeatures || propArFeatures;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  const [isPlaced, setIsPlaced] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleActivateAR = () => {
    setIsARActive(true);
    setShowInstructions(true);
    onARActivate?.();
  };

  const handlePlace = () => {
    setIsPlaced(true);
    setShowInstructions(false);
  };

  const handleTakePhoto = () => {
    onPhotoTaken?.({});
  };

  const handleShare = () => {
    onShare?.();
  };

  if (!isARActive) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.introContainer}>
          <Text style={styles.emoji}>🛋️</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Features:</Text>
            {arFeatures.map((item: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>{item.feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.activateButton} onPress={handleActivateAR}>
            <Ionicons name="camera" size={24} color="#111827" />
            <Text style={styles.activateButtonText}>{activateARText}</Text>
          </TouchableOpacity>

          <Text style={styles.dimensionsText}>
            Dimensions: {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.arContainer}>
      {/* Camera Feed Simulation */}
      <View style={styles.cameraFeed}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera" size={64} color="rgba(255,255,255,0.5)" />
          <Text style={styles.cameraText}>Camera Feed</Text>
        </View>

        {/* Placed Object */}
        {isPlaced && (
          <View style={styles.placedObjectContainer}>
            <Text style={styles.placedObject}>🛋️</Text>
          </View>
        )}

        {/* Surface Detection Grid */}
        {!isPlaced && (
          <View style={styles.gridContainer}>
            {Array.from({ length: 16 }).map((_, i) => (
              <View key={i} style={styles.gridItem} />
            ))}
          </View>
        )}
      </View>

      {/* Instructions Overlay */}
      {showInstructions && (
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="alert-circle" size={20} color="#fbbf24" />
              <Text style={styles.instructionsTitle}>{instructionsText}</Text>
            </View>
            {instructions.camera.map((instruction, index) => (
              <Text key={index} style={styles.instructionItem}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Place Button */}
      {!isPlaced && (
        <View style={styles.placeButtonContainer}>
          <TouchableOpacity style={styles.placeButton} onPress={handlePlace}>
            <Ionicons name="move" size={20} color="#111827" />
            <Text style={styles.placeButtonText}>{placeObjectText}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {isPlaced && (
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.primaryControl} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryControl} onPress={() => setIsPlaced(false)}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryControl} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  introContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    minHeight: 600,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  productName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 24,
  },
  featuresTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  activateButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  activateButtonText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  dimensionsText: {
    color: '#dbeafe',
    fontSize: 14,
    textAlign: 'center',
  },
  arContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFeed: {
    flex: 1,
    backgroundColor: '#374151',
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 18,
    marginTop: 16,
  },
  placedObjectContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  placedObject: {
    fontSize: 120,
  },
  gridContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -80 }],
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 160,
    opacity: 0.3,
  },
  gridItem: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 4,
    margin: 4,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  instructionsCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 16,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionItem: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  placeButtonContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  placeButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  placeButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  primaryControl: {
    backgroundColor: '#fff',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControl: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
