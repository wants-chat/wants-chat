/**
 * React Native Profile Card Generator
 * Generates a user profile card component
 */

export function generateRNProfileCard(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface ProfileCardProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  userId?: string;
  onEdit?: () => void;
  [key: string]: any;
}

export default function ProfileCard({ user: propUser, userId, onEdit }: ProfileCardProps) {
  const [fetchedUser, setFetchedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propUser) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = userId ? \`\${apiUrl}/user_profiles/\${userId}\` : \`\${apiUrl}/user_profiles/me\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedUser(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const user = propUser || fetchedUser;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: user.avatar || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: '#9ca3af',
  },
  editButton: {
    padding: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});`;

  return { code, imports };
}
