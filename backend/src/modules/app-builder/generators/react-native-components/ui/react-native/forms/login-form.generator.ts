/**
 * React Native Login Form Generator
 * Generates a mobile login form component
 */

export function generateRNLoginForm(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';`,
    `import { useMutation } from '@tanstack/react-query';`,
    `import { apiClient } from '@/lib/api';`,
  ];

  const code = `${imports.join('\n')}

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  options?: any;
  [key: string]: any;
}

export default function LoginForm({
  onSuccess,
  onForgotPassword,
  onSignUp,
  options: propOptions
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (propOptions) return;
      setOptionsLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/auth/options\`);
        const result = await response.json();
        setOptions(result?.data || result || {});
      } catch (err) {
        console.error('Failed to fetch options:', err);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const formOptions = propOptions || options || {};

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    onSuccess: (data) => {
      // Store token
      // AsyncStorage.setItem('token', data.token);
      onSuccess?.();
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {loginMutation.isError && (
          <Text style={styles.error}>Invalid email or password</Text>
        )}

        {onForgotPassword && (
          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {onSignUp && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={styles.linkBold}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  link: {
    color: '#3b82f6',
    fontSize: 14,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkBold: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});`;

  return { code, imports };
}
