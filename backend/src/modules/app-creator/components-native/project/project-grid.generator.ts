/**
 * Project Grid Component Generator (React Native)
 *
 * Generates project management components including grid view,
 * project header, milestone tracker, and team members.
 */

export interface ProjectGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProjectGrid(options: ProjectGridOptions = {}): string {
  const { componentName = 'ProjectGrid', endpoint = '/projects' } = options;

  return `import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  filter?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const statusColors: Record<string, { bg: string; text: string }> = {
  planning: { bg: '#F3F4F6', text: '#4B5563' },
  active: { bg: '#DBEAFE', text: '#1D4ED8' },
  'on-hold': { bg: '#FEF3C7', text: '#D97706' },
  completed: { bg: '#D1FAE5', text: '#059669' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ filter }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['projects', filter],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}' + (filter ? '?status=' + filter : ''));
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const status = item.status || 'planning';
    const colors = statusColors[status] || statusColors.planning;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProjectDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="folder-outline" size={24} color="#3B82F6" />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name || item.title}
        </Text>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardMeta}>
          {item.team_size && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.team_size}</Text>
            </View>
          )}
          {item.due_date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {new Date(item.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{item.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \`\${item.progress}%\` }]} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [navigation]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {projects && projects.length > 0 ? (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No projects found</Text>
          <Text style={styles.emptySubtitle}>Create your first project to get started</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateProjectHeader(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'ProjectHeader', endpoint = '/projects' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  planning: { bg: '#F3F4F6', text: '#4B5563' },
  active: { bg: '#DBEAFE', text: '#1D4ED8' },
  'on-hold': { bg: '#FEF3C7', text: '#D97706' },
  completed: { bg: '#D1FAE5', text: '#059669' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ projectId: propId }) => {
  const route = useRoute<any>();
  const projectId = propId || route.params?.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId);
      return response?.data || response;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  const status = project.status || 'planning';
  const colors = statusColors[status] || statusColors.planning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {project.name || project.title}
          </Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      {project.description && (
        <Text style={styles.description}>{project.description}</Text>
      )}

      <View style={styles.metaContainer}>
        {project.start_date && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.metaLabel}>Started:</Text>
            <Text style={styles.metaValue}>
              {new Date(project.start_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        {project.due_date && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaLabel}>Due:</Text>
            <Text style={styles.metaValue}>
              {new Date(project.due_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        {project.team_size && (
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.metaLabel}>Team:</Text>
            <Text style={styles.metaValue}>{project.team_size} members</Text>
          </View>
        )}
      </View>

      {project.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressValue}>{project.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${project.progress}%\` }]} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 14,
    color: '#111827',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
});

export default ${componentName};
`;
}

export function generateMilestoneTracker(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'MilestoneTracker', endpoint = '/milestones' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: milestones, isLoading, refetch } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const url = projectId ? '${endpoint}?project_id=' + projectId : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={24} color="#059669" />;
      case 'in-progress':
        return <Ionicons name="time" size={24} color="#3B82F6" />;
      default:
        return <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />;
    }
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isLast = milestones && index === milestones.length - 1;
    const lineColor = item.status === 'completed' ? '#86EFAC' : '#E5E7EB';

    return (
      <View style={styles.milestoneItem}>
        <View style={styles.iconColumn}>
          {getStatusIcon(item.status)}
          {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.milestoneHeader}>
            <Text
              style={[
                styles.milestoneTitle,
                item.status === 'completed' && styles.completedTitle,
              ]}
            >
              {item.name || item.title}
            </Text>
            {item.due_date && (
              <Text style={styles.milestoneDate}>
                {new Date(item.due_date).toLocaleDateString()}
              </Text>
            )}
          </View>
          {item.description && (
            <Text style={styles.milestoneDescription}>{item.description}</Text>
          )}
        </View>
      </View>
    );
  }, [milestones]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Milestones</Text>
      {milestones && milestones.length > 0 ? (
        <FlatList
          data={milestones}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No milestones yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    color: '#059669',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateTeamMembers(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'TeamMembers', endpoint = '/team-members' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  owner: { bg: '#F3E8FF', text: '#7C3AED' },
  admin: { bg: '#DBEAFE', text: '#1D4ED8' },
  member: { bg: '#F3F4F6', text: '#4B5563' },
  viewer: { bg: '#F3F4F6', text: '#9CA3AF' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ projectId }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      const url = projectId ? '${endpoint}?project_id=' + projectId : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const role = item.role || 'member';
    const colors = roleColors[role] || roleColors.member;

    return (
      <TouchableOpacity style={styles.memberItem} activeOpacity={0.7}>
        <View style={styles.memberInfo}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(item.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.memberActions}>
          <View style={[styles.roleBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.roleText, { color: colors.text }]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Member</Text>
        </TouchableOpacity>
      </View>
      {members && members.length > 0 ? (
        <FlatList
          data={members}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No team members yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  memberEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
