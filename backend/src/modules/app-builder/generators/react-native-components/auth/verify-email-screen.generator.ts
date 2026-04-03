/**
 * Generate VerifyEmailScreen - Email verification screen
 *
 * This screen handles email verification with a token from the email link.
 * It automatically verifies the email when the component mounts.
 *
 * Features:
 * - Automatic email verification on mount
 * - Loading state with spinner
 * - Success state with checkmark icon
 * - Error state with error icon
 * - Token validation from route params
 * - Auto-navigation to login on success after delay
 * - Error recovery with retry option
 *
 * @returns Generated VerifyEmailScreen component code as string
 */
export function generateVerifyEmailScreen(): string {
  return `import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { api } from '@/lib/api';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 64,
    height: 64,
  },
  successIcon: {
    fontSize: 64,
  },
  errorIcon: {
    fontSize: 64,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  redirectText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
    alignSelf: 'center',
  },
});

interface VerifyEmailScreenProps {
  navigation: any;
  route: {
    params?: {
      token?: string;
    };
  };
}

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailScreen({
  navigation,
  route,
}: VerifyEmailScreenProps) {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const token = route?.params?.token;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/config\`);
        const result = await response.json();
        setConfig(result?.data || result || {});
      } catch (err) {
        console.error('Failed to fetch config:', err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const appName = config?.appName || 'App';
  const logoUrl = config?.logoUrl;

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await api.post(
          '/auth/verify-email',
          { token },
          { requireAuth: false },
        );

        if (response.data?.success || response.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          // Auto-navigate to login after 3 seconds
          setTimeout(() => {
            navigation.navigate('Login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Email verification failed');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Email verification failed';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token, navigation]);

  const renderIcon = () => {
    if (status === 'loading') {
      return (
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          style={styles.spinner}
        />
      );
    }
    if (status === 'success') {
      return <Text style={styles.successIcon}>✓</Text>;
    }
    if (status === 'error') {
      return <Text style={styles.errorIcon}>✕</Text>;
    }
  };

  const getDescriptionText = () => {
    if (status === 'loading') {
      return 'Verifying your email address...';
    }
    if (status === 'success') {
      return 'Verification successful';
    }
    if (status === 'error') {
      return 'Verification failed';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {logoUrl && (
              <Image
                source={{ uri: logoUrl }}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.title}>{appName} Email Verification</Text>
            <Text style={styles.description}>{getDescriptionText()}</Text>

            <View style={styles.contentContainer}>
              <View style={styles.iconContainer}>{renderIcon()}</View>

              <Text style={styles.message}>{message}</Text>

              {status === 'success' && (
                <Text style={styles.redirectText}>
                  Redirecting to login...
                </Text>
              )}

              {status === 'error' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.buttonText}>Go to login</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}`;
}
