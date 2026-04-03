/**
 * Auth Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Password Change Form
export function generateRNPasswordChangeForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PasswordChangeFormProps {
  onSubmit?: (data: { currentPassword: string; newPassword: string }) => void;
  onCancel?: () => void;
}

export default function PasswordChangeForm({ onSubmit, onCancel }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/change-password\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to change password');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onSubmit) onSubmit(data);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to change password');
    },
  });

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
            placeholder="Enter current password"
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeButton}>
            <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            placeholder="Enter new password"
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
            <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            placeholder="Confirm new password"
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.submitButton, changePasswordMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={changePasswordMutation.isPending}
        >
          {changePasswordMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Password</Text>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Reset Password Form
export function generateRNResetPasswordForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ResetPasswordFormProps {
  token?: string;
  onSubmit?: (data: { password: string; confirmPassword: string }) => void;
  onBack?: () => void;
}

export default function ResetPasswordForm({ token, onSubmit, onBack }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { password: string; token?: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/reset-password\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to reset password');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onSubmit) onSubmit(data);
      Alert.alert('Success', 'Password reset successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to reset password');
    },
  });

  const handleSubmit = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    resetPasswordMutation.mutate({ password, token });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={48} color="#3b82f6" />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password below</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Enter new password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            placeholder="Confirm new password"
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, resetPasswordMutation.isPending && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={resetPasswordMutation.isPending}
      >
        {resetPasswordMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Forgot Password Form
export function generateRNForgotPasswordForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => void;
  onBack?: () => void;
}

export default function ForgotPasswordForm({ onSubmit, onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/forgot-password\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send reset link');
      return response.json();
    },
    onSuccess: (data) => {
      if (onSubmit) onSubmit(email);
      setSubmitted(true);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to send reset link');
    },
  });

  const handleSubmit = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail" size={32} color="#3b82f6" />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to {email}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="key" size={48} color="#3b82f6" />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you instructions to reset your password
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, forgotPasswordMutation.isPending && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {onBack && (
        <TouchableOpacity style={styles.linkButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text style={styles.linkButtonText}>Back to Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Verify Email Form
export function generateRNVerifyEmailForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface VerifyEmailFormProps {
  email?: string;
  onSubmit?: (code: string) => void;
  onResend?: () => void;
}

export default function VerifyEmailForm({ email, onSubmit, onResend }: VerifyEmailFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const queryClient = useQueryClient();

  const verifyEmailMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/verify-email\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, email }),
      });
      if (!response.ok) throw new Error('Invalid verification code');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onSubmit) onSubmit(code.join(''));
      Alert.alert('Success', 'Email verified successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to verify email');
    },
  });

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }
    verifyEmailMutation.mutate(fullCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open" size={32} color="#3b82f6" />
        </View>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{email ? \` \${email}\` : ' your email'}
        </Text>
      </View>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => inputs.current[index] = ref}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleChange(text.slice(-1), index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, verifyEmailMutation.isPending && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={verifyEmailMutation.isPending}
      >
        {verifyEmailMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Verify Email</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity onPress={onResend}>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});`,
    imports: ["import React, { useState, useRef } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Registration Multi-Step
export function generateRNRegistrationMultiStep(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RegistrationMultiStepProps {
  onComplete?: (data: any) => void;
  steps?: { title: string; fields: string[] }[];
}

export default function RegistrationMultiStep({ onComplete, steps = defaultSteps }: RegistrationMultiStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onComplete) onComplete(data);
      Alert.alert('Success', 'Registration completed successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Registration failed');
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      registerMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View key={index} style={styles.progressItem}>
            <View style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text style={[
                  styles.progressNumber,
                  index <= currentStep && styles.progressNumberActive
                ]}>{index + 1}</Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentStep && styles.progressLineActive
              ]} />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>

      <View style={styles.fieldsContainer}>
        {steps[currentStep].fields.map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{formatLabel(field)}</Text>
            <TextInput
              style={styles.input}
              value={formData[field] || ''}
              onChangeText={(value) => updateField(field, value)}
              placeholder={\`Enter \${formatLabel(field).toLowerCase()}\`}
              secureTextEntry={field.toLowerCase().includes('password')}
              keyboardType={field === 'email' ? 'email-address' : 'default'}
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, registerMutation.isPending && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const defaultSteps = [
  { title: 'Account Info', fields: ['email', 'password', 'confirmPassword'] },
  { title: 'Personal Info', fields: ['firstName', 'lastName', 'phone'] },
  { title: 'Preferences', fields: ['company', 'role'] },
];

function formatLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#3b82f6',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressNumberActive: {
    color: '#fff',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#3b82f6',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldsContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Login Modal
export function generateRNLoginModal(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

export default function LoginModal({ visible, onClose, onLogin, onForgotPassword, onSignUp }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Invalid email or password');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onLogin) onLogin(email, password);
      Alert.alert('Success', 'Logged in successfully');
      onClose();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Login failed');
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loginMutation.isPending && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotLink: {
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  signupText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signupLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Social Login
export function generateRNSocialLogin(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onFacebookLogin?: () => void;
  onTwitterLogin?: () => void;
}

export default function SocialLogin({ onGoogleLogin, onAppleLogin, onFacebookLogin, onTwitterLogin }: SocialLoginProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={onGoogleLogin}>
          <Ionicons name="logo-google" size={24} color="#ea4335" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={onAppleLogin}>
          <Ionicons name="logo-apple" size={24} color="#000" />
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={onFacebookLogin}>
          <Ionicons name="logo-facebook" size={24} color="#1877f2" />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={onTwitterLogin}>
          <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
          <Text style={styles.socialButtonText}>Twitter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Password Reset
export function generateRNPasswordReset(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNResetPasswordForm(resolved, variant);
}

// Email Verification
export function generateRNEmailVerification(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNVerifyEmailForm(resolved, variant);
}

// Two Factor Auth
export function generateRNTwoFactorAuth(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TwoFactorAuthProps {
  onSubmit?: (code: string) => void;
  onResend?: () => void;
  onUseBackupCode?: () => void;
}

export default function TwoFactorAuth({ onSubmit, onResend, onUseBackupCode }: TwoFactorAuthProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/2fa/verify\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      if (!response.ok) throw new Error('Invalid verification code');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onSubmit) onSubmit(code.join(''));
      Alert.alert('Success', 'Verification successful');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Verification failed');
    },
  });

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every(c => c) && newCode.join('').length === 6) {
      verifyMutation.mutate(newCode.join(''));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark" size={32} color="#3b82f6" />
      </View>

      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code from your authenticator app
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => inputs.current[index] = ref}
            style={[styles.codeInput, digit && styles.codeInputFilled]}
            value={digit}
            onChangeText={(text) => handleChange(text.slice(-1), index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, verifyMutation.isPending && styles.verifyButtonDisabled]}
        onPress={() => verifyMutation.mutate(code.join(''))}
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={onResend}>
          <Text style={styles.link}>Resend code</Text>
        </TouchableOpacity>
        <Text style={styles.linkDivider}>|</Text>
        <TouchableOpacity onPress={onUseBackupCode}>
          <Text style={styles.link}>Use backup code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  codeInputFilled: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  link: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  linkDivider: {
    color: '#d1d5db',
  },
});`,
    imports: ["import React, { useState, useRef } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Session Timeout Warning
export function generateRNSessionTimeoutWarning(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SessionTimeoutWarningProps {
  visible: boolean;
  timeRemaining: number;
  onExtend?: () => void;
  onLogout?: () => void;
}

export default function SessionTimeoutWarning({ visible, timeRemaining, onExtend, onLogout }: SessionTimeoutWarningProps) {
  const [seconds, setSeconds] = useState(timeRemaining);

  useEffect(() => {
    setSeconds(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <Ionicons name="timer-outline" size={32} color="#f59e0b" />
          </View>

          <Text style={styles.title}>Session Expiring</Text>
          <Text style={styles.message}>
            Your session will expire in
          </Text>

          <Text style={styles.timer}>{formatTime(seconds)}</Text>

          <Text style={styles.message}>
            Would you like to continue your session?
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.extendButton} onPress={onExtend}>
              <Text style={styles.extendButtonText}>Stay Logged In</Text>
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
    backgroundColor: '#fef3c7',
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
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f59e0b',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  extendButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  extendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState, useEffect } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Access Denied Page
export function generateRNAccessDeniedPage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessDeniedPageProps {
  message?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
}

export default function AccessDeniedPage({ message, onGoBack, onGoHome, onContactSupport }: AccessDeniedPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed" size={48} color="#ef4444" />
      </View>

      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>
        {message || "You don't have permission to access this page."}
      </Text>

      <View style={styles.buttonContainer}>
        {onGoBack && (
          <TouchableOpacity style={styles.primaryButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}

        {onGoHome && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onGoHome}>
            <Ionicons name="home" size={20} color="#374151" />
            <Text style={styles.secondaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {onContactSupport && (
        <TouchableOpacity onPress={onContactSupport}>
          <Text style={styles.contactLink}>Contact Support</Text>
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
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  contactLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Age Verification Modal
export function generateRNAgeVerificationModal(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgeVerificationModalProps {
  visible: boolean;
  minAge?: number;
  onVerified?: () => void;
  onDenied?: () => void;
}

export default function AgeVerificationModal({ visible, minAge = 18, onVerified, onDenied }: AgeVerificationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning" size={32} color="#f59e0b" />
          </View>

          <Text style={styles.title}>Age Verification Required</Text>
          <Text style={styles.message}>
            You must be at least {minAge} years old to access this content.
          </Text>

          <Text style={styles.question}>Are you {minAge} or older?</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.noButton} onPress={onDenied}>
              <Text style={styles.noButtonText}>No, I'm not</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yesButton} onPress={onVerified}>
              <Text style={styles.yesButtonText}>Yes, I am</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By clicking "Yes", you confirm that you meet the minimum age requirement.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  noButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  yesButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Delete Account Confirmation
export function generateRNDeleteAccountConfirmation(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteAccountConfirmationProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function DeleteAccountConfirmation({ visible, onClose, onConfirm, confirmText = 'DELETE' }: DeleteAccountConfirmationProps) {
  const [inputText, setInputText] = useState('');
  const queryClient = useQueryClient();

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/auth/delete-account\`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete account');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (onConfirm) onConfirm();
      Alert.alert('Success', 'Account deleted successfully');
      onClose();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to delete account');
    },
  });

  const handleConfirm = () => {
    if (inputText !== confirmText) {
      Alert.alert('Error', \`Please type "\${confirmText}" to confirm\`);
      return;
    }
    deleteAccountMutation.mutate();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash" size={32} color="#ef4444" />
          </View>

          <Text style={styles.title}>Delete Account</Text>
          <Text style={styles.warning}>
            This action cannot be undone. All your data will be permanently deleted.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              This includes all your profile data, settings, and associated content.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Type <Text style={styles.confirmText}>{confirmText}</Text> to confirm
            </Text>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={confirmText}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, (inputText !== confirmText || deleteAccountMutation.isPending) && styles.deleteButtonDisabled]}
              onPress={handleConfirm}
              disabled={inputText !== confirmText || deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
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
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  warning: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  confirmText: {
    fontWeight: '700',
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
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
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}
