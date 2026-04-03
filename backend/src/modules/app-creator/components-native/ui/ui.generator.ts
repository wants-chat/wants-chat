/**
 * React Native UI Component Generators
 *
 * Generates reusable UI components for React Native including:
 * - Button
 * - Card
 * - Input
 * - Avatar
 * - EmptyState
 * - LoadingSpinner
 * - Modal
 * - Toast
 * - ConfirmDialog
 * - ActionSheet
 * - ProgressBar
 */

// ============================================
// Button Component
// ============================================

/**
 * Generate Button component for React Native
 */
export function generateButton(): string {
  return `import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button text content */
  children: React.ReactNode;
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Disables the button */
  disabled?: boolean;
  /** Icon component to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon component to show on the right */
  rightIcon?: React.ReactNode;
  /** Makes button take full width of container */
  fullWidth?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; loading: string }> = {
  primary: {
    container: {
      backgroundColor: '#3B82F6',
      borderWidth: 0,
    },
    text: {
      color: '#FFFFFF',
    },
    loading: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: '#F3F4F6',
      borderWidth: 0,
    },
    text: {
      color: '#374151',
    },
    loading: '#374151',
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#D1D5DB',
    },
    text: {
      color: '#374151',
    },
    loading: '#374151',
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: {
      color: '#3B82F6',
    },
    loading: '#3B82F6',
  },
  danger: {
    container: {
      backgroundColor: '#EF4444',
      borderWidth: 0,
    },
    text: {
      color: '#FFFFFF',
    },
    loading: '#FFFFFF',
  },
};

const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
  sm: {
    container: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    text: {
      fontSize: 14,
    },
    iconSize: 16,
  },
  md: {
    container: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    text: {
      fontSize: 16,
    },
    iconSize: 20,
  },
  lg: {
    container: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    text: {
      fontSize: 18,
    },
    iconSize: 24,
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...props
}: ButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.loading} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              variantStyle.text,
              sizeStyle.text,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
`;
}

// ============================================
// Card Component
// ============================================

/**
 * Generate Card component for React Native
 */
export function generateCard(): string {
  return `import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  /** Card content */
  children?: React.ReactNode;
  /** Header slot - rendered at top of card */
  header?: React.ReactNode;
  /** Footer slot - rendered at bottom of card */
  footer?: React.ReactNode;
  /** Padding size for content area */
  padding?: CardPadding;
  /** Makes card pressable */
  onPress?: () => void;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom content style */
  contentStyle?: StyleProp<ViewStyle>;
  /** Disable shadow/elevation */
  flat?: boolean;
  /** Border radius size */
  borderRadius?: number;
}

const PADDING_VALUES: Record<CardPadding, number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
};

export function Card({
  children,
  header,
  footer,
  padding = 'md',
  onPress,
  style,
  contentStyle,
  flat = false,
  borderRadius = 12,
}: CardProps) {
  const paddingValue = PADDING_VALUES[padding];

  const cardStyle: StyleProp<ViewStyle> = [
    styles.container,
    { borderRadius },
    !flat && styles.shadow,
    style,
  ];

  const content = (
    <>
      {header && (
        <View style={[styles.header, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}>
          {header}
        </View>
      )}
      {children && (
        <View style={[styles.content, { padding: paddingValue }, contentStyle]}>
          {children}
        </View>
      )}
      {footer && (
        <View style={[styles.footer, { borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }]}>
          {footer}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.headerContent, style]}>{children}</View>;
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.contentInner, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.footerContent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerContent: {
    padding: 16,
  },
  content: {
    // padding is set dynamically
  },
  contentInner: {
    // for nested CardContent usage
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  footerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
});

export default Card;
`;
}

// ============================================
// Input Component
// ============================================

/**
 * Generate Input component for React Native
 */
export function generateInput(): string {
  return `import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Label text displayed above input */
  label?: string;
  /** Error message displayed below input */
  error?: string;
  /** Helper text displayed below input (hidden when error is shown) */
  helperText?: string;
  /** Icon component to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon component to show on the right */
  rightIcon?: React.ReactNode;
  /** Makes input a password field with visibility toggle */
  isPassword?: boolean;
  /** Container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Input container style */
  inputContainerStyle?: StyleProp<ViewStyle>;
  /** Input style */
  inputStyle?: StyleProp<TextStyle>;
  /** Label style */
  labelStyle?: StyleProp<TextStyle>;
  /** Disabled state */
  disabled?: boolean;
  /** Required indicator */
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  disabled = false,
  required = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          multiline && styles.inputContainerMultiline,
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            multiline && { minHeight: numberOfLines * 24 },
            inputStyle,
          ]}
          placeholderTextColor="#9CA3AF"
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputContainerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  inputMultiline: {
    paddingTop: 0,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  passwordToggle: {
    marginLeft: 10,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
  },
});

export default Input;
`;
}

