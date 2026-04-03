/**
 * React Native Layout Component Generators
 *
 * Generates layout components for React Native including:
 * - Divider
 * - Accordion
 * - Tabs
 * - Chip
 * - Header
 * - BottomSheet
 */

// ============================================
// Divider Component
// ============================================

/**
 * Generate Divider component for React Native
 */
export function generateDivider(): string {
  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  spacing?: number;
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color = '#E5E7EB',
  spacing = 16,
  label,
  labelPosition = 'center',
  style,
  labelStyle,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: color,
            marginHorizontal: spacing,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.withLabel, { marginVertical: spacing }, style]}>
        {labelPosition !== 'left' && (
          <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        )}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {labelPosition !== 'right' && (
          <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: spacing,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
  withLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  label: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default Divider;
`;
}

// ============================================
// Accordion Component
// ============================================

/**
 * Generate Accordion component for React Native
 */
export function generateAccordion(): string {
  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  onChange?: (expandedIds: string[]) => void;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  onChange,
  style,
  headerStyle,
  contentStyle,
  titleStyle,
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded);
  const rotations = useRef<Record<string, Animated.Value>>({});

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    let newExpandedIds: string[];

    if (expandedIds.includes(id)) {
      newExpandedIds = expandedIds.filter((i) => i !== id);
    } else {
      newExpandedIds = allowMultiple ? [...expandedIds, id] : [id];
    }

    setExpandedIds(newExpandedIds);
    onChange?.(newExpandedIds);

    // Animate icon rotation
    if (!rotations.current[id]) {
      rotations.current[id] = new Animated.Value(expandedIds.includes(id) ? 1 : 0);
    }

    Animated.timing(rotations.current[id], {
      toValue: newExpandedIds.includes(id) ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);

        if (!rotations.current[item.id]) {
          rotations.current[item.id] = new Animated.Value(isExpanded ? 1 : 0);
        }

        const rotation = rotations.current[item.id].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        });

        return (
          <View
            key={item.id}
            style={[
              styles.item,
              index === items.length - 1 && styles.lastItem,
            ]}
          >
            <TouchableOpacity
              style={[styles.header, headerStyle]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              {item.icon && (
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="#374151"
                  style={styles.icon}
                />
              )}
              <Text style={[styles.title, titleStyle]}>{item.title}</Text>
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </Animated.View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={[styles.content, contentStyle]}>{item.content}</View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default Accordion;
`;
}

// ============================================
// Tabs Component
// ============================================

/**
 * Generate Tabs component for React Native
 */
export function generateTabs(): string {
  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: number;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  scrollable = false,
  style,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tabId: string, index: number) => {
    setActiveTab(tabId);
    onChange?.(tabId);

    if (variant === 'underline') {
      Animated.spring(indicatorPosition, {
        toValue: index,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    }
  };

  const TabContainer = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? { horizontal: true, showsHorizontalScrollIndicator: false }
    : {};

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const getTabStyles = (isActive: boolean) => {
    const baseStyle = [styles.tab, tabStyle];

    if (variant === 'pills') {
      return [
        ...baseStyle,
        styles.pillTab,
        isActive && styles.pillTabActive,
        isActive && activeTabStyle,
      ];
    }

    if (variant === 'underline') {
      return [...baseStyle, styles.underlineTab];
    }

    return [
      ...baseStyle,
      isActive && styles.defaultTabActive,
      isActive && activeTabStyle,
    ];
  };

  return (
    <View style={[styles.container, style]}>
      <TabContainer
        {...containerProps}
        style={[
          styles.tabBar,
          variant === 'pills' && styles.pillTabBar,
          variant === 'underline' && styles.underlineTabBar,
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={getTabStyles(isActive)}
              onPress={() => handleTabPress(tab.id, index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  variant === 'pills' && isActive && styles.pillLabelActive,
                  variant === 'underline' && isActive && styles.underlineLabelActive,
                  labelStyle,
                  isActive && activeLabelStyle,
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {variant === 'underline' && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: SCREEN_WIDTH / tabs.length,
                transform: [
                  {
                    translateX: indicatorPosition.interpolate({
                      inputRange: tabs.map((_, i) => i),
                      outputRange: tabs.map((_, i) => (SCREEN_WIDTH / tabs.length) * i),
                    }),
                  },
                ],
              },
            ]}
          />
        )}
      </TabContainer>

      <View style={styles.content}>{activeContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pillTabBar: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderBottomWidth: 0,
    margin: 16,
  },
  underlineTabBar: {
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  defaultTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  pillTab: {
    borderRadius: 8,
    marginHorizontal: 2,
  },
  pillTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  underlineTab: {
    // No additional styles
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  pillLabelActive: {
    color: '#111827',
  },
  underlineLabelActive: {
    color: '#3B82F6',
  },
  badge: {
    marginLeft: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#3B82F6',
  },
  content: {
    flex: 1,
  },
});

export default Tabs;
`;
}

// ============================================
// Chip Component
// ============================================

/**
 * Generate Chip component for React Native
 */
export function generateChip(): string {
  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type ChipVariant = 'filled' | 'outlined';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  avatar?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const SIZE_CONFIG = {
  sm: { height: 24, paddingH: 8, fontSize: 12, iconSize: 14 },
  md: { height: 32, paddingH: 12, fontSize: 14, iconSize: 16 },
  lg: { height: 40, paddingH: 16, fontSize: 16, iconSize: 18 },
};

export function Chip({
  label,
  variant = 'filled',
  size = 'md',
  color = '#3B82F6',
  icon,
  avatar,
  selected = false,
  disabled = false,
  onPress,
  onDelete,
  style,
  labelStyle,
}: ChipProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const isOutlined = variant === 'outlined';
  const isInteractive = !!onPress && !disabled;

  const bgColor = isOutlined
    ? 'transparent'
    : selected
      ? color
      : '#F3F4F6';

  const textColor = isOutlined
    ? color
    : selected
      ? '#FFFFFF'
      : '#374151';

  const borderColor = isOutlined ? color : 'transparent';

  const Container = isInteractive ? TouchableOpacity : View;
  const containerProps = isInteractive
    ? { onPress, activeOpacity: 0.7 }
    : {};

  return (
    <Container
      {...containerProps}
      style={[
        styles.chip,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingH,
          backgroundColor: bgColor,
          borderColor,
          borderWidth: isOutlined ? 1 : 0,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {avatar && <View style={styles.avatar}>{avatar}</View>}

      {icon && !avatar && (
        <Ionicons
          name={icon}
          size={sizeConfig.iconSize}
          color={textColor}
          style={styles.icon}
        />
      )}

      <Text
        style={[
          styles.label,
          { fontSize: sizeConfig.fontSize, color: textColor },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={disabled}
        >
          <Ionicons name="close" size={sizeConfig.iconSize} color={textColor} />
        </TouchableOpacity>
      )}
    </Container>
  );
}

export function ChipGroup({
  children,
  style,
  gap = 8,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  return (
    <View style={[styles.chipGroup, { gap }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
  },
  disabled: {
    opacity: 0.5,
  },
  avatar: {
    marginRight: 6,
    marginLeft: -4,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 4,
    marginRight: -4,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default Chip;
`;
}

// ============================================
// Header Component
// ============================================

/**
 * Generate Header component for React Native
 */
export function generateHeader(): string {
  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  transparent?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export function Header({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  rightComponent,
  leftComponent,
  centerComponent,
  transparent = false,
  statusBarStyle = 'dark-content',
  style,
  titleStyle,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        transparent && styles.transparent,
        style,
      ]}
    >
      <StatusBar barStyle={statusBarStyle} />

      <View style={styles.content}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {leftComponent ||
            (leftIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onLeftPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={leftIcon}
                  size={24}
                  color={transparent ? '#FFFFFF' : '#111827'}
                />
              </TouchableOpacity>
            ))}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {centerComponent || (
            <View style={styles.titleContainer}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    transparent && styles.titleLight,
                    titleStyle,
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[styles.subtitle, transparent && styles.subtitleLight]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightComponent ||
            (rightIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onRightPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={rightIcon}
                  size={24}
                  color={transparent ? '#FFFFFF' : '#111827'}
                />
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  titleLight: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  subtitleLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default Header;
`;
}

// ============================================
// BottomSheet Component
// ============================================

/**
 * Generate BottomSheet component for React Native
 */
export function generateBottomSheet(): string {
  return `import React, { useRef, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  PanResponder,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnapIndex?: number;
  enableDrag?: boolean;
  closeOnDragDown?: boolean;
  showHandle?: boolean;
  backdropOpacity?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = [0.5, 0.9],
  initialSnapIndex = 0,
  enableDrag = true,
  closeOnDragDown = true,
  showHandle = true,
  backdropOpacity = 0.5,
  style,
  contentStyle,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const heights = snapPoints.map((p) => SCREEN_HEIGHT * p);
  const currentHeight = heights[initialSnapIndex];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - currentHeight,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: backdropOpacity,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableDrag,
      onMoveShouldSetPanResponder: () => enableDrag,
      onPanResponderMove: (_, gestureState) => {
        const newY = SCREEN_HEIGHT - currentHeight + gestureState.dy;
        if (newY >= 0) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 && closeOnDragDown) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - currentHeight,
            damping: 20,
            stiffness: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropAnim },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }], maxHeight: SCREEN_HEIGHT * 0.9 },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.content, { paddingBottom: insets.bottom }, contentStyle]}
          >
            {children}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BottomSheet;
`;
}
