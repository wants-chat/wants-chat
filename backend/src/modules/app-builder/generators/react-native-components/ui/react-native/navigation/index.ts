/**
 * Navigation Component Generators for React Native
 * Comprehensive navigation components for mobile apps
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Import generators for re-export and aliases
import { generateRNNavbar } from './navbar.generator';
import { generateRNFooter } from './footer.generator';
import { generateTabsNavigation as generateRNTabsNavigation } from './tabs-navigation.generator';

// Re-export generators
export { generateRNNavbar, generateRNFooter, generateRNTabsNavigation };

// Bottom Tab Bar
export function generateRNBottomTabBar(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tab {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

interface BottomTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export default function BottomTabBar({ tabs, activeTab, onTabPress }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <View style={styles.iconContainer}>
              <Ionicons name={tab.icon as any} size={24} color={isActive ? '#3b82f6' : '#6b7280'} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 20, paddingTop: 8, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  iconContainer: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -8, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  label: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  labelActive: { color: '#3b82f6', fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Header Bar
export function generateRNHeaderBar(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  transparent?: boolean;
}

export default function HeaderBar({ title, showBack, onBack, rightIcon, onRightPress, transparent }: HeaderBarProps) {
  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <StatusBar barStyle={transparent ? 'light-content' : 'dark-content'} />
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={transparent ? '#fff' : '#111827'} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, transparent && styles.titleLight]} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>
        {rightIcon && (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress}>
            <Ionicons name={rightIcon as any} size={24} color={transparent ? '#fff' : '#111827'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  transparent: { backgroundColor: 'transparent', borderBottomWidth: 0, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  left: { width: 48, alignItems: 'flex-start' },
  right: { width: 48, alignItems: 'flex-end' },
  backBtn: { padding: 8 },
  iconBtn: { padding: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center' },
  titleLight: { color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';"],
  };
}

// Drawer Menu
export function generateRNDrawerMenu(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  activeItem?: string;
  onItemPress: (id: string) => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export default function DrawerMenu({ visible, onClose, items, activeItem, onItemPress, userName, userEmail, userAvatar }: DrawerMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.drawer}>
          <View style={styles.header}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="#6b7280" />
              </View>
            )}
            <Text style={styles.userName}>{userName || 'Guest'}</Text>
            {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
          </View>

          <ScrollView style={styles.menu}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, activeItem === item.id && styles.menuItemActive]}
                onPress={() => { onItemPress(item.id); onClose(); }}
              >
                <Ionicons name={item.icon as any} size={22} color={activeItem === item.id ? '#3b82f6' : '#374151'} />
                <Text style={[styles.menuLabel, activeItem === item.id && styles.menuLabelActive]}>{item.label}</Text>
                {item.badge !== undefined && item.badge > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { width: 280, backgroundColor: '#fff', paddingTop: 50 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: '600', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  menu: { flex: 1, paddingVertical: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 14 },
  menuItemActive: { backgroundColor: '#eff6ff' },
  menuLabel: { flex: 1, fontSize: 16, color: '#374151' },
  menuLabelActive: { color: '#3b82f6', fontWeight: '500' },
  badge: { backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', gap: 14 },
  logoutText: { fontSize: 16, color: '#ef4444' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal } from 'react-native';"],
  };
}

// Sidebar (alias for drawer on tablet/desktop)
export const generateRNSidebar = generateRNDrawerMenu;

// Breadcrumbs
export function generateRNBreadcrumbs(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Breadcrumb {
  label: string;
  onPress?: () => void;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  separator?: string;
}

export default function Breadcrumbs({ items, separator = '/' }: BreadcrumbsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {items.map((item: any, index: number) => {
          const isLast = index === items.length - 1;
          return (
            <View key={index} style={styles.item}>
              {item.onPress && !isLast ? (
                <TouchableOpacity onPress={item.onPress}>
                  <Text style={styles.link}>{item.label}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.text, isLast && styles.active]}>{item.label}</Text>
              )}
              {!isLast && <Text style={styles.separator}>{separator}</Text>}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  item: { flexDirection: 'row', alignItems: 'center' },
  link: { fontSize: 14, color: '#3b82f6' },
  text: { fontSize: 14, color: '#6b7280' },
  active: { color: '#111827', fontWeight: '500' },
  separator: { fontSize: 14, color: '#9ca3af', marginHorizontal: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Pagination
export function generateRNPagination(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, showFirstLast = true }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <View style={styles.container}>
      {showFirstLast && (
        <TouchableOpacity style={[styles.btn, currentPage === 1 && styles.btnDisabled]} onPress={() => onPageChange(1)} disabled={currentPage === 1}>
          <Ionicons name="play-back" size={16} color={currentPage === 1 ? '#9ca3af' : '#374151'} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.btn, currentPage === 1 && styles.btnDisabled]} onPress={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? '#9ca3af' : '#374151'} />
      </TouchableOpacity>

      {getPageNumbers().map((page) => (
        <TouchableOpacity key={page} style={[styles.pageBtn, currentPage === page && styles.pageBtnActive]} onPress={() => onPageChange(page)}>
          <Text style={[styles.pageText, currentPage === page && styles.pageTextActive]}>{page}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.btn, currentPage === totalPages && styles.btnDisabled]} onPress={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? '#9ca3af' : '#374151'} />
      </TouchableOpacity>
      {showFirstLast && (
        <TouchableOpacity style={[styles.btn, currentPage === totalPages && styles.btnDisabled]} onPress={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          <Ionicons name="play-forward" size={16} color={currentPage === totalPages ? '#9ca3af' : '#374151'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  btn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  pageBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  pageBtnActive: { backgroundColor: '#3b82f6' },
  pageText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  pageTextActive: { color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Stepper Navigation
export function generateRNStepperNavigation(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Step {
  label: string;
  description?: string;
}

interface StepperNavigationProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export default function StepperNavigation({ steps, currentStep, orientation = 'horizontal' }: StepperNavigationProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View style={[styles.container, !isHorizontal && styles.containerVertical]}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <View key={index} style={[styles.step, !isHorizontal && styles.stepVertical]}>
            <View style={styles.stepContent}>
              <View style={[styles.circle, isCompleted && styles.circleCompleted, isActive && styles.circleActive]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text style={[styles.circleText, (isCompleted || isActive) && styles.circleTextActive]}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, (isCompleted || isActive) && styles.labelActive]}>{step.label}</Text>
                {step.description && <Text style={styles.description}>{step.description}</Text>}
              </View>
            </View>
            {!isLast && <View style={[styles.connector, !isHorizontal && styles.connectorVertical, isCompleted && styles.connectorCompleted]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16 },
  containerVertical: { flexDirection: 'column' },
  step: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  stepVertical: { flexDirection: 'column', marginBottom: 8 },
  stepContent: { alignItems: 'center' },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  circleCompleted: { backgroundColor: '#10b981' },
  circleActive: { backgroundColor: '#3b82f6' },
  circleText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  circleTextActive: { color: '#fff' },
  labelContainer: { marginTop: 8, alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '500', color: '#6b7280', textAlign: 'center' },
  labelActive: { color: '#111827' },
  description: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 2 },
  connector: { flex: 1, height: 2, backgroundColor: '#e5e7eb', marginTop: 15, marginHorizontal: 8 },
  connectorVertical: { width: 2, height: 24, marginLeft: 15, marginVertical: 4 },
  connectorCompleted: { backgroundColor: '#10b981' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Accordion Menu
export function generateRNAccordionMenu(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
}

interface AccordionMenuProps {
  items: MenuItem[];
  onItemPress: (id: string) => void;
  activeId?: string;
}

export default function AccordionMenu({ items, onItemPress, activeId }: AccordionMenuProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const renderItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.includes(item.id);
    const isActive = activeId === item.id;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[styles.item, { paddingLeft: 16 + level * 16 }, isActive && styles.itemActive]}
          onPress={() => hasChildren ? toggleExpand(item.id) : onItemPress(item.id)}
        >
          {item.icon && <Ionicons name={item.icon as any} size={20} color={isActive ? '#3b82f6' : '#6b7280'} />}
          <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          {hasChildren && (
            <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#9ca3af" />
          )}
        </TouchableOpacity>
        {hasChildren && isExpanded && (
          <View style={styles.children}>
            {item.children!.map(child => renderItem(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  return <View style={styles.container}>{items.map(item => renderItem(item))}</View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: 16, gap: 12 },
  itemActive: { backgroundColor: '#eff6ff' },
  label: { flex: 1, fontSize: 15, color: '#374151' },
  labelActive: { color: '#3b82f6', fontWeight: '500' },
  children: { backgroundColor: '#f9fafb' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';"],
  };
}

// Segmented Control
export function generateRNSegmentedControl(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({ segments, value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment) => (
        <TouchableOpacity
          key={segment.value}
          style={[styles.segment, value === segment.value && styles.segmentActive]}
          onPress={() => onChange(segment.value)}
        >
          <Text style={[styles.label, value === segment.value && styles.labelActive]}>{segment.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 10, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  label: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  labelActive: { color: '#111827' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Back Button
export function generateRNBackButton(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  onPress: () => void;
  label?: string;
  color?: string;
}

export default function BackButton({ onPress, label, color = '#111827' }: BackButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name="arrow-back" size={24} color={color} />
      {label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  label: { fontSize: 16, fontWeight: '500' },
});`,
    imports: ["import React from 'react';", "import { TouchableOpacity, Text, StyleSheet } from 'react-native';"],
  };
}

// Navigation Pills
export function generateRNNavigationPills(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Pill {
  value: string;
  label: string;
  count?: number;
}

interface NavigationPillsProps {
  pills: Pill[];
  value: string;
  onChange: (value: string) => void;
}

export default function NavigationPills({ pills, value, onChange }: NavigationPillsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {pills.map((pill) => (
        <TouchableOpacity
          key={pill.value}
          style={[styles.pill, value === pill.value && styles.pillActive]}
          onPress={() => onChange(pill.value)}
        >
          <Text style={[styles.label, value === pill.value && styles.labelActive]}>{pill.label}</Text>
          {pill.count !== undefined && (
            <View style={[styles.count, value === pill.value && styles.countActive]}>
              <Text style={[styles.countText, value === pill.value && styles.countTextActive]}>{pill.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', gap: 6 },
  pillActive: { backgroundColor: '#3b82f6' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  labelActive: { color: '#fff' },
  count: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  countText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  countTextActive: { color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Action Sheet
export function generateRNActionSheet(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Action {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: Action[];
  onActionPress: (id: string) => void;
}

export default function ActionSheet({ visible, onClose, title, actions, onActionPress }: ActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {title && <Text style={styles.title}>{title}</Text>}
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.action}
              onPress={() => { onActionPress(action.id); onClose(); }}
            >
              {action.icon && <Ionicons name={action.icon as any} size={22} color={action.destructive ? '#ef4444' : '#374151'} />}
              <Text style={[styles.actionLabel, action.destructive && styles.destructive]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, paddingTop: 8 },
  title: { fontSize: 13, color: '#6b7280', textAlign: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  action: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, gap: 14 },
  actionLabel: { fontSize: 17, color: '#374151' },
  destructive: { color: '#ef4444' },
  cancelBtn: { marginTop: 8, paddingVertical: 16, marginHorizontal: 16, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: 17, fontWeight: '600', color: '#374151' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Floating Action Button
export function generateRNFloatingActionButton(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubAction {
  id: string;
  icon: string;
  label?: string;
  color?: string;
}

interface FloatingActionButtonProps {
  icon?: string;
  onPress?: () => void;
  subActions?: SubAction[];
  onSubActionPress?: (id: string) => void;
  position?: 'bottomRight' | 'bottomLeft' | 'bottomCenter';
}

export default function FloatingActionButton({ icon = 'add', onPress, subActions, onSubActionPress, position = 'bottomRight' }: FloatingActionButtonProps) {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if (subActions?.length) {
      setExpanded(!expanded);
    } else {
      onPress?.();
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'bottomLeft': return { left: 20, right: undefined };
      case 'bottomCenter': return { left: '50%', marginLeft: -28 };
      default: return { right: 20, left: undefined };
    }
  };

  return (
    <View style={[styles.container, getPosition()]}>
      {expanded && subActions?.map((action, index) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.subButton, { backgroundColor: action.color || '#6b7280', bottom: 70 + index * 60 }]}
          onPress={() => { onSubActionPress?.(action.id); setExpanded(false); }}
        >
          <Ionicons name={action.icon as any} size={22} color="#fff" />
          {action.label && <View style={styles.labelBubble}><Text style={styles.labelText}>{action.label}</Text></View>}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.mainButton, expanded && styles.mainButtonExpanded]} onPress={handlePress}>
        <Ionicons name={expanded ? 'close' : icon as any} size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 24, alignItems: 'center' },
  mainButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  mainButtonExpanded: { backgroundColor: '#6b7280' },
  subButton: { position: 'absolute', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4, flexDirection: 'row' },
  labelBubble: { position: 'absolute', right: 56, backgroundColor: '#1f2937', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  labelText: { fontSize: 13, color: '#fff', fontWeight: '500' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';"],
  };
}

// Scroll Indicator
export function generateRNScrollIndicator(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ScrollIndicatorProps {
  total: number;
  current: number;
  color?: string;
}

export default function ScrollIndicator({ total, current, color = '#3b82f6' }: ScrollIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            current === index ? [styles.dotActive, { backgroundColor: color }] : styles.dotInactive
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { borderRadius: 4 },
  dotActive: { width: 24, height: 8 },
  dotInactive: { width: 8, height: 8, backgroundColor: '#e5e7eb' },
});`,
    imports: ["import React from 'react';", "import { View, StyleSheet, Animated } from 'react-native';"],
  };
}

// Quick Links Bar
export function generateRNQuickLinksBar(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickLink {
  id: string;
  icon: string;
  label: string;
  color?: string;
}

interface QuickLinksBarProps {
  links: QuickLink[];
  onPress: (id: string) => void;
}

export default function QuickLinksBar({ links, onPress }: QuickLinksBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {links.map((link) => (
        <TouchableOpacity key={link.id} style={styles.link} onPress={() => onPress(link.id)}>
          <View style={[styles.iconContainer, { backgroundColor: (link.color || '#3b82f6') + '20' }]}>
            <Ionicons name={link.icon as any} size={24} color={link.color || '#3b82f6'} />
          </View>
          <Text style={styles.label}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  link: { alignItems: 'center', width: 72 },
  iconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { fontSize: 12, color: '#374151', textAlign: 'center' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Profile Menu
export function generateRNProfileMenu(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  showArrow?: boolean;
  destructive?: boolean;
}

interface ProfileMenuProps {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  items: MenuItem[];
  onItemPress: (id: string) => void;
  onEditProfile?: () => void;
}

export default function ProfileMenu({ userName, userEmail, userAvatar, items, onItemPress, onEditProfile }: ProfileMenuProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
        </View>
        {onEditProfile && (
          <TouchableOpacity style={styles.editBtn} onPress={onEditProfile}>
            <Ionicons name="pencil" size={18} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menu}>
        {items.map((item: any, index: number) => (
          <TouchableOpacity key={item.id} style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]} onPress={() => onItemPress(item.id)}>
            <Ionicons name={item.icon as any} size={22} color={item.destructive ? '#ef4444' : '#6b7280'} />
            <Text style={[styles.menuLabel, item.destructive && styles.destructive]}>{item.label}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            {item.showArrow && <Ionicons name="chevron-forward" size={18} color="#9ca3af" />}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 18, fontWeight: '600', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  menu: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 14 },
  menuItemLast: { borderBottomWidth: 0 },
  menuLabel: { flex: 1, fontSize: 16, color: '#374151' },
  destructive: { color: '#ef4444' },
  menuValue: { fontSize: 14, color: '#9ca3af' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';"],
  };
}

// Page Indicator
export function generateRNPageIndicator(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PageIndicatorProps {
  total: number;
  current: number;
  activeColor?: string;
  inactiveColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function PageIndicator({ total, current, activeColor = '#3b82f6', inactiveColor = '#e5e7eb', size = 'medium' }: PageIndicatorProps) {
  const dotSize = size === 'small' ? 6 : size === 'large' ? 12 : 8;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
            { backgroundColor: index === current ? activeColor : inactiveColor }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  dot: {},
});`,
    imports: ["import React from 'react';", "import { View, StyleSheet } from 'react-native';"],
  };
}

// Language Switcher
export function generateRNLanguageSwitcher(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Language {
  code: string;
  name: string;
  flag?: string;
}

interface LanguageSwitcherProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
}

export default function LanguageSwitcher({ languages, currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const [visible, setVisible] = useState(false);
  const current = languages.find(l => l.code === currentLanguage);

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        {current?.flag && <Text style={styles.flag}>{current.flag}</Text>}
        <Text style={styles.currentLanguage}>{current?.name || currentLanguage}</Text>
        <Ionicons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.dropdown}>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.code === currentLanguage && styles.optionActive]}
                  onPress={() => { onLanguageChange(item.code); setVisible(false); }}
                >
                  {item.flag && <Text style={styles.flag}>{item.flag}</Text>}
                  <Text style={[styles.optionText, item.code === currentLanguage && styles.optionTextActive]}>{item.name}</Text>
                  {item.code === currentLanguage && <Ionicons name="checkmark" size={18} color="#3b82f6" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6', gap: 6 },
  flag: { fontSize: 18 },
  currentLanguage: { fontSize: 14, color: '#374151' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 32 },
  dropdown: { backgroundColor: '#fff', borderRadius: 16, maxHeight: 300 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 10 },
  optionActive: { backgroundColor: '#eff6ff' },
  optionText: { flex: 1, fontSize: 16, color: '#374151' },
  optionTextActive: { color: '#3b82f6', fontWeight: '500' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';"],
  };
}

// ============================================================================
// FALLBACK ALIASES
// ============================================================================
export const generateRNHeaderSticky = generateRNHeaderBar;
export const generateRNHeaderTransparent = generateRNHeaderBar;
export const generateRNHeaderMegaMenu = generateRNHeaderBar;
export const generateRNFooterMinimal = generateRNFooter;
export const generateRNFooterMultiColumn = generateRNFooter;
export const generateRNSidebarNavigation = generateRNDrawerMenu;
export const generateRNBreadcrumbNavigation = generateRNBreadcrumbs;
export const generateRNHamburgerMenu = generateRNDrawerMenu;
export const generateRNDropdownMenu = generateRNDrawerMenu;
export const generateRNMegaMenuDropdown = generateRNDrawerMenu;
export const generateRNMobileBottomNav = generateRNBottomTabBar;
export const generateRNAccordion = generateRNAccordionMenu;