// ============================================
// Avatar Component
// ============================================

/**
 * Generate Avatar component for React Native
 */
export function generateAvatar(): string {
  return `import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

export interface AvatarProps {
  /** Image source (uri or require) */
  source?: ImageSourcePropType | string;
  /** Name used to generate initials as fallback */
  name?: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Status indicator */
  status?: AvatarStatus;
  /** Custom background color for initials */
  backgroundColor?: string;
  /** Custom text color for initials */
  textColor?: string;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

const SIZE_CONFIG: Record<AvatarSize, { size: number; fontSize: number; statusSize: number }> = {
  xs: { size: 24, fontSize: 10, statusSize: 8 },
  sm: { size: 32, fontSize: 12, statusSize: 10 },
  md: { size: 40, fontSize: 14, statusSize: 12 },
  lg: { size: 56, fontSize: 18, statusSize: 14 },
  xl: { size: 80, fontSize: 24, statusSize: 18 },
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  busy: '#EF4444',
  none: 'transparent',
};

const AVATAR_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({
  source,
  name = '',
  size = 'md',
  status = 'none',
  backgroundColor,
  textColor = '#FFFFFF',
  style,
}: AvatarProps) {
  const config = SIZE_CONFIG[size];
  const initials = getInitials(name);
  const bgColor = backgroundColor || getColorFromName(name);

  const hasImage = source && (
    typeof source === 'number' ||
    (typeof source === 'object' && 'uri' in source && source.uri) ||
    (typeof source === 'string' && source.length > 0)
  );

  const imageSource = typeof source === 'string'
    ? { uri: source }
    : source as ImageSourcePropType;

  return (
    <View
      style={[
        styles.container,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: hasImage ? '#E5E7EB' : bgColor,
        },
        style,
      ]}
    >
      {hasImage ? (
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: config.fontSize,
              color: textColor,
            },
          ]}
        >
          {initials}
        </Text>
      )}

      {status !== 'none' && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: config.statusSize,
              height: config.statusSize,
              borderRadius: config.statusSize / 2,
              backgroundColor: STATUS_COLORS[status],
              borderWidth: config.statusSize > 10 ? 2 : 1.5,
            },
          ]}
        />
      )}
    </View>
  );
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  style,
}: {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}) {
  const config = SIZE_CONFIG[size];
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <View style={[styles.avatarGroup, style]}>
      {visibleAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.avatarGroupItem,
            { marginLeft: index > 0 ? -config.size / 3 : 0, zIndex: visibleAvatars.length - index },
          ]}
        >
          {avatar}
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          style={[
            styles.avatarGroupItem,
            styles.remainingCount,
            {
              marginLeft: -config.size / 3,
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
            },
          ]}
        >
          <Text style={[styles.remainingCountText, { fontSize: config.fontSize }]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    // dimensions set dynamically
  },
  initials: {
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: '#FFFFFF',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroupItem: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 100,
  },
  remainingCount: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingCountText: {
    fontWeight: '600',
    color: '#374151',
  },
});

export default Avatar;
`;
}

// ============================================
// EmptyState Component
// ============================================

/**
 * Generate EmptyState component for React Native
 */
export function generateEmptyState(): string {
  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom icon component (overrides icon prop) */
  iconComponent?: React.ReactNode;
  /** Icon color */
  iconColor?: string;
  /** Icon size */
  iconSize?: number;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button props */
  action?: ButtonProps & { label: string };
  /** Secondary action button props */
  secondaryAction?: ButtonProps & { label: string };
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Title style */
  titleStyle?: StyleProp<TextStyle>;
  /** Description style */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Compact mode with less padding */
  compact?: boolean;
}

