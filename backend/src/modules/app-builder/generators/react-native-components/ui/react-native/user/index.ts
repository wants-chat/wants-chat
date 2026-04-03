/**
 * User Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Re-export existing generators
export { generateRNProfileCard } from './profile-card.generator';
export { generateRNProfileEditForm } from './profile-edit-form.generator';

// User Profile
export function generateRNUserProfile(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    joinDate?: string;
    stats?: {
      posts: number;
      followers: number;
      following: number;
    };
  };
  onEditProfile?: () => void;
  onSettings?: () => void;
}

export default function UserProfile({ user, onEditProfile, onSettings }: UserProfileProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.name[0]}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        {user.stats && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={onSettings}>
            <Ionicons name="settings-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {user.joinDate && (
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <Text style={styles.infoText}>Joined {user.joinDate}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';"],
  };
}

// User Profile View (alias)
export const generateRNUserProfileView = generateRNUserProfile;

// User Profile Card Mini
export function generateRNUserProfileCardMini(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserProfileCardMiniProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

export default function UserProfileCardMini({ name, subtitle, avatar, onPress, showChevron = true }: UserProfileCardMiniProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{name[0]}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Account Settings
export function generateRNAccountSettings(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

interface AccountSettingsProps {
  settings?: SettingItemProps[];
  onLogout?: () => void;
}

export default function AccountSettings({ settings, onLogout }: AccountSettingsProps) {
  const defaultSettings: SettingItemProps[] = settings || [
    { icon: 'person-outline', label: 'Personal Information', value: '' },
    { icon: 'lock-closed-outline', label: 'Password & Security', value: '' },
    { icon: 'notifications-outline', label: 'Notifications', toggle: true, toggleValue: true },
    { icon: 'moon-outline', label: 'Dark Mode', toggle: true, toggleValue: false },
    { icon: 'language-outline', label: 'Language', value: 'English' },
    { icon: 'help-circle-outline', label: 'Help & Support', value: '' },
    { icon: 'document-text-outline', label: 'Privacy Policy', value: '' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {defaultSettings.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
            disabled={item.toggle}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, item.danger && styles.iconContainerDanger]}>
                <Ionicons name={item.icon as any} size={20} color={item.danger ? '#ef4444' : '#3b82f6'} />
              </View>
              <Text style={[styles.settingLabel, item.danger && styles.settingLabelDanger]}>
                {item.label}
              </Text>
            </View>
            <View style={styles.settingRight}>
              {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
              {item.toggle ? (
                <Switch
                  value={item.toggleValue}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={item.toggleValue ? '#3b82f6' : '#f4f4f5'}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDanger: {
    backgroundColor: '#fef2f2',
  },
  settingLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  settingLabelDanger: {
    color: '#ef4444',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';"],
  };
}

// Avatar Upload
export function generateRNAvatarUpload(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActionSheetIOS, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (source: 'camera' | 'gallery') => void;
  onRemove?: () => void;
  size?: number;
}

export default function AvatarUpload({ currentAvatar, onUpload, onRemove, size = 120 }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState(currentAvatar);

  const showOptions = () => {
    const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];
    if (avatar) options.splice(2, 0, 'Remove Photo');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: avatar ? 2 : undefined },
        (buttonIndex) => {
          if (buttonIndex === 0) onUpload?.('camera');
          else if (buttonIndex === 1) onUpload?.('gallery');
          else if (avatar && buttonIndex === 2) {
            setAvatar(undefined);
            onRemove?.();
          }
        }
      );
    } else {
      Alert.alert('Update Photo', 'Choose an option', [
        { text: 'Take Photo', onPress: () => onUpload?.('camera') },
        { text: 'Choose from Gallery', onPress: () => onUpload?.('gallery') },
        ...(avatar ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => { setAvatar(undefined); onRemove?.(); } }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.avatarContainer, { width: size, height: size }]} onPress={showOptions}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Ionicons name="person" size={size * 0.4} color="#9ca3af" />
          </View>
        )}
        <View style={[styles.editBadge, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]}>
          <Ionicons name="camera" size={size * 0.15} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>Tap to change photo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  hint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 12,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, ActionSheetIOS, Platform, Alert } from 'react-native';"],
  };
}

// Team Members Grid
export function generateRNTeamMembersGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

interface TeamMembersGridProps {
  members: TeamMember[];
  columns?: 2 | 3;
  onMemberPress?: (member: TeamMember) => void;
  onInvite?: () => void;
}

export default function TeamMembersGrid({ members, columns = 2, onMemberPress, onInvite }: TeamMembersGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48 - (columns - 1) * 12) / columns;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Members</Text>
        {onInvite && (
          <TouchableOpacity style={styles.inviteButton} onPress={onInvite}>
            <Ionicons name="person-add" size={18} color="#3b82f6" />
            <Text style={styles.inviteText}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={members}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.memberCard, { width: cardWidth }]}
            onPress={() => onMemberPress?.(item)}
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
            )}
            <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.memberRole} numberOfLines={1}>{item.role}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';"],
  };
}

// Role Management
export function generateRNRoleManagement(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  memberCount: number;
}

interface RoleManagementProps {
  roles: Role[];
  onRoleSelect?: (role: Role) => void;
  onAddRole?: () => void;
  onPermissionToggle?: (roleId: string, permissionId: string, enabled: boolean) => void;
}

export default function RoleManagement({ roles, onRoleSelect, onAddRole, onPermissionToggle }: RoleManagementProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Roles & Permissions</Text>
        {onAddRole && (
          <TouchableOpacity style={styles.addButton} onPress={onAddRole}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Role</Text>
          </TouchableOpacity>
        )}
      </View>

      {roles.map((role) => (
        <View key={role.id} style={styles.roleCard}>
          <TouchableOpacity
            style={styles.roleHeader}
            onPress={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
          >
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>{role.name}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
              <Text style={styles.memberCount}>{role.memberCount} members</Text>
            </View>
            <Ionicons
              name={expandedRole === role.id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>

          {expandedRole === role.id && (
            <View style={styles.permissions}>
              <Text style={styles.permissionsTitle}>Permissions</Text>
              {role.permissions.map((permission) => (
                <View key={permission.id} style={styles.permissionRow}>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionName}>{permission.name}</Text>
                    <Text style={styles.permissionDescription}>{permission.description}</Text>
                  </View>
                  <Switch
                    value={permission.enabled}
                    onValueChange={(value) => onPermissionToggle?.(role.id, permission.id, value)}
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={permission.enabled ? '#3b82f6' : '#f4f4f5'}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  roleDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  permissions: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
    paddingTop: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 14,
    color: '#111827',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';"],
  };
}

// API Key Management
export function generateRNApiKeyManagement(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'revoked';
}

interface ApiKeyManagementProps {
  apiKeys: ApiKey[];
  onCreateKey?: () => void;
  onRevokeKey?: (keyId: string) => void;
  onCopyKey?: (key: string) => void;
}

export default function ApiKeyManagement({ apiKeys, onCreateKey, onRevokeKey, onCopyKey }: ApiKeyManagementProps) {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => key.substring(0, 8) + '••••••••••••••••';

  const handleRevoke = (keyId: string) => {
    Alert.alert('Revoke API Key', 'Are you sure you want to revoke this API key?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => onRevokeKey?.(keyId) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Keys</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreateKey}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New Key</Text>
        </TouchableOpacity>
      </View>

      {apiKeys.map((apiKey) => (
        <View key={apiKey.id} style={styles.keyCard}>
          <View style={styles.keyHeader}>
            <View style={styles.keyInfo}>
              <Text style={styles.keyName}>{apiKey.name}</Text>
              <View style={[styles.statusBadge, apiKey.status === 'revoked' && styles.statusRevoked]}>
                <Text style={[styles.statusText, apiKey.status === 'revoked' && styles.statusTextRevoked]}>
                  {apiKey.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.keyValueRow}>
            <Text style={styles.keyValue}>
              {visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
            </Text>
            <View style={styles.keyActions}>
              <TouchableOpacity onPress={() => toggleKeyVisibility(apiKey.id)}>
                <Ionicons name={visibleKeys[apiKey.id] ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onCopyKey?.(apiKey.key)}>
                <Ionicons name="copy" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.keyMeta}>
            <Text style={styles.metaText}>Created: {apiKey.createdAt}</Text>
            {apiKey.lastUsed && <Text style={styles.metaText}>Last used: {apiKey.lastUsed}</Text>}
          </View>

          {apiKey.status === 'active' && (
            <TouchableOpacity style={styles.revokeButton} onPress={() => handleRevoke(apiKey.id)}>
              <Text style={styles.revokeButtonText}>Revoke Key</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  keyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusRevoked: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  statusTextRevoked: {
    color: '#dc2626',
  },
  keyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  keyValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#374151',
  },
  keyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  keyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  revokeButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  revokeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';"],
  };
}

// Usage Metrics Display
export function generateRNUsageMetricsDisplay(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
  progress?: number;
  max?: number;
}

interface UsageMetricsDisplayProps {
  metrics: MetricProps[];
  title?: string;
  period?: string;
}

export default function UsageMetricsDisplay({ metrics, title = 'Usage Metrics', period }: UsageMetricsDisplayProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {period && <Text style={styles.period}>{period}</Text>}
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={metric.icon as any} size={20} color="#3b82f6" />
              </View>
              {metric.trend && (
                <View style={[styles.trendBadge, !metric.trend.isPositive && styles.trendNegative]}>
                  <Ionicons
                    name={metric.trend.isPositive ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={metric.trend.isPositive ? '#16a34a' : '#dc2626'}
                  />
                  <Text style={[styles.trendText, !metric.trend.isPositive && styles.trendTextNegative]}>
                    {metric.trend.value}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.metricValue}>
              {metric.value}{metric.unit && <Text style={styles.metricUnit}> {metric.unit}</Text>}
            </Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>

            {metric.progress !== undefined && metric.max !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: \`\${(metric.progress / metric.max) * 100}%\` }]} />
                </View>
                <Text style={styles.progressText}>{metric.progress} / {metric.max}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  period: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    gap: 2,
  },
  trendNegative: {
    backgroundColor: '#fef2f2',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  trendTextNegative: {
    color: '#dc2626',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
  },
  metricLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Version History
export function generateRNVersionHistory(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VersionEntry {
  id: string;
  version: string;
  date: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
  isCurrent?: boolean;
}

interface VersionHistoryProps {
  versions: VersionEntry[];
  onVersionSelect?: (version: VersionEntry) => void;
  onRestore?: (version: VersionEntry) => void;
}

export default function VersionHistory({ versions, onVersionSelect, onRestore }: VersionHistoryProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return '#ef4444';
      case 'minor': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Version History</Text>

      {versions.map((version, index) => (
        <TouchableOpacity
          key={version.id}
          style={[styles.versionCard, version.isCurrent && styles.currentVersion]}
          onPress={() => onVersionSelect?.(version)}
        >
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: getTypeColor(version.type) }]} />
            {index < versions.length - 1 && <View style={styles.line} />}
          </View>

          <View style={styles.content}>
            <View style={styles.versionHeader}>
              <View style={styles.versionInfo}>
                <Text style={styles.versionNumber}>v{version.version}</Text>
                {version.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
              <Text style={styles.date}>{version.date}</Text>
            </View>

            <View style={styles.changes}>
              {version.changes.map((change, idx) => (
                <View key={idx} style={styles.changeItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.changeText}>{change}</Text>
                </View>
              ))}
            </View>

            {!version.isCurrent && onRestore && (
              <TouchableOpacity style={styles.restoreButton} onPress={() => onRestore(version)}>
                <Ionicons name="time" size={16} color="#3b82f6" />
                <Text style={styles.restoreText}>Restore this version</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  versionCard: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  currentVersion: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: 12,
    width: 2,
    height: 100,
    backgroundColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  currentBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  date: {
    fontSize: 13,
    color: '#9ca3af',
  },
  changes: {
    gap: 6,
  },
  changeItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    color: '#6b7280',
  },
  changeText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  restoreText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Settings Panel Admin
export function generateRNSettingsPanelAdmin(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingSection {
  title: string;
  settings: {
    key: string;
    label: string;
    description?: string;
    type: 'toggle' | 'text' | 'select';
    value: any;
    options?: string[];
  }[];
}

interface SettingsPanelAdminProps {
  sections: SettingSection[];
  onSettingChange?: (key: string, value: any) => void;
  onSave?: () => void;
}

export default function SettingsPanelAdmin({ sections, onSettingChange, onSave }: SettingsPanelAdminProps) {
  return (
    <ScrollView style={styles.container}>
      {sections.map((section, sectionIdx) => (
        <View key={sectionIdx} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.settings.map((setting) => (
            <View key={setting.key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                {setting.description && (
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                )}
              </View>

              {setting.type === 'toggle' && (
                <Switch
                  value={setting.value}
                  onValueChange={(value) => onSettingChange?.(setting.key, value)}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={setting.value ? '#3b82f6' : '#f4f4f5'}
                />
              )}

              {setting.type === 'text' && (
                <TextInput
                  style={styles.textInput}
                  value={setting.value}
                  onChangeText={(value) => onSettingChange?.(setting.key, value)}
                  placeholder="Enter value"
                />
              )}
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 120,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';"],
  };
}

// System Notifications User
export function generateRNSystemNotificationsUser(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  time: string;
  read: boolean;
}

interface SystemNotificationsUserProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
}

export default function SystemNotificationsUser({
  notifications,
  onNotificationPress,
  onMarkAllRead,
  onDismiss,
}: SystemNotificationsUserProps) {
  const getIconProps = (type: string) => {
    switch (type) {
      case 'warning': return { name: 'warning', color: '#f59e0b', bg: '#fef3c7' };
      case 'error': return { name: 'alert-circle', color: '#ef4444', bg: '#fef2f2' };
      case 'success': return { name: 'checkmark-circle', color: '#22c55e', bg: '#dcfce7' };
      default: return { name: 'information-circle', color: '#3b82f6', bg: '#dbeafe' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {onMarkAllRead && (
          <TouchableOpacity onPress={onMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const iconProps = getIconProps(item.type);
          return (
            <TouchableOpacity
              style={[styles.notificationCard, !item.read && styles.unread]}
              onPress={() => onNotificationPress?.(item)}
            >
              <View style={[styles.iconContainer, { backgroundColor: iconProps.bg }]}>
                <Ionicons name={iconProps.name as any} size={20} color={iconProps.color} />
              </View>
              <View style={styles.content}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {onDismiss && (
                <TouchableOpacity style={styles.dismissButton} onPress={() => onDismiss(item.id)}>
                  <Ionicons name="close" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  markAllRead: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  dismissButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';"],
  };
}

// Resume Manager
export function generateRNResumeManager(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Resume {
  id: string;
  name: string;
  lastModified: string;
  status: 'draft' | 'active' | 'archived';
  views?: number;
  downloads?: number;
}

interface ResumeManagerProps {
  resumes: Resume[];
  onCreateNew?: () => void;
  onEdit?: (resume: Resume) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export default function ResumeManager({ resumes, onCreateNew, onEdit, onDelete, onDuplicate }: ResumeManagerProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#16a34a' };
      case 'archived': return { bg: '#f3f4f6', text: '#6b7280' };
      default: return { bg: '#fef3c7', text: '#d97706' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Resumes</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>

      {resumes.map((resume) => {
        const statusStyle = getStatusStyle(resume.status);
        return (
          <View key={resume.id} style={styles.resumeCard}>
            <View style={styles.resumeIcon}>
              <Ionicons name="document-text" size={28} color="#3b82f6" />
            </View>

            <View style={styles.resumeInfo}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeName}>{resume.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{resume.status}</Text>
                </View>
              </View>
              <Text style={styles.lastModified}>Modified {resume.lastModified}</Text>
              {(resume.views || resume.downloads) && (
                <View style={styles.stats}>
                  {resume.views !== undefined && (
                    <View style={styles.stat}>
                      <Ionicons name="eye" size={14} color="#9ca3af" />
                      <Text style={styles.statText}>{resume.views}</Text>
                    </View>
                  )}
                  {resume.downloads !== undefined && (
                    <View style={styles.stat}>
                      <Ionicons name="download" size={14} color="#9ca3af" />
                      <Text style={styles.statText}>{resume.downloads}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => onEdit?.(resume)}>
                <Ionicons name="create" size={18} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => onDuplicate?.(resume.id)}>
                <Ionicons name="copy" size={18} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => onDelete?.(resume.id)}>
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resumeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resumeIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lastModified: {
    fontSize: 13,
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Logs Viewer
export function generateRNLogsViewer(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface LogsViewerProps {
  logs: LogEntry[];
  onRefresh?: () => void;
  onClear?: () => void;
}

export default function LogsViewer({ logs, onRefresh, onClear }: LogsViewerProps) {
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'error': return { bg: '#fef2f2', text: '#dc2626' };
      case 'warn': return { bg: '#fef3c7', text: '#d97706' };
      case 'debug': return { bg: '#f3f4f6', text: '#6b7280' };
      default: return { bg: '#dbeafe', text: '#2563eb' };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesText = log.message.toLowerCase().includes(filter.toLowerCase());
    const matchesLevel = !levelFilter || log.level === levelFilter;
    return matchesText && matchesLevel;
  });

  const levels = ['info', 'warn', 'error', 'debug'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={onClear}>
            <Ionicons name="trash" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search logs..."
            value={filter}
            onChangeText={setFilter}
          />
        </View>
        <View style={styles.levelFilters}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelButton, levelFilter === level && styles.levelButtonActive]}
              onPress={() => setLevelFilter(levelFilter === level ? null : level)}
            >
              <Text style={[styles.levelButtonText, levelFilter === level && styles.levelButtonTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const levelStyle = getLevelStyle(item.level);
          return (
            <View style={styles.logEntry}>
              <View style={styles.logMeta}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
                  <Text style={[styles.levelText, { color: levelStyle.text }]}>{item.level.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.logMessage}>{item.message}</Text>
              {item.source && <Text style={styles.logSource}>{item.source}</Text>}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    backgroundColor: '#1f2937',
    borderRadius: 6,
  },
  filters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    color: '#f9fafb',
    fontSize: 14,
  },
  levelFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1f2937',
    borderRadius: 6,
  },
  levelButtonActive: {
    backgroundColor: '#3b82f6',
  },
  levelButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  logEntry: {
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    padding: 12,
    paddingHorizontal: 16,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logMessage: {
    fontSize: 13,
    color: '#e5e7eb',
    fontFamily: 'monospace',
  },
  logSource: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';"],
  };
}
