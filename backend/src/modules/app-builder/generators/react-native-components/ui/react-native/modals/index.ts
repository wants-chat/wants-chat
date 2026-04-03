/**
 * Modal Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Modal Dialog
export function generateRNModalDialog(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
}

export default function ModalDialog({ visible, onClose, title, children, size = 'medium', showCloseButton = true }: ModalDialogProps) {
  const getModalWidth = () => {
    const screenWidth = Dimensions.get('window').width;
    switch (size) {
      case 'small': return screenWidth * 0.7;
      case 'medium': return screenWidth * 0.85;
      case 'large': return screenWidth * 0.95;
      case 'fullscreen': return screenWidth;
      default: return screenWidth * 0.85;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { width: getModalWidth() }, size === 'fullscreen' && styles.fullscreen]}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          )}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  fullscreen: {
    height: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';"],
  };
}

// Confirmation Dialog
export function generateRNConfirmationDialog(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function ConfirmationDialog({
  visible,
  title = 'Confirm',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  const getIconName = () => {
    switch (type) {
      case 'warning': return 'warning';
      case 'danger': return 'alert-circle';
      case 'success': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'success': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger': return { backgroundColor: '#ef4444' };
      case 'warning': return { backgroundColor: '#f59e0b' };
      case 'success': return { backgroundColor: '#10b981' };
      default: return { backgroundColor: '#3b82f6' };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.iconCircle, { backgroundColor: getIconColor() + '20' }]}>
            <Ionicons name={getIconName()} size={32} color={getIconColor()} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmButton, getConfirmButtonStyle()]} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Lightbox Modal Viewer
export function generateRNLightboxModalViewer(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LightboxModalViewerProps {
  visible: boolean;
  images: { url: string; caption?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export default function LightboxModalViewer({ visible, images, initialIndex = 0, onClose }: LightboxModalViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { width, height } = Dimensions.get('window');

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentIndex]?.url }}
            style={[styles.image, { width: width - 32, height: height * 0.7 }]}
            resizeMode="contain"
          />
        </View>

        {images[currentIndex]?.caption && (
          <Text style={styles.caption}>{images[currentIndex].caption}</Text>
        )}

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={28} color={currentIndex === 0 ? '#4b5563' : '#fff'} />
          </TouchableOpacity>

          <Text style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>

          <TouchableOpacity
            style={[styles.navButton, currentIndex === images.length - 1 && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={currentIndex === images.length - 1}
          >
            <Ionicons name="chevron-forward" size={28} color={currentIndex === images.length - 1 ? '#4b5563' : '#fff'} />
          </TouchableOpacity>
        </View>

        <View style={styles.thumbnailContainer}>
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setCurrentIndex(index)}
                style={[styles.thumbnail, currentIndex === index && styles.thumbnailActive]}
              >
                <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: 8,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 24,
  },
  navButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  counter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  thumbnail: {
    marginHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#3b82f6',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Dimensions, FlatList } from 'react-native';"],
  };
}

// Exit Intent Popup
export function generateRNExitIntentPopup(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExitIntentPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  ctaText?: string;
  onCta?: () => void;
  imageUrl?: string;
  discount?: string;
}

export default function ExitIntentPopup({
  visible,
  onClose,
  title = "Wait! Don't Go Yet!",
  message = "Get an exclusive offer before you leave",
  ctaText = "Claim Offer",
  onCta,
  imageUrl,
  discount
}: ExitIntentPopupProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>

          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          )}

          {discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}</Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.ctaButton} onPress={onCta}>
            <Text style={styles.ctaButtonText}>{ctaText}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.dismissText}>No thanks, I'll pass</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 100,
    right: 40,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  discountText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  discountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  dismissText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';"],
  };
}
