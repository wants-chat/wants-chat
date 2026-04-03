/**
 * Generate Auth Navigator for React Native mobile app
 *
 * Creates a navigation stack containing:
 * - Login screen
 * - Register screen
 * Used when user is not authenticated
 */
export function generateAuthNavigator(): string {
  return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}`;
}
