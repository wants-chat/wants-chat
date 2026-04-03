/**
 * React Native Auth Component Generators
 *
 * Exports all authentication-related component generators for React Native.
 * These generators create React Native screens and contexts using:
 * - View, Text, TextInput, TouchableOpacity, etc.
 * - @react-native-async-storage/async-storage for token persistence
 * - @react-navigation/native for navigation
 * - @expo/vector-icons (Ionicons) for icons
 */

export {
  generateLoginScreen,
  generateRegisterScreen,
  generateForgotPasswordScreen,
  generateAuthContext,
  generateProfileScreen,
  type AuthOptions,
} from './auth.generator';
