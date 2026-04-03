/**
 * Generate ForgotPasswordScreen - Password reset request screen
 *
 * This screen allows users to request a password reset by entering their email.
 * It displays a confirmation message after sending the reset link.
 *
 * Features:
 * - Email input field
 * - Loading state during API call
 * - Success confirmation message
 * - Navigation back to login
 * - Error handling with toast notifications
 *
 * @returns Generated ForgotPasswordScreen component code as string
 */
export function generateForgotPasswordScreen(): string {
  return `import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loader: {
    marginRight: 8,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
    alignSelf: 'center',
  },
});

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);

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

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        '/auth/forgot-password',
        { email },
        { requireAuth: false },
      );

      if (response.data?.success || response.success) {
        Alert.alert('Success', 'Password reset email sent!');
        setSent(true);
      } else {
        Alert.alert('Error', 'Failed to send reset email. Please try again.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send reset email';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.description}>
              {sent
                ? \`Check your email for a password reset link from \${appName}\`
                : "Enter your email address and we'll send you a reset link"}
            </Text>

            {!sent ? (
              <View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                      style={styles.loader}
                    />
                  )}
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send reset link'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleBackToLogin}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>Back to login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  We've sent a password reset link to your email. Please check
                  your inbox and follow the instructions.
                </Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleBackToLogin}
                >
                  <Text style={styles.buttonText}>Return to login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}`;
}
