/**
 * Error Page Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Error 404
export function generateRNError404(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Error404Props {
  onGoHome?: () => void;
  onGoBack?: () => void;
  message?: string;
}

export default function Error404({ onGoHome, onGoBack, message }: Error404Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.message}>
        {message || "The page you're looking for doesn't exist or has been moved."}
      </Text>

      <View style={styles.buttonRow}>
        {onGoBack && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
        {onGoHome && (
          <TouchableOpacity style={styles.primaryButton} onPress={onGoHome}>
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  code: {
    fontSize: 120,
    fontWeight: '800',
    color: '#e5e7eb',
    marginBottom: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Error 404 Page (alias)
export function generateRNError404Page(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNError404(resolved, variant);
}

// Error 500
export function generateRNError500(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Error500Props {
  onRetry?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
  errorId?: string;
}

export default function Error500({ onRetry, onGoHome, onContactSupport, errorId }: Error500Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="warning" size={48} color="#ef4444" />
      </View>

      <Text style={styles.code}>500</Text>
      <Text style={styles.title}>Server Error</Text>
      <Text style={styles.message}>
        Something went wrong on our end. Please try again later.
      </Text>

      {errorId && (
        <View style={styles.errorIdContainer}>
          <Text style={styles.errorIdLabel}>Error ID:</Text>
          <Text style={styles.errorId}>{errorId}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        {onRetry && (
          <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        {onGoHome && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onGoHome}>
            <Ionicons name="home" size={20} color="#374151" />
            <Text style={styles.secondaryButtonText}>Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {onContactSupport && (
        <TouchableOpacity style={styles.linkButton} onPress={onContactSupport}>
          <Text style={styles.linkText}>Contact Support</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  code: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  errorIdContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 24,
    flexDirection: 'row',
    gap: 8,
  },
  errorIdLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Error 500 Page (alias)
export function generateRNError500Page(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNError500(resolved, variant);
}

// Error Message
export function generateRNErrorMessage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message?: string;
  title?: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function ErrorMessage({
  message = 'An error occurred',
  title,
  type = 'error',
  onDismiss,
  onRetry
}: ErrorMessageProps) {
  const getColors = () => {
    switch (type) {
      case 'warning':
        return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '#f59e0b' };
      case 'info':
        return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: '#3b82f6' };
      default:
        return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#ef4444' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'alert-circle';
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.content}>
        <Ionicons name={getIcon()} size={24} color={colors.icon} />
        <View style={styles.textContainer}>
          {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity onPress={onRetry}>
            <Text style={[styles.actionText, { color: colors.text }]}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Coming Soon Page
export function generateRNComingSoonPage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComingSoonPageProps {
  title?: string;
  description?: string;
  launchDate?: string;
  onNotify?: (email: string) => void;
}

export default function ComingSoonPage({
  title = "Coming Soon",
  description = "We're working on something exciting. Stay tuned!",
  launchDate,
  onNotify
}: ComingSoonPageProps) {
  const [email, setEmail] = useState('');

  const handleNotify = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    onNotify?.(email);
    Alert.alert('Success', "We'll notify you when we launch!");
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="rocket" size={48} color="#3b82f6" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {launchDate && (
        <View style={styles.launchDateContainer}>
          <Ionicons name="calendar" size={20} color="#6b7280" />
          <Text style={styles.launchDate}>Expected: {launchDate}</Text>
        </View>
      )}

      <View style={styles.notifySection}>
        <Text style={styles.notifyTitle}>Get Notified</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.notifyButton} onPress={handleNotify}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.socialLinks}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-facebook" size={24} color="#1877f2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-instagram" size={24} color="#e4405f" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  launchDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  launchDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  notifySection: {
    width: '100%',
    marginBottom: 32,
  },
  notifyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  notifyButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';"],
  };
}

// Maintenance Mode Page
export function generateRNMaintenanceModePage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MaintenanceModePageProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  onRefresh?: () => void;
  onContactSupport?: () => void;
}

export default function MaintenanceModePage({
  title = "Under Maintenance",
  message = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime,
  onRefresh,
  onContactSupport
}: MaintenanceModePageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="construct" size={48} color="#f59e0b" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {estimatedTime && (
        <View style={styles.estimatedContainer}>
          <Ionicons name="time" size={20} color="#6b7280" />
          <Text style={styles.estimatedText}>Estimated completion: {estimatedTime}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        {onRefresh && (
          <TouchableOpacity style={styles.primaryButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Check Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {onContactSupport && (
        <TouchableOpacity style={styles.linkButton} onPress={onContactSupport}>
          <Text style={styles.linkText}>Need help? Contact Support</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Maintenance in progress</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  estimatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  estimatedText: {
    fontSize: 14,
    color: '#374151',
  },
  buttonRow: {
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  linkButton: {
    padding: 8,
    marginBottom: 32,
  },
  linkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}