export function EmptyState({
  icon = 'file-tray-outline',
  iconComponent,
  iconColor = '#9CA3AF',
  iconSize = 64,
  title,
  description,
  action,
  secondaryAction,
  style,
  titleStyle,
  descriptionStyle,
  compact = false,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={styles.iconContainer}>
        {iconComponent || (
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        )}
      </View>

      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {description && (
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      )}

      {(action || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {action && (
            <Button
              variant="primary"
              size="md"
              {...action}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size="md"
              {...secondaryAction}
            >
              {secondaryAction.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

// Preset empty states for common use cases
export function NoDataEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="folder-open-outline"
      title="No data yet"
      description="There's nothing here at the moment. Start by adding your first item."
      {...props}
    />
  );
}

export function NoResultsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="search-outline"
      title="No results found"
      description="We couldn't find anything matching your search. Try adjusting your filters."
      {...props}
    />
  );
}

export function ErrorEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      iconColor="#EF4444"
      title="Something went wrong"
      description="We encountered an error loading this content. Please try again."
      {...props}
    />
  );
}

export function NoConnectionEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="No internet connection"
      description="Please check your connection and try again."
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  containerCompact: {
    padding: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionsContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
});

export default EmptyState;
`;
}

// ============================================
// LoadingSpinner Component
// ============================================

/**
 * Generate Loading component for React Native
 */
export function generateLoadingSpinner(): string {
  return `import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';

export type LoadingSize = 'small' | 'large';

export interface LoadingProps {
  /** Loading text displayed below spinner */
  text?: string;
  /** Size of the spinner */
  size?: LoadingSize;
  /** Color of the spinner */
  color?: string;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Text style */
  textStyle?: StyleProp<TextStyle>;
}

export interface FullScreenLoadingProps extends LoadingProps {
  /** Whether the loading overlay is visible */
  visible: boolean;
  /** Background color of the overlay */
  overlayColor?: string;
  /** Whether to show a semi-transparent backdrop */
  transparent?: boolean;
}

/**
 * Inline loading spinner
 */
export function Loading({
  text,
  size = 'large',
  color = '#3B82F6',
  style,
  textStyle,
}: LoadingProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
}

/**
 * Full screen loading overlay
 */
