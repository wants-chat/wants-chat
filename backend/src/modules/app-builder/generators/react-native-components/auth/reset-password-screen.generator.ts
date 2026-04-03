/**
 * Generate ResetPasswordScreen - Password reset with token validation
 *
 * This screen allows users to reset their password using a reset token.
 * It validates that passwords match before submission.
 *
 * Features:
 * - Password input fields (new password and confirm)
 * - Password validation (matching check, minimum length)
 * - Token validation from route params
 * - Loading state during API call
 * - Error handling with proper messaging
 * - Navigation to login on success
 *
 * @returns Generated ResetPasswordScreen component code as string
 */
export function generateResetPasswordScreen(): string {
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
  errorCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
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

interface ResetPasswordScreenProps {
  navigation: any;
  route: {
    params?: {
      token?: string;
    };
  };
}

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        '/auth/reset-password',
        {
          token,
          newPassword: password,
        },
        { requireAuth: false },
      );

      if (response.data?.success || response.success) {
        Alert.alert('Success', 'Password reset successful!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Password reset failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Password reset failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Invalid reset link</Text>
              <Text style={styles.description}>
                This password reset link is invalid or has expired.
              </Text>

              <View style={styles.errorCard}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.buttonText}>
                    Request new reset link
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

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
              Enter your new password for {appName}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                secureTextEntry
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
                {loading ? 'Resetting...' : 'Reset password'}
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}`;
}