export function FullScreenLoading({
  visible,
  text = 'Loading...',
  size = 'large',
  color = '#3B82F6',
  overlayColor = 'rgba(255, 255, 255, 0.95)',
  transparent = false,
  style,
  textStyle,
}: FullScreenLoadingProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={[
          styles.fullScreenContainer,
          { backgroundColor: transparent ? 'rgba(0, 0, 0, 0.5)' : overlayColor },
          style,
        ]}
      >
        <View style={styles.loadingBox}>
          <ActivityIndicator size={size} color={color} />
          {text && (
            <Text style={[styles.fullScreenText, textStyle]}>{text}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Loading placeholder that fills its container
 */
export function LoadingPlaceholder({
  text,
  size = 'large',
  color = '#3B82F6',
  style,
  textStyle,
}: LoadingProps) {
  return (
    <View style={[styles.placeholderContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
}

/**
 * Skeleton loading placeholder for content
 */
export function Skeleton({
  width,
  height = 20,
  borderRadius = 4,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width ?? '100%',
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  fullScreenText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
});

export default Loading;
`;
}

// ============================================
// Modal Component
// ============================================

/**
 * Generate Modal component for React Native
 */
export function generateModal(): string {
  return `import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  DimensionValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when the modal should be closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: React.ReactNode;
  /** Size of the modal */
  size?: ModalSize;
  /** Close modal when tapping backdrop */
  closeOnBackdrop?: boolean;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Animation type */
  animationType?: 'none' | 'slide' | 'fade';
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Content style */
  contentStyle?: StyleProp<ViewStyle>;
  /** Whether content is scrollable */
  scrollable?: boolean;
}

const SIZE_CONFIG: Record<ModalSize, { maxHeight: DimensionValue; width: DimensionValue }> = {
  sm: { maxHeight: SCREEN_HEIGHT * 0.4, width: '80%' },
  md: { maxHeight: SCREEN_HEIGHT * 0.6, width: '90%' },
  lg: { maxHeight: SCREEN_HEIGHT * 0.8, width: '95%' },
  full: { maxHeight: '100%', width: '100%' },
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  animationType = 'fade',
  style,
  contentStyle,
  scrollable = false,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const sizeConfig = SIZE_CONFIG[size];
  const isFullScreen = size === 'full';

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable
    ? { showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }
    : {};

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.container,
                  {
                    maxHeight: sizeConfig.maxHeight,
                    width: sizeConfig.width,
                    paddingBottom: isFullScreen ? insets.bottom : 0,
                    paddingTop: isFullScreen ? insets.top : 0,
                    borderRadius: isFullScreen ? 0 : 16,
                  },
                  style,
                ]}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                      {title || ''}
                    </Text>
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close" size={24} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <ContentWrapper {...contentWrapperProps} style={[styles.content, contentStyle]}>
                  {children}
                </ContentWrapper>

                {/* Footer */}
                {footer && <View style={styles.footer}>{footer}</View>}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  content: {
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
});

export default Modal;
`;
}

// ============================================
// Toast Component
// ============================================

/**
 * Generate Toast component for React Native
 */
export function generateToast(): string {
  return `import React, { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastConfig {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Duration in milliseconds (0 for persistent) */
  duration?: number;
  /** Position on screen */
  position?: ToastPosition;
  /** Action button config */
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastState extends ToastConfig {
  id: string;
}

interface ToastContextType {
  show: (config: ToastConfig) => void;
  hide: () => void;
  success: (message: string, config?: Partial<ToastConfig>) => void;
  error: (message: string, config?: Partial<ToastConfig>) => void;
  warning: (message: string, config?: Partial<ToastConfig>) => void;
  info: (message: string, config?: Partial<ToastConfig>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CONFIG: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  success: { icon: 'checkmark-circle', color: '#10B981', bgColor: '#ECFDF5' },
  error: { icon: 'close-circle', color: '#EF4444', bgColor: '#FEF2F2' },
  warning: { icon: 'warning', color: '#F59E0B', bgColor: '#FFFBEB' },
  info: { icon: 'information-circle', color: '#3B82F6', bgColor: '#EFF6FF' },
};

function ToastComponent({ toast, onHide }: { toast: ToastState; onHide: () => void }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(toast.position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = TOAST_CONFIG[toast.type || 'info'];
  const position = toast.position || 'top';
  const duration = toast.duration ?? 3000;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    if (duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        position === 'top'
          ? { top: insets.top + 16 }
          : { bottom: insets.bottom + 16 },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.action && (
          <TouchableOpacity onPress={toast.action.onPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: config.color }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={config.color} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((config: ToastConfig) => {
    setToast({
      ...config,
      id: Date.now().toString(),
    });
  }, []);

  const hide = useCallback(() => {
    setToast(null);
  }, []);

  const success = useCallback((message: string, config?: Partial<ToastConfig>) => {
    show({ message, type: 'success', ...config });
  }, [show]);

  const error = useCallback((message: string, config?: Partial<ToastConfig>) => {
    show({ message, type: 'error', ...config });
  }, [show]);

  const warning = useCallback((message: string, config?: Partial<ToastConfig>) => {
    show({ message, type: 'warning', ...config });
  }, [show]);

  const info = useCallback((message: string, config?: Partial<ToastConfig>) => {
    show({ message, type: 'info', ...config });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, hide, success, error, warning, info }}>
      {children}
      {toast && <ToastComponent toast={toast} onHide={hide} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ToastProvider;
`;
}

// ============================================
// ConfirmDialog Component
// ============================================

/**
 * Generate ConfirmDialog component for React Native
 */
export function generateConfirmDialog(): string {
  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from './Button';

export type ConfirmDialogVariant = 'default' | 'danger' | 'warning';

export interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Visual variant of the dialog */
  variant?: ConfirmDialogVariant;
  /** Loading state for confirm button */
  loading?: boolean;
  /** Custom icon */
  icon?: keyof typeof Ionicons.glyphMap;
}

const VARIANT_CONFIG: Record<ConfirmDialogVariant, { icon: keyof typeof Ionicons.glyphMap; iconColor: string; buttonVariant: 'primary' | 'danger' }> = {
  default: { icon: 'help-circle', iconColor: '#3B82F6', buttonVariant: 'primary' },
  danger: { icon: 'alert-circle', iconColor: '#EF4444', buttonVariant: 'danger' },
  warning: { icon: 'warning', iconColor: '#F59E0B', buttonVariant: 'primary' },
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  icon,
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIG[variant];
  const iconName = icon || config.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <View style={[styles.iconContainer, { backgroundColor: \`\${config.iconColor}15\` }]}>
                <Ionicons name={iconName} size={32} color={config.iconColor} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttons}>
                <Button
                  variant="outline"
                  onPress={onCancel}
                  disabled={loading}
                  style={styles.button}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={config.buttonVariant}
                  onPress={onConfirm}
                  loading={loading}
                  style={styles.button}
                >
                  {confirmText}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ConfirmDialog;
`;
}

// ============================================
// ActionSheet Component
// ============================================

/**
 * Generate ActionSheet component for React Native
 */
export function generateActionSheet(): string {
  return `import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ActionSheetOption {
  /** Option label */
  label: string;
  /** Icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Called when option is pressed */
  onPress: () => void;
  /** Visual variant */
  variant?: 'default' | 'danger';
  /** Whether option is disabled */
  disabled?: boolean;
}

export interface ActionSheetProps {
  /** Whether the action sheet is visible */
  visible: boolean;
  /** Title of the action sheet */
  title?: string;
  /** Description text */
  message?: string;
  /** Array of options */
  options: ActionSheetOption[];
  /** Cancel button text */
  cancelText?: string;
  /** Called when sheet is closed */
  onClose: () => void;
}

export function ActionSheet({
  visible,
  title,
  message,
  options,
  cancelText = 'Cancel',
  onClose,
}: ActionSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
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
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (option: ActionSheetOption) => {
    if (!option.disabled) {
      onClose();
      setTimeout(() => option.onPress(), 200);
    }
  };

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
          <Animated.View style={[styles.backdrop, { opacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 8, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />

          {(title || message) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}
            </View>
          )}

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                  option.disabled && styles.optionDisabled,
                ]}
                onPress={() => handleOptionPress(option)}
                disabled={option.disabled}
                activeOpacity={0.7}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={option.variant === 'danger' ? '#EF4444' : '#374151'}
                    style={styles.optionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    option.variant === 'danger' && styles.optionLabelDanger,
                    option.disabled && styles.optionLabelDisabled,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '400',
  },
  optionLabelDanger: {
    color: '#EF4444',
  },
  optionLabelDisabled: {
    color: '#9CA3AF',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default ActionSheet;
`;
}

// ============================================
// ProgressBar Component
// ============================================

/**
 * Generate ProgressBar component for React Native
 */
export function generateProgressBar(): string {
  return `import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'danger';

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Size of the progress bar */
  size?: ProgressBarSize;
  /** Color variant */
  variant?: ProgressBarVariant;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  labelFormat?: (value: number, max: number) => string;
  /** Animate progress changes */
  animated?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Label style */
  labelStyle?: StyleProp<TextStyle>;
  /** Custom track color */
  trackColor?: string;
  /** Custom progress color */
  progressColor?: string;
  /** Show striped pattern */
  striped?: boolean;
}

const SIZE_CONFIG: Record<ProgressBarSize, { height: number; borderRadius: number }> = {
  sm: { height: 4, borderRadius: 2 },
  md: { height: 8, borderRadius: 4 },
  lg: { height: 12, borderRadius: 6 },
};

const VARIANT_COLORS: Record<ProgressBarVariant, string> = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  labelFormat,
  animated = true,
  style,
  labelStyle,
  trackColor = '#E5E7EB',
  progressColor,
  striped = false,
}: ProgressBarProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const color = progressColor || VARIANT_COLORS[variant];
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, animated]);

  const formatLabel = () => {
    if (labelFormat) {
      return labelFormat(value, max);
    }
    return \`\${Math.round(percentage)}%\`;
  };

  const width = animated
    ? animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      })
    : (\`\${percentage}%\` as DimensionValue);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{formatLabel()}</Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height: sizeConfig.height,
            borderRadius: sizeConfig.borderRadius,
            backgroundColor: trackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              width,
              height: sizeConfig.height,
              borderRadius: sizeConfig.borderRadius,
              backgroundColor: color,
            },
          ]}
        >
          {striped && <View style={styles.stripes} />}
        </Animated.View>
      </View>
    </View>
  );
}

/**
 * Circular progress indicator
 */
export function CircularProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 6,
  variant = 'primary',
  showLabel = true,
  labelFormat,
  style,
  labelStyle,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}) {
  const color = VARIANT_COLORS[variant];
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatLabel = () => {
    if (labelFormat) {
      return labelFormat(value, max);
    }
    return \`\${Math.round(percentage)}%\`;
  };

  return (
    <View style={[styles.circularContainer, { width: size, height: size }, style]}>
      <View
        style={[
          styles.circularTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />
      <View
        style={[
          styles.circularProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />
      {showLabel && (
        <Text style={[styles.circularLabel, labelStyle]}>{formatLabel()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  track: {
    overflow: 'hidden',
  },
  progress: {
    overflow: 'hidden',
  },
  stripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Note: Stripes would need a pattern image or gradient in production
    opacity: 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularTrack: {
    position: 'absolute',
    borderColor: '#E5E7EB',
  },
  circularProgress: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circularLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ProgressBar;
`;
}
